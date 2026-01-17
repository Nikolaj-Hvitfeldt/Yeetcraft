package com.yeetcraft.repositories

import com.yeetcraft.config.Database
import com.yeetcraft.dto.MistakeDto
import com.yeetcraft.dto.MistakeType
import java.sql.ResultSet

/**
 * Mistake repository layer.
 */
object MistakeRepository {
    /**
     * Get all mistakes from database.
     * Currently returns mock data for demonstration.
     * 
     * TODO: Replace with actual database query:
     * 
     * Database.getConnection().use { connection ->
     *     val query = """
     *         SELECT id, player_name, dungeon, type, description, timestamp
     *         FROM mistakes
     *         ORDER BY timestamp DESC
     *     """.trimIndent()
     *     
     *     connection.prepareStatement(query).use { stmt ->
     *         stmt.executeQuery().use { rs ->
     *             buildList {
     *                 while (rs.next()) {
     *                     add(rs.mapRowToMistakeDto())
     *                 }
     *             }
     *         }
     *     }
     * }
     */
    fun getAllMistakes(): List<MistakeDto> {
        // Mock data for demonstration
        val now = System.currentTimeMillis()
        
        return buildList {
            add(
                MistakeDto(
                    id = 1,
                    playerName = "Roguetank",
                    dungeon = "Deadmines",
                    type = MistakeType.yeet,
                    description = "Got yeeted off the ship by a Defias Pirate",
                    timestamp = now - 3_600_000 // 1 hour ago
                )
            )
            add(
                MistakeDto(
                    id = 2,
                    playerName = "HealzgoBRRR",
                    dungeon = "Shadowfang Keep",
                    type = MistakeType.death,
                    description = "Aggro'd the entire courtyard and got one-shot",
                    timestamp = now - 7_200_000 // 2 hours ago
                )
            )
            add(
                MistakeDto(
                    id = 3,
                    playerName = "LeroyJenkins",
                    dungeon = "Blackrock Depths",
                    type = MistakeType.wipe,
                    description = "Pulled all of Domicile, party wiped spectacularly",
                    timestamp = now - 10_800_000 // 3 hours ago
                )
            )
        }
    }
    
    /**
     * Helper function to map database row to DTO.
     * TODO: Implement when database queries are added
     * 
     * Note: Null-safe access used for potentially nullable columns.
     * MistakeType enum is parsed from string value.
     */
    private fun ResultSet.mapRowToMistakeDto(): MistakeDto {
        val typeString = getString("type") ?: "death"
        
        return MistakeDto(
            id = getInt("id"),
            playerName = getString("player_name") ?: "",
            dungeon = getString("dungeon") ?: "",
            type = MistakeType.valueOf(typeString),
            description = getString("description") ?: "",
            timestamp = getLong("timestamp")
        )
    }
    
    // TODO: Add more repository methods:
    // fun getMistakeById(id: Int): MistakeDto? { ... }
    // fun createMistake(mistake: CreateMistakeRequest): MistakeDto { ... }
    // fun getMistakesByPlayer(playerName: String): List<MistakeDto> { ... }
    // fun getMistakesByDungeon(dungeon: String): List<MistakeDto> { ... }
}

/* 
 * Alternative approach using Exposed (lightweight ORM):
 * 
 * object Mistakes : IntIdTable() {
 *     val playerName = varchar("player_name", 50)
 *     val dungeon = varchar("dungeon", 100)
 *     val type = varchar("type", 20)
 *     val description = text("description")
 *     val timestamp = long("timestamp")
 * }
 * 
 * data class Mistake(id: Int, playerName: String, dungeon: String, type: String, description: String, timestamp: Long)
 * 
 * fun getAllMistakes(): List<MistakeDto> {
 *     return transaction {
 *         Mistakes.selectAll().orderBy(Mistakes.timestamp, SortOrder.DESC).map { row ->
 *             MistakeDto(
 *                 id = row[Mistakes.id].value,
 *                 playerName = row[Mistakes.playerName],
 *                 dungeon = row[Mistakes.dungeon],
 *                 type = row[Mistakes.type],
 *                 description = row[Mistakes.description],
 *                 timestamp = row[Mistakes.timestamp]
 *             )
 *         }
 *     }
 * }
 */
