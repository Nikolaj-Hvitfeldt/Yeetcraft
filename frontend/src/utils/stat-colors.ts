import type { IconKey } from '../assets/icons'

export type StatKind = 'total' | 'deaths' | 'yeets'

export const STAT_COLOR_BY_KIND: Record<StatKind, string> = {
  total: 'text-stat-total',
  deaths: 'text-stat-deaths',
  yeets: 'text-stat-yeets',
}

export const STAT_ICON_BY_KIND: Record<StatKind, IconKey> = {
  total: 'total',
  deaths: 'deaths',
  yeets: 'yeets',
}

export const SPOTLIGHT_ICON_BY_KIND: Partial<
  Record<StatKind | 'default', IconKey>
> = {
  deaths: 'deaths',
  yeets: 'yeets',
  default: 'safestPlayer',
}
