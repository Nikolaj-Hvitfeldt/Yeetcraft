import { PlayerStats, FilterTab } from '../hooks'
import { FilterTabs } from './FilterTabs'
import { LeaderboardRow } from './LeaderboardRow'
import { SkullIcon } from './SkullIcon'

interface LeaderboardProps {
  leaderboard: PlayerStats[]
  activeTab: FilterTab
  onTabChange: (tab: FilterTab) => void
}

/**
 * Main leaderboard panel with tabs and player rankings.
 */
export function Leaderboard({ leaderboard, activeTab, onTabChange }: LeaderboardProps) {
  return (
    <main className="wc-panel-gold animate-slide-up" style={{ animationDelay: '0.2s' }}>
      {/* Tab Navigation */}
      <FilterTabs activeTab={activeTab} onTabChange={onTabChange} />

      {/* Leaderboard Header */}
      <LeaderboardHeader activeTab={activeTab} />

      {/* Leaderboard Rows */}
      <div className="divide-y divide-warcraft-border/30">
        {leaderboard.length === 0 ? (
          <EmptyState />
        ) : (
          leaderboard.map((player, index) => (
            <LeaderboardRow
              key={player.playerName}
              player={player}
              rank={index + 1}
              activeTab={activeTab}
              animationIndex={index + 1}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <LeaderboardFooter playerCount={leaderboard.length} />
    </main>
  )
}

interface LeaderboardHeaderProps {
  activeTab: FilterTab
}

function LeaderboardHeader({ activeTab }: LeaderboardHeaderProps) {
  const columnLabel =
    activeTab === 'all'
      ? 'Total'
      : activeTab.charAt(0).toUpperCase() + activeTab.slice(1) + 's'

  return (
    <div className="flex items-center gap-4 px-6 py-3 border-b border-warcraft-border bg-warcraft-bg/30">
      <span className="w-10 text-center text-warcraft-text-dark text-xs uppercase tracking-wider">
        #
      </span>
      <span className="flex-1 text-warcraft-text-dark text-xs uppercase tracking-wider">
        Player
      </span>
      <span className="w-20 text-center text-warcraft-text-dark text-xs uppercase tracking-wider">
        {columnLabel}
      </span>
      {activeTab === 'all' && (
        <span className="w-32 text-center text-warcraft-text-dark text-xs uppercase tracking-wider hidden sm:block">
          Breakdown
        </span>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="py-12 text-center text-warcraft-text-muted">
      <SkullIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
      <p>No deaths recorded yet. Impressive!</p>
    </div>
  )
}

interface LeaderboardFooterProps {
  playerCount: number
}

function LeaderboardFooter({ playerCount }: LeaderboardFooterProps) {
  return (
    <div className="px-6 py-4 border-t border-warcraft-border bg-warcraft-bg/30">
      <p className="text-center text-warcraft-text-dark text-sm">
        {/* TODO: Dungeon filter dropdown will go here */}
        Showing all dungeons • {playerCount} {playerCount === 1 ? 'player' : 'players'} ranked
      </p>
    </div>
  )
}
