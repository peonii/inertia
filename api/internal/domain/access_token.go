package domain

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type AccessToken struct {
	jwt.RegisteredClaims
}

const (
	AccessTokenExpiryTime = time.Hour * 24
	AccessTokenLength     = 64
)
