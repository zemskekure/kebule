-- Fix initiatives table to auto-generate IDs (for UUID type)
ALTER TABLE initiatives ALTER COLUMN id SET DEFAULT gen_random_uuid();
