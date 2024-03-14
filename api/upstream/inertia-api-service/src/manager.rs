use std::sync::Arc;

use inertia_api_domain::{
    account::service::DynAccountService, auth::service::DynAuthService,
    game::service::DynGameService, team::service::DynTeamService, user::service::DynUserService,
};
use sqlx::PgPool;

use crate::{
    account::{repository::InertiaAccountRepository, service::InertiaAccountService},
    auth::{repository::InertiaAuthRepository, service::InertiaAuthService},
    game::{repository::InertiaGameRepository, service::InertiaGameService},
    team::{repository::InertiaTeamRepository, service::InertiaTeamService},
    user::{repository::InertiaUserRepository, service::InertiaUserService},
};

#[derive(Clone)]
pub struct ServiceManager {
    pub user_service: DynUserService,
    pub account_service: DynAccountService,
    pub auth_service: DynAuthService,
    pub game_service: DynGameService,
    pub team_service: DynTeamService,
}

impl ServiceManager {
    pub fn new(pool: PgPool, redis: redis::Client) -> Self {
        let user_repository = Arc::new(InertiaUserRepository::new(pool.clone()));
        let user_service = Arc::new(InertiaUserService::new(user_repository));

        let account_repository = Arc::new(InertiaAccountRepository::new(pool.clone()));
        let account_service = Arc::new(InertiaAccountService::new(account_repository));

        let auth_repository = Arc::new(InertiaAuthRepository::new(redis));
        let auth_service = Arc::new(InertiaAuthService::new(auth_repository));

        let game_repository = Arc::new(InertiaGameRepository::new(pool.clone()));
        let game_service = Arc::new(InertiaGameService::new(game_repository));

        let team_repository = Arc::new(InertiaTeamRepository::new(pool.clone()));
        let team_service = Arc::new(InertiaTeamService::new(team_repository));

        Self {
            user_service,
            account_service,
            auth_service,
            game_service,
            team_service,
        }
    }
}
