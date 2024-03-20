use std::sync::Arc;

use async_trait::async_trait;

use super::{CreateLocation, Location};

pub type DynLocationRepository = Arc<dyn LocationRepository + Send + Sync>;

#[async_trait]
pub trait LocationRepository {
    async fn create_location(&self, loc: &CreateLocation) -> anyhow::Result<Location>;
    async fn archive_location(&self, loc: &Location) -> anyhow::Result<()>;
    async fn get_location_of_user(&self, id: &str) -> anyhow::Result<Location>;
}
