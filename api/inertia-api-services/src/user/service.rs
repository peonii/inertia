
use async_trait::async_trait;
use inertia_api_domain::user::{repository::DynUserRepository, service::UserService, UserCreateDto, UserDto};


pub struct ScyllaUserService {
    pub user_repository: DynUserRepository,
}

impl ScyllaUserService {
    pub fn new(user_repository: DynUserRepository) -> Self {
        Self {
            user_repository,
        }
    }
}

#[async_trait]
impl UserService for ScyllaUserService {
    async fn find_one(&self, id: i64) -> anyhow::Result<UserDto> {
        let user = self.user_repository.find_one(id).await;

        return user;
    }

    async fn create(&self, user: UserCreateDto) -> anyhow::Result<UserDto> {
        let user = self.user_repository.create(user).await;

        return user;
    }
}
