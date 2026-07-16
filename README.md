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
| `API_KEY`                                             | Required for writes; empty/missing fails closed (503 on PATCH) |
| `CORS_ALLOWED_ORIGINS`                                | Optional comma-separated browser origins (defaults to local Vite/E2E origins) |

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

\*Write auth requires a non-empty `API_KEY` on the server. An empty or missing `API_KEY` does **not** open writes—the server returns **503** on mutation requests. The frontend unlocks editing via `?token=` in the page URL (stored locally); PATCH requests send `X-API-Key`. The backend also accepts `Authorization: Bearer <token>`. Query `?token=` on API routes is **not** supported.

## Testing

Yeetcraft uses four layers: **Vitest** (frontend units), **Go unit/handler tests**, **Go repository integration tests** (PostgreSQL), and **Playwright** (Chromium E2E). Tests never mutate dev or production databases—all DB tooling refuses non-`_test` database names and requires `YEETCRAFT_TEST_MODE=1`.

### 1. Frontend unit tests

Vitest is the frontend unit and component test layer.

```powershell
cd frontend
npm test
```

### 2. Go unit, middleware, and handler tests

Runs handler, middleware, slug, and testdb package tests. Does **not** run integration-tagged PostgreSQL tests.

```powershell
cd backend
go test ./...
```

### 3. Test database setup

Create an **empty** PostgreSQL database whose name contains `_test` (for example `yeetcraft_test`). Do not point test tooling at your Supabase or local dev database.

Set these environment variables in your shell before running testdb, integration, or E2E commands. Use non-production test secrets only.

| Variable | Purpose |
| -------- | ------- |
| `YEETCRAFT_TEST_MODE` | Must be `1` for testdb and integration tests |
| `TEST_DATABASE_URL` | PostgreSQL URI for the `_test` database (used by testdb, integration, and E2E) |
| `API_KEY` | Write token for E2E; must match `E2E_WRITE_TOKEN` |
| `E2E_WRITE_TOKEN` | Same value as `API_KEY` for Playwright write tests |

Example (adjust host/port/credentials):

```powershell
$env:YEETCRAFT_TEST_MODE = '1'
$env:TEST_DATABASE_URL = 'postgres://postgres@127.0.0.1:55432/yeetcraft_test?sslmode=disable'
$env:API_KEY = 'e2e-test-token'
$env:E2E_WRITE_TOKEN = 'e2e-test-token'
```

**testdb commands** (run from `backend/`):

```powershell
cd backend
go run ./cmd/testdb prepare   # empty DB only: apply schema.sql once, then seed
go run ./cmd/testdb seed      # upsert deterministic fixtures
go run ./cmd/testdb reset     # restore mutable stats to seeded baseline
go run ./cmd/testdb verify    # assert baseline matches seed data
```

- **`prepare`** — for an empty test database only. Applies non-idempotent `schema.sql` once, then seeds. Fails if tables already exist; do not rerun on an initialized database.
- **`reset`** — idempotent; restores only mutable `player_dungeon_stats` rows to the seeded baseline.
- All commands refuse databases whose name does not contain `_test`.

After the first successful `prepare`, E2E and integration runs typically use `reset` / `verify` via the setup project or test hooks.

### 4. Repository integration tests

PostgreSQL integration tests for the stats repository. They **fail fast** when misconfigured—they never silently skip.

```powershell
cd backend
go test ./internal/repository -tags=integration
```

Requires `YEETCRAFT_TEST_MODE=1`, `TEST_DATABASE_URL` pointing at a `_test` database, and a prepared test DB (`prepare` once, or `seed`/`reset`/`verify` thereafter).

### 5. Playwright E2E

Chromium-only smoke tests. Playwright starts its own Go API on port **18080** and Vite preview on **14173** (not dev ports 8080/4173). Service workers are blocked. The E2E frontend build targets `http://127.0.0.1:18080` directly (no preview `/api` proxy).

```powershell
cd frontend
# Set YEETCRAFT_TEST_MODE, TEST_DATABASE_URL, API_KEY, E2E_WRITE_TOKEN first (see above)
npm run test:e2e
npm run test:e2e:ui
```

Optional project filters:

```powershell
npm run test:e2e -- --project=chromium-read
npm run test:e2e -- --project=chromium-write
```

Projects:

| Project | Purpose |
| ------- | ------- |
| `setup` | Validates env, resets/verifies test DB via `cmd/testdb` |
| `chromium-read` | Public-read smoke (no writes) |
| `chromium-write` | Write-access tests; **serial** (`workers: 1`) with per-test `reset`/`verify` |

Write tests reset the database before and after each test via `go run ./cmd/testdb reset` and `verify`. No frontend PostgreSQL client is used—`cmd/testdb` is the only DB authority from E2E.

Install Chromium once if needed:

```powershell
cd frontend
npx playwright install chromium
```

### 6. Fail-closed `API_KEY`

- **`API_KEY` is required for writes** in normal operation. Set it in `backend/.env` for local dev.
- An **empty or missing `API_KEY`** does not disable protection—the server returns **503** on `PATCH /api/stats/batch`.
- The frontend **`?token=` query param** on page URLs is only the unlock mechanism; it is stripped from the URL and stored locally.
- API writes use the **`X-API-Key`** header (frontend) or **`Authorization: Bearer`** (also supported by the backend).
- API query **`?token=` is not supported** on backend routes.

### Full local validation (optional)

```powershell
# Frontend
cd frontend
npm run lint
npm test
npm run build

# Backend
cd backend
go test ./...
go test ./internal/repository -tags=integration

# E2E (with test DB env vars set)
cd frontend
npm run test:e2e

# Confirm baseline after E2E
cd backend
go run ./cmd/testdb verify
```

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
