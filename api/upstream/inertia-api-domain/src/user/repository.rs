use std::sync::Arc;

use super::{CreateUser, User, UserStats};
use async_trait::async_trait;

pub type DynUserRepository = Arc<dyn UserRepository + Send + Sync>;

#[async_trait]
pub trait UserRepository {
    async fn get_user(&self, id: &str) -> anyhow::Result<User>;
    async fn create_user(&self, user: &CreateUser) -> anyhow::Result<User>;

    async fn get_user_stats(&self, id: &str) -> anyhow::Result<UserStats>;
    async fn create_user_stats(&self, id: &str) -> anyhow::Result<UserStats>;
    async fn update_user_stats(&self, stats: &UserStats) -> anyhow::Result<UserStats>;
}
