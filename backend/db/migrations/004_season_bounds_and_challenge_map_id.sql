-- Season timestamp bounds and challenge MapID lookup (Phase 3 schema, before ingest).
-- Additive only: do not backfill hosted season dates.

create extension if not exists btree_gist;

alter table seasons
  add column starts_at timestamptz,
  add column ends_at timestamptz;

alter table seasons
  add constraint seasons_bounds_both_or_neither_chk check (
    (starts_at is null and ends_at is null)
    or (starts_at is not null and ends_at is not null and starts_at < ends_at)
  );

alter table seasons
  add constraint seasons_bounds_non_overlapping exclude using gist (
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (starts_at is not null and ends_at is not null);

alter table dungeons
  add column challenge_map_id integer unique;
