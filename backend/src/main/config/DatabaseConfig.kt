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
    private const val MAXIMUM_POOL_SIZE: Int = 10
    private const val MINIMUM_IDLE_CONNECTIONS: Int = 0
    private const val CONNECTION_TIMEOUT_MILLISECONDS: Long = 30_000
    private const val IDLE_TIMEOUT_MILLISECONDS: Long = 600_000
    private const val MAX_LIFETIME_MILLISECONDS: Long = 1_800_000
    private const val INITIALIZATION_FAIL_TIMEOUT_MILLISECONDS: Long = -1

    private val dataSource: HikariDataSource by lazy {
        val hikariConfig: HikariConfig = HikariConfig().apply {
            jdbcUrl = Config.dbUrl
            username = Config.dbUser
            password = Config.dbPassword
            driverClassName = "org.postgresql.Driver"
            // Connection pool settings
            maximumPoolSize = MAXIMUM_POOL_SIZE
            minimumIdle = MINIMUM_IDLE_CONNECTIONS // Don't create connections upfront (only when needed)
            connectionTimeout = CONNECTION_TIMEOUT_MILLISECONDS
            idleTimeout = IDLE_TIMEOUT_MILLISECONDS
            maxLifetime = MAX_LIFETIME_MILLISECONDS
            // Don't fail fast if database is unavailable (useful for development with mock data)
            initializationFailTimeout = INITIALIZATION_FAIL_TIMEOUT_MILLISECONDS
        }
        HikariDataSource(hikariConfig)
    }
    
    /**
     * Get a database connection from the pool.
     * Connections must be closed after use (use try-with-resources or .use {}).
     */
    fun getConnection(): Connection = dataSource.connection
    
    /**
     * Close the connection pool (typically on application shutdown).
     */
    fun close(): Unit {
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
fun configureDatabase(): Unit {
    // Don't test connection on startup - let it fail lazily when actually needed
    // This allows the application to start even if database is unavailable
    println("ℹ Database connection will be established on first use")
    println("ℹ To use database, ensure PostgreSQL is running or set DB_* environment variables")
    // TODO: Run migrations if needed (consider Flyway or similar lightweight tool)
}
