-- Fix initiatives table to auto-generate IDs
ALTER TABLE initiatives ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
