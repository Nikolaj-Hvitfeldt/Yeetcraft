import type { DungeonMistakeLeader, DungeonSummary } from "../api/types";
import {
  getFlavorDescription,
  type FlavorDescriptionContext,
} from "./dungeon-flavor-description";
import { getAverageMistakesPerDungeon } from "./dungeon-stats";

export type { FlavorDescriptionContext } from "./dungeon-flavor-description";

const YEET_SHARE_THRESHOLD = 0.65;
const DEATH_SHARE_THRESHOLD = 0.65;
const MIN_MISTAKES_FOR_BLAME_TITLES = 3;

export type DungeonFlavorTitleInput = {
  dungeon: DungeonSummary;
  allDungeons: DungeonSummary[];
  dungeonMistakeLeaders?: DungeonMistakeLeader[];
  descriptionContext?: FlavorDescriptionContext;
};

export type DungeonFlavorTitleResult = {
  title: string;
  description: string;
};

type DungeonTitleContext = {
  allDungeons: DungeonSummary[];
  blameShareByDungeonId: Map<string, number>;
};

type UniqueDungeonTitleRule = {
  title: string;
  pickWinner: (
    dungeons: DungeonSummary[],
    context: DungeonTitleContext,
    excludedDungeonIds: Set<string>,
  ) => DungeonSummary | null;
};

function compareDungeonTieBreak(
  first: DungeonSummary,
  second: DungeonSummary,
): number {
  if (first.displayOrder !== second.displayOrder) {
    return first.displayOrder - second.displayOrder;
  }
  return first.name.localeCompare(second.name);
}

function pickHighestScoringDungeon(
  dungeons: DungeonSummary[],
  excludedDungeonIds: Set<string>,
  getScore: (dungeon: DungeonSummary, context: DungeonTitleContext) => number,
  context: DungeonTitleContext,
  minimumScore = 1,
): DungeonSummary | null {
  const eligible = dungeons.filter(
    (dungeon) => !excludedDungeonIds.has(dungeon.id),
  );
  let winner: DungeonSummary | null = null;
  let winningScore = minimumScore - 1;

  for (const dungeon of eligible) {
    const score = getScore(dungeon, context);
    if (score < minimumScore) continue;

    if (
      !winner ||
      score > winningScore ||
      (score === winningScore && compareDungeonTieBreak(dungeon, winner) < 0)
    ) {
      winner = dungeon;
      winningScore = score;
    }
  }

  return winner;
}

function pickLowestScoringDungeon(
  dungeons: DungeonSummary[],
  excludedDungeonIds: Set<string>,
  getScore: (dungeon: DungeonSummary, context: DungeonTitleContext) => number,
  context: DungeonTitleContext,
  isEligible?: (
    dungeon: DungeonSummary,
    context: DungeonTitleContext,
  ) => boolean,
): DungeonSummary | null {
  const eligible = dungeons.filter(
    (dungeon) =>
      !excludedDungeonIds.has(dungeon.id) &&
      (isEligible ? isEligible(dungeon, context) : true),
  );
  let winner: DungeonSummary | null = null;
  let winningScore = Number.POSITIVE_INFINITY;

  for (const dungeon of eligible) {
    const score = getScore(dungeon, context);
    if (
      !winner ||
      score < winningScore ||
      (score === winningScore && compareDungeonTieBreak(dungeon, winner) < 0)
    ) {
      winner = dungeon;
      winningScore = score;
    }
  }

  return winner;
}

function getYeetShare(dungeon: DungeonSummary): number {
  if (dungeon.totalMistakes <= 0 || dungeon.totalYeets <= 0) return 0;
  return dungeon.totalYeets / dungeon.totalMistakes;
}

function getDeathShare(dungeon: DungeonSummary): number {
  if (dungeon.totalMistakes <= 0 || dungeon.totalDeaths <= 0) return 0;
  return dungeon.totalDeaths / dungeon.totalMistakes;
}

function buildBlameShareByDungeonId(
  allDungeons: DungeonSummary[],
  dungeonMistakeLeaders: DungeonMistakeLeader[],
): Map<string, number> {
  const leaderMistakesByDungeonId = new Map(
    dungeonMistakeLeaders.map((leader) => [
      leader.dungeonId,
      leader.totalMistakes,
    ]),
  );
  const blameShareByDungeonId = new Map<string, number>();

  for (const dungeon of allDungeons) {
    const topPlayerMistakes = leaderMistakesByDungeonId.get(dungeon.id) ?? 0;
    if (dungeon.totalMistakes <= 0 || topPlayerMistakes <= 0) {
      blameShareByDungeonId.set(dungeon.id, 0);
      continue;
    }

    blameShareByDungeonId.set(
      dungeon.id,
      Math.round((topPlayerMistakes / dungeon.totalMistakes) * 100),
    );
  }

  return blameShareByDungeonId;
}

function buildDungeonTitleContext(
  input: DungeonFlavorTitleInput,
): DungeonTitleContext {
  return {
    allDungeons: input.allDungeons,
    blameShareByDungeonId: buildBlameShareByDungeonId(
      input.allDungeons,
      input.dungeonMistakeLeaders ?? [],
    ),
  };
}

const UNIQUE_DUNGEON_TITLE_RULES: UniqueDungeonTitleRule[] = [
  {
    title: "The Meat Grinder",
    pickWinner: (dungeons, context, excludedDungeonIds) =>
      pickHighestScoringDungeon(
        dungeons,
        excludedDungeonIds,
        (dungeon) => dungeon.totalMistakes,
        context,
      ),
  },
  {
    title: "The Launch Pad",
    pickWinner: (dungeons, context, excludedDungeonIds) =>
      pickHighestScoringDungeon(
        dungeons,
        excludedDungeonIds,
        (dungeon) => dungeon.totalYeets,
        context,
      ),
  },
  {
    title: "The Graveyard Shift",
    pickWinner: (dungeons, context, excludedDungeonIds) =>
      pickHighestScoringDungeon(
        dungeons,
        excludedDungeonIds,
        (dungeon) => dungeon.totalDeaths,
        context,
      ),
  },
  {
    title: "The Scapegoat Factory",
    pickWinner: (dungeons, context, excludedDungeonIds) =>
      pickHighestScoringDungeon(
        dungeons,
        excludedDungeonIds,
        (dungeon, titleContext) =>
          titleContext.blameShareByDungeonId.get(dungeon.id) ?? 0,
        context,
        70,
      ),
  },
  {
    title: "The Yeet Cannon",
    pickWinner: (dungeons, context, excludedDungeonIds) =>
      pickHighestScoringDungeon(
        dungeons,
        excludedDungeonIds,
        (dungeon) => Math.round(getYeetShare(dungeon) * 100),
        context,
        1,
      ),
  },
  {
    title: "The Floor Is Lava",
    pickWinner: (dungeons, context, excludedDungeonIds) =>
      pickHighestScoringDungeon(
        dungeons,
        excludedDungeonIds,
        (dungeon) => Math.round(getDeathShare(dungeon) * 100),
        context,
        1,
      ),
  },
  {
    title: "The Committee Meeting",
    pickWinner: (dungeons, context, excludedDungeonIds) =>
      pickLowestScoringDungeon(
        dungeons,
        excludedDungeonIds,
        (dungeon, titleContext) =>
          titleContext.blameShareByDungeonId.get(dungeon.id) ?? 100,
        context,
        (dungeon, titleContext) => {
          const blameShare =
            titleContext.blameShareByDungeonId.get(dungeon.id) ?? 0;
          return (
            dungeon.totalMistakes >= MIN_MISTAKES_FOR_BLAME_TITLES &&
            blameShare > 0 &&
            blameShare < 100
          );
        },
      ),
  },
  {
    title: "The Quiet Lobby",
    pickWinner: (dungeons, context, excludedDungeonIds) =>
      pickLowestScoringDungeon(
        dungeons,
        excludedDungeonIds,
        (dungeon) => dungeon.totalMistakes,
        context,
      ),
  },
];

export function assignUniqueDungeonTitles(
  input: Pick<DungeonFlavorTitleInput, "allDungeons" | "dungeonMistakeLeaders">,
): Map<string, string> {
  const context = buildDungeonTitleContext({
    dungeon: input.allDungeons[0] ?? {
      id: "",
      name: "",
      shortName: null,
      displayOrder: 0,
      totalDeaths: 0,
      totalYeets: 0,
      totalMistakes: 0,
    },
    allDungeons: input.allDungeons,
    dungeonMistakeLeaders: input.dungeonMistakeLeaders,
  });
  const titlesByDungeonId = new Map<string, string>();
  const claimedDungeonIds = new Set<string>();

  for (const rule of UNIQUE_DUNGEON_TITLE_RULES) {
    const winner = rule.pickWinner(
      input.allDungeons,
      context,
      claimedDungeonIds,
    );
    if (!winner) continue;

    titlesByDungeonId.set(winner.id, rule.title);
    claimedDungeonIds.add(winner.id);
  }

  return titlesByDungeonId;
}

function getFallbackDungeonTitle(
  dungeon: DungeonSummary,
  allDungeons: DungeonSummary[],
): string {
  if (dungeon.totalMistakes <= 0) {
    return "The Clean Record";
  }

  const yeetShare = getYeetShare(dungeon);
  const deathShare = getDeathShare(dungeon);
  const seasonAverageMistakes = getAverageMistakesPerDungeon(allDungeons);

  if (yeetShare >= YEET_SHARE_THRESHOLD) {
    return "The Gravity Lounge";
  }

  if (deathShare >= DEATH_SHARE_THRESHOLD) {
    return "The Respawn Tax Office";
  }

  if (
    seasonAverageMistakes > 0 &&
    dungeon.totalMistakes > seasonAverageMistakes * 1.1
  ) {
    return "The Punching Bag";
  }

  if (
    seasonAverageMistakes > 0 &&
    dungeon.totalMistakes < seasonAverageMistakes * 0.9
  ) {
    return "The Soft Touch";
  }

  return "The Season Regular";
}

function buildDescription(
  title: string,
  input: DungeonFlavorTitleInput,
): string {
  const context =
    input.descriptionContext ??
    ({
      dungeonName: input.dungeon.name,
      totalMistakes: input.dungeon.totalMistakes,
      totalDeaths: input.dungeon.totalDeaths,
      totalYeets: input.dungeon.totalYeets,
      playerCount: 0,
      contributorCount: 0,
      cleanPlayerCount: 0,
      seasonAverageMistakes: Number(
        getAverageMistakesPerDungeon(input.allDungeons).toFixed(1),
      ),
      yeetSharePercent:
        input.dungeon.totalMistakes > 0
          ? Math.round(
              (input.dungeon.totalYeets / input.dungeon.totalMistakes) * 100,
            )
          : 0,
      deathSharePercent:
        input.dungeon.totalMistakes > 0
          ? Math.round(
              (input.dungeon.totalDeaths / input.dungeon.totalMistakes) * 100,
            )
          : 0,
    } satisfies FlavorDescriptionContext);

  return getFlavorDescription(title, context);
}

export function getDungeonFlavorTitle(
  input: DungeonFlavorTitleInput,
): DungeonFlavorTitleResult {
  const uniqueTitles = assignUniqueDungeonTitles(input);
  const title =
    uniqueTitles.get(input.dungeon.id) ??
    getFallbackDungeonTitle(input.dungeon, input.allDungeons);

  return {
    title,
    description: buildDescription(title, input),
  };
}
