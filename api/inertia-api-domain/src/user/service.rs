use async_trait::async_trait;

use super::{UserCreateDto, UserDto};

#[async_trait]
pub trait UserService {
    /// Find a user by their ID.
    /// 
    /// The ID is a Snowflake.
    async fn find_one(&self, id: i64) -> anyhow::Result<UserDto>;

    /// Create a new user.
    async fn create(&self, user: UserCreateDto) -> anyhow::Result<UserDto>;
}

pub type DynUserService = std::sync::Arc<dyn UserService + Send + Sync>;