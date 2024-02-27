use std::sync::Arc;

use async_trait::async_trait;

use super::{Account, CreateAccount};

pub type DynAccountService = Arc<dyn AccountService + Send + Sync>;

#[async_trait]
pub trait AccountService {
    async fn create_account(&self, account: &CreateAccount) -> anyhow::Result<Account>;
    async fn get_by_account_id(&self, id: &str) -> anyhow::Result<Account>;
}
