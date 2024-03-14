mod auth;
mod game;
mod team;
mod user;

use axum::Router;

pub fn router() -> Router {
    Router::new().nest("/", auth::router()).nest("/api/v5", {
        Router::new()
            .nest("/users", user::router())
            .nest("/games", game::router())
            .nest("/teams", team::router())
    })
}
