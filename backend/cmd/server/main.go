package main

import (
	"context"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/joho/godotenv"

	"yeetcraft/backend/internal/config"
	"yeetcraft/backend/internal/database"
	"yeetcraft/backend/internal/handler"
	appmiddleware "yeetcraft/backend/internal/middleware"
	"yeetcraft/backend/internal/repository"
)

func main() {
	_ = godotenv.Load()

	appConfig := config.Load()

	databasePool, err := database.NewPool(context.Background(), appConfig.Database)
	if err != nil {
		log.Fatalf("database connection failed: %v", err)
	}
	if databasePool != nil {
		defer databasePool.Close()
		log.Printf("connected to database")
	} else {
		log.Printf("database not configured, API requests will return errors")
	}

	statsRepository := repository.NewStatsRepository(databasePool)
	healthHandler := handler.NewHealthHandler()
	statsHandler := handler.NewStatsHandler(statsRepository)

	router := chi.NewRouter()
	router.Use(appmiddleware.RecoverJSON)
	router.Use(appmiddleware.CORS)
	router.NotFound(handler.NotFound)

	router.Get("/api/health", healthHandler.Get)
	router.Get("/api/players/by-slug/{playerSlug}/stats", statsHandler.PlayerStatsBySlug)
	router.Get("/api/players/{playerId}/stats", statsHandler.PlayerStats)
	router.Get("/api/seasons", statsHandler.Seasons)
	router.Get("/api/seasons/leaders", statsHandler.SeasonLeaders)
	router.Get("/api/seasons/current/dungeons", statsHandler.CurrentSeasonDungeons)
	router.Get("/api/seasons/{seasonId}/dungeons/{dungeonId}/leaderboard", statsHandler.DungeonLeaderboard)

	writeRouter := router.With(appmiddleware.APIKey(appConfig.APIKey))
	writeRouter.Patch("/api/stats/batch", statsHandler.SetStatsBatch)

	serverAddress := appConfig.Server.Address()
	log.Printf("starting server on %s", serverAddress)
	if err := http.ListenAndServe(serverAddress, router); err != nil {
		log.Fatalf("server stopped: %v", err)
	}
}
