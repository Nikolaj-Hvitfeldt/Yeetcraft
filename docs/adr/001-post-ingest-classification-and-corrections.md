# ADR 001 — Post-ingest event classification and corrections

> **Status: Draft — reviewed, not implemented**

| Field | Value |
| ----- | ----- |
| Work package | WP4 |
| Scope | Yeetcraft server behavior after companion ingest |
| Companion wire impact | None — companion v1 is ingest-only |

## Context

Companion v1 uploads structured death candidates. The ingest contract assigns
default `category = death` on accepted events and deliberately omits
authoritative `yeet` or `ignored` classification from the wire payload.
Detector `confidence` on ranked causes describes evidence quality only; it does
not grant classification authority.

The Yeetcraft website must own all post-ingest reclassification so that:

- one canonical event row exists per observed death;
- aggregate totals remain structurally consistent;
- duplicate ingest replays never undo operator corrections;
- every classification change is auditable and idempotent.

Implementation paths (routes, tables, handlers) are **deferred to WP5**. This
ADR specifies behavior only.

## Verified current behavior

- `PATCH /api/stats/batch` writes **absolute** `deaths` and `yeets` values
  directly into `player_dungeon_stats` (see [`../API.md`](../API.md)).
- There is no `death_events` table, no per-event `category`, and no correction
  API (see [`../CHARACTERS_AND_BOSS_NEMESIS.md`](../CHARACTERS_AND_BOSS_NEMESIS.md)).
- There is no companion ingest route.
- The browser outbox queues aggregate PATCH payloads without revision
  comparison (see [`../OFFLINE.md`](../OFFLINE.md)).

## Decision

### Classification locus

| Stage | Authority |
| ----- | --------- |
| Companion ingest (v1) | Ingest-only. Clients omit `category` or send `category: "death"` only. |
| Server on accept | Assign `category = death` to the canonical event row. |
| Website post-ingest | Authoritative `death`, `yeet`, and `ignored` transitions. |

The companion must not upload `yeet` or `ignored` in v1. Future detector
suggestions (for example `possible_yeet`) are review hints only and must not
overwrite a confirmed website classification.

### Structural aggregate math

For a given player × season × dungeon aggregate cell:

```text
deaths  = count(accepted events where category = 'death')
yeets   = count(accepted events where category = 'yeet')
ignored = count(accepted events where category = 'ignored')  -- not added to either total
total_mistakes = deaths + yeets
```

| Transition | Δ deaths | Δ yeets | Δ total_mistakes |
| ---------- | -------- | ------- | ---------------- |
| `death` → `yeet` | −1 | +1 | 0 |
| `yeet` → `death` | +1 | −1 | 0 |
| `death` → `ignored` | −1 | 0 | −1 |
| `yeet` → `ignored` | 0 | −1 | −1 |
| `ignored` → `death` | +1 | 0 | +1 |
| `ignored` → `yeet` | 0 | +1 | +1 |

- `death ↔ yeet` transitions **preserve** `deaths + yeets` (total mistakes
  invariant).
- Transitions **to or from** `ignored` intentionally change total mistakes by
  exactly one.
- `ignored` events count toward neither `deaths` nor `yeets`.

### Canonical event invariant

- Corrections **update one canonical event** and **never insert a second
  death** for the same observed `UNIT_DIED`.
- Ingest `duplicate` with an identical immutable fingerprint returns HTTP 200
  `duplicate` and **does not reset** a website correction already applied to
  that event.
- Ingest `duplicate` must not change `category`, event revision, or aggregate
  totals.

### Allowed transition matrix

Only the six transitions in the table above are permitted. Requests for any
other `fromCategory → toCategory` pair are rejected with a stable semantic error
(planned; not implemented).

No-op transitions (`death → death`, etc.) are rejected unless replayed through
the same correction idempotency key (see below), in which case the server
returns the prior successful outcome.

### Correction request model (planned, not wire schema)

A website correction operates on a single canonical event identified by
`serverEventId` (UUID returned on ingest accept or duplicate).

Required fields:

| Field | Role |
| ----- | ---- |
| `idempotencyKey` | UUID chosen by the client. Replaying the same key with the same body returns the prior outcome without double-applying aggregate deltas. |
| `actor` | Stable operator identity for audit (for the fixed-group MVP this is the authenticated website principal behind `API_KEY` writes). |
| `expectedEventRevision` | Non-negative integer. Compare-and-set against the event row's `revision`. |
| `toCategory` | Target category: `death`, `yeet`, or `ignored`. |

The server derives `fromCategory` from the canonical event row. Clients must
not supply `fromCategory`; mismatches between client assumption and server
state are resolved via `expectedEventRevision` failure instead of silent
correction.

**Non-wire example (illustrative only — not companion ingest, not implemented):**

```json
{
  "idempotencyKey": "00000000-0000-4000-8000-000000000001",
  "actor": "website-operator",
  "expectedEventRevision": 2,
  "toCategory": "yeet"
}
```

### Event revision and concurrency

- Each accepted event row carries a monotonic `revision`, starting at `1` on
  first accept.
- Every successful correction increments that event's `revision` by exactly
  `1`.
- If `expectedEventRevision` does not match the stored revision, the server
  returns **409** with stable code `stale_event_revision` and makes **no**
  change.
- Concurrent corrections on the same event are last-writer-loses only when
  revisions match; otherwise the loser receives `stale_event_revision`.

### Audit record

Every successful correction appends an immutable audit row (planned table;
deferred to WP5) containing at minimum:

| Field | Content |
| ----- | ------- |
| `serverEventId` | Canonical event UUID |
| `idempotencyKey` | Client correction idempotency key |
| `actor` | Operator identity |
| `fromCategory` | Category before transition |
| `toCategory` | Category after transition |
| `eventRevisionBefore` | Revision compared against `expectedEventRevision` |
| `eventRevisionAfter` | Revision after increment |
| `appliedAt` | Server timestamp (UTC) |

Audit rows are append-only. Corrections never delete prior audit history.

### Aggregate side effects

A successful correction applies the structural deltas from the transition
matrix to the owning player's season × dungeon aggregate cell in the **same
database transaction** as the event update and audit insert.

Every correction that changes aggregate counts also increments the aggregate
revision for that player × season × dungeon cell (specified in
[ADR 002](./002-revision-protected-adjustment-ledger.md)).

### Idempotency semantics

| Condition | Outcome |
| --------- | ------- |
| New `idempotencyKey`, valid transition, matching `expectedEventRevision` | Apply transition; return success with new event revision |
| Known `idempotencyKey` with identical request body | Return stored prior outcome (HTTP 200); no duplicate aggregate delta |
| Known `idempotencyKey` with different body | **409** `correction_idempotency_conflict` |
| `expectedEventRevision` stale | **409** `stale_event_revision` |
| Disallowed transition | **422** with stable semantic code (planned) |

Correction idempotency is independent of ingest `batchId` / `clientEventId`
idempotency.

## Consequences

### Positive

- Clear separation between companion ingest facts and website classification
  authority.
- Total-mistake invariants are enforceable in SQL transactions.
- Duplicate uploads cannot undo operator trust decisions.
- Audit trail supports leaderboard disputes and Nemesis Boss preparation.

### Negative / constraints

- Requires canonical `death_events` (or equivalent) with `category` and
  `revision` before corrections can ship.
- Website UI and API must expose correction flows; companion review UI does not
  replace website authority.
- Aggregate reconciliation (ADR 002) must be in place before event-derived
  totals and manual PATCH coexist safely.

### Rollout ordering

1. Character slice (`characters.guid`) and event ingest schema (Phase 3).
2. Frontend aggregate `expectedRevision` support and outbox stale handling
   (ADR 002).
3. Correction route and audit storage.
4. Enable companion event writes only after steps 1–2 are live.

## Related documentation

| Document | Link |
| -------- | ---- |
| Companion ingest contract | [`../../contracts/companion/v1/CONTRACT.md`](../../contracts/companion/v1/CONTRACT.md) |
| Adjustment ledger and PATCH revision | [ADR 002](./002-revision-protected-adjustment-ledger.md) |
| Verified API surface | [`../API.md`](../API.md) |
