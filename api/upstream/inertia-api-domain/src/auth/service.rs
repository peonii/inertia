use std::sync::Arc;

use super::{RefreshTokenResponse, TokenPair};

pub type DynAuthService = Arc<dyn AuthService + Send + Sync>;

pub trait AuthService {
    fn create_token_pair(&self, user_id: &str) -> anyhow::Result<TokenPair>;
    fn refresh_access_token(&self, refresh_token: &str) -> anyhow::Result<RefreshTokenResponse>;

    fn verify_access_token(&self, access_token: &str) -> anyhow::Result<()>;
}
