package testdb

import (
	"context"
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"yeetcraft/backend/internal/config"
	"yeetcraft/backend/internal/database"
)

// Client runs guarded test database operations against PostgreSQL.
type Client struct {
	backendRoot string
	pool        *pgxpool.Pool
}

// NewClient connects to the test database after environment guards pass.
func NewClient(ctx context.Context) (*Client, error) {
	if err := RequireTestMode(); err != nil {
		return nil, err
	}

	databaseConfig, err := LoadTestDatabaseConfig()
	if err != nil {
		return nil, err
	}

	if !databaseConfig.IsConfigured() {
		return nil, GuardError{Message: "database is not configured"}
	}

	pool, err := database.NewPool(ctx, databaseConfig)
	if err != nil {
		return nil, fmt.Errorf("connect test database: %w", err)
	}

	if pool == nil {
		return nil, GuardError{Message: "database is not configured"}
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

// Close releases the database pool.
func (client *Client) Close() {
	if client.pool != nil {
		client.pool.Close()
	}
}

// Prepare applies schema.sql on an empty database, then seeds test data.
func (client *Client) Prepare(ctx context.Context) error {
	initialized, err := client.hasApplicationSchema(ctx)
	if err != nil {
		return err
	}

	if initialized {
		return GuardError{
			Message: "test database is already initialized; use seed, reset, or verify instead of prepare",
		}
	}

	if err := client.executeSQLFile(ctx, SchemaSQLPath(client.backendRoot)); err != nil {
		return fmt.Errorf("apply schema: %w", err)
	}

	return client.Seed(ctx)
}

// Seed loads deterministic fixtures.
func (client *Client) Seed(ctx context.Context) error {
	return client.executeSQLFile(ctx, SeedSQLPath(client.backendRoot))
}

// Reset restores seeded mutable stats to the baseline.
func (client *Client) Reset(ctx context.Context) error {
	return client.executeSQLFile(ctx, ResetStatsSQLPath(client.backendRoot))
}

// Verify checks seeded entities and baseline stats.
func (client *Client) Verify(ctx context.Context) error {
	var seasonName string
	var isCurrent bool
	err := client.pool.QueryRow(ctx, `
		select name, is_current
		from seasons
		where id = $1::uuid
	`, SeasonID).Scan(&seasonName, &isCurrent)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return fmt.Errorf("verify season: seeded season %s is missing", SeasonID)
		}
		return fmt.Errorf("verify season: %w", err)
	}

	if seasonName != SeasonName {
		return fmt.Errorf("verify season: expected name %q, got %q", SeasonName, seasonName)
	}

	if !isCurrent {
		return fmt.Errorf("verify season: expected seeded season to be current")
	}

	for _, player := range seededPlayers {
		var displayName string
		err := client.pool.QueryRow(ctx, `
			select display_name
			from players
			where id = $1::uuid
		`, player.ID).Scan(&displayName)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				return fmt.Errorf("verify players: seeded player %s (%s) is missing", player.ID, player.DisplayName)
			}
			return fmt.Errorf("verify players: %w", err)
		}

		if displayName != player.DisplayName {
			return fmt.Errorf(
				"verify players: expected %q for %s, got %q",
				player.DisplayName,
				player.ID,
				displayName,
			)
		}
	}

	for _, dungeon := range seededDungeons {
		var dungeonName string
		err := client.pool.QueryRow(ctx, `
			select name
			from dungeons
			where id = $1::uuid
		`, dungeon.ID).Scan(&dungeonName)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				return fmt.Errorf("verify dungeons: seeded dungeon %s (%s) is missing", dungeon.ID, dungeon.Name)
			}
			return fmt.Errorf("verify dungeons: %w", err)
		}

		if dungeonName != dungeon.Name {
			return fmt.Errorf(
				"verify dungeons: expected %q for %s, got %q",
				dungeon.Name,
				dungeon.ID,
				dungeonName,
			)
		}
	}

	for _, dungeonID := range []string{DungeonAlphaID, DungeonBetaID} {
		var linkCount int
		err := client.pool.QueryRow(ctx, `
			select count(*)
			from season_dungeons
			where season_id = $1::uuid and dungeon_id = $2::uuid
		`, SeasonID, dungeonID).Scan(&linkCount)
		if err != nil {
			return fmt.Errorf("verify season dungeons: %w", err)
		}

		if linkCount != 1 {
			return fmt.Errorf("verify season dungeons: expected link for season %s and dungeon %s", SeasonID, dungeonID)
		}
	}

	for _, baseline := range BaselineStats {
		var deaths int
		var yeets int
		err := client.pool.QueryRow(ctx, `
			select deaths, yeets
			from player_dungeon_stats
			where player_id = $1::uuid
				and season_id = $2::uuid
				and dungeon_id = $3::uuid
		`, baseline.PlayerID, SeasonID, baseline.DungeonID).Scan(&deaths, &yeets)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				return fmt.Errorf(
					"verify stats: missing baseline row player=%s dungeon=%s",
					baseline.PlayerID,
					baseline.DungeonID,
				)
			}
			return fmt.Errorf("verify stats: %w", err)
		}

		if deaths != baseline.Deaths || yeets != baseline.Yeets {
			return fmt.Errorf(
				"verify stats: player=%s dungeon=%s expected deaths=%d yeets=%d, got deaths=%d yeets=%d",
				baseline.PlayerID,
				baseline.DungeonID,
				baseline.Deaths,
				baseline.Yeets,
				deaths,
				yeets,
			)
		}
	}

	return nil
}

func (client *Client) hasApplicationSchema(ctx context.Context) (bool, error) {
	for _, tableName := range ApplicationTables() {
		var exists bool
		err := client.pool.QueryRow(ctx, `
			select exists (
				select 1
				from information_schema.tables
				where table_schema = 'public'
					and table_name = $1
			)
		`, tableName).Scan(&exists)
		if err != nil {
			return false, fmt.Errorf("check table %s: %w", tableName, err)
		}

		if exists {
			return true, nil
		}
	}

	return false, nil
}

func (client *Client) executeSQLFile(ctx context.Context, filePath string) error {
	sqlBytes, err := os.ReadFile(filePath)
	if err != nil {
		return fmt.Errorf("read sql file %s: %w", filePath, err)
	}

	statements := splitSQLStatements(string(sqlBytes))
	for _, statement := range statements {
		if _, err := client.pool.Exec(ctx, statement); err != nil {
			return fmt.Errorf("execute sql from %s: %w", filePath, err)
		}
	}

	return nil
}

func splitSQLStatements(sqlText string) []string {
	var statements []string
	var current strings.Builder

	for _, line := range strings.Split(sqlText, "\n") {
		trimmedLine := strings.TrimSpace(line)
		if trimmedLine == "" || strings.HasPrefix(trimmedLine, "--") {
			continue
		}

		current.WriteString(line)
		current.WriteByte('\n')

		if strings.HasSuffix(strings.TrimSpace(line), ";") {
			statement := strings.TrimSpace(current.String())
			if statement != "" {
				statements = append(statements, statement)
			}
			current.Reset()
		}
	}

	remaining := strings.TrimSpace(current.String())
	if remaining != "" {
		statements = append(statements, remaining)
	}

	return statements
}

// OpenTestPool is a helper for future integration tests that need a guarded pool.
func OpenTestPool(ctx context.Context) (*pgxpool.Pool, config.DatabaseConfig, error) {
	databaseConfig, err := LoadTestDatabaseConfig()
	if err != nil {
		return nil, config.DatabaseConfig{}, err
	}

	pool, err := database.NewPool(ctx, databaseConfig)
	if err != nil {
		return nil, config.DatabaseConfig{}, err
	}

	if pool == nil {
		return nil, config.DatabaseConfig{}, GuardError{Message: "database is not configured"}
	}

	var databaseName string
	if err := pool.QueryRow(ctx, "select current_database()").Scan(&databaseName); err != nil {
		pool.Close()
		return nil, config.DatabaseConfig{}, fmt.Errorf("read current database: %w", err)
	}

	if err := RequireTestDatabaseName(databaseName); err != nil {
		pool.Close()
		return nil, config.DatabaseConfig{}, err
	}

	return pool, databaseConfig, nil
}

// PingWithTimeout verifies connectivity within a short deadline.
func PingWithTimeout(ctx context.Context, pool *pgxpool.Pool) error {
	pingContext, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return pool.Ping(pingContext)
}
