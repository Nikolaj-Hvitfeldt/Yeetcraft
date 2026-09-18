# Companion ingest contract v1 — normative specification (WP1)

> **Status: Draft — reviewed, not implemented**

This document specifies endpoint surface, authentication, deterministic
identifiers, batch idempotency boundaries, GUID-first identity, season and
dungeon resolution, and privacy rules for companion v1.

**Out of scope for WP1 (deferred):**

| Topic | Work package |
| ----- | ------------ |
| Run, encounter, death, ranked-cause payload fields and cross-field invariants | WP2 |
| `ingest-batch-request.schema.json` and synthetic request examples | WP2 |
| Per-event acknowledgement outcomes, response/error schemas, limits, retry taxonomy | WP3 |
| Correction transitions, revision-protected manual adjustment ledger | WP4 (Yeetcraft ADRs; linked as server context only) |

Companion v1 is **ingest-only**. The server assigns default `category = death`
on accepted events. Authoritative `death` / `yeet` / `ignored` classification
and corrections happen on the Yeetcraft website post-ingest.

---

## Endpoint and authentication surface

### Planned route

```http
POST /api/companion/v1/deaths/batch
Content-Type: application/json
```

- **Not implemented** in the Yeetcraft backend at the time of this draft.
- Separate from `PATCH /api/stats/batch` (browser aggregate edits). Companion
  ingest must not reuse aggregate PATCH semantics.

### Authentication

- **Environment variable:** `COMPANION_API_KEY` on the Yeetcraft server.
- **Middleware:** a dedicated companion auth middleware instance, distinct from
  browser `API_KEY` middleware.
- **Headers:** `X-API-Key` or `Authorization: Bearer <token>` (same header
  patterns as existing write auth).
- **Fail-closed:** empty or missing `COMPANION_API_KEY` returns **503** with a
  distinct stable error code on this route (exact code deferred to WP3). The
  route does not fall back to `API_KEY` or anonymous ingest.
- **Query `?token=`** is not supported on API routes.

### Credential model (MVP)

- One shared group key for the fixed friend-group MVP. A leaked key can submit
  for any tracked GUID; rotation revokes every installation.
- Per-installation principals are deferred.
- `installationId` in the request body (when present) is spoofable diagnostics
  only — not authorization and not an ID hash input.

### Operational expectations (deferred detail to WP3)

- Route-level rate limits apply to this endpoint.
- Audit accepted/rejected **batch metadata** without storing full payloads in
  logs.
- Never log credentials or complete request bodies in production diagnostics.

---

## Deterministic identifiers

All client-generated IDs are lowercase hexadecimal SHA-256 digests prefixed with
`sha256:` (64 hex characters after the prefix).

### Hash input encoding

Hash inputs are an **ordered sequence** of fields encoded as:

1. For each field: one **32-bit big-endian unsigned length** (four bytes) of the
   field's UTF-8 byte length, followed by the field bytes.
2. Field strings are **UTF-8** and **NFC-normalized** before hashing.

The **first field** is always a domain tag string (see recipes below).

Output format: `sha256:` + 64 lowercase hexadecimal characters.

### Canonical instants

- Wire and hash instants are **RFC 3339 UTC** with **fixed nanosecond**
  precision (for example `2026-01-15T19:43:12.123456789Z`).
- A timezone-less combat-log timestamp is interpreted only with an **explicitly
  persisted WoW-log timezone** configuration on the companion.
- DST ambiguity, invalid timestamps, missing stable run start, or inability to
  reconstruct an event ordinal produce **local review** and must not be
  auto-accepted as canonical instants for hashing or upload.

### `clientRunId`

Domain tag: `yeetcraft-run-v1`

Hash fields (in order):

| # | Field | Source |
| - | ----- | ------ |
| 1 | Domain tag | `yeetcraft-run-v1` |
| 2 | `challengeModeStartInstant` | Canonical RFC 3339 UTC instant of the run's `CHALLENGE_MODE_START` |
| 3 | `challengeMapId` | Integer challenge map ID from `CHALLENGE_MODE_START` |
| 4 | `keystoneLevel` | Integer keystone level from `CHALLENGE_MODE_START` |

**Deliberate exclusions** (must not appear in the hash):

- `seasonId` — correcting a stale companion season selection must not change run
  or event IDs.
- `installationId` — reinstall, state loss, or a second observer must not create
  a second canonical run for the same Mythic+ attempt.
- Log-file identity, party GUIDs, and character names.

### `clientEventId`

Domain tag: `yeetcraft-death-v1`

Hash fields (in order):

| # | Field | Source |
| - | ----- | ------ |
| 1 | Domain tag | `yeetcraft-death-v1` |
| 2 | `clientRunId` | As defined above |
| 3 | `victimGuid` | Combat-log player GUID of the victim |
| 4 | `deathInstant` | Canonical RFC 3339 UTC instant of the `UNIT_DIED` event |
| 5 | `ordinal` | Zero-based index among that victim's `UNIT_DIED` records at the **same** canonical `deathInstant` within the run |

### Persistence and rescan rules

- IDs are **persisted atomically** with normalized runs and events in companion
  local storage (Phase 2).
- A **full rescan** of a complete run reconstructs ordinals from the ordered
  `UNIT_DIED` sequence.
- A **partial scan** that cannot prove the prefix is complete must **reuse
  persisted IDs** or **hold** the event for review. It must **not** invent new
  ordinals.

---

## Batch idempotency

### `batchId`

- A **UUID** carried in the JSON request body.
- There is **no** parallel `Idempotency-Key` HTTP header for v1.

### Server behavior

- The server stores a canonical **request-body fingerprint** keyed by `batchId`.
- **Replay:** same `batchId` and identical body → return the prior **ordered**
  per-event results (HTTP 200).
- **Conflict:** same `batchId` with changed event membership or body → **409**
  `batch_conflict` (stable code; response envelope deferred to WP3).

### Per-event deduplication

- `clientEventId` uniqueness is the per-event deduplication boundary.
- Same `clientEventId` and identical immutable event fingerprint → `duplicate`
  (does not reset a website correction).
- Same `clientEventId` with changed victim, run, time, or immutable context →
  **409** `event_id_conflict`.

### Atomicity (summary; detail in WP3)

- Envelope or schema failures reject the **whole** request.
- Semantically valid events process in **one database transaction** with one
  ordered result per input event.
- `needs_review` outcomes are persisted in quarantine.
- Permanent semantic rejection is recorded in the batch result.
- Any database failure rolls back the entire batch and returns **5xx** with no
  acknowledgement.

---

## GUID-first identity

### Client-side tracked filter

- Production capture **fails closed** when no tracked-character configuration is
  available.
- `tracked` is resolved **client-side**. Untracked party members are filtered
  **before** upload.
- No name, realm, or GUID for untracked members reaches the wire.

### Wire identity (v1)

- Each death event carries **`characterGuid` only** (combat-log player GUID of
  a tracked character).
- Names and realms are **not** authoritative ingest identity and are omitted
  from v1 requests.

### Server resolution

| Outcome | Meaning |
| ------- | ------- |
| `resolved` | GUID maps to exactly one Yeetcraft character (and thus player owner) |
| `unknown` | GUID is not mapped; event is quarantined without aggregation; may be re-resolved after mapping |
| `ambiguous` | Reserved for explicit configuration or data-integrity failure; cannot occur when the planned unique GUID constraint is healthy |

Unknown GUIDs are **never** silently treated as duplicates or used to create
public players or characters from untrusted log data.

### Sequencing blocker

This contract depends on Yeetcraft implementing nullable, **unique**
`characters.guid` as described in
[`docs/CHARACTERS_AND_BOSS_NEMESIS.md`](../../../docs/CHARACTERS_AND_BOSS_NEMESIS.md).

**That column does not exist yet.** v1 ingest implementation is blocked until
the character slice lands. Record this dependency in planning; do not implement
ingest handlers against a hypothetical GUID map.

---

## Season and dungeon resolution

### Server authority

- The server resolves the run's season from its **canonical run-start instant**
  against **non-overlapping** season `starts_at` / `ends_at` bounds.
- `seasons.is_current` is a **companion UI default** and **never** ingest
  authority. Missing, overlapping, or contradictory evidence produces
  `needs_review`, never silent assignment to the current season at ingest time.

### Companion season hint

- The companion may snapshot a **server season ID** into each run as a hint or
  user override.
- The server **validates** any companion-supplied `seasonId` against
  timestamp-based resolution and `(seasonId, dungeonId)` membership in
  `season_dungeons`.
- A stale selector value, out-of-pool dungeon, or contradiction → `needs_review`.

### Dungeon resolution

- Challenge `MapID` resolves to a Yeetcraft dungeon via nullable unique
  `dungeons.challenge_map_id` (Phase 3 migration — **not present** in current
  schema).
- An unmapped map ID holds the event for review and **never** auto-creates a
  dungeon row.
- Dungeon membership may **corroborate or narrow** season candidates but is
  **never sufficient alone** to establish a season (dungeons can return in
  later seasons).

### Current schema gaps (verified)

| Gap | Current state | Planned resolution |
| --- | ------------- | ------------------ |
| Season date bounds | `seasons` has `name`, `expansion`, `is_current` only | Phase 3: `starts_at`, `ends_at` non-overlapping bounds |
| Challenge map ID | `dungeons` has no game/instance ID column | Phase 3: `challenge_map_id` nullable unique |

---

## Privacy and redaction

### Untracked party members

- Filtered client-side before upload.
- Must not appear in ingest payloads (GUID, name, realm, or death statistics).

### Cause evidence

Cause records must **not** contain:

- player names or realms;
- untracked player or pet-owner GUIDs;
- raw combat-log lines.

Prefer, when available:

- source kind / `sourceType` (creature, environmental, etc.);
- creature or game object IDs;
- spell IDs;
- amount and overkill;
- rank (contiguous unique ranks, at most three — limits deferred to WP3);
- detector confidence (describes evidence quality, not classification authority).

Unknown player-origin cause identity is **redacted locally** before upload.

### Tracked character GUID

- Required on the wire for each death event.
- Treat as sensitive operational data in diagnostics; do not log full ingest
  bodies in production.

### `installationId`

- Optional diagnostics field in the client envelope (shape deferred to WP2).
- Excluded from ID recipes.
- Not an authentication principal; spoofable.

### Retention (companion local)

| Data | Policy |
| ---- | ------ |
| Raw combat logs | Remain on disk; never uploaded |
| Normalized events pending upload | Retained until server acknowledgement (Phase 2 storage) |
| Diagnostic logs | Identifiers and stable codes only; no credentials or full payloads |
| Error messages surfaced to users | Actionable; no secrets or untracked PII |

Server-side evidence retention for ranked causes is specified with payload
fields in WP2.

---

## Document map

| Section | WP |
| ------- | -- |
| Endpoint and authentication | WP1 (this document) |
| Deterministic IDs | WP1 |
| Batch idempotency boundaries | WP1 (acknowledgement codes WP3) |
| GUID-first identity | WP1 |
| Season and dungeon resolution | WP1 |
| Privacy and redaction | WP1 |
| Request/response payloads and schemas | WP2–WP3 |
| Correction and adjustment ledger | WP4 |

See [`README.md`](./README.md) for ownership, versioning, and compatibility.
