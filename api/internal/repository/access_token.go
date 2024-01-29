package repository

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/peonii/inertia/internal/domain"
)

type AccessTokenRepository interface {
	CreateAccessToken(userID string) (string, error)
}

type JWTAccessTokenRepository struct {
	AccessTokenRepository
}

func MakeJWTAccessTokenRepository() *JWTAccessTokenRepository {
	return &JWTAccessTokenRepository{}
}

func (r *JWTAccessTokenRepository) CreateAccessToken(userID string) (string, error) {
	tok := jwt.NewWithClaims(jwt.SigningMethodHS256, domain.AccessToken{
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(domain.AccessTokenExpiryTime)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "inertia",
			Subject:   userID,
		},
	})

	// No way to safely get JWT_SECRET without
	// breaking structure so we have to
	// use a direct `os.Getenv` call here
	return tok.SignedString([]byte(os.Getenv("JWT_SECRET")))
}
