use async_graphql::{Context, Object, Result};
use inertia_api_domain::user::UserDto;
use inertia_api_services::ServiceRegistry;

#[derive(Default)]
pub struct UserQuery;

#[Object]
impl UserQuery {
    async fn user(&self, ctx: &Context<'_>, id: i64) -> Result<UserDto> {
        let services = ctx.data_unchecked::<ServiceRegistry>();

        let user = services.user_service.find_one(id).await?;

        Ok(user)
    }
}
