-- Fix missing columns in signals table
-- Run this in Supabase SQL Editor

ALTER TABLE signals ADD COLUMN IF NOT EXISTS author_brand_ids text[];
ALTER TABLE signals ADD COLUMN IF NOT EXISTS restaurant_ids text[];
ALTER TABLE signals ADD COLUMN IF NOT EXISTS project_id text;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS theme_ids text[];
ALTER TABLE signals ADD COLUMN IF NOT EXISTS influence_ids text[];
ALTER TABLE signals ADD COLUMN IF NOT EXISTS author_id text;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS author_name text;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS author_email text;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS source text DEFAULT 'restaurant';
ALTER TABLE signals ADD COLUMN IF NOT EXISTS status text DEFAULT 'inbox';
ALTER TABLE signals ADD COLUMN IF NOT EXISTS priority text;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS body text;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS date text;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE signals ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Refresh the schema cache
NOTIFY pgrst, 'reload config';
