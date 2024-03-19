-- Add up migration script here

-- This table is only used for archiving purposes
-- Should not be used in the app as a way to get user location
create table locations(
    id varchar(64) primary key not null,
    user_id varchar(64) not null references users(id),

    lat double precision not null,
    lng double precision not null,
    alt double precision not null,
    prec double precision not null,
    -- Measured in degrees
    heading double precision not null,
    -- Used for prediction on where the location is
    speed double precision not null,

    created_at timestamptz not null default now()
);
