import type { SeasonSummary } from '../../api/types'
import type { PlayerStats } from '../../hooks'
import { SkullIcon } from '../SkullIcon'
import { LeaderboardRow } from './LeaderboardRow'
import { SeasonPicker } from './SeasonPicker'

export function RankingsPanel({ leaderboard, seasons, selectedSeasonId, onSeasonChange }: RankingsPanelProps) {
  return (
    <section className="rounded-lg border border-accent-secondary bg-surface-section p-2xl shadow-2xl">
      <div className="flex flex-col gap-lg sm:flex-row sm:items-start sm:justify-between">
        <h2 className="font-heading text-3xl font-bold leading-9 text-text-accent">Rankings</h2>
        <SeasonPicker
          seasons={seasons}
          selectedSeasonId={selectedSeasonId}
          onSeasonChange={onSeasonChange}
        />
      </div>

      <div className="mt-xl flex flex-col gap-md">
        {leaderboard.length > 0 ? (
          leaderboard.map((player, index) => (
            <LeaderboardRow
              key={player.playerId}
              player={player}
              rank={index + 1}
            />
          ))
        ) : (
          <div className="rounded-md border border-border-subtle bg-surface-base px-2xl py-4xl text-center text-text-secondary">
            <SkullIcon className="mx-auto mb-md size-12 opacity-40" />
            <p>No mistakes recorded yet.</p>
          </div>
        )}
      </div>

      <p className="pt-2xl text-center text-xs leading-4 text-text-secondary">
        Showing all dungeons - {leaderboard.length} {leaderboard.length === 1 ? 'player' : 'players'} ranked - click a player for details
      </p>
    </section>
  )
}

interface RankingsPanelProps {
  leaderboard: PlayerStats[]
  seasons: SeasonSummary[]
  selectedSeasonId: string
  onSeasonChange: (seasonId: string) => void
}
