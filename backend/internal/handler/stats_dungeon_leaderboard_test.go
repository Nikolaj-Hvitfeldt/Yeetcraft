package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"

	"yeetcraft/backend/internal/repository"
)

type dungeonLeaderboardRepositoryStub struct {
	leaderboard repository.DungeonLeaderboard
	err         error
}

func (stub dungeonLeaderboardRepositoryStub) ListLeaderboard(context.Context, string) ([]repository.LeaderboardEntry, error) {
	return nil, nil
}

func (stub dungeonLeaderboardRepositoryStub) GetSeasonLeaders(context.Context, string) (repository.SeasonLeaders, error) {
	return repository.SeasonLeaders{}, nil
}

func (stub dungeonLeaderboardRepositoryStub) GetPlayerStats(context.Context, string, string) (repository.PlayerStats, error) {
	return repository.PlayerStats{}, nil
}

func (stub dungeonLeaderboardRepositoryStub) ListSeasons(context.Context) ([]repository.SeasonSummary, error) {
	return nil, nil
}

func (stub dungeonLeaderboardRepositoryStub) ListSeasonDungeons(context.Context, string) (repository.SeasonSummary, []repository.DungeonSummary, error) {
	return repository.SeasonSummary{}, nil, nil
}

func (stub dungeonLeaderboardRepositoryStub) ListDungeonLeaderboard(context.Context, string, string) (repository.DungeonLeaderboard, error) {
	return stub.leaderboard, stub.err
}

func (stub dungeonLeaderboardRepositoryStub) SetStats(context.Context, string, string, string, int, int) (repository.StatRow, error) {
	return repository.StatRow{}, nil
}

func (stub dungeonLeaderboardRepositoryStub) SetStatsBatch(context.Context, string, string, []repository.StatUpdate) ([]repository.StatRow, error) {
	return nil, nil
}

func TestDungeonLeaderboardReturnsLeaderboard(t *testing.T) {
	seasonID := "11111111-1111-4111-8111-111111111111"
	dungeonID := "22222222-2222-4222-8222-222222222222"

	stub := dungeonLeaderboardRepositoryStub{
		leaderboard: repository.DungeonLeaderboard{
			Season: repository.SeasonSummary{ID: seasonID, Name: "Season 1", IsCurrent: true},
			Dungeon: repository.DungeonReference{
				ID:           dungeonID,
				Name:         "Nexus-Point Xenas",
				DisplayOrder: 1,
			},
			Leaderboard: []repository.DungeonLeaderboardEntry{
				{
					PlayerID:      "33333333-3333-4333-8333-333333333333",
					DisplayName:   "Niklas",
					Deaths:        2,
					Yeets:         1,
					TotalMistakes: 3,
				},
			},
		},
	}

	handler := NewStatsHandler(stub)
	request := httptest.NewRequest(http.MethodGet, "/api/seasons/"+seasonID+"/dungeons/"+dungeonID+"/leaderboard", nil)
	routeContext := chi.NewRouteContext()
	routeContext.URLParams.Add("seasonId", seasonID)
	routeContext.URLParams.Add("dungeonId", dungeonID)
	request = request.WithContext(context.WithValue(request.Context(), chi.RouteCtxKey, routeContext))

	responseRecorder := httptest.NewRecorder()
	handler.DungeonLeaderboard(responseRecorder, request)

	if responseRecorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, responseRecorder.Code)
	}

	var payload repository.DungeonLeaderboard
	if err := json.Unmarshal(responseRecorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode response: %v", err)
	}

	if payload.Dungeon.Name != "Nexus-Point Xenas" {
		t.Fatalf("expected dungeon name Nexus-Point Xenas, got %q", payload.Dungeon.Name)
	}

	if len(payload.Leaderboard) != 1 || payload.Leaderboard[0].DisplayName != "Niklas" {
		t.Fatalf("unexpected leaderboard payload: %#v", payload.Leaderboard)
	}
}

func TestDungeonLeaderboardRejectsInvalidSeasonID(t *testing.T) {
	handler := NewStatsHandler(dungeonLeaderboardRepositoryStub{})
	request := httptest.NewRequest(http.MethodGet, "/api/seasons/not-a-uuid/dungeons/22222222-2222-4222-8222-222222222222/leaderboard", nil)
	routeContext := chi.NewRouteContext()
	routeContext.URLParams.Add("seasonId", "not-a-uuid")
	routeContext.URLParams.Add("dungeonId", "22222222-2222-4222-8222-222222222222")
	request = request.WithContext(context.WithValue(request.Context(), chi.RouteCtxKey, routeContext))

	responseRecorder := httptest.NewRecorder()
	handler.DungeonLeaderboard(responseRecorder, request)

	if responseRecorder.Code != http.StatusBadRequest {
		t.Fatalf("expected status %d, got %d", http.StatusBadRequest, responseRecorder.Code)
	}
}
