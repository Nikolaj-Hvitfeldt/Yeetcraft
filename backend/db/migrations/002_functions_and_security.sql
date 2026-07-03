-- Database helpers and backend-only security hardening.
-- Applied to Supabase via migration; kept here as source of truth.

create or replace function set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_player_dungeon_stats_updated_at on player_dungeon_stats;

create trigger set_player_dungeon_stats_updated_at
before update on player_dungeon_stats
for each row
execute function set_updated_at();

create or replace function increment_player_dungeon_stats(
  target_player_id uuid,
  target_season_id uuid,
  target_dungeon_id uuid,
  deaths_delta int default 0,
  yeets_delta int default 0
)
returns void
language plpgsql
set search_path = public
as $$
begin
  insert into player_dungeon_stats (
    player_id,
    season_id,
    dungeon_id,
    deaths,
    yeets
  )
  values (
    target_player_id,
    target_season_id,
    target_dungeon_id,
    deaths_delta,
    yeets_delta
  )
  on conflict (player_id, season_id, dungeon_id)
  do update set
    deaths = player_dungeon_stats.deaths + excluded.deaths,
    yeets = player_dungeon_stats.yeets + excluded.yeets;
end;
$$;

create or replace function set_current_season(target_season_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from seasons where id = target_season_id) then
    raise exception 'Season % does not exist', target_season_id;
  end if;

  update seasons set is_current = false where is_current = true;

  update seasons
  set is_current = true
  where id = target_season_id;
end;
$$;

-- Backend-only access: Go connects as postgres (bypasses RLS).
-- Block anon/authenticated from calling privileged RPCs via PostgREST.
revoke execute on function set_current_season(uuid) from public, anon, authenticated;
revoke execute on function increment_player_dungeon_stats(uuid, uuid, uuid, int, int) from public, anon, authenticated;
