# 🎨 How to Add Your Orange Orb Icon

Safari is showing a default "D" icon because the icon files haven't been created yet. Here's how to fix it:

## Step 1: Save the Icon Image

1. **Save the orange orb image** you uploaded earlier
2. Save it to this exact location with this exact name:
   ```
   /Users/jancervenka/kebule/signal-lite/frontend/public/drobky-icon.png
   ```

### Quick Way to Save:
- Download the orange orb image from the chat
- Rename it to `drobky-icon.png`
- Move it to `/Users/jancervenka/kebule/signal-lite/frontend/public/`

## Step 2: Generate All Icon Sizes

Once you've saved `drobky-icon.png`, run this command:

```bash
cd /Users/jancervenka/kebule/signal-lite/frontend/public
./generate-icons.sh
```

This will automatically create:
- ✅ `pwa-512x512.png` - Main PWA icon
- ✅ `pwa-192x192.png` - Smaller PWA icon  
- ✅ `apple-touch-icon.png` - iOS home screen icon
- ✅ `favicon.png` - Browser tab icon

## Step 3: Restart and Test

```bash
# Stop your dev server (Ctrl+C if running)
# Then restart it:
cd /Users/jancervenka/kebule/signal-lite/frontend
npm run dev
```

## Step 4: Clear Safari Cache

On your iPhone/iPad:
1. Hard refresh the page (pull down to refresh)
2. Or close the tab and reopen the URL
3. Try "Add to Home Screen" again

You should now see the beautiful orange orb icon! 🎉

---

## Alternative: Manual Generation

If the script doesn't work, you can generate icons manually:

```bash
cd /Users/jancervenka/kebule/signal-lite/frontend/public

# Generate each size
sips -z 512 512 drobky-icon.png --out pwa-512x512.png
sips -z 192 192 drobky-icon.png --out pwa-192x192.png
sips -z 180 180 drobky-icon.png --out apple-touch-icon.png
sips -z 32 32 drobky-icon.png --out favicon.png
```

## Troubleshooting

**Problem: "drobky-icon.png not found"**
- Make sure you saved the image in the correct location
- Check the filename is exactly `drobky-icon.png` (lowercase)

**Problem: Icons still not showing**
- Clear browser cache
- Do a hard refresh (Cmd+Shift+R on desktop)
- Restart the dev server
- Check browser console for errors

**Problem: Low quality icons**
- Make sure your source `drobky-icon.png` is at least 512×512 pixels
- Higher resolution source = better quality icons
