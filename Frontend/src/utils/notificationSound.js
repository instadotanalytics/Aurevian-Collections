// src/utils/notificationSound.js
// Dependency-free notification sound built on the native Web Audio API —
// no audio file/asset, so nothing to fetch and nothing that can 404 or
// go stale between dev and prod builds.
//
// Browsers block AudioContext output until the page has seen a genuine
// user gesture (click/tap/keydown). unlockAudioContext() is wired to the
// app's first interaction (see SocketContext.jsx). Until that happens,
// playNotificationSound() is a silent no-op — it NEVER throws and never
// blocks the caller.

let audioCtx = null;
let unlocked = false;

function getAudioContext() {
  if (audioCtx) return audioCtx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null; // unsupported browser — fail silently
  try {
    audioCtx = new Ctx();
  } catch {
    return null;
  }
  return audioCtx;
}

// Call once, from a real user-gesture handler. Safe to call repeatedly —
// idempotent after the first successful resume().
export function unlockAudioContext() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx
      .resume()
      .then(() => {
        unlocked = true;
      })
      .catch(() => {});
  } else {
    unlocked = true;
  }
}

// Soft two-tone chime (A5 -> E6, ~70ms apart, quick decay). Never throws.
export function playNotificationSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // No user gesture yet -> browser will silently refuse to produce
    // sound anyway. Skip cleanly rather than letting resume() dangle.
    if (ctx.state === "suspended" && !unlocked) return;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const tones = [
      { freq: 880, start: 0 }, // A5
      { freq: 1318.51, start: 0.09 }, // E6
    ];

    tones.forEach(({ freq, start }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + start);

      const attackEnd = now + start + 0.015;
      const releaseEnd = now + start + 0.32;
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.16, attackEnd); // subtle, not loud
      gain.gain.exponentialRampToValueAtTime(0.0001, releaseEnd);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(releaseEnd + 0.05);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    });
  } catch (err) {
    // A sound failure must never break notification delivery.
    console.warn("⚠️ Notification sound failed to play:", err?.message);
  }
}
