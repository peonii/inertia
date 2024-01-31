package domain

import "time"

type Game struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Official bool   `json:"official"`

	HostID string `json:"host_id"`

	CreatedAt time.Time `json:"created_at"`
}

type GameCreate struct {
	Name     string `json:"name"`
	Official bool   `json:"official"`
	HostID   string `json:"host_id"`
}
