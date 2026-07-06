import achievement from './achievement.webp'
import deaths from './deaths.webp'
import dungeon from './dungeon.webp'
import edit from './edit.webp'
import leaderboard from './leaderboard.webp'
import nemesis from './nemesis.webp'
import player from './player.webp'
import save from './save.webp'
import season from './season.webp'
import total from './total.webp'
import yeets from './yeets.webp'

export const wowIcons = {
  deaths,
  yeets,
  total,
  dungeon,
  player,
  leaderboard,
  season,
  nemesis,
  achievement,
  edit,
  save,
} as const

export type WowIconKey = keyof typeof wowIcons
