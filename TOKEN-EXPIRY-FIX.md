# 🔧 Token Expiry Fix

## Problem
Google OAuth tokens expire after **60 minutes**. Signal Lite was storing tokens indefinitely, causing authentication failures when users tried to send signals after the token expired.

**Error seen in backend logs:**
```
Token used too late, 1764754576.93 > 1764749691
```

## Solution Implemented

### 1. Token Expiration Tracking (`utils/auth.js`)
- Store token **timestamp** alongside the token itself
- Check token age on retrieval (expires at 55 minutes to be safe)
- Auto-clear expired tokens

### 2. Proactive Expiration Check (`Orb.jsx`)
- Check token validity **before** sending signal
- Show alert and force re-login if expired
- Prevents failed API calls

### 3. Background Monitoring (`App.jsx`)
- Periodic check every 60 seconds
- Auto-logout when token expires
- User sees login screen instead of silent failures

## Files Changed
- `/signal-lite/frontend/src/utils/auth.js` - Added timestamp tracking and expiration logic
- `/signal-lite/frontend/src/components/Orb.jsx` - Added pre-send token check
- `/signal-lite/frontend/src/App.jsx` - Added periodic token monitoring

## Deployment Steps

1. **Commit and push:**
   ```bash
   git add .
   git commit -m "Fix: Add token expiration handling (55min auto-logout)"
   git push origin main
   ```

2. **Redeploy Signal Lite Frontend** (Render/Netlify will auto-deploy on push)

3. **Test:**
   - Open Signal Lite
   - Log in
   - Wait 56+ minutes (or manually clear timestamp in localStorage to simulate)
   - Try to send a signal → should prompt re-login

## Immediate Fix (For Current Session)

**Just refresh the page** or reopen Signal Lite PWA. You'll be prompted to log in again with a fresh token.

## Future Improvements (Optional)

- Implement **silent token refresh** using Google's refresh token flow
- Show countdown timer: "Session expires in X minutes"
- Queue signals locally and retry after re-login
