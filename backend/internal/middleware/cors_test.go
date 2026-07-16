package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestCORSAllowsConfiguredDevOrigin(t *testing.T) {
	t.Setenv("CORS_ALLOWED_ORIGINS", "http://127.0.0.1:14173")

	handler := CORS(http.HandlerFunc(func(responseWriter http.ResponseWriter, _ *http.Request) {
		responseWriter.WriteHeader(http.StatusOK)
	}))

	request := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	request.Header.Set("Origin", "http://127.0.0.1:14173")
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}

	if got := recorder.Header().Get("Access-Control-Allow-Origin"); got != "http://127.0.0.1:14173" {
		t.Fatalf("expected allowed origin header, got %q", got)
	}
}

func TestCORSRejectsUnknownOriginOnPreflight(t *testing.T) {
	t.Setenv("CORS_ALLOWED_ORIGINS", "http://127.0.0.1:14173")

	handler := CORS(http.HandlerFunc(func(responseWriter http.ResponseWriter, _ *http.Request) {
		responseWriter.WriteHeader(http.StatusOK)
	}))

	request := httptest.NewRequest(http.MethodOptions, "/api/stats/batch", nil)
	request.Header.Set("Origin", "https://evil.example")
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusForbidden {
		t.Fatalf("expected 403, got %d", recorder.Code)
	}

	if got := recorder.Header().Get("Access-Control-Allow-Origin"); got != "" {
		t.Fatalf("expected no allow-origin header, got %q", got)
	}
}

func TestCORSPassesThroughNonBrowserRequests(t *testing.T) {
	handler := CORS(http.HandlerFunc(func(responseWriter http.ResponseWriter, _ *http.Request) {
		responseWriter.WriteHeader(http.StatusOK)
	}))

	request := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}

	if got := recorder.Header().Get("Access-Control-Allow-Origin"); got != "" {
		t.Fatalf("expected no allow-origin header without Origin request header, got %q", got)
	}
}
