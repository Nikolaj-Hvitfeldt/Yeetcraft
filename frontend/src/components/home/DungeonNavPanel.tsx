import type { DungeonSummary } from "../../api/types";
import { DungeonCard } from "./DungeonCard";

export function DungeonNavPanel({
  dungeons,
  isLoading,
  hasError,
  seasonId,
}: DungeonNavPanelProps) {
  return (
    <aside className="min-h-[586px] rounded-lg border border-accent-secondary bg-surface-section p-[17px] shadow-[0px_25px_25px_0px_rgba(0,0,0,0.2)]">
      <div className="h-[60px] pb-lg">
        <h2 className="font-heading text-xl font-bold leading-6 text-text-primary">
          Dungeons
        </h2>
      </div>

      <div className="flex flex-col gap-[10px] overflow-hidden rounded-lg">
        {isLoading && <PanelMessage message="Loading dungeons..." />}
        {hasError && !isLoading && (
          <PanelMessage message="Could not load dungeons." />
        )}
        {!isLoading && !hasError && dungeons.length === 0 && (
          <PanelMessage message="No current-season dungeons found." />
        )}
        {!isLoading &&
          !hasError &&
          dungeons.map((dungeon, index) => (
            <DungeonCard key={dungeon.id} dungeon={dungeon} index={index} seasonId={seasonId} />
          ))}
      </div>
    </aside>
  );
}

function PanelMessage({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-border-subtle bg-surface-base px-md py-lg text-sm text-text-secondary">
      {message}
    </div>
  );
}

interface DungeonNavPanelProps {
  dungeons: DungeonSummary[];
  isLoading: boolean;
  hasError: boolean;
  seasonId?: string;
}
