use anyhow::Result;
use axum::Extension;
use sqlx::postgres::PgPoolOptions;
use state::AppState;
use tower::ServiceBuilder;
use tower_http::trace::TraceLayer;

pub mod http;
pub mod routes;
pub mod state;

pub async fn run() -> Result<()> {
    let db_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let db = PgPoolOptions::new()
        .max_connections(10)
        .connect(&db_url)
        .await?;

    let redis_url = std::env::var("REDIS_URL").expect("REDIS_URL must be set");
    let redis = redis::Client::open(redis_url)?;

    let app_state = AppState::new(&db, redis);

    let app = routes::router().layer(
        ServiceBuilder::new()
            .layer(TraceLayer::new_for_http()) // Logging must be first
            .layer(Extension(app_state)),
    );

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001").await?;
    axum::serve(listener, app).await?;

    Ok(())
}
