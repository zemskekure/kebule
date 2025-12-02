# Signal Lite

A minimal PWA for Ambiente account managers to capture quick restaurant signals with near-zero friction.

## Product Vision

**"One breathing button to send quick field intelligence."**

Signal Lite is designed as a single-purpose walkie-talkie: open → tap orb → type → send → done.

## Features

- **Google OAuth** - One-time login with corporate domain restriction
- **Pulsing Orb UI** - Single interactive element, no clutter
- **Offline Support** - Signals queue locally and auto-send when online
- **PWA Installable** - Add to iOS home screen, runs fullscreen
- **Haptic Feedback** - Physical response on tap and send
- **Minimal Friction** - Under 10 seconds from open to send

## Tech Stack

### Frontend
- React 18 + Vite
- Google OAuth (@react-oauth/google)
- CSS (no framework bloat)
- Service Worker (PWA)

### Backend
- Node.js + Express
- SQLite (zero-setup database)
- Google Auth Library (token verification)

## Project Structure

```
signal-lite/
├── frontend/               # React PWA
│   ├── public/
│   │   └── manifest.json  # PWA manifest
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginScreen.jsx
│   │   │   ├── LoginScreen.css
│   │   │   ├── Orb.jsx
│   │   │   └── Orb.css
│   │   ├── utils/
│   │   │   ├── auth.js         # Token storage
│   │   │   ├── api.js          # API calls
│   │   │   └── offlineQueue.js # Offline handling
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── vite.config.js
│   └── package.json
│
├── backend/                # Express API
│   ├── server.js          # Main server + routes
│   ├── .env.example
│   └── package.json
│
└── ARCHITECTURE.md        # Technical details
```

## Setup Instructions

### Prerequisites

1. **Google OAuth Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable "Google+ API"
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Authorized JavaScript origins:
     - `http://localhost:5173` (development)
     - Your production frontend URL
   - Authorized redirect URIs:
     - `http://localhost:5173` (development)
     - Your production frontend URL
   - Copy the Client ID

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your values:
# GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
# ALLOWED_DOMAINS=ambiente.cz,amanual.cz
# PORT=3001
# FRONTEND_URL=http://localhost:5173

# Start server
npm start

# Or use watch mode for development
npm run dev
```

The backend will:
- Start on port 3001 (or your configured PORT)
- Create `signals.db` SQLite database automatically
- Accept requests from configured FRONTEND_URL

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your values:
# VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
# VITE_API_URL=http://localhost:3001

# Start dev server
npm run dev

# Build for production
npm run build
```

The frontend will start on `http://localhost:5173`

### Testing Locally

1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Open `http://localhost:5173` in your browser
4. Click "Continue with Google"
5. Tap the orb to send a signal

### PWA Installation (iOS)

1. Open the app in Safari
2. Tap the Share button
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"
5. The app icon will appear on your home screen
6. Tap to open as a fullscreen app

## Configuration

### Domain Restriction

Edit `backend/.env`:
```env
ALLOWED_DOMAINS=ambiente.cz,amanual.cz
```

Leave empty to allow all domains (not recommended for production).

### Brand Mapping (Optional)

Map user emails to brand IDs in `backend/.env`:
```env
BRAND_MAPPING={"user@ambiente.cz":["brand1","brand2"],"other@amanual.cz":["brand3"]}
```

Signals from these users will automatically include `authorBrandIds`.

## Deployment

### Backend Deployment

**Option 1: Railway**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and init
railway login
railway init

# Set environment variables in Railway dashboard
# Deploy
railway up
```

**Option 2: Render**
1. Connect your GitHub repo
2. Create new "Web Service"
3. Build command: `cd backend && npm install`
4. Start command: `cd backend && npm start`
5. Add environment variables in dashboard

**Option 3: Fly.io**
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Launch app
cd backend
fly launch

# Set secrets
fly secrets set GOOGLE_CLIENT_ID=xxx ALLOWED_DOMAINS=xxx
```

### Frontend Deployment

**Option 1: Netlify**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
cd frontend
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

**Option 2: Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

**Option 3: Cloudflare Pages**
1. Connect GitHub repo
2. Build command: `cd frontend && npm run build`
3. Build output directory: `frontend/dist`
4. Add environment variables

### Post-Deployment

1. Update Google OAuth credentials with production URLs
2. Update `FRONTEND_URL` in backend .env
3. Update `VITE_API_URL` in frontend .env
4. Test PWA installation on iOS device

## Integration with Main App

Signals are stored in SQLite with this schema:

```sql
CREATE TABLE signals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT,
  date TEXT NOT NULL,
  source TEXT DEFAULT 'restaurant',
  authorId TEXT NOT NULL,
  authorName TEXT NOT NULL,
  authorEmail TEXT NOT NULL,
  authorBrandIds TEXT,  -- JSON array
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Integration Options

**Option 1: Shared Database**
If your main app can access the same SQLite file:
```javascript
// Read signals directly
const db = new Database('signals.db');
const signals = db.prepare('SELECT * FROM signals ORDER BY date DESC').all();
```

**Option 2: API Endpoint**
Use the provided GET endpoint:
```javascript
// From your main app
const response = await fetch('https://your-backend.com/signals', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { signals } = await response.json();
```

**Option 3: Database Sync**
Periodically sync signals to your main database:
```javascript
// Cron job or scheduled task
const signals = await fetchSignalsFromLite();
await saveToMainDatabase(signals);
```

## API Reference

### POST /signals

Create a new signal.

**Headers:**
```
Authorization: Bearer {google-id-token}
Content-Type: application/json
```

**Body:**
```json
{
  "title": "string (required)",
  "body": "string (optional)",
  "date": "ISO 8601 string (required)"
}
```

**Response:**
```json
{
  "ok": true,
  "signalId": "uuid",
  "message": "Signal created successfully"
}
```

### GET /signals

Retrieve signals (for main app integration).

**Headers:**
```
Authorization: Bearer {google-id-token}
```

**Query Parameters:**
- `limit` (default: 100)
- `offset` (default: 0)
- `authorEmail` (optional filter)

**Response:**
```json
{
  "signals": [
    {
      "id": "uuid",
      "title": "string",
      "body": "string|null",
      "date": "ISO 8601 string",
      "source": "restaurant",
      "authorId": "string",
      "authorName": "string",
      "authorEmail": "string",
      "authorBrandIds": ["string"],
      "createdAt": "ISO 8601 string"
    }
  ]
}
```

## Troubleshooting

### Login Issues

**Problem:** "Login failed" error
- Check that GOOGLE_CLIENT_ID matches in both frontend and backend .env
- Verify authorized origins in Google Cloud Console
- Check browser console for detailed error

**Problem:** "Domain not allowed" error
- Verify ALLOWED_DOMAINS in backend .env includes your email domain
- Check that domain list is comma-separated with no spaces

### Offline Mode

**Problem:** Signals not sending when back online
- Check browser console for queue processing logs
- Verify localStorage is enabled
- Try manually refreshing the page

### PWA Installation

**Problem:** "Add to Home Screen" not appearing (iOS)
- Must use Safari (not Chrome or other browsers)
- Ensure you're accessing via HTTPS (or localhost for dev)
- Check that manifest.json is loading correctly

### Backend Issues

**Problem:** CORS errors
- Verify FRONTEND_URL in backend .env matches your frontend URL exactly
- Check that frontend is making requests to correct API_URL

**Problem:** Database errors
- Ensure backend has write permissions in its directory
- Check that signals.db file is created
- Try deleting signals.db and restarting to recreate

## Development Tips

### Hot Reload
Both frontend and backend support hot reload:
```bash
# Frontend (automatic with Vite)
cd frontend && npm run dev

# Backend (with --watch flag)
cd backend && npm run dev
```

### Testing Offline Mode
1. Open Chrome DevTools → Network tab
2. Select "Offline" from throttling dropdown
3. Try sending a signal
4. Check Application → Local Storage for queued signals
5. Go back online and refresh

### Viewing Database
```bash
# Install sqlite3 CLI
brew install sqlite3  # macOS

# Open database
cd backend
sqlite3 signals.db

# View signals
SELECT * FROM signals;

# Exit
.quit
```

## License

Private - Ambiente internal use only.
