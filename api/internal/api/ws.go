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
	Register     chan *wsClient
	Unregister   chan *wsClient

	logger      *zap.Logger
	powerupRepo repository.PowerupRepository
	teamRepo    repository.TeamRepository
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

func NewWsHub(logger *zap.Logger, db *pgxpool.Pool) *wsHub {
	return &wsHub{
		BroadcastLoc: make(chan wsLocationMsg),
		Register:     make(chan *wsClient),
		Unregister:   make(chan *wsClient),
		Clients:      make(map[*wsClient]bool),

		logger:      logger,
		powerupRepo: repository.MakePostgresPowerupRepository(db),
		teamRepo:    repository.MakePostgresTeamRepository(db),
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

				for _, powerup := range powerups {
					if powerup.CasterID == team.ID {

					}
				}

				if client.isRunner {
					continue // only hunters/spectators should receive location updates
				}

				client.conn.Send(wsMsg{
					Type: "loc",
					Data: message,
				})
			}
		}
	}
}
