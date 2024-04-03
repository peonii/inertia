use sqlx::PgPool;

pub mod account;
pub mod auth;
pub mod game;
pub mod location;
pub mod manager;
mod snowflake;
pub mod team;
pub mod user;

pub async fn migrate(pool: PgPool) -> anyhow::Result<()> {
    sqlx::migrate!().run(&pool).await?;

    Ok(())
}
