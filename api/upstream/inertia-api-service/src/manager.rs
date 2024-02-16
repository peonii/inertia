use std::sync::Arc;

use inertia_api_domain::{account::service::DynAccountService, user::service::DynUserService};
use sqlx::PgPool;

use crate::{
    account::{repository::InertiaAccountRepository, service::InertiaAccountService},
    user::{repository::InertiaUserRepository, service::InertiaUserService},
};

#[derive(Clone)]
pub struct ServiceManager {
    pub user_service: DynUserService,
    pub account_service: DynAccountService,
}

impl ServiceManager {
    pub fn new(pool: PgPool) -> Self {
        let user_repository = Arc::new(InertiaUserRepository::new(pool.clone()));
        let user_service = Arc::new(InertiaUserService::new(user_repository));

        let account_repository = Arc::new(InertiaAccountRepository::new(pool));
        let account_service = Arc::new(InertiaAccountService::new(account_repository));

        Self {
            user_service,
            account_service,
        }
    }
}
