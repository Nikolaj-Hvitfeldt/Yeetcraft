# Yeetcraft

Full-stack app for tracking World of Warcraft dungeon mistakes (deaths, yeets) among friends across seasons.

## Tech stack

| Layer    | Stack                                                                 |
| -------- | --------------------------------------------------------------------- |
| Backend  | Go, chi, pgx → PostgreSQL (e.g. Supabase)                            |
| Frontend | React, TypeScript, Vite, Tailwind CSS, TanStack Query, React Router  |

## Prerequisites

- **Backend**: Go 1.22 or newer
- **Frontend**: Node.js and npm
- **Database**: PostgreSQL (required for API data). See `backend/db/schema.sql` for the schema.

## Repository layout

- `backend/` — Go API (`go run ./cmd/server`)
- `frontend/` — Vite dev server on port **3000**, proxying `/api` to the backend

## Quick start

### Backend

```powershell
cd backend
copy .env.example .env
# Edit .env with your Supabase DATABASE_URL (see below)
go run ./cmd/server
```

The API listens on **8080** by default (`SERVER_HOST` / `SERVER_PORT` env overrides).

Without `DATABASE_URL` (or `DB_*` fields), the server starts but API requests return database errors. Set database credentials to connect to Supabase or another PostgreSQL instance.

### Supabase connection

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Project Settings** → **Database**.
2. Copy the **Connection string** (URI). Prefer the **Transaction pooler** on port **6543** for the Go backend.
3. Paste it into `backend/.env` as `DATABASE_URL`.

Example (replace `[project-ref]`, `[password]`, and `[region]`):

```env
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

RLS is enabled on all tables with **no public policies**, so only the backend (postgres role) can read/write. The React app calls the Go API, not Supabase directly.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open the app at **http://localhost:3000**. Requests to `/api/*` are proxied to **http://localhost:8080** (see `frontend/vite.config.ts`).

## Environment variables

| Variable                                              | Purpose                                      |
| ----------------------------------------------------- | -------------------------------------------- |
| `SERVER_HOST`                                         | Bind address (default: `0.0.0.0`)          |
| `SERVER_PORT`                                         | HTTP port (default: `8080`)                 |
| `DATABASE_URL`                                        | Supabase/Postgres URI (preferred)           |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | PostgreSQL connection (alternative)   |
| `DB_SSL_MODE`                                         | PostgreSQL `sslmode` (default: `require`)   |
| `API_KEY`                                             | Optional; protects write endpoints when set |

## API

| Method  | Path                                                              | Auth   | Description                          |
| ------- | ----------------------------------------------------------------- | ------ | ------------------------------------ |
| `GET`   | `/api/health`                                                     | No     | Health check                         |
| `GET`   | `/api/seasons`                                                    | No     | List seasons                         |
| `GET`   | `/api/seasons/leaders?seasonId=`                                  | No     | Season leaderboard and crown players |
| `GET`   | `/api/seasons/current/dungeons?seasonId=`                         | No     | Dungeons for a season                |
| `GET`   | `/api/players/{playerId}/stats?seasonId=`                         | No     | Player stats by dungeon              |
| `GET`   | `/api/players/by-slug/{playerSlug}/stats?seasonId=`               | No     | Player stats by display-name slug    |
| `GET`   | `/api/seasons/{seasonId}/dungeons/{dungeonId}/leaderboard`        | No     | Dungeon leaderboard                  |
| `PATCH` | `/api/stats/batch`                                                | Yes*   | Batch update player dungeon stats    |

\*Write auth is enforced when `API_KEY` is set. The frontend sends `X-API-Key` from the URL token or local storage for `PATCH` requests.

## Development

```powershell
# Frontend
cd frontend
npm run lint
npm test
npm run build

# Backend
cd backend
go test ./...
go build ./cmd/server
```
