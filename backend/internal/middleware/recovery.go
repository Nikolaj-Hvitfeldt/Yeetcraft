package middleware

import (
	"log"
	"net/http"

	"yeetcraft/backend/internal/handler"
)

func RecoverJSON(nextHandler http.Handler) http.Handler {
	return http.HandlerFunc(func(responseWriter http.ResponseWriter, request *http.Request) {
		defer func() {
			if panicValue := recover(); panicValue != nil {
				log.Printf("panic: %v", panicValue)
				handler.InternalServerError(responseWriter)
			}
		}()

		nextHandler.ServeHTTP(responseWriter, request)
	})
}
