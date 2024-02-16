use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;

pub mod repository;
pub mod request;
pub mod service;

pub static ACCESS_TOKEN_EXPIRATION: u128 = 1000 * 60 * 60 * 24; // 24 hours
pub static REFRESH_TOKEN_EXPIRATION: u128 = 1000 * 60 * 60 * 24 * 365; // 1 year

#[derive(Debug, Serialize, Deserialize)]
pub struct AccessToken {
    #[serde(rename = "iss")]
    pub issuer: String,
    #[serde(rename = "sub")]
    pub subject: String, // user id
    #[serde(rename = "exp")]
    pub expiration: u128,
    #[serde(rename = "iat")]
    pub issued_at: u128,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct RefreshToken {
    pub id: String,
    pub user_id: String,
    pub token: String,
    pub created_at: time::OffsetDateTime,
}

pub enum TokenVerifyResult {
    Valid(String),
    Expired,
    // No invalid case because it'll be an error
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
