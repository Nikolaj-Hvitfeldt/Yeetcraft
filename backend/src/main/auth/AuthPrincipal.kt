package com.yeetcraft.auth

import java.util.UUID

/**
 * Authenticated user from Supabase JWT.
 * Attached to call when Authorization: Bearer &lt;token&gt; is valid.
 */
data class AuthPrincipal(
    val sub: UUID,
    val email: String?,
    val isAdmin: Boolean
)
