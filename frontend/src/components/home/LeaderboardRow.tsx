import { Link } from 'react-router-dom'
import type { WowIconKey } from '../../assets/wow-icons'
import type { LeaderboardPlayerStats } from '../../hooks'
import { cn } from '../../utils/cn'
import type { SeasonSummary } from '../../api/types'
import { buildPageBackState, buildPlayerPath, buildSeasonHomePath } from '../../utils/routes'
import { WowIcon } from '../WowIcon'
import { Avatar } from '../ui/Avatar'
import { CrownBadge } from '../ui/CrownBadge'
import { StatItem } from '../ui/StatItem'

const RANK_ICON_BY_PLACE: Record<number, WowIconKey> = {
  1: 'gold',
  2: 'silver',
  3: 'bronze',
  4: 'platinum',
}

export function LeaderboardRow({
  player,
  rank,
  season,
  isKingOfYeets,
  isKingOfDeaths,
}: LeaderboardRowProps) {
  const rankIcon = RANK_ICON_BY_PLACE[rank]
  const playerPath = season ? buildPlayerPath(season, { displayName: player.playerName }) : '#'

  return (
    <Link
      to={playerPath}
      state={season ? buildPageBackState(buildSeasonHomePath(season)) : undefined}
      className="group grid min-h-[85px] grid-cols-[52px_1fr] items-center gap-lg rounded-2xl border border-border-subtle bg-surface-base px-md py-md transition-colors hover:border-accent-primary sm:grid-cols-[56px_minmax(220px,1fr)_minmax(230px,auto)]"
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

      <div className="flex min-w-0 items-center gap-lg">
        <Avatar name={player.playerName} imageUrl={player.avatarUrl} size="sm" />
        <div className="min-w-0">
          <p className="flex min-w-0 items-center gap-sm text-base font-bold leading-[22px] text-text-primary transition-colors group-hover:text-accent-primary">
            <span className="truncate">{player.playerName}</span>
            {isKingOfYeets ? <CrownBadge kind="yeets" /> : null}
            {isKingOfDeaths ? <CrownBadge kind="deaths" /> : null}
          </p>
          <p className="text-sm font-semibold leading-[18px] text-text-secondary">
            Tracked player
          </p>
        </div>
      </div>

      <div className="col-span-2 flex justify-end gap-lg sm:col-span-1">
        <StatItem label="Total" value={player.total} kind="total" variant="inline" />
        <StatItem label="Deaths" value={player.deaths} kind="deaths" variant="inline" />
        <StatItem label="Yeets" value={player.yeets} kind="yeets" variant="inline" />
      </div>
    </Link>
  )
}

interface LeaderboardRowProps {
  player: LeaderboardPlayerStats
  rank: number
  season?: SeasonSummary
  isKingOfYeets: boolean
  isKingOfDeaths: boolean
}
