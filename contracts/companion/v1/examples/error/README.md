# Synthetic error examples (WP3)

Schema-valid error envelopes for
[`error.schema.json`](../../schema/error.schema.json). One fixture per stable
WP3 envelope error code.

| File | HTTP | Code |
| ---- | ---- | ---- |
| [`invalid-json.txt`](./invalid-json.txt) | 400 | `invalid_json` |
| [`missing-api-key.json`](./missing-api-key.json) | 401 | `missing_api_key` |
| [`invalid-api-key.json`](./invalid-api-key.json) | 401 | `invalid_api_key` |
| [`batch-conflict.json`](./batch-conflict.json) | 409 | `batch_conflict` |
| [`event-id-conflict.json`](./event-id-conflict.json) | 409 | `event_id_conflict` |
| [`payload-too-large.json`](./payload-too-large.json) | 413 | `payload_too_large` |
| [`unsupported-media-type.json`](./unsupported-media-type.json) | 415 | `unsupported_media_type` |
| [`unsupported-content-encoding.json`](./unsupported-content-encoding.json) | 415 | `unsupported_content_encoding` |
| [`schema-validation-failed.json`](./schema-validation-failed.json) | 422 | `schema_validation_failed` |
| [`schema-version-mismatch.json`](./schema-version-mismatch.json) | 422 | `schema_version_mismatch` |
| [`empty-events.json`](./empty-events.json) | 422 | `empty_events` |
| [`batch-size-exceeded.json`](./batch-size-exceeded.json) | 422 | `batch_size_exceeded` |
| [`json-depth-exceeded.json`](./json-depth-exceeded.json) | 422 | `json_depth_exceeded` |
| [`trailing-json-not-allowed.json`](./trailing-json-not-allowed.json) | 422 | `trailing_json_not_allowed` |
| [`invalid-batch-id.json`](./invalid-batch-id.json) | 422 | `invalid_batch_id` |
| [`rate-limit-exceeded.json`](./rate-limit-exceeded.json) | 429 | `rate_limit_exceeded` |
| [`companion-api-unconfigured.json`](./companion-api-unconfigured.json) | 503 | `companion_api_unconfigured` |
| [`ingest-temporarily-unavailable.json`](./ingest-temporarily-unavailable.json) | 503 | `ingest_temporarily_unavailable` |

`invalid_json` is intentionally **not** JSON; implementations must reject the
bytes in [`invalid-json.txt`](./invalid-json.txt) before schema validation.

Additional envelope triggers without JSON fixtures (verify in implementation):

| Case | Code |
| ---- | ---- |
| Malformed JSON with trailing document | `trailing_json_not_allowed` (distinct from `invalid_json` when parse partially succeeds) |

Validate JSON fixtures with [`scripts/validate-wp3.ps1`](../../scripts/validate-wp3.ps1).
