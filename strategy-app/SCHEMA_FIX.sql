-- ==============================================================================
-- STRATEGY APP SCHEMA FIX (TEXT IDs & MISSING COLUMNS)
-- Run this in Supabase SQL Editor to reset schema and support current data model
-- ==============================================================================

-- 1. Drop tables in correct order (to avoid foreign key constraint errors)
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS new_restaurants CASCADE;
DROP TABLE IF EXISTS themes CASCADE;
DROP TABLE IF EXISTS visions CASCADE;
DROP TABLE IF EXISTS years CASCADE;
DROP TABLE IF EXISTS influences CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS brands CASCADE;

-- 2. Create tables with TEXT IDs (to support 'b1', 'l1' etc.) and all columns

-- BRANDS
CREATE TABLE brands (
  id text PRIMARY KEY,
  name text NOT NULL,
  color text,
  foundation_year text,
  concept_short text,
  description text,
  logo_url text,
  social_links jsonb,
  contact text,
  account_manager text,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- LOCATIONS
CREATE TABLE locations (
  id text PRIMARY KEY,
  brand_id text REFERENCES brands(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- YEARS
CREATE TABLE years (
  id text PRIMARY KEY,
  title text NOT NULL,
  sandbox_position jsonb,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- VISIONS
CREATE TABLE visions (
  id text PRIMARY KEY,
  year_id text REFERENCES years(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  brand_ids text[], -- Array of brand IDs
  location_ids text[], -- Array of location IDs
  sandbox_position jsonb,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- THEMES
CREATE TABLE themes (
  id text PRIMARY KEY,
  vision_id text REFERENCES visions(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  priority text,
  brand_ids text[],
  location_ids text[],
  sandbox_position jsonb,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- PROJECTS
CREATE TABLE projects (
  id text PRIMARY KEY,
  theme_id text REFERENCES themes(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text,
  priority text,
  type text, -- 'standard', etc.
  start_date text,
  end_date text,
  budget text,
  brand_ids text[],
  location_ids text[],
  sandbox_position jsonb,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- NEW RESTAURANTS / RECONSTRUCTIONS
CREATE TABLE new_restaurants (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text,
  status text,
  category text, -- 'new' or 'facelift'
  location_id text, -- Can be reference to locations(id) or just text
  opening_date text,
  phase text,
  concept_summary text,
  social_links jsonb,
  contact text,
  account_manager text,
  brand_ids text[],
  location_ids text[],
  sandbox_position jsonb,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- INFLUENCES
CREATE TABLE influences (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text,
  type text, -- 'internal' or 'external'
  impact text,
  connected_theme_ids text[],
  connected_project_ids text[],
  sandbox_position jsonb,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Enable RLS on all tables
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE years ENABLE ROW LEVEL SECURITY;
ALTER TABLE visions ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE new_restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE influences ENABLE ROW LEVEL SECURITY;

-- 4. Create policies (Allow authenticated users to do everything for now)
-- You can tighten this later to check org_id if needed

-- BRANDS
CREATE POLICY "Enable all access for authenticated users" ON brands FOR ALL USING (auth.role() = 'authenticated');

-- LOCATIONS
CREATE POLICY "Enable all access for authenticated users" ON locations FOR ALL USING (auth.role() = 'authenticated');

-- YEARS
CREATE POLICY "Enable all access for authenticated users" ON years FOR ALL USING (auth.role() = 'authenticated');

-- VISIONS
CREATE POLICY "Enable all access for authenticated users" ON visions FOR ALL USING (auth.role() = 'authenticated');

-- THEMES
CREATE POLICY "Enable all access for authenticated users" ON themes FOR ALL USING (auth.role() = 'authenticated');

-- PROJECTS
CREATE POLICY "Enable all access for authenticated users" ON projects FOR ALL USING (auth.role() = 'authenticated');

-- NEW RESTAURANTS
CREATE POLICY "Enable all access for authenticated users" ON new_restaurants FOR ALL USING (auth.role() = 'authenticated');

-- INFLUENCES
CREATE POLICY "Enable all access for authenticated users" ON influences FOR ALL USING (auth.role() = 'authenticated');

-- 5. Grant permissions to authenticated role
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
