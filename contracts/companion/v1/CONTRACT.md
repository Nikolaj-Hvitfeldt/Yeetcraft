# Companion ingest contract v1 — normative specification (WP1–WP2)

> **Status: Draft — reviewed, not implemented**

This document specifies endpoint surface, authentication, deterministic
identifiers, batch idempotency boundaries, GUID-first identity, season and
dungeon resolution, and privacy rules for companion v1.

**Out of scope for WP1 (deferred):**

| Topic | Work package |
| ----- | ------------ |
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

Server-side evidence retention for ranked causes is specified in
[Request payloads](#request-payloads) below.

---

## Request payloads

Normative JSON Schema:
[`schema/ingest-batch-request.schema.json`](./schema/ingest-batch-request.schema.json).

Synthetic request examples:
[`examples/request/`](./examples/request/).

### Batch envelope

Top-level object for `POST /api/companion/v1/deaths/batch`:

| Field | Required | Type | Description |
| ----- | -------- | ---- | ----------- |
| `schemaVersion` | yes | integer `1` | Must agree with path segment `v1` (matching rules deferred to WP3). |
| `batchId` | yes | UUID string | Batch idempotency key (see [Batch idempotency](#batch-idempotency)). |
| `installationId` | no | UUID string | Spoofable diagnostics only; excluded from ID recipes and auth. |
| `events` | yes | array | One or more death events (array bounds deferred to WP3). |

The envelope uses `additionalProperties: false`. No parallel
`Idempotency-Key` header.

### Death event

Each element of `events` describes one tracked-player `UNIT_DIED` ingest
candidate.

| Field | Required | Type | Description |
| ----- | -------- | ---- | ----------- |
| `clientEventId` | yes | `sha256:` digest | Per [Deterministic identifiers](#clienteventid). |
| `characterGuid` | yes | player GUID | Combat-log GUID of the **tracked** victim. Names and realms are omitted. |
| `deathInstant` | yes | canonical instant | RFC 3339 UTC with fixed nanosecond precision at the `UNIT_DIED` envelope time. |
| `ordinal` | yes | integer ≥ 0 | Zero-based index among this victim's `UNIT_DIED` records at the **same** canonical `deathInstant` within the run. |
| `run` | yes | run object | Mythic+ run context used for ID hashing and server season/dungeon resolution. |
| `encounter` | yes | encounter object or `null` | Boss journal context when an encounter was active at death; `null` for trash. |
| `causes` | no | ranked-cause array | Up to three ranked cause records; may be omitted or empty when no damage evidence was captured. |
| `category` | no | string | If present, must be exactly `"death"`. Omission is equivalent. |

#### Server-default classification

Companion v1 is **ingest-only**. The wire payload does **not** carry
authoritative `yeet` or `ignored` classification.

- Clients **omit** `category` or, if present, set `category` to `"death"` only.
- The server assigns `category = death` on accepted events.
- Website correction to `yeet` or `ignored` is Yeetcraft-internal (WP4) and is
  not part of the companion wire contract.

Detector `confidence` on ranked causes describes evidence quality only; it does
not grant classification authority.

#### Run object (`run`)

| Field | Required | Type | Description |
| ----- | -------- | ---- | ----------- |
| `clientRunId` | yes | `sha256:` digest | Per [Deterministic identifiers](#clientrunid). |
| `challengeModeStartInstant` | yes | canonical instant | Canonical instant of the run's `CHALLENGE_MODE_START`. |
| `challengeMapId` | yes | integer ≥ 1 | Challenge map ID from `CHALLENGE_MODE_START`. |
| `keystoneLevel` | yes | integer ≥ 0 | Keystone level from `CHALLENGE_MODE_START`. |
| `seasonId` | no | UUID string | Yeetcraft season ID snapshot as a hint; validated server-side (see [Season and dungeon resolution](#season-and-dungeon-resolution)). |

Every ingested death must include a complete run object with all hash inputs
required to verify `clientRunId`. Deaths that cannot be bound to a
`CHALLENGE_MODE_START` with a canonical start instant must be held for local
review and **must not** appear in upload batches.

`seasonId` is never authoritative by itself; contradictions with timestamp-based
resolution produce `needs_review` at processing time (acknowledgement deferred
to WP3).

#### Encounter object (`encounter`)

When not `null`:

| Field | Required | Type | Description |
| ----- | -------- | ---- | ----------- |
| `encounterId` | yes | integer ≥ 1 | Journal encounter ID from `ENCOUNTER_START` active at death. |

Encounter names, boss display strings, and NPC GUIDs are **not** on the wire.
Trash deaths set `encounter` to `null`.

#### Ranked cause object (`causes[]`)

| Field | Required | Type | Description |
| ----- | -------- | ---- | ----------- |
| `rank` | yes | integer 1–3 | Contiguous ranks starting at `1` within the event (see invariants). |
| `sourceType` | yes | enum | `spell`, `range`, `melee`, or `environmental` (normalized damage kind). |
| `spellId` | conditional | integer ≥ 1 | Required when `sourceType` is `spell` or `range`. |
| `creatureId` | no | integer ≥ 1 | Creature or game-object template ID when known; never a player or pet-owner GUID. |
| `environmentalType` | conditional | string | Required when `sourceType` is `environmental`. |
| `amount` | yes | integer ≥ 0 | Damage amount from the contributing hit. |
| `overkill` | yes | integer ≥ 0 | Overkill from the contributing hit. |
| `confidence` | yes | enum | `high`, `medium`, or `low` — detector evidence only. |

**Forbidden on causes** (enforced structurally and semantically): player names,
realms, untracked player or pet-owner GUIDs, spell display names, raw log lines,
and any field not defined in the schema.

Prefer `creatureId` over wire GUIDs for non-player sources. Player-origin cause
identity is redacted locally before upload; such causes may omit `creatureId`.

### Wire formats

| Concept | Format |
| ------- | ------ |
| UUID | Lowercase RFC 4122 string `8-4-4-4-12` hex with hyphens. |
| `sha256:` digest | Literal prefix `sha256:` followed by 64 lowercase hex digits. |
| Player GUID | `Player-` prefix, realm segment, local segment (combat-log shape). |
| Canonical instant | `YYYY-MM-DDTHH:MM:SS.nnnnnnnnnZ` — UTC, exactly nine fractional digits. |

### Cross-field invariants

The server (and companion before upload) must enforce:

1. **`clientRunId` integrity** — Recomputed hash from domain tag
   `yeetcraft-run-v1`, `run.challengeModeStartInstant`, decimal string forms of
   `run.challengeMapId` and `run.keystoneLevel`, must equal `run.clientRunId`.
2. **`clientEventId` integrity** — Recomputed hash from domain tag
   `yeetcraft-death-v1`, `run.clientRunId`, `characterGuid`, `deathInstant`,
   and decimal string form of `ordinal`, must equal `clientEventId`.
3. **Instant alignment** — `deathInstant` must not precede
   `run.challengeModeStartInstant` within the same run context.
4. **Encounter consistency** — When `encounter` is non-null,
   `encounter.encounterId` must be positive. Trash deaths use `encounter:
   null`.
5. **Cause ranks** — At most three causes; ranks are unique and contiguous from
   `1` through `N` with no gaps.
6. **Cause conditionals** — `spellId` present for `spell` and `range`;
   `environmentalType` present for `environmental`.
7. **Category constraint** — If `category` is present, value must be `death`.
8. **Tracked identity** — `characterGuid` is the only character identity field;
   it must refer to a tracked player GUID filtered client-side before upload.
9. **Run completeness** — Events without a verifiable Mythic+ start context
   are not valid ingest payloads.

Structural checks (types, bounds, `additionalProperties`, digest and instant
patterns) are expressed in JSON Schema. Hash recomputation, rank contiguity, and
timestamp ordering are **semantic** checks.

### Request-side semantic validation codes

These stable codes describe **request payload semantics** evaluated per event or
envelope. HTTP status mapping, batch envelopes, and retry behavior are deferred
to WP3.

| Code | Scope | When |
| ---- | ----- | ---- |
| `schema_version_mismatch` | envelope | `schemaVersion` does not match endpoint `v1`. |
| `invalid_batch_id` | envelope | `batchId` is not a UUID. |
| `empty_events` | envelope | `events` is empty. |
| `invalid_client_run_id` | event | `clientRunId` digest format invalid or hash mismatch. |
| `invalid_client_event_id` | event | `clientEventId` digest format invalid or hash mismatch. |
| `invalid_instant` | event | Instant not canonical RFC 3339 UTC with required precision. |
| `death_before_run_start` | event | `deathInstant` precedes `challengeModeStartInstant`. |
| `invalid_character_guid` | event | `characterGuid` is not a player GUID shape. |
| `invalid_ordinal` | event | `ordinal` is negative or inconsistent with persisted scan order. |
| `category_not_allowed` | event | `category` present and not `death`. |
| `run_context_incomplete` | event | Run object missing required hash inputs or Mythic+ binding. |
| `invalid_encounter` | event | Non-null `encounter` without positive `encounterId`. |
| `too_many_causes` | event | More than three ranked causes. |
| `cause_rank_non_contiguous` | event | Cause ranks are not exactly `1..N`. |
| `cause_rank_duplicate` | event | Duplicate `rank` values among causes. |
| `cause_field_missing` | event | Required conditional cause field absent for `sourceType`. |
| `cause_forbidden_field` | event | Cause carries a forbidden identity field (should not occur when schema-valid). |

Per-event outcomes such as `needs_review`, `duplicate`, and identity resolution
(`unknown` character GUID) are processing results, not ingest-schema defects;
their acknowledgement codes are deferred to WP3.

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
| Request payloads | WP2 (this document) |
| Response payloads, limits, retry taxonomy | WP3 |
| Correction and adjustment ledger | WP4 |

See [`README.md`](./README.md) for ownership, versioning, and compatibility.
