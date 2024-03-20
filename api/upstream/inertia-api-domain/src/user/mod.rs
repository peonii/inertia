use serde::{Deserialize, Serialize};
use sqlx::FromRow;

pub mod repository;
pub mod service;

#[derive(Serialize, Deserialize, sqlx::Type, PartialEq)]
#[sqlx(rename_all = "lowercase")]
pub enum AuthRole {
    #[serde(rename = "user")]
    User,

    #[serde(rename = "admin")]
    Admin,
}

impl From<String> for AuthRole {
    fn from(s: String) -> Self {
        match s.as_str() {
            "admin" => Self::Admin,
            _ => Self::User,
        }
    }
}

impl ToString for AuthRole {
    fn to_string(&self) -> String {
        match self {
            Self::User => "user".to_string(),
            Self::Admin => "admin".to_string(),
        }
    }
}

#[derive(Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: String,

    pub name: String,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub image: Option<String>,

    pub auth_role: AuthRole,

    #[serde(with = "time::serde::rfc3339")]
    pub created_at: time::OffsetDateTime,
}

impl Default for User {
    fn default() -> Self {
        Self {
            id: "0000000000000000000".to_string(),
            name: "User".to_string(),
            image: None,
            auth_role: AuthRole::User,
            created_at: time::OffsetDateTime::now_utc(),
        }
    }
}

#[derive(Serialize, Deserialize)]
pub struct CreateUser {
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub image: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct UserStats {
    pub id: String,
    pub user_id: String,

    pub xp: i32,
    pub wins: i32,
    pub losses: i32,
    pub draws: i32,
    pub games: i32,
    pub quests: i32,
    pub events: i32,
    pub powerups: i32,
    pub catches: i32,
    pub times_caught: i32,

    pub created_at: time::OffsetDateTime,
}
