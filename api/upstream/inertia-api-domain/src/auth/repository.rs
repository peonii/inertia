use super::{RefreshToken, TokenVerifyResult};

pub type DynAuthRepository = std::sync::Arc<dyn AuthRepository + Send + Sync>;

pub trait AuthRepository {
    fn create_access_token(&self, user_id: &str) -> anyhow::Result<String>;
    fn verify_access_token(&self, token: &str) -> anyhow::Result<TokenVerifyResult>;

    fn create_refresh_token(&self, user_id: &str) -> anyhow::Result<RefreshToken>;
    fn get_refresh_token(&self, token: &str) -> anyhow::Result<RefreshToken>;
    fn delete_refresh_token(&self, token: &str) -> anyhow::Result<()>;
}
