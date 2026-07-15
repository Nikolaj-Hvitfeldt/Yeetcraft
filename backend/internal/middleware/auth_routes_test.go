package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
)

func TestAPIKeyAllowsPublicReadsAndProtectsWrites(t *testing.T) {
	const testAPIKey = "test-secret-key"

	router := chi.NewRouter()
	router.Get("/api/seasons", func(responseWriter http.ResponseWriter, _ *http.Request) {
		responseWriter.WriteHeader(http.StatusOK)
		_, _ = responseWriter.Write([]byte(`{"seasons":[]}`))
	})

	writeRouter := router.With(APIKey(testAPIKey))
	writeRouter.Patch("/api/stats/batch", func(responseWriter http.ResponseWriter, _ *http.Request) {
		responseWriter.WriteHeader(http.StatusOK)
	})

	t.Run("GET without token is public", func(t *testing.T) {
		request := httptest.NewRequest(http.MethodGet, "/api/seasons", nil)
		recorder := httptest.NewRecorder()
		router.ServeHTTP(recorder, request)

		if recorder.Code == http.StatusUnauthorized {
			t.Fatalf("expected public GET, got status %d", recorder.Code)
		}
		if recorder.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", recorder.Code)
		}
	})

	t.Run("HEAD without token is public", func(t *testing.T) {
		request := httptest.NewRequest(http.MethodHead, "/api/seasons", nil)
		recorder := httptest.NewRecorder()
		router.ServeHTTP(recorder, request)

		if recorder.Code == http.StatusUnauthorized {
			t.Fatalf("expected public HEAD, got status %d", recorder.Code)
		}
	})

	t.Run("PATCH without token is unauthorized", func(t *testing.T) {
		request := httptest.NewRequest(http.MethodPatch, "/api/stats/batch", nil)
		recorder := httptest.NewRecorder()
		router.ServeHTTP(recorder, request)

		if recorder.Code != http.StatusUnauthorized {
			t.Fatalf("expected status 401, got %d", recorder.Code)
		}
	})

	t.Run("PATCH with invalid token is unauthorized", func(t *testing.T) {
		request := httptest.NewRequest(http.MethodPatch, "/api/stats/batch", nil)
		request.Header.Set(headerAPIKey, "wrong-token")
		recorder := httptest.NewRecorder()
		router.ServeHTTP(recorder, request)

		if recorder.Code != http.StatusUnauthorized {
			t.Fatalf("expected status 401, got %d", recorder.Code)
		}
	})

	t.Run("PATCH with valid token is authorized", func(t *testing.T) {
		request := httptest.NewRequest(http.MethodPatch, "/api/stats/batch", nil)
		request.Header.Set(headerAPIKey, testAPIKey)
		recorder := httptest.NewRecorder()
		router.ServeHTTP(recorder, request)

		if recorder.Code == http.StatusUnauthorized {
			t.Fatalf("expected authorized PATCH, got status %d", recorder.Code)
		}
		if recorder.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", recorder.Code)
		}
	})
}
