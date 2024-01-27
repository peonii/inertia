package cmd

import (
	"context"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/peonii/inertia/internal/api"
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

			db, err := pgxpool.New(ctx, os.Getenv("DATABASE_URL"))
			if err != nil {
				return err
			}

			a := api.MakeAPI(ctx, db, logger)
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
