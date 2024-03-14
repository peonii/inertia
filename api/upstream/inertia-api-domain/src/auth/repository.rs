use async_trait::async_trait;

use super::{AuthCode, RefreshToken, TokenVerifyResult};

pub type DynAuthRepository = std::sync::Arc<dyn AuthRepository + Send + Sync>;

#[async_trait]
pub trait AuthRepository {
    /// Creates a new auth code for the specified user.
    /// Returns the auth code as a string, without additional metadata.
    async fn create_auth_code(&self, user_id: &str) -> anyhow::Result<String>;

    /// Gets the underlying auth code metadata from the provided string.
    async fn verify_auth_code(&self, code: &str) -> anyhow::Result<AuthCode>;

    /// Deletes the auth code associated with the string.
    async fn delete_auth_code(&self, code: &str) -> anyhow::Result<()>;

    /// Creates a new access token for the specified user.
    /// The access token is a JWT.
    fn create_access_token(&self, user_id: &str) -> anyhow::Result<String>;

    /// Gets the underlying access token metadata from the provided string.
    fn verify_access_token(&self, token: &str) -> anyhow::Result<TokenVerifyResult>;

    /// Creates a new refresh token for the specified user.
    /// This token is stored in Redis.
    async fn create_refresh_token(&self, user_id: &str) -> anyhow::Result<RefreshToken>;

    /// Fetches a refresh token by its secret.
    async fn get_refresh_token(&self, token: &str) -> anyhow::Result<RefreshToken>;

    /// Deletes a refresh token, looking up by its secret.
    async fn delete_refresh_token(&self, token: &str) -> anyhow::Result<()>;
}
