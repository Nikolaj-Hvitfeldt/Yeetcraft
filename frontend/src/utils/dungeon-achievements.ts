import type { AchievementLogoKey } from "../assets/achievement-logos";
import type { WowIconKey } from "../assets/wow-icons";
import type {
  DungeonLeaderboardEntry,
  DungeonSummary,
  SeasonLeadersResponse,
} from "../api/types";
import type {
  DungeonMistakeMix,
  DungeonReputationScores,
} from "./dungeon-stats";
import { DEATH_RATIO_THRESHOLD, YEET_RATIO_THRESHOLD } from "./stat-thresholds";
import { pickLeader, sortByName } from "./leaderboard-selection";
const LIABILITY_MIN_MISTAKES = 3;
const LIABILITY_MIN_BLAME_SHARE = 50;
const DANGER_RATING_THRESHOLD = 80;
const YEET_FACTOR_THRESHOLD = 80;
const COMMITTEE_MAX_BLAME_SHARE = 40;
const COMMITTEE_MIN_CONTRIBUTORS = 3;
const CARRY_JOB_MIN_MISTAKES = 4;
const ACHIEVEMENT_COUNT = 2;

export type AchievementIcon = WowIconKey | AchievementLogoKey;

export interface DungeonAchievement {
  icon: AchievementIcon;
  title: string;
  holder?: {
    displayName: string;
    avatarUrl: string | null;
  };
  description: string;
  tooltip: string;
}

export type DungeonAchievementHolderView = NonNullable<
  DungeonAchievement["holder"]
>;

export interface DungeonAchievementContext {
  dungeon: DungeonSummary;
  leaderboard: DungeonLeaderboardEntry[];
  reputationScores: DungeonReputationScores;
  mistakeMix: DungeonMistakeMix;
  seasonLeaders?: SeasonLeadersResponse | null;
}

interface AchievementHolder {
  playerId: string;
  displayName: string;
  avatarUrl: string | null;
}

interface AchievementEvaluation {
  eligible: boolean;
  description: string;
  holder?: AchievementHolder;
  scoreBonus?: number;
}

interface AchievementRule {
  id: string;
  title: string;
  icon: AchievementIcon;
  tooltip: string;
  priority: number;
  evaluate: (context: DungeonAchievementContext) => AchievementEvaluation;
}

interface ScoredAchievement {
  ruleId: string;
  priority: number;
  score: number;
  achievement: DungeonAchievement;
  holderPlayerId?: string;
  hasHolder: boolean;
}

function toHolder(entry: DungeonLeaderboardEntry): AchievementHolder {
  return {
    playerId: entry.playerId,
    displayName: entry.displayName,
    avatarUrl: entry.avatarUrl,
  };
}

function getContributors(
  leaderboard: DungeonLeaderboardEntry[],
): DungeonLeaderboardEntry[] {
  return leaderboard.filter((entry) => entry.totalMistakes > 0);
}

function getYeetLeader(
  leaderboard: DungeonLeaderboardEntry[],
): DungeonLeaderboardEntry | null {
  return pickLeader(
    leaderboard,
    (entry) => entry.yeets,
    (entry) => entry.deaths,
  );
}

function getDeathLeader(
  leaderboard: DungeonLeaderboardEntry[],
): DungeonLeaderboardEntry | null {
  return pickLeader(
    leaderboard,
    (entry) => entry.deaths,
    (entry) => entry.yeets,
  );
}

function pickHighestYeetRatioPlayer(
  leaderboard: DungeonLeaderboardEntry[],
): DungeonLeaderboardEntry | null {
  const eligible = leaderboard.filter(
    (entry) =>
      entry.totalMistakes > 0 &&
      entry.yeets / entry.totalMistakes >= YEET_RATIO_THRESHOLD,
  );
  if (eligible.length === 0) return null;

  return (
    sortByName(eligible).sort((first, second) => {
      const firstRatio = first.yeets / first.totalMistakes;
      const secondRatio = second.yeets / second.totalMistakes;
      if (secondRatio !== firstRatio) return secondRatio - firstRatio;
      return second.yeets - first.yeets;
    })[0] ?? null
  );
}

function pickHighestDeathRatioPlayer(
  leaderboard: DungeonLeaderboardEntry[],
): DungeonLeaderboardEntry | null {
  const eligible = leaderboard.filter(
    (entry) =>
      entry.totalMistakes > 0 &&
      entry.deaths / entry.totalMistakes >= DEATH_RATIO_THRESHOLD,
  );
  if (eligible.length === 0) return null;

  return (
    sortByName(eligible).sort((first, second) => {
      const firstRatio = first.deaths / first.totalMistakes;
      const secondRatio = second.deaths / second.totalMistakes;
      if (secondRatio !== firstRatio) return secondRatio - firstRatio;
      return second.deaths - first.deaths;
    })[0] ?? null
  );
}

function pickMostBalancedPlayer(
  leaderboard: DungeonLeaderboardEntry[],
): DungeonLeaderboardEntry | null {
  const eligible = leaderboard.filter(
    (entry) =>
      entry.deaths > 0 &&
      entry.yeets > 0 &&
      Math.abs(entry.deaths - entry.yeets) <= 1,
  );
  if (eligible.length === 0) return null;

  return (
    sortByName(eligible).sort((first, second) => {
      const firstBalance = Math.abs(first.deaths - first.yeets);
      const secondBalance = Math.abs(second.deaths - second.yeets);
      if (firstBalance !== secondBalance) return firstBalance - secondBalance;
      return second.totalMistakes - first.totalMistakes;
    })[0] ?? null
  );
}

function pickBenchwarmer(
  leaderboard: DungeonLeaderboardEntry[],
): DungeonLeaderboardEntry | null {
  const contributors = getContributors(leaderboard);
  if (contributors.length === 0) return null;

  const cleanPlayers = leaderboard.filter((entry) => entry.totalMistakes === 0);
  if (cleanPlayers.length === 0) return null;

  return sortByName(cleanPlayers)[0] ?? null;
}

function pickSoleCleanPlayer(
  leaderboard: DungeonLeaderboardEntry[],
): DungeonLeaderboardEntry | null {
  const cleanPlayers = leaderboard.filter((entry) => entry.totalMistakes === 0);
  if (cleanPlayers.length !== 1) return null;
  if (getContributors(leaderboard).length === 0) return null;

  return cleanPlayers[0] ?? null;
}

function findLeaderboardEntry(
  leaderboard: DungeonLeaderboardEntry[],
  playerId: string,
): DungeonLeaderboardEntry | null {
  return leaderboard.find((entry) => entry.playerId === playerId) ?? null;
}

function ineligible(): AchievementEvaluation {
  return { eligible: false, description: "" };
}

const ACHIEVEMENT_RULES: AchievementRule[] = [
  {
    id: "spotless-run",
    title: "Spotless Run",
    icon: "spotless-run",
    tooltip: "Awarded when no deaths or yeets were recorded in this dungeon.",
    priority: 100,
    evaluate: ({ dungeon }) => {
      if (dungeon.totalMistakes > 0) return ineligible();

      return {
        eligible: true,
        description: "No mistakes were recorded in this dungeon",
      };
    },
  },
  {
    id: "the-liability",
    title: "The Liability",
    icon: "the-liability",
    tooltip: "Given to the player who owns the biggest share of mistakes here.",
    priority: 95,
    evaluate: ({ dungeon, leaderboard, reputationScores }) => {
      if (
        dungeon.totalMistakes < LIABILITY_MIN_MISTAKES ||
        reputationScores.blameShare < LIABILITY_MIN_BLAME_SHARE
      ) {
        return ineligible();
      }

      const offender = pickLeader(
        leaderboard,
        (entry) => entry.totalMistakes,
        (entry) => entry.yeets,
      );
      if (!offender) return ineligible();

      return {
        eligible: true,
        holder: toHolder(offender),
        description: `${offender.displayName} accounts for ${reputationScores.blameShare}% of mistakes here`,
        scoreBonus: reputationScores.blameShare,
      };
    },
  },
  {
    id: "solo-act",
    title: "Solo Act",
    icon: "solo-act",
    tooltip: "Every mistake in this run came from one player.",
    priority: 90,
    evaluate: ({ leaderboard }) => {
      const contributors = getContributors(leaderboard);
      if (contributors.length !== 1) return ineligible();

      const soloPlayer = contributors[0];
      return {
        eligible: true,
        holder: toHolder(soloPlayer),
        description: `Every mistake in this dungeon came from ${soloPlayer.displayName}`,
        scoreBonus: soloPlayer.totalMistakes,
      };
    },
  },
  {
    id: "dungeon-menace",
    title: "Dungeon Menace",
    icon: "dungeon-menace",
    tooltip: "This player leads season-wide mistakes for this key.",
    priority: 88,
    evaluate: ({ dungeon, leaderboard, seasonLeaders }) => {
      const menace = seasonLeaders?.dungeonMistakeLeaders?.find(
        (leader) => leader.dungeonId === dungeon.id,
      );
      if (!menace) return ineligible();

      const player = findLeaderboardEntry(leaderboard, menace.playerId);
      if (!player || player.totalMistakes === 0) return ineligible();

      return {
        eligible: true,
        holder: toHolder(player),
        description: `${player.displayName} leads season mistakes for this dungeon`,
        scoreBonus: player.totalMistakes,
      };
    },
  },
  {
    id: "the-usual-suspect",
    title: "The Usual Suspect",
    icon: "the-usual-suspect",
    tooltip: "A season yeet or death king who did not top this dungeon.",
    priority: 85,
    evaluate: ({ leaderboard, seasonLeaders }) => {
      const yeetLeader = getYeetLeader(leaderboard);
      const deathLeader = getDeathLeader(leaderboard);
      const suspects = [
        seasonLeaders?.kingOfYeets &&
        yeetLeader?.playerId !== seasonLeaders.kingOfYeets.playerId
          ? seasonLeaders.kingOfYeets
          : null,
        seasonLeaders?.kingOfDeaths &&
        deathLeader?.playerId !== seasonLeaders.kingOfDeaths.playerId
          ? seasonLeaders.kingOfDeaths
          : null,
      ].filter((king): king is NonNullable<typeof king> => king != null);

      const uniqueSuspects = sortByName(
        suspects.filter(
          (king, index, kings) =>
            kings.findIndex((entry) => entry.playerId === king.playerId) ===
            index,
        ),
      );

      const suspect = uniqueSuspects[0];
      if (!suspect) return ineligible();

      const player = findLeaderboardEntry(leaderboard, suspect.playerId);
      const holder: AchievementHolder = player
        ? toHolder(player)
        : {
            playerId: suspect.playerId,
            displayName: suspect.displayName,
            avatarUrl: suspect.avatarUrl,
          };

      return {
        eligible: true,
        holder,
        description: `${suspect.displayName} usually tops the charts — not here`,
      };
    },
  },
  {
    id: "cliff-diver",
    title: "Cliff Diver",
    icon: "cliff-diver",
    tooltip: "Most of this player's mistakes here were yeets.",
    priority: 80,
    evaluate: ({ leaderboard }) => {
      const player = pickHighestYeetRatioPlayer(leaderboard);
      if (!player) return ineligible();

      const yeetPercent = Math.round(
        (player.yeets / player.totalMistakes) * 100,
      );
      return {
        eligible: true,
        holder: toHolder(player),
        description: `${yeetPercent}% of ${player.displayName}'s mistakes here were yeets`,
        scoreBonus: yeetPercent,
      };
    },
  },
  {
    id: "floor-inspector",
    title: "Floor Inspector",
    icon: "floor-inspector",
    tooltip: "Most of this player's mistakes here were deaths.",
    priority: 80,
    evaluate: ({ leaderboard }) => {
      const player = pickHighestDeathRatioPlayer(leaderboard);
      if (!player) return ineligible();

      const deathPercent = Math.round(
        (player.deaths / player.totalMistakes) * 100,
      );
      return {
        eligible: true,
        holder: toHolder(player),
        description: `${deathPercent}% of ${player.displayName}'s mistakes here were deaths`,
        scoreBonus: deathPercent,
      };
    },
  },
  {
    id: "carry-job",
    title: "Carry Job",
    icon: "carry-job",
    tooltip: "One player stayed clean while everyone else slipped up.",
    priority: 75,
    evaluate: ({ dungeon, leaderboard }) => {
      if (dungeon.totalMistakes < CARRY_JOB_MIN_MISTAKES) return ineligible();

      const player = pickSoleCleanPlayer(leaderboard);
      if (!player) return ineligible();

      return {
        eligible: true,
        holder: toHolder(player),
        description: `${player.displayName} carried the rest of the party`,
        scoreBonus: dungeon.totalMistakes,
      };
    },
  },
  {
    id: "balancing-act",
    title: "Balancing Act",
    icon: "balancing-act",
    tooltip: "An even split of deaths and yeets from one player.",
    priority: 74,
    evaluate: ({ leaderboard }) => {
      const player = pickMostBalancedPlayer(leaderboard);
      if (!player) return ineligible();

      return {
        eligible: true,
        holder: toHolder(player),
        description: `${player.displayName} had ${player.deaths} deaths and ${player.yeets} yeets here`,
        scoreBonus: player.totalMistakes,
      };
    },
  },
  {
    id: "the-benchwarmer",
    title: "The Benchwarmer",
    icon: "the-benchwarmer",
    tooltip: "No mistakes here while the rest of the party struggled.",
    priority: 70,
    evaluate: ({ leaderboard }) => {
      const player = pickBenchwarmer(leaderboard);
      if (!player) return ineligible();

      return {
        eligible: true,
        holder: toHolder(player),
        description: `${player.displayName} had no mistakes while others did`,
      };
    },
  },
  {
    id: "meat-grinder",
    title: "Meat Grinder",
    icon: "meat-grinder",
    tooltip: "This dungeon hurts more than most keys this season.",
    priority: 65,
    evaluate: ({ reputationScores }) => {
      if (reputationScores.dangerRating < DANGER_RATING_THRESHOLD) {
        return ineligible();
      }

      return {
        eligible: true,
        description: `Rougher than most dungeons this season`,
        scoreBonus: reputationScores.dangerRating,
      };
    },
  },
  {
    id: "yeet-cannon",
    title: "Yeet Cannon",
    icon: "yeet-cannon",
    tooltip: "Yeets dominate the mistake mix in this dungeon.",
    priority: 65,
    evaluate: ({ reputationScores, mistakeMix }) => {
      if (reputationScores.yeetFactor < YEET_FACTOR_THRESHOLD) {
        return ineligible();
      }

      return {
        eligible: true,
        description: `${mistakeMix.yeetsPercent}% of mistakes here were yeets`,
        scoreBonus: reputationScores.yeetFactor,
      };
    },
  },
  {
    id: "committee-meeting",
    title: "Committee Meeting",
    icon: "committee-meeting",
    tooltip: "Mistakes were spread evenly with no single standout.",
    priority: 60,
    evaluate: ({ reputationScores, leaderboard }) => {
      const contributors = getContributors(leaderboard);
      if (
        contributors.length < COMMITTEE_MIN_CONTRIBUTORS ||
        reputationScores.blameShare >= COMMITTEE_MAX_BLAME_SHARE
      ) {
        return ineligible();
      }

      return {
        eligible: true,
        description: `Mistakes were spread across ${contributors.length} players`,
        scoreBonus: contributors.length,
      };
    },
  },
];

const QUIET_LOBBY_RULE: AchievementRule = {
  id: "quiet-lobby",
  title: "Quiet Lobby",
  icon: "dungeon",
  tooltip: "Shown when there is not enough data for a sharper highlight.",
  priority: 1,
  evaluate: () => ({
    eligible: true,
    description: "Not enough data to highlight a standout yet",
  }),
};

function toPublicHolder(holder: AchievementHolder | undefined) {
  if (!holder) return undefined;

  return {
    displayName: holder.displayName,
    avatarUrl: holder.avatarUrl,
  };
}

function evaluateRules(
  context: DungeonAchievementContext,
): ScoredAchievement[] {
  return ACHIEVEMENT_RULES.flatMap((rule) => {
    const result = rule.evaluate(context);
    if (!result.eligible) return [];

    return [
      {
        ruleId: rule.id,
        priority: rule.priority,
        score: rule.priority + (result.scoreBonus ?? 0),
        hasHolder: result.holder != null,
        holderPlayerId: result.holder?.playerId,
        achievement: {
          icon: rule.icon,
          title: rule.title,
          holder: toPublicHolder(result.holder),
          description: result.description,
          tooltip: rule.tooltip,
        },
      },
    ];
  }).sort((first, second) => {
    if (second.score !== first.score) return second.score - first.score;
    if (second.priority !== first.priority)
      return second.priority - first.priority;
    return first.ruleId.localeCompare(second.ruleId);
  });
}

function selectTopAchievements(
  candidates: ScoredAchievement[],
): DungeonAchievement[] {
  const sorted = [...candidates];
  const selected: ScoredAchievement[] = [];
  const usedHolderIds = new Set<string>();
  const usedRuleIds = new Set<string>();

  const canTake = (candidate: ScoredAchievement) => {
    if (usedRuleIds.has(candidate.ruleId)) return false;
    if (
      candidate.holderPlayerId &&
      usedHolderIds.has(candidate.holderPlayerId)
    ) {
      return false;
    }
    return true;
  };

  const take = (candidate: ScoredAchievement) => {
    selected.push(candidate);
    usedRuleIds.add(candidate.ruleId);
    if (candidate.holderPlayerId) {
      usedHolderIds.add(candidate.holderPlayerId);
    }
  };

  const first = sorted.find(canTake);
  if (first) take(first);

  if (selected.length === 1 && selected[0]?.hasHolder) {
    const dungeonAward = sorted.find(
      (candidate) => canTake(candidate) && !candidate.hasHolder,
    );
    if (dungeonAward) take(dungeonAward);
  }

  if (selected.length === 1) {
    const second = sorted.find(canTake);
    if (second) take(second);
  }

  while (selected.length < ACHIEVEMENT_COUNT) {
    if (usedRuleIds.has(QUIET_LOBBY_RULE.id)) break;

    const quietLobby = QUIET_LOBBY_RULE.evaluate({
      dungeon: {
        id: "",
        name: "",
        shortName: null,
        displayOrder: 0,
        totalDeaths: 0,
        totalYeets: 0,
        totalMistakes: 0,
      },
      leaderboard: [],
      reputationScores: { dangerRating: 0, yeetFactor: 0, blameShare: 0 },
      mistakeMix: { deathsPercent: 0, yeetsPercent: 0 },
    });

    take({
      ruleId: QUIET_LOBBY_RULE.id,
      priority: QUIET_LOBBY_RULE.priority,
      score: QUIET_LOBBY_RULE.priority,
      hasHolder: false,
      achievement: {
        icon: QUIET_LOBBY_RULE.icon,
        title: QUIET_LOBBY_RULE.title,
        description: quietLobby.description,
        tooltip: QUIET_LOBBY_RULE.tooltip,
      },
    });
  }

  return selected.map((candidate) => candidate.achievement);
}

export function getDungeonAchievements(
  context: DungeonAchievementContext,
): DungeonAchievement[] {
  const candidates = evaluateRules(context);
  return selectTopAchievements(candidates);
}

// Exported for tests
export const dungeonAchievementRulesForTests = ACHIEVEMENT_RULES;
