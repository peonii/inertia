use serde::{Deserialize, Serialize};
use sqlx::FromRow;

pub mod repository;
pub mod service;

#[derive(Serialize, Deserialize)]
pub struct Location {
    pub id: String,
    pub user_id: String,

    pub lat: f64,
    pub lng: f64,
    pub alt: f64,
    pub prec: f64,
    pub heading: f64,
    pub speed: f64,

    pub created_at: time::OffsetDateTime,
}

#[derive(Serialize, Deserialize)]
pub struct CreateLocation {
    pub user_id: String,

    pub lat: f64,
    pub lng: f64,
    pub alt: f64,
    pub prec: f64,
    pub heading: f64,
    pub speed: f64,
}
