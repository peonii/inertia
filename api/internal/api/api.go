package api

import (
	"context"
	"fmt"
	"net/http"

	"github.com/go-andiamo/chioas"
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/peonii/inertia/internal/domain"
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
	gameRepo repository.GameRepository

	oauthCodeRepo    repository.OAuthCodeRepository
	accessTokenRepo  repository.AccessTokenRepository
	refreshTokenRepo repository.RefreshTokenRepository
}

func MakeAPI(ctx context.Context, cfg *APIConfig, db *pgxpool.Pool, rdc *redis.Client, logger *zap.Logger) *api {
	ur := repository.MakePostgresUserRepository(db)
	ocr := repository.MakeRedisOAuthCodeRepository(rdc)
	atr := repository.MakeJWTAccessTokenRepository()
	rtr := repository.MakeRedisRefreshTokenRepository(rdc)
	gr := repository.MakePostgresGameRepository(db)

	return &api{
		db:     db,
		logger: logger,
		config: cfg,
		rdc:    rdc,

		userRepo:         ur,
		oauthCodeRepo:    ocr,
		accessTokenRepo:  atr,
		refreshTokenRepo: rtr,
		gameRepo:         gr,
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
			"/api/v5": chioas.Path{
				Paths: chioas.Paths{
					"/health": chioas.Path{
						Tag: "Health",
						Methods: chioas.Methods{
							http.MethodGet: chioas.Method{
								Description: "Check if the API is online",
								Handler:     a.healthHandler,
								Responses: chioas.Responses{
									http.StatusOK: chioas.Response{
										SchemaRef: "health",
									},
								},
							},
						},
					},
					"/users": chioas.Path{
						Tag:         "Users",
						Middlewares: chi.Middlewares{a.authMiddleware},
						Paths: chioas.Paths{
							"/@me": chioas.Path{
								Methods: chioas.Methods{
									http.MethodGet: chioas.Method{
										Description: "Get your current user data",
										Handler:     a.userMeHandler,
										Responses: chioas.Responses{
											http.StatusOK: chioas.Response{
												Schema: domain.User{},
											},
										},
									},
								},
							},
							"/{id}": chioas.Path{
								Methods: chioas.Methods{
									http.MethodGet: chioas.Method{
										Description: "Get a user by their ID",
										Handler:     a.userByIdHandler,
										Responses: chioas.Responses{
											http.StatusOK: chioas.Response{
												Schema: domain.UserPublic{},
											},
										},
									},
								},
							},
						},
					},
					"/games": chioas.Path{
						Tag:         "Games",
						Middlewares: chi.Middlewares{a.authMiddleware},
						Paths: chioas.Paths{
							"/": chioas.Path{
								Methods: chioas.Methods{
									http.MethodGet: chioas.Method{
										Description: "Get all games",
										Handler:     a.allGamesHandler,
										Responses: chioas.Responses{
											http.StatusOK: chioas.Response{
												Schema:  domain.Game{},
												IsArray: true,
											},
										},
									},
								},
							},
							"/@me": chioas.Path{
								Methods: chioas.Methods{
									http.MethodGet: chioas.Method{
										Description: "Get your current user's hosted games",
										Handler:     a.hostedGamesHandler,
										Responses: chioas.Responses{
											http.StatusOK: chioas.Response{
												Schema:  domain.Game{},
												IsArray: true,
											},
										},
									},
								},
							},
							"/{id}": chioas.Path{
								Methods: chioas.Methods{
									http.MethodGet: chioas.Method{
										Description: "Get game by ID",
										Handler:     a.gameByIdHandler,
										Responses: chioas.Responses{
											http.StatusOK: chioas.Response{
												Schema: domain.Game{},
											},
										},
									},
								},
							},
						},
					},
					"/oauth2": chioas.Path{
						Tag: "OAuth2",
						Paths: chioas.Paths{
							"/token": chioas.Path{
								Methods: chioas.Methods{
									http.MethodPost: chioas.Method{
										Description: "Get new access token",
										Handler:     a.tokenCreationHandler,
										Responses: chioas.Responses{
											http.StatusOK: chioas.Response{
												Schema:      domain.AccessTokenAuthCodeResponse{},
												Description: "Authorization code grant",
												Comment:     "Refresh token grant is very similar",
											},
										},
										Request: &chioas.Request{
											Schema:  domain.AccessTokenRequest{},
											Comment: "Only provide code/refresh token adequate to the grant type",
										},
									},
								},
							},
						},
					},
				},
			},
		},
	}

	r.Use(a.loggingMiddleware)

	r.Route("/oauth2", func(r chi.Router) {
		r.Get("/authorize", a.authorizeHandler)
		r.Get("/callback", a.authorizeCallbackHandler)
	})

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
