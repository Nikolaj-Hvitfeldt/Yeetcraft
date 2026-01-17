package com.yeetcraft.controllers

import com.yeetcraft.dto.ErrorResponse
import com.yeetcraft.dto.MistakeListResponse
import com.yeetcraft.services.MistakeService
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.*
import io.ktor.server.response.*
import org.slf4j.LoggerFactory

/**
 * Mistake controller for WoW dungeon mistakes (wipes, deaths, yeets).
 */
object MistakeController {
    private val logger = LoggerFactory.getLogger(MistakeController::class.java)
    
    /**
     * GET /api/mistakes
     * Returns all mistakes (currently returns mock data).
     * TODO: Accept query parameters for filtering (player, dungeon, type, date range)
     */
    suspend fun getAllMistakes(call: ApplicationCall) {
        try {
            val mistakes = MistakeService.getAllMistakes()
            call.respond(MistakeListResponse(mistakes = mistakes))
        } catch (e: Exception) {
            logger.error("Error fetching mistakes", e)
            call.respond(
                status = HttpStatusCode.InternalServerError,
                message = ErrorResponse(
                    error = "Internal server error",
                    message = "Failed to fetch mistakes"
                )
            )
        }
    }
    
    // TODO: Add more controller methods as needed:
    // suspend fun getMistakeById(call: ApplicationCall) { 
    //     try {
    //         val id = call.parameters["id"]?.toIntOrNull()
    //             ?: return call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid ID"))
    //         val mistake = MistakeService.getMistakeById(id)
    //             ?: return call.respond(HttpStatusCode.NotFound, ErrorResponse("Mistake not found"))
    //         call.respond(mistake)
    //     } catch (e: Exception) {
    //         logger.error("Error fetching mistake", e)
    //         call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Internal server error"))
    //     }
    // }
    // suspend fun createMistake(call: ApplicationCall) { ... }
}
