# Signals Migration to Supabase - COMPLETE ✅

## What Changed

Signals are now **fully stored in Supabase** instead of a JSON file on the Signal Lite backend.

## Architecture

### Before:
- Signal Lite PWA → Creates signals → **JSON file** on backend
- Strategy App → Fetches signals → **Signal Lite API** (reads JSON file)
- Strategy App → Deletes signals → **Signal Lite API** (updates JSON file)

### After:
- Signal Lite PWA → Creates signals → **Supabase database**
- Strategy App → Fetches signals → **Supabase database** (direct)
- Strategy App → Deletes signals → **Supabase database** (direct)

## Benefits

✅ **Persistent storage** - No data loss on Render restarts
✅ **Centralized database** - All data in one place (Supabase)
✅ **Better performance** - Direct database queries
✅ **Consistent architecture** - Both apps use Supabase

## Files Changed

### Backend (Signal Lite)
- `signal-lite/backend/server.js`
  - POST `/signals` → Inserts into Supabase
  - GET `/signals` → Queries from Supabase
  - PATCH `/signals/:id` → Updates in Supabase
  - DELETE `/signals/:id` → Deletes from Supabase
  - Supports both Supabase JWT and Google OAuth tokens

### Frontend (Strategy App)
- `strategy-app/src/services/supabaseData.js`
  - Added `getSignals()`, `updateSignal()`, `deleteSignal()`
  - Signals included in `getAllData()`
  
- `strategy-app/src/hooks/useStrategyData.js`
  - Removed Signal Lite API dependency
  - Now uses Supabase directly for all signal operations
  
- `strategy-app/src/App.jsx`
  - Simplified delete handler

## Database Schema

The `signals` table in Supabase has these columns (snake_case):

```sql
- id (text, primary key)
- title (text)
- body (text, nullable)
- date (text)
- source (text)
- author_id (text)
- author_name (text)
- author_email (text)
- author_brand_ids (text[])
- restaurant_ids (text[])
- priority (text, nullable)
- status (text, default: 'inbox')
- project_id (text, nullable)
- theme_ids (text[])
- influence_ids (text[])
- created_at (timestamp)
- updated_at (timestamp, nullable)
```

## Deployment Checklist

### 1. Push to GitHub ✅
```bash
git push origin main
```

### 2. Environment Variables on Render

**Signal Lite Backend** needs:
- `SUPABASE_URL` = `https://hxxgtcbqnuaykdecmqer.supabase.co`
- `SUPABASE_SERVICE_KEY` = [Your service role key]
- `GOOGLE_CLIENT_ID` = [Your Google Client ID]
- `ALLOWED_DOMAINS` = `ambiente.cz,amanual.cz`
- `BRAND_MAPPING` = [Your brand mapping JSON]

### 3. Wait for Deployment

Both services will auto-deploy on Render when you push to GitHub.

### 4. Test

After deployment:
1. ✅ Create a signal in Signal Lite PWA
2. ✅ View it in Strategy App
3. ✅ Delete it from Strategy App
4. ✅ Check Supabase dashboard to see signals table populated

## Migration Notes

- **Existing signals in JSON file will NOT be automatically migrated**
- If you have important signals in the old `signals.json`, you'll need to manually copy them to Supabase
- The JSON file can be safely deleted after migration

## Troubleshooting

### Signals not appearing
- Check Supabase dashboard → Table Editor → `signals` table
- Check Render logs for backend errors
- Verify `SUPABASE_SERVICE_KEY` is set correctly

### "Authentication token required" error
- Make sure both `SUPABASE_SERVICE_KEY` and `GOOGLE_CLIENT_ID` are set
- Backend supports both token types

### "Column does not exist" error
- Run the schema fix SQL in Supabase SQL Editor
- Make sure all column names use snake_case

## Next Steps

1. Push code to GitHub
2. Wait for Render to deploy
3. Test signal creation and deletion
4. Verify signals appear in Supabase dashboard
5. (Optional) Migrate old signals from JSON file if needed
