-- Add up migration script here
create table users(
    id varchar(64) primary key,

    name varchar(255) not null,
    image varchar(255),

    auth_role varchar(255) not null,

    created_at timestamptz not null
);
