use std::sync::Arc;

use async_trait::async_trait;

use super::{CreateTeam, Team};

pub type DynTeamRepository = Arc<dyn TeamRepository + Send + Sync>;

#[async_trait]
pub trait TeamRepository {
    async fn get_team(&self, id: &str) -> anyhow::Result<Team>;
    async fn get_teams_by_game_id(&self, game_id: &str) -> anyhow::Result<Vec<Team>>;
    async fn get_teams_by_user_id(&self, user_id: &str) -> anyhow::Result<Vec<Team>>;

    async fn find_by_game_and_user(&self, game_id: &str, user_id: &str) -> anyhow::Result<Team>;

    async fn create_team(&self, team: &CreateTeam) -> anyhow::Result<Team>;
    async fn update_team(&self, team: &Team) -> anyhow::Result<Team>;

    async fn delete_team(&self, id: &str) -> anyhow::Result<()>;
}
