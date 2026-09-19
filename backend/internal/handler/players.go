package handler

import (
	"context"
	"net/http"

	"yeetcraft/backend/internal/repository"
)

type PlayersRepository interface {
	ListPlayerRoster(ctx context.Context) (repository.PlayerRoster, error)
}

type PlayersHandler struct {
	playersRepository PlayersRepository
}

func NewPlayersHandler(playersRepository PlayersRepository) PlayersHandler {
	return PlayersHandler{
		playersRepository: playersRepository,
	}
}

func (playersHandler PlayersHandler) List(responseWriter http.ResponseWriter, request *http.Request) {
	roster, err := playersHandler.playersRepository.ListPlayerRoster(request.Context())
	if err != nil {
		writeRepositoryError(responseWriter, err)
		return
	}

	WriteJSON(responseWriter, http.StatusOK, roster)
}
