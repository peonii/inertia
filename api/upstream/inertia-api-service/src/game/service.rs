use async_trait::async_trait;
use inertia_api_domain::game::{
    repository::DynGameRepository, service::GameService, CreateGame, Game,
};

pub struct InertiaGameService {
    repository: DynGameRepository,
}

impl InertiaGameService {
    pub fn new(repository: DynGameRepository) -> Self {
        Self { repository }
    }
}

#[async_trait]
impl GameService for InertiaGameService {
    async fn get_game(&self, id: &str) -> anyhow::Result<Game> {
        self.repository.get_game(id).await
    }

    async fn get_games_by_user_id(&self, user_id: &str) -> anyhow::Result<Vec<Game>> {
        self.repository.get_games_by_user_id(user_id).await
    }

    async fn create_game(&self, game: &CreateGame) -> anyhow::Result<Game> {
        self.repository.create_game(game).await
    }

    async fn update_game(&self, game: &Game) -> anyhow::Result<Game> {
        self.repository.update_game(game).await
    }

    async fn delete_game(&self, id: &str) -> anyhow::Result<()> {
        self.repository.delete_game(id).await
    }
}
