# Architecture decision records

> **Status: Draft — reviewed, not implemented**

Yeetcraft ADRs record **planned** server behavior that is specified during
Phase 1 contract work but **not implemented** in handlers, migrations, or the
frontend until later phases.

Each ADR distinguishes:

- **Verified current behavior** — what the repository implements today.
- **Planned behavior** — what Phase 3+ must implement before companion event
  writes are enabled.

Companion v1 remains **ingest-only**. Classification, corrections, and
aggregate reconciliation are Yeetcraft-internal concerns documented here, not
part of the companion wire contract.

| ADR | Topic | Companion wire impact |
| --- | ----- | --------------------- |
| [001](./001-post-ingest-classification-and-corrections.md) | Website-owned `death` / `yeet` / `ignored` classification and correction transitions | None — ingest assigns default `category = death` only |
| [002](./002-revision-protected-adjustment-ledger.md) | Derived `player_dungeon_stats`, legacy baseline, manual adjustments, `expectedRevision` on `PATCH /api/stats/batch` | None — companion does not call aggregate PATCH |

## Related documentation

| Document | Role |
| -------- | ---- |
| [`../ARCHITECTURE.md`](../ARCHITECTURE.md) | Verified system context |
| [`../API.md`](../API.md) | Verified implemented routes |
| [`../OFFLINE.md`](../OFFLINE.md) | Browser outbox for aggregate PATCH |
| [`../CHARACTERS_AND_BOSS_NEMESIS.md`](../CHARACTERS_AND_BOSS_NEMESIS.md) | Character slice prerequisites |
| [`../../contracts/companion/v1/CONTRACT.md`](../../contracts/companion/v1/CONTRACT.md) | Canonical companion ingest contract (WP1–WP3) |
| [`../../contracts/companion/v1/IMPLEMENTATION_MAP.md`](../../contracts/companion/v1/IMPLEMENTATION_MAP.md) | WP5 Yeetcraft Phase 3 file map |

Phase 2/3 implementation file paths: [`../../contracts/companion/v1/IMPLEMENTATION_MAP.md`](../../contracts/companion/v1/IMPLEMENTATION_MAP.md) (Yeetcraft Phase 3). Companion Phase 2 is mapped in the sibling repository at `yeetcraft-companion/docs/PHASE_2_FILE_MAP.md`.
