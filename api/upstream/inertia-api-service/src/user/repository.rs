use async_trait::async_trait;
use inertia_api_domain::user::{repository::UserRepository, AuthRole, CreateUser, User};
use snowflake::SnowflakeIdGenerator;

use crate::snowflake::USERS_NODE;

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
}
