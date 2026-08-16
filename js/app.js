// ============================================================
//  Looksmax — app UI (vanilla JS, no framework)
// ============================================================
import * as store from "./store.js";
import { CATEGORY_ICONS, CATEGORY_LABELS, TIME_LABELS } from "./defaults.js";
import * as cloud from "./supabase-sync.js";
import * as program from "./program.js";
import * as nutrition from "./nutrition.js";
import * as foods from "./foods.js";
import * as off from "./off.js";
import * as scanner from "./scanner.js";
import { SUPPLEMENTS, TIER_INFO, BLUEPRINT_SKIP } from "./supplements.js";

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"']/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

let tab = "today";
let groceryMode = null; // null = hidden, "today" | "week"
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ---------------- shell ----------------
let moreSub = null; // sub-view within the "More" hub

function render() {
  if (tab === "today") renderToday();
  else if (tab === "gym") renderGym();
  else if (tab === "eat") renderEat();
  else if (tab === "body") renderBody();
  else if (tab === "more") renderMore();
  syncNavAndHeader();
}

function renderMore() {
  if (moreSub === "skin") return renderSkin();
  if (moreSub === "sleep") return renderSleep();
  if (moreSub === "supplements") return renderSupplements();
  if (moreSub === "history") return renderHistory();
  if (moreSub === "habits") return renderHabits();
  renderMoreMenu();
}

function renderMoreMenu() {
  const c = cloud.getStatus();
  const item = (sub, icon, title, sub2) =>
    `<div class="hb-row" data-act="more-nav" data-sub="${sub}">
      <span class="hb-ic">${icon}</span>
      <span class="hb-main"><span class="hb-name">${title}</span><span class="hb-sub">${sub2}</span></span>
      <span class="hb-edit">›</span></div>`;
  $("#view").innerHTML = `
    <h2 class="screen-title">More</h2>
    ${item("skin", "🪞", "Skin", "Daily check-in + AM/PM routine")}
    ${item("sleep", "😴", "Sleep", "Fix your schedule + log sleep")}
    ${item("supplements", "💊", "Supplements", "Your evidence-based stack")}
    ${item("history", "📊", "History", "Habit consistency heatmap")}
    ${item("habits", "⚙️", "Habits", "Add / edit your daily habits")}
    <div class="hb-row" data-act="open-account">
      <span class="hb-ic">☁️</span>
      <span class="hb-main"><span class="hb-name">Account & data</span>
        <span class="hb-sub">${c.enabled ? (c.user || "Sign in to sync") : "Local · backup / restore"}</span></span>
      <span class="hb-edit">›</span></div>
  `;
}

// back header used inside More sub-views
function subHeader(title) {
  return `<div class="session-head">
    <button class="btn tiny" data-act="more-back">‹ More</button>
    <div class="session-title">${title}</div><span style="width:56px"></span></div>`;
}

const fmt1 = (n) => (Math.round(n * 10) / 10).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 });
const shortDate = (key) => store.dateFromKey(key).toLocaleDateString(undefined, { month: "short", day: "numeric" });

function syncNavAndHeader() {
  document.querySelectorAll(".nav-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.tab === tab));
  const c = cloud.getStatus();
  const chip = $("#sync-chip");
  if (!c.enabled) { chip.textContent = "Local"; chip.className = "sync-chip local"; }
  else if (!c.user) { chip.textContent = "Sign in"; chip.className = "sync-chip out"; }
  else {
    const map = { syncing: "Syncing…", synced: "Synced", offline: "Offline", error: "Sync error" };
    chip.textContent = map[c.status] || "Cloud";
    chip.className = "sync-chip " + (c.status === "error" ? "err" : c.status === "synced" ? "ok" : "");
  }
}

// ---------------- TODAY ----------------
function renderToday() {
  const key = store.todayKey();
  const { done, total, pct } = store.dayStats(key);
  const streak = store.overallStreak();
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const dateStr = store.dateFromKey(key).toLocaleDateString(undefined,
    { weekday: "long", month: "long", day: "numeric" });

  const sections = ["morning", "evening", "anytime"].map(tod => {
    const habits = store.habitsForDay(key).filter(h => h.timeOfDay === tod);
    if (!habits.length) return "";
    const rows = habits.map(h => habitRow(h, key)).join("");
    return `<section class="tod">
      <h3 class="tod-title">${TIME_LABELS[tod]}</h3>
      <div class="cards">${rows}</div>
    </section>`;
  }).join("");

  const allDone = total > 0 && done === total;

  $("#view").innerHTML = `
    <div class="today-head">
      <div>
        <div class="greet">${greet}</div>
        <div class="date">${esc(dateStr)}</div>
      </div>
      ${ring(pct)}
    </div>
    <div class="stat-row">
      <div class="stat"><span class="stat-num">${done}/${total}</span><span class="stat-lbl">done today</span></div>
      <div class="stat"><span class="stat-num">🔥 ${streak}</span><span class="stat-lbl">day streak</span></div>
    </div>
    ${allDone ? `<div class="celebrate">✅ All done for today. Locked in.</div>` : ""}
    ${total === 0 ? emptyToday() : sections}
    ${renderWaterCard(key)}
  `;
}

function renderWaterCard(key) {
  const glasses = store.getWater(key);
  const target = store.getWaterTarget();
  const pct = Math.min(100, Math.round(glasses / target * 100));
  const reached = glasses >= target;
  return `<div class="body-card water-card">
    <div class="bc-head">
      <span>💧 Water</span>
      <div style="display:flex;align-items:center;gap:8px">
        ${glasses > 0 ? `<button class="btn tiny" data-act="water-minus">−</button>` : ""}
        <span class="water-count${reached ? " water-done" : ""}">${glasses} / ${target}</span>
        <button class="btn tiny primary" data-act="water-plus">+ glass</button>
      </div>
    </div>
    <div class="bar"><div class="bar-fill${reached ? " good" : ""}" style="width:${pct}%"></div></div>
    ${reached ? `<div class="stat-lbl" style="margin-top:6px">✅ Daily goal reached!</div>` : ""}
  </div>`;
}

function emptyToday() {
  return `<div class="empty">
    <p>No habits scheduled today.</p>
    <button class="btn" data-act="go-habits">Manage habits</button>
  </div>`;
}

function habitRow(h, key) {
  const done = store.isDone(h.id, key);
  const s = store.habitStreak(h.id);
  return `<button class="card ${done ? "done" : ""}" data-act="toggle" data-id="${h.id}">
    <span class="check">${done ? "✓" : ""}</span>
    <span class="card-ic">${h.icon || "⭐"}</span>
    <span class="card-name">${esc(h.name)}</span>
    ${s > 0 ? `<span class="flame">🔥${s}</span>` : ""}
  </button>`;
}

function ring(pct) {
  const r = 26, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
  return `<svg class="ring" viewBox="0 0 64 64" width="64" height="64">
    <circle cx="32" cy="32" r="${r}" class="ring-bg"/>
    <circle cx="32" cy="32" r="${r}" class="ring-fg"
      stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"/>
    <text x="32" y="37" class="ring-txt">${pct}%</text>
  </svg>`;
}

// ---------------- HISTORY ----------------
function renderHistory() {
  const days = store.history(112); // 16 weeks
  const streak = store.overallStreak();
  const last30 = days.slice(-30).filter(d => d.total > 0);
  const avg30 = last30.length
    ? Math.round(last30.reduce((a, d) => a + d.pct, 0) / last30.length) : 0;
  const perfect = days.filter(d => d.total > 0 && d.pct === 100).length;

  // build weekday-aligned columns (GitHub-style). Pad start to Sunday.
  const first = store.dateFromKey(days[0].key);
  const pad = first.getDay(); // 0..6
  const cells = Array(pad).fill(null).concat(days);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const grid = weeks.map(week => {
    const col = Array(7).fill(null).map((_, wd) => {
      const d = week[wd];
      if (!d) return `<div class="hm-cell empty"></div>`;
      const lvl = d.total === 0 ? "rest" : d.pct === 100 ? "l4"
        : d.pct >= 66 ? "l3" : d.pct >= 33 ? "l2" : d.pct > 0 ? "l1" : "l0";
      const label = `${d.key} — ${d.total === 0 ? "rest day" : d.done + "/" + d.total + " (" + d.pct + "%)"}`;
      return `<div class="hm-cell ${lvl}" data-act="day" data-key="${d.key}" title="${label}"></div>`;
    }).join("");
    return `<div class="hm-col">${col}</div>`;
  }).join("");

  $("#view").innerHTML = `
    ${subHeader("History")}
    <div class="stat-row three">
      <div class="stat"><span class="stat-num">🔥 ${streak}</span><span class="stat-lbl">current streak</span></div>
      <div class="stat"><span class="stat-num">${avg30}%</span><span class="stat-lbl">30-day avg</span></div>
      <div class="stat"><span class="stat-num">${perfect}</span><span class="stat-lbl">perfect days</span></div>
    </div>
    <div class="heatmap-wrap">
      <div class="heatmap">${grid}</div>
    </div>
    <div class="legend">
      <span>Less</span>
      <span class="hm-cell l0"></span><span class="hm-cell l1"></span>
      <span class="hm-cell l2"></span><span class="hm-cell l3"></span>
      <span class="hm-cell l4"></span>
      <span>More</span>
    </div>
    <div id="day-detail" class="day-detail"></div>
  `;
}

function showDayDetail(key) {
  const habits = store.habitsForDay(key);
  const dateStr = store.dateFromKey(key).toLocaleDateString(undefined,
    { weekday: "long", month: "short", day: "numeric" });
  const rows = habits.length ? habits.map(h => {
    const done = store.isDone(h.id, key);
    return `<div class="dd-row ${done ? "done" : ""}">
      <span>${h.icon} ${esc(h.name)}</span><span>${done ? "✓" : "—"}</span></div>`;
  }).join("") : `<div class="dd-row"><span>Rest day</span></div>`;
  $("#day-detail").innerHTML = `<h4>${esc(dateStr)}</h4>${rows}`;
}

// ---------------- BODY & WEIGHT ----------------
function renderBody() {
  const p = store.getProfile();
  const u = p.units;
  const latest = store.latestWeight();
  const stats = store.weightStats();
  const targets = store.computeTargets();
  const goal = store.goalProgress();
  const series = store.weightSeries();

  const delta = (val) => {
    if (val == null) return `<span class="delta flat">—</span>`;
    const cls = val < 0 ? "down" : val > 0 ? "up" : "flat";
    const sign = val > 0 ? "+" : "";
    return `<span class="delta ${cls}">${sign}${fmt1(val)}</span>`;
  };

  $("#view").innerHTML = `
    <div class="habits-head">
      <h2 class="screen-title">Body</h2>
      <button class="btn primary" data-act="log-weight">+ Log weight</button>
    </div>

    <div class="body-hero">
      <div class="stat-lbl">Current weight</div>
      <div class="big-weight">${latest ? fmt1(latest.w) + `<span class="unit">${u}</span>` : "—"}</div>
      <div class="deltas">7d ${delta(stats?.change7)} ${u} &nbsp;·&nbsp; 30d ${delta(stats?.change30)} ${u}</div>
    </div>

    ${series.length >= 2 ? weightChartCard(series, p) : bodyEmptyChart(latest)}
    ${goalCard(goal, p)}
    ${targetsCard(targets, p)}
  `;
}

function bodyEmptyChart(latest) {
  return `<div class="body-card empty-card">
    <p>${latest ? "Log another day to see your trend line." : "Log your weight to start tracking your trend."}</p>
    <button class="btn" data-act="log-weight">+ Log weight</button>
  </div>`;
}

function weightChartCard(series, p) {
  const trend = store.weightTrend(7);
  const W = 340, H = 168, padL = 6, padR = 6, padT = 14, padB = 8;
  const t0 = store.dateFromKey(series[0].key).getTime();
  const t1 = store.dateFromKey(series[series.length - 1].key).getTime();
  const spanMs = Math.max(1, t1 - t0);
  const X = (key) => padL + (store.dateFromKey(key).getTime() - t0) / spanMs * (W - padL - padR);

  let vals = series.map(s => s.w);
  if (p.targetWeight != null) vals = vals.concat(p.targetWeight);
  let min = Math.min(...vals), max = Math.max(...vals);
  if (max - min < 2) { const mid = (max + min) / 2; min = mid - 1; max = mid + 1; }
  const padY = (max - min) * 0.18; min -= padY; max += padY;
  const Y = (w) => padT + (1 - (w - min) / (max - min)) * (H - padT - padB);

  const path = (pts) => pts.map((pt, i) => (i ? "L" : "M") + X(pt.key).toFixed(1) + " " + Y(pt.w).toFixed(1)).join(" ");
  const dots = series.map(s => `<circle cx="${X(s.key).toFixed(1)}" cy="${Y(s.w).toFixed(1)}" r="2.3" class="pt"/>`).join("");
  const goalLine = p.targetWeight != null ? `
    <line x1="${padL}" y1="${Y(p.targetWeight).toFixed(1)}" x2="${W - padR}" y2="${Y(p.targetWeight).toFixed(1)}" class="goal-line"/>
    <text x="${W - padR}" y="${(Y(p.targetWeight) - 4).toFixed(1)}" class="axis-lbl" text-anchor="end">goal ${fmt1(p.targetWeight)}</text>` : "";

  return `<div class="body-card">
    <div class="bc-head"><span>Weight trend</span><span class="bc-sub">${series.length} entries</span></div>
    <svg class="wchart" viewBox="0 0 ${W} ${H}" width="100%">
      <text x="${padL}" y="10" class="axis-lbl">${fmt1(max)}</text>
      ${goalLine}
      <path d="${path(series)}" class="raw-line"/>
      ${dots}
      <path d="${path(trend)}" class="trend-line"/>
    </svg>
    <div class="chart-x"><span>${shortDate(series[0].key)}</span><span class="trend-key">— 7-day trend</span><span>${shortDate(series[series.length - 1].key)}</span></div>
  </div>`;
}

function goalCard(goal, p) {
  const modeLabel = { lose: "Lose", maintain: "Maintain", gain: "Gain" }[p.goalMode] || "Maintain";
  let body;
  if (p.goalMode === "maintain") {
    body = `<div class="big-num">Maintain</div><div class="stat-lbl">holding current weight</div>`;
  } else if (goal) {
    const dir = goal.toGo >= 0 ? "to gain" : "to lose";
    const eta = goal.etaDate
      ? goal.etaDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
      : "set a weekly rate";
    body = `<div class="big-num">${fmt1(Math.abs(goal.toGo))} <span class="unit">${p.units}</span></div>
      <div class="stat-lbl">${dir} · target ${fmt1(p.targetWeight)} ${p.units}</div>
      <div class="goal-eta">🎯 ETA ${eta}${goal.etaWeeks ? ` · ~${Math.ceil(goal.etaWeeks)} wks` : ""}</div>`;
  } else {
    body = `<div class="big-num">${modeLabel}</div><div class="stat-lbl">tap to set a target weight</div>`;
  }
  return `<div class="body-card tappable" data-act="edit-goal">
    <div class="bc-head"><span>Goal</span><span class="bc-edit">✎ ${modeLabel}</span></div>
    ${body}
  </div>`;
}

function targetsCard(t, p) {
  if (!t) {
    return `<div class="body-card tappable" data-act="edit-goal">
      <div class="bc-head"><span>Daily targets</span><span class="bc-edit">Set up ›</span></div>
      <p class="stat-lbl">Add your height, age, sex & activity to auto-calculate your calorie + protein targets.</p>
    </div>`;
  }
  return `<div class="body-card tappable" data-act="edit-goal">
    <div class="bc-head"><span>Daily targets</span><span class="bc-edit">✎</span></div>
    <div class="targets">
      <div class="tgt"><span class="big-num">${t.calories.toLocaleString()}</span><span class="stat-lbl">calories / day</span></div>
      <div class="tgt"><span class="big-num">${t.protein}<span class="unit">g</span></span><span class="stat-lbl">protein / day</span></div>
    </div>
    <div class="tdee-note">Maintenance ≈ ${t.tdee.toLocaleString()} kcal · BMR ${t.bmr.toLocaleString()}</div>
  </div>`;
}

// ----- weigh-in modal -----
function openWeightModal() {
  const p = store.getProfile();
  const last = store.latestWeight();
  const today = store.todayKey();
  const existing = store.getWeight(today);
  openModal(`
    <h3>Log weight</h3>
    <label class="fld"><span>Date</span><input id="w-date" type="date" value="${today}" max="${today}"/></label>
    <label class="fld"><span>Weight (${p.units})</span>
      <input id="w-val" type="number" inputmode="decimal" step="0.1" value="${existing ?? last?.w ?? ""}" placeholder="e.g. 180"/></label>
    <div class="modal-actions">
      ${existing != null ? `<button class="btn danger" data-act="del-weight">Delete</button>` : "<span></span>"}
      <div>
        <button class="btn" data-act="close-modal">Cancel</button>
        <button class="btn primary" data-act="save-weight">Save</button>
      </div>
    </div>
  `);
  // when the date changes, prefill that day's existing entry
  $("#w-date").onchange = (e) => {
    const v = store.getWeight(e.target.value);
    if (v != null) $("#w-val").value = v;
  };
  setTimeout(() => $("#w-val")?.focus(), 60);
}

// ----- goal + profile modal -----
const ACTIVITIES = [
  [1.2, "Sedentary (little/no exercise)"],
  [1.375, "Light (1–3 days/wk)"],
  [1.55, "Moderate (3–5 days/wk)"],
  [1.725, "Very active (6–7 days/wk)"],
  [1.9, "Athlete (2x/day)"],
];

function openGoalModal() {
  const p = store.getProfile();
  const u = p.units;

  const sexSeg = ["male", "female"].map(s =>
    `<button type="button" class="seg-btn ${p.sex === s ? "on" : ""}" data-sex="${s}">${s === "male" ? "Male" : "Female"}</button>`).join("");
  const goalSeg = ["lose", "maintain", "gain"].map(g =>
    `<button type="button" class="seg-btn ${p.goalMode === g ? "on" : ""}" data-goal="${g}">${g[0].toUpperCase() + g.slice(1)}</button>`).join("");
  const actOpts = ACTIVITIES.map(([v, l]) =>
    `<option value="${v}" ${Math.abs((p.activity || 1.55) - v) < 0.001 ? "selected" : ""}>${l}</option>`).join("");

  let heightFields;
  if (u === "lb") {
    const totalIn = p.heightCm ? p.heightCm / 2.54 : null;
    const ft = totalIn != null ? Math.floor(totalIn / 12) : "";
    const inch = totalIn != null ? Math.round(totalIn % 12) : "";
    heightFields = `<div class="row2">
      <label class="fld"><span>Height (ft)</span><input id="p-ft" type="number" inputmode="numeric" value="${ft}" min="3" max="8"/></label>
      <label class="fld"><span>(in)</span><input id="p-in" type="number" inputmode="numeric" value="${inch}" min="0" max="11"/></label>
    </div>`;
  } else {
    heightFields = `<label class="fld"><span>Height (cm)</span><input id="p-cm" type="number" inputmode="numeric" value="${p.heightCm ?? ""}"/></label>`;
  }

  openModal(`
    <h3>Goal & profile</h3>

    <div class="fld"><span>Goal</span><div class="seg" id="goal-seg">${goalSeg}</div></div>

    <div id="target-fields" class="${p.goalMode === "maintain" ? "hidden" : ""}">
      <div class="row2">
        <label class="fld"><span>Target weight (${u})</span>
          <input id="p-target" type="number" inputmode="decimal" step="0.1" value="${p.targetWeight ?? ""}" placeholder="e.g. 175"/></label>
        <label class="fld"><span>Rate (${u}/week)</span>
          <input id="p-rate" type="number" inputmode="decimal" step="0.25" value="${p.weeklyRate || ""}" placeholder="e.g. 1"/></label>
      </div>
    </div>

    <hr class="sep"/>
    <div class="note">Used to auto-calculate your calorie & protein targets:</div>
    <div class="fld"><span>Sex</span><div class="seg" id="sex-seg">${sexSeg}</div></div>
    <div class="row2">
      ${heightFields}
      <label class="fld"><span>Age</span><input id="p-age" type="number" inputmode="numeric" value="${p.age ?? ""}" min="13" max="100"/></label>
    </div>
    <label class="fld"><span>Activity level</span><select id="p-act">${actOpts}</select></label>

    <div id="target-preview" class="preview"></div>

    <details class="adv">
      <summary>Override targets (optional)</summary>
      <div class="row2">
        <label class="fld"><span>Calories</span><input id="p-cal" type="number" inputmode="numeric" value="${p.calorieTarget ?? ""}" placeholder="auto"/></label>
        <label class="fld"><span>Protein (g)</span><input id="p-prot" type="number" inputmode="numeric" value="${p.proteinTarget ?? ""}" placeholder="auto"/></label>
      </div>
    </details>

    <div class="modal-actions"><span></span><div>
      <button class="btn" data-act="close-modal">Cancel</button>
      <button class="btn primary" data-act="save-goal">Save</button>
    </div></div>
  `);

  const modal = $("#modal");
  let sex = p.sex, goalMode = p.goalMode;

  const readDraft = () => {
    let heightCm = null;
    if (u === "lb") {
      const ft = Number($("#p-ft")?.value) || 0;
      const inch = Number($("#p-in")?.value) || 0;
      if (ft) heightCm = (ft * 12 + inch) * 2.54;
    } else {
      heightCm = Number($("#p-cm")?.value) || null;
    }
    return {
      units: u, sex, goalMode,
      heightCm,
      age: Number($("#p-age").value) || null,
      activity: Number($("#p-act").value) || 1.55,
      targetWeight: $("#p-target") ? (Number($("#p-target").value) || null) : p.targetWeight,
      weeklyRate: $("#p-rate") ? (Number($("#p-rate").value) || 0) : 0,
      calorieTarget: $("#p-cal").value === "" ? null : Number($("#p-cal").value),
      proteinTarget: $("#p-prot").value === "" ? null : Number($("#p-prot").value),
    };
  };

  const updatePreview = () => {
    const draft = readDraft();
    const w = store.latestWeight()?.w ?? draft.targetWeight;
    const t = store.targetsFor(draft, w);
    const box = $("#target-preview");
    if (!t) { box.innerHTML = `<span class="stat-lbl">Fill in height, age & a weigh-in to preview targets.</span>`; return; }
    const cal = draft.calorieTarget ?? t.calories, prot = draft.proteinTarget ?? t.protein;
    box.innerHTML = `<b>${cal.toLocaleString()}</b> kcal &nbsp;·&nbsp; <b>${prot}g</b> protein &nbsp;<span class="stat-lbl">(maint ≈ ${t.tdee.toLocaleString()})</span>`;
  };

  modal.querySelectorAll("[data-sex]").forEach(b => b.onclick = () => {
    sex = b.dataset.sex; modal.querySelectorAll("[data-sex]").forEach(x => x.classList.toggle("on", x === b)); updatePreview();
  });
  modal.querySelectorAll("[data-goal]").forEach(b => b.onclick = () => {
    goalMode = b.dataset.goal;
    modal.querySelectorAll("[data-goal]").forEach(x => x.classList.toggle("on", x === b));
    $("#target-fields").classList.toggle("hidden", goalMode === "maintain");
    updatePreview();
  });
  modal.querySelectorAll("input, select").forEach(el => el.addEventListener("input", updatePreview));
  modal._collect = readDraft;
  updatePreview();
}

// ---------------- GYM / TRAINING ----------------
let gymSession = null;         // active workout id (session view open)
let restRemaining = 0, restTimer = null;

function renderGym() {
  if (gymSession) { renderSession(gymSession); return; }
  const t = store.getTraining();
  const today = store.todayKey();
  const wd = store.dateFromKey(today).getDay();
  const todays = store.workoutsForDate(today);
  const active = todays.find(w => !w.completed);
  const done = todays.find(w => w.completed);
  const tpl = program.templateForWeekday(t, wd);

  let main;
  if (active) {
    main = `<div class="body-card">
      <div class="bc-head"><span>In progress</span><span class="bc-sub">${program.TEMPLATES[active.templateId]?.name || ""}</span></div>
      <p class="stat-lbl">You've got a workout going.</p>
      <button class="btn primary full" data-act="resume-workout" data-id="${active.id}">Resume workout</button>
    </div>`;
  } else if (done) {
    const sets = (done.entries || []).reduce((a, e) => a + e.sets.filter(s => s.done).length, 0);
    main = `<div class="body-card">
      <div class="bc-head"><span>Today ✅</span><span class="bc-sub">${program.TEMPLATES[done.templateId]?.name || "Workout"}</span></div>
      <p class="stat-lbl">${sets} sets logged. Recover well.</p>
      <button class="btn full" data-act="resume-workout" data-id="${done.id}">View / edit</button>
    </div>`;
  } else if (tpl) {
    main = plannedCard(tpl.templateId);
  } else {
    let nextWd = null, nextTpl = null;
    for (let i = 1; i <= 7; i++) { const w = (wd + i) % 7; const tp = program.templateForWeekday(t, w); if (tp) { nextWd = w; nextTpl = tp.templateId; break; } }
    main = `<div class="body-card">
      <div class="bc-head"><span>Rest day 💤</span></div>
      <p class="stat-lbl">Recover, hit your protein, sleep.${nextTpl ? ` Next up: <b>${program.TEMPLATES[nextTpl].name}</b> on ${WEEKDAYS[nextWd]}.` : ""}</p>
    </div>`;
  }

  $("#view").innerHTML = `
    <div class="habits-head">
      <h2 class="screen-title">Training</h2>
      <button class="btn" data-act="edit-plan">Plan</button>
    </div>
    ${main}
    ${gymHistoryList()}
  `;
}

function plannedCard(templateId) {
  const tpl = program.TEMPLATES[templateId];
  const rows = tpl.exercises.map(exId => {
    const ex = program.getExercise(exId);
    const p = program.prescribe(ex, store.lastEntryForExercise(exId));
    const target = p.weight != null ? `${p.sets}×${p.targetReps} @ ${p.weight} lb` : `${p.sets}×${p.targetReps}${p.isBw ? " reps" : ""}`;
    return `<div class="ex-plan" data-act="ex-detail" data-ex="${exId}">
      <div class="ex-main"><span class="ex-name">${esc(ex.name)}</span>
        <span class="ex-sub">${target} · ${p.lastSummary ? "last " + p.lastSummary : p.note}</span></div>
      ${p.progressed ? '<span class="prog-up">⬆</span>' : ""}
    </div>`;
  }).join("");
  return `<div class="body-card">
    <div class="bc-head"><span>Today · ${tpl.name}</span><span class="bc-sub">${tpl.exercises.length} exercises</span></div>
    ${rows}
    <button class="btn primary full" data-act="start-workout" data-tpl="${templateId}">Start workout</button>
  </div>`;
}

function gymHistoryList() {
  const list = store.allWorkouts().filter(w => w.completed).slice(0, 12);
  if (!list.length) return "";
  const rows = list.map(w => {
    const sets = (w.entries || []).reduce((a, e) => a + e.sets.filter(s => s.done).length, 0);
    return `<div class="hb-row" data-act="resume-workout" data-id="${w.id}">
      <span class="hb-ic">🏋️</span>
      <span class="hb-main"><span class="hb-name">${program.TEMPLATES[w.templateId]?.name || "Workout"}</span>
        <span class="hb-sub">${shortDate(w.date)} · ${sets} sets</span></span>
      <span class="hb-edit">›</span></div>`;
  }).join("");
  return `<section class="tod"><h3 class="tod-title">Recent workouts</h3>${rows}</section>`;
}

function startWorkout(templateId) {
  const tpl = program.TEMPLATES[templateId];
  const entries = tpl.exercises.map(exId => {
    const ex = program.getExercise(exId);
    const p = program.prescribe(ex, store.lastEntryForExercise(exId));
    const sets = Array.from({ length: p.sets }, () => ({ w: p.weight ?? "", reps: p.targetReps, done: false }));
    return { exId, sets };
  });
  const w = store.saveWorkout({ date: store.todayKey(), templateId, entries, completed: false, notes: "" });
  gymSession = w.id;
  render();
}

// ----- active session view -----
function renderSession(id) {
  const w = store.getWorkout(id);
  if (!w) { gymSession = null; renderGym(); return; }
  const name = program.TEMPLATES[w.templateId]?.name || "Workout";

  const blocks = (w.entries || []).map((entry, ei) => {
    const ex = program.getExercise(entry.exId);
    const best = store.bestE1RM(entry.exId, w.id);
    const p = program.prescribe(ex, store.lastEntryForExercise(entry.exId, w.id));
    const setRows = entry.sets.map((s, si) => {
      const isPR = !p.isBw && s.done && Number(s.w) && Number(s.reps) && program.e1rm(+s.w, +s.reps) > best && best > 0;
      return `<div class="set-row ${s.done ? "done" : ""}">
        <span class="set-n">${si + 1}</span>
        <input class="set-in" type="number" inputmode="decimal" value="${s.w ?? ""}" placeholder="${p.isBw ? "BW" : "lb"}" data-w data-ei="${ei}" data-si="${si}"/>
        <span class="x">×</span>
        <input class="set-in" type="number" inputmode="numeric" value="${s.reps ?? ""}" placeholder="reps" data-r data-ei="${ei}" data-si="${si}"/>
        <button class="set-check ${s.done ? "on" : ""}" data-act="set-done" data-ei="${ei}" data-si="${si}">✓</button>
        ${isPR ? '<span class="pr">🏆</span>' : ""}
      </div>`;
    }).join("");
    return `<div class="ex-block">
      <div class="ex-head" data-act="ex-detail" data-ex="${entry.exId}">
        <div><div class="ex-name">${esc(ex.name)}</div>
          <div class="ex-sub">Target ${p.weight != null ? `${p.targetReps} @ ${p.weight} lb` : `${p.targetReps} reps`}${p.lastSummary ? ` · last ${p.lastSummary}` : ""}</div></div>
        <span class="ex-best">${best ? "🏆 " + best : ""}</span>
      </div>
      <div class="sets">${setRows}</div>
      <button class="btn tiny" data-act="add-set" data-ei="${ei}">+ set</button>
    </div>`;
  }).join("");

  $("#view").innerHTML = `
    <div class="session-head">
      <button class="btn tiny" data-act="close-session">‹ Back</button>
      <div class="session-title">${name}</div>
      <button class="btn primary tiny" data-act="finish-workout" data-id="${w.id}">Finish</button>
    </div>
    ${blocks}
    <label class="fld notes"><span>Notes</span>
      <input id="w-notes" type="text" value="${esc(w.notes || "")}" placeholder="How did it feel?" data-notes/></label>
    <button class="btn danger ghost full" data-act="discard-workout" data-id="${w.id}">Discard workout</button>
    <div id="rest-bar" class="rest-bar hidden"></div>
  `;
  paintRest();
}

// ----- rest timer -----
function fmtClock(sec) { const m = Math.floor(sec / 60), s = sec % 60; return `${m}:${String(s).padStart(2, "0")}`; }
function startRest(sec) {
  restRemaining = sec;
  clearInterval(restTimer);
  restTimer = setInterval(() => {
    restRemaining--;
    if (restRemaining <= 0) { clearInterval(restTimer); restRemaining = 0; if (navigator.vibrate) navigator.vibrate([120, 60, 120]); }
    paintRest();
  }, 1000);
  paintRest();
}
function stopRest() { clearInterval(restTimer); restRemaining = 0; const b = $("#rest-bar"); if (b) b.classList.add("hidden"); }
function paintRest() {
  const b = $("#rest-bar"); if (!b) return;
  if (restRemaining > 0) {
    b.classList.remove("hidden");
    b.innerHTML = `<span class="rest-t">⏱ ${fmtClock(restRemaining)}</span>
      <span class="rest-actions">
        <button class="btn tiny" data-act="rest-add" data-s="30">+30s</button>
        <button class="btn tiny" data-act="rest-skip">Skip</button></span>`;
  } else if (restTimer !== null && restRemaining === 0 && b.innerHTML) {
    b.classList.remove("hidden");
    b.innerHTML = `<span class="rest-t done">Rest done ✅</span>
      <button class="btn tiny" data-act="rest-skip">Dismiss</button>`;
  }
}

// ----- plan settings modal -----
function openPlanModal() {
  const t = store.getTraining();
  const seg = (field, opts, cur) => opts.map(([v, l]) =>
    `<button type="button" class="seg-btn ${cur === v ? "on" : ""}" data-${field}="${v}">${l}</button>`).join("");
  const dayChips = WEEKDAYS.map((w, i) =>
    `<button type="button" class="chip ${t.days.includes(i) ? "on" : ""}" data-pday="${i}">${w}</button>`).join("");
  const splitOpts = Object.entries(program.SPLITS).map(([id, s]) =>
    `<button type="button" class="seg-btn ${t.splitId === id ? "on" : ""}" data-split="${id}">${s.name}</button>`).join("");

  openModal(`
    <h3>Your plan</h3>
    <div class="fld"><span>Split</span><div class="seg wrap" id="s-split">${splitOpts}</div></div>
    <div class="fld"><span>Training days</span><div class="chips">${dayChips}</div></div>
    <div class="fld"><span>Experience</span><div class="seg wrap" id="s-exp">${seg("exp", [["beginner", "Beginner"], ["intermediate", "Intermediate"], ["advanced", "Advanced"]], t.experience)}</div></div>
    <div class="fld"><span>Goal</span><div class="seg wrap" id="s-goal">${seg("goal", [["muscle", "Muscle"], ["strength", "Strength"], ["lean", "Lean"]], t.goal)}</div></div>
    <div class="fld"><span>Equipment</span><div class="seg wrap" id="s-eq">${seg("eq", [["gym", "Full gym"], ["dumbbells", "Dumbbells"], ["barbell", "Barbell"], ["bodyweight", "Bodyweight"]], t.equipment)}</div></div>
    <div class="modal-actions"><span></span><div>
      <button class="btn" data-act="close-modal">Cancel</button>
      <button class="btn primary" data-act="save-plan">Save</button>
    </div></div>
  `);
  const modal = $("#modal");
  let exp = t.experience, goal = t.goal, eq = t.equipment, splitId = t.splitId || "ul4";
  const pick = (attr, set) => modal.querySelectorAll(`[data-${attr}]`).forEach(b => b.onclick = () => {
    modal.querySelectorAll(`[data-${attr}]`).forEach(x => x.classList.toggle("on", x === b)); set(b.dataset[attr]);
  });
  pick("exp", v => exp = v); pick("goal", v => goal = v); pick("eq", v => eq = v);
  pick("split", v => splitId = v);
  modal.querySelectorAll(".chip[data-pday]").forEach(b => b.onclick = () => b.classList.toggle("on"));
  modal._collect = () => ({
    experience: exp, goal, equipment: eq, splitId,
    days: [...modal.querySelectorAll(".chip[data-pday].on")].map(x => Number(x.dataset.pday)).sort((a, b) => a - b),
  });
}

// ----- exercise progress detail -----
function openExerciseDetail(exId) {
  const ex = program.getExercise(exId);
  const hist = store.exerciseHistory(exId);
  const best = store.bestE1RM(exId);
  const chart = hist.length >= 2 ? miniChart(hist, "est. 1RM (lb)") : `<p class="stat-lbl">Log this lift a few times to see your strength trend.</p>`;
  openModal(`
    <h3>${esc(ex.name)}</h3>
    <div class="note">${esc(ex.muscle || "")} · target ${ex.repLow}–${ex.repHigh} reps × ${ex.sets} sets${best ? ` · best est. 1RM <b>${best} lb</b>` : ""}</div>
    ${chart}
    <div class="modal-actions"><span></span><button class="btn primary" data-act="close-modal">Close</button></div>
  `);
}

function miniChart(series, label = "") {
  const W = 320, H = 120, padL = 6, padR = 6, padT = 12, padB = 6;
  const t0 = store.dateFromKey(series[0].key).getTime();
  const t1 = store.dateFromKey(series[series.length - 1].key).getTime();
  const span = Math.max(1, t1 - t0);
  const X = k => padL + (store.dateFromKey(k).getTime() - t0) / span * (W - padL - padR);
  let min = Math.min(...series.map(s => s.w)), max = Math.max(...series.map(s => s.w));
  if (max - min < 2) { const m = (max + min) / 2; min = m - 1; max = m + 1; }
  const pad = (max - min) * 0.18; min -= pad; max += pad;
  const Y = w => padT + (1 - (w - min) / (max - min)) * (H - padT - padB);
  const path = series.map((p, i) => (i ? "L" : "M") + X(p.key).toFixed(1) + " " + Y(p.w).toFixed(1)).join(" ");
  const dots = series.map(s => `<circle cx="${X(s.key).toFixed(1)}" cy="${Y(s.w).toFixed(1)}" r="2.3" class="pt"/>`).join("");
  return `<div class="body-card"><svg class="wchart" viewBox="0 0 ${W} ${H}" width="100%">
    <text x="${padL}" y="10" class="axis-lbl">${Math.round(max)}</text>
    <path d="${path}" class="trend-line"/>${dots}
  </svg><div class="chart-x"><span>${shortDate(series[0].key)}</span><span class="trend-key">${label}</span><span>${shortDate(series[series.length - 1].key)}</span></div></div>`;
}

function markGymHabit(date) {
  for (const h of store.getActiveHabits()) {
    if (h.category === "gym" && h.name.trim().toLowerCase() === "gym" && store.isScheduled(h, date) && !store.isDone(h.id, date)) {
      store.setCompletion(h.id, date, true);
    }
  }
}

// ---------------- EAT (nutrition) ----------------
function renderEat() {
  const targets = store.computeTargets();
  const diet = store.getDiet();
  const today = store.todayKey();

  if (!targets) {
    $("#view").innerHTML = `
      <h2 class="screen-title">Eat</h2>
      <div class="body-card empty-card">
        <p>Set up your profile in the <b>Body</b> tab first — your meal plan is built from your calorie & protein targets.</p>
        <button class="btn primary" data-act="goto-body">Go to Body</button>
      </div>`;
    return;
  }

  let mp = store.getMealPlan(today);
  if (!mp) { store.setMealPlan(today, nutrition.generatePlan(diet, targets, today)); mp = store.getMealPlan(today); }
  const customs = store.customMealMap();
  const totals = nutrition.planTotals(mp.plan, customs);

  const cards = mp.plan.map((item, idx) => {
    const m = nutrition.resolveMeal(item.mealId, customs); if (!m) return "";
    const food = foods.foodById(item.mealId);        // from the food database
    const logged = nutrition.isLogged(item.mealId, customs);
    const s = item.servings ?? 1;
    const done = mp.done?.[idx] ? "done" : "";

    // anything with a serving label says "2 × 1 large egg"; the rest "1.5× serving"
    const qtyLbl = m.serving ? ` <span class="meal-qty">· ${s} × ${esc(m.serving)}</span>`
                             : (s !== 1 ? ` <span class="meal-qty">· ${s}× serving</span>` : "");
    const tag = food ? food.brand : (logged ? "yours" : "");

    return `<div class="meal-card ${done}">
      <button class="meal-check ${done}" data-act="meal-done" data-idx="${idx}">✓</button>
      <div class="meal-main">
        <div class="meal-slot">${nutrition.SLOT_LABEL[item.slot]}${qtyLbl}${tag ? ` <span class="meal-tag">${esc(tag)}</span>` : ""}</div>
        <div class="meal-name">${esc(m.name)}</div>
        <div class="meal-macros">${Math.round(m.kcal * s)} kcal · ${Math.round(m.p * s)}g protein</div>
        ${logged
          ? `<div class="meal-ing">${Math.round(m.c * s)}g carbs · ${Math.round(m.f * s)}g fat</div>`
          : `<div class="meal-ing">${esc(m.ing.join(" · "))}</div>`}
        ${!logged && m.recipe ? `<button class="btn tiny ghost" data-act="view-recipe" data-id="${m.id}">📋 recipe</button>` : ""}
      </div>
      ${logged
        ? `<button class="btn tiny" data-act="remove-plan-item" data-idx="${idx}">✕</button>`
        : `<button class="btn tiny" data-act="swap-meal" data-idx="${idx}">swap</button>`}
    </div>`;
  }).join("");

  const grocerySection = groceryMode ? renderGroceryList(groceryMode, diet, targets, today) : "";

  $("#view").innerHTML = `
    <div class="habits-head"><h2 class="screen-title">Eat</h2>
      <div style="display:flex;gap:6px">
        <button class="btn" data-act="grocery-toggle">🛒${groceryMode ? " ▲" : ""}</button>
        <button class="btn" data-act="edit-diet">Diet</button>
      </div></div>
    ${macroSummary(totals, targets)}
    ${cards}
    <button class="btn full" data-act="log-custom">🔍 Log food</button>
    <button class="btn full" data-act="regen-plan">↻ Give me a different plan</button>
    ${grocerySection}
    <p class="tdee-note">Tap ✓ as you eat each meal. Swap anything you don't fancy — protein & calories re-total live.</p>
  `;
}

function macroSummary(t, target) {
  const bar = (val, tgt, cls) => `<div class="bar"><div class="bar-fill ${cls}" style="width:${Math.min(100, Math.round(val / tgt * 100))}%"></div></div>`;
  return `<div class="body-card">
    <div class="macro-row"><span>Calories</span><span><b>${Math.round(t.kcal)}</b> / ${target.calories}</span></div>
    ${bar(t.kcal, target.calories, "")}
    <div class="macro-row"><span>Protein</span><span><b>${Math.round(t.p)}g</b> / ${target.protein}g</span></div>
    ${bar(t.p, target.protein, "p")}
    <div class="macro-mini">Carbs ${Math.round(t.c)}g · Fat ${Math.round(t.f)}g</div>
  </div>`;
}

function renderGroceryList(mode, diet, targets, today) {
  const scopeKey = `${mode}-${today}`;
  const checked = store.getGroceryChecked(scopeKey);

  const groups = mode === "week"
    ? nutrition.weeklyGroceryGroups(diet, targets, today)
    : (() => { const mp = store.getMealPlan(today); return mp ? nutrition.groceryGroups(mp.plan) : []; })();

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const totalCount = groups.reduce((a, g) => a + g.items.length, 0);

  const catsHtml = groups.map(g => `
    <div class="grocery-cat">
      <div class="grocery-cat-head">${g.icon} ${g.cat}</div>
      ${g.items.map(item => {
        const done = !!checked[item.key];
        const badge = item.days > 1
          ? `<span class="grocery-badge">${mode === "week" ? `×${item.days} servings` : `×${item.days}`}</span>`
          : "";
        return `<div class="grocery-item${done ? " done" : ""}" data-act="grocery-check" data-scope="${esc(scopeKey)}" data-key="${esc(item.key)}">
          <span class="grocery-cb">${done ? "✓" : ""}</span>
          <span class="grocery-text">${esc(item.text)}${badge}</span>
        </div>`;
      }).join("")}
    </div>`).join("");

  return `<div class="grocery-section">
    <div class="grocery-head">
      <span class="grocery-title">Grocery list${checkedCount ? ` <span class="grocery-prog">${checkedCount}/${totalCount}</span>` : ""}</span>
      <div class="seg grocery-seg">
        <button class="seg-btn${mode === "today" ? " on" : ""}" data-act="grocery-mode" data-mode="today">Today</button>
        <button class="seg-btn${mode === "week" ? " on" : ""}" data-act="grocery-mode" data-mode="week">Week</button>
      </div>
      <button class="btn tiny" data-act="grocery-clear" data-scope="${esc(scopeKey)}">Clear ✓</button>
    </div>
    ${catsHtml || '<p class="grocery-empty">No plan generated yet.</p>'}
  </div>`;
}

function openDietModal() {
  const d = store.getDiet();
  const seg = (attr, opts, cur) => opts.map(([v, l]) => `<button type="button" class="seg-btn ${cur === v ? "on" : ""}" data-${attr}="${v}">${l}</button>`).join("");
  const avoidChips = [["dairy", "Dairy"], ["nuts", "Nuts"], ["gluten", "Gluten"]].map(([v, l]) =>
    `<button type="button" class="chip ${d.avoid.includes(v) ? "on" : ""}" data-av="${v}">${l}</button>`).join("");
  openModal(`
    <h3>Diet preferences</h3>
    <div class="fld"><span>Diet type</span><div class="seg wrap" id="d-type">${seg("dt", [["omnivore", "Omnivore"], ["vegetarian", "Vegetarian"], ["pescatarian", "Pescatarian"], ["vegan", "Vegan"]], d.type)}</div></div>
    <div class="fld"><span>Avoid</span><div class="chips">${avoidChips}</div></div>
    <div class="fld"><span>Meals per day</span><div class="seg wrap" id="d-meals">${seg("dm", [["3", "3 meals"], ["3+snacks", "3 + snacks"], ["2", "2 (skip breakfast)"]], d.mealsPerDay)}</div></div>
    <div class="modal-actions"><span></span><div>
      <button class="btn" data-act="close-modal">Cancel</button>
      <button class="btn primary" data-act="save-diet">Save</button></div></div>
  `);
  const modal = $("#modal");
  let type = d.type, meals = d.mealsPerDay;
  modal.querySelectorAll("[data-dt]").forEach(b => b.onclick = () => { type = b.dataset.dt; modal.querySelectorAll("[data-dt]").forEach(x => x.classList.toggle("on", x === b)); });
  modal.querySelectorAll("[data-dm]").forEach(b => b.onclick = () => { meals = b.dataset.dm; modal.querySelectorAll("[data-dm]").forEach(x => x.classList.toggle("on", x === b)); });
  modal.querySelectorAll(".chip[data-av]").forEach(b => b.onclick = () => b.classList.toggle("on"));
  modal._collect = () => ({ type, mealsPerDay: meals, avoid: [...modal.querySelectorAll(".chip[data-av].on")].map(x => x.dataset.av) });
}

// ----- food picker: search the food database + your saved meals -----
const SLOT_ORDER = ["breakfast", "lunch", "dinner", "snack"];

// guess the slot from the time of day so the form opens on the likely one
function guessSlot() {
  const h = new Date().getHours();
  if (h < 11) return "breakfast";
  if (h < 15) return "lunch";
  if (h < 21) return "dinner";
  return "snack";
}

// picker state: which row is expanded, and at what quantity
let pickSel = null;   // { id, qty }
const round2 = (n) => Math.round(n * 10) / 10;

function pickerMacros(item, qty) {
  return { kcal: Math.round(item.kcal * qty), p: Math.round(item.p * qty),
           c: Math.round(item.c * qty), f: Math.round(item.f * qty) };
}

// one result row, plus the quantity panel when it's the selected one
function pickerRow(item, { saved = false } = {}) {
  const sub = saved
    ? `Yours · ${item.kcal} kcal · ${item.p}g protein${item.serving ? ` · ${esc(item.serving)}` : ""}`
    : `${item.brand ? esc(item.brand) + " · " : ""}${item.kcal} kcal · ${item.p}g protein · ${esc(item.serving)}`;

  const row = `<div class="cm-row">
    <button class="cm-pick ${pickSel?.id === item.id ? "on" : ""}" data-act="pick-item" data-id="${item.id}">
      <span class="cm-name">${esc(item.name)}</span>
      <span class="cm-macros">${sub}</span>
    </button>
    ${saved ? `<button class="btn tiny" data-act="del-custom-meal" data-id="${item.id}" title="Delete saved meal">🗑</button>` : ""}
  </div>`;

  if (pickSel?.id !== item.id) return row;

  const qty = pickSel.qty;
  const t = pickerMacros(item, qty);
  const unit = item.serving || "serving";
  const slotChips = SLOT_ORDER.map(s =>
    `<button type="button" class="chip ${pickSel.slot === s ? "on" : ""}" data-act="pick-slot" data-slot="${s}">${nutrition.SLOT_LABEL[s]}</button>`).join("");

  return row + `<div class="cm-expand">
    <div class="cm-qty">
      <button class="btn tiny" data-act="pick-qty" data-d="-0.5">−</button>
      <input id="pick-q" type="number" inputmode="decimal" step="0.5" min="0.5" value="${qty}"/>
      <button class="btn tiny" data-act="pick-qty" data-d="0.5">+</button>
      <span class="cm-unit">× ${esc(unit)}</span>
    </div>
    <div class="cm-calc" id="pick-calc">${t.kcal} kcal · ${t.p}g protein · ${t.c}g carbs · ${t.f}g fat</div>
    <div class="chips cm-slots">${slotChips}</div>
    <div class="cm-expand-actions">
      <button class="btn tiny ghost" data-act="pick-adjust" data-id="${item.id}">✎ adjust</button>
      <button class="btn primary" data-act="pick-add" data-id="${item.id}">Add to today</button>
    </div>
  </div>`;
}

// Open Food Facts lookup state — only ever populated by an explicit tap
let offState = { q: null, status: "idle", results: [], msg: "" };

function onlineSection(q) {
  if (offState.q !== q) {
    if (!navigator.onLine) {
      return `<div class="cm-group">Online</div>
        <p class="stat-lbl" style="padding:2px 0 8px">You're offline — the ${foods.FOODS.length} foods above still work.</p>`;
    }
    return `<button class="btn full off-btn" data-act="off-search">🌐 Also search Open Food Facts</button>`;
  }
  if (offState.status === "loading") {
    return `<div class="cm-group">Online</div><p class="stat-lbl" style="padding:2px 0 8px">Searching Open Food Facts…</p>`;
  }
  if (offState.status === "error") {
    return `<div class="cm-group">Online</div>
      <p class="stat-lbl" style="padding:2px 0 8px">${esc(offState.msg)}</p>
      <button class="btn full off-btn" data-act="off-search">Try again</button>`;
  }
  if (!offState.results.length) {
    return `<div class="cm-group">Online</div><p class="stat-lbl" style="padding:2px 0 8px">Nothing found online for “${esc(q)}”.</p>`;
  }
  return `<div class="cm-group">Open Food Facts · adding saves it to your meals</div>`
       + offState.results.map(f => pickerRow(f)).join("");
}

function pickerRows(query = "") {
  const q = query.trim();
  const saved = store.getCustomMeals()
    .filter(m => !q || m.name.toLowerCase().includes(q.toLowerCase()));

  // no query yet → show what you've saved, since that's what you repeat most
  if (!q) {
    if (!saved.length) {
      return `<p class="stat-lbl" style="padding:6px 0 10px">Search for anything — “egg”, “big mac”, “chicken breast”, “monster”.</p>`;
    }
    return `<div class="cm-group">Your saved meals</div>` +
      saved.map(m => pickerRow(m, { saved: true })).join("");
  }

  const hits = foods.searchFoods(q, 40);
  const local =
      (saved.length ? `<div class="cm-group">Your saved meals</div>` + saved.map(m => pickerRow(m, { saved: true })).join("") : "")
    + (hits.length  ? `<div class="cm-group">Food database</div>`  + hits.map(f => pickerRow(f)).join("")  : "");

  const nothingLocal = !saved.length && !hits.length
    ? `<p class="stat-lbl" style="padding:6px 0 8px">Nothing in the app for “${esc(q)}”. Try online, or add it yourself below.</p>`
    : "";

  return local + nothingLocal + onlineSection(q);
}

// ----- barcode scanning -----
let scanning = false;

const scanMsg = (t) => { const el = $("#scan-msg"); if (el) el.textContent = t; };

// show/hide the scanner without touching #cm-results, so re-rendering the
// result list can never rip the live <video> out of the DOM
function setScanUI(on) {
  $("#cm-scan")?.classList.toggle("hidden", !on);
  $("#cm-results")?.classList.toggle("hidden", on);
  $("#cm-new")?.classList.toggle("hidden", on);
}

async function openScanner() {
  if (scanning) return;
  scanning = true;
  setScanUI(true);
  scanMsg("Starting camera…");
  try {
    await scanner.startScan($("#scan-video"), onBarcode);
    // The permission prompt can outlive the sheet: if the user closed it while
    // we were waiting, the stream would start with nothing to stop it.
    if (!scanning) { scanner.stopScan(); scanner.releaseVideo($("#scan-video")); return; }
    scanMsg("Point the camera at the barcode.");
  } catch (err) {
    console.warn("scan failed", err);
    scanner.stopScan();
    if (!scanning || !$("#scan-manual")) return;   // sheet already gone
    scanMsg(scanner.describeError(err));
    $("#scan-manual").open = true;                 // typing it in is the way out
  }
}

// Sync on purpose: the panel must close on the same tick as the tap.
// Awaiting teardown first left the scanner visibly stuck for a beat.
function closeScanner() {
  scanning = false;
  setScanUI(false);
  scanner.stopScan();
  scanner.releaseVideo($("#scan-video"));
}

// a decoded (or hand-typed) barcode -> OFF product -> ready-to-add row
async function onBarcode(code) {
  await scanner.stopScan();            // one hit is enough; free the camera
  scanner.releaseVideo($("#scan-video"));
  scanMsg(`Found ${code} — looking it up…`);
  try {
    const item = await off.lookupBarcode(code);
    if (!$("#cm-results")) return;              // sheet closed mid-lookup
    if (!item) {
      scanMsg(`Barcode ${code} isn't in Open Food Facts. Add it yourself below.`);
      scanning = false;
      setScanUI(false);
      offState = { q: null, status: "idle", results: [], msg: "" };
      $("#cm-new").open = true;
      toast("Not found — add it manually");
      return;
    }
    // hand it to the picker as if it were an online search result
    scanning = false;
    setScanUI(false);
    offState = { q: ($("#cm-search").value || "").trim() || code, status: "done", results: [item], msg: "" };
    $("#cm-search").value = offState.q;
    pickSel = { id: item.id, qty: 1, slot: guessSlot() };
    refreshPicker();
    $("#cm-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err) {
    if (!$("#scan-manual")) return;             // sheet closed mid-lookup
    scanMsg(err?.message === "offline"
      ? "You're offline — a barcode lookup needs a connection."
      : "Couldn't reach Open Food Facts. Try again in a moment.");
    $("#scan-manual").open = true;
  }
}

// fire the online lookup for whatever is currently typed
function runOnlineSearch() {
  const q = ($("#cm-search")?.value || "").trim();
  if (!q) return;
  offState = { q, status: "loading", results: [], msg: "" };
  refreshPicker();
  off.searchOnline(q)
    .then(results => {
      if (offState.q !== q) return;                  // a newer search superseded this
      offState = { q, status: "done", results, msg: "" };
    })
    .catch(err => {
      if (offState.q !== q) return;
      const offline = err?.message === "offline";
      const aborted = err?.name === "AbortError";
      offState = { q, status: "error", results: [],
        msg: offline ? "You're offline."
           : aborted ? "That took too long — tap to retry."
           : "Couldn't reach Open Food Facts (it limits how often you can search). Wait a moment and retry." };
    })
    .finally(() => { if (offState.q === q) refreshPicker(); });
}

// re-render just the results list, keeping the search box focused
function refreshPicker() {
  const box = $("#cm-results");
  if (!box) return;
  box.innerHTML = pickerRows($("#cm-search")?.value || "");
  const qEl = $("#pick-q");
  if (qEl) qEl.addEventListener("input", () => {
    const item = pickedItem();
    const qty = Number(qEl.value);
    if (!item || !(qty > 0)) return;
    pickSel.qty = qty;
    const t = pickerMacros(item, qty);
    $("#pick-calc").textContent = `${t.kcal} kcal · ${t.p}g protein · ${t.c}g carbs · ${t.f}g fat`;
  });
}

function pickedItem() {
  if (!pickSel) return null;
  return foods.foodById(pickSel.id)
      || store.getCustomMeal(pickSel.id)
      || offState.results.find(r => r.id === pickSel.id)
      || null;
}

function openFoodPickerModal() {
  pickSel = null;
  scanning = false;
  offState = { q: null, status: "idle", results: [], msg: "" };
  const slot = guessSlot();
  const slotSeg = SLOT_ORDER.map(s =>
    `<button type="button" class="seg-btn ${s === slot ? "on" : ""}" data-cmslot="${s}">${nutrition.SLOT_LABEL[s]}</button>`).join("");

  openModal(`
    <h3>Log food</h3>
    <label class="fld"><span>Search foods & your saved meals</span>
      <div class="search-row">
        <input id="cm-search" type="search" placeholder="e.g. egg, big mac, chicken breast…" autocomplete="off"/>
        <button class="btn scan-btn" data-act="scan-open" title="Scan a barcode">📷</button>
      </div></label>

    <div id="cm-scan" class="cm-scan hidden">
      <div class="scan-box">
        <video id="scan-video" playsinline autoplay muted></video>
        <div class="scan-frame"></div>
      </div>
      <p class="stat-lbl" id="scan-msg">Starting camera…</p>
      <details class="adv" id="scan-manual">
        <summary>Type the barcode number instead</summary>
        <div class="search-row">
          <input id="scan-code" type="text" inputmode="numeric" placeholder="e.g. 3017620422003" autocomplete="off"/>
          <button class="btn" data-act="scan-lookup">Find</button>
        </div>
      </details>
      <button class="btn full" data-act="scan-close">Cancel scanning</button>
    </div>

    <div id="cm-results" class="cm-results"></div>

    <details class="adv" id="cm-new">
      <summary>＋ Add something that isn't listed</summary>
      <label class="fld"><span>Name</span>
        <input id="cm-name" type="text" placeholder="e.g. Mum's lasagne" autocomplete="off"/></label>
      <div class="fld"><span>Meal slot</span><div class="seg wrap" id="cm-slot">${slotSeg}</div></div>
      <div class="row2">
        <label class="fld"><span>Calories</span><input id="cm-kcal" type="number" inputmode="numeric" min="0" placeholder="e.g. 650"/></label>
        <label class="fld"><span>Protein (g)</span><input id="cm-p" type="number" inputmode="numeric" min="0" placeholder="e.g. 40"/></label>
      </div>
      <div class="row2">
        <label class="fld"><span>Carbs (g) <i>optional</i></span><input id="cm-c" type="number" inputmode="numeric" min="0"/></label>
        <label class="fld"><span>Fat (g) <i>optional</i></span><input id="cm-f" type="number" inputmode="numeric" min="0"/></label>
      </div>
      <button class="btn primary full" data-act="save-custom-meal">Save & add</button>
    </details>

    <div class="modal-actions"><span></span>
      <button class="btn" data-act="close-modal">Done</button></div>
  `);

  const modal = $("#modal");
  let chosenSlot = slot;
  modal.querySelectorAll("[data-cmslot]").forEach(b => b.onclick = () => {
    chosenSlot = b.dataset.cmslot;
    modal.querySelectorAll("[data-cmslot]").forEach(x => x.classList.toggle("on", x === b));
  });
  $("#cm-search").addEventListener("input", () => {
    pickSel = null;
    offState = { q: null, status: "idle", results: [], msg: "" };   // stale for a new query
    refreshPicker();
  });
  modal._collect = () => ({
    name: $("#cm-name").value,
    slot: chosenSlot,
    kcal: $("#cm-kcal").value,
    p: $("#cm-p").value,
    c: $("#cm-c").value,
    f: $("#cm-f").value,
  });
  modal._setSlot = (s) => {
    chosenSlot = s;
    modal.querySelectorAll("[data-cmslot]").forEach(x => x.classList.toggle("on", x.dataset.cmslot === s));
  };
  refreshPicker();
}

// "Nutella" branded "Nutella" shouldn't become "Nutella Nutella"
function fullName(item) {
  const b = (item.brand || "").trim();
  if (!b || item.name.toLowerCase().startsWith(b.toLowerCase())) return item.name;
  return `${b} ${item.name}`;
}

// prefill the "add your own" form from a database food, so a wrong value can
// be corrected and saved as your own copy
function adjustFood(item) {
  const modal = $("#modal");
  $("#cm-name").value = fullName(item);
  $("#cm-kcal").value = item.kcal;
  $("#cm-p").value = item.p;
  $("#cm-c").value = item.c;
  $("#cm-f").value = item.f;
  if (item.slot) modal._setSlot(item.slot);
  $("#cm-new").open = true;
  $("#cm-new").scrollIntoView({ behavior: "smooth", block: "start" });
}

// Reroll the suggested library meals but keep anything you logged yourself —
// those record what you actually ate, so they must survive a regenerate.
function regeneratePlan(salt) {
  const today = store.todayKey();
  const customs = store.customMealMap();
  const mp = store.getMealPlan(today);

  const kept = [], keptDone = [];
  (mp?.plan || []).forEach((item, i) => {
    if (!nutrition.isLogged(item.mealId, customs)) return;
    keptDone.push(!!mp.done?.[i]);
    kept.push(item);
  });

  const fresh = nutrition.generatePlan(store.getDiet(), store.computeTargets(), today, salt);
  const done = {};
  keptDone.forEach((wasDone, i) => { if (wasDone) done[fresh.length + i] = true; });

  store.setMealPlan(today, [...fresh, ...kept], done);
  return kept.length;
}

// add a food or saved meal to today's plan
function addCustomToPlan(meal, qty = 1, slot = null) {
  const today = store.todayKey();
  if (store.getCustomMeal(meal.id)) store.touchCustomMeal(meal.id);
  store.addPlanItem(today, { slot: slot || meal.slot || guessSlot(), mealId: meal.id, servings: qty });
}

// ---------------- SKIN ----------------
const COND_EMOJI  = ["", "😖", "😕", "😐", "🙂", "😊"];
const COND_LABEL  = ["", "Bad day", "Rough", "Okay", "Good", "Great!"];
const ACNE_LABEL  = { clear: "✨ Clear", mild: "🔴 Mild", moderate: "🟠 Moderate", bad: "🔴🔴 Bad" };
const OIL_LABEL   = ["", "Normal", "Oily", "Very oily"];

function renderSkin() {
  const today = store.todayKey();
  const log = store.getSkinLog(today);
  const skin = store.getSkin();
  const series = store.skinSeries(30);

  const todayLogged = log && log.condition;
  const checkInCard = `<div class="body-card">
    <div class="bc-head"><span>Today's skin</span>${todayLogged ? `<span class="bc-edit" data-act="skin-checkin">✎ edit</span>` : ""}</div>
    ${todayLogged
      ? `<div class="stat-row three">
          <div class="stat"><div class="stat-n">${COND_EMOJI[log.condition]}</div><div class="stat-l">${COND_LABEL[log.condition]}</div></div>
          <div class="stat"><div class="stat-n" style="font-size:13px">${ACNE_LABEL[log.acne] || "—"}</div><div class="stat-l">acne</div></div>
          <div class="stat"><div class="stat-n" style="font-size:13px">${OIL_LABEL[log.oiliness] || "—"}</div><div class="stat-l">oiliness</div></div>
        </div>`
      : `<p class="stat-lbl">Tap to log how your skin looks today.</p>
         <button class="btn primary full" data-act="skin-checkin">Log today's skin</button>`
    }
  </div>`;

  const routineCard = (period, steps, label) => {
    const doneMap = log?.[period === "am" ? "amDone" : "pmDone"] || {};
    const doneCount = steps.filter(s => doneMap[s.id]).length;
    const rows = steps.map(s => {
      const done = !!doneMap[s.id];
      return `<div class="sk-step ${done ? "done" : ""}" data-act="skin-step" data-period="${period}" data-step="${s.id}">
        <span class="sk-check">${done ? "✓" : ""}</span>
        <span class="sk-info">
          <span class="sk-name">${esc(s.name)}</span>
          ${s.product ? `<span class="sk-prod">${esc(s.product)}</span>` : ""}
        </span>
      </div>`;
    }).join("");
    return `<div class="body-card">
      <div class="bc-head">
        <span>${label} <span class="bc-sub">${doneCount}/${steps.length}</span></span>
        <span class="bc-edit" data-act="edit-skin-routine" data-period="${period}">✎ products</span>
      </div>
      ${rows}
    </div>`;
  };

  const skinTips = [
    "☀️ SPF 50+ every morning — the #1 anti-aging and anti-acne move",
    "💧 Niacinamide (10%) reduces sebum, pores, and hyperpigmentation",
    "🌙 Retinol at night (start 2× / week) — proven for skin quality long-term",
    "🚿 Wash pillowcase weekly — bacteria buildup causes breakouts",
    "🚫 Hands off your face — transferring bacteria causes new pimples",
    "🧴 Don't layer vitamin C + niacinamide + retinol all at once",
    "💦 Stay hydrated — dehydrated skin overproduces oil",
  ];

  $("#view").innerHTML = `
    ${subHeader("Skin")}
    ${checkInCard}
    ${routineCard("am", skin.amSteps, "☀️ Morning routine")}
    ${routineCard("pm", skin.pmSteps, "🌙 Evening routine")}
    ${series.length >= 2 ? miniChart(series, "skin condition (1–5)") : ""}
    <div class="body-card">
      <div class="bc-head"><span>The skin protocol</span><span class="bc-sub">evidence-based</span></div>
      ${skinTips.map(t => `<div class="tip">${t}</div>`).join("")}
    </div>
  `;
}

function openSkinCheckInModal() {
  const today = store.todayKey();
  const log = store.getSkinLog(today) || {};
  openModal(`
    <h3>Today's skin check-in</h3>
    <div class="fld"><span>Overall condition</span>
      <div class="seg wrap" id="sk-cond">
        ${COND_EMOJI.slice(1).map((e, i) => `<button type="button" class="seg-btn${log.condition === i + 1 ? " on" : ""}" data-cond="${i + 1}">${e} ${i + 1}</button>`).join("")}
      </div>
    </div>
    <div class="fld"><span>Acne</span>
      <div class="seg wrap" id="sk-acne">
        ${[["clear", "✨ Clear"], ["mild", "🔴 Mild"], ["moderate", "🟠 Moderate"], ["bad", "🔴🔴 Bad"]].map(([v, l]) =>
          `<button type="button" class="seg-btn${log.acne === v ? " on" : ""}" data-acne="${v}">${l}</button>`).join("")}
      </div>
    </div>
    <div class="fld"><span>Oiliness</span>
      <div class="seg" id="sk-oil">
        ${[["1", "Normal"], ["2", "Oily"], ["3", "Very oily"]].map(([v, l]) =>
          `<button type="button" class="seg-btn${String(log.oiliness) === v ? " on" : ""}" data-oil="${v}">${l}</button>`).join("")}
      </div>
    </div>
    <div class="modal-actions"><span></span><div>
      <button class="btn" data-act="close-modal">Cancel</button>
      <button class="btn primary" data-act="save-skin-log">Save</button>
    </div></div>
  `);
  const modal = $("#modal");
  let condition = log.condition || null, acne = log.acne || null, oiliness = log.oiliness || null;
  modal.querySelectorAll("[data-cond]").forEach(b => b.onclick = () => {
    condition = Number(b.dataset.cond);
    modal.querySelectorAll("[data-cond]").forEach(x => x.classList.toggle("on", x === b));
  });
  modal.querySelectorAll("[data-acne]").forEach(b => b.onclick = () => {
    acne = b.dataset.acne;
    modal.querySelectorAll("[data-acne]").forEach(x => x.classList.toggle("on", x === b));
  });
  modal.querySelectorAll("[data-oil]").forEach(b => b.onclick = () => {
    oiliness = Number(b.dataset.oil);
    modal.querySelectorAll("[data-oil]").forEach(x => x.classList.toggle("on", x === b));
  });
  modal._collect = () => ({ condition, acne, oiliness: oiliness || null });
}

function openSkinRoutineModal(period) {
  const skin = store.getSkin();
  const steps = period === "am" ? skin.amSteps : skin.pmSteps;
  const label = period === "am" ? "☀️ Morning" : "🌙 Evening";
  openModal(`
    <h3>${label} routine — products</h3>
    <p class="stat-lbl" style="margin-top:0;margin-bottom:14px">Enter what you actually use for each step (optional).</p>
    ${steps.map((s, i) => `
      <label class="fld">
        <span>${esc(s.name)}</span>
        <input type="text" class="sk-prod-input" data-si="${i}" value="${esc(s.product)}" placeholder="e.g. CeraVe Foaming Cleanser"/>
      </label>`).join("")}
    <div class="modal-actions"><span></span><div>
      <button class="btn" data-act="close-modal">Cancel</button>
      <button class="btn primary" data-act="save-skin-routine" data-period="${period}">Save</button>
    </div></div>
  `);
}

function markSkinHabit(date, period) {
  if (period !== "am") return;
  const skin = store.getSkin();
  const log = store.getSkinLog(date);
  const allDone = skin.amSteps.every(s => log?.amDone?.[s.id]);
  if (!allDone) return;
  for (const h of store.getActiveHabits()) {
    const name = h.name.toLowerCase();
    if ((name.includes("skin") || name.includes("cleanser")) && h.timeOfDay === "morning"
        && store.isScheduled(h, date) && !store.isDone(h.id, date)) {
      store.setCompletion(h.id, date, true);
    }
  }
}

// ---------------- SLEEP ----------------
function renderSleep() {
  const s = store.getSleep();
  const today = store.todayKey();
  const tonight = store.tonightBedtime();
  const log = store.getSleepLog(today);
  const series = store.sleepSeries(21);
  const avgMin = series.length ? Math.round(series.reduce((a, x) => a + x.mins, 0) / series.length) : 0;

  let planStatus;
  if (!s.currentBed) planStatus = "Set your schedule to start a fix plan";
  else if (tonight === s.targetBed) planStatus = "🎯 You've reached your target";
  else planStatus = `shifting earlier toward ${s.targetBed}`;

  const chartSeries = series.map(x => ({ key: x.key, w: Math.round(x.mins / 60 * 10) / 10 }));

  $("#view").innerHTML = `
    ${subHeader("Sleep")}
    <div class="body-card">
      <div class="bc-head"><span>Tonight's target bedtime</span><span class="bc-edit" data-act="edit-sleep">✎ schedule</span></div>
      <div class="big-weight">${tonight || "—"}</div>
      <div class="stat-lbl">Wake ${s.targetWake} · ${planStatus}</div>
    </div>
    <div class="body-card">
      <div class="bc-head"><span>Last night</span>${avgMin ? `<span class="bc-sub">avg ${fmtDur(avgMin)}</span>` : ""}</div>
      ${log && log.bed ? `<div class="big-num">${fmtDur(store.sleepDuration(log.bed, log.wake))}</div><div class="stat-lbl">${log.bed} → ${log.wake}${log.quality ? " · " + ["", "😴 poor", "😐 ok", "😃 great"][log.quality] : ""}</div>` : `<p class="stat-lbl">Not logged yet.</p>`}
      <button class="btn full" data-act="log-sleep">${log && log.bed ? "Edit last night" : "Log last night"}</button>
    </div>
    ${chartSeries.length >= 2 ? miniChart(chartSeries, "hours slept") : ""}
    ${windDownCard()}
  `;
}

function fmtDur(mins) { if (mins == null) return "—"; return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`; }

function windDownCard() {
  const tips = [
    "🌅 Bright light within 30–60 min of waking",
    "☕ Cut caffeine 8–10 hrs before bed",
    "🍽️ Last big meal ~3 hrs before bed",
    "📵 30–60 min screen-free wind-down",
    "❄️ Cool (18°C / 65°F), dark, quiet room",
    "⏰ Same bed + wake time (±30 min) daily",
  ];
  return `<div class="body-card">
    <div class="bc-head"><span>The sleep protocol</span><span class="bc-sub">evidence-based</span></div>
    ${tips.map(t => `<div class="tip">${t}</div>`).join("")}</div>`;
}

function openSleepModal() {
  const s = store.getSleep();
  openModal(`
    <h3>Sleep schedule</h3>
    <label class="fld"><span>Your current bedtime (roughly)</span><input id="s-cur" type="time" value="${s.currentBed || ""}"/></label>
    <label class="fld"><span>Target bedtime</span><input id="s-bed" type="time" value="${s.targetBed || "23:00"}"/></label>
    <label class="fld"><span>Target wake time</span><input id="s-wake" type="time" value="${s.targetWake || "07:00"}"/></label>
    <div class="note">I'll move your bedtime 15 min earlier every 2 days until you hit the target — no jarring jumps.</div>
    <div class="modal-actions"><span></span><div>
      <button class="btn" data-act="close-modal">Cancel</button>
      <button class="btn primary" data-act="save-sleep">Save</button></div></div>
  `);
}

function openSleepLogModal() {
  const today = store.todayKey();
  const log = store.getSleepLog(today) || {};
  const s = store.getSleep();
  openModal(`
    <h3>Log last night</h3>
    <div class="row2">
      <label class="fld"><span>Fell asleep</span><input id="l-bed" type="time" value="${log.bed || s.targetBed || "23:00"}"/></label>
      <label class="fld"><span>Woke up</span><input id="l-wake" type="time" value="${log.wake || s.targetWake || "07:00"}"/></label>
    </div>
    <div class="fld"><span>Quality</span><div class="seg" id="l-q">${[["1", "😴 Poor"], ["2", "😐 OK"], ["3", "😃 Great"]].map(([v, l]) => `<button type="button" class="seg-btn ${String(log.quality) === v ? "on" : ""}" data-q="${v}">${l}</button>`).join("")}</div></div>
    <div class="modal-actions"><span></span><div>
      <button class="btn" data-act="close-modal">Cancel</button>
      <button class="btn primary" data-act="save-sleep-log">Save</button></div></div>
  `);
  const modal = $("#modal");
  let q = log.quality || null;
  modal.querySelectorAll("[data-q]").forEach(b => b.onclick = () => { q = Number(b.dataset.q); modal.querySelectorAll("[data-q]").forEach(x => x.classList.toggle("on", x === b)); });
  modal._collect = () => ({ bed: $("#l-bed").value, wake: $("#l-wake").value, quality: q });
}

// ---------------- SUPPLEMENTS ----------------
function renderSupplements() {
  const names = store.getAllHabits().map(h => h.name.toLowerCase());
  const inRoutine = (sup) => names.some(n => n.startsWith(sup.name.toLowerCase()));

  const suppCard = (sup) => `<div class="supp">
    <div class="supp-head"><span class="supp-name">${esc(sup.name)}</span><span class="supp-dose">${esc(sup.dose)}</span></div>
    <div class="supp-why">${esc(sup.why)}</div>
    <div class="supp-when">🕐 ${esc(sup.when)}</div>
    ${sup.caution ? `<div class="supp-caution">⚠️ ${esc(sup.caution)}</div>` : ""}
    ${sup.blueprint ? `<div class="supp-bp">Also in Bryan Johnson's Blueprint ✓</div>` : ""}
    <button class="btn tiny ${inRoutine(sup) ? "" : "primary"}" data-act="add-supp" data-id="${sup.id}" ${inRoutine(sup) ? "disabled" : ""}>${inRoutine(sup) ? "✓ In your routine" : "+ Add to daily routine"}</button>
  </div>`;

  const tierSection = (tier) => {
    const items = SUPPLEMENTS.filter(s => s.tier === tier);
    return `<div class="body-card">
      <div class="bc-head"><span>${TIER_INFO[tier].label}</span></div>
      <p class="stat-lbl">${TIER_INFO[tier].blurb}</p>
      ${items.map(suppCard).join("")}</div>`;
  };

  $("#view").innerHTML = `
    ${subHeader("Supplements")}
    ${tierSection("core")}
    ${tierSection("situational")}
    <div class="body-card">
      <div class="bc-head"><span>${TIER_INFO.blueprint.label}</span></div>
      <p class="stat-lbl">${TIER_INFO.blueprint.blurb}</p>
      <div class="skip-list">${BLUEPRINT_SKIP.map(x => `<span class="skip-chip">${esc(x)}</span>`).join("")}</div>
    </div>
    <p class="tdee-note">⚕️ Educational, not medical advice. Buy third-party tested (NSF / Informed Sport), get basic bloodwork (esp. vitamin D) before loading up, and check with a doctor if you take meds or have any condition.</p>
  `;
}

// ---------------- HABITS (manage) ----------------
function renderHabits() {
  const groups = ["morning", "evening", "anytime"].map(tod => {
    const list = store.getAllHabits().filter(h => h.timeOfDay === tod);
    if (!list.length) return "";
    const rows = list.map(h => {
      const sched = h.days === "daily" ? "Every day"
        : Array.isArray(h.days) ? h.days.map(d => WEEKDAYS[d]).join(" ") : "";
      return `<div class="hb-row ${h.active ? "" : "off"}" data-act="edit" data-id="${h.id}">
        <span class="hb-ic">${h.icon}</span>
        <span class="hb-main">
          <span class="hb-name">${esc(h.name)}</span>
          <span class="hb-sub">${esc(CATEGORY_LABELS[h.category] || "")} · ${esc(sched)}</span>
        </span>
        <span class="hb-edit">✎</span>
      </div>`;
    }).join("");
    return `<section class="tod"><h3 class="tod-title">${TIME_LABELS[tod]}</h3>${rows}</section>`;
  }).join("");

  $("#view").innerHTML = `
    ${subHeader("Habits")}
    <div class="habits-head">
      <span class="stat-lbl">Your daily habits</span>
      <button class="btn primary" data-act="add">+ Add</button>
    </div>
    ${groups || `<div class="empty"><p>No habits yet.</p></div>`}
  `;
}

// ---------------- habit editor modal ----------------
function openEditor(id) {
  const editing = id ? store.getAllHabits().find(h => h.id === id) : null;
  const h = editing || { name: "", category: "custom", timeOfDay: "anytime", days: "daily", active: true };
  const catOpts = Object.keys(CATEGORY_LABELS).map(c =>
    `<option value="${c}" ${h.category === c ? "selected" : ""}>${CATEGORY_ICONS[c]} ${CATEGORY_LABELS[c]}</option>`).join("");
  const todOpts = Object.keys(TIME_LABELS).map(t =>
    `<option value="${t}" ${h.timeOfDay === t ? "selected" : ""}>${TIME_LABELS[t]}</option>`).join("");
  const isDaily = h.days === "daily";
  const selDays = Array.isArray(h.days) ? h.days : [];
  const dayChips = WEEKDAYS.map((w, i) =>
    `<button type="button" class="chip ${selDays.includes(i) ? "on" : ""}" data-day="${i}">${w}</button>`).join("");

  openModal(`
    <h3>${editing ? "Edit habit" : "New habit"}</h3>
    <label class="fld"><span>Name</span>
      <input id="f-name" type="text" value="${esc(h.name)}" placeholder="e.g. Sunscreen" maxlength="60"/></label>
    <label class="fld"><span>Category</span><select id="f-cat">${catOpts}</select></label>
    <label class="fld"><span>Time of day</span><select id="f-tod">${todOpts}</select></label>
    <div class="fld"><span>Schedule</span>
      <div class="seg">
        <button type="button" class="seg-btn ${isDaily ? "on" : ""}" data-sched="daily">Every day</button>
        <button type="button" class="seg-btn ${isDaily ? "" : "on"}" data-sched="days">Specific days</button>
      </div>
      <div id="day-chips" class="chips ${isDaily ? "hidden" : ""}">${dayChips}</div>
    </div>
    <div class="modal-actions">
      ${editing ? `<button class="btn danger" data-act="delete-habit" data-id="${editing.id}">Delete</button>` : "<span></span>"}
      <div>
        <button class="btn" data-act="close-modal">Cancel</button>
        <button class="btn primary" data-act="save-habit" data-id="${editing?.id || ""}">Save</button>
      </div>
    </div>
  `);

  // editor-local interactions
  const modal = $("#modal");
  let schedMode = isDaily ? "daily" : "days";
  modal.querySelectorAll("[data-sched]").forEach(b => b.onclick = () => {
    schedMode = b.dataset.sched;
    modal.querySelectorAll("[data-sched]").forEach(x => x.classList.toggle("on", x === b));
    $("#day-chips").classList.toggle("hidden", schedMode === "daily");
  });
  modal.querySelectorAll(".chip[data-day]").forEach(b => b.onclick = () =>
    b.classList.toggle("on"));

  modal._collect = () => {
    const name = $("#f-name").value.trim();
    if (!name) { $("#f-name").focus(); return null; }
    let days = "daily";
    if (schedMode === "days") {
      days = [...modal.querySelectorAll(".chip[data-day].on")].map(x => Number(x.dataset.day));
      if (!days.length) days = "daily";
    }
    const category = $("#f-cat").value;
    return { name, category, icon: CATEGORY_ICONS[category], timeOfDay: $("#f-tod").value, days };
  };
}

// ---------------- account / settings modal ----------------
function openAccount() {
  const c = cloud.getStatus();
  let body;
  if (!c.enabled) {
    body = `<div class="note">☁️ Cloud sync isn't set up yet — the app is running <b>locally</b> on this device.
      To turn on free sync + backup across devices, follow <b>SETUP.md</b> (add your free Supabase keys to <code>js/config.js</code>).</div>`;
  } else if (!c.user) {
    body = `
      <div class="note">Sign in to sync across devices. First time? Create an account.</div>
      <label class="fld"><span>Email</span><input id="a-email" type="email" autocomplete="email"/></label>
      <label class="fld"><span>Password</span><input id="a-pass" type="password" autocomplete="current-password"/></label>
      <div id="a-msg" class="err-msg"></div>
      <div class="modal-actions"><span></span><div>
        <button class="btn" data-act="signup">Create account</button>
        <button class="btn primary" data-act="signin">Sign in</button>
      </div></div>`;
  } else {
    body = `
      <div class="note">Signed in as <b>${esc(c.user)}</b><br>
        Status: <b>${esc(c.status)}</b>${c.detail ? " · " + esc(c.detail) : ""}</div>
      <div class="modal-actions"><span></span><div>
        <button class="btn" data-act="signout">Sign out</button>
        <button class="btn primary" data-act="sync-now">Sync now</button>
      </div></div>`;
  }

  openModal(`
    <h3>Account & data</h3>
    ${body}
    <hr class="sep"/>
    <div class="note">Backup / restore (works with or without cloud):</div>
    <div class="modal-actions"><span></span><div>
      <button class="btn" data-act="export">Export backup</button>
      <button class="btn" data-act="import">Import backup</button>
    </div></div>
    <div class="modal-actions"><span></span>
      <button class="btn danger ghost" data-act="reset">Reset all data</button>
    </div>
    <input id="import-file" type="file" accept="application/json" class="hidden"/>
  `);

  $("#import-file").onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      store.importData(await file.text());
      toast("Backup imported");
      closeModal(); render();
    } catch (err) { toast("Import failed: " + err.message); }
  };
}

// ---------------- modal plumbing ----------------
function openModal(html) {
  const back = $("#modal-back");
  $("#modal").innerHTML = html;
  back.classList.remove("hidden");
}
function closeModal() {
  // Wiping innerHTML destroys the <video> but would leave its MediaStream
  // running — the camera light stays on. Release it before the DOM goes.
  if (scanning || $("#scan-video")) {
    scanning = false;
    scanner.stopScan();
    scanner.releaseVideo($("#scan-video"));
  }
  $("#modal-back").classList.add("hidden");
  $("#modal").innerHTML = "";
}

// ---------------- toast ----------------
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

// ---------------- global event handling ----------------
function onClick(e) {
  const el = e.target.closest("[data-act]");
  if (!el) return;
  const act = el.dataset.act;
  const id = el.dataset.id;

  switch (act) {
    case "toggle": {
      const nowDone = store.toggleCompletion(id, store.todayKey());
      if (nowDone && navigator.vibrate) navigator.vibrate(10);
      break;
    }
    case "go-habits": tab = "habits"; render(); break;
    case "water-plus":  store.addWater(store.todayKey(),  1); break;
    case "water-minus": store.addWater(store.todayKey(), -1); break;

    case "log-weight": openWeightModal(); break;
    case "save-weight": {
      const date = $("#w-date").value || store.todayKey();
      const val = $("#w-val").value;
      if (!val) { $("#w-val").focus(); return; }
      store.logWeight(date, val);
      closeModal(); render(); toast("Weight logged");
      break;
    }
    case "del-weight": {
      const date = $("#w-date").value || store.todayKey();
      store.deleteWeight(date); closeModal(); render(); toast("Deleted");
      break;
    }
    case "edit-goal": openGoalModal(); break;
    case "save-goal": {
      store.updateProfile($("#modal")._collect());
      closeModal(); render(); toast("Saved");
      break;
    }

    // --- gym ---
    case "start-workout": startWorkout(el.dataset.tpl); break;
    case "resume-workout": gymSession = id; render(); break;
    case "close-session": gymSession = null; stopRest(); render(); break;
    case "set-done": {
      const w = store.getWorkout(gymSession); if (!w) break;
      const set = w.entries[+el.dataset.ei].sets[+el.dataset.si];
      set.done = !set.done;
      if (set.done) { if (navigator.vibrate) navigator.vibrate(8); startRest(120); }
      else stopRest();
      store.saveWorkout(w); // triggers re-render + paintRest
      break;
    }
    case "add-set": {
      const w = store.getWorkout(gymSession); if (!w) break;
      const sets = w.entries[+el.dataset.ei].sets;
      const last = sets[sets.length - 1] || { w: "", reps: "" };
      sets.push({ w: last.w, reps: last.reps, done: false });
      store.saveWorkout(w);
      break;
    }
    case "rest-add": startRest(restRemaining + Number(el.dataset.s || 30)); break;
    case "rest-skip": stopRest(); break;
    case "finish-workout": {
      const w = store.getWorkout(id); if (!w) break;
      const prs = [];
      for (const entry of w.entries || []) {
        const ex = program.getExercise(entry.exId);
        if (ex.unit === "bw") continue;
        const prev = store.bestE1RM(entry.exId, w.id);
        let best = 0;
        for (const s of entry.sets) if (s.done) best = Math.max(best, program.e1rm(+s.w, +s.reps));
        if (best > prev && prev > 0) prs.push(`${ex.name} ${best}`);
      }
      w.completed = true;
      store.saveWorkout(w);
      markGymHabit(w.date);
      gymSession = null; stopRest(); render();
      toast(prs.length ? `🏆 PR! ${prs[0]}${prs.length > 1 ? ` +${prs.length - 1} more` : ""}` : "Workout saved 💪");
      break;
    }
    case "discard-workout":
      if (confirm("Discard this workout? Nothing will be saved.")) {
        store.deleteWorkout(id); gymSession = null; stopRest(); render(); toast("Discarded");
      }
      break;
    case "edit-plan": openPlanModal(); break;
    case "save-plan": {
      const data = $("#modal")._collect();
      if (!data.days.length) data.days = [1, 2, 4, 5];
      store.updateTraining(data);
      closeModal(); render(); toast("Plan updated");
      break;
    }
    case "ex-detail": openExerciseDetail(el.dataset.ex); break;

    // --- more hub ---
    case "more-nav": moreSub = el.dataset.sub; render(); break;
    case "more-back": moreSub = null; render(); break;

    // --- eat ---
    case "goto-body": tab = "body"; render(); break;
    case "view-recipe": {
      const m = nutrition.mealById(el.dataset.id);
      if (!m?.recipe) break;
      openModal(`
        <h3>${esc(m.name)}</h3>
        <div class="note">⏱ ${esc(m.recipe.prep)} &nbsp;·&nbsp; ${m.kcal} kcal · ${m.p}g protein</div>
        <div class="recipe-steps">
          ${m.recipe.steps.map((s, i) => `<div class="recipe-step"><span class="step-num">${i + 1}</span><span>${esc(s)}</span></div>`).join("")}
        </div>
        <div class="bc-head" style="margin-top:14px">Ingredients</div>
        <div class="meal-ing" style="font-size:14px;line-height:1.8">${esc(m.ing.join(" · "))}</div>
        <div class="modal-actions"><span></span><button class="btn primary" data-act="close-modal">Close</button></div>
      `);
      break;
    }
    case "meal-done": store.toggleMealDone(store.todayKey(), +el.dataset.idx); break;
    case "swap-meal": {
      const today = store.todayKey();
      const mp = store.getMealPlan(today); const idx = +el.dataset.idx;
      const item = mp.plan[idx];
      store.swapPlanMeal(today, idx, nutrition.swapMeal(item.slot, item.mealId, store.getDiet()));
      break;
    }
    case "regen-plan": {
      const kept = regeneratePlan(String(Date.now()));
      toast(kept ? "Fresh plan · your own meals kept" : "Fresh plan");
      break;
    }
    case "remove-plan-item": store.removePlanItem(store.todayKey(), +el.dataset.idx); toast("Removed"); break;
    case "log-custom": openFoodPickerModal(); break;
    case "off-search": runOnlineSearch(); break;
    case "scan-open": openScanner(); break;
    case "scan-close": closeScanner(); break;
    case "scan-lookup": {
      const code = ($("#scan-code").value || "").replace(/\s+/g, "");
      if (!/^\d{6,14}$/.test(code)) { toast("Enter the digits under the barcode"); return; }
      scanMsg(`Looking up ${code}…`);
      onBarcode(code);
      break;
    }
    case "pick-item": {
      const id = el.dataset.id;
      if (pickSel?.id === id) { pickSel = null; refreshPicker(); break; }   // tap again to collapse
      const item = foods.foodById(id) || store.getCustomMeal(id) || offState.results.find(r => r.id === id);
      pickSel = { id, qty: 1, slot: item?.slot || guessSlot() };
      refreshPicker();
      break;
    }
    case "pick-qty": {
      if (!pickSel) break;
      pickSel.qty = Math.max(0.5, round2(pickSel.qty + Number(el.dataset.d)));
      refreshPicker();
      break;
    }
    case "pick-slot": {
      if (!pickSel) break;
      pickSel.slot = el.dataset.slot;
      refreshPicker();
      break;
    }
    case "pick-add": {
      const item = pickedItem();
      if (!item) break;
      const { qty, slot } = pickSel;
      // An online result lives only in memory — save it as one of your own
      // meals so the logged entry still resolves offline later.
      const toAdd = item.online
        ? store.saveCustomMeal({
            name: fullName(item),
            slot, serving: item.serving,
            kcal: item.kcal, p: item.p, c: item.c, f: item.f,
          })
        : item;
      addCustomToPlan(toAdd, qty, slot);
      closeModal(); render();
      toast(`Added ${qty !== 1 ? `${qty}× ` : ""}${toAdd.name}`);
      break;
    }
    case "pick-adjust": {
      const item = pickedItem();
      if (item) adjustFood(item);
      break;
    }
    case "del-custom-meal": {
      const m = store.getCustomMeal(el.dataset.id);
      if (!m || !confirm(`Delete "${m.name}" from your saved meals?`)) break;
      store.deleteCustomMeal(m.id);
      if (pickSel?.id === m.id) pickSel = null;
      refreshPicker();
      toast("Deleted");
      break;
    }
    case "save-custom-meal": {
      const d = $("#modal")._collect();
      if (!d.name.trim()) { toast("Give the meal a name"); return; }
      if (!(Number(d.kcal) > 0)) { toast("Enter the calories"); return; }
      const saved = store.saveCustomMeal(d);
      addCustomToPlan(saved);
      closeModal(); render(); toast(`Saved & added ${saved.name}`);
      break;
    }
    case "grocery-toggle":
      groceryMode = groceryMode ? null : "today";
      render(); break;
    case "grocery-mode":
      groceryMode = el.dataset.mode;
      render(); break;
    case "grocery-check":
      store.toggleGroceryItem(el.dataset.scope, el.dataset.key);
      break;
    case "grocery-clear":
      store.clearGroceryChecked(el.dataset.scope);
      break;
    case "edit-diet": openDietModal(); break;
    case "save-diet": {
      store.updateDiet($("#modal")._collect());
      regeneratePlan("");
      closeModal(); render(); toast("Diet updated");
      break;
    }

    // --- skin ---
    case "skin-checkin": openSkinCheckInModal(); break;
    case "save-skin-log": {
      const data = $("#modal")._collect();
      if (!data.condition) { toast("Pick a condition rating"); return; }
      store.logSkinDay(store.todayKey(), data);
      closeModal(); render(); toast("Logged ✓");
      break;
    }
    case "skin-step": {
      const today = store.todayKey();
      store.toggleSkinStep(today, el.dataset.period, el.dataset.step);
      markSkinHabit(today, el.dataset.period);
      break;
    }
    case "edit-skin-routine": openSkinRoutineModal(el.dataset.period); break;
    case "save-skin-routine": {
      const period = el.dataset.period;
      const skin = store.getSkin();
      const steps = (period === "am" ? [...skin.amSteps] : [...skin.pmSteps]).map((s, i) => ({ ...s }));
      $("#modal").querySelectorAll(".sk-prod-input").forEach(inp => {
        steps[+inp.dataset.si].product = inp.value.trim();
      });
      store.updateSkin(period === "am" ? { amSteps: steps } : { pmSteps: steps });
      closeModal(); render(); toast("Saved");
      break;
    }

    // --- sleep ---
    case "edit-sleep": openSleepModal(); break;
    case "save-sleep": {
      const cur = $("#s-cur").value, bed = $("#s-bed").value, wake = $("#s-wake").value;
      store.updateSleep({ currentBed: cur, targetBed: bed, targetWake: wake, planStart: cur ? store.todayKey() : null });
      closeModal(); render(); toast("Schedule saved");
      break;
    }
    case "log-sleep": openSleepLogModal(); break;
    case "save-sleep-log": {
      store.logSleep(store.todayKey(), $("#modal")._collect());
      closeModal(); render(); toast("Sleep logged");
      break;
    }

    // --- supplements ---
    case "add-supp": {
      const sup = SUPPLEMENTS.find(s => s.id === el.dataset.id); if (!sup) break;
      store.addHabit({ name: `${sup.name} (${sup.dose})`, category: "supplement", timeOfDay: sup.timeOfDay, days: "daily" });
      render(); toast(`Added ${sup.name}`);
      break;
    }

    case "add": openEditor(null); break;
    case "edit": openEditor(id); break;
    case "day": showDayDetail(el.dataset.key); break;

    case "save-habit": {
      const data = $("#modal")._collect();
      if (!data) return;
      if (id) store.updateHabit(id, data);
      else store.addHabit(data);
      closeModal(); render(); toast("Saved");
      break;
    }
    case "delete-habit":
      if (confirm("Delete this habit? Past history stays intact.")) {
        store.deleteHabit(id); closeModal(); render(); toast("Deleted");
      }
      break;

    case "open-account": openAccount(); break;
    case "close-modal": closeModal(); break;

    case "signin": case "signup": {
      const email = $("#a-email").value.trim();
      const pass = $("#a-pass").value;
      const msg = $("#a-msg");
      if (!email || !pass) { msg.textContent = "Enter email and password."; return; }
      msg.textContent = "Working…";
      (act === "signin" ? cloud.signIn(email, pass) : cloud.signUp(email, pass))
        .then(() => { closeModal(); toast("Signed in"); render(); })
        .catch(err => { msg.textContent = err.message || "Failed"; });
      break;
    }
    case "signout": cloud.signOut().then(() => { closeModal(); render(); }); break;
    case "sync-now": cloud.syncNow().then(() => { toast("Synced"); render(); }); break;

    case "export": {
      const blob = new Blob([store.exportData()], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `looksmax-backup-${store.todayKey()}.json`;
      a.click(); URL.revokeObjectURL(a.href);
      toast("Backup downloaded");
      break;
    }
    case "import": $("#import-file").click(); break;
    case "reset":
      if (confirm("Erase ALL local data and reload defaults? This can't be undone.")) {
        store.resetAll(); closeModal(); render(); toast("Reset");
      }
      break;
  }
}

// persist weight/reps/notes typing without a re-render (keeps focus + taps intact)
function onFieldChange(e) {
  if (!gymSession) return;
  const el = e.target;
  const w = store.getWorkout(gymSession);
  if (!w) return;
  if (el.hasAttribute("data-w") || el.hasAttribute("data-r")) {
    const set = w.entries[+el.dataset.ei]?.sets[+el.dataset.si];
    if (!set) return;
    const val = el.value === "" ? "" : Number(el.value);
    if (el.hasAttribute("data-w")) set.w = val; else set.reps = val;
    store.saveWorkoutQuiet(w);
  } else if (el.hasAttribute("data-notes")) {
    w.notes = el.value;
    store.saveWorkoutQuiet(w);
  }
}

// ---------------- boot ----------------
function boot() {
  document.getElementById("app").addEventListener("click", onClick);
  document.getElementById("app").addEventListener("change", onFieldChange);
  $("#modal-back").addEventListener("click", (e) => {
    if (e.target.id === "modal-back") closeModal();
  });
  document.querySelectorAll(".nav-btn").forEach(b =>
    b.addEventListener("click", () => { tab = b.dataset.tab; moreSub = null; render(); }));
  $("#sync-chip").addEventListener("click", openAccount);

  store.onChange(() => render());
  cloud.onStatus(syncNavAndHeader);

  render();
  cloud.initCloud();

  // register service worker for offline/installability
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

boot();
