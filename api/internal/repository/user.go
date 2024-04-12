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
			id, name, display_name, image, auth_role, created_at
		FROM users
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	users := []*domain.User{}
	for rows.Next() {
		var user domain.User
		if err := rows.Scan(
			&user.ID,
			&user.Name,
			&user.DisplayName,
			&user.Image,
			&user.AuthRole,
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
			id, name, display_name, image, auth_role, created_at
		FROM users
		WHERE id = $1
	`

	var user domain.User
	if err := r.db.QueryRow(ctx, query, id).Scan(
		&user.ID,
		&user.Name,
		&user.DisplayName,
		&user.Image,
		&user.AuthRole,
		&user.CreatedAt,
	); err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *PostgresUserRepository) Create(ctx context.Context, user *domain.UserCreate) (*domain.User, error) {
	query := `
		INSERT INTO users (id, name, display_name, image, auth_role)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, name, display_name, image, auth_role, created_at
	`

	node, err := snowflake.NewNode(domain.UserSnowflakeNode)
	if err != nil {
		return nil, err
	}

	id := node.Generate().String()

	var u domain.User
	if err := r.db.QueryRow(ctx, query,
		id,
		user.Name,
		user.DisplayName,
		user.Image,
		user.AuthRole,
	).Scan(
		&u.ID,
		&u.Name,
		&u.DisplayName,
		&u.Image,
		&u.AuthRole,
		&u.CreatedAt,
	); err != nil {
		return nil, err
	}

	return &u, nil
}

func (r *PostgresUserRepository) Update(ctx context.Context, user *domain.User) (*domain.User, error) {
	query := `
		UPDATE users
		SET name = $1, display_name = $2, image = $3, auth_role = $4
		WHERE id = $5
		RETURNING id, name, display_name, image, auth_role, created_at
	`

	var u domain.User
	if err := r.db.QueryRow(ctx, query,
		user.Name,
		user.DisplayName,
		user.Image,
		user.AuthRole,
		user.ID,
	).Scan(
		&u.ID,
		&u.Name,
		&u.DisplayName,
		&u.Image,
		&u.AuthRole,
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
