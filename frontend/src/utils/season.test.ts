import { describe, expect, it } from 'vitest'
import type { SeasonSummary } from '../api/types'
import { resolveSeasonId, seasonPath } from './season'

const seasons: SeasonSummary[] = [
  { id: 'season-1', name: 'Season 1', expansion: 'Dragonflight', isCurrent: false },
  { id: 'season-2', name: 'Season 2', expansion: null, isCurrent: true },
]

describe('resolveSeasonId', () => {
  it('returns requested season when valid', () => {
    expect(resolveSeasonId('season-1', seasons)).toBe('season-1')
  })

  it('falls back to current season', () => {
    expect(resolveSeasonId(null, seasons)).toBe('season-2')
  })

  it('trusts requested season before seasons list is loaded', () => {
    expect(resolveSeasonId('season-1', undefined)).toBe('season-1')
    expect(resolveSeasonId('season-1', [])).toBe('season-1')
  })

  it('ignores invalid requested season ids', () => {
    expect(resolveSeasonId('missing', seasons)).toBe('season-2')
  })
})

describe('seasonPath', () => {
  it('appends seasonId query param', () => {
    expect(seasonPath('/player/abc', 'season-1')).toBe('/player/abc?seasonId=season-1')
  })

  it('returns path unchanged when seasonId is missing', () => {
    expect(seasonPath('/player/abc', undefined)).toBe('/player/abc')
  })
})
