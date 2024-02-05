package domain

type GameInvite struct {
	ID     string `json:"id"`
	GameID string `json:"game_id"`
	Slug   string `json:"code"`
	Uses   int    `json:"uses"`
}

type GameInviteCreate struct {
	GameID string `json:"game_id"`
}
