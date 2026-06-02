// v2-app.jsx — State, Routing, Persistenz, Mount.
// Mit Akten, Multiplikator, Stats für 5 Awards, Twist & Tonalität & Drinks.
const { useState: useStateVA, useEffect: useEffectVA } = React;

const V2_STORE_KEY = 'rudel_v2_state_v2';
const V2_INITIAL_CONFIG = { length: 'medium', tone: 'standard', drinks: false, twistEnabled: true };
const V2_INITIAL_STATS_FOR = id => ({ voteWins: 0, pickReceived: 0, chaosCount: 0 });

const V2_INITIAL = {
  screen: 'start', started: false,
  players: [],
  config: V2_INITIAL_CONFIG,
  totalRounds: 24, aktThresholds: [8, 16, 24],
  scores: {}, stats: {},
  history: [], activeCount: {}, usedCards: [],
  round: 0, lastType: null, nextType: 'match',
  twistOn: false,           // Toggle für nächste Karte
  current: null,            // { card, group, twisted }
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

  // ── Navigation ──
  const goSetup = () => patch({ screen: 'setup' });
  const newGame = () => setG({ ...V2_INITIAL, screen: 'setup' });
  const continueGame = () => patch({ screen: 'hub' });
  const quit = () => patch({ screen: 'start' });
  const setPlayers = players => patch({ players });
  const setConfig = config => patch({ config });
  const goConfig = () => patch({ screen: 'config' });

  // Spiel beginnen / neu starten mit gleichen Leuten
  const startWithCurrent = (resetPlayers = false) => setG(prev => {
    const { totalRounds, aktThresholds } = V2_LENGTH_CONFIG[prev.config.length];
    const stats = {};
    prev.players.forEach(p => { stats[p.id] = V2_INITIAL_STATS_FOR(p.id); });
    return {
      ...prev, started: true, screen: 'hub',
      scores: {}, history: [], activeCount: {}, usedCards: [],
      round: 0, lastType: null, nextType: V2_nextTypeForAkt(1, null), current: null,
      totalRounds, aktThresholds, stats, twistOn: false,
    };
  });

  const startGame = () => startWithCurrent();
  const restartSameCrew = () => startWithCurrent();

  // ── Karte ziehen ──
  const draw = () => setG(prev => {
    const akt = V2_aktOf(prev.round, prev.aktThresholds);
    const deck = V2_filterDeck(V2_CARDS, prev.config.tone, prev.config.drinks);
    const type = prev.nextType || V2_nextTypeForAkt(akt, prev.lastType);
    let baseCard = V2_drawCard(deck, type, prev.usedCards);
    if (!baseCard) baseCard = V2_drawCard(V2_CARDS, type, prev.usedCards); // safety
    const useTwist = prev.twistOn && baseCard.twist;
    const card = useTwist
      ? { ...baseCard, _twisted: true }
      : baseCard;

    let group = [];
    if (card.participants === 'pair') {
      group = V2_pickPair(prev.players, new Set(prev.history), prev.activeCount);
    } else if (card.participants === 'squad') {
      const size = Math.random() < 0.5 ? 3 : 4;
      group = V2_pickSquad(prev.players, new Set(prev.history), prev.activeCount, Math.min(size, prev.players.length - 1));
    } else {
      group = prev.players.map(p => p.id);
    }
    return {
      ...prev, current: { card, group, twisted: useTwist },
      usedCards: [...prev.usedCards, card.id], screen: 'card',
      twistOn: false,
    };
  });

  // ── Karte werten ──
  const resolve = (recipients, perPerson, flashObj) => {
    setG(prev => {
      const cur = prev.current;
      const akt = V2_aktOf(prev.round, prev.aktThresholds);
      const mult = V2_aktMultiplier(akt);
      const newRound = prev.round + 1;
      const newAkt = V2_aktOf(newRound, prev.aktThresholds);

      const next = {
        ...prev, round: newRound,
        lastType: cur.card.type,
        nextType: V2_nextTypeForAkt(newAkt, cur.card.type),
      };

      // Punkte mit Akt-Multiplikator
      if (recipients && recipients.length && perPerson) {
        const effective = Math.round(perPerson * mult);
        const scores = { ...prev.scores };
        recipients.forEach(id => { scores[id] = (scores[id] || 0) + effective; });
        next.scores = scores;
      }

      // Stats für Awards
      const stats = {};
      Object.keys(prev.stats).forEach(id => { stats[id] = { ...prev.stats[id] }; });
      if (cur.card.resolve === 'vote_in_group' && recipients && recipients.length) {
        recipients.forEach(id => { if (stats[id]) stats[id].voteWins += 1; });
      }
      if (cur.card.resolve === 'pick_from_all' && recipients && recipients.length) {
        recipients.forEach(id => { if (stats[id]) stats[id].pickReceived += 1; });
      }
      // Chaos: discuss-Karten oder Karten mit Chaos-/Hot-Take-Kategorie
      const isChaos = cur.card.resolve === 'discuss'
        || (cur.card.category && (cur.card.category.includes('CHAOS') || cur.card.category.includes('HOT TAKE')));
      if (isChaos) {
        cur.group.forEach(id => { if (stats[id]) stats[id].chaosCount += 1; });
      }
      next.stats = stats;

      // History (außer bei „alle")
      if (cur.card.participants !== 'all') {
        next.history = V2_recordHistory(cur.group, new Set(prev.history));
      }
      const ac = { ...prev.activeCount };
      cur.group.forEach(id => { ac[id] = (ac[id] || 0) + 1; });
      next.activeCount = ac;

      return next;
    });
    setFlash(flashObj);
  };

  // Nach Flash: wohin geht's?
  const flashDone = () => {
    setFlash(null);
    setG(prev => {
      let nextScreen = 'hub';
      if (prev.round >= prev.totalRounds) nextScreen = 'end';
      else if (prev.round === prev.aktThresholds[0] || prev.round === prev.aktThresholds[1]) nextScreen = 'transition';
      return { ...prev, current: null, screen: nextScreen };
    });
  };

  const skipCard = () => patch({ current: null, screen: 'hub' });

  // → Nächster Akt (vorzeitig)
  const skipAkt = () => setG(prev => {
    const akt = V2_aktOf(prev.round, prev.aktThresholds);
    if (akt >= 3) return prev;
    const targetRound = prev.aktThresholds[akt - 1];
    const newAkt = V2_aktOf(targetRound, prev.aktThresholds);
    return { ...prev, round: targetRound, screen: 'transition', lastType: null, nextType: V2_nextTypeForAkt(newAkt, null) };
  });

  const fromTransition = () => patch({ screen: 'hub' });
  const toggleTwist = () => patch(prev => ({ twistOn: !prev.twistOn }));

  // ── Render ──
  let screen;
  if (G.screen === 'start') {
    screen = <V2_StartScreen onStart={G.started ? newGame : goSetup} hasGame={G.started} onContinue={continueGame} />;
  } else if (G.screen === 'setup') {
    screen = <V2_SetupScreen players={G.players} setPlayers={setPlayers} onBack={quit} onContinue={goConfig} />;
  } else if (G.screen === 'config') {
    screen = <V2_ConfigScreen config={G.config} setConfig={setConfig} onBack={goSetup} onStartGame={startGame} />;
  } else if (G.screen === 'card' && G.current) {
    screen = <V2_CardScreen
      key={G.round + '-' + G.current.card.id}
      current={G.current} players={G.players} scores={G.scores} config={G.config}
      tonePace={V2_tonePace(G.config.tone)}
      nameOf={nameOf} onResolve={resolve} onSkipCard={skipCard} />;
  } else if (G.screen === 'leaderboard') {
    screen = <V2_LeaderboardScreen players={G.players} scores={G.scores} round={G.round} onBack={continueGame} />;
  } else if (G.screen === 'transition') {
    const newAkt = V2_aktOf(G.round, G.aktThresholds);
    screen = <V2_TransitionScreen
      akt={newAkt} players={G.players} scores={G.scores}
      multiplier={V2_aktMultiplier(newAkt)} onContinue={fromTransition} />;
  } else if (G.screen === 'end') {
    screen = <V2_EndScreen
      players={G.players} scores={G.scores} stats={G.stats} history={G.history}
      round={G.round} onRestartSameCrew={restartSameCrew} onNewCrew={newGame} />;
  } else {
    const akt = V2_aktOf(G.round, G.aktThresholds);
    screen = <V2_HubScreen
      players={G.players} scores={G.scores} round={G.round} totalRounds={G.totalRounds}
      akt={akt} multiplier={V2_aktMultiplier(akt)}
      nextType={G.nextType || 'match'}
      twistOn={G.twistOn} twistEnabled={G.config.twistEnabled}
      onToggleTwist={toggleTwist} onSkipAkt={skipAkt}
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
