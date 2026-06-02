// rudel-data.jsx — Inhalte für Rudel (Rock am Ring 2026, Camping Edition)
// 20 feste Karten aus dem Brief. type: 'match' (Paar) | 'bluff' (Team gegen Team).
// timer in Sekunden, oder null (kein Countdown).

const RUDEL_THEME = {
  name: 'RUDEL',
  festival: 'ROCK AM RING',
  year: '2026',
  dates: '05–07 JUNI',
  place: 'NÜRBURGRING',
  edition: 'CAMPING EDITION',
};

const RUDEL_CARDS = [
  // ─── MATCH & MISSION (Paar-Aufgaben am Campingplatz) ───
  { id: 1,  type: 'match', title: 'GEHEIM-HANDSHAKE', tag: 'PAAR',
    text: 'Erfindet zusammen einen Handshake mit mind. 4 Moves. Dann der Gruppe vorführen.', timer: 60 },
  { id: 2,  type: 'match', title: 'DAUER-KOMPLIMENTE', tag: 'PAAR',
    text: 'Eine:r macht 60 Sek. nonstop Komplimente. Stocken = beide trinken.', timer: 60 },
  { id: 3,  type: 'match', title: 'DÜMMSTE STORY', tag: 'PAAR',
    text: 'Erzählt euch eure dümmste Party-Story. Die Gruppe wählt die bessere.', timer: 90 },
  { id: 4,  type: 'match', title: 'BRING MICH ZUM LACHEN', tag: 'PAAR',
    text: 'Eine:r sitzt im Campingstuhl. Die/der andere bringt sie/ihn zum Lachen – ohne anfassen.', timer: 90 },
  { id: 5,  type: 'match', title: 'MÜLL-SKULPTUR', tag: 'PAAR',
    text: 'Baut aus dem, was rumliegt, eine Skulptur. Die Gruppe bewertet.', timer: 120 },
  { id: 6,  type: 'match', title: 'NIE GEFRAGT', tag: 'PAAR',
    text: 'Stellt euch je 3 Fragen, die ihr noch nie einer fremden Person gestellt habt.', timer: 90 },
  { id: 7,  type: 'match', title: 'LIP-SYNC BATTLE', tag: 'PAAR',
    text: 'Bester Lip-Sync zum nächsten Song aus der Box. Volle Show.', timer: 90 },
  { id: 8,  type: 'match', title: 'BLIND NACHBAUEN', tag: 'PAAR',
    text: 'Eine:r beschreibt blind ein Foto vom Handy. Die/der andere legt es mit Bechern & Stöcken nach.', timer: 90 },
  { id: 9,  type: 'match', title: '5 GEMEINSAMKEITEN', tag: 'PAAR',
    text: 'Findet 5 Gemeinsamkeiten. Nichts Offensichtliches – „beide hier" zählt nicht.', timer: 60 },
  { id: 10, type: 'match', title: 'FAKE-BIOGRAFIE', tag: 'PAAR',
    text: 'Eine:r erzählt 60 Sek. die erfundene Lebensgeschichte der/des anderen. Je absurder, desto besser.', timer: 60 },
  { id: 11, type: 'match', title: 'KLAMOTTEN-TAUSCH', tag: 'PAAR',
    text: 'Tauscht ein Kleidungsstück – für die nächsten 3 Runden.', timer: null },
  { id: 12, type: 'match', title: 'SIGNATURE-DRINK', tag: 'PAAR',
    text: 'Mixt aus allem, was da ist, einen Drink für die Gruppe. Alle probieren, Gruppe bewertet.', timer: 120 },

  // ─── TEAM-BLUFF-CHALLENGES (Team gegen Team) ───
  { id: 13, type: 'bluff', title: 'WASSER-ROULETTE', tag: 'BLUFF',
    text: 'Füllt 4 Becher: 3× Wasser, 1× Wodka. Vier trinken mit Pokerface. Das Gegner-Team rät, wer den Schnaps hatte.', timer: 60 },
  { id: 14, type: 'bluff', title: '2 WAHRHEITEN, 1 LÜGE', tag: 'BLUFF',
    text: 'Eine:r nennt 3 Aussagen über sich. Das Gegner-Team berät und tippt auf die Lüge.', timer: 45 },
  { id: 15, type: 'bluff', title: 'DER MAULWURF', tag: 'BLUFF',
    text: 'Euer Team sieht ein Wort – eine:r nicht. Alle beschreiben es mit 1 Wort. Gegner raten den Maulwurf.', timer: 60 },
  { id: 16, type: 'bluff', title: 'FAKE-EXPERTE', tag: 'BLUFF',
    text: 'Eine:r spielt Expert:in für ein absurdes Thema und beantwortet 3 Fragen. Echt oder Bullshit?', timer: 90 },
  { id: 17, type: 'bluff', title: 'WER VON UNS?', tag: 'BLUFF',
    text: 'Gegner stellen eine Frage. Euer Team zeigt gleichzeitig auf jemanden. Gegner tippen vorher die Mehrheit.', timer: 30 },
  { id: 18, type: 'bluff', title: 'LÜGEN-DETEKTOR', tag: 'BLUFF',
    text: 'Eine:r erzählt eine Story – wahr oder erfunden? Das Gegner-Team rät.', timer: 60 },
  { id: 19, type: 'bluff', title: 'GESCHMACKSTEST', tag: 'BLUFF',
    text: 'Mixt blind einen Drink. Ein:e Gegner:in trinkt mit verbundenen Augen und rät die Zutaten.', timer: 60 },
  { id: 20, type: 'bluff', title: 'PANTOMIME-KETTE', tag: 'BLUFF',
    text: 'Bildet eine Kette: Begriff weiterspielen ohne Worte. Die letzte Person rät. Gegner kennen das Original.', timer: 90 },
];

Object.assign(window, { RUDEL_THEME, RUDEL_CARDS });
