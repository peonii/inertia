package domain

import "time"

var (
	DeviceServiceTypeFCM  = "fcm"
	DeviceServiceTypeAPNs = "apns"
)

type Device struct {
	ID     string
	UserID string

	ServiceType string
	Token       string

	ExpiresAt time.Time
	CreatedAt time.Time
}

type DeviceCreate struct {
	UserID      string `json:"user_id"`
	ServiceType string `json:"service_type"`
	Token       string `json:"token"`
}
