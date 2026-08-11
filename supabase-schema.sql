-- ============================================================
--  Looksmax — Supabase schema
--  Run this once in your Supabase project:
--    Dashboard -> SQL Editor -> New query -> paste -> Run
--  Row Level Security ensures each user only sees their own data.
-- ============================================================

-- ---------- habits ----------
create table if not exists public.habits (
  id          uuid primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  category    text,
  icon        text,
  time_of_day text,
  days        jsonb,          -- "daily" or [0,1,2...] weekday numbers
  sort_order  int default 0,
  active      boolean default true,
  deleted     boolean default false,
  created_at  bigint,         -- epoch ms
  updated_at  bigint          -- epoch ms (last-write-wins)
);

-- ---------- completions ----------
create table if not exists public.completions (
  user_id    uuid not null references auth.users (id) on delete cascade,
  habit_id   uuid not null,
  date       text not null,   -- "YYYY-MM-DD"
  done       boolean default false,
  updated_at bigint,          -- epoch ms
  primary key (user_id, habit_id, date)
);

-- ---------- weigh-ins ----------
create table if not exists public.weights (
  user_id    uuid not null references auth.users (id) on delete cascade,
  date       text not null,   -- "YYYY-MM-DD"
  weight     double precision not null,
  updated_at bigint,          -- epoch ms
  primary key (user_id, date)
);

-- ---------- profile (single row per user) ----------
create table if not exists public.profiles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb,           -- units, sex, height, goal, targets, etc.
  updated_at bigint
);

-- ---------- workouts ----------
create table if not exists public.workouts (
  id          uuid primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  date        text not null,   -- "YYYY-MM-DD"
  template_id text,
  entries     jsonb,           -- [{exId, sets:[{w,reps,done}]}]
  notes       text,
  deleted     boolean default false,
  updated_at  bigint
);

-- ---------- Row Level Security ----------
alter table public.habits      enable row level security;
alter table public.completions enable row level security;
alter table public.weights     enable row level security;
alter table public.profiles    enable row level security;
alter table public.workouts    enable row level security;

-- habits policies
drop policy if exists "own habits select" on public.habits;
drop policy if exists "own habits insert" on public.habits;
drop policy if exists "own habits update" on public.habits;
drop policy if exists "own habits delete" on public.habits;
create policy "own habits select" on public.habits for select using (auth.uid() = user_id);
create policy "own habits insert" on public.habits for insert with check (auth.uid() = user_id);
create policy "own habits update" on public.habits for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own habits delete" on public.habits for delete using (auth.uid() = user_id);

-- completions policies
drop policy if exists "own comp select" on public.completions;
drop policy if exists "own comp insert" on public.completions;
drop policy if exists "own comp update" on public.completions;
drop policy if exists "own comp delete" on public.completions;
create policy "own comp select" on public.completions for select using (auth.uid() = user_id);
create policy "own comp insert" on public.completions for insert with check (auth.uid() = user_id);
create policy "own comp update" on public.completions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own comp delete" on public.completions for delete using (auth.uid() = user_id);

-- weights policies
drop policy if exists "own weights select" on public.weights;
drop policy if exists "own weights insert" on public.weights;
drop policy if exists "own weights update" on public.weights;
drop policy if exists "own weights delete" on public.weights;
create policy "own weights select" on public.weights for select using (auth.uid() = user_id);
create policy "own weights insert" on public.weights for insert with check (auth.uid() = user_id);
create policy "own weights update" on public.weights for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own weights delete" on public.weights for delete using (auth.uid() = user_id);

-- profiles policies
drop policy if exists "own profile select" on public.profiles;
drop policy if exists "own profile insert" on public.profiles;
drop policy if exists "own profile update" on public.profiles;
create policy "own profile select" on public.profiles for select using (auth.uid() = user_id);
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = user_id);
create policy "own profile update" on public.profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- workouts policies
drop policy if exists "own workouts select" on public.workouts;
drop policy if exists "own workouts insert" on public.workouts;
drop policy if exists "own workouts update" on public.workouts;
drop policy if exists "own workouts delete" on public.workouts;
create policy "own workouts select" on public.workouts for select using (auth.uid() = user_id);
create policy "own workouts insert" on public.workouts for insert with check (auth.uid() = user_id);
create policy "own workouts update" on public.workouts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own workouts delete" on public.workouts for delete using (auth.uid() = user_id);
