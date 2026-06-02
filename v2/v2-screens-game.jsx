// v2-screens-game.jsx — Hub, Karte (3 Resolve-Modi), Leaderboard
const { useState: useStateVG, useEffect: useEffectVG } = React;

// Top-3-Leiste: zeigt aktuelle MVPs · antippbar → Leaderboard
function V2_MvpBar({ players, scores, onOpen }) {
  const ranked = players.map(p => ({ ...p, pts: scores[p.id] || 0 }))
    .sort((a, b) => b.pts - a.pts).slice(0, 3);
  const medal = ['🥇', '🥈', '🥉'];
  return (
    <button onClick={onOpen} style={{
      width: '100%', background: '#141417', border: '1px solid #232329', borderRadius: 16,
      padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 11, letterSpacing: '2px', color: V2_PALETTE.dim, writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>MVP</span>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {ranked.length === 0 && (
          <div style={{ fontFamily: 'Archivo, sans-serif', fontSize: 12, color: V2_PALETTE.dim, padding: '6px 0', textAlign: 'center' }}>noch keine Punkte</div>
        )}
        {ranked.map((p, i) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>{medal[i]}</span>
            <span style={{ flex: 1, fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: 14, color: V2_PALETTE.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
            <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 18, color: i === 0 ? V2_PALETTE.gold : V2_PALETTE.ink }}>{p.pts}</span>
          </div>
        ))}
      </div>
      <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 11, letterSpacing: '1.5px', color: V2_PALETTE.dim }}>ALLE ›</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// HUB
// ─────────────────────────────────────────────────────────────
function V2_HubScreen({ players, scores, round, nextType, onDraw, onLeaderboard, onQuit }) {
  const c = V2_typeColor(nextType);
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '60px 22px 36px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button onClick={onQuit} style={{ background: 'none', border: 'none', color: V2_PALETTE.dim, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 12, letterSpacing: '1px', cursor: 'pointer', padding: 0 }}>RUDEL ✕</button>
        <V2_Sticker color={V2_PALETTE.rudel} rotate={3}>{V2_THEME.festival} {V2_THEME.year}</V2_Sticker>
      </div>

      <V2_MvpBar players={players} scores={scores} onOpen={onLeaderboard} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 13, letterSpacing: '3px', color: V2_PALETTE.dim }}>RUNDE</div>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 96, lineHeight: 0.85, color: V2_PALETTE.ink }}>{String(round + 1).padStart(2, '0')}</div>
        <div style={{ marginTop: 14 }}>
          <V2_TypeChip type={nextType} />
        </div>
      </div>

      <V2_BigButton color={c} onClick={onDraw} sub={
        nextType === 'match' ? 'PAAR WIRD AUSGELOST' :
        nextType === 'squad' ? 'SQUAD WIRD AUSGELOST' :
        'ALLE SPIELEN MIT'
      }>NÄCHSTE RUNDE</V2_BigButton>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SPIELKARTE
// ─────────────────────────────────────────────────────────────
function V2_CardScreen({ current, players, scores, nameOf, onResolve, onSkipCard }) {
  const { card, group } = current;
  const accent = V2_typeColor(card.type);
  const [phase, setPhase] = useStateVG('brief'); // brief | run | resolve
  const [remaining, setRemaining] = useStateVG(card.timer || 0);
  const [running, setRunning] = useStateVG(false);
  const [picked, setPicked] = useStateVG([]); // ids picked in resolve

  useEffectVG(() => {
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
  const togglePick = id => setPicked(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  // ── Header (Akzent-Band)
  const header = (
    <div style={{ background: accent, padding: '16px 22px 14px', position: 'relative' }}>
      <V2_HazardBar color="#0a0a0c" height={6} style={{ position: 'absolute', top: 0, left: 0, opacity: 0.22 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 13, letterSpacing: '2px', color: accent, background: '#0a0a0c', padding: '3px 9px', borderRadius: 5 }}>
          {V2_typeTag(card.type)}
        </span>
        <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 13, color: '#0a0a0c', opacity: 0.7 }}>#{String(card.id).padStart(2, '0')}</span>
      </div>
      <h1 style={{ fontFamily: 'Anton, sans-serif', fontSize: 34, lineHeight: 0.92, color: '#0a0a0c', margin: '10px 0 0', letterSpacing: '-0.5px' }}>{card.title}</h1>
      {card.category && (
        <div style={{ marginTop: 6, display: 'inline-block', fontFamily: 'Anton, sans-serif', fontSize: 12, letterSpacing: '1.5px', color: accent, background: '#0a0a0c', padding: '3px 8px', borderRadius: 4 }}>
          {card.category}
        </div>
      )}
    </div>
  );

  // ── Wer spielt
  let participants;
  if (card.participants === 'pair') {
    participants = (
      <div style={{ padding: '4px 22px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {group.map(id => (
          <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 13, height: 13, borderRadius: 4, background: accent, boxShadow: `0 0 10px ${accent}`, flexShrink: 0 }} />
            <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 40, lineHeight: 0.95, color: V2_PALETTE.ink, wordBreak: 'break-word' }}>{nameOf(id)}</span>
          </div>
        ))}
      </div>
    );
  } else if (card.participants === 'squad') {
    participants = (
      <div style={{ padding: '4px 22px' }}>
        <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 11, letterSpacing: '2px', color: V2_PALETTE.dim, marginBottom: 6 }}>SQUAD · {group.length} LEUTE</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {group.map(id => (
            <span key={id} style={{
              fontFamily: 'Anton, sans-serif', fontSize: 22, color: '#0a0a0c',
              background: accent, padding: '5px 11px', borderRadius: 7,
              boxShadow: `0 3px 0 ${V2_shade(accent)}`,
            }}>{nameOf(id)}</span>
          ))}
        </div>
      </div>
    );
  } else {
    // rudel — alle
    participants = (
      <div style={{ padding: '4px 22px' }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 38, color: accent, lineHeight: 1, textShadow: `0 0 18px ${accent}66` }}>DAS GANZE RUDEL</div>
        <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 12, letterSpacing: '2px', color: V2_PALETTE.dim, marginTop: 4 }}>{group.length} LEUTE GLEICHZEITIG</div>
      </div>
    );
  }

  // ── Mission + optionaler Prompt
  const missionBox = (
    <div style={{ padding: '0 22px', marginTop: 10 }}>
      <p style={{ margin: 0, fontFamily: 'Archivo, sans-serif', fontWeight: 600, fontSize: 16, lineHeight: 1.35, color: V2_PALETTE.ink, textWrap: 'pretty' }}>{card.text}</p>
      {card.prompt && (
        <div style={{
          marginTop: 10, padding: '12px 14px', background: '#1a1a1f',
          borderLeft: `4px solid ${accent}`, borderRadius: 6,
          fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: 16, color: V2_PALETTE.ink,
          textWrap: 'pretty',
        }}>{card.prompt}</div>
      )}
    </div>
  );

  // ── Aktionsbereich
  let action;
  if (phase === 'brief') {
    action = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {card.timer ? (
          <V2_BigButton color={accent} onClick={startTimer} sub={`${card.timer} SEKUNDEN`}>TIMER STARTEN ▶</V2_BigButton>
        ) : (
          <V2_BigButton color={accent} onClick={() => setPhase('resolve')} sub="KEIN TIMER">WEITER →</V2_BigButton>
        )}
        <button onClick={onSkipCard} style={V2_skipLink}>Karte überspringen</button>
      </div>
    );
  } else if (phase === 'run') {
    action = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={() => setRunning(r => !r)} style={{ ...V2_skipLink, fontSize: 14 }}>{running ? '❚❚ Pause' : '▶ Weiter'}</button>
        <V2_BigButton color={accent} onClick={toResolve} sub="ZEIT EGAL – JETZT WERTEN">AUFLÖSEN →</V2_BigButton>
      </div>
    );
  } else if (card.resolve === 'discuss') {
    // Hot Take / Kennenlernen / Chaos → keine Punkte, nur weiter.
    const sub = card.category && card.category.includes('HOT TAKE') ? 'KEINE PUNKTE · NUR DISKUSSION'
              : card.category && card.category.includes('KENNENLERNEN') ? 'KEINE PUNKTE · EINFACH REDEN'
              : 'KEINE PUNKTE · EINFACH WEITER';
    action = (
      <V2_BigButton color={accent} onClick={() => onResolve([], 0, { text: 'WEITER!', color: accent })} sub={sub}>
        NÄCHSTE KARTE →
      </V2_BigButton>
    );
  } else if (card.resolve === 'vote_in_group') {
    action = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 22, color: V2_PALETTE.ink, marginBottom: 2 }}>WER GEWINNT?</div>
        {group.map(id => (
          <button key={id} onClick={() => onResolve([id], V2_POINTS.vote, { text: `${nameOf(id)} +${V2_POINTS.vote}!`, color: accent })} style={V2_voteBtn(accent)}>
            <span style={{ flex: 1, textAlign: 'left' }}>{nameOf(id)}</span>
            <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 16 }}>+{V2_POINTS.vote}</span>
          </button>
        ))}
        <button onClick={() => onResolve([], 0, { text: 'UNENTSCHIEDEN', color: V2_PALETTE.dim })} style={V2_skipLink}>Unentschieden</button>
      </div>
    );
  } else if (card.resolve === 'pick_from_all') {
    const allPlayers = players;
    action = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 22, color: V2_PALETTE.ink }}>AUF WEN ZEIGT DAS RUDEL?</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
          {allPlayers.map(p => (
            <V2_PlayerChip key={p.id} name={p.name} accent={accent}
              picked={picked.includes(p.id)} onClick={() => togglePick(p.id)} />
          ))}
        </div>
        <V2_BigButton color={accent} disabled={picked.length === 0}
          onClick={() => onResolve(picked, V2_POINTS.pick, {
            text: picked.length === 1 ? `${nameOf(picked[0])} +${V2_POINTS.pick}!` : `${picked.length}× +${V2_POINTS.pick}!`,
            color: accent,
          })}
          sub={picked.length ? `${picked.length} GEWÄHLT · JE +${V2_POINTS.pick}` : 'Tippt mind. eine Person an'}>
          BESTÄTIGEN ✓
        </V2_BigButton>
      </div>
    );
  } else {
    // success
    const subText = card.participants === 'pair' ? `JE +${V2_POINTS.success} FÜRS PAAR` :
                    card.participants === 'squad' ? `JE +${V2_POINTS.success} FÜRS SQUAD` :
                    `JE +${V2_POINTS.success} FÜRS RUDEL`;
    action = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <V2_BigButton color={V2_PALETTE.rudel} onClick={() => onResolve(group, V2_POINTS.success, { text: 'GESCHAFFT!', color: V2_PALETTE.rudel })} sub={subText}>
          GESCHAFFT ✓
        </V2_BigButton>
        <button onClick={() => onResolve([], 0, { text: 'SCHADE…', color: V2_PALETTE.danger })} style={V2_skipLink}>Nicht geschafft</button>
      </div>
    );
  }

  const showTimer = card.timer && phase !== 'resolve';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', paddingTop: 44, background: V2_PALETTE.bg }}>
      {header}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: phase === 'resolve' ? 'flex-start' : 'space-between', padding: '14px 0 4px', overflowY: 'auto' }}>
        <div>
          {participants}
          {missionBox}
        </div>
        {showTimer && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
            <V2_TimerRing total={card.timer} remaining={remaining} color={accent} paused={!running && phase === 'run'} />
          </div>
        )}
      </div>
      <div style={{ padding: '8px 22px 34px' }}>{action}</div>
    </div>
  );
}

const V2_voteBtn = accent => ({
  display: 'flex', alignItems: 'center', gap: 10,
  background: `${accent}1a`, border: `2px solid ${accent}`,
  color: V2_PALETTE.ink, fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: 17,
  padding: '14px 16px', borderRadius: 13, cursor: 'pointer', textAlign: 'left',
});

// ─────────────────────────────────────────────────────────────
// LEADERBOARD — MVP-Ranking
// ─────────────────────────────────────────────────────────────
function V2_LeaderboardScreen({ players, scores, round, onBack }) {
  const ranked = players.map(p => ({ ...p, pts: scores[p.id] || 0 }))
    .sort((a, b) => b.pts - a.pts || a.name.localeCompare(b.name));
  const top = ranked[0];
  const rest = ranked.slice(1);
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '60px 22px 36px' }}>
      <button onClick={onBack} style={V2_backBtn}>← ZURÜCK</button>
      <h1 style={{ ...V2_h1, fontSize: 44 }}>RUDEL<br/>MVP</h1>
      <div style={{ ...V2_sub, marginBottom: 18 }}>Nach {round} {round === 1 ? 'Runde' : 'Runden'}</div>

      {top && (
        <div style={{
          background: V2_PALETTE.gold, color: '#0a0a0c', borderRadius: 20,
          padding: '20px 18px', display: 'flex', alignItems: 'center', gap: 14,
          boxShadow: `0 0 40px ${V2_PALETTE.gold}55`,
        }}>
          <span style={{ fontSize: 42 }}>👑</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 10, letterSpacing: '2px', opacity: 0.7 }}>MVP</div>
            <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 34, lineHeight: 1, marginTop: 2, wordBreak: 'break-word' }}>{top.name}</div>
          </div>
          <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 56, lineHeight: 0.85 }}>{top.pts}</div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rest.map((p, i) => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#141417', border: '1px solid #232329', borderRadius: 12,
            padding: '11px 14px',
          }}>
            <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 16, color: V2_PALETTE.dim, width: 28 }}>
              {i < 2 ? medals[i + 1] : `#${i + 2}`}
            </span>
            <span style={{ flex: 1, fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: 17, color: V2_PALETTE.ink }}>{p.name}</span>
            <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 24, color: V2_PALETTE.ink }}>{p.pts}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14 }}>
        <V2_BigButton color={V2_PALETTE.match} onClick={onBack} sub="ZURÜCK INS SPIEL">WEITER ZOCKEN</V2_BigButton>
      </div>
    </div>
  );
}

Object.assign(window, { V2_HubScreen, V2_CardScreen, V2_LeaderboardScreen });
