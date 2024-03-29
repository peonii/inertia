use async_trait::async_trait;
use inertia_api_domain::user::{
    repository::DynUserRepository, service::UserService, CreateUser, User, UserStats,
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
        let user = self.repository.create_user(user).await?;
        let _ = self.repository.create_user_stats(&user.id).await?;

        Ok(user)
    }

    async fn get_by_id(&self, id: &str) -> anyhow::Result<User> {
        self.repository.get_user(id).await
    }

    async fn get_stats(&self, id: &str) -> anyhow::Result<UserStats> {
        self.repository.get_user_stats(id).await
    }

    async fn update_stats(&self, stats: &UserStats) -> anyhow::Result<UserStats> {
        self.repository.update_user_stats(stats).await
    }
}
