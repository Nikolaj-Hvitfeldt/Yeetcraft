import type { DungeonStats } from '../../api/types'
import { getDungeonInitials } from '../../utils/dungeon-badge'
import { DungeonBadge } from '../ui/DungeonBadge'
import { StatCounter } from './StatCounter'

type DungeonTableMode = 'browse' | 'edit'

export function DungeonTableRow({
  dungeon,
  index,
  className,
  mode = 'browse',
  gridTemplateColumns = 'minmax(0, 3.5fr) minmax(5.5rem, 1fr) minmax(5.5rem, 1fr) minmax(5.5rem, 1fr)',
  onAdjust,
  disabled = false,
}: DungeonTableRowProps) {
  const initials = getDungeonInitials(dungeon.dungeon.name, dungeon.dungeon.shortName)

  return (
    <div
      className={`grid h-[57px] w-full items-center px-lg ${className ?? ''}`}
      style={{ gridTemplateColumns }}
    >
      <div className="flex min-w-0 items-center gap-sm">
        <DungeonBadge initials={initials} index={index} />
        <span className="truncate text-base font-semibold leading-5 text-text-tertiary">
          {dungeon.dungeon.name}
        </span>
      </div>
      <p className="justify-self-center text-center font-number text-sm leading-[18px] text-text-primary">
        {dungeon.totalMistakes}
      </p>
      {mode === 'edit' ? (
        <>
          <StatCounter
            value={dungeon.deaths}
            field="deaths"
            onDelta={(delta) => onAdjust?.(dungeon.dungeon.id, 'deaths', delta)}
            disabled={disabled}
            className="justify-self-center"
          />
          <StatCounter
            value={dungeon.yeets}
            field="yeets"
            onDelta={(delta) => onAdjust?.(dungeon.dungeon.id, 'yeets', delta)}
            disabled={disabled}
            className="justify-self-center"
          />
        </>
      ) : (
        <>
          <p className="justify-self-center text-center font-number text-sm leading-[18px] text-stat-total">
            {dungeon.deaths}
          </p>
          <p className="justify-self-center text-center font-number text-sm leading-[18px] text-stat-deaths">
            {dungeon.yeets}
          </p>
        </>
      )}
    </div>
  )
}

interface DungeonTableRowProps {
  dungeon: DungeonStats
  index: number
  className?: string
  mode?: DungeonTableMode
  gridTemplateColumns?: string
  onAdjust?: (dungeonId: string, field: 'deaths' | 'yeets', delta: 1 | -1) => void
  disabled?: boolean
}
