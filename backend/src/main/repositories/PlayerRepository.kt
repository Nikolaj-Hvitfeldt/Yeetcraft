package com.yeetcraft.repositories

import com.yeetcraft.config.Database
import java.sql.ResultSet

object PlayerRepository {
    fun listAll(): List<PlayerRow> {
        val query: String = """
            SELECT id, name, created_at, updated_at
            FROM players
            ORDER BY name
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

    fun findById(id: Int): PlayerRow? {
        val query: String = "SELECT id, name, created_at, updated_at FROM players WHERE id = ?"
        return Database.getConnection().use { connection ->
            connection.prepareStatement(query).use { stmt ->
                stmt.setInt(1, id)
                stmt.executeQuery().use { rs ->
                    if (rs.next()) mapRow(rs) else null
                }
            }
        }
    }

    fun findByName(name: String): PlayerRow? {
        val query: String = "SELECT id, name, created_at, updated_at FROM players WHERE name = ?"
        return Database.getConnection().use { connection ->
            connection.prepareStatement(query).use { stmt ->
                stmt.setString(1, name)
                stmt.executeQuery().use { rs ->
                    if (rs.next()) mapRow(rs) else null
                }
            }
        }
    }

    fun findIdByAuthUserId(authUserId: java.util.UUID): Int? {
        val query: String = "SELECT id FROM players WHERE auth_user_id = ?"
        return Database.getConnection().use { connection ->
            connection.prepareStatement(query).use { stmt ->
                stmt.setObject(1, authUserId, java.sql.Types.OTHER)
                stmt.executeQuery().use { rs ->
                    if (rs.next()) rs.getInt("id") else null
                }
            }
        }
    }

    private fun mapRow(rs: ResultSet): PlayerRow {
        return PlayerRow(
            id = rs.getInt("id"),
            name = rs.getString("name"),
            createdAt = rs.getTimestamp("created_at")?.time ?: 0L,
            updatedAt = rs.getTimestamp("updated_at")?.time ?: 0L
        )
    }
}

data class PlayerRow(
    val id: Int,
    val name: String,
    val createdAt: Long,
    val updatedAt: Long
)
