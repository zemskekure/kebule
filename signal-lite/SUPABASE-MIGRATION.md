# Signal Lite Backend - Supabase Migration Guide

## What Changed

The Signal Lite backend now uses **Supabase JWT tokens** instead of Google OAuth tokens for authentication. This makes it more reliable and integrated with the Strategy App's authentication system.

## Required Environment Variables on Render

Update your Signal Lite backend service on Render with these environment variables:

### New Variables (Required)
```
SUPABASE_URL=https://hxxgtcbqnuaykdecmqer.supabase.co
SUPABASE_SERVICE_KEY=<your-service-role-key>
```

### Keep These Variables
```
ALLOWED_DOMAINS=ambiente.cz,amanual.cz
PORT=3001
FRONTEND_URL=https://signal-lite.onrender.com
BRAND_MAPPING={"jan.cervenka@ambi.cz":["brand1"],"stepanka.borisovova@ambi.cz":["brand2"]}
```

### Remove These Variables (No Longer Needed)
```
GOOGLE_CLIENT_ID (not needed anymore)
```

## Where to Find Your Supabase Service Key

1. Go to your Supabase project: https://supabase.com/dashboard/project/hxxgtcbqnuaykdecmqer
2. Click **Settings** (gear icon in sidebar)
3. Click **API**
4. Copy the **service_role** key (NOT the anon key)
   - ⚠️ **Important**: This is a secret key - never expose it in frontend code
   - It's safe to use on the backend (Render server)

## Deployment Steps

1. **Update Environment Variables on Render**
   - Go to your Signal Lite backend service on Render
   - Navigate to **Environment** tab
   - Add `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
   - Remove `GOOGLE_CLIENT_ID`

2. **Install New Dependencies**
   - The backend now uses `@supabase/supabase-js` instead of `google-auth-library`
   - Render will automatically run `npm install` on deploy

3. **Push Code to GitHub**
   ```bash
   git add .
   git commit -m "Migrate Signal Lite backend to use Supabase JWT tokens"
   git push origin main
   ```

4. **Verify Deployment**
   - Render should auto-deploy
   - Check logs for "Verifying Supabase token..." messages
   - Test signal deletion in the Strategy App

## How It Works Now

### Before (Google OAuth)
- Frontend sent Google's `provider_token` to backend
- Backend verified token with Google's OAuth API
- ❌ Problem: `provider_token` not always available in Supabase

### After (Supabase JWT)
- Frontend sends Supabase's `access_token` to backend
- Backend verifies token with Supabase's `getUser()` API
- ✅ Solution: `access_token` always available and auto-refreshed

## Testing

After deployment, try deleting a signal (Drobek) in the Strategy App. You should see:
- No "Authentication token required" error
- Signal successfully deleted
- Confirmation message

## Troubleshooting

### "Invalid token" error
- Check that `SUPABASE_SERVICE_KEY` is the **service_role** key, not anon key
- Verify `SUPABASE_URL` matches your project URL

### "Domain not allowed" error
- Check `ALLOWED_DOMAINS` includes the user's email domain
- Example: `ambiente.cz,amanual.cz`

### CORS errors
- Verify `FRONTEND_URL` and `STRATEGY_APP_URL` are correct in `server.js`
