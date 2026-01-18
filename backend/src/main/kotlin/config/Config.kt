package com.yeetcraft.config

import org.slf4j.LoggerFactory

/**
 * Environment-based configuration.
 * All values are read from environment variables with sensible defaults.
 * 
 * For Supabase connection, set these environment variables:
 * - DB_HOST (Supabase database host)
 * - DB_PORT (default: 5432)
 * - DB_NAME (Supabase database name)
 * - DB_USER (Supabase database user)
 * - DB_PASSWORD (Supabase database password)
 * - DB_SSL_MODE (default: require)
 * 
 * For URL-based access control (share links with friends):
 * - API_KEY (shared token, accessed via ?token=your-key in URL)
 */
object Config {
    private val logger = LoggerFactory.getLogger(Config::class.java)
    
    // Server configuration
    val serverHost: String = getEnv("SERVER_HOST") ?: "0.0.0.0"
    val serverPort: Int = getEnv("SERVER_PORT")?.toIntOrNull() ?: 8080
    
    // Database configuration (Supabase Postgres)
    val dbHost: String = getEnv("DB_HOST") ?: "localhost"
    val dbPort: Int = getEnv("DB_PORT")?.toIntOrNull() ?: 5432
    val dbName: String = getEnv("DB_NAME") ?: "postgres"
    val dbUser: String = getEnv("DB_USER") ?: "postgres"
    val dbPassword: String = getEnv("DB_PASSWORD") ?: ""
    val dbSslMode: String = getEnv("DB_SSL_MODE") ?: "require"
    
    // Environment-based configuration
    val isDevelopment: Boolean = getEnv("ENVIRONMENT")?.lowercase() != "production"
    
    // Access control configuration (optional)
    // Shared API key for URL-based token authentication
    // Friends access via: yoursite.com?token=your-api-key
    val apiKey: String? = getEnv("API_KEY")
    
    /**
     * Builds JDBC connection URL for Supabase Postgres.
     */
    val dbUrl: String
        get() = "jdbc:postgresql://$dbHost:$dbPort/$dbName?sslmode=$dbSslMode"
    
    /**
     * Validates required configuration values.
     * Returns Result<Unit> for idiomatic error handling.
     */
    fun validate(): Result<Unit> = runCatching {
        if (isDevelopment) return@runCatching
        
        // Production validation
        require(dbPassword.isNotBlank()) {
            "DB_PASSWORD is required in production"
        }
        
        require(dbHost != "localhost") {
            "DB_HOST must be set to Supabase host in production"
        }
    }.onFailure { exception ->
        logger.error("Configuration validation failed", exception)
    }
    
    /**
     * Gets environment variable value.
     */
    private fun getEnv(key: String): String? = System.getenv(key)
}
