-- Add up migration script here
create table user_statistics(
    id varchar(64) primary key not null,
    user_id varchar(64) not null references users(id),

    -- This is the main statistic to sort by
    xp int not null default 0,

    wins int not null default 0,
    losses int not null default 0,
    draws int not null default 0,

    games int not null default 0,

    quests int not null default 0,
    events int not null default 0,
    powerups int not null default 0,
    catches int not null default 0,
    times_caught int not null default 0,

    created_at timestamptz not null default now()
);
