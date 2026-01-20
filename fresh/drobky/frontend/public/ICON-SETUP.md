# Drobky Icon Setup

## Quick Setup Instructions

You have the orange glowing orb icon image. Follow these steps to set it up:

### Step 1: Save the Icon
1. Save the orange orb icon image to this directory as `drobky-icon.png`
2. Make sure it's at least 512x512 pixels for best quality

### Step 2: Generate Icon Sizes
Run this script from the `frontend/public` directory:

```bash
# Make sure you're in the public directory
cd /Users/jancervenka/kebule/signal-lite/frontend/public

# Generate all required icon sizes using sips (built into macOS)
sips -z 512 512 drobky-icon.png --out pwa-512x512.png
sips -z 192 192 drobky-icon.png --out pwa-192x192.png
sips -z 180 180 drobky-icon.png --out apple-touch-icon.png
sips -z 32 32 drobky-icon.png --out favicon.png

# Convert favicon.png to favicon.ico (optional, requires imagemagick)
# If you have imagemagick: convert favicon.png favicon.ico
# Otherwise, just use the PNG as favicon
```

### Step 3: Update HTML (if using PNG favicon)
If you don't convert to .ico, update the favicon reference in `index.html`:
```html
<link rel="icon" type="image/png" href="/favicon.png" />
```

### Alternative: One-Command Setup
Save your icon as `drobky-icon.png` in this directory, then run:
```bash
cd /Users/jancervenka/kebule/signal-lite/frontend/public && \
sips -z 512 512 drobky-icon.png --out pwa-512x512.png && \
sips -z 192 192 drobky-icon.png --out pwa-192x192.png && \
sips -z 180 180 drobky-icon.png --out apple-touch-icon.png && \
sips -z 32 32 drobky-icon.png --out favicon.png
```

## What Gets Created
- `pwa-512x512.png` - Main PWA icon (512x512)
- `pwa-192x192.png` - Smaller PWA icon (192x192)
- `apple-touch-icon.png` - iOS home screen icon (180x180)
- `favicon.png` - Browser tab icon (32x32)

All these files are already referenced in the manifest.json and vite.config.js!
