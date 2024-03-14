use async_trait::async_trait;
use inertia_api_domain::team::{repository::TeamRepository, CreateTeam, Team};
use snowflake::SnowflakeIdGenerator;

use crate::snowflake::TEAMS_NODE;

pub struct InertiaTeamRepository {
    pub db: sqlx::PgPool,
}

impl InertiaTeamRepository {
    pub fn new(db: sqlx::PgPool) -> Self {
        Self { db }
    }
}

#[async_trait]
impl TeamRepository for InertiaTeamRepository {
    async fn get_team(&self, id: &str) -> anyhow::Result<Team> {
        let team = sqlx::query_as!(
            Team,
            r#"
            SELECT id, name, xp, balance, emoji, color, is_runner, veto_period_end, game_id, created_at
            FROM teams WHERE id = $1
            "#,
            id
        )
        .fetch_one(&self.db)
        .await?;

        Ok(team)
    }

    async fn get_teams_by_game_id(&self, game_id: &str) -> anyhow::Result<Vec<Team>> {
        let teams = sqlx::query_as!(
            Team,
            r#"
            SELECT id, name, xp, balance, emoji, color, is_runner, veto_period_end, game_id, created_at
            FROM teams WHERE game_id = $1
            "#,
            game_id
        )
        .fetch_all(&self.db)
        .await?;

        Ok(teams)
    }

    async fn get_teams_by_user_id(&self, user_id: &str) -> anyhow::Result<Vec<Team>> {
        let teams = sqlx::query_as!(
            Team,
            r#"
            SELECT t.id, t.name, t.xp, t.balance, t.emoji, t.color, t.is_runner, t.veto_period_end, t.game_id, t.created_at
            FROM teams t
            JOIN teams_users tm ON t.id = tm.team_id
            WHERE tm.user_id = $1
            "#,
            user_id
        )
        .fetch_all(&self.db)
        .await?;

        Ok(teams)
    }

    async fn find_by_game_and_user(&self, game_id: &str, user_id: &str) -> anyhow::Result<Team> {
        let team = sqlx::query_as!(
            Team,
            r#"
            SELECT t.id, t.name, t.xp, t.balance, t.emoji, t.color, t.is_runner, t.veto_period_end, t.game_id, t.created_at
            FROM teams t
            JOIN teams_users tm ON t.id = tm.team_id
            WHERE t.game_id = $1 AND tm.user_id = $2
            "#,
            game_id,
            user_id
        )
        .fetch_one(&self.db)
        .await?;

        Ok(team)
    }

    async fn create_team(&self, team: &CreateTeam) -> anyhow::Result<Team> {
        let mut gen = SnowflakeIdGenerator::new(1, TEAMS_NODE);
        let id = gen.generate().to_string();

        // TODO: Allow setting defaults in game settings
        //
        // This could be done by:
        // - modifying the game model and adding default_xp and default_balance fields
        // - adding a new game_settings model, which allows us to tweak more like veto period and all that
        let team = sqlx::query_as!(
            Team,
            r#"
            INSERT INTO teams (id, name, xp, balance, emoji, color, is_runner, veto_period_end, game_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, name, xp, balance, emoji, color, is_runner, veto_period_end, game_id, created_at
            "#,
            id,
            team.name,
            0,
            500,
            team.emoji,
            team.color,
            false,
            time::OffsetDateTime::now_utc(),
            team.game_id
        )
        .fetch_one(&self.db)
        .await?;

        Ok(team)
    }

    async fn update_team(&self, team: &Team) -> anyhow::Result<Team> {
        let team = sqlx::query_as!(
            Team,
            r#"
            UPDATE teams
            SET name = $1, xp = $2, balance = $3, emoji = $4, color = $5, is_runner = $6, veto_period_end = $7, game_id = $8
            WHERE id = $9
            RETURNING id, name, xp, balance, emoji, color, is_runner, veto_period_end, game_id, created_at
            "#,
            team.name,
            team.xp,
            team.balance,
            team.emoji,
            team.color,
            team.is_runner,
            team.veto_period_end,
            team.game_id,
            team.id
        )
        .fetch_one(&self.db)
        .await?;

        Ok(team)
    }

    async fn delete_team(&self, id: &str) -> anyhow::Result<()> {
        sqlx::query!(
            r#"
            DELETE FROM teams WHERE id = $1
            "#,
            id
        )
        .execute(&self.db)
        .await?;

        Ok(())
    }
}
