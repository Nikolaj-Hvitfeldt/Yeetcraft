package com.yeetcraft.config

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import org.slf4j.LoggerFactory
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
    private val logger = LoggerFactory.getLogger(Database::class.java)
    
    private val dataSource: HikariDataSource by lazy {
        val config = HikariConfig().apply {
            jdbcUrl = Config.dbUrl
            username = Config.dbUser
            password = Config.dbPassword
            driverClassName = "org.postgresql.Driver"
            
            // Connection pool settings
            maximumPoolSize = 10
            minimumIdle = 2
            connectionTimeout = 30000
            idleTimeout = 600000
            maxLifetime = 1800000
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
        try {
            dataSource.close()
            logger.info("Database connection pool closed")
        } catch (e: Exception) {
            logger.error("Error closing database connection pool", e)
        }
    }
}

/**
 * Initialize database configuration.
 * Called once during application startup.
 */
fun databaseConfig() {
    try {
        // Test connection on startup
        Database.getConnection().use { connection ->
            if (connection.isValid(5)) {
                logger.info("Database connection established successfully")
            } else {
                throw RuntimeException("Database connection test failed: connection is not valid")
            }
        }
    } catch (e: Exception) {
        val errorMessage = "Failed to establish database connection: ${e.message}"
        logger.error(errorMessage, e)
        throw RuntimeException(errorMessage, e)
    }
    
    // TODO: Run migrations if needed (consider Flyway or similar lightweight tool)
}
