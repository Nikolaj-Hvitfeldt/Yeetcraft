package com.yeetcraft

import com.yeetcraft.config.Config
import com.yeetcraft.config.Database
import com.yeetcraft.config.databaseConfig
import com.yeetcraft.routes.setupRoutes
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import io.ktor.http.HttpStatusCode
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json
import org.slf4j.LoggerFactory

private val logger = LoggerFactory.getLogger("Application")

/**
 * Main application entry point for Ktor server.
 */
fun main() {
    // Validate configuration before starting
    Config.validate().fold(
        onSuccess = { /* Configuration valid, continue */ },
        onFailure = { exception ->
            logger.error("Configuration validation failed, exiting", exception)
            System.exit(1)
        }
    )
    
    val server = embeddedServer(Netty, port = Config.serverPort, host = Config.serverHost) {
        module()
    }
    
    // Register shutdown hook for graceful database closure
    Runtime.getRuntime().addShutdownHook(Thread {
        logger.info("Shutting down...")
        Database.close()
    })
    
    server.start(wait = true)
}

/**
 * Application module configuration.
 * Sets up all routing and database connections.
 */
fun Application.module() {
    configureSerialization()
    configureCors()
    configureErrorHandling()
    initializeDatabase()
    setupRoutes()
    
    logger.info("Application module configured successfully")
}

/**
 * Configures JSON serialization with environment-specific settings.
 */
private fun Application.configureSerialization() {
    install(ContentNegotiation) {
        json(
            Json {
                prettyPrint = Config.isDevelopment
                isLenient = true
                ignoreUnknownKeys = true
            }
        )
    }
}

/**
 * Configures CORS for development environment.
 */
private fun Application.configureCors() {
    if (!Config.isDevelopment) return
    
    install(CORS) {
        anyHost()
        allowMethod(io.ktor.http.HttpMethod.Get)
        allowMethod(io.ktor.http.HttpMethod.Post)
        allowMethod(io.ktor.http.HttpMethod.Put)
        allowMethod(io.ktor.http.HttpMethod.Delete)
        allowHeader(io.ktor.http.HttpHeaders.ContentType)
    }
}

/**
 * Configures global error handling via StatusPages.
 */
private fun Application.configureErrorHandling() {
    install(StatusPages) {
        exception<Throwable> { call, cause ->
            logger.error("Unhandled exception", cause)
            call.respond(
                status = HttpStatusCode.InternalServerError,
                message = mapOf("error" to "Internal server error")
            )
        }
    }
}

/**
 * Initializes database connection on application startup.
 */
private fun Application.initializeDatabase() {
    databaseConfig()
}
