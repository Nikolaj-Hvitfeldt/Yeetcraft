import type { DungeonLeaderboardEntry, DungeonSummary } from '../api/types'

export interface DungeonHighlight {
  playerId: string
  displayName: string
  value: number
  subtitle: string
}

export interface DungeonMistakeMix {
  deathsPercent: number
  yeetsPercent: number
}

export interface DungeonAchievement {
  icon: string
  title: string
  description: string
}

export interface DungeonReputationScores {
  dangerRating: number
  yeetFactor: number
  blameShare: number
}

export interface DungeonMeatGrinderSummary {
  narrative: string
  cleanPlayers: number
  yeetSharePercent: number
  averageMistakesPerDungeon: number
  title: string
}

function sortByName<T extends { displayName: string }>(entries: T[]): T[] {
  return [...entries].sort((first, second) => first.displayName.localeCompare(second.displayName))
}

function pickLeader(
  entries: DungeonLeaderboardEntry[],
  getValue: (entry: DungeonLeaderboardEntry) => number,
  tieBreak: (entry: DungeonLeaderboardEntry) => number,
): DungeonLeaderboardEntry | null {
  if (entries.length === 0) return null

  const maxValue = Math.max(...entries.map(getValue))
  if (maxValue === 0) return null

  return sortByName(
    entries.filter((entry) => getValue(entry) === maxValue),
  ).sort((first, second) => tieBreak(second) - tieBreak(first))[0] ?? null
}

function pickSafestPlayer(entries: DungeonLeaderboardEntry[]): DungeonLeaderboardEntry | null {
  if (entries.length === 0) return null

  const minMistakes = Math.min(...entries.map((entry) => entry.totalMistakes))

  return sortByName(
    entries.filter((entry) => entry.totalMistakes === minMistakes),
  ).sort((first, second) => {
    if (first.deaths !== second.deaths) return first.deaths - second.deaths
    return first.displayName.localeCompare(second.displayName)
  })[0] ?? null
}

export function getAverageMistakesPerDungeon(dungeons: DungeonSummary[]): number {
  if (dungeons.length === 0) return 0
  const total = dungeons.reduce((sum, dungeon) => sum + dungeon.totalMistakes, 0)
  return total / dungeons.length
}

export function getDangerScore(dungeon: DungeonSummary, averageMistakes: number): number {
  if (averageMistakes <= 0) return dungeon.totalMistakes > 0 ? 100 : 0
  return Math.min(Math.round((dungeon.totalMistakes / averageMistakes) * 50), 100)
}

export function getYeetFactor(dungeon: DungeonSummary, allDungeons: DungeonSummary[]): number {
  const seasonYeets = allDungeons.reduce((sum, entry) => sum + entry.totalYeets, 0)
  if (seasonYeets <= 0 || dungeon.totalMistakes <= 0) return 0

  const dungeonYeetShare = dungeon.totalYeets / dungeon.totalMistakes
  const seasonYeetShare = seasonYeets / allDungeons.reduce((sum, entry) => sum + entry.totalMistakes, 0)
  if (seasonYeetShare <= 0) return 0

  return Math.min(Math.round((dungeonYeetShare / seasonYeetShare) * 50), 100)
}

export function getBlameShare(
  dungeon: DungeonSummary,
  leaderboard: DungeonLeaderboardEntry[],
): number {
  if (dungeon.totalMistakes <= 0) return 0

  const topOffender = pickLeader(
    leaderboard,
    (entry) => entry.totalMistakes,
    (entry) => entry.yeets,
  )
  if (!topOffender) return 0

  return Math.round((topOffender.totalMistakes / dungeon.totalMistakes) * 100)
}

export function getDungeonHighlights(
  leaderboard: DungeonLeaderboardEntry[],
): {
  biggestYeeter: DungeonHighlight | null
  mostDeaths: DungeonHighlight | null
  safestPlayer: DungeonHighlight | null
} {
  const biggestYeeterEntry = pickLeader(
    leaderboard,
    (entry) => entry.yeets,
    (entry) => entry.deaths,
  )
  const mostDeathsEntry = pickLeader(
    leaderboard,
    (entry) => entry.deaths,
    (entry) => entry.yeets,
  )
  const safestPlayerEntry = pickSafestPlayer(leaderboard)

  return {
    biggestYeeter: biggestYeeterEntry
      ? {
          playerId: biggestYeeterEntry.playerId,
          displayName: biggestYeeterEntry.displayName,
          value: biggestYeeterEntry.yeets,
          subtitle: 'biggest yeeter',
        }
      : null,
    mostDeaths: mostDeathsEntry
      ? {
          playerId: mostDeathsEntry.playerId,
          displayName: mostDeathsEntry.displayName,
          value: mostDeathsEntry.deaths,
          subtitle: 'most deaths',
        }
      : null,
    safestPlayer: safestPlayerEntry
      ? {
          playerId: safestPlayerEntry.playerId,
          displayName: safestPlayerEntry.displayName,
          value: safestPlayerEntry.totalMistakes,
          subtitle: safestPlayerEntry.totalMistakes === 0 ? 'mistakes' : 'mistakes',
        }
      : null,
  }
}

export function getMistakeMix(dungeon: DungeonSummary): DungeonMistakeMix {
  if (dungeon.totalMistakes <= 0) {
    return { deathsPercent: 0, yeetsPercent: 0 }
  }

  const deathsPercent = Math.round((dungeon.totalDeaths / dungeon.totalMistakes) * 100)
  return {
    deathsPercent,
    yeetsPercent: 100 - deathsPercent,
  }
}

export function getDungeonAchievements(
  highlights: ReturnType<typeof getDungeonHighlights>,
): DungeonAchievement[] {
  return [
    {
      icon: '🚀',
      title: 'Orbital Launch',
      description: highlights.biggestYeeter
        ? `${highlights.biggestYeeter.displayName} owns the yeet narrative here.`
        : 'No yeet champion recorded yet.',
    },
    {
      icon: '🛡️',
      title: 'Actually Focused',
      description: highlights.safestPlayer
        ? highlights.safestPlayer.value === 0
          ? `${highlights.safestPlayer.displayName} is currently the safest pick.`
          : `${highlights.safestPlayer.displayName} is currently the safest pick.`
        : 'No safest player recorded yet.',
    },
    {
      icon: '🎯',
      title: 'Mechanic Magnet',
      description: highlights.mostDeaths
        ? `${highlights.mostDeaths.displayName} found the floor most often.`
        : 'No death magnet recorded yet.',
    },
  ]
}

export function getDungeonReputationScores(
  dungeon: DungeonSummary,
  allDungeons: DungeonSummary[],
  leaderboard: DungeonLeaderboardEntry[],
): DungeonReputationScores {
  const averageMistakes = getAverageMistakesPerDungeon(allDungeons)

  return {
    dangerRating: getDangerScore(dungeon, averageMistakes),
    yeetFactor: getYeetFactor(dungeon, allDungeons),
    blameShare: getBlameShare(dungeon, leaderboard),
  }
}

export function getMeatGrinderSummary(
  dungeon: DungeonSummary,
  leaderboard: DungeonLeaderboardEntry[],
  allDungeons: DungeonSummary[],
): DungeonMeatGrinderSummary {
  const contributors = leaderboard.filter((entry) => entry.totalMistakes > 0).length
  const cleanPlayers = leaderboard.length - contributors
  const yeetSharePercent =
    dungeon.totalMistakes > 0
      ? Math.round((dungeon.totalYeets / dungeon.totalMistakes) * 100)
      : 0
  const averageMistakesPerDungeon = Number(
    getAverageMistakesPerDungeon(allDungeons).toFixed(1),
  )

  const yeetLabel = dungeon.totalYeets === 1 ? 'yeet' : 'yeets'
  const playerLabel = leaderboard.length === 1 ? 'player' : 'players'

  return {
    title: 'The Meat Grinder',
    narrative: `${dungeon.name} has ${dungeon.totalMistakes} recorded mistakes: ${dungeon.totalDeaths} deaths and ${dungeon.totalYeets} ${yeetLabel}. ${contributors} of ${leaderboard.length} ${playerLabel} have contributed to the chaos.`,
    cleanPlayers,
    yeetSharePercent,
    averageMistakesPerDungeon,
  }
}

export function sortDungeonLeaderboard(
  leaderboard: DungeonLeaderboardEntry[],
): DungeonLeaderboardEntry[] {
  return [...leaderboard].sort((first, second) => {
    if (second.totalMistakes !== first.totalMistakes) {
      return second.totalMistakes - first.totalMistakes
    }
    if (second.yeets !== first.yeets) return second.yeets - first.yeets
    return first.displayName.localeCompare(second.displayName)
  })
}
