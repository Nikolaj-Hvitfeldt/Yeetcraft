# Invalid request fixtures (WP2)

Synthetic negative cases for companion v1 ingest request validation. These
files are **not** valid wire payloads.

## Schema-invalid (structural)

Validated with `ajv test --invalid` against
[`../../schema/ingest-batch-request.schema.json`](../../schema/ingest-batch-request.schema.json).

| File | Expected failure |
| ---- | ---------------- |
| [`category-yeet.json`](./category-yeet.json) | `category` const violation → `category_not_allowed` |
| [`extra-envelope-field.json`](./extra-envelope-field.json) | Unknown envelope property (`additionalProperties`) |
| [`spell-without-spell-id.json`](./spell-without-spell-id.json) | Missing required `spellId` for `sourceType: spell` |
| [`invalid-instant-precision.json`](./invalid-instant-precision.json) | `deathInstant` pattern / `invalid_instant` |

## Schema-valid, semantically invalid

Pass JSON Schema; fail semantic checks in
[`CONTRACT.md`](../../CONTRACT.md#request-side-semantic-validation-codes).

| File | Semantic code |
| ---- | ------------- |
| [`cause-rank-gap.json`](./cause-rank-gap.json) | `cause_rank_non_contiguous` |
| [`client-run-id-hash-mismatch.json`](./client-run-id-hash-mismatch.json) | `invalid_client_run_id` |

Additional semantic-only cases (no fixture file; verify in implementation/tests):

| Case | Semantic code |
| ---- | ------------- |
| Recomputed `clientEventId` does not match event fields | `invalid_client_event_id` |
| `deathInstant` before `challengeModeStartInstant` | `death_before_run_start` |
| More than three causes (if schema max bypassed) | `too_many_causes` |
| Duplicate cause ranks | `cause_rank_duplicate` |
| Empty `events` array | `empty_events` |

HTTP status mapping for envelope codes is in
[`CONTRACT.md`](../../CONTRACT.md#error-taxonomy). Per-event semantic codes map
to HTTP **200** `rejected` results.
