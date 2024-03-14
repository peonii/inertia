use std::sync::Arc;

use async_trait::async_trait;

use super::{AuthCode, RefreshTokenResponse, TokenPair, TokenVerifyResult};

pub type DynAuthService = Arc<dyn AuthService + Send + Sync>;

#[async_trait]
pub trait AuthService {
    /// Creates a new auth code for the specified user.
    /// Returns the auth code as a string, without additional metadata.
    async fn create_auth_code(&self, user_id: &str) -> anyhow::Result<String>;

    /// Gets the underlying auth code metadata from the provided string.
    async fn verify_auth_code(&self, code: &str) -> anyhow::Result<AuthCode>;

    /// Deletes the auth code associated with the string.
    async fn delete_auth_code(&self, code: &str) -> anyhow::Result<()>;

    /// Creates a new access-refresh token pair for the specified user.
    /// The access token is returned as a JWT.
    /// The refresh token is returned as a `RefreshToken` struct.
    async fn create_token_pair(&self, user_id: &str) -> anyhow::Result<TokenPair>;

    /// Verifies a refresh token and creates a new access token based on it.
    /// The user metadata is extracted from the refresh token.
    async fn refresh_access_token(
        &self,
        refresh_token: &str,
    ) -> anyhow::Result<RefreshTokenResponse>;

    /// Verifies an access token.
    /// This function will error if the access token is completely invalid.
    /// This function will return the `Expired` enum variant if the access token is expired.
    async fn verify_access_token(&self, access_token: &str) -> anyhow::Result<TokenVerifyResult>;
}
