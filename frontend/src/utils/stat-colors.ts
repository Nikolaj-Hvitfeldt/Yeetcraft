export type StatKind = 'total' | 'deaths' | 'yeets'

export const STAT_COLOR_BY_KIND: Record<StatKind, string> = {
  total: 'text-stat-total',
  deaths: 'text-stat-deaths',
  yeets: 'text-stat-yeets',
}
