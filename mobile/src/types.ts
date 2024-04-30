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

export type Players = {
  name: string;
  lat: number,
  lng: number,
  alt: number,
  precision: number,
  heading: number,
  speed: number,
  user_id: string;
  team_name: string;
  experience: number;
  rank: number;
}
