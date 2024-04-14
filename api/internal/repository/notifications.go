package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/peonii/inertia/internal/domain"
)

type NotificationRepository interface {
	GetDevice(ctx context.Context, id string) (*domain.Device, error)
	GetDevicesForUsers(ctx context.Context, userIDs []string) ([]*domain.Device, error)
	GetDevicesForUser(ctx context.Context, userID string) ([]*domain.Device, error)
	CreateDevice(ctx context.Context, device *domain.DeviceCreate) (*domain.Device, error)
	PurgeStaleDevices(ctx context.Context) error
	DeleteDevice(ctx context.Context, id string) error

	GetLiveActivity(ctx context.Context, id string) (*domain.LiveActivity, error)
	GetLiveActivitiesForUsers(ctx context.Context, userIDs []string) ([]*domain.LiveActivity, error)
	GetLiveActivitiesForUser(ctx context.Context, userID string) ([]*domain.LiveActivity, error)
	CreateLiveActivity(ctx context.Context, liveActivity *domain.LiveActivityCreate) (*domain.LiveActivity, error)
	PurgeStaleLiveActivities(ctx context.Context) error
	DeleteLiveActivity(ctx context.Context, id string) error
}

type PostgresNotificationRepository struct {
	db *pgxpool.Pool
}

func MakePostgresNotificationRepository(db *pgxpool.Pool) *PostgresNotificationRepository {
	return &PostgresNotificationRepository{
		db: db,
	}
}
