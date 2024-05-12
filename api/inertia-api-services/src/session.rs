use std::time::Duration;

use scylla::{Session, SessionBuilder};


pub async fn establish_session() -> Session {
    let session = SessionBuilder::new()
        .known_node(std::env::var("SCYLLA_URL").unwrap())
        .connection_timeout(Duration::from_secs(5))
        .build()
        .await
        .unwrap();

    return session;
}