# Looksmax App — Agent Handoff

**Date:** 2026-08-11  
**App URL:** https://dxvidlxmx.github.io/looksmax/  
**GitHub:** https://github.com/dxvidLXMX/looksmax  
**Supabase project:** https://puassckgbtzoupucmqxc.supabase.co  
**Working directory:** `O:\Claude saves\looksmax-app`

---

## What the app is

A personal looksmaxing / self-improvement PWA for David. Local-first vanilla JS, installable to phone home screen, optional Supabase cloud sync. No frameworks, no build step — just static files on GitHub Pages.

**Stack:** Vanilla JS (ES modules), CSS custom properties, localStorage source of truth, Supabase for optional cloud sync, GitHub Pages hosting.

---

## What's been built (all shipped to GitHub)

### Session 1 (previous export)
| Tab | What it does |
|-----|-------------|
| **Today** | Daily habit tracker — preloaded looksmaxing habits (skincare, sunscreen, supplements, gym, water, sleep), streak counter, completion rings |
| **Gym** | Training program — beginner/intermediate/advanced, muscle/strength/lean goals, gym/dumbbells/bodyweight/barbell splits, live workout session with rest timer, e1RM tracking, PR detection |
| **Eat** | Meal planner — generates breakfast/lunch/dinner/snacks from calorie + protein targets (set in Body tab), swap meals, tap ✓ as you eat, macros re-total live |
| **Body** | Weight tracking — log weigh-ins, trend chart, TDEE calculator (Mifflin-St Jeor), goal mode (lose/maintain/gain), ETA to goal |
| **More hub** | Container for: Sleep, Supplements, History, Habits manager, Account & sync |
| **Sleep** | Gradual schedule fixer (15 min shift every 2 days), tonight's target bedtime, sleep log + trend, evidence-based checklist |
| **Supplements** | Evidence-tiered stack — Core (creatine, D3, omega-3, magnesium, whey), Situational (zinc, melatonin, L-theanine), Blueprint-skip list. One tap adds any to daily habits |

### Session 2 (this session)
- **Grocery list** added to Eat tab — 🛒 button in header toggles it open
  - **Today mode:** aggregates + deduplicates all ingredients from today's plan, grouped by category (Protein 🥩, Produce 🥬, Dairy 🥛, Grains 🌾, Pantry 🫙)
  - **Week mode:** generates 7 days of deterministic meal plans, shows each ingredient once with `×N servings` badge
  - Tap to check off items, progress counter (e.g. `1/14`), Clear ✓ button
  - Checked state persists in localStorage
- **Supabase cloud sync configured** — keys added to `js/config.js`, schema already deployed to Supabase
- **Service worker fixed** — was cache-first (v4), never updated. Bumped to v5 + switched to **stale-while-revalidate** (serves cache instantly, fetches fresh in background, next load gets update automatically)

---

## File structure

```
looksmax-app/
├── index.html              # App shell, nav, modal placeholder
├── css/styles.css          # All styles (dark mobile-first)
├── js/
│   ├── app.js              # All UI rendering + event handling
│   ├── store.js            # localStorage data layer
│   ├── defaults.js         # Preloaded habits + category icons
│   ├── nutrition.js        # Meal library, plan generator, grocery list logic
│   ├── supplements.js      # Supplement stack data
│   ├── program.js          # Training splits, exercise library, e1RM
│   ├── supabase-sync.js    # Two-way cloud sync (pull+merge, push, auth)
│   └── config.js           # Supabase URL + anon key (filled in)
├── sw.js                   # Service worker (stale-while-revalidate)
├── manifest.webmanifest    # PWA manifest
├── supabase-schema.sql     # Already run on Supabase — DO NOT run again
└── SETUP.md                # Setup walkthrough for reference
```

---

## Supabase setup status

| Step | Status |
|------|--------|
| Project created | ✅ |
| Schema SQL run | ✅ (tables + RLS policies all created) |
| Keys in config.js | ✅ |
| Deployed to GitHub | ✅ |
| Email confirmation disabled | ⚠️ **NOT DONE YET** — David needs to go to Authentication → Sign In / Providers → Email → turn OFF "Confirm email" |
| Account created in app | ⚠️ **NOT DONE YET** — David needs to open the app, tap "Sign in" chip, create account |

---

## Pending / known issues

1. **App not updating on David's device** — The old v4 service worker cache is stuck. He needs a **one-time hard refresh** (`Ctrl+Shift+R` desktop, or clear site cache on phone). After that, stale-while-revalidate handles future updates automatically.

2. **Supabase email confirmation** — Must be disabled before account creation works without email verification (step above).

3. **Grocery list doesn't sync to cloud** — `groceryChecked` state in store is intentionally local-only (`sync: false`). This is fine — it's ephemeral shopping state.

---

## Potential next features (David mentioned or hinted at)

- **More meal variety** — current library has ~5 options per slot, gets repetitive. Expand to 10–15 per slot.
- **Skin / acne tracker** — David mentioned this in session 1 as a desired feature ("anti acne stuff")
- **Realtime sync** — use Supabase Realtime subscriptions so two open tabs stay live-synced
- **Google/GitHub OAuth** — one-click sign-in instead of email/password
- **Progress photos** — mentioned wanting to track physical appearance over time

---

## Key data model notes

- All data lives in `localStorage` under key `looksmax.v1`
- `store.js` is the single source of truth — all reads/writes go through it
- Cloud sync is last-write-wins on `updatedAt` timestamps
- Meal plans are seeded by date string — same date always generates the same plan (deterministic), swaps are saved per-date
- Service worker cache name: `looksmax-v5` — bump this if you need to force a full refresh on all devices

---

## How to deploy changes

```bash
cd "O:/Claude saves/looksmax-app"
# make changes...
git add <files>
git commit -m "Description"
git push origin main
# GitHub Pages deploys in ~1 min
# SW stale-while-revalidate means users get update on 2nd load (no version bump needed)
```

Only bump `CACHE` in `sw.js` if you need to force-evict the cache on all devices immediately (e.g. breaking schema change).
