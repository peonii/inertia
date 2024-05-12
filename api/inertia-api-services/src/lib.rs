use std::sync::Arc;

use inertia_api_domain::user::service::DynUserService;
use scylla::Session;
use user::{repository::ScyllaUserRepository, service::ScyllaUserService};

pub mod user;
pub mod account;
pub mod session;
pub mod snowflakes;

#[derive(Clone)]
pub struct ServiceRegistry {
    pub user_service: DynUserService
}

impl ServiceRegistry {
    pub fn new(session: Session) -> Self {
        let user_repository = Arc::new(ScyllaUserRepository::new(session, 1));
        let user_service = Arc::new(ScyllaUserService::new(user_repository));

        Self {
            user_service
        }
    }
}
