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

type OAuthCodeRepository interface {
	CreateOAuthCode(ctx context.Context, userID int64) (*domain.OAuthCode, error)
	FindOAuthCodeByToken(ctx context.Context, token string) (*domain.OAuthCode, error)
	DeleteOAuthCodeByToken(ctx context.Context, token string) error
}

type RedisOAuthCodeRepository struct {
	OAuthCodeRepository
	db *redis.Client
}

func MakeRedisOAuthCodeRepository(db *redis.Client) *RedisOAuthCodeRepository {
	return &RedisOAuthCodeRepository{
		db: db,
	}
}

func (r *RedisOAuthCodeRepository) CreateOAuthCode(ctx context.Context, userID int64) (*domain.OAuthCode, error) {
	tok := make([]byte, domain.OAuthCodeLength)
	if _, err := rand.Read(tok); err != nil {
		return nil, err
	}

	token := fmt.Sprintf("c.%s", base64.URLEncoding.EncodeToString(tok))

	s := &domain.OAuthCode{
		UserID: userID,
		Code:   token,

		CreatedAt: time.Now(),
		ExpiresAt: time.Now().Add(domain.OAuthCodeExpiryTime),
	}

	data, err := msgpack.Marshal(s)
	if err != nil {
		return nil, err
	}

	if err := r.db.Set(ctx, token, data, domain.OAuthCodeExpiryTime).Err(); err != nil {
		return nil, err
	}

	return s, nil
}

func (r *RedisOAuthCodeRepository) FindOAuthCodeByToken(ctx context.Context, token string) (*domain.OAuthCode, error) {
	data, err := r.db.Get(ctx, token).Bytes()
	if err != nil {
		return nil, err
	}

	var s domain.OAuthCode
	if err := msgpack.Unmarshal(data, &s); err != nil {
		return nil, err
	}

	return &s, nil
}

func (r *RedisOAuthCodeRepository) DeleteOAuthCodeByToken(ctx context.Context, token string) error {
	return r.db.Del(ctx, token).Err()
}
