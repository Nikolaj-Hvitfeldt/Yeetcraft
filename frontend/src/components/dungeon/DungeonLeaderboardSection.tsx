import type { DungeonLeaderboardEntry, SeasonSummary } from "../../api/types";
import { PanelState } from "../ui/PanelState";
import { DungeonLeaderboardRow } from "./DungeonLeaderboardRow";

export function DungeonLeaderboardSection({
  leaderboard,
  season,
  playerBackTo,
  isLoading,
  error,
  onRetry,
}: DungeonLeaderboardSectionProps) {
  return (
    <section className="rounded-3xl border border-accent-secondary bg-surface-section p-xl">
      <div className="flex items-center justify-between gap-md">
        <h2 className="font-heading text-2xl font-bold leading-8 text-text-primary">
          Dungeon leaderboard
        </h2>
      </div>

      <PanelState
        className="pt-xl"
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        loadingMessage="Loading dungeon leaderboard..."
        emptyMessage="No players tracked for this dungeon yet."
        isEmpty={leaderboard.length === 0}
      >
        <div className="flex flex-col gap-md">
          {leaderboard.map((player, index) => (
            <DungeonLeaderboardRow
              key={player.playerId}
              player={player}
              rank={index + 1}
              season={season}
              playerBackTo={playerBackTo}
            />
          ))}
        </div>
      </PanelState>
    </section>
  );
}

interface DungeonLeaderboardSectionProps {
  leaderboard: DungeonLeaderboardEntry[];
  season?: SeasonSummary;
  playerBackTo?: string;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}
