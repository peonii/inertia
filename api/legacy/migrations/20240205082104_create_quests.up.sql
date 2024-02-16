create table quest_groups(
  id varchar(63) not null primary key,
  game_id varchar(63) not null references games(id),
  count integer not null
);

create table quests(
  id varchar(63) not null primary key,

  title varchar(255) not null,
  description text not null,

  money integer not null,
  xp integer not null,

  quest_type varchar(32) not null,
  group_id varchar(63) not null references quest_groups(id),

  lat double precision,
  lng double precision,

  created_at timestamp not null default now()
);

create table active_quests(
  id varchar(63) not null primary key,
  quest_id varchar(63) not null references quests(id),
  team_id varchar(63) not null references teams(id),
  complete boolean not null default false,
  created_at timestamp not null default now()
);
