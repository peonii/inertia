use anyhow::anyhow;
use async_trait::async_trait;
use hmac::{Hmac, Mac};
use jwt::{SignWithKey, VerifyWithKey};
use rand::distributions::{Alphanumeric, DistString};
use redis::Commands;
use sha2::Sha256;
use snowflake::SnowflakeIdGenerator;
use std::time::{SystemTime, UNIX_EPOCH};
use time::OffsetDateTime;

use inertia_api_domain::auth::{
    repository::AuthRepository, AccessToken, AuthCode, RefreshToken, TokenVerifyResult,
    ACCESS_TOKEN_EXPIRATION, REFRESH_TOKEN_EXPIRATION,
};

use crate::snowflake::{AUTH_CODE_NODE, REFRESH_TOKEN_NODE};

pub struct InertiaAuthRepository {
    pub redis: redis::Client,
}

impl InertiaAuthRepository {
    pub fn new(redis: redis::Client) -> Self {
        InertiaAuthRepository { redis }
    }
}

#[async_trait]
impl AuthRepository for InertiaAuthRepository {
    async fn create_auth_code(&self, user_id: &str) -> anyhow::Result<String> {
        let mut rng = rand::thread_rng();
        let code = Alphanumeric.sample_string(&mut rng, 64);

        let code = format!("c.{}", code);

        let mut conn = self.redis.get_connection()?;

        conn.set_ex(&code, user_id, 300)?;

        Ok(code)
    }

    async fn verify_auth_code(&self, code: &str) -> anyhow::Result<AuthCode> {
        let mut conn = self.redis.get_connection()?;

        let user_id: String = conn.get(code)?;
        let expiry: i64 = conn.ttl(code)?;

        if user_id.is_empty() {
            return Err(anyhow!("Invalid code"));
        }

        Ok(AuthCode {
            code: code.to_owned(),
            user_id,
            expires_at: OffsetDateTime::now_utc() + time::Duration::seconds(expiry),
        })
    }

    async fn delete_auth_code(&self, code: &str) -> anyhow::Result<()> {
        let mut conn = self.redis.get_connection()?;

        conn.del(code)?;

        Ok(())
    }

    fn create_access_token(&self, user_id: &str) -> anyhow::Result<String> {
        let token = AccessToken {
            issuer: "https://inertia.wtf/".to_owned(),
            subject: user_id.to_owned(),
            expiration: SystemTime::now().duration_since(UNIX_EPOCH)?.as_millis()
                + ACCESS_TOKEN_EXPIRATION,
            issued_at: SystemTime::now().duration_since(UNIX_EPOCH)?.as_millis(),
        };

        let key: Hmac<Sha256> = Hmac::new_from_slice(std::env::var("JWT_SECRET")?.as_bytes())?;
        let token = token.sign_with_key(&key)?;

        Ok(token)
    }

    fn verify_access_token(&self, token: &str) -> anyhow::Result<TokenVerifyResult> {
        let key: Hmac<Sha256> = Hmac::new_from_slice(std::env::var("JWT_SECRET")?.as_bytes())?;

        let token: AccessToken = token.verify_with_key(&key)?;

        if token.expiration > SystemTime::now().duration_since(UNIX_EPOCH)?.as_millis() {
            Ok(TokenVerifyResult::Valid(token.subject))
        } else {
            Ok(TokenVerifyResult::Expired)
        }
    }

    async fn create_refresh_token(&self, user_id: &str) -> anyhow::Result<RefreshToken> {
        let mut gen = SnowflakeIdGenerator::new(1, REFRESH_TOKEN_NODE);
        let id = gen.generate().to_string();

        let mut rng = rand::thread_rng();
        let token = Alphanumeric.sample_string(&mut rng, 64);
        let token = format!("s.{}", token);

        let token = RefreshToken {
            id,
            user_id: user_id.to_owned(),
            token,
            created_at: OffsetDateTime::now_utc(),
        };

        let mut conn = self.redis.get_connection()?;

        let payload = rmp_serde::to_vec(&token)?;

        conn.set_ex(
            &token.token,
            payload,
            (REFRESH_TOKEN_EXPIRATION / 1000) as u64,
        )?;

        Ok(token)
    }

    async fn get_refresh_token(&self, token: &str) -> anyhow::Result<RefreshToken> {
        let mut conn = self.redis.get_connection()?;
        let payload: Option<Vec<u8>> = conn.get(token)?;

        if let Some(payload) = payload {
            let token: RefreshToken = rmp_serde::from_slice(&payload)?;
            Ok(token)
        } else {
            Err(anyhow!("No refresh token found"))
        }
    }

    async fn delete_refresh_token(&self, token: &str) -> anyhow::Result<()> {
        let mut conn = self.redis.get_connection()?;
        conn.del(token)?;
        Ok(())
    }
}
