use async_trait::async_trait;

use super::UserDto;

#[async_trait]
pub trait UserService {
    async fn find_one(&self, id: i32) -> anyhow::Result<UserDto>;
}
