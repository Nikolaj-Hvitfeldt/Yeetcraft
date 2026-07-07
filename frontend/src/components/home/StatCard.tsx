import type { WowIconKey } from '../../assets/wow-icons'
import { WowIcon } from '../WowIcon'
import { cn } from '../../utils/cn'

const COLOR_CLASS_BY_KIND: Record<StatCardKind, string> = {
  total: 'text-stat-total',
  deaths: 'text-stat-deaths',
  yeets: 'text-stat-yeets',
}

const ICON_BY_KIND: Record<StatCardKind, WowIconKey> = {
  total: 'total',
  deaths: 'deaths',
  yeets: 'yeets',
}

const ICON_CLASS_BY_KIND: Record<StatCardKind, string> = {
  total: 'inset-0 size-full',
  deaths: 'left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2',
  yeets: 'inset-0 size-full',
}

const OBJECT_FIT_BY_KIND: Record<StatCardKind, 'contain' | 'cover'> = {
  total: 'cover',
  deaths: 'contain',
  yeets: 'cover',
}

export function StatCard({ label, value, kind }: StatCardProps) {
  const colorClassName = COLOR_CLASS_BY_KIND[kind]
  const icon = ICON_BY_KIND[kind]

  return (
    <div className="flex w-28 flex-col items-center gap-sm">
      <article className="relative flex h-[100px] w-full flex-col items-center justify-center overflow-hidden rounded-[8px] border border-border-subtle bg-surface-base px-[10px] py-[10px]">
        <WowIcon
          icon={icon}
          fluid
          objectFit={OBJECT_FIT_BY_KIND[kind]}
          className={cn(
            'pointer-events-none absolute opacity-[0.80] saturate-125',
            ICON_CLASS_BY_KIND[kind],
          )}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at center, rgba(23, 33, 61, 0.12) 0%, rgba(23, 33, 61, 0.28) 48%, var(--color-surface-base) 100%)',
          }}
        />
        <p className="relative z-10 font-number text-3xl font-bold leading-9 text-text-primary drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
          {value}
        </p>
      </article>
      <p className={cn('text-xs leading-4', colorClassName)}>{label}</p>
    </div>
  )
}

export type StatCardKind = 'total' | 'deaths' | 'yeets'

interface StatCardProps {
  label: string
  value: number
  kind: StatCardKind
}
