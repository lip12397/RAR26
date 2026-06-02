// v2-screens-setup.jsx — Start + Setup für RUDEL v2 (keine Teams).
const { useState: useStateVS, useRef: useRefVS } = React;

function V2_StartScreen({ onStart, hasGame, onContinue }) {
  const T = V2_THEME;
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      padding: '64px 24px 40px', position: 'relative', overflow: 'hidden',
    }}>
      <V2_HazardBar color={V2_PALETTE.match} style={{ position: 'absolute', top: 0, left: 0 }} />
      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <V2_Sticker color={V2_PALETTE.rudel} rotate={-3}>{T.festival} {T.year}</V2_Sticker>
        <V2_Sticker color={V2_PALETTE.squad} rotate={2}>{T.edition}</V2_Sticker>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div style={{
            fontFamily: 'Anton, sans-serif', fontSize: 132, lineHeight: 0.82, color: V2_PALETTE.ink,
            letterSpacing: '-2px', textShadow: `6px 6px 0 ${V2_PALETTE.match}, 11px 11px 0 ${V2_PALETTE.squad}`,
            transform: 'rotate(-2deg)',
          }}>RU<br/>DEL</div>
          <span style={{
            position: 'absolute', top: -14, right: -38,
            fontFamily: 'Anton, sans-serif', fontSize: 64, lineHeight: 0.85, letterSpacing: '-1px',
            color: V2_PALETTE.rudel, transform: 'rotate(14deg)',
            textShadow: `3px 3px 0 ${V2_PALETTE.bg}, 6px 6px 0 ${V2_PALETTE.squad}`,
            pointerEvents: 'none',
          }}>V2</span>
        </div>
        <div style={{ marginTop: 22, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 15, letterSpacing: '3px', color: V2_PALETTE.ink, textTransform: 'uppercase' }}>
          Match · Squad · Rudel
        </div>
        <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 600, fontSize: 13, letterSpacing: '0.3px', color: V2_PALETTE.dim, marginTop: 8, maxWidth: 290, lineHeight: 1.45 }}>
          Aus Fremden eine Clique machen. Drei Spielarten, individuelle Punkte, am Ende ein:e MVP.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {hasGame && (
          <V2_BigButton color={V2_PALETTE.rudel} onClick={onContinue} sub="SPIEL LÄUFT NOCH">WEITERSPIELEN</V2_BigButton>
        )}
        <V2_BigButton color={V2_PALETTE.match} onClick={onStart} sub={hasGame ? 'ALLES ZURÜCKSETZEN' : `${T.dates} · ${T.place}`}>
          {hasGame ? 'NEUES SPIEL' : "LOS GEHT'S"}
        </V2_BigButton>
      </div>
    </div>
  );
}

function V2_SetupScreen({ players, setPlayers, onBack, onStartGame }) {
  const [val, setVal] = useStateVS('');
  const inputRef = useRefVS(null);
  const listRef = useRefVS(null);

  const add = () => {
    const name = val.trim();
    if (!name) return;
    const id = (players.reduce((m, p) => Math.max(m, p.id), 0) || 0) + 1;
    setPlayers([...players, { id, name }]);
    setVal('');
    inputRef.current && inputRef.current.focus();
    setTimeout(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, 30);
  };
  const remove = id => setPlayers(players.filter(p => p.id !== id));
  const enough = players.length >= 4;
  const needed = Math.max(0, 4 - players.length);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '60px 0 0' }}>
      <div style={{ padding: '0 22px 14px' }}>
        <button onClick={onBack} style={V2_backBtn}>← ZURÜCK</button>
        <h1 style={V2_h1}>WER IST<br/>IM RUDEL?</h1>
        <div style={V2_sub}>
          {players.length} {players.length === 1 ? 'Person' : 'Leute'}
          {' · min. 4 · ideal 10–20'}
        </div>
      </div>

      <div style={{ padding: '0 22px 12px', display: 'flex', gap: 10 }}>
        <input ref={inputRef} value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Name eintippen…" style={V2_input} />
        <button onClick={add} style={V2_addBtn}>+</button>
      </div>

      <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '4px 22px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {players.length === 0 && (
          <div style={{ color: V2_PALETTE.dim, fontFamily: 'Archivo, sans-serif', fontSize: 14, textAlign: 'center', marginTop: 30, lineHeight: 1.5 }}>
            Noch leer. Tippt alle Namen ein,<br/>die heute im Camp sind.
          </div>
        )}
        {players.map((p, i) => (
          <div key={p.id} style={V2_row}>
            <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 13, color: V2_PALETTE.dim, width: 24 }}>{String(i + 1).padStart(2, '0')}</span>
            <span style={{ flex: 1, fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: 19, color: V2_PALETTE.ink }}>{p.name}</span>
            <button onClick={() => remove(p.id)} style={V2_delBtn}>✕</button>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 22px 36px', background: 'linear-gradient(transparent, #0a0a0c 30%)' }}>
        <V2_BigButton color={V2_PALETTE.match} disabled={!enough} onClick={onStartGame}
          sub={enough ? 'ERSTE KARTE ZIEHEN' : `NOCH ${needed} ${needed === 1 ? 'PERSON' : 'LEUTE'}`}>
          SPIEL STARTEN
        </V2_BigButton>
      </div>
    </div>
  );
}

// gemeinsame Styles (V2_ präfixiert)
const V2_h1 = { fontFamily: 'Anton, sans-serif', fontSize: 40, lineHeight: 0.92, color: V2_PALETTE.ink, margin: '6px 0 4px', letterSpacing: '-0.5px' };
const V2_sub = { fontFamily: 'Archivo, sans-serif', fontWeight: 600, fontSize: 13, color: V2_PALETTE.dim };
const V2_backBtn = { background: 'none', border: 'none', color: V2_PALETTE.dim, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 12, letterSpacing: '1px', cursor: 'pointer', padding: 0 };
const V2_input = { flex: 1, background: '#1a1a1f', border: '2px solid #2c2c33', borderRadius: 13, padding: '15px 16px', color: V2_PALETTE.ink, fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: 17, outline: 'none' };
const V2_addBtn = { width: 56, flexShrink: 0, background: V2_PALETTE.squad, color: '#0a0a0c', border: 'none', borderRadius: 13, fontFamily: 'Anton, sans-serif', fontSize: 30, cursor: 'pointer', boxShadow: `0 4px 0 ${V2_shade(V2_PALETTE.squad)}` };
const V2_row = { display: 'flex', alignItems: 'center', gap: 12, background: '#141417', border: '1px solid #232329', borderRadius: 13, padding: '12px 14px' };
const V2_delBtn = { width: 38, height: 38, flexShrink: 0, background: 'none', border: '1px solid #2c2c33', borderRadius: 10, color: V2_PALETTE.dim, fontSize: 15, cursor: 'pointer' };
const V2_skipLink = { background: 'none', border: 'none', color: V2_PALETTE.dim, fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer', padding: '8px', textDecoration: 'underline', textUnderlineOffset: '3px' };

Object.assign(window, { V2_StartScreen, V2_SetupScreen, V2_h1, V2_sub, V2_backBtn, V2_skipLink });
