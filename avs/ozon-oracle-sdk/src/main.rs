use anchor_client::{
    solana_sdk::{
        pubkey::Pubkey,
        signature::{read_keypair_file, Keypair, Signer},
        system_program,
    },
    Client, Cluster,
};
use anyhow::Result;
use clap::{Parser, Subcommand};
use std::rc::Rc;

const AVS_ORACLE_PROGRAM_ID: &str = "6NLkSfQvmRgsbW8ywJLCbnnVh1nYTg5xfjSeM5E7YhcU";
const RESTAKING_PROGRAM_ID: &str = "G9HUZQDnpJsFHST2KG56CkmcLWHrMrBB7XNRyZ9vR51a";

#[derive(Parser, Debug)]
#[command(
    name = "ozon-oracle-sdk",
    about = " AVS Oracle Task Manager - Manage price oracle validation tasks",
    version,
    long_about = "CLI tool for AVS owners to create, manage, and verify oracle validation tasks"
)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand, Debug)]
enum Commands {
    #[command(name = "create-task")]
    CreateTask {
        #[arg(long, help = "Unique task ID (incrementing number)")]
        task_id: u64,

        #[arg(
            long,
            help = "Pyth price feed ID (32-byte hex string)\nExample: e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43"
        )]
        pyth_feed_id: String,

        #[arg(
            long,
            default_value = "1000",
            help = "Task deadline in slots from now (default: 1000 slots ≈ 6 minutes)"
        )]
        deadline_slots: u64,

        #[arg(
            long,
            default_value = "100",
            help = "Verification threshold in basis points (default: 100bps = 1%)"
        )]
        threshold_bps: u64,

        #[arg(long, default_value = "devnet")]
        cluster: String,

        #[arg(
            long,
            help = "Path to AVS owner keypair (default: ~/.config/solana/id.json)"
        )]
        wallet: Option<String>,
    },

    #[command(name = "list-tasks")]
    ListTasks {
        #[arg(long, default_value = "devnet")]
        cluster: String,

        #[arg(long)]
        wallet: Option<String>,

        #[arg(long, help = "Show only active tasks")]
        active_only: bool,
    },

    #[command(name = "get-submissions")]
    GetSubmissions {
        #[arg(long, help = "Task ID to view submissions for")]
        task_id: u64,

        #[arg(long, default_value = "devnet")]
        cluster: String,

        #[arg(long)]
        wallet: Option<String>,
    },

    #[command(name = "verify-submission")]
    VerifySubmission {
        #[arg(long, help = "Task ID")]
        task_id: u64,

        #[arg(long, help = "Operator pubkey who submitted the result")]
        operator: String,

        #[arg(long, default_value = "devnet")]
        cluster: String,

        #[arg(long)]
        wallet: Option<String>,
    },

    #[command(name = "close-task")]
    CloseTask {
        #[arg(long, help = "Task ID to close")]
        task_id: u64,

        #[arg(long, default_value = "devnet")]
        cluster: String,

        #[arg(long)]
        wallet: Option<String>,
    },
}

fn get_client(
    cluster: &str,
    wallet_override: Option<&str>,
) -> Result<(Client<Rc<Keypair>>, Rc<Keypair>)> {
    let wallet_path = match wallet_override {
        Some(path) => std::path::PathBuf::from(path),
        None => dirs::home_dir()
            .expect("Could not find home directory")
            .join(".config/solana/id.json"),
    };

    let payer =
        Rc::new(read_keypair_file(&wallet_path).map_err(|e| {
            anyhow::anyhow!("Failed to read keypair from {:?}: {}", wallet_path, e)
        })?);

    let cluster = match cluster.to_lowercase().as_str() {
        "devnet" => Cluster::Devnet,
        "testnet" => Cluster::Testnet,
        "mainnet" | "mainnet-beta" => Cluster::Mainnet,
        other => anyhow::bail!("Unsupported cluster: {other}"),
    };

    Ok((Client::new(cluster, payer.clone()), payer))
}

// Helper function to calculate discriminator
fn get_discriminator(namespace: &str, name: &str) -> [u8; 8] {
    use sha2::{Digest, Sha256};
    let preimage = format!("{}:{}", namespace, name);
    let mut hasher = Sha256::new();
    hasher.update(preimage.as_bytes());
    let result = hasher.finalize();
    let mut discriminator = [0u8; 8];
    discriminator.copy_from_slice(&result[..8]);
    discriminator
}

fn main() -> Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Commands::CreateTask {
            task_id,
            pyth_feed_id,
            deadline_slots,
            threshold_bps,
            cluster,
            wallet,
        } => {
            create_task(
                task_id,
                pyth_feed_id,
                deadline_slots,
                threshold_bps,
                &cluster,
                wallet.as_deref(),
            )?;
        }

        Commands::ListTasks {
            cluster,
            wallet,
            active_only,
        } => {
            list_tasks(&cluster, wallet.as_deref(), active_only)?;
        }

        Commands::GetSubmissions {
            task_id,
            cluster,
            wallet,
        } => {
            get_submissions(task_id, &cluster, wallet.as_deref())?;
        }

        Commands::VerifySubmission {
            task_id,
            operator,
            cluster,
            wallet,
        } => {
            verify_submission(task_id, &operator, &cluster, wallet.as_deref())?;
        }

        Commands::CloseTask {
            task_id,
            cluster,
            wallet,
        } => {
            close_task(task_id, &cluster, wallet.as_deref())?;
        }
    }

    Ok(())
}

fn create_task(
    task_id: u64,
    pyth_feed_id: String,
    deadline_slots: u64,
    threshold_bps: u64,
    cluster: &str,
    wallet: Option<&str>,
) -> Result<()> {
    let (client, payer) = get_client(cluster, wallet)?;
    let program_id: Pubkey = AVS_ORACLE_PROGRAM_ID.parse()?;
    let program = client.program(program_id)?;

    let feed_hex = pyth_feed_id.trim_start_matches("0x");
    let feed_bytes = hex::decode(feed_hex)?;
    if feed_bytes.len() != 32 {
        anyhow::bail!("Pyth feed ID must be 32 bytes (64 hex characters)");
    }
    let mut feed_id = [0u8; 32];
    feed_id.copy_from_slice(&feed_bytes);

    let (task_account, _) = Pubkey::find_program_address(
        &[
            b"task",
            payer.pubkey().as_ref(),
            task_id.to_le_bytes().as_ref(),
        ],
        &program_id,
    );

    println!("📋 Creating Oracle Validation Task");

    println!("  AVS Owner:    {}", payer.pubkey());
    println!("  Task ID:      {}", task_id);
    println!("  Task Account: {}", task_account);
    println!("  Pyth Feed:    0x{}", hex::encode(&feed_id));
    println!("  Deadline:     {} slots from now", deadline_slots);
    println!(
        "  Threshold:    {}bps ({}%)",
        threshold_bps,
        threshold_bps as f64 / 100.0
    );
    println!();

    use anchor_lang::prelude::*;

    // Build instruction
    let discriminator = get_discriminator("global", "create_task");

    #[derive(AnchorSerialize)]
    struct CreateTaskArgs {
        task_id: u64,
        pyth_price_feed_id: [u8; 32],
        submission_deadline_slots: u64,
        verification_threshold_bps: u64,
    }

    let args = CreateTaskArgs {
        task_id,
        pyth_price_feed_id: feed_id,
        submission_deadline_slots: deadline_slots,
        verification_threshold_bps: threshold_bps,
    };

    let mut data = discriminator.to_vec();
    data.extend_from_slice(&args.try_to_vec()?);

    let accounts = vec![
        AccountMeta::new(payer.pubkey(), true),
        AccountMeta::new(task_account, false),
        AccountMeta::new_readonly(system_program::ID, false),
    ];

    let ix = anchor_lang::solana_program::instruction::Instruction {
        program_id,
        accounts,
        data,
    };

    println!("⏳ Sending transaction...");
    let sig = program.request().instruction(ix).signer(&*payer).send()?;

    println!("\n✅ Task Created Successfully!");
    println!(
        "   Transaction: https://explorer.solana.com/tx/{}?cluster={}",
        sig, cluster
    );
    println!("\n💡 Operators can now submit results for this task using:");
    println!("   ozon-cli run-operator\n");

    Ok(())
}

fn list_tasks(cluster: &str, wallet: Option<&str>, active_only: bool) -> Result<()> {
    let (client, payer) = get_client(cluster, wallet)?;
    let program_id: Pubkey = AVS_ORACLE_PROGRAM_ID.parse()?;
    let restaking_program_id: Pubkey = RESTAKING_PROGRAM_ID.parse()?;
    let program = client.program(program_id)?;

    println!("📋 Your Oracle Validation Tasks");
    println!("  AVS Owner: {}\n", payer.pubkey());

    let accounts = program.rpc().get_program_accounts(&program_id)?;

    let mut task_count = 0;
    let mut active_count = 0;

    for (pubkey, account) in accounts {
        if account.data.len() < 109 {
            continue;
        }

        let avs_bytes = &account.data[8..40];
        let avs = Pubkey::try_from(avs_bytes)?;

        let (expected_avs, _) =
            Pubkey::find_program_address(&[b"avs", payer.pubkey().as_ref()], &restaking_program_id);

        if avs != expected_avs {
            continue;
        }

        let task_id = u64::from_le_bytes(account.data[40..48].try_into()?);
        let mut pyth_feed = [0u8; 32];
        pyth_feed.copy_from_slice(&account.data[48..80]);
        let deadline = u64::from_le_bytes(account.data[80..88].try_into()?);
        let threshold = u64::from_le_bytes(account.data[88..96].try_into()?);
        let total_submissions = u32::from_le_bytes(account.data[104..108].try_into()?);
        let active = account.data[108] == 1;

        if active_only && !active {
            continue;
        }

        task_count += 1;
        if active {
            active_count += 1;
        }

        let status = if active { "🟢 Active" } else { "🔴 Closed" };

        println!("....");
        println!("  Task #{}", task_id);
        println!("  ├─ Account:      {}", pubkey);
        println!("  ├─ Status:       {}", status);
        println!("  ├─ Pyth Feed:    0x{}", hex::encode(&pyth_feed[..8]));
        println!(
            "  ├─ Threshold:    {}bps ({}%)",
            threshold,
            threshold as f64 / 100.0
        );
        println!("  ├─ Deadline:     Slot {}", deadline);
        println!("  └─ Submissions:  {}", total_submissions);
    }

    if task_count == 0 {
        println!("  No tasks found.");
        println!("\n  Create your first task with:");
        println!("  avs-oracle create-task --task-id 1 --pyth-feed-id <FEED_ID>");
    } else {
        println!("....");
        println!(
            "\n  📊 Summary: {} total task(s), {} active\n",
            task_count, active_count
        );
    }

    Ok(())
}

fn get_submissions(task_id: u64, cluster: &str, wallet: Option<&str>) -> Result<()> {
    let (client, payer) = get_client(cluster, wallet)?;
    let program_id: Pubkey = AVS_ORACLE_PROGRAM_ID.parse()?;
    let program = client.program(program_id)?;

    // Get task account
    let (task_account, _) = Pubkey::find_program_address(
        &[
            b"task",
            payer.pubkey().as_ref(),
            task_id.to_le_bytes().as_ref(),
        ],
        &program_id,
    );

    println!("📥 Task Submissions for Task #{}", task_id);

    let accounts = program.rpc().get_program_accounts(&program_id)?;

    let mut submission_count = 0;

    for (pubkey, account) in accounts {
        if account.data.len() < 100 {
            continue;
        }

        // Check if this is a submission for our task
        let task_bytes = &account.data[8..40];
        let task_pk = Pubkey::try_from(task_bytes)?;

        if task_pk != task_account {
            continue;
        }

        submission_count += 1;

        let operator = Pubkey::try_from(&account.data[40..72])?;
        let submitted_price = i64::from_le_bytes(account.data[72..80].try_into()?);
        let confidence = u64::from_le_bytes(account.data[80..88].try_into()?);
        let submitted_slot = u64::from_le_bytes(account.data[96..104].try_into()?);
        let verified = account.data[104] == 1;
        let is_correct = account.data[105] == 1;

        println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        println!("  Submission #{}", submission_count);
        println!("  ├─ Account:      {}", pubkey);
        println!("  ├─ Operator:     {}", operator);
        println!(
            "  ├─ Price:        {} (${:.2})",
            submitted_price,
            submitted_price as f64 / 1e8
        );
        println!("  ├─ Confidence:   {}", confidence);
        println!("  ├─ Submit Slot:  {}", submitted_slot);
        println!(
            "  ├─ Verified:     {}",
            if verified { "✅ Yes" } else { "⏳ Pending" }
        );
        if verified {
            println!(
                "  └─ Correct:      {}",
                if is_correct {
                    "✅ Yes"
                } else {
                    "❌ No (Slashed)"
                }
            );
        }
    }

    if submission_count == 0 {
        println!("  No submissions yet for this task.");
        println!("\n  Operators will automatically submit when they run:");
        println!("  ozon-cli run-operator");
    } else {
        println!("...");
        println!("\n  📊 Total: {} submission(s)\n", submission_count);
    }

    Ok(())
}

fn verify_submission(
    task_id: u64,
    operator: &str,
    cluster: &str,
    wallet: Option<&str>,
) -> Result<()> {
    let (client, payer) = get_client(cluster, wallet)?;
    let program_id: Pubkey = AVS_ORACLE_PROGRAM_ID.parse()?;
    let operator_pk: Pubkey = operator.parse()?;

    let (task_account, _) = Pubkey::find_program_address(
        &[
            b"task",
            payer.pubkey().as_ref(),
            task_id.to_le_bytes().as_ref(),
        ],
        &program_id,
    );

    let (submission_account, _) = Pubkey::find_program_address(
        &[b"submission", task_account.as_ref(), operator_pk.as_ref()],
        &program_id,
    );

    println!(" ✓ Verifying Submission");

    println!("  Task ID:    {}", task_id);
    println!("  Operator:   {}", operator_pk);
    println!("  Submission: {}\n", submission_account);

    println!("⚠️  HACKATHON NOTE:");
    println!("   Full verification requires Pyth PriceUpdateV2 on-chain account.");
    println!("   For demo purposes, showing submission data:\n");

    // Fetch and display submission data
    let program = client.program(program_id)?;
    match program.rpc().get_account_data(&submission_account) {
        Ok(data) => {
            if data.len() >= 106 {
                let submitted_price = i64::from_le_bytes(data[72..80].try_into()?);
                let confidence = u64::from_le_bytes(data[80..88].try_into()?);
                let verified = data[104] == 1;
                let is_correct = data[105] == 1;

                println!(
                    "  Submitted Price:  {} (${:.2})",
                    submitted_price,
                    submitted_price as f64 / 1e8
                );
                println!("  Confidence:       {}", confidence);
                println!(
                    "  Verified:         {}",
                    if verified { "✅" } else { "⏳ Pending" }
                );
                if verified {
                    println!(
                        "  Result:           {}",
                        if is_correct {
                            "✅ Correct"
                        } else {
                            "❌ Wrong (Slashed)"
                        }
                    );
                }

                if !verified {
                    println!("\n💡 To implement full verification:");
                    println!("   1. Fetch Pyth PriceUpdateV2 account");
                    println!("   2. Call verify_and_slash_if_wrong instruction");
                    println!("   3. Operator will be slashed if price is wrong");
                }
            } else {
                println!("  ❌ Invalid submission data format");
            }
        }
        Err(_) => {
            println!("  ❌ Submission not found");
        }
    }

    println!();
    Ok(())
}

fn close_task(task_id: u64, cluster: &str, wallet: Option<&str>) -> Result<()> {
    let (client, payer) = get_client(cluster, wallet)?;
    let program_id: Pubkey = AVS_ORACLE_PROGRAM_ID.parse()?;
    let program = client.program(program_id)?;

    let (task_account, _) = Pubkey::find_program_address(
        &[
            b"task",
            payer.pubkey().as_ref(),
            task_id.to_le_bytes().as_ref(),
        ],
        &program_id,
    );

    println!("🔒 Closing Task #{}", task_id);

    println!("  Task Account: {}\n", task_account);

    let discriminator = get_discriminator("global", "close_task");

    let accounts = vec![
        anchor_lang::prelude::AccountMeta::new(payer.pubkey(), true),
        anchor_lang::prelude::AccountMeta::new(task_account, false),
    ];

    let ix = anchor_lang::solana_program::instruction::Instruction {
        program_id,
        accounts,
        data: discriminator.to_vec(),
    };

    println!("⏳ Sending transaction...");
    let sig = program.request().instruction(ix).signer(&*payer).send()?;

    println!("\n✅ Task Closed Successfully!");
    println!(
        "   Transaction: https://explorer.solana.com/tx/{}?cluster={}\n",
        sig, cluster
    );

    Ok(())
}
