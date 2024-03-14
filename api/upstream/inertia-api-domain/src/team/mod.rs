use serde::{Deserialize, Serialize};

pub mod repository;
pub mod service;

#[derive(Serialize, Deserialize)]
pub struct Team {
    pub id: String,
    pub name: String,

    pub xp: i32,
    pub balance: i32,
    pub emoji: String,
    pub color: String,

    pub is_runner: bool,
    #[serde(with = "time::serde::rfc3339")]
    pub veto_period_end: time::OffsetDateTime,

    pub game_id: String,

    #[serde(with = "time::serde::rfc3339")]
    pub created_at: time::OffsetDateTime,
}

#[derive(Serialize, Deserialize)]
pub struct CreateTeam {
    pub name: String,
    pub emoji: String,
    pub color: String,
    pub game_id: String,
}
