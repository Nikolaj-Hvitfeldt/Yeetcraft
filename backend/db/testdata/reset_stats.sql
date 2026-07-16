-- Restore seeded mutable stats to the known baseline. Idempotent; no truncates.

update player_dungeon_stats
set deaths = 3, yeets = 1, updated_at = now()
where player_id = 'eeee0002-0000-4000-8000-000000000001'::uuid
  and season_id = 'eeee0001-0000-4000-8000-000000000001'::uuid
  and dungeon_id = 'eeee0003-0000-4000-8000-000000000001'::uuid;

update player_dungeon_stats
set deaths = 0, yeets = 2, updated_at = now()
where player_id = 'eeee0002-0000-4000-8000-000000000001'::uuid
  and season_id = 'eeee0001-0000-4000-8000-000000000001'::uuid
  and dungeon_id = 'eeee0003-0000-4000-8000-000000000002'::uuid;

update player_dungeon_stats
set deaths = 1, yeets = 0, updated_at = now()
where player_id = 'eeee0002-0000-4000-8000-000000000002'::uuid
  and season_id = 'eeee0001-0000-4000-8000-000000000001'::uuid
  and dungeon_id = 'eeee0003-0000-4000-8000-000000000001'::uuid;

update player_dungeon_stats
set deaths = 2, yeets = 3, updated_at = now()
where player_id = 'eeee0002-0000-4000-8000-000000000002'::uuid
  and season_id = 'eeee0001-0000-4000-8000-000000000001'::uuid
  and dungeon_id = 'eeee0003-0000-4000-8000-000000000002'::uuid;

update player_dungeon_stats
set deaths = 5, yeets = 0, updated_at = now()
where player_id = 'eeee0002-0000-4000-8000-000000000003'::uuid
  and season_id = 'eeee0001-0000-4000-8000-000000000001'::uuid
  and dungeon_id = 'eeee0003-0000-4000-8000-000000000001'::uuid;

update player_dungeon_stats
set deaths = 0, yeets = 1, updated_at = now()
where player_id = 'eeee0002-0000-4000-8000-000000000003'::uuid
  and season_id = 'eeee0001-0000-4000-8000-000000000001'::uuid
  and dungeon_id = 'eeee0003-0000-4000-8000-000000000002'::uuid;

update player_dungeon_stats
set deaths = 0, yeets = 0, updated_at = now()
where player_id = 'eeee0002-0000-4000-8000-000000000004'::uuid
  and season_id = 'eeee0001-0000-4000-8000-000000000001'::uuid
  and dungeon_id = 'eeee0003-0000-4000-8000-000000000001'::uuid;

update player_dungeon_stats
set deaths = 1, yeets = 1, updated_at = now()
where player_id = 'eeee0002-0000-4000-8000-000000000004'::uuid
  and season_id = 'eeee0001-0000-4000-8000-000000000001'::uuid
  and dungeon_id = 'eeee0003-0000-4000-8000-000000000002'::uuid;
