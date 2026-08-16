// ============================================================
//  Nutrition — meal library + plan generator (pure, no state).
//  Macros are per 1 serving. p/c/f = grams protein/carbs/fat.
//  flags: dietary nature (meat|fish|dairy|egg|plant)
//  contains: allergens to filter on (dairy|nuts|gluten)
// ============================================================

import { FOOD_BY_ID } from "./foods.js";

const r = (prep, ...steps) => ({ prep, steps });

export const MEALS = {
  breakfast: [
    { id: "greekYogurtBowl", name: "Greek yogurt + berries + granola", kcal: 380, p: 28, c: 45, f: 9, flags: ["dairy"], contains: ["dairy", "nuts", "gluten"],
      ing: ["Greek yogurt 200g", "mixed berries", "granola 40g", "honey"],
      recipe: r("3 min", "Spoon yogurt into a bowl.", "Top with berries and granola.", "Drizzle honey.") },
    { id: "eggsToastAvocado", name: "3 eggs + toast + avocado", kcal: 450, p: 24, c: 30, f: 26, flags: ["egg"], contains: ["gluten"],
      ing: ["3 eggs", "2 slices bread", "½ avocado"],
      recipe: r("8 min", "Toast bread. Fry or scramble 3 eggs in a non-stick pan.", "Mash avocado with a pinch of salt.", "Layer onto toast. Season with chilli flakes.") },
    { id: "proteinOats", name: "Protein oats + banana + PB", kcal: 480, p: 35, c: 55, f: 13, flags: ["dairy"], contains: ["dairy", "nuts", "gluten"],
      ing: ["oats 60g", "1 scoop whey", "milk 250ml", "banana", "peanut butter 1 tbsp"],
      recipe: r("5 min", "Cook oats in milk (microwave 2–3 min or stovetop).", "Stir in whey once off heat.", "Top with sliced banana and peanut butter.") },
    { id: "cottageCheeseFruit", name: "Cottage cheese + fruit + nuts", kcal: 340, p: 30, c: 25, f: 13, flags: ["dairy"], contains: ["dairy", "nuts"],
      ing: ["cottage cheese 250g", "berries", "almonds 20g"],
      recipe: r("2 min", "Spoon cottage cheese into a bowl.", "Top with berries and almonds.") },
    { id: "eggCheeseWrap", name: "Egg & cheese breakfast wrap", kcal: 420, p: 26, c: 34, f: 20, flags: ["egg", "dairy"], contains: ["dairy", "gluten"],
      ing: ["2 eggs", "cheese 30g", "tortilla wrap", "spinach"],
      recipe: r("7 min", "Scramble 2 eggs in a pan with spinach until just set.", "Warm the wrap 30 sec in a dry pan.", "Fill with eggs, top with grated cheese, roll up.") },
    { id: "smokedSalmonBagel", name: "Smoked salmon + cream cheese bagel", kcal: 430, p: 32, c: 38, f: 16, flags: ["fish", "dairy"], contains: ["dairy", "gluten"],
      ing: ["smoked salmon 100g", "cream cheese 40g", "bagel", "capers", "red onion"],
      recipe: r("5 min", "Slice and toast bagel.", "Spread cream cheese generously.", "Layer smoked salmon, add capers and thin red onion rings.") },
    { id: "overnightOatsProtein", name: "Overnight protein oats", kcal: 450, p: 36, c: 52, f: 10, flags: ["dairy"], contains: ["dairy", "gluten"],
      ing: ["oats 60g", "milk 200ml", "Greek yogurt 100g", "1 scoop whey", "berries"],
      recipe: r("5 min (night before)", "Mix oats, milk, yogurt and whey in a jar.", "Seal and refrigerate overnight.", "In the morning, top with berries and eat cold.") },
    { id: "proteinSmoothie", name: "Banana protein smoothie", kcal: 400, p: 34, c: 50, f: 8, flags: ["dairy"], contains: ["dairy"],
      ing: ["banana", "1–2 scoops whey", "milk 300ml", "oats 30g", "peanut butter 1 tbsp"],
      recipe: r("3 min", "Add all ingredients to a blender.", "Blend 30–45 seconds until smooth.", "Drink immediately.") },
    { id: "eggWhiteScramble", name: "Egg white scramble + veg", kcal: 280, p: 30, c: 12, f: 8, flags: ["egg"], contains: [],
      ing: ["6 egg whites", "spinach", "mushrooms", "bell pepper", "olive oil 1 tsp"],
      recipe: r("10 min", "Sauté mushrooms and pepper in olive oil 3 min.", "Add spinach until wilted.", "Pour in egg whites, stir gently until just set.") },
    { id: "proteinPancakes", name: "Protein pancakes", kcal: 430, p: 38, c: 46, f: 10, flags: ["egg", "dairy"], contains: ["dairy", "gluten"],
      ing: ["oats 50g", "2 eggs", "cottage cheese 150g", "1 scoop whey", "blueberries"],
      recipe: r("12 min", "Blend oats, eggs, cottage cheese and whey until smooth.", "Cook small pancakes in a non-stick pan 2–3 min per side.", "Top with blueberries and a drizzle of honey.") },
    { id: "fullBreakfast", name: "Eggs + turkey bacon + tomatoes", kcal: 490, p: 40, c: 18, f: 28, flags: ["meat", "egg"], contains: [],
      ing: ["3 eggs", "turkey bacon 4 rashers", "cherry tomatoes", "spinach"],
      recipe: r("12 min", "Grill turkey bacon 4 min each side.", "Fry eggs to your liking.", "Wilt spinach in the bacon pan. Halve and fry tomatoes 2 min.") },
    { id: "tunaScramble", name: "Tuna + scrambled eggs on toast", kcal: 440, p: 42, c: 28, f: 16, flags: ["fish", "egg"], contains: ["gluten"],
      ing: ["tuna 1 tin", "3 eggs", "2 slices toast", "chives"],
      recipe: r("8 min", "Scramble eggs over low heat, stirring constantly.", "Drain and fold in tuna off the heat.", "Toast bread, top with tuna eggs and chives.") },
  ],
  lunch: [
    { id: "chickenRiceBowl", name: "Chicken + rice + veg bowl", kcal: 550, p: 45, c: 60, f: 12, flags: ["meat"], contains: [],
      ing: ["chicken breast 180g", "rice 200g cooked", "mixed veg", "olive oil 1 tsp", "soy sauce"],
      recipe: r("15 min", "Season chicken and pan-fry 6 min each side until cooked through.", "Cook rice or use pre-cooked pouches.", "Stir-fry veg, combine in bowl, drizzle soy sauce.") },
    { id: "turkeySandwich", name: "Turkey & salad sandwich", kcal: 480, p: 35, c: 48, f: 15, flags: ["meat"], contains: ["gluten"],
      ing: ["turkey 150g", "wholegrain bread 2 slices", "salad leaves", "light mayo", "mustard"],
      recipe: r("5 min", "Spread mayo and mustard on bread.", "Layer turkey and salad leaves.", "Season and close.") },
    { id: "tunaPasta", name: "Tuna pasta", kcal: 560, p: 40, c: 70, f: 12, flags: ["fish"], contains: ["gluten"],
      ing: ["tuna 2 tins", "pasta 90g dry", "sweetcorn", "light mayo", "lemon"],
      recipe: r("12 min", "Cook pasta al dente, drain and cool slightly.", "Mix in drained tuna, sweetcorn and mayo.", "Squeeze lemon juice, season well.") },
    { id: "burritoBowl", name: "Beef & bean burrito bowl", kcal: 620, p: 42, c: 62, f: 20, flags: ["meat"], contains: [],
      ing: ["lean beef mince 150g", "black beans", "rice 150g cooked", "salsa", "sour cream"],
      recipe: r("15 min", "Brown mince with cumin and paprika 8 min.", "Add black beans, warm through.", "Serve over rice with salsa and sour cream.") },
    { id: "chickenWrapYogurt", name: "Chicken wrap + yogurt", kcal: 500, p: 40, c: 45, f: 16, flags: ["meat", "dairy"], contains: ["dairy", "gluten"],
      ing: ["chicken 150g", "tortilla wrap", "salad", "Greek yogurt pot"],
      recipe: r("10 min", "Slice and pan-fry chicken 6–8 min.", "Warm wrap, fill with chicken and salad.", "Serve yogurt on the side or drizzle inside.") },
    { id: "salmonRiceSalad", name: "Salmon + brown rice salad", kcal: 580, p: 44, c: 55, f: 20, flags: ["fish"], contains: [],
      ing: ["salmon fillet 180g", "brown rice 180g cooked", "cucumber", "edamame", "lemon dressing"],
      recipe: r("15 min", "Season salmon and bake 200°C 12 min or pan-fry 4 min each side.", "Flake over rice with cucumber and edamame.", "Dress with lemon juice and olive oil.") },
    { id: "chickenCaesar", name: "Chicken Caesar salad", kcal: 480, p: 44, c: 18, f: 26, flags: ["meat", "dairy"], contains: ["dairy", "gluten"],
      ing: ["chicken breast 180g", "romaine lettuce", "parmesan 25g", "croutons 20g", "Caesar dressing 2 tbsp"],
      recipe: r("12 min", "Grill or pan-fry chicken, slice.", "Chop romaine, toss with dressing.", "Top with chicken, parmesan and croutons.") },
    { id: "pokeBowl", name: "Tuna poke bowl", kcal: 560, p: 38, c: 65, f: 14, flags: ["fish"], contains: ["gluten"],
      ing: ["sushi-grade tuna 160g", "sushi rice 200g cooked", "avocado", "edamame", "soy sauce 2 tbsp", "sesame seeds"],
      recipe: r("10 min", "Cook and season sushi rice with rice vinegar.", "Cube tuna, toss in soy sauce and sesame oil.", "Build bowl: rice, tuna, sliced avocado, edamame, sesame seeds.") },
    { id: "prawnRiceBowl", name: "Prawn + rice + veg bowl", kcal: 520, p: 38, c: 60, f: 12, flags: ["fish"], contains: [],
      ing: ["prawns 200g", "rice 180g cooked", "bok choy", "ginger", "soy sauce", "sesame oil"],
      recipe: r("12 min", "Stir-fry prawns with ginger 3–4 min until pink.", "Add bok choy, cook 2 min.", "Serve over rice, drizzle sesame oil and soy.") },
    { id: "tunaAvoWrap", name: "Tuna + avocado wrap", kcal: 500, p: 36, c: 42, f: 20, flags: ["fish"], contains: ["gluten"],
      ing: ["tuna 2 tins", "½ avocado", "tortilla wrap", "spinach", "lemon juice"],
      recipe: r("5 min", "Mash avocado with lemon juice and seasoning.", "Mix in drained tuna.", "Fill wrap with tuna-avo mix and spinach. Roll tight.") },
    { id: "lentilSoup", name: "Chicken + red lentil soup", kcal: 450, p: 36, c: 50, f: 10, flags: ["meat"], contains: [],
      ing: ["chicken breast 150g", "red lentils 80g dry", "chicken stock 500ml", "tomatoes", "cumin", "spinach"],
      recipe: r("25 min", "Simmer lentils in stock with cumin and diced tomatoes 15 min.", "Add shredded chicken, cook 5 min.", "Stir in spinach until wilted. Season well.") },
    { id: "greekChickenSalad", name: "Greek salad + grilled chicken", kcal: 460, p: 42, c: 16, f: 24, flags: ["meat", "dairy"], contains: ["dairy"],
      ing: ["chicken breast 180g", "tomatoes", "cucumber", "olives", "feta 60g", "olive oil", "oregano"],
      recipe: r("12 min", "Grill chicken 5–6 min each side, slice.", "Chop tomatoes, cucumber and olives, toss with olive oil.", "Top with feta, oregano and grilled chicken.") },
  ],
  dinner: [
    { id: "salmonPotatoes", name: "Salmon + potatoes + greens", kcal: 600, p: 42, c: 45, f: 26, flags: ["fish"], contains: [],
      ing: ["salmon fillet 180g", "potatoes 300g", "broccoli", "olive oil", "lemon"],
      recipe: r("25 min", "Boil or roast potatoes 20 min at 200°C.", "Season salmon, bake 12 min at 200°C or pan-fry 4 min each side.", "Steam broccoli 5 min. Squeeze lemon over salmon.") },
    { id: "steakRiceBroccoli", name: "Steak + rice + broccoli", kcal: 640, p: 48, c: 55, f: 22, flags: ["meat"], contains: [],
      ing: ["sirloin 200g", "rice 180g cooked", "broccoli", "butter 10g", "garlic"],
      recipe: r("20 min", "Rest steak at room temp 10 min. Heat pan until smoking.", "Sear steak 2–3 min each side for medium-rare. Rest 5 min.", "Steam broccoli. Cook rice. Finish steak with garlic butter.") },
    { id: "chickenStirFry", name: "Chicken stir-fry + noodles", kcal: 580, p: 44, c: 62, f: 16, flags: ["meat"], contains: ["gluten"],
      ing: ["chicken 180g", "egg noodles 90g dry", "stir-fry veg 200g", "soy sauce 2 tbsp", "oyster sauce 1 tbsp", "ginger"],
      recipe: r("15 min", "Cook noodles per packet, drain.", "Stir-fry chicken on high heat 5–6 min.", "Add veg and sauces, toss 3 min. Mix in noodles.") },
    { id: "beefMincePasta", name: "Lean beef bolognese + pasta", kcal: 620, p: 45, c: 68, f: 18, flags: ["meat"], contains: ["gluten"],
      ing: ["lean beef mince 150g", "pasta 90g dry", "tomato passata 200ml", "onion", "garlic", "parmesan"],
      recipe: r("20 min", "Cook pasta al dente, reserve some pasta water.", "Brown mince with onion and garlic 8 min. Add passata, simmer 8 min.", "Toss pasta in sauce with a splash of pasta water. Top with parmesan.") },
    { id: "chickenCouscous", name: "Chicken + couscous + salad", kcal: 540, p: 46, c: 52, f: 14, flags: ["meat", "dairy"], contains: ["gluten"],
      ing: ["chicken 180g", "couscous 80g dry", "mixed salad", "feta 40g", "lemon dressing"],
      recipe: r("15 min", "Pour boiling stock over couscous, cover 5 min, fluff with fork.", "Grill or pan-fry chicken 6 min each side.", "Toss couscous with salad, feta and dressing. Top with chicken.") },
    { id: "backedCodSweetPotato", name: "Baked cod + sweet potato + veg", kcal: 550, p: 42, c: 52, f: 12, flags: ["fish"], contains: [],
      ing: ["cod fillet 200g", "sweet potato 250g", "asparagus", "olive oil", "lemon", "paprika"],
      recipe: r("30 min", "Cube sweet potato, roast with oil and paprika at 200°C 25 min.", "Season cod, bake on same tray last 12 min.", "Roast asparagus 8 min alongside. Finish with lemon.") },
    { id: "chickenTikkaRice", name: "Chicken tikka + basmati rice", kcal: 600, p: 48, c: 58, f: 16, flags: ["meat", "dairy"], contains: ["dairy"],
      ing: ["chicken breast 180g", "tikka paste 2 tbsp", "yogurt 50g", "basmati rice 180g cooked", "spinach"],
      recipe: r("20 min", "Marinate chicken in tikka paste + yogurt 10 min (or overnight).", "Grill or pan-fry 6–7 min each side.", "Serve over rice with wilted spinach.") },
    { id: "turkeyTacos", name: "Turkey mince tacos", kcal: 580, p: 44, c: 50, f: 22, flags: ["meat"], contains: ["gluten"],
      ing: ["turkey mince 180g", "corn tortillas 3", "salsa", "avocado", "lime", "cumin", "paprika"],
      recipe: r("15 min", "Brown turkey mince with cumin and paprika 8–10 min.", "Warm tortillas in dry pan 30 sec each side.", "Fill with mince, salsa and sliced avocado. Squeeze lime.") },
    { id: "prawnPasta", name: "Prawn + tomato pasta", kcal: 560, p: 36, c: 70, f: 14, flags: ["fish"], contains: ["gluten"],
      ing: ["prawns 200g", "pasta 90g dry", "cherry tomatoes 200g", "garlic 3 cloves", "chilli flakes", "olive oil", "basil"],
      recipe: r("15 min", "Cook pasta al dente.", "Fry garlic and chilli in oil 1 min. Add tomatoes, cook 5 min until bursting.", "Add prawns 3 min until pink. Toss with pasta and basil.") },
    { id: "beefSweetPotato", name: "Sirloin + sweet potato + greens", kcal: 640, p: 50, c: 48, f: 24, flags: ["meat"], contains: [],
      ing: ["sirloin 200g", "sweet potato 250g", "kale or spinach", "olive oil", "garlic butter"],
      recipe: r("25 min", "Roast sweet potato cubes at 200°C 20 min.", "Sear steak 2–3 min per side in very hot pan. Rest 5 min.", "Wilt greens in garlic butter. Slice steak and serve.") },
    { id: "bakedChickenThighs", name: "Baked chicken thighs + roasted veg", kcal: 580, p: 46, c: 28, f: 30, flags: ["meat"], contains: [],
      ing: ["chicken thighs 250g", "bell peppers", "courgette", "red onion", "olive oil", "paprika", "oregano"],
      recipe: r("35 min", "Toss veg in oil, paprika and oregano. Spread on tray.", "Season chicken thighs, place on top skin-side up.", "Roast at 200°C 30–35 min until skin is golden.") },
    { id: "lambMincePasta", name: "Lamb bolognese + pasta", kcal: 640, p: 44, c: 68, f: 22, flags: ["meat"], contains: ["gluten"],
      ing: ["lamb mince 150g", "pasta 90g dry", "tomato passata 200ml", "onion", "garlic", "cumin", "parmesan"],
      recipe: r("20 min", "Brown lamb with onion, garlic and cumin 8 min. Drain excess fat.", "Add passata, simmer 10 min.", "Toss with cooked pasta and parmesan.") },
  ],
  snack: [
    { id: "proteinShake", name: "Protein shake", kcal: 170, p: 30, c: 6, f: 3, flags: ["dairy"], contains: ["dairy"],
      ing: ["1–2 scoops whey", "water or milk 300ml"],
      recipe: r("1 min", "Add whey to shaker with water or milk.", "Shake vigorously 20 seconds.") },
    { id: "applePB", name: "Apple + peanut butter", kcal: 250, p: 8, c: 30, f: 13, flags: ["plant"], contains: ["nuts"],
      ing: ["apple", "peanut butter 2 tbsp"] },
    { id: "jerkyFruit", name: "Beef jerky + fruit", kcal: 220, p: 22, c: 24, f: 4, flags: ["meat"], contains: [],
      ing: ["beef jerky 40g", "banana"] },
    { id: "boiledEggs", name: "3 boiled eggs", kcal: 210, p: 18, c: 1, f: 15, flags: ["egg"], contains: [],
      ing: ["3 eggs"],
      recipe: r("10 min", "Bring water to boil. Lower eggs in gently.", "Boil 6–7 min for jammy yolk, 9 min for hard.", "Cool in ice water 1 min, peel and salt.") },
    { id: "cottageToast", name: "Cottage cheese on toast", kcal: 260, p: 22, c: 28, f: 6, flags: ["dairy"], contains: ["dairy", "gluten"],
      ing: ["cottage cheese 150g", "2 slices toast"],
      recipe: r("3 min", "Toast bread until golden.", "Spoon cottage cheese on top. Season with black pepper and chilli flakes.") },
    { id: "nutsBanana", name: "Nuts + banana", kcal: 300, p: 8, c: 30, f: 18, flags: ["plant"], contains: ["nuts"],
      ing: ["mixed nuts 35g", "banana"] },
    { id: "riceCakesPB", name: "Rice cakes + peanut butter", kcal: 220, p: 7, c: 28, f: 10, flags: ["plant"], contains: ["nuts"],
      ing: ["rice cakes 3", "peanut butter 2 tbsp"],
      recipe: r("2 min", "Spread peanut butter on rice cakes.", "Top with banana slices or a drizzle of honey if desired.") },
    { id: "greekYogurtHoney", name: "Greek yogurt + honey", kcal: 190, p: 18, c: 22, f: 4, flags: ["dairy"], contains: ["dairy"],
      ing: ["Greek yogurt 200g", "honey 1 tsp", "cinnamon"] },
    { id: "edamame", name: "Edamame (salted)", kcal: 155, p: 13, c: 12, f: 7, flags: ["plant"], contains: [],
      ing: ["edamame 200g", "sea salt"],
      recipe: r("5 min", "Boil or microwave edamame 3–4 min.", "Drain and sprinkle with sea salt.") },
    { id: "darkChocAlmonds", name: "Dark chocolate + almonds", kcal: 260, p: 6, c: 20, f: 18, flags: ["plant"], contains: ["nuts"],
      ing: ["dark chocolate 85%+ 30g", "almonds 25g"] },
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

// Resolve a plan item to its meal. A plan item can point at three things:
// the food database, the user's saved custom meals, or the generated library.
export function resolveMeal(mealId, customs = {}) {
  return FOOD_BY_ID[mealId] || customs[mealId] || mealById(mealId);
}

// true for anything the user logged themselves (food DB or custom meal) as
// opposed to a suggestion the generator produced
export function isLogged(mealId, customs = {}) {
  return !!(FOOD_BY_ID[mealId] || customs[mealId]);
}

export function planTotals(plan, customs = {}) {
  return (plan || []).reduce((a, p) => {
    const m = resolveMeal(p.mealId, customs); if (!m) return a;
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
