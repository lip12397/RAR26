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

function V2_SetupScreen({ players, setPlayers, onBack, onContinue }) {
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
        <V2_BigButton color={V2_PALETTE.match} disabled={!enough} onClick={onContinue}
          sub={enough ? 'EINSTELLUNGEN WÄHLEN' : `NOCH ${needed} ${needed === 1 ? 'PERSON' : 'LEUTE'}`}>
          WEITER →
        </V2_BigButton>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CONFIG — Länge · Tonalität · Drinks · Twist
// ─────────────────────────────────────────────────────────────
function V2_ConfigScreen({ config, setConfig, onBack, onStartGame }) {
  const update = patch => setConfig({ ...config, ...patch });

  const Seg = ({ value, options, onChange, accent = V2_PALETTE.match }) => (
    <div style={{ display: 'flex', gap: 8, background: '#141417', padding: 4, borderRadius: 14, border: '1px solid #232329' }}>
      {options.map(o => {
        const sel = value === o.value;
        return (
          <button key={o.value} onClick={() => onChange(o.value)} style={{
            flex: 1, border: 'none', borderRadius: 11, padding: '12px 6px', cursor: 'pointer',
            background: sel ? accent : 'transparent',
            color: sel ? '#0a0a0c' : V2_PALETTE.ink,
            fontFamily: 'Anton, sans-serif', fontSize: 16, letterSpacing: '0.5px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            boxShadow: sel ? `0 3px 0 ${V2_shade(accent)}` : 'none',
            transition: 'all .12s',
          }}>
            <span>{o.label}</span>
            {o.sub && <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: 9, letterSpacing: '1px', opacity: sel ? 0.75 : 0.5 }}>{o.sub}</span>}
          </button>
        );
      })}
    </div>
  );

  const Section = ({ label, hint, children }) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
        <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 18, color: V2_PALETTE.ink, letterSpacing: '0.5px' }}>{label}</span>
        {hint && <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 600, fontSize: 12, color: V2_PALETTE.dim }}>{hint}</span>}
      </div>
      {children}
    </div>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '60px 22px 36px' }}>
      <button onClick={onBack} style={V2_backBtn}>← NAMEN</button>
      <h1 style={V2_h1}>WIE WOLLT<br/>IHR'S?</h1>
      <div style={{ ...V2_sub, marginBottom: 22 }}>4 Schnell-Knöpfe, dann geht's los.</div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Section label="LÄNGE" hint="ungefähr">
          <Seg value={config.length} accent={V2_PALETTE.match} onChange={v => update({ length: v })}
            options={[
              { value: 'short',  label: 'KURZ',   sub: '~20 MIN' },
              { value: 'medium', label: 'MITTEL', sub: '~45 MIN' },
              { value: 'long',   label: 'LANG',   sub: '~75 MIN' },
            ]} />
        </Section>

        <Section label="TONALITÄT">
          <Seg value={config.tone} accent={V2_PALETTE.squad} onChange={v => update({ tone: v })}
            options={[
              { value: 'chill',    label: '🧘 CHILL',    sub: 'REDEN' },
              { value: 'standard', label: '🎉 STANDARD', sub: 'BALANCE' },
              { value: 'wild',     label: '🔥 WILD',     sub: 'CHAOS' },
            ]} />
        </Section>

        <Section label="DRINKS">
          <Seg value={config.drinks ? 'on' : 'off'} accent={V2_PALETTE.rudel} onChange={v => update({ drinks: v === 'on' })}
            options={[
              { value: 'off', label: '💧 OHNE', sub: 'CLEAN' },
              { value: 'on',  label: '🍻 MIT',  sub: 'TRINK-REGELN' },
            ]} />
        </Section>

        <Section label="MODUS" hint="Reihenfolge der Karten-Typen">
          <Seg value={config.mode || 'auto'} accent={V2_PALETTE.match} onChange={v => update({ mode: v })}
            options={[
              { value: 'auto', label: '🔀 AUTO',     sub: 'APP ROTIERT' },
              { value: 'free', label: '🎯 WÄHLBAR', sub: 'SL ENTSCHEIDET' },
            ]} />
        </Section>

        <Section label="TWIST" hint="Spielleitung kann pro Karte einen Modifier anschalten">
          <Seg value={config.twistEnabled ? 'on' : 'off'} accent={V2_PALETTE.gold} onChange={v => update({ twistEnabled: v === 'on' })}
            options={[
              { value: 'off', label: 'AUS' },
              { value: 'on',  label: 'AN'  },
            ]} />
        </Section>
      </div>

      <V2_BigButton color={V2_PALETTE.match} onClick={onStartGame} sub="ERSTE KARTE ZIEHEN">
        SPIEL STARTEN
      </V2_BigButton>
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

Object.assign(window, { V2_StartScreen, V2_SetupScreen, V2_ConfigScreen, V2_h1, V2_sub, V2_backBtn, V2_skipLink });
