package com.yeetcraft.controllers

import com.yeetcraft.dto.HealthResponse
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.*
import io.ktor.server.response.*
import org.slf4j.LoggerFactory

/**
 * Health check controller.
 */
object HealthController {
    private val logger = LoggerFactory.getLogger(HealthController::class.java)
    
    /**
     * GET /api/health
     * Simple health check endpoint to verify server is running.
     */
    suspend fun getHealth(call: ApplicationCall) {
        runCatching {
            call.respond(
                HealthResponse(
                    status = "ok",
                    timestamp = System.currentTimeMillis()
                )
            )
        }.onFailure { exception ->
            logger.error("Error in health check", exception)
            call.respond(status = HttpStatusCode.InternalServerError)
        }
    }
}
