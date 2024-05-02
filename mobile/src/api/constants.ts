export const BASE_URL = "https://inertia.live";

export const ENDPOINTS = {
  oauth2: {
    authorize: `${BASE_URL}/oauth2/authorize`,
    token: `${BASE_URL}/api/v5/oauth2/token`,
  },
  users: {
    me: `${BASE_URL}/api/v5/users/@me`,
    id: (id: string) => `${BASE_URL}/api/v5/users/${id}`,
  },
  games: {
    all: `${BASE_URL}/api/v5/games`,
    me: `${BASE_URL}/api/v5/users/@me/games`,
    create: `${BASE_URL}/api/v5/games`,
    update: (id: string) => `{${BASE_URL}/api/v5/games/${id}`,
  },
  teams: {
    me: `${BASE_URL}/api/v5/users/@me/teams`,
    id: (id: string) => `${BASE_URL}/api/v5/teams/${id}`,
    quests: (id: string) => `${BASE_URL}/api/v5/teams/${id}/quests`,
    generate_side: (id: string) =>
      `${BASE_URL}/api/v5/teams/${id}/generate-side`,
    catch: (id: string) => `${BASE_URL}/api/v5/teams/${id}/catch-team`,
  },
  quests: {
    complete: (id: string) => `${BASE_URL}/api/v5/quests/${id}/complete`,
    veto: (id: string) => `${BASE_URL}/api/v5/quests/${id}/veto`,
  },
  locations: {
    publish: `${BASE_URL}/api/v5/locations`,
  },
  devices: {
    register: `${BASE_URL}/api/v5/devices`,
  },
  powerups: {
    buy: `${BASE_URL}/api/v5/powerups`,
  },
  ws: `${BASE_URL}/ws`,
};
