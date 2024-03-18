use std::sync::Arc;

use axum::{
    extract::Path,
    routing::{get, post},
    Extension, Json, Router,
};
use inertia_api_domain::team::{CreateTeam, Team};

use crate::{
    http::{error::InertiaResult, extractor::Auth},
    state::AppState,
};

pub fn router() -> Router {
    Router::new()
        .route("/:id", get(get_team_by_id))
        .route("/", post(create_team))
}

pub async fn get_team_by_id(
    Extension(state): Extension<Arc<AppState>>,
    Auth(_): Auth,
    Path(id): Path<String>,
) -> InertiaResult<Json<Team>> {
    let team = state.service.team_service.get_team(&id).await?;

    Ok(Json(team))
}

pub async fn create_team(
    Extension(state): Extension<Arc<AppState>>,
    Auth(_): Auth,
    Json(payload): Json<CreateTeam>,
) -> InertiaResult<Json<Team>> {
    let team = state.service.team_service.create_team(&payload).await?;

    Ok(Json(team))
}
