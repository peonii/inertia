create table teams(
  id varchar(64) primary key,
  name varchar(255) not null,

  xp integer not null default 0,
  balance integer not null default 0,

  emoji varchar(8) not null,
  color varchar(16) not null,

  is_runner boolean not null default false,
  veto_period_end timestamp not null default now(),

  game_id varchar(64) not null references games(id),

  created_at timestamp not null default now()
);
