package domain

import "time"

type UserStats struct {
	ID     string `json:"id"`
	UserID string `json:"user_id"`

	XP          int64 `json:"xp"`
	Wins        int64 `json:"wins"`
	Losses      int64 `json:"losses"`
	Draws       int64 `json:"draws"`
	Games       int64 `json:"games"`
	Quests      int64 `json:"quests"`
	Events      int64 `json:"events"`
	Powerups    int64 `json:"powerups"`
	Catches     int64 `json:"catches"`
	TimesCaught int64 `json:"times_caught"`

	CreatedAt time.Time `json:"created_at"`
}
