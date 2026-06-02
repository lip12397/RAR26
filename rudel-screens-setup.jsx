// rudel-screens-setup.jsx — StartScreen & SetupScreen
const { useState: useStateS, useRef: useRefS } = React;

// ─────────────────────────────────────────────────────────────
// START — Poster. Logo, Tagline, ein Button.
// ─────────────────────────────────────────────────────────────
function StartScreen({ onStart, hasGame, onContinue }) {
  const T = RUDEL_THEME;
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      padding: '64px 24px 40px', position: 'relative', overflow: 'hidden',
    }}>
      <HazardBar color={PALETTE.match} style={{ position: 'absolute', top: 0, left: 0 }} />
      {/* Festival-Kopf */}
      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Sticker color={PALETTE.B} rotate={-3}>{T.festival} {T.year}</Sticker>
        <Sticker color={PALETTE.bluff} rotate={2}>{T.edition}</Sticker>
      </div>

      {/* Logo */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{
          fontFamily: 'Anton, sans-serif', fontSize: 132, lineHeight: 0.82, color: PALETTE.ink,
          letterSpacing: '-2px', textShadow: `6px 6px 0 ${PALETTE.match}, 11px 11px 0 ${PALETTE.A}`,
          transform: 'rotate(-2deg)',
        }}>RU<br/>DEL</div>
        <div style={{
          marginTop: 22, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 15,
          letterSpacing: '3px', color: PALETTE.ink, textTransform: 'uppercase',
        }}>Match &amp; Mission</div>
        <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 600, fontSize: 13, letterSpacing: '1px', color: PALETTE.dim, marginTop: 6, maxWidth: 280 }}>
          14 Fremde. 2 Teams. Eine Nacht am {T.place}. Aus Camping-Nachbarn wird ein Rudel.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {hasGame && (
          <BigButton color={PALETTE.bluff} onClick={onContinue} sub="SPIEL LÄUFT NOCH">WEITERSPIELEN</BigButton>
        )}
        <BigButton color={PALETTE.match} onClick={onStart} sub={hasGame ? 'ALLES ZURÜCKSETZEN' : `${T.dates} · ${T.place}`}>
          {hasGame ? 'NEUES SPIEL' : "LOS GEHT'S"}
        </BigButton>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SETUP — Namen eintippen + Teams auslosen (anpassbar)
// ─────────────────────────────────────────────────────────────
function SetupScreen({ players, setPlayers, teams, setTeams, drinks, setDrinks, onBack, onStartGame }) {
  const [phase, setPhase] = useStateS('names'); // 'names' | 'teams'
  const [val, setVal] = useStateS('');
  const inputRef = useRefS(null);
  const listRef = useRefS(null);

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
  const rollTeams = () => { setTeams(autoTeams(players.map(p => p.id))); setPhase('teams'); };
  const swap = id => {
    const inA = teams.A.includes(id);
    setTeams({
      A: inA ? teams.A.filter(x => x !== id) : [...teams.A, id],
      B: inA ? [...teams.B, id] : teams.B.filter(x => x !== id),
    });
  };
  const nameOf = id => (players.find(p => p.id === id) || {}).name || '?';
  const enough = players.length >= 4;

  // ─── Phase: NAMEN ───
  if (phase === 'names') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '60px 0 0' }}>
        <div style={{ padding: '0 22px 14px' }}>
          <button onClick={onBack} style={backBtn}>← ZURÜCK</button>
          <h1 style={h1Style}>WER IST<br/>AM START?</h1>
          <div style={subStyle}>{players.length} {players.length === 1 ? 'Person' : 'Leute'} · min. 4</div>
        </div>

        {/* Eingabe */}
        <div style={{ padding: '0 22px 12px', display: 'flex', gap: 10 }}>
          <input ref={inputRef} value={val} onChange={e => setVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
            placeholder="Name eintippen…" style={inputStyle} />
          <button onClick={add} style={addBtn}>+</button>
        </div>

        {/* Liste */}
        <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '4px 22px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {players.length === 0 && (
            <div style={{ color: PALETTE.dim, fontFamily: 'Archivo, sans-serif', fontSize: 14, textAlign: 'center', marginTop: 30, lineHeight: 1.5 }}>
              Noch leer. Tippt alle Namen ein,<br/>die heute im Camp sind.
            </div>
          )}
          {players.map((p, i) => (
            <div key={p.id} style={rowStyle}>
              <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 13, color: PALETTE.dim, width: 24 }}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{ flex: 1, fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: 19, color: PALETTE.ink }}>{p.name}</span>
              <button onClick={() => remove(p.id)} style={delBtn}>✕</button>
            </div>
          ))}
        </div>

        <div style={{ padding: '10px 22px 36px', background: 'linear-gradient(transparent, #0a0a0c 30%)' }}>
          <BigButton color={enough ? PALETTE.B : '#2a2a2e'} textColor={enough ? '#0a0a0c' : PALETTE.dim}
            onClick={() => enough && rollTeams()} sub={enough ? 'AUTOMATISCH IN 2 TEAMS' : 'NOCH ' + (4 - players.length) + ' LEUTE'}>
            TEAMS AUSLOSEN
          </BigButton>
        </div>
      </div>
    );
  }

  // ─── Phase: TEAMS ───
  const col = (team) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
        <span style={{ width: 14, height: 14, borderRadius: 3, background: teamColor(team), boxShadow: `0 0 10px ${teamColor(team)}` }} />
        <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 22, color: teamColor(team) }}>TEAM {team}</span>
        <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 12, color: PALETTE.dim }}>{teams[team].length}</span>
      </div>
      {teams[team].map(id => (
        <button key={id} onClick={() => swap(id)} style={{
          textAlign: 'left', border: `2px solid ${teamColor(team)}55`, background: `${teamColor(team)}1a`,
          color: PALETTE.ink, borderRadius: 11, padding: '13px 14px', cursor: 'pointer',
          fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: 16, display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
        }}>
          {nameOf(id)}
          <span style={{ fontSize: 11, color: PALETTE.dim, fontWeight: 800, letterSpacing: '0.5px' }}>{team === 'A' ? '→ B' : '← A'}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '60px 0 0' }}>
      <div style={{ padding: '0 22px 10px' }}>
        <button onClick={() => setPhase('names')} style={backBtn}>← NAMEN</button>
        <h1 style={h1Style}>DIE TEAMS</h1>
        <div style={subStyle}>Tippt eine Person an, um sie umzuparken.</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 22px 12px', display: 'flex', gap: 14 }}>
        {col('A')}
        {col('B')}
      </div>
      <div style={{ padding: '10px 22px 36px', display: 'flex', flexDirection: 'column', gap: 12, background: 'linear-gradient(transparent, #0a0a0c 30%)' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 12, letterSpacing: '2px', color: PALETTE.dim }}>DRINKS:</span>
          <button onClick={() => setDrinks(false)} style={{
            background: !drinks ? PALETTE.bluff : 'transparent',
            color: !drinks ? '#0a0a0c' : PALETTE.dim,
            border: `2px solid ${!drinks ? PALETTE.bluff : '#2c2c33'}`,
            fontFamily: 'Anton, sans-serif', fontSize: 13, letterSpacing: '1px',
            padding: '7px 13px', borderRadius: 999, cursor: 'pointer',
          }}>💧 OHNE</button>
          <button onClick={() => setDrinks(true)} style={{
            background: drinks ? PALETTE.B : 'transparent',
            color: drinks ? '#0a0a0c' : PALETTE.dim,
            border: `2px solid ${drinks ? PALETTE.B : '#2c2c33'}`,
            fontFamily: 'Anton, sans-serif', fontSize: 13, letterSpacing: '1px',
            padding: '7px 13px', borderRadius: 999, cursor: 'pointer',
          }}>🍻 MIT</button>
        </div>
        <button onClick={rollTeams} style={reshuffleBtn}>↻ NEU MISCHEN</button>
        <BigButton color={PALETTE.match} onClick={onStartGame} sub="ERSTE KARTE ZIEHEN">SPIEL STARTEN</BigButton>
      </div>
    </div>
  );
}

// styles
const h1Style = { fontFamily: 'Anton, sans-serif', fontSize: 40, lineHeight: 0.92, color: PALETTE.ink, margin: '6px 0 4px', letterSpacing: '-0.5px' };
const subStyle = { fontFamily: 'Archivo, sans-serif', fontWeight: 600, fontSize: 13, color: PALETTE.dim };
const backBtn = { background: 'none', border: 'none', color: PALETTE.dim, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 12, letterSpacing: '1px', cursor: 'pointer', padding: 0 };
const inputStyle = { flex: 1, background: '#1a1a1f', border: '2px solid #2c2c33', borderRadius: 13, padding: '15px 16px', color: PALETTE.ink, fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: 17, outline: 'none' };
const addBtn = { width: 56, flexShrink: 0, background: PALETTE.bluff, color: '#0a0a0c', border: 'none', borderRadius: 13, fontFamily: 'Anton, sans-serif', fontSize: 30, cursor: 'pointer', boxShadow: `0 4px 0 ${shade(PALETTE.bluff)}` };
const rowStyle = { display: 'flex', alignItems: 'center', gap: 12, background: '#141417', border: '1px solid #232329', borderRadius: 13, padding: '12px 14px' };
const delBtn = { width: 38, height: 38, flexShrink: 0, background: 'none', border: '1px solid #2c2c33', borderRadius: 10, color: PALETTE.dim, fontSize: 15, cursor: 'pointer' };
const reshuffleBtn = { background: 'none', border: `2px solid #2c2c33`, color: PALETTE.ink, borderRadius: 13, padding: '13px', fontFamily: 'Anton, sans-serif', fontSize: 17, letterSpacing: '1px', cursor: 'pointer' };

Object.assign(window, { StartScreen, SetupScreen });
