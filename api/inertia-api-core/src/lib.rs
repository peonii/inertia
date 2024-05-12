use async_graphql::{http::GraphiQLSource, EmptyMutation, EmptySubscription, Schema};
use async_graphql_poem::GraphQL;
use inertia_api_resolvers::QueryRoot;
use inertia_api_services::{session, ServiceRegistry};
use poem::{get, handler, listener::TcpListener, post, web::Html, IntoResponse, Route, Server};

#[handler]
async fn graphiql() -> impl IntoResponse {
    Html(GraphiQLSource::build().endpoint("/gql").finish())
}

pub async fn start(port: u16) {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::DEBUG)
        .init();

    let session = session::establish_session().await;

    let schema = 
        Schema::build(QueryRoot::default(), EmptyMutation, EmptySubscription)
            .data(ServiceRegistry::new(session))
            .finish();

    let app = Route::new()
        .at("/gql", post(GraphQL::new(schema)))
        .at("/graphiql", get(graphiql));

    Server::new(TcpListener::bind(format!("0.0.0.0:{port}")))
        .run(app)
        .await
        .unwrap();
}
