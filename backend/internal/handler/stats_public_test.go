package handler

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/go-chi/chi/v5"

	"yeetcraft/backend/internal/repository"
)

func TestHealthGetReturnsOK(t *testing.T) {
	handler := NewHealthHandler()
	request := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	recorder := httptest.NewRecorder()

	handler.Get(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", recorder.Code)
	}

	var payload HealthResponse
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if payload.Status != "ok" || payload.Timestamp == 0 {
		t.Fatalf("unexpected health payload: %#v", payload)
	}
}

func TestSeasonsReturnsList(t *testing.T) {
	fake := &fakeStatsRepository{
		listSeasonsResult: []repository.SeasonSummary{
			{ID: testSeasonID, Name: "Season 1", IsCurrent: true},
		},
	}
	handler := NewStatsHandler(fake)

	request := httptest.NewRequest(http.MethodGet, "/api/seasons", nil)
	recorder := httptest.NewRecorder()
	handler.Seasons(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", recorder.Code)
	}

	var payload SeasonsResponse
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if len(payload.Seasons) != 1 || payload.Seasons[0].Name != "Season 1" {
		t.Fatalf("unexpected seasons payload: %#v", payload.Seasons)
	}
}

func TestSeasonsReturnsEmptyList(t *testing.T) {
	fake := &fakeStatsRepository{listSeasonsResult: []repository.SeasonSummary{}}
	handler := NewStatsHandler(fake)

	request := httptest.NewRequest(http.MethodGet, "/api/seasons", nil)
	recorder := httptest.NewRecorder()
	handler.Seasons(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", recorder.Code)
	}

	var payload SeasonsResponse
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if payload.Seasons == nil {
		t.Fatal("expected non-nil seasons slice in JSON response")
	}
	if len(payload.Seasons) != 0 {
		t.Fatalf("expected empty seasons list, got %#v", payload.Seasons)
	}
}

func TestSeasonLeadersReturnsPayload(t *testing.T) {
	fake := &fakeStatsRepository{
		getSeasonLeadersResult: repository.SeasonLeaders{
			Season:      repository.SeasonSummary{ID: testSeasonID, Name: "Season 1", IsCurrent: true},
			Leaderboard: []repository.LeaderboardEntry{},
		},
	}
	handler := NewStatsHandler(fake)

	request := httptest.NewRequest(http.MethodGet, "/api/seasons/leaders?seasonId="+testSeasonID, nil)
	recorder := httptest.NewRecorder()
	handler.SeasonLeaders(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", recorder.Code)
	}

	var payload repository.SeasonLeaders
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if payload.Season.ID != testSeasonID {
		t.Fatalf("unexpected season leaders payload: %#v", payload.Season)
	}
}

func TestSeasonLeadersRejectsInvalidSeasonID(t *testing.T) {
	handler := NewStatsHandler(&fakeStatsRepository{})

	request := httptest.NewRequest(http.MethodGet, "/api/seasons/leaders?seasonId=not-a-uuid", nil)
	recorder := httptest.NewRecorder()
	handler.SeasonLeaders(recorder, request)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", recorder.Code)
	}
}

func TestSeasonLeadersMapsNotFound(t *testing.T) {
	fake := &fakeStatsRepository{getSeasonLeadersErr: repository.ErrNotFound}
	handler := NewStatsHandler(fake)

	request := httptest.NewRequest(http.MethodGet, "/api/seasons/leaders", nil)
	recorder := httptest.NewRecorder()
	handler.SeasonLeaders(recorder, request)

	if recorder.Code != http.StatusNotFound {
		t.Fatalf("expected status 404, got %d", recorder.Code)
	}
}

func TestCurrentSeasonDungeonsReturnsPayload(t *testing.T) {
	fake := &fakeStatsRepository{
		listSeasonDungeonsSeason: repository.SeasonSummary{ID: testSeasonID, Name: "Season 1", IsCurrent: true},
		listSeasonDungeonsResult: []repository.DungeonSummary{
			{ID: testDungeonID, Name: "Dungeon A", DisplayOrder: 1},
		},
	}
	handler := NewStatsHandler(fake)

	request := httptest.NewRequest(http.MethodGet, "/api/seasons/current/dungeons?seasonId="+testSeasonID, nil)
	recorder := httptest.NewRecorder()
	handler.CurrentSeasonDungeons(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", recorder.Code)
	}

	var payload CurrentSeasonDungeonsResponse
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if payload.Season.ID != testSeasonID || len(payload.Dungeons) != 1 {
		t.Fatalf("unexpected dungeons payload: season=%#v dungeons=%#v", payload.Season, payload.Dungeons)
	}
}

func TestCurrentSeasonDungeonsReturnsEmptyList(t *testing.T) {
	fake := &fakeStatsRepository{
		listSeasonDungeonsSeason: repository.SeasonSummary{ID: testSeasonID, Name: "Season 1", IsCurrent: true},
		listSeasonDungeonsResult: []repository.DungeonSummary{},
	}
	handler := NewStatsHandler(fake)

	request := httptest.NewRequest(http.MethodGet, "/api/seasons/current/dungeons", nil)
	recorder := httptest.NewRecorder()
	handler.CurrentSeasonDungeons(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", recorder.Code)
	}

	var payload CurrentSeasonDungeonsResponse
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if payload.Dungeons == nil {
		t.Fatal("expected non-nil dungeons slice in JSON response")
	}
}

func TestCurrentSeasonDungeonsRejectsInvalidSeasonID(t *testing.T) {
	handler := NewStatsHandler(&fakeStatsRepository{})

	request := httptest.NewRequest(http.MethodGet, "/api/seasons/current/dungeons?seasonId=bad", nil)
	recorder := httptest.NewRecorder()
	handler.CurrentSeasonDungeons(recorder, request)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", recorder.Code)
	}
}

func TestPlayerStatsByIDReturnsPayload(t *testing.T) {
	fake := &fakeStatsRepository{
		getPlayerStatsResult: repository.PlayerStats{
			Player:   repository.PlayerSummary{ID: testPlayerID, DisplayName: "Seb"},
			Season:   repository.SeasonSummary{ID: testSeasonID, Name: "Season 1", IsCurrent: true},
			Dungeons: []repository.DungeonStats{},
		},
	}
	handler := NewStatsHandler(fake)

	request := httptest.NewRequest(http.MethodGet, "/api/players/"+testPlayerID+"/stats?seasonId="+testSeasonID, nil)
	routeContext := chi.NewRouteContext()
	routeContext.URLParams.Add("playerId", testPlayerID)
	request = request.WithContext(context.WithValue(request.Context(), chi.RouteCtxKey, routeContext))

	recorder := httptest.NewRecorder()
	handler.PlayerStats(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", recorder.Code)
	}

	var payload repository.PlayerStats
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if payload.Player.DisplayName != "Seb" {
		t.Fatalf("unexpected player stats payload: %#v", payload.Player)
	}
}

func TestPlayerStatsByIDRejectsInvalidPlayerID(t *testing.T) {
	handler := NewStatsHandler(&fakeStatsRepository{})

	request := httptest.NewRequest(http.MethodGet, "/api/players/not-a-uuid/stats", nil)
	routeContext := chi.NewRouteContext()
	routeContext.URLParams.Add("playerId", "not-a-uuid")
	request = request.WithContext(context.WithValue(request.Context(), chi.RouteCtxKey, routeContext))

	recorder := httptest.NewRecorder()
	handler.PlayerStats(recorder, request)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", recorder.Code)
	}
}

func TestPlayerStatsByIDRejectsInvalidSeasonID(t *testing.T) {
	handler := NewStatsHandler(&fakeStatsRepository{})

	request := httptest.NewRequest(http.MethodGet, "/api/players/"+testPlayerID+"/stats?seasonId=bad", nil)
	routeContext := chi.NewRouteContext()
	routeContext.URLParams.Add("playerId", testPlayerID)
	request = request.WithContext(context.WithValue(request.Context(), chi.RouteCtxKey, routeContext))

	recorder := httptest.NewRecorder()
	handler.PlayerStats(recorder, request)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", recorder.Code)
	}
}

func TestPlayerStatsByIDMapsNotFound(t *testing.T) {
	fake := &fakeStatsRepository{getPlayerStatsErr: repository.ErrNotFound}
	handler := NewStatsHandler(fake)

	request := httptest.NewRequest(http.MethodGet, "/api/players/"+testPlayerID+"/stats", nil)
	routeContext := chi.NewRouteContext()
	routeContext.URLParams.Add("playerId", testPlayerID)
	request = request.WithContext(context.WithValue(request.Context(), chi.RouteCtxKey, routeContext))

	recorder := httptest.NewRecorder()
	handler.PlayerStats(recorder, request)

	if recorder.Code != http.StatusNotFound {
		t.Fatalf("expected status 404, got %d", recorder.Code)
	}
}

func TestPublicHandlersMapOpaqueRepositoryErrorToGeneric500(t *testing.T) {
	fake := &fakeStatsRepository{listSeasonsErr: errors.New("pq: connection refused")}
	handler := NewStatsHandler(fake)

	request := httptest.NewRequest(http.MethodGet, "/api/seasons", nil)
	recorder := httptest.NewRecorder()
	handler.Seasons(recorder, request)

	if recorder.Code != http.StatusInternalServerError {
		t.Fatalf("expected status 500, got %d", recorder.Code)
	}
	if strings.Contains(recorder.Body.String(), "connection refused") {
		t.Fatalf("expected generic error response, got %s", recorder.Body.String())
	}
}
