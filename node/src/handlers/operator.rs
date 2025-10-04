use axum::Json;

use anchor_client::{
    Client, Cluster,
    solana_sdk::commitment_config::CommitmentConfig,
    solana_sdk::signature::{Keypair, Signer, read_keypair_file},
};
use serde::{Deserialize, Serialize};

use std::rc::Rc;

#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterRequest {
    operator: String,
}

pub async fn register(Json(payload): Json<RegisterRequest>) -> Json<String> {
    Json(format!("Registered Operator: {}", payload.operator))
}

pub async fn status() -> Json<&'static str> {
    Json("Node is running")
}
