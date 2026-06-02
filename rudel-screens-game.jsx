// rudel-screens-game.jsx — HubScreen, CardScreen, ScoreScreen
const { useState: useStateG, useEffect: useEffectG, useRef: useRefG } = React;

// kompaktes Punkte-Band (immer sichtbar), antippbar → Punktestand
function ScoreBand({ scores, onOpen }) {
  const lead = scores.A === scores.B ? null : scores.A > scores.B ? 'A' : 'B';
  const cell = (t) => (
    <div style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
      <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 11, letterSpacing: '2px', color: teamColor(t), opacity: lead && lead !== t ? 0.5 : 1 }}>
        TEAM {t}{lead === t ? ' ▲' : ''}
      </div>
      <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 38, lineHeight: 0.9, color: lead === t ? teamColor(t) : PALETTE.ink, textShadow: lead === t ? `0 0 16px ${teamColor(t)}99` : 'none' }}>{scores[t]}</div>
    </div>
  );
  return (
    <button onClick={onOpen} style={{
      width: '100%', background: '#141417', border: '1px solid #232329', borderRadius: 16,
      padding: '12px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center',
    }}>
      {cell('A')}
      <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 16, color: PALETTE.dim, padding: '0 4px' }}>VS</span>
      {cell('B')}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// HUB — „Nächste Runde" ziehen
// ─────────────────────────────────────────────────────────────
function HubScreen({ scores, round, nextType, onDraw, onScore, onQuit }) {
  const isMatch = nextType === 'match';
  const c = isMatch ? PALETTE.match : PALETTE.bluff;
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '60px 22px 36px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button onClick={onQuit} style={{ background: 'none', border: 'none', color: PALETTE.dim, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 12, letterSpacing: '1px', cursor: 'pointer', padding: 0 }}>RUDEL ✕</button>
        <Sticker color={PALETTE.B} rotate={3}>{RUDEL_THEME.festival} {RUDEL_THEME.year}</Sticker>
      </div>

      <ScoreBand scores={scores} onOpen={onScore} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 13, letterSpacing: '3px', color: PALETTE.dim }}>RUNDE</div>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 96, lineHeight: 0.85, color: PALETTE.ink }}>{String(round + 1).padStart(2, '0')}</div>
        <div style={{
          marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 8,
          border: `2px solid ${c}`, color: c, borderRadius: 999, padding: '8px 16px',
          fontFamily: 'Anton, sans-serif', fontSize: 15, letterSpacing: '0.5px',
          boxShadow: `0 0 18px ${c}44`,
        }}>
          <span style={{ width: 9, height: 9, borderRadius: 9, background: c, boxShadow: `0 0 8px ${c}` }} />
          {isMatch ? 'MATCH & MISSION' : 'TEAM-BLUFF'}
        </div>
      </div>

      <BigButton color={c} onClick={onDraw} sub={isMatch ? 'PAAR WIRD AUSGELOST' : 'TEAM GEGEN TEAM'}>
        NÄCHSTE RUNDE
      </BigButton>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SPIELKARTE — Vollbild, Timer, ein Hauptbutton
// ─────────────────────────────────────────────────────────────
function CardScreen({ current, nameOf, teamOfId, onResolve, onSkipCard }) {
  const { card, group, actingTeam, guessTeam } = current;
  const isMatch = card.type === 'match';
  const accent = isMatch ? PALETTE.match : PALETTE.bluff;
  const [phase, setPhase] = useStateG('brief'); // brief | run | resolve
  const [remaining, setRemaining] = useStateG(card.timer || 0);
  const [running, setRunning] = useStateG(false);

  useEffectG(() => {
    if (phase !== 'run' || !running) return;
    if (remaining <= 0) return;
    const t = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(t);
          try { navigator.vibrate && navigator.vibrate([60, 40, 60, 40, 120]); } catch (e) {}
          setRunning(false);
          setTimeout(() => setPhase('resolve'), 120);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, running]);

  const startTimer = () => { setPhase('run'); setRunning(true); };
  const toResolve = () => { setRunning(false); setPhase('resolve'); };

  // header band (Akzentfarbe, dunkler Text)
  const header = (
    <div style={{ background: accent, padding: '16px 22px 14px', position: 'relative' }}>
      <HazardBar color="#0a0a0c" height={6} style={{ position: 'absolute', top: 0, left: 0, opacity: 0.25 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 13, letterSpacing: '2px', color: accent, background: '#0a0a0c', padding: '3px 9px', borderRadius: 5 }}>
          {isMatch ? '◆ MATCH & MISSION' : '✦ TEAM-BLUFF'}
        </span>
        <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 13, color: '#0a0a0c', opacity: 0.7 }}>#{String(card.id).padStart(2, '0')}</span>
      </div>
      <h1 style={{ fontFamily: 'Anton, sans-serif', fontSize: 36, lineHeight: 0.92, color: '#0a0a0c', margin: '10px 0 0', letterSpacing: '-0.5px' }}>{card.title}</h1>
    </div>
  );

  // Wer ist dran
  const players = (
    <div style={{ padding: '4px 22px' }}>
      {isMatch ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {group.map((id, i) => (
            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 13, height: 13, borderRadius: 4, background: teamColor(teamOfId(id)), boxShadow: `0 0 10px ${teamColor(teamOfId(id))}`, flexShrink: 0 }} />
              <span style={{ fontFamily: 'Anton, sans-serif', fontSize: group.length > 2 ? 32 : 40, lineHeight: 0.95, color: PALETTE.ink, wordBreak: 'break-word' }}>{nameOf(id)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 10 }}>
          <div style={{ flex: 1, border: `2px solid ${teamColor(actingTeam)}`, borderRadius: 12, padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 10, letterSpacing: '1.5px', color: PALETTE.dim }}>MACHT</div>
            <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 30, color: teamColor(actingTeam) }}>TEAM {actingTeam}</div>
          </div>
          <div style={{ flex: 1, border: `2px solid ${teamColor(guessTeam)}`, borderRadius: 12, padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 10, letterSpacing: '1.5px', color: PALETTE.dim }}>RÄT</div>
            <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 30, color: teamColor(guessTeam) }}>TEAM {guessTeam}</div>
          </div>
        </div>
      )}
    </div>
  );

  const mission = (
    <p style={{ padding: '0 22px', margin: '10px 0 0', fontFamily: 'Archivo, sans-serif', fontWeight: 600, fontSize: 17, lineHeight: 1.35, color: PALETTE.ink, textWrap: 'pretty' }}>
      {card.text}
    </p>
  );

  // ── Aktionsbereich je Phase ──
  let action;
  if (phase === 'brief') {
    action = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {card.timer ? (
          <BigButton color={accent} onClick={startTimer} sub={`${card.timer} SEKUNDEN`}>TIMER STARTEN ▶</BigButton>
        ) : (
          <BigButton color={accent} onClick={() => setPhase('resolve')} sub="KEIN TIMER">WEITER →</BigButton>
        )}
        <button onClick={onSkipCard} style={skipLink}>Karte überspringen</button>
      </div>
    );
  } else if (phase === 'run') {
    action = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={() => setRunning(r => !r)} style={{ ...skipLink, fontSize: 14 }}>{running ? '❚❚ Pause' : '▶ Weiter'}</button>
        <BigButton color={accent} onClick={toResolve} sub="ZEIT EGAL – JETZT WERTEN">AUFLÖSEN →</BigButton>
      </div>
    );
  } else { // resolve
    if (isMatch) {
      const teamsRep = [...new Set(group.map(teamOfId))];
      const note = teamsRep.length > 1 ? `+1 für Team ${teamsRep.join(' & Team ')}` : `+1 für Team ${teamsRep[0]}`;
      action = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <BigButton color={PALETTE.bluff} onClick={() => onResolve(
            teamsRep.includes('A') ? 1 : 0, teamsRep.includes('B') ? 1 : 0,
            { text: 'GESCHAFFT!', color: PALETTE.bluff })} sub={note}>
            GESCHAFFT ✓
          </BigButton>
          <button onClick={() => onResolve(0, 0, { text: 'SCHADE…', color: PALETTE.danger })} style={skipLink}>Nicht geschafft</button>
        </div>
      );
    } else {
      action = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <BigButton style={{ flex: 1, padding: '18px 8px' }} color={teamColor(guessTeam)} onClick={() => onResolve(
              guessTeam === 'A' ? 2 : 0, guessTeam === 'B' ? 2 : 0,
              { text: 'RICHTIG GERATEN!', color: teamColor(guessTeam) })} sub={`TEAM ${guessTeam} +2`}>
              GERATEN
            </BigButton>
            <BigButton style={{ flex: 1, padding: '18px 8px' }} color={teamColor(actingTeam)} onClick={() => onResolve(
              actingTeam === 'A' ? 2 : 0, actingTeam === 'B' ? 2 : 0,
              { text: 'GEBLUFFT!', color: teamColor(actingTeam) })} sub={`TEAM ${actingTeam} +2`}>
              GEBLUFFT
            </BigButton>
          </div>
          <button onClick={() => onResolve(0, 0, { text: 'KEIN PUNKT', color: PALETTE.dim })} style={skipLink}>Kein Punkt</button>
        </div>
      );
    }
  }

  const showTimer = card.timer && phase !== 'resolve';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', paddingTop: 44, background: PALETTE.bg }}>
      {header}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '14px 0 4px', overflowY: 'auto' }}>
        <div>
          {players}
          {mission}
        </div>
        {showTimer && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
            <TimerRing total={card.timer} remaining={remaining} color={accent} paused={!running && phase === 'run'} />
          </div>
        )}
      </div>
      <div style={{ padding: '8px 22px 34px' }}>{action}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PUNKTESTAND
// ─────────────────────────────────────────────────────────────
function ScoreScreen({ scores, round, onBack, onNext }) {
  const lead = scores.A === scores.B ? null : scores.A > scores.B ? 'A' : 'B';
  const diff = Math.abs(scores.A - scores.B);
  const big = (t) => {
    const win = lead === t;
    return (
      <div style={{
        flex: 1, borderRadius: 20, padding: '26px 12px', textAlign: 'center',
        background: win ? teamColor(t) : '#141417',
        border: win ? 'none' : `2px solid ${teamColor(t)}55`,
        boxShadow: win ? `0 0 40px ${teamColor(t)}55` : 'none',
        transform: win ? 'scale(1.02)' : 'none',
      }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 20, letterSpacing: '1px', color: win ? '#0a0a0c' : teamColor(t) }}>
          {win ? '★ ' : ''}TEAM {t}
        </div>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 110, lineHeight: 0.82, color: win ? '#0a0a0c' : PALETTE.ink, margin: '6px 0' }}>{scores[t]}</div>
        <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 11, letterSpacing: '1.5px', color: win ? 'rgba(10,10,12,0.6)' : PALETTE.dim }}>
          {win ? `FÜHRT MIT ${diff}` : lead ? `${diff} ZURÜCK` : 'GLEICHSTAND'}
        </div>
      </div>
    );
  };
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '60px 22px 36px' }}>
      <button onClick={onBack} style={backBtn}>← ZURÜCK</button>
      <h1 style={{ ...h1Style, fontSize: 44 }}>PUNKTE<br/>STAND</h1>
      <div style={{ ...subStyle, marginBottom: 18 }}>Nach {round} {round === 1 ? 'Runde' : 'Runden'}</div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 14 }}>
        {big('A')}
        {big('B')}
      </div>
      <div style={{ marginTop: 18 }}>
        <BigButton color={PALETTE.ink} onClick={onNext} sub="ZURÜCK INS SPIEL">NÄCHSTE RUNDE</BigButton>
      </div>
    </div>
  );
}

const skipLink = { background: 'none', border: 'none', color: PALETTE.dim, fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer', padding: '8px', textDecoration: 'underline', textUnderlineOffset: '3px' };

Object.assign(window, { HubScreen, CardScreen, ScoreScreen });
