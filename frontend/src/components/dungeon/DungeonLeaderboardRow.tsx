import { Link } from 'react-router-dom'
import type { DungeonLeaderboardEntry, SeasonSummary } from '../../api/types'
import { buildPageBackState, buildPlayerPath } from '../../utils/routes'
import { DeathsYeetsBar } from '../ui/DeathsYeetsBar'
import { PlayerAvatar } from '../ui/PlayerAvatar'
import { RankBadge } from '../ui/RankBadge'

export function DungeonLeaderboardRow({
  player,
  rank,
  season,
  playerBackTo,
}: DungeonLeaderboardRowProps) {
  const playerPath = season ? buildPlayerPath(season, { displayName: player.displayName }) : '#'
  const totalMistakes = player.totalMistakes
  const yeetLabel = player.yeets === 1 ? 'yeet' : 'yeets'

  return (
    <Link
      to={playerPath}
      state={playerBackTo ? buildPageBackState(playerBackTo) : undefined}
      className="group grid min-h-[74px] grid-cols-[52px_minmax(0,1fr)] items-center gap-md rounded-2xl border border-border-subtle bg-surface-base px-md py-md outline-none transition-colors hover:border-accent-primary focus:border-accent-primary focus-visible:border-accent-primary sm:grid-cols-[52px_minmax(0,1fr)_144px]"
    >
      <RankBadge rank={rank} />

      <div className="flex min-w-0 items-center gap-md">
        <PlayerAvatar
          playerId={player.playerId}
          displayName={player.displayName}
          avatarUrl={player.avatarUrl}
          size="sm"
          decorative
        />
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
        <DeathsYeetsBar
          deaths={player.deaths}
          yeets={player.yeets}
          className="mt-xs"
          aria-label={`${player.deaths} deaths and ${player.yeets} ${yeetLabel}`}
        />
      </div>
    </Link>
  )
}

interface DungeonLeaderboardRowProps {
  player: DungeonLeaderboardEntry
  rank: number
  season?: SeasonSummary
  playerBackTo?: string
}
