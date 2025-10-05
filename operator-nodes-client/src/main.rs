mod handlers;
use handlers::router::new_router;
use tokio::net::TcpListener;

#[tokio::main]
async fn main() {
    let app = new_router();

    let listener = TcpListener::bind("0.0.0.0:3000").await.unwrap();
    println!("The server is run over http://localhost:3000");
    axum::serve(listener, app).await.unwrap();
}
