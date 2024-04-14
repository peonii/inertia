package domain

import "time"

type LiveActivity struct {
	ID     string
	UserID string

	Token            string
	LiveActivityType string

	TeamID string

	ExpiresAt time.Time
	CreatedAt time.Time
}

type LiveActivityCreate struct {
	UserID           string `json:"user_id"`
	Token            string `json:"token"`
	LiveActivityType string `json:"live_activity_type"`
	TeamID           string `json:"team_id"`
}
