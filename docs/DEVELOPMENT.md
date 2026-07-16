# Development

Local setup for the Yeetcraft monorepo. For a shorter path, see the root [README](../README.md#running-locally).

## Prerequisites

- **Go 1.25** (see `backend/go.mod`)
- **Node.js** and npm
- **PostgreSQL** (Supabase or local). Schema: [`backend/db/schema.sql`](../backend/db/schema.sql)

## Backend

```powershell
cd backend
copy .env.example .env
# Edit .env with DATABASE_URL and API_KEY
go run ./cmd/server
```

The API listens on **8080** by default (`SERVER_HOST` / `SERVER_PORT`).

Without `DATABASE_URL` (or `DB_*` fields), the server starts but API requests return database errors.

### Supabase connection

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Project Settings** → **Database**.
2. Copy the **Connection string** (URI). Prefer the **Transaction pooler** on port **6543**.
3. Paste it into `backend/.env` as `DATABASE_URL`.

```env
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

RLS is enabled on all tables with **no public policies**, so only the backend (postgres role) can read/write. The React app calls the Go API, not Supabase directly.

The Go pool enables simple-protocol mode when a Supabase transaction pooler URL is detected.

### Backend environment variables

| Variable | Purpose |
| -------- | ------- |
| `SERVER_HOST` | Bind address (default: `0.0.0.0`) |
| `SERVER_PORT` | HTTP port (default: `8080`) |
| `DATABASE_URL` | Supabase/Postgres URI (preferred) |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Alternative connection fields |
| `DB_SSL_MODE` | PostgreSQL `sslmode` (default: `require`) |
| `API_KEY` | Required for writes; empty/missing fails closed (503 on PATCH) |
| `CORS_ALLOWED_ORIGINS` | Optional comma-separated browser origins |

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**. Requests to `/api/*` are proxied to **http://localhost:8080**.

| Variable | Purpose |
| -------- | ------- |
| `VITE_API_BASE_URL` | Optional API origin. Unset → same-origin `/api` (dev proxy) |

Copy `frontend/.env.example` to `.env` if you need to override the API base URL.

### Write unlock (local)

Open any page with `?token=<same value as API_KEY>`. The frontend stores the token and strips it from the URL. Public browsing needs no token.

## Test database and E2E

See [TESTING.md](./TESTING.md) for `YEETCRAFT_TEST_MODE`, `TEST_DATABASE_URL`, testdb CLI, integration tests, and Playwright ports (**18080** / **14173**).

## Useful commands

```powershell
# Frontend
cd frontend
npm run lint
npm test
npm run build
npm run preview

# Backend
cd backend
go test ./...
go build ./cmd/server
```

### Regenerating README screenshots

With API on `:8080` and `npm run preview` on `:4173`:

```powershell
cd frontend
node ./scripts/capture-readme-screenshots.mjs
```

Outputs land in `docs/assets/screenshots/`. Edit-mode capture requires `API_KEY` in the environment or `backend/.env`.

## GitHub repository metadata

Suggested values (set via [GitHub CLI](https://cli.github.com/) or the repo Settings UI):

```powershell
gh repo edit Nikolaj-Hvitfeldt/Yeetcraft `
  --description "Season-aware Hall of Shame for tracking WoW dungeon deaths and yeets — Go API, React PWA, offline-first." `
  --add-topic go `
  --add-topic react `
  --add-topic typescript `
  --add-topic vite `
  --add-topic pwa `
  --add-topic postgresql `
  --add-topic warcraft `
  --add-topic portfolio
```

Social preview image source: [`docs/assets/social-preview.png`](../docs/assets/social-preview.png) (Daytime Hall of Shame). Upload under **Settings → General → Social preview**.