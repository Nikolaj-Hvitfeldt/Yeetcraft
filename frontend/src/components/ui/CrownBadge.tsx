import { useId } from 'react'
import { cn } from '../../utils/cn'
import { CrownIcon } from './CrownIcon'
import { HoverTooltipPanel } from './HoverTooltipPanel'

const CROWN_BY_KIND = {
  yeets: {
    label: 'Yeetmeister',
    description: 'Season leader for yeets.',
    detail:
      'Awarded to the player with the most yeets this season. Ties favor the player with more deaths.',
    iconClassName:
      'text-stat-yeets drop-shadow-[0_0_6px_rgba(254,230,133,0.35)]',
    textClassName: 'text-stat-yeets',
  },
  deaths: {
    label: 'King of Naps',
    description: 'Season leader for deaths.',
    detail:
      'Awarded to the player with the most deaths this season. Ties favor the player with more yeets.',
    iconClassName:
      'text-stat-deaths drop-shadow-[0_0_6px_rgba(218,178,255,0.35)]',
    textClassName: 'text-stat-deaths',
  },
} as const

const BADGE_CLASS =
  'group/crown relative inline-flex shrink-0 cursor-help items-center gap-xs rounded-pill border border-border-subtle bg-surface-base outline-none focus-visible:ring-1 focus-visible:ring-accent-primary'

export function CrownBadge({
  kind,
  showLabel = false,
  className,
}: CrownBadgeProps) {
  const crown = CROWN_BY_KIND[kind]
  const tooltipId = useId()

  return (
    <span
      tabIndex={showLabel ? 0 : undefined}
      aria-describedby={tooltipId}
      aria-label={showLabel ? undefined : crown.label}
      className={cn(
        BADGE_CLASS,
        showLabel
          ? 'px-md py-xs text-xs font-bold uppercase tracking-wide'
          : 'p-xs',
        crown.textClassName,
        className,
      )}
    >
      <CrownIcon className={cn('size-[18px] shrink-0', crown.iconClassName)} />
      {showLabel ? crown.label : <span className="sr-only">{crown.label}</span>}

      <HoverTooltipPanel
        id={tooltipId}
        groupName="crown"
        placement="below"
        width="wide"
        title={crown.label}
        description={crown.description}
        detail={crown.detail}
        showOnFocus={showLabel}
      />
    </span>
  )
}

export type CrownKind = keyof typeof CROWN_BY_KIND

interface CrownBadgeProps {
  kind: CrownKind
  showLabel?: boolean
  className?: string
}
