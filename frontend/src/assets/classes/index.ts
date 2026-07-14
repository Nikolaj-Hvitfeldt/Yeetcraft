import deathKnight from './deathKnight.webp'
import demonHunter from './demonHunter.webp'
import druid from './druid.webp'
import evoker from './evoker.webp'
import hunter from './hunter.webp'
import mage from './mage.webp'
import monk from './monk.webp'
import paladin from './paladin.webp'
import priest from './priest.webp'
import rogue from './rogue.webp'
import shaman from './shaman.webp'
import warlock from './warlock.webp'
import warrior from './warrior.webp'

export const classes = {
  deathknight: deathKnight,
  demonhunter: demonHunter,
  druid,
  evoker,
  hunter,
  mage,
  monk,
  paladin,
  priest,
  rogue,
  shaman,
  warlock,
  warrior,
} as const

export type ClassKey = keyof typeof classes

export function isClassKey(value: string): value is ClassKey {
  return value in classes
}
