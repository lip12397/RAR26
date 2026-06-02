// rudel-logic.jsx — Spiel-Logik: Teams auslosen, Paare ziehen (cross-team, ohne
// Wiederholung solange möglich), Karten-Deck mit Typ-Wechsel.

// Fisher–Yates
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Spieler möglichst gleichmäßig in zwei Teams. Gibt {A:[id], B:[id]}.
function autoTeams(playerIds) {
  const s = shuffle(playerIds);
  const A = [], B = [];
  s.forEach((id, i) => (i % 2 === 0 ? A : B).push(id));
  return { A, B };
}

const pairKey = (a, b) => [a, b].sort((x, y) => x - y).join('|');

function teamOf(id, teams) {
  if (teams.A.includes(id)) return 'A';
  if (teams.B.includes(id)) return 'B';
  return null;
}

// Wählt eine Gruppe (Paar, gelegentlich Trio) für eine Match-Mission.
// Priorität: cross-Team & noch nie zusammen > noch nie zusammen > cross-Team > egal.
// Verteilt Beteiligung möglichst breit (wer selten dran war, kommt eher).
function pickGroup(players, teams, history, activeCount, allowTrio) {
  const ids = players.map(p => p.id);
  if (ids.length < 2) return ids;

  // alle Paare
  const allPairs = [];
  for (let i = 0; i < ids.length; i++)
    for (let j = i + 1; j < ids.length; j++)
      allPairs.push([ids[i], ids[j]]);

  const isCross = ([a, b]) => teamOf(a, teams) !== teamOf(b, teams);
  const isFresh = ([a, b]) => !history.has(pairKey(a, b));
  const activity = grp => grp.reduce((s, id) => s + (activeCount[id] || 0), 0);

  // Tier-Auswahl
  const tiers = [
    allPairs.filter(p => isCross(p) && isFresh(p)),
    allPairs.filter(p => isFresh(p)),
    allPairs.filter(p => isCross(p)),
    allPairs,
  ];
  let pool = tiers.find(t => t.length) || allPairs;

  // unter dem besten Tier: bevorzuge wenig-aktive Leute
  const minAct = Math.min(...pool.map(activity));
  const best = pool.filter(p => activity(p) <= minAct + 1);
  let group = shuffle(best)[0].slice();

  // gelegentlich (~25 %) zum Trio erweitern, wenn genug Leute & sinnvoll
  const wantTrio = allowTrio && ids.length >= 5 && Math.random() < 0.25;
  if (wantTrio) {
    const rest = ids.filter(id => !group.includes(id));
    // dritte Person: frisch zu beiden & cross bevorzugt, sonst wenig aktiv
    const scored = rest.map(id => {
      const freshBoth = group.every(g => isFresh([g, id]));
      const crossAny = group.some(g => teamOf(g, teams) !== teamOf(id, teams));
      return { id, score: (freshBoth ? 2 : 0) + (crossAny ? 1 : 0) - (activeCount[id] || 0) * 0.1 };
    }).sort((a, b) => b.score - a.score);
    if (scored.length) group.push(scored[0].id);
  }
  return group;
}

// Nächste Karte ziehen. Bevorzugt den angefragten Typ. Wenn der ausgeht,
// wechselt zum anderen Typ. Sind ALLE Karten durch, return null → Game Over.
// drinks=false filtert Karten mit drinksRequired raus.
function drawCard(cards, preferredType, usedIds, drinks = true) {
  const otherType = preferredType === 'match' ? 'bluff' : 'match';
  const freshOf = type => cards.filter(c =>
    c.type === type && !usedIds.includes(c.id) && (drinks || !c.drinksRequired)
  );
  let pool = freshOf(preferredType);
  if (!pool.length) pool = freshOf(otherType);
  if (!pool.length) return null; // alle Karten durch
  return shuffle(pool)[0];
}

Object.assign(window, { shuffle, autoTeams, pairKey, teamOf, pickGroup, drawCard });
