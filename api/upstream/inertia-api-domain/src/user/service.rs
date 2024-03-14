use async_trait::async_trait;

use super::CreateUser;

pub type DynUserService = std::sync::Arc<dyn UserService + Send + Sync>;

#[async_trait]
pub trait UserService {
    /// Creates a new user.
    async fn create_user(&self, user: &CreateUser) -> anyhow::Result<super::User>;

    /// Fetches a user by their id.
    ///
    /// # Errors
    /// - If the id is invalid
    async fn get_by_id(&self, id: &str) -> anyhow::Result<super::User>;
}
