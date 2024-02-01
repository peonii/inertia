package repository

import (
	"context"

	"github.com/bwmarrin/snowflake"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/peonii/inertia/internal/domain"
	"github.com/redis/go-redis/v9"
	"github.com/vmihailenco/msgpack/v5"
)

type LocationRepository interface {
	Store(ctx context.Context, location *domain.Location) error
	GetUserLatest(ctx context.Context, userID string) (*domain.Location, error)
}

type PostgresLocationRepository struct {
	LocationRepository

	db  *pgxpool.Pool
	rdc *redis.Client
}

func MakePostgresLocationRepository(db *pgxpool.Pool, rdc *redis.Client) *PostgresLocationRepository {
	return &PostgresLocationRepository{
		db:  db,
		rdc: rdc,
	}
}

func (r *PostgresLocationRepository) Store(ctx context.Context, location *domain.Location) error {
	node, err := snowflake.NewNode(domain.LocationSnowflakeNode)
	if err != nil {
		return err
	}

	location.ID = node.Generate().String()

	key := "loc." + location.UserID
	enc, err := msgpack.Marshal(location)
	if err != nil {
		return nil
	}

	if err := r.rdc.Set(ctx, key, enc, 0).Err(); err != nil {
		return err
	}

	// Also save the location in Postgres
	go func() {
		query := `
			INSERT INTO locations (id, lat, lng, alt, precision, user_id, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
		`

		_, err := r.db.Exec(ctx, query,
			location.ID,
			location.Lat,
			location.Lng,
			location.Alt,
			location.Precision,
			location.UserID,
			location.CreatedAt,
		)
		if err != nil {
			// We can fail silently here, since all this does is impact the
			// location history of the user.
		}
	}()

	return nil
}

func (r *PostgresLocationRepository) GetUserLatest(ctx context.Context, userID string) (*domain.Location, error) {
	key := "loc." + userID

	enc, err := r.rdc.Get(ctx, key).Bytes()
	if err != nil {
		return nil, err
	}

	var location domain.Location
	if err := msgpack.Unmarshal(enc, &location); err != nil {
		return nil, err
	}

	return &location, nil
}
