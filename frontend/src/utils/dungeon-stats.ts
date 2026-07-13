import type { DungeonLeaderboardEntry, DungeonSummary } from "../api/types";

export interface DungeonHighlight {
  playerId: string;
  displayName: string;
  value: number;
  subtitle: string;
}

export interface DungeonMistakeMix {
  deathsPercent: number;
  yeetsPercent: number;
}

export interface DungeonAchievement {
  icon: string;
  title: string;
  description: string;
}

export interface DungeonReputationScores {
  dangerRating: number;
  yeetFactor: number;
  blameShare: number;
}

export interface DungeonMeatGrinderSummary {
  narrative: string;
  title: string;
}

function sortByName<T extends { displayName: string }>(entries: T[]): T[] {
  return [...entries].sort((first, second) =>
    first.displayName.localeCompare(second.displayName),
  );
}

function pickLeader(
  entries: DungeonLeaderboardEntry[],
  getValue: (entry: DungeonLeaderboardEntry) => number,
  tieBreak: (entry: DungeonLeaderboardEntry) => number,
): DungeonLeaderboardEntry | null {
  if (entries.length === 0) return null;

  const maxValue = Math.max(...entries.map(getValue));
  if (maxValue === 0) return null;

  return (
    sortByName(entries.filter((entry) => getValue(entry) === maxValue)).sort(
      (first, second) => tieBreak(second) - tieBreak(first),
    )[0] ?? null
  );
}

function pickSafestPlayer(
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

export function getAverageMistakesPerDungeon(
  dungeons: DungeonSummary[],
): number {
  if (dungeons.length === 0) return 0;
  const total = dungeons.reduce(
    (sum, dungeon) => sum + dungeon.totalMistakes,
    0,
  );
  return total / dungeons.length;
}

function scaleRatioToMeter(ratio: number): number {
  if (!Number.isFinite(ratio) || ratio <= 0) return 0;
  return Math.min(Math.round(ratio * 50), 100);
}

// dungeonTotalMistakes / seasonAverageMistakesPerDungeon, scaled to 0–100 (50 = normal)
export function getDangerScore(
  dungeon: DungeonSummary,
  seasonAverageMistakesPerDungeon: number,
): number {
  if (seasonAverageMistakesPerDungeon <= 0) {
    return dungeon.totalMistakes > 0 ? 100 : 0;
  }

  const dangerRatio = dungeon.totalMistakes / seasonAverageMistakesPerDungeon;
  return scaleRatioToMeter(dangerRatio);
}

// (dungeonYeets / dungeonMistakes) / (seasonYeets / seasonMistakes), scaled to 0–100 (50 = normal)
export function getYeetFactor(
  dungeon: DungeonSummary,
  allDungeons: DungeonSummary[],
): number {
  const dungeonTotalMistakes = dungeon.totalMistakes;
  if (dungeonTotalMistakes <= 0) return 0;

  const totalSeasonYeets = allDungeons.reduce(
    (sum, entry) => sum + entry.totalYeets,
    0,
  );
  const totalSeasonMistakes = allDungeons.reduce(
    (sum, entry) => sum + entry.totalMistakes,
    0,
  );
  if (totalSeasonYeets <= 0 || totalSeasonMistakes <= 0) return 0;

  const dungeonYeetShare = dungeon.totalYeets / dungeonTotalMistakes;
  const seasonYeetShare = totalSeasonYeets / totalSeasonMistakes;
  if (seasonYeetShare <= 0) return 0;

  const yeetRatio = dungeonYeetShare / seasonYeetShare;
  return scaleRatioToMeter(yeetRatio);
}

// topPlayerMistakesInDungeon / dungeonTotalMistakes as a 0–100 percentage
export function getBlameShare(
  dungeon: DungeonSummary,
  leaderboard: DungeonLeaderboardEntry[],
): number {
  const dungeonTotalMistakes = dungeon.totalMistakes;
  if (dungeonTotalMistakes <= 0) return 0;

  const topOffender = pickLeader(
    leaderboard,
    (entry) => entry.totalMistakes,
    (entry) => entry.yeets,
  );
  if (!topOffender) return 0;

  const topPlayerMistakesInDungeon = topOffender.totalMistakes;
  return Math.round((topPlayerMistakesInDungeon / dungeonTotalMistakes) * 100);
}

export function getDungeonHighlights(leaderboard: DungeonLeaderboardEntry[]): {
  biggestYeeter: DungeonHighlight | null;
  mostDeaths: DungeonHighlight | null;
  safestPlayer: DungeonHighlight | null;
} {
  const biggestYeeterEntry = pickLeader(
    leaderboard,
    (entry) => entry.yeets,
    (entry) => entry.deaths,
  );
  const mostDeathsEntry = pickLeader(
    leaderboard,
    (entry) => entry.deaths,
    (entry) => entry.yeets,
  );
  const safestPlayerEntry = pickSafestPlayer(leaderboard);

  return {
    biggestYeeter: biggestYeeterEntry
      ? {
          playerId: biggestYeeterEntry.playerId,
          displayName: biggestYeeterEntry.displayName,
          value: biggestYeeterEntry.yeets,
          subtitle: "biggest yeeter",
        }
      : null,
    mostDeaths: mostDeathsEntry
      ? {
          playerId: mostDeathsEntry.playerId,
          displayName: mostDeathsEntry.displayName,
          value: mostDeathsEntry.deaths,
          subtitle: "most deaths",
        }
      : null,
    safestPlayer: safestPlayerEntry
      ? {
          playerId: safestPlayerEntry.playerId,
          displayName: safestPlayerEntry.displayName,
          value: safestPlayerEntry.totalMistakes,
          subtitle:
            safestPlayerEntry.totalMistakes === 0 ? "mistakes" : "mistakes",
        }
      : null,
  };
}

export function getMistakeMix(dungeon: DungeonSummary): DungeonMistakeMix {
  if (dungeon.totalMistakes <= 0) {
    return { deathsPercent: 0, yeetsPercent: 0 };
  }

  const deathsPercent = Math.round(
    (dungeon.totalDeaths / dungeon.totalMistakes) * 100,
  );
  return {
    deathsPercent,
    yeetsPercent: 100 - deathsPercent,
  };
}

export function getDungeonAchievements(
  highlights: ReturnType<typeof getDungeonHighlights>,
): DungeonAchievement[] {
  return [
    {
      icon: "🚀",
      title: "Orbital Launch",
      description: highlights.biggestYeeter
        ? `${highlights.biggestYeeter.displayName} owns the yeet narrative here.`
        : "No yeet champion recorded yet.",
    },
    {
      icon: "🛡️",
      title: "Actually Focused",
      description: highlights.safestPlayer
        ? highlights.safestPlayer.value === 0
          ? `${highlights.safestPlayer.displayName} is currently the safest pick.`
          : `${highlights.safestPlayer.displayName} is currently the safest pick.`
        : "No safest player recorded yet.",
    },
    {
      icon: "🎯",
      title: "Mechanic Magnet",
      description: highlights.mostDeaths
        ? `${highlights.mostDeaths.displayName} found the floor most often.`
        : "No death magnet recorded yet.",
    },
  ];
}

export function getDungeonReputationScores(
  dungeon: DungeonSummary,
  allDungeons: DungeonSummary[],
  leaderboard: DungeonLeaderboardEntry[],
): DungeonReputationScores {
  const averageMistakes = getAverageMistakesPerDungeon(allDungeons);

  return {
    dangerRating: getDangerScore(dungeon, averageMistakes),
    yeetFactor: getYeetFactor(dungeon, allDungeons),
    blameShare: getBlameShare(dungeon, leaderboard),
  };
}

export function getReputationVerdicts(
  scores: DungeonReputationScores,
  dungeon: Pick<DungeonSummary, "totalMistakes" | "totalYeets">,
): string[] {
  return [
    getDangerVerdict(scores.dangerRating, dungeon.totalMistakes),
    getYeetVerdict(scores.yeetFactor, dungeon),
    getBlameVerdict(scores.blameShare, dungeon.totalMistakes),
  ];
}

function getDangerVerdict(
  dangerRating: number,
  dungeonTotalMistakes: number,
): string {
  if (dungeonTotalMistakes <= 0) {
    return "A quiet key so far. No recorded mistakes yet.";
  }
  if (dangerRating >= 80) {
    return "One of the roughest keys in the season.";
  }
  if (dangerRating >= 60) {
    return "Harder than most keys in the season.";
  }
  if (dangerRating >= 40) {
    return "About average pain in the season.";
  }
  return "Gentler than most keys in the season.";
}

function getYeetVerdict(
  yeetFactor: number,
  dungeon: Pick<DungeonSummary, "totalMistakes" | "totalYeets">,
): string {
  if (dungeon.totalMistakes <= 0) {
    return "No yeets recorded here yet.";
  }
  if (dungeon.totalYeets <= 0) {
    return "Deaths did all the work. Almost no yeets.";
  }
  if (yeetFactor >= 80) {
    return "Yeets are the main event here.";
  }
  if (yeetFactor >= 60) {
    return "Unusually yeet-heavy for the season.";
  }
  if (yeetFactor >= 40) {
    return "Yeet rate looks typical for the season.";
  }
  return "Fewer yeets here than the season average.";
}

function getBlameVerdict(
  blameShare: number,
  dungeonTotalMistakes: number,
): string {
  if (dungeonTotalMistakes <= 0) {
    return "No blame to assign here yet.";
  }
  if (blameShare >= 90) {
    return "Almost all the blame traces back to one player.";
  }
  if (blameShare >= 70) {
    return "One player owns most of the blame here.";
  }
  if (blameShare >= 40) {
    return "Blame is shared, with a few standouts here.";
  }
  return "Mistakes are spread across the group here.";
}

function getMistakeVolumeComparison(
  dungeonTotalMistakes: number,
  seasonAverageMistakesPerDungeon: number,
): string {
  if (seasonAverageMistakesPerDungeon <= 0) {
    return dungeonTotalMistakes > 0 ? "above" : "around";
  }
  if (dungeonTotalMistakes > seasonAverageMistakesPerDungeon * 1.1) {
    return "well above";
  }
  if (dungeonTotalMistakes < seasonAverageMistakesPerDungeon * 0.9) {
    return "below";
  }
  return "around";
}

export function getMeatGrinderSummary(
  dungeon: DungeonSummary,
  leaderboard: DungeonLeaderboardEntry[],
  allDungeons: DungeonSummary[],
): DungeonMeatGrinderSummary {
  const contributors = leaderboard.filter(
    (entry) => entry.totalMistakes > 0,
  ).length;
  const cleanPlayers = leaderboard.length - contributors;
  const averageMistakesPerDungeon = Number(
    getAverageMistakesPerDungeon(allDungeons).toFixed(1),
  );

  const yeetLabel = dungeon.totalYeets === 1 ? "yeet" : "yeets";
  const playerLabel = leaderboard.length === 1 ? "player" : "players";
  const cleanLabel =
    cleanPlayers === 1
      ? "player stayed clean here"
      : "players stayed clean here";

  const narrative =
    dungeon.totalMistakes <= 0
      ? `${dungeon.name} has stayed spotless. No recorded mistakes across ${leaderboard.length} ${playerLabel}. The season averages ${averageMistakesPerDungeon} mistakes per dungeon.`
      : `${dungeon.name} logged ${dungeon.totalMistakes} recorded mistakes: ${dungeon.totalDeaths} deaths and ${dungeon.totalYeets} ${yeetLabel}. ${contributors} of ${leaderboard.length} ${playerLabel} contributed; ${cleanPlayers} ${cleanLabel}. That's ${getMistakeVolumeComparison(dungeon.totalMistakes, averageMistakesPerDungeon)} the season average of ${averageMistakesPerDungeon} mistakes per dungeon.`;

  return {
    title: "The Meat Grinder",
    narrative,
  };
}

export function sortDungeonLeaderboard(
  leaderboard: DungeonLeaderboardEntry[],
): DungeonLeaderboardEntry[] {
  return [...leaderboard].sort((first, second) => {
    if (second.totalMistakes !== first.totalMistakes) {
      return second.totalMistakes - first.totalMistakes;
    }
    if (second.yeets !== first.yeets) return second.yeets - first.yeets;
    return first.displayName.localeCompare(second.displayName);
  });
}
