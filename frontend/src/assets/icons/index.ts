import achievementFrameSimple from './achievementFrameSimple.webp'
import achievementShield from './achievementShield.webp'
import bronze from './bronze.webp'
import deaths from './deaths.webp'
import dungeon from './dungeon.webp'
import gold from './gold.webp'
import info from './info.webp'
import platinum from './platinum.webp'
import safestPlayer from './safestPlayer.webp'
import silver from './silver.webp'
import total from './total.webp'
import yeets from './yeets.webp'

export const icons = {
  deaths,
  yeets,
  total,
  dungeon,
  achievementFrameSimple,
  achievementShield,
  safestPlayer,
  bronze,
  silver,
  gold,
  platinum,
  info,
} as const

export type IconKey = keyof typeof icons
