use axum::{http::StatusCode, response::IntoResponse};
use serde::{Deserialize, Serialize};
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

    // The first three digits are the HTTP status code
    // The last two are a custom subset of the status code
    fn internal_code(&self) -> u32 {
        match self {
            InertiaError::PayloadError(_) => 40000,
            InertiaError::Unauthorized => 40100,
            InertiaError::AnyhowError(_) => 50000,
            InertiaError::ReqwestError(_) => 50001,
        }
    }
}

#[derive(Serialize, Deserialize)]
struct InertiaErrorResponse {
    status: u16,
    code: u32,
    error: String,
}

impl IntoResponse for InertiaError {
    fn into_response(self) -> axum::http::Response<axum::body::Body> {
        let error = InertiaErrorResponse {
            status: self.status_code().as_u16(),
            code: self.internal_code(),
            error: self.to_string(),
        };

        let body = serde_json::to_string(&error).unwrap(); // This *should* be infallible

        axum::http::Response::builder()
            .status(self.status_code())
            .header("Content-Type", "application/json")
            .body(axum::body::Body::from(body))
            .unwrap() // Ditto, this should be infallible

        // In any case that these unwraps fail we want to panic
    }
}
