// ============================================================
//  Program engine — the "coach". Static training templates +
//  pure progressive-overload logic. No app state here.
// ============================================================

// --- exercise library (full-gym hypertrophy) ---
// sets/repLow/repHigh define the double-progression target range.
// inc = weight added (lb) once you hit the top of the range on all sets.
// unit "bw" = bodyweight (progress by reps, no barbell weight).
export const EXERCISES = {
  benchPress:        { name: "Barbell Bench Press",     muscle: "Chest",      sets: 3, repLow: 6,  repHigh: 10, inc: 5 },
  barbellRow:        { name: "Barbell Row",             muscle: "Back",       sets: 3, repLow: 8,  repHigh: 12, inc: 5 },
  dbShoulderPress:   { name: "Seated DB Shoulder Press", muscle: "Shoulders", sets: 3, repLow: 8,  repHigh: 12, inc: 5 },
  latPulldown:       { name: "Lat Pulldown",            muscle: "Back",       sets: 3, repLow: 10, repHigh: 15, inc: 5 },
  lateralRaise:      { name: "DB Lateral Raise",        muscle: "Shoulders",  sets: 3, repLow: 12, repHigh: 20, inc: 5 },
  tricepPushdown:    { name: "Triceps Pushdown",        muscle: "Triceps",    sets: 3, repLow: 10, repHigh: 15, inc: 5 },
  dbCurl:            { name: "DB Biceps Curl",          muscle: "Biceps",     sets: 3, repLow: 10, repHigh: 15, inc: 5 },

  backSquat:         { name: "Barbell Back Squat",      muscle: "Quads",      sets: 3, repLow: 6,  repHigh: 10, inc: 10 },
  rdl:               { name: "Romanian Deadlift",       muscle: "Hamstrings", sets: 3, repLow: 8,  repHigh: 12, inc: 10 },
  legPress:          { name: "Leg Press",               muscle: "Quads",      sets: 3, repLow: 10, repHigh: 15, inc: 10 },
  seatedLegCurl:     { name: "Seated Leg Curl",         muscle: "Hamstrings", sets: 3, repLow: 10, repHigh: 15, inc: 5 },
  calfRaise:         { name: "Standing Calf Raise",     muscle: "Calves",     sets: 4, repLow: 10, repHigh: 15, inc: 5 },
  hangingLegRaise:   { name: "Hanging Leg Raise",       muscle: "Abs",        sets: 3, repLow: 10, repHigh: 15, inc: 0, unit: "bw" },

  inclineDbPress:    { name: "Incline DB Press",        muscle: "Chest",      sets: 3, repLow: 8,  repHigh: 12, inc: 5 },
  pullUp:            { name: "Pull-Up",                 muscle: "Back",       sets: 3, repLow: 6,  repHigh: 12, inc: 0, unit: "bw" },
  overheadPress:     { name: "Overhead Press",          muscle: "Shoulders",  sets: 3, repLow: 6,  repHigh: 10, inc: 5 },
  cableRow:          { name: "Seated Cable Row",        muscle: "Back",       sets: 3, repLow: 10, repHigh: 15, inc: 5 },
  cableFly:          { name: "Cable Fly",               muscle: "Chest",      sets: 3, repLow: 12, repHigh: 15, inc: 5 },
  inclineDbCurl:     { name: "Incline DB Curl",         muscle: "Biceps",     sets: 3, repLow: 10, repHigh: 15, inc: 5 },
  overheadTricepExt: { name: "Overhead Triceps Ext",    muscle: "Triceps",    sets: 3, repLow: 10, repHigh: 15, inc: 5 },

  deadlift:          { name: "Deadlift",                muscle: "Back",       sets: 3, repLow: 5,  repHigh: 8,  inc: 10 },
  bulgarianSplit:    { name: "Bulgarian Split Squat",   muscle: "Quads",      sets: 3, repLow: 8,  repHigh: 12, inc: 5 },
  legExtension:      { name: "Leg Extension",           muscle: "Quads",      sets: 3, repLow: 12, repHigh: 15, inc: 5 },
  lyingLegCurl:      { name: "Lying Leg Curl",          muscle: "Hamstrings", sets: 3, repLow: 10, repHigh: 15, inc: 5 },
  seatedCalfRaise:   { name: "Seated Calf Raise",       muscle: "Calves",     sets: 4, repLow: 12, repHigh: 20, inc: 5 },
  cableCrunch:       { name: "Cable Crunch",            muscle: "Abs",        sets: 3, repLow: 12, repHigh: 15, inc: 5 },
};

// --- day templates ---
export const TEMPLATES = {
  upperA: { name: "Upper A", exercises: ["benchPress", "barbellRow", "dbShoulderPress", "latPulldown", "lateralRaise", "tricepPushdown", "dbCurl"] },
  lowerA: { name: "Lower A", exercises: ["backSquat", "rdl", "legPress", "seatedLegCurl", "calfRaise", "hangingLegRaise"] },
  upperB: { name: "Upper B", exercises: ["inclineDbPress", "pullUp", "overheadPress", "cableRow", "cableFly", "lateralRaise", "inclineDbCurl", "overheadTricepExt"] },
  lowerB: { name: "Lower B", exercises: ["deadlift", "bulgarianSplit", "legExtension", "lyingLegCurl", "seatedCalfRaise", "cableCrunch"] },
};

// --- splits: ordered template sequence mapped onto the chosen training weekdays ---
export const SPLITS = {
  ul4:  { name: "Upper / Lower (4-day)", order: ["upperA", "lowerA", "upperB", "lowerB"] },
  ppl3: { name: "Push / Pull / Legs (3-day)", order: ["upperA", "lowerA", "upperB"] }, // fallback simplification
};

export function getExercise(id) { return EXERCISES[id] || { name: id, sets: 3, repLow: 8, repHigh: 12, inc: 5 }; }

// which template is scheduled for `weekday` (0=Sun..6=Sat) given training config
// returns { templateId, index } or null on a rest day
export function templateForWeekday(training, weekday) {
  const days = [...(training.days || [])].sort((a, b) => a - b);
  const order = SPLITS[training.splitId]?.order || SPLITS.ul4.order;
  const idx = days.indexOf(weekday);
  if (idx === -1) return null;
  return { templateId: order[idx % order.length], index: idx };
}

// est. 1-rep-max (Epley)
export function e1rm(weight, reps) {
  if (!weight || !reps) return 0;
  return Math.round(weight * (1 + reps / 30));
}

// Given an exercise def and the last performed entry {sets:[{w,reps}]},
// return the prescription for the next session.
export function prescribe(ex, lastEntry) {
  const range = [ex.repLow, ex.repHigh];
  const isBw = ex.unit === "bw";
  const performed = (lastEntry?.sets || []).filter(s => Number(s.reps) > 0);

  if (!performed.length) {
    return {
      weight: isBw ? null : null,
      targetReps: ex.repLow,
      sets: ex.sets, range, isBw,
      firstTime: true,
      note: isBw ? `Aim for ${ex.repLow}+ reps` : `Pick a weight you can do for ~${ex.repLow} reps`,
      lastSummary: null,
    };
  }

  const maxW = Math.max(...performed.map(s => Number(s.w) || 0));
  const workSets = performed.filter(s => (Number(s.w) || 0) >= maxW);
  const minRepsAtWork = Math.min(...workSets.map(s => Number(s.reps)));
  const maxReps = Math.max(...performed.map(s => Number(s.reps)));
  const hitTop = workSets.length >= ex.sets && minRepsAtWork >= ex.repHigh;

  const lastSummary = isBw
    ? `${performed.length}×${maxReps}`
    : `${workSets.length}×${minRepsAtWork} @ ${maxW} lb`;

  if (isBw) {
    // progress by reps; suggest adding weight once past the top
    const targetReps = Math.min(ex.repHigh, maxReps + 1);
    return { weight: null, targetReps, sets: ex.sets, range, isBw, progressed: maxReps < ex.repHigh, lastSummary,
             note: maxReps >= ex.repHigh ? "Add weight (belt/vest) if you can" : "Beat last time by a rep" };
  }

  if (hitTop) {
    return { weight: maxW + ex.inc, targetReps: ex.repLow, sets: ex.sets, range, isBw,
             progressed: true, lastSummary, note: `⬆ +${ex.inc} lb — you earned it` };
  }
  return { weight: maxW, targetReps: Math.min(ex.repHigh, minRepsAtWork + 1), sets: ex.sets, range, isBw,
           progressed: false, lastSummary, note: "Same weight — add a rep per set" };
}
