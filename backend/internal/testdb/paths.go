package testdb

import (
	"fmt"
	"os"
	"path/filepath"
)

// ResolveBackendRoot finds the backend module root by locating go.mod.
func ResolveBackendRoot() (string, error) {
	workingDirectory, err := os.Getwd()
	if err != nil {
		return "", fmt.Errorf("resolve backend root: %w", err)
	}

	for directory := workingDirectory; ; directory = filepath.Dir(directory) {
		if _, err := os.Stat(filepath.Join(directory, "go.mod")); err == nil {
			return directory, nil
		}

		parentDirectory := filepath.Dir(directory)
		if parentDirectory == directory {
			break
		}
	}

	return "", fmt.Errorf("resolve backend root: go.mod not found from %s", workingDirectory)
}

func sqlFilePath(backendRoot string, relativePath string) string {
	return filepath.Join(backendRoot, relativePath)
}

// SchemaSQLPath returns the path to db/schema.sql.
func SchemaSQLPath(backendRoot string) string {
	return sqlFilePath(backendRoot, filepath.Join("db", "schema.sql"))
}

// SeedSQLPath returns the path to db/testdata/seed.sql.
func SeedSQLPath(backendRoot string) string {
	return sqlFilePath(backendRoot, filepath.Join("db", "testdata", "seed.sql"))
}

// ResetStatsSQLPath returns the path to db/testdata/reset_stats.sql.
func ResetStatsSQLPath(backendRoot string) string {
	return sqlFilePath(backendRoot, filepath.Join("db", "testdata", "reset_stats.sql"))
}
