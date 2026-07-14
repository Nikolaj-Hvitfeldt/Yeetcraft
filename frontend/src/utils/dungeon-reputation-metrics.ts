import type { DungeonReputationScores } from "./dungeon-stats";

export const DUNGEON_REPUTATION_METRICS = [
  {
    id: "dangerRating",
    title: "Danger Rating",
    description:
      "How punishing this dungeon is compared to the season average.",
    infoTooltip:
      "Total mistakes here vs average per dungeon.\n\n- Below 50 hurts less than usual\n- 50 is average\n- Above 50 hurts more.",
  },
  {
    id: "yeetFactor",
    title: "Yeet Factor",
    description: "Whether this dungeon is unusually yeet-heavy for the season.",
    infoTooltip:
      "This dungeon's yeet share vs the season average.\n\n- Below 50 means fewer yeets than average\n- 50 is average\n- Above 50 means more than average.",
  },
  {
    id: "blameShare",
    title: "Blame Share",
    description:
      "How much one player is responsible for this dungeon's mistakes.",
    infoTooltip:
      "Top player's share of mistakes here\n\n- Near 0 means blame is spread out\n- 50 is average\n- Near 100 means one player caused most of it.",
  },
] as const;

export type DungeonReputationMetricId =
  (typeof DUNGEON_REPUTATION_METRICS)[number]["id"];

export function getReputationScoreForMetric(
  scores: DungeonReputationScores,
  metricId: DungeonReputationMetricId,
): number {
  return scores[metricId];
}
