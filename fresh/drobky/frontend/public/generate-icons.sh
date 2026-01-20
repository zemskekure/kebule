#!/bin/bash

# Drobky Icon Generator Script
# This script generates all required PWA icons from a source image

echo "🎨 Drobky Icon Generator"
echo "========================"
echo ""

# Check if source icon exists
if [ ! -f "drobky-icon.png" ]; then
    echo "❌ Error: drobky-icon.png not found in current directory"
    echo ""
    echo "Please save your orange orb icon as 'drobky-icon.png' in this directory first."
    echo "The image should be at least 512x512 pixels for best quality."
    echo ""
    echo "Current directory: $(pwd)"
    exit 1
fi

echo "✅ Found drobky-icon.png"
echo ""
echo "Generating icon sizes..."
echo ""

# Generate PWA icons using sips (built into macOS)
echo "📱 Generating pwa-512x512.png..."
sips -z 512 512 drobky-icon.png --out pwa-512x512.png >/dev/null 2>&1

echo "📱 Generating pwa-192x192.png..."
sips -z 192 192 drobky-icon.png --out pwa-192x192.png >/dev/null 2>&1

echo "🍎 Generating apple-touch-icon.png..."
sips -z 180 180 drobky-icon.png --out apple-touch-icon.png >/dev/null 2>&1

echo "🌐 Generating favicon.png..."
sips -z 32 32 drobky-icon.png --out favicon.png >/dev/null 2>&1

echo ""
echo "✨ All icons generated successfully!"
echo ""
echo "Generated files:"
ls -lh pwa-*.png apple-touch-icon.png favicon.png 2>/dev/null | awk '{print "  - " $9 " (" $5 ")"}'
echo ""
echo "🚀 Your Drobky app is now ready with the orange orb icon!"
echo ""
echo "Next steps:"
echo "  1. Restart your dev server (if running)"
echo "  2. Hard refresh your browser (Cmd+Shift+R)"
echo "  3. Try adding to home screen again"
echo ""
