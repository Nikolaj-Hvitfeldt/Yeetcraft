import { PlayerStats, FilterTab } from '../hooks'

interface LeaderboardRowProps {
  player: PlayerStats
  rank: number
  activeTab: FilterTab
  animationIndex: number
}

/**
 * Single row in the leaderboard.
 */
export function LeaderboardRow({ player, rank, activeTab, animationIndex }: LeaderboardRowProps) {
  const rankClass =
    rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : 'rank-default'

  return (
    <div
      className={`leaderboard-row animate-slide-up stagger-${Math.min(animationIndex, 10)}`}
      style={{ animationFillMode: 'both' }}
    >
      {/* Rank */}
      <div className={`rank-number ${rankClass}`}>{rank}</div>

      {/* Player Name */}
      <div className="flex-1 min-w-0">
        <span className="text-lg font-semibold text-warcraft-text truncate block">
          {player.playerName}
        </span>
      </div>

      {/* Total Count */}
      <div className="w-20 text-center">
        <span className="text-2xl font-warcraft font-bold text-warcraft-gold">
          {player.total}
        </span>
      </div>

      {/* Breakdown (only shown in "all" view) */}
      {activeTab === 'all' && (
        <div className="w-32 hidden sm:flex justify-center gap-2">
          {player.deaths > 0 && (
            <span className="mistake-badge mistake-badge-death" title="Deaths">
              {player.deaths}
            </span>
          )}
          {player.yeets > 0 && (
            <span className="mistake-badge mistake-badge-yeet" title="Yeets">
              {player.yeets}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
