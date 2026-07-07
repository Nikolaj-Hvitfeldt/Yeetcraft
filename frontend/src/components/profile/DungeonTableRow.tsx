import type { DungeonStats } from '../../api/types'

const BADGE_STYLES = [
  'border-accent-primary bg-[#2e1609] text-[#ff7833]',
  'border-accent-primary bg-[#00241e] text-[#00c7a8]',
  'border-accent-primary bg-[#2e2609] text-[#ffd130]',
  'border-accent-primary bg-[#0e242e] text-[#4dc7ff]',
  'border-accent-primary bg-[#162416] text-[#7ac77d]',
  'border-accent-primary bg-[#1e132e] text-[#a86bff]',
  'border-accent-primary bg-[#2e0f0f] text-[#ff5454]',
  'border-accent-primary bg-[#111827] text-text-secondary',
] as const

function getDungeonInitials(name: string, shortName: string | null): string {
  if (shortName) return shortName
  return name
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 4)
    .toUpperCase()
}

export function DungeonTableRow({ dungeon, index, className }: DungeonTableRowProps) {
  const badgeClassName = BADGE_STYLES[index % BADGE_STYLES.length]
  const initials = getDungeonInitials(dungeon.dungeon.name, dungeon.dungeon.shortName)

  return (
    <div
      className={`grid h-14 items-center border-b border-border-subtle px-lg last:border-b-0 ${className ?? ''}`}
      style={{ gridTemplateColumns: 'minmax(0,2fr) 5rem 5rem 5rem' }}
    >
      <div className="flex min-w-0 items-center gap-sm">
        <span
          className={`flex h-6 w-[52px] shrink-0 items-center justify-center rounded-[6px] border px-[6px] font-number text-xs font-bold leading-none ${badgeClassName}`}
        >
          {initials}
        </span>
        <span className="truncate text-base font-semibold leading-5 text-text-tertiary">
          {dungeon.dungeon.name}
        </span>
      </div>
      <p className="text-center font-number text-sm leading-[18px] text-text-primary">
        {dungeon.totalMistakes}
      </p>
      <p className="text-center font-number text-sm leading-[18px] text-stat-total">
        {dungeon.deaths}
      </p>
      <p className="text-center font-number text-sm leading-[18px] text-stat-deaths">
        {dungeon.yeets}
      </p>
    </div>
  )
}

interface DungeonTableRowProps {
  dungeon: DungeonStats
  index: number
  className?: string
}
