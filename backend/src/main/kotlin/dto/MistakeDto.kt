package com.yeetcraft.dto

import kotlinx.serialization.Serializable

/**
 * DTOs for Mistake-related API responses.
 */
@Serializable
data class MistakeDto(
    val id: Int,
    val playerName: String,
    val dungeon: String,
    val type: MistakeType,
    val description: String,
    val timestamp: Long
)

@Serializable
data class MistakeListResponse(
    val mistakes: List<MistakeDto>
)

/**
 * Enum for mistake types ensures type safety.
 * Serializes as string for JSON compatibility.
 */
@Serializable
enum class MistakeType {
    wipe,
    death,
    yeet
}
