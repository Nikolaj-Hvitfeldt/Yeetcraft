package config

import (
	"net"
	"net/url"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

const (
	defaultServerHost = "0.0.0.0"
	defaultServerPort = "8080"
	defaultDBHost     = "localhost"
	defaultDBPort     = "5432"
	defaultDBName     = "postgres"
	defaultDBUser     = "postgres"
	defaultDBPassword = ""
	defaultDBSSLMode  = "require"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	APIKey   string
}

type ServerConfig struct {
	Host string
	Port string
}

func (serverConfig ServerConfig) Address() string {
	return net.JoinHostPort(serverConfig.Host, serverConfig.Port)
}

type DatabaseConfig struct {
	URL      string
	Host     string
	Port     string
	Name     string
	User     string
	Password string
	SSLMode  string
}

func Load() Config {
	return Config{
		Server: ServerConfig{
			Host: getenv("SERVER_HOST", defaultServerHost),
			Port: getenv("SERVER_PORT", defaultServerPort),
		},
		Database: loadDatabaseConfig(),
		APIKey:   os.Getenv("API_KEY"),
	}
}

func loadDatabaseConfig() DatabaseConfig {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL != "" {
		return DatabaseConfig{URL: databaseURL}
	}

	return DatabaseConfig{
		Host:     getenv("DB_HOST", defaultDBHost),
		Port:     getenv("DB_PORT", defaultDBPort),
		Name:     getenv("DB_NAME", defaultDBName),
		User:     getenv("DB_USER", defaultDBUser),
		Password: getenv("DB_PASSWORD", defaultDBPassword),
		SSLMode:  getenv("DB_SSL_MODE", defaultDBSSLMode),
	}
}

func (databaseConfig DatabaseConfig) IsConfigured() bool {
	if databaseConfig.URL != "" {
		return true
	}

	return databaseConfig.Password != "" || databaseConfig.Host != defaultDBHost
}

func (databaseConfig DatabaseConfig) ConnectionString() string {
	if databaseConfig.URL != "" {
		return databaseConfig.URL
	}

	databaseURL := url.URL{
		Scheme: "postgres",
		Host:   net.JoinHostPort(databaseConfig.Host, databaseConfig.Port),
		Path:   databaseConfig.Name,
	}
	databaseURL.User = url.UserPassword(databaseConfig.User, databaseConfig.Password)

	queryValues := databaseURL.Query()
	queryValues.Set("sslmode", databaseConfig.SSLMode)
	databaseURL.RawQuery = queryValues.Encode()

	return databaseURL.String()
}

func (databaseConfig DatabaseConfig) PgxPoolConfig() (*pgxpool.Config, error) {
	return pgxpool.ParseConfig(databaseConfig.ConnectionString())
}

func getenv(key string, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	return value
}
