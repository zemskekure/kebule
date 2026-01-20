# 👋 Welcome to Signal Lite

**A minimal PWA for capturing restaurant signals with near-zero friction.**

## 🎯 What is Signal Lite?

Signal Lite is a single-purpose app designed for Ambiente account managers. It's built around one core interaction: **tap a pulsing orb → type a signal → send**. That's it.

No dashboards. No navigation. No complexity. Just one breathing button.

## 🚀 Getting Started

Choose your path:

### 1️⃣ Quick Start (5 minutes)
**Just want to run it locally?**
→ Read [QUICKSTART.md](QUICKSTART.md)

### 2️⃣ Detailed Setup (10 minutes)
**Want step-by-step instructions?**
→ Read [SETUP-GUIDE.md](SETUP-GUIDE.md)

### 3️⃣ Automated Setup (2 minutes)
**Want a script to do it for you?**
```bash
./setup.sh
```

## 📚 Documentation

### For Everyone

- **[OVERVIEW.md](OVERVIEW.md)** - Visual guide with diagrams and UI states
- **[PROJECT-SUMMARY.md](PROJECT-SUMMARY.md)** - What was built and why

### For Developers

- **[README.md](README.md)** - Complete documentation
  - Setup instructions
  - API reference
  - Deployment guide
  - Troubleshooting
  - Integration with main app

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical deep dive
  - Tech stack decisions
  - Data flow
  - Security model
  - Database schema

- **[FOLDER-STRUCTURE.md](FOLDER-STRUCTURE.md)** - Every file explained
  - What each file does
  - File relationships
  - Size reference

### For Deployment

- **[DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md)** - Step-by-step deployment
  - Pre-deployment checks
  - Backend deployment (Railway/Render/Fly.io)
  - Frontend deployment (Netlify/Vercel/Cloudflare)
  - Testing checklist
  - Troubleshooting

### For Assets

- **[frontend/public/ICONS.md](frontend/public/ICONS.md)** - PWA icon creation guide

## 🏗️ Project Structure

```
signal-lite/
├── backend/          # Express API + SQLite
├── frontend/         # React PWA
└── [docs]            # You are here
```

## ⚡ Quick Commands

```bash
# Setup (run once)
./setup.sh

# Development
cd backend && npm start        # Terminal 1
cd frontend && npm run dev     # Terminal 2

# Open app
open http://localhost:5173

# View database
sqlite3 backend/signals.db "SELECT * FROM signals;"
```

## 🎨 What It Looks Like

### Login Screen
```
┌─────────────────────────────┐
│         ╭─────────╮         │
│         │  ◉ ◉ ◉  │         │  ← Pulsing logo
│         ╰─────────╯         │
│       Signal Lite           │
│   ┌───────────────────┐     │
│   │ Continue with     │     │  ← Google OAuth
│   │ Google            │     │
│   └───────────────────┘     │
└─────────────────────────────┘
```

### Main Screen
```
┌─────────────────────────────┐
│         ╭─────────╮         │
│         │    ◉    │         │  ← Tap this orb
│         │ Signal  │         │     (breathing animation)
│         ╰─────────╯         │
└─────────────────────────────┘
```

### Capture
```
┌─────────────────────────────┐
│   ┌─────────────────────┐   │
│   │  ┌───────────────┐  │   │
│   │  │ What's        │  │   │  ← Type here
│   │  │ happening?    │  │   │
│   │  └───────────────┘  │   │
│   │  ┌───────────────┐  │   │
│   │  │ Send Signal   │  │   │  ← Tap to send
│   │  └───────────────┘  │   │
│   └─────────────────────┘   │
└─────────────────────────────┘
```

## 🎯 Key Features

✅ **Google OAuth** - One-time login, corporate domain restriction  
✅ **Pulsing Orb UI** - Single interactive element  
✅ **Offline Support** - Signals queue and auto-send  
✅ **PWA Installable** - Add to iOS/Android home screen  
✅ **Haptic Feedback** - Physical response on interactions  
✅ **Under 10 seconds** - From open to send  

## 🔧 Tech Stack

**Frontend:** React + Vite + Google OAuth + PWA  
**Backend:** Node.js + Express + SQLite  
**Total:** ~1,000 lines of code, 11 dependencies  

## 📱 iOS Installation

1. Open in Safari
2. Tap Share → "Add to Home Screen"
3. Tap icon to open as fullscreen app

## 🤝 Integration

Signals are saved with this schema:

```json
{
  "id": "uuid",
  "title": "Signal text",
  "body": null,
  "date": "2024-12-02T18:00:00.000Z",
  "source": "restaurant",
  "authorId": "google-user-id",
  "authorName": "John Doe",
  "authorEmail": "john@ambiente.cz",
  "authorBrandIds": ["brand1", "brand2"],
  "createdAt": "2024-12-02T18:00:00.000Z"
}
```

Your main app can read signals via:
- Shared SQLite database
- GET /signals API endpoint
- Periodic sync

## 🆘 Need Help?

### Common Issues

**Can't log in?**
- Check GOOGLE_CLIENT_ID is correct in both .env files
- Verify it ends with `.apps.googleusercontent.com`

**CORS errors?**
- Check FRONTEND_URL in backend .env is `http://localhost:5173`
- Restart backend after changing .env

**Can't send signals?**
- Check your email domain is in ALLOWED_DOMAINS
- Check backend terminal for errors

### Documentation

1. **Quick help** → [QUICKSTART.md](QUICKSTART.md)
2. **Detailed help** → [README.md](README.md)
3. **Technical help** → [ARCHITECTURE.md](ARCHITECTURE.md)
4. **Deployment help** → [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md)

## 📖 Documentation Map

```
START-HERE.md              ← You are here
│
├─ Quick Start
│  ├─ QUICKSTART.md        ← 5-minute setup
│  ├─ SETUP-GUIDE.md       ← 10-minute detailed setup
│  └─ setup.sh             ← Automated setup script
│
├─ Understanding
│  ├─ OVERVIEW.md          ← Visual guide with diagrams
│  └─ PROJECT-SUMMARY.md   ← What was built
│
├─ Development
│  ├─ README.md            ← Complete documentation
│  ├─ ARCHITECTURE.md      ← Technical deep dive
│  └─ FOLDER-STRUCTURE.md  ← Every file explained
│
└─ Deployment
   └─ DEPLOYMENT-CHECKLIST.md  ← Production deployment
```

## ✨ What Makes It Special

**Extreme minimalism:**
- One primary action (send signal)
- One primary UI element (orb)
- Zero navigation
- Zero configuration (for users)
- Zero learning curve

**Friction elimination:**
- Persistent login (no repeated logins)
- Autofocus input (start typing immediately)
- Haptic feedback (physical confirmation)
- Offline queue (never lose data)
- Fast animations (feels instant)

**Production ready:**
- Error handling (graceful failures)
- Offline support (works without internet)
- Security (OAuth + domain restriction)
- Scalable (SQLite → Postgres path)
- Deployable (multiple platform options)

## 🎉 Success Definition

This app should feel like:

> **"One breathing button to send quick field intelligence."**

If you can open the app and send a signal in under 10 seconds, we've succeeded.

## 🚀 Next Steps

1. **Run locally** → Follow [QUICKSTART.md](QUICKSTART.md)
2. **Understand it** → Read [OVERVIEW.md](OVERVIEW.md)
3. **Deploy it** → Follow [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md)
4. **Integrate it** → Read [README.md](README.md) integration section

---

**Ready to start?** → [QUICKSTART.md](QUICKSTART.md)

**Have questions?** → [README.md](README.md)

**Want to deploy?** → [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md)

---

Built with ❤️ for Ambiente account managers
