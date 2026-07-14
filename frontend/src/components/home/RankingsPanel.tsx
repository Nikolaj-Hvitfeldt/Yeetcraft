import type { SeasonSummary } from '../../api/types'
import type { LeaderboardPlayerStats } from '../../hooks'
import { formatSeasonLabel } from '../../utils/season'
import { PanelState } from '../ui/PanelState'
import { Tag } from '../ui/Tag'
import { LeaderboardRow } from './LeaderboardRow'
import { SeasonPicker } from './SeasonPicker'

export function RankingsPanel({
  leaderboard,
  seasons,
  selectedSeasonId,
  isLoading,
  error,
  refreshError,
  onRetry,
  onSeasonChange,
  kingOfYeetsId,
  kingOfDeathsId,
}: RankingsPanelProps) {
  const selectedSeason = seasons.find((season) => season.id === selectedSeasonId)
  const seasonLabel = formatSeasonLabel(selectedSeason)
  const playerLabel = leaderboard.length === 1 ? 'player' : 'players'

  return (
    <section className="rounded-lg border border-accent-secondary bg-surface-section p-2xl shadow-2xl">
      <div className="flex flex-col gap-lg sm:flex-row sm:items-start sm:justify-between">
        <h2 className="font-heading text-3xl font-bold leading-9 text-text-accent">
          Rankings
        </h2>
        <SeasonPicker
          seasons={seasons}
          selectedSeasonId={selectedSeasonId}
          onSeasonChange={onSeasonChange}
        />
      </div>

      <div className="mt-xl">
        <PanelState
          className="flex flex-col gap-md"
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
          loadingMessage="Loading rankings..."
          refreshError={refreshError}
          onRefreshRetry={onRetry}
          isEmpty={!isLoading && !error && leaderboard.length === 0}
          emptyMessage="No mistakes recorded yet."
        >
          {leaderboard.length > 0
            ? leaderboard.map((player, index) => (
                <LeaderboardRow
                  key={player.playerId}
                  player={player}
                  rank={index + 1}
                  season={seasons.find((season) => season.id === selectedSeasonId)}
                  isKingOfYeets={player.playerId === kingOfYeetsId}
                  isKingOfDeaths={player.playerId === kingOfDeathsId}
                />
              ))
            : null}
        </PanelState>
      </div>

      <div className="flex flex-col items-center gap-sm pt-2xl text-center sm:flex-row sm:justify-center">
        <Tag>
          {leaderboard.length} {playerLabel} ranked
        </Tag>
        <Tag>{seasonLabel}</Tag>
        <Tag>Click a player for details</Tag>
      </div>
    </section>
  )
}

interface RankingsPanelProps {
  leaderboard: LeaderboardPlayerStats[]
  seasons: SeasonSummary[]
  selectedSeasonId: string
  isLoading?: boolean
  error?: Error | null
  refreshError?: Error | null
  onRetry?: () => void
  onSeasonChange: (seasonId: string) => void
  kingOfYeetsId: string | null
  kingOfDeathsId: string | null
}
