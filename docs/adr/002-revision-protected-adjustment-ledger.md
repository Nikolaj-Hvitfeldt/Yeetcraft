# ADR 002 — Revision-protected adjustment ledger and derived aggregates

> **Status: Draft — reviewed, not implemented**

| Field | Value |
| ----- | ----- |
| Work package | WP4 |
| Scope | Yeetcraft aggregate reconciliation and `PATCH /api/stats/batch` evolution |
| Companion wire impact | None — companion does not perform aggregate PATCH |

## Context

Today `player_dungeon_stats` stores absolute `deaths` and `yeets` per player ×
season × dungeon. The browser writes those absolutes through
`PATCH /api/stats/batch` and queues offline payloads in the write outbox
without revision checks.

Once companion ingest creates accepted death events, aggregates must reconcile:

- event-derived counts from accepted classifications;
- an **immutable** legacy baseline representing pre-event history; and
- **one replaceable manual adjustment** per player × season × dungeon ×
  category.

Manual PATCH must not fight concurrent ingest or corrections. Stale offline
writes must surface as reviewable conflicts instead of silently overwriting
newer server state.

Implementation paths (migrations, repositories, frontend schemas) are listed in
[`../../contracts/companion/v1/IMPLEMENTATION_MAP.md`](../../contracts/companion/v1/IMPLEMENTATION_MAP.md)
(WP5 file map; not implemented). This ADR specifies behavior only.

## Verified current behavior

- `player_dungeon_stats` is the **authoritative write target** for manual edits
  (`deaths`, `yeets` columns; upsert on conflict). See
  [`../ARCHITECTURE.md`](../ARCHITECTURE.md) and
  [`backend/db/schema.sql`](../../backend/db/schema.sql).
- `PATCH /api/stats/batch` accepts absolute totals per dungeon with **no**
  `expectedRevision` field (see [`../API.md`](../API.md)).
- Stale offline PATCH attempts are not detected; the outbox retries until
  success or operator intervention (see [`../OFFLINE.md`](../OFFLINE.md)).
- No `stat_adjustments`, legacy baseline, or event-derived aggregate query
  exists.
- No `death_events` table exists.

## Decision

### Derived read model

`player_dungeon_stats` becomes a **derived read model** (materialized view or
equivalent query) computed as:

```text
displayed_deaths =
  event_derived_deaths
  + legacy_baseline_deaths
  + manual_adjustment_deaths

displayed_yeets =
  event_derived_yeets
  + legacy_baseline_yeets
  + manual_adjustment_yeets
```

Where:

| Component | Definition | Mutability |
| --------- | ---------- | ---------- |
| `event_derived_*` | Count of accepted events by `category` for the player × season × dungeon cell (see [ADR 001](./001-post-ingest-classification-and-corrections.md)) | Changes with ingest and corrections |
| `legacy_baseline_*` | One-time import from pre-event `player_dungeon_stats` at migration cutover (`reason = legacy_import`) | **Immutable** after import |
| `manual_adjustment_*` | Reconciles operator-entered absolutes with derived + baseline | **Replaceable** (upsert), never append-only |

`ignored` events contribute to neither `event_derived_deaths` nor
`event_derived_yeets`.

### Manual adjustment row cardinality

Exactly **one replaceable manual adjustment row** exists per:

```text
player_id × season_id × dungeon_id × category
```

where `category` is `death` or `yeet` (two rows per aggregate cell).

The row stores the **current** adjustment scalar for that category, not a
history of edits. History belongs in audit tables (paths in
[`../../contracts/companion/v1/IMPLEMENTATION_MAP.md`](../../contracts/companion/v1/IMPLEMENTATION_MAP.md)).

### Absolute PATCH semantics (planned evolution)

`PATCH /api/stats/batch` continues to accept **absolute entered totals** per
dungeon for backward-compatible browser UX, but the server **does not** write
those absolutes directly to event counts.

For each `(playerId, seasonId, dungeonId)` stat row in the request, within a
**single database transaction** per aggregate cell:

1. Compare `expectedRevision` against the stored aggregate revision.
2. If stale → **409** `stale_revision`; make no changes.
3. Load `event_derived_deaths`, `event_derived_yeets`, and immutable
   `legacy_baseline_*`.
4. Compute and **replace** manual adjustments:

```text
manual_adjustment_deaths  = entered_deaths  − event_derived_deaths  − legacy_baseline_deaths
manual_adjustment_yeets   = entered_yeets   − event_derived_yeets   − legacy_baseline_yeets
```

5. Upsert the two manual adjustment rows (replace prior values; **never
   append** a delta history row for PATCH).
6. Increment the aggregate revision.
7. Refresh or return the derived `player_dungeon_stats` read model.

PATCH never creates ingest events and never modifies `legacy_baseline_*`.

### Aggregate revision

Each player × season × dungeon aggregate cell carries a monotonic `revision`
(non-negative integer exposed to clients).

The revision increments by exactly `1` when **any** of the following affects
that cell's displayed totals:

- an ingest accept that changes event-derived counts;
- a successful classification correction ([ADR 001](./001-post-ingest-classification-and-corrections.md));
- a successful manual PATCH adjustment replace.

Reads that power editing UI must return the current `revision` alongside
`deaths` and `yeets` so the client can supply `expectedRevision` on the next
PATCH.

### Stale revision and browser outbox

When `expectedRevision` does not match the stored aggregate revision:

- Return **409** with stable code `stale_revision`.
- Make **no** database changes in that transaction.
- The browser outbox **retains** the failed payload for operator review rather
  than discarding it silently.

The client must fetch fresh totals and revision, then either drop, merge, or
re-submit consciously. Automatic blind retry of the same stale payload is
forbidden.

### Planned PATCH request shape (not implemented)

Verified current body (today):

```json
{
  "playerId": "<uuid>",
  "seasonId": "<uuid>",
  "stats": [{ "dungeonId": "<uuid>", "deaths": 0, "yeets": 0 }]
}
```

Planned additive fields per stat row (illustrative — not implemented):

```json
{
  "playerId": "00000000-0000-4000-8000-000000000001",
  "seasonId": "00000000-0000-4000-8000-000000000002",
  "stats": [
    {
      "dungeonId": "00000000-0000-4000-8000-000000000003",
      "deaths": 3,
      "yeets": 1,
      "expectedRevision": 4
    }
  ]
}
```

`expectedRevision` is required once revision support ships. Until then,
existing clients continue to use the verified current body.

### Legacy baseline import

At cutover, each existing `player_dungeon_stats` row converts to
`legacy_baseline_deaths` and `legacy_baseline_yeets` with
`reason = legacy_import`.

- Do **not** fabricate runs, bosses, or death timestamps for historic data.
- After import, baseline rows are read-only anchors; they are not updated by
  PATCH or corrections.

Until companion ingest is enabled for a player × season × dungeon cell,
`displayed_*` may equal `legacy_baseline_* + manual_adjustment_*` with zero
event-derived contribution.

### Interaction with corrections

Classification corrections change `event_derived_*` and increment aggregate
revision in the same transaction as the event update (ADR 001).

A subsequent PATCH uses the **new** `event_derived_*` when recomputing manual
adjustments. Operators editing absolutes after corrections therefore replace
adjustments against up-to-date derived counts, not stale snapshots.

### Companion ingest gating

**Frontend revision support must land before companion event writes are
enabled.**

Ordering:

1. Legacy baseline import and derived read model queries.
2. `expectedRevision` on reads and PATCH; outbox `stale_revision` handling.
3. Companion ingest accepts events that increment `event_derived_*`.
4. Correction route (ADR 001).

Skipping step 2 risks silent aggregate corruption when offline PATCH races
ingest or corrections.

## Consequences

### Positive

- Single reconciliation formula explains historic totals, manual edits, and
  event-derived activity without double counting.
- Replaceable adjustment rows prevent unbounded append-only drift.
- Revision compare-and-set gives offline-first UX a safe conflict surface.
- `player_dungeon_stats` can remain the public read shape while internals move
  to event truth.

### Negative / constraints

- Migration must prove parity between old absolutes and the derived formula
  before cutover.
- Frontend schemas, hooks, and outbox logic require coordinated changes.
- Every aggregate read path must expose `revision` for editors.
- Test databases need fixtures for baseline, adjustments, and revision conflicts.

## Related documentation

| Document | Link |
| -------- | ---- |
| Classification and corrections | [ADR 001](./001-post-ingest-classification-and-corrections.md) |
| Companion ingest (no PATCH) | [`../../contracts/companion/v1/CONTRACT.md`](../../contracts/companion/v1/CONTRACT.md) |
| Phase 3 file map | [`../../contracts/companion/v1/IMPLEMENTATION_MAP.md`](../../contracts/companion/v1/IMPLEMENTATION_MAP.md) |
| Offline outbox | [`../OFFLINE.md`](../OFFLINE.md) |
| Verified PATCH route | [`../API.md`](../API.md) |
| ADR index | [`./README.md`](./README.md) |
