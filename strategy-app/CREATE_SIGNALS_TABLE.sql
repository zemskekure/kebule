-- Create signals table
CREATE TABLE IF NOT EXISTS signals (
  id text PRIMARY KEY,
  title text NOT NULL,
  body text,
  date text, -- Can be ISO string or just YYYY-MM-DD
  source text DEFAULT 'restaurant',
  author_id text, -- Can be UUID from auth.users or external ID
  author_name text,
  author_email text,
  author_brand_ids text[],
  restaurant_ids text[],
  priority text,
  status text DEFAULT 'inbox',
  project_id text,
  theme_ids text[],
  influence_ids text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;

-- Create generic policy for authenticated users (read/write everything)
-- Note: Ideally you would restrict this, but for migration/MVP this is fine
CREATE POLICY "Enable all access for authenticated users" ON signals 
  FOR ALL 
  USING (auth.role() = 'authenticated');

-- Also allow service role to do everything (it bypasses RLS anyway, but good to be explicit)
-- Note: Service role bypasses RLS by default

-- Grant permissions
GRANT ALL ON signals TO authenticated;
GRANT ALL ON signals TO service_role;
