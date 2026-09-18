# Companion ingest contract v1 — normative specification (WP1–WP3)

> **Status: Draft — reviewed, not implemented**

This document specifies endpoint surface, authentication, deterministic
identifiers, batch idempotency boundaries, GUID-first identity, season and
dungeon resolution, privacy rules, request payloads, acknowledgement semantics,
limits, version matching, and error taxonomy for companion v1.

**Out of scope (companion wire):**

| Topic | Yeetcraft specification (not companion wire) |
| ----- | -------------------------------------------- |
| Correction transitions, event revision, audit | [ADR 001](../../../docs/adr/001-post-ingest-classification-and-corrections.md) |
| Revision-protected manual adjustment ledger, `expectedRevision` on aggregate PATCH | [ADR 002](../../../docs/adr/002-revision-protected-adjustment-ledger.md) |

Companion v1 is **ingest-only**. The server assigns default `category = death`
on accepted events. Authoritative `death` / `yeet` / `ignored` classification
and corrections happen on the Yeetcraft website post-ingest (see
[Server behavior after ingest](#server-behavior-after-ingest)).

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
- **Fail-closed:** empty or missing `COMPANION_API_KEY` returns **503** with
  stable code `companion_api_unconfigured`. The route does not fall back to
  `API_KEY` or anonymous ingest.
- **Query `?token=`** is not supported on API routes.

### Credential model (MVP)

- One shared group key for the fixed friend-group MVP. A leaked key can submit
  for any tracked GUID; rotation revokes every installation.
- Per-installation principals are deferred.
- `installationId` in the request body (when present) is spoofable diagnostics
  only — not authorization and not an ID hash input.

### Operational expectations

- **Content-Type:** `application/json` only. Requests with other media types
  receive **415** `unsupported_media_type`.
- **Content-Encoding:** only `identity` (absent header) is accepted. Compressed
  or other encodings receive **415** `unsupported_content_encoding`.
- **Rate limits:** route-level limits apply. Excess traffic receives **429**
  `rate_limit_exceeded`. Clients should honor `Retry-After` when present.
- **Audit:** log accepted/rejected **batch metadata** (`batchId`, event count,
  outcome summary, stable codes) without request payloads, credentials, or full
  cause evidence.
- Never log credentials or complete request bodies in production diagnostics.
- Never reuse browser `API_KEY` for companion ingest.

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
- **Conflict:** same `batchId` with changed decoded body fingerprint → **409**
  `batch_conflict` (see [Request body fingerprint](#request-body-fingerprint)).

### Per-event deduplication

- `clientEventId` uniqueness is the per-event deduplication boundary.
- Same `clientEventId` and identical immutable event fingerprint → `duplicate`
  (does not reset a website correction).
- Same `clientEventId` with changed victim, run, time, or immutable context →
  **409** `event_id_conflict`.

### Atomicity

See [Acknowledgement semantics](#acknowledgement-semantics).

- Envelope or schema failures reject the **whole** request (no per-event
  results).
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
- rank (contiguous unique ranks, at most three — see [Limits](#limits));
- detector confidence (describes evidence quality, not classification authority).

Unknown player-origin cause identity is **redacted locally** before upload.

### Tracked character GUID

- Required on the wire for each death event.
- Treat as sensitive operational data in diagnostics; do not log full ingest
  bodies in production.

### `installationId`

- Optional diagnostics field in the client envelope (see [Batch envelope](#batch-envelope)).
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
| `schemaVersion` | yes | integer `1` | Must agree with path segment `v1` (see [Version matching](#version-matching)). |
| `batchId` | yes | UUID string | Batch idempotency key (see [Batch idempotency](#batch-idempotency)). |
| `installationId` | no | UUID string | Spoofable diagnostics only; excluded from ID recipes and auth. |
| `events` | yes | array | One to 500 death events (see [Limits](#limits)). |

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
- Website correction to `yeet` or `ignored` is Yeetcraft-internal
  ([ADR 001](../../../docs/adr/001-post-ingest-classification-and-corrections.md))
  and is not part of the companion wire contract.

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
resolution produce `needs_review` at processing time (see
[Per-event outcomes](#per-event-outcomes)).

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
envelope. HTTP status mapping and retry behavior are in
[Error taxonomy](#error-taxonomy).

| Code | Scope | When |
| ---- | ----- | ---- |
| `schema_version_mismatch` | envelope | `schemaVersion` does not match endpoint `v1`. |
| `invalid_batch_id` | envelope | `batchId` is not a UUID. |
| `empty_events` | envelope | `events` is empty. |
| `batch_size_exceeded` | envelope | More than 500 events. |
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

Per-event processing outcomes (`accepted`, `duplicate`, `needs_review`,
`rejected`) are defined in [Per-event outcomes](#per-event-outcomes).

---

## Acknowledgement semantics

### Whole envelope versus per-event outcomes

| Failure class | HTTP | Body | Per-event results |
| ------------- | ---- | ---- | ----------------- |
| Transport, auth, rate limit, envelope size, media type, encoding | 4xx / 429 / 503 (unconfigured) | Error envelope | None |
| JSON parse, schema, version, batch bounds, depth, trailing JSON | 4xx (typically 422) | Error envelope | None |
| `batch_conflict`, `event_id_conflict` | 409 | Error envelope | None |
| Semantically processable batch | **200** | Batch response | Exactly one ordered result per input event |
| Database or transient ingest failure mid-batch | 5xx | Error envelope | None — transaction rolled back, nothing acknowledged |

Envelope and schema validation run **before** opening the ingest transaction.
When the envelope is accepted for processing, the server executes **one**
database transaction that evaluates every input event and emits one result per
event in **input order**.

### Request body fingerprint

For `batchId` idempotency the server stores a fingerprint of the **decoded
UTF-8 request body** exactly as received (after rejecting unsupported
`Content-Encoding`). The fingerprint algorithm is implementation-defined but
must be stable for byte-identical bodies.

- **Replay:** same `batchId` and identical fingerprint → return the stored
  ordered results with HTTP **200** (even when every event is `duplicate`).
- **Conflict:** same `batchId` with a different fingerprint → **409**
  `batch_conflict` without processing.

There is **no** `Idempotency-Key` HTTP header in v1.

### Per-event immutable fingerprint

Per-event deduplication uses `clientEventId` as the primary key. The immutable
fingerprint is the tuple:

1. `clientEventId`
2. `characterGuid`
3. `deathInstant`
4. `ordinal`
5. `run.clientRunId`
6. `run.challengeModeStartInstant`
7. `run.challengeMapId`
8. `run.keystoneLevel`
9. `encounter` (JSON `null` or `{ "encounterId": <id> }`)
10. `category` (absent treated as `death`)
11. Normalized `causes` array (order-preserving; schema-valid content only)

Server behavior:

| Condition | Outcome |
| --------- | ------- |
| No existing row for `clientEventId` | Process normally |
| Existing row and identical fingerprint | `duplicate` in HTTP 200; does **not** reset a website correction ([ADR 001](../../../docs/adr/001-post-ingest-classification-and-corrections.md)) |
| Existing row and different fingerprint | **409** `event_id_conflict` for the whole request |
| Same `clientEventId` twice in one batch with different fingerprints | **409** `event_id_conflict` before commit |

### Per-event outcomes

Each element of `results` in an HTTP **200** response corresponds to the
event at the same index in the request `events` array.

| `outcome` | Meaning | Persisted server state |
| --------- | ------- | ---------------------- |
| `accepted` | Event ingested; default `category = death` assigned server-side | Canonical event row created |
| `duplicate` | Identical fingerprint to an existing accepted event | No new row; prior event unchanged |
| `needs_review` | Valid wire payload held for operator review | Quarantine row created; no aggregation |
| `rejected` | Permanent semantic rejection for this event | Rejection recorded in batch result only; no canonical event |

`needs_review` stable codes (non-exhaustive):

| Code | When |
| ---- | ---- |
| `unknown_character` | `characterGuid` is not mapped to a Yeetcraft character |
| `unmapped_challenge_map` | `challengeMapId` has no `dungeons.challenge_map_id` |
| `season_needs_review` | Season cannot be resolved from run-start instant and hints |

`rejected` uses the request-side semantic codes in
[Request-side semantic validation codes](#request-side-semantic-validation-codes)
(for example `invalid_client_run_id`, `death_before_run_start`).

`accepted` and `duplicate` use `code` equal to the outcome name (`accepted`,
`duplicate`). Every `accepted` result includes `serverEventId` (UUID of the
canonical or existing event). `duplicate` results include `serverEventId` of
the existing event.

### Database failure

Any database error during the ingest transaction rolls back the **entire**
batch, returns **5xx** with a transient error code, and stores **no**
acknowledgement for that attempt. Clients may retry with the same `batchId` and
body.

---

## Limits

| Limit | Value |
| ----- | ----- |
| Events per batch | 1–500 inclusive |
| Decoded request body size | 1 MiB (1 048 576 bytes) maximum |
| Ranked causes per event | 0–3 |
| JSON object nesting depth | 16 levels maximum (envelope through nested objects) |
| `keystoneLevel` | 0–99 |
| `challengeMapId`, `encounterId`, `spellId`, `creatureId` | 1–999 999 |
| `amount`, `overkill` | 0–9 999 999 999 |
| `environmentalType` | 1–64 UTF-8 bytes |
| `code` / error `message` strings | See response and error schemas |

Structural rules enforced before processing:

- Strict lowercase UUID, `sha256:` digest, player GUID, and canonical instant
  forms (see [Wire formats](#wire-formats)).
- `additionalProperties: false` on every object defined by the contract schemas.
- Cause ranks contiguous and unique from `1` through `N`.
- Exactly **one** JSON document per request; bytes after the first value are
  rejected (`trailing_json_not_allowed`).
- `events` must be non-empty; more than 500 events is `batch_size_exceeded`.

Oversized bodies are rejected with **413** `payload_too_large` before schema
validation.

---

## Version matching

- URL path segment **`v1`** and request `schemaVersion: 1` must agree.
- Requests to `/api/companion/v1/deaths/batch` with any other `schemaVersion`
  receive **422** `schema_version_mismatch` without processing.
- Future major versions use a new path (for example `/api/companion/v2/...`) and
  wire `schemaVersion` integer; v1 clients must not send unsupported versions.

Response bodies on HTTP **200** always include `schemaVersion: 1` matching the
accepted request.

---

## Error taxonomy

Normative JSON Schemas:

- Success: [`schema/ingest-batch-response.schema.json`](./schema/ingest-batch-response.schema.json)
- Failure: [`schema/error.schema.json`](./schema/error.schema.json)

Synthetic examples:
[`examples/response/`](./examples/response/),
[`examples/error/`](./examples/error/).

### Envelope error responses

All non-200 responses use the error envelope (`error.code`, `error.message`,
optional `error.retryable`). Codes are stable across implementations.

| HTTP | Code | Retryable | When |
| ---- | ---- | --------- | ---- |
| 400 | `invalid_json` | no | Request body is not valid JSON |
| 401 | `missing_api_key` | no | No `X-API-Key` or `Authorization: Bearer` credential |
| 401 | `invalid_api_key` | no | Credential present but not accepted |
| 409 | `batch_conflict` | no | Same `batchId`, different body fingerprint |
| 409 | `event_id_conflict` | no | `clientEventId` reuse with different immutable fingerprint |
| 413 | `payload_too_large` | no | Decoded body exceeds 1 MiB |
| 415 | `unsupported_media_type` | no | `Content-Type` is not `application/json` |
| 415 | `unsupported_content_encoding` | no | `Content-Encoding` other than identity |
| 422 | `schema_validation_failed` | no | JSON Schema structural validation failed |
| 422 | `schema_version_mismatch` | no | `schemaVersion` does not match endpoint `v1` |
| 422 | `empty_events` | no | `events` array is empty |
| 422 | `batch_size_exceeded` | no | More than 500 events |
| 422 | `json_depth_exceeded` | no | JSON nesting exceeds 16 levels |
| 422 | `trailing_json_not_allowed` | no | Bytes after the first JSON value |
| 422 | `invalid_batch_id` | no | `batchId` is not a lowercase UUID |
| 429 | `rate_limit_exceeded` | yes | Route rate limit exceeded |
| 503 | `companion_api_unconfigured` | yes | `COMPANION_API_KEY` missing or empty on server |
| 503 | `ingest_temporarily_unavailable` | yes | Transient failure (including database) with no acknowledgement stored |

`companion_api_unconfigured` is distinct from browser `API_KEY` **503** behavior
and must not fall back to browser credentials.

### HTTP 200 batch response

| `outcome` | Typical `code` values |
| --------- | --------------------- |
| `accepted` | `accepted` |
| `duplicate` | `duplicate` |
| `needs_review` | `unknown_character`, `unmapped_challenge_map`, `season_needs_review` |
| `rejected` | Semantic codes from [Request-side semantic validation codes](#request-side-semantic-validation-codes) |

Cardinality: `results.length` **must** equal `events.length` and preserve
request order.

### Retry guidance

| Response | Client action |
| -------- | ------------- |
| 200 with all `accepted` / `duplicate` / `needs_review` / `rejected` | Treat as acknowledged; persist outcomes locally |
| 200 replay (same `batchId` + body) | Idempotent; replace local pending state with returned results |
| 5xx transient (`retryable: true`) | Retry same `batchId` and body with backoff |
| 409, 401, 413, 415, 422 | Fix request or configuration; do not blind-retry |
| 429 | Retry after `Retry-After` or backoff |
| 503 `companion_api_unconfigured` | Operator must configure server; installations retry later |

Per-event `rejected` and `needs_review` outcomes are **final for that upload
attempt**; correcting data requires a new `clientEventId` or operator action on
the website ([ADR 001](../../../docs/adr/001-post-ingest-classification-and-corrections.md)).

---

## Server behavior after ingest

The sections above define the **companion wire contract** only. The following
Yeetcraft ADRs specify **planned, not implemented** server behavior after
ingest. They are linked here for context; they do **not** extend the ingest
request or response schemas.

| Topic | Document |
| ----- | -------- |
| Website-owned `death` / `yeet` / `ignored` classification; correction idempotency key, actor, `expectedEventRevision`, allowed transition matrix, audit record; structural aggregate math; duplicate ingest must not reset corrections | [ADR 001 — Post-ingest classification and corrections](../../../docs/adr/001-post-ingest-classification-and-corrections.md) |
| Derived `player_dungeon_stats`; immutable legacy baseline; one replaceable manual adjustment per player × season × dungeon × category; `adjustment = entered_total − event_derived_total − legacy_baseline`; aggregate `expectedRevision` and **409** `stale_revision` on `PATCH /api/stats/batch`; frontend revision support before companion event writes | [ADR 002 — Revision-protected adjustment ledger](../../../docs/adr/002-revision-protected-adjustment-ledger.md) |

**Structural aggregate math (identical to ADR 001):**

```text
deaths  = count(category = 'death')
yeets   = count(category = 'yeet')
ignored = count(category = 'ignored')   -- not added to deaths or yeets
total_mistakes = deaths + yeets
```

- `death ↔ yeet` preserves `deaths + yeets`.
- Transitions to or from `ignored` change total mistakes by exactly one.
- Corrections update one canonical event and never insert a second death.
- Detector `confidence` is evidence only, not classification authority.

Phase 2/3 implementation file paths are **deferred to WP5**.

---

## Response payloads

### Batch success (`HTTP 200`)

| Field | Required | Type | Description |
| ----- | -------- | ---- | ----------- |
| `schemaVersion` | yes | integer `1` | Matches request and path `v1` |
| `batchId` | yes | UUID | Echo of request `batchId` |
| `results` | yes | array | One result per request event, same order |

#### Event result object

| Field | Required | Type | Description |
| ----- | -------- | ---- | ----------- |
| `clientEventId` | yes | `sha256:` digest | Echo of request event |
| `outcome` | yes | enum | `accepted`, `duplicate`, `needs_review`, or `rejected` |
| `code` | yes | string | Stable outcome or rejection code |
| `serverEventId` | conditional | UUID | Present for `accepted` and `duplicate` |

### Error failure (`HTTP 4xx`, `429`, `5xx`)

| Field | Required | Type | Description |
| ----- | -------- | ---- | ----------- |
| `error.code` | yes | string | Stable machine code |
| `error.message` | yes | string | Short human-readable summary (no secrets) |
| `error.retryable` | no | boolean | Hint for clients; defaults by code table above |

---

## Document map

| Section | WP |
| ------- | -- |
| Endpoint and authentication | WP1 + WP3 |
| Deterministic IDs | WP1 |
| Batch idempotency boundaries | WP1 + WP3 |
| GUID-first identity | WP1 |
| Season and dungeon resolution | WP1 |
| Privacy and redaction | WP1 |
| Request payloads | WP2 |
| Acknowledgement semantics | WP3 |
| Limits | WP3 |
| Version matching | WP3 |
| Error taxonomy | WP3 |
| Response payloads | WP3 |
| Server behavior after ingest (classification, corrections, adjustment ledger) | WP4 — [ADR index](../../../docs/adr/README.md) |

See [`README.md`](./README.md) for ownership, versioning, and compatibility.
