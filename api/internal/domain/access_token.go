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

type AccessTokenAuthCodeResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
	TokenType    string `json:"token_type"`
}

type AccessTokenRefreshResponse struct {
	AccessToken string `json:"access_token"`
	ExpiresIn   int64  `json:"expires_in"`
	TokenType   string `json:"token_type"`
}

type AccessTokenRequest struct {
	GrantType    string `json:"grant_type"`
	Code         string `json:"code"`
	RefreshToken string `json:"refresh_token"`
}
