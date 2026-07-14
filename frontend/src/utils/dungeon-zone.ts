import type { DungeonSummary } from '../api/types'
import { zoneImages, type ZoneImageKey } from '../assets/zones'
import { toSlug } from './slug'

function normalizeDungeonName(input: string): string {
  return toSlug(input).replace(/-/g, '')
}

const NAME_TO_ZONE_KEY: Record<string, ZoneImageKey> = {
  magistersterrace: 'isleOfQuelDanas',
  maisaracaverns: 'zulAman',
  nexuspointxenas: 'voidstorm',
  windrunnerspire: 'eversongWoods',
  algetharacademy: 'thaldraszus',
  theseatofthetriumvirate: 'eredath',
  skyreach: 'spiresOfArak',
  pitofsaron: 'icecrown',
  altaroffangs: 'theCoiledIsle',
  murderrow: 'silvermoon',
  denofnalorakk: 'zulAman',
  theblindingvale: 'harandar',
  voidscararena: 'voidstorm',
  rubylifepools: 'wakingShores',
  templeofsethraliss: 'volDun',
  kingsrest: 'zuldazar',
}

export function getDungeonZoneImage(
  dungeon: Pick<DungeonSummary, 'name'>,
): string | null {
  const zoneKey = NAME_TO_ZONE_KEY[normalizeDungeonName(dungeon.name)]
  if (!zoneKey) return null

  return zoneImages[zoneKey] ?? null
}
