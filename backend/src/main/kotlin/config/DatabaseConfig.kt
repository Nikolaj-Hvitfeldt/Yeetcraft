package com.yeetcraft.config

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import org.slf4j.LoggerFactory
import java.sql.Connection

private val logger = LoggerFactory.getLogger("DatabaseConfig")

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
    private val dataSource: HikariDataSource? by lazy {
        runCatching {
            HikariConfig().apply {
                jdbcUrl = Config.dbUrl
                username = Config.dbUser
                password = Config.dbPassword
                driverClassName = "org.postgresql.Driver"
                
                // Connection pool settings
                maximumPoolSize = 10
                minimumIdle = 2
                connectionTimeout = 30_000
                idleTimeout = 600_000
                maxLifetime = 1_800_000
            }.let { HikariDataSource(it) }
        }.getOrNull()
    }
    
    /**
     * Get a database connection from the pool.
     * Connections must be closed after use (use .use {}).
     * @throws IllegalStateException if database is not initialized
     */
    fun getConnection(): Connection {
        val ds = dataSource ?: throw IllegalStateException("Database connection not available. Check database configuration.")
        return ds.connection
    }
    
    /**
     * Close the connection pool (typically on application shutdown).
     */
    fun close() {
        dataSource?.let { ds ->
            runCatching {
                ds.close()
                logger.info("Database connection pool closed")
            }.onFailure { exception ->
                logger.error("Error closing database connection pool", exception)
            }
        }
    }
}

/**
 * Initialize database configuration.
 * Called once during application startup.
 * Logs a warning if connection cannot be established but doesn't crash the server.
 */
fun databaseConfig() {
    runCatching {
        Database.getConnection().use { connection ->
            require(connection.isValid(5)) {
                "Database connection test failed: connection is not valid"
            }
            logger.info("Database connection established successfully")
        }
    }.onFailure { exception ->
        logger.warn(
            "Database connection failed: ${exception.message}. " +
            "Server will start but database endpoints may not work. " +
            "Set DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD environment variables."
        )
    }
    
    // TODO: Run migrations if needed (consider Flyway or similar lightweight tool)
}
