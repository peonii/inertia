use std::fmt::{self, Display, Formatter};

use serde::{Deserialize, Serialize};

pub mod repository;
pub mod service;

#[derive(Serialize, Deserialize, sqlx::Type)]
#[sqlx(rename_all = "lowercase")]
pub enum AccountType {
    #[serde(rename = "discord")]
    Discord,

    #[serde(rename = "google")]
    Google,

    #[serde(rename = "apple")]
    Apple,
}

impl From<String> for AccountType {
    fn from(s: String) -> Self {
        match s.as_str() {
            "google" => Self::Google,
            "apple" => Self::Apple,
            _ => Self::Discord,
        }
    }
}

impl Display for AccountType {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        match self {
            Self::Discord => write!(f, "discord"),
            Self::Google => write!(f, "google"),
            Self::Apple => write!(f, "apple"),
        }
    }
}

#[derive(Serialize, Deserialize)]
pub struct Account {
    pub id: String,
    pub user_id: String,

    pub account_type: AccountType,
    pub account_id: String,

    pub access_token: String,
    pub refresh_token: String,

    #[serde(with = "time::serde::rfc3339")]
    pub created_at: time::OffsetDateTime,
}

#[derive(Serialize, Deserialize)]
pub struct CreateAccount {
    pub user_id: String,

    pub account_type: AccountType,
    pub account_id: String,

    pub access_token: String,
    pub refresh_token: String,
}
