use axum::{extract::Query, response::Redirect, routing::get, Router};
use axum_extra::extract::cookie::{Cookie, CookieJar};
use inertia_api_domain::auth::request::OAuthAuthorizeParams;

use crate::http::error::{InertiaError, InertiaResult};

pub fn router() -> Router {
    Router::new().route("/authorize", get(authorize))
}

pub async fn authorize(
    Query(query): Query<OAuthAuthorizeParams>,
    jar: CookieJar,
) -> InertiaResult<(CookieJar, Redirect)> {
    if query.response_type != "code" {
        return Err(InertiaError::PayloadError(format!(
            "Invalid response type! Expected 'code', got '{}'",
            query.response_type
        )));
    }

    let mut jar = jar.add(Cookie::new("redirect_uri", query.redirect_uri));

    if let Some(state) = query.state {
        jar = jar.add(Cookie::new("state", state));
    }

    let discord_state = rand::random::<u64>().to_string();
    jar = jar.add(Cookie::new("discord_state", discord_state.clone()));

    let discord_endpoint = format!(
        "https://discord.com/api/oauth2/authorize?client_id={}&redirect_uri={}&response_type=code&scope=identify%20email&state={}",
        std::env::var("DISCORD_CLIENT_ID").expect("DISCORD_CLIENT_ID not set"),
        std::env::var("DISCORD_REDIRECT_URI").expect("DISCORD_REDIRECT_URI not set"),
        discord_state
    );

    Ok((jar, Redirect::to(&discord_endpoint)))
}
