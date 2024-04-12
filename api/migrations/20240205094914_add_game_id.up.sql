alter table quests add column game_id varchar(64) not null references games(id);
