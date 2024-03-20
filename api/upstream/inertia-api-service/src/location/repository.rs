use async_trait::async_trait;
use inertia_api_domain::location::{repository::LocationRepository, CreateLocation, Location};
use redis::AsyncCommands;
use snowflake::SnowflakeIdGenerator;

use crate::snowflake::LOCATION_NODE;

pub struct InertiaLocationRepository {
    pool: sqlx::Pool<sqlx::Postgres>,
    redis: redis::Client,
}

impl InertiaLocationRepository {
    pub fn new(pool: sqlx::Pool<sqlx::Postgres>, redis: redis::Client) -> Self {
        Self { pool, redis }
    }
}

#[async_trait]
impl LocationRepository for InertiaLocationRepository {
    async fn create_location(&self, loc: &CreateLocation) -> anyhow::Result<Location> {
        let id = SnowflakeIdGenerator::new(1, LOCATION_NODE)
            .generate()
            .to_string();

        let loc_with_id = Location {
            id,
            user_id: loc.user_id.clone(),
            lat: loc.lat,
            lng: loc.lng,
            alt: loc.alt,
            prec: loc.prec,
            heading: loc.heading,
            speed: loc.speed,
            created_at: time::OffsetDateTime::now_utc(),
        };

        let mut conn = self.redis.get_async_connection().await?;
        let enc = rmp_serde::to_vec(&loc_with_id)?;
        let key = format!("loc:{}", loc.user_id);

        let _ = conn.set(&key, enc).await?;

        Ok(loc_with_id)
    }

    async fn archive_location(&self, loc: &Location) -> anyhow::Result<()> {
        let _ = sqlx::query!(
            r#"
            INSERT INTO locations (id, user_id, lat, lng, alt, prec, heading, speed, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            "#,
            loc.id,
            loc.user_id,
            loc.lat,
            loc.lng,
            loc.alt,
            loc.prec,
            loc.heading,
            loc.speed,
            loc.created_at
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    async fn get_location_of_user(&self, user_id: &str) -> anyhow::Result<Location> {
        let mut conn = self.redis.get_async_connection().await?;
        let key = format!("loc:{}", user_id);
        let enc: Vec<u8> = conn.get(&key).await?;

        let loc: Location = rmp_serde::from_slice(&enc)?;

        Ok(loc)
    }
}
