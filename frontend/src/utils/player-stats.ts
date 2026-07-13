import type { DungeonStats } from '../api/types'

export type NemesisDungeon = {
  dungeon: DungeonStats
  sharePercent: number
}

export function getNemesisDungeon(dungeons: DungeonStats[]): NemesisDungeon | null {
  if (dungeons.length === 0) return null

  const totalMistakes = dungeons.reduce((sum, entry) => sum + entry.totalMistakes, 0)
  if (totalMistakes === 0) return null

  const nemesis = dungeons.reduce((current, candidate) =>
    candidate.totalMistakes > current.totalMistakes ? candidate : current,
  )

  return {
    dungeon: nemesis,
    sharePercent: Math.round((nemesis.totalMistakes / totalMistakes) * 100),
  }
}

export function countDungeonsWithMistakes(dungeons: DungeonStats[]): number {
  return dungeons.filter((entry) => entry.totalMistakes > 0).length
}
