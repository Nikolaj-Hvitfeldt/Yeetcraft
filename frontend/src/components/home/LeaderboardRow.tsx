import { Link } from 'react-router-dom'
import type { LeaderboardPlayerStats } from '../../hooks'
import type { SeasonSummary } from '../../api/types'
import { getPlayerProfile } from '../../utils/player-characters'
import { buildPageBackState, buildPlayerPath, buildSeasonHomePath } from '../../utils/routes'
import { CrownBadge } from '../ui/CrownBadge'
import { PlayerAvatar } from '../ui/PlayerAvatar'
import { RankBadge } from '../ui/RankBadge'
import { RoleTags } from '../ui/RoleTags'
import { StatItem } from '../ui/StatItem'

export function LeaderboardRow({
  player,
  rank,
  season,
  isKingOfYeets,
  isKingOfDeaths,
}: LeaderboardRowProps) {
  const playerPath = season ? buildPlayerPath(season, { displayName: player.playerName }) : '#'
  const roles = getPlayerProfile(player.playerName).roles

  return (
    <Link
      to={playerPath}
      state={season ? buildPageBackState(buildSeasonHomePath(season)) : undefined}
      className="group grid min-h-[85px] grid-cols-[52px_1fr] items-center gap-lg rounded-2xl border border-border-subtle bg-surface-base px-md py-md outline-none transition-colors hover:border-accent-primary focus:border-accent-primary focus-visible:border-accent-primary sm:grid-cols-[56px_minmax(220px,1fr)_minmax(230px,auto)]"
    >
      <RankBadge rank={rank} />

      <div className="flex min-w-0 items-center gap-lg">
        <PlayerAvatar
          playerId={player.playerId}
          displayName={player.playerName}
          avatarUrl={player.avatarUrl}
          size="sm"
          decorative
        />
        <div className="min-w-0">
          <p className="flex min-w-0 items-center gap-sm text-base font-bold leading-[22px] text-text-primary transition-colors group-hover:text-accent-primary">
            <span className="truncate">{player.playerName}</span>
            {isKingOfYeets ? <CrownBadge kind="yeets" /> : null}
            {isKingOfDeaths ? <CrownBadge kind="deaths" /> : null}
          </p>
          <RoleTags roles={roles} className="mt-xs" />
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
