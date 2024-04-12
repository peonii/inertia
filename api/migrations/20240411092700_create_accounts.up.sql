create table accounts(
  id varchar(64) primary key,
  user_id varchar(64) not null,

  account_type varchar(64) not null,
  account_id   varchar(255) not null,

  email varchar(255) not null,

  access_token varchar(255) not null,
  refresh_token varchar(255) not null,

  created_at timestamp not null default now()
);
