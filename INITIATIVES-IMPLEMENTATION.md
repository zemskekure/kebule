# Initiatives Implementation Guide

## Overview
Initiatives (Epics) have been added as a new entity between Themes and Projects.

**New hierarchy:** Year → Vision → Theme → **Initiative** → Projects

## Step 1: Run SQL Migration

Go to **Supabase Dashboard** → **SQL Editor** and run:

```sql
-- File: ADD_INITIATIVES_TABLE.sql

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
```

## Step 2: Backend Changes (DONE ✅)

### Added to `supabaseData.js`:
- `getInitiatives()` - Fetch all initiatives
- `createInitiative(initiative)` - Create new initiative
- `updateInitiative(id, updates)` - Update initiative
- `deleteInitiative(id)` - Delete initiative
- Updated `loadAllData()` to include initiatives

### Added to `useStrategyData.js`:
- `addInitiative(themeId)` - Create new initiative under a theme
- Updated `addProject(themeId, initiativeId)` - Projects can now belong to initiatives
- Updated `updateNode()` - Handle initiative updates
- Updated `deleteNode()` - Cascade delete initiatives and their projects
- Added `initiatives: []` to INITIAL_DATA
- Added `initiative` to collection mapping

## Step 3: Frontend Changes (TODO)

### Still need to implement:

1. **Update tree builder** (`buildStrategyTree` or equivalent)
   - Nest initiatives between themes and projects
   - Handle projects without `initiativeId` (show under "Unsorted" or directly under theme)

2. **Create Initiative DetailPanel component**
   - Edit name, description, status, start_date, end_date
   - Show list of projects under this initiative
   - Show progress (# done / total)

3. **Update EditorContent/Theme DetailPanel**
   - Add button to create new initiative under theme
   - Show list of initiatives with their status
   - Show initiative progress

4. **Update Project DetailPanel**
   - Add dropdown to assign project to an initiative
   - Show current initiative (if any)

## Data Model

### Initiative Schema:
```typescript
{
  id: string,
  themeId: string,
  name: string,
  status: "idea" | "shaping" | "in_progress" | "done" | "on_hold",
  description?: string,
  startDate?: string, // ISO or YYYY-MM-DD
  endDate?: string,
  sandboxPosition?: object,
  createdBy?: string,
  updatedBy?: string,
  createdAt?: string,
  updatedAt?: string
}
```

### Updated Project Schema:
```typescript
{
  id: string,
  themeId: string,
  initiativeId?: string, // NEW - optional link to initiative
  title: string,
  // ... rest of fields
}
```

## Status Values

Initiatives support these statuses:
- **idea** - Initial concept
- **shaping** - Being defined/scoped
- **in_progress** - Active work
- **done** - Completed
- **on_hold** - Paused

## Backward Compatibility

- ✅ Projects without `initiativeId` will still work
- ✅ Existing data is not affected
- ✅ Old projects can be assigned to initiatives later
- ✅ Deleting an initiative sets `project.initiative_id` to NULL (not cascade delete)

## Next Steps

1. Run the SQL migration in Supabase
2. Push code changes to GitHub
3. Deploy to Render
4. Implement tree builder updates
5. Create Initiative UI components
6. Test end-to-end

## Testing Checklist

After deployment:
- [ ] Can create initiative under theme
- [ ] Can edit initiative details
- [ ] Can delete initiative (projects remain but lose initiativeId)
- [ ] Can create project under initiative
- [ ] Can assign existing project to initiative
- [ ] Tree shows correct hierarchy
- [ ] Cascade deletes work correctly
