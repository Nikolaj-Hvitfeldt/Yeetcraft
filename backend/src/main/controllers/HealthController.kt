package com.yeetcraft.controllers

import io.ktor.server.application.*
import io.ktor.server.response.*
import kotlinx.serialization.Serializable

/**
 * Health check controller.
 * 
 * Architecture notes:
 * - Controllers handle HTTP request/response logic
 * - They delegate business logic to services
 * - This is a simple example with no service layer (health check is trivial)
 */
object HealthController {
    private const val HEALTH_STATUS_OK: String = "ok"

    @Serializable
    data class HealthResponse(
        val status: String,
        val timestamp: Long
    )
    
    /**
     * GET /api/health
     * Simple health check endpoint to verify server is running.
     */
    suspend fun getHealth(call: ApplicationCall): Unit {
        val timestamp: Long = System.currentTimeMillis()
        call.respond(
            HealthResponse(
                status = HEALTH_STATUS_OK,
                timestamp = timestamp
            )
        )
    }
}
