use serde::{Deserialize, Serialize};

use super::{RefreshTokenResponse, TokenPair};

#[derive(Serialize, Deserialize)]
pub struct TokenGrantResponse {
    pub access_token: String,
    pub token_type: String,
    pub expires_in: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub refresh_token: Option<String>,
}

impl From<TokenPair> for TokenGrantResponse {
    fn from(value: TokenPair) -> Self {
        Self {
            access_token: value.access_token,
            token_type: "Bearer".to_string(),
            expires_in: value.expires_in,
            refresh_token: Some(value.refresh_token),
        }
    }
}

impl From<RefreshTokenResponse> for TokenGrantResponse {
    fn from(value: RefreshTokenResponse) -> Self {
        Self {
            access_token: value.access_token,
            token_type: "Bearer".to_string(),
            expires_in: value.expires_in,
            refresh_token: None,
        }
    }
}
