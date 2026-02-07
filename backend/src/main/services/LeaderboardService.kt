package com.yeetcraft.services

import com.yeetcraft.dto.LeaderboardRowDto
import com.yeetcraft.repositories.LeaderboardRepository

object LeaderboardService {
    fun getLeaderboardByPlayer(): List<LeaderboardRowDto> {
        return LeaderboardRepository.getLeaderboardByPlayer()
    }

    fun getLeaderboardByCharacter(): List<LeaderboardRowDto> {
        return LeaderboardRepository.getLeaderboardByCharacter()
    }
}
