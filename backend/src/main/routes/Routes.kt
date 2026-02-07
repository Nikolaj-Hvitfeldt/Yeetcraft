package com.yeetcraft.routes

import com.yeetcraft.controllers.HealthController
import com.yeetcraft.controllers.LeaderboardController
import com.yeetcraft.controllers.MistakeController
import io.ktor.server.application.*
import io.ktor.server.routing.*

/**
 * Central route configuration.
 * 
 * Architecture notes:
 * - Routes are thin: they only define URL patterns and delegate to controllers
 * - All business logic lives in controllers → services → repositories
 * - API endpoints are prefixed with /api for clear separation
 */
fun Application.setupRoutes(): Unit {
    routing {
        route("/api") {
            // Health check endpoint
            get("/health") {
                HealthController.getHealth(call)
            }
            get("/leaderboard") {
                LeaderboardController.getLeaderboard(call)
            }
            route("/mistakes") {
                get {
                    MistakeController.getAllMistakes(call)
                }
            }
        }
    }
}
