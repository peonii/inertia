use std::sync::Arc;

use async_trait::async_trait;

use super::{CreateLocation, Location};

pub type DynLocationService = Arc<dyn LocationService + Send + Sync>;

#[async_trait]
pub trait LocationService {
    async fn create_location(&self, loc: &CreateLocation) -> anyhow::Result<Location>;
    async fn get_location_of_user(&self, id: &str) -> anyhow::Result<Location>;
}
