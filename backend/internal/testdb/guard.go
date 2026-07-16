package testdb

import (
	"fmt"
	"os"
	"strings"

	"yeetcraft/backend/internal/config"
)

const testModeEnvKey = "YEETCRAFT_TEST_MODE"

var applicationTables = []string{"seasons", "players", "dungeons", "season_dungeons", "player_dungeon_stats"}

// GuardError indicates a failed test-environment guard.
type GuardError struct {
	Message string
}

func (guardError GuardError) Error() string {
	return guardError.Message
}

// RequireTestMode returns an error when YEETCRAFT_TEST_MODE is not exactly "1".
func RequireTestMode() error {
	if os.Getenv(testModeEnvKey) != "1" {
		return GuardError{Message: fmt.Sprintf("%s must be set to 1 for test database commands", testModeEnvKey)}
	}

	return nil
}

// LoadTestDatabaseConfig returns database config from TEST_DATABASE_URL or DATABASE_URL.
func LoadTestDatabaseConfig() (config.DatabaseConfig, error) {
	if err := RequireTestMode(); err != nil {
		return config.DatabaseConfig{}, err
	}

	testDatabaseURL := strings.TrimSpace(os.Getenv("TEST_DATABASE_URL"))
	if testDatabaseURL != "" {
		return config.DatabaseConfig{URL: testDatabaseURL}, nil
	}

	databaseURL := strings.TrimSpace(os.Getenv("DATABASE_URL"))
	if databaseURL != "" {
		return config.DatabaseConfig{URL: databaseURL}, nil
	}

	return config.DatabaseConfig{}, GuardError{
		Message: "TEST_DATABASE_URL or DATABASE_URL must be set for test database commands",
	}
}

// RequireTestDatabaseName returns an error when the connected database name lacks "_test".
func RequireTestDatabaseName(databaseName string) error {
	if !strings.Contains(databaseName, "_test") {
		return GuardError{
			Message: fmt.Sprintf(
				"refusing to run test database command against %q: database name must contain _test",
				databaseName,
			),
		}
	}

	return nil
}

// ApplicationTables lists Yeetcraft tables used to detect an initialized schema.
func ApplicationTables() []string {
	return append([]string(nil), applicationTables...)
}
