export const BASE_URL = "https://inertia-devel.fly.dev";

export const ENDPOINTS = {
  oauth2: {
    authorize: `${BASE_URL}/oauth2/authorize`,
    token: `${BASE_URL}/api/v5/oauth2/token`,
  },
  users: {
    me: `${BASE_URL}/api/v5/users/@me`,
    id: (id: string) => `${BASE_URL}/api/v5/users/${id}`
  }
};
