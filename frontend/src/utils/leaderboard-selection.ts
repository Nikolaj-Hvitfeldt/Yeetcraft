import type { DungeonLeaderboardEntry } from "../api/types";

export function sortByName<T extends { displayName: string }>(
  entries: T[],
): T[] {
  return [...entries].sort((first, second) =>
    first.displayName.localeCompare(second.displayName),
  );
}

export function pickLeader<T extends { displayName: string }>(
  entries: T[],
  getValue: (entry: T) => number,
  tieBreak: (entry: T) => number,
): T | null {
  if (entries.length === 0) return null;

  const maxValue = Math.max(...entries.map(getValue));
  if (maxValue === 0) return null;

  return (
    sortByName(entries.filter((entry) => getValue(entry) === maxValue)).sort(
      (first, second) => tieBreak(second) - tieBreak(first),
    )[0] ?? null
  );
}

export function pickSafestPlayer(
  entries: DungeonLeaderboardEntry[],
): DungeonLeaderboardEntry | null {
  if (entries.length === 0) return null;

  const minMistakes = Math.min(...entries.map((entry) => entry.totalMistakes));

  return (
    sortByName(
      entries.filter((entry) => entry.totalMistakes === minMistakes),
    ).sort((first, second) => {
      if (first.deaths !== second.deaths) return first.deaths - second.deaths;
      return first.displayName.localeCompare(second.displayName);
    })[0] ?? null
  );
}
