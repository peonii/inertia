package repository

import (
	"context"
	"time"

	"github.com/bwmarrin/snowflake"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/peonii/inertia/internal/domain"
)

type PowerupRepository interface {
	GetByID(ctx context.Context, id string) (*domain.Powerup, error)
	GetByGameID(ctx context.Context, gameID string) ([]*domain.Powerup, error)
	GetActiveByGameID(ctx context.Context, gameID string) ([]*domain.Powerup, error)
	Create(ctx context.Context, powerup *domain.PowerupCreate) (*domain.Powerup, error)
}

type PostgresPowerupRepository struct {
	db *pgxpool.Pool
}

func MakePostgresPowerupRepository(db *pgxpool.Pool) *PostgresPowerupRepository {
	return &PostgresPowerupRepository{
		db: db,
	}
}

func (r *PostgresPowerupRepository) GetByID(ctx context.Context, id string) (*domain.Powerup, error) {
	query := `
		SELECT
			id, type, caster_id, ends_at, created_at
		FROM powerups
		WHERE id = $1
	`

	var powerup domain.Powerup
	err := r.db.QueryRow(ctx, query, id).Scan(
		&powerup.ID,
		&powerup.Type,
		&powerup.CasterID,
		&powerup.EndsAt,
		&powerup.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &powerup, nil
}

func (r *PostgresPowerupRepository) GetByGameID(ctx context.Context, gameID string) ([]*domain.Powerup, error) {
	query := `
		SELECT
			id, type, caster_id, ends_at, created_at
		FROM powerups
		JOIN teams ON powerups.caster_id = teams.id
		WHERE teams.game_id = $1
	`

	rows, err := r.db.Query(ctx, query, gameID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var powerups []*domain.Powerup
	for rows.Next() {
		var powerup domain.Powerup
		if err := rows.Scan(
			&powerup.ID,
			&powerup.Type,
			&powerup.CasterID,
			&powerup.EndsAt,
			&powerup.CreatedAt,
		); err != nil {
			return nil, err
		}

		powerups = append(powerups, &powerup)
	}

	return powerups, nil
}

func (r *PostgresPowerupRepository) GetActiveByGameID(ctx context.Context, gameID string) ([]*domain.Powerup, error) {
	query := `
		SELECT
			id, type, caster_id, ends_at, created_at
		FROM powerups
		JOIN teams ON powerups.caster_id = teams.id
		WHERE teams.game_id = $1
		AND powerups.ends_at > now()
	`

	rows, err := r.db.Query(ctx, query, gameID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var powerups []*domain.Powerup
	for rows.Next() {
		var powerup domain.Powerup
		if err := rows.Scan(
			&powerup.ID,
			&powerup.Type,
			&powerup.CasterID,
			&powerup.EndsAt,
			&powerup.CreatedAt,
		); err != nil {
			return nil, err
		}

		powerups = append(powerups, &powerup)
	}

	return powerups, nil
}

func (r *PostgresPowerupRepository) Create(ctx context.Context, powerup *domain.PowerupCreate) (*domain.Powerup, error) {
	node, err := snowflake.NewNode(domain.PowerupSnowflakeNode)
	if err != nil {
		return nil, err
	}

	id := node.Generate().String()
	query := `
		INSERT INTO powerups (id, type, caster_id, ends_at)
		VALUES ($1, $2, $3, $4)
		RETURNING id, type, caster_id, ends_at, created_at
	`

	endsAt := time.Now()
	switch powerup.Type {
	case domain.PowerupTypeHunt:
		endsAt = endsAt.Add(20 * time.Minute)
	case domain.PowerupTypeBlacklist:
		endsAt = endsAt.Add(10 * time.Minute)
	case domain.PowerupTypeFreezeHunters:
		endsAt = endsAt.Add(10 * time.Minute)
	case domain.PowerupTypeFreezeRunners:
		endsAt = endsAt.Add(5 * time.Minute)
	case domain.PowerupTypeRevealHunters:
		endsAt = endsAt.Add(20 * time.Minute)
	case domain.PowerupTypeHideTracker:
		endsAt = endsAt.Add(10 * time.Minute)
	}

	var pow domain.Powerup

	row := r.db.QueryRow(ctx, query, id, powerup.Type, powerup.CasterID, endsAt)
	if err := row.Scan(
		&pow.ID,
		&pow.Type,
		&pow.CasterID,
		&pow.EndsAt,
		&pow.CreatedAt,
	); err != nil {
		return nil, err
	}

	return &pow, nil
}
