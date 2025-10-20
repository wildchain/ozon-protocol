mod operator_runner;

use anchor_client::{
    solana_sdk::{
        pubkey::Pubkey,
        signature::{read_keypair_file, Keypair, Signer},
        system_program,
    },
    Client, Cluster,
};

use operator_runner::OperatorRunner;

use anyhow::Result;
use clap::{Parser, Subcommand};
use open;
use std::rc::Rc;

#[derive(Parser, Debug)]
#[command(name = "ozon-cli", about = "Ozon restaking CLI", version)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand, Debug)]
enum Commands {
    InitializeOperator {
        #[arg(long)]
        bond_amount: u64,
        #[arg(long)]
        metadata: String,
        #[arg(long, default_value = "devnet")]
        cluster: String,
        #[arg(long)]
        wallet: Option<String>,
    },

    DeRegisterOperator {
        #[arg(long, default_value = "devnet")]
        cluster: String,
        #[arg(long)]
        wallet: Option<String>,
    },

    RegisterAvs {
        #[arg(long)]
        metadata: String,
        #[arg(long)]
        registration_fee: u64,
        #[arg(long, default_value = "devnet")]
        cluster: String,
        #[arg(long)]
        wallet: Option<String>,
    },

    UpdateAvsMetadata {
        #[arg(long)]
        metadata: String,
        #[arg(long, default_value = "devnet")]
        cluster: String,
        #[arg(long)]
        wallet: Option<String>,
    },

    DeRegisterAvs {
        #[arg(long, default_value = "devnet")]
        cluster: String,
        #[arg(long)]
        wallet: Option<String>,
    },

    OptInAvs {
        #[arg(long)]
        avs_owner: Option<String>,
        #[arg(long, default_value = "devnet")]
        cluster: String,
        #[arg(long)]
        wallet: Option<String>,
        #[arg(long, default_value_t = false)]
        interactive: bool,
    },

    InitializeRewardTreasury {
        #[arg(long, default_value = "devnet")]
        cluster: String,
        #[arg(long)]
        wallet: Option<String>,
    },

    RunOperator {
        #[arg(long, default_value = "devnet")]
        cluster: String,
        #[arg(long)]
        wallet: Option<String>,
        #[arg(long, default_value = "10")]
        poll_interval_seconds: u64,
    },

    CreateTask {
        #[arg(long)]
        task_id: u64,
        #[arg(long)]
        pyth_feed_id: String, // 32-byte hex string
        #[arg(long)]
        submission_deadline_slots: u64,
        #[arg(long)]
        verification_threshold_bps: u64,
        #[arg(long, default_value = "devnet")]
        cluster: String,
        #[arg(long)]
        wallet: Option<String>,
    },

    SubmitTaskResult {
        #[arg(long)]
        task_pubkey: String,
        #[arg(long)]
        submitted_price: i64,
        #[arg(long)]
        confidence: u64,
        #[arg(long)]
        publish_time: i64,
        #[arg(long, default_value = "devnet")]
        cluster: String,
        #[arg(long)]
        wallet: Option<String>,
    },

    VerifyTask {
        #[arg(long)]
        task_pubkey: String,
        #[arg(long)]
        operator_owner: String,
        #[arg(long)]
        maximum_age: u64,
        #[arg(long, default_value = "devnet")]
        cluster: String,
        #[arg(long)]
        wallet: Option<String>,
    },

    CloseTask {
        #[arg(long)]
        task_pubkey: String,
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
            .expect("home dir")
            .join(".config/solana/id.json"),
    };
    let payer =
        Rc::new(read_keypair_file(wallet_path).map_err(|e| anyhow::anyhow!(e.to_string()))?);
    let cluster = match cluster.to_lowercase().as_str() {
        "devnet" => Cluster::Devnet,
        "testnet" => Cluster::Testnet,
        "mainnet" | "mainnet-beta" => Cluster::Mainnet,
        other => anyhow::bail!("unsupported cluster: {other}"),
    };
    Ok((Client::new(cluster, payer.clone()), payer))
}

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Commands::InitializeOperator {
            bond_amount,
            metadata,
            cluster,
            wallet,
        } => {
            let (client, payer) = get_client(&cluster, wallet.as_deref())?;
            let program_id = restaking_programs::id();
            let program = client.program(program_id).expect("program id valid");

            let (operator_account, _bump) =
                Pubkey::find_program_address(&[b"operator", payer.pubkey().as_ref()], &program_id);

            let (vault, _vault_bump) =
                Pubkey::find_program_address(&[b"vault", payer.pubkey().as_ref()], &program_id);

            println!("🔍 Debug info:");
            println!("  Program ID: {}", program_id);
            println!("  Operator key: {}", payer.pubkey());
            println!("  Operator account PDA: {}", operator_account);
            println!("  Vault PDA: {}", vault);
            println!("  Bond amount: {}", bond_amount);
            println!("  Metadata: {}", metadata);

            let sig = program
                .request()
                .accounts(restaking_programs::accounts::RegisterOperator {
                    operator_key: payer.pubkey(),
                    operator_account,
                    vault,
                    system_program: system_program::ID,
                })
                .args(restaking_programs::instruction::InitializeOperator {
                    bond_amount,
                    metadata,
                })
                .signer(&*payer)
                .send()?;

            println!("✅ Operator initialized with tx {sig}");
        }
        Commands::DeRegisterOperator { cluster, wallet } => {
            let (client, payer) = get_client(&cluster, wallet.as_deref())?;
            let program_id = restaking_programs::id();
            let program = client.program(program_id).expect("program id valid");

            let (operator_account, _bump) =
                Pubkey::find_program_address(&[b"operator", payer.pubkey().as_ref()], &program_id);

            let (vault, _vault_bump) =
                Pubkey::find_program_address(&[b"vault", payer.pubkey().as_ref()], &program_id);

            let sig = program
                .request()
                .accounts(restaking_programs::accounts::DeRegisterOperator {
                    operator_key: payer.pubkey(),
                    operator_account,
                    vault,
                    system_program: system_program::ID,
                })
                .args(restaking_programs::instruction::DeRegisterOperator {})
                .signer(&*payer)
                .send()?;

            println!("✅ Operator de-registered with tx {sig}");
        }
        Commands::RegisterAvs {
            metadata,
            registration_fee,
            cluster,
            wallet,
        } => {
            let (client, payer) = get_client(&cluster, wallet.as_deref())?;
            let program_id = restaking_programs::id();
            let program = client.program(program_id).expect("Program id invalid");
            let (avs_account, _bump) =
                Pubkey::find_program_address(&[b"avs", payer.pubkey().as_ref()], &program_id);
            let (treasury, _treasury_bump) =
                Pubkey::find_program_address(&[b"reward_treasury"], &program_id);

            println!("🔍 Debug info:");
            println!("  Program ID: {}", program_id);
            println!("  AVS owner: {}", payer.pubkey());
            println!("  AVS account PDA: {}", avs_account);
            println!("  Treasury PDA: {}", treasury);
            println!("  Registration fee: {}", registration_fee);
            println!("  Avs Name: {}", metadata);

            let sig = program
                .request()
                .accounts(restaking_programs::accounts::RegisterAvs {
                    avs_owner: payer.pubkey(),
                    avs_account,
                    treasury,
                    system_program: system_program::ID,
                })
                .args(restaking_programs::instruction::RegisterAvs {
                    metadata: metadata,
                    registration_fee,
                })
                .signer(&*payer)
                .send()?;

            println!("✅ Avs registered with tx {} ", sig);
        }
        Commands::UpdateAvsMetadata {
            metadata,
            cluster,
            wallet,
        } => {
            let (client, payer) = get_client(&cluster, wallet.as_deref())?;
            let program_id = restaking_programs::id();
            let program = client.program(program_id).expect("Program id is invalid");

            let (avs_account, _bump) =
                Pubkey::find_program_address(&[b"avs", payer.pubkey().as_ref()], &program_id);

            println!("🔍 Debug info:");
            println!("  Program ID: {}", program_id);
            println!("  AVS owner: {}", payer.pubkey());
            println!("  AVS account PDA: {}", avs_account);
            println!("  New Avs Name: {}", metadata);

            let sig = program
                .request()
                .accounts(restaking_programs::accounts::UpdateAvsMetadata {
                    avs_owner: payer.pubkey(),
                    avs_account,
                })
                .args(restaking_programs::instruction::UpdateAvsMetadata { metadata: metadata })
                .signer(&*payer)
                .send()?;

            println!("✅ AVS metadata updated with tx {}", sig);
        }

        Commands::DeRegisterAvs { cluster, wallet } => {
            let (client, payer) = get_client(&cluster, wallet.as_deref())?;
            let program_id = restaking_programs::id();
            let program = client.program(program_id).expect("program id valid");

            let (avs_account, _bump) =
                Pubkey::find_program_address(&[b"avs", payer.pubkey().as_ref()], &program_id);

            println!("🔍 Debug info:");
            println!("  Program ID: {}", program_id);
            println!("  AVS owner: {}", payer.pubkey());
            println!("  AVS account PDA: {}", avs_account);

            let sig = program
                .request()
                .accounts(restaking_programs::accounts::DeRegisterAvs {
                    avs_owner: payer.pubkey(),
                    avs_account,
                })
                .args(restaking_programs::instruction::DeRegisterAvs {})
                .signer(&*payer)
                .send()?;

            println!("✅ AVS de-registered with tx {}", sig);
        }
        Commands::OptInAvs {
            avs_owner,
            cluster,
            wallet,
            interactive,
        } => {
            if interactive {
                println!("🌐 Launching Ozon Avs Selection dashboard");
                let _ = open::that("https://ozon-avs-dashboard.netlify.app/");
                return Ok(());
            }

            let avs_owner = avs_owner.ok_or_else(|| {
                anyhow::anyhow!("--avs-owner is required when not using --interactive")
            })?;

            let (client, payer) = get_client(&cluster, wallet.as_deref())?;
            let program_id = restaking_programs::id();
            let program = client.program(program_id).expect("Program id is invalid");

            let avs_owner_pk: Pubkey = avs_owner
                .parse()
                .map_err(|_| anyhow::anyhow!("Invalid AVS owner pubkey"))?;

            let (operator_account, _bump) =
                Pubkey::find_program_address(&[b"operator", payer.pubkey().as_ref()], &program_id);

            let (avs_account, _avs_bump) =
                Pubkey::find_program_address(&[b"avs", avs_owner_pk.as_ref()], &program_id);

            let (operator_avs_registration, _reg_bump) = Pubkey::find_program_address(
                &[
                    b"operator_avs",
                    payer.pubkey().as_ref(),
                    avs_owner_pk.as_ref(),
                ],
                &program_id,
            );

            println!("🔍 Debug info:");
            println!("  Operator: {}", payer.pubkey());
            println!("  AVS Owner: {}", avs_owner_pk);
            println!("  AVS Account: {}", avs_account);
            println!("  Registration PDA: {}", operator_avs_registration);

            let sig = program
                .request()
                .accounts(restaking_programs::accounts::OptInAvs {
                    operator_key: payer.pubkey(),
                    operator_account,
                    avs_account,
                    operator_avs_registration,
                    system_program: system_program::ID,
                })
                .args(restaking_programs::instruction::OperatorOptInAvs {
                    avs_owner: avs_owner_pk,
                })
                .signer(&*payer)
                .send()?;

            println!("✅ Opted into AVS with tx {sig}");
        }
        Commands::InitializeRewardTreasury { cluster, wallet } => {
            let (client, payer) = get_client(&cluster, wallet.as_deref())?;
            let program_id = restaking_programs::id();
            let program = client.program(program_id).expect("program id valid");

            // Derive treasury PDA
            let (treasury, _bump) =
                Pubkey::find_program_address(&[b"reward_treasury"], &program_id);

            println!("🔍 Debug info:");
            println!("  Program ID: {}", program_id);
            println!("  Authority: {}", payer.pubkey());
            println!("  Treasury PDA: {}", treasury);

            let sig = program
                .request()
                .accounts(restaking_programs::accounts::InitializeRewardTreasury {
                    authority: payer.pubkey(),
                    treasury,
                    system_program: system_program::ID,
                })
                .args(restaking_programs::instruction::InitializeRewardTreasury {})
                .signer(&*payer)
                .send()?;

            println!("✅ Reward Treasury initialized with tx {}", sig);
        }
        Commands::RunOperator {
            cluster,
            wallet,
            poll_interval_seconds,
        } => {
            let (client, payer) = get_client(&cluster, wallet.as_deref())?;

            let runner = OperatorRunner::new(client, payer);
            runner.run(poll_interval_seconds).await?;
        }

        Commands::CreateTask {
            task_id,
            pyth_feed_id,
            submission_deadline_slots,
            verification_threshold_bps,
            cluster,
            wallet,
        } => {
            let (client, payer) = get_client(&cluster, wallet.as_deref())?;
            let program_id = avs_oracle::id();
            let program = client.program(program_id)?;

            let pyth_feed_bytes = hex::decode(pyth_feed_id.trim_start_matches("0x"))?;
            let mut feed_array = [0u8; 32];
            feed_array.copy_from_slice(&pyth_feed_bytes[..32]);

            let (task_account, _bump) = Pubkey::find_program_address(
                &[b"task", payer.pubkey().as_ref(), &task_id.to_le_bytes()],
                &program_id,
            );

            println!("🔧 Creating task {}", task_id);

            let sig = program
                .request()
                .accounts(avs_oracle::accounts::CreateTask {
                    avs_owner: payer.pubkey(),
                    task_account,
                    system_program: system_program::ID,
                })
                .args(avs_oracle::instruction::CreateTask {
                    task_id,
                    pyth_price_feed_id: feed_array,
                    submission_deadline_slots,
                    verification_threshold_bps,
                })
                .signer(&*payer)
                .send()?;

            println!("✅ Task created! Tx: {}", sig);
        }

        Commands::SubmitTaskResult {
            task_pubkey,
            submitted_price,
            confidence,
            publish_time,
            cluster,
            wallet,
        } => {
            let (client, payer) = get_client(&cluster, wallet.as_deref())?;
            let program_id = avs_oracle::id();
            let program = client.program(program_id)?;
            let restaking_program_id = restaking_programs::id();

            let task_pubkey = task_pubkey.parse::<Pubkey>()?;

            let (task_submission, _) = Pubkey::find_program_address(
                &[b"submission", task_pubkey.as_ref(), payer.pubkey().as_ref()],
                &program_id,
            );

            let (operator_account, _) = Pubkey::find_program_address(
                &[b"operator", payer.pubkey().as_ref()],
                &restaking_program_id,
            );

            let (operator_avs_registration, _) = Pubkey::find_program_address(
                &[b"operator_avs", payer.pubkey().as_ref(), payer.pubkey().as_ref()],
                &restaking_program_id,
            );

            let sig = program
                .request()
                .accounts(avs_oracle::accounts::SubmitTaskResult {
                    operator: payer.pubkey(),
                    task_account: task_pubkey,
                    task_submission,
                    operator_account,
                    operator_avs_registration,
                    restaking_program: restaking_program_id,
                    system_program: system_program::ID,
                })
                .args(avs_oracle::instruction::SubmitTaskResult {
                    submitted_price,
                    confidence,
                    publish_time,
                })
                .signer(&*payer)
                .send()?;

            println!("✅ Submitted task result with tx {}", sig);
        }

        Commands::VerifyTask {
            task_pubkey,
            operator_owner,
            maximum_age,
            cluster,
            wallet,
        } => {
            let (client, payer) = get_client(&cluster, wallet.as_deref())?;
            let program_id = avs_oracle::id();
            let program = client.program(program_id)?;
            let restaking_program_id = restaking_programs::id();

            let task_pubkey = task_pubkey.parse::<Pubkey>()?;
            let operator_owner = operator_owner.parse::<Pubkey>()?;

            let (task_submission, _) = Pubkey::find_program_address(
                &[b"submission", task_pubkey.as_ref(), operator_owner.as_ref()],
                &program_id,
            );

            let (operator_account, _) = Pubkey::find_program_address(
                &[b"operator", operator_owner.as_ref()],
                &restaking_program_id,
            );

            let (operator_vault, _) = Pubkey::find_program_address(
                &[b"vault", operator_owner.as_ref()],
                &restaking_program_id,
            );

            let (treasury, _) =
                Pubkey::find_program_address(&[b"reward_treasury"], &restaking_program_id);

            let sig = program
                .request()
                .accounts(avs_oracle::accounts::VerifyAndSlashIfWrong {
                    avs_authority: payer.pubkey(),
                    task_account: task_pubkey,
                    task_submission,
                    price_update: Pubkey::default(), // You’ll plug in a real PriceUpdateV2 account here
                    restaking_program: restaking_program_id,
                    operator_account,
                    operator_vault,
                    treasury,
                    system_program: system_program::ID,
                })
                .args(avs_oracle::instruction::VerifyAndSlashIfWrong {
                    operator_owner,
                    maximum_age,
                })
                .signer(&*payer)
                .send()?;

            println!("✅ Verification completed! Tx: {}", sig);
        }

        Commands::CloseTask {
            task_pubkey,
            cluster,
            wallet,
        } => {
            let (client, payer) = get_client(&cluster, wallet.as_deref())?;
            let program_id = avs_oracle::id();
            let program = client.program(program_id)?;
            let task_pubkey = task_pubkey.parse::<Pubkey>()?;

            let sig = program
                .request()
                .accounts(avs_oracle::accounts::CloseTask {
                    avs_owner: payer.pubkey(),
                    task_account: task_pubkey,
                })
                .args(avs_oracle::instruction::CloseTask {})
                .signer(&*payer)
                .send()?;

            println!("✅ Task closed with tx {}", sig);
        }

    }

    Ok(())
}
