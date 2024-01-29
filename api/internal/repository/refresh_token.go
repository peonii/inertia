package repository

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"time"

	"github.com/peonii/inertia/internal/domain"
	"github.com/redis/go-redis/v9"
	"github.com/vmihailenco/msgpack/v5"
)

type RefreshTokenRepository interface {
	CreateRefreshToken(ctx context.Context, userID int64) (*domain.RefreshToken, error)
	FindRefreshTokenByToken(ctx context.Context, token string) (*domain.RefreshToken, error)
	DeleteRefreshTokenByToken(ctx context.Context, token string) error
}

type RedisRefreshTokenRepository struct {
	RefreshTokenRepository
	db *redis.Client
}

func MakeRedisRefreshTokenRepository(db *redis.Client) *RedisRefreshTokenRepository {
	return &RedisRefreshTokenRepository{
		db: db,
	}
}

func (r *RedisRefreshTokenRepository) CreateRefreshToken(ctx context.Context, userID int64) (*domain.RefreshToken, error) {
	tok := make([]byte, domain.RefreshTokenLength)
	if _, err := rand.Read(tok); err != nil {
		return nil, err
	}

	token := fmt.Sprintf("s.%s", base64.URLEncoding.EncodeToString(tok))

	s := &domain.RefreshToken{
		UserID: userID,
		Token:  token,

		CreatedAt: time.Now(),
		ExpiresAt: time.Now().Add(domain.RefreshTokenExpiryTime),
	}

	data, err := msgpack.Marshal(s)
	if err != nil {
		return nil, err
	}

	if err := r.db.Set(ctx, token, data, domain.RefreshTokenExpiryTime).Err(); err != nil {
		return nil, err
	}

	return s, nil
}

func (r *RedisRefreshTokenRepository) FindRefreshTokenByToken(ctx context.Context, token string) (*domain.RefreshToken, error) {
	data, err := r.db.Get(ctx, token).Bytes()
	if err != nil {
		return nil, err
	}

	var s domain.RefreshToken
	if err := msgpack.Unmarshal(data, &s); err != nil {
		return nil, err
	}

	return &s, nil
}

func (r *RedisRefreshTokenRepository) DeleteRefreshTokenByToken(ctx context.Context, token string) error {
	return r.db.Del(ctx, token).Err()
}
