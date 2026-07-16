package testdb

import (
	"context"
	"fmt"
	"os"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"

	"yeetcraft/backend/internal/config"
	"yeetcraft/backend/internal/database"
)

// IsolationSeasonID is an auxiliary season used only by repository integration tests.
const IsolationSeasonID = "eeee0001-0000-4000-8000-000000000002"

// RequireIntegrationTestDatabaseURL ensures integration tests use an explicit test URL.
func RequireIntegrationTestDatabaseURL() error {
	if err := RequireTestMode(); err != nil {
		return err
	}

	if strings.TrimSpace(os.Getenv("TEST_DATABASE_URL")) == "" {
		return GuardError{Message: "TEST_DATABASE_URL must be set for integration tests"}
	}

	return nil
}

// LoadIntegrationTestDatabaseConfig returns config from TEST_DATABASE_URL only.
func LoadIntegrationTestDatabaseConfig() (config.DatabaseConfig, error) {
	if err := RequireIntegrationTestDatabaseURL(); err != nil {
		return config.DatabaseConfig{}, err
	}

	return config.DatabaseConfig{URL: strings.TrimSpace(os.Getenv("TEST_DATABASE_URL"))}, nil
}

// NewIntegrationClient connects using TEST_DATABASE_URL and integration guards.
func NewIntegrationClient(ctx context.Context) (*Client, error) {
	if err := RequireIntegrationTestDatabaseURL(); err != nil {
		return nil, err
	}

	databaseConfig, err := LoadIntegrationTestDatabaseConfig()
	if err != nil {
		return nil, err
	}

	if !databaseConfig.IsConfigured() {
		return nil, GuardError{Message: "TEST_DATABASE_URL must be set for integration tests"}
	}

	pool, err := database.NewPool(ctx, databaseConfig)
	if err != nil {
		return nil, fmt.Errorf("connect integration test database: %w", err)
	}

	if pool == nil {
		return nil, GuardError{Message: "integration test database is not configured"}
	}

	var databaseName string
	if err := pool.QueryRow(ctx, "select current_database()").Scan(&databaseName); err != nil {
		pool.Close()
		return nil, fmt.Errorf("read current database: %w", err)
	}

	if err := RequireTestDatabaseName(databaseName); err != nil {
		pool.Close()
		return nil, err
	}

	backendRoot, err := ResolveBackendRoot()
	if err != nil {
		pool.Close()
		return nil, err
	}

	return &Client{
		backendRoot: backendRoot,
		pool:        pool,
	}, nil
}

// Pool exposes the underlying pgx pool for repository construction.
func (client *Client) Pool() *pgxpool.Pool {
	return client.pool
}

// ResetAndVerify restores baseline stats and validates the seeded fixture.
func (client *Client) ResetAndVerify(ctx context.Context) error {
	if err := client.Reset(ctx); err != nil {
		return err
	}

	return client.Verify(ctx)
}

// EnsureIsolationSeasonFixtures upserts the auxiliary season used by integration tests.
func (client *Client) EnsureIsolationSeasonFixtures(ctx context.Context) error {
	_, err := client.pool.Exec(ctx, `
		insert into seasons (id, name, expansion, is_current)
		values ($1::uuid, 'E2E Isolation Season', 'Test', false)
		on conflict (id) do update set
			name = excluded.name,
			expansion = excluded.expansion,
			is_current = excluded.is_current
	`, IsolationSeasonID)
	if err != nil {
		return fmt.Errorf("ensure isolation season: %w", err)
	}

	_, err = client.pool.Exec(ctx, `
		insert into season_dungeons (season_id, dungeon_id, display_order)
		values ($1::uuid, $2::uuid, 1)
		on conflict (season_id, dungeon_id) do update set
			display_order = excluded.display_order
	`, IsolationSeasonID, DungeonAlphaID)
	if err != nil {
		return fmt.Errorf("ensure isolation season dungeon link: %w", err)
	}

	_, err = client.pool.Exec(ctx, `
		insert into player_dungeon_stats (player_id, season_id, dungeon_id, deaths, yeets)
		values ($1::uuid, $2::uuid, $3::uuid, 7, 4)
		on conflict (player_id, season_id, dungeon_id) do update set
			deaths = excluded.deaths,
			yeets = excluded.yeets,
			updated_at = now()
	`, PlayerMartinID, IsolationSeasonID, DungeonAlphaID)
	if err != nil {
		return fmt.Errorf("ensure isolation season stats: %w", err)
	}

	return nil
}
