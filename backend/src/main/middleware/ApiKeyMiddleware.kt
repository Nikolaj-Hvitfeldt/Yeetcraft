package com.yeetcraft.middleware

import com.yeetcraft.config.Config
import com.yeetcraft.dto.ErrorResponse
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.util.pipeline.PipelineContext
import org.slf4j.LoggerFactory

private val logger = LoggerFactory.getLogger("ApiKeyMiddleware")

/**
 * URL-based token authentication middleware.
 * 
 * Friends can access the site via a shared link: https://yoursite.com?token=secret-key
 * The token is extracted from URL query parameter and automatically saved in the browser.
 * 
 * Supports multiple methods for flexibility:
 * - URL query parameter: ?token=your-secret-key (best for sharing links)
 * - Header: X-API-Key: your-secret-key (auto-added by frontend after first visit)
 * - Header: Authorization: Bearer your-secret-key
 * 
 * Usage: Add this as a route interceptor before protected routes.
 * 
 * Example:
 * ```
 * route("/api/mistakes") {
 *     intercept(ApplicationCallPipeline.Call) {
 *         validateApiKey(call)
 *     }
 *     get { ... }
 * }
 * ```
 * 
 * @return true if API key is valid, false otherwise (and response is sent)
 */
suspend fun ApplicationCall.validateApiKey(): Boolean {
    // If no API key configured, skip validation
    val expectedKey = Config.apiKey ?: return true
    
    // Check multiple sources: query param first (for URL sharing), then headers
    val providedKey = request.queryParameters["token"]?.trim()
        ?: request.headers[HttpHeaders.Authorization]?.removePrefix("Bearer ")?.trim()
        ?: request.headers["X-API-Key"]?.trim()
    
    if (providedKey != expectedKey) {
        logger.warn("Invalid API key attempt")
        respond(
            HttpStatusCode.Unauthorized,
            ErrorResponse(
                error = "Unauthorized",
                message = "Invalid or missing access token. Please use the shared link."
            )
        )
        return false
    }
    
    return true
}

/**
 * Route interceptor function for inline use in routes.
 * 
 * Usage:
 * ```
 * route("/api/mistakes") {
 *     intercept(ApplicationCallPipeline.Call) {
 *         validateApiKey(call)
 *     }
 *     get { ... }
 * }
 * ```
 */
suspend fun PipelineContext<Unit, ApplicationCall>.validateApiKey() {
    val isValid = call.validateApiKey()
    if (!isValid) {
        finish()
    }
}
