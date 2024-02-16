package repository

import (
	"context"

	"github.com/bwmarrin/snowflake"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/peonii/inertia/internal/domain"
)

type UserStatsRepository interface {
	Get(ctx context.Context, userID string) (*domain.UserStats, error)
	GetTop(ctx context.Context, cursor int) ([]*domain.UserStats, error)
	GetPlacementOfUser(ctx context.Context, userID string) (int, error)
	Update(ctx context.Context, userID string, stats *domain.UserStats) error
	Init(ctx context.Context, userID string) error
}

type PostgresUserStatsRepository struct {
	UserStatsRepository
	db *pgxpool.Pool
}

func MakePostgresUserStatsRepository(db *pgxpool.Pool) *PostgresUserStatsRepository {
	return &PostgresUserStatsRepository{
		db: db,
	}
}

func (r *PostgresUserStatsRepository) Get(ctx context.Context, userID string) (*domain.UserStats, error) {
	query := `
	SELECT id, user_id, xp, wins, losses, draws, games, quests, created_at FROM user_stats WHERE user_id = $1
	`

	var stats domain.UserStats
	err := r.db.QueryRow(ctx, query, userID).Scan(
		&stats.ID,
		&stats.UserID,
		&stats.XP,
		&stats.Wins,
		&stats.Losses,
		&stats.Draws,
		&stats.Games,
		&stats.Quests,
		&stats.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &stats, nil
}

func (r *PostgresUserStatsRepository) GetTop(ctx context.Context, cursor int) ([]*domain.UserStats, error) {
	query := `
	SELECT id, user_id, xp, wins, losses, draws, games, quests, created_at FROM user_stats ORDER BY xp DESC LIMIT 10 OFFSET $1
	`

	rows, err := r.db.Query(ctx, query, cursor)
	if err != nil {
		return nil, err
	}

	stats := []*domain.UserStats{}
	for rows.Next() {
		var stat domain.UserStats
		if err := rows.Scan(
			&stat.ID,
			&stat.UserID,
			&stat.XP,
			&stat.Wins,
			&stat.Losses,
			&stat.Draws,
			&stat.Games,
			&stat.Quests,
			&stat.CreatedAt,
		); err != nil {
			return nil, err
		}
		stats = append(stats, &stat)
	}

	return stats, nil
}

func (r *PostgresUserStatsRepository) GetPlacementOfUser(ctx context.Context, userID string) (int, error) {
	query := `
	SELECT COUNT(*) FROM user_stats WHERE xp > (SELECT xp FROM user_stats WHERE user_id = $1)
	`

	var placement int
	err := r.db.QueryRow(ctx, query, userID).Scan(&placement)
	if err != nil {
		return 0, err
	}

	return placement + 1, nil
}

func (r *PostgresUserStatsRepository) Update(ctx context.Context, userID string, stats *domain.UserStats) error {
	query := `
	UPDATE user_stats SET xp = $1, wins = $2, losses = $3, draws = $4, games = $5, quests = $6 WHERE user_id = $7
	`

	_, err := r.db.Exec(ctx, query, stats.XP, stats.Wins, stats.Losses, stats.Draws, stats.Games, stats.Quests, userID)
	if err != nil {
		return err
	}

	return nil
}

func (r *PostgresUserStatsRepository) Init(ctx context.Context, userID string) error {
	query := `
	INSERT INTO user_stats (id, user_id) VALUES ($1, $2)
	`

	node, err := snowflake.NewNode(domain.StatsSnowflakeNode)
	if err != nil {
		return err
	}
	id := node.Generate().String()

	_, err = r.db.Exec(ctx, query, id, userID)
	if err != nil {
		return err
	}

	return nil
}
