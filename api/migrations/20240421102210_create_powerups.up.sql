create type powerup_type as enum(
    'freeze_hunters',
    'reveal_hunters',
    'hide_tracker',

    'hunt',
    'freeze_runners'
);

create table powerups(
    id varchar(64) primary key,

    type varchar(64) not null,

    caster_id varchar(64) not null references teams(id),
    ends_at timestamp not null,

    created_at timestamp not null default now()
);
