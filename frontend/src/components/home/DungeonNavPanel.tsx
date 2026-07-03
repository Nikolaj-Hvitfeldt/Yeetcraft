import type { DungeonSummary } from '../../api/types'
import { DungeonCard } from './DungeonCard'

export function DungeonNavPanel({ dungeons, isLoading, hasError }: DungeonNavPanelProps) {
  return (
    <aside className="rounded-lg border border-accent-secondary bg-surface-section p-lg shadow-2xl">
      <div className="pb-lg">
        <h2 className="font-heading text-xl font-bold leading-6 text-text-primary">Dungeons</h2>
      </div>

      <div className="flex flex-col gap-[10px]">
        {isLoading && <PanelMessage message="Loading dungeons..." />}
        {hasError && !isLoading && <PanelMessage message="Could not load dungeons." />}
        {!isLoading && !hasError && dungeons.length === 0 && (
          <PanelMessage message="No current-season dungeons found." />
        )}
        {!isLoading && !hasError && dungeons.map((dungeon, index) => (
          <DungeonCard
            key={dungeon.id}
            dungeon={dungeon}
            index={index}
          />
        ))}
      </div>
    </aside>
  )
}

function PanelMessage({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-border-subtle bg-surface-base px-md py-lg text-sm text-text-secondary">
      {message}
    </div>
  )
}

interface DungeonNavPanelProps {
  dungeons: DungeonSummary[]
  isLoading: boolean
  hasError: boolean
}
