use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub enum OAuth2Provider {
    #[serde(rename = "discord")]
    Discord,
    #[serde(rename = "google")]
    Google,
    #[serde(rename = "apple")]
    Apple,
}

#[derive(Serialize, Deserialize)]
pub enum TokenGrantType {
    #[serde(rename = "authorization_code")]
    Code,
    #[serde(rename = "refresh_token")]
    Refresh,
}

#[derive(Serialize, Deserialize)]
pub struct OAuthAuthorizeParams {
    pub client_id: String,
    pub redirect_uri: String,
    pub response_type: String,
    pub provider: OAuth2Provider,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub state: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct OAuthCallbackParams {
    pub code: String,
    pub state: String,
}

#[derive(Serialize, Deserialize)]
pub struct DiscordResponse {
    pub access_token: String,
    pub token_type: String,
    pub expires_in: i64,
    pub refresh_token: String,
    pub scope: String,
}

#[derive(Serialize, Deserialize)]
pub struct DiscordUser {
    pub id: String,
    pub username: String,
    pub discriminator: String,
    pub avatar: Option<String>,
    pub email: String,
}

#[derive(Serialize, Deserialize)]
pub struct TokenRequest {
    pub code: Option<String>,
    pub refresh_token: Option<String>,
    pub grant_type: TokenGrantType,
}
