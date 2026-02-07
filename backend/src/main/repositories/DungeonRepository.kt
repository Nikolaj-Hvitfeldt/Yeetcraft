package com.yeetcraft.repositories

import com.yeetcraft.config.Database
import java.sql.ResultSet

object DungeonRepository {
    fun listAll(): List<DungeonRow> {
        val query: String = """
            SELECT id, name, slug, expansion
            FROM dungeons
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

    fun findById(id: Int): DungeonRow? {
        val query: String = "SELECT id, name, slug, expansion FROM dungeons WHERE id = ?"
        return Database.getConnection().use { connection ->
            connection.prepareStatement(query).use { stmt ->
                stmt.setInt(1, id)
                stmt.executeQuery().use { rs ->
                    if (rs.next()) mapRow(rs) else null
                }
            }
        }
    }

    fun findBySlug(slug: String): DungeonRow? {
        val query: String = "SELECT id, name, slug, expansion FROM dungeons WHERE slug = ?"
        return Database.getConnection().use { connection ->
            connection.prepareStatement(query).use { stmt ->
                stmt.setString(1, slug)
                stmt.executeQuery().use { rs ->
                    if (rs.next()) mapRow(rs) else null
                }
            }
        }
    }

    private fun mapRow(rs: ResultSet): DungeonRow {
        return DungeonRow(
            id = rs.getInt("id"),
            name = rs.getString("name"),
            slug = rs.getString("slug"),
            expansion = rs.getString("expansion")?.takeIf { it.isNotBlank() }
        )
    }
}

data class DungeonRow(
    val id: Int,
    val name: String,
    val slug: String,
    val expansion: String?
)
