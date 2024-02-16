use async_trait::async_trait;

use super::CreateUser;

pub type DynUserService = std::sync::Arc<dyn UserService + Send + Sync>;

#[async_trait]
pub trait UserService {
    async fn create_user(&self, user: &CreateUser) -> anyhow::Result<super::User>;
    async fn get_by_id(&self, id: &str) -> anyhow::Result<super::User>;
}
