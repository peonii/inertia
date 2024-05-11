USE inertia;

CREATE TABLE inertia.accounts (
    user_id BIGINT,

    account_type INT,
    account_id   TEXT,
    email        TEXT,

    created_at TIMESTAMP,

    PRIMARY KEY (user_id, email, account_id)
);
