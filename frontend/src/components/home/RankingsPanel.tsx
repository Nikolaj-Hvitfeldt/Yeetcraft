import type { FilterTab, PlayerStats } from '../../hooks'
import { SkullIcon } from '../SkullIcon'
import { LeaderboardFilter } from './LeaderboardFilter'
import { LeaderboardRow } from './LeaderboardRow'

export function RankingsPanel({ activeTab, leaderboard, seasonLabel, onTabChange }: RankingsPanelProps) {
  return (
    <section className="rounded-lg border border-accent-secondary bg-surface-section p-2xl shadow-2xl">
      <div className="flex flex-col gap-lg sm:flex-row sm:items-start sm:justify-between">
        <h2 className="font-heading text-3xl font-bold leading-9 text-text-accent">Rankings</h2>
        <LeaderboardFilter
          activeTab={activeTab}
          seasonLabel={seasonLabel}
          onTabChange={onTabChange}
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
            <p>No mistakes recorded for this filter.</p>
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
  activeTab: FilterTab
  leaderboard: PlayerStats[]
  seasonLabel: string
  onTabChange: (tab: FilterTab) => void
}
