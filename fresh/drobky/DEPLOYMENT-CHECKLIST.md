# Signal Lite - Deployment Checklist

Use this checklist to deploy Signal Lite to production.

## Pre-Deployment

### ✅ Local Testing

- [ ] Backend runs locally without errors
- [ ] Frontend runs locally without errors
- [ ] Can log in with Google OAuth
- [ ] Can send a signal successfully
- [ ] Signal appears in SQLite database
- [ ] Offline mode works (queue + auto-send)
- [ ] PWA manifest loads correctly
- [ ] No console errors in browser

### ✅ Google OAuth Setup

- [ ] Google Cloud project created
- [ ] Google+ API enabled
- [ ] OAuth 2.0 Client ID created
- [ ] Client ID copied and saved
- [ ] Test domain added to authorized origins (`http://localhost:5173`)
- [ ] Ready to add production domains

### ✅ PWA Assets

- [ ] Created `pwa-192x192.png` (192x192px)
- [ ] Created `pwa-512x512.png` (512x512px)
- [ ] Created `apple-touch-icon.png` (180x180px, optional)
- [ ] Created `favicon.ico` (32x32px, optional)
- [ ] All icons placed in `frontend/public/`
- [ ] Icons follow design guidelines (see ICONS.md)

### ✅ Configuration

- [ ] Backend `.env` configured with correct values
- [ ] Frontend `.env` configured with correct values
- [ ] `ALLOWED_DOMAINS` set (e.g., `ambiente.cz,amanual.cz`)
- [ ] Brand mapping configured (optional)
- [ ] All sensitive data in `.env` (not committed to git)

## Backend Deployment

### Option A: Railway

- [ ] Install Railway CLI: `npm i -g @railway/cli`
- [ ] Login: `railway login`
- [ ] Initialize: `cd backend && railway init`
- [ ] Set environment variables in Railway dashboard:
  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `ALLOWED_DOMAINS`
  - [ ] `PORT` (usually auto-set)
  - [ ] `FRONTEND_URL` (add after frontend deployed)
  - [ ] `BRAND_MAPPING` (optional)
- [ ] Deploy: `railway up`
- [ ] Copy backend URL (e.g., `https://signal-backend.railway.app`)
- [ ] Test health endpoint: `curl https://your-backend.railway.app/health`

### Option B: Render

- [ ] Connect GitHub repository
- [ ] Create new "Web Service"
- [ ] Settings:
  - [ ] Build command: `cd backend && npm install`
  - [ ] Start command: `cd backend && npm start`
  - [ ] Environment: Node
- [ ] Add environment variables:
  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `ALLOWED_DOMAINS`
  - [ ] `FRONTEND_URL` (add after frontend deployed)
  - [ ] `BRAND_MAPPING` (optional)
- [ ] Deploy
- [ ] Copy backend URL
- [ ] Test health endpoint

### Option C: Fly.io

- [ ] Install flyctl: `curl -L https://fly.io/install.sh | sh`
- [ ] Login: `fly auth login`
- [ ] Launch: `cd backend && fly launch`
- [ ] Set secrets:
  ```bash
  fly secrets set GOOGLE_CLIENT_ID=xxx
  fly secrets set ALLOWED_DOMAINS=xxx
  fly secrets set FRONTEND_URL=xxx
  ```
- [ ] Deploy: `fly deploy`
- [ ] Copy backend URL
- [ ] Test health endpoint

### Backend Post-Deployment

- [ ] Backend URL is accessible
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Database file created (check logs)
- [ ] No errors in deployment logs

## Frontend Deployment

### Option A: Netlify

- [ ] Install Netlify CLI: `npm i -g netlify-cli`
- [ ] Login: `netlify login`
- [ ] Build: `cd frontend && npm run build`
- [ ] Deploy: `netlify deploy --prod --dir=dist`
- [ ] Or connect GitHub repo for auto-deploy
- [ ] Set environment variables in Netlify dashboard:
  - [ ] `VITE_GOOGLE_CLIENT_ID`
  - [ ] `VITE_API_URL` (your backend URL)
- [ ] Redeploy if needed
- [ ] Copy frontend URL (e.g., `https://signal.netlify.app`)

### Option B: Vercel

- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Login: `vercel login`
- [ ] Deploy: `cd frontend && vercel --prod`
- [ ] Or connect GitHub repo for auto-deploy
- [ ] Set environment variables in Vercel dashboard:
  - [ ] `VITE_GOOGLE_CLIENT_ID`
  - [ ] `VITE_API_URL` (your backend URL)
- [ ] Redeploy if needed
- [ ] Copy frontend URL

### Option C: Cloudflare Pages

- [ ] Connect GitHub repository
- [ ] Create new Pages project
- [ ] Settings:
  - [ ] Build command: `cd frontend && npm run build`
  - [ ] Build output directory: `frontend/dist`
  - [ ] Framework preset: Vite
- [ ] Add environment variables:
  - [ ] `VITE_GOOGLE_CLIENT_ID`
  - [ ] `VITE_API_URL` (your backend URL)
- [ ] Deploy
- [ ] Copy frontend URL

### Frontend Post-Deployment

- [ ] Frontend URL is accessible
- [ ] App loads without errors
- [ ] PWA manifest loads (check Network tab)
- [ ] Service worker registers (check Application tab)
- [ ] No console errors

## Integration

### Update Backend with Frontend URL

- [ ] Go to backend deployment platform
- [ ] Update `FRONTEND_URL` environment variable with production frontend URL
- [ ] Redeploy backend
- [ ] Test CORS (should not see CORS errors)

### Update Google OAuth

- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Navigate to your OAuth 2.0 Client ID
- [ ] Add to "Authorized JavaScript origins":
  - [ ] Your frontend URL (e.g., `https://signal.netlify.app`)
- [ ] Add to "Authorized redirect URIs":
  - [ ] Your frontend URL (e.g., `https://signal.netlify.app`)
- [ ] Save changes
- [ ] Wait 5 minutes for changes to propagate

## Testing Production

### Functional Testing

- [ ] Open production frontend URL
- [ ] Click "Continue with Google"
- [ ] Login with corporate Google account
- [ ] Login succeeds (no errors)
- [ ] See pulsing orb
- [ ] Tap orb
- [ ] Capture sheet opens
- [ ] Type test message
- [ ] Send signal
- [ ] See "Sent ✓" confirmation
- [ ] Check backend database for signal

### Offline Testing

- [ ] Open production app
- [ ] Open DevTools → Network tab
- [ ] Set to "Offline"
- [ ] Try sending a signal
- [ ] See offline indicator
- [ ] Go back "Online"
- [ ] Refresh page
- [ ] Signal should auto-send
- [ ] Check backend database

### PWA Testing (iOS)

- [ ] Open production URL in Safari on iPhone
- [ ] Tap Share button
- [ ] Tap "Add to Home Screen"
- [ ] Icon appears on home screen
- [ ] Tap icon to open
- [ ] App opens fullscreen (no browser UI)
- [ ] Test sending a signal
- [ ] Close and reopen app
- [ ] Still logged in (no re-login)

### PWA Testing (Android)

- [ ] Open production URL in Chrome on Android
- [ ] Tap menu → "Install app" or "Add to Home screen"
- [ ] Icon appears on home screen
- [ ] Tap icon to open
- [ ] App opens fullscreen
- [ ] Test sending a signal

## Post-Deployment

### Documentation

- [ ] Update README.md with production URLs
- [ ] Document any deployment-specific notes
- [ ] Save backend and frontend URLs somewhere safe

### Monitoring

- [ ] Check backend logs for errors
- [ ] Monitor database size
- [ ] Set up alerts (optional):
  - [ ] Backend downtime
  - [ ] High error rate
  - [ ] Database full

### Team Rollout

- [ ] Share production URL with team
- [ ] Provide installation instructions:
  1. Open URL in Safari (iOS) or Chrome (Android)
  2. Login with corporate Google account
  3. Add to home screen
  4. Test sending a signal
- [ ] Collect feedback
- [ ] Monitor for issues

## Troubleshooting

### Login Issues

**Problem:** "Login failed" error

- [ ] Check GOOGLE_CLIENT_ID matches in both deployments
- [ ] Verify production URLs added to Google OAuth
- [ ] Wait 5 minutes after updating Google OAuth
- [ ] Check browser console for detailed error
- [ ] Try in incognito/private mode

**Problem:** "Domain not allowed" error

- [ ] Check ALLOWED_DOMAINS in backend includes user's domain
- [ ] Verify no spaces in ALLOWED_DOMAINS (should be comma-separated)
- [ ] Check backend logs for actual domain received

### CORS Issues

**Problem:** CORS errors in console

- [ ] Verify FRONTEND_URL in backend matches actual frontend URL exactly
- [ ] Check for trailing slashes (should not have)
- [ ] Redeploy backend after changing FRONTEND_URL
- [ ] Clear browser cache and try again

### PWA Issues

**Problem:** "Add to Home Screen" not appearing

- [ ] Ensure using HTTPS (not HTTP)
- [ ] Check manifest.json loads (Network tab)
- [ ] Verify service worker registers (Application tab)
- [ ] On iOS: must use Safari (not Chrome)
- [ ] Try force-refreshing the page

### Backend Issues

**Problem:** 500 errors from backend

- [ ] Check backend logs for errors
- [ ] Verify all environment variables set
- [ ] Check database file exists and is writable
- [ ] Test health endpoint: `curl https://your-backend/health`

### Database Issues

**Problem:** Signals not saving

- [ ] Check backend logs for SQLite errors
- [ ] Verify backend has write permissions
- [ ] Check database file size (may be full)
- [ ] Try restarting backend

## Rollback Plan

If something goes wrong:

### Backend Rollback

- [ ] Revert to previous deployment (platform-specific)
- [ ] Or: redeploy last working commit
- [ ] Verify health endpoint works
- [ ] Test with frontend

### Frontend Rollback

- [ ] Revert to previous deployment (platform-specific)
- [ ] Or: redeploy last working commit
- [ ] Clear browser cache
- [ ] Test login and signal sending

### Emergency Fallback

- [ ] Keep local development environment running
- [ ] Update Google OAuth to allow localhost again
- [ ] Use local version until production fixed

## Success Criteria

Production deployment is successful when:

- [ ] ✅ Frontend loads without errors
- [ ] ✅ Backend responds to health checks
- [ ] ✅ Users can log in with Google OAuth
- [ ] ✅ Users can send signals
- [ ] ✅ Signals persist in database
- [ ] ✅ Offline mode works
- [ ] ✅ PWA installable on iOS
- [ ] ✅ No console errors
- [ ] ✅ No backend errors in logs
- [ ] ✅ Team can access and use the app

## Maintenance

### Regular Tasks

- [ ] Monitor backend logs weekly
- [ ] Check database size monthly
- [ ] Update dependencies quarterly
- [ ] Review and rotate secrets annually

### Scaling Considerations

If you need to scale:

- [ ] Consider moving from SQLite to PostgreSQL
- [ ] Add database backups
- [ ] Set up load balancing (if needed)
- [ ] Add monitoring/analytics
- [ ] Consider CDN for frontend assets

## Support

If you need help:

1. Check the documentation:
   - README.md (troubleshooting section)
   - ARCHITECTURE.md (technical details)
   - This checklist

2. Check logs:
   - Backend deployment logs
   - Browser console (frontend)
   - Network tab (API calls)

3. Common issues:
   - Google OAuth: wait 5 minutes after changes
   - CORS: verify FRONTEND_URL exactly matches
   - PWA: must use HTTPS and Safari (iOS)

---

**Good luck with your deployment! 🚀**
