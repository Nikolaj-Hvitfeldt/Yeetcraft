package database

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"yeetcraft/backend/internal/config"
)

func NewPool(ctx context.Context, databaseConfig config.DatabaseConfig) (*pgxpool.Pool, error) {
	if !databaseConfig.IsConfigured() {
		return nil, nil
	}

	poolConfig, err := databaseConfig.PgxPoolConfig()
	if err != nil {
		return nil, fmt.Errorf("parse database config: %w", err)
	}

	pool, err := pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		return nil, fmt.Errorf("create database pool: %w", err)
	}

	pingContext, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	if err := pool.Ping(pingContext); err != nil {
		pool.Close()
		return nil, fmt.Errorf("ping database: %w", err)
	}

	return pool, nil
}
