# Inertia API

This is the API for Inertia.
A live, hosted version of this API is available at [inertia.live](https://inertia.live).

## Getting Started

### Running in a container

This is the recommended way to locally run the API.

1. Install [Docker](https://docs.docker.com/get-docker/)
2. Populate the `.env` with values in `.env.example`
3. Run `docker compose up` in this directory
4. The API will be available at `http://localhost:3001`

### Running locally (not recommended!)

1. Install [Go](https://golang.org/doc/install)
2. Install [PostgreSQL](https://www.postgresql.org/download/)
3. Install [Redis](https://redis.io/download)
4. Populate the `.env` with values in `.env.example`
5. Set `DATABASE_URL` to Postgres connection string
6. Set `REDIS_URL` to Redis connection string
7. Run `go run ./cmd/inertia api` in this directory

## Documentation

The API's OpenAPI documentation is available at `http://localhost:3001/docs` when running locally. It is also available at [inertia.live/docs](https://inertia.live/docs).

## WebSocket Structures

The WebSocket types aren't documented in the OpenAPI documentation.
Below we have provided examples for each WebSocket structure type.

### `Location`

```json
{
  "typ": "loc",
  "dat": {
    "loc": {
      "lat": 32.32,
      "lng": 12.64,
      "alt": 23.0,
      "precision": 15.0,
      "heading": 0.55,
      "speed": 4.5,
      "user_id": "1782317705181790208"
    },
    "team": {
      "id": "123",
      "name": "Test",
      "xp": 400,
      "balance": 9999,
      "emoji": "🐳",
      "color": "#1eb7e6",
      "is_runner": false,
      "veto_period_end": "2024-04-27T19:50:15.061148Z",
      "game_id": "1782317797620064256",
      "created_at": "2024-04-27T19:50:15.061148Z"
    },
    "user": {
      "id": "1782317705181790208",
      "name": "peony",
      "display_name": "nattie",
      "image": "https://cdn.discordapp.com/avatars/277016821809545216/79b127d7930806c350f634666883af9f.png",
      "auth_role": "user",
      "created_at": "2024-04-22T07:57:09.435226Z"
    }
  }
}
```

### `Powerup`

To be added.
