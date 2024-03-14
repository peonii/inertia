use std::sync::Arc;

use async_trait::async_trait;

use super::{CreateGame, Game};

pub type DynGameService = Arc<dyn GameService + Send + Sync>;

#[async_trait]
pub trait GameService {
    /// Fetches a game by its id.
    ///
    /// # Errors
    /// - If the game id is invalid
    async fn get_game(&self, id: &str) -> anyhow::Result<Game>;

    /// Fetches multiple games hosted by the user whose id is provided.
    ///
    /// # Errors
    /// - If the user id is invalid
    async fn get_games_by_user_id(&self, user_id: &str) -> anyhow::Result<Vec<Game>>;

    /// Creates a new game.
    async fn create_game(&self, game: &CreateGame) -> anyhow::Result<Game>;

    /// Updates an existing game.
    ///
    /// # Errors
    /// - If the game's id is invalid
    async fn update_game(&self, game: &Game) -> anyhow::Result<Game>;

    /// Deletes a game by its id.
    ///
    /// # Errors
    /// - If the game id is invalid
    async fn delete_game(&self, id: &str) -> anyhow::Result<()>;
}
