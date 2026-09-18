# Companion API contract v1

> **Status: Draft — reviewed, not implemented**

Yeetcraft owns the canonical companion ingest contract. This directory is the
single source of truth. The sibling `yeetcraft-companion` repository may hold
review notes and mechanically verified derived fixtures later; it must never
become an alternate contract editor.

## Ownership

| Item | Owner |
| ---- | ----- |
| Normative Markdown (`README.md`, `CONTRACT.md`) | Yeetcraft |
| JSON Schema and synthetic examples | Yeetcraft (`schema/`, `examples/` — request WP2; response WP3) |
| Parser, detection, local persistence, upload client | `yeetcraft-companion` |
| Ingest route, PostgreSQL event tables, aggregate reconciliation | Yeetcraft backend (Phase 3+) |

Cross-repository changes require separate branches, validation, and commits per
repository.

## Current status

Phase 1 work packages **WP1**, **WP2**, and **WP3** (this directory) define:

**WP1 — vocabulary and semantics**

- endpoint and authentication surface;
- deterministic run and event ID recipes;
- batch idempotency boundaries;
- GUID-first identity and client-side tracked filtering;
- timestamp-based season and dungeon resolution with validated per-run season
  hints;
- privacy and cause redaction rules.

**WP2 — request payloads**

- normative run, encounter, death, ranked-cause, and server-default
  classification fields in [`CONTRACT.md`](./CONTRACT.md#request-payloads);
- [`schema/ingest-batch-request.schema.json`](./schema/ingest-batch-request.schema.json);
- synthetic request examples under [`examples/request/`](./examples/request/);
- request-side semantic validation codes.

**WP3 — acknowledgement semantics**

- whole-envelope versus per-event outcomes in
  [`CONTRACT.md`](./CONTRACT.md#acknowledgement-semantics);
- limits, version matching, auth boundaries, and error taxonomy;
- [`schema/ingest-batch-response.schema.json`](./schema/ingest-batch-response.schema.json);
- [`schema/error.schema.json`](./schema/error.schema.json);
- synthetic response examples under [`examples/response/`](./examples/response/);
- envelope error fixtures under [`examples/error/`](./examples/error/).

Yeetcraft-internal correction and adjustment-ledger behavior is **deferred to
WP4**.

No route, migration, handler, or upload client implements this contract yet.
Do not describe `POST /api/companion/v1/deaths/batch` or related tables as
shipping behavior until Phase 3 completes.

## Versioning

- **Contract version:** `v1` (directory name and planned URL path segment).
- **Wire `schemaVersion`:** integer `1` on ingest requests; must agree with
  endpoint `v1` (see [`CONTRACT.md`](./CONTRACT.md#version-matching)).
- **Classification locus:** authoritative `death` / `yeet` / `ignored`
  classification happens on the Yeetcraft website **post-ingest**. Companion
  v1 is **ingest-only**; correction transitions are Yeetcraft-internal and are
  not part of the companion wire contract (specified in WP4).

### Compatibility window

- The server accepts only `schemaVersion: 1` on `/api/companion/v1/*` until a
  future contract version is published under a new path (for example
  `/api/companion/v2/*`).
- Clients must treat unsupported `schemaVersion` or HTTP `415` / `422` responses
  as non-retryable configuration errors until upgraded (see
  [`CONTRACT.md`](./CONTRACT.md#retry-guidance)).
- Breaking semantic changes require a new major contract directory and path;
  within `v1`, additive optional fields may be introduced only through an
  explicit contract amendment and schema revision.

## Sequencing dependencies

Companion v1 ingest **cannot be implemented** until the Yeetcraft character
slice lands:

- nullable, **unique** `characters.guid` in PostgreSQL (see
  [`docs/CHARACTERS_AND_BOSS_NEMESIS.md`](../../../docs/CHARACTERS_AND_BOSS_NEMESIS.md)).

Phase 3 schema work also requires (not part of WP1 implementation):

- non-overlapping `seasons.starts_at` / `seasons.ends_at` bounds;
- nullable unique `dungeons.challenge_map_id` for challenge `MapID` resolution.

Record these as blockers in contract review; do not document them as already
migrated.

## Privacy rules

- **No raw combat logs** on the wire. Upload structured, minimal event facts
  only.
- **No credentials** in URLs, bodies, or error messages. Never log API keys.
- **Client-side tracked filter:** untracked party members are removed before
  upload. Their names, realms, and GUIDs must not appear in ingest payloads.
- **Cause evidence** must not contain player names, realms, or untracked
  player/pet-owner GUIDs. Prefer source kind, creature/game IDs, spell IDs,
  amount/overkill, rank, and confidence. Unknown player-origin cause identity
  is redacted locally before upload.
- **Tracked `characterGuid`** is the only character identity field on v1
  requests. Names and realms are not authoritative wire identity.
- **`installationId`** is optional diagnostics metadata only. It is excluded
  from deterministic ID recipes and is not an authorization principal.
- Examples, fixtures, and committed documentation must use synthetic identities
  only — no real GUIDs, names, realms, credentials, URLs, or log excerpts.

Retention policies for tracked GUIDs, installation IDs, timestamps,
diagnostics, and server-side error messages are defined in
[`CONTRACT.md`](./CONTRACT.md#privacy-and-redaction).

## Related documentation

| Document | Role |
| -------- | ---- |
| [`CONTRACT.md`](./CONTRACT.md) | Normative specification (WP1–WP3) |
| [`schema/ingest-batch-request.schema.json`](./schema/ingest-batch-request.schema.json) | Request JSON Schema (WP2) |
| [`schema/ingest-batch-response.schema.json`](./schema/ingest-batch-response.schema.json) | Response JSON Schema (WP3) |
| [`schema/error.schema.json`](./schema/error.schema.json) | Error envelope JSON Schema (WP3) |
| [`examples/request/`](./examples/request/) | Synthetic request fixtures (WP2) |
| [`examples/response/`](./examples/response/) | Synthetic response fixtures (WP3) |
| [`examples/error/`](./examples/error/) | Envelope error fixtures (WP3) |
| [`scripts/validate-wp2.ps1`](./scripts/validate-wp2.ps1) | Pinned request validation (WP2) |
| [`scripts/validate-wp3.ps1`](./scripts/validate-wp3.ps1) | Pinned full contract validation (WP3) |
| [`../../../docs/API.md`](../../../docs/API.md) | Current implemented web API (not companion ingest) |
| [`../../../docs/ARCHITECTURE.md`](../../../docs/ARCHITECTURE.md) | System context |
| [`../../../docs/CHARACTERS_AND_BOSS_NEMESIS.md`](../../../docs/CHARACTERS_AND_BOSS_NEMESIS.md) | Character slice and Nemesis Boss prerequisites |

Companion-side producer review:
`yeetcraft-companion/docs/CONTRACT_V1_WP1_REVIEW.md` (review notes only).
