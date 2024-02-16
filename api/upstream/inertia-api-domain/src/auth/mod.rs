use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;

pub mod repository;
pub mod service;

#[derive(Debug, Serialize, Deserialize)]
pub struct AccessToken {
    #[serde(rename = "iss")]
    pub issuer: String,
    #[serde(rename = "sub")]
    pub subject: String, // user id
    #[serde(rename = "exp")]
    pub expiration: i64,
    #[serde(rename = "iat")]
    pub issued_at: i64,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct RefreshToken {
    pub id: String,
    pub user_id: String,
    pub token: String,
    pub created_at: time::OffsetDateTime,
}

pub enum TokenVerifyResult {
    Valid,
    Invalid,
    Expired,
}

pub struct TokenPair {
    pub access_token: String,
    pub refresh_token: String,
    pub expires_in: i64,
    pub token_type: String, // "Bearer"
}

pub struct RefreshTokenResponse {
    pub access_token: String,
    pub expires_in: i64,
    pub token_type: String, // "Bearer"
}
