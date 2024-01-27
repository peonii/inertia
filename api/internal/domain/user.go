package domain

import "time"

const (
	UserAuthLevelBasic = 0
	UserAuthLevelAdmin = 99
)

type User struct {
	ID int64 `json:"id"`

	DiscordID string `json:"discord_id"`
	Name      string `json:"name"`
	Image     string `json:"image"`
	Email     string `json:"email"`

	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`

	AuthLevel int64     `json:"auth_level"`
	CreatedAt time.Time `json:"created_at"`
}

type UserCreate struct {
	DiscordID string `json:"discord_id"`
	Name      string `json:"name"`
	Image     string `json:"image"`
	Email     string `json:"email"`

	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`

	AuthLevel int64 `json:"auth_level"`
}
