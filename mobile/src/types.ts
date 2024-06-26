export type User = {
  id: string;
  discord_id: string;
  name: string;
  // display_name: string;
  image: string;
  email: string;
  access_token: string;
  refresh_token: string;
  auth_level: number;
  created_at: string;
};

export type Team = {
  id: string;
  name: string;
  xp: number;
  balance: number;
  emoji: string;
  color: string;
  is_runner: boolean;
  veto_period_end: string;
  game_id: string;
  created_at: string;
};

export type Game = {
  id: string;
  name: string;
  official: boolean;
  host_id: string;
  time_start: string;
  time_end: string;
  loc_lat: number;
  loc_lng: number;
  created_at: string;
};

export type ActiveQuest = {
  id: string;
  quest_id: string;
  title: string;
  description: string;
  money: number;
  xp: number;
  quest_type: string;
  group_id: string;
  lat: number;
  lng: number;
  complete: boolean;
  game_id: string;
  team_id: string;
  created_at: string;
  started_at: string;
};

export type LocationPayload = {
  loc: {
    lat: number;
    lng: number;
    alt: number;
    precision: number;
    heading: number;
    speed: number;
    user_id: string;
  };
  team: Team;
  user: User;
};

export type Powerup = {
  id: string;
  type: "freeze_hunters" | "reveal_hunters" | "hide_tracker" | "hunt" | "freeze_runners" | "blacklist";
  caster_id: string;
  ends_at: string;
  created_at: string;
};

export type WsMessage =
  | {
    typ: "loc";
    dat: LocationPayload;
  }
  | {
    typ: "pwp";
    dat: {
      pwp: Powerup;
      cas: Team;
    };
  }
  | {
    typ: "cat";
    dat: never;
  };
