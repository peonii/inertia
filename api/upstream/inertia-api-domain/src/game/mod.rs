use serde::{Deserialize, Serialize};

pub mod repository;
pub mod request;
pub mod service;

#[derive(Serialize, Deserialize)]
pub struct Game {
    pub id: String,
    pub name: String,
    pub official: bool,

    #[serde(with = "time::serde::rfc3339")]
    pub time_start: time::OffsetDateTime,
    #[serde(with = "time::serde::rfc3339")]
    pub time_end: time::OffsetDateTime,

    pub loc_lat: f64,
    pub loc_lng: f64,

    pub host_id: String,
    #[serde(with = "time::serde::rfc3339")]
    pub created_at: time::OffsetDateTime,
}

#[derive(Serialize, Deserialize)]
pub struct CreateGame {
    pub name: String,

    // This field should always be false
    // if the user creating the game is not an admin
    #[serde(skip_serializing_if = "Option::is_none")]
    pub official: Option<bool>,

    #[serde(with = "time::serde::rfc3339")]
    pub time_start: time::OffsetDateTime,
    #[serde(with = "time::serde::rfc3339")]
    pub time_end: time::OffsetDateTime,

    pub loc_lat: f64,
    pub loc_lng: f64,
    pub host_id: String,
}
