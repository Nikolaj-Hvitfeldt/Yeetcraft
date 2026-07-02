package handler

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"regexp"

	"github.com/go-chi/chi/v5"

	"yeetcraft/backend/internal/repository"
)

var uuidPattern = regexp.MustCompile(`(?i)^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`)

type StatsRepository interface {
	ListLeaderboard(ctx context.Context) ([]repository.LeaderboardEntry, error)
	GetPlayerStats(ctx context.Context, playerID string, seasonID string) (repository.PlayerStats, error)
	ListSeasons(ctx context.Context) ([]repository.SeasonSummary, error)
	ListCurrentSeasonDungeons(ctx context.Context) (repository.SeasonSummary, []repository.DungeonSummary, error)
	SetStats(ctx context.Context, playerID string, seasonID string, dungeonID string, deaths int, yeets int) (repository.StatRow, error)
	AdjustStat(ctx context.Context, playerID string, seasonID string, dungeonID string, field repository.StatField, delta int) (repository.StatRow, error)
}

type StatsHandler struct {
	statsRepository StatsRepository
}

type LeaderboardResponse struct {
	Leaderboard []repository.LeaderboardEntry `json:"leaderboard"`
}

type SeasonsResponse struct {
	Seasons []repository.SeasonSummary `json:"seasons"`
}

type CurrentSeasonDungeonsResponse struct {
	Season   repository.SeasonSummary    `json:"season"`
	Dungeons []repository.DungeonSummary `json:"dungeons"`
}

type StatResponse struct {
	Stats repository.StatRow `json:"stats"`
}

type SetStatsRequest struct {
	PlayerID  string `json:"playerId"`
	SeasonID  string `json:"seasonId"`
	DungeonID string `json:"dungeonId"`
	Deaths    int    `json:"deaths"`
	Yeets     int    `json:"yeets"`
}

type AdjustStatRequest struct {
	PlayerID  string `json:"playerId"`
	SeasonID  string `json:"seasonId"`
	DungeonID string `json:"dungeonId"`
	Field     string `json:"field"`
	Delta     int    `json:"delta"`
}

func NewStatsHandler(statsRepository StatsRepository) StatsHandler {
	return StatsHandler{
		statsRepository: statsRepository,
	}
}

func (statsHandler StatsHandler) Leaderboard(responseWriter http.ResponseWriter, request *http.Request) {
	leaderboard, err := statsHandler.statsRepository.ListLeaderboard(request.Context())
	if err != nil {
		writeRepositoryError(responseWriter, err)
		return
	}

	WriteJSON(responseWriter, http.StatusOK, LeaderboardResponse{
		Leaderboard: leaderboard,
	})
}

func (statsHandler StatsHandler) PlayerStats(responseWriter http.ResponseWriter, request *http.Request) {
	playerID := chi.URLParam(request, "playerId")
	if !isValidUUID(playerID) {
		WriteError(responseWriter, http.StatusBadRequest, "Bad Request", "playerId must be a valid UUID.")
		return
	}

	seasonID := request.URL.Query().Get("seasonId")
	if seasonID != "" && !isValidUUID(seasonID) {
		WriteError(responseWriter, http.StatusBadRequest, "Bad Request", "seasonId must be a valid UUID.")
		return
	}

	playerStats, err := statsHandler.statsRepository.GetPlayerStats(request.Context(), playerID, seasonID)
	if err != nil {
		writeRepositoryError(responseWriter, err)
		return
	}

	WriteJSON(responseWriter, http.StatusOK, playerStats)
}

func (statsHandler StatsHandler) Seasons(responseWriter http.ResponseWriter, request *http.Request) {
	seasons, err := statsHandler.statsRepository.ListSeasons(request.Context())
	if err != nil {
		writeRepositoryError(responseWriter, err)
		return
	}

	WriteJSON(responseWriter, http.StatusOK, SeasonsResponse{
		Seasons: seasons,
	})
}

func (statsHandler StatsHandler) CurrentSeasonDungeons(responseWriter http.ResponseWriter, request *http.Request) {
	season, dungeons, err := statsHandler.statsRepository.ListCurrentSeasonDungeons(request.Context())
	if err != nil {
		writeRepositoryError(responseWriter, err)
		return
	}

	WriteJSON(responseWriter, http.StatusOK, CurrentSeasonDungeonsResponse{
		Season:   season,
		Dungeons: dungeons,
	})
}

func (statsHandler StatsHandler) SetStats(responseWriter http.ResponseWriter, request *http.Request) {
	var setStatsRequest SetStatsRequest
	if !decodeJSONRequest(responseWriter, request, &setStatsRequest) {
		return
	}

	if !validateStatTarget(responseWriter, setStatsRequest.PlayerID, setStatsRequest.SeasonID, setStatsRequest.DungeonID) {
		return
	}

	if setStatsRequest.Deaths < 0 || setStatsRequest.Yeets < 0 {
		WriteError(responseWriter, http.StatusBadRequest, "Bad Request", "deaths and yeets must be greater than or equal to 0.")
		return
	}

	statRow, err := statsHandler.statsRepository.SetStats(
		request.Context(),
		setStatsRequest.PlayerID,
		setStatsRequest.SeasonID,
		setStatsRequest.DungeonID,
		setStatsRequest.Deaths,
		setStatsRequest.Yeets,
	)
	if err != nil {
		writeRepositoryError(responseWriter, err)
		return
	}

	WriteJSON(responseWriter, http.StatusOK, StatResponse{
		Stats: statRow,
	})
}

func (statsHandler StatsHandler) AdjustStat(responseWriter http.ResponseWriter, request *http.Request) {
	var adjustStatRequest AdjustStatRequest
	if !decodeJSONRequest(responseWriter, request, &adjustStatRequest) {
		return
	}

	if !validateStatTarget(responseWriter, adjustStatRequest.PlayerID, adjustStatRequest.SeasonID, adjustStatRequest.DungeonID) {
		return
	}

	if adjustStatRequest.Delta == 0 {
		WriteError(responseWriter, http.StatusBadRequest, "Bad Request", "delta must not be 0.")
		return
	}

	statField, isValidField := parseStatField(adjustStatRequest.Field)
	if !isValidField {
		WriteError(responseWriter, http.StatusBadRequest, "Bad Request", `field must be either "deaths" or "yeets".`)
		return
	}

	statRow, err := statsHandler.statsRepository.AdjustStat(
		request.Context(),
		adjustStatRequest.PlayerID,
		adjustStatRequest.SeasonID,
		adjustStatRequest.DungeonID,
		statField,
		adjustStatRequest.Delta,
	)
	if err != nil {
		writeRepositoryError(responseWriter, err)
		return
	}

	WriteJSON(responseWriter, http.StatusOK, StatResponse{
		Stats: statRow,
	})
}

func decodeJSONRequest(responseWriter http.ResponseWriter, request *http.Request, destination any) bool {
	decoder := json.NewDecoder(request.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(destination); err != nil {
		WriteError(responseWriter, http.StatusBadRequest, "Bad Request", "Request body must be valid JSON.")
		return false
	}

	return true
}

func validateStatTarget(responseWriter http.ResponseWriter, playerID string, seasonID string, dungeonID string) bool {
	if !isValidUUID(playerID) {
		WriteError(responseWriter, http.StatusBadRequest, "Bad Request", "playerId must be a valid UUID.")
		return false
	}

	if !isValidUUID(seasonID) {
		WriteError(responseWriter, http.StatusBadRequest, "Bad Request", "seasonId must be a valid UUID.")
		return false
	}

	if !isValidUUID(dungeonID) {
		WriteError(responseWriter, http.StatusBadRequest, "Bad Request", "dungeonId must be a valid UUID.")
		return false
	}

	return true
}

func parseStatField(field string) (repository.StatField, bool) {
	switch field {
	case string(repository.StatFieldDeaths):
		return repository.StatFieldDeaths, true
	case string(repository.StatFieldYeets):
		return repository.StatFieldYeets, true
	default:
		return "", false
	}
}

func isValidUUID(value string) bool {
	return uuidPattern.MatchString(value)
}

func writeRepositoryError(responseWriter http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, repository.ErrNotFound):
		WriteError(responseWriter, http.StatusNotFound, "Not Found", "The requested resource was not found.")
	case errors.Is(err, repository.ErrNegativeStat):
		WriteError(responseWriter, http.StatusBadRequest, "Bad Request", "The resulting stat value cannot be below 0.")
	case errors.Is(err, repository.ErrDatabaseNotConfigured):
		InternalServerError(responseWriter)
	default:
		InternalServerError(responseWriter)
	}
}
