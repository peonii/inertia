use async_graphql::{http::GraphiQLSource, EmptyMutation, EmptySubscription, Schema};
use async_graphql_poem::GraphQL;
use inertia_api_resolvers::QueryRoot;
use poem::{get, handler, listener::TcpListener, post, web::Html, IntoResponse, Route, Server};

#[handler]
async fn graphiql() -> impl IntoResponse {
    Html(GraphiQLSource::build().endpoint("/gql").finish())
}

pub async fn start(port: u16) {
    let schema = Schema::build(QueryRoot, EmptyMutation, EmptySubscription).finish();

    let app = Route::new()
        .at("/gql", post(GraphQL::new(schema)))
        .at("/graphiql", get(graphiql));

    Server::new(TcpListener::bind(format!("0.0.0.0:{port}")))
        .run(app)
        .await
        .unwrap();
}
