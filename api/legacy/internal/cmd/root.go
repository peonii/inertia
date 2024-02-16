package cmd

import (
	"context"

	"github.com/joho/godotenv"
	"github.com/spf13/cobra"
)

func Execute(ctx context.Context) int {
	err := godotenv.Load()
	// This doesn't break the program so we don't
	// have to abort (we can still run the program)
	if err != nil {
		print("Couldn't find .env file - not loading")
	}

	rootCmd := &cobra.Command{
		Use: "inertia",
		RunE: func(cmd *cobra.Command, args []string) error {
			return nil
		},
	}

	rootCmd.AddCommand(APICmd(ctx))

	if err := rootCmd.Execute(); err != nil {
		return 1
	}

	return 0
}
