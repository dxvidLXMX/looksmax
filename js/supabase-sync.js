// ============================================================
//  Cloud sync (optional) — Supabase auth + two-way merge.
//  Local storage stays the source of truth; this mirrors it to
//  the cloud and merges remote changes back (last-write-wins).
// ============================================================
import { SUPABASE_URL, SUPABASE_ANON_KEY, CLOUD_ENABLED } from "./config.js";
import * as store from "./store.js";

let supabase = null;
let session = null;

// status: "off" | "signed-out" | "syncing" | "synced" | "error" | "offline"
let status = "off";
const statusListeners = new Set();
export function onStatus(fn) { statusListeners.add(fn); fn(getStatus()); return () => statusListeners.delete(fn); }
function setStatus(s, detail) { status = s; lastDetail = detail; for (const fn of statusListeners) fn(getStatus()); }
let lastDetail = "";
export function getStatus() {
  return { status, detail: lastDetail, enabled: CLOUD_ENABLED, user: session?.user?.email || null };
}

export async function initCloud() {
  if (!CLOUD_ENABLED) { setStatus("off"); return; }
  try {
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
    const { data } = await supabase.auth.getSession();
    session = data.session;
    supabase.auth.onAuthStateChange((_ev, s) => {
      session = s;
      if (session) { setStatus("syncing"); syncNow(); }
      else setStatus("signed-out");
    });

    // register a debounced push whenever local data changes
    store.setSyncHook(schedulePush);

    if (session) { setStatus("syncing"); await syncNow(); }
    else setStatus("signed-out");

    // opportunistic sync when regaining focus / connectivity
    window.addEventListener("online", () => session && syncNow());
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && session) syncNow();
    });
  } catch (e) {
    console.error("initCloud failed", e);
    setStatus("error", e.message);
  }
}

// ---------- auth ----------
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  // If email confirmation is disabled (recommended for personal use),
  // a session is returned immediately.
  session = data.session;
  return data;
}
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  session = data.session;
  return data;
}
export async function signOut() {
  await supabase.auth.signOut();
  session = null;
  setStatus("signed-out");
}

// ---------- sync ----------
let pushTimer = null;
function schedulePush() {
  if (!session) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => pushLocal().catch(e => console.warn("push failed", e)), 1200);
}

export async function syncNow() {
  if (!supabase || !session) return;
  if (!navigator.onLine) { setStatus("offline"); return; }
  setStatus("syncing");
  try {
    await pullAndMerge();
    await pushLocal();
    setStatus("synced", new Date().toLocaleTimeString());
  } catch (e) {
    console.error("sync failed", e);
    setStatus("error", e.message);
  }
}

// ----- converters (local <-> row) -----
const uid = () => session.user.id;

function habitToRow(h) {
  return {
    id: h.id, user_id: uid(), name: h.name, category: h.category, icon: h.icon,
    time_of_day: h.timeOfDay, days: h.days, sort_order: h.order ?? 0,
    active: !!h.active, deleted: !!h.deleted,
    created_at: h.createdAt ?? Date.now(), updated_at: h.updatedAt ?? Date.now(),
  };
}
function rowToHabit(r) {
  return {
    id: r.id, name: r.name, category: r.category, icon: r.icon,
    timeOfDay: r.time_of_day, days: r.days, order: r.sort_order ?? 0,
    active: !!r.active, deleted: !!r.deleted,
    createdAt: Number(r.created_at) || Date.now(),
    updatedAt: Number(r.updated_at) || Date.now(),
  };
}

async function pullAndMerge() {
  const [
    { data: rHabits, error: e1 },
    { data: rComp, error: e2 },
    { data: rWeights, error: e3 },
    { data: rProfile, error: e4 },
    { data: rWorkouts, error: e5 },
    { data: rSleep, error: e6 },
    { data: rMeals, error: e7 },
  ] = await Promise.all([
    supabase.from("habits").select("*"),
    supabase.from("completions").select("*"),
    supabase.from("weights").select("*"),
    supabase.from("profiles").select("*").maybeSingle(),
    supabase.from("workouts").select("*"),
    supabase.from("sleep_logs").select("*"),
    supabase.from("meal_plans").select("*"),
  ]);
  if (e1) throw e1;
  if (e2) throw e2;
  if (e3) throw e3;
  if (e4) throw e4;
  if (e5) throw e5;
  if (e6) throw e6;
  if (e7) throw e7;

  const s = store._getState();

  // merge habits by id, last-write-wins on updated_at
  const byId = new Map(s.habits.map(h => [h.id, h]));
  for (const r of rHabits || []) {
    const remote = rowToHabit(r);
    const local = byId.get(remote.id);
    if (!local || remote.updatedAt > (local.updatedAt || 0)) byId.set(remote.id, remote);
  }
  s.habits = [...byId.values()];

  // merge completions by (habitId, date)
  for (const r of rComp || []) {
    const date = r.date;
    const day = (s.completions[date] ||= {});
    const cur = day[r.habit_id];
    const remoteUpdated = Number(r.updated_at) || 0;
    if (!cur || remoteUpdated > (cur.updatedAt || 0)) {
      day[r.habit_id] = { done: !!r.done, at: remoteUpdated, updatedAt: remoteUpdated };
    }
  }

  // merge weigh-ins by date
  s.weights ||= {};
  for (const r of rWeights || []) {
    const cur = s.weights[r.date];
    const remoteUpdated = Number(r.updated_at) || 0;
    if (!cur || remoteUpdated > (cur.updatedAt || 0)) {
      s.weights[r.date] = { w: Number(r.weight), updatedAt: remoteUpdated };
    }
  }

  // merge workouts by id, last-write-wins
  s.workouts ||= {};
  for (const r of rWorkouts || []) {
    const remoteUpdated = Number(r.updated_at) || 0;
    const cur = s.workouts[r.id];
    if (!cur || remoteUpdated > (cur.updatedAt || 0)) {
      s.workouts[r.id] = {
        id: r.id, date: r.date, templateId: r.template_id,
        entries: r.entries || [], notes: r.notes || "",
        updatedAt: remoteUpdated, deleted: !!r.deleted,
      };
    }
  }

  // merge sleep logs by date
  s.sleepLogs ||= {};
  for (const r of rSleep || []) {
    const remoteUpdated = Number(r.updated_at) || 0;
    const cur = s.sleepLogs[r.date];
    if (!cur || remoteUpdated > (cur.updatedAt || 0)) {
      s.sleepLogs[r.date] = { bed: r.bed, wake: r.wake, quality: r.quality, updatedAt: remoteUpdated };
    }
  }

  // merge meal plans by date
  s.mealPlans ||= {};
  for (const r of rMeals || []) {
    const remoteUpdated = Number(r.updated_at) || 0;
    const cur = s.mealPlans[r.date];
    if (!cur || remoteUpdated > (cur.updatedAt || 0)) {
      s.mealPlans[r.date] = { plan: r.plan || [], done: r.done || {}, updatedAt: remoteUpdated };
    }
  }

  // merge profile + training (stored together in the single profiles row)
  if (rProfile && rProfile.data) {
    const d = rProfile.data;
    const remoteUpdated = Number(rProfile.updated_at) || 0;
    const remoteProfile = d.profile || d;         // tolerate old flat shape
    if ((remoteProfile.updatedAt || remoteUpdated) > (s.profile?.updatedAt || 0)) {
      s.profile = { ...s.profile, ...remoteProfile };
    }
    if (d.training && (d.training.updatedAt || 0) > (s.training?.updatedAt || 0)) {
      s.training = { ...s.training, ...d.training };
    }
    // custom meals ride along in the same row; merged per-id, last-write-wins
    s.customMeals ||= {};
    for (const [id, remote] of Object.entries(d.customMeals || {})) {
      const local = s.customMeals[id];
      if (!local || (remote.updatedAt || 0) > (local.updatedAt || 0)) s.customMeals[id] = remote;
    }
    // focus sessions + top-3 tasks ride along too, merged per id
    for (const coll of ["focusSessions", "tasks"]) {
      s[coll] ||= {};
      for (const [id, remote] of Object.entries(d[coll] || {})) {
        const local = s[coll][id];
        if (!local || (remote.updatedAt || 0) > (local.updatedAt || 0)) s[coll][id] = remote;
      }
    }
  }

  store._replaceState(s, { sync: false });
}

async function pushLocal() {
  if (!supabase || !session) return;
  if (!navigator.onLine) { setStatus("offline"); return; }
  const s = store._getState();

  const habitRows = s.habits.map(habitToRow);
  const compRows = [];
  for (const [date, day] of Object.entries(s.completions)) {
    for (const [habitId, rec] of Object.entries(day)) {
      compRows.push({
        user_id: uid(), habit_id: habitId, date,
        done: !!rec.done, updated_at: rec.updatedAt || rec.at || Date.now(),
      });
    }
  }

  if (habitRows.length) {
    const { error } = await supabase.from("habits").upsert(habitRows, { onConflict: "id" });
    if (error) throw error;
  }
  if (compRows.length) {
    const { error } = await supabase.from("completions")
      .upsert(compRows, { onConflict: "user_id,habit_id,date" });
    if (error) throw error;
  }

  // weigh-ins
  const weightRows = Object.entries(s.weights || {}).map(([date, rec]) => ({
    user_id: uid(), date, weight: rec.w, updated_at: rec.updatedAt || Date.now(),
  }));
  if (weightRows.length) {
    const { error } = await supabase.from("weights")
      .upsert(weightRows, { onConflict: "user_id,date" });
    if (error) throw error;
  }

  // workouts
  const workoutRows = Object.values(s.workouts || {}).map(w => ({
    id: w.id, user_id: uid(), date: w.date, template_id: w.templateId || null,
    entries: w.entries || [], notes: w.notes || "",
    deleted: !!w.deleted, updated_at: w.updatedAt || Date.now(),
  }));
  if (workoutRows.length) {
    const { error } = await supabase.from("workouts").upsert(workoutRows, { onConflict: "id" });
    if (error) throw error;
  }

  // sleep logs
  const sleepRows = Object.entries(s.sleepLogs || {}).map(([date, r]) => ({
    user_id: uid(), date, bed: r.bed || null, wake: r.wake || null,
    quality: r.quality ?? null, updated_at: r.updatedAt || Date.now(),
  }));
  if (sleepRows.length) {
    const { error } = await supabase.from("sleep_logs").upsert(sleepRows, { onConflict: "user_id,date" });
    if (error) throw error;
  }

  // meal plans
  const mealRows = Object.entries(s.mealPlans || {}).map(([date, r]) => ({
    user_id: uid(), date, plan: r.plan || [], done: r.done || {}, updated_at: r.updatedAt || Date.now(),
  }));
  if (mealRows.length) {
    const { error } = await supabase.from("meal_plans").upsert(mealRows, { onConflict: "user_id,date" });
    if (error) throw error;
  }

  // profile + training + custom meals (single row per user, stored together)
  const customMeals = s.customMeals || {};
  const focusSessions = s.focusSessions || {};
  const tasks = s.tasks || {};
  const newest = (obj) => Object.values(obj).reduce((a, m) => Math.max(a, m.updatedAt || 0), 0);
  const settingsUpdated = Math.max(
    s.profile?.updatedAt || 0, s.training?.updatedAt || 0,
    newest(customMeals), newest(focusSessions), newest(tasks));
  if (settingsUpdated) {
    const { error } = await supabase.from("profiles")
      .upsert({ user_id: uid(),
                data: { profile: s.profile, training: s.training, customMeals, focusSessions, tasks },
                updated_at: settingsUpdated },
              { onConflict: "user_id" });
    if (error) throw error;
  }
}
