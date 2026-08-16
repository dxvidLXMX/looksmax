// ============================================================
//  Open Food Facts — optional online lookup for packaged products.
//
//  Only ever called on an explicit button press, never as-you-type:
//  OFF rate-limits search, and firing a request per keystroke gets
//  the client blocked (verified — 4 rapid calls returned a failure).
//
//  Anything picked from here is saved into the user's own meals by
//  the caller, so it resolves offline forever after. Nothing in the
//  app depends on this module being reachable.
// ============================================================

const ENDPOINT = "https://world.openfoodfacts.org/cgi/search.pl";
const FIELDS = "code,product_name,brands,serving_size,nutriments";

let inflight = null;

const num = (v) => (typeof v === "number" && isFinite(v) && v >= 0 ? v : null);
const round1 = (n) => Math.round(n * 10) / 10;

function cleanServing(raw) {
  const s = String(raw || "").trim();
  if (!s || s.length > 28) return "1 serving";
  return s;
}

// OFF product -> the same shape as a foods.js entry, or null if unusable
function normalize(p) {
  const name = String(p.product_name || "").trim();
  if (!name || !p.code) return null;

  const n = p.nutriments || {};
  // prefer the per-serving figures; fall back to per-100g
  const perServing = num(n["energy-kcal_serving"]);
  const useServing = perServing != null && perServing > 0;
  const kcal = useServing ? perServing : num(n["energy-kcal_100g"]);
  if (kcal == null || kcal <= 0) return null;   // no calories = useless for tracking

  const macro = (base) => {
    const v = useServing ? num(n[`${base}_serving`]) : num(n[`${base}_100g`]);
    return v == null ? 0 : round1(v);
  };

  return {
    id: `off_${p.code}`,
    name: name.slice(0, 60),
    brand: String(p.brands || "").split(",")[0].trim().slice(0, 28),
    serving: useServing ? cleanServing(p.serving_size) : "100 g",
    kcal: Math.round(kcal),
    p: macro("proteins"),
    c: macro("carbohydrates"),
    f: macro("fat"),
    online: true,
  };
}

// Look one product up by barcode. Returns null when OFF has no such product.
// Uses the v2 product endpoint, which is a separate (and cheaper) call than
// search — a scan doesn't spend the search quota.
export async function lookupBarcode(code, { timeout = 12000 } = {}) {
  const c = String(code || "").trim();
  if (!c) return null;
  if (!navigator.onLine) throw new Error("offline");

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(c)}.json?fields=${FIELDS}`;

  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.status !== 1 || !json.product) return null;
    return normalize({ ...json.product, code: json.product.code || c });
  } finally {
    clearTimeout(timer);
  }
}

// Throws: "offline" when there's no connection, otherwise a fetch/HTTP error.
export async function searchOnline(query, { limit = 20, timeout = 12000 } = {}) {
  const q = String(query || "").trim();
  if (!q) return [];
  if (!navigator.onLine) throw new Error("offline");

  inflight?.abort();                      // supersede an earlier search
  const ctrl = new AbortController();
  inflight = ctrl;
  const timer = setTimeout(() => ctrl.abort(), timeout);

  const url = `${ENDPOINT}?search_terms=${encodeURIComponent(q)}&search_simple=1`
            + `&action=process&json=1&page_size=${limit}&fields=${FIELDS}`;

  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const seen = new Set();
    return (json.products || [])
      .map(normalize)
      .filter(f => f && !seen.has(f.id) && seen.add(f.id));
  } finally {
    clearTimeout(timer);
    if (inflight === ctrl) inflight = null;
  }
}
