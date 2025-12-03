-- ==============================================================================
-- ADD INITIATIVES TABLE
-- Run this in Supabase SQL Editor to add initiatives entity
-- ==============================================================================

-- Create initiatives table
CREATE TABLE IF NOT EXISTS initiatives (
  id text PRIMARY KEY,
  theme_id text REFERENCES themes(id) ON DELETE CASCADE,
  name text NOT NULL,
  status text DEFAULT 'idea', -- 'idea', 'shaping', 'in_progress', 'done', 'on_hold'
  description text,
  start_date text, -- ISO or YYYY-MM-DD
  end_date text,
  sandbox_position jsonb,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add initiative_id to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS initiative_id text REFERENCES initiatives(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Enable all access for authenticated users" ON initiatives 
  FOR ALL 
  USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON initiatives TO authenticated;
GRANT ALL ON initiatives TO service_role;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_initiatives_theme_id ON initiatives(theme_id);
CREATE INDEX IF NOT EXISTS idx_projects_initiative_id ON projects(initiative_id);
