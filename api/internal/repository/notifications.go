package repository

import (
	"context"
	"time"

	"github.com/bwmarrin/snowflake"
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

	// GetLiveActivity(ctx context.Context, id string) (*domain.LiveActivity, error)
	// GetLiveActivitiesForUsers(ctx context.Context, userIDs []string) ([]*domain.LiveActivity, error)
	// GetLiveActivitiesForUser(ctx context.Context, userID string) ([]*domain.LiveActivity, error)
	// CreateLiveActivity(ctx context.Context, liveActivity *domain.LiveActivityCreate) (*domain.LiveActivity, error)
	// PurgeStaleLiveActivities(ctx context.Context) error
	// DeleteLiveActivity(ctx context.Context, id string) error
}

type PostgresNotificationRepository struct {
	db *pgxpool.Pool
}

func MakePostgresNotificationRepository(db *pgxpool.Pool) *PostgresNotificationRepository {
	return &PostgresNotificationRepository{
		db: db,
	}
}

func (r *PostgresNotificationRepository) GetDevice(ctx context.Context, id string) (*domain.Device, error) {
	query := `
		SELECT
			id, user_id, service_type, token, expires_at, created_at
		FROM devices
		WHERE id = $1
	`

	var device domain.Device
	if err := r.db.QueryRow(ctx, query, id).Scan(
		&device.ID,
		&device.UserID,
		&device.ServiceType,
		&device.Token,
		&device.ExpiresAt,
		&device.CreatedAt,
	); err != nil {
		return nil, err
	}

	return &device, nil
}

func (r *PostgresNotificationRepository) GetDevicesForUsers(ctx context.Context, userIDs []string) ([]*domain.Device, error) {
	query := `
		SELECT
			id, user_id, service_type, token, expires_at, created_at
		FROM devices
		WHERE user_id = ANY($1)
	`

	rows, err := r.db.Query(ctx, query, userIDs)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var devices []*domain.Device
	for rows.Next() {
		var device domain.Device
		if err := rows.Scan(
			&device.ID,
			&device.UserID,
			&device.ServiceType,
			&device.Token,
			&device.ExpiresAt,
			&device.CreatedAt,
		); err != nil {
			return nil, err
		}

		devices = append(devices, &device)
	}

	return devices, nil
}

func (r *PostgresNotificationRepository) GetDevicesForUser(ctx context.Context, userID string) ([]*domain.Device, error) {
	query := `
		SELECT
			id, user_id, service_type, token, expires_at, created_at
		FROM devices
		WHERE user_id = $1
	`

	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var devices []*domain.Device
	for rows.Next() {
		var device domain.Device
		if err := rows.Scan(
			&device.ID,
			&device.UserID,
			&device.ServiceType,
			&device.Token,
			&device.ExpiresAt,
			&device.CreatedAt,
		); err != nil {
			return nil, err
		}

		devices = append(devices, &device)
	}

	return devices, nil
}

func (r *PostgresNotificationRepository) CreateDevice(ctx context.Context, device *domain.DeviceCreate) (*domain.Device, error) {
	node, err := snowflake.NewNode(domain.DeviceSnowflakeNode)
	if err != nil {
		return nil, err
	}

	id := node.Generate().String()

	query := `
		INSERT INTO devices (id, user_id, service_type, token, expires_at)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, user_id, service_type, token, expires_at, created_at
	`

	var createdDevice domain.Device
	if err := r.db.QueryRow(ctx, query, id, device.UserID, device.ServiceType, device.Token, time.Now().Add(7*24*time.Hour)).Scan(
		&createdDevice.ID,
		&createdDevice.UserID,
		&createdDevice.ServiceType,
		&createdDevice.Token,
		&createdDevice.ExpiresAt,
		&createdDevice.CreatedAt,
	); err != nil {
		return nil, err
	}

	return &createdDevice, nil
}

func (r *PostgresNotificationRepository) PurgeStaleDevices(ctx context.Context) error {
	query := `
		DELETE FROM devices
		WHERE expires_at < $1
	`

	_, err := r.db.Exec(ctx, query, time.Now())
	return err
}

func (r *PostgresNotificationRepository) DeleteDevice(ctx context.Context, id string) error {
	query := `
		DELETE FROM devices
		WHERE id = $1
	`

	_, err := r.db.Exec(ctx, query, id)
	return err
}
