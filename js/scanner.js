// ============================================================
//  Barcode scanning.
//
//  iOS Safari has no BarcodeDetector, and an installed PWA on
//  iPhone runs on Safari's engine — so we always use ZXing, loaded
//  from the CDN at first use (same pattern as supabase-js). One code
//  path for every device beats a native branch we can't test.
//
//  Needs a secure context for getUserMedia: fine on GitHub Pages
//  (HTTPS) and on localhost, but plain http:// on a LAN IP will fail.
// ============================================================

const CDN = "https://esm.sh/@zxing/browser@0.1.5";

let libPromise = null;   // cached module import
let reader = null;
let controls = null;

function loadLib() {
  libPromise ||= import(/* @vite-ignore */ CDN);
  return libPromise;
}

// Turn a getUserMedia / load failure into something worth showing a user.
export function describeError(err) {
  const n = err?.name || "";
  if (n === "NotAllowedError" || n === "SecurityError")
    return "Camera access was blocked. Allow it for this site, then try again.";
  if (n === "NotFoundError" || n === "OverconstrainedError")
    return "No usable camera found on this device.";
  if (n === "NotReadableError")
    return "The camera is being used by another app. Close it and retry.";
  if (!navigator.onLine)
    return "You're offline — scanning needs a connection the first time.";
  return "Couldn't start the scanner. You can type the barcode number instead.";
}

// Start the rear camera and call onCode(text) on the first successful read.
// Throws on permission/hardware/CDN failure — caller shows describeError().
export async function startScan(videoEl, onCode) {
  await stopScan();
  const z = await loadLib();
  reader = new z.BrowserMultiFormatReader();

  let fired = false;
  controls = await reader.decodeFromConstraints(
    { video: { facingMode: { ideal: "environment" } } },
    videoEl,
    (result) => {
      if (fired || !result) return;     // decode fires continuously; take the first hit
      fired = true;
      onCode(result.getText());
    }
  );
  return controls;
}

export async function stopScan() {
  try { controls?.stop(); } catch { /* already stopped */ }
  controls = null;
  reader = null;
}

// Belt and braces: kill any track still attached to the video element, so the
// camera indicator never stays lit after the sheet closes.
export function releaseVideo(videoEl) {
  const stream = videoEl?.srcObject;
  if (stream?.getTracks) stream.getTracks().forEach(t => { try { t.stop(); } catch {} });
  if (videoEl) videoEl.srcObject = null;
}
