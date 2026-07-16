package middleware

import (
	"crypto/subtle"
	"net/http"
	"strings"

	"yeetcraft/backend/internal/handler"
)

const (
	headerAPIKey              = "X-API-Key"
	bearerPrefix              = "Bearer "
	unauthorizedError         = "Unauthorized"
	unauthorizedMessage       = "Invalid or missing access token. Please use the shared link."
	writeNotConfiguredError   = "Service Unavailable"
	writeNotConfiguredMessage = "Write access is not configured on the server."
)

func APIKey(expectedKey string) func(http.Handler) http.Handler {
	return func(nextHandler http.Handler) http.Handler {
		return http.HandlerFunc(func(responseWriter http.ResponseWriter, request *http.Request) {
			if strings.TrimSpace(expectedKey) == "" {
				handler.WriteError(
					responseWriter,
					http.StatusServiceUnavailable,
					writeNotConfiguredError,
					writeNotConfiguredMessage,
				)
				return
			}

			if !tokensEqual(extractToken(request), expectedKey) {
				handler.WriteError(responseWriter, http.StatusUnauthorized, unauthorizedError, unauthorizedMessage)
				return
			}

			nextHandler.ServeHTTP(responseWriter, request)
		})
	}
}

func tokensEqual(providedToken string, expectedToken string) bool {
	if len(providedToken) != len(expectedToken) {
		return false
	}

	return subtle.ConstantTimeCompare([]byte(providedToken), []byte(expectedToken)) == 1
}

func extractToken(request *http.Request) string {
	if authorizationHeader := request.Header.Get("Authorization"); strings.HasPrefix(authorizationHeader, bearerPrefix) {
		return strings.TrimSpace(strings.TrimPrefix(authorizationHeader, bearerPrefix))
	}

	return strings.TrimSpace(request.Header.Get(headerAPIKey))
}
