// v2-components.jsx — geteilte UI für RUDEL v2.
const { useState: useStateV, useEffect: useEffectV, useRef: useRefV } = React;

const V2_PALETTE = {
  bg: '#0a0a0c', bg2: '#141417', ink: '#f6f5f1', dim: 'rgba(246,245,241,0.55)',
  match: '#ff2d9b', squad: '#00e5ff', rudel: '#c6ff00',
  gold: '#ffd400', danger: '#ff3b3b',
};
const V2_typeColor = t => V2_PALETTE[t] || V2_PALETTE.ink;
const V2_typeLabel = t => ({ match: 'MATCH & MISSION', squad: 'SQUAD MISSION', rudel: 'RUDEL CHALLENGE' }[t] || t);
const V2_typeTag = t => ({ match: '◆ PAAR', squad: '✦ SQUAD', rudel: '★ RUDEL' }[t] || '');

// dunklere Variante einer Hex-Farbe für 3D-Schatten
function V2_shade(hex) {
  const c = hex.replace('#', '');
  const n = parseInt(c.length === 3 ? c.split('').map(x => x + x).join('') : c, 16);
  const r = Math.max(0, ((n >> 16) & 255) - 70), g = Math.max(0, ((n >> 8) & 255) - 70), b = Math.max(0, (n & 255) - 70);
  return `rgb(${r},${g},${b})`;
}

function V2_BigButton({ children, color = V2_PALETTE.ink, textColor = '#0a0a0c', onClick, sub, style = {}, ghost = false, disabled = false }) {
  const [down, setDown] = useStateV(false);
  const buzz = () => { try { navigator.vibrate && navigator.vibrate(18); } catch (e) {} };
  const base = {
    width: '100%', border: 'none', cursor: disabled ? 'default' : 'pointer', borderRadius: 18,
    fontFamily: 'Anton, sans-serif', letterSpacing: '0.5px',
    padding: '22px 18px', textTransform: 'uppercase', lineHeight: 1,
    transition: 'transform .07s ease, box-shadow .07s ease',
    transform: down && !disabled ? 'translateY(4px)' : 'translateY(0)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
    opacity: disabled ? 0.4 : 1, ...style,
  };
  const solid = {
    background: color, color: textColor,
    boxShadow: down ? `0 2px 0 ${V2_shade(color)}` : `0 7px 0 ${V2_shade(color)}, 0 10px 26px ${color}55`,
  };
  const gh = {
    background: 'transparent', color: color, border: `3px solid ${color}`,
    boxShadow: down ? 'none' : `0 6px 0 ${V2_shade(color)}40`,
  };
  return (
    <button
      onMouseDown={() => !disabled && setDown(true)} onMouseUp={() => setDown(false)}
      onMouseLeave={() => setDown(false)} onTouchStart={() => !disabled && setDown(true)}
      onTouchEnd={() => setDown(false)}
      disabled={disabled}
      onClick={() => { if (!disabled) { buzz(); onClick && onClick(); } }}
      style={{ ...base, ...(ghost ? gh : solid) }}>
      <span style={{ fontSize: 30 }}>{children}</span>
      {sub && <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: 12, letterSpacing: '1.5px', opacity: 0.8 }}>{sub}</span>}
    </button>
  );
}

function V2_Sticker({ children, color = V2_PALETTE.ink, rotate = -4, style = {} }) {
  return (
    <span style={{
      display: 'inline-block', fontFamily: 'Anton, sans-serif', fontSize: 12,
      letterSpacing: '1px', color: '#0a0a0c', background: color,
      padding: '3px 9px', borderRadius: 4, transform: `rotate(${rotate}deg)`,
      boxShadow: `0 2px 0 ${V2_shade(color)}`, ...style,
    }}>{children}</span>
  );
}

function V2_HazardBar({ color = V2_PALETTE.ink, height = 10, style = {} }) {
  return (
    <div style={{
      height, width: '100%',
      backgroundImage: `repeating-linear-gradient(45deg, ${color} 0 14px, #0a0a0c 14px 28px)`,
      opacity: 0.9, ...style,
    }} />
  );
}

function V2_TypeChip({ type }) {
  const c = V2_typeColor(type);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      border: `2px solid ${c}`, color: c, borderRadius: 999, padding: '8px 16px',
      fontFamily: 'Anton, sans-serif', fontSize: 15, letterSpacing: '0.5px',
      boxShadow: `0 0 18px ${c}44`,
    }}>
      <span style={{ width: 9, height: 9, borderRadius: 9, background: c, boxShadow: `0 0 8px ${c}` }} />
      {V2_typeLabel(type)}
    </span>
  );
}

function V2_TimerRing({ total, remaining, color, paused }) {
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
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{
          fontFamily: 'Anton, sans-serif', fontSize: 76, lineHeight: 0.9, color: V2_PALETTE.ink,
          fontVariantNumeric: 'tabular-nums',
          animation: low && !paused ? 'v2Pulse 1s infinite' : 'none',
          textShadow: low ? `0 0 18px ${V2_PALETTE.danger}` : 'none',
        }}>{label}</span>
        <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 11, letterSpacing: '2px', color: V2_PALETTE.dim, marginTop: 4 }}>
          {paused ? 'PAUSE' : remaining <= 0 ? 'ZEIT UM!' : 'SEKUNDEN'}
        </span>
      </div>
    </div>
  );
}

function V2_Flash({ color, text, onDone }) {
  useEffectV(() => {
    try { navigator.vibrate && navigator.vibrate([40, 30, 90]); } catch (e) {}
    const t = setTimeout(onDone, 720);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200, background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'v2Flash .72s ease-out forwards', textAlign: 'center',
    }}>
      <span style={{
        fontFamily: 'Anton, sans-serif', fontSize: 56, color: '#0a0a0c', lineHeight: 0.9,
        transform: 'rotate(-4deg)', padding: '0 20px',
      }}>{text}</span>
    </div>
  );
}

// Tappable Player-Chip — für pick_from_all-Auflösung & Setup-Liste.
function V2_PlayerChip({ name, points, picked, accent = V2_PALETTE.ink, onClick, badge }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 8,
      border: picked ? `2px solid ${accent}` : `1.5px solid #2c2c33`,
      background: picked ? `${accent}26` : '#141417',
      color: V2_PALETTE.ink, borderRadius: 12, padding: '10px 12px',
      fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: 15,
      cursor: 'pointer', textAlign: 'left',
      boxShadow: picked ? `0 0 14px ${accent}55` : 'none',
      transition: 'all .12s ease',
    }}>
      {badge && <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 13, color: accent, width: 22, textAlign: 'center' }}>{badge}</span>}
      <span style={{ flex: 1 }}>{name}</span>
      {typeof points === 'number' && (
        <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 16, color: picked ? accent : V2_PALETTE.dim, minWidth: 22, textAlign: 'right' }}>{points}</span>
      )}
    </button>
  );
}

Object.assign(window, {
  V2_PALETTE, V2_typeColor, V2_typeLabel, V2_typeTag, V2_shade,
  V2_BigButton, V2_Sticker, V2_HazardBar, V2_TypeChip, V2_TimerRing, V2_Flash, V2_PlayerChip,
});
