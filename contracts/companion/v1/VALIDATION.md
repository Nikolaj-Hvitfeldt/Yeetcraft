# Companion v1 contract validation (Phase 1 Validate)

> **Status: Draft — reviewed, not implemented**

Machine checks for this directory. They do **not** implement the ingest API.

## Pinned validator

| Tool | Version | How |
| ---- | ------- | --- |
| `ajv-cli` | **5.0.0** | `npx --yes ajv-cli@5.0.0` (no repo `package.json` / Go module dependency) |
| `ajv` (transitive) | **8.17.1** (bundled with `ajv-cli@5.0.0`) | Draft 2020-12 via `--spec=draft2020` |

Gate: [`scripts/validate-contract.ps1`](./scripts/validate-contract.ps1).

WP2/WP3 subset scripts remain for incremental checks:
[`scripts/validate-wp2.ps1`](./scripts/validate-wp2.ps1),
[`scripts/validate-wp3.ps1`](./scripts/validate-wp3.ps1).

## What the gate covers

1. JSON parse of every schema and `.json` example (except documented non-JSON).
2. JSON Schema **draft 2020-12** compile of every schema.
3. Positive request examples vs `ingest-batch-request.schema.json`.
4. HTTP 200 response examples vs `ingest-batch-response.schema.json`.
5. Error envelopes (including `examples/response/unsupported-version.json`) vs `error.schema.json`.
6. Schema-invalid request fixtures rejected by Ajv.
7. Semantic-only request fixtures accepted by Ajv and reviewed for hash / rank / instant rules.
   Positive requests also assert `environmentalType` is **1–64 UTF-8 bytes** (schema
   `maxLength` is a code-point guard; byte length is enforced in the gate script).
8. Every `error.schema.json` enum code has an `examples/error/` fixture (`invalid_json` is `.txt`).
9. Relative Markdown links in this directory and `docs/adr/`.
10. No non-contract banner fields on wire examples.
11. SHA-256 checksums of canonical schemas and examples in [`CHECKSUMS.sha256`](./CHECKSUMS.sha256).

## Deferred to Phase 2 / Phase 3 CI

These are **not** Phase 1 Validate gates:

- GitHub Actions / CI workflow that runs `validate-contract.ps1` on every PR.
- Companion `go test` asserting derived copies under `testdata/contract/v1/` against [`CHECKSUMS.sha256`](./CHECKSUMS.sha256) (drift harness).
- Yeetcraft handler, repository, or frontend suites for ingest (no runtime yet).
- Uploading, SQLite, Wails, watchers, migrations.

## Checksums

[`CHECKSUMS.sha256`](./CHECKSUMS.sha256) is the canonical recorded digest set.
Regenerate after intentional fixture/schema edits:

```powershell
powershell -NoProfile -File contracts/companion/v1/scripts/validate-contract.ps1 -WriteChecksums
```

Companion-side later tests must copy **derived** fixtures and record this file's
digests. They must not independently edit schemas or examples.
