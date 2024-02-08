package repository

import (
	"context"
	"time"

	"github.com/bwmarrin/snowflake"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/peonii/inertia/internal/domain"
)

type TeamRepository interface {
	FindAll(ctx context.Context) ([]*domain.Team, error)
	FindOne(ctx context.Context, teamID string) (*domain.Team, error)
	FindByGameID(ctx context.Context, gameID string) ([]*domain.Team, error)
	FindByUserID(ctx context.Context, userID string) ([]*domain.Team, error)

	FindByGameUser(ctx context.Context, gameID, userID string) (*domain.Team, error)
	FindMembers(ctx context.Context, teamID string) ([]*domain.User, error)

	Create(ctx context.Context, team *domain.TeamCreate) (*domain.Team, error)
	AddTeamMember(ctx context.Context, teamID, userID string) error
	IsTeamMember(ctx context.Context, t *domain.Team, u *domain.User) (bool, error)
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

func (r *PostgresTeamRepository) FindAll(ctx context.Context) ([]*domain.Team, error) {
	query := `
		SELECT
			id, name, xp, balance, emoji, color, is_runner, veto_period_end, game_id, created_at
		FROM teams
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}

	teams := []*domain.Team{}
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

func (r *PostgresTeamRepository) FindOne(ctx context.Context, teamID string) (*domain.Team, error) {
	query := `
		SELECT
			id, name, xp, balance, emoji, color, is_runner, veto_period_end, game_id, created_at
		FROM teams
		WHERE id = $1
		`

	var team domain.Team
	if err := r.db.QueryRow(ctx, query, teamID).Scan(
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

	return &team, nil
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

	teams := []*domain.Team{}
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

	teams := []*domain.Team{}
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

func (r *PostgresTeamRepository) FindByGameUser(ctx context.Context, gameID, userID string) (*domain.Team, error) {
	query := `
		SELECT
			t.id, t.name, t.xp, t.balance, t.emoji, t.color, t.is_runner, t.veto_period_end, t.game_id, t.created_at
		FROM teams t
		INNER JOIN teams_users tm ON tm.team_id = t.id
		WHERE t.game_id = $1 AND tm.user_id = $2
	`

	var team domain.Team
	if err := r.db.QueryRow(ctx, query, gameID, userID).Scan(
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

	return &team, nil
}

func (r *PostgresTeamRepository) AddTeamMember(ctx context.Context, teamID, userID string) error {
	query := `
		INSERT INTO teams_users (team_id, user_id) VALUES ($1, $2)
	`

	_, err := r.db.Exec(ctx, query, teamID, userID)
	if err != nil {
		return err
	}

	return nil
}

func (r *PostgresTeamRepository) IsTeamMember(ctx context.Context, t *domain.Team, u *domain.User) (bool, error) {
	users, err := r.FindMembers(ctx, t.ID)
	if err != nil {
		return false, err
	}
	for _, user := range users {
		if user.ID == u.ID {
			return true, nil
		}
	}

	return false, nil
}

func (r *PostgresTeamRepository) FindMembers(ctx context.Context, teamID string) ([]*domain.User, error) {
	query := `
		SELECT
			u.id, u.discord_id, u.name, u.display_name, u.image, u.auth_level, u.created_at
		FROM users u
		INNER JOIN teams_users tm ON tm.user_id = u.id
		WHERE tm.team_id = $1
	`

	rows, err := r.db.Query(ctx, query, teamID)
	if err != nil {
		return nil, err
	}

	users := []*domain.User{}
	for rows.Next() {
		var user domain.User
		if err := rows.Scan(
			&user.ID,
			&user.DiscordID,
			&user.Name,
			&user.DisplayName,
			&user.Image,
			&user.AuthLevel,
			&user.CreatedAt,
		); err != nil {
			return nil, err
		}

		users = append(users, &user)
	}

	return users, nil
}
