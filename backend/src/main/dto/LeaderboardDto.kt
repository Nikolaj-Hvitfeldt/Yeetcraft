package com.yeetcraft.dto

import kotlinx.serialization.Serializable

/**
 * One row for leaderboard (by player or by character).
 * When by=player: characterName is null. When by=character: characterName and playerName are set.
 */
@Serializable
data class LeaderboardRowDto(
    val playerName: String,
    val characterName: String? = null,
    val deaths: Int,
    val yeets: Int,
    val total: Int
)

@Serializable
data class LeaderboardResponse(
    val rows: List<LeaderboardRowDto>
)
