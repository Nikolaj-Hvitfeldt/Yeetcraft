package handler

import (
	"encoding/json"
	"net/http"
)

type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
}

func WriteJSON(responseWriter http.ResponseWriter, statusCode int, payload any) {
	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(statusCode)
	if encodeErr := json.NewEncoder(responseWriter).Encode(payload); encodeErr != nil {
		http.Error(responseWriter, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
	}
}

func WriteError(responseWriter http.ResponseWriter, statusCode int, errorText string, message string) {
	WriteJSON(responseWriter, statusCode, ErrorResponse{
		Error:   errorText,
		Message: message,
	})
}

func NotFound(responseWriter http.ResponseWriter, _ *http.Request) {
	WriteError(responseWriter, http.StatusNotFound, "Not Found", "The requested resource was not found.")
}

func InternalServerError(responseWriter http.ResponseWriter) {
	WriteError(responseWriter, http.StatusInternalServerError, "Internal Server Error", "An unexpected error occurred.")
}
