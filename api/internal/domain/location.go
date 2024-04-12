package domain

import "time"

type Location struct {
	ID string `json:"id"`

	Lat       float64 `json:"lat"`
	Lng       float64 `json:"lng"`
	Alt       float64 `json:"alt"`
	Precision float64 `json:"precision"`
	Heading   float64 `json:"heading"`
	Speed     float64 `json:"speed"`

	UserID string `json:"user_id"`

	CreatedAt time.Time `json:"created_at"`
}

type LocationCreate struct {
	Lat       float64 `json:"lat"`
	Lng       float64 `json:"lng"`
	Alt       float64 `json:"alt"`
	Precision float64 `json:"precision"`
	Heading   float64 `json:"heading"`
	Speed     float64 `json:"speed"`

	UserID string `json:"user_id"`
}
