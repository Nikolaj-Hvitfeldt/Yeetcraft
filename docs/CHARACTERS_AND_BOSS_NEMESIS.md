# Characters and Boss Nemesis — next-session brief

Implementation handoff for making WoW characters first-class Yeetcraft data and
preparing for a future **Nemesis Boss** insight.

| Field | Value |
| --- | --- |
| Status | Characters: ready for implementation planning; Nemesis Boss: data-contract preparation only |
| Primary repository | `Yeetcraft` |
| Related repository | `yeetcraft-companion` (separate product and Git history) |
| Last updated | 2026-08-24 |

## Start here in a new session

1. Open the `Yeetcraft` repository, not `yeetcraft-companion`.
2. Read this document, [`ARCHITECTURE.md`](./ARCHITECTURE.md),
   [`API.md`](./API.md), and [`TESTING.md`](./TESTING.md).
3. Inspect `git status` before editing and preserve unrelated work.
4. Re-read the files listed in [Implementation file map](#implementation-file-map);
   this brief describes the state observed on 2026-08-24, not a substitute for
   current source inspection.
5. Keep character work and future companion ingest work as separate scopes.

Do not commit, push, apply hosted database migrations, or modify the companion
repository unless the user explicitly requests those actions.

---

## Goal

Move character identity out of a hardcoded frontend registry and into
Yeetcraft's server-owned data model while preserving today's behavior:

- a **player** is a real person/profile owner;
- one player may own several WoW characters;
- current deaths and yeets remain aggregated per player, season, and dungeon;
- manual editing and all existing public API behavior remain functional;
- character metadata becomes available to the website through the Go API.

Prepare the terminology and future data requirements for **Nemesis Boss**, but
do not display or compute it until accepted death events contain encounter
attribution.

---

## Verified current state

### Database and API

- `backend/db/schema.sql` contains `players`, `seasons`, `dungeons`,
  `season_dungeons`, and `player_dungeon_stats`.
- There is no `characters`, `encounters`, `runs`, or `death_events` table.
- Statistics are stored at player × season × dungeon granularity.
- `PATCH /api/stats/batch` writes absolute aggregate values.
- Reads are public; writes require the existing API key middleware.
- There is no companion ingest endpoint or canonical companion contract.

### Frontend

- Character names/classes are hardcoded in
  `frontend/src/data/player-characters.ts`.
- Roles are also hardcoded there at the player level.
- Character tags are cosmetic; no per-character statistics exist.
- Player API schemas in `frontend/src/api/schemas.ts` contain no character data.
- The current `NemesisCard` means **Nemesis Dungeon**, calculated client-side
  from dungeon aggregate mistakes.

### Companion evidence relevant to this work

The separate companion repository has partially validated:

- GUID-based tracked-character filtering;
- five tracked character GUIDs mapping to four tracked people;
- one person playing different characters in different runs;
- `ENCOUNTER_START` / `ENCOUNTER_END` boss context;
- boss-vs-trash attribution and ranked likely causes.

This evidence supports the model, but it is not yet a production ingest
contract and must not be imported as a runtime dependency.

---

## Decisions for the character slice

These are the recommended defaults for the next implementation session.

1. **Players remain the statistics owner.** Do not change
   `player_dungeon_stats` or manual edit payloads.
2. **Characters are metadata first.** Do not add per-character totals yet.
3. **Character GUID is nullable and unique when present.** Existing website data
   can be migrated before private GUID mappings are configured.
4. **Do not commit real GUIDs.** Populate them later through private operations
   or an approved authenticated workflow.
5. **Class is stable metadata; specialization is not.** Store an optional class
   key, but defer specialization because players may change specs.
6. **Roles remain unchanged in the first slice.** Keep the existing frontend
   role fallback until a separate role model is approved.
7. **Character reads are public.** Character metadata is needed for public
   profile and leaderboard presentation.
8. **No character mutation API in the first slice.** Seed/migration and
   database operations are sufficient for the current fixed friend group.

---

## Recommended first work package: canonical character metadata

### Proposed PostgreSQL shape

Use a new migration and update `backend/db/schema.sql` so fresh test databases
match migrated databases.

```sql
create table characters (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  name text not null,
  realm text,
  region text,
  class_key text,
  guid text unique,
  active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create index characters_player_order_idx
on characters (player_id, display_order, name);
```

Before implementing, decide whether duplicate names across realms require a
functional uniqueness index. Do not assume character name alone is globally
unique.

### Seed/backfill

Backfill the seven currently hardcoded character records from
`frontend/src/data/player-characters.ts`:

- preserve player ownership;
- preserve display order;
- preserve existing class keys;
- leave `guid`, `realm`, and `region` null unless supplied through private,
  non-committed operations;
- make the migration safe for existing production player IDs by resolving
  owners from stable existing player data rather than embedding environment-
  specific UUIDs.

Production data does not live entirely in repository seed files. The next agent
must inspect the actual migration/operations workflow before deciding how
backfill SQL identifies players.

### Recommended public API

Prefer a dedicated roster read that does not change existing stats response
shapes:

```http
GET /api/players
```

```json
{
  "players": [{
    "id": "uuid",
    "displayName": "Example",
    "avatarUrl": null,
    "characters": [{
      "id": "uuid",
      "name": "Examplealt",
      "realm": null,
      "region": null,
      "classKey": "priest",
      "active": true,
      "displayOrder": 0
    }]
  }]
}
```

Reasons:

- one cached request supplies metadata for profiles and leaderboards;
- existing stats and leaderboard contracts remain backward compatible;
- character metadata is not duplicated through every aggregate query;
- future admin or companion identity workflows have a canonical read model.

If source inspection reveals a materially simpler compatible approach, document
the trade-off before changing this contract recommendation.

### Backend requirements

- Keep handlers thin and validation/privacy-safe.
- Put character/player SQL in a focused repository rather than growing
  unrelated aggregate SQL indefinitely.
- Return deterministic character order.
- Return an empty array, never `null`, for players without characters.
- Do not expose private GUIDs from the public roster endpoint.
- Add handler and repository tests, including:
  - player with multiple characters;
  - player with no characters;
  - deterministic ordering;
  - nullable realm/region/class;
  - no GUID in public JSON.

### Frontend requirements

- Add Zod schemas and inferred types for the roster response.
- Add a TanStack Query hook following existing query patterns.
- Replace character-name/class reads from `PLAYERS_BY_KEY` with API data.
- Preserve current loading, error, offline-cache, and empty-character behavior.
- Keep current player-level roles as a temporary frontend fallback.
- Do not add a per-character stats filter in this slice.
- Do not break profile URLs, player slugs, avatars, crowns, or manual editing.
- Retain or convert the hardcoded registry into an explicit temporary fallback
  only if offline behavior requires it; document why it remains.

---

## Nemesis Boss: prepare semantics, defer product behavior

### Existing terminology

`frontend/src/components/profile/NemesisCard.tsx` currently presents **Nemesis
Dungeon**. Do not rename or overload it.

Future boss UI should use a distinct component and API field, such as:

- `NemesisBossCard`
- `nemesisBoss`

### Recommended definition

> A player's Nemesis Boss is the boss encounter during which that player has
> accumulated the most accepted deaths across all owned characters.

Rules:

- aggregate by player across alts by default;
- count accepted death events with a non-null encounter;
- exclude trash deaths (`encounter_id = null`);
- keep boss encounter separate from literal killing source;
- a death to an add during an active boss encounter counts toward that boss;
- do not infer boss nemesis from current dungeon aggregates;
- define tie behavior when the event API is designed.

### Data required before implementation

Nemesis Boss needs later event-oriented tables and an approved companion
contract:

- `encounters` with dungeon, journal encounter ID, name, and display order;
- `death_events` with player/character/run and nullable encounter;
- accepted/reviewed classification state;
- a versioned idempotent companion ingest endpoint;
- reconciliation between automatic events and existing manual aggregates.

Do not add a placeholder card with fabricated or empty data. An encounter
catalog may be planned separately, but boss statistics should wait for accepted
event data.

---

## Explicit non-goals for the character slice

- No companion upload endpoint.
- No `death_events`, `runs`, or `death_causes` tables.
- No Nemesis Boss computation or UI.
- No per-character deaths/yeets.
- No change to `PATCH /api/stats/batch`.
- No automatic creation of players or characters from untrusted log data.
- No committed real player GUIDs.
- No Supabase client access from React.
- No changes in `yeetcraft-companion`.

---

## Implementation file map

Inspect these before editing:

### Backend

- `backend/db/schema.sql`
- `backend/db/migrations/`
- `backend/db/testdata/seed.sql`
- `backend/cmd/server/main.go`
- `backend/internal/handler/stats.go`
- `backend/internal/repository/stats.go`
- existing handler/repository tests

### Frontend

- `frontend/src/data/player-characters.ts`
- `frontend/src/utils/player-characters.ts`
- `frontend/src/api/api.ts`
- `frontend/src/api/schemas.ts`
- `frontend/src/hooks/useStats.ts`
- `frontend/src/components/profile/`
- leaderboard components using character or role tags
- tests referencing `PLAYERS_BY_KEY`

### Documentation

- `docs/API.md`
- `docs/ARCHITECTURE.md`
- `docs/TESTING.md`

---

## Acceptance criteria

- Existing players can have zero or more ordered characters in PostgreSQL.
- Existing hardcoded character metadata is represented server-side.
- Public API returns players with characters and never exposes GUIDs.
- Profile and leaderboard character tags use API-backed character metadata.
- Current aggregate stats, manual editing, crowns, routing, avatars, and offline
  behavior remain functional.
- No per-character stats or boss claims are introduced.
- Documentation distinguishes current behavior from future ingest/event work.
- No secrets, real GUIDs, private logs, or environment-specific IDs are
  committed.

---

## Validation

Run checks in the repository they apply to.

```powershell
# Backend
cd backend
gofmt -w <changed-go-files>
go test ./...
go vet ./...

# Frontend
cd ../frontend
npm run lint
npm test
npm run build
```

If schema/repository integration behavior changes, use only a guarded `_test`
database as documented in [`TESTING.md`](./TESTING.md):

```powershell
cd backend
go test ./internal/repository -tags=integration
```

Report checks that could not be run. Do not apply migrations to hosted
development or production databases without explicit authorization.

---

## Suggested prompt for the next session

```text
Work in the Yeetcraft repository only.

Read docs/CHARACTERS_AND_BOSS_NEMESIS.md, docs/ARCHITECTURE.md,
docs/API.md, and docs/TESTING.md first. Inspect git status and current source
before editing.

Implement only the canonical character metadata work package:
- add the additive PostgreSQL character model and migration;
- backfill existing hardcoded character metadata without committing real GUIDs;
- add the public roster read;
- migrate frontend character display to API-backed data;
- preserve player-level aggregate stats, roles fallback, manual editing,
  routing, and offline behavior;
- add/update tests and documentation.

Do not implement companion ingest, per-character stats, encounters, death
events, or Nemesis Boss UI in this task. Do not commit or push unless asked.
Run and report backend/frontend validation.
```

