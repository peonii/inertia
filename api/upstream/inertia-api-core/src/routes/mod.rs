mod auth;

use axum::Router;

pub fn router() -> Router {
    Router::new().nest("/oauth2", auth::router())
}
