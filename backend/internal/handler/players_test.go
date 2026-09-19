package handler

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"yeetcraft/backend/internal/repository"
)

type fakePlayersRepository struct {
	listPlayerRosterResult repository.PlayerRoster
	listPlayerRosterErr    error
}

func (fake *fakePlayersRepository) ListPlayerRoster(context.Context) (repository.PlayerRoster, error) {
	return fake.listPlayerRosterResult, fake.listPlayerRosterErr
}

func TestListPlayersReturnsRoster(t *testing.T) {
	realm := "Test Realm"
	region := "EU"
	classKey := "warlock"

	fake := &fakePlayersRepository{
		listPlayerRosterResult: repository.PlayerRoster{
			Players: []repository.PlayerRosterEntry{
				{
					ID:          testPlayerID,
					DisplayName: "Seb",
					Characters: []repository.CharacterRosterEntry{
						{
							ID:           "eeee0004-0000-4000-8000-000000000001",
							Name:         "MostDope",
							Realm:        &realm,
							Region:       &region,
							ClassKey:     &classKey,
							Active:       true,
							DisplayOrder: 0,
						},
					},
				},
			},
		},
	}
	handler := NewPlayersHandler(fake)

	request := httptest.NewRequest(http.MethodGet, "/api/players", nil)
	recorder := httptest.NewRecorder()
	handler.List(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", recorder.Code)
	}

	var payload repository.PlayerRoster
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if len(payload.Players) != 1 {
		t.Fatalf("expected one player, got %#v", payload.Players)
	}
	if len(payload.Players[0].Characters) != 1 || payload.Players[0].Characters[0].Name != "MostDope" {
		t.Fatalf("unexpected characters payload: %#v", payload.Players[0].Characters)
	}
	if strings.Contains(recorder.Body.String(), "guid") {
		t.Fatalf("response must not include guid field, got %s", recorder.Body.String())
	}
}

func TestListPlayersReturnsEmptyNonNilSlices(t *testing.T) {
	fake := &fakePlayersRepository{
		listPlayerRosterResult: repository.PlayerRoster{
			Players: []repository.PlayerRosterEntry{},
		},
	}
	handler := NewPlayersHandler(fake)

	request := httptest.NewRequest(http.MethodGet, "/api/players", nil)
	recorder := httptest.NewRecorder()
	handler.List(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", recorder.Code)
	}

	var payload repository.PlayerRoster
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if payload.Players == nil {
		t.Fatal("expected non-nil players slice in JSON response")
	}
	if len(payload.Players) != 0 {
		t.Fatalf("expected empty players list, got %#v", payload.Players)
	}
}

func TestListPlayersReturnsPlayerWithEmptyCharacters(t *testing.T) {
	fake := &fakePlayersRepository{
		listPlayerRosterResult: repository.PlayerRoster{
			Players: []repository.PlayerRosterEntry{
				{
					ID:          testPlayerID,
					DisplayName: "Guest",
					Characters:  []repository.CharacterRosterEntry{},
				},
			},
		},
	}
	handler := NewPlayersHandler(fake)

	request := httptest.NewRequest(http.MethodGet, "/api/players", nil)
	recorder := httptest.NewRecorder()
	handler.List(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", recorder.Code)
	}

	var payload repository.PlayerRoster
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if payload.Players[0].Characters == nil {
		t.Fatal("expected non-nil characters slice in JSON response")
	}
	if len(payload.Players[0].Characters) != 0 {
		t.Fatalf("expected empty characters list, got %#v", payload.Players[0].Characters)
	}
}

func TestListPlayersIsPublicWithoutAPIKey(t *testing.T) {
	fake := &fakePlayersRepository{
		listPlayerRosterResult: repository.PlayerRoster{
			Players: []repository.PlayerRosterEntry{},
		},
	}
	handler := NewPlayersHandler(fake)

	request := httptest.NewRequest(http.MethodGet, "/api/players", nil)
	recorder := httptest.NewRecorder()
	handler.List(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected public GET without API key to succeed, got %d body=%s", recorder.Code, recorder.Body.String())
	}
}

func TestListPlayersMapsRepositoryError(t *testing.T) {
	fake := &fakePlayersRepository{listPlayerRosterErr: errors.New("pq: connection refused")}
	handler := NewPlayersHandler(fake)

	request := httptest.NewRequest(http.MethodGet, "/api/players", nil)
	recorder := httptest.NewRecorder()
	handler.List(recorder, request)

	if recorder.Code != http.StatusInternalServerError {
		t.Fatalf("expected status 500, got %d", recorder.Code)
	}
	if strings.Contains(recorder.Body.String(), "connection refused") {
		t.Fatalf("expected generic error response, got %s", recorder.Body.String())
	}
}
