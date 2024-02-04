package repository

import (
	"context"

	"github.com/bwmarrin/snowflake"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/peonii/inertia/internal/domain"
)

type UserRepository interface {
	FindAll(ctx context.Context) ([]*domain.User, error)
	FindOne(ctx context.Context, id string) (*domain.User, error)

	FindByDiscordID(ctx context.Context, discordID string) (*domain.User, error)

	Create(ctx context.Context, user *domain.UserCreate) (*domain.User, error)
	Update(ctx context.Context, user *domain.User) (*domain.User, error)

	Delete(ctx context.Context, id string) error
}

type PostgresUserRepository struct {
	UserRepository
	db *pgxpool.Pool
}

func MakePostgresUserRepository(db *pgxpool.Pool) *PostgresUserRepository {
	return &PostgresUserRepository{
		db: db,
	}
}

func (r *PostgresUserRepository) FindAll(ctx context.Context) ([]*domain.User, error) {
	query := `
		SELECT
			id, discord_id, name, display_name, email, image, access_token, refresh_token, auth_level, created_at
		FROM users
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*domain.User
	for rows.Next() {
		var user domain.User
		if err := rows.Scan(
			&user.ID,
			&user.DiscordID,
			&user.Name,
			&user.DisplayName,
			&user.Email,
			&user.Image,
			&user.AccessToken,
			&user.RefreshToken,
			&user.AuthLevel,
			&user.CreatedAt,
		); err != nil {
			return nil, err
		}

		users = append(users, &user)
	}

	return users, nil
}

func (r *PostgresUserRepository) FindOne(ctx context.Context, id string) (*domain.User, error) {
	query := `
		SELECT
			id, discord_id, name, display_name, email, image, access_token, refresh_token, auth_level, created_at
		FROM users
		WHERE id = $1
	`

	var user domain.User
	if err := r.db.QueryRow(ctx, query, id).Scan(
		&user.ID,
		&user.DiscordID,
		&user.Name,
		&user.DisplayName,
		&user.Email,
		&user.Image,
		&user.AccessToken,
		&user.RefreshToken,
		&user.AuthLevel,
		&user.CreatedAt,
	); err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *PostgresUserRepository) FindByDiscordID(ctx context.Context, discordID string) (*domain.User, error) {
	query := `
		SELECT
			id, discord_id, name, display_name, email, image, access_token, refresh_token, auth_level, created_at
		FROM users
		WHERE discord_id = $1
		`

	var user domain.User
	if err := r.db.QueryRow(ctx, query, discordID).Scan(
		&user.ID,
		&user.DiscordID,
		&user.Name,
		&user.DisplayName,
		&user.Email,
		&user.Image,
		&user.AccessToken,
		&user.RefreshToken,
		&user.AuthLevel,
		&user.CreatedAt,
	); err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *PostgresUserRepository) Create(ctx context.Context, user *domain.UserCreate) (*domain.User, error) {
	query := `
		INSERT INTO users (id, discord_id, name, display_name, email, image, access_token, refresh_token, auth_level)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, discord_id, name, display_name, email, image, access_token, refresh_token, auth_level, created_at
	`

	node, err := snowflake.NewNode(domain.UserSnowflakeNode)
	if err != nil {
		return nil, err
	}

	id := node.Generate().String()

	var u domain.User
	if err := r.db.QueryRow(ctx, query,
		id,
		user.DiscordID,
		user.Name,
		user.DisplayName,
		user.Email,
		user.Image,
		user.AccessToken,
		user.RefreshToken,
		user.AuthLevel,
	).Scan(
		&u.ID,
		&u.DiscordID,
		&u.Name,
		&u.Email,
		&u.Image,
		&u.AccessToken,
		&u.RefreshToken,
		&u.AuthLevel,
		&u.CreatedAt,
	); err != nil {
		return nil, err
	}

	return &u, nil
}

func (r *PostgresUserRepository) Update(ctx context.Context, user *domain.User) (*domain.User, error) {
	query := `
		UPDATE users
		SET discord_id = $1, name = $2, display_name = $3, email = $4, image = $5, access_token = $6, refresh_token = $7, auth_level = $8
		WHERE id = $8
		RETURNING id, discord_id, name, display_name, email, image, access_token, refresh_token, auth_level, created_at
	`

	var u domain.User
	if err := r.db.QueryRow(ctx, query,
		user.DiscordID,
		user.Name,
		user.DisplayName,
		user.Email,
		user.Image,
		user.AccessToken,
		user.RefreshToken,
		user.AuthLevel,
		user.ID,
	).Scan(
		&u.ID,
		&u.DiscordID,
		&u.Name,
		&u.DisplayName,
		&u.Email,
		&u.Image,
		&u.AccessToken,
		&u.RefreshToken,
		&u.AuthLevel,
		&u.CreatedAt,
	); err != nil {
		return nil, err
	}

	return &u, nil
}

func (r *PostgresUserRepository) Delete(ctx context.Context, id string) error {
	query := `
		DELETE FROM users
		WHERE id = $1
	`

	if _, err := r.db.Exec(ctx, query, id); err != nil {
		return err
	}

	return nil
}
