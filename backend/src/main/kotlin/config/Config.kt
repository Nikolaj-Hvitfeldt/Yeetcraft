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
 */
object Config {
    private val logger = LoggerFactory.getLogger(Config::class.java)
    
    // Server configuration
    val serverHost: String = System.getenv("SERVER_HOST") ?: "0.0.0.0"
    val serverPort: Int = System.getenv("SERVER_PORT")?.toIntOrNull() ?: 8080
    
    // Database configuration (Supabase Postgres)
    val dbHost: String = System.getenv("DB_HOST") ?: "localhost"
    val dbPort: Int = System.getenv("DB_PORT")?.toIntOrNull() ?: 5432
    val dbName: String = System.getenv("DB_NAME") ?: "postgres"
    val dbUser: String = System.getenv("DB_USER") ?: "postgres"
    val dbPassword: String = System.getenv("DB_PASSWORD") ?: ""
    val dbSslMode: String = System.getenv("DB_SSL_MODE") ?: "require"
    
    // Environment-based configuration
    val isDevelopment: Boolean = System.getenv("ENVIRONMENT")?.lowercase() != "production"
    
    /**
     * Builds JDBC connection URL for Supabase Postgres.
     */
    val dbUrl: String
        get() = "jdbc:postgresql://$dbHost:$dbPort/$dbName?sslmode=$dbSslMode"
    
    /**
     * Validates required configuration values.
     * Throws IllegalArgumentException if critical config is missing.
     */
    fun validate() {
        val errors = mutableListOf<String>()
        
        // For production, require database credentials
        if (!isDevelopment) {
            if (dbPassword.isBlank()) {
                errors.add("DB_PASSWORD is required in production")
            }
            if (dbHost == "localhost") {
                errors.add("DB_HOST must be set to Supabase host in production")
            }
        }
        
        if (errors.isNotEmpty()) {
            val errorMessage = "Configuration validation failed:\n${errors.joinToString("\n")}"
            logger.error(errorMessage)
            throw IllegalArgumentException(errorMessage)
        }
    }
}
