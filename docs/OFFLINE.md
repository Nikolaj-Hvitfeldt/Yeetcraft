# Offline architecture

Yeetcraft is built to remain usable when the network is slow or unavailable: a PWA shell, persisted read cache, and a write outbox for edits.

## Layers

### 1. Service worker (vite-plugin-pwa / Workbox)

Configured in `frontend/vite.config.ts`:

| Concern | Strategy |
| ------- | -------- |
| App shell (JS/CSS/HTML/fonts) | Precache (WebP excluded from precache) |
| Local images (WebP/PNG/SVG) | Runtime **CacheFirst** (~30 days) |
| Fonts | Runtime **CacheFirst** (~1 year) |
| `/api/*` | **NetworkOnly** |
| SPA navigation | Fallback to `/index.html`; `/api` denylisted |

Updates use a prompt (`registerType: 'prompt'`) so a refresh does not interrupt mid-edit. See `AppUpdatePrompt.tsx`.

Vercel cache headers (`frontend/vercel.json`): long-cache hashed `/assets/*`; `must-revalidate` for `sw.js`, workbox, and the web manifest.

### 2. TanStack Query persistence

- Storage: IndexedDB via `idb-keyval` (`yeetcraft-query-cache-v1`)
- Max age: **7 days**
- Persisted roots: seasons, leaders, dungeons, player stats, dungeon leaderboard
- `networkMode: 'offlineFirst'`
- Stale time ~5 minutes; GC ~24 hours

### 3. Connection UX

`OnlineStatusProvider` + connection state machine drive banners such as “Offline — showing saved data.” States cover restoring cache, first load, slow cold start, reconnecting, cached refresh, offline-with-cache, and offline-without-cache.

### 4. Write outbox

Pending `PATCH /api/stats/batch` payloads are queued locally and flushed when online. Auth scope is tied to the stored write token. UI surfaces pending/failed sync via `PendingSyncStatus` and `WriteOutboxSyncListener`.

## Cold starts

API fetches use a **45s** timeout to tolerate Render Free cold starts (`fetch-with-timeout.ts`). The connection banner can show a slow-first-load message after a short delay.
