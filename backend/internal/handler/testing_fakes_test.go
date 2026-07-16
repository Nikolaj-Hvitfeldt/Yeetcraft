package handler

import (
	"context"

	"yeetcraft/backend/internal/repository"
)

type fakeStatsRepository struct {
	listSeasonsResult []repository.SeasonSummary
	listSeasonsErr    error

	getSeasonLeadersResult repository.SeasonLeaders
	getSeasonLeadersErr    error

	getPlayerStatsResult repository.PlayerStats
	getPlayerStatsErr    error

	getPlayerStatsBySlugResult repository.PlayerStats
	getPlayerStatsBySlugErr    error

	listSeasonDungeonsSeason repository.SeasonSummary
	listSeasonDungeonsResult []repository.DungeonSummary
	listSeasonDungeonsErr    error

	listDungeonLeaderboardResult repository.DungeonLeaderboard
	listDungeonLeaderboardErr    error

	setStatsBatchResult []repository.StatRow
	setStatsBatchErr    error

	setStatsBatchCallCount int
	setStatsBatchPlayerID  string
	setStatsBatchSeasonID  string
	setStatsBatchUpdates   []repository.StatUpdate
}

func (fake *fakeStatsRepository) GetSeasonLeaders(_ context.Context, _ string) (repository.SeasonLeaders, error) {
	return fake.getSeasonLeadersResult, fake.getSeasonLeadersErr
}

func (fake *fakeStatsRepository) GetPlayerStats(_ context.Context, _, _ string) (repository.PlayerStats, error) {
	return fake.getPlayerStatsResult, fake.getPlayerStatsErr
}

func (fake *fakeStatsRepository) GetPlayerStatsByDisplaySlug(
	_ context.Context,
	_,
	_ string,
) (repository.PlayerStats, error) {
	return fake.getPlayerStatsBySlugResult, fake.getPlayerStatsBySlugErr
}

func (fake *fakeStatsRepository) ListSeasons(context.Context) ([]repository.SeasonSummary, error) {
	return fake.listSeasonsResult, fake.listSeasonsErr
}

func (fake *fakeStatsRepository) ListSeasonDungeons(
	_ context.Context,
	_ string,
) (repository.SeasonSummary, []repository.DungeonSummary, error) {
	return fake.listSeasonDungeonsSeason, fake.listSeasonDungeonsResult, fake.listSeasonDungeonsErr
}

func (fake *fakeStatsRepository) ListDungeonLeaderboard(
	_ context.Context,
	_,
	_ string,
) (repository.DungeonLeaderboard, error) {
	return fake.listDungeonLeaderboardResult, fake.listDungeonLeaderboardErr
}

func (fake *fakeStatsRepository) SetStatsBatch(
	_ context.Context,
	playerID string,
	seasonID string,
	updates []repository.StatUpdate,
) ([]repository.StatRow, error) {
	fake.setStatsBatchCallCount++
	fake.setStatsBatchPlayerID = playerID
	fake.setStatsBatchSeasonID = seasonID
	fake.setStatsBatchUpdates = append([]repository.StatUpdate(nil), updates...)
	return fake.setStatsBatchResult, fake.setStatsBatchErr
}
