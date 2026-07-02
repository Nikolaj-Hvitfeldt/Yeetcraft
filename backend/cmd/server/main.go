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
		log.Printf("database not configured, using mock data")
	}

	mistakeRepository := repository.NewMistakeRepository(databasePool)
	healthHandler := handler.NewHealthHandler()
	mistakeHandler := handler.NewMistakeHandler(mistakeRepository)

	router := chi.NewRouter()
	router.Use(appmiddleware.RecoverJSON)
	router.Use(appmiddleware.CORS)
	router.NotFound(handler.NotFound)

	router.Get("/api/health", healthHandler.Get)
	router.With(appmiddleware.APIKey(appConfig.APIKey)).Get("/api/mistakes", mistakeHandler.List)

	serverAddress := appConfig.Server.Address()
	log.Printf("starting server on %s", serverAddress)
	if err := http.ListenAndServe(serverAddress, router); err != nil {
		log.Fatalf("server stopped: %v", err)
	}
}
