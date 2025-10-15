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

#[derive(Parser, Debug)]
#[command(name = "ozon-cli", about = "Ozon restaking CLI")]
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
        name: String,
        #[arg(long)]
        registration_fee: u64,
        #[arg(long, default_value = "devnet")]
        cluster: String,
        #[arg(long)]
        wallet: Option<String>,
    },

    UpdateAvsMetadata {
        #[arg(long)]
        name: String,
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
        avs_owner: String,
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

fn main() -> Result<()> {
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
            name,
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
            println!("  Avs Name: {}", name);

            let sig = program
                .request()
                .accounts(restaking_programs::accounts::RegisterAvs {
                    avs_owner: payer.pubkey(),
                    avs_account,
                    treasury,
                    system_program: system_program::ID,
                })
                .args(restaking_programs::instruction::RegisterAvs {
                    metadata: name,
                    registration_fee,
                })
                .signer(&*payer)
                .send()?;

            println!("✅ Avs registered with tx {} ", sig);
        }
        Commands::UpdateAvsMetadata {
            name,
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
            println!("  New Avs Name: {}", name);

            let sig = program
                .request()
                .accounts(restaking_programs::accounts::UpdateAvsMetadata {
                    avs_owner: payer.pubkey(),
                    avs_account,
                })
                .args(restaking_programs::instruction::UpdateAvsMetadata { metadata: name })
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
                let _ = open::that("https://ozon-operator-avs-registy.netlify.app/");
                return Ok(());
            }
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
    }

    Ok(())
}
