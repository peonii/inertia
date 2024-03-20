use async_trait::async_trait;
use inertia_api_domain::location::{
    repository::DynLocationRepository, service::LocationService, CreateLocation, Location,
};
use redis::AsyncCommands;
use snowflake::SnowflakeIdGenerator;

use crate::snowflake::LOCATION_NODE;

pub struct InertiaLocationService {
    pub repository: DynLocationRepository,
}

impl InertiaLocationService {
    pub fn new(repository: DynLocationRepository) -> Self {
        Self { repository }
    }
}

#[async_trait]
impl LocationService for InertiaLocationService {
    async fn create_location(&self, loc: &CreateLocation) -> anyhow::Result<Location> {
        let l = self.repository.create_location(loc).await?;
        // This can fail and we don't need to handle it
        let _ = self.repository.archive_location(&l).await;
        Ok(l)
    }

    async fn get_location_of_user(&self, user_id: &str) -> anyhow::Result<Location> {
        self.repository.get_location_of_user(user_id).await
    }
}
