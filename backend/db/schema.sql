create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create table seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  expansion text,
  -- Website current-season flag only; never ingest authority.
  is_current boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),

  constraint seasons_bounds_both_or_neither_chk check (
    (starts_at is null and ends_at is null)
    or (starts_at is not null and ends_at is not null and starts_at < ends_at)
  ),
  constraint seasons_bounds_non_overlapping exclude using gist (
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (starts_at is not null and ends_at is not null)
);

create unique index one_current_season
on seasons (is_current)
where is_current = true;

create table players (
  id uuid primary key default gen_random_uuid(),
  display_name text not null unique,
  avatar_url text,
  created_at timestamptz not null default now()
);

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

create table dungeons (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  short_name text,
  challenge_map_id integer unique,
  created_at timestamptz not null default now()
);

create table season_dungeons (
  season_id uuid not null references seasons(id) on delete cascade,
  dungeon_id uuid not null references dungeons(id) on delete cascade,
  display_order int not null default 0,

  primary key (season_id, dungeon_id)
);

create table player_dungeon_stats (
  player_id uuid not null references players(id) on delete cascade,
  season_id uuid not null,
  dungeon_id uuid not null,

  deaths int not null default 0 check (deaths >= 0),
  yeets int not null default 0 check (yeets >= 0),

  updated_at timestamptz not null default now(),

  primary key (player_id, season_id, dungeon_id),
  foreign key (season_id, dungeon_id)
    references season_dungeons(season_id, dungeon_id)
    on delete cascade
);

create index player_dungeon_stats_season_idx
on player_dungeon_stats (season_id);

create index player_dungeon_stats_player_season_idx
on player_dungeon_stats (player_id, season_id);

create index season_dungeons_season_order_idx
on season_dungeons (season_id, display_order);