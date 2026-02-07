package com.yeetcraft.middleware

import com.yeetcraft.config.Config
import com.yeetcraft.dto.ErrorResponse
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.util.pipeline.PipelineContext
import org.slf4j.Logger
import org.slf4j.LoggerFactory

private val logger: Logger = LoggerFactory.getLogger("ApiKeyMiddleware")
private const val QUERY_PARAMETER_TOKEN: String = "token"
private const val HEADER_API_KEY: String = "X-API-Key"
private const val AUTHORIZATION_BEARER_PREFIX: String = "Bearer "
private const val UNAUTHORIZED_ERROR: String = "Unauthorized"
private const val UNAUTHORIZED_MESSAGE: String = "Invalid or missing access token. Please use the shared link."

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
    val expectedKey: String = Config.apiKey ?: return true
    // Check multiple sources: query param first (for URL sharing), then headers
    val providedKey: String? = request.queryParameters[QUERY_PARAMETER_TOKEN]?.trim()
        ?: request.headers[HttpHeaders.Authorization]?.removePrefix(AUTHORIZATION_BEARER_PREFIX)?.trim()
        ?: request.headers[HEADER_API_KEY]?.trim()
    if (providedKey != expectedKey) {
        logger.warn("Invalid API key attempt")
        respond(
            HttpStatusCode.Unauthorized,
            ErrorResponse(
                error = UNAUTHORIZED_ERROR,
                message = UNAUTHORIZED_MESSAGE
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
suspend fun PipelineContext<Unit, ApplicationCall>.validateApiKey(): Unit {
    val isValid: Boolean = call.validateApiKey()
    if (!isValid) {
        finish()
    }
}
