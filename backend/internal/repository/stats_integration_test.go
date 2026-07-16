//go:build integration

package repository

import (
	"context"
	"errors"
	"fmt"
	"os"
	"testing"

	"github.com/jackc/pgx/v5"

	"yeetcraft/backend/internal/testdb"
)

var (
	integrationClient *testdb.Client
	integrationRepo   StatsRepository
)

func TestMain(m *testing.M) {
	ctx := context.Background()

	if err := testdb.RequireIntegrationTestDatabaseURL(); err != nil {
		fmt.Fprintf(os.Stderr, "integration tests: %v\n", err)
		os.Exit(1)
	}

	client, err := testdb.NewIntegrationClient(ctx)
	if err != nil {
		fmt.Fprintf(os.Stderr, "integration tests: %v\n", err)
		os.Exit(1)
	}
	defer client.Close()

	if err := client.ResetAndVerify(ctx); err != nil {
		fmt.Fprintf(os.Stderr, "integration tests: baseline reset/verify failed: %v\n", err)
		os.Exit(1)
	}

	if err := client.EnsureIsolationSeasonFixtures(ctx); err != nil {
		fmt.Fprintf(os.Stderr, "integration tests: isolation fixtures failed: %v\n", err)
		os.Exit(1)
	}

	integrationClient = client
	integrationRepo = NewStatsRepository(client.Pool())

	os.Exit(m.Run())
}

func setupIntegrationTest(t *testing.T) context.Context {
	t.Helper()

	ctx := context.Background()
	if err := integrationClient.ResetAndVerify(ctx); err != nil {
		t.Fatalf("reset and verify baseline: %v", err)
	}

	t.Cleanup(func() {
		if err := integrationClient.Reset(context.Background()); err != nil {
			t.Errorf("cleanup reset: %v", err)
		}
	})

	return ctx
}

func TestSetStatsBatchMultiRecordSuccess(t *testing.T) {
	ctx := setupIntegrationTest(t)

	rows, err := integrationRepo.SetStatsBatch(ctx, testdb.PlayerSebID, testdb.SeasonID, []StatUpdate{
		{DungeonID: testdb.DungeonAlphaID, Deaths: 4, Yeets: 2},
		{DungeonID: testdb.DungeonBetaID, Deaths: 1, Yeets: 3},
	})
	if err != nil {
		t.Fatalf("SetStatsBatch: %v", err)
	}

	if len(rows) != 2 {
		t.Fatalf("expected 2 stat rows, got %d", len(rows))
	}

	for _, row := range rows {
		if row.TotalMistakes != row.Deaths+row.Yeets {
			t.Fatalf("expected totalMistakes to equal deaths+yeets, got %#v", row)
		}
	}

	sebStats, err := integrationRepo.GetPlayerStats(ctx, testdb.PlayerSebID, testdb.SeasonID)
	if err != nil {
		t.Fatalf("GetPlayerStats seb: %v", err)
	}

	if sebStats.TotalDeaths != 5 || sebStats.TotalYeets != 5 || sebStats.TotalMistakes != 10 {
		t.Fatalf("unexpected seb totals: deaths=%d yeets=%d mistakes=%d", sebStats.TotalDeaths, sebStats.TotalYeets, sebStats.TotalMistakes)
	}

	martinDeaths, martinYeets, err := readPlayerDungeonStat(
		ctx,
		testdb.PlayerMartinID,
		testdb.SeasonID,
		testdb.DungeonAlphaID,
	)
	if err != nil {
		t.Fatalf("read martin alpha stat: %v", err)
	}

	if martinDeaths != 1 || martinYeets != 0 {
		t.Fatalf("expected unrelated martin alpha baseline 1/0, got %d/%d", martinDeaths, martinYeets)
	}
}

func TestSeasonIsolation(t *testing.T) {
	ctx := setupIntegrationTest(t)

	_, err := integrationRepo.SetStatsBatch(ctx, testdb.PlayerSebID, testdb.SeasonID, []StatUpdate{
		{DungeonID: testdb.DungeonAlphaID, Deaths: 9, Yeets: 1},
	})
	if err != nil {
		t.Fatalf("SetStatsBatch main season: %v", err)
	}

	mainSeasonSeb, err := integrationRepo.GetPlayerStats(ctx, testdb.PlayerSebID, testdb.SeasonID)
	if err != nil {
		t.Fatalf("GetPlayerStats main season seb: %v", err)
	}
	if mainSeasonSeb.TotalDeaths != 9 {
		t.Fatalf("expected main season seb deaths 9, got %d", mainSeasonSeb.TotalDeaths)
	}

	isolationMartin, err := integrationRepo.GetPlayerStats(ctx, testdb.PlayerMartinID, testdb.IsolationSeasonID)
	if err != nil {
		t.Fatalf("GetPlayerStats isolation season martin: %v", err)
	}
	if isolationMartin.TotalDeaths != 7 || isolationMartin.TotalYeets != 4 {
		t.Fatalf("expected isolation martin totals 7/4, got %d/%d", isolationMartin.TotalDeaths, isolationMartin.TotalYeets)
	}

	mainSeasonMartin, err := integrationRepo.GetPlayerStats(ctx, testdb.PlayerMartinID, testdb.SeasonID)
	if err != nil {
		t.Fatalf("GetPlayerStats main season martin: %v", err)
	}
	if mainSeasonMartin.TotalDeaths != 3 || mainSeasonMartin.TotalYeets != 3 {
		t.Fatalf("expected unchanged main season martin totals 3/3, got %d/%d", mainSeasonMartin.TotalDeaths, mainSeasonMartin.TotalYeets)
	}

	isolationSeb, err := integrationRepo.GetPlayerStats(ctx, testdb.PlayerSebID, testdb.IsolationSeasonID)
	if err != nil {
		t.Fatalf("GetPlayerStats isolation season seb: %v", err)
	}
	if isolationSeb.TotalDeaths != 0 || isolationSeb.TotalYeets != 0 {
		t.Fatalf("expected seb to have no stats in isolation season, got deaths=%d yeets=%d", isolationSeb.TotalDeaths, isolationSeb.TotalYeets)
	}
}

func TestLeaderboardAndAggregateOrdering(t *testing.T) {
	ctx := setupIntegrationTest(t)

	leaderboard, err := integrationRepo.ListLeaderboard(ctx, testdb.SeasonID)
	if err != nil {
		t.Fatalf("ListLeaderboard: %v", err)
	}

	if len(leaderboard) < 4 {
		t.Fatalf("expected at least 4 leaderboard entries, got %d", len(leaderboard))
	}

	expectedOrder := []string{testdb.PlayerMartinName, testdb.PlayerSebName, testdb.PlayerNiklasName, testdb.PlayerNikoName}
	if !leaderboardNamesHavePrefixOrder(leaderboard, expectedOrder) {
		t.Fatalf("unexpected leaderboard order: %#v", leaderboardDisplayNames(leaderboard))
	}

	if leaderboard[0].TotalMistakes != 6 || leaderboard[0].TotalYeets != 3 {
		t.Fatalf("unexpected top tied entry totals: %#v", leaderboard[0])
	}
	if leaderboard[2].PlayerID != testdb.PlayerNiklasID || leaderboard[2].TotalMistakes != 6 {
		t.Fatalf("expected niklas third among six-mistake players, got %#v", leaderboard[2])
	}

	_, dungeons, err := integrationRepo.ListSeasonDungeons(ctx, testdb.SeasonID)
	if err != nil {
		t.Fatalf("ListSeasonDungeons: %v", err)
	}

	var alphaSummary *DungeonSummary
	for index := range dungeons {
		if dungeons[index].ID == testdb.DungeonAlphaID {
			alphaSummary = &dungeons[index]
			break
		}
	}
	if alphaSummary == nil {
		t.Fatal("expected alpha dungeon aggregate in season dungeons")
	}
	if alphaSummary.TotalDeaths != 9 || alphaSummary.TotalYeets != 1 || alphaSummary.TotalMistakes != 10 {
		t.Fatalf("unexpected alpha aggregate totals: %#v", alphaSummary)
	}

	dungeonLeaderboard, err := integrationRepo.ListDungeonLeaderboard(ctx, testdb.SeasonID, testdb.DungeonAlphaID)
	if err != nil {
		t.Fatalf("ListDungeonLeaderboard: %v", err)
	}

	expectedDungeonOrder := []string{testdb.PlayerNiklasName, testdb.PlayerSebName, testdb.PlayerMartinName, testdb.PlayerNikoName}
	if !dungeonLeaderboardNamesHavePrefixOrder(dungeonLeaderboard.Leaderboard, expectedDungeonOrder) {
		t.Fatalf("unexpected dungeon leaderboard order: %#v", dungeonLeaderboardDisplayNames(dungeonLeaderboard.Leaderboard))
	}

	if dungeonLeaderboard.Leaderboard[0].TotalMistakes != 5 {
		t.Fatalf("expected niklas to lead alpha dungeon with 5 mistakes, got %#v", dungeonLeaderboard.Leaderboard[0])
	}
}

func TestUpsertTransactionRollback(t *testing.T) {
	ctx := setupIntegrationTest(t)

	baselineDeaths, baselineYeets, err := readPlayerDungeonStat(
		ctx,
		testdb.PlayerSebID,
		testdb.SeasonID,
		testdb.DungeonAlphaID,
	)
	if err != nil {
		t.Fatalf("read baseline seb alpha: %v", err)
	}

	transaction, err := integrationClient.Pool().Begin(ctx)
	if err != nil {
		t.Fatalf("begin transaction: %v", err)
	}
	defer transaction.Rollback(ctx)

	if _, err := upsertStatValues(ctx, transaction, testdb.PlayerSebID, testdb.SeasonID, testdb.DungeonAlphaID, 10, 10); err != nil {
		t.Fatalf("first upsert in transaction: %v", err)
	}

	_, err = upsertStatValues(ctx, transaction, testdb.PlayerSebID, testdb.IsolationSeasonID, testdb.DungeonBetaID, 1, 1)
	if err == nil {
		t.Fatal("expected FK failure for dungeon not linked to isolation season")
	}

	if err := transaction.Rollback(ctx); err != nil {
		t.Fatalf("rollback transaction: %v", err)
	}

	deaths, yeets, err := readPlayerDungeonStat(ctx, testdb.PlayerSebID, testdb.SeasonID, testdb.DungeonAlphaID)
	if err != nil {
		t.Fatalf("read seb alpha after rollback: %v", err)
	}

	if deaths != baselineDeaths || yeets != baselineYeets {
		t.Fatalf("expected rollback to preserve baseline %d/%d, got %d/%d", baselineDeaths, baselineYeets, deaths, yeets)
	}
}

func TestFailedBatchLeavesSeededRowsUnchanged(t *testing.T) {
	ctx := setupIntegrationTest(t)

	unknownPlayerID := "eeee0002-0000-4000-8000-000000000099"
	_, err := integrationRepo.SetStatsBatch(ctx, unknownPlayerID, testdb.SeasonID, []StatUpdate{
		{DungeonID: testdb.DungeonAlphaID, Deaths: 99, Yeets: 99},
	})
	if !errors.Is(err, ErrNotFound) {
		t.Fatalf("expected ErrNotFound, got %v", err)
	}

	if err := integrationClient.Verify(ctx); err != nil {
		t.Fatalf("baseline verify after failed batch: %v", err)
	}

	isolationDeaths, isolationYeets, err := readPlayerDungeonStat(
		ctx,
		testdb.PlayerMartinID,
		testdb.IsolationSeasonID,
		testdb.DungeonAlphaID,
	)
	if err != nil {
		t.Fatalf("read isolation martin stat: %v", err)
	}
	if isolationDeaths != 7 || isolationYeets != 4 {
		t.Fatalf("expected isolation season unchanged at 7/4, got %d/%d", isolationDeaths, isolationYeets)
	}

	unknownDungeonID := "eeee0003-0000-4000-8000-000000000099"
	_, err = integrationRepo.SetStatsBatch(ctx, testdb.PlayerSebID, testdb.SeasonID, []StatUpdate{
		{DungeonID: unknownDungeonID, Deaths: 1, Yeets: 1},
	})
	if !errors.Is(err, ErrNotFound) {
		t.Fatalf("expected ErrNotFound for unknown dungeon, got %v", err)
	}

	if err := integrationClient.Verify(ctx); err != nil {
		t.Fatalf("baseline verify after unknown dungeon batch: %v", err)
	}
}

func readPlayerDungeonStat(
	ctx context.Context,
	playerID string,
	seasonID string,
	dungeonID string,
) (int, int, error) {
	var deaths int
	var yeets int
	err := integrationClient.Pool().QueryRow(ctx, `
		select deaths, yeets
		from player_dungeon_stats
		where player_id = $1::uuid
			and season_id = $2::uuid
			and dungeon_id = $3::uuid
	`, playerID, seasonID, dungeonID).Scan(&deaths, &yeets)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return 0, 0, nil
		}
		return 0, 0, err
	}

	return deaths, yeets, nil
}

func leaderboardDisplayNames(entries []LeaderboardEntry) []string {
	names := make([]string, 0, len(entries))
	for _, entry := range entries {
		names = append(names, entry.DisplayName)
	}
	return names
}

func leaderboardNamesHavePrefixOrder(entries []LeaderboardEntry, expected []string) bool {
	if len(entries) < len(expected) {
		return false
	}

	for index, name := range expected {
		if entries[index].DisplayName != name {
			return false
		}
	}

	return true
}

func dungeonLeaderboardDisplayNames(entries []DungeonLeaderboardEntry) []string {
	names := make([]string, 0, len(entries))
	for _, entry := range entries {
		names = append(names, entry.DisplayName)
	}
	return names
}

func dungeonLeaderboardNamesHavePrefixOrder(entries []DungeonLeaderboardEntry, expected []string) bool {
	if len(entries) < len(expected) {
		return false
	}

	for index, name := range expected {
		if entries[index].DisplayName != name {
			return false
		}
	}

	return true
}
