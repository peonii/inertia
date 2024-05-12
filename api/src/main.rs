#[tokio::main]
async fn main() {
    let port: u16 = std::env::var("PORT").unwrap_or("3001".to_string()).parse().unwrap();

    inertia_api_core::start(port).await;
}
