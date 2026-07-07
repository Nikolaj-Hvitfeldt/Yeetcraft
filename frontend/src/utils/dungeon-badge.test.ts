import { describe, expect, it } from 'vitest'
import { getDungeonBadgeClassName, getDungeonInitials } from './dungeon-badge'

describe('getDungeonInitials', () => {
  it('returns shortName when provided', () => {
    expect(getDungeonInitials('The Deadmines', 'DM')).toBe('DM')
  })

  it('builds initials from name when shortName is missing', () => {
    expect(getDungeonInitials('The Vortex Pinnacle', null)).toBe('TVP')
  })
})

describe('getDungeonBadgeClassName', () => {
  it('cycles through badge styles', () => {
    const first = getDungeonBadgeClassName(0)
    const wrapped = getDungeonBadgeClassName(8)

    expect(first).toContain('border-accent-primary')
    expect(wrapped).toBe(first)
  })
})
