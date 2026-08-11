// ============================================================
//  Store — local-first data layer (localStorage source of truth).
//  Cloud sync (supabase-sync.js) reads/writes through here.
// ============================================================
import { defaultHabits, cryptoId } from "./defaults.js";
import { e1rm } from "./program.js";

const KEY = "looksmax.v1";

// in-memory state, mirrored to localStorage
let state = load();

// change listeners (UI re-renders on these)
const listeners = new Set();
export function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function emit() { for (const fn of listeners) fn(); }

// hook the sync layer can register to be notified a local write happened
let syncHook = null;
export function setSyncHook(fn) { syncHook = fn; }

export function defaultProfile() {
  return {
    units: "lb",          // "lb" | "kg"
    sex: "male",          // "male" | "female"
    heightCm: null,       // canonical cm
    age: null,
    activity: 1.55,       // TDEE multiplier
    goalMode: "maintain", // "lose" | "maintain" | "gain"
    targetWeight: null,   // in display units
    weeklyRate: 0,        // display-units per week (lb/week or kg/week)
    calorieTarget: null,  // manual override (null = auto)
    proteinTarget: null,  // manual override (null = auto)
    diet: { type: "omnivore", avoid: [], mealsPerDay: "3+snacks", cooking: "quick" },
    sleep: { targetBed: "23:00", targetWake: "07:00", currentBed: "", planStart: null },
    updatedAt: 0,
  };
}

export function defaultTraining() {
  return {
    configured: false,
    experience: "beginner",   // beginner | intermediate | advanced
    goal: "muscle",           // muscle | strength | lean
    equipment: "gym",         // gym | dumbbells | barbell | bodyweight
    days: [1, 2, 4, 5],       // weekday numbers (0=Sun)
    splitId: "ul4",
    updatedAt: 0,
  };
}

// backfill fields added in later versions so old saves keep working
function normalize(s) {
  s.habits ||= [];
  s.completions ||= {};
  s.weights ||= {};                 // { "YYYY-MM-DD": { w:Number, updatedAt } }
  s.workouts ||= {};                // { [id]: { id, date, templateId, entries, notes, updatedAt, deleted } }
  s.mealPlans ||= {};               // { "YYYY-MM-DD": { plan:[{slot,mealId,servings}], done:{}, updatedAt } }
  s.sleepLogs ||= {};               // { "YYYY-MM-DD": { bed:"HH:MM", wake:"HH:MM", quality, updatedAt } }
  s.profile = { ...defaultProfile(), ...(s.profile || {}) };
  s.profile.diet = { ...defaultProfile().diet, ...(s.profile.diet || {}) };
  s.profile.sleep = { ...defaultProfile().sleep, ...(s.profile.sleep || {}) };
  s.training = { ...defaultTraining(), ...(s.training || {}) };
  s.meta ||= { installedAt: Date.now() };
  return s;
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return normalize(JSON.parse(raw));
  } catch (e) { console.warn("load failed", e); }
  // first run -> seed defaults (write directly; `state` is still in TDZ here)
  const seeded = normalize({
    habits: defaultHabits(),
    completions: {},          // { "YYYY-MM-DD": { habitId: {done, at} } }
    meta: { installedAt: Date.now(), seeded: true },
  });
  try { localStorage.setItem(KEY, JSON.stringify(seeded)); } catch (e) { /* ignore */ }
  return seeded;
}

function persist(next = state) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch (e) { console.error("persist failed", e); }
}

// Save + notify UI + (optionally) trigger a cloud push
function commit({ sync = true } = {}) {
  persist(state);
  emit();
  if (sync && syncHook) syncHook();
}

// ---------- date helpers ----------
export function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
export function dateFromKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}
export function addDays(key, delta) {
  const d = dateFromKey(key);
  d.setDate(d.getDate() + delta);
  return todayKey(d);
}

// ---------- habits ----------
export function getAllHabits() {
  return state.habits
    .filter(h => !h.deleted)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
export function getActiveHabits() {
  return getAllHabits().filter(h => h.active);
}

export function isScheduled(habit, key) {
  if (!habit.active) return false;
  if (habit.days === "daily") return true;
  if (Array.isArray(habit.days)) {
    const wd = dateFromKey(key).getDay(); // 0=Sun..6=Sat
    return habit.days.includes(wd);
  }
  return false;
}

export function habitsForDay(key) {
  return getActiveHabits().filter(h => isScheduled(h, key));
}

export function addHabit(data) {
  const now = Date.now();
  const maxOrder = state.habits.reduce((m, h) => Math.max(m, h.order ?? 0), 0);
  const habit = {
    id: cryptoId(),
    name: data.name.trim(),
    category: data.category || "custom",
    icon: data.icon || "⭐",
    timeOfDay: data.timeOfDay || "anytime",
    days: data.days || "daily",
    order: maxOrder + 1,
    active: true,
    createdAt: now,
    updatedAt: now,
    deleted: false,
  };
  state.habits.push(habit);
  commit();
  return habit;
}

export function updateHabit(id, patch) {
  const h = state.habits.find(x => x.id === id);
  if (!h) return;
  Object.assign(h, patch, { updatedAt: Date.now() });
  commit();
}

export function deleteHabit(id) {
  const h = state.habits.find(x => x.id === id);
  if (!h) return;
  h.deleted = true;
  h.active = false;
  h.updatedAt = Date.now();
  commit();
}

// ---------- completions ----------
export function isDone(habitId, key) {
  return Boolean(state.completions[key]?.[habitId]?.done);
}

export function toggleCompletion(habitId, key) {
  const day = (state.completions[key] ||= {});
  const cur = day[habitId]?.done || false;
  day[habitId] = { done: !cur, at: Date.now(), updatedAt: Date.now() };
  commit();
  return !cur;
}

export function setCompletion(habitId, key, done) {
  const day = (state.completions[key] ||= {});
  day[habitId] = { done, at: Date.now(), updatedAt: Date.now() };
  commit();
}

// {done, total, pct} for scheduled habits on a day
export function dayStats(key) {
  const habits = habitsForDay(key);
  const total = habits.length;
  const done = habits.filter(h => isDone(h.id, key)).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, pct };
}

// current streak for a habit: consecutive scheduled days done, ending today.
// Today counts if done; if today not done yet it doesn't break the streak.
export function habitStreak(habitId) {
  const habit = state.habits.find(h => h.id === habitId);
  if (!habit) return 0;
  let streak = 0;
  let key = todayKey();
  let guard = 0;
  const isToday = (k) => k === todayKey();
  while (guard++ < 400) {
    if (isScheduled(habit, key)) {
      if (isDone(habitId, key)) {
        streak++;
      } else if (isToday(key)) {
        // not done yet today — skip without breaking
      } else {
        break;
      }
    }
    key = addDays(key, -1);
  }
  return streak;
}

// overall current streak = consecutive days with 100% completion, ending today
export function overallStreak() {
  let streak = 0;
  let key = todayKey();
  let guard = 0;
  while (guard++ < 400) {
    const { total, done } = dayStats(key);
    if (total === 0) { key = addDays(key, -1); continue; } // rest day, skip
    if (done === total) {
      streak++;
    } else if (key === todayKey()) {
      // today incomplete — don't break yet
    } else {
      break;
    }
    key = addDays(key, -1);
  }
  return streak;
}

// history: array of {key, pct, done, total} for the last n days (oldest first)
export function history(days = 84) {
  const out = [];
  let key = todayKey();
  for (let i = 0; i < days; i++) {
    out.push({ key, ...dayStats(key) });
    key = addDays(key, -1);
  }
  return out.reverse();
}

// ---------- backup / restore ----------
export function exportData() {
  return JSON.stringify(state, null, 2);
}
export function importData(json) {
  const parsed = typeof json === "string" ? JSON.parse(json) : json;
  if (!parsed || !Array.isArray(parsed.habits)) throw new Error("Invalid backup file");
  persist(normalize(parsed));
  emit();
  if (syncHook) syncHook();
}

export function resetAll() {
  localStorage.removeItem(KEY);
  state = load();
  emit();
}

// ---------- profile / goal ----------
export function getProfile() { return state.profile; }
export function updateProfile(patch) {
  state.profile = { ...state.profile, ...patch, updatedAt: Date.now() };
  commit();
  return state.profile;
}

// ---------- weigh-ins ----------
export function logWeight(key, value) {
  const w = Number(value);
  if (!isFinite(w) || w <= 0) return;
  state.weights[key] = { w, updatedAt: Date.now() };
  commit();
}
export function deleteWeight(key) {
  if (state.weights[key]) { delete state.weights[key]; commit(); }
}
export function getWeight(key) { return state.weights[key]?.w ?? null; }

// all logged weigh-ins as [{key, w}] sorted oldest->newest
export function weightSeries() {
  return Object.entries(state.weights)
    .map(([key, v]) => ({ key, w: v.w }))
    .sort((a, b) => a.key < b.key ? -1 : 1);
}
export function latestWeight() {
  const s = weightSeries();
  return s.length ? s[s.length - 1] : null;
}

// centered-ish trailing moving average for the trend line
export function weightTrend(window = 7) {
  const s = weightSeries();
  return s.map((pt, i) => {
    const from = Math.max(0, i - window + 1);
    const slice = s.slice(from, i + 1);
    const avg = slice.reduce((a, p) => a + p.w, 0) / slice.length;
    return { key: pt.key, w: avg };
  });
}

// {current, prev, change7, change30, first}
export function weightStats() {
  const s = weightSeries();
  if (!s.length) return null;
  const current = s[s.length - 1];
  const prev = s.length > 1 ? s[s.length - 2] : null;
  const at = (deltaDays) => {
    const target = addDays(current.key, -deltaDays);
    // nearest point on/before target
    let best = null;
    for (const p of s) if (p.key <= target) best = p; else break;
    return best;
  };
  const p7 = at(7), p30 = at(30);
  return {
    current, prev,
    change7: p7 ? current.w - p7.w : null,
    change30: p30 ? current.w - p30.w : null,
  };
}

// ---------- target calculations (Mifflin-St Jeor) ----------
const LB_PER_KG = 2.20462;
export const toKg = (w, units) => units === "kg" ? w : w / LB_PER_KG;
export const fromKg = (kg, units) => units === "kg" ? kg : kg * LB_PER_KG;

// pure: compute auto targets from a profile + a weight (in that profile's display units)
// returns {bmr, tdee, calories, protein} or null if not enough info
export function targetsFor(p, weightDisplay) {
  if (!p || !p.heightCm || !p.age || !weightDisplay) return null;

  const kg = toKg(weightDisplay, p.units);
  const s = p.sex === "female" ? -161 : 5;
  const bmr = 10 * kg + 6.25 * p.heightCm - 5 * p.age + s;
  const tdee = bmr * (p.activity || 1.2);

  // 1 lb of fat ~ 3500 kcal -> daily delta = rate(lb/wk) * 500
  const rateLb = p.units === "kg" ? (p.weeklyRate || 0) * LB_PER_KG : (p.weeklyRate || 0);
  const dailyDelta = rateLb * 500;
  let calories = tdee;
  if (p.goalMode === "lose") calories = tdee - dailyDelta;
  else if (p.goalMode === "gain") calories = tdee + dailyDelta;
  calories = Math.max(1200, Math.round(calories / 10) * 10);

  // protein: ~1 g per lb bodyweight (great for recomp / muscle retention)
  const lb = p.units === "kg" ? kg * LB_PER_KG : weightDisplay;
  const protein = Math.round(lb);

  return { bmr: Math.round(bmr), tdee: Math.round(tdee), calories, protein };
}

// live targets for the saved profile (applies any manual overrides)
export function computeTargets() {
  const p = state.profile;
  const latest = latestWeight();
  const auto = targetsFor(p, latest?.w ?? p.targetWeight);
  if (!auto) return null;
  return {
    bmr: auto.bmr, tdee: auto.tdee,
    calories: p.calorieTarget != null ? p.calorieTarget : auto.calories,
    protein: p.proteinTarget != null ? p.proteinTarget : auto.protein,
    autoCalories: auto.calories, autoProtein: auto.protein,
  };
}

// {toGo, direction, etaWeeks, etaDate} or null
export function goalProgress() {
  const p = state.profile;
  const latest = latestWeight();
  if (!latest || p.targetWeight == null || p.goalMode === "maintain") return null;
  const toGo = p.targetWeight - latest.w; // + means need to gain, - means need to lose
  const rate = Math.abs(p.weeklyRate || 0);
  let etaWeeks = null, etaDate = null;
  if (rate > 0) {
    etaWeeks = Math.abs(toGo) / rate;
    const d = new Date();
    d.setDate(d.getDate() + Math.round(etaWeeks * 7));
    etaDate = d;
  }
  return { toGo, direction: toGo >= 0 ? "gain" : "lose", etaWeeks, etaDate, target: p.targetWeight };
}

// ---------- training config ----------
export function getTraining() { return state.training; }
export function updateTraining(patch) {
  state.training = { ...state.training, ...patch, updatedAt: Date.now() };
  commit();
  return state.training;
}

// ---------- workouts ----------
export function saveWorkout(w) {
  const id = w.id || cryptoId();
  state.workouts[id] = { ...w, id, updatedAt: Date.now(), deleted: !!w.deleted };
  commit();
  return state.workouts[id];
}
export function getWorkout(id) { return state.workouts[id] || null; }
// persist edits (e.g. typing weight/reps) WITHOUT triggering a UI re-render
export function saveWorkoutQuiet(w) {
  const id = w.id; if (!id) return;
  state.workouts[id] = { ...w, id, updatedAt: Date.now() };
  persist(state);
  if (syncHook) syncHook();
}
export function deleteWorkout(id) {
  const w = state.workouts[id];
  if (!w) return;
  w.deleted = true; w.updatedAt = Date.now();
  commit();
}
export function allWorkouts() {
  return Object.values(state.workouts)
    .filter(w => !w.deleted)
    .sort((a, b) => a.date < b.date ? 1 : a.date > b.date ? -1 : 0); // newest first
}
export function workoutsForDate(key) {
  return allWorkouts().filter(w => w.date === key);
}

// most recent entry for an exercise, returning only the sets actually completed
export function lastEntryForExercise(exId, excludeId = null) {
  for (const w of allWorkouts()) {           // newest first
    if (w.id === excludeId) continue;
    const entry = (w.entries || []).find(e => e.exId === exId);
    const doneSets = (entry?.sets || []).filter(s => s.done && Number(s.reps) > 0);
    if (doneSets.length) return { date: w.date, sets: doneSets };
  }
  return null;
}

// per-exercise history for charts: [{key, w:e1rm}] oldest->newest (best done set per session)
export function exerciseHistory(exId) {
  const out = [];
  for (const w of [...allWorkouts()].reverse()) { // oldest first
    const entry = (w.entries || []).find(e => e.exId === exId);
    if (!entry) continue;
    const done = (entry.sets || []).filter(s => s.done);
    const best = Math.max(0, ...done.map(s => e1rm(Number(s.w), Number(s.reps))));
    if (best > 0) out.push({ key: w.date, w: best });
  }
  return out;
}
export function bestE1RM(exId, excludeId = null) {
  let best = 0;
  for (const w of allWorkouts()) {
    if (w.id === excludeId) continue;
    const entry = (w.entries || []).find(e => e.exId === exId);
    for (const s of entry?.sets || []) if (s.done) best = Math.max(best, e1rm(Number(s.w), Number(s.reps)));
  }
  return best;
}

// ---------- nutrition ----------
export function getDiet() { return state.profile.diet; }
export function updateDiet(patch) {
  state.profile = { ...state.profile, diet: { ...state.profile.diet, ...patch }, updatedAt: Date.now() };
  commit();
  return state.profile.diet;
}
export function getMealPlan(key) { return state.mealPlans[key] || null; }
export function setMealPlan(key, plan) {
  state.mealPlans[key] = { plan, done: state.mealPlans[key]?.done || {}, updatedAt: Date.now() };
  commit();
}
export function toggleMealDone(key, idx) {
  const mp = state.mealPlans[key]; if (!mp) return;
  mp.done ||= {}; mp.done[idx] = !mp.done[idx]; mp.updatedAt = Date.now();
  commit();
}
export function swapPlanMeal(key, idx, newMealId) {
  const mp = state.mealPlans[key]; if (!mp || !mp.plan[idx]) return;
  mp.plan[idx].mealId = newMealId; mp.updatedAt = Date.now();
  commit();
}

// ---------- sleep ----------
export function getSleep() { return state.profile.sleep; }
export function updateSleep(patch) {
  state.profile = { ...state.profile, sleep: { ...state.profile.sleep, ...patch }, updatedAt: Date.now() };
  commit();
  return state.profile.sleep;
}
export function logSleep(key, data) {
  state.sleepLogs[key] = { ...state.sleepLogs[key], ...data, updatedAt: Date.now() };
  commit();
}
export function getSleepLog(key) { return state.sleepLogs[key] || null; }

// minutes of sleep from "HH:MM" bed/wake (handles crossing midnight)
export function sleepDuration(bed, wake) {
  if (!bed || !wake) return null;
  const [bh, bm] = bed.split(":").map(Number);
  const [wh, wm] = wake.split(":").map(Number);
  let mins = (wh * 60 + wm) - (bh * 60 + bm);
  if (mins <= 0) mins += 24 * 60;
  return mins;
}
export function sleepSeries(days = 30) {
  const out = [];
  let key = todayKey();
  for (let i = 0; i < days; i++) {
    const log = state.sleepLogs[key];
    if (log && log.bed && log.wake) out.push({ key, mins: sleepDuration(log.bed, log.wake) });
    key = addDays(key, -1);
  }
  return out.reverse();
}
// tonight's target bedtime on a gradual shift plan (15 min closer every 2 days).
// Bedtimes are anchored on a continuous evening axis so that an after-midnight
// time (e.g. 01:30) is treated as "later" than 23:00, not earlier.
export function tonightBedtime() {
  const s = state.profile.sleep;
  if (!s.currentBed || !s.targetBed) return s.targetBed || null;
  if (!s.planStart) return s.currentBed;
  const anchor = (t) => { let m = timeToMin(t); if (m < 720) m += 1440; return m; }; // before noon -> next day
  const startD = dateFromKey(s.planStart);
  const daysIn = Math.floor((dateFromKey(todayKey()) - startD) / 86400000);
  const steps = Math.max(0, Math.floor(daysIn / 2));
  const cur = anchor(s.currentBed), tgt = anchor(s.targetBed);
  const dir = tgt < cur ? -1 : 1;   // usually shifting earlier (dir -1)
  let mins = cur + dir * steps * 15;
  if (dir < 0) mins = Math.max(tgt, mins); else mins = Math.min(tgt, mins);
  return minToTime(mins);            // minToTime wraps mod 1440
}
export function timeToMin(t) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }
export function minToTime(mins) {
  mins = ((mins % 1440) + 1440) % 1440;
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
}

// ---------- raw access for sync layer ----------
export function _getState() { return state; }
export function _replaceState(next, { sync = false } = {}) {
  persist(next);
  emit();
  if (sync && syncHook) syncHook();
}
