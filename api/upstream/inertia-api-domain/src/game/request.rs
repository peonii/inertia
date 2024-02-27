use serde::Deserialize;

use super::CreateGame;

#[derive(Deserialize)]
pub struct CreateGameRequest {
    pub name: String,

    #[serde(with = "time::serde::rfc3339")]
    pub time_start: time::OffsetDateTime,
    #[serde(with = "time::serde::rfc3339")]
    pub time_end: time::OffsetDateTime,

    pub loc_lat: f64,
    pub loc_lng: f64,

    pub official: Option<bool>,
}

impl CreateGameRequest {
    pub fn into_create_game(&self, host_id: &str) -> CreateGame {
        CreateGame {
            host_id: host_id.to_string(),
            name: self.name.clone(),
            time_start: self.time_start,
            time_end: self.time_end,
            loc_lat: self.loc_lat,
            loc_lng: self.loc_lng,
            official: self.official,
        }
    }
}
