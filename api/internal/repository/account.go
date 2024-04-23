package repository

import (
	"context"

	"github.com/bwmarrin/snowflake"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/peonii/inertia/internal/domain"
)

type AccountRepository interface {
	FindOne(ctx context.Context, id string) (*domain.Account, error)
	FindByEmail(ctx context.Context, email string) ([]*domain.Account, error)
	FindByAccountID(ctx context.Context, id string, provider string) (*domain.Account, error)

	Create(ctx context.Context, account *domain.AccountCreate) (*domain.Account, error)
	Update(ctx context.Context, account *domain.Account) (*domain.Account, error)
	Delete(ctx context.Context, id string) error
}

type PostgresAccountRepository struct {
	AccountRepository
	db *pgxpool.Pool
}

func MakePostgresAccountRepository(db *pgxpool.Pool) *PostgresAccountRepository {
	return &PostgresAccountRepository{
		db: db,
	}
}

func (r *PostgresAccountRepository) FindOne(ctx context.Context, id string) (*domain.Account, error) {
	query := `
		SELECT
			id, user_id, account_type, account_id, email, access_token, refresh_token, created_at
		FROM accounts
		WHERE id = $1
	`

	var account domain.Account
	if err := r.db.QueryRow(ctx, query, id).Scan(
		&account.ID,
		&account.UserID,
		&account.AccountType,
		&account.AccountID,
		&account.Email,
		&account.AccessToken,
		&account.RefreshToken,
		&account.CreatedAt,
	); err != nil {
		return nil, err
	}

	return &account, nil
}

func (r *PostgresAccountRepository) FindByEmail(ctx context.Context, email string) ([]*domain.Account, error) {
	query := `
		SELECT
			id, user_id, account_type, account_id, email, access_token, refresh_token, created_at
		FROM accounts
		WHERE email = $1
	`

	rows, err := r.db.Query(ctx, query, email)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	accounts := []*domain.Account{}
	for rows.Next() {
		var account domain.Account
		if err := rows.Scan(
			&account.ID,
			&account.UserID,
			&account.AccountType,
			&account.AccountID,
			&account.Email,
			&account.AccessToken,
			&account.RefreshToken,
			&account.CreatedAt,
		); err != nil {
			return nil, err
		}

		accounts = append(accounts, &account)
	}

	return accounts, nil
}

func (r *PostgresAccountRepository) FindByAccountID(ctx context.Context, id string, provider string) (*domain.Account, error) {
	query := `
		SELECT
			id, user_id, account_type, account_id, email, access_token, refresh_token, created_at
		FROM accounts
		WHERE account_type = $1 AND account_id = $2
	`

	var account domain.Account
	if err := r.db.QueryRow(ctx, query, provider, id).Scan(
		&account.ID,
		&account.UserID,
		&account.AccountType,
		&account.AccountID,
		&account.Email,
		&account.AccessToken,
		&account.RefreshToken,
		&account.CreatedAt,
	); err != nil {
		return nil, err
	}

	return &account, nil
}

func (r *PostgresAccountRepository) Create(ctx context.Context, account *domain.AccountCreate) (*domain.Account, error) {
	query := `
		INSERT INTO accounts (id, user_id, account_type, account_id, email, access_token, refresh_token)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, user_id, account_type, account_id, email, access_token, refresh_token, created_at
	`

	node, err := snowflake.NewNode(domain.AccountSnowflakeNode)
	if err != nil {
		return nil, err
	}

	id := node.Generate().String()

	var newAccount domain.Account
	if err := r.db.QueryRow(ctx, query,
		id,
		account.UserID,
		account.AccountType,
		account.AccountID,
		account.Email,
		account.AccessToken,
		account.RefreshToken,
	).Scan(
		&newAccount.ID,
		&newAccount.UserID,
		&newAccount.AccountType,
		&newAccount.AccountID,
		&newAccount.Email,
		&newAccount.AccessToken,
		&newAccount.RefreshToken,
		&newAccount.CreatedAt,
	); err != nil {
		return nil, err
	}

	return &newAccount, nil
}

func (r *PostgresAccountRepository) Update(ctx context.Context, account *domain.Account) (*domain.Account, error) {
	query := `
		UPDATE accounts
		SET
			user_id = $2,
			account_type = $3,
			account_id = $4,
			email = $5,
			access_token = $6,
			refresh_token = $7
		WHERE id = $1
		RETURNING id, user_id, account_type, account_id, email, access_token, refresh_token, created_at
	`

	var updatedAccount domain.Account
	if err := r.db.QueryRow(ctx, query,
		account.ID,
		account.UserID,
		account.AccountType,
		account.AccountID,
		account.Email,
		account.AccessToken,
		account.RefreshToken,
	).Scan(
		&updatedAccount.ID,
		&updatedAccount.UserID,
		&updatedAccount.AccountType,
		&updatedAccount.AccountID,
		&updatedAccount.Email,
		&updatedAccount.AccessToken,
		&updatedAccount.RefreshToken,
		&updatedAccount.CreatedAt,
	); err != nil {
		return nil, err
	}

	return &updatedAccount, nil
}

func (r *PostgresAccountRepository) Delete(ctx context.Context, id string) error {
	query := `
		DELETE FROM accounts
		WHERE id = $1
	`

	_, err := r.db.Exec(ctx, query, id)
	return err
}
