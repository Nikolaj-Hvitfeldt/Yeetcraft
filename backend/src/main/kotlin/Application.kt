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

/**
 * Main application entry point for Ktor server.
 */
fun main() {
    val logger = LoggerFactory.getLogger("Application")
    
    // Validate configuration before starting
    try {
        Config.validate()
    } catch (e: IllegalArgumentException) {
        logger.error("Configuration validation failed, exiting", e)
        System.exit(1)
    }
    
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
    val logger = LoggerFactory.getLogger("Application")
    
    // Configure JSON serialization
    install(ContentNegotiation) {
        json(Json {
            // Pretty print only in development
            prettyPrint = Config.isDevelopment
            isLenient = true
            ignoreUnknownKeys = true
        })
    }
    
    // Configure CORS for development (allows frontend on different port)
    if (Config.isDevelopment) {
        install(CORS) {
            anyHost()
            allowMethod(io.ktor.http.HttpMethod.Get)
            allowMethod(io.ktor.http.HttpMethod.Post)
            allowMethod(io.ktor.http.HttpMethod.Put)
            allowMethod(io.ktor.http.HttpMethod.Delete)
            allowHeader(io.ktor.http.HttpHeaders.ContentType)
        }
    }
    
    // Configure status pages for error handling
    install(StatusPages) {
        exception<Throwable> { call, cause ->
            logger.error("Unhandled exception", cause)
            call.respond(
                status = HttpStatusCode.InternalServerError,
                message = mapOf("error" to "Internal server error")
            )
        }
    }
    
    // Initialize database connection
    databaseConfig()
    
    // Set up all API routes
    setupRoutes()
    
    logger.info("Application module configured successfully")
}
