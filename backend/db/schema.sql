create extension if not exists pgcrypto;

create table seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  expansion text,
  is_current boolean not null default false,
  created_at timestamptz not null default now()
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

create table dungeons (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  short_name text,
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