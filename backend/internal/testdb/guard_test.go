package testdb

import (
	"testing"
)

func TestRequireTestMode(t *testing.T) {
	t.Setenv(testModeEnvKey, "")

	if err := RequireTestMode(); err == nil {
		t.Fatal("expected error when test mode is unset")
	}

	t.Setenv(testModeEnvKey, "1")

	if err := RequireTestMode(); err != nil {
		t.Fatalf("expected no error when test mode is 1: %v", err)
	}
}

func TestRequireTestDatabaseName(t *testing.T) {
	if err := RequireTestDatabaseName("yeetcraft_test"); err != nil {
		t.Fatalf("expected yeetcraft_test to pass: %v", err)
	}

	if err := RequireTestDatabaseName("yeetcraft"); err == nil {
		t.Fatal("expected yeetcraft without _test to fail")
	}
}

func TestLoadTestDatabaseConfigRequiresTestMode(t *testing.T) {
	t.Setenv(testModeEnvKey, "")
	t.Setenv("TEST_DATABASE_URL", "postgres://localhost/yeetcraft_test")

	if _, err := LoadTestDatabaseConfig(); err == nil {
		t.Fatal("expected error when test mode is unset")
	}
}

func TestLoadTestDatabaseConfigPrefersTestDatabaseURL(t *testing.T) {
	t.Setenv(testModeEnvKey, "1")
	t.Setenv("TEST_DATABASE_URL", "postgres://localhost/yeetcraft_test")
	t.Setenv("DATABASE_URL", "postgres://localhost/other")

	databaseConfig, err := LoadTestDatabaseConfig()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if databaseConfig.URL != "postgres://localhost/yeetcraft_test" {
		t.Fatalf("expected TEST_DATABASE_URL to win, got %q", databaseConfig.URL)
	}
}

func TestSplitSQLStatementsSkipsComments(t *testing.T) {
	statements := splitSQLStatements(`
-- comment
select 1;

insert into seasons (id) values ('x');
`)

	if len(statements) != 2 {
		t.Fatalf("expected 2 statements, got %d: %#v", len(statements), statements)
	}
}

func TestBaselineStatsCount(t *testing.T) {
	if len(BaselineStats) != 8 {
		t.Fatalf("expected 8 baseline stat rows, got %d", len(BaselineStats))
	}
}
