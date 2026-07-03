import type { DungeonSummary } from '../../api/types'

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

function getDungeonInitials(dungeon: DungeonSummary): string {
  if (dungeon.shortName) return dungeon.shortName
  return dungeon.name
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 4)
    .toUpperCase()
}

export function DungeonCard({ dungeon, index }: DungeonCardProps) {
  const badgeClassName = BADGE_STYLES[index % BADGE_STYLES.length]

  return (
    <button
      type="button"
      className="flex w-full items-center justify-between rounded-md border border-border-subtle bg-surface-base px-md py-[10px] text-left transition-colors hover:border-accent-primary"
      aria-label={`${dungeon.name} details coming later`}
    >
      <span className="flex min-w-0 flex-1 items-center gap-sm">
        <span className={`flex h-6 w-[52px] shrink-0 items-center justify-center rounded-[6px] border px-[6px] py-xs font-number text-xs font-bold leading-4 ${badgeClassName}`}>
          {getDungeonInitials(dungeon)}
        </span>
        <span className="truncate text-xs font-semibold leading-4 text-text-primary">
          {dungeon.name}
        </span>
      </span>
      <span className="pl-sm text-base font-semibold leading-5 text-text-secondary" aria-hidden="true">
        &rsaquo;
      </span>
    </button>
  )
}

interface DungeonCardProps {
  dungeon: DungeonSummary
  index: number
}
