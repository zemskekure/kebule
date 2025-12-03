# 🎨 UI Simplification

## Changes Made

### Removed UI Elements
1. **Restaurant dropdown** - Removed from Orb capture screen
2. **Priority toggle button** - Removed explicit "!" button

### New Behavior: Smart Priority Detection

**Type "!" at the end of your message → automatic high priority**

**Examples:**
- `"Kávovar nefunguje!"` → High priority, title saved as "Kávovar nefunguje"
- `"Nový dodavatel"` → Normal priority

**Visual Feedback:**
- When you type "!" at the end, the character counter shows: `! Vysoká priorita` in red

## Why This is Better

1. **Faster** - No clicking dropdowns or toggles
2. **Natural** - Exclamation marks already signal urgency
3. **Cleaner UI** - Less visual clutter
4. **Mobile-friendly** - Fewer taps required

## Technical Details

**Before:**
```javascript
restaurantIds: selectedRestaurant ? [selectedRestaurant] : [],
priority: isPriority ? 'high' : null
```

**After:**
```javascript
const hasPriority = trimmedInput.endsWith('!');
const cleanTitle = hasPriority ? trimmedInput.slice(0, -1).trim() : trimmedInput;

restaurantIds: [],
priority: hasPriority ? 'high' : null
```

The "!" is automatically stripped from the saved title.

## Files Changed
- `/signal-lite/frontend/src/components/Orb.jsx`
  - Removed `restaurants`, `selectedRestaurant`, `isPriority` state
  - Removed `getRestaurants()` API call
  - Added "!" detection logic
  - Removed restaurant dropdown JSX
  - Removed priority toggle button JSX
  - Added inline priority indicator in character counter
