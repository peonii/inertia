use inertia_api_service::manager::ServiceManager;
use sqlx::PgPool;

#[derive(Clone)]
pub struct AppState {
    pub service: ServiceManager,
}

impl AppState {
    pub fn new(db: &PgPool, redis: redis::Client) -> Self {
        Self {
            service: ServiceManager::new(db.clone(), redis),
        }
    }
}
