-- Yeetcraft schema: players, characters, dungeons, mistakes.
-- Apply once (e.g. run in Supabase SQL editor). No migration from previous schema.

-- Players (one per human)
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Characters (alts per player)
CREATE TABLE IF NOT EXISTS characters (
    id SERIAL PRIMARY KEY,
    player_id INT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (player_id, name)
);

CREATE INDEX IF NOT EXISTS idx_characters_player_id ON characters(player_id);

-- Dungeons
CREATE TABLE IF NOT EXISTS dungeons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    expansion VARCHAR(50)
);

-- Mistakes (polymorphic by type: death, yeet; player derived via character)
CREATE TABLE IF NOT EXISTS mistakes (
    id SERIAL PRIMARY KEY,
    character_id INT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    dungeon_id INT NOT NULL REFERENCES dungeons(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('death', 'yeet')),
    description TEXT,
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mistakes_character_id ON mistakes(character_id);
CREATE INDEX IF NOT EXISTS idx_mistakes_dungeon_id ON mistakes(dungeon_id);
CREATE INDEX IF NOT EXISTS idx_mistakes_type ON mistakes(type);
CREATE INDEX IF NOT EXISTS idx_mistakes_timestamp ON mistakes(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_mistakes_character_dungeon ON mistakes(character_id, dungeon_id);

