import { useQuery } from '@tanstack/react-query'
import { fetchMistakes } from '../api/api'
import { MistakeDto, MistakeType } from '../api/types'

/** Mock data for demo when backend is unavailable */
const MOCK_MISTAKES: MistakeDto[] = [
  { id: 1, playerName: 'Roguetank', dungeon: 'Deadmines', type: 'yeet', description: 'Yeeted off the ship', timestamp: Date.now() - 3600000 },
  { id: 2, playerName: 'Roguetank', dungeon: 'Shadowfang Keep', type: 'death', description: 'Stood in fire', timestamp: Date.now() - 7200000 },
  { id: 3, playerName: 'Roguetank', dungeon: 'Blackrock Depths', type: 'death', description: 'Pulled too many', timestamp: Date.now() - 10800000 },
  { id: 4, playerName: 'HealzgoBRRR', dungeon: 'Shadowfang Keep', type: 'death', description: 'Forgot to heal self', timestamp: Date.now() - 14400000 },
  { id: 5, playerName: 'LeroyJenkins', dungeon: 'Upper Blackrock Spire', type: 'death', description: 'LEEEEROYYY!', timestamp: Date.now() - 21600000 },
  { id: 6, playerName: 'LeroyJenkins', dungeon: 'Deadmines', type: 'yeet', description: 'Charged off the boat', timestamp: Date.now() - 32400000 },
  { id: 7, playerName: 'xXDarkSlayerXx', dungeon: 'Scarlet Monastery', type: 'death', description: 'Ninja pulled boss', timestamp: Date.now() - 36000000 },
  { id: 8, playerName: 'xXDarkSlayerXx', dungeon: 'Scholomance', type: 'yeet', description: 'Knocked off by skeleton', timestamp: Date.now() - 39600000 },
  { id: 9, playerName: 'Huntard', dungeon: 'Wailing Caverns', type: 'death', description: 'Pet pulled entire dungeon', timestamp: Date.now() - 43200000 },
]

/**
 * Fetch mistakes with fallback to mock data when backend is unavailable.
 */
async function fetchMistakesWithFallback(): Promise<MistakeDto[]> {
  try {
    const response = await fetchMistakes()
    return response.mistakes
  } catch (error) {
    console.warn('Backend unavailable, using mock data:', error)
    return MOCK_MISTAKES
  }
}

/**
 * Custom hook for fetching mistakes using TanStack Query.
 * Automatically handles caching, refetching, and error states.
 */
export function useMistakes() {
  return useQuery({
    queryKey: ['mistakes'],
    queryFn: fetchMistakesWithFallback,
    staleTime: 30_000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true,
  })
}

/** Player leaderboard entry with aggregated stats */
export interface PlayerStats {
  playerName: string
  total: number
  deaths: number
  yeets: number
}

/** Filter tab options */
export type FilterTab = 'all' | MistakeType

/**
 * Aggregate mistakes by player to create leaderboard data.
 */
export function aggregateByPlayer(mistakes: MistakeDto[], filter: FilterTab): PlayerStats[] {
  const playerMap = new Map<string, PlayerStats>()

  for (const mistake of mistakes) {
    // Skip if filtering and this mistake doesn't match
    if (filter !== 'all' && mistake.type !== filter) continue

    const existing = playerMap.get(mistake.playerName) || {
      playerName: mistake.playerName,
      total: 0,
      deaths: 0,
      yeets: 0,
    }

    existing.total += 1
    if (mistake.type === 'death') existing.deaths += 1
    if (mistake.type === 'yeet') existing.yeets += 1

    playerMap.set(mistake.playerName, existing)
  }

  // Sort by total descending
  return Array.from(playerMap.values()).sort((a, b) => b.total - a.total)
}

/**
 * Calculate total stats from mistakes in a single pass.
 */
export function calculateTotalStats(mistakes: MistakeDto[]) {
  let deaths = 0
  let yeets = 0

  for (const m of mistakes) {
    if (m.type === 'death') deaths++
    else if (m.type === 'yeet') yeets++
  }

  return { total: mistakes.length, deaths, yeets }
}
