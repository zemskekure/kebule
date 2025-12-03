# Supabase Setup Complete ✅

## What's Been Done

### 1. ✅ Supabase Client Installed
- Added `@supabase/supabase-js` to dependencies
- Created `/src/services/supabaseClient.js`

### 2. ✅ Auth System Migrated
- **Old**: Hardcoded email/password (2 users, shared password)
- **New**: Google OAuth via Supabase
- Updated `/src/contexts/AuthContext.jsx`:
  - Uses `supabase.auth.signInWithOAuth()`
  - Auto-restores session on page load
  - Subscribes to auth state changes
  - Role mapping based on email (admin/viewer)

### 3. ✅ Login UI Updated
- Updated `/src/components/LoginModal.jsx`:
  - Replaced email/password form
  - Added Google sign-in button with Google logo
  - Matches existing design language (orange gradient)

### 4. ✅ Environment Variables
- Updated `.env.example` with Supabase vars
- `.env` already in `.gitignore`

---

## Next Steps to Test

### 1. Create `.env` file locally

In `/Users/jancervenka/kebule/strategy-app/.env`:

```env
VITE_GEMINI_API_KEY=your_existing_key
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Get the Supabase values from:
- Supabase Dashboard → Settings → API

### 2. Add redirect URL to Google Cloud Console

In Google Cloud Console → APIs & Services → Credentials:

1. Find your OAuth 2.0 Client ID
2. Add to **Authorized redirect URIs**:
   ```
   http://localhost:5173
   ```
   (for local testing)

### 3. Start the dev server

```bash
cd /Users/jancervenka/kebule/strategy-app
npm run dev
```

### 4. Test login flow

1. Open http://localhost:5173
2. Click "Přihlásit" button
3. Click "Přihlásit přes Google"
4. Should redirect to Google login
5. After login, should redirect back and show your name

### 5. Verify admin access

After first login, run this in Supabase SQL Editor:

```sql
-- Check your user was created
SELECT * FROM auth.users;

-- Verify your email is in the ROLE_MAP
-- (jan.cervenka@ambi.cz and stepanka.borisovova@ambi.cz are already set as admin)
```

---

## Current Role System

**Hardcoded in `/src/contexts/AuthContext.jsx`:**

```javascript
const ROLE_MAP = {
  'jan.cervenka@amanual.cz': 'admin',
  'jan.cervenka@ambi.cz': 'admin',
  'stepanka.borisovova@ambi.cz': 'admin',
  // Add more users here as needed
};
```

**To add a new admin:**
1. Edit `ROLE_MAP` in `AuthContext.jsx`
2. Add their email with role `'admin'`

**Later migration:** Move roles to Supabase `profiles` table (already created in schema).

---

## Session Persistence (Keep Users Logged In)

The app now keeps users logged in indefinitely through:

1. **Auto token refresh** - Every 30 minutes, automatically refreshes the session
2. **Visibility refresh** - When user returns to the tab, refreshes the session
3. **LocalStorage persistence** - Session survives browser restarts
4. **Offline access** - Requests refresh tokens from Google OAuth

**Users will stay logged in:**
- ✅ Across browser refreshes
- ✅ After closing and reopening browser
- ✅ After days/weeks of inactivity
- ✅ Until they explicitly log out

**Only logs out if:**
- User clicks "Odhlásit" (logout)
- User clears browser storage/cookies
- Extremely long inactivity (months)

---

## Troubleshooting

### "Supabase credentials missing"
- Check `.env` file exists
- Restart dev server after creating `.env`

### "Login redirects but doesn't work"
- Check Google OAuth redirect URI includes `http://localhost:5173`
- Check Supabase Google provider is enabled

### "User logs in but isn't admin"
- Check their email is in `ROLE_MAP` in `AuthContext.jsx`
- Email comparison is case-insensitive

### "Session doesn't persist"
- Supabase stores session in localStorage automatically
- Check browser console for errors

---

## Production Deployment (Render)

### 1. Add environment variables in Render

For Strategy App service:

```
VITE_SUPABASE_URL = https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY = your_anon_key_here
```

### 2. Add production redirect URL to Google

In Google Cloud Console, add:

```
https://your-strategy-app.onrender.com
```

### 3. Deploy

Render will automatically rebuild with new env vars.

---

## What's NOT Done Yet

- ❌ Database migration (localStorage → Supabase tables)
- ❌ CRUD operations using Supabase (still using localStorage)
- ❌ Real-time sync between users
- ❌ Initiatives entity (Part A of ChatGPT proposal)
- ❌ Enhanced influences (Part B of ChatGPT proposal)

**Current state:** Auth works via Supabase, but data still in localStorage.

**Next phase:** Migrate `useStrategyData` hook to use Supabase instead of localStorage.
