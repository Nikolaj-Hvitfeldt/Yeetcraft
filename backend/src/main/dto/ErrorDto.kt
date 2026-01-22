package com.yeetcraft.dto

import kotlinx.serialization.Serializable

/**
 * DTOs for error responses.
 */
@Serializable
data class ErrorResponse(
    val error: String,
    val message: String? = null
)
