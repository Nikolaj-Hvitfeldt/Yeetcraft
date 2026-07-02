package handler

import (
	"net/http"
	"time"
)

type HealthHandler struct{}

type HealthResponse struct {
	Status    string `json:"status"`
	Timestamp int64  `json:"timestamp"`
}

func NewHealthHandler() HealthHandler {
	return HealthHandler{}
}

func (healthHandler HealthHandler) Get(responseWriter http.ResponseWriter, request *http.Request) {
	WriteJSON(responseWriter, http.StatusOK, HealthResponse{
		Status:    "ok",
		Timestamp: time.Now().UnixMilli(),
	})
}
