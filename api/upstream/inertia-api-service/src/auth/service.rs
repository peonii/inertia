use async_trait::async_trait;
use inertia_api_domain::auth::{
    repository::DynAuthRepository, service::AuthService, RefreshTokenResponse, TokenPair,
    TokenVerifyResult, ACCESS_TOKEN_EXPIRATION,
};

pub struct InertiaAuthService {
    pub repository: DynAuthRepository,
}

impl InertiaAuthService {
    pub fn new(repository: DynAuthRepository) -> Self {
        Self { repository }
    }
}

#[async_trait]
impl AuthService for InertiaAuthService {
    async fn create_token_pair(&self, user_id: &str) -> anyhow::Result<TokenPair> {
        let repo = self.repository.clone();

        let refresh_token = repo.create_refresh_token(user_id).await?;
        let access_token = repo.create_access_token(user_id)?;

        Ok(TokenPair {
            access_token,
            refresh_token: refresh_token.token,
            expires_in: ACCESS_TOKEN_EXPIRATION as i64,
            token_type: "Bearer".to_string(),
        })
    }

    async fn refresh_access_token(
        &self,
        refresh_token: &str,
    ) -> anyhow::Result<RefreshTokenResponse> {
        let repo = self.repository.clone();

        let refresh_token = repo.get_refresh_token(refresh_token).await?;
        let access_token = repo.create_access_token(&refresh_token.user_id)?;

        Ok(RefreshTokenResponse {
            access_token,
            expires_in: ACCESS_TOKEN_EXPIRATION as i64,
            token_type: "Bearer".to_string(),
        })
    }

    async fn verify_access_token(&self, access_token: &str) -> anyhow::Result<TokenVerifyResult> {
        let repo = self.repository.clone();
        let res = repo.verify_access_token(access_token)?;

        Ok(res)
    }
}
