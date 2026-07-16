import { describe, expect, it } from "vitest";
import type { DungeonLeaderboardEntry, DungeonSummary } from "../api/types";
import {
  dungeonAchievementRulesForTests,
  getDungeonAchievements,
  type DungeonAchievementContext,
} from "./dungeon-achievements";
import {
  getBlameShare,
  getDungeonReputationScores,
  getMistakeMix,
} from "./dungeon-stats";

const dungeon: DungeonSummary = {
  id: "dungeon-1",
  name: "Nexus-Point Xenas",
  shortName: "NPX",
  displayOrder: 1,
  totalDeaths: 2,
  totalYeets: 1,
  totalMistakes: 3,
};

const allDungeons: DungeonSummary[] = [
  dungeon,
  {
    id: "dungeon-2",
    name: "Ruby Life Pools",
    shortName: "RLP",
    displayOrder: 2,
    totalDeaths: 1,
    totalYeets: 0,
    totalMistakes: 1,
  },
];

const soloOffenderLeaderboard: DungeonLeaderboardEntry[] = [
  {
    playerId: "p1",
    displayName: "Niklas",
    avatarUrl: null,
    deaths: 2,
    yeets: 1,
    totalMistakes: 3,
  },
  {
    playerId: "p2",
    displayName: "Martin",
    avatarUrl: null,
    deaths: 0,
    yeets: 0,
    totalMistakes: 0,
  },
];

function buildContext(
  leaderboard: DungeonLeaderboardEntry[],
  dungeonOverride?: Partial<DungeonSummary>,
): DungeonAchievementContext {
  const activeDungeon = { ...dungeon, ...dungeonOverride };
  return {
    dungeon: activeDungeon,
    leaderboard,
    reputationScores: getDungeonReputationScores(
      activeDungeon,
      allDungeons,
      leaderboard,
    ),
    mistakeMix: getMistakeMix(activeDungeon),
  };
}

describe("getDungeonAchievements", () => {
  it("picks liability and benchwarmer when one player owns a messy run", () => {
    const achievements = getDungeonAchievements(
      buildContext(soloOffenderLeaderboard),
    );

    expect(achievements).toHaveLength(2);
    expect(achievements.map((achievement) => achievement.title)).toEqual([
      "The Liability",
      "The Benchwarmer",
    ]);
    expect(achievements[0]?.holder?.displayName).toBe("Niklas");
    expect(achievements[0]?.holder?.playerId).toBe("p1");
    expect(achievements[0]?.description).toContain("100%");
    expect(achievements[1]?.holder?.displayName).toBe("Martin");
    expect(achievements[1]?.holder?.playerId).toBe("p2");
  });

  it("solo act rule includes the sole contributor as holder", () => {
    const soloActRule = dungeonAchievementRulesForTests.find(
      (rule) => rule.id === "solo-act",
    );
    expect(soloActRule).toBeDefined();

    const result = soloActRule!.evaluate(buildContext(soloOffenderLeaderboard));

    expect(result.eligible).toBe(true);
    expect(result.holder?.displayName).toBe("Niklas");
    expect(result.holder?.playerId).toBe("p1");
    expect(result.description).toBe(
      "Every mistake in this dungeon came from Niklas",
    );
  });

  it("exposes playerId on public achievement holders", () => {
    const achievements = getDungeonAchievements(
      buildContext(soloOffenderLeaderboard),
    );

    expect(achievements[0]?.holder).toEqual({
      playerId: "p1",
      displayName: "Niklas",
      avatarUrl: null,
    });
    expect(achievements[1]?.holder).toEqual({
      playerId: "p2",
      displayName: "Martin",
      avatarUrl: null,
    });
  });

  it("does not award raw yeet or death leader achievements", () => {
    const achievements = getDungeonAchievements(
      buildContext(soloOffenderLeaderboard),
    );
    const titles = achievements.map((achievement) => achievement.title);

    expect(titles).not.toContain("Orbital Launch");
    expect(titles).not.toContain("Mechanic Magnet");
  });

  it("dedupes multiple awards for the same player", () => {
    const achievements = getDungeonAchievements(
      buildContext(soloOffenderLeaderboard),
    );
    const holderNames = achievements
      .map((achievement) => achievement.holder?.displayName)
      .filter(Boolean);

    expect(new Set(holderNames).size).toBe(holderNames.length);
  });

  it("returns spotless run and quiet lobby when nobody made mistakes", () => {
    const cleanLeaderboard: DungeonLeaderboardEntry[] = [
      {
        playerId: "p1",
        displayName: "Niklas",
        avatarUrl: null,
        deaths: 0,
        yeets: 0,
        totalMistakes: 0,
      },
      {
        playerId: "p2",
        displayName: "Martin",
        avatarUrl: null,
        deaths: 0,
        yeets: 0,
        totalMistakes: 0,
      },
    ];

    const achievements = getDungeonAchievements(
      buildContext(cleanLeaderboard, {
        totalDeaths: 0,
        totalYeets: 0,
        totalMistakes: 0,
      }),
    );

    expect(achievements.map((achievement) => achievement.title)).toEqual([
      "Spotless Run",
      "Quiet Lobby",
    ]);
  });

  it("prefers a dungeon award as the second pick when the first has a holder", () => {
    const spreadLeaderboard: DungeonLeaderboardEntry[] = [
      {
        playerId: "p1",
        displayName: "Niklas",
        avatarUrl: null,
        deaths: 1,
        yeets: 2,
        totalMistakes: 3,
      },
      {
        playerId: "p2",
        displayName: "Martin",
        avatarUrl: null,
        deaths: 2,
        yeets: 0,
        totalMistakes: 2,
      },
      {
        playerId: "p3",
        displayName: "Seb",
        avatarUrl: null,
        deaths: 1,
        yeets: 1,
        totalMistakes: 2,
      },
    ];

    const spreadDungeon: DungeonSummary = {
      ...dungeon,
      totalDeaths: 4,
      totalYeets: 3,
      totalMistakes: 7,
    };

    const achievements = getDungeonAchievements({
      dungeon: spreadDungeon,
      leaderboard: spreadLeaderboard,
      reputationScores: getDungeonReputationScores(
        spreadDungeon,
        allDungeons,
        spreadLeaderboard,
      ),
      mistakeMix: getMistakeMix(spreadDungeon),
    });

    expect(achievements).toHaveLength(2);
    expect(achievements[0]?.holder).toBeDefined();
    expect(achievements[1]?.holder).toBeUndefined();
    expect(getBlameShare(spreadDungeon, spreadLeaderboard)).toBeLessThan(50);
  });

  it("dungeon menace rule matches the season mistake leader for this key", () => {
    const menaceRule = dungeonAchievementRulesForTests.find(
      (rule) => rule.id === "dungeon-menace",
    );
    expect(menaceRule).toBeDefined();

    const result = menaceRule!.evaluate({
      ...buildContext(soloOffenderLeaderboard),
      seasonLeaders: {
        season: {
          id: "season-1",
          name: "Season 1",
          expansion: null,
          isCurrent: true,
        },
        leaderboard: [],
        kingOfYeets: null,
        kingOfDeaths: null,
        topPlayer: null,
        dungeonMistakeLeaders: [
          {
            dungeonId: "dungeon-1",
            playerId: "p1",
            totalMistakes: 12,
          },
        ],
      },
    });

    expect(result.eligible).toBe(true);
    expect(result.description).toBe(
      "Niklas leads mistakes for this dungeon",
    );
  });

  it("the usual suspect rule fires when a season king did not top this dungeon", () => {
    const suspectRule = dungeonAchievementRulesForTests.find(
      (rule) => rule.id === "the-usual-suspect",
    );
    expect(suspectRule).toBeDefined();

    const leaderboard: DungeonLeaderboardEntry[] = [
      {
        playerId: "p1",
        displayName: "Niklas",
        avatarUrl: null,
        deaths: 1,
        yeets: 0,
        totalMistakes: 1,
      },
      {
        playerId: "p2",
        displayName: "Martin",
        avatarUrl: null,
        deaths: 1,
        yeets: 2,
        totalMistakes: 3,
      },
    ];

    const result = suspectRule!.evaluate({
      ...buildContext(leaderboard, {
        totalDeaths: 2,
        totalYeets: 2,
        totalMistakes: 4,
      }),
      seasonLeaders: {
        season: {
          id: "season-1",
          name: "Season 1",
          expansion: null,
          isCurrent: true,
        },
        leaderboard: [],
        kingOfYeets: {
          playerId: "p1",
          displayName: "Niklas",
          avatarUrl: null,
          yeets: 40,
          deaths: 5,
        },
        kingOfDeaths: null,
        topPlayer: null,
        dungeonMistakeLeaders: [],
      },
    });

    expect(result.eligible).toBe(true);
    expect(result.description).toBe(
      "Niklas usually tops the charts — not here",
    );
  });

  it("carry job rule fires for a single clean player in a messy run", () => {
    const carryRule = dungeonAchievementRulesForTests.find(
      (rule) => rule.id === "carry-job",
    );
    expect(carryRule).toBeDefined();

    const leaderboard: DungeonLeaderboardEntry[] = [
      {
        playerId: "p1",
        displayName: "Niklas",
        avatarUrl: null,
        deaths: 2,
        yeets: 1,
        totalMistakes: 3,
      },
      {
        playerId: "p2",
        displayName: "Martin",
        avatarUrl: null,
        deaths: 0,
        yeets: 0,
        totalMistakes: 0,
      },
      {
        playerId: "p3",
        displayName: "Seb",
        avatarUrl: null,
        deaths: 1,
        yeets: 0,
        totalMistakes: 1,
      },
    ];

    const result = carryRule!.evaluate(
      buildContext(leaderboard, {
        totalDeaths: 3,
        totalYeets: 1,
        totalMistakes: 4,
      }),
    );

    expect(result.eligible).toBe(true);
    expect(result.holder?.displayName).toBe("Martin");
    expect(result.description).toBe("Martin carried the rest of the party");
  });
});
