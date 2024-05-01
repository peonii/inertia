alter table teams alter column veto_period_end timestamptz using veto_period_end at time zone 'UTC';
