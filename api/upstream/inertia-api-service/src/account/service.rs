use async_trait::async_trait;
use inertia_api_domain::account::{
    repository::DynAccountRepository, service::AccountService, Account, CreateAccount,
};

pub struct InertiaAccountService {
    repository: DynAccountRepository,
}

impl InertiaAccountService {
    pub fn new(repository: DynAccountRepository) -> Self {
        Self { repository }
    }
}

#[async_trait]
impl AccountService for InertiaAccountService {
    async fn create_account(&self, account: &CreateAccount) -> anyhow::Result<Account> {
        self.repository.create_account(account).await
    }
}
