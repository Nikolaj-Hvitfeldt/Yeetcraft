package com.yeetcraft.services

import com.yeetcraft.dto.MistakeDto
import com.yeetcraft.dto.MistakeType
import com.yeetcraft.repositories.DungeonRepository
import com.yeetcraft.repositories.MistakeFilters
import com.yeetcraft.repositories.MistakeRepository
import com.yeetcraft.repositories.PlayerRepository

object MistakeService {
    fun getAllMistakes(
        playerNameOrId: String? = null,
        characterId: Int? = null,
        dungeonSlugOrId: String? = null,
        type: MistakeType? = null
    ): List<MistakeDto> {
        var playerId: Int? = null
        if (playerNameOrId != null) {
            playerId = playerNameOrId.toIntOrNull()
                ?: PlayerRepository.findByName(playerNameOrId)?.id
        }
        var dungeonId: Int? = null
        if (dungeonSlugOrId != null) {
            dungeonId = dungeonSlugOrId.toIntOrNull()
                ?: DungeonRepository.findBySlug(dungeonSlugOrId)?.id
        }
        val filters: MistakeFilters = MistakeFilters(
            playerId = playerId,
            characterId = characterId,
            dungeonId = dungeonId,
            type = type
        )
        return MistakeRepository.getAllMistakes(filters)
    }
}
