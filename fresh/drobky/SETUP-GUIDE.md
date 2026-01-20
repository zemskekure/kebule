# Signal Lite - Quick Setup Guide

Follow these steps to get Signal Lite running in under 10 minutes.

## Step 1: Google OAuth Setup (5 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: "Signal Lite"
3. Enable APIs:
   - Click "Enable APIs and Services"
   - Search for "Google+ API"
   - Click "Enable"
4. Create OAuth credentials:
   - Go to "Credentials" in left sidebar
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Configure consent screen if prompted:
     - User Type: Internal (if using Google Workspace)
     - App name: "Signal Lite"
     - User support email: your email
     - Developer contact: your email
     - Save and continue through all steps
   - Back to "Create OAuth Client ID":
     - Application type: "Web application"
     - Name: "Signal Lite Web"
     - Authorized JavaScript origins:
       - `http://localhost:5173`
       - Add production URL later
     - Authorized redirect URIs:
       - `http://localhost:5173`
       - Add production URL later
     - Click "Create"
5. **Copy the Client ID** - you'll need this for both frontend and backend

## Step 2: Backend Setup (2 minutes)

```bash
# Navigate to backend
cd signal-lite/backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file
nano .env  # or use your preferred editor
```

Add these values to `.env`:
```env
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
ALLOWED_DOMAINS=ambiente.cz,amanual.cz
PORT=3001
FRONTEND_URL=http://localhost:5173
```

Optional - add brand mapping:
```env
BRAND_MAPPING={"user@ambiente.cz":["brand1","brand2"]}
```

Save and start the server:
```bash
npm start
```

You should see:
```
🚀 Signal Lite backend running on port 3001
📊 Database: signals.db
🔐 Allowed domains: ambiente.cz, amanual.cz
🌐 Frontend URL: http://localhost:5173
```

## Step 3: Frontend Setup (2 minutes)

Open a new terminal:

```bash
# Navigate to frontend
cd signal-lite/frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file
nano .env  # or use your preferred editor
```

Add these values to `.env`:
```env
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
VITE_API_URL=http://localhost:3001
```

**Important:** Use the SAME Client ID as backend.

Start the dev server:
```bash
npm run dev
```

You should see:
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## Step 4: Test the App (1 minute)

1. Open http://localhost:5173 in your browser
2. You should see the login screen with "Continue with Google" button
3. Click the button and sign in with your Google account
4. After login, you should see the pulsing orb
5. Tap the orb to open the capture sheet
6. Type a test message: "Testing Signal Lite"
7. Click "Send Signal"
8. You should see "Sent ✓" confirmation

## Step 5: Verify Data (30 seconds)

Check that the signal was saved:

```bash
# In backend directory
cd backend
sqlite3 signals.db "SELECT title, authorEmail, date FROM signals;"
```

You should see your test signal.

## Step 6: Create PWA Icons (Optional)

For iOS installation, you need icon files. See `frontend/public/ICONS.md` for details.

Quick placeholder for testing:
```bash
cd frontend/public
# Use any 512x512 PNG as placeholder
# Name it pwa-512x512.png and pwa-192x192.png
```

## Step 7: Test on iOS (Optional)

1. Make sure both backend and frontend are running
2. Find your local IP address:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "
   # Look for something like 192.168.1.x
   ```
3. Update frontend to listen on network:
   ```bash
   # In frontend directory
   npm run dev -- --host
   ```
4. On your iPhone:
   - Open Safari
   - Go to `http://YOUR_IP:5173` (e.g., http://192.168.1.100:5173)
   - Login and test
   - Tap Share → "Add to Home Screen"
   - Open the app from home screen

## Troubleshooting

### "Login failed" error
- Check that GOOGLE_CLIENT_ID is the same in both .env files
- Verify the Client ID is correct (should end in .apps.googleusercontent.com)
- Check browser console for detailed error

### "Domain not allowed" error
- Make sure your email domain is in ALLOWED_DOMAINS
- Format: `ambiente.cz,amanual.cz` (comma-separated, no spaces)

### Backend won't start
- Check if port 3001 is already in use: `lsof -i :3001`
- Try a different port in backend .env: `PORT=3002`
- Update frontend .env to match: `VITE_API_URL=http://localhost:3002`

### Frontend shows blank page
- Check browser console for errors
- Verify VITE_GOOGLE_CLIENT_ID is set correctly
- Try clearing browser cache and reloading

### CORS errors
- Verify FRONTEND_URL in backend .env matches exactly where frontend is running
- Restart backend after changing .env

## Next Steps

### For Production Deployment

1. **Deploy Backend:**
   - Choose platform: Railway, Render, or Fly.io
   - Set environment variables in platform dashboard
   - Note the backend URL (e.g., https://signal-lite.railway.app)

2. **Deploy Frontend:**
   - Choose platform: Netlify, Vercel, or Cloudflare Pages
   - Set environment variables:
     - `VITE_GOOGLE_CLIENT_ID` (same as before)
     - `VITE_API_URL` (your backend URL)
   - Note the frontend URL (e.g., https://signal-lite.netlify.app)

3. **Update Google OAuth:**
   - Go back to Google Cloud Console
   - Add production URLs to authorized origins and redirect URIs
   - Both frontend URL and backend URL

4. **Update Backend Config:**
   - Set `FRONTEND_URL` to production frontend URL
   - Redeploy backend

5. **Test Production:**
   - Visit production frontend URL
   - Test login and signal sending
   - Test PWA installation on iOS

### For Team Rollout

1. Share production URL with team
2. Instruct them to:
   - Open in Safari (iOS)
   - Login with corporate Google account
   - Add to home screen
   - Test sending a signal

3. Monitor backend logs for any issues
4. Check database for incoming signals

## Support

For issues or questions:
1. Check the main README.md for detailed documentation
2. Check ARCHITECTURE.md for technical details
3. Review browser console for error messages
4. Check backend logs for API errors

## Quick Reference

**Backend:**
- Start: `cd backend && npm start`
- Dev mode: `cd backend && npm run dev`
- View DB: `sqlite3 backend/signals.db`

**Frontend:**
- Start: `cd frontend && npm run dev`
- Build: `cd frontend && npm run build`
- Preview: `cd frontend && npm run preview`

**Environment Files:**
- Backend: `backend/.env`
- Frontend: `frontend/.env`

**Important URLs:**
- Frontend dev: http://localhost:5173
- Backend dev: http://localhost:3001
- Backend health: http://localhost:3001/health
- Google Console: https://console.cloud.google.com/
