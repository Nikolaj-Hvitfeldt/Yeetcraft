import algetharAcademy from './midnight/season1/algetharAcademy.webp'
import magistersTerrace from './midnight/season1/magistersTerrace.webp'
import maisaraCaverns from './midnight/season1/maisaraCaverns.webp'
import nexusPointXenas from './midnight/season1/nexusPointXenas.webp'
import pitOfSaron from './midnight/season1/pitOfSaron.webp'
import skyreach from './midnight/season1/skyreach.webp'
import theSeatOfTheTriumvirate from './midnight/season1/theSeatOfTheTriumvirate.webp'
import windrunnerSpire from './midnight/season1/windrunnerSpire.webp'

import altarOfFangs from './midnight/season2/altarOfFangs.webp'
import denOfNalorakk from './midnight/season2/denOfNalorakk.webp'
import kingsRest from './midnight/season2/kingsRest.webp'
import murderRow from './midnight/season2/murderRow.webp'
import rubyLifePools from './midnight/season2/rubyLifePools.webp'
import templeOfSethraliss from './midnight/season2/templeOfSethraliss.webp'
import theBlindingVale from './midnight/season2/theBlindingVale.webp'
import voidscarArena from './midnight/season2/voidscarArena.webp'

export const dungeonBannersBySeason = {
  season1: {
    algetharAcademy,
    magistersTerrace,
    maisaraCaverns,
    nexusPointXenas,
    pitOfSaron,
    skyreach,
    theSeatOfTheTriumvirate,
    windrunnerSpire,
  },
  season2: {
    altarOfFangs,
    denOfNalorakk,
    kingsRest,
    murderRow,
    rubyLifePools,
    templeOfSethraliss,
    theBlindingVale,
    voidscarArena,
  },
} as const

export type DungeonBannerSeasonKey = keyof typeof dungeonBannersBySeason

