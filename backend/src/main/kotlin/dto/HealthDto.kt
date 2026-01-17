package com.yeetcraft.dto

import kotlinx.serialization.Serializable

/**
 * DTO for health check responses.
 */
@Serializable
data class HealthResponse(
    val status: String,
    val timestamp: Long
)
