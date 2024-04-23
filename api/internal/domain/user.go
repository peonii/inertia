package domain

import (
	"time"
)

const (
	UserAuthRoleBasic = "user"
	UserAuthRoleAdmin = "admin"
)

type User struct {
	ID string `json:"id"`

	Name        string `json:"name"`
	DisplayName string `json:"display_name"`
	Image       string `json:"image"`

	AuthRole  string    `json:"auth_role"`
	CreatedAt time.Time `json:"created_at"`
}

type UserCreate struct {
	Name        string `json:"name"`
	DisplayName string `json:"display_name"`
	Image       string `json:"image"`

	AuthRole string `json:"auth_role"`
}
