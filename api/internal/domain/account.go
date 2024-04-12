package domain

import "time"

type Account struct {
	ID     string `json:"id"`
	UserID string `json:"user_id"`

	AccountType string `json:"account_type"`
	AccountID   string `json:"account_id"`

	Email string `json:"email"`

	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`

	CreatedAt time.Time `json:"created_at"`
}

type AccountCreate struct {
	UserID string `json:"user_id"`

	AccountType string `json:"account_type"`
	AccountID   string `json:"account_id"`

	Email string `json:"email"`

	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}
