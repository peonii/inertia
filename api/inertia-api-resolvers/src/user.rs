use async_graphql::Object;
use inertia_api_domain::user::UserDto;

#[derive(Default)]
pub struct UserQuery;

#[Object]
impl UserQuery {
    async fn user(&self, id: i64) -> UserDto {
        UserDto {
            id,
            name: "John Doe".to_string(),
            image: "https://via.placeholder.com/150".to_string(),
            auth_role: 1,
            created_at: time::OffsetDateTime::now_utc(),
        }
    }
}
