package cmd

import (
	"context"
	"os"
	"runtime"

	"github.com/adjust/rmq/v5"
	"github.com/golang-migrate/migrate/v4"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/peonii/inertia/internal/worker"
	"github.com/redis/go-redis/v9"
	"github.com/sideshow/apns2/token"
	"github.com/spf13/cobra"
	"go.uber.org/zap"
)

func WorkerCmd(ctx context.Context) *cobra.Command {
	workerCmd := &cobra.Command{
		Use: "worker",
		RunE: func(cmd *cobra.Command, args []string) error {
			logger, err := zap.NewProduction()
			if err != nil {
				return err
			}

			db, err := pgxpool.New(ctx, os.Getenv("DATABASE_URL"))
			if err != nil {
				return err
			}

			rs, err := redis.ParseURL(os.Getenv("REDIS_URL"))
			if err != nil {
				return err
			}
			rdc := redis.NewClient(rs)
			defer rdc.Close()

			errChan := make(chan error)
			queue, err := rmq.OpenConnectionWithRedisClient("inertia", rdc, errChan)
			if err != nil {
				return err
			}

			m, err := migrate.New("file://migrations", os.Getenv("DATABASE_URL"))
			if err != nil {
				return err
			}

			if err := m.Up(); err != nil {
				logger.Info("No migrations to run")
				logger.Info("Fail reason",
					zap.Error(err),
				)
			} else {
				logger.Info("Migrations ran successfully")
			}

			apnsKey, err := token.AuthKeyFromFile("apns_key.p8")
			if err != nil {
				return err
			}
			tok := token.Token{
				AuthKey: apnsKey,
				KeyID:   os.Getenv("APNS_KEY_ID"),
				TeamID:  os.Getenv("APNS_TEAM_ID"),
			}

			notifsWorker := worker.NewNotificationWorker(ctx, logger, &tok, db, queue, os.Getenv("RUNTIME_ENV") == "DEV", runtime.NumCPU()*16)
			notifsWorker.Start()

			<-ctx.Done()

			notifsWorker.Stop()

			return nil
		},
	}

	return workerCmd
}
