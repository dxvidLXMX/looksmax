// ============================================================
//  End-of-block alerts.
//
//  iOS reality check, because it shapes everything here:
//   • Notifications only exist for a PWA *installed to the home
//     screen*. In a normal Safari tab the API is absent.
//   • Permission must be requested from a real user gesture.
//   • There is no web API to schedule a notification for later.
//     Notification Triggers never shipped outside Chrome, and a
//     service worker is killed after ~30s idle, so it can't hold a
//     timer either. The only way to alert a fully-suspended phone is
//     a push message from a server.
//
//  So this fires from the live page: reliably in the foreground, and
//  best-effort while backgrounded (iOS throttles, then suspends). If
//  the phone suspended the app entirely, the alert lands the moment
//  you return — which is also when the block gets logged.
// ============================================================

export function isStandalone() {
  return window.matchMedia?.("(display-mode: standalone)").matches
      || window.navigator.standalone === true;
}

export function supported() { return "Notification" in window; }

export function permission() {
  return supported() ? Notification.permission : "unsupported";
}

// Why alerts can't be turned on right now, or null if they can.
export function blockedReason() {
  if (!supported()) {
    return isStandalone()
      ? "This device doesn't support notifications."
      : "Add the app to your home screen first — iOS only allows alerts for installed apps.";
  }
  if (Notification.permission === "denied")
    return "Alerts are blocked. Turn them back on in iOS Settings → Notifications → Looksmax.";
  return null;
}

// Must be called straight from a tap.
export async function requestPermission() {
  if (!supported()) return "unsupported";
  try { return await Notification.requestPermission(); }
  catch { return Notification.permission; }
}

// Prefer the service worker: on iOS a page-created Notification is
// unreliable, and the SW copy survives the page being backgrounded.
export async function notify(title, body, tag = "focus-done") {
  if (!supported() || Notification.permission !== "granted") return false;
  try {
    const reg = await navigator.serviceWorker?.ready;
    if (reg?.showNotification) {
      await reg.showNotification(title, {
        body, tag, renotify: true,
        icon: "./icons/icon-192.png", badge: "./icons/icon-192.png",
        vibrate: [200, 100, 200],
        data: { url: "./" },
      });
      return true;
    }
    new Notification(title, { body, tag, icon: "./icons/icon-192.png" });
    return true;
  } catch (e) { console.warn("notify failed", e); return false; }
}
