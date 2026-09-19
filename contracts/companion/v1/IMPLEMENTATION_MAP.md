# Companion v1 — Phase 3 implementation file map

> **Status: Draft — file map only; not implemented**

| Field | Value |
| ----- | ----- |
| Work package | WP5 |
| Owner | Yeetcraft |
| Phase mapped here | **Phase 3** (backend ingest, schema, handlers, guarded tests, docs) |
| Sibling map | `yeetcraft-companion/docs/PHASE_2_FILE_MAP.md` (companion Phase 2; not in this repository) |
| Canonical contract | [`CONTRACT.md`](./CONTRACT.md), [`schema/`](./schema/), [`examples/`](./examples/) |

This document is a **file map**, not a new protocol. WP1–WP4 semantics remain frozen in this directory and in [`docs/adr/`](../../../docs/adr/README.md). Do not treat paths below as existing code unless **Status** is `existing`.

No route, migration, handler, or table listed as `to create` exists today.

---

## Frozen inputs (do not rewrite)

| Artifact | Role |
| -------- | ---- |
| [`README.md`](./README.md) | Ownership, versioning, privacy, sequencing |
| [`CONTRACT.md`](./CONTRACT.md) | Normative ingest wire contract |
| [`schema/`](./schema/) | Request, response, and error JSON Schema |
| [`examples/`](./examples/) | Synthetic fixtures |
| [ADR 001](../../../docs/adr/001-post-ingest-classification-and-corrections.md) | Website classification and corrections |
| [ADR 002](../../../docs/adr/002-revision-protected-adjustment-ledger.md) | Derived aggregates and revision-protected PATCH |
| [`docs/CHARACTERS_AND_BOSS_NEMESIS.md`](../../../docs/CHARACTERS_AND_BOSS_NEMESIS.md) | Character-slice brief (separate Yeetcraft work) |

---

## Sequencing blockers (before ingest implementation)

Phase 3 ingest handlers, event tables, and GUID resolution **must not start** until the following schema prerequisites exist in both `backend/db/schema.sql` (fresh databases) and a numbered migration (hosted databases).

### 1. Character slice — **not Phase 3**; separate Yeetcraft work

**Blocker:** nullable unique `characters.guid` does not exist. Verified today: [`backend/db/schema.sql`](../../../backend/db/schema.sql) has `players`, `seasons`, `dungeons`, `season_dungeons`, and `player_dungeon_stats` only.

Implement the character slice from [`docs/CHARACTERS_AND_BOSS_NEMESIS.md`](../../../docs/CHARACTERS_AND_BOSS_NEMESIS.md) **before** Phase 3 ingest. That brief owns the character file list (`schema.sql`, `backend/db/migrations/`, seed, public roster reads, frontend character tags). This map does not re-specify that slice.

**Migration numbering:** the only numbered migration verified today is [`backend/db/migrations/002_functions_and_security.sql`](../../../backend/db/migrations/002_functions_and_security.sql). The character slice consumes the **next unused** migration number(s). Phase 3 must **not** guess `003` or `004` in this document. Record the actual next number **after** the character slice lands.

### 2. Season bounds and dungeon map ID — **Phase 3 schema, before ingest code**

These columns are absent today and are **blockers for ingest implementation** (season resolution and challenge `MapID` lookup in [`CONTRACT.md`](./CONTRACT.md)):

| Change | Table / column | Constraint |
| ------ | -------------- | ---------- |
| Non-overlapping season bounds | `seasons.starts_at`, `seasons.ends_at` | Required for timestamp-based season resolution; `is_current` is never ingest authority |
| Challenge map identity | `dungeons.challenge_map_id` | Nullable unique; unmapped map IDs → persisted `needs_review`, never auto-create a dungeon |

Land these in `schema.sql` **and** in the first Phase 3 numbered migration (number determined after the character slice) **before** writing ingest repositories or wiring `POST /api/companion/v1/deaths/batch`.

Ingest-time-current assignment on missing, overlapping, or contradictory evidence is forbidden.

---

## testdb applies `schema.sql`, not numbered migrations

**Verified current behavior**

| Component | Path | What it does today |
| --------- | ---- | ------------------ |
| Prepare | [`backend/internal/testdb/client.go`](../../../backend/internal/testdb/client.go) `Prepare` | Applies [`backend/db/schema.sql`](../../../backend/db/schema.sql) once on an empty `_test` database, then seeds. Does **not** iterate `backend/db/migrations/`. |
| Schema path helper | [`backend/internal/testdb/paths.go`](../../../backend/internal/testdb/paths.go) | `SchemaSQLPath`, `SeedSQLPath`, `ResetStatsSQLPath` only. No migrations directory helper. |
| Table probe | [`backend/internal/testdb/guard.go`](../../../backend/internal/testdb/guard.go) `ApplicationTables` | `seasons`, `players`, `dungeons`, `season_dungeons`, `player_dungeon_stats`. |
| Docs | [`docs/TESTING.md`](../../../docs/TESTING.md) | Documents `prepare` as “apply `schema.sql` once, then seed”. Local testdb Postgres is [`docker-compose.yml`](../../../docker-compose.yml) (`127.0.0.1:55432`), not hosted Supabase. |

Consequence: a table or function that exists **only** in a numbered migration never appears in testdb or `go test ./internal/repository -tags=integration`. That gap already applies to [`002_functions_and_security.sql`](../../../backend/db/migrations/002_functions_and_security.sql) relative to `schema.sql`.

**Phase 3 decision: keep schema.sql-only testdb**

Phase 3 ingest does **not** teach `Prepare` to iterate `backend/db/migrations/`. That would be a separate later task (ordering, idempotency, non-empty databases).

1. Land every table/column Phase 3 tests need in [`backend/db/schema.sql`](../../../backend/db/schema.sql) (fresh-database source of truth) **and** in the next numbered migration after the character slice (hosted/Supabase). Do **not** guess `003`.
2. Numbered migrations must not be the sole copy of test-required DDL.
3. Record this in [`docs/TESTING.md`](../../../docs/TESTING.md) when Phase 3 lands. Do not assume testdb equals a migrated hosted database.
4. Season bounds, `dungeons.challenge_map_id`, ingest/event/quarantine/adjustment/correction columns, and aggregate revision all follow this dual-write rule.

---

## Phase 3 file map (Yeetcraft)

**Owner** is this repository unless noted. **Status:** `existing` = verified on disk now; `to create` = planned Phase 3 path, not present.

### Schema, seed, testdb

| Path | Status | Phase | Role |
| ---- | ------ | ----- | ---- |
| `backend/db/schema.sql` | existing — extend | 3 (after character slice) | Fresh-database DDL: season bounds, `dungeons.challenge_map_id`, ingest/event/quarantine/adjustment/correction tables. Must stay aligned with numbered migrations. |
| `backend/db/migrations/002_functions_and_security.sql` | existing — do not renumber | pre-Phase 3 | Current highest numbered migration. Leave in place. |
| `backend/db/migrations/<NNN>_*.sql` | to create | 3 | Additive migrations. **`<NNN>` is assigned only after the character slice.** First Phase 3 migration(s): `starts_at`/`ends_at` and `challenge_map_id` before ingest tables. Later: batch fingerprint, runs, events, causes, quarantine, adjustment ledger, correction audit, aggregate revision. |
| `backend/db/testdata/seed.sql` | existing — extend | 3 | Synthetic season bounds, challenge map IDs, character GUIDs (after character slice), ingest/quarantine/adjustment fixtures. No real GUIDs, names, realms, credentials, or URLs. |
| `backend/db/testdata/reset_stats.sql` | existing — extend | 3 | Restore derived aggregates, revisions, and replaceable adjustments to the seeded baseline. |
| `backend/internal/testdb/client.go` | existing — extend | 3 | `Prepare` / seed / reset / verify. Keep applying `schema.sql` only; do not iterate numbered migrations in Phase 3. |
| `backend/internal/testdb/paths.go` | existing — extend | 3 | Keep schema/seed/reset paths. No migrations helper in Phase 3. |
| `backend/internal/testdb/guard.go` | existing — extend | 3 | Expand `ApplicationTables` when new public tables exist. |
| `backend/internal/testdb/fixtures.go` | existing — extend | 3 | Synthetic IDs only. Isolation-season insert currently uses `(id, name, expansion, is_current)` — must gain bounds after `starts_at`/`ends_at`. |
| `backend/internal/testdb/integration.go` | existing — extend | 3 | `EnsureIsolationSeasonFixtures` SQL must match the new `seasons` shape. |
| `backend/cmd/testdb/main.go` | existing — touch only if Prepare CLI semantics change | 3 | testdb entrypoint. |
| `docker-compose.yml`, `Makefile`, `scripts/testdb.ps1` | existing — do not treat as ingest | DX | Local `yeetcraft_test` on `127.0.0.1:55432`. Not hosted Supabase. |

Exact PostgreSQL table names for ingest batches, runs, death events, causes, quarantine, adjustments, and correction audit are **Phase 3 DDL**. Semantics are frozen: [`CONTRACT.md`](./CONTRACT.md) (batch fingerprint, `needs_review` persistence, GUID resolution) and [ADR 001](../../../docs/adr/001-post-ingest-classification-and-corrections.md) / [ADR 002](../../../docs/adr/002-revision-protected-adjustment-ledger.md) (event revision, audit row, replaceable adjustment, aggregate revision, legacy baseline).

### Focused repositories (SQL and transactions)

Keep handlers thin. Put SQL, joins, aggregation, and transactions in `internal/repository` (existing layout). Do not grow [`backend/internal/repository/stats.go`](../../../backend/internal/repository/stats.go) into the ingest pipeline.

| Path | Status | Phase | Role |
| ---- | ------ | ----- | ---- |
| `backend/internal/repository/stats.go` | existing — extend | 3 | Public reads and `SetStatsBatch`. Evolve PATCH to revision-protected adjustment replace ([ADR 002](../../../docs/adr/002-revision-protected-adjustment-ledger.md)); keep current JSON read shapes unless a later task changes them. |
| `backend/internal/repository/leaders.go` | existing — touch only if derived totals change leader SQL | 3 | Season leaders. Preserve public behavior. |
| `backend/internal/repository/season_resolve.go` | to create | 3 | Resolve run-start instant against non-overlapping `starts_at`/`ends_at`; validate companion `seasonId` hint; corroborate `(seasonId, dungeonId)` membership. Dungeon membership never establishes a season alone. |
| `backend/internal/repository/ingest.go` | to create | 3 | Envelope already validated: one transaction, `batchId` fingerprint replay/`batch_conflict`, ordered per-event accept/duplicate/`needs_review`/reject, GUID → character, map ID → dungeon. |
| `backend/internal/repository/events.go` | to create | 3 | Canonical event rows (`clientEventId`, server default `category = death`, event revision). Duplicate identical fingerprint must not reset website corrections. |
| `backend/internal/repository/adjustments.go` | to create | 3 | Legacy baseline import, one replaceable manual adjustment per player × season × dungeon × category, aggregate revision. |
| `backend/internal/repository/corrections.go` | to create | 3 | Allowed transition matrix, `expectedEventRevision`, correction idempotency, audit insert, aggregate side effects ([ADR 001](../../../docs/adr/001-post-ingest-classification-and-corrections.md)). |

### Handlers, config, auth, server wiring

| Path | Status | Phase | Role |
| ---- | ------ | ----- | ---- |
| `backend/internal/config/config.go` | existing — extend | 3 | Load `COMPANION_API_KEY` separately from `API_KEY`. Empty companion key fails closed on the ingest route only. |
| `backend/.env.example` | existing — extend | 3 | Placeholder `COMPANION_API_KEY` comment; no real secrets. |
| `backend/internal/middleware/auth.go` | existing — do not reuse for companion | 3 | Browser `API_KEY` for `PATCH /api/stats/batch` and website corrections. |
| `backend/internal/middleware/companion_auth.go` | to create | 3 | **Second** middleware instance: `COMPANION_API_KEY`, `X-API-Key` or `Authorization: Bearer`, no `?token=`, **503** `companion_api_unconfigured` when empty. |
| `backend/internal/middleware/companion_ratelimit.go` | to create | 3 | Route-level rate limit on ingest; **429** `rate_limit_exceeded`. |
| `backend/internal/handler/response.go` | existing — do not change public error shape by default | 3 | Current `{error, message}` helpers for existing routes. |
| `backend/internal/handler/companion_errors.go` | to create | 3 | Contract error envelope (`error.code` / `message` / `retryable`) for ingest only. Do not silently replace existing public API errors. |
| `backend/internal/handler/companion_ingest.go` | to create | 3 | `POST /api/companion/v1/deaths/batch`: decode, limits, schema/version checks, call ingest repository, map outcomes. Never reuse `PATCH /api/stats/batch`. UUID check: see [UUID validation](#uuid-validation). |
| `backend/internal/handler/corrections.go` | to create | 3 | Website correction route (not companion wire). Protect with existing `API_KEY` middleware. |
| `backend/internal/handler/stats.go` | existing — extend | 3 | Additive `expectedRevision` on PATCH once ADR 002 ships; expose revision on editor reads. |
| `backend/cmd/server/main.go` | existing — extend | 3 | Wire companion auth + ingest route; keep public GETs and `API_KEY` PATCH. Audit accepted/rejected **batch metadata** without payloads or credentials. |

### Guarded tests and fixtures

| Path | Status | Phase | Role |
| ---- | ------ | ----- | ---- |
| `backend/internal/handler/companion_ingest_test.go` | to create | 3 | Status codes, auth fail-closed, limits, version mismatch, ordered results. Synthetic bodies only. |
| `backend/internal/handler/corrections_test.go` | to create | 3 | Transition matrix, stale event revision, idempotency conflict. |
| `backend/internal/handler/stats_batch_test.go` | existing — extend | 3 | `expectedRevision` / `stale_revision` once PATCH evolves. |
| `backend/internal/middleware/auth_routes_test.go` | existing — extend or companion-specific sibling | 3 | Prove companion key ≠ `API_KEY`; empty companion key → 503 on ingest only. |
| `backend/internal/middleware/companion_auth_test.go` | to create | 3 | Companion auth unit tests. |
| `backend/internal/repository/stats_integration_test.go` | existing — extend | 3 | Guarded `_test` DB; adjustment/revision parity. |
| `backend/internal/repository/ingest_integration_test.go` | to create | 3 | `-tags=integration`, `YEETCRAFT_TEST_MODE=1`, `TEST_DATABASE_URL`. Atomic batch, replay, `batch_conflict`, `event_id_conflict`, unknown GUID quarantine, unmapped map ID, season `needs_review`, rollback. |
| `backend/internal/repository/season_resolve_test.go` | to create | 3 | Bounds gaps/overlaps, stale hint, out-of-pool dungeon. Unit and/or integration as appropriate. |
| `backend/internal/repository/corrections_integration_test.go` | to create | 3 | Correction + aggregate revision in one transaction. |
| `contracts/companion/v1/examples/` | existing — assert against, do not fork | 3 | Handler tests may load these synthetic examples. They remain the canonical fixtures. |

### Documentation (Phase 3 updates; still “planned” until code lands)

| Path | Status | Phase | Role |
| ---- | ------ | ----- | ---- |
| `docs/API.md` | existing — extend | 3 | Document ingest and correction routes only after they exist. Until then, keep current verified `PATCH /api/stats/batch` behavior distinct from this map. |
| `docs/ARCHITECTURE.md` | existing — extend | 3 | Companion ingest layer, derived aggregates, separate companion key. Do not describe planned tables as shipping. |
| `docs/TESTING.md` | existing — extend | 3 | Record that Phase 3 **keeps schema.sql-only testdb** (decision above) and list any new integration packages. Do not document testdb as applying numbered migrations unless a later task implements that. |
| `docs/OFFLINE.md` | existing — not Phase 3 backend | enablement (see below) | Browser outbox `stale_revision` handling. |
| `docs/DEVELOPMENT.md` | existing — extend | 3 | `COMPANION_API_KEY` placeholder in the env table. |
| `docs/adr/README.md` | existing | 1 (done) | Points here. |
| `contracts/companion/v1/*` | existing | 1 (frozen) | Do not rewrite protocol in Phase 3 except compatibility amendments. |

---

## Explicitly out of this Phase 3 map

| Item | Why |
| ---- | --- |
| Character-slice Go/SQL/frontend files | Separate Yeetcraft work; blocker, not ingest implementation. See [`docs/CHARACTERS_AND_BOSS_NEMESIS.md`](../../../docs/CHARACTERS_AND_BOSS_NEMESIS.md). |
| Companion `internal/parser`, SQLite, watcher, uploader | Companion Phase 2 / 4. See sibling `yeetcraft-companion/docs/PHASE_2_FILE_MAP.md`. |
| Copying this contract into the companion repo as source of truth | Forbidden. Companion records [`CHECKSUMS.sha256`](./CHECKSUMS.sha256) and may generate derived copies in Phase 2 tests. |
| Frontend revision / outbox (ADR 002 enablement) | Not Phase 3 backend. **Required before companion event writes are enabled** (Phase 4). Existing files to change in that later task: `frontend/src/api/schemas.ts`, `frontend/src/hooks/useStats.ts`, `frontend/src/lib/write-outbox/types.ts`, `frontend/src/lib/write-outbox/sync.ts`, `frontend/src/lib/write-outbox/handlers/set-player-stats.ts`, `docs/OFFLINE.md`. |
| CI jobs, Wails, addon, real GUIDs/PII | Out of WP5 and out of Phase 3 ingest. |
| Per-installation companion principals | Deferred past the fixed-group MVP (`installationId` is diagnostics only). |

Rollout reminder from the ADRs (not new protocol): frontend `expectedRevision` support lands before enabling companion event writes. Correction route may ship in Phase 3 backend, but **do not enable companion writes** until character slice, season/dungeon columns, ingest, and frontend revision handling are live.

---

## Phase 3 implementation notes (not wire changes)

These are implementation constraints. They do **not** amend [`CONTRACT.md`](./CONTRACT.md) or JSON Schema.

### UUID validation

[`CONTRACT.md`](./CONTRACT.md#wire-formats) and [`schema/ingest-batch-request.schema.json`](./schema/ingest-batch-request.schema.json) accept a lowercase hyphenated `8-4-4-4-12` hex UUID. That pattern is **looser** than existing browser/API `isValidUUID` (RFC 4122 version nibble `[1-5]` and variant `[89ab]`).

- Phase 3 ingest must **not** silently reuse `isValidUUID` or tighten the schema `pattern`.
- Companion and server **generators** should emit RFC 4122 version-4 UUIDs, matching the synthetic examples (`…-4000-8000-…`).
- Rejecting nil UUIDs or non-v4 IDs on the wire requires an explicit v1 contract amendment, not a handler-only surprise.

---

## Validate package

Phase 1 machine checks: [`VALIDATION.md`](./VALIDATION.md) and
[`scripts/validate-contract.ps1`](./scripts/validate-contract.ps1). This map
is included in relative-link resolution. Protocol text in [`CONTRACT.md`](./CONTRACT.md)
stays frozen.

**Deferred to Phase 2/3 CI (not this package):** GitHub Actions running the
Validate script; companion `go test` derived-fixture drift; ingest handler
suites.

Do not require Go or npm runtime suites for Validate unless those trees are edited.

---

## Related documentation

| Document | Role |
| -------- | ---- |
| [`CONTRACT.md`](./CONTRACT.md) | Normative ingest contract |
| [`README.md`](./README.md) | Contract ownership |
| [`docs/TESTING.md`](../../../docs/TESTING.md) | Verified testdb behavior (schema.sql only today) |
| [`docs/CHARACTERS_AND_BOSS_NEMESIS.md`](../../../docs/CHARACTERS_AND_BOSS_NEMESIS.md) | Character-slice blocker |
| Sibling `yeetcraft-companion/docs/PHASE_2_FILE_MAP.md` | Companion Phase 2 map |
