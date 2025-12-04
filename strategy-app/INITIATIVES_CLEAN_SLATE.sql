-- ==============================================================================
-- INITIATIVES - CLEAN SLATE (COMPLETE)
-- Run this ONCE to set up initiatives properly
-- ==============================================================================

-- 1. Remove any existing initiative_id from projects (clean start)
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_initiative_id_fkey;
ALTER TABLE projects DROP COLUMN IF EXISTS initiative_id;

-- 2. Drop and recreate initiatives table
DROP TABLE IF EXISTS initiatives CASCADE;

CREATE TABLE initiatives (
  id text PRIMARY KEY,
  theme_id text REFERENCES themes(id) ON DELETE CASCADE,
  name text NOT NULL,
  status text DEFAULT 'idea',
  description text,
  start_date text,
  end_date text,
  sandbox_position jsonb,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Add initiative_id to projects (fresh, correct type)
ALTER TABLE projects ADD COLUMN initiative_id text REFERENCES initiatives(id) ON DELETE SET NULL;

-- 4. Enable RLS
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;

-- 5. Create policy
CREATE POLICY "Enable all access for authenticated users" ON initiatives 
  FOR ALL 
  USING (auth.role() = 'authenticated');

-- 6. Grant permissions
GRANT ALL ON initiatives TO authenticated;
GRANT ALL ON initiatives TO service_role;

-- 7. Create indexes
CREATE INDEX idx_initiatives_theme_id ON initiatives(theme_id);
CREATE INDEX idx_projects_initiative_id ON projects(initiative_id);
