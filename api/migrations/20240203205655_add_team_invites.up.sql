create table game_invite(
    id varchar(64) primary key,
    game_id varchar(64) not null,
    slug varchar(255) not null,
    uses integer not null default 0
);
