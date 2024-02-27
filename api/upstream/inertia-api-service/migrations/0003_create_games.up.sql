-- Add up migration script here
create table games(
    id varchar(64) primary key,
    name varchar(255) not null,
    official boolean not null default false,

    time_start timestamptz not null,
    time_end timestamptz not null,

    loc_lat double precision not null,
    loc_lng double precision not null,

    host_id varchar(64) not null references users(id),
    created_at timestamptz not null
);
