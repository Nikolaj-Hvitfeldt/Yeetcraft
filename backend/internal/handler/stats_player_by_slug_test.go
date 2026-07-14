package handler

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"

	"yeetcraft/backend/internal/repository"
)

type playerStatsBySlugRepositoryStub struct {
	playerStats repository.PlayerStats
	err         error
}

func (stub playerStatsBySlugRepositoryStub) ListLeaderboard(context.Context, string) ([]repository.LeaderboardEntry, error) {
	return nil, nil
}

func (stub playerStatsBySlugRepositoryStub) GetSeasonLeaders(context.Context, string) (repository.SeasonLeaders, error) {
	return repository.SeasonLeaders{}, nil
}

func (stub playerStatsBySlugRepositoryStub) GetPlayerStats(context.Context, string, string) (repository.PlayerStats, error) {
	return repository.PlayerStats{}, nil
}

func (stub playerStatsBySlugRepositoryStub) GetPlayerStatsByDisplaySlug(context.Context, string, string) (repository.PlayerStats, error) {
	return stub.playerStats, stub.err
}

func (stub playerStatsBySlugRepositoryStub) ListSeasons(context.Context) ([]repository.SeasonSummary, error) {
	return nil, nil
}

func (stub playerStatsBySlugRepositoryStub) ListSeasonDungeons(context.Context, string) (repository.SeasonSummary, []repository.DungeonSummary, error) {
	return repository.SeasonSummary{}, nil, nil
}

func (stub playerStatsBySlugRepositoryStub) ListDungeonLeaderboard(context.Context, string, string) (repository.DungeonLeaderboard, error) {
	return repository.DungeonLeaderboard{}, nil
}

func (stub playerStatsBySlugRepositoryStub) SetStatsBatch(context.Context, string, string, []repository.StatUpdate) ([]repository.StatRow, error) {
	return nil, nil
}

func TestPlayerStatsBySlugReturnsStats(t *testing.T) {
	seasonID := "11111111-1111-4111-8111-111111111111"
	playerID := "33333333-3333-4333-8333-333333333333"

	stub := playerStatsBySlugRepositoryStub{
		playerStats: repository.PlayerStats{
			Player: repository.PlayerSummary{
				ID:          playerID,
				DisplayName: "Niklas",
			},
			Season: repository.SeasonSummary{
				ID:        seasonID,
				Name:      "Midnight Season 1",
				IsCurrent: true,
			},
			Dungeons: []repository.DungeonStats{},
		},
	}

	handler := NewStatsHandler(stub)
	request := httptest.NewRequest(http.MethodGet, "/api/players/by-slug/niklas/stats?seasonId="+seasonID, nil)
	routeContext := chi.NewRouteContext()
	routeContext.URLParams.Add("playerSlug", "niklas")
	request = request.WithContext(context.WithValue(request.Context(), chi.RouteCtxKey, routeContext))

	responseRecorder := httptest.NewRecorder()
	handler.PlayerStatsBySlug(responseRecorder, request)

	if responseRecorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, responseRecorder.Code)
	}

	var payload repository.PlayerStats
	if err := json.Unmarshal(responseRecorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode response: %v", err)
	}

	if payload.Player.ID != playerID || payload.Player.DisplayName != "Niklas" {
		t.Fatalf("unexpected player payload: %#v", payload.Player)
	}
}

func TestPlayerStatsBySlugReturnsNotFound(t *testing.T) {
	stub := playerStatsBySlugRepositoryStub{
		err: repository.ErrNotFound,
	}

	handler := NewStatsHandler(stub)
	request := httptest.NewRequest(http.MethodGet, "/api/players/by-slug/unknown-player/stats", nil)
	routeContext := chi.NewRouteContext()
	routeContext.URLParams.Add("playerSlug", "unknown-player")
	request = request.WithContext(context.WithValue(request.Context(), chi.RouteCtxKey, routeContext))

	responseRecorder := httptest.NewRecorder()
	handler.PlayerStatsBySlug(responseRecorder, request)

	if responseRecorder.Code != http.StatusNotFound {
		t.Fatalf("expected status %d, got %d", http.StatusNotFound, responseRecorder.Code)
	}
}

func TestPlayerStatsBySlugRejectsInvalidSeasonID(t *testing.T) {
	handler := NewStatsHandler(playerStatsBySlugRepositoryStub{})
	request := httptest.NewRequest(http.MethodGet, "/api/players/by-slug/niklas/stats?seasonId=not-a-uuid", nil)
	routeContext := chi.NewRouteContext()
	routeContext.URLParams.Add("playerSlug", "niklas")
	request = request.WithContext(context.WithValue(request.Context(), chi.RouteCtxKey, routeContext))

	responseRecorder := httptest.NewRecorder()
	handler.PlayerStatsBySlug(responseRecorder, request)

	if responseRecorder.Code != http.StatusBadRequest {
		t.Fatalf("expected status %d, got %d", http.StatusBadRequest, responseRecorder.Code)
	}
}

func TestPlayerStatsBySlugRejectsEmptySlug(t *testing.T) {
	handler := NewStatsHandler(playerStatsBySlugRepositoryStub{})
	request := httptest.NewRequest(http.MethodGet, "/api/players/by-slug/%20/stats", nil)
	routeContext := chi.NewRouteContext()
	routeContext.URLParams.Add("playerSlug", " ")
	request = request.WithContext(context.WithValue(request.Context(), chi.RouteCtxKey, routeContext))

	responseRecorder := httptest.NewRecorder()
	handler.PlayerStatsBySlug(responseRecorder, request)

	if responseRecorder.Code != http.StatusBadRequest {
		t.Fatalf("expected status %d, got %d", http.StatusBadRequest, responseRecorder.Code)
	}
}

func TestPlayerStatsBySlugPropagatesRepositoryError(t *testing.T) {
	stub := playerStatsBySlugRepositoryStub{
		err: errors.New("database unavailable"),
	}

	handler := NewStatsHandler(stub)
	request := httptest.NewRequest(http.MethodGet, "/api/players/by-slug/niklas/stats", nil)
	routeContext := chi.NewRouteContext()
	routeContext.URLParams.Add("playerSlug", "niklas")
	request = request.WithContext(context.WithValue(request.Context(), chi.RouteCtxKey, routeContext))

	responseRecorder := httptest.NewRecorder()
	handler.PlayerStatsBySlug(responseRecorder, request)

	if responseRecorder.Code != http.StatusInternalServerError {
		t.Fatalf("expected status %d, got %d", http.StatusInternalServerError, responseRecorder.Code)
	}
}
