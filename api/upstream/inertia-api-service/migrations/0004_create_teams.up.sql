-- Add up migration script here
create table teams (
    id varchar(64) primary key not null,
    name varchar(64) not null,
    xp int not null default 0,
    balance int not null default 0,
    emoji varchar(64) not null,
    color varchar(64) not null,
    is_runner boolean not null default false,
    veto_period_end timestamptz not null default now(),
    game_id varchar(64) not null references games(id) on delete cascade,
    created_at timestamptz not null default now()
);

create table teams_users (
    team_id varchar(64) not null references teams(id) on delete cascade,
    user_id varchar(64) not null references users(id) on delete cascade,
    primary key (team_id, user_id)
);
