use axum::Json;

use serde::{Deserialize, Serialize};

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
