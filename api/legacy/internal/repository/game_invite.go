package repository

import (
	"context"
	"crypto/rand"
	"encoding/base32"

	"github.com/bwmarrin/snowflake"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/peonii/inertia/internal/domain"
)

type GameInviteRepository interface {
	Create(ctx context.Context, gameInvite *domain.GameInviteCreate) (*domain.GameInvite, error)
	FindBySlug(ctx context.Context, slug string) (*domain.GameInvite, error)
	FindByGameID(ctx context.Context, gameID string) ([]*domain.GameInvite, error)
	DeleteBySlug(ctx context.Context, slug string) error
}

type PostgresGameInviteRepository struct {
	GameInviteRepository
	db *pgxpool.Pool
}

func MakePostgresGameInviteRepository(db *pgxpool.Pool) *PostgresGameInviteRepository {
	return &PostgresGameInviteRepository{
		db: db,
	}
}

func (r *PostgresGameInviteRepository) Create(ctx context.Context, gameInvite *domain.GameInviteCreate) (*domain.GameInvite, error) {
	query := `
		INSERT INTO game_invite (id, slug, game_id, uses)
		VALUES ($1, $2, $3, $4)
		RETURNING id, slug, game_id, uses
	`

	node, err := snowflake.NewNode(domain.GameInviteSnowflakeNode)
	if err != nil {
		return nil, err
	}

	id := node.Generate().String()
	sData := make([]byte, 12)
	if _, err := rand.Read(sData); err != nil {
		return nil, err
	}
	slug := base32.StdEncoding.EncodeToString(sData)
	row := r.db.QueryRow(ctx, query, id, slug, gameInvite.GameID, 0)

	var gi domain.GameInvite
	if err := row.Scan(&gi.ID, &gi.Slug, &gi.GameID, &gi.Uses); err != nil {
		return nil, err
	}

	return &gi, nil
}

func (r *PostgresGameInviteRepository) FindBySlug(ctx context.Context, slug string) (*domain.GameInvite, error) {
	query := `
		SELECT id, slug, game_id, uses
		FROM game_invite
		WHERE slug = $1
	`

	row := r.db.QueryRow(ctx, query, slug)

	var gi domain.GameInvite
	if err := row.Scan(&gi.ID, &gi.Slug, &gi.GameID, &gi.Uses); err != nil {
		return nil, err
	}

	return &gi, nil
}

func (r *PostgresGameInviteRepository) FindByGameID(ctx context.Context, gameID string) ([]*domain.GameInvite, error) {
	query := `
		SELECT id, slug, game_id, uses
		FROM game_invite
		WHERE game_id = $1
	`

	rows, err := r.db.Query(ctx, query, gameID)
	if err != nil {
		return nil, err
	}

	var gameInvites []*domain.GameInvite
	for rows.Next() {
		var gi domain.GameInvite
		if err := rows.Scan(&gi.ID, &gi.Slug, &gi.GameID, &gi.Uses); err != nil {
			return nil, err
		}
		gameInvites = append(gameInvites, &gi)
	}

	return gameInvites, nil
}

func (r *PostgresGameInviteRepository) DeleteBySlug(ctx context.Context, slug string) error {
	query := `
		DELETE FROM game_invite
		WHERE slug = $1
	`

	_, err := r.db.Exec(ctx, query, slug)
	return err
}
