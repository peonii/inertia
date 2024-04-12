package domain

import "time"

type OAuthCode struct {
	Code      string    `json:"code"`
	CreatedAt time.Time `json:"created_at"`
	ExpiresAt time.Time `json:"expires_at"`
	UserID    string    `json:"user_id"`
}

const (
	OAuthCodeExpiryTime = time.Minute * 5
	OAuthCodeLength     = 24
)
