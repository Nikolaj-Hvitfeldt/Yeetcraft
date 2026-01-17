package com.yeetcraft.routes

import com.yeetcraft.controllers.HealthController
import com.yeetcraft.controllers.MistakeController
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

/**
 * Central route configuration.
 */
fun Application.setupRoutes() {
    routing {
        route("/api") {
            // Health check endpoint
            get("/health") {
                HealthController.getHealth(call)
            }
            
            // Example endpoint with mock data (WoW theme)
            route("/mistakes") {
                get {
                    MistakeController.getAllMistakes(call)
                }
                
                // TODO: Add more endpoints as needed:
                // get("/{id}") { MistakeController.getMistakeById(call) }
                // post { MistakeController.createMistake(call) }
            }
        }
    }
}
