import { Link } from 'react-router-dom'
import type { DungeonLeaderboardEntry, SeasonSummary } from '../../api/types'
import { buildPlayerPath } from '../../utils/routes'
import { Avatar } from '../ui/Avatar'

export function DungeonLeaderboardRow({
  player,
  rank,
  season,
}: DungeonLeaderboardRowProps) {
  const playerPath = season ? buildPlayerPath(season, { displayName: player.displayName }) : '#'
  const totalMistakes = player.totalMistakes
  const deathsWidth =
    totalMistakes > 0 ? Math.round((player.deaths / totalMistakes) * 100) : 0
  const yeetsWidth = totalMistakes > 0 ? 100 - deathsWidth : 0
  const yeetLabel = player.yeets === 1 ? 'yeet' : 'yeets'

  return (
    <Link
      to={playerPath}
      className="group grid min-h-[74px] grid-cols-[36px_minmax(0,1fr)] items-center gap-md rounded-2xl border border-border-subtle bg-surface-base px-md py-md transition-colors hover:border-accent-primary sm:grid-cols-[36px_minmax(0,1fr)_144px]"
    >
      <div className="flex size-9 items-center justify-center rounded-pill border border-border-subtle">
        <span className="font-number text-sm font-bold text-text-secondary">{rank}</span>
      </div>

      <div className="flex min-w-0 items-center gap-md">
        <Avatar name={player.displayName} imageUrl={player.avatarUrl} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-base font-bold leading-[22px] text-text-primary transition-colors group-hover:text-accent-primary">
            {player.displayName}
          </p>
          <p className="text-sm font-semibold leading-[18px] text-text-secondary">
            {player.deaths} deaths · {player.yeets} {yeetLabel}
          </p>
        </div>
      </div>

      <div className="col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold leading-[14px] text-stat-total">
            Deaths / Yeets
          </span>
          <span className="font-number text-xl font-bold leading-6 text-text-primary">
            {totalMistakes}
          </span>
        </div>
        <div
          className="mt-xs flex h-2 overflow-hidden rounded-pill bg-overlay-dark"
          role="img"
          aria-label={`${player.deaths} deaths and ${player.yeets} ${yeetLabel}`}
        >
          <div className="h-full bg-stat-total" style={{ width: `${deathsWidth}%` }} />
          <div className="h-full bg-accent-purple" style={{ width: `${yeetsWidth}%` }} />
        </div>
      </div>
    </Link>
  )
}

interface DungeonLeaderboardRowProps {
  player: DungeonLeaderboardEntry
  rank: number
  season?: SeasonSummary
}
