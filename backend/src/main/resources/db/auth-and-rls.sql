-- Run after schema.sql. Adds auth link and RLS for Supabase.
-- Execute in Supabase SQL editor.

-- 1. Link players to Supabase Auth
ALTER TABLE players
ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_players_auth_user_id ON players(auth_user_id);

-- 2. Admin: store admin emails (insert your email after running this)
CREATE TABLE IF NOT EXISTS admin_emails (
    email TEXT PRIMARY KEY
);
-- RLS off for this table so policies can read it; restrict writes via backend or dashboard
ALTER TABLE admin_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for authenticated" ON admin_emails FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert for service role" ON admin_emails FOR ALL TO service_role USING (true);

-- 3. Helper: true if current user is admin (by email in JWT)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'email') IN (SELECT email FROM admin_emails);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 4. RLS on players
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own player row"
  ON players FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own player row"
  ON players FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert own player row"
  ON players FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Admin can do all on players"
  ON players FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- 5. RLS on characters
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own characters"
  ON characters FOR ALL
  TO authenticated
  USING (
    player_id IN (SELECT id FROM players WHERE auth_user_id = auth.uid())
  )
  WITH CHECK (
    player_id IN (SELECT id FROM players WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Admin can do all on characters"
  ON characters FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- 6. RLS on dungeons (read for all authenticated; write for admin)
ALTER TABLE dungeons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read dungeons"
  ON dungeons FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage dungeons"
  ON dungeons FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- 7. RLS on mistakes (via character ownership)
ALTER TABLE mistakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own mistakes"
  ON mistakes FOR ALL
  TO authenticated
  USING (
    character_id IN (
      SELECT c.id FROM characters c
      JOIN players p ON p.id = c.player_id
      WHERE p.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    character_id IN (
      SELECT c.id FROM characters c
      JOIN players p ON p.id = c.player_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can do all on mistakes"
  ON mistakes FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- After running: insert your admin email, e.g.:
-- INSERT INTO admin_emails (email) VALUES ('your@email.com') ON CONFLICT DO NOTHING;

