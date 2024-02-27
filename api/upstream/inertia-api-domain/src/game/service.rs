use std::sync::Arc;

use async_trait::async_trait;

use super::{CreateGame, Game};

pub type DynGameService = Arc<dyn GameService + Send + Sync>;

#[async_trait]
pub trait GameService {
    async fn get_game(&self, id: &str) -> anyhow::Result<Game>;
    async fn get_games_by_user_id(&self, user_id: &str) -> anyhow::Result<Vec<Game>>;

    async fn create_game(&self, game: &CreateGame) -> anyhow::Result<Game>;
    async fn update_game(&self, game: &Game) -> anyhow::Result<Game>;
    async fn delete_game(&self, id: &str) -> anyhow::Result<()>;
}
