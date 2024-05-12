use async_trait::async_trait;

use super::{UserCreateDto, UserDto};

#[async_trait]
pub trait UserRepository {
    /// Find a user by their ID.
    /// 
    /// The ID is a Snowflake.
    async fn find_one(&self, id: i64) -> anyhow::Result<UserDto>;

    /// Create a new user.
    async fn create(&self, user: UserCreateDto) -> anyhow::Result<UserDto>;
}

pub type DynUserRepository = std::sync::Arc<dyn UserRepository + Send + Sync>;