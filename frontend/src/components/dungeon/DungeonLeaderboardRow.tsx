import { Link } from 'react-router-dom'
import type { WowIconKey } from '../../assets/wow-icons'
import type { DungeonLeaderboardEntry, SeasonSummary } from '../../api/types'
import { cn } from '../../utils/cn'
import { buildPlayerPath } from '../../utils/routes'
import { Avatar } from '../ui/Avatar'
import { WowIcon } from '../WowIcon'

const RANK_ICON_BY_PLACE: Record<number, WowIconKey> = {
  1: 'gold',
  2: 'silver',
  3: 'bronze',
  4: 'platinum',
}

export function DungeonLeaderboardRow({
  player,
  rank,
  season,
}: DungeonLeaderboardRowProps) {
  const rankIcon = RANK_ICON_BY_PLACE[rank]
  const playerPath = season ? buildPlayerPath(season, { displayName: player.displayName }) : '#'
  const totalMistakes = player.totalMistakes
  const deathsWidth =
    totalMistakes > 0 ? Math.round((player.deaths / totalMistakes) * 100) : 0
  const yeetsWidth = totalMistakes > 0 ? 100 - deathsWidth : 0
  const yeetLabel = player.yeets === 1 ? 'yeet' : 'yeets'

  return (
    <Link
      to={playerPath}
      className="group grid min-h-[74px] grid-cols-[52px_minmax(0,1fr)] items-center gap-md rounded-2xl border border-border-subtle bg-surface-base px-md py-md transition-colors hover:border-accent-primary sm:grid-cols-[52px_minmax(0,1fr)_144px]"
    >
      <div
        className={cn(
          'flex shrink-0 flex-col items-center',
          rankIcon ? 'gap-0.5' : 'size-11 justify-center',
        )}
      >
        {rankIcon ? (
          <WowIcon icon={rankIcon} size={44} objectFit="contain" className="size-11" />
        ) : null}
        <span
          className={cn(
            'font-number font-bold leading-none text-text-secondary',
            rankIcon ? 'text-xs' : 'text-sm',
          )}
        >
          {rank}
        </span>
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
