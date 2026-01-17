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
    private val dataSource: HikariDataSource by lazy {
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
    }
    
    /**
     * Get a database connection from the pool.
     * Connections must be closed after use (use .use {}).
     */
    fun getConnection(): Connection = dataSource.connection
    
    /**
     * Close the connection pool (typically on application shutdown).
     */
    fun close() {
        runCatching {
            dataSource.close()
            logger.info("Database connection pool closed")
        }.onFailure { exception ->
            logger.error("Error closing database connection pool", exception)
        }
    }
}

/**
 * Initialize database configuration.
 * Called once during application startup.
 * 
 * @throws RuntimeException if database connection cannot be established
 */
fun databaseConfig() {
    Database.getConnection().use { connection ->
        require(connection.isValid(5)) {
            "Database connection test failed: connection is not valid"
        }
        logger.info("Database connection established successfully")
    }
    
    // TODO: Run migrations if needed (consider Flyway or similar lightweight tool)
}
