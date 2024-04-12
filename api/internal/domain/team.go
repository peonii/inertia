package domain

import (
	"time"
)

type Team struct {
	ID   string `json:"id"`
	Name string `json:"name"`

	XP      int `json:"xp"`
	Balance int `json:"balance"`

	Emoji string `json:"emoji"`
	Color string `json:"color"`

	IsRunner bool `json:"is_runner"`

	VetoPeriodEnd time.Time `json:"veto_period_end"`

	GameID    string    `json:"game_id"`
	CreatedAt time.Time `json:"created_at"`
}

type TeamMember struct {
	TeamID string `json:"team_id"`
	UserID string `json:"user_id"`
}

func (t *Team) IsVeto() bool {
	return time.Now().Before(t.VetoPeriodEnd)
}

type TeamCreate struct {
	Name       string `json:"name"`
	Emoji      string `json:"emoji"`
	Color      string `json:"color"`
	GameInvite string `json:"game_invite"`
	GameID     string `json:"-"`
}

type TeamUpdate struct {
	Name          *string    `json:"name"`
	Emoji         *string    `json:"emoji"`
	Color         *string    `json:"color"`
	Balance       *int       `json:"-"`
	XP            *int       `json:"-"`
	VetoPeriodEnd *time.Time `json:"-"`
}
