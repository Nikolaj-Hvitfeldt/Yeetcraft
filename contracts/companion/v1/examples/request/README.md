# Synthetic request examples (WP2)

Schema-valid wire payloads for
[`ingest-batch-request.schema.json`](../../schema/ingest-batch-request.schema.json).
No status banners or non-contract fields.

| File | Scenario |
| ---- | -------- |
| [`minimal-trash-death.json`](./minimal-trash-death.json) | Single trash death, `encounter: null`, environmental cause |
| [`boss-context-death.json`](./boss-context-death.json) | Boss encounter with ranked spell/range causes and optional `seasonId` hint |
| [`repeated-death-after-resurrection.json`](./repeated-death-after-resurrection.json) | Two deaths for the same character in one batch after resurrection |

Negative fixtures:
[`invalid/`](./invalid/).

Validate with
[`scripts/validate-wp2.ps1`](../../scripts/validate-wp2.ps1).
