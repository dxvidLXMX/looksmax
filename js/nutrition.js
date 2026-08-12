// ============================================================
//  Nutrition — meal library + plan generator (pure, no state).
//  Macros are per 1 serving. p/c/f = grams protein/carbs/fat.
//  flags: dietary nature (meat|fish|dairy|egg|plant)
//  contains: allergens to filter on (dairy|nuts|gluten)
// ============================================================

export const MEALS = {
  breakfast: [
    { id: "greekYogurtBowl", name: "Greek yogurt + berries + granola", kcal: 380, p: 28, c: 45, f: 9, quick: true, flags: ["dairy"], contains: ["dairy", "nuts", "gluten"], ing: ["Greek yogurt 200g", "mixed berries", "granola 40g", "honey"] },
    { id: "eggsToastAvocado", name: "3 eggs + toast + avocado", kcal: 450, p: 24, c: 30, f: 26, quick: true, flags: ["egg"], contains: ["gluten"], ing: ["3 eggs", "2 slices bread", "½ avocado"] },
    { id: "proteinOats", name: "Protein oats + banana + PB", kcal: 480, p: 35, c: 55, f: 13, quick: true, flags: ["dairy"], contains: ["dairy", "nuts", "gluten"], ing: ["oats 60g", "1 scoop whey", "milk 250ml", "banana", "peanut butter 1 tbsp"] },
    { id: "cottageCheeseFruit", name: "Cottage cheese + fruit + nuts", kcal: 340, p: 30, c: 25, f: 13, quick: true, flags: ["dairy"], contains: ["dairy", "nuts"], ing: ["cottage cheese 250g", "berries", "almonds 20g"] },
    { id: "eggCheeseWrap", name: "Egg & cheese breakfast wrap", kcal: 420, p: 26, c: 34, f: 20, quick: true, flags: ["egg", "dairy"], contains: ["dairy", "gluten"], ing: ["2 eggs", "cheese 30g", "tortilla wrap", "spinach"] },
  ],
  lunch: [
    { id: "chickenRiceBowl", name: "Chicken + rice + veg bowl", kcal: 550, p: 45, c: 60, f: 12, quick: true, flags: ["meat"], contains: [], ing: ["chicken breast 180g", "rice 200g", "mixed veg", "olive oil 1 tsp"] },
    { id: "turkeySandwich", name: "Turkey & salad sandwich", kcal: 480, p: 35, c: 48, f: 15, quick: true, flags: ["meat"], contains: ["gluten"], ing: ["turkey 150g", "wholegrain bread", "salad", "light mayo"] },
    { id: "tunaPasta", name: "Tuna pasta", kcal: 560, p: 40, c: 70, f: 12, quick: true, flags: ["fish"], contains: ["gluten"], ing: ["tuna 2 tins", "pasta 90g dry", "sweetcorn", "light mayo"] },
    { id: "burritoBowl", name: "Beef & bean burrito bowl", kcal: 620, p: 42, c: 62, f: 20, quick: true, flags: ["meat"], contains: [], ing: ["lean beef mince 150g", "black beans", "rice 150g", "salsa"] },
    { id: "chickenWrapYogurt", name: "Chicken wrap + yogurt", kcal: 500, p: 40, c: 45, f: 16, quick: true, flags: ["meat", "dairy"], contains: ["dairy", "gluten"], ing: ["chicken 150g", "tortilla wrap", "salad", "Greek yogurt pot"] },
  ],
  dinner: [
    { id: "salmonPotatoes", name: "Salmon + potatoes + greens", kcal: 600, p: 42, c: 45, f: 26, quick: true, flags: ["fish"], contains: [], ing: ["salmon fillet 180g", "potatoes 300g", "broccoli", "olive oil"] },
    { id: "steakRiceBroccoli", name: "Steak + rice + broccoli", kcal: 640, p: 48, c: 55, f: 22, quick: true, flags: ["meat"], contains: [], ing: ["sirloin 200g", "rice 180g", "broccoli"] },
    { id: "chickenStirFry", name: "Chicken stir-fry + noodles", kcal: 580, p: 44, c: 62, f: 16, quick: true, flags: ["meat"], contains: ["gluten"], ing: ["chicken 180g", "egg noodles", "stir-fry veg", "soy sauce"] },
    { id: "beefMincePasta", name: "Lean beef bolognese + pasta", kcal: 620, p: 45, c: 68, f: 18, quick: true, flags: ["meat"], contains: ["gluten"], ing: ["lean beef mince 150g", "pasta 90g dry", "tomato sauce", "parmesan"] },
    { id: "chickenCouscous", name: "Chicken + couscous + salad", kcal: 540, p: 46, c: 52, f: 14, quick: true, flags: ["meat"], contains: ["gluten"], ing: ["chicken 180g", "couscous 80g dry", "mixed salad", "feta"] },
  ],
  snack: [
    { id: "proteinShake", name: "Protein shake", kcal: 170, p: 30, c: 6, f: 3, quick: true, flags: ["dairy"], contains: ["dairy"], ing: ["1–2 scoops whey", "water or milk"] },
    { id: "applePB", name: "Apple + peanut butter", kcal: 250, p: 8, c: 30, f: 13, quick: true, flags: ["plant"], contains: ["nuts"], ing: ["apple", "peanut butter 2 tbsp"] },
    { id: "jerkyFruit", name: "Beef jerky + fruit", kcal: 220, p: 22, c: 24, f: 4, quick: true, flags: ["meat"], contains: [], ing: ["beef jerky 40g", "banana"] },
    { id: "boiledEggs", name: "3 boiled eggs", kcal: 210, p: 18, c: 1, f: 15, quick: true, flags: ["egg"], contains: [], ing: ["3 eggs"] },
    { id: "cottageToast", name: "Cottage cheese on toast", kcal: 260, p: 22, c: 28, f: 6, quick: true, flags: ["dairy"], contains: ["dairy", "gluten"], ing: ["cottage cheese 150g", "2 slices toast"] },
    { id: "nutsBanana", name: "Nuts + banana", kcal: 300, p: 8, c: 30, f: 18, quick: true, flags: ["plant"], contains: ["nuts"], ing: ["mixed nuts 35g", "banana"] },
  ],
};

// filter a slot's items by diet type + allergens to avoid
function candidates(slot, diet) {
  const type = diet?.type || "omnivore";
  const avoid = diet?.avoid || [];
  return MEALS[slot].filter(m => {
    if (type === "vegan" && m.flags.some(f => ["meat", "fish", "dairy", "egg"].includes(f))) return false;
    if (type === "vegetarian" && m.flags.some(f => ["meat", "fish"].includes(f))) return false;
    if (type === "pescatarian" && m.flags.includes("meat")) return false;
    if (m.contains.some(c => avoid.includes(c))) return false;
    return true;
  });
}

// small deterministic PRNG so a given (date+salt) yields a stable pick
function seeded(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function pick(list, rnd, exclude) {
  const pool = exclude ? list.filter(m => m.id !== exclude) : list;
  const use = pool.length ? pool : list;
  return use[Math.floor(rnd() * use.length)] || list[0];
}

export function slotsForPattern(mealsPerDay) {
  if (mealsPerDay === "2") return ["lunch", "dinner", "snack"];
  if (mealsPerDay === "3+snacks") return ["breakfast", "lunch", "dinner", "snack", "snack"];
  return ["breakfast", "lunch", "dinner"];
}

const round05 = (n) => Math.max(0.5, Math.round(n * 2) / 2);

// build a plan: [{slot, mealId, servings}] scaled toward calorie & protein targets
export function generatePlan(diet, targets, dateKey, salt = "") {
  const calorieTarget = targets?.calories || 2200;
  const proteinTarget = targets?.protein || 150;
  const slots = slotsForPattern(diet?.mealsPerDay || "3");
  const rnd = seeded(dateKey + "|" + salt + "|" + slots.join(""));

  // pick an item per slot (avoid repeating the same item twice in one day)
  const used = new Set();
  const chosen = slots.map(slot => {
    let m = pick(candidates(slot, diet), rnd, null);
    let guard = 0;
    while (used.has(m.id) && guard++ < 6) m = pick(candidates(slot, diet), rnd, m.id);
    used.add(m.id);
    return { slot, meal: m };
  });

  // scale all servings uniformly to hit calorie target
  const baseKcal = chosen.reduce((a, x) => a + x.meal.kcal, 0);
  let factor = calorieTarget / Math.max(1, baseKcal);
  const plan = chosen.map(x => ({ slot: x.slot, mealId: x.meal.id, servings: round05(factor <= 0 ? 1 : Math.min(2.5, Math.max(0.5, factor))) }));

  // if protein short, bump the highest-protein-per-cal item(s)
  let tot = planTotals(plan);
  let guard = 0;
  while (tot.p < proteinTarget - 5 && guard++ < 8) {
    const ranked = plan
      .map((p, i) => ({ i, m: mealById(p.mealId) }))
      .filter(x => x.m && x.m.p > 0)
      .sort((a, b) => (b.m.p / b.m.kcal) - (a.m.p / a.m.kcal));
    const top = ranked[0];
    if (!top || plan[top.i].servings >= 3) break;
    plan[top.i].servings = round05(plan[top.i].servings + 0.5);
    tot = planTotals(plan);
  }
  return plan;
}

export function mealById(id) {
  for (const slot of Object.keys(MEALS)) { const m = MEALS[slot].find(x => x.id === id); if (m) return m; }
  return null;
}

export function planTotals(plan) {
  return (plan || []).reduce((a, p) => {
    const m = mealById(p.mealId); if (!m) return a;
    const s = p.servings || 1;
    a.kcal += m.kcal * s; a.p += m.p * s; a.c += m.c * s; a.f += m.f * s;
    return a;
  }, { kcal: 0, p: 0, c: 0, f: 0 });
}

// swap one slot to a different item (returns new mealId)
export function swapMeal(slot, currentId, diet) {
  const list = candidates(slot, diet);
  const idx = list.findIndex(m => m.id === currentId);
  const next = list[(idx + 1) % list.length] || list[0];
  return next?.id || currentId;
}

export const SLOT_LABEL = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack" };

// ──────────── Grocery list ────────────

const GROCERY_CATS = [
  { cat: "Grains",   icon: "🌾", words: ["oat", "bread", "tortilla", "pasta", "rice", "noodle", "couscous", "granola", "toast", "wrap"] },
  { cat: "Produce",  icon: "🥬", words: ["berr", "banana", "apple", "broccoli", "veg", "salad", "spinach", "avocado", "potato", "fruit", "sweetcorn", "bean"] },
  { cat: "Dairy",    icon: "🥛", words: ["yogurt", "milk", "cheese", "parmesan", "feta"] },
  { cat: "Protein",  icon: "🥩", words: ["chicken", "beef", "salmon", "tuna", "turkey", "mince", "steak", "sirloin", "jerky", "whey", "egg", "cottage"] },
  { cat: "Pantry",   icon: "🫙", words: ["oil", "sauce", "honey", "peanut", "mayo", "salsa", "nut", "almond"] },
];
const CAT_ORDER = ["Protein", "Produce", "Dairy", "Grains", "Pantry", "Other"];

function ingCat(text) {
  const lo = text.toLowerCase();
  for (const c of GROCERY_CATS) if (c.words.some(w => lo.includes(w))) return c;
  return { cat: "Other", icon: "🛒" };
}

// stable dedup key: strip leading numbers + common quantity units
export function ingKey(text) {
  return text.toLowerCase()
    .replace(/\b\d+\s*(g|ml|kg|oz|lb|tbsp|tsp|tins?|cans?|scoops?|slices?|pot)\b/gi, "")
    .replace(/^\d+[\s\-–]*/u, "")
    .replace(/[×x]\d+(\.\d+)?/g, "")
    .replace(/\b(cooked|dry|raw|light|mixed|lean)\b/g, "")
    .replace(/\s+/g, " ").trim();
}

function keyDateAdd(key, n) {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d + n);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function planToIngMap(plan) {
  const map = {};
  for (const p of plan) {
    const m = mealById(p.mealId); if (!m) continue;
    for (const ing of m.ing) {
      const k = ingKey(ing);
      const { cat, icon } = ingCat(ing);
      const gk = `${cat}::${k}`;
      if (!map[gk]) map[gk] = { text: ing, cat, icon, days: 0, key: k };
      map[gk].days++;
    }
  }
  return map;
}

function groupedFromMap(map) {
  const cats = {};
  for (const v of Object.values(map)) {
    if (!cats[v.cat]) cats[v.cat] = { cat: v.cat, icon: v.icon, items: [] };
    cats[v.cat].items.push(v);
  }
  return CAT_ORDER.filter(c => cats[c]).map(c => cats[c]);
}

// groups for a single day's plan
export function groceryGroups(plan) {
  return groupedFromMap(planToIngMap(plan));
}

// aggregated groups across 7 days from startKey
export function weeklyGroceryGroups(diet, targets, startKey) {
  const merged = {};
  for (let d = 0; d < 7; d++) {
    const dayMap = planToIngMap(generatePlan(diet, targets, keyDateAdd(startKey, d)));
    for (const [k, v] of Object.entries(dayMap)) {
      if (!merged[k]) merged[k] = { ...v, days: 0 };
      merged[k].days += v.days;
    }
  }
  return groupedFromMap(merged);
}
