import { Icon } from '../Icon'
import { cn } from '../../utils/cn'
import { STAT_COLOR_BY_KIND, STAT_ICON_BY_KIND, type StatKind } from '../../utils/stat-colors'

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
  const colorClassName = STAT_COLOR_BY_KIND[kind]
  const icon = STAT_ICON_BY_KIND[kind]

  return (
    <div className="flex w-28 flex-col items-center gap-sm">
      <article className="relative flex h-[100px] w-full flex-col items-center justify-center overflow-hidden rounded-[8px] border border-accent-primary bg-surface-base px-[10px] py-[10px]">
        <Icon
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
              'radial-gradient(circle at center, color-mix(in srgb, var(--color-surface-base) 12%, transparent) 0%, color-mix(in srgb, var(--color-surface-base) 28%, transparent) 48%, var(--color-surface-base) 100%)',
          }}
        />
        <p className="relative z-10 font-number text-3xl font-bold leading-9 text-text-primary drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
          {value}
        </p>
      </article>
      <p className={cn('stat-label-on-image text-xs leading-4', colorClassName)}>{label}</p>
    </div>
  )
}

export type StatCardKind = StatKind

interface StatCardProps {
  label: string
  value: number
  kind: StatCardKind
}
