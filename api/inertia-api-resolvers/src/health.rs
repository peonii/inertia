use async_graphql::Object;

#[derive(Default)]
pub struct HealthQuery;

#[Object]
impl HealthQuery {
    async fn health(&self) -> String {
        "ok".to_string()
    }
}
