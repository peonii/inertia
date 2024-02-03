create table locations(
    id varchar(63) not null primary key,

    lat double not null,
    lng double not null,
    alt double not null,
    precision double not null,

    user_id varchar(63) not null references users(id),

    created_at timestamp not null default now()
);
