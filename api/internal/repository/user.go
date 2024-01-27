package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/peonii/inertia/internal/domain"
)

type UserRepository interface {
	FindAll(ctx context.Context) ([]*domain.User, error)
	FindOne(ctx context.Context, id int64) (*domain.User, error)

	Create(ctx context.Context, user *domain.UserCreate) (*domain.User, error)
	Update(ctx context.Context, user *domain.User) (*domain.User, error)

	Delete(ctx context.Context, id int64) error
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
