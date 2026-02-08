package com.yeetcraft.auth

import com.yeetcraft.config.Config
import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import io.ktor.http.HttpHeaders
import io.ktor.server.application.ApplicationCall
import io.ktor.util.pipeline.PipelineContext
import java.util.UUID

private const val BEARER_PREFIX: String = "Bearer "

/**
 * Parses and validates Supabase JWT from Authorization header.
 * Returns AuthPrincipal or null if missing/invalid.
 */
fun parseSupabaseJwt(call: ApplicationCall): AuthPrincipal? {
    val secret: String = Config.supabaseJwtSecret ?: return null
    val authHeader: String? = call.request.headers[HttpHeaders.Authorization]?.trim()
    val token: String? = authHeader?.removePrefix(BEARER_PREFIX)?.takeIf { it.isNotBlank() }
    if (token == null) return null
    return try {
        val algorithm: Algorithm = Algorithm.HMAC256(secret)
        val verifier = JWT.require(algorithm)
            .withIssuer("https://tjfyoyhfahclcozeqhlt.supabase.co/auth/v1")
            .build()
        val jwt = verifier.verify(token)
        val sub: String = jwt.subject ?: return null
        val uuid: UUID = UUID.fromString(sub)
        val email: String? = jwt.getClaim("email").asString()
        val isAdmin: Boolean = email != null && email == Config.supabaseAdminEmail
        AuthPrincipal(sub = uuid, email = email, isAdmin = isAdmin)
    } catch (_: Exception) {
        null
    }
}

/**
 * Use in routes: gets current auth or null.
 */
fun PipelineContext<*, ApplicationCall>.currentAuth(): AuthPrincipal? = parseSupabaseJwt(context)
