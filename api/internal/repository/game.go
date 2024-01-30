package repository

import "github.com/peonii/inertia/internal/domain"

type GameRepository interface {
	FindAll() ([]*domain.Game, error)
	FindOne(id string) (*domain.Game, error)

	Create(game *domain.GameCreate) (*domain.Game, error)
	Update(game *domain.Game) (*domain.Game, error)
	Delete(id string) error
}
