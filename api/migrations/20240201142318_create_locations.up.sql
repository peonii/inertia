create table locations(
    id varchar(63) not null primary key,

    lat double precision not null,
    lng double precision not null,
    alt double precision not null,
    precision double precision not null,

    user_id varchar(63) not null references users(id),

    created_at timestamp not null default now()
);
