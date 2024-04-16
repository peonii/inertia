package repository

import (
	"context"
	"fmt"

	"github.com/bwmarrin/snowflake"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/peonii/inertia/internal/domain"
)

type GameRepository interface {
	FindAll(ctx context.Context) ([]*domain.Game, error)
	FindOne(ctx context.Context, id string) (*domain.Game, error)

	FindAllByHostID(ctx context.Context, hostID string) ([]*domain.Game, error)

	Create(ctx context.Context, game *domain.GameCreate) (*domain.Game, error)
	Update(ctx context.Context, id string, game *domain.GameUpdate) (*domain.Game, error)
	Delete(ctx context.Context, id string) error

	FindAllUsersIDs(ctx context.Context, gameID string) ([]string, error)
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

	games := []*domain.Game{}
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

	games := []*domain.Game{}
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

func (r *PostgresGameRepository) Update(ctx context.Context, id string, game *domain.GameUpdate) (*domain.Game, error) {
	args := make([]interface{}, 0)
	args = append(args, id)
	qtext, args := GatherFields(game, 2, args)

	query := fmt.Sprintf(`
		UPDATE games
		SET %s
		WHERE id = $1
		RETURNING
			id, name, official, host_id, time_start, time_end, loc_lat, loc_lng, created_at
	`, qtext)

	var g domain.Game
	if err := r.db.QueryRow(ctx, query, args...).Scan(
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

func (r *PostgresGameRepository) Delete(ctx context.Context, id string) error {
	query := `
		DELETE FROM games
		WHERE id = $1
	`

	if _, err := r.db.Exec(ctx, query, id); err != nil {
		return err
	}

	return nil
}

func (r *PostgresGameRepository) FindAllUsersIDs(ctx context.Context, id string) ([]string, error) {
	query := `
		SELECT u.id
		FROM users u
		JOIN teams_users tu ON u.id = tu.user_id
		JOIN teams t ON tu.team_id = t.id
		WHERE t.game_id = $1
	`

	rows, err := r.db.Query(ctx, query, id)
	if err != nil {
		return nil, err
	}

	ids := []string{}
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}

		ids = append(ids, id)
	}

	return ids, nil
}
