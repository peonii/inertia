use async_trait::async_trait;
use inertia_api_domain::account::{repository::AccountRepository, Account, CreateAccount};
use snowflake::SnowflakeIdGenerator;
use sqlx::PgPool;

use crate::snowflake::ACCOUNTS_NODE;

pub struct InertiaAccountRepository {
    pool: PgPool,
}

impl InertiaAccountRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl AccountRepository for InertiaAccountRepository {
    async fn get_account(&self, id: &str) -> anyhow::Result<Account> {
        let account = sqlx::query_as!(
            Account,
            r#"
            SELECT id, user_id, account_type, account_id, access_token, refresh_token, created_at
            FROM accounts
            WHERE id = $1
            "#,
            id
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(account)
    }

    async fn get_by_account_id(&self, id: &str) -> anyhow::Result<Account> {
        let account = sqlx::query_as!(
            Account,
            r#"
            SELECT id, user_id, account_type, account_id, access_token, refresh_token, created_at
            FROM accounts
            WHERE account_id = $1
            "#,
            id
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(account)
    }

    async fn create_account(&self, account: &CreateAccount) -> anyhow::Result<Account> {
        let mut gen = SnowflakeIdGenerator::new(1, ACCOUNTS_NODE);

        let account = sqlx::query_as!(
            Account,
            r#"
            INSERT INTO accounts (id, user_id, account_type, account_id, access_token, refresh_token, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, user_id, account_type, account_id, access_token, refresh_token, created_at
            "#,
            gen.generate().to_string(),
            account.user_id,
            account.account_type.to_string(),
            account.account_id,
            account.access_token,
            account.refresh_token,
            time::OffsetDateTime::now_utc()
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(account)
    }

    async fn update_account(&self, account: &Account) -> anyhow::Result<Account> {
        let account = sqlx::query_as!(
            Account,
            r#"
            UPDATE accounts
            SET user_id = $1, account_type = $2, account_id = $3, access_token = $4, refresh_token = $5
            WHERE id = $6
            RETURNING id, user_id, account_type, account_id, access_token, refresh_token, created_at
            "#,
            account.user_id,
            account.account_type.to_string(),
            account.account_id,
            account.access_token,
            account.refresh_token,
            account.id
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(account)
    }

    async fn delete_account(&self, id: &str) -> anyhow::Result<()> {
        sqlx::query!(
            r#"
            DELETE FROM accounts
            WHERE id = $1
            "#,
            id
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }
}
