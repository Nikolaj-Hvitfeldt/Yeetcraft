import { describe, expect, it } from 'vitest'
import type { SeasonSummary } from '../api/types'
import { formatSeasonLabel, resolveSeasonId } from './season'
import { toSlug } from './slug'

const seasonOneId = '11111111-1111-4111-8111-111111111111'
const seasonTwoId = '22222222-2222-4222-8222-222222222222'

const seasons: SeasonSummary[] = [
  { id: seasonOneId, name: 'Midnight Season 1', expansion: 'Midnight', isCurrent: false },
  { id: seasonTwoId, name: 'Midnight Season 2', expansion: 'Midnight', isCurrent: true },
]

describe('formatSeasonLabel', () => {
  it('combines expansion and season name', () => {
    expect(formatSeasonLabel(seasons[0])).toBe('Midnight Midnight Season 1')
  })

  it('returns fallback when season is missing', () => {
    expect(formatSeasonLabel(undefined)).toBe('Unknown season')
    expect(formatSeasonLabel(undefined, 'Select season')).toBe('Select season')
  })
})

describe('resolveSeasonId', () => {
  it('returns requested season when valid slug', () => {
    expect(resolveSeasonId(toSlug('Midnight Season 1'), seasons)).toBe(seasonOneId)
  })

  it('falls back to current season', () => {
    expect(resolveSeasonId(null, seasons)).toBe(seasonTwoId)
  })

  it('returns undefined before seasons list is loaded', () => {
    expect(resolveSeasonId(toSlug('Midnight Season 1'), undefined)).toBeUndefined()
    expect(resolveSeasonId(toSlug('Midnight Season 1'), [])).toBeUndefined()
  })

  it('ignores invalid requested season slugs once seasons are loaded', () => {
    expect(resolveSeasonId('missing', seasons)).toBe(seasonTwoId)
    expect(resolveSeasonId('not-a-real-season', seasons)).toBe(seasonTwoId)
  })
})
