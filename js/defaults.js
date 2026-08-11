// ============================================================
//  Default "looksmaxing" habits — preloaded on first run.
//  All of these are fully editable/deletable in the app.
// ============================================================

// category -> emoji icon
export const CATEGORY_ICONS = {
  skincare:   "✨", // ✨
  supplement: "\u{1F48A}", // 💊
  gym:        "\u{1F3CB}️", // 🏋️
  water:      "\u{1F4A7}", // 💧
  sleep:      "\u{1F634}", // 😴
  grooming:   "\u{1F9F4}", // 🧴
  diet:       "\u{1F957}", // 🥗
  custom:     "⭐", // ⭐
};

export const CATEGORY_LABELS = {
  skincare:   "Skincare",
  supplement: "Supplement",
  gym:        "Gym / Training",
  water:      "Water",
  sleep:      "Sleep",
  grooming:   "Grooming",
  diet:       "Diet",
  custom:     "Custom",
};

export const TIME_LABELS = {
  morning: "Morning",
  evening: "Evening",
  anytime: "Anytime",
};

// days: "daily" or array of weekday numbers (0=Sun ... 6=Sat)
export function defaultHabits(now = Date.now()) {
  const mk = (i, name, category, timeOfDay, days) => ({
    id: cryptoId(),
    name,
    category,
    icon: CATEGORY_ICONS[category] || CATEGORY_ICONS.custom,
    timeOfDay,
    days,
    order: i,
    active: true,
    createdAt: now,
    updatedAt: now,
    deleted: false,
  });

  return [
    // --- Morning ---
    mk(0,  "Cleanse face",            "skincare",   "morning", "daily"),
    mk(1,  "Moisturizer",            "skincare",   "morning", "daily"),
    mk(2,  "Sunscreen SPF 50",       "skincare",   "morning", "daily"),
    mk(3,  "Vitamin D",              "supplement", "morning", "daily"),
    mk(4,  "Creatine 5g",            "supplement", "morning", "daily"),
    // --- Evening ---
    mk(5,  "Cleanse face (PM)",      "skincare",   "evening", "daily"),
    mk(6,  "Treatment (retinoid/BP)","skincare",   "evening", "daily"),
    mk(7,  "Moisturizer (PM)",       "skincare",   "evening", "daily"),
    mk(8,  "Brush + floss",          "grooming",   "evening", "daily"),
    mk(9,  "In bed by 11pm",         "sleep",      "evening", "daily"),
    // --- Anytime / scheduled ---
    mk(10, "Gym",                    "gym",        "anytime", [1, 2, 4, 5]), // Mon,Tue,Thu,Fri
    mk(11, "3L water",               "water",      "anytime", "daily"),
    mk(12, "Hit protein target",     "diet",       "anytime", "daily"),
    mk(13, "10k steps",              "gym",        "anytime", "daily"),
  ];
}

export function cryptoId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  // fallback
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}
