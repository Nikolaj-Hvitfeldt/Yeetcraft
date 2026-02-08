package com.yeetcraft.controllers

import com.yeetcraft.dto.HealthResponse
import io.ktor.server.application.ApplicationCall
import io.ktor.server.response.respond

object HealthController {
    suspend fun getHealth(call: ApplicationCall): Unit {
        call.respond(
            HealthResponse(
                status = "ok",
                timestamp = System.currentTimeMillis()
            )
        )
    }
}

