# Invalid request fixtures (WP2)

Synthetic negative cases for companion v1 ingest request validation. These
files are **not** valid accepted wire payloads.

## Schema-invalid (structural)

Validated with `ajv test --invalid` against
[`../../../schema/ingest-batch-request.schema.json`](../../../schema/ingest-batch-request.schema.json).

| File | Expected failure |
| ---- | ---------------- |
| [`category-yeet.json`](./category-yeet.json) | `category` const violation → `category_not_allowed` |
| [`extra-envelope-field.json`](./extra-envelope-field.json) | Unknown envelope property (`additionalProperties`) |
| [`spell-without-spell-id.json`](./spell-without-spell-id.json) | Missing required `spellId` for `sourceType: spell` → `cause_field_missing` |
| [`invalid-instant-precision.json`](./invalid-instant-precision.json) | `deathInstant` pattern / `invalid_instant` |
| [`empty-events.json`](./empty-events.json) | `minItems` / `empty_events` |
| [`invalid-batch-id.json`](./invalid-batch-id.json) | Uppercase UUID / `invalid_batch_id` |
| [`invalid-character-guid.json`](./invalid-character-guid.json) | Non-player GUID prefix / `invalid_character_guid` |
| [`invalid-ordinal.json`](./invalid-ordinal.json) | Negative `ordinal` / `invalid_ordinal` |
| [`invalid-encounter.json`](./invalid-encounter.json) | `encounterId` 0 / `invalid_encounter` |
| [`too-many-causes.json`](./too-many-causes.json) | Four causes / `too_many_causes` |
| [`extra-cause-field.json`](./extra-cause-field.json) | Forbidden cause property / `cause_forbidden_field` |
| [`schema-version-mismatch.json`](./schema-version-mismatch.json) | `schemaVersion` ≠ 1 / `schema_version_mismatch` |

## Schema-valid, semantically invalid

Pass JSON Schema; fail semantic checks in
[`CONTRACT.md`](../../../CONTRACT.md#request-side-semantic-validation-codes).

| File | Semantic code |
| ---- | ------------- |
| [`cause-rank-gap.json`](./cause-rank-gap.json) | `cause_rank_non_contiguous` |
| [`cause-rank-duplicate.json`](./cause-rank-duplicate.json) | `cause_rank_duplicate` |
| [`client-run-id-hash-mismatch.json`](./client-run-id-hash-mismatch.json) | `invalid_client_run_id` |
| [`client-event-id-hash-mismatch.json`](./client-event-id-hash-mismatch.json) | `invalid_client_event_id` |
| [`death-before-run-start.json`](./death-before-run-start.json) | `death_before_run_start` |

## Documented exceptions (no request body fixture)

These codes are covered by envelope examples and/or HTTP-layer checks. They are
not represented as committed oversized or dual-document request bodies.

| Case | Stable code | Coverage |
| ---- | ----------- | -------- |
| More than 500 events | `batch_size_exceeded` | [`error/batch-size-exceeded.json`](../../error/batch-size-exceeded.json) only; a 501-event JSON file is not committed |
| JSON nesting > 16 | `json_depth_exceeded` | [`error/json-depth-exceeded.json`](../../error/json-depth-exceeded.json) only |
| Bytes after first JSON value | `trailing_json_not_allowed` | [`error/trailing-json-not-allowed.json`](../../error/trailing-json-not-allowed.json); distinct from [`error/invalid-json.txt`](../../error/invalid-json.txt) |
| Decoded body > 1 MiB | `payload_too_large` | [`error/payload-too-large.json`](../../error/payload-too-large.json) only |
| Missing Mythic+ start (not a valid wire run object) | `run_context_incomplete` | Schema requires run hash inputs; companion holds locally and must not upload. No incomplete-run wire fixture |
| Ordinal inconsistent with a persisted scan (server/local state) | `invalid_ordinal` | Negative ordinal is schema-invalid above; prefix-incompleteness is Phase 2 persistence, not a static JSON fixture |

HTTP status mapping for envelope codes is in
[`CONTRACT.md`](../../../CONTRACT.md#error-taxonomy). Per-event semantic codes that
survive envelope validation map to HTTP **200** `rejected` results.

Validate with [`scripts/validate-contract.ps1`](../../../scripts/validate-contract.ps1).
