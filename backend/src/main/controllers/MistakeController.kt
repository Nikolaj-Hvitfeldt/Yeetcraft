package com.yeetcraft.controllers

import com.yeetcraft.dto.MistakeListResponse
import com.yeetcraft.dto.MistakeType
import com.yeetcraft.services.MistakeService
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*

object MistakeController {
    /**
     * GET /api/mistakes
     * Query params: player (name or id), character (id), dungeon (slug or id), type (death|yeet).
     */
    suspend fun getAllMistakes(call: ApplicationCall): Unit {
        val player: String? = call.request.queryParameters["player"]
        val characterId: Int? = call.request.queryParameters["character"]?.toIntOrNull()
        val dungeon: String? = call.request.queryParameters["dungeon"]
        val typeParam: String? = call.request.queryParameters["type"]
        val type: MistakeType? = typeParam?.let { runCatching { MistakeType.valueOf(it) }.getOrNull() }
        val mistakes = MistakeService.getAllMistakes(
            playerNameOrId = player,
            characterId = characterId,
            dungeonSlugOrId = dungeon,
            type = type
        )
        call.respond(MistakeListResponse(mistakes = mistakes))
    }
}
