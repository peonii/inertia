package domain

type Notification struct {
	Title string `json:"title"`
	Body  string `json:"body"`

	DeviceID string `json:"device_id"`
	Priority int    `json:"priority"`
}
