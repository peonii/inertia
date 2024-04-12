create table users (
    id varchar(64) not null primary key,

    name varchar(255) not null,
    image varchar(255) not null,

    auth_role varchar(255) not null,

    created_at timestamp not null default now()
);
