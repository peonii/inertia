use async_graphql::MergedObject;
use health::HealthQuery;
use user::UserQuery;

pub mod health;
pub mod user;

#[derive(MergedObject, Default)]
pub struct QueryRoot(HealthQuery, UserQuery);
