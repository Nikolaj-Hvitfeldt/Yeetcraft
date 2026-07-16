-- Deterministic Yeetcraft test fixtures. Safe to re-run (upserts only).

-- Season: eeee0001-0000-4000-8000-000000000001
update seasons
set is_current = false
where is_current = true
  and id <> 'eeee0001-0000-4000-8000-000000000001'::uuid;

insert into seasons (id, name, expansion, is_current)
values (
  'eeee0001-0000-4000-8000-000000000001',
  'E2E Test Season',
  'Test',
  true
)
on conflict (id) do update set
  name = excluded.name,
  expansion = excluded.expansion,
  is_current = excluded.is_current;

-- Players
insert into players (id, display_name, avatar_url)
values
  ('eeee0002-0000-4000-8000-000000000001', 'Seb', null),
  ('eeee0002-0000-4000-8000-000000000002', 'Martin', null),
  ('eeee0002-0000-4000-8000-000000000003', 'Niklas', null),
  ('eeee0002-0000-4000-8000-000000000004', 'Niko', null)
on conflict (id) do update set
  display_name = excluded.display_name;

-- Dungeons
insert into dungeons (id, name, short_name)
values
  ('eeee0003-0000-4000-8000-000000000001', 'Test Dungeon Alpha', 'Alpha'),
  ('eeee0003-0000-4000-8000-000000000002', 'Test Dungeon Beta', 'Beta')
on conflict (id) do update set
  name = excluded.name,
  short_name = excluded.short_name;

-- Season dungeons
insert into season_dungeons (season_id, dungeon_id, display_order)
values
  ('eeee0001-0000-4000-8000-000000000001', 'eeee0003-0000-4000-8000-000000000001', 1),
  ('eeee0001-0000-4000-8000-000000000001', 'eeee0003-0000-4000-8000-000000000002', 2)
on conflict (season_id, dungeon_id) do update set
  display_order = excluded.display_order;

-- Baseline player dungeon stats
insert into player_dungeon_stats (player_id, season_id, dungeon_id, deaths, yeets)
values
  ('eeee0002-0000-4000-8000-000000000001', 'eeee0001-0000-4000-8000-000000000001', 'eeee0003-0000-4000-8000-000000000001', 3, 1),
  ('eeee0002-0000-4000-8000-000000000001', 'eeee0001-0000-4000-8000-000000000001', 'eeee0003-0000-4000-8000-000000000002', 0, 2),
  ('eeee0002-0000-4000-8000-000000000002', 'eeee0001-0000-4000-8000-000000000001', 'eeee0003-0000-4000-8000-000000000001', 1, 0),
  ('eeee0002-0000-4000-8000-000000000002', 'eeee0001-0000-4000-8000-000000000001', 'eeee0003-0000-4000-8000-000000000002', 2, 3),
  ('eeee0002-0000-4000-8000-000000000003', 'eeee0001-0000-4000-8000-000000000001', 'eeee0003-0000-4000-8000-000000000001', 5, 0),
  ('eeee0002-0000-4000-8000-000000000003', 'eeee0001-0000-4000-8000-000000000001', 'eeee0003-0000-4000-8000-000000000002', 0, 1),
  ('eeee0002-0000-4000-8000-000000000004', 'eeee0001-0000-4000-8000-000000000001', 'eeee0003-0000-4000-8000-000000000001', 0, 0),
  ('eeee0002-0000-4000-8000-000000000004', 'eeee0001-0000-4000-8000-000000000001', 'eeee0003-0000-4000-8000-000000000002', 1, 1)
on conflict (player_id, season_id, dungeon_id) do update set
  deaths = excluded.deaths,
  yeets = excluded.yeets,
  updated_at = now();
