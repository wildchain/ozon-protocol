use axum::{
    Json, Router,
    routing::{get, post},
};
use serde::{Deserialize, Serialize};
use tokio::net::TcpListener;

#[derive(Debug, Serialize, Deserialize)]
struct RegisterRequest {
    operator: String,
}

async fn register(Json(payload): Json<RegisterRequest>) -> Json<String> {
    Json(format!("Registered Operator: {}", payload.operator))
}

async fn status() -> Json<&'static str> {
    Json("Node is running")
}

fn new_router() -> Router {
    Router::new()
        .route("/register", post(register))
        .route("/check", get(status))
}

#[tokio::main]
async fn main() {
    let app = new_router();

    let listener = TcpListener::bind("0.0.0.0:3000").await.unwrap();
    println!("The server is run over http://localhost:3000");
    axum::serve(listener, app).await.unwrap();
}
