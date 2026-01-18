package com.yeetcraft.routes

import com.yeetcraft.controllers.HealthController
import com.yeetcraft.controllers.MistakeController
import com.yeetcraft.middleware.validateApiKey
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

/**
 * Central route configuration.
 */
fun Application.setupRoutes() {
    routing {
        route("/api") {
            // Health check endpoint (always public)
            get("/health") {
                HealthController.getHealth(call)
            }
            
            // Protected endpoints
            route("/mistakes") {
                // Uncomment to enable API key protection:
                // intercept(ApplicationCallPipeline.Call) {
                //     validateApiKey(call)
                // }
                
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
