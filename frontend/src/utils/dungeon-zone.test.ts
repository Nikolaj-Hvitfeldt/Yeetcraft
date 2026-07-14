import { describe, expect, it } from 'vitest'
import { getDungeonZoneImage } from './dungeon-zone'

describe('getDungeonZoneImage', () => {
  it('maps season 1 dungeons to zone backdrops', () => {
    expect(getDungeonZoneImage({ name: "Magisters' Terrace" })).toBeTruthy()
    expect(getDungeonZoneImage({ name: 'Nexus-Point Xenas' })).toBeTruthy()
    expect(getDungeonZoneImage({ name: 'Skyreach' })).toBeTruthy()
  })

  it('maps season 2 dungeons to zone backdrops', () => {
    expect(getDungeonZoneImage({ name: 'Murder Row' })).toBeTruthy()
    expect(getDungeonZoneImage({ name: "Kings' Rest" })).toBeTruthy()
    expect(getDungeonZoneImage({ name: 'Den of Nalorakk' })).toBeTruthy()
  })

  it('reuses the same zone for dungeons in the same region', () => {
    expect(getDungeonZoneImage({ name: 'Maisara Caverns' })).toBe(
      getDungeonZoneImage({ name: 'Den of Nalorakk' }),
    )
    expect(getDungeonZoneImage({ name: 'Nexus-Point Xenas' })).toBe(
      getDungeonZoneImage({ name: 'Voidscar Arena' }),
    )
  })

  it('returns null for unknown dungeons', () => {
    expect(getDungeonZoneImage({ name: 'Unknown Dungeon' })).toBeNull()
  })
})
