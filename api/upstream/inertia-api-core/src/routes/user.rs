use std::sync::Arc;

use axum::{extract::Path, routing::get, Extension, Json, Router};
use inertia_api_domain::user::User;

use crate::{
    http::{error::InertiaResult, extractor::Auth},
    state::AppState,
};

pub fn router() -> Router {
    Router::new()
        .route("/@me", get(get_self))
        .route("/:id", get(get_user_by_id))
        .route("/@me/teams", get(get_self_teams))
        .route("/@me/games", get(get_self_games))
}

pub async fn get_self(
    Extension(state): Extension<Arc<AppState>>,
    Auth(user): Auth,
) -> InertiaResult<Json<User>> {
    let user = state.service.user_service.get_by_id(&user).await?;

    Ok(Json(user))
}

pub async fn get_user_by_id(
    Extension(state): Extension<Arc<AppState>>,
    Auth(_): Auth,
    Path(id): Path<String>,
) -> InertiaResult<Json<User>> {
    let user = state.service.user_service.get_by_id(&id).await?;

    Ok(Json(user))
}

pub async fn get_self_teams(
    Extension(state): Extension<Arc<AppState>>,
    Auth(uid): Auth,
) -> InertiaResult<Json<Vec<inertia_api_domain::team::Team>>> {
    let teams = state
        .service
        .team_service
        .get_teams_by_game_id(&uid)
        .await?;

    Ok(Json(teams))
}

pub async fn get_self_games(
    Extension(state): Extension<Arc<AppState>>,
    Auth(uid): Auth,
) -> InertiaResult<Json<Vec<inertia_api_domain::game::Game>>> {
    let games = state
        .service
        .game_service
        .get_games_by_user_id(&uid)
        .await?;

    Ok(Json(games))
}
