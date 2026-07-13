import type { DungeonSummary, DungeonStats } from '../api/types'
import { dungeonBannersBySeason, type DungeonBannerSeasonKey } from '../assets/dungeon-images'

function normalizeDungeonName(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]/g, '')
}

const NAME_TO_BANNER_KEY: Record<string, string> = {
  // season1
  magistersterrace: 'magistersTerrace',
  maisaracaverns: 'maisaraCaverns',
  nexuspointxenas: 'nexusPointXenas',
  pitofsaron: 'pitOfSaron',
  algetharacademy: 'algetharAcademy',
  windrunnerspire: 'windrunnerSpire',
  skyreach: 'skyreach',
  theseatofthetriumvirate: 'theSeatOfTheTriumvirate',

  // season2
  denofnalorakk: 'denOfNalorakk',
  kingsrest: 'kingsRest',
  rubylifepools: 'rubyLifePools',
  altaroffangs: 'altarOfFangs',
  theblindingvale: 'theBlindingVale',
  murderrow: 'murderRow',
  voidscararena: 'voidscarArena',
  templeofsethraliss: 'templeOfSethraliss',
}

export function getDungeonBannerImage(
  seasonKey: DungeonBannerSeasonKey,
  dungeon: Pick<DungeonSummary, 'name'>,
): string | null {
  const normalizedName = normalizeDungeonName(dungeon.name)
  const bannerKey = NAME_TO_BANNER_KEY[normalizedName]
  if (!bannerKey) return null

  const seasonImages = dungeonBannersBySeason[seasonKey]
  const url = (seasonImages as Record<string, string>)[bannerKey]
  return url ?? null
}

export function getDungeonBannerImageFromStats(
  seasonKey: DungeonBannerSeasonKey,
  dungeonStats: DungeonStats,
): string | null {
  return getDungeonBannerImage(seasonKey, { name: dungeonStats.dungeon.name })
}

