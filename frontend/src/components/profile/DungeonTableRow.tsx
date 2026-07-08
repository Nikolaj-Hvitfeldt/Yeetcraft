import type { DungeonStats } from '../../api/types'
import { getDungeonInitials } from '../../utils/dungeon-badge'
import { DungeonBadge } from '../ui/DungeonBadge'

export function DungeonTableRow({ dungeon, index, className }: DungeonTableRowProps) {
  const initials = getDungeonInitials(dungeon.dungeon.name, dungeon.dungeon.shortName)

  return (
    <div
      className={`grid h-14 items-center border-b border-border-subtle px-lg last:border-b-0 ${className ?? ''}`}
      style={{ gridTemplateColumns: 'minmax(0,2fr) 5rem 5rem 5rem' }}
    >
      <div className="flex min-w-0 items-center gap-sm">
        <DungeonBadge initials={initials} index={index} />
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
