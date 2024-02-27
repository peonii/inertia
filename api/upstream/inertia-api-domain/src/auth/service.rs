use std::sync::Arc;

use async_trait::async_trait;

use super::{AuthCode, RefreshTokenResponse, TokenPair, TokenVerifyResult};

pub type DynAuthService = Arc<dyn AuthService + Send + Sync>;

#[async_trait]
pub trait AuthService {
    async fn create_auth_code(&self, user_id: &str) -> anyhow::Result<String>;
    async fn verify_auth_code(&self, code: &str) -> anyhow::Result<AuthCode>;
    async fn delete_auth_code(&self, code: &str) -> anyhow::Result<()>;

    async fn create_token_pair(&self, user_id: &str) -> anyhow::Result<TokenPair>;
    async fn refresh_access_token(
        &self,
        refresh_token: &str,
    ) -> anyhow::Result<RefreshTokenResponse>;

    async fn verify_access_token(&self, access_token: &str) -> anyhow::Result<TokenVerifyResult>;
}
