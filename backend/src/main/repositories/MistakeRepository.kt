package com.yeetcraft.repositories

import com.yeetcraft.config.Database
import com.yeetcraft.dto.MistakeDto
import com.yeetcraft.dto.MistakeType
import java.sql.ResultSet

data class MistakeFilters(
    val playerId: Int? = null,
    val characterId: Int? = null,
    val dungeonId: Int? = null,
    val type: MistakeType? = null
)

object MistakeRepository {
    private const val BASE_QUERY: String = """
        SELECT m.id, m.type, m.description, m.timestamp,
               c.name AS character_name, p.name AS player_name, d.name AS dungeon_name
        FROM mistakes m
        JOIN characters c ON c.id = m.character_id
        JOIN players p ON p.id = c.player_id
        JOIN dungeons d ON d.id = m.dungeon_id
    """

    fun getAllMistakes(filters: MistakeFilters = MistakeFilters()): List<MistakeDto> {
        val whereClauses: MutableList<String> = mutableListOf()
        val params: MutableList<Any> = mutableListOf()
        if (filters.playerId != null) {
            whereClauses.add("p.id = ?")
            params.add(filters.playerId)
        }
        if (filters.characterId != null) {
            whereClauses.add("m.character_id = ?")
            params.add(filters.characterId)
        }
        if (filters.dungeonId != null) {
            whereClauses.add("m.dungeon_id = ?")
            params.add(filters.dungeonId)
        }
        if (filters.type != null) {
            whereClauses.add("m.type = ?")
            params.add(filters.type.name)
        }
        val whereSql: String = if (whereClauses.isEmpty()) "" else " WHERE " + whereClauses.joinToString(" AND ")
        val query: String = BASE_QUERY + whereSql + " ORDER BY m.timestamp DESC"
        return Database.getConnection().use { connection ->
            connection.prepareStatement(query).use { stmt ->
                params.forEachIndexed { index, value ->
                    when (value) {
                        is Int -> stmt.setInt(index + 1, value)
                        is String -> stmt.setString(index + 1, value)
                    }
                }
                stmt.executeQuery().use { rs ->
                    buildList {
                        while (rs.next()) {
                            add(mapRowToMistakeDto(rs))
                        }
                    }
                }
            }
        }
    }

    private fun mapRowToMistakeDto(rs: ResultSet): MistakeDto {
        return MistakeDto(
            id = rs.getInt("id"),
            playerName = rs.getString("player_name"),
            characterName = rs.getString("character_name"),
            dungeon = rs.getString("dungeon_name"),
            type = MistakeType.valueOf(rs.getString("type")),
            description = rs.getString("description") ?: "",
            timestamp = rs.getLong("timestamp")
        )
    }
}
