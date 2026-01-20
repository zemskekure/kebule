# Signal Lite - Complete Folder Structure

```
signal-lite/
│
├── ARCHITECTURE.md              # Technical architecture documentation
├── README.md                    # Main documentation
├── SETUP-GUIDE.md              # Quick setup instructions
├── FOLDER-STRUCTURE.md         # This file
│
├── backend/                     # Express API server
│   ├── server.js               # Main server file (routes, auth, DB)
│   ├── package.json            # Node dependencies
│   ├── .env.example            # Environment variables template
│   ├── .gitignore              # Git ignore rules
│   ├── config.example.json     # Brand mapping config example
│   │
│   └── [Generated at runtime]
│       ├── .env                # Your environment config (git-ignored)
│       ├── node_modules/       # Dependencies (git-ignored)
│       └── signals.db          # SQLite database (git-ignored)
│
└── frontend/                    # React PWA
    ├── public/                 # Static assets
    │   ├── manifest.json       # PWA manifest
    │   ├── ICONS.md           # Icon creation guide
    │   │
    │   └── [You need to add]
    │       ├── pwa-192x192.png     # PWA icon 192x192
    │       ├── pwa-512x512.png     # PWA icon 512x512
    │       ├── apple-touch-icon.png # iOS icon 180x180
    │       └── favicon.ico         # Browser tab icon
    │
    ├── src/
    │   ├── components/
    │   │   ├── LoginScreen.jsx    # Google OAuth login UI
    │   │   ├── LoginScreen.css
    │   │   ├── Orb.jsx            # Main pulsing orb component
    │   │   └── Orb.css
    │   │
    │   ├── utils/
    │   │   ├── auth.js            # Token storage helpers
    │   │   ├── api.js             # API call functions
    │   │   └── offlineQueue.js    # Offline signal queue
    │   │
    │   ├── App.jsx                # Main app component
    │   ├── App.css
    │   ├── main.jsx               # React entry point
    │   └── index.css              # Global styles
    │
    ├── index.html                 # HTML entry point
    ├── vite.config.js            # Vite + PWA config
    ├── package.json              # Frontend dependencies
    ├── .env.example              # Environment variables template
    ├── .gitignore                # Git ignore rules
    │
    └── [Generated at runtime]
        ├── .env                  # Your environment config (git-ignored)
        ├── node_modules/         # Dependencies (git-ignored)
        └── dist/                 # Production build (git-ignored)
```

## File Descriptions

### Root Level

- **ARCHITECTURE.md** - Deep dive into technical decisions, data flow, and system design
- **README.md** - Complete documentation including setup, deployment, API reference, and troubleshooting
- **SETUP-GUIDE.md** - Step-by-step quick start guide (10 minutes to running app)
- **FOLDER-STRUCTURE.md** - This file, explains every file and folder

### Backend Files

#### Core Files
- **server.js** (300 lines)
  - Express server setup
  - Google OAuth token verification middleware
  - SQLite database initialization
  - POST /signals endpoint (create signal)
  - GET /signals endpoint (retrieve signals)
  - Health check endpoint
  - CORS configuration

#### Configuration
- **package.json**
  - Dependencies: express, cors, google-auth-library, better-sqlite3, dotenv
  - Scripts: start, dev (with --watch)

- **.env.example**
  - Template for environment variables
  - Copy to .env and fill in your values

- **config.example.json**
  - Optional: JSON-based brand mapping
  - Alternative to env var approach

#### Generated Files (not in git)
- **.env** - Your actual environment configuration
- **node_modules/** - Installed npm packages
- **signals.db** - SQLite database file
  - Contains `signals` table (all signal data)
  - Contains `users` table (user cache)

### Frontend Files

#### Public Assets
- **manifest.json**
  - PWA configuration
  - App name, theme colors, icons
  - Display mode: standalone

- **ICONS.md**
  - Guide for creating PWA icons
  - Design guidelines
  - Generation options

- **Icons (you create these)**
  - pwa-192x192.png
  - pwa-512x512.png
  - apple-touch-icon.png
  - favicon.ico

#### Source Code

**Components:**
- **LoginScreen.jsx** (~40 lines)
  - Google OAuth button
  - Logo animation
  - Handles login success/error

- **Orb.jsx** (~150 lines)
  - Main interactive orb
  - State machine: idle → capture → sending → success/error
  - Capture sheet with textarea
  - Offline indicator
  - Haptic feedback

**Utils:**
- **auth.js** (~30 lines)
  - storeToken() - Save to localStorage
  - getStoredToken() - Retrieve from localStorage
  - clearToken() - Remove from localStorage

- **api.js** (~40 lines)
  - sendSignal() - POST to /signals
  - getSignals() - GET from /signals
  - Authorization header handling

- **offlineQueue.js** (~70 lines)
  - queueSignal() - Add to localStorage queue
  - getQueue() - Retrieve queue
  - clearQueue() - Empty queue
  - processOfflineQueue() - Send all queued signals

**App Files:**
- **App.jsx** (~60 lines)
  - Main app component
  - Auth state management
  - Login/logout flow
  - Online/offline event listeners

- **main.jsx** (~15 lines)
  - React entry point
  - GoogleOAuthProvider wrapper

**Styles:**
- **index.css** - Global resets, iOS safe area
- **App.css** - App container, loading spinner
- **LoginScreen.css** - Login screen layout, logo animation
- **Orb.css** - Orb animations, capture sheet, all states

#### Configuration
- **vite.config.js**
  - Vite setup
  - PWA plugin configuration
  - Service worker settings
  - Manifest generation

- **package.json**
  - Dependencies: react, react-dom, @react-oauth/google
  - Dev dependencies: vite, @vitejs/plugin-react, vite-plugin-pwa
  - Scripts: dev, build, preview

- **.env.example**
  - Template for environment variables
  - Copy to .env and fill in your values

#### Generated Files (not in git)
- **.env** - Your actual environment configuration
- **node_modules/** - Installed npm packages
- **dist/** - Production build output

## Key Relationships

### Data Flow
```
User → LoginScreen → Google OAuth → Token
Token → localStorage → App state
User taps Orb → Capture sheet → Input text
User sends → api.js → POST /signals → Backend
Backend → Verify token → Store in SQLite
Success → Orb animation → Reset to idle
```

### Offline Flow
```
User sends (offline) → offlineQueue.js → localStorage
Network back online → processOfflineQueue()
Queue → api.js → POST /signals → Backend
Success → Clear queue
```

### File Dependencies
```
main.jsx
  └── App.jsx
      ├── LoginScreen.jsx
      │   └── @react-oauth/google
      └── Orb.jsx
          ├── utils/api.js
          ├── utils/auth.js
          └── utils/offlineQueue.js
```

## What You Need to Provide

1. **Google OAuth Client ID**
   - Get from Google Cloud Console
   - Add to both backend/.env and frontend/.env

2. **PWA Icons**
   - Create 192x192 and 512x512 PNG files
   - Place in frontend/public/
   - See ICONS.md for guidelines

3. **Environment Configuration**
   - Copy .env.example to .env in both directories
   - Fill in your values

4. **Domain Configuration**
   - Set ALLOWED_DOMAINS in backend/.env
   - Optional: Set BRAND_MAPPING for auto-tagging

## What Gets Generated

1. **SQLite Database** (backend/signals.db)
   - Created automatically on first run
   - Contains all signals and users

2. **Service Worker** (frontend/dist/sw.js)
   - Generated by vite-plugin-pwa during build
   - Handles offline caching

3. **Build Output** (frontend/dist/)
   - Generated by `npm run build`
   - Ready for deployment

## Git Strategy

**Tracked files:**
- All source code (.js, .jsx, .css)
- Configuration templates (.example files)
- Documentation (.md files)
- Package files (package.json)

**Ignored files:**
- Environment configs (.env)
- Dependencies (node_modules/)
- Database files (*.db)
- Build output (dist/)
- Editor configs (.vscode/, .idea/)

## Size Reference

**Total source code:** ~1,000 lines
- Backend: ~300 lines (1 file)
- Frontend: ~700 lines (12 files)
- Config/docs: ~2,000 lines (5 files)

**Dependencies:**
- Backend: 5 packages
- Frontend: 6 packages

**Bundle size (production):**
- Frontend: ~150KB gzipped
- Backend: Single Node.js process

## Development Workflow

1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Make changes to source files
4. Both auto-reload on save
5. Test in browser at localhost:5173
6. Check backend logs in terminal
7. Inspect SQLite DB: `sqlite3 backend/signals.db`

## Deployment Workflow

1. Build frontend: `cd frontend && npm run build`
2. Deploy frontend/dist/ to Netlify/Vercel
3. Deploy backend/ to Railway/Render
4. Set environment variables on both platforms
5. Update Google OAuth with production URLs
6. Test production deployment
7. Install PWA on iOS device
