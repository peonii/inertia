package api

import (
	"context"
	"fmt"
	"net/http"

	"github.com/go-andiamo/chioas"
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

	apiSpec := chioas.Definition{
		AutoHeadMethods: true,
		DocOptions: chioas.DocOptions{
			ServeDocs:       true,
			HideHeadMethods: true,
			Title:           "Inertia 5 API",
		},
		Paths: chioas.Paths{
			"/api/v5": {
				Paths: chioas.Paths{
					"/health": {
						Tag: "Health",
						Methods: chioas.Methods{
							http.MethodGet: {
								Description: "Check if the API is online",
								Handler:     a.healthHandler,
								Responses: chioas.Responses{
									http.StatusOK: {
										SchemaRef: "health",
									},
								},
							},
						},
					},
					"/users": {
						Tag: "Users",
						Paths: chioas.Paths{
							"/@me": {
								Methods: chioas.Methods{
									http.MethodGet: {
										Description: "Get your current user data",
										Handler:     a.userMeHandler,
										Responses: chioas.Responses{
											http.StatusOK: {
												SchemaRef: "user_full",
											},
										},
									},
								},
							},
							"/{id}": {
								Methods: chioas.Methods{
									http.MethodGet: {
										Description: "Get a user by their ID",
										Handler:     a.userByIdHandler,
										Responses: chioas.Responses{
											http.StatusOK: {
												SchemaRef: "user",
											},
										},
									},
								},
							},
						},
					},
				},
			},
		},
		Components: &chioas.Components{
			Schemas: chioas.Schemas{
				{
					Name:               "health",
					RequiredProperties: []string{"status"},
					Properties: chioas.Properties{
						{
							Name: "status",
							Type: "string",
						},
					},
				},
				{
					Name:               "user_full",
					RequiredProperties: []string{"id", "discord_id", "name", "email", "image", "access_token", "refresh_token", "auth_level", "created_at"},
					Properties: chioas.Properties{
						{
							Name: "id",
							Type: "string",
						},
						{
							Name: "discord_id",
							Type: "string",
						},
						{
							Name: "name",
							Type: "string",
						},
						{
							Name: "email",
							Type: "string",
						},
						{
							Name: "image",
							Type: "string",
						},
						{
							Name: "access_token",
							Type: "string",
						},
						{
							Name: "refresh_token",
							Type: "string",
						},
						{
							Name: "auth_level",
							Type: "integer",
						},
						{
							Name: "created_at",
							Type: "string",
						},
					},
				},
				{
					Name:               "user",
					RequiredProperties: []string{"id", "discord_id", "name", "image", "auth_level", "created_at"},
					Properties: chioas.Properties{
						{
							Name: "id",
							Type: "string",
						},
						{
							Name: "discord_id",
							Type: "string",
						},
						{
							Name: "name",
							Type: "string",
						},
						{
							Name: "image",
							Type: "string",
						},
						{
							Name: "auth_level",
							Type: "integer",
						},
						{
							Name: "created_at",
							Type: "string",
						},
					},
				},
			},
		},
	}

	r.Use(a.loggingMiddleware)

	if err := apiSpec.SetupRoutes(r, apiSpec); err != nil {
		panic(err)
	}

	return r
}

func (a *api) MakeServer(port int) *http.Server {
	root := a.makeRouter()

	return &http.Server{
		Addr:    fmt.Sprintf(":%d", port),
		Handler: root,
	}
}
