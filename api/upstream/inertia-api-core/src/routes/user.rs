use std::sync::Arc;

use axum::{routing::get, Extension, Json, Router};
use inertia_api_domain::user::User;

use crate::{
    http::{error::InertiaResult, extractor::Auth},
    state::AppState,
};

pub fn router() -> Router {
    Router::new().route("/@me", get(get_self))
}

pub async fn get_self(
    Extension(state): Extension<Arc<AppState>>,
    Auth(user): Auth,
) -> InertiaResult<Json<User>> {
    let user = state.service.user_service.get_by_id(&user).await?;

    Ok(Json(user))
}
