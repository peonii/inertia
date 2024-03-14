use async_trait::async_trait;
use inertia_api_domain::game::{repository::GameRepository, CreateGame, Game};
use snowflake::SnowflakeIdGenerator;

use crate::snowflake::GAMES_NODE;

pub struct InertiaGameRepository {
    pub db: sqlx::PgPool,
}

impl InertiaGameRepository {
    pub fn new(db: sqlx::PgPool) -> Self {
        Self { db }
    }
}

#[async_trait]
impl GameRepository for InertiaGameRepository {
    async fn get_game(&self, id: &str) -> anyhow::Result<Game> {
        let game = sqlx::query_as!(
            Game,
            r#"
            SELECT id, name, official, time_start, time_end, loc_lat, loc_lng, host_id, created_at
            FROM games WHERE id = $1
            "#,
            id
        )
        .fetch_one(&self.db)
        .await?;

        Ok(game)
    }

    async fn get_games_by_user_id(&self, user_id: &str) -> anyhow::Result<Vec<Game>> {
        let games = sqlx::query_as!(
            Game,
            r#"
            SELECT id, name, official, time_start, time_end, loc_lat, loc_lng, host_id, created_at
            FROM games WHERE host_id = $1
            "#,
            user_id
        )
        .fetch_all(&self.db)
        .await?;

        Ok(games)
    }

    async fn create_game(&self, game: &CreateGame) -> anyhow::Result<Game> {
        let mut gen = SnowflakeIdGenerator::new(1, GAMES_NODE);
        let id = gen.generate().to_string();

        let game = sqlx::query_as!(
            Game,
            r#"
            INSERT INTO games (id, name, official, time_start, time_end, loc_lat, loc_lng, host_id, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, name, official, time_start, time_end, loc_lat, loc_lng, host_id, created_at
            "#,
            id,
            game.name,
            game.official.unwrap_or(false),
            game.time_start,
            game.time_end,
            game.loc_lat,
            game.loc_lng,
            game.host_id,
            time::OffsetDateTime::now_utc()
        )
        .fetch_one(&self.db)
        .await?;

        Ok(game)
    }

    async fn update_game(&self, game: &Game) -> anyhow::Result<Game> {
        let game = sqlx::query_as!(
            Game,
            r#"
            UPDATE games
            SET name = $2, official = $3, time_start = $4, time_end = $5, loc_lat = $6, loc_lng = $7, host_id = $8, created_at = $9
            WHERE id = $1
            RETURNING id, name, official, time_start, time_end, loc_lat, loc_lng, host_id, created_at
            "#,
            game.id,
            game.name,
            game.official,
            game.time_start,
            game.time_end,
            game.loc_lat,
            game.loc_lng,
            game.host_id,
            game.created_at
        )
        .fetch_one(&self.db)
        .await?;

        Ok(game)
    }

    async fn delete_game(&self, id: &str) -> anyhow::Result<()> {
        sqlx::query!(
            r#"
            DELETE FROM games WHERE id = $1
            "#,
            id
        )
        .fetch_one(&self.db)
        .await?;

        Ok(())
    }
}
