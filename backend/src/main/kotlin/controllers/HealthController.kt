package com.yeetcraft.controllers

import com.yeetcraft.dto.HealthResponse
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
        try {
            call.respond(
                HealthResponse(
                    status = "ok",
                    timestamp = System.currentTimeMillis()
                )
            )
        } catch (e: Exception) {
            logger.error("Error in health check", e)
            call.respond(status = io.ktor.http.HttpStatusCode.InternalServerError)
        }
    }
}
