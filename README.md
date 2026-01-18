# Yeetcraft

Minimal fullstack project for tracking WoW dungeon mistakes among friends.

## Quick Start

### Backend

```powershell
cd backend
.\gradlew.bat run
```

Set environment variables:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SSL_MODE`
- `SERVER_PORT` (default: 8080)
- `API_KEY` (optional, for URL-based token auth)

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

## Tech Stack

- **Backend**: Kotlin + Ktor + PostgreSQL (Supabase)
- **Frontend**: React + TypeScript + Vite + Tailwind CSS

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/mistakes` - Get all mistakes
