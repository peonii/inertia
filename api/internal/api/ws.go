package api

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/peonii/inertia/internal/domain"
	"github.com/peonii/inertia/internal/repository"
	"github.com/pkgz/websocket"
	"go.uber.org/zap"
)

type wsClient struct {
	conn     *websocket.Conn
	user     *domain.User
	gameID   string
	isRunner bool
}

type wsHub struct {
	Clients      map[*wsClient]bool
	BroadcastLoc chan wsLocationMsg
	BroadcastPwp chan wsPowerupMsg
	BroadcastCat chan wsCatchMsg
	Register     chan *wsClient
	Unregister   chan *wsClient

	logger      *zap.Logger
	powerupRepo repository.PowerupRepository
	teamRepo    repository.TeamRepository
	userRepo    repository.UserRepository
}

type wsMsg struct {
	Type string      `json:"typ"`
	Data interface{} `json:"dat"`
}

type wsLocationMsg struct {
	Location domain.LocationCreate `json:"loc"`
	UserID   string                `json:"uid"`
	GameID   string                `json:"gid"`
}

type wsLocationPayload struct {
	Location domain.LocationCreate `json:"loc"`
	Team     *domain.Team          `json:"team"`
	User     *domain.User          `json:"user"`
}

type wsPowerupMsg struct {
	Powerup *domain.Powerup `json:"pwp"`
}

type wsPowerupPayload struct {
	Powerup *domain.Powerup `json:"pwp"`
	Caster  *domain.Team    `json:"cas"`
}

type wsCatchMsg struct {
	NewRunnerID string `json:"nrid"`
}

type wsCatchPayload struct {
	NewRunner *domain.Team `json:"nrt"`
}

func NewWsHub(logger *zap.Logger, db *pgxpool.Pool) *wsHub {
	return &wsHub{
		BroadcastLoc: make(chan wsLocationMsg),
		BroadcastPwp: make(chan wsPowerupMsg),
		BroadcastCat: make(chan wsCatchMsg),
		Register:     make(chan *wsClient),
		Unregister:   make(chan *wsClient),
		Clients:      make(map[*wsClient]bool),

		logger:      logger,
		powerupRepo: repository.MakePostgresPowerupRepository(db),
		teamRepo:    repository.MakePostgresTeamRepository(db),
		userRepo:    repository.MakePostgresUserRepository(db),
	}
}

func (h *wsHub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.logger.Info("registering client", zap.Any("client", client))
			h.Clients[client] = true
		case client := <-h.Unregister:
			h.logger.Info("unregistering client", zap.Any("client", client))
			if _, ok := h.Clients[client]; ok {
				client.conn.Close()
				delete(h.Clients, client)
			}
		case message := <-h.BroadcastLoc:
			h.logger.Info("broadcasting location", zap.Any("message", message))
			var powerupsByGameID map[string][]*domain.Powerup

			sender, err := h.userRepo.FindOne(context.Background(), message.UserID)
			if err != nil {
				h.logger.Error("failed to find user", zap.Error(err))
				return
			}

			senderTeam, err := h.teamRepo.FindByGameUser(context.Background(), message.GameID, message.UserID)
			if err != nil {
				h.logger.Error("failed to find team", zap.Error(err))
				return
			}

			for client := range h.Clients {
				h.logger.Info("sending to client", zap.Any("client", client))
				if client.gameID != message.GameID {
					continue
				}

				if client.user.ID == message.UserID {
					continue // don't send location updates to the user that sent it
				}

				if powerupsByGameID == nil {
					powerupsByGameID = make(map[string][]*domain.Powerup)
					powerups, _ := h.powerupRepo.GetByGameID(context.Background(), message.GameID)
					for _, powerup := range powerups {
						powerupsByGameID[client.gameID] = append(powerupsByGameID[client.gameID], powerup)
					}
				}

				powerups := powerupsByGameID[client.gameID]
				team, err := h.teamRepo.FindByGameUser(context.Background(), client.gameID, client.user.ID)
				if err != nil {
					h.logger.Error("failed to find team", zap.Error(err))
					continue
				}

				override := false
				neverShow := false

				for _, powerup := range powerups {
					if powerup.CasterID == team.ID {
						if powerup.Type == domain.PowerupTypeRevealHunters {
							override = true
						}
					} else if powerup.CasterID == senderTeam.ID {
						if powerup.Type == domain.PowerupTypeHideTracker {
							neverShow = true
						}
					}
				}

				if neverShow {
					continue
				}

				if client.isRunner && !override {
					continue // only hunters/spectators should receive location updates
				}

				payload := wsLocationPayload{
					Location: message.Location,
					User:     sender,
					Team:     senderTeam,
				}

				h.logger.Info("sending payload",
					zap.Any("payload", payload),
				)

				client.conn.Send(wsMsg{
					Type: "loc",
					Data: payload,
				})
			}
		case message := <-h.BroadcastPwp:
			h.logger.Info("broadcasting powerup", zap.Any("message", message))

			caster, err := h.teamRepo.FindOne(context.Background(), message.Powerup.CasterID)
			if err != nil {
				h.logger.Error("failed to find team", zap.Error(err))
				return
			}

			for client := range h.Clients {
				h.logger.Info("sending to client", zap.Any("client", client))
				if client.gameID != caster.GameID {
					continue
				}

				payload := wsPowerupPayload{
					Powerup: message.Powerup,
					Caster:  caster,
				}

				h.logger.Info("sending payload",
					zap.Any("payload", payload),
				)

				client.conn.Send(wsMsg{
					Type: "pwp",
					Data: payload,
				})
			}
		case message := <-h.BroadcastCat:
			h.logger.Info("broadcasting catch", zap.Any("message", message))

			newRunner, err := h.teamRepo.FindOne(context.Background(), message.NewRunnerID)
			if err != nil {
				h.logger.Error("failed to find team", zap.Error(err))
				return
			}

			for client := range h.Clients {
				h.logger.Info("sending to client", zap.Any("client", client))
				if client.gameID != newRunner.GameID {
					continue
				}

				payload := wsCatchPayload{
					NewRunner: newRunner,
				}

				h.logger.Info("sending payload",
					zap.Any("payload", payload),
				)

				client.conn.Send(wsMsg{
					Type: "cat",
					Data: payload,
				})
			}
		}
	}
}
