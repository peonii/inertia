# Inertia API

This is the API for Inertia.

## Getting Started

### Running in a container

This is the recommended way to locally run the API.

1. Install [Docker](https://docs.docker.com/get-docker/)
2. Run `docker compose up` in this directory
3. Populate the `.env` with values in `.env.example`
4. The API will be available at `http://localhost:3001`

### Running locally (not recommended!)

1. Install [Go](https://golang.org/doc/install)
2. Install [PostgreSQL](https://www.postgresql.org/download/)
3. Install [Redis](https://redis.io/download)
4. Populate the `.env` with values in `.env.example`
5. Set `DATABASE_URL` to Postgres connection string
6. Set `REDIS_URL` to Redis connection string
7. Run `go run ./cmd/inertia api` in this directory