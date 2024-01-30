package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/peonii/inertia/internal/domain"
)

type GameRepository interface {
	FindAll(ctx context.Context) ([]*domain.Game, error)
	FindOne(ctx context.Context, id string) (*domain.Game, error)

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
			id, name, official, host_id, created_at
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
			&game.CreatedAt,
		); err != nil {
			return nil, err
		}

		games = append(games, &game)
	}

	return games, nil
}
