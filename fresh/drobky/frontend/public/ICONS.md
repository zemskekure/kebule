# PWA Icons Guide

You need to create the following icon files for the PWA to work properly on iOS:

## Required Icons

1. **pwa-192x192.png** - 192x192px PNG
2. **pwa-512x512.png** - 512x512px PNG
3. **apple-touch-icon.png** - 180x180px PNG (optional, for iOS)
4. **favicon.ico** - 32x32px ICO (optional, for browser tab)

## Design Guidelines

### Icon Design
- **Simple orb/circle** - Matches the app's primary UI element
- **Gradient** - White to gray radial gradient (like the pulsing orb)
- **Minimal** - No text, just the orb shape
- **High contrast** - Should work on both light and dark backgrounds

### Recommended Design
```
- Background: Transparent or solid color (#000000)
- Orb: Radial gradient from #ffffff (center) to #888888 (edges)
- Shadow: Subtle glow effect
- Padding: 10% margin from edges
```

## Quick Generation Options

### Option 1: Use Figma/Sketch
1. Create 512x512px artboard
2. Draw circle with radial gradient
3. Add subtle shadow/glow
4. Export as PNG at 512x512, 192x192, and 180x180

### Option 2: Use Online Tool
- [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
- Upload a single 512x512 image
- Downloads all required sizes

### Option 3: Use ImageMagick (CLI)
```bash
# Create a simple gradient orb
convert -size 512x512 radial-gradient:white-gray \
  -alpha set -channel A -evaluate set 100% \
  pwa-512x512.png

# Resize for other sizes
convert pwa-512x512.png -resize 192x192 pwa-192x192.png
convert pwa-512x512.png -resize 180x180 apple-touch-icon.png
```

### Option 4: Use Placeholder (Temporary)
For quick testing, you can use the Vite logo temporarily:
```bash
cd public
cp vite.svg pwa-192x192.png  # Not ideal, but works for testing
cp vite.svg pwa-512x512.png
```

## Installation

Once created, place all icon files in the `frontend/public/` directory:

```
frontend/public/
├── pwa-192x192.png
├── pwa-512x512.png
├── apple-touch-icon.png
├── favicon.ico
└── manifest.json
```

The PWA will automatically use these icons when installed on iOS.
