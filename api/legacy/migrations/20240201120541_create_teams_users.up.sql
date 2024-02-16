create table teams_users(
    team_id varchar(63) not null,
    user_id varchar(63) not null,

    primary key (team_id, user_id),
    foreign key (team_id) references teams(id),
    foreign key (user_id) references users(id)
);
