package repository

import (
	"context"

	"github.com/bwmarrin/snowflake"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/peonii/inertia/internal/domain"
)

type GameRepository interface {
	FindAll(ctx context.Context) ([]*domain.Game, error)
	FindOne(ctx context.Context, id string) (*domain.Game, error)

	FindAllByHostID(ctx context.Context, hostID string) ([]*domain.Game, error)

	Create(ctx context.Context, game *domain.GameCreate) (*domain.Game, error)
	Update(ctx context.Context, game *domain.Game) (*domain.Game, error)
	Delete(ctx context.Context, id string) error
}

type PostgresGameRepository struct {
	GameRepository
	db *pgxpool.Pool
}

func MakePostgresGameRepository(db *pgxpool.Pool) *PostgresGameRepository {
	return &PostgresGameRepository{
		db: db,
	}
}

func (r *PostgresGameRepository) FindAll(ctx context.Context) ([]*domain.Game, error) {
	query := `
		SELECT
			id, name, official, host_id, time_start, time_end, loc_lat, loc_lng, created_at
		FROM games
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}

	var games []*domain.Game
	for rows.Next() {
		var game domain.Game
		if err := rows.Scan(
			&game.ID,
			&game.Name,
			&game.Official,
			&game.HostID,
			&game.TimeStart,
			&game.TimeEnd,
			&game.LocLat,
			&game.LocLng,
			&game.CreatedAt,
		); err != nil {
			return nil, err
		}

		games = append(games, &game)
	}

	return games, nil
}

func (r *PostgresGameRepository) FindOne(ctx context.Context, id string) (*domain.Game, error) {
	query := `
		SELECT
			id, name, official, host_id, time_start, time_end, loc_lat, loc_lng, created_at
		FROM games
		WHERE id = $1
	`

	var game domain.Game
	if err := r.db.QueryRow(ctx, query, id).Scan(
		&game.ID,
		&game.Name,
		&game.Official,
		&game.HostID,
		&game.TimeStart,
		&game.TimeEnd,
		&game.LocLat,
		&game.LocLng,
		&game.CreatedAt,
	); err != nil {
		return nil, err
	}

	return &game, nil
}

func (r *PostgresGameRepository) FindAllByHostID(ctx context.Context, hostID string) ([]*domain.Game, error) {
	query := `
		SELECT
			id, name, official, host_id, time_start, time_end, loc_lat, loc_lng, created_at
		FROM games
		WHERE host_id = $1
	`

	rows, err := r.db.Query(ctx, query, hostID)
	if err != nil {
		return nil, err
	}

	var games []*domain.Game
	for rows.Next() {
		var game domain.Game
		if err := rows.Scan(
			&game.ID,
			&game.Name,
			&game.Official,
			&game.HostID,
			&game.TimeStart,
			&game.TimeEnd,
			&game.LocLat,
			&game.LocLng,
			&game.CreatedAt,
		); err != nil {
			return nil, err
		}

		games = append(games, &game)
	}

	return games, nil
}

func (r *PostgresGameRepository) Create(ctx context.Context, game *domain.GameCreate) (*domain.Game, error) {
	query := `
		INSERT INTO games (
			id, name, official, host_id, time_start, time_end, loc_lat, loc_lng
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8
		) RETURNING
			id, name, official, host_id, time_start, time_end, loc_lat, loc_lng, created_at
	`

	node, err := snowflake.NewNode(domain.GameSnowflakeNode)
	if err != nil {
		return nil, err
	}

	id := node.Generate().String()

	var g domain.Game
	if err := r.db.QueryRow(ctx, query,
		id,
		game.Name,
		false,
		game.HostID,
		game.TimeStart,
		game.TimeEnd,
		game.LocLat,
		game.LocLng,
	).Scan(
		&g.ID,
		&g.Name,
		&g.Official,
		&g.HostID,
		&g.TimeStart,
		&g.TimeEnd,
		&g.LocLat,
		&g.LocLng,
		&g.CreatedAt,
	); err != nil {
		return nil, err
	}

	return &g, nil
}
