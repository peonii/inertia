use async_trait::async_trait;
use inertia_api_domain::team::{
    repository::DynTeamRepository, service::TeamService, CreateTeam, Team,
};
use time::OffsetDateTime;

pub struct InertiaTeamService {
    repository: DynTeamRepository,
}

impl InertiaTeamService {
    pub fn new(repository: DynTeamRepository) -> Self {
        Self { repository }
    }
}

#[async_trait]
impl TeamService for InertiaTeamService {
    async fn create_team(&self, team: &CreateTeam) -> anyhow::Result<Team> {
        self.repository.create_team(team).await
    }

    async fn delete_team(&self, id: &str) -> anyhow::Result<()> {
        self.repository.delete_team(id).await
    }

    async fn find_by_game_and_user(&self, game_id: &str, user_id: &str) -> anyhow::Result<Team> {
        self.repository
            .find_by_game_and_user(game_id, user_id)
            .await
    }

    async fn get_team(&self, id: &str) -> anyhow::Result<Team> {
        self.repository.get_team(id).await
    }

    async fn get_teams_by_game_id(&self, game_id: &str) -> anyhow::Result<Vec<Team>> {
        self.repository.get_teams_by_game_id(game_id).await
    }

    async fn get_teams_by_user_id(&self, user_id: &str) -> anyhow::Result<Vec<Team>> {
        self.repository.get_teams_by_user_id(user_id).await
    }

    async fn update_team(&self, team: &Team) -> anyhow::Result<Team> {
        self.repository.update_team(team).await
    }

    async fn veto_team(&self, team_id: &str) -> anyhow::Result<Team> {
        let team = self.repository.get_team(team_id).await?;
        let updated_team = Team {
            veto_period_end: OffsetDateTime::now_utc(),
            ..team
        };

        self.repository.update_team(&updated_team).await
    }
}
