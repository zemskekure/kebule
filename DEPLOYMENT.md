# Signal Lite Deployment Guide

## Step-by-Step Deployment to Render

### Prerequisites
- GitHub account with `kebule` repo pushed
- Render account (https://render.com)
- Google OAuth Client ID configured

---

## Part 1: Deploy Backend (Node.js API)

### 1. Go to Render Dashboard
- Visit https://dashboard.render.com
- Click **"New +"** → **"Web Service"**

### 2. Connect Repository
- Click **"Build and deploy from a Git repository"**
- Click **"Next"**
- Connect your GitHub account if not already connected
- Select the **`kebule`** repository

### 3. Configure Service
Fill in these settings:

**Basic Settings:**
- **Name:** `signal-lite-backend`
- **Region:** Choose closest to your users (e.g., Frankfurt for Europe)
- **Branch:** `main`
- **Root Directory:** `signal-lite/backend`
- **Runtime:** `Node`

**Build & Deploy:**
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Instance Type:**
- Select **Free** (or Starter if you need always-on)

### 4. Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**

Add these variables:

```
GOOGLE_CLIENT_ID=789212077390-nhat05pvkkpca62p9cinslujtb9jn348.apps.googleusercontent.com
ALLOWED_DOMAINS=gmail.com,ambiente.cz,amanual.cz
PORT=3001
FRONTEND_URL=https://signal-lite-frontend.onrender.com
```

**Note:** We'll update `FRONTEND_URL` after deploying the frontend.

### 5. Deploy
- Click **"Create Web Service"**
- Wait 2-3 minutes for deployment
- **Copy the backend URL** (e.g., `https://signal-lite-backend.onrender.com`)

---

## Part 2: Deploy Frontend (React PWA)

### 1. Create New Static Site
- Go back to Render Dashboard
- Click **"New +"** → **"Static Site"**

### 2. Connect Repository
- Select the **`kebule`** repository again

### 3. Configure Static Site
Fill in these settings:

**Basic Settings:**
- **Name:** `signal-lite-frontend`
- **Branch:** `main`
- **Root Directory:** `signal-lite/frontend`

**Build Settings:**
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `signal-lite/frontend/dist`

### 4. Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**

Add these variables (use your backend URL from Part 1):

```
VITE_GOOGLE_CLIENT_ID=789212077390-nhat05pvkkpca62p9cinslujtb9jn348.apps.googleusercontent.com
VITE_API_URL=https://signal-lite-backend.onrender.com
```

**Replace** `signal-lite-backend.onrender.com` with your actual backend URL.

### 5. Deploy
- Click **"Create Static Site"**
- Wait 2-3 minutes for deployment
- **Copy the frontend URL** (e.g., `https://signal-lite-frontend.onrender.com`)

---

## Part 3: Update Backend Environment

### 1. Go to Backend Service
- In Render Dashboard, click on **`signal-lite-backend`**
- Go to **"Environment"** tab

### 2. Update FRONTEND_URL
- Find `FRONTEND_URL` variable
- Update it to your frontend URL: `https://signal-lite-frontend.onrender.com`
- Click **"Save Changes"**
- Service will auto-redeploy

---

## Part 4: Update Google OAuth

### 1. Go to Google Cloud Console
- Visit https://console.cloud.google.com
- Select your project
- Go to **"APIs & Services"** → **"Credentials"**

### 2. Edit OAuth Client
- Click on your OAuth 2.0 Client ID
- Add to **"Authorized JavaScript origins"**:
  ```
  https://signal-lite-frontend.onrender.com
  https://signal-lite-backend.onrender.com
  ```

- Add to **"Authorized redirect URIs"**:
  ```
  https://signal-lite-frontend.onrender.com
  ```

- Click **"Save"**

---

## Part 5: Test Deployment

### 1. Open Signal Lite
- Visit your frontend URL: `https://signal-lite-frontend.onrender.com`
- You should see the orange orb

### 2. Test Login
- Click the orb
- Login with Google (use @gmail.com, @ambiente.cz, or @amanual.cz email)
- Should redirect back successfully

### 3. Send a Test Signal
- Type a message: "Test signal from production"
- Click send
- Watch the spark fly up ✨
- Should see "Signál odeslán"

### 4. Verify Backend
- Visit: `https://signal-lite-backend.onrender.com/health`
- Should see: `{"status":"ok","timestamp":"..."}`

---

## Part 6: Install as PWA on Mobile

### iOS (iPhone/iPad)
1. Open Safari
2. Go to `https://signal-lite-frontend.onrender.com`
3. Tap **Share** button (square with arrow)
4. Scroll down and tap **"Add to Home Screen"**
5. Name it **"Signal"**
6. Tap **"Add"**
7. App icon appears on home screen!

### Android
1. Open Chrome
2. Go to `https://signal-lite-frontend.onrender.com`
3. Tap menu (3 dots)
4. Tap **"Add to Home screen"**
5. Name it **"Signal"**
6. Tap **"Add"**

---

## Part 7: Integrate with Strategy App

### Option A: Fetch Signals via API (Recommended)

Add this to your Strategy App:

```javascript
// strategy-app/src/hooks/useSignals.js
import { useState, useEffect } from 'react';

export function useSignals() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSignals() {
      try {
        // Use your Google token from your auth context
        const token = localStorage.getItem('googleToken');
        
        const response = await fetch('https://signal-lite-backend.onrender.com/signals', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        setSignals(data.signals || []);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch signals:', error);
        setLoading(false);
      }
    }

    fetchSignals();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchSignals, 30000);
    return () => clearInterval(interval);
  }, []);

  return { signals, loading };
}
```

Use it in your Strategy App:

```javascript
// strategy-app/src/App.jsx or wherever you want to show signals
import { useSignals } from './hooks/useSignals';

function SignalsFeed() {
  const { signals, loading } = useSignals();

  if (loading) return <div>Loading signals...</div>;

  return (
    <div className="signals-feed">
      <h2>Recent Signals</h2>
      {signals.map(signal => (
        <div key={signal.id} className="signal-card">
          <h3>{signal.title}</h3>
          <p>
            <strong>{signal.authorName}</strong> • {signal.source}
          </p>
          <small>{new Date(signal.date).toLocaleString('cs-CZ')}</small>
        </div>
      ))}
    </div>
  );
}
```

---

## Troubleshooting

### Backend won't start
- Check logs in Render dashboard
- Verify all environment variables are set
- Make sure `PORT=3001` is set

### Frontend shows "Failed to send signal"
- Check `VITE_API_URL` points to correct backend
- Verify CORS is enabled (it is by default)
- Check browser console for errors

### Google OAuth fails
- Verify authorized origins include your Render URLs
- Check that email domain is in `ALLOWED_DOMAINS`
- Clear browser cache and try again

### Free tier sleeps after 15 minutes
- Upgrade to Starter plan ($7/month) for always-on
- Or accept 30-second cold start on first request

---

## Custom Domain (Optional)

### 1. Add Custom Domain in Render
- Go to your Static Site settings
- Click **"Custom Domain"**
- Add your domain (e.g., `signal.ambiente.cz`)
- Follow DNS instructions

### 2. Update Environment Variables
- Update `FRONTEND_URL` in backend
- Update `VITE_API_URL` if using custom domain for backend

### 3. Update Google OAuth
- Add custom domain to authorized origins

---

## Next Steps

✅ Deploy backend
✅ Deploy frontend  
✅ Update Google OAuth
✅ Test on mobile
✅ Install as PWA
✅ Integrate with Strategy App

**Your Signal Lite is now live!** 🎉
