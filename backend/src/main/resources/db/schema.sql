-- Example database schema for mistakes table.
-- This is optional - currently the app uses mock data.
-- To use real database, uncomment the SQL in MistakeRepository.kt and run this schema.

-- TODO: Run this in your Supabase SQL editor to create the mistakes table

CREATE TABLE IF NOT EXISTS mistakes (
    id SERIAL PRIMARY KEY,
    player_name VARCHAR(50) NOT NULL,
    dungeon VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('wipe', 'death', 'yeet')),
    description TEXT NOT NULL,
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mistakes_player_name ON mistakes(player_name);
CREATE INDEX IF NOT EXISTS idx_mistakes_dungeon ON mistakes(dungeon);
CREATE INDEX IF NOT EXISTS idx_mistakes_type ON mistakes(type);
CREATE INDEX IF NOT EXISTS idx_mistakes_timestamp ON mistakes(timestamp DESC);

-- TODO: Add more tables as needed:
-- - players (for player profiles)
-- - dungeons (for dungeon metadata)
-- - statistics (for aggregated stats)
