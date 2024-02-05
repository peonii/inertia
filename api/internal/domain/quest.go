package domain

import "time"

type QuestGroup struct {
	ID     string `json:"id"`
	GameID string `json:"game_id"`
	Count  int    `json:"count"`
}

type QuestGroupCreate struct {
	GameID string `json:"game_id"`
	Count  int    `json:"count"`
}

type Quest struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`

	Money int `json:"money"`
	XP    int `json:"xp"`

	QuestType string `json:"quest_type"`
	GroupID   string `json:"group_id"`

	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`

	GameID string `json:"game_id"`

	CreatedAt time.Time `json:"created_at"`
}

type QuestCreate struct {
	Title       string `json:"title"`
	Description string `json:"description"`

	Money int `json:"money"`
	XP    int `json:"xp"`

	QuestType string `json:"quest_type"`
	GroupID   string `json:"group_id"`

	GameID string `json:"game_id"`

	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

type ActiveQuest struct {
	ID        string    `json:"id"`
	QuestID   string    `json:"quest_id"`
	TeamID    string    `json:"team_id"`
	Complete  bool      `json:"complete"`
	CreatedAt time.Time `json:"created_at"`
}

type ActiveQuestFull struct {
	ID          string `json:"id"`
	QuestID     string `json:"quest_id"`
	Title       string `json:"title"`
	Description string `json:"description"`

	Money int `json:"money"`
	XP    int `json:"xp"`

	QuestType string `json:"quest_type"`
	GroupID   string `json:"group_id"`

	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`

	Complete bool `json:"complete"`

	GameID string `json:"game_id"`

	CreatedAt time.Time `json:"created_at"`
	StartedAt time.Time `json:"started_at"`
}

type ActiveQuestCreate struct {
	QuestID  string `json:"quest_id"`
	TeamID   string `json:"team_id"`
	Complete bool   `json:"complete"`
}
