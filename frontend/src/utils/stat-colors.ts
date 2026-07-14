import type { WowIconKey } from '../assets/wow-icons'

export type StatKind = 'total' | 'deaths' | 'yeets'

export const STAT_COLOR_BY_KIND: Record<StatKind, string> = {
  total: 'text-stat-total',
  deaths: 'text-stat-deaths',
  yeets: 'text-stat-yeets',
}

export const STAT_WOW_ICON_BY_KIND: Record<StatKind, WowIconKey> = {
  total: 'total',
  deaths: 'deaths',
  yeets: 'yeets',
}

export const SPOTLIGHT_WOW_ICON_BY_KIND: Partial<
  Record<StatKind | 'default', WowIconKey>
> = {
  deaths: 'deaths',
  yeets: 'yeets',
  default: 'safestPlayer',
}
