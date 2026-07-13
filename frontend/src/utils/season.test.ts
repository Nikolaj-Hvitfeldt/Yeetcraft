import { describe, expect, it } from 'vitest'
import type { SeasonSummary } from '../api/types'
import { resolveSeasonId } from './season'
import { toSlug } from './slug'

const seasonOneId = '11111111-1111-4111-8111-111111111111'
const seasonTwoId = '22222222-2222-4222-8222-222222222222'

const seasons: SeasonSummary[] = [
  { id: seasonOneId, name: 'Midnight Season 1', expansion: 'Midnight', isCurrent: false },
  { id: seasonTwoId, name: 'Midnight Season 2', expansion: 'Midnight', isCurrent: true },
]

describe('resolveSeasonId', () => {
  it('returns requested season when valid id', () => {
    expect(resolveSeasonId(seasonOneId, seasons)).toBe(seasonOneId)
  })

  it('returns requested season when valid slug', () => {
    expect(resolveSeasonId(toSlug('Midnight Season 1'), seasons)).toBe(seasonOneId)
  })

  it('falls back to current season', () => {
    expect(resolveSeasonId(null, seasons)).toBe(seasonTwoId)
  })

  it('trusts requested uuid before seasons list is loaded', () => {
    expect(resolveSeasonId(seasonOneId, undefined)).toBe(seasonOneId)
    expect(resolveSeasonId(seasonOneId, [])).toBe(seasonOneId)
  })

  it('ignores invalid requested season keys once seasons are loaded', () => {
    expect(resolveSeasonId('missing', seasons)).toBe(seasonTwoId)
    expect(resolveSeasonId('not-a-real-season', seasons)).toBe(seasonTwoId)
  })
})
