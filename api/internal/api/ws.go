package api

import (
	"github.com/peonii/inertia/internal/domain"
	"github.com/pkgz/websocket"
)

type wsClient struct {
	conn     *websocket.Conn
	user     *domain.User
	gameID   string
	isRunner bool
}

type wsHub struct {
	Clients    map[*wsClient]bool
	Broadcast  chan wsLocationMsg
	Register   chan *wsClient
	Unregister chan *wsClient
}

type wsLocationMsg struct {
	Location domain.LocationCreate `json:"l"`
	UserID   string                `json:"u"`
	GameID   string                `json:"g"`
}

func NewWsHub() *wsHub {
	return &wsHub{
		Broadcast:  make(chan wsLocationMsg),
		Register:   make(chan *wsClient),
		Unregister: make(chan *wsClient),
		Clients:    make(map[*wsClient]bool),
	}
}

func (h *wsHub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.Clients[client] = true
		case client := <-h.Unregister:
			if _, ok := h.Clients[client]; ok {
				client.conn.Close()
				delete(h.Clients, client)
			}
		case message := <-h.Broadcast:
			for client := range h.Clients {
				if client.gameID != message.GameID {
					continue
				}
				if client.isRunner {
					continue // only hunters/spectators should receive location updates
				}
				if client.user.ID == message.UserID {
					continue // don't send location updates to the user that sent it
				}

				client.conn.Send(message)
			}
		}
	}
}
