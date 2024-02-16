create table games (
    id varchar(63) primary key,
    name varchar(255) not null,
    official boolean not null default false,

    host_id varchar(63) not null references users(id),

    created_at timestamp not null default now()
);
