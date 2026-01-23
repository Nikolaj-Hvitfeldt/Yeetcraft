package com.yeetcraft

import com.yeetcraft.config.Config
import com.yeetcraft.config.databaseConfig
import com.yeetcraft.dto.ErrorResponse
import com.yeetcraft.routes.setupRoutes
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json
import org.slf4j.LoggerFactory
import java.sql.SQLException

/**
 * Main application entry point for Ktor server.
 * 
 * Architecture notes:
 * - Uses explicit layered architecture: routes → controllers → services → repositories
 * - Database connection is configured via environment variables (Supabase Postgres)
 * - No authentication, analytics, or monitoring (per requirements)
 */
fun main() {
    embeddedServer(Netty, port = Config.serverPort, host = Config.serverHost) {
        module()
    }.start(wait = true)
}

/**
 * Application module configuration.
 * Sets up all routing and database connections.
 */
fun Application.module() {
    // Configure JSON serialization
    install(ContentNegotiation) {
        json(Json {
            prettyPrint = true
            isLenient = true
            ignoreUnknownKeys = true
        })
    }
    
    // Configure centralized error handling
    install(StatusPages) {
        exception<Throwable> { call, cause ->
            handleException(call, cause)
        }
        
        status(HttpStatusCode.NotFound) { call, status ->
            call.respond(
                status = status,
                message = ErrorResponse(
                    error = "Not Found",
                    message = "The requested resource was not found."
                )
            )
        }
        
        status(HttpStatusCode.InternalServerError) { call, status ->
            call.respond(
                status = status,
                message = ErrorResponse(
                    error = "Internal Server Error",
                    message = "An unexpected error occurred."
                )
            )
        }
    }
    
    // Initialize database connection
    databaseConfig()
    
    // Set up all API routes
    setupRoutes()
}

/**
 * Centralized exception handler for all unhandled exceptions.
 * Returns appropriate HTTP status codes and error messages.
 */
private suspend fun ApplicationCall.handleException(cause: Throwable) {
    val logger = LoggerFactory.getLogger("ErrorHandler")
    
    when (cause) {
        is SQLException -> {
            logger.error("Database error: ${cause.message}", cause)
            respond(
                status = HttpStatusCode.InternalServerError,
                message = ErrorResponse(
                    error = "Database Error",
                    message = "A database error occurred. Please try again later."
                )
            )
        }
        
        is IllegalArgumentException -> {
            logger.warn("Validation error: ${cause.message}")
            respond(
                status = HttpStatusCode.BadRequest,
                message = ErrorResponse(
                    error = "Bad Request",
                    message = cause.message ?: "Invalid request parameters."
                )
            )
        }
        
        is IllegalStateException -> {
            logger.warn("Invalid state: ${cause.message}")
            respond(
                status = HttpStatusCode.BadRequest,
                message = ErrorResponse(
                    error = "Bad Request",
                    message = cause.message ?: "Invalid operation."
                )
            )
        }
        
        is RuntimeException -> {
            logger.error("Runtime error: ${cause.message}", cause)
            respond(
                status = HttpStatusCode.InternalServerError,
                message = ErrorResponse(
                    error = "Internal Server Error",
                    message = cause.message ?: "An unexpected error occurred."
                )
            )
        }
        
        else -> {
            logger.error("Unhandled exception: ${cause.message}", cause)
            respond(
                status = HttpStatusCode.InternalServerError,
                message = ErrorResponse(
                    error = "Internal Server Error",
                    message = "An unexpected error occurred."
                )
            )
        }
    }
}
