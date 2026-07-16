package middleware

import (
	"net/http"
	"os"
	"strings"
)

var defaultAllowedOrigins = []string{
	"http://localhost:3000",
	"http://127.0.0.1:3000",
	"http://localhost:4173",
	"http://127.0.0.1:4173",
	"http://127.0.0.1:14173",
}

func CORS(nextHandler http.Handler) http.Handler {
	allowedOrigins := parseAllowedOrigins(os.Getenv("CORS_ALLOWED_ORIGINS"))

	return http.HandlerFunc(func(responseWriter http.ResponseWriter, request *http.Request) {
		origin := strings.TrimSpace(request.Header.Get("Origin"))
		if origin != "" {
			if !isOriginAllowed(origin, allowedOrigins) {
				if request.Method == http.MethodOptions {
					responseWriter.WriteHeader(http.StatusForbidden)
					return
				}

				nextHandler.ServeHTTP(responseWriter, request)
				return
			}

			responseWriter.Header().Set("Access-Control-Allow-Origin", origin)
			responseWriter.Header().Set("Vary", "Origin")
		}

		responseWriter.Header().Set("Access-Control-Allow-Methods", "GET, PATCH, POST, OPTIONS")
		responseWriter.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key")

		if request.Method == http.MethodOptions {
			responseWriter.WriteHeader(http.StatusNoContent)
			return
		}

		nextHandler.ServeHTTP(responseWriter, request)
	})
}

func parseAllowedOrigins(rawValue string) []string {
	rawValue = strings.TrimSpace(rawValue)
	if rawValue == "" {
		return append([]string(nil), defaultAllowedOrigins...)
	}

	parts := strings.Split(rawValue, ",")
	origins := make([]string, 0, len(parts))
	for _, part := range parts {
		origin := strings.TrimSpace(part)
		if origin == "" {
			continue
		}
		origins = append(origins, origin)
	}

	return origins
}

func isOriginAllowed(origin string, allowedOrigins []string) bool {
	for _, allowedOrigin := range allowedOrigins {
		if origin == allowedOrigin {
			return true
		}
	}

	return false
}
