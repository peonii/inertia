use axum::{http::StatusCode, response::IntoResponse};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum InertiaError {
    #[error("An error occurred while processing the request body: {0}")]
    PayloadError(String),

    #[error("You're not authorized to perform this request")]
    Unauthorized,

    #[error("Error while processing request: {0}")]
    AnyhowError(#[from] anyhow::Error),

    #[error("Error while processing request: {0}")]
    ReqwestError(#[from] reqwest::Error),
}

pub type InertiaResult<T> = Result<T, InertiaError>;

impl InertiaError {
    fn status_code(&self) -> StatusCode {
        match self {
            InertiaError::PayloadError(_) => StatusCode::BAD_REQUEST,
            InertiaError::Unauthorized => StatusCode::UNAUTHORIZED,
            InertiaError::AnyhowError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            InertiaError::ReqwestError(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}

impl IntoResponse for InertiaError {
    fn into_response(self) -> axum::http::Response<axum::body::Body> {
        (self.status_code(), self.to_string()).into_response()
    }
}
