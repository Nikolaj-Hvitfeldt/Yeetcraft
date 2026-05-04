package com.yeetcraft.repositories

import com.yeetcraft.config.Database
import com.yeetcraft.dto.MistakeDto
import com.yeetcraft.dto.MistakeType
import java.sql.ResultSet

/**
 * Mistake repository layer.
 * 
 * Architecture notes:
 * - Repositories handle all database access using plain SQL
 * - They return domain models or DTOs
 * - For lightweight ORM usage, consider Exposed (commented below as alternative)
 * - Plain SQL chosen for minimal dependencies and full control
 */
object MistakeRepository {
    private const val MILLISECONDS_PER_SECOND: Long = 1_000
    private const val SECONDS_PER_MINUTE: Long = 60
    private const val MINUTES_PER_HOUR: Long = 60

    private const val ONE_HOUR_MILLISECONDS: Long = MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND
    private const val TWO_HOURS_MILLISECONDS: Long = 2 * ONE_HOUR_MILLISECONDS
    private const val THREE_HOURS_MILLISECONDS: Long = 3 * ONE_HOUR_MILLISECONDS

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
     *                     add(mapRowToMistakeDto(rs))
     *                 }
     *             }
     *         }
     *     }
     * }
     */
    fun getAllMistakes(): List<MistakeDto> {
        // Mock data for demonstration
        val currentTimestampMilliseconds: Long = System.currentTimeMillis()
        return listOf(
            MistakeDto(
                id = 1,
                playerName = "Roguetank",
                dungeon = "Deadmines",
                type = MistakeType.yeet,
                description = "Got yeeted off the ship by a Defias Pirate",
                timestamp = currentTimestampMilliseconds - ONE_HOUR_MILLISECONDS
            ),
            MistakeDto(
                id = 2,
                playerName = "HealzgoBRRR",
                dungeon = "Shadowfang Keep",
                type = MistakeType.death,
                description = "Aggro'd the entire courtyard and got one-shot",
                timestamp = currentTimestampMilliseconds - TWO_HOURS_MILLISECONDS
            ),
            MistakeDto(
                id = 3,
                playerName = "LeroyJenkins",
                dungeon = "Blackrock Depths",
                type = MistakeType.death,
                description = "Pulled all of Domicile, party wiped spectacularly",
                timestamp = currentTimestampMilliseconds - THREE_HOURS_MILLISECONDS
            )
        )
    }
    
    /**
     * Helper function to map database row to DTO.
     * TODO: Implement when database queries are added
     */
    private fun mapRowToMistakeDto(resultSet: ResultSet): MistakeDto {
        return MistakeDto(
            id = resultSet.getInt("id"),
            playerName = resultSet.getString("player_name"),
            dungeon = resultSet.getString("dungeon"),
            type = MistakeType.valueOf(resultSet.getString("type")),
            description = resultSet.getString("description"),
            timestamp = resultSet.getLong("timestamp")
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
