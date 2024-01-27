create table users (
    id bigint not null primary key,

    discord_id varchar(255) not null unique,
    name varchar(255) not null,
    email varchar(255) not null,
    image varchar(255) not null,

    access_token varchar(255) not null,
    refresh_token varchar(255) not null,

    auth_level int not null default 0,

    created_at timestamp not null default now()
);