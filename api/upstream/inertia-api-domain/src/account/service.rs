use std::sync::Arc;

use async_trait::async_trait;

use super::{Account, CreateAccount};

pub type DynAccountService = Arc<dyn AccountService + Send + Sync>;

#[async_trait]
pub trait AccountService {
    /// Creates a new account.
    async fn create_account(&self, account: &CreateAccount) -> anyhow::Result<Account>;

    /// Fetches an account by its id.
    ///
    /// # Errors
    /// - If the id is invalid
    async fn get_by_account_id(&self, id: &str) -> anyhow::Result<Account>;
}
