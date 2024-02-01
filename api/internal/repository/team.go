package repository

import (
	"context"
	"time"

	"github.com/bwmarrin/snowflake"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/peonii/inertia/internal/domain"
)

type TeamRepository interface {
	FindByGameID(ctx context.Context, gameID string) ([]*domain.Team, error)
	FindByUserID(ctx context.Context, userID string) ([]*domain.Team, error)

	Create(ctx context.Context, team *domain.TeamCreate) (*domain.Team, error)
}

type PostgresTeamRepository struct {
	TeamRepository
	db *pgxpool.Pool
}

func MakePostgresTeamRepository(db *pgxpool.Pool) *PostgresTeamRepository {
	return &PostgresTeamRepository{
		db: db,
	}
}

func (r *PostgresTeamRepository) FindByGameID(ctx context.Context, gameID string) ([]*domain.Team, error) {
	query := `
		SELECT
			id, name, xp, balance, emoji, color, is_runner, veto_period_end, game_id, created_at
		FROM teams
		WHERE game_id = $1
	`

	rows, err := r.db.Query(ctx, query, gameID)
	if err != nil {
		return nil, err
	}

	var teams []*domain.Team
	for rows.Next() {
		var team domain.Team
		if err := rows.Scan(
			&team.ID,
			&team.Name,
			&team.XP,
			&team.Balance,
			&team.Emoji,
			&team.Color,
			&team.IsRunner,
			&team.VetoPeriodEnd,
			&team.GameID,
			&team.CreatedAt,
		); err != nil {
			return nil, err
		}

		teams = append(teams, &team)
	}

	return teams, nil
}

func (r *PostgresTeamRepository) FindByUserID(ctx context.Context, userID string) ([]*domain.Team, error) {
	query := `
		SELECT
			t.id, t.name, t.xp, t.balance, t.emoji, t.color, t.is_runner, t.veto_period_end, t.game_id, t.created_at
		FROM teams t
		INNER JOIN teams_users tm ON tm.team_id = t.id
		WHERE tm.user_id = $1
	`

	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}

	var teams []*domain.Team
	for rows.Next() {
		var team domain.Team
		if err := rows.Scan(
			&team.ID,
			&team.Name,
			&team.XP,
			&team.Balance,
			&team.Emoji,
			&team.Color,
			&team.IsRunner,
			&team.VetoPeriodEnd,
			&team.GameID,
			&team.CreatedAt,
		); err != nil {
			return nil, err
		}

		teams = append(teams, &team)
	}

	return teams, nil
}

func (r *PostgresTeamRepository) Create(ctx context.Context, team *domain.TeamCreate) (*domain.Team, error) {
	query := `
		INSERT INTO teams (
			id, name, xp, balance, emoji, color, is_runner, veto_period_end, game_id
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9
		) RETURNING id, name, xp, balance, emoji, color, is_runner, veto_period_end, game_id, created_at
	`

	node, err := snowflake.NewNode(domain.UserSnowflakeNode)
	if err != nil {
		return nil, err
	}

	id := node.Generate().String()

	var t domain.Team
	if err := r.db.QueryRow(
		ctx, query,
		id,
		team.Name,
		0,
		0,
		team.Emoji,
		team.Color,
		false,
		time.Now(),
		team.GameID,
	).Scan(
		&t.ID,
		&t.Name,
		&t.XP,
		&t.Balance,
		&t.Emoji,
		&t.Color,
		&t.IsRunner,
		&t.VetoPeriodEnd,
		&t.GameID,
		&t.CreatedAt,
	); err != nil {
		return nil, err
	}

	return &t, nil
}
