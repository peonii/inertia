package domain

import "time"

const (
	UserAuthLevelBasic = 0
	UserAuthLevelAdmin = 99
)

type User struct {
	ID string `json:"id"`

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

type UserPublic struct {
	ID string `json:"id"`

	DiscordID string `json:"discord_id"`
	Name      string `json:"name"`
	Image     string `json:"image"`

	AuthLevel int64     `json:"auth_level"`
	CreatedAt time.Time `json:"created_at"`
}

func (u *User) ToPublic() *UserPublic {
	return &UserPublic{
		ID:        u.ID,
		DiscordID: u.DiscordID,
		Name:      u.Name,
		Image:     u.Image,
		AuthLevel: u.AuthLevel,
		CreatedAt: u.CreatedAt,
	}
}
