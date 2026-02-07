package com.yeetcraft.repositories

import com.yeetcraft.config.Database
import java.sql.ResultSet

object CharacterRepository {
    fun listAll(): List<CharacterRow> {
        val query: String = """
            SELECT c.id, c.player_id, c.name, c.created_at, p.name AS player_name
            FROM characters c
            JOIN players p ON p.id = c.player_id
            ORDER BY p.name, c.name
        """.trimIndent()
        return Database.getConnection().use { connection ->
            connection.prepareStatement(query).use { stmt ->
                stmt.executeQuery().use { rs ->
                    buildList {
                        while (rs.next()) {
                            add(mapRow(rs))
                        }
                    }
                }
            }
        }
    }

    fun findByPlayerId(playerId: Int): List<CharacterRow> {
        val query: String = """
            SELECT c.id, c.player_id, c.name, c.created_at, p.name AS player_name
            FROM characters c
            JOIN players p ON p.id = c.player_id
            WHERE c.player_id = ?
            ORDER BY c.name
        """.trimIndent()
        return Database.getConnection().use { connection ->
            connection.prepareStatement(query).use { stmt ->
                stmt.setInt(1, playerId)
                stmt.executeQuery().use { rs ->
                    buildList {
                        while (rs.next()) {
                            add(mapRow(rs))
                        }
                    }
                }
            }
        }
    }

    fun findById(id: Int): CharacterRow? {
        val query: String = """
            SELECT c.id, c.player_id, c.name, c.created_at, p.name AS player_name
            FROM characters c
            JOIN players p ON p.id = c.player_id
            WHERE c.id = ?
        """.trimIndent()
        return Database.getConnection().use { connection ->
            connection.prepareStatement(query).use { stmt ->
                stmt.setInt(1, id)
                stmt.executeQuery().use { rs ->
                    if (rs.next()) mapRow(rs) else null
                }
            }
        }
    }

    private fun mapRow(rs: ResultSet): CharacterRow {
        return CharacterRow(
            id = rs.getInt("id"),
            playerId = rs.getInt("player_id"),
            name = rs.getString("name"),
            playerName = rs.getString("player_name"),
            createdAt = rs.getTimestamp("created_at")?.time ?: 0L
        )
    }
}

data class CharacterRow(
    val id: Int,
    val playerId: Int,
    val name: String,
    val playerName: String,
    val createdAt: Long
)
