# Synthetic response examples (WP3)

Schema-valid HTTP **200** batch payloads for
[`ingest-batch-response.schema.json`](../../schema/ingest-batch-response.schema.json).
No status banners or non-contract fields.

| File | Scenario | Corresponding request |
| ---- | -------- | --------------------- |
| [`all-accepted.json`](./all-accepted.json) | Two events accepted | [`request/repeated-death-after-resurrection.json`](../request/repeated-death-after-resurrection.json) |
| [`mixed-duplicate-needs-review.json`](./mixed-duplicate-needs-review.json) | Accepted, duplicate, and `unknown_character` in one batch | Synthetic three-event batch (documented inline in CONTRACT.md) |
| [`unknown-character.json`](./unknown-character.json) | Single `needs_review` outcome | [`request/boss-context-death.json`](../request/boss-context-death.json) |
| [`unsupported-version.json`](./unsupported-version.json) | **422** error envelope (validates against [`error.schema.json`](../../schema/error.schema.json)) | Request with `schemaVersion` ≠ 1 |

Envelope error fixtures:
[`../error/`](../error/).

Validate with [`scripts/validate-wp3.ps1`](../../scripts/validate-wp3.ps1).
