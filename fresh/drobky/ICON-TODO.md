# Icon Setup - Final Step

## What's Been Done ✅
- All text changed from "Signal" to "Drobek/Drobky"
- Success message now says "Děkujeme za drobek!" (Thank you for the drobek!)
- All manifest files updated with Drobky branding
- HTML metadata updated

## What You Need to Do 🎯

### Save the Orange Orb Icon

1. **Save the icon image** you uploaded to:
   ```
   /Users/jancervenka/kebule/signal-lite/frontend/public/drobky-icon.png
   ```

2. **Run this command** to generate all required icon sizes:
   ```bash
   cd /Users/jancervenka/kebule/signal-lite/frontend/public && \
   sips -z 512 512 drobky-icon.png --out pwa-512x512.png && \
   sips -z 192 192 drobky-icon.png --out pwa-192x192.png && \
   sips -z 180 180 drobky-icon.png --out apple-touch-icon.png && \
   sips -z 32 32 drobky-icon.png --out favicon.png
   ```

3. **Update the favicon reference** in `frontend/index.html`:
   Change line 5 from:
   ```html
   <link rel="icon" type="image/svg+xml" href="/vite.svg" />
   ```
   To:
   ```html
   <link rel="icon" type="image/png" href="/favicon.png" />
   ```

### That's It!

After completing these steps, your Drobky app will have:
- ✅ The beautiful orange glowing orb as its icon
- ✅ Proper PWA icons for iOS installation
- ✅ Favicon for browser tabs
- ✅ All branding updated to "Drobky"
- ✅ Czech thank you message: "Děkujeme za drobek!"

## Quick Test
After setup, test by:
1. Starting the dev server: `cd frontend && npm run dev`
2. Opening http://localhost:5173
3. Checking that the favicon appears in the browser tab
4. Installing as PWA on iOS to see the home screen icon
