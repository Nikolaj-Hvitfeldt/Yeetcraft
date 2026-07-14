import eversongWoods from './eversongWoods.webp'
import eredath from './eredath.webp'
import harandar from './harandar.webp'
import icecrown from './icecrown.webp'
import isleOfQuelDanas from './isleOfQuelDanas.webp'
import silvermoon from './silvermoon.webp'
import spiresOfArak from './spiresOfArak.webp'
import thaldraszus from './thaldraszus.webp'
import theCoiledIsle from './theCoiledIsle.webp'
import voidstorm from './voidstorm.webp'
import volDun from './volDun.webp'
import wakingShores from './wakingShores.webp'
import zulAman from './zulAman.webp'
import zuldazar from './zuldazar.webp'

export const zoneImages = {
  eversongWoods,
  eredath,
  harandar,
  icecrown,
  isleOfQuelDanas,
  silvermoon,
  spiresOfArak,
  thaldraszus,
  theCoiledIsle,
  voidstorm,
  volDun,
  wakingShores,
  zulAman,
  zuldazar,
} as const

export type ZoneImageKey = keyof typeof zoneImages
