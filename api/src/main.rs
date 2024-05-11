#[tokio::main]
async fn main() {
    inertia_api_core::start(3001).await;
}
