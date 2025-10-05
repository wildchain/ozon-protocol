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

            println!("🔍 Debug info:");
            println!("  Program ID: {}", program_id);
            println!("  Operator key: {}", payer.pubkey());
            println!("  Operator account PDA: {}", operator_account);
            println!("  Bond amount: {}", bond_amount);
            println!("  Metadata: {}", metadata);

            // Try calling the method by name
            let sig = program
                .request()
                .accounts(restaking_programs::accounts::RegisterOperator {
                    operator_key: payer.pubkey(),
                    operator_account,
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
    }

    Ok(())
}
