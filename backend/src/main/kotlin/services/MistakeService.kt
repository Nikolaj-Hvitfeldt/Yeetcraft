package com.yeetcraft.services

import com.yeetcraft.controllers.MistakeDto
import com.yeetcraft.repositories.MistakeRepository

/**
 * Mistake service layer.
 * 
 * Architecture notes:
 * - Services contain business logic and orchestrate multiple repositories if needed
 * - They transform domain models to DTOs for API responses
 * - Currently returns mock data, but structure is ready for database integration
 */
object MistakeService {
    /**
     * Get all mistakes.
     * TODO: Add filtering, pagination, sorting
     */
    fun getAllMistakes(): List<MistakeDto> {
        // Currently returns mock data
        // TODO: Replace with MistakeRepository.getAll() once database is set up
        return MistakeRepository.getAllMistakes()
    }
    
    // TODO: Add more service methods:
    // fun getMistakeById(id: Int): MistakeDto? { ... }
    // fun createMistake(mistake: CreateMistakeRequest): MistakeDto { ... }
    // fun getStatsByPlayer(playerName: String): PlayerStats { ... }
}
