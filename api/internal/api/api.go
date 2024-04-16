package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/adjust/rmq/v5"
	"github.com/go-andiamo/chioas"
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/peonii/inertia/internal/domain"
	"github.com/peonii/inertia/internal/repository"
	"github.com/pkgz/websocket"
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

	notifsQueue rmq.Queue

	userRepo       repository.UserRepository
	accountRepo    repository.AccountRepository
	userStatsRepo  repository.UserStatsRepository
	gameRepo       repository.GameRepository
	teamRepo       repository.TeamRepository
	locationRepo   repository.LocationRepository
	gameInviteRepo repository.GameInviteRepository
	questRepo      repository.QuestRepository
	notifRepo      repository.NotificationRepository

	oauthCodeRepo    repository.OAuthCodeRepository
	accessTokenRepo  repository.AccessTokenRepository
	refreshTokenRepo repository.RefreshTokenRepository

	wsServer *websocket.Server
	wsHub    *wsHub
}

func MakeAPI(ctx context.Context, cfg *APIConfig, db *pgxpool.Pool, rdc *redis.Client, logger *zap.Logger, queue rmq.Connection) *api {
	ur := repository.MakePostgresUserRepository(db)
	ar := repository.MakePostgresAccountRepository(db)
	ocr := repository.MakeRedisOAuthCodeRepository(rdc)
	atr := repository.MakeJWTAccessTokenRepository()
	rtr := repository.MakeRedisRefreshTokenRepository(rdc)
	gr := repository.MakePostgresGameRepository(db)
	tr := repository.MakePostgresTeamRepository(db)
	lr := repository.MakePostgresLocationRepository(db, rdc)
	gir := repository.MakePostgresGameInviteRepository(db)
	qr := repository.MakePostgresQuestRepository(db)
	usr := repository.MakePostgresUserStatsRepository(db)
	nr := repository.MakePostgresNotificationRepository(db)

	wsServer := websocket.Start(ctx)

	notifsQueue, err := queue.OpenQueue("inertia-notifications")
	if err != nil {
		panic(fmt.Sprintf("failed to open notifications queue: %v", err))
	}

	return &api{
		db:          db,
		logger:      logger,
		config:      cfg,
		rdc:         rdc,
		notifsQueue: notifsQueue,

		userRepo:         ur,
		accountRepo:      ar,
		userStatsRepo:    usr,
		oauthCodeRepo:    ocr,
		accessTokenRepo:  atr,
		refreshTokenRepo: rtr,
		gameRepo:         gr,
		teamRepo:         tr,
		locationRepo:     lr,
		gameInviteRepo:   gir,
		questRepo:        qr,
		notifRepo:        nr,

		wsServer: wsServer,
		wsHub:    NewWsHub(),
	}
}

func (a *api) makeRouter(ctx context.Context) *chi.Mux {
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
										Schema: &map[string]string{
											"status": "ok",
										},
									},
								},
							},
						},
					},
					"/devices": chioas.Path{
						Tag:         "Devices",
						Middlewares: chi.Middlewares{a.authMiddleware},
						Paths: chioas.Paths{
							"/": chioas.Path{
								Methods: chioas.Methods{
									http.MethodPost: chioas.Method{
										Description: "Register a new device",
										Handler:     a.registerDeviceHandler,
										Responses: chioas.Responses{
											http.StatusOK: chioas.Response{},
										},
										Request: &chioas.Request{
											Schema: domain.DeviceCreate{},
										},
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
								Paths: chioas.Paths{
									"/games": chioas.Path{
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
									"/teams": chioas.Path{
										Methods: chioas.Methods{
											http.MethodGet: chioas.Method{
												Description: "Get your current user's teams",
												Handler:     a.joinedTeamsHandler,
												Responses: chioas.Responses{
													http.StatusOK: chioas.Response{
														Schema:  domain.Team{},
														IsArray: true,
													},
												},
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
												Schema: domain.User{},
											},
										},
									},
								},
								Paths: chioas.Paths{
									"/stats": chioas.Path{
										Methods: chioas.Methods{
											http.MethodGet: chioas.Method{
												Description: "Get a user's stats",
												Handler:     a.userStatsHandler,
												Responses: chioas.Responses{
													http.StatusOK: chioas.Response{
														Schema: domain.UserStats{},
													},
												},
											},
										},
									},
									"/placement": chioas.Path{
										Methods: chioas.Methods{
											http.MethodGet: chioas.Method{
												Description: "Get a user's placement",
												Handler:     a.leaderboardPlacementHandler,
												Responses: chioas.Responses{
													http.StatusOK: chioas.Response{
														Schema: placementResponse{},
													},
												},
											},
										},
									},
								},
							},
						},
					},
					"/leaderboard": chioas.Path{
						Tag:         "Leaderboard",
						Middlewares: chi.Middlewares{a.authMiddleware},
						Methods: chioas.Methods{
							http.MethodGet: chioas.Method{
								Description: "Get the leaderboard",
								Handler:     a.leaderboardHandler,
								Responses: chioas.Responses{
									http.StatusOK: chioas.Response{
										Schema:  domain.UserStats{},
										IsArray: true,
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
									http.MethodPost: chioas.Method{
										Description: "Create a new game",
										Handler:     a.createGameHandler,
										Responses: chioas.Responses{
											http.StatusCreated: chioas.Response{
												Schema: domain.Game{},
											},
										},
										Request: &chioas.Request{
											Schema: domain.GameCreate{},
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
									http.MethodPatch: chioas.Method{
										Description: "Update game by ID",
										Handler:     a.updateGameHandler,
										Responses: chioas.Responses{
											http.StatusOK: chioas.Response{
												Schema: domain.Game{},
											},
										},
										Request: &chioas.Request{
											Schema: domain.GameUpdate{},
										},
									},
									http.MethodDelete: chioas.Method{
										Description: "Delete game by ID",
										Handler:     a.deleteGameHandler,
										Responses: chioas.Responses{
											http.StatusOK: chioas.Response{},
										},
									},
								},
							},
							"/{id}/teams": chioas.Path{
								Methods: chioas.Methods{
									http.MethodGet: chioas.Method{
										Description: "Get teams in a game",
										Handler:     a.teamsByGameIDHandler,
										Responses: chioas.Responses{
											http.StatusOK: chioas.Response{
												Schema:  domain.Team{},
												IsArray: true,
											},
										},
									},
								},
							},
							"/{id}/purge-active": chioas.Path{
								Methods: chioas.Methods{
									http.MethodPost: chioas.Method{
										Description: "Purge all active quests in a game",
										Handler:     a.purgeActiveQuestsHandler,
										Responses: chioas.Responses{
											http.StatusOK: chioas.Response{},
										},
									},
								},
							},
							"/{id}/generate-main": chioas.Path{
								Methods: chioas.Methods{
									http.MethodPost: chioas.Method{
										Description: "Generate main quests for a game",
										Handler:     a.generateMainQuestsHandler,
										Responses: chioas.Responses{
											http.StatusOK: chioas.Response{},
										},
									},
								},
							},
						},
					},
					"/teams": chioas.Path{
						Tag:         "Teams",
						Middlewares: chi.Middlewares{a.authMiddleware},
						Paths: chioas.Paths{
							"/": chioas.Path{
								Methods: chioas.Methods{
									http.MethodPost: chioas.Method{
										Description: "Create a new team",
										Handler:     a.createTeamHandler,
										Responses: chioas.Responses{
											http.StatusCreated: chioas.Response{
												Schema: domain.Team{},
											},
										},
										Request: &chioas.Request{
											Schema: domain.TeamCreate{},
										},
									},
								},
							},
							"/{id}": chioas.Path{
								Paths: chioas.Paths{
									"/quests": chioas.Path{
										Methods: chioas.Methods{
											http.MethodGet: chioas.Method{
												Description: "Get quests in a team",
												Handler:     a.teamQuestsHandler,
												Responses: chioas.Responses{
													http.StatusOK: chioas.Response{
														Schema:  domain.Quest{},
														IsArray: true,
													},
												},
											},
										},
									},
									"/join": chioas.Path{
										Methods: chioas.Methods{
											http.MethodPost: chioas.Method{
												Description: "Join a team",
												Handler:     a.joinTeamHandler,
												Responses: chioas.Responses{
													http.StatusOK: chioas.Response{},
												},
											},
										},
									},
									"/generate-side": chioas.Path{
										Methods: chioas.Methods{
											http.MethodPost: chioas.Method{
												Description: "Generate a side quest for a team",
												Handler:     a.generateNewSideQuestHandler,
												Responses: chioas.Responses{
													http.StatusOK: chioas.Response{},
												},
											},
										},
									},
								},
								Methods: chioas.Methods{
									http.MethodGet: chioas.Method{
										Description: "Get team by ID",
										Handler:     a.teamByIDHandler,
										Responses: chioas.Responses{
											http.StatusOK: chioas.Response{
												Schema: domain.Team{},
											},
										},
									},
								},
							},
						},
					},
					"/locations": chioas.Path{
						Tag:         "Locations",
						Middlewares: chi.Middlewares{a.authMiddleware},
						Paths: chioas.Paths{
							"/": chioas.Path{
								Methods: chioas.Methods{
									http.MethodPost: chioas.Method{
										Description: "Post a new location",
										Handler:     a.updateLocationHandler,
										Responses: chioas.Responses{
											http.StatusCreated: chioas.Response{
												Schema: domain.LocationCreate{},
											},
										},
										Request: &chioas.Request{
											Schema: LocationPayload{},
										},
									},
								},
							},
						},
					},
					"/quest-groups": chioas.Path{
						Tag:         "Quest Groups",
						Middlewares: chi.Middlewares{a.authMiddleware},
						Paths: chioas.Paths{
							"/": chioas.Path{
								Methods: chioas.Methods{
									http.MethodPost: chioas.Method{
										Description: "Create a new quest group",
										Handler:     a.createQuestGroupHandler,
									},
								},
							},
						},
					},
					"/quests": chioas.Path{
						Tag:         "Quests",
						Middlewares: chi.Middlewares{a.authMiddleware},
						Paths: chioas.Paths{
							"/": chioas.Path{
								Methods: chioas.Methods{
									http.MethodPost: chioas.Method{
										Description: "Create a new quest",
										Handler:     a.createQuestHandler,
										Responses: chioas.Responses{
											http.StatusCreated: chioas.Response{
												Schema: domain.QuestCreate{},
											},
										},
										Request: &chioas.Request{
											Schema: domain.QuestCreate{},
										},
									},
								},
							},
							"/{id}": chioas.Path{
								Methods: chioas.Methods{
									http.MethodGet: chioas.Method{
										Description: "Get quest by ID",
										Handler:     a.questByIdHandler,
										Responses: chioas.Responses{
											http.StatusOK: chioas.Response{
												Schema: domain.Quest{},
											},
										},
									},
								},
								Paths: chioas.Paths{
									"/complete": chioas.Path{
										Methods: chioas.Methods{
											http.MethodPost: chioas.Method{
												Description: "Complete a quest (provide active quest ID)",
												Handler:     a.completeQuestHandler,
												Responses: chioas.Responses{
													http.StatusOK: chioas.Response{
														Schema: domain.Quest{},
													},
												},
											},
										},
									},
									"/veto": chioas.Path{
										Methods: chioas.Methods{
											http.MethodPost: chioas.Method{
												Description: "Veto a side quest (provide active quest ID)",
												Handler:     a.vetoQuestHandler,
												Responses: chioas.Responses{
													http.StatusOK: chioas.Response{
														Schema: domain.Quest{},
													},
												},
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
		r.Get("/d/callback", a.authorizeDiscordCallbackHandler)
	})

	r.HandleFunc("/ws", a.wsServer.Handler)

	a.wsServer.On("join", func(c *websocket.Conn, msg *websocket.Message) {
		p := &wsAuthPayload{}
		json.Unmarshal(msg.Data, p)

		u, err := a.getUserFromPayload(ctx, p)
		if err != nil {
			c.Send("invalid")
			return
		}

		isRunner := false
		team, err := a.teamRepo.FindByGameUser(ctx, p.GameID, u.ID)
		if err != nil {
			// This means the user is a spectator
			// and not a runner
		} else {
			isRunner = team.IsRunner
		}

		a.wsHub.Register <- &wsClient{
			conn:     c,
			user:     u,
			gameID:   p.GameID,
			isRunner: isRunner,
		}
	})

	if err := apiSpec.SetupRoutes(r, apiSpec); err != nil {
		panic(err)
	}

	return r
}

func (a *api) MakeServer(ctx context.Context, port int) *http.Server {
	root := a.makeRouter(ctx)

	return &http.Server{
		Addr:    fmt.Sprintf(":%d", port),
		Handler: root,
	}
}
