USE inertia;

CREATE TABLE inertia.users (
    id         BIGINT,
    name       TEXT,
    image      TEXT,
    auth_role  INT,
    created_at TIMESTAMP,

    PRIMARY KEY (id)
);
