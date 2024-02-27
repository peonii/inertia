use std::sync::Arc;

use axum::{
    async_trait,
    extract::FromRequestParts,
    http::{header::AUTHORIZATION, request::Parts, HeaderValue},
    Extension, RequestPartsExt,
};
use inertia_api_domain::auth::TokenVerifyResult;

use crate::state::AppState;

use super::error::{InertiaError, InertiaResult};

pub struct Auth(pub String);

static SCHEME_PREFIX: &'static str = "Bearer ";

impl Auth {
    pub async fn from_header(ctx: &Arc<AppState>, header: &HeaderValue) -> InertiaResult<Self> {
        let token = header.to_str().map_err(|_| InertiaError::Unauthorized)?;

        if !token.starts_with(SCHEME_PREFIX) {
            return Err(InertiaError::Unauthorized);
        }

        let token = &token[SCHEME_PREFIX.len()..];

        let result = ctx
            .service
            .auth_service
            .verify_access_token(token)
            .await
            .map_err(|_| InertiaError::Unauthorized)?;

        match result {
            TokenVerifyResult::Valid(uid) => Ok(Self(uid)),
            TokenVerifyResult::Expired => Err(InertiaError::Unauthorized),
        }
    }
}

#[async_trait]
impl<S> FromRequestParts<S> for Auth
where
    S: Send + Sync,
{
    type Rejection = InertiaError;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> InertiaResult<Self> {
        let ctx = parts
            .extract::<Extension<Arc<AppState>>>()
            .await
            .expect("FATAL: AppState not attached!");

        let header = parts
            .headers
            .get(AUTHORIZATION)
            .ok_or_else(|| InertiaError::Unauthorized)?;

        let auth = Self::from_header(&ctx, header).await?;

        Ok(auth)
    }
}
