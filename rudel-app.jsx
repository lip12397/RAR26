// rudel-app.jsx — State-Maschine, Persistenz, Routing, Mount im Handy-Rahmen.
const { useState: useStateA, useEffect: useEffectA } = React;

const STORE_KEY = 'rudel_state_v2';
const INITIAL = {
  screen: 'start', started: false,
  players: [], teams: { A: [], B: [] },
  scores: { A: 0, B: 0 },
  history: [], usedCards: [], activeCount: {},
  round: 0, nextType: 'match', bluffCount: 0, current: null,
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return { ...INITIAL, ...JSON.parse(raw) };
  } catch (e) {}
  return INITIAL;
}



function App() {
  const [G, setG] = useStateA(loadState);
  const [flash, setFlash] = useStateA(null);

  useEffectA(() => {
    const { ...persist } = G;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(persist)); } catch (e) {}
  }, [G]);

  const patch = obj => setG(prev => ({ ...prev, ...(typeof obj === 'function' ? obj(prev) : obj) }));
  const nameOf = id => (G.players.find(p => p.id === id) || {}).name || '?';
  const teamOfId = id => teamOf(id, G.teams);

  // ── Navigation / Lebenszyklus ──
  const goSetup = () => patch({ screen: 'setup' });
  const newGame = () => { setG({ ...INITIAL, screen: 'setup' }); };
  const continueGame = () => patch({ screen: 'hub' });
  const quit = () => patch({ screen: 'start' });
  const setPlayers = players => patch({ players });
  const setTeams = teams => patch({ teams });

  const startGame = () => patch({
    started: true, screen: 'hub', scores: { A: 0, B: 0 },
    history: [], usedCards: [], activeCount: {}, round: 0,
    nextType: 'match', bluffCount: 0, current: null,
  });

  // ── Karte ziehen ──
  const draw = () => setG(prev => {
    const type = prev.nextType;
    const card = drawCard(RUDEL_CARDS, type, prev.usedCards);
    if (!card) {
      // Alle 20 Karten durch → End-Screen
      return { ...prev, current: null, screen: 'end' };
    }
    let group = [], actingTeam = null, guessTeam = null;
    if (card.type === 'match') {
      group = pickGroup(prev.players, prev.teams, new Set(prev.history), prev.activeCount, true);
    } else {
      actingTeam = prev.bluffCount % 2 === 0 ? 'A' : 'B';
      guessTeam = actingTeam === 'A' ? 'B' : 'A';
    }
    return { ...prev, current: { card, group, actingTeam, guessTeam }, usedCards: [...prev.usedCards, card.id], screen: 'card' };
  });

  // ── Karte werten ──
  const resolve = (dA, dB, flashObj) => {
    setG(prev => {
      const next = { ...prev, scores: { A: prev.scores.A + dA, B: prev.scores.B + dB }, round: prev.round + 1 };
      const cur = prev.current;
      if (cur.card.type === 'match') {
        const hist = new Set(prev.history);
        const g = cur.group;
        for (let i = 0; i < g.length; i++) for (let j = i + 1; j < g.length; j++) hist.add(pairKey(g[i], g[j]));
        next.history = [...hist];
        const ac = { ...prev.activeCount };
        g.forEach(id => { ac[id] = (ac[id] || 0) + 1; });
        next.activeCount = ac;
        next.nextType = 'bluff';
      } else {
        next.bluffCount = prev.bluffCount + 1;
        next.nextType = 'match';
      }
      return next;
    });
    setFlash(flashObj);
  };
  const flashDone = () => {
    setFlash(null);
    // Wenn nach dieser Runde keine frischen Karten mehr da sind → End-Screen
    setG(prev => {
      const remaining = RUDEL_CARDS.filter(c => !prev.usedCards.includes(c.id)).length;
      return { ...prev, current: null, screen: remaining === 0 ? 'end' : 'hub' };
    });
  };
  const skipCard = () => patch({ current: null, screen: 'hub' });

  // Nochmal mit gleichen Leuten: Punkte/History/Karten reset, Teams bleiben.
  const restartSameCrew = () => patch({
    screen: 'hub', scores: { A: 0, B: 0 },
    history: [], usedCards: [], activeCount: {}, round: 0,
    nextType: 'match', bluffCount: 0, current: null,
  });

  // ── Render ──
  let screen;
  if (G.screen === 'start') {
    screen = <StartScreen onStart={G.started ? newGame : goSetup} hasGame={G.started} onContinue={continueGame} />;
  } else if (G.screen === 'setup') {
    screen = <SetupScreen players={G.players} setPlayers={setPlayers} teams={G.teams} setTeams={setTeams} onBack={quit} onStartGame={startGame} />;
  } else if (G.screen === 'card' && G.current) {
    screen = <CardScreen key={G.round + '-' + G.current.card.id} current={G.current} nameOf={nameOf} teamOfId={teamOfId} onResolve={resolve} onSkipCard={skipCard} />;
  } else if (G.screen === 'score') {
    screen = <ScoreScreen scores={G.scores} round={G.round} onBack={continueGame} onNext={() => { patch({ screen: 'hub' }); }} />;
  } else if (G.screen === 'end') {
    screen = <EndScreen scores={G.scores} round={G.round} onRestartSameCrew={restartSameCrew} onNewCrew={newGame} />;
  } else {
    screen = <HubScreen scores={G.scores} round={G.round} nextType={G.nextType} onDraw={draw} onScore={() => patch({ screen: 'score' })} onQuit={quit} />;
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: PALETTE.bg, color: PALETTE.ink, overflow: 'hidden' }}>
      <div style={{ position: 'relative', height: '100%', width: '100%' }}>
        {screen}
        {flash && <Flash color={flash.color} text={flash.text} onDone={flashDone} />}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
