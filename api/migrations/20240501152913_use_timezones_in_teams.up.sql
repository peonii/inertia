alter table teams alter column veto_period_end t type timestamptz not null using veto_period_end at time zone 'UTC';
