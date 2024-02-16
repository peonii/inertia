alter table quests add column game_id varchar(63) not null references games(id);
