package com.yeetcraft.config

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import java.sql.Connection

/**
 * Database connection configuration using HikariCP connection pool.
 * 
 * Architecture notes:
 * - Uses connection pooling for efficient database access
 * - Plain SQL approach (no heavy ORM)
 * - Repository layer will use this connection for queries
 * - For lightweight ORM usage, consider Exposed (commented as future option)
 */
object Database {
    private val dataSource: HikariDataSource by lazy {
        val config = HikariConfig().apply {
            jdbcUrl = Config.dbUrl
            username = Config.dbUser
            password = Config.dbPassword
            driverClassName = "org.postgresql.Driver"
            
            // Connection pool settings
            maximumPoolSize = 10
            minimumIdle = 0  // Don't create connections upfront (only when needed)
            connectionTimeout = 30000
            idleTimeout = 600000
            maxLifetime = 1800000
            
            // Don't fail fast if database is unavailable (useful for development with mock data)
            initializationFailTimeout = -1
        }
        
        HikariDataSource(config)
    }
    
    /**
     * Get a database connection from the pool.
     * Connections must be closed after use (use try-with-resources or .use {}).
     */
    fun getConnection(): Connection = dataSource.connection
    
    /**
     * Close the connection pool (typically on application shutdown).
     */
    fun close() {
        dataSource.close()
    }
}

/**
 * Initialize database configuration.
 * Called once during application startup.
 * 
 * Note: Connection is tested lazily - if database is not available,
 * the application will still start (useful for development with mock data).
 */
fun databaseConfig() {
    // Don't test connection on startup - let it fail lazily when actually needed
    // This allows the application to start even if database is unavailable
    println("ℹ Database connection will be established on first use")
    println("ℹ To use database, ensure PostgreSQL is running or set DB_* environment variables")
    
    // TODO: Run migrations if needed (consider Flyway or similar lightweight tool)
}
