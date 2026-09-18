# Synthetic response examples (WP3)

Schema-valid HTTP **200** batch payloads for
[`ingest-batch-response.schema.json`](../../schema/ingest-batch-response.schema.json)
unless noted. No status banners or non-contract fields.

| File | Scenario | Corresponding request |
| ---- | -------- | --------------------- |
| [`all-accepted.json`](./all-accepted.json) | Two events accepted | [`request/repeated-death-after-resurrection.json`](../request/repeated-death-after-resurrection.json) |
| [`mixed-duplicate-needs-review.json`](./mixed-duplicate-needs-review.json) | Accepted, duplicate, and `unknown_character` | [`request/mixed-duplicate-needs-review.json`](../request/mixed-duplicate-needs-review.json) |
| [`unknown-character.json`](./unknown-character.json) | Single `needs_review` / `unknown_character` | [`request/boss-context-death.json`](../request/boss-context-death.json) |
| [`unmapped-challenge-map.json`](./unmapped-challenge-map.json) | `needs_review` / `unmapped_challenge_map` | [`request/minimal-trash-death.json`](../request/minimal-trash-death.json) |
| [`season-needs-review.json`](./season-needs-review.json) | `needs_review` / `season_needs_review` | [`request/boss-context-death.json`](../request/boss-context-death.json) |
| [`rejected-death-before-run-start.json`](./rejected-death-before-run-start.json) | HTTP 200 `rejected` | [`request/invalid/death-before-run-start.json`](../request/invalid/death-before-run-start.json) |
| [`unsupported-version.json`](./unsupported-version.json) | **422** error envelope (validates against [`error.schema.json`](../../schema/error.schema.json)) | [`request/invalid/schema-version-mismatch.json`](../request/invalid/schema-version-mismatch.json) |

Envelope error fixtures:
[`../error/`](../error/).

Required scenario coverage: duplicate (`mixed-duplicate-needs-review.json`),
`batch_conflict` / `event_id_conflict` ([`../error/`](../error/)),
`needs_review` (unknown character, unmapped map, season),
unknown-character, unsupported-version.

Validate with [`scripts/validate-contract.ps1`](../../scripts/validate-contract.ps1).
