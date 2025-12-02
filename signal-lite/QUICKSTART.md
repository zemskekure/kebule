# Signal Lite - 5-Minute Quickstart

Get Signal Lite running locally in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- Google account (for OAuth setup)

## 1. Google OAuth (2 min)

1. Go to https://console.cloud.google.com/
2. Create project → Enable "Google+ API"
3. Credentials → Create OAuth 2.0 Client ID
4. Add origins: `http://localhost:5173`
5. Copy the Client ID

## 2. Backend (1 min)

```bash
cd signal-lite/backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
ALLOWED_DOMAINS=ambiente.cz,amanual.cz
```

Start:
```bash
npm start
```

## 3. Frontend (1 min)

New terminal:
```bash
cd signal-lite/frontend
npm install
cp .env.example .env
```

Edit `.env`:
```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_API_URL=http://localhost:3001
```

Start:
```bash
npm run dev
```

## 4. Test (1 min)

1. Open http://localhost:5173
2. Click "Continue with Google"
3. Tap the orb
4. Type a message
5. Send

Done! 🎉

## Next Steps

- Read [SETUP-GUIDE.md](SETUP-GUIDE.md) for detailed instructions
- Read [README.md](README.md) for full documentation
- Read [ARCHITECTURE.md](ARCHITECTURE.md) for technical details

## Troubleshooting

**Login fails?**
- Check Client ID is correct in both .env files
- Verify it ends with `.apps.googleusercontent.com`

**CORS error?**
- Check FRONTEND_URL in backend .env is `http://localhost:5173`
- Restart backend after changing .env

**Can't send signals?**
- Check your email domain is in ALLOWED_DOMAINS
- Check backend terminal for errors

## Production Deployment

See [README.md](README.md) section "Deployment" for:
- Railway/Render (backend)
- Netlify/Vercel (frontend)
- iOS PWA installation
