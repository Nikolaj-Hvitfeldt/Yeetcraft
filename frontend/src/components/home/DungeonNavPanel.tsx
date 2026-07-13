import type { DungeonSummary, SeasonSummary } from '../../api/types'
import type { DungeonBannerSeasonKey } from '../../assets/dungeon-images'
import { PanelState } from '../ui/PanelState'
import { DungeonCard } from './DungeonCard'

export function DungeonNavPanel({
  dungeons,
  isLoading,
  error,
  refreshError,
  onRetry,
  season,
  bannerSeasonKey,
}: DungeonNavPanelProps) {
  return (
    <aside className="min-h-[586px] rounded-lg border border-accent-secondary bg-surface-section p-[17px] shadow-[0px_25px_25px_0px_rgba(0,0,0,0.2)]">
      <div className="h-[60px] pb-lg">
        <h2 className="font-heading text-xl font-bold leading-6 text-text-primary">
          Dungeons
        </h2>
      </div>

      <PanelState
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        loadingMessage="Loading dungeons..."
        refreshError={refreshError}
        onRefreshRetry={onRetry}
        isEmpty={!isLoading && !error && dungeons.length === 0}
        emptyMessage="No current-season dungeons found."
        className="flex flex-col gap-[10px]"
      >
        {dungeons.length > 0
          ? dungeons.map((dungeon) => (
              <DungeonCard
                key={dungeon.id}
                dungeon={dungeon}
                season={season}
                bannerSeasonKey={bannerSeasonKey}
              />
            ))
          : null}
      </PanelState>
    </aside>
  )
}

interface DungeonNavPanelProps {
  dungeons: DungeonSummary[]
  isLoading: boolean
  error?: Error | null
  refreshError?: Error | null
  onRetry?: () => void
  season?: SeasonSummary
  bannerSeasonKey?: DungeonBannerSeasonKey
}
