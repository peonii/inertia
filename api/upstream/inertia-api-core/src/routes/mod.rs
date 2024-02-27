mod auth;
mod game;
mod user;

use axum::Router;

pub fn router() -> Router {
    Router::new().nest("/", auth::router()).nest("/api/v5", {
        Router::new()
            .nest("/user", user::router())
            .nest("/game", game::router())
    })
}
