export type User = {
    id: string,
    discord_id: string,
    name: string,
    display_name: string,
    image: string,
    email: string,
    access_token: string,
    refresh_token: string,
    auth_level: number,
    created_at: string
}

export type Team = {
    id: string,
    name: string,
    xp: number,
    balance: number,
    emoji: string,
    color: string,
    is_runner: boolean,
    veto_period_end: string,
    game_id: string,
    created_at: string,
}

export type Game = {
    id: string,
    name: string,
    official: boolean,
    host_id: string,
    time_start: string,
    time_end: string,
    loc_lat: number,
    loc_lng: number,
    created_at: string
}
