use std::sync::Arc;

use axum::{
    extract::Path,
    routing::{get, post},
    Extension, Json, Router,
};
use inertia_api_domain::{
    game::{request::CreateGameRequest, CreateGame, Game},
    user::AuthRole,
};

use crate::{
    http::{
        error::{InertiaError, InertiaResult},
        extractor::Auth,
    },
    state::AppState,
};

pub fn router() -> Router {
    Router::new()
        .route("/:id", get(get_game_by_id))
        .route("/", post(create_game))
}

pub async fn get_game_by_id(
    Extension(state): Extension<Arc<AppState>>,
    Auth(_): Auth,
    Path(id): Path<String>,
) -> InertiaResult<Json<Game>> {
    let game = state.service.game_service.get_game(&id).await?;

    Ok(Json(game))
}

pub async fn create_game(
    Extension(state): Extension<Arc<AppState>>,
    Auth(user_id): Auth,
    Json(payload): Json<CreateGameRequest>,
) -> InertiaResult<Json<Game>> {
    if let Some(official) = payload.official {
        if official {
            let user = state.service.user_service.get_by_id(&user_id).await?;

            if user.auth_role != AuthRole::Admin {
                return Err(InertiaError::Unauthorized);
            }
        }
    }

    let cg = payload.into_create_game(&user_id);
    let game = state.service.game_service.create_game(&cg).await?;

    Ok(Json(game))
}
