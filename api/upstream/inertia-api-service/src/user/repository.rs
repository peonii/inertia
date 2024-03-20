use async_trait::async_trait;
use inertia_api_domain::user::{repository::UserRepository, AuthRole, CreateUser, User, UserStats};
use snowflake::SnowflakeIdGenerator;

use crate::snowflake::{USERS_NODE, USER_STATS_NODE};

pub struct InertiaUserRepository {
    pool: sqlx::Pool<sqlx::Postgres>,
}

impl InertiaUserRepository {
    pub fn new(pool: sqlx::Pool<sqlx::Postgres>) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl UserRepository for InertiaUserRepository {
    async fn get_user(&self, id: &str) -> anyhow::Result<User> {
        let user = sqlx::query_as!(
            inertia_api_domain::user::User,
            r#"
            SELECT id, name, image, auth_role, created_at
            FROM users
            WHERE id = $1
            "#,
            id
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(user)
    }

    async fn create_user(&self, user: &CreateUser) -> anyhow::Result<User> {
        let mut node = SnowflakeIdGenerator::new(1, USERS_NODE);

        let user = sqlx::query_as!(
            inertia_api_domain::user::User,
            r#"
            INSERT INTO users (id, name, image, auth_role, created_at)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, image, auth_role, created_at
            "#,
            node.generate().to_string(),
            user.name,
            user.image,
            AuthRole::User.to_string(),
            time::OffsetDateTime::now_utc()
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(user)
    }

    async fn get_user_stats(&self, id: &str) -> anyhow::Result<UserStats> {
        let stats = sqlx::query_as!(
            UserStats,
            r#"
            SELECT id, user_id, xp, wins, losses, draws, games, quests, events, powerups, catches, times_caught, created_at
            FROM user_statistics
            WHERE user_id = $1
            "#,
            id
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(stats)
    }

    async fn create_user_stats(&self, id: &str) -> anyhow::Result<UserStats> {
        let stats = sqlx::query_as!(
            UserStats,
            r#"
            INSERT INTO user_statistics (id, user_id, xp, wins, losses, draws, games, quests, events, powerups, catches, times_caught, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING id, user_id, xp, wins, losses, draws, games, quests, events, powerups, catches, times_caught, created_at
            "#,
            SnowflakeIdGenerator::new(1, USER_STATS_NODE).generate().to_string(),
            id,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            time::OffsetDateTime::now_utc()
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(stats)
    }

    async fn update_user_stats(&self, stats: &UserStats) -> anyhow::Result<UserStats> {
        let stats = sqlx::query_as!(
            UserStats,
            r#"
            UPDATE user_statistics
            SET xp = $1, wins = $2, losses = $3, draws = $4, games = $5, quests = $6, events = $7, powerups = $8, catches = $9, times_caught = $10, created_at = $11
            WHERE user_id = $12
            RETURNING id, user_id, xp, wins, losses, draws, games, quests, events, powerups, catches, times_caught, created_at
            "#,
            stats.xp,
            stats.wins,
            stats.losses,
            stats.draws,
            stats.games,
            stats.quests,
            stats.events,
            stats.powerups,
            stats.catches,
            stats.times_caught,
            stats.created_at,
            stats.user_id
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(stats)
    }
}
