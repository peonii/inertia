package repository

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"time"

	"github.com/peonii/inertia/internal/domain"
	"github.com/redis/go-redis/v9"
	"github.com/vmihailenco/msgpack/v5"
)

type SessionRepository interface {
	CreateSession(ctx context.Context, userID int64) (*domain.Session, error)
	FindSessionByToken(ctx context.Context, token string) (*domain.Session, error)
	DeleteSessionByToken(ctx context.Context, token string) error
}

type RedisSessionRepository struct {
	SessionRepository
	db *redis.Client
}

func MakeRedisSessionRepository(db *redis.Client) *RedisSessionRepository {
	return &RedisSessionRepository{
		db: db,
	}
}

func (r *RedisSessionRepository) CreateSession(ctx context.Context, userID int64) (*domain.Session, error) {
	tok := make([]byte, 32)
	if _, err := rand.Read(tok); err != nil {
		return nil, err
	}

	token := base64.URLEncoding.EncodeToString(tok)

	s := &domain.Session{
		UserID: userID,
		Token:  token,

		CreatedAt: time.Now(),
		ExpiresAt: time.Now().Add(time.Hour * 24 * 30),
	}

	data, err := msgpack.Marshal(s)
	if err != nil {
		return nil, err
	}

	if err := r.db.Set(ctx, token, data, time.Hour*24*30).Err(); err != nil {
		return nil, err
	}

	return s, nil
}
