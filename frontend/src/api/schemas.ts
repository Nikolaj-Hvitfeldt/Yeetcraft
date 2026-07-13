import { z } from 'zod'

export const SeasonSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  expansion: z.string().nullable(),
  isCurrent: z.boolean(),
})

export const LeaderboardEntrySchema = z.object({
  playerId: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
  totalDeaths: z.number(),
  totalYeets: z.number(),
  totalMistakes: z.number(),
})

export const LeaderboardResponseSchema = z.object({
  leaderboard: z.array(LeaderboardEntrySchema),
})

export const PlayerSummarySchema = z.object({
  id: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
})

export const DungeonSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string().nullable(),
  displayOrder: z.number(),
  totalDeaths: z.number(),
  totalYeets: z.number(),
  totalMistakes: z.number(),
})

export const PlayerDungeonSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string().nullable(),
  displayOrder: z.number(),
  totalDeaths: z.number().optional().default(0),
  totalYeets: z.number().optional().default(0),
  totalMistakes: z.number().optional().default(0),
})

export const PlayerDungeonStatsSchema = z.object({
  dungeon: PlayerDungeonSummarySchema,
  deaths: z.number(),
  yeets: z.number(),
  totalMistakes: z.number(),
})

export const PlayerStatsResponseSchema = z.object({
  player: PlayerSummarySchema,
  season: SeasonSummarySchema,
  totalDeaths: z.number(),
  totalYeets: z.number(),
  totalMistakes: z.number(),
  dungeons: z.array(PlayerDungeonStatsSchema),
})

export const StatRowSchema = z.object({
  playerId: z.string(),
  seasonId: z.string(),
  dungeonId: z.string(),
  deaths: z.number(),
  yeets: z.number(),
  totalMistakes: z.number(),
})

export const SetStatsBatchDungeonUpdateSchema = z.object({
  dungeonId: z.string(),
  deaths: z.number().int().min(0),
  yeets: z.number().int().min(0),
})

export const SetStatsBatchRequestSchema = z.object({
  playerId: z.string(),
  seasonId: z.string(),
  stats: z.array(SetStatsBatchDungeonUpdateSchema).min(1),
})

export const StatsBatchResponseSchema = z.object({
  stats: z.array(StatRowSchema),
})

export const SeasonsResponseSchema = z.object({
  seasons: z.array(SeasonSummarySchema),
})

export const CurrentSeasonDungeonsResponseSchema = z.object({
  season: SeasonSummarySchema,
  dungeons: z.array(DungeonSummarySchema),
})

export const SeasonLeaderPlayerSchema = z.object({
  playerId: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
  yeets: z.number(),
  deaths: z.number(),
})

export const SeasonTopPlayerSchema = z.object({
  playerId: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
  totalMistakes: z.number(),
  totalYeets: z.number(),
  totalDeaths: z.number(),
})

export const DungeonMistakeLeaderSchema = z.object({
  dungeonId: z.string(),
  playerId: z.string(),
  totalMistakes: z.number(),
})

export const SeasonLeadersResponseSchema = z.object({
  season: SeasonSummarySchema,
  leaderboard: z.array(LeaderboardEntrySchema).default([]),
  kingOfYeets: SeasonLeaderPlayerSchema.nullable(),
  kingOfDeaths: SeasonLeaderPlayerSchema.nullable(),
  topPlayer: SeasonTopPlayerSchema.nullable(),
  dungeonMistakeLeaders: z.array(DungeonMistakeLeaderSchema).default([]),
})

export type SeasonSummary = z.infer<typeof SeasonSummarySchema>
export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>
export type LeaderboardResponse = z.infer<typeof LeaderboardResponseSchema>
export type PlayerSummary = z.infer<typeof PlayerSummarySchema>
export type DungeonSummary = z.infer<typeof DungeonSummarySchema>
export type DungeonStats = z.infer<typeof PlayerDungeonStatsSchema>
export type PlayerStatsResponse = z.infer<typeof PlayerStatsResponseSchema>
export type SeasonsResponse = z.infer<typeof SeasonsResponseSchema>
export type CurrentSeasonDungeonsResponse = z.infer<typeof CurrentSeasonDungeonsResponseSchema>
export type SeasonLeaderPlayer = z.infer<typeof SeasonLeaderPlayerSchema>
export type SeasonTopPlayer = z.infer<typeof SeasonTopPlayerSchema>
export type SeasonLeadersResponse = z.infer<typeof SeasonLeadersResponseSchema>
export type StatRow = z.infer<typeof StatRowSchema>
