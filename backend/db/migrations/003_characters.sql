-- WoW character metadata (Phase 3 WP1).
-- Hosted backfill resolves players by display_name; missing names insert 0 rows.

create table characters (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  name text not null,
  realm text,
  region text,
  class_key text,
  guid text unique,
  active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),

  unique (player_id, name)
);

create index characters_player_order_idx
on characters (player_id, display_order, name);

insert into characters (player_id, name, class_key, display_order)
select p.id, v.name, v.class_key, v.display_order
from players p
inner join (
  values
    ('Seb', 'MostDope', 'warlock', 0),
    ('Seb', 'Nudelkriger', 'priest', 1),
    ('Martin', 'Zorker', 'priest', 0),
    ('Martin', 'Rauw', 'shaman', 1),
    ('Niklas', 'Ungeork', 'hunter', 0),
    ('Niko', 'Freecry', 'demonhunter', 0),
    ('Niko', 'LouiLoui', 'evoker', 1)
) as v(player_name, name, class_key, display_order)
  on p.display_name = v.player_name;
