package middleware

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/go-chi/chi/v5"
)

const testAPIKey = "test-secret-key"

func newAuthTestRouter(configuredAPIKey string) (*chi.Mux, *bool) {
	terminalCalled := false

	router := chi.NewRouter()
	router.Get("/api/seasons", func(responseWriter http.ResponseWriter, _ *http.Request) {
		responseWriter.WriteHeader(http.StatusOK)
		_, _ = responseWriter.Write([]byte(`{"seasons":[]}`))
	})

	writeRouter := router.With(APIKey(configuredAPIKey))
	writeRouter.Patch("/api/stats/batch", func(responseWriter http.ResponseWriter, _ *http.Request) {
		terminalCalled = true
		responseWriter.WriteHeader(http.StatusOK)
	})

	return router, &terminalCalled
}

func TestAPIKeyAllowsPublicReadsAndProtectsWrites(t *testing.T) {
	router, _ := newAuthTestRouter(testAPIKey)

	t.Run("GET without credential is public", func(t *testing.T) {
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

	t.Run("HEAD without credential is public", func(t *testing.T) {
		request := httptest.NewRequest(http.MethodHead, "/api/seasons", nil)
		recorder := httptest.NewRecorder()
		router.ServeHTTP(recorder, request)

		if recorder.Code == http.StatusUnauthorized {
			t.Fatalf("expected public HEAD, got status %d", recorder.Code)
		}
	})

	t.Run("PATCH without credential is unauthorized", func(t *testing.T) {
		router, terminalCalled := newAuthTestRouter(testAPIKey)

		request := httptest.NewRequest(http.MethodPatch, "/api/stats/batch", nil)
		recorder := httptest.NewRecorder()
		router.ServeHTTP(recorder, request)

		if recorder.Code != http.StatusUnauthorized {
			t.Fatalf("expected status 401, got %d", recorder.Code)
		}
		if *terminalCalled {
			t.Fatal("expected terminal handler not to be called")
		}
	})

	t.Run("PATCH with invalid X-API-Key is unauthorized", func(t *testing.T) {
		router, terminalCalled := newAuthTestRouter(testAPIKey)

		request := httptest.NewRequest(http.MethodPatch, "/api/stats/batch", nil)
		request.Header.Set(headerAPIKey, "wrong-token")
		recorder := httptest.NewRecorder()
		router.ServeHTTP(recorder, request)

		if recorder.Code != http.StatusUnauthorized {
			t.Fatalf("expected status 401, got %d", recorder.Code)
		}
		if *terminalCalled {
			t.Fatal("expected terminal handler not to be called")
		}
		assertBodyDoesNotContain(t, recorder.Body.String(), "wrong-token", testAPIKey)
	})

	t.Run("PATCH with valid X-API-Key succeeds", func(t *testing.T) {
		router, terminalCalled := newAuthTestRouter(testAPIKey)

		request := httptest.NewRequest(http.MethodPatch, "/api/stats/batch", nil)
		request.Header.Set(headerAPIKey, testAPIKey)
		recorder := httptest.NewRecorder()
		router.ServeHTTP(recorder, request)

		if recorder.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", recorder.Code)
		}
		if !*terminalCalled {
			t.Fatal("expected terminal handler to be called")
		}
		assertBodyDoesNotContain(t, recorder.Body.String(), testAPIKey)
	})

	t.Run("PATCH with valid Bearer succeeds", func(t *testing.T) {
		router, terminalCalled := newAuthTestRouter(testAPIKey)

		request := httptest.NewRequest(http.MethodPatch, "/api/stats/batch", nil)
		request.Header.Set("Authorization", "Bearer "+testAPIKey)
		recorder := httptest.NewRecorder()
		router.ServeHTTP(recorder, request)

		if recorder.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", recorder.Code)
		}
		if !*terminalCalled {
			t.Fatal("expected terminal handler to be called")
		}
	})

	t.Run("PATCH with invalid Bearer is unauthorized", func(t *testing.T) {
		router, terminalCalled := newAuthTestRouter(testAPIKey)

		request := httptest.NewRequest(http.MethodPatch, "/api/stats/batch", nil)
		request.Header.Set("Authorization", "Bearer wrong-token")
		recorder := httptest.NewRecorder()
		router.ServeHTTP(recorder, request)

		if recorder.Code != http.StatusUnauthorized {
			t.Fatalf("expected status 401, got %d", recorder.Code)
		}
		if *terminalCalled {
			t.Fatal("expected terminal handler not to be called")
		}
		assertBodyDoesNotContain(t, recorder.Body.String(), "wrong-token", testAPIKey)
	})

	t.Run("PATCH with empty configured API key returns service unavailable", func(t *testing.T) {
		router, terminalCalled := newAuthTestRouter("")

		request := httptest.NewRequest(http.MethodPatch, "/api/stats/batch", nil)
		request.Header.Set(headerAPIKey, testAPIKey)
		recorder := httptest.NewRecorder()
		router.ServeHTTP(recorder, request)

		if recorder.Code != http.StatusServiceUnavailable {
			t.Fatalf("expected status 503, got %d", recorder.Code)
		}
		if *terminalCalled {
			t.Fatal("expected terminal handler not to be called")
		}
		assertBodyDoesNotContain(t, recorder.Body.String(), testAPIKey)
	})

	t.Run("PATCH with empty request credential is unauthorized", func(t *testing.T) {
		router, terminalCalled := newAuthTestRouter(testAPIKey)

		request := httptest.NewRequest(http.MethodPatch, "/api/stats/batch", nil)
		request.Header.Set(headerAPIKey, "")
		recorder := httptest.NewRecorder()
		router.ServeHTTP(recorder, request)

		if recorder.Code != http.StatusUnauthorized {
			t.Fatalf("expected status 401, got %d", recorder.Code)
		}
		if *terminalCalled {
			t.Fatal("expected terminal handler not to be called")
		}
	})

	t.Run("PATCH with only query token is unauthorized", func(t *testing.T) {
		router, terminalCalled := newAuthTestRouter(testAPIKey)

		request := httptest.NewRequest(http.MethodPatch, "/api/stats/batch?token="+testAPIKey, nil)
		recorder := httptest.NewRecorder()
		router.ServeHTTP(recorder, request)

		if recorder.Code != http.StatusUnauthorized {
			t.Fatalf("expected status 401, got %d", recorder.Code)
		}
		if *terminalCalled {
			t.Fatal("expected terminal handler not to be called")
		}
		assertBodyDoesNotContain(t, recorder.Body.String(), testAPIKey)
	})
}

func assertBodyDoesNotContain(t *testing.T, body string, secrets ...string) {
	t.Helper()

	for _, secret := range secrets {
		if secret == "" {
			continue
		}
		if strings.Contains(body, secret) {
			t.Fatalf("expected response body not to contain secret %q", secret)
		}
	}
}
