import { Link } from 'react-router-dom'
import type { DungeonStats } from '../../api/types'
import { seasonPath } from '../../utils/season'
import { cn } from '../../utils/cn'
import { StatCounter } from './StatCounter'

type DungeonTableMode = 'browse' | 'edit'

const BROWSE_ROW_CLASS =
  'group grid h-[57px] w-full items-center px-lg transition-colors hover:bg-surface-base/60'

export function DungeonTableRow({
  dungeon,
  className,
  mode = 'browse',
  seasonId,
  gridTemplateColumns = 'minmax(0, 3.5fr) minmax(5.5rem, 1fr) minmax(5.5rem, 1fr) minmax(5.5rem, 1fr)',
  onAdjust,
  disabled = false,
}: DungeonTableRowProps) {
  const dungeonPath = seasonPath(`/dungeon/${dungeon.dungeon.id}`, seasonId)
  const rowStyle = { gridTemplateColumns }

  const dungeonCell = (
    <div className="flex min-w-0 items-center">
      <span
        className={cn(
          'truncate text-base font-semibold leading-5 text-text-tertiary transition-colors',
          mode === 'browse' && 'group-hover:text-accent-primary',
        )}
      >
        {dungeon.dungeon.name}
      </span>
    </div>
  )

  const statsCells = (
    <>
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
    </>
  )

  if (mode === 'browse') {
    return (
      <Link
        to={dungeonPath}
        className={cn(BROWSE_ROW_CLASS, className)}
        style={rowStyle}
      >
        {dungeonCell}
        {statsCells}
      </Link>
    )
  }

  return (
    <div
      className={cn('grid h-[57px] w-full items-center px-lg', className)}
      style={rowStyle}
    >
      {dungeonCell}
      {statsCells}
    </div>
  )
}

interface DungeonTableRowProps {
  dungeon: DungeonStats
  className?: string
  mode?: DungeonTableMode
  seasonId?: string
  gridTemplateColumns?: string
  onAdjust?: (dungeonId: string, field: 'deaths' | 'yeets', delta: 1 | -1) => void
  disabled?: boolean
}
