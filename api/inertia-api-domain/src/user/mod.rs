use async_graphql::SimpleObject;
use serde::{Deserialize, Serialize};

pub mod repository;
pub mod service;

#[derive(Serialize, Deserialize, SimpleObject)]
pub struct UserDto {
    pub id: i64,
    pub name: String,
    pub image: String,
    pub auth_role: i32,
    pub created_at: time::OffsetDateTime,
}
