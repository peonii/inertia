package api

import (
	"context"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/peonii/inertia/internal/repository"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

// Type-safe way to access environment variables
type APIConfig struct {
	DiscordClientID     string
	DiscordClientSecret string
	DiscordRedirectURI  string
}

type api struct {
	db     *pgxpool.Pool
	rdc    *redis.Client
	logger *zap.Logger
	config *APIConfig

	userRepo repository.UserRepository

	oauthCodeRepo    repository.OAuthCodeRepository
	accessTokenRepo  repository.AccessTokenRepository
	refreshTokenRepo repository.RefreshTokenRepository
}

func MakeAPI(ctx context.Context, cfg *APIConfig, db *pgxpool.Pool, rdc *redis.Client, logger *zap.Logger) *api {
	ur := repository.MakePostgresUserRepository(db)
	ocr := repository.MakeRedisOAuthCodeRepository(rdc)
	atr := repository.MakeJWTAccessTokenRepository()
	rtr := repository.MakeRedisRefreshTokenRepository(rdc)

	return &api{
		db:     db,
		logger: logger,
		config: cfg,
		rdc:    rdc,

		userRepo:         ur,
		oauthCodeRepo:    ocr,
		accessTokenRepo:  atr,
		refreshTokenRepo: rtr,
	}
}

func (a *api) makeRouter() *chi.Mux {
	r := chi.NewRouter()

	r.Use(a.loggingMiddleware)

	r.Get("/oauth2/authorize", a.authorizeHandler)
	r.Get("/oauth2/callback", a.authorizeCallbackHandler)

	r.Route("/api/v5", func(r chi.Router) {
		r.Get("/health", a.healthHandler)

		r.Post("/oauth2/token", a.tokenCreationHandler)

		// Auth-only routes
		r.Route("/", func(r chi.Router) {
			r.Use(a.authMiddleware)

			r.Get("/users/@me", a.userMeHandler)
			r.Get("/users/{id}", a.userByIdHandler)
		})
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
