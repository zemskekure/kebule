# Signal Lite - Architecture

## Overview
Minimal PWA for account managers to capture restaurant signals with near-zero friction.

## Tech Stack

### Frontend
- **React 18** + **Vite** - Fast, minimal build setup
- **CSS Modules** - Scoped styling, no framework bloat
- **Google OAuth (client-side)** - @react-oauth/google package
- **Service Worker** - Offline support + PWA installability

### Backend
- **Node.js + Express** - Minimal API server
- **SQLite** - Simple, file-based DB (easy deployment, no external deps)
- **Google OAuth verification** - Server-side token validation
- **CORS** - Allow frontend origin

### Why this stack?
- **SQLite over Postgres**: Zero setup, single file, perfect for prototype → production path
- **Express over Supabase/Firebase**: Full control, no vendor lock-in, easier integration with existing system
- **Client-side OAuth flow**: Simpler than server-side redirect flow for PWA

## Architecture

```
┌─────────────────────────────────────────┐
│         Signal Lite PWA (React)         │
│  ┌───────────────────────────────────┐  │
│  │   Google OAuth (client-side)      │  │
│  │   → Get ID token                  │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │   Orb UI Component                │  │
│  │   - Idle pulse animation          │  │
│  │   - Tap → capture sheet           │  │
│  │   - Send → POST /signals          │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │   Offline Queue (localStorage)    │  │
│  │   - Queue signals when offline    │  │
│  │   - Auto-send when online         │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
                    │
                    │ HTTPS
                    ▼
┌─────────────────────────────────────────┐
│      Backend API (Express + SQLite)     │
│  ┌───────────────────────────────────┐  │
│  │   POST /signals                   │  │
│  │   - Verify Google ID token        │  │
│  │   - Extract user info             │  │
│  │   - Store signal + author         │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │   SQLite Database                 │  │
│  │   - signals table                 │  │
│  │   - users table                   │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │   Config: allowed domains         │  │
│  │   Config: email → brandIds map    │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Data Flow

1. **First Launch**
   - User sees "Continue with Google" button
   - OAuth flow → get ID token
   - Store token in localStorage
   - Show orb

2. **Capture Signal**
   - Tap orb → sheet opens with autofocus input
   - Type signal text
   - Tap send
   - POST to `/signals` with ID token in Authorization header
   - Backend verifies token, extracts user info, stores signal
   - Success → haptic + toast → orb returns to idle
   - Error → retry UI

3. **Offline Mode**
   - POST fails → add to localStorage queue
   - When online → auto-send queued signals
   - Clear queue on success

## Database Schema

### signals table
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
  authorBrandIds TEXT, -- JSON array as string
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### users table (optional, for caching)
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brandIds TEXT, -- JSON array as string
  lastSeen TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## Security

- **Google OAuth**: Only allow configured corporate domains (@ambiente.cz, @amanual.cz)
- **Token verification**: Every request validates ID token server-side
- **CORS**: Restrict to known frontend origin
- **No API keys in frontend**: Token is user-specific, short-lived

## Deployment

### Frontend
- Build with `npm run build`
- Deploy to Netlify/Vercel/Cloudflare Pages
- Set env var: `VITE_API_URL` and `VITE_GOOGLE_CLIENT_ID`

### Backend
- Single Node.js process
- SQLite file in same directory
- Deploy to Railway/Render/Fly.io
- Set env vars: `GOOGLE_CLIENT_ID`, `ALLOWED_DOMAINS`, `PORT`

## Integration with Main App

Signals created here use the same schema as main Thought OS.
Main app can:
- Read from same SQLite file (if co-located)
- OR: Backend exposes `GET /signals` endpoint for main app to poll
- OR: Main app connects to same DB and reads `signals` table

All fields are compatible; `authorBrandIds` is optional and auto-populated from config.
