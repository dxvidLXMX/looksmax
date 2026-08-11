// ============================================================
//  Supplements — research-grounded, evidence-tiered list.
//  Educational only, not medical advice. Sources: peer-reviewed
//  reviews + Bryan Johnson "Blueprint" (overlap noted).
// ============================================================

export const TIER_INFO = {
  core: { label: "Core — strong evidence", blurb: "The high-ROI basics. This is where ~90% of the benefit is for building muscle, clear skin, and general health." },
  situational: { label: "Situational", blurb: "Useful for a specific goal or short window. Don't run indefinitely." },
  blueprint: { label: "Blueprint / longevity — skip for now", blurb: "Bryan Johnson's anti-aging stack. Thin/mixed human evidence, expensive, aimed at reversing aging in a 40+ body. Not what moves the needle for you." },
};

// habit hook: name + category + timeOfDay used when "Add to routine"
export const SUPPLEMENTS = [
  {
    id: "creatine", tier: "core", name: "Creatine monohydrate", dose: "5 g daily",
    timeOfDay: "morning", when: "Any time — consistency matters, not timing",
    why: "The most proven supplement for muscle & strength (and cognition). Works by improving training quality over weeks.",
    caution: "Drink water. 'Creatine bloat' is intramuscular water = good. Micronized dissolves easier.",
    blueprint: true,
  },
  {
    id: "vitd", tier: "core", name: "Vitamin D3", dose: "2,000 IU daily",
    timeOfDay: "morning", when: "With a meal containing fat",
    why: "Bone density, testosterone/hormones, immunity, mood. Deficiency is extremely common. Also helps acne when correcting a deficiency.",
    caution: "Ideally test blood 25-OH-D first. Pair with vitamin K2. Don't mega-dose.",
    blueprint: true,
  },
  {
    id: "omega3", tier: "core", name: "Omega-3 (fish oil)", dose: "1–2 g EPA+DHA daily",
    timeOfDay: "morning", when: "With a meal",
    why: "Recovery, heart & brain health, and lowers the systemic inflammation behind acne. Skin benefits in multiple studies.",
    caution: "Buy third-party tested (rancidity/heavy metals). Vegan? Use algae oil.",
    blueprint: true,
  },
  {
    id: "magnesium", tier: "core", name: "Magnesium glycinate", dose: "200–400 mg",
    timeOfDay: "evening", when: "Evening, ~1 hr before bed",
    why: "Sleep quality, muscle relaxation & recovery, nervous-system calm. Glycinate is best absorbed and gentle on the gut.",
    caution: "Oxide form is poorly absorbed (laxative). Start at 200 mg.",
    blueprint: true,
  },
  {
    id: "whey", tier: "core", name: "Whey protein", dose: "1 scoop as needed",
    timeOfDay: "anytime", when: "Whenever you're short of your daily protein target",
    why: "Not magic — just a convenient tool to hit the protein number that actually drives muscle & recovery.",
    caution: "Food first. Lactose issues? Use isolate or a plant blend.",
    blueprint: false,
  },
  {
    id: "zinc", tier: "situational", name: "Zinc (for acne)", dose: "30 mg elemental",
    timeOfDay: "evening", when: "With food, away from calcium/iron. 8–12 week course",
    why: "Reduced inflammatory acne ~30% in trials — comparable to low-dose antibiotics. Also supports testosterone if deficient.",
    caution: "SHORT-TERM ONLY. Long-term high zinc → copper deficiency. Skip if acne isn't a concern.",
    blueprint: false,
  },
  {
    id: "melatonin", tier: "situational", name: "Melatonin (low-dose)", dose: "0.3–0.5 mg",
    timeOfDay: "evening", when: "30–60 min before bed, short-term to reset your schedule",
    why: "A tiny dose shifts your body clock to fix a broken sleep schedule. Bryan Johnson uses 300 mcg — micro, not mega.",
    caution: "The common 5–10 mg pills are far too high and cause grogginess. Use as a reset tool, not forever.",
    blueprint: true,
  },
  {
    id: "lteanine", tier: "situational", name: "L-Theanine", dose: "100–200 mg",
    timeOfDay: "anytime", when: "With caffeine, or in the evening to unwind",
    why: "Smooths caffeine jitters and supports calm focus; mild help for sleep onset.",
    caution: "Very safe. Optional 'nice to have'.",
    blueprint: false,
  },
];

// The Blueprint longevity compounds — listed so you know what to IGNORE and why.
export const BLUEPRINT_SKIP = [
  "NMN / NR", "Spermidine", "Fisetin", "Ca-AKG", "Resveratrol", "CoQ10", "Metformin/Rapamycin (Rx)",
];
