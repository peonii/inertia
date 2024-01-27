package api

import (
	"context"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/peonii/inertia/internal/repository"
	"go.uber.org/zap"
)

type api struct {
	db     *pgxpool.Pool
	logger *zap.Logger

	userRepo repository.UserRepository
}

func MakeAPI(ctx context.Context, db *pgxpool.Pool, logger *zap.Logger) *api {
	ur := repository.MakePostgresUserRepository(db)

	return &api{
		db:     db,
		logger: logger,

		userRepo: ur,
	}
}

func (a *api) makeRouter() *chi.Mux {
	r := chi.NewRouter()

	r.Route("/api/v5", func(r chi.Router) {
		r.Get("/health", a.healthHandler)
	})

	return r
}

func (a *api) MakeServer(port int) *http.Server {
	root := a.makeRouter()

	return &http.Server{
		Addr:    fmt.Sprintf(":%d", port),
		Handler: root,
	}
}
