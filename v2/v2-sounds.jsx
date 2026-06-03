// v2-sounds.jsx — Web-Audio-Engine mit witzigen, variierenden Soundeffekten.
// Jeder "Moment" hat mehrere Varianten, die zufällig durchrotieren. Keine Audio-Dateien.

const V2_SOUND_KEY = 'rudel_v2_muted';

const V2_Sound = (function () {
  let ctx = null;
  let unlocked = false;
  let muted = false;
  try { muted = localStorage.getItem(V2_SOUND_KEY) === 'true'; } catch (e) {}

  const listeners = new Set();
  const recent = {};

  // iOS/Android entsperren: AudioContext IN der ersten Touch-Geste anlegen
  // und einen stillen Buffer abspielen. Erst danach reagiert iOS auf Sound.
  function unlock() {
    if (unlocked) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!ctx) ctx = new AC();
      // 1-Sample stiller Buffer abspielen → unlockt iOS-Audio
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
      if (ctx.state === 'suspended') ctx.resume();
      unlocked = true;
    } catch (e) {}
  }
  ['touchstart', 'touchend', 'pointerdown', 'click', 'keydown'].forEach(ev =>
    window.addEventListener(ev, unlock, { passive: true })
  );

  function ensure() {
    if (muted) return null;
    if (!ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
      } catch (e) { return null; }
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // ── Atomare Bausteine ──
  function tone({ freq = 440, dur = 0.18, type = 'sine', vol = 0.18, attack = 0.005, release = 0.08, slideTo = null, delay = 0, detune = 0 }) {
    const c = ensure(); if (!c) return;
    const t0 = c.currentTime + delay;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (detune) osc.detune.value = detune;
    if (slideTo != null) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + attack);
    gain.gain.setValueAtTime(vol, t0 + Math.max(attack, dur - release));
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }

  function noise({ dur = 0.12, vol = 0.12, delay = 0, bandpass = null, q = 4 }) {
    const c = ensure(); if (!c) return;
    const t0 = c.currentTime + delay;
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = c.createBufferSource();
    src.buffer = buf;
    const gain = c.createGain();
    gain.gain.setValueAtTime(vol, t0);
    let node = src;
    if (bandpass) {
      const bp = c.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = bandpass; bp.Q.value = q;
      node.connect(bp); node = bp;
    }
    node.connect(gain).connect(c.destination);
    src.start(t0); src.stop(t0 + dur + 0.02);
  }

  // Akkord = mehrere Töne gleichzeitig
  function chord(freqs, opts = {}) {
    freqs.forEach((f, i) => tone({ ...opts, freq: f, delay: (opts.delay || 0) + i * 0.005 }));
  }

  // ── Variantengruppen ──
  const VARIANTS = {

    // KARTE ZIEHEN — frischer Auftritt
    draw: [
      // Vinyl-Scratch + Bass-Drop
      () => { noise({ dur: 0.22, vol: 0.20, bandpass: 1400 }); tone({ freq: 110, slideTo: 45, dur: 0.22, type: 'sine', vol: 0.22 }); },
      // Drum-Roll + Snare-Hit
      () => {
        for (let i = 0; i < 6; i++) noise({ dur: 0.04, vol: 0.10, bandpass: 4500, delay: i * 0.035 });
        noise({ dur: 0.12, vol: 0.22, bandpass: 2200, delay: 0.22 });
      },
      // Riff-Stab (Power-Chord)
      () => { chord([196, 294, 392], { dur: 0.22, type: 'sawtooth', vol: 0.10 }); },
      // Tape-Klick
      () => { noise({ dur: 0.04, vol: 0.18, bandpass: 5000 }); tone({ freq: 660, slideTo: 220, dur: 0.18, type: 'triangle', vol: 0.14, delay: 0.04 }); },
    ],

    // TIMER LETZTE 3 SEKUNDEN
    tick: [
      () => tone({ freq: 880, dur: 0.05, type: 'square', vol: 0.12 }),
      () => tone({ freq: 760, dur: 0.06, type: 'triangle', vol: 0.14 }),
    ],

    // TIMER ABGELAUFEN — Airhorn / Gong / Buzzer
    end: [
      // Airhorn
      () => { tone({ freq: 480, dur: 0.45, type: 'sawtooth', vol: 0.20 });
              tone({ freq: 320, dur: 0.45, type: 'square', vol: 0.14, delay: 0.02 }); },
      // Gong
      () => { tone({ freq: 130, dur: 0.9, type: 'sine', vol: 0.22 });
              tone({ freq: 196, dur: 0.9, type: 'sine', vol: 0.14, detune: 8 });
              noise({ dur: 0.05, vol: 0.12, bandpass: 3000 }); },
      // Buzzer
      () => { tone({ freq: 220, dur: 0.18, type: 'square', vol: 0.20 });
              tone({ freq: 220, dur: 0.18, type: 'square', vol: 0.20, delay: 0.22 }); },
    ],

    // ERFOLG / PUNKTE
    win: [
      // Fanfare 3 Noten
      () => {
        tone({ freq: 523, dur: 0.10, type: 'triangle', vol: 0.18 });
        tone({ freq: 659, dur: 0.10, type: 'triangle', vol: 0.20, delay: 0.10 });
        tone({ freq: 880, dur: 0.20, type: 'triangle', vol: 0.22, delay: 0.20 });
      },
      // Cymbal-Crash + Power-Chord
      () => {
        noise({ dur: 0.45, vol: 0.18, bandpass: 6000, q: 1 });
        chord([196, 294, 392, 523], { dur: 0.40, type: 'sawtooth', vol: 0.10, delay: 0.02 });
      },
      // "Yeah!" — Major-Akkord aufwärts
      () => {
        chord([262, 330, 392], { dur: 0.10, type: 'triangle', vol: 0.16 });
        chord([330, 415, 494], { dur: 0.18, type: 'triangle', vol: 0.18, delay: 0.12 });
      },
      // Glockenschlag
      () => {
        tone({ freq: 1320, dur: 0.6, type: 'sine', vol: 0.18 });
        tone({ freq: 1760, dur: 0.5, type: 'sine', vol: 0.10, delay: 0.02, detune: 4 });
      },
    ],

    // KEIN PUNKT
    lose: [
      // Sad Trombone
      () => {
        tone({ freq: 392, dur: 0.18, type: 'sawtooth', vol: 0.16 });
        tone({ freq: 349, dur: 0.20, type: 'sawtooth', vol: 0.16, delay: 0.18 });
        tone({ freq: 311, dur: 0.20, type: 'sawtooth', vol: 0.16, delay: 0.38 });
        tone({ freq: 261, slideTo: 200, dur: 0.40, type: 'sawtooth', vol: 0.18, delay: 0.58 });
      },
      // "Booo"
      () => {
        tone({ freq: 220, slideTo: 110, dur: 0.45, type: 'sawtooth', vol: 0.20 });
        noise({ dur: 0.30, vol: 0.08, bandpass: 1200, delay: 0.08 });
      },
      // Deflate
      () => { tone({ freq: 660, slideTo: 80, dur: 0.55, type: 'square', vol: 0.14 }); },
    ],

    // TWIST AKTIVIERT
    twist: [
      // Lightning Zap
      () => {
        tone({ freq: 1400, slideTo: 180, dur: 0.22, type: 'square', vol: 0.16 });
        noise({ dur: 0.12, vol: 0.12, bandpass: 3500, delay: 0.04 });
      },
      // Glitchy Beep
      () => {
        for (let i = 0; i < 4; i++) tone({ freq: 1200 - i * 200, dur: 0.05, type: 'square', vol: 0.14, delay: i * 0.06 });
      },
      // Boom mit Schweif
      () => {
        tone({ freq: 80, slideTo: 30, dur: 0.50, type: 'sine', vol: 0.26 });
        noise({ dur: 0.30, vol: 0.08, bandpass: 200, delay: 0.05 });
      },
    ],

    // AKT-WECHSEL — Triumph
    akt: [
      () => {
        tone({ freq: 261, dur: 0.14, type: 'triangle', vol: 0.18 });
        tone({ freq: 392, dur: 0.14, type: 'triangle', vol: 0.20, delay: 0.14 });
        tone({ freq: 523, dur: 0.14, type: 'triangle', vol: 0.20, delay: 0.28 });
        tone({ freq: 659, dur: 0.30, type: 'triangle', vol: 0.22, delay: 0.42 });
      },
    ],

    // Allgemeiner Knopf-Klick
    click: [
      () => tone({ freq: 520, dur: 0.04, type: 'triangle', vol: 0.08 }),
      () => tone({ freq: 660, dur: 0.04, type: 'triangle', vol: 0.08 }),
    ],
  };

  function play(kind) {
    if (muted) return;
    const pool = VARIANTS[kind];
    if (!pool || !pool.length) return;
    // wähle Variante, aber nicht direkt dieselbe wie zuletzt
    let idx = Math.floor(Math.random() * pool.length);
    if (pool.length > 1 && idx === recent[kind]) idx = (idx + 1) % pool.length;
    recent[kind] = idx;
    try { pool[idx](); } catch (e) {}
  }

  function isMuted() { return muted; }
  function setMuted(v) {
    muted = !!v;
    try { localStorage.setItem(V2_SOUND_KEY, muted ? 'true' : 'false'); } catch (e) {}
    listeners.forEach(fn => { try { fn(muted); } catch (e) {} });
  }
  function toggle() { setMuted(!muted); }
  function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

  return { play, isMuted, setMuted, toggle, subscribe };
})();

// React-Hook für Mute-Status (Buttons aktualisieren live)
function useV2Muted() {
  const [m, setM] = React.useState(V2_Sound.isMuted());
  React.useEffect(() => V2_Sound.subscribe(setM), []);
  return m;
}

// Lautsprecher-Toggle-Button
function V2SoundToggle({ style = {} }) {
  const muted = useV2Muted();
  return (
    <button
      onClick={() => V2_Sound.toggle()}
      aria-label={muted ? 'Sound einschalten' : 'Sound ausschalten'}
      style={{
        background: 'transparent',
        border: `1.5px solid ${muted ? 'rgba(246,245,241,0.25)' : V2_PALETTE.B}`,
        borderRadius: 10, width: 38, height: 38, padding: 0, cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: muted ? V2_PALETTE.dim : V2_PALETTE.B, flexShrink: 0,
        ...style,
      }}>
      {muted ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path d="M15.5 8.5a5 5 0 010 7" />
          <path d="M19 5a9 9 0 010 14" />
        </svg>
      )}
    </button>
  );
}

Object.assign(window, { V2_Sound, useV2Muted, V2SoundToggle });
