use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct OAuthAuthorizeParams {
    pub client_id: String,
    pub redirect_uri: String,
    pub response_type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub state: Option<String>,
}
