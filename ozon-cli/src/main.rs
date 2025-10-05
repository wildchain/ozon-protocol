use std::rc::Rc;

use anchor_client::{
    solana_sdk::signature::{read_keypair_file, Keypair},
    Client, Cluster,
};
use anyhow::Result;
use clap::{Parser, Subcommand};

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

fn get_client(cluster: &str, wallet_override: Option<&str>) -> Result<Client<Rc<Keypair>>> {
    let wallet_path = match wallet_override {
        Some(path) => std::path::PathBuf::from(path),
        None => dirs::home_dir()
            .expect("home dir")
            .join(".config/solana/id.json"),
    };
    let payer = read_keypair_file(wallet_path).map_err(|e| anyhow::anyhow!(e.to_string()))?;
    let cluster = match cluster.to_lowercase().as_str() {
        "devnet" => Cluster::Devnet,
        "testnet" => Cluster::Testnet,
        "mainnet" | "mainnet-beta" => Cluster::Mainnet,
        other => anyhow::bail!("unsupported cluster: {other}"),
    };
    Ok(Client::new(cluster, Rc::new(payer)))
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
            let client = get_client(&cluster, wallet.as_deref())?;
            let program = client
                .program(restaking_programs::id())
                .expect("program id valid");

            let sig = program
                .request()
                .args(restaking_programs::instruction::InitializeOperator {
                    bond_amount,
                    metadata,
                })
                .send()?;

            println!("✅ Operator initialized with tx {sig}");
        }
    }

    Ok(())
}
