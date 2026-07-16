# Testing

Yeetcraft uses four layers: **Vitest** (frontend units), **Go unit/handler tests**, **Go repository integration tests** (PostgreSQL), and **Playwright** (Chromium E2E).

Tests never mutate dev or production databases — all DB tooling refuses non-`_test` database names and requires `YEETCRAFT_TEST_MODE=1`.

```text
        Playwright E2E (Chromium read/write)
      Go repository integration (Postgres _test)
    Vitest + Go unit/handler/middleware
```

## 1. Frontend unit tests

```powershell
cd frontend
npm test
```

## 2. Go unit, middleware, and handler tests

Runs handler, middleware, slug, and testdb package tests. Does **not** run integration-tagged PostgreSQL tests.

```powershell
cd backend
go test ./...
```

## 3. Test database setup

Create an **empty** PostgreSQL database whose name contains `_test` (for example `yeetcraft_test`). Do not point test tooling at your Supabase or local dev database.

Set these environment variables in your shell before running testdb, integration, or E2E commands. Use non-production test secrets only.

| Variable | Purpose |
| -------- | ------- |
| `YEETCRAFT_TEST_MODE` | Must be `1` for testdb and integration tests |
| `TEST_DATABASE_URL` | PostgreSQL URI for the `_test` database |
| `API_KEY` | Write token for E2E; must match `E2E_WRITE_TOKEN` |
| `E2E_WRITE_TOKEN` | Same value as `API_KEY` for Playwright write tests |

```powershell
$env:YEETCRAFT_TEST_MODE = '1'
$env:TEST_DATABASE_URL = 'postgres://postgres@127.0.0.1:55432/yeetcraft_test?sslmode=disable'
$env:API_KEY = 'e2e-test-token'
$env:E2E_WRITE_TOKEN = 'e2e-test-token'
```

### testdb commands

Run from `backend/`:

```powershell
cd backend
go run ./cmd/testdb prepare   # empty DB only: apply schema.sql once, then seed
go run ./cmd/testdb seed      # upsert deterministic fixtures
go run ./cmd/testdb reset     # restore mutable stats to seeded baseline
go run ./cmd/testdb verify    # assert baseline matches seed data
```

- **`prepare`** — for an empty test database only. Applies non-idempotent `schema.sql` once, then seeds. Fails if tables already exist.
- **`reset`** — idempotent; restores only mutable `player_dungeon_stats` rows to the seeded baseline.
- All commands refuse databases whose name does not contain `_test`.

## 4. Repository integration tests

PostgreSQL integration tests for the stats repository. They **fail fast** when misconfigured — they never silently skip.

```powershell
cd backend
go test ./internal/repository -tags=integration
```

Requires `YEETCRAFT_TEST_MODE=1`, `TEST_DATABASE_URL` pointing at a `_test` database, and a prepared test DB.

## 5. Playwright E2E

Chromium-only smoke tests. Playwright starts its own Go API on port **18080** and Vite preview on **14173** (not dev ports 8080/4173). Service workers are blocked. The E2E frontend build targets `http://127.0.0.1:18080` directly.

```powershell
cd frontend
# Set YEETCRAFT_TEST_MODE, TEST_DATABASE_URL, API_KEY, E2E_WRITE_TOKEN first
npm run test:e2e
npm run test:e2e:ui
```

| Project | Purpose |
| ------- | ------- |
| `setup` | Validates env, resets/verifies test DB via `cmd/testdb` |
| `chromium-read` | Public-read smoke (no writes) |
| `chromium-write` | Write-access tests; serial (`workers: 1`) with per-test `reset`/`verify` |

```powershell
npm run test:e2e -- --project=chromium-read
npm run test:e2e -- --project=chromium-write
```

Install Chromium once if needed:

```powershell
cd frontend
npx playwright install chromium
```

## Full local validation

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
