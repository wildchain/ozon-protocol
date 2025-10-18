use anchor_client::{
    solana_sdk::{
        instruction::AccountMeta,
        pubkey::Pubkey,
        signature::{read_keypair_file, Keypair, Signer},
        system_program,
    },
    Client, Cluster,
};
use anyhow::Result;
use clap::{Parser, Subcommand};
use std::rc::Rc;

// ✅ IMPORTANT: Update this to match your deployed program ID
const AVS_ORACLE_PROGRAM_ID: &str = "122iaw5CsWYKCpZFJg5DwjUtp8zyoeLFanreuwKHLzFV";
const RESTAKING_PROGRAM_ID: &str = "E8SwyhYcBCWDJu6QM8Mcaguo8wP676wZ3yDzrrvm5yWP";

#[derive(Parser, Debug)]
#[command(
    name = "ozon-oracle-sdk",
    about = "AVS Oracle Task Manager - Manage price oracle validation tasks",
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

        #[arg(long, help = "Pyth price update account (PriceUpdateV2)")]
        price_update: String,

        #[arg(long, default_value = "60", help = "Maximum price age in seconds")]
        max_age: u64,

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
        "localnet" | "localhost" => Cluster::Localnet,
        other => anyhow::bail!("Unsupported cluster: {other}"),
    };

    Ok((Client::new(cluster, payer.clone()), payer))
}

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
            price_update,
            max_age,
            cluster,
            wallet,
        } => {
            verify_submission(
                task_id,
                &operator,
                &price_update,
                max_age,
                &cluster,
                wallet.as_deref(),
            )?;
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
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
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

    let discriminator = get_discriminator("global", "create_task");

    // Manual serialization - no borsh needed
    let mut data = discriminator.to_vec();
    data.extend_from_slice(&task_id.to_le_bytes());
    data.extend_from_slice(&feed_id);
    data.extend_from_slice(&deadline_slots.to_le_bytes());
    data.extend_from_slice(&threshold_bps.to_le_bytes());

    let accounts = vec![
        AccountMeta::new(payer.pubkey(), true),
        AccountMeta::new(task_account, false),
        AccountMeta::new_readonly(system_program::ID, false),
    ];

    let ix = anchor_client::solana_sdk::instruction::Instruction {
        program_id,
        accounts,
        data,
    };

    println!("⏳ Sending transaction...");
    let sig = program.request().instruction(ix).signer(&*payer).send()?;

    println!("\n✅ Task Created Successfully!");
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!(
        "   Transaction: https://explorer.solana.com/tx/{}?cluster={}",
        sig, cluster
    );
    println!("\n💡 Next Steps:");
    println!("   1. Operators can now submit results for this task");
    println!(
        "   2. Monitor submissions: ozon-oracle-sdk get-submissions --task-id {}",
        task_id
    );
    println!("   3. Verify submissions: ozon-oracle-sdk verify-submission --task-id {} --operator <PUBKEY> --price-update <PYTH_ACCOUNT>", task_id);
    println!();

    Ok(())
}

fn list_tasks(cluster: &str, wallet: Option<&str>, active_only: bool) -> Result<()> {
    let (client, payer) = get_client(cluster, wallet)?;
    let program_id: Pubkey = AVS_ORACLE_PROGRAM_ID.parse()?;
    let program = client.program(program_id)?;

    println!("📋 Your Oracle Validation Tasks");
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!("  AVS Owner: {}\n", payer.pubkey());

    let accounts = program.rpc().get_program_accounts(&program_id)?;

    let mut task_count = 0;
    let mut active_count = 0;

    for (pubkey, account) in accounts {
        if account.data.len() < 109 {
            continue;
        }

        // Parse TaskAccount structure
        let avs_bytes = &account.data[8..40];
        let avs = Pubkey::try_from(avs_bytes)?;

        // Only show tasks owned by this AVS
        if avs != payer.pubkey() {
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

        println!("  Task #{}", task_id);
        println!("  ├─ Account:      {}", pubkey);
        println!("  ├─ Status:       {}", status);
        println!("  ├─ Pyth Feed:    0x{}", hex::encode(&pyth_feed));
        println!(
            "  ├─ Threshold:    {}bps ({}%)",
            threshold,
            threshold as f64 / 100.0
        );
        println!("  ├─ Deadline:     Slot {}", deadline);
        println!("  └─ Submissions:  {}", total_submissions);
        println!();
    }

    if task_count == 0 {
        println!("  No tasks found.");
        println!("\n💡 Create your first task with:");
        println!("     ozon-oracle-sdk create-task --task-id 1 --pyth-feed-id <FEED_ID>");
    } else {
        println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        println!(
            "  📊 Summary: {} total task(s), {} active\n",
            task_count, active_count
        );
    }

    Ok(())
}

fn get_submissions(task_id: u64, cluster: &str, wallet: Option<&str>) -> Result<()> {
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

    println!("📥 Task Submissions for Task #{}", task_id);
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    let accounts = program.rpc().get_program_accounts(&program_id)?;

    let mut submission_count = 0;

    for (pubkey, account) in accounts {
        if account.data.len() < 115 {
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
        println!();
    }

    if submission_count == 0 {
        println!("  No submissions yet for this task.");
        println!("\n💡 Operators will automatically submit when they detect new tasks");
    } else {
        println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        println!("  📊 Total: {} submission(s)\n", submission_count);
    }

    Ok(())
}

fn verify_submission(
    task_id: u64,
    operator: &str,
    price_update_str: &str,
    max_age: u64,
    cluster: &str,
    wallet: Option<&str>,
) -> Result<()> {
    let (client, payer) = get_client(cluster, wallet)?;
    let program_id: Pubkey = AVS_ORACLE_PROGRAM_ID.parse()?;
    let restaking_program_id: Pubkey = RESTAKING_PROGRAM_ID.parse()?;
    let program = client.program(program_id)?;
    let operator_pk: Pubkey = operator.parse()?;
    let price_update: Pubkey = price_update_str.parse()?;

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

    let (operator_account, _) =
        Pubkey::find_program_address(&[b"operator", operator_pk.as_ref()], &restaking_program_id);

    let operator_account_data = program.rpc().get_account_data(&operator_account)?;
    let vault_bump = operator_account_data[41]; // Assuming vault_bump is at offset 41

    let (operator_vault, _) =
        Pubkey::find_program_address(&[b"vault", operator_pk.as_ref()], &restaking_program_id);

    let (treasury, _) = Pubkey::find_program_address(&[b"reward_treasury"], &restaking_program_id);

    println!("✓ Verifying Submission");
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!("  Task ID:       {}", task_id);
    println!("  Operator:      {}", operator_pk);
    println!("  Submission:    {}", submission_account);
    println!("  Price Update:  {}", price_update);
    println!("  Max Age:       {} seconds\n", max_age);

    let discriminator = get_discriminator("global", "verify_and_slash_if_wrong");

    // Manual serialization - no borsh needed
    let mut data = discriminator.to_vec();
    data.extend_from_slice(operator_pk.as_ref());
    data.extend_from_slice(&max_age.to_le_bytes());

    let accounts = vec![
        AccountMeta::new(payer.pubkey(), true),
        AccountMeta::new_readonly(task_account, false),
        AccountMeta::new(submission_account, false),
        AccountMeta::new_readonly(price_update, false),
        AccountMeta::new_readonly(restaking_program_id, false),
        AccountMeta::new(operator_account, false),
        AccountMeta::new(operator_vault, false),
        AccountMeta::new(treasury, false),
        AccountMeta::new_readonly(system_program::ID, false),
    ];

    let ix = anchor_client::solana_sdk::instruction::Instruction {
        program_id,
        accounts,
        data,
    };

    println!("⏳ Verifying and checking if slashing required...");
    let sig = program.request().instruction(ix).signer(&*payer).send()?;

    println!("\n✅ Verification Complete!");
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!(
        "   Transaction: https://explorer.solana.com/tx/{}?cluster={}\n",
        sig, cluster
    );

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
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!("  Task Account: {}\n", task_account);

    let discriminator = get_discriminator("global", "close_task");

    let accounts = vec![
        AccountMeta::new(payer.pubkey(), true),
        AccountMeta::new(task_account, false),
    ];

    let ix = anchor_client::solana_sdk::instruction::Instruction {
        program_id,
        accounts,
        data: discriminator.to_vec(),
    };

    println!("⏳ Sending transaction...");
    let sig = program.request().instruction(ix).signer(&*payer).send()?;

    println!("\n✅ Task Closed Successfully!");
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!(
        "   Transaction: https://explorer.solana.com/tx/{}?cluster={}\n",
        sig, cluster
    );

    Ok(())
}
