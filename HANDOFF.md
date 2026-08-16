# Looksmax App — Agent Handoff

**Date:** 2026-08-15
**App URL:** https://dxvidlxmx.github.io/looksmax/
**GitHub:** https://github.com/dxvidLXMX/looksmax
**Supabase project:** https://puassckgbtzoupucmqxc.supabase.co
**Working directory:** `O:\Claude saves\looksmax-app`

---

## What the app is

A personal looksmaxing / self-improvement PWA for David. Local-first vanilla JS, installable to phone home screen, optional Supabase cloud sync. No frameworks, no build step — just static files on GitHub Pages.

**Stack:** Vanilla JS (ES modules), CSS custom properties, localStorage source of truth, Supabase for optional cloud sync, GitHub Pages hosting.

---

## Full feature list (all shipped)

### Bottom nav tabs: Today · Gym · Eat · Body · More

| Tab | Features |
|-----|----------|
| **Today** | Daily habit tracker (Morning/Evening/Anytime), progress ring, streak counter, **💧 Water tracker** (glass counter, + / − buttons, 8-glass default, progress bar) |
| **Gym** | Program coach, 4 splits (Upper/Lower, PPL, Full Body, Bro Split), double-progression, live session logger, rest timer, PR detection, per-exercise strength chart |
| **Eat** | Meal plan generator (12 options/slot), swap meals, ✓ as you eat, macro bars, diet settings, 🛒 grocery list (today + week mode), **📋 recipe modal** on every meal, **🔍 Log food** — MyFitnessPal-style search over a 470-item food database (US chains + whole foods) with quantity stepper and slot picker, your own saved custom meals, **📷 barcode scanning**, and Open Food Facts online lookup |
| **Body** | Weight log, SVG trend chart, TDEE calculator, goal mode (lose/maintain/gain), ETA to target |
| **More** | Hub: Skin, Sleep, Supplements, History, Habits, Account |

### More hub sub-screens

| Sub | Features |
|-----|----------|
| **Skin** | Daily check-in (condition 1–5, acne, oiliness), AM/PM routine tracker (tap to check off steps), editable product names, 30-day trend chart, tips |
| **Sleep** | Gradual schedule fixer (15 min/2 days), tonight's target, sleep log (bed/wake/quality), hours-slept trend chart, tips |
| **Supplements** | Evidence-tiered stack (Core/Situational/Blueprint-skip), one-tap add to habits |
| **History** | GitHub-style heatmap (12 weeks), 30-day avg, perfect days |
| **Habits** | Add/edit/delete habits, category, time-of-day, schedule |
| **Account** | Supabase sign in/up, sync now, JSON export/import, reset |

---

## File structure

```
looksmax-app/
├── index.html
├── css/styles.css          # All styles (dark mobile-first)
├── js/
│   ├── app.js              # All UI rendering + event handling
│   ├── store.js            # localStorage data layer
│   ├── defaults.js         # Preloaded habits + category icons
│   ├── nutrition.js        # Meal library (12/slot), plan generator, grocery, recipes
│   ├── foods.js            # 470-item food DB (US chains + whole foods) + ranked search
│   ├── off.js              # Open Food Facts: text search + barcode lookup
│   ├── scanner.js          # Barcode scanning via ZXing (loaded from CDN at first use)
│   ├── supplements.js      # Supplement stack data
│   ├── program.js          # Training splits, exercise library, e1RM, prescribe
│   ├── supabase-sync.js    # Two-way cloud sync (pull+merge, push, auth)
│   └── config.js           # Supabase URL + anon key
├── sw.js                   # Service worker v12 (stale-while-revalidate)
├── manifest.webmanifest
├── supabase-schema.sql     # Already run on Supabase — DO NOT run again
└── SETUP.md
```

---

## Data model (localStorage key: `looksmax.v1`)

```
state = {
  habits:        [...],          // habit definitions
  completions:   {},             // { "YYYY-MM-DD": { habitId: {done, at, updatedAt} } }
  weights:       {},             // { "YYYY-MM-DD": { w: Number, updatedAt } }
  workouts:      {},             // { id: { id, date, templateId, entries, completed, updatedAt } }
  mealPlans:     {},             // { "YYYY-MM-DD": { plan, done, updatedAt } }
  sleepLogs:     {},             // { "YYYY-MM-DD": { bed, wake, quality, updatedAt } }
  skinLogs:      {},             // { "YYYY-MM-DD": { condition, acne, oiliness, amDone, pmDone, updatedAt } }
  waterLogs:     {},             // { "YYYY-MM-DD": { glasses: N, updatedAt } }
  customMeals:   {},             // { id: { id, name, slot, kcal, p, c, f, lastUsed, updatedAt, deleted } }
  groceryChecked:{},             // { scopeKey: { itemKey: bool } } — local only
  profile: {
    units, sex, heightCm, age, activity,
    goalMode, targetWeight, weeklyRate,
    calorieTarget, proteinTarget,           // null = auto
    diet:  { type, avoid, mealsPerDay },
    sleep: { targetBed, targetWake, currentBed, planStart },
    skin:  { amSteps: [{id, name, product}], pmSteps: [...] },
    waterTarget: 8,
    updatedAt
  },
  training: {
    configured, experience, goal, equipment,
    days: [weekday numbers],
    splitId: "ul4"|"ppl3"|"fb3"|"bro5",
    updatedAt
  },
  meta: { installedAt }
}
```

---

## Gym splits available

| splitId | Name | Templates | Recommended days |
|---------|------|-----------|-----------------|
| `ul4` | Upper / Lower (4-day) | upperA, lowerA, upperB, lowerB | 4 |
| `ppl3` | Push / Pull / Legs | push, pull, legs | 3 (or 6 for 2×) |
| `fb3` | Full Body (3-day) | fullBodyA, fullBodyB, fullBodyA | 3 |
| `bro5` | Bro Split (5-day) | chest, back, shoulders, armsDay, legsDay | 5 |

---

## Supabase setup status

| Step | Status |
|------|--------|
| Project created | ✅ |
| Schema SQL run | ✅ |
| Keys in config.js | ✅ |
| Deployed to GitHub | ✅ |
| Email confirmation disabled | ✅ |
| Account created + signed in | ✅ (2026-08-15) |

**Custom meals sync note:** they ride along inside the existing `profiles.data` JSON
blob (`{ profile, training, customMeals }`), merged per-id last-write-wins. No new
table, so `supabase-schema.sql` still must not be re-run.

---

## Deploy instructions

```bash
cd "O:/Claude saves/looksmax-app"
# make changes...
git add <files>
git -c commit.gpgsign=false commit -m "Description"
git push origin main
# GitHub Pages deploys in ~1 min
# SW stale-while-revalidate — users get update on 2nd load
```

**Bump `CACHE` in `sw.js`** if you need to force-evict the cache on all devices immediately. Currently at `looksmax-v12`.

---

## Dev server

`.claude/launch.json` has a `looksmax` config running `python -m http.server 8002`. The other chat's server uses port 8001 — use 8002 to avoid conflicts. Start with `preview_start({ name: "looksmax" })`.

---

## Known gotchas

- **SW cache** — after JS/CSS changes, bump `CACHE` in `sw.js` OR rely on stale-while-revalidate (users get new version on second load automatically).
- **TDZ bug** — `load()` in store.js must NOT assign the module-level `let state` during its own initializer; write to localStorage directly in first-run path.
- **Screenshot** — `computer({action:"screenshot"})` fails when browser pane isn't displayed. Use `javascript_tool` DOM checks instead.
- **store.onChange triggers render** — tapping a skin/routine step or water button causes a full re-render; DOM references go stale. Check outcomes via localStorage or freshly queried DOM selectors.
- **nutrition.js `quick` field removed** — the `quick: true` flag was on all original meals but dropped in the expansion. The generator doesn't use it. Don't add it back.
- **Eat totals are a log, not a forecast.** The macro bars sum only plan items whose `done[idx]` is true, so the day starts at 0 and fills as meals are ticked. `macroSummary(eaten, planned, target)` still shows the full plan total on a muted line, because the generator scales servings to hit the calorie target and that reference would otherwise be invisible.
- **`mealPlans[key].done` is index-keyed** — any code that adds/removes plan items must reindex it (`store.removePlanItem`) or clear the stale flag at the new index (`store.addPlanItem`), or ticks land on the wrong meal.
- **Three kinds of plan item.** A `mealPlans[key].plan[]` entry's `mealId` points at one of: the food DB (`f_*`, in foods.js), a saved custom meal (`custom_*`, in `state.customMeals`), or the generated library (bare id, in nutrition.js `MEALS`). Always resolve via `nutrition.resolveMeal(mealId, customs)` and test with `nutrition.isLogged(mealId, customs)` — `mealById()` alone returns null for the first two. `planTotals(plan, customs)` needs the customs map passed in.
- **Logged items (food DB + custom) are deliberately special-cased**: skipped by the grocery list (no `ing` field), and preserved by "regenerate plan" via `regeneratePlan()` in app.js, because they record what you actually ate rather than a suggestion.
- **foods.js search ranking** uses two curated sets, `POPULAR` (+60) and `CANONICAL` (+50). Without them a search for "egg" surfaced "Egg yolk" above "Egg, large (whole)" on name length alone. Add new staples to those sets or they'll rank badly.
- **Food values are approximations.** Whole foods follow USDA; chain items approximate published US figures and drift as menus change. The picker's "✎ adjust" prefills the custom-meal form from a food so a wrong number can be saved as the user's own corrected copy.
- **Open Food Facts rate-limits search, and a throttled request fails as an opaque `TypeError: Failed to fetch`** — not a readable 429, because the error response carries no CORS headers. Never search as-you-type; off.js is only ever called from an explicit button press, and the error copy names throttling as the likely cause. Testing it repeatedly in one sitting will exhaust the quota and make working code look broken.
- **Barcode scanning always uses ZXing, never `BarcodeDetector`.** iOS Safari doesn't implement the native API and an installed PWA on iPhone runs on Safari's engine, so the native branch would be dead code on the target device. ZXing is imported from `esm.sh` on first scan (same runtime-CDN pattern as supabase-js), which is why scanning needs a connection the first time. Verified the decode path by generating an EAN-13 canvas and decoding it back.
- **`getUserMedia` needs a secure context** — fine on GitHub Pages (HTTPS) and `localhost`, but testing over `http://<LAN-IP>:8002` from a phone will silently fail the permission check.
- **Always release the camera before wiping the modal.** `closeModal()` calls `scanner.stopScan()` + `releaseVideo()` first, because clearing `#modal`'s innerHTML destroys the `<video>` while leaving its `MediaStream` live — the camera indicator stays lit. Same reason `closeScanner()` is synchronous: awaiting teardown before hiding the panel left it visibly stuck.
- **The scanner markup lives outside `#cm-results`.** `refreshPicker()` replaces that element's innerHTML on every keystroke; a `<video>` inside it would be destroyed mid-scan.
- **Online results are never referenced directly by a plan item.** `pick-add` converts an `off_*` result into a saved custom meal first, so the logged entry still resolves offline and syncs like any other. This is why there is no third sync table and no `off` resolve path.

---

## Potential next features (David's ideas + gaps)

- **Grams / unit conversion** — foods currently have one canonical serving each plus a quantity multiplier. A `grams` field per food would allow "150 g chicken breast".
- **Progress photos** — log physical appearance over time
- **Google/GitHub OAuth** — one-tap sign-in
- **Realtime Supabase sync** — two open tabs stay live
- **More skin routine steps** — let users add/remove steps (currently fixed 4 AM + 3 PM)
- **Grooming tracker** — haircut schedule, beard routine (very on-brand for looksmaxing)
- **Supplement log** — track which supplements were actually taken each day (currently just a reference list)
- **Water target customisation** — currently hardcoded default 8, stored in `profile.waterTarget` but no UI to change it yet

---

## Memory note

David's preferences: he typically says "whatever you deem better" when asked to choose — make a recommendation and get brief confirmation before large builds. Always surface architecture tradeoffs before implementing. He wants the app to feel polished and daily-usable, not cluttered.
