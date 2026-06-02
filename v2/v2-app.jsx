// v2-app.jsx — State, Routing, Persistenz, Mount.
const { useState: useStateVA, useEffect: useEffectVA } = React;

const V2_STORE_KEY = 'rudel_v2_state_v1';
const V2_INITIAL = {
  screen: 'start', started: false,
  players: [],
  scores: {},           // { id: punkte }
  history: [],          // gespeicherte Paar-Keys
  activeCount: {},      // { id: wie oft beteiligt }
  usedCards: [],
  round: 0,
  lastType: null,
  nextType: 'match',    // wird bei jedem Rundenende neu gewürfelt
  current: null,        // { card, group }
};

function V2_loadState() {
  try {
    const raw = localStorage.getItem(V2_STORE_KEY);
    if (raw) return { ...V2_INITIAL, ...JSON.parse(raw) };
  } catch (e) {}
  return V2_INITIAL;
}

function V2_App() {
  const [G, setG] = useStateVA(V2_loadState);
  const [flash, setFlash] = useStateVA(null);

  useEffectVA(() => {
    try { localStorage.setItem(V2_STORE_KEY, JSON.stringify(G)); } catch (e) {}
  }, [G]);

  const patch = obj => setG(prev => ({ ...prev, ...(typeof obj === 'function' ? obj(prev) : obj) }));
  const nameOf = id => (G.players.find(p => p.id === id) || {}).name || '?';

  const goSetup = () => patch({ screen: 'setup' });
  const newGame = () => setG({ ...V2_INITIAL, screen: 'setup' });
  const continueGame = () => patch({ screen: 'hub' });
  const quit = () => patch({ screen: 'start' });
  const setPlayers = players => patch({ players });

  const startGame = () => patch({
    started: true, screen: 'hub',
    scores: {}, history: [], activeCount: {}, usedCards: [],
    round: 0, lastType: null, nextType: V2_nextType(null), current: null,
  });

  // ── Karte ziehen ──
  const draw = () => setG(prev => {
    const type = prev.nextType;
    const card = V2_drawCard(V2_CARDS, type, prev.usedCards);
    let group = [];
    if (card.participants === 'pair') {
      group = V2_pickPair(prev.players, new Set(prev.history), prev.activeCount);
    } else if (card.participants === 'squad') {
      const size = Math.random() < 0.5 ? 3 : 4;
      group = V2_pickSquad(prev.players, new Set(prev.history), prev.activeCount, Math.min(size, prev.players.length - 1));
    } else {
      group = prev.players.map(p => p.id); // alle
    }
    return {
      ...prev, current: { card, group },
      usedCards: [...prev.usedCards, card.id], screen: 'card',
    };
  });

  // ── Karte werten ──
  // recipients: ids, die punkte bekommen; perPerson: punkte pro person; flashObj: anzeige
  const resolve = (recipients, perPerson, flashObj) => {
    setG(prev => {
      const cur = prev.current;
      const next = { ...prev, round: prev.round + 1, lastType: cur.card.type, nextType: V2_nextType(cur.card.type) };
      // Punkte
      if (recipients && recipients.length && perPerson) {
        const scores = { ...prev.scores };
        recipients.forEach(id => { scores[id] = (scores[id] || 0) + perPerson; });
        next.scores = scores;
      }
      // History: alle Paare innerhalb der group merken (außer 'all', sonst explodiert die Matrix sinnlos)
      if (cur.card.participants !== 'all') {
        next.history = V2_recordHistory(cur.group, new Set(prev.history));
      }
      // Aktivität: alle, die mitgespielt haben
      const ac = { ...prev.activeCount };
      cur.group.forEach(id => { ac[id] = (ac[id] || 0) + 1; });
      next.activeCount = ac;
      return next;
    });
    setFlash(flashObj);
  };

  const flashDone = () => { setFlash(null); patch({ current: null, screen: 'hub' }); };
  const skipCard = () => patch({ current: null, screen: 'hub' });

  // ── Render ──
  let screen;
  if (G.screen === 'start') {
    screen = <V2_StartScreen onStart={G.started ? newGame : goSetup} hasGame={G.started} onContinue={continueGame} />;
  } else if (G.screen === 'setup') {
    screen = <V2_SetupScreen players={G.players} setPlayers={setPlayers} onBack={quit} onStartGame={startGame} />;
  } else if (G.screen === 'card' && G.current) {
    screen = <V2_CardScreen
      key={G.round + '-' + G.current.card.id}
      current={G.current} players={G.players} scores={G.scores}
      nameOf={nameOf} onResolve={resolve} onSkipCard={skipCard} />;
  } else if (G.screen === 'leaderboard') {
    screen = <V2_LeaderboardScreen players={G.players} scores={G.scores} round={G.round} onBack={continueGame} />;
  } else {
    // hub
    screen = <V2_HubScreen
      players={G.players} scores={G.scores} round={G.round}
      nextType={G.nextType || 'match'}
      onDraw={draw} onLeaderboard={() => patch({ screen: 'leaderboard' })} onQuit={quit} />;
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: V2_PALETTE.bg, color: V2_PALETTE.ink, overflow: 'hidden' }}>
      <div style={{ position: 'relative', height: '100%', width: '100%' }}>
        {screen}
        {flash && <V2_Flash color={flash.color} text={flash.text} onDone={flashDone} />}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<V2_App />);
