create table user_stats(
    id varchar(63) primary key,
    user_id varchar(63) not null references users(id),

    xp int not null default 0,
    wins int not null default 0,
    losses int not null default 0,
    draws int not null default 0,
    games int not null default 0,
    quests int not null default 0,

    created_at timestamp not null default now()
);
