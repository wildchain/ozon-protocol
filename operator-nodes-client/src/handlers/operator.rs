use axum::Json;

use anchor_client::{
    solana_sdk::signature::{read_keypair_file, Keypair},
    Client, Cluster,
};
use serde::{Deserialize, Serialize};

use restaking_programs;
use std::rc::Rc;

#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterRequest {
    bond_amount: u64,
    metadata: String,
}

fn get_client() -> Client<Rc<Keypair>> {
    let wallet_path = dirs::home_dir()
        .expect("home dir")
        .join(".config/solana/id.json");
    let payer = read_keypair_file(wallet_path).expect("read keypair");
    Client::new(Cluster::Devnet, Rc::new(payer))
}

pub async fn register(Json(payload): Json<RegisterRequest>) -> Json<String> {
    let client = get_client();
    let program = client
        .program(restaking_programs::id())
        .expect("program id valid");

    let result = program
        .request()
        .args(restaking_programs::instruction::InitializeOperator {
            bond_amount: payload.bond_amount,
            metadata: payload.metadata.clone(),
        })
        .send();

    match result {
        Ok(sig) => Json(format!("✅ Operator initialized with tx {}", sig)),
        Err(err) => Json(format!("❌ Failed to initialize operator: {:?}", err)),
    }
}

pub async fn status() -> Json<&'static str> {
    Json("Node is running")
}
