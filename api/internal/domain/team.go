package domain

import "time"

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

func (t *Team) IsVeto() bool {
	return time.Now().Before(t.VetoPeriodEnd)
}

type TeamCreate struct {
	Name   string `json:"name"`
	Emoji  string `json:"emoji"`
	Color  string `json:"color"`
	GameID string `json:"game_id"`
}
