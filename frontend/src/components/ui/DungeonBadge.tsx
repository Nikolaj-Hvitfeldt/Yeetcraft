import { getDungeonBadgeClassName } from '../../utils/dungeon-badge'
import { cn } from '../../utils/cn'

export function DungeonBadge({
  initials,
  index = 0,
  className,
  variant = 'default',
}: DungeonBadgeProps) {
  const badgeClassName = getDungeonBadgeClassName(index)

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-[6px] border px-[6px] font-number text-xs font-bold leading-none',
        variant === 'default' && 'h-6 w-[52px]',
        variant === 'inline' && 'inline-flex h-6',
        badgeClassName,
        className,
      )}
    >
      {initials}
    </span>
  )
}

interface DungeonBadgeProps {
  initials: string
  index?: number
  className?: string
  variant?: 'default' | 'inline'
}
