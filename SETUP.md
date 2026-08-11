# Looksmax — Setup

A personal daily self-improvement / "looksmaxing" tracker. Installable to your
phone's home screen, works offline, and (optionally) syncs across devices for free.

---

## 1. Try it right now (no setup)

Just open `index.html` in a browser. It works **fully locally** — your data is
saved on that device. This is enough to start using it today.

---

## 2. Put it on your phone

A PWA needs to be served over **HTTPS** to be installable. The easy, free way:

### Option A — GitHub Pages (recommended, free, always-on)
1. Create a free account at https://github.com
2. Make a new **public** repository, e.g. `looksmax`.
3. Upload every file in this folder (keep the folder structure).
4. Repo **Settings → Pages → Build and deployment**: Source = *Deploy from a branch*,
   Branch = `main`, folder = `/ (root)`. Save.
5. Wait ~1 minute. Your app is live at
   `https://<your-username>.github.io/looksmax/`
6. Open that link **on your phone** → browser menu → **Add to Home Screen**.
   Now it launches like a real app, full-screen and offline-capable.

### Option B — quick local test on your phone (same Wi-Fi)
From this folder on your PC:
```bash
python -m http.server 8000
```
Then on your phone (same Wi-Fi) open `http://<your-pc-ip>:8000`.
Note: over plain HTTP the "install" and offline features are limited — use
Option A for the real thing.

---

## 3. Turn on free cloud sync + backup (optional)

This makes your data sync across devices and stay backed up in the cloud — **$0**
for one person.

1. Create a free project at https://supabase.com (pick any region near you).
2. In the project: **SQL Editor → New query**, paste the contents of
   `supabase-schema.sql`, and click **Run**. (Creates your tables + security.)
3. **Authentication → Providers → Email**: for personal use, turn **OFF**
   "Confirm email" so you can sign in instantly without email verification.
4. **Project Settings → API**, copy:
   - **Project URL**
   - **anon public** key
5. Paste both into `js/config.js`:
   ```js
   export const SUPABASE_URL = "https://xxxx.supabase.co";
   export const SUPABASE_ANON_KEY = "eyJhbGciOi...";
   ```
6. Re-deploy (re-upload `js/config.js` to GitHub if using Pages).
7. Open the app → tap the **Sign in** chip (top-right) → **Create account** with
   any email + password. Your data now syncs automatically. Sign in with the same
   account on any device to see the same data.

> The anon key is safe to ship in a public repo — Row Level Security (from the SQL
> script) ensures each account can only read/write its own rows.

---

## 4. Backups

Even without cloud, open the top-right chip → **Export backup** to save a JSON
file, and **Import backup** to restore it. Great before big changes.

---

## Files
| File | What it is |
|---|---|
| `index.html` | App shell |
| `css/styles.css` | Dark mobile-first styling |
| `js/app.js` | UI + screens |
| `js/store.js` | Local-first data layer + streak logic |
| `js/defaults.js` | Preloaded looksmaxing habits |
| `js/supabase-sync.js` | Optional cloud sync |
| `js/config.js` | Your Supabase keys go here |
| `sw.js`, `manifest.webmanifest` | PWA offline + install |
| `supabase-schema.sql` | Run once in Supabase |
