// v2-screens-game.jsx — Hub · Card · Transition · Leaderboard · End/Awards
const { useState: useStateVG, useEffect: useEffectVG } = React;

// kleine Top-3-Leiste
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

// kleine farb-Chip mit Akt + Multiplikator
function V2_AktChip({ akt, multiplier }) {
  const colors = { 1: V2_PALETTE.squad, 2: V2_PALETTE.match, 3: V2_PALETTE.rudel };
  const c = colors[akt] || V2_PALETTE.ink;
  const multTxt = multiplier === 1 ? 'NORMAL' : `× ${String(multiplier).replace('.', ',')} PUNKTE`;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      background: '#141417', border: `2px solid ${c}`, color: c, borderRadius: 999,
      padding: '6px 14px', fontFamily: 'Anton, sans-serif', fontSize: 13, letterSpacing: '1px',
      boxShadow: `0 0 14px ${c}33`,
    }}>
      <span>AKT {akt} · {V2_aktTitle(akt)}</span>
      <span style={{ opacity: 0.6 }}>·</span>
      <span style={{ color: multiplier > 1 ? V2_PALETTE.gold : c }}>{multTxt}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HUB
// ─────────────────────────────────────────────────────────────
function V2_HubScreen({
  players, scores, round, totalRounds, akt, multiplier, nextType,
  mode, twistOn, twistEnabled, onToggleTwist, onSkipAkt,
  onDraw, onLeaderboard, onQuit,
}) {
  const c = V2_typeColor(nextType);
  const remaining = Math.max(0, totalRounds - round);
  const isFree = mode === 'free';
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: isFree ? '50px 22px 28px' : '60px 22px 36px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button onClick={onQuit} style={{ background: 'none', border: 'none', color: V2_PALETTE.dim, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 12, letterSpacing: '1px', cursor: 'pointer', padding: 0 }}>RUDEL ✕</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <V2_Sticker color={V2_PALETTE.rudel} rotate={3}>{V2_THEME.festival} {V2_THEME.year}</V2_Sticker>
          <V2SoundToggle />
        </div>
      </div>

      <V2_MvpBar players={players} scores={scores} onOpen={onLeaderboard} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: isFree ? 4 : 8, minHeight: isFree ? 90 : undefined }}>
        <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 12, letterSpacing: '3px', color: V2_PALETTE.dim }}>
          RUNDE {String(round + 1).padStart(2, '0')} / {totalRounds} · NOCH {remaining}
        </div>
        {!isFree && (
          <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 86, lineHeight: 0.85, color: V2_PALETTE.ink }}>{String(round + 1).padStart(2, '0')}</div>
        )}
        <V2_AktChip akt={akt} multiplier={multiplier} />
        {!isFree && <div style={{ marginTop: 8 }}><V2_TypeChip type={nextType} /></div>}

        {akt < 3 && (
          <button onClick={onSkipAkt} style={{
            marginTop: isFree ? 6 : 10, background: 'none', border: '1.5px dashed #2c2c33',
            color: V2_PALETTE.dim, fontFamily: 'Anton, sans-serif', fontSize: 12,
            letterSpacing: '1.5px', padding: '6px 12px', borderRadius: 999, cursor: 'pointer',
          }}>→ AKT {akt + 1} STARTEN</button>
        )}
      </div>

      {twistEnabled && (
        <button onClick={() => { if (!twistOn) V2_Sound.play('twist'); onToggleTwist(); }} style={{
          alignSelf: 'center', marginBottom: isFree ? 8 : 10,
          background: twistOn ? V2_PALETTE.gold : 'transparent',
          color: twistOn ? '#0a0a0c' : V2_PALETTE.gold,
          border: `2px solid ${V2_PALETTE.gold}`,
          fontFamily: 'Anton, sans-serif', fontSize: isFree ? 13 : 14, letterSpacing: '1.5px',
          padding: isFree ? '6px 16px' : '8px 18px', borderRadius: 999, cursor: 'pointer',
          boxShadow: twistOn ? `0 0 14px ${V2_PALETTE.gold}66` : 'none',
        }}>⚡ TWIST: {twistOn ? 'AN' : 'AUS'}</button>
      )}

      {isFree ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 11, letterSpacing: '2.5px', color: V2_PALETTE.dim, textAlign: 'center' }}>
            WAS WIRD GEZOGEN?
          </div>
          {[
            { t: 'match', label: 'PAAR',         sub: '1 VS 1' },
            { t: 'squad', label: 'SQUAD',        sub: '3–4 LEUTE' },
            { t: 'rudel', label: 'GANZES RUDEL', sub: 'ALLE' },
          ].map(opt => (
            <V2_BigButton key={opt.t} color={V2_typeColor(opt.t)}
              onClick={() => { V2_Sound.play('draw'); onDraw(opt.t); }}
              style={{ padding: '12px 12px' }} labelSize={22}
              sub={opt.sub}>{opt.label}</V2_BigButton>
          ))}
        </div>
      ) : (
        <V2_BigButton color={c} onClick={() => { V2_Sound.play('draw'); onDraw(); }} sub={
          nextType === 'match' ? 'PAAR WIRD AUSGELOST' :
          nextType === 'squad' ? 'SQUAD WIRD AUSGELOST' :
          'ALLE SPIELEN MIT'
        }>NÄCHSTE RUNDE</V2_BigButton>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SPIELKARTE
// ─────────────────────────────────────────────────────────────
function V2_CardScreen({ current, players, scores, config, tonePace, nameOf, onResolve, onSkipCard }) {
  const { card, group } = current;
  const accent = V2_typeColor(card.type);
  const totalTime = card.timer ? Math.max(15, Math.round((card.timer * tonePace) / 5) * 5) : 0;
  const [phase, setPhase] = useStateVG('brief');
  const [remaining, setRemaining] = useStateVG(totalTime);
  const [running, setRunning] = useStateVG(false);
  const [picked, setPicked] = useStateVG([]);

  useEffectVG(() => {
    if (phase !== 'run' || !running) return;
    if (remaining <= 0) return;
    const t = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(t);
          try { navigator.vibrate && navigator.vibrate([60, 40, 60, 40, 120]); } catch (e) {}
          V2_Sound.play('end');
          setRunning(false);
          setTimeout(() => setPhase('resolve'), 120);
          return 0;
        }
        if (r <= 4) V2_Sound.play('tick');
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, running]);

  const startTimer = () => { setPhase('run'); setRunning(true); };
  // Sound bei Auswertung: win/lose je nach Punkten
  const sfxResolve = (recipients, pts, fx) => {
    V2_Sound.play(pts > 0 && recipients && recipients.length ? 'win' : 'lose');
    onResolve(recipients, pts, fx);
  };
  const toResolve = () => { setRunning(false); setPhase('resolve'); };
  const togglePick = id => setPicked(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  // header
  const header = (
    <div style={{ background: accent, padding: '16px 22px 14px', position: 'relative' }}>
      <V2_HazardBar color="#0a0a0c" height={6} style={{ position: 'absolute', top: 0, left: 0, opacity: 0.22 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
        <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 13, letterSpacing: '2px', color: accent, background: '#0a0a0c', padding: '3px 9px', borderRadius: 5 }}>
          {V2_typeTag(card.type)}
        </span>
        {current.twisted && (
          <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 13, letterSpacing: '2px', color: '#0a0a0c', background: V2_PALETTE.gold, padding: '3px 9px', borderRadius: 5, transform: 'rotate(-3deg)' }}>⚡ TWIST</span>
        )}
        <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 13, color: '#0a0a0c', opacity: 0.7, marginLeft: 'auto' }}>#{String(card.id).padStart(2, '0')}</span>
      </div>
      <h1 style={{ fontFamily: 'Anton, sans-serif', fontSize: 34, lineHeight: 0.92, color: '#0a0a0c', margin: '10px 0 0', letterSpacing: '-0.5px' }}>{card.title}</h1>
      {card.category && (
        <div style={{ marginTop: 6, display: 'inline-block', fontFamily: 'Anton, sans-serif', fontSize: 12, letterSpacing: '1.5px', color: accent, background: '#0a0a0c', padding: '3px 8px', borderRadius: 4 }}>
          {card.category}
        </div>
      )}
    </div>
  );

  // wer spielt
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
    participants = (
      <div style={{ padding: '4px 22px' }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 38, color: accent, lineHeight: 1, textShadow: `0 0 18px ${accent}66` }}>DAS GANZE RUDEL</div>
        <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 12, letterSpacing: '2px', color: V2_PALETTE.dim, marginTop: 4 }}>{group.length} LEUTE GLEICHZEITIG</div>
      </div>
    );
  }

  // Mission + Twist + DrinkRule + Prompt
  const missionBox = (
    <div style={{ padding: '0 22px', marginTop: 10 }}>
      <p style={{ margin: 0, fontFamily: 'Archivo, sans-serif', fontWeight: 600, fontSize: 16, lineHeight: 1.35, color: V2_PALETTE.ink, textWrap: 'pretty' }}>{card.text}</p>
      {card.prompt && (
        <div style={{
          marginTop: 10, padding: '12px 14px', background: '#1a1a1f',
          borderLeft: `4px solid ${accent}`, borderRadius: 6,
          fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: 16, color: V2_PALETTE.ink,
        }}>{card.prompt}</div>
      )}
      {current.twisted && card.twist && (
        <div style={{
          marginTop: 10, padding: '12px 14px', background: '#1a1908',
          borderLeft: `4px solid ${V2_PALETTE.gold}`, borderRadius: 6,
          fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: 15, color: V2_PALETTE.ink,
        }}>
          <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 12, letterSpacing: '2px', color: V2_PALETTE.gold, marginBottom: 4 }}>⚡ TWIST</div>
          {card.twist}
        </div>
      )}
      {config.drinks && card.drinkRule && (
        <div style={{
          marginTop: 10, padding: '12px 14px', background: '#1a0d0d',
          borderLeft: `4px solid ${V2_PALETTE.danger}`, borderRadius: 6,
          fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: 14, color: V2_PALETTE.ink,
        }}>
          <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 12, letterSpacing: '2px', color: V2_PALETTE.danger, marginBottom: 4 }}>🍻 DRINK-REGEL</div>
          {card.drinkRule}
        </div>
      )}
    </div>
  );

  // Aktionsbereich
  let action;
  if (phase === 'brief') {
    action = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {card.timer ? (
          <V2_BigButton color={accent} onClick={startTimer} sub={`${totalTime} SEKUNDEN`}>TIMER STARTEN ▶</V2_BigButton>
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
    const sub = card.category && card.category.includes('HOT TAKE') ? 'KEINE PUNKTE · NUR DISKUSSION'
              : card.category && card.category.includes('KENNENLERNEN') ? 'KEINE PUNKTE · EINFACH REDEN'
              : 'KEINE PUNKTE · EINFACH WEITER';
    action = (
      <V2_BigButton color={accent} onClick={() => sfxResolve([], 0, { text: 'WEITER!', color: accent })} sub={sub}>
        NÄCHSTE KARTE →
      </V2_BigButton>
    );
  } else if (card.resolve === 'vote_in_group') {
    action = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 22, color: V2_PALETTE.ink, marginBottom: 2 }}>WER GEWINNT?</div>
        {group.map(id => (
          <button key={id} onClick={() => sfxResolve([id], V2_POINTS.vote, { text: `${nameOf(id)} +${V2_POINTS.vote}!`, color: accent })} style={V2_voteBtn(accent)}>
            <span style={{ flex: 1, textAlign: 'left' }}>{nameOf(id)}</span>
            <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 16 }}>+{V2_POINTS.vote}</span>
          </button>
        ))}
        <button onClick={() => sfxResolve([], 0, { text: 'UNENTSCHIEDEN', color: V2_PALETTE.dim })} style={V2_skipLink}>Unentschieden</button>
      </div>
    );
  } else if (card.resolve === 'pick_from_all') {
    action = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 22, color: V2_PALETTE.ink }}>AUF WEN ZEIGT DAS RUDEL?</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
          {players.map(p => (
            <V2_PlayerChip key={p.id} name={p.name} accent={accent}
              picked={picked.includes(p.id)} onClick={() => togglePick(p.id)} />
          ))}
        </div>
        <V2_BigButton color={accent} disabled={picked.length === 0}
          onClick={() => sfxResolve(picked, V2_POINTS.pick, {
            text: picked.length === 1 ? `${nameOf(picked[0])} +${V2_POINTS.pick}!` : `${picked.length}× +${V2_POINTS.pick}!`,
            color: accent,
          })}
          sub={picked.length ? `${picked.length} GEWÄHLT · JE +${V2_POINTS.pick}` : 'Tippt mind. eine Person an'}>
          BESTÄTIGEN ✓
        </V2_BigButton>
      </div>
    );
  } else {
    const subText = card.participants === 'pair' ? `JE +${V2_POINTS.success} FÜRS PAAR` :
                    card.participants === 'squad' ? `JE +${V2_POINTS.success} FÜRS SQUAD` :
                    `JE +${V2_POINTS.success} FÜRS RUDEL`;
    action = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <V2_BigButton color={V2_PALETTE.rudel} onClick={() => sfxResolve(group, V2_POINTS.success, { text: 'GESCHAFFT!', color: V2_PALETTE.rudel })} sub={subText}>
          GESCHAFFT ✓
        </V2_BigButton>
        <button onClick={() => sfxResolve([], 0, { text: 'SCHADE…', color: V2_PALETTE.danger })} style={V2_skipLink}>Nicht geschafft</button>
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
            <V2_TimerRing total={totalTime} remaining={remaining} color={accent} paused={!running && phase === 'run'} />
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
// TRANSITION — zwischen Akten
// ─────────────────────────────────────────────────────────────
function V2_TransitionScreen({ akt, players, scores, multiplier, onContinue }) {
  useEffectVG(() => { V2_Sound.play('akt'); }, []);
  const colors = { 1: V2_PALETTE.squad, 2: V2_PALETTE.match, 3: V2_PALETTE.rudel };
  const c = colors[akt] || V2_PALETTE.ink;
  const leader = players.map(p => ({ ...p, pts: scores[p.id] || 0 })).sort((a, b) => b.pts - a.pts)[0];
  const desc = {
    2: 'Punkte werden teurer. Wer hinten liegt, kann jetzt aufholen.',
    3: 'Letzter Akt. Rudel-Challenges, große Punkte. Jeder ist noch im Rennen.',
  }[akt] || '';
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '60px 22px 36px', position: 'relative', overflow: 'hidden' }}>
      <V2_HazardBar color={c} style={{ position: 'absolute', top: 0, left: 0 }} />
      <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
        <V2_Sticker color={c} rotate={-3}>NEU</V2_Sticker>
        <V2_Sticker color={V2_PALETTE.gold} rotate={2}>× {String(multiplier).replace('.', ',')} PUNKTE</V2_Sticker>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18 }}>
        <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 13, letterSpacing: '3px', color: V2_PALETTE.dim }}>AKT {akt} VON 3</div>
        <div style={{
          fontFamily: 'Anton, sans-serif', fontSize: 80, lineHeight: 0.85, color: V2_PALETTE.ink,
          letterSpacing: '-1px', transform: 'rotate(-1.5deg)',
          textShadow: `5px 5px 0 ${c}, 10px 10px 0 ${V2_PALETTE.gold}`,
        }}>{V2_aktTitle(akt)}</div>
        <p style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 600, fontSize: 16, lineHeight: 1.4, color: V2_PALETTE.ink, margin: 0, maxWidth: 320 }}>
          {desc}
        </p>
        {leader && leader.pts > 0 && (
          <div style={{ marginTop: 4, padding: '14px 16px', background: '#141417', border: '1px solid #232329', borderRadius: 14 }}>
            <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 11, letterSpacing: '2px', color: V2_PALETTE.dim }}>AKTUELL VORN</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 }}>
              <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 28, color: V2_PALETTE.gold }}>{leader.name}</span>
              <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 28, color: V2_PALETTE.ink }}>{leader.pts}</span>
            </div>
          </div>
        )}
      </div>
      <V2_BigButton color={c} onClick={onContinue} sub={`AKT ${akt} STARTEN`}>WEITER →</V2_BigButton>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LEADERBOARD (live, jederzeit erreichbar)
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
      <h1 style={{ ...V2_h1, fontSize: 44 }}>PUNKTE<br/>STAND</h1>
      <div style={{ ...V2_sub, marginBottom: 18 }}>Nach {round} {round === 1 ? 'Runde' : 'Runden'}</div>
      {top && (
        <div style={{
          background: V2_PALETTE.gold, color: '#0a0a0c', borderRadius: 20,
          padding: '20px 18px', display: 'flex', alignItems: 'center', gap: 14,
          boxShadow: `0 0 40px ${V2_PALETTE.gold}55`,
        }}>
          <span style={{ fontSize: 42 }}>👑</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 10, letterSpacing: '2px', opacity: 0.7 }}>VORN</div>
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

// ─────────────────────────────────────────────────────────────
// END — 5 RUDEL-AWARDS
// ─────────────────────────────────────────────────────────────
function V2_distinctPartners(playerId, history) {
  const set = new Set();
  history.forEach(k => {
    const [a, b] = k.split('|').map(Number);
    if (a === playerId) set.add(b);
    else if (b === playerId) set.add(a);
  });
  return set.size;
}

function V2_pickTop(players, getValue) {
  if (!players.length) return null;
  const ranked = players.map(p => ({ ...p, val: getValue(p) }))
    .sort((a, b) => b.val - a.val || a.name.localeCompare(b.name));
  return ranked[0];
}

function V2_AwardCard({ icon, title, subtitle, color, winner }) {
  if (!winner) return null;
  return (
    <div style={{
      background: '#141417', border: `1.5px solid ${color}`, borderRadius: 14,
      padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: `0 0 18px ${color}22`,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12, background: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
        boxShadow: `0 3px 0 ${V2_shade(color)}`,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 14, letterSpacing: '1.5px', color: color }}>{title}</div>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 22, lineHeight: 1.05, color: V2_PALETTE.ink, wordBreak: 'break-word' }}>{winner.name}</div>
        <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '1px', color: V2_PALETTE.dim }}>{subtitle(winner)}</div>
      </div>
    </div>
  );
}

function V2_EndScreen({ players, scores, stats, history, round, onRestartSameCrew, onNewCrew }) {
  const enriched = players.map(p => ({
    ...p,
    pts: scores[p.id] || 0,
    voteWins: (stats[p.id] || {}).voteWins || 0,
    pickReceived: (stats[p.id] || {}).pickReceived || 0,
    chaosCount: (stats[p.id] || {}).chaosCount || 0,
    partners: V2_distinctPartners(p.id, history),
  }));

  const mvp = V2_pickTop(enriched, p => p.pts);
  const bruecke = V2_pickTop(enriched, p => p.partners);
  const showStar = V2_pickTop(enriched, p => p.voteWins);
  const herz = V2_pickTop(enriched, p => p.pickReceived);
  const chaos = V2_pickTop(enriched, p => p.chaosCount);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '60px 22px 32px', position: 'relative', overflow: 'hidden' }}>
      <V2_HazardBar color={V2_PALETTE.gold} style={{ position: 'absolute', top: 0, left: 0 }} />
      <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <V2_Sticker color={V2_PALETTE.gold} rotate={-3}>RUDEL DURCHGESPIELT</V2_Sticker>
        <V2_Sticker color={V2_PALETTE.squad} rotate={2}>{round} RUNDEN</V2_Sticker>
      </div>

      <h1 style={{
        marginTop: 14, fontFamily: 'Anton, sans-serif', fontSize: 58, lineHeight: 0.85,
        color: V2_PALETTE.ink, letterSpacing: '-1px', transform: 'rotate(-1.5deg)',
        textShadow: `4px 4px 0 ${V2_PALETTE.match}, 8px 8px 0 ${V2_PALETTE.squad}`,
      }}>RUDEL<br/>AWARDS</h1>

      <div style={{ flex: 1, overflowY: 'auto', marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <V2_AwardCard icon="👑" color={V2_PALETTE.gold} title="MVP" winner={mvp}
          subtitle={w => `${w.pts} Punkte`} />
        <V2_AwardCard icon="🤝" color={V2_PALETTE.squad} title="BRÜCKENBAUER:IN" winner={bruecke}
          subtitle={w => `${w.partners} verschiedene Kontakte`} />
        <V2_AwardCard icon="🎭" color={V2_PALETTE.match} title="SHOW-STAR" winner={showStar}
          subtitle={w => `${w.voteWins} Abstimmungen gewonnen`} />
        <V2_AwardCard icon="🫂" color={V2_PALETTE.rudel} title="HERZENSMENSCH" winner={herz}
          subtitle={w => `${w.pickReceived}× gewählt vom Rudel`} />
        <V2_AwardCard icon="🎲" color={V2_PALETTE.danger} title="CHAOS-MAGNET" winner={chaos}
          subtitle={w => `${w.chaosCount} Chaos-Momente`} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
        <V2_BigButton color={V2_PALETTE.rudel} onClick={onRestartSameCrew} sub="GLEICHE LEUTE · NEUE KARTEN">NOCHMAL!</V2_BigButton>
        <V2_BigButton color={V2_PALETTE.match} onClick={onNewCrew} sub="ZURÜCK ZUM SETUP" ghost>NEUE LEUTE</V2_BigButton>
      </div>
    </div>
  );
}

Object.assign(window, {
  V2_HubScreen, V2_CardScreen, V2_TransitionScreen,
  V2_LeaderboardScreen, V2_EndScreen,
});
