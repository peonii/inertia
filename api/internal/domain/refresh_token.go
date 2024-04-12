package domain

import "time"

type RefreshToken struct {
	Token     string    `json:"token"`
	CreatedAt time.Time `json:"created_at"`
	ExpiresAt time.Time `json:"expires_at"`
	UserID    string    `json:"user_id"`
}

const (
	RefreshTokenExpiryTime = time.Hour * 24 * 365
	RefreshTokenLength     = 128
)
