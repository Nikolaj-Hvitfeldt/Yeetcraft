package com.yeetcraft

import com.yeetcraft.config.Config
import com.yeetcraft.config.databaseConfig
import com.yeetcraft.routes.setupRoutes
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json

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
    
    // Initialize database connection
    databaseConfig()
    
    // Set up all API routes
    setupRoutes()
}
