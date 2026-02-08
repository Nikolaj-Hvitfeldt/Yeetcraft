package com.yeetcraft.controllers

import com.yeetcraft.auth.parseSupabaseJwt
import com.yeetcraft.dto.ErrorResponse
import com.yeetcraft.dto.MeDto
import com.yeetcraft.repositories.PlayerRepository
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.*
import io.ktor.server.response.*

object MeController {
    /**
     * GET /api/me
     * Returns current user from JWT (if valid). 401 when no valid token.
     */
    suspend fun getMe(call: ApplicationCall): Unit {
        val principal = parseSupabaseJwt(call)
        if (principal == null) {
            call.respond(HttpStatusCode.Unauthorized, ErrorResponse(error = "Unauthorized", message = "Missing or invalid token"))
            return
        }
        val playerId: Int? = PlayerRepository.findIdByAuthUserId(principal.sub)
        call.respond(
            MeDto(
                sub = principal.sub.toString(),
                email = principal.email,
                playerId = playerId,
                isAdmin = principal.isAdmin
            )
        )
    }
}
