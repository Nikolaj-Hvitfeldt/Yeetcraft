import type { ReactNode } from 'react'
import { WowIcon } from '../WowIcon'
import {
  SPOTLIGHT_WOW_ICON_BY_KIND,
  STAT_COLOR_BY_KIND,
  type StatKind,
} from '../../utils/stat-colors'

function renderSpotlightIcon(categoryKind?: StatKind | 'default') {
  const wowIcon = categoryKind ? SPOTLIGHT_WOW_ICON_BY_KIND[categoryKind] : undefined

  if (wowIcon) {
    return (
      <WowIcon
        icon={wowIcon}
        size={28}
        objectFit={categoryKind === 'deaths' ? 'contain' : 'cover'}
        className={
          categoryKind === 'yeets' || categoryKind === 'default'
            ? 'size-7 rounded-full'
            : 'size-7'
        }
      />
    )
  }

  return null
}

export function SpotlightCard({
  category,
  title,
  subtitle,
  value,
  categoryKind,
  icon,
  className,
}: SpotlightCardProps) {
  const categoryClassName =
    categoryKind && categoryKind !== 'default'
      ? STAT_COLOR_BY_KIND[categoryKind]
      : 'text-text-secondary'

  return (
    <article
      className={`flex h-[140px] flex-col rounded-3xl border border-border-subtle bg-surface-secondary p-xl ${className ?? ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="shrink-0">
          {icon ?? renderSpotlightIcon(categoryKind)}
        </div>
        <p className={`text-xs leading-4 ${categoryClassName}`}>{category}</p>
      </div>
      <div className="mt-lg flex items-end justify-between">
        <div>
          <p className="text-xl font-bold leading-[26px] text-text-primary">{title}</p>
          <p className="text-sm leading-5 text-text-secondary">{subtitle}</p>
        </div>
        <p className="font-number text-4xl font-bold leading-10 text-text-primary">{value}</p>
      </div>
    </article>
  )
}

interface SpotlightCardProps {
  category: string
  title: string
  subtitle: string
  value: number | string
  categoryKind?: StatKind | 'default'
  icon?: ReactNode
  className?: string
}
