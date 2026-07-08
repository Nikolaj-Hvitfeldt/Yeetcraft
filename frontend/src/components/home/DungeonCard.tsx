import { Link } from 'react-router-dom'
import type { DungeonSummary } from '../../api/types'
import { getDungeonInitials } from '../../utils/dungeon-badge'
import { seasonPath } from '../../utils/season'
import { DungeonBadge } from '../ui/DungeonBadge'

export function DungeonCard({ dungeon, index, seasonId }: DungeonCardProps) {
  const to = seasonPath(`/dungeon/${dungeon.id}`, seasonId)
  const initials = getDungeonInitials(dungeon.name, dungeon.shortName)

  return (
    <Link
      to={to}
      className="flex h-11 w-full items-center justify-between rounded-2xl border border-border-subtle bg-surface-base px-md py-[10px] text-left transition-colors hover:border-accent-primary"
    >
      <span className="flex h-6 min-w-0 flex-1 items-center gap-sm">
        <DungeonBadge initials={initials} index={index} className="pt-px" />
        <span className="truncate text-xs font-semibold leading-4 text-text-primary">
          {dungeon.name}
        </span>
      </span>
      <span className="pl-sm text-base font-semibold leading-5 text-text-secondary" aria-hidden="true">
        &rsaquo;
      </span>
    </Link>
  )
}

interface DungeonCardProps {
  dungeon: DungeonSummary
  index: number
  seasonId?: string
}
