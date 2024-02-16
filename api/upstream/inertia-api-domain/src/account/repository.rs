use std::sync::Arc;

use async_trait::async_trait;

use super::{Account, CreateAccount};

pub type DynAccountRepository = Arc<dyn AccountRepository + Send + Sync>;

#[async_trait]
pub trait AccountRepository {
    async fn get_account(&self, id: &str) -> anyhow::Result<Account>;
    async fn create_account(&self, account: &CreateAccount) -> anyhow::Result<Account>;
    async fn update_account(&self, account: &Account) -> anyhow::Result<Account>;
    async fn delete_account(&self, id: &str) -> anyhow::Result<()>;
}
