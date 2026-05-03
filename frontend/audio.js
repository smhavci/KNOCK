const TARGET_VOL = 0.08;
const FADE_DURATION = 3000; // ms

const audio = document.getElementById('bg-audio');
const muteBtn = document.getElementById('mute-btn');
const muteIcon = document.getElementById('mute-icon');

let started = false;
let muted = false;

// ── Fade in ───────────────────────────────────────────────────────────────
function fadeIn() {
  audio.volume = 0;
  audio.play().catch(() => {});
  const step = TARGET_VOL / (FADE_DURATION / 50);
  const interval = setInterval(() => {
    if (audio.volume + step >= TARGET_VOL) {
      audio.volume = TARGET_VOL;
      clearInterval(interval);
    } else {
      audio.volume += step;
    }
  }, 50);
}

// ── Start on first interaction ────────────────────────────────────────────
function startOnce() {
  if (started) return;
  started = true;
  fadeIn();
  document.removeEventListener('click', startOnce);
  document.removeEventListener('keydown', startOnce);
  document.removeEventListener('touchstart', startOnce);
}

document.addEventListener('click',      startOnce);
document.addEventListener('keydown',    startOnce);
document.addEventListener('touchstart', startOnce);

// ── Mute toggle ───────────────────────────────────────────────────────────
muteBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // don't trigger startOnce twice on first click

  muted = !muted;
  audio.muted = muted;

  muteIcon.textContent = muted ? '♪̸' : '♪';
  muteBtn.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');

  // if first interaction was via mute btn, still start audio
  startOnce();
});
