package handler

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"yeetcraft/backend/internal/repository"
)

const (
	testPlayerID  = "33333333-3333-4333-8333-333333333333"
	testSeasonID  = "11111111-1111-4111-8111-111111111111"
	testDungeonID = "22222222-2222-4222-8222-222222222222"
	testDungeon2  = "22222222-2222-4222-8222-222222222223"
)

func TestSetStatsBatchValidation(t *testing.T) {
	t.Run("invalid JSON returns 400 and does not call repository", func(t *testing.T) {
		fake := &fakeStatsRepository{}
		handler := NewStatsHandler(fake)

		request := httptest.NewRequest(http.MethodPatch, "/api/stats/batch", strings.NewReader("{invalid"))
		recorder := httptest.NewRecorder()
		handler.SetStatsBatch(recorder, request)

		if recorder.Code != http.StatusBadRequest {
			t.Fatalf("expected status 400, got %d", recorder.Code)
		}
		if fake.setStatsBatchCallCount != 0 {
			t.Fatalf("expected repository not to be called, got %d calls", fake.setStatsBatchCallCount)
		}
	})

	t.Run("unknown JSON fields return 400 and do not call repository", func(t *testing.T) {
		fake := &fakeStatsRepository{}
		handler := NewStatsHandler(fake)

		body := `{"playerId":"` + testPlayerID + `","seasonId":"` + testSeasonID + `","stats":[],"extra":true}`
		request := httptest.NewRequest(http.MethodPatch, "/api/stats/batch", strings.NewReader(body))
		recorder := httptest.NewRecorder()
		handler.SetStatsBatch(recorder, request)

		if recorder.Code != http.StatusBadRequest {
			t.Fatalf("expected status 400, got %d", recorder.Code)
		}
		if fake.setStatsBatchCallCount != 0 {
			t.Fatalf("expected repository not to be called")
		}
	})

	t.Run("empty stats returns 400 and does not call repository", func(t *testing.T) {
		fake := &fakeStatsRepository{}
		handler := NewStatsHandler(fake)

		recorder := httptest.NewRecorder()
		handler.SetStatsBatch(recorder, newSetStatsBatchRequest(t, SetStatsBatchRequest{
			PlayerID: testPlayerID,
			SeasonID: testSeasonID,
			Stats:    []SetStatsBatchDungeonUpdate{},
		}))

		if recorder.Code != http.StatusBadRequest {
			t.Fatalf("expected status 400, got %d", recorder.Code)
		}
		if fake.setStatsBatchCallCount != 0 {
			t.Fatalf("expected repository not to be called")
		}
	})

	t.Run("duplicate dungeon IDs return 400 and do not call repository", func(t *testing.T) {
		fake := &fakeStatsRepository{}
		handler := NewStatsHandler(fake)

		recorder := httptest.NewRecorder()
		handler.SetStatsBatch(recorder, newSetStatsBatchRequest(t, SetStatsBatchRequest{
			PlayerID: testPlayerID,
			SeasonID: testSeasonID,
			Stats: []SetStatsBatchDungeonUpdate{
				{DungeonID: testDungeonID, Deaths: 1, Yeets: 0},
				{DungeonID: testDungeonID, Deaths: 2, Yeets: 0},
			},
		}))

		if recorder.Code != http.StatusBadRequest {
			t.Fatalf("expected status 400, got %d", recorder.Code)
		}
		if fake.setStatsBatchCallCount != 0 {
			t.Fatalf("expected repository not to be called")
		}
	})

	t.Run("negative deaths return 400 and do not call repository", func(t *testing.T) {
		fake := &fakeStatsRepository{}
		handler := NewStatsHandler(fake)

		recorder := httptest.NewRecorder()
		handler.SetStatsBatch(recorder, newSetStatsBatchRequest(t, SetStatsBatchRequest{
			PlayerID: testPlayerID,
			SeasonID: testSeasonID,
			Stats: []SetStatsBatchDungeonUpdate{
				{DungeonID: testDungeonID, Deaths: -1, Yeets: 0},
			},
		}))

		if recorder.Code != http.StatusBadRequest {
			t.Fatalf("expected status 400, got %d", recorder.Code)
		}
		if fake.setStatsBatchCallCount != 0 {
			t.Fatalf("expected repository not to be called")
		}
	})

	t.Run("negative yeets return 400 and do not call repository", func(t *testing.T) {
		fake := &fakeStatsRepository{}
		handler := NewStatsHandler(fake)

		recorder := httptest.NewRecorder()
		handler.SetStatsBatch(recorder, newSetStatsBatchRequest(t, SetStatsBatchRequest{
			PlayerID: testPlayerID,
			SeasonID: testSeasonID,
			Stats: []SetStatsBatchDungeonUpdate{
				{DungeonID: testDungeonID, Deaths: 0, Yeets: -1},
			},
		}))

		if recorder.Code != http.StatusBadRequest {
			t.Fatalf("expected status 400, got %d", recorder.Code)
		}
		if fake.setStatsBatchCallCount != 0 {
			t.Fatalf("expected repository not to be called")
		}
	})

	t.Run("invalid player UUID returns 400 and does not call repository", func(t *testing.T) {
		fake := &fakeStatsRepository{}
		handler := NewStatsHandler(fake)

		recorder := httptest.NewRecorder()
		handler.SetStatsBatch(recorder, newSetStatsBatchRequest(t, SetStatsBatchRequest{
			PlayerID: "not-a-uuid",
			SeasonID: testSeasonID,
			Stats: []SetStatsBatchDungeonUpdate{
				{DungeonID: testDungeonID, Deaths: 1, Yeets: 0},
			},
		}))

		if recorder.Code != http.StatusBadRequest {
			t.Fatalf("expected status 400, got %d", recorder.Code)
		}
		if fake.setStatsBatchCallCount != 0 {
			t.Fatalf("expected repository not to be called")
		}
	})

	t.Run("invalid season UUID returns 400 and does not call repository", func(t *testing.T) {
		fake := &fakeStatsRepository{}
		handler := NewStatsHandler(fake)

		recorder := httptest.NewRecorder()
		handler.SetStatsBatch(recorder, newSetStatsBatchRequest(t, SetStatsBatchRequest{
			PlayerID: testPlayerID,
			SeasonID: "not-a-uuid",
			Stats: []SetStatsBatchDungeonUpdate{
				{DungeonID: testDungeonID, Deaths: 1, Yeets: 0},
			},
		}))

		if recorder.Code != http.StatusBadRequest {
			t.Fatalf("expected status 400, got %d", recorder.Code)
		}
		if fake.setStatsBatchCallCount != 0 {
			t.Fatalf("expected repository not to be called")
		}
	})

	t.Run("invalid dungeon UUID returns 400 and does not call repository", func(t *testing.T) {
		fake := &fakeStatsRepository{}
		handler := NewStatsHandler(fake)

		recorder := httptest.NewRecorder()
		handler.SetStatsBatch(recorder, newSetStatsBatchRequest(t, SetStatsBatchRequest{
			PlayerID: testPlayerID,
			SeasonID: testSeasonID,
			Stats: []SetStatsBatchDungeonUpdate{
				{DungeonID: "not-a-uuid", Deaths: 1, Yeets: 0},
			},
		}))

		if recorder.Code != http.StatusBadRequest {
			t.Fatalf("expected status 400, got %d", recorder.Code)
		}
		if fake.setStatsBatchCallCount != 0 {
			t.Fatalf("expected repository not to be called")
		}
	})
}

func TestSetStatsBatchSuccessAndErrors(t *testing.T) {
	t.Run("valid request returns contract and calls repository with expected arguments", func(t *testing.T) {
		fake := &fakeStatsRepository{
			setStatsBatchResult: []repository.StatRow{
				{
					PlayerID:      testPlayerID,
					SeasonID:      testSeasonID,
					DungeonID:     testDungeonID,
					Deaths:        2,
					Yeets:         3,
					TotalMistakes: 5,
				},
			},
		}
		handler := NewStatsHandler(fake)

		recorder := httptest.NewRecorder()
		handler.SetStatsBatch(recorder, newSetStatsBatchRequest(t, SetStatsBatchRequest{
			PlayerID: testPlayerID,
			SeasonID: testSeasonID,
			Stats: []SetStatsBatchDungeonUpdate{
				{DungeonID: testDungeonID, Deaths: 2, Yeets: 3},
				{DungeonID: testDungeon2, Deaths: 1, Yeets: 0},
			},
		}))

		if recorder.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d body=%s", recorder.Code, recorder.Body.String())
		}
		if fake.setStatsBatchCallCount != 1 {
			t.Fatalf("expected one repository call, got %d", fake.setStatsBatchCallCount)
		}
		if fake.setStatsBatchPlayerID != testPlayerID || fake.setStatsBatchSeasonID != testSeasonID {
			t.Fatalf("unexpected repository target: player=%q season=%q", fake.setStatsBatchPlayerID, fake.setStatsBatchSeasonID)
		}
		if len(fake.setStatsBatchUpdates) != 2 {
			t.Fatalf("expected 2 updates, got %#v", fake.setStatsBatchUpdates)
		}

		var payload StatsBatchResponse
		if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
			t.Fatalf("decode response: %v", err)
		}
		if len(payload.Stats) != 1 || payload.Stats[0].TotalMistakes != 5 {
			t.Fatalf("unexpected response payload: %#v", payload.Stats)
		}
	})

	t.Run("ErrNotFound maps to 404", func(t *testing.T) {
		fake := &fakeStatsRepository{setStatsBatchErr: repository.ErrNotFound}
		handler := NewStatsHandler(fake)

		recorder := httptest.NewRecorder()
		handler.SetStatsBatch(recorder, validSetStatsBatchRequest(t))

		if recorder.Code != http.StatusNotFound {
			t.Fatalf("expected status 404, got %d", recorder.Code)
		}
	})

	t.Run("opaque repository error maps to generic 500", func(t *testing.T) {
		fake := &fakeStatsRepository{setStatsBatchErr: errors.New("pq: relation player_dungeon_stats does not exist")}
		handler := NewStatsHandler(fake)

		recorder := httptest.NewRecorder()
		handler.SetStatsBatch(recorder, validSetStatsBatchRequest(t))

		if recorder.Code != http.StatusInternalServerError {
			t.Fatalf("expected status 500, got %d", recorder.Code)
		}

		body := recorder.Body.String()
		if strings.Contains(body, "player_dungeon_stats") || strings.Contains(body, "pq:") {
			t.Fatalf("expected generic error response, got %s", body)
		}
	})
}

func newSetStatsBatchRequest(t *testing.T, payload SetStatsBatchRequest) *http.Request {
	t.Helper()

	body, err := json.Marshal(payload)
	if err != nil {
		t.Fatalf("marshal request: %v", err)
	}

	return httptest.NewRequest(http.MethodPatch, "/api/stats/batch", bytes.NewReader(body))
}

func validSetStatsBatchRequest(t *testing.T) *http.Request {
	t.Helper()

	return newSetStatsBatchRequest(t, SetStatsBatchRequest{
		PlayerID: testPlayerID,
		SeasonID: testSeasonID,
		Stats: []SetStatsBatchDungeonUpdate{
			{DungeonID: testDungeonID, Deaths: 1, Yeets: 2},
		},
	})
}
