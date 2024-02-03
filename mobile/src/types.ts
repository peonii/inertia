export type User = {
    id: string,
    discord_id: string,
    name: string,
    image: string,
    email: string,
    access_token: string,
    refresh_token: string,
    auth_level: number,
    created_at: object
}

export type Team = {
    id: string,
    name: string,
    xp: number,
    balance: number,
    emoji: string,
    color: string,
    is_runner: false,
    veto_period_end: object,
    game_id: string,
    created_at: string,
}

export type Game = {
    id: string,
    name: string,
    official: false,
    host_id: string,
    time_start: object,
    time_end: object,
    loc_lat: number,
    loc_lng: number,
    created_at: string
}