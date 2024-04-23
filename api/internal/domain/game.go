package domain

import "time"

type Game struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Official bool   `json:"official"`

	HostID string `json:"host_id"`

	TimeStart time.Time `json:"time_start"`
	TimeEnd   time.Time `json:"time_end"`
	LocLat    float64   `json:"loc_lat"`
	LocLng    float64   `json:"loc_lng"`

	CreatedAt time.Time `json:"created_at"`
}

type GameCreate struct {
	Name   string `json:"name"`
	HostID string `json:"host_id"`

	TimeStart time.Time `json:"time_start"`
	TimeEnd   time.Time `json:"time_end"`
	LocLat    float64   `json:"loc_lat"`
	LocLng    float64   `json:"loc_lng"`
}

type GameUpdate struct {
	Name *string `json:"name"`

	TimeStart *time.Time `json:"time_start"`
	TimeEnd   *time.Time `json:"time_end"`
	LocLat    *float64   `json:"loc_lat"`
	LocLng    *float64   `json:"loc_lng"`
}

func (g *Game) CanEdit(u *User) bool {
	if u.AuthRole == UserAuthRoleAdmin {
		return true
	}

	return g.HostID == u.ID
}
