# Local test Postgres (Docker Desktop). Does not touch hosted Supabase.
# Windows without Make: .\scripts\testdb.ps1 up

.DEFAULT_GOAL := help

COMPOSE := docker compose
export YEETCRAFT_TEST_MODE := 1
export TEST_DATABASE_URL := postgres://postgres@127.0.0.1:55432/yeetcraft_test?sslmode=disable

.PHONY: help up down destroy logs prepare seed reset verify test-integration

help:
	@echo "Yeetcraft local testdb"
	@echo "  make up                 Start Postgres on 127.0.0.1:55432"
	@echo "  make down               Stop the container (keep volume)"
	@echo "  make destroy            Stop and delete the local volume"
	@echo "  make logs               Follow Postgres logs"
	@echo "  make prepare            Apply schema.sql + seed (empty DB only)"
	@echo "  make seed reset verify  testdb CLI helpers"
	@echo "  make test-integration   go test ./internal/repository -tags=integration"

up:
	$(COMPOSE) up -d --wait

down:
	$(COMPOSE) down

destroy:
	$(COMPOSE) down -v

logs:
	$(COMPOSE) logs -f testdb

prepare: up
	cd backend && go run ./cmd/testdb prepare

seed:
	cd backend && go run ./cmd/testdb seed

reset:
	cd backend && go run ./cmd/testdb reset

verify:
	cd backend && go run ./cmd/testdb verify

test-integration: up
	cd backend && go test ./internal/repository -tags=integration
