import type { DungeonStats, SeasonLeadersResponse } from "../api/types";
import { countDungeonsWithMistakes, getNemesisDungeon } from "./player-stats";

const NEMESIS_SHARE_MEDIUM_THRESHOLD = 35;
const NEMESIS_SHARE_LOW_THRESHOLD = 30;
const YEET_RATIO_THRESHOLD = 0.65;
const DEATH_RATIO_THRESHOLD = 0.65;
const BALANCED_RATIO_MIN = 0.35;
const BALANCED_RATIO_MAX = 0.65;
const CHRONIC_TOURIST_MIN_DUNGEONS = 6;
const EQUAL_OPPORTUNITY_MIN_MISTAKES = 40;

export type FlavorTitleInput = {
  totalDeaths: number;
  totalYeets: number;
  totalMistakes: number;
  dungeons: DungeonStats[];
  playerId: string;
  seasonLeaders?: SeasonLeadersResponse | null;
  leaderboardRank?: number | null;
};

function getDungeonName(dungeon: DungeonStats): string {
  return dungeon.dungeon.name
}

function isKingOfYeets(input: FlavorTitleInput): boolean {
  return input.seasonLeaders?.kingOfYeets?.playerId === input.playerId;
}

function isKingOfDeaths(input: FlavorTitleInput): boolean {
  return input.seasonLeaders?.kingOfDeaths?.playerId === input.playerId;
}

function getFavoriteVictimDungeon(
  playerId: string,
  dungeons: DungeonStats[],
  seasonLeaders?: SeasonLeadersResponse | null,
): DungeonStats | null {
  const dungeonMistakeLeaders = seasonLeaders?.dungeonMistakeLeaders ?? [];
  if (dungeonMistakeLeaders.length === 0) return null;

  const leaderByDungeonId = new Map(
    dungeonMistakeLeaders.map((leader) => [leader.dungeonId, leader]),
  );

  const ledDungeons = dungeons.filter((row) => {
    const leader = leaderByDungeonId.get(row.dungeon.id);
    return leader?.playerId === playerId && row.totalMistakes > 0;
  });

  if (ledDungeons.length === 0) return null;

  return ledDungeons.reduce((best, current) =>
    current.totalMistakes > best.totalMistakes ? current : best,
  );
}

function isDungeonMistakeLeader(
  playerId: string,
  dungeonId: string,
  seasonLeaders?: SeasonLeadersResponse | null,
): boolean {
  return (
    seasonLeaders?.dungeonMistakeLeaders?.some(
      (leader) => leader.dungeonId === dungeonId && leader.playerId === playerId,
    ) ?? false
  );
}

export function getPlayerFlavorTitle(input: FlavorTitleInput): string {
  if (isKingOfYeets(input)) {
    return "Fall Guy";
  }

  if (isKingOfDeaths(input)) {
    return "Gravekeeper";
  }

  if (input.leaderboardRank === 1) {
    return "Shamed King";
  }

  if (input.totalMistakes === 0) {
    return "Still on the Loading Screen";
  }

  const nemesis = getNemesisDungeon(input.dungeons);
  const yeetRatio = input.totalYeets / input.totalMistakes;
  const deathRatio = input.totalDeaths / input.totalMistakes;
  const dungeonsWithMistakes = countDungeonsWithMistakes(input.dungeons);
  const favoriteVictimDungeon = getFavoriteVictimDungeon(
    input.playerId,
    input.dungeons,
    input.seasonLeaders,
  );

  if (favoriteVictimDungeon) {
    return `${getDungeonName(favoriteVictimDungeon)}'s Favorite Victim`;
  }

  if (
    nemesis &&
    nemesis.sharePercent >= NEMESIS_SHARE_MEDIUM_THRESHOLD &&
    !isDungeonMistakeLeader(
      input.playerId,
      nemesis.dungeon.dungeon.id,
      input.seasonLeaders,
    )
  ) {
    return `Held Hostage by ${getDungeonName(nemesis.dungeon)}`;
  }

  if (yeetRatio >= YEET_RATIO_THRESHOLD) {
    return "Cliff Diver";
  }

  if (deathRatio >= DEATH_RATIO_THRESHOLD) {
    return "Floor Inspector";
  }

  if (
    dungeonsWithMistakes >= CHRONIC_TOURIST_MIN_DUNGEONS &&
    (nemesis?.sharePercent ?? 0) < NEMESIS_SHARE_LOW_THRESHOLD
  ) {
    return "Chronic Tourist";
  }

  if (
    input.totalMistakes >= EQUAL_OPPORTUNITY_MIN_MISTAKES &&
    yeetRatio >= BALANCED_RATIO_MIN &&
    yeetRatio <= BALANCED_RATIO_MAX &&
    deathRatio >= BALANCED_RATIO_MIN &&
    deathRatio <= BALANCED_RATIO_MAX
  ) {
    return "Equal Opportunity Blunderer";
  }

  return "Season Adventurer";
}
