create unique index devices_token on devices(token);
alter table devices add constraint devices_token_unique unique using index devices_token;

create unique index live_activities_token on live_activities(token);
alter table live_activities add constraint live_activities_token_unique unique using index live_activities_token;
