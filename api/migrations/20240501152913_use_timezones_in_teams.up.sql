alter table teams alter column veto_period_end type timestamptz using veto_period_end at time zone 'UTC';
