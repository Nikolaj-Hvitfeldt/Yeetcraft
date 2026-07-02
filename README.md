# Yeetcraft

Minimal full-stack app for tracking World of Warcraft dungeon mistakes (wipes, deaths, yeets) among friends.

## Tech stack

| Layer    | Stack                                                                 |
| -------- | --------------------------------------------------------------------- |
| Backend  | Go, net/http, chi, pgx → PostgreSQL (e.g. Supabase)                  |
| Frontend | React, TypeScript, Vite, Tailwind CSS, TanStack Query & Table, React Router |

## Prerequisites

- **Backend**: Go 1.22 or newer
- **Frontend**: Node.js and npm
- **Database** (optional for local dev): PostgreSQL; the mistakes API currently uses **mock data** until `MistakeRepository` is switched to real queries. See `backend/db/schema.sql` for an example table.

## Repository layout

- `backend/` — Go API (`go run ./cmd/server`)
- `frontend/` — Vite dev server on port **3000**, proxying `/api` to the backend

## Quick start

### Backend

```powershell
cd backend
go run ./cmd/server
```

The API listens on **8080** by default (`SERVER_HOST` / `SERVER_PORT` env overrides).

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open the app at **http://localhost:3000**. Requests to `/api/*` are proxied to **http://localhost:8080** (see `frontend/vite.config.ts`).

## Environment variables

Set these for production or when pointing at a real database (e.g. Supabase):

| Variable                                              | Purpose                                      |
| ----------------------------------------------------- | -------------------------------------------- |
| `SERVER_HOST`                                         | Bind address (default: `0.0.0.0`)          |
| `SERVER_PORT`                                         | HTTP port (default: `8080`)                 |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | PostgreSQL connection                   |
| `DB_SSL_MODE`                                         | PostgreSQL `sslmode` (default: `require`)   |
| `API_KEY`                                             | Optional; URL-based API key auth when set   |

## API

| Method | Path             | Description                                                    |
| ------ | ---------------- | -------------------------------------------------------------- |
| `GET`  | `/api/health`    | Health check                                                   |
| `GET`  | `/api/mistakes`  | List mistakes (mock data until DB layer is enabled)            |
