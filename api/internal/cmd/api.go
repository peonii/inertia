package cmd

import (
	"context"
	"os"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres" // required for postgres
	_ "github.com/golang-migrate/migrate/v4/source/file"       // required for file://
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/peonii/inertia/internal/api"
	"github.com/redis/go-redis/v9"
	"github.com/spf13/cobra"
	"go.uber.org/zap"
)

func APICmd(ctx context.Context) *cobra.Command {
	apiCmd := &cobra.Command{
		Use: "api",
		RunE: func(cmd *cobra.Command, args []string) error {
			logger, err := zap.NewProduction()
			if err != nil {
				return err
			}

			cfg := &api.APIConfig{
				DiscordClientID:     os.Getenv("DISCORD_CLIENT_ID"),
				DiscordClientSecret: os.Getenv("DISCORD_CLIENT_SECRET"),
				DiscordRedirectURI:  os.Getenv("DISCORD_REDIRECT_URI"),
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

			m, err := migrate.New("file://migrations", os.Getenv("DATABASE_URL"))
			if err != nil {
				return err
			}

			if err := m.Up(); err != nil {
				logger.Info("No migrations to run")
			} else {
				logger.Info("Migrations ran successfully")
			}

			a := api.MakeAPI(ctx, cfg, db, rdc, logger)
			srv := a.MakeServer(3001)

			go func() { _ = srv.ListenAndServe() }()

			logger.Info("Started HTTP server")

			<-ctx.Done()

			logger.Info("Shutting down HTTP server")

			srv.Shutdown(ctx)
			logger.Sync()

			return nil
		},
	}

	return apiCmd
}
