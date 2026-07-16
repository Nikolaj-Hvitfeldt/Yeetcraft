export const SEASON_SLUG = 'e2e-test-season'
export const SEASON_HOME_PATH = `/${SEASON_SLUG}`

export const SEASON_ID = 'eeee0001-0000-4000-8000-000000000001'

export const PLAYER_SEB = {
  id: 'eeee0002-0000-4000-8000-000000000001',
  name: 'Seb',
  slug: 'seb',
} as const

export const DUNGEON_ALPHA = {
  id: 'eeee0003-0000-4000-8000-000000000001',
  name: 'Test Dungeon Alpha',
  slug: 'test-dungeon-alpha',
} as const

export function playerProfilePath(playerSlug: string): string {
  return `${SEASON_HOME_PATH}/player/${playerSlug}`
}

export function dungeonDetailPath(dungeonSlug: string): string {
  return `${SEASON_HOME_PATH}/dungeon/${dungeonSlug}`
}
