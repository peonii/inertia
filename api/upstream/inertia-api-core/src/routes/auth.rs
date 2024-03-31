use std::sync::Arc;

use axum::{
    extract::Query,
    response::Redirect,
    routing::{get, post},
    Extension, Json, Router,
};
use axum_extra::extract::cookie::{Cookie, CookieJar};
use inertia_api_domain::{
    account::{AccountType, CreateAccount},
    auth::{
        request::{
            DiscordResponse, DiscordUser, OAuth2Provider, OAuthAuthorizeParams,
            OAuthCallbackParams, TokenGrantType, TokenRequest,
        },
        response::TokenGrantResponse,
    },
    user::CreateUser,
};

use crate::{
    http::error::{InertiaError, InertiaResult},
    state::AppState,
};

pub fn router() -> Router {
    Router::new()
        .route("/api/v5/oauth2/token", post(token_grant))
        .route("/oauth2/authorize", get(authorize))
        .route("/oauth2/d/callback", get(authorize_callback_discord))
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

    let provider_state = rand::random::<u64>().to_string();
    jar = jar.add(Cookie::new("provider_state", provider_state.clone()));

    let endpoint = match query.provider {
        OAuth2Provider::Discord => {
            format!(
               "https://discord.com/api/oauth2/authorize?client_id={}&redirect_uri={}&response_type=code&scope=identify%20email&state={}",
               std::env::var("DISCORD_CLIENT_ID").expect("DISCORD_CLIENT_ID not set"),
               std::env::var("DISCORD_REDIRECT_URI").expect("DISCORD_REDIRECT_URI not set"),
               provider_state
           )
        }
        _ => todo!(),
    };

    Ok((jar, Redirect::to(&endpoint)))
}

pub async fn authorize_callback_discord(
    Extension(state): Extension<Arc<AppState>>,
    Query(query): Query<OAuthCallbackParams>,
    jar: CookieJar,
) -> InertiaResult<Redirect> {
    let local_state = jar
        .get("provider_state")
        .ok_or(InertiaError::PayloadError(
            "Missing state cookie".to_string(),
        ))?
        .value()
        .to_string();

    if query.state != local_state {
        return Err(InertiaError::PayloadError("State mismatch".to_string()));
    }

    let redirect_uri = jar
        .get("redirect_uri")
        .ok_or(InertiaError::PayloadError(
            "Missing redirect_uri cookie".to_string(),
        ))?
        .value()
        .to_string();

    let code = query.code;

    let discord_token = reqwest::Client::new()
        .post("https://discord.com/api/oauth2/token")
        .form(&[
            (
                "client_id",
                std::env::var("DISCORD_CLIENT_ID").expect("DISCORD_CLIENT_ID not set"),
            ),
            (
                "client_secret",
                std::env::var("DISCORD_CLIENT_SECRET").expect("DISCORD_CLIENT_SECRET not set"),
            ),
            ("grant_type", "authorization_code".to_string()),
            ("code", code),
            (
                "redirect_uri",
                std::env::var("DISCORD_REDIRECT_URI").expect("DISCORD_REDIRECT_URI not set"),
            ),
            ("scope", "identify email".to_string()),
        ])
        .send()
        .await?
        .json::<DiscordResponse>()
        .await?;

    let discord_user: DiscordUser = reqwest::Client::new()
        .get("https://discord.com/api/v10/users/@me")
        .header(
            "Authorization",
            format!("Bearer {}", discord_token.access_token),
        )
        .send()
        .await?
        .json::<DiscordUser>()
        .await?;

    let mut account = state
        .service
        .account_service
        .get_by_account_id(&discord_user.id)
        .await;

    if let Err(_) = account {
        let mut img: Option<String> = None;
        if let Some(avatar) = discord_user.avatar {
            img = Some(
                "https://cdn.discordapp.com/avatars/".to_owned()
                    + discord_user.id.as_str()
                    + "/"
                    + avatar.as_str()
                    + ".png",
            );
        }

        let user = CreateUser {
            name: discord_user.username,
            image: img,
        };
        let user = state.service.user_service.create_user(&user).await?;

        let accountc = CreateAccount {
            user_id: user.id,
            account_type: AccountType::Discord,
            account_id: discord_user.id,
            access_token: discord_token.access_token,
            refresh_token: discord_token.refresh_token,
        };
        account = state
            .service
            .account_service
            .create_account(&accountc)
            .await;
    }
    // } else if let Ok(account) = account {
    //     let mut user = state
    //         .service
    //         .user_service
    //         .get_by_id(&account.user_id)
    //         .await?;

    //     user.image = match discord_user.avatar {
    //         Some(avatar) => Some(
    //             "https://cdn.discordapp.com/avatars/".to_owned()
    //                 + discord_user.id.as_str()
    //                 + "/"
    //                 + avatar.as_str()
    //                 + ".png",
    //         ),
    //         None => None,
    //     };
    // }

    // banger line
    let account = account?;

    let state_inertia = jar.get("state").map(|c| c.value().to_string());
    let code = state
        .service
        .auth_service
        .create_auth_code(&account.user_id)
        .await?;

    let redirect_uri = format!("{}?code={}", redirect_uri, code);
    let redirect_uri = state_inertia
        .map(|state| format!("{}&state={}", redirect_uri, state))
        .unwrap_or(redirect_uri);

    Ok(Redirect::to(&redirect_uri))
}

pub async fn token_grant(
    Extension(state): Extension<Arc<AppState>>,
    Json(req): Json<TokenRequest>,
) -> InertiaResult<Json<TokenGrantResponse>> {
    match req.grant_type {
        TokenGrantType::Code => {
            if req.code.is_none() {
                return Err(InertiaError::PayloadError("Missing code".to_string()));
            }

            let code = req.code.expect("should be Some by now");
            let code = state.service.auth_service.verify_auth_code(&code).await?;

            let pair = state
                .service
                .auth_service
                .create_token_pair(&code.user_id)
                .await?;

            Ok(Json(pair.into()))
        }
        TokenGrantType::Refresh => {
            if req.refresh_token.is_none() {
                return Err(InertiaError::PayloadError(
                    "Missing refresh_token".to_string(),
                ));
            }

            let refresh_token = req.refresh_token.expect("should be Some by now");
            let access_token = state
                .service
                .auth_service
                .refresh_access_token(&refresh_token)
                .await?;

            Ok(Json(access_token.into()))
        }
    }
}
