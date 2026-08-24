# Agent instructions — Yeetcraft

Operational guide for AI coding assistants working in this repository.

## Repository boundaries

- **This repository** owns the Yeetcraft website, Go API, PostgreSQL schema,
  authentication, and canonical companion API contract.
- **Write scope:** only files under `Yeetcraft/` unless the user explicitly
  authorizes cross-repository work.
- The sibling `yeetcraft-companion` repository is a separate product and Git
  history. It is read-only reference during Yeetcraft-only tasks.
- Never create cross-repository Go imports or runtime filesystem dependencies.
- Integration with the companion must use a versioned HTTP API.
- Run Git, Go, npm, and database commands from the repository they apply to.
- Inspect `git status` before editing and preserve unrelated user changes.
- Never commit or push unless the user explicitly requests it.

## Architecture

```text
frontend/   React 18 + TypeScript + Vite PWA
backend/    Go 1.25 + chi + pgx API
             ↓
           PostgreSQL (typically Supabase)
```

- Browser code calls the Go API; it never accesses Supabase/PostgreSQL
  directly.
- Public reads use `GET /api/*`.
- Writes use the existing API-key middleware and currently flow through
  `PATCH /api/stats/batch`.
- Missing/empty server `API_KEY` must fail closed with **503** on mutations.
- Write auth accepts `X-API-Key` or `Authorization: Bearer`.
- `?token=` is browser unlock UX only; API routes do not accept query-token
  authentication.
- The frontend write path is offline-aware and uses the outbox. Do not bypass
  it for browser mutations.

Read [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md),
[`docs/API.md`](docs/API.md), and [`docs/OFFLINE.md`](docs/OFFLINE.md) before
changing system boundaries.

## Backend conventions

- Use idiomatic Go and the existing chi router; do not migrate to `ServeMux`
  without an explicit task.
- Keep handlers thin: decode, validate, call a repository, and map errors/JSON.
- Put SQL, joins, aggregation, and transaction behavior in
  `backend/internal/repository`.
- Use pgx through the existing database layer.
- Validate untrusted route, query, and JSON input before repository calls.
- Use the existing response/error helpers and proper HTTP status codes.
- Use middleware for auth, CORS, recovery, and other cross-cutting concerns.
- Avoid new dependencies unless there is a concrete need.
- Do not leave TODOs or placeholder implementations.

## Database conventions

- `backend/db/schema.sql` is the fresh-database schema source of truth.
- Keep additive migrations under `backend/db/migrations/` aligned with
  `schema.sql`.
- Preserve foreign keys, non-negative checks, deterministic ordering, and
  current-season invariants.
- Test tooling must only target databases whose name contains `_test` and must
  require `YEETCRAFT_TEST_MODE=1`.
- Never run migrations, resets, seeds, or ad hoc SQL against hosted development
  or production databases without explicit authorization.
- Never embed environment-specific UUIDs, credentials, or private character
  GUIDs in committed migrations or fixtures.

## Frontend conventions

- Use TypeScript, React, Vite, React Router, TanStack Query, Tailwind, and Zod.
- Use functional, declarative components and named exports.
- Follow existing feature/component folders and hook/query patterns.
- Validate API responses with schemas in `frontend/src/api/schemas.ts`.
- Public reads go through the existing `fetchApi` client.
- Writes use the outbox-aware mutation path and `X-API-Key`; do not introduce a
  parallel mutation client.
- Keep server state in TanStack Query and preserve persisted/offline behavior.
- Prefer shared utilities over duplicated slug, formatting, or lookup logic.
- Preserve accessibility, responsive behavior, and Daytime/Midnight theming.
- Do not introduce Next.js, GraphQL, or Supabase client database access unless
  explicitly requested.

## Companion contract ownership

- Yeetcraft owns the future canonical contract at
  `contracts/companion/v1/`.
- That path is **planned and may not exist yet**; inspect before describing it
  as implemented.
- Companion uploads require a separately approved, versioned, idempotent API.
- Do not reuse `PATCH /api/stats/batch` as an event-ingest endpoint.
- Do not implement companion-owned parsing, local SQLite, log watching, or
  desktop UI in this repository.
- Coordinate contract changes explicitly as separate changes in each
  repository.

## Privacy and security

- Never commit `.env` files, credentials, tokens, database URLs, personal data,
  raw combat logs, private character GUIDs, diagnostics, or build output.
- Fixtures must be synthetic, minimal, and anonymized.
- Do not include secrets in examples, logs, test output, or error responses.
- Treat API payloads and companion-originated data as untrusted input.
- Do not automatically create public players or characters from unknown combat
  log identities.

## Testing expectations

Use the smallest relevant checks while developing, then validate in proportion
to risk. Full commands are in [`docs/TESTING.md`](docs/TESTING.md).

```powershell
# Backend
cd backend
gofmt -w <changed-go-files>
go test ./...
go vet ./...

# Frontend
cd frontend
npm run lint
npm test
npm run build
```

- Add handler tests for status codes, validation, and JSON behavior.
- Add repository integration tests for meaningful SQL/schema changes.
- Add frontend regression tests for changed UI, hooks, or API schemas.
- Test failure and empty states, not only happy paths.
- Integration and E2E tests must use guarded `_test` databases and non-
  production credentials.
- Report checks that could not be run.

## Documentation

- Update README or `docs/` when architecture, API contracts, schema, setup,
  security behavior, or user-visible features change.
- Distinguish verified behavior, proposed design, assumptions, and open
  questions.
- Do not document planned routes, tables, or contracts as already implemented.
- For current character and future Nemesis Boss work, read
  [`docs/CHARACTERS_AND_BOSS_NEMESIS.md`](docs/CHARACTERS_AND_BOSS_NEMESIS.md).

## Definition of done

Before marking a task complete:

1. Relevant code compiles and tests pass.
2. Validation and expected failure states are covered.
3. Existing auth, offline writes, API compatibility, and database invariants
   remain intact unless the task explicitly changes them.
4. Material architecture/API/schema decisions are documented.
5. No secrets, private logs/GUIDs, databases, or generated artifacts are
   included.
6. Confirm only authorized repositories and files were modified.
7. Report changed files, validation performed, and remaining risks or open
   questions.

