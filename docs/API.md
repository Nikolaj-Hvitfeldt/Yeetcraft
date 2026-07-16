# API

Yeetcraft exposes a small JSON HTTP API from the Go server (`backend/cmd/server`). Public reads require no auth. Writes require a shared API key.

## Base URL

| Environment | Base |
| ----------- | ---- |
| Local | `http://localhost:8080` (Vite proxies `/api` → this host) |
| Production | Set `VITE_API_BASE_URL` on the frontend to the API origin |

## Routes

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| `GET` | `/api/health` | No | Health check |
| `GET` | `/api/seasons` | No | List seasons |
| `GET` | `/api/seasons/leaders?seasonId=` | No | Season leaderboard and crown players |
| `GET` | `/api/seasons/current/dungeons?seasonId=` | No | Dungeons for a season |
| `GET` | `/api/players/{playerId}/stats?seasonId=` | No | Player stats by dungeon |
| `GET` | `/api/players/by-slug/{playerSlug}/stats?seasonId=` | No | Player stats by display-name slug |
| `GET` | `/api/seasons/{seasonId}/dungeons/{dungeonId}/leaderboard` | No | Dungeon leaderboard |
| `PATCH` | `/api/stats/batch` | Yes* | Batch update player dungeon stats |

Empty `seasonId` on optional query params resolves to the current season (`is_current = true`).

## Write authentication

\*Write auth requires a non-empty `API_KEY` on the server.

- An empty or missing `API_KEY` does **not** open writes — the server returns **503** on mutation requests (fail-closed).
- The frontend unlocks editing via `?token=` on page URLs (stored in `localStorage`, then stripped from the URL).
- `PATCH` requests send `X-API-Key`. The backend also accepts `Authorization: Bearer <token>`.
- Query `?token=` on **API** routes is **not** supported.
- Token comparison uses constant-time equality.

### Batch body

```json
{
  "playerId": "<uuid>",
  "seasonId": "<uuid>",
  "stats": [{ "dungeonId": "<uuid>", "deaths": 0, "yeets": 0 }]
}
```

Validation includes UUID format, at least one dungeon update, no duplicate dungeon IDs, and non-negative deaths/yeets.

## CORS

`CORS_ALLOWED_ORIGINS` is a comma-separated allowlist. Defaults cover local Vite/E2E origins. Production must include the deployed frontend origin.
