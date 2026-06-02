// rudel-components.jsx — geteilte UI-Bausteine im Bandshirt/Neon-Stil.
const { useState, useEffect, useRef } = React;

const PALETTE = {
  bg: '#0a0a0c', bg2: '#141417', ink: '#f6f5f1', dim: 'rgba(246,245,241,0.55)',
  A: '#b14bff', B: '#ffe000', match: '#ff2d9b', bluff: '#00ff9c', danger: '#ff3b3b',
};
const teamColor = t => (t === 'A' ? PALETTE.A : PALETTE.B);
const onColor = hex => (hex === PALETTE.B || hex === PALETTE.bluff ? '#0a0a0c' : '#0a0a0c');

// Großer Haupt-Button. Brutaler Kontrast, riesiges Tap-Target, harter Schatten.
function BigButton({ children, color = PALETTE.ink, textColor, onClick, sub, style = {}, ghost = false }) {
  const [down, setDown] = useState(false);
  const buzz = () => { try { navigator.vibrate && navigator.vibrate(18); } catch (e) {} };
  const base = {
    width: '100%', border: 'none', cursor: 'pointer', borderRadius: 18,
    fontFamily: 'Anton, sans-serif', letterSpacing: '0.5px',
    padding: '22px 18px', textTransform: 'uppercase', lineHeight: 1,
    transition: 'transform .07s ease, box-shadow .07s ease',
    transform: down ? 'translateY(4px)' : 'translateY(0)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
    ...style,
  };
  const solid = {
    background: color, color: textColor || onColor(color),
    boxShadow: down ? `0 2px 0 ${shade(color)}` : `0 7px 0 ${shade(color)}, 0 10px 26px ${color}55`,
  };
  const gh = {
    background: 'transparent', color: color,
    border: `3px solid ${color}`,
    boxShadow: down ? 'none' : `0 6px 0 ${shade(color)}40`,
  };
  return (
    <button
      onMouseDown={() => setDown(true)} onMouseUp={() => setDown(false)}
      onMouseLeave={() => setDown(false)} onTouchStart={() => setDown(true)}
      onTouchEnd={() => setDown(false)}
      onClick={() => { buzz(); onClick && onClick(); }}
      style={{ ...base, ...(ghost ? gh : solid) }}>
      <span style={{ fontSize: 30 }}>{children}</span>
      {sub && <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: 12, letterSpacing: '1.5px', opacity: 0.8 }}>{sub}</span>}
    </button>
  );
}

// dunklere Variante einer Farbe für den 3D-Schatten
function shade(hex) {
  const c = hex.replace('#', '');
  const n = parseInt(c.length === 3 ? c.split('').map(x => x + x).join('') : c, 16);
  const r = Math.max(0, ((n >> 16) & 255) - 70), g = Math.max(0, ((n >> 8) & 255) - 70), b = Math.max(0, (n & 255) - 70);
  return `rgb(${r},${g},${b})`;
}

// Team-Badge: farbiger Sticker-Tag
function TeamBadge({ team, name, size = 'md' }) {
  const c = teamColor(team);
  const fs = size === 'lg' ? 17 : size === 'sm' ? 11 : 13;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: c, color: '#0a0a0c', fontFamily: 'Anton, sans-serif',
      fontSize: fs, letterSpacing: '0.5px', padding: '4px 10px', borderRadius: 6,
      transform: 'rotate(-1.5deg)', boxShadow: `0 2px 0 ${shade(c)}`,
    }}>TEAM {team}{name ? ` · ${name}` : ''}</span>
  );
}

// kleiner gedrehter Sticker
function Sticker({ children, color = PALETTE.ink, rotate = -4, style = {} }) {
  return (
    <span style={{
      display: 'inline-block', fontFamily: 'Anton, sans-serif', fontSize: 12,
      letterSpacing: '1px', color: '#0a0a0c', background: color,
      padding: '3px 9px', borderRadius: 4, transform: `rotate(${rotate}deg)`,
      boxShadow: `0 2px 0 ${shade(color)}`, ...style,
    }}>{children}</span>
  );
}

// Hazard-Tape-Streifen (Festival-Absperrung)
function HazardBar({ color = PALETTE.ink, height = 10, style = {} }) {
  return (
    <div style={{
      height, width: '100%',
      backgroundImage: `repeating-linear-gradient(45deg, ${color} 0 14px, #0a0a0c 14px 28px)`,
      opacity: 0.9, ...style,
    }} />
  );
}

// großer Countdown-Ring
function TimerRing({ total, remaining, color, paused }) {
  const R = 92, C = 2 * Math.PI * R;
  const frac = total ? remaining / total : 0;
  const mm = Math.floor(remaining / 60), ss = remaining % 60;
  const label = total >= 60 || mm > 0 ? `${mm}:${String(ss).padStart(2, '0')}` : String(ss);
  const low = remaining <= 10 && remaining > 0;
  return (
    <div style={{ position: 'relative', width: 220, height: 220 }}>
      <svg width="220" height="220" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="110" cy="110" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
        <circle cx="110" cy="110" r={R} fill="none" stroke={color} strokeWidth="14"
          strokeLinecap="round" strokeDasharray={C}
          strokeDashoffset={C * (1 - frac)}
          style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 10px ${color})` }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: 'Anton, sans-serif', fontSize: 76, lineHeight: 0.9, color: PALETTE.ink,
          fontVariantNumeric: 'tabular-nums',
          animation: low && !paused ? 'rudelPulse 1s infinite' : 'none',
          textShadow: low ? `0 0 18px ${PALETTE.danger}` : 'none',
        }}>{label}</span>
        <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 11, letterSpacing: '2px', color: PALETTE.dim, marginTop: 4 }}>
          {paused ? 'PAUSE' : remaining <= 0 ? 'ZEIT UM!' : 'SEKUNDEN'}
        </span>
      </div>
    </div>
  );
}

// Vollbild-Flash (Feedback bei Punkten / Timer-Ende)
function Flash({ color, text, onDone }) {
  useEffect(() => {
    try { navigator.vibrate && navigator.vibrate([40, 30, 90]); } catch (e) {}
    const t = setTimeout(onDone, 720);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200, background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'rudelFlash .72s ease-out forwards', textAlign: 'center',
    }}>
      <span style={{
        fontFamily: 'Anton, sans-serif', fontSize: 64, color: '#0a0a0c', lineHeight: 0.9,
        transform: 'rotate(-4deg)', padding: '0 20px',
      }}>{text}</span>
    </div>
  );
}

Object.assign(window, { PALETTE, teamColor, onColor, BigButton, shade, TeamBadge, Sticker, HazardBar, TimerRing, Flash });
