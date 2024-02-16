use async_trait::async_trait;
use inertia_api_domain::user::{
    repository::DynUserRepository, service::UserService, CreateUser, User,
};

pub struct InertiaUserService {
    repository: DynUserRepository,
}

impl InertiaUserService {
    pub fn new(repository: DynUserRepository) -> Self {
        Self { repository }
    }
}

#[async_trait]
impl UserService for InertiaUserService {
    async fn create_user(&self, user: &CreateUser) -> anyhow::Result<User> {
        self.repository.create_user(user).await
    }

    async fn get_by_id(&self, id: &str) -> anyhow::Result<User> {
        self.repository.get_user(id).await
    }
}
