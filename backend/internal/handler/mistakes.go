package handler

import (
	"context"
	"log"
	"net/http"

	"yeetcraft/backend/internal/repository"
)

type MistakeRepository interface {
	List(ctx context.Context) ([]repository.Mistake, error)
}

type MistakeHandler struct {
	mistakeRepository MistakeRepository
}

type MistakeListResponse struct {
	Mistakes []repository.Mistake `json:"mistakes"`
}

func NewMistakeHandler(mistakeRepository MistakeRepository) MistakeHandler {
	return MistakeHandler{
		mistakeRepository: mistakeRepository,
	}
}

func (mistakeHandler MistakeHandler) List(responseWriter http.ResponseWriter, request *http.Request) {
	mistakes, err := mistakeHandler.mistakeRepository.List(request.Context())
	if err != nil {
		log.Printf("list mistakes: %v", err)
		InternalServerError(responseWriter)
		return
	}

	WriteJSON(responseWriter, http.StatusOK, MistakeListResponse{
		Mistakes: mistakes,
	})
}
