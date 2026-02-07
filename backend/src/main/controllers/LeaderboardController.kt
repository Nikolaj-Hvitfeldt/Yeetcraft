package com.yeetcraft.controllers

import com.yeetcraft.dto.LeaderboardResponse
import com.yeetcraft.services.LeaderboardService
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*

object LeaderboardController {
    /**
     * GET /api/leaderboard?by=player|character
     * by=player: one row per player (stats = sum of their characters). by=character: one row per character.
     */
    suspend fun getLeaderboard(call: ApplicationCall): Unit {
        val by: String = call.request.queryParameters["by"]?.lowercase() ?: "player"
        val rows = when (by) {
            "character" -> LeaderboardService.getLeaderboardByCharacter()
            else -> LeaderboardService.getLeaderboardByPlayer()
        }
        call.respond(LeaderboardResponse(rows = rows))
    }
}
