use inertia_api_domain::user::service::UserService;

pub mod user;

pub struct ServiceRegistry {
    pub user_service: Box<dyn UserService>,
}
