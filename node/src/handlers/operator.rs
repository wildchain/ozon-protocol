use axum::Json;

use anchor_client::{
    Client, Cluster,
    solana_sdk::commitment_config::CommitmentConfig,
    solana_sdk::signature::{Keypair, Signer, read_keypair_file},
};
use serde::{Deserialize, Serialize};

use restaking_programs;
use std::rc::Rc;

#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterRequest {
    operator: String,
}

fn get_client() -> Client {
    let wallet_path = dirs::home_dir()
        .expect("home dir")
        .join(".config/solana/id.json");
    let payer = read_keypair_file(wallet_path).expect("read keypair");
    Client::new(Cluster::Devnet, Rc::new(payer))
}

pub async fn register(Json(payload): Json<ResgisterRequest>) -> Json<String> {
    let client = get_client();
    let program = client.program(restaking_programs::id);

    let result = program
        .request()
        .args(restaking_programs::instruction::initialize_operator {
            name: payload.operator.clone(),
        })
        .send();

    match result {
        Ok(sig) => Json(format!(
            "✅ Operator {} initialized with tx {}",
            payload.operator, sig
        )),
        Err(err) => Json(format!("❌ Failed to initialize operator: {:?}", err)),
    }
}

pub async fn status() -> Json<&'static str> {
    Json("Node is running")
}
