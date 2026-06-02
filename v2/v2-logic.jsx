// v2-logic.jsx — Picker für Paare/Squads, Typ-Rotation, History-Matrix.

function V2_shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const V2_pairKey = (a, b) => [a, b].sort((x, y) => x - y).join('|');

// Aktivität: id → wie oft schon aktiv beteiligt
function V2_activitySum(ids, activeCount) {
  return ids.reduce((s, id) => s + (activeCount[id] || 0), 0);
}

// Wie viele neue Paar-Verbindungen würde dieses Set erzeugen?
function V2_newPairs(ids, history) {
  let n = 0;
  for (let i = 0; i < ids.length; i++)
    for (let j = i + 1; j < ids.length; j++)
      if (!history.has(V2_pairKey(ids[i], ids[j]))) n++;
  return n;
}

// Paar ziehen: maximale "neue Verbindungen" (=1 wenn frisch, 0 sonst),
// bei Gleichstand wenig-aktive Leute bevorzugen.
function V2_pickPair(players, history, activeCount) {
  const ids = players.map(p => p.id);
  if (ids.length < 2) return ids;
  const pairs = [];
  for (let i = 0; i < ids.length; i++)
    for (let j = i + 1; j < ids.length; j++) pairs.push([ids[i], ids[j]]);
  const scored = pairs.map(p => ({
    p, fresh: V2_newPairs(p, history), act: V2_activitySum(p, activeCount),
  }));
  const maxFresh = Math.max(...scored.map(s => s.fresh));
  const tier = scored.filter(s => s.fresh === maxFresh);
  const minAct = Math.min(...tier.map(s => s.act));
  const best = tier.filter(s => s.act <= minAct + 1);
  return V2_shuffle(best)[0].p.slice();
}

// Squad ziehen (3 oder 4): greedy — wenig-aktive Person als Seed, dann
// schrittweise die Leute hinzufügen, die am meisten neue Verbindungen bringen.
function V2_pickSquad(players, history, activeCount, size = 3) {
  const ids = players.map(p => p.id);
  if (ids.length <= size) return ids.slice();
  const sorted = ids.slice().sort((a, b) => (activeCount[a] || 0) - (activeCount[b] || 0));
  // mehrere wenig-aktive Seeds randomisieren, damit's nicht immer dieselbe Person ist
  const seedPool = sorted.slice(0, Math.min(3, sorted.length));
  const group = [V2_shuffle(seedPool)[0]];
  while (group.length < size) {
    const rest = ids.filter(id => !group.includes(id));
    const scored = rest.map(id => {
      const fresh = group.filter(g => !history.has(V2_pairKey(g, id))).length;
      const act = activeCount[id] || 0;
      return { id, score: fresh * 10 - act };
    });
    const top = Math.max(...scored.map(s => s.score));
    const tier = scored.filter(s => s.score >= top - 0.5);
    group.push(V2_shuffle(tier)[0].id);
  }
  return group;
}

// Nächster Karten-Typ. Gewichtet 40/30/30, ohne 2× direkt hintereinander.
function V2_nextType(lastType) {
  const pool = ['match', 'match', 'match', 'match', 'squad', 'squad', 'squad', 'rudel', 'rudel', 'rudel'];
  const filtered = pool.filter(t => t !== lastType);
  const use = filtered.length ? filtered : pool;
  return V2_shuffle(use)[0];
}

// Karte ziehen — innerhalb des Typs frische zuerst, dann neu mischen.
// Wählt zufällig einen Prompt aus, falls vorhanden.
function V2_drawCard(cards, type, usedIds) {
  const ofType = cards.filter(c => c.type === type);
  let fresh = ofType.filter(c => !usedIds.includes(c.id));
  if (!fresh.length) fresh = ofType;
  const card = V2_shuffle(fresh)[0];
  const prompt = card.prompts ? V2_shuffle(card.prompts)[0] : null;
  return { ...card, prompt };
}

// History für eine Gruppe pflegen (jedes Paar im Set).
function V2_recordHistory(group, history) {
  const next = new Set(history);
  for (let i = 0; i < group.length; i++)
    for (let j = i + 1; j < group.length; j++)
      next.add(V2_pairKey(group[i], group[j]));
  return [...next];
}

Object.assign(window, {
  V2_shuffle, V2_pairKey, V2_activitySum, V2_newPairs,
  V2_pickPair, V2_pickSquad, V2_nextType, V2_drawCard, V2_recordHistory,
});
