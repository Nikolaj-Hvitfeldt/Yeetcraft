package main

import (
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"

	"yeetcraft/backend/internal/config"
	"yeetcraft/backend/internal/handler"
	appmiddleware "yeetcraft/backend/internal/middleware"
	"yeetcraft/backend/internal/repository"
)

func main() {
	appConfig := config.Load()

	mistakeRepository := repository.NewMistakeRepository(appConfig.Database)
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
