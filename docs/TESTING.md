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

Use **local Docker Postgres**, not the hosted Yeetcraft / Supabase database. The database name must contain `_test` (the compose file uses `yeetcraft_test` on **127.0.0.1:55432**).

### Docker (recommended)

Requires Docker Desktop. From the repository root:

```powershell
# Windows (no Make required)
.\scripts\testdb.ps1 up
.\scripts\testdb.ps1 prepare

# Git Bash / WSL / macOS / Linux
make up
make prepare
```

Equivalent Compose commands: `docker compose up -d --wait` and `docker compose down`. `make destroy` / `.\scripts\testdb.ps1 destroy` stops the container **and** deletes the local volume.

`prepare` is for an **empty** database only. After the first successful prepare, use `reset` / `verify` (or `.\scripts\testdb.ps1 reset`). Do not run `prepare` against hosted Supabase.

`.\scripts\testdb.ps1` sets env vars only for **that process**. For Playwright in your current shell:

```powershell
. .\scripts\testdb-env.ps1
```

### Environment

Set these in your shell before running testdb, integration, or E2E commands **if you are not using** `make` / `scripts/testdb.ps1` (those set `YEETCRAFT_TEST_MODE` and `TEST_DATABASE_URL` for you). Use non-production test secrets only.

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

```powershell
.\scripts\testdb.ps1 integration
# or: make test-integration
```

## 5. Playwright E2E

Chromium-only smoke tests. Playwright starts its own Go API on port **18080** and Vite preview on **14173** (not dev ports 8080/4173). Service workers are blocked. The E2E frontend build targets `http://127.0.0.1:18080` directly.

```powershell
# From repository root (Docker testdb already prepared)
. .\scripts\testdb-env.ps1
$env:API_KEY = 'e2e-test-token'
$env:E2E_WRITE_TOKEN = 'e2e-test-token'
cd frontend
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

From the repository root. First-time testdb: `.\scripts\testdb.ps1 prepare` instead of `up` (empty database only).

```powershell
# Frontend
cd frontend
npm run format:check
npm run lint
npm test
npm run build
cd ..

# Backend
.\scripts\testdb.ps1 up
cd backend
go test ./...
cd ..
.\scripts\testdb.ps1 integration

# E2E
. .\scripts\testdb-env.ps1
$env:API_KEY = 'e2e-test-token'
$env:E2E_WRITE_TOKEN = 'e2e-test-token'
cd frontend
npm run test:e2e
cd ../backend
go run ./cmd/testdb verify
```
