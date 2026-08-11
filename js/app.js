// ============================================================
//  Looksmax — app UI (vanilla JS, no framework)
// ============================================================
import * as store from "./store.js";
import { CATEGORY_ICONS, CATEGORY_LABELS, TIME_LABELS } from "./defaults.js";
import * as cloud from "./supabase-sync.js";

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"']/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

let tab = "today";
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ---------------- shell ----------------
function render() {
  if (tab === "today") renderToday();
  else if (tab === "body") renderBody();
  else if (tab === "history") renderHistory();
  else if (tab === "habits") renderHabits();
  syncNavAndHeader();
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
  `;
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
    <h2 class="screen-title">History</h2>
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
    <div class="habits-head">
      <h2 class="screen-title">Habits</h2>
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

// ---------------- boot ----------------
function boot() {
  document.getElementById("app").addEventListener("click", onClick);
  $("#modal-back").addEventListener("click", (e) => {
    if (e.target.id === "modal-back") closeModal();
  });
  document.querySelectorAll(".nav-btn").forEach(b =>
    b.addEventListener("click", () => { tab = b.dataset.tab; render(); }));
  $("#sync-chip").addEventListener("click", openAccount);

  store.onChange(() => { if (tab !== "history") render(); else syncNavAndHeader(); });
  cloud.onStatus(syncNavAndHeader);

  render();
  cloud.initCloud();

  // register service worker for offline/installability
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

boot();
