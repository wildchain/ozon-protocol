use axum::{
    Router,
    routing::{get, post},
};

use crate::handlers::operator::{register, status};

pub fn new_router() -> Router {
    Router::new()
        .route("/register", post(register))
        .route("/check", get(status))
}
