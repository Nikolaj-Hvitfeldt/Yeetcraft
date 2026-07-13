import { useMemo } from "react";
import type { SeasonSummary } from "../../api/types";
import { getSeasonKings, type PlayerStats } from "../../hooks";
import { cn } from "../../utils/cn";
import { SkullIcon } from "../SkullIcon";
import { LoadingSpinner } from "../LoadingSpinner";
import { Tag } from "../ui/Tag";
import { LeaderboardRow } from "./LeaderboardRow";
import { SeasonPicker } from "./SeasonPicker";

export function RankingsPanel({
  leaderboard,
  seasons,
  selectedSeasonId,
  isLoading,
  error,
  onSeasonChange,
}: RankingsPanelProps) {
  const { kingOfYeetsId, kingOfDeathsId } = useMemo(
    () => getSeasonKings(leaderboard),
    [leaderboard],
  );

  const playerLabel = leaderboard.length === 1 ? "player" : "players";

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

      <div className="mt-xl flex flex-col gap-md">
        {isLoading ? (
          <div className="flex justify-center py-4xl">
            <LoadingSpinner message="Loading rankings..." />
          </div>
        ) : error && leaderboard.length === 0 ? (
          <div className="rounded-md border border-border-subtle bg-surface-base px-2xl py-4xl text-center text-text-secondary">
            <p>{error.message}</p>
          </div>
        ) : leaderboard.length > 0 ? (
          leaderboard.map((player, index) => (
            <LeaderboardRow
              key={player.playerId}
              player={player}
              rank={index + 1}
              seasonId={selectedSeasonId || undefined}
              isKingOfYeets={player.playerId === kingOfYeetsId}
              isKingOfDeaths={player.playerId === kingOfDeathsId}
            />
          ))
        ) : (
          <div className="rounded-md border border-border-subtle bg-surface-base px-2xl py-4xl text-center text-text-secondary">
            <SkullIcon className="mx-auto mb-md size-12 opacity-40" />
            <p>No mistakes recorded yet.</p>
          </div>
        )}
      </div>

      <div
        className={cn(
          "flex flex-col items-center gap-sm pt-2xl text-center sm:flex-row sm:justify-center",
        )}
      >
        <Tag>Showing all dungeons</Tag>
        <Tag>
          {leaderboard.length} {playerLabel} ranked
        </Tag>
        <Tag>Click a player for details</Tag>
      </div>
    </section>
  );
}

interface RankingsPanelProps {
  leaderboard: PlayerStats[];
  seasons: SeasonSummary[];
  selectedSeasonId: string;
  isLoading?: boolean;
  error?: Error | null;
  onSeasonChange: (seasonId: string) => void;
}
