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

export const SUPABASE_URL = "https://puassckgbtzoupucmqxc.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1YXNzY2tnYnR6b3VwdWNtcXhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0ODU3NzEsImV4cCI6MjEwMjA2MTc3MX0.IKlHs9s8czSB7GVNu1q5j5NVW3epucEbHvCpP9G30V8";

export const CLOUD_ENABLED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
