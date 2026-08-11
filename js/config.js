// ============================================================
//  Looksmax — configuration
// ============================================================
// The app works 100% locally with NO setup. Cloud sync is optional.
//
// To turn on free cloud sync + backup (Supabase):
//   1. Create a free project at https://supabase.com
//   2. Open your project -> Settings -> API
//   3. Paste the "Project URL" and the "anon public" key below
//   4. Run the SQL in supabase-schema.sql (SQL Editor -> paste -> Run)
// Full walkthrough is in SETUP.md
//
// Leaving these blank keeps the app fully local (data on this device).
// ------------------------------------------------------------

export const SUPABASE_URL = "";      // e.g. "https://abcd1234.supabase.co"
export const SUPABASE_ANON_KEY = ""; // e.g. "eyJhbGciOi..."

export const CLOUD_ENABLED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
