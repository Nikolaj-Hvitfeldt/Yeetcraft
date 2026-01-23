package com.yeetcraft.controllers

import com.yeetcraft.dto.MistakeDto
import com.yeetcraft.dto.MistakeListResponse
import com.yeetcraft.services.MistakeService
import io.ktor.server.application.*
import io.ktor.server.response.*

/**
 * Mistake controller for WoW dungeon mistakes (deaths, yeets).
 * 
 * Architecture notes:
 * - Controller receives HTTP request, extracts parameters if needed
 * - Delegates to service layer for business logic
 * - Formats response as JSON DTO
 */
object MistakeController {
    /**
     * GET /api/mistakes
     * Returns all mistakes (currently returns mock data).
     * TODO: Accept query parameters for filtering (player, dungeon, type, date range)
     */
    suspend fun getAllMistakes(call: ApplicationCall) {
        val mistakes = MistakeService.getAllMistakes()
        call.respond(MistakeListResponse(mistakes = mistakes))
    }
    
    // TODO: Add more controller methods as needed:
    // suspend fun getMistakeById(call: ApplicationCall) { ... }
    // suspend fun createMistake(call: ApplicationCall) { ... }
}
