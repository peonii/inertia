-- Add up migration script here
create table quest_groups(
    id varchar(64) primary key not null,
    game_id varchar(64) not null references games(id),
    -- For identification purposes only
    tag varchar(255) not null,
    count integer not null,

    created_at timestamptz not null default now()
);

create table quests(
    id varchar(64) primary key not null,
    game_id varchar(64) not null references games(id),

    title varchar(64) not null,
    description varchar(64) not null,

    quest_type varchar(64) not null,
    money integer not null default 0,
    xp integer not null default 0,

    group_id varchar(64) not null references quest_groups(id),

    lat double precision,
    lng double precision,

    created_at timestamptz not null default now()
);

create table active_quests(
    id varchar(64) not null primary key,
    quest_id varchar(64) not null references quests(id),
    team_id varchar(64) not null references teams(id),
    complete boolean not null default false,
    created_at timestamp not null default now()
);
