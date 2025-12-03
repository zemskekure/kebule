# 📝 Terminology Update - Strategy App

## Changes Made

### Czech Terminology Standardization

**Old → New:**
- ❌ `Signál` → ✅ `Drobek`
- ❌ `Signály` → ✅ `Drobky`
- ❌ `Šiška` → ✅ `Kedlubna`

## Files Updated

### Navigation & UI Labels
- **App.jsx** - Navigation button: "Drobky"
- **EditorSidebar.jsx** - Menu items: "Kedlubna", "Drobky"

### Components
- **SignalsInbox.jsx** - All labels updated:
  - Header: "📡 Drobky"
  - Counter: "X drobků"
  - Search: "Hledat v drobcích..."
  - Empty state: "Žádné drobky"
  - Loading: "Načítání drobků..."
  - Error: "Chyba při načítání drobků"

- **DetailPanel.jsx** - All labels updated:
  - Panel title: "Editace drobku"
  - Placeholder: "Detailní popis drobku..."
  - Delete button: "Smazat drobek"
  - Theme section: "Drobky za tímto tématem"
  - Influence section: "Drobky živící tento vliv"
  - Error message: "Chyba při převodu drobku na projekt"

- **Dashboard.jsx** - Card updated:
  - Title: "📡 Drobky"
  - Empty state: "Zatím žádné drobky"
  - Help text: "Přidejte drobky v sekci Editor → Drobky"

- **SignalsFeed.jsx** (legacy) - All labels updated

### Hooks & Logic
- **useStrategyData.js** - Confirmation: "Opravdu chcete smazat tento drobek?"

## Consistency Check

✅ All user-facing Czech text updated
✅ Code variables remain in English (`signal`, `signals`) for consistency
✅ API endpoints unchanged (backend still uses `/signals`)
✅ Data structure unchanged (still `signals` array in localStorage)

## Why Keep English in Code?

- **API compatibility** - Backend uses `/signals` endpoint
- **Code readability** - Standard English naming conventions
- **Developer experience** - Easier for international collaboration
- **Only UI labels** changed to Czech for end users

## Ready to Deploy

All terminology is now consistent with the "Drobky" concept across the Strategy App UI.
