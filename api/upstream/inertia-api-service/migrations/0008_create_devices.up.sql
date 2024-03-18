-- Add up migration script here
create type push_service as enum ('apns', 'fcm');
-- APNs is for iOS devices
-- FCM is for Android devices
-- This table is for push notifications ONLY
create table devices(
    id varchar(64) primary key not null,
    user_id varchar(64) not null references users(id),

    service_type push_service not null,
    token text not null,

    -- Expired tokens should be pruned every 24h
    expires_at timestamptz not null,
    created_at timestamptz not null default now()
);

-- iOS only!
create table live_activities(
    id varchar(64) primary key not null,
    user_id varchar(64) not null references users(id),

    token text not null,
    -- Can be either 'quest' or 'full' for now
    -- Should automatically change to 'full' in case team is chasing
    la_type varchar(16) not null,

    team_id varchar(64) not null references teams(id),
    -- We don't need to store the quest id
    -- The 'quest' live activity won't be updated either way

    expires_at timestamptz not null,
    created_at timestamptz not null default now()
);
