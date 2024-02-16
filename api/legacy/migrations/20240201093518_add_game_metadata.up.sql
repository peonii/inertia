alter table games add column time_start timestamp not null;
alter table games add column time_end timestamp not null;
alter table games add column loc_lat float not null;
alter table games add column loc_lng float not null;
