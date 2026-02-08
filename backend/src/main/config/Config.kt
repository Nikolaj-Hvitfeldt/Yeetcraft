package com.yeetcraft.config

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
    private const val ENVIRONMENT_SERVER_HOST: String = "SERVER_HOST"
    private const val ENVIRONMENT_SERVER_PORT: String = "SERVER_PORT"
    private const val DEFAULT_SERVER_HOST: String = "0.0.0.0"
    private const val DEFAULT_SERVER_PORT: Int = 8080

    private const val ENVIRONMENT_DATABASE_HOST: String = "DB_HOST"
    private const val ENVIRONMENT_DATABASE_PORT: String = "DB_PORT"
    private const val ENVIRONMENT_DATABASE_NAME: String = "DB_NAME"
    private const val ENVIRONMENT_DATABASE_USER: String = "DB_USER"
    private const val ENVIRONMENT_DATABASE_PASSWORD: String = "DB_PASSWORD"
    private const val ENVIRONMENT_DATABASE_SSL_MODE: String = "DB_SSL_MODE"
    private const val DEFAULT_DATABASE_HOST: String = "localhost"
    private const val DEFAULT_DATABASE_PORT: Int = 5432
    private const val DEFAULT_DATABASE_NAME: String = "postgres"
    private const val DEFAULT_DATABASE_USER: String = "postgres"
    private const val DEFAULT_DATABASE_PASSWORD: String = ""
    private const val DEFAULT_DATABASE_SSL_MODE: String = "require"

    private const val ENVIRONMENT_DATABASE_URL: String = "DATABASE_URL"
    private const val ENVIRONMENT_API_KEY: String = "API_KEY"
    private const val ENVIRONMENT_SUPABASE_JWT_SECRET: String = "SUPABASE_JWT_SECRET"
    private const val ENVIRONMENT_SUPABASE_ADMIN_EMAIL: String = "SUPABASE_ADMIN_EMAIL"

    // Server configuration
    val serverHost: String = System.getenv(ENVIRONMENT_SERVER_HOST) ?: DEFAULT_SERVER_HOST
    val serverPort: Int = System.getenv(ENVIRONMENT_SERVER_PORT)?.toIntOrNull() ?: DEFAULT_SERVER_PORT
    // Database: prefer single DATABASE_URL (e.g. Supabase connection string), else use DB_* vars
    val databaseUrl: String? = System.getenv(ENVIRONMENT_DATABASE_URL)?.takeIf { it.isNotBlank() }
    val dbHost: String = System.getenv(ENVIRONMENT_DATABASE_HOST) ?: DEFAULT_DATABASE_HOST
    val dbPort: Int = System.getenv(ENVIRONMENT_DATABASE_PORT)?.toIntOrNull() ?: DEFAULT_DATABASE_PORT
    val dbName: String = System.getenv(ENVIRONMENT_DATABASE_NAME) ?: DEFAULT_DATABASE_NAME
    val dbUser: String = System.getenv(ENVIRONMENT_DATABASE_USER) ?: DEFAULT_DATABASE_USER
    val dbPassword: String = System.getenv(ENVIRONMENT_DATABASE_PASSWORD) ?: DEFAULT_DATABASE_PASSWORD
    val dbSslMode: String = System.getenv(ENVIRONMENT_DATABASE_SSL_MODE) ?: DEFAULT_DATABASE_SSL_MODE
    val dbUrl: String
        get() = when {
            databaseUrl != null -> {
                val url: String = databaseUrl.trim()
                if (url.startsWith("jdbc:")) url else "jdbc:$url"
            }
            else -> "jdbc:postgresql://$dbHost:$dbPort/$dbName?sslmode=$dbSslMode"
        }
    val useDatabaseUrlOnly: Boolean = databaseUrl != null
    // API Key configuration (optional, for URL-based token auth)
    val apiKey: String? = System.getenv(ENVIRONMENT_API_KEY)
    val supabaseJwtSecret: String? = System.getenv(ENVIRONMENT_SUPABASE_JWT_SECRET)
    val supabaseAdminEmail: String? = System.getenv(ENVIRONMENT_SUPABASE_ADMIN_EMAIL)
}
