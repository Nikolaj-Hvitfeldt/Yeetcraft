package com.yeetcraft

import com.yeetcraft.config.Config
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
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.sql.SQLException

private const val LOGGER_ERROR_HANDLER: String = "ErrorHandler"
private const val ERROR_NOT_FOUND: String = "Not Found"
private const val MESSAGE_NOT_FOUND: String = "The requested resource was not found."
private const val ERROR_INTERNAL_SERVER_ERROR: String = "Internal Server Error"
private const val MESSAGE_INTERNAL_SERVER_ERROR: String = "An unexpected error occurred."
private const val ERROR_DATABASE_ERROR: String = "Database Error"
private const val MESSAGE_DATABASE_ERROR: String = "A database error occurred. Please try again later."
private const val ERROR_BAD_REQUEST: String = "Bad Request"
private const val MESSAGE_INVALID_REQUEST_PARAMETERS: String = "Invalid request parameters."
private const val MESSAGE_INVALID_OPERATION: String = "Invalid operation."

/**
 * Main application entry point for Ktor server.
 * 
 * Architecture notes:
 * - Uses explicit layered architecture: routes → controllers → services → repositories
 * - Database connection is configured via environment variables (Supabase Postgres)
 * - No authentication, analytics, or monitoring (per requirements)
 */
fun main(): Unit {
    val applicationEngine: ApplicationEngine = embeddedServer(Netty, port = Config.serverPort, host = Config.serverHost) { module() }
    applicationEngine.start(wait = true)
}

/**
 * Application module configuration.
 * Sets up all routing and database connections.
 */
fun Application.module(): Unit {
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
            call.handleException(cause)
        }
        status(HttpStatusCode.NotFound) { call, status ->
            call.respondError(status, ERROR_NOT_FOUND, MESSAGE_NOT_FOUND)
        }
        status(HttpStatusCode.InternalServerError) { call, status ->
            call.respondError(status, ERROR_INTERNAL_SERVER_ERROR, MESSAGE_INTERNAL_SERVER_ERROR)
        }
    }
    // Initialize database connection (commented out since we're using mock data)
    // configureDatabase()
    // Set up all API routes
    setupRoutes()
}

/**
 * Centralized exception handler for all unhandled exceptions.
 * Returns appropriate HTTP status codes and error messages.
 */
private suspend fun ApplicationCall.handleException(cause: Throwable): Unit {
    val logger: Logger = LoggerFactory.getLogger(LOGGER_ERROR_HANDLER)
    when (cause) {
        is SQLException -> {
            logger.error("Database error: ${cause.message}", cause)
            respondError(HttpStatusCode.InternalServerError, ERROR_DATABASE_ERROR, MESSAGE_DATABASE_ERROR)
        }
        is IllegalArgumentException -> {
            logger.warn("Validation error: ${cause.message}")
            respondError(HttpStatusCode.BadRequest, ERROR_BAD_REQUEST, cause.message ?: MESSAGE_INVALID_REQUEST_PARAMETERS)
        }
        is IllegalStateException -> {
            logger.warn("Invalid state: ${cause.message}")
            respondError(HttpStatusCode.BadRequest, ERROR_BAD_REQUEST, cause.message ?: MESSAGE_INVALID_OPERATION)
        }
        is RuntimeException -> {
            logger.error("Runtime error: ${cause.message}", cause)
            respondError(HttpStatusCode.InternalServerError, ERROR_INTERNAL_SERVER_ERROR, cause.message ?: MESSAGE_INTERNAL_SERVER_ERROR)
        }
        else -> {
            logger.error("Unhandled exception: ${cause.message}", cause)
            respondError(HttpStatusCode.InternalServerError, ERROR_INTERNAL_SERVER_ERROR, MESSAGE_INTERNAL_SERVER_ERROR)
        }
    }
}

private suspend fun ApplicationCall.respondError(statusCode: HttpStatusCode, error: String, message: String?): Unit {
    respond(statusCode, ErrorResponse(error = error, message = message))
}
