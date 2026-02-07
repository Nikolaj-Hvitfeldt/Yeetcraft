package com.yeetcraft.repositories

import com.yeetcraft.config.Database
import com.yeetcraft.dto.LeaderboardRowDto
import java.sql.ResultSet

object LeaderboardRepository {
    /**
     * One row per player; stats = sum of mistakes across all their characters.
     */
    fun getLeaderboardByPlayer(): List<LeaderboardRowDto> {
        val query: String = """
            SELECT p.name AS player_name,
                   SUM(CASE WHEN m.type = 'death' THEN 1 ELSE 0 END)::INT AS deaths,
                   SUM(CASE WHEN m.type = 'yeet' THEN 1 ELSE 0 END)::INT AS yeets,
                   COUNT(*)::INT AS total
            FROM players p
            JOIN characters c ON c.player_id = p.id
            JOIN mistakes m ON m.character_id = c.id
            GROUP BY p.id, p.name
            ORDER BY total DESC, p.name
        """.trimIndent()
        return Database.getConnection().use { connection ->
            connection.prepareStatement(query).use { stmt ->
                stmt.executeQuery().use { rs ->
                    buildList {
                        while (rs.next()) {
                            add(mapRowByPlayer(rs))
                        }
                    }
                }
            }
        }
    }

    /**
     * One row per character; includes player name.
     */
    fun getLeaderboardByCharacter(): List<LeaderboardRowDto> {
        val query: String = """
            SELECT p.name AS player_name, c.name AS character_name,
                   SUM(CASE WHEN m.type = 'death' THEN 1 ELSE 0 END)::INT AS deaths,
                   SUM(CASE WHEN m.type = 'yeet' THEN 1 ELSE 0 END)::INT AS yeets,
                   COUNT(*)::INT AS total
            FROM characters c
            JOIN players p ON p.id = c.player_id
            JOIN mistakes m ON m.character_id = c.id
            GROUP BY c.id, c.name, p.id, p.name
            ORDER BY total DESC, p.name, c.name
        """.trimIndent()
        return Database.getConnection().use { connection ->
            connection.prepareStatement(query).use { stmt ->
                stmt.executeQuery().use { rs ->
                    buildList {
                        while (rs.next()) {
                            add(mapRowByCharacter(rs))
                        }
                    }
                }
            }
        }
    }

    private fun mapRowByPlayer(rs: ResultSet): LeaderboardRowDto {
        return LeaderboardRowDto(
            playerName = rs.getString("player_name"),
            characterName = null,
            deaths = rs.getInt("deaths"),
            yeets = rs.getInt("yeets"),
            total = rs.getInt("total")
        )
    }

    private fun mapRowByCharacter(rs: ResultSet): LeaderboardRowDto {
        return LeaderboardRowDto(
            playerName = rs.getString("player_name"),
            characterName = rs.getString("character_name"),
            deaths = rs.getInt("deaths"),
            yeets = rs.getInt("yeets"),
            total = rs.getInt("total")
        )
    }
}
