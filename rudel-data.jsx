// rudel-data.jsx — Inhalte für Rudel (Rock am Ring 2026, Camping Edition)
// 20 feste Karten aus dem Brief. type: 'match' (Paar) | 'bluff' (Team gegen Team).
// timer in Sekunden, oder null (kein Countdown).

const RUDEL_THEME = {
  name: 'RUDEL',
  festival: 'ROCK AM RING',
  year: '2026',
  dates: '03–07 JUNI',
  place: 'NÜRBURGRING',
  edition: 'CAMPING EDITION',
};

const RUDEL_CARDS = [
  // ─── MATCH & MISSION (Paar-Aufgaben am Campingplatz) ───
  { id: 1,  type: 'match', title: 'GEHEIM-HANDSHAKE', tag: 'PAAR',
    text: 'Erfindet zusammen einen geheimen Handshake mit mindestens 4 verschiedenen Bewegungen. Macht ihn danach der Gruppe synchron vor.', timer: 60 },
  { id: 2,  type: 'match', title: 'DAUER-KOMPLIMENTE', tag: 'PAAR',
    text: 'Eine:r aus euch beiden macht der/dem anderen 60 Sekunden lang nonstop ehrliche Komplimente. Kein Stocken, kein Wiederholen.', timer: 60,
    drinkRule: 'Stocken = beide trinken einen Schluck.' },
  { id: 3,  type: 'match', title: 'PEINLICHKEITS-DUELL', tag: 'PAAR',
    text: 'Zeigt euch gegenseitig eure peinlichste Auto-Korrektur, Google-Suche oder Sprachnachricht aus dem Handy. Die Gruppe stimmt am Ende ab, welche peinlicher war.', timer: 90 },
  { id: 4,  type: 'match', title: 'BRING MICH ZUM LACHEN', tag: 'PAAR',
    text: 'Eine Person setzt sich in den Campingstuhl. Die andere hat 90 Sekunden Zeit, sie zum Lachen zu bringen – ohne sie anzufassen. Grimassen, Tanz, Witze – alles erlaubt.', timer: 90 },
  { id: 5,  type: 'match', title: 'MÜLL-SKULPTUR', tag: 'PAAR',
    text: 'Schaut euch um und baut zusammen aus allem, was am Camp rumliegt – Becher, Stöcke, Dosen, leere Flaschen –, eine kleine Skulptur. Die Gruppe bewertet das Kunstwerk.', timer: 120 },
  { id: 6,  type: 'match', title: 'NIE GEFRAGT', tag: 'PAAR',
    text: 'Stellt euch gegenseitig je 3 ungewöhnliche Fragen, die ihr normalerweise niemandem stellen würdet. Beide antworten ehrlich. Nichts ist zu peinlich.', timer: 90 },
  { id: 7,  type: 'match', title: 'LIP-SYNC BATTLE', tag: 'PAAR',
    text: 'Sobald der nächste Song aus der Box läuft, performt ihr beide synchron Lip-Sync dazu. Mimik, Tanz, Gestik – volle Festival-Show.', timer: 90 },
  { id: 8,  type: 'match', title: 'BLIND NACHBAUEN', tag: 'PAAR',
    text: 'Eine Person sucht ein zufälliges Foto auf dem Handy und beschreibt es nur mit Worten. Die andere baut das Bild blind aus Bechern, Stöcken und Krempel nach, ohne es zu sehen.', timer: 90 },
  { id: 9,  type: 'match', title: '5 GEMEINSAMKEITEN', tag: 'PAAR',
    text: 'Findet in 60 Sekunden 5 Dinge, die ihr beide gemeinsam habt. Aber: nichts Offensichtliches wie „wir sind beide hier" oder „beide haben Haare" – die zählen nicht.', timer: 60 },
  { id: 10, type: 'match', title: 'FAKE-BIOGRAFIE', tag: 'PAAR',
    text: 'Eine Person erzählt 60 Sekunden lang die komplett ausgedachte Lebensgeschichte der anderen Person – Heimatdorf, Beruf, Geschwister, Skandale. Je absurder, desto besser.', timer: 60 },
  { id: 11, type: 'match', title: 'KLAMOTTEN-TAUSCH', tag: 'PAAR',
    text: 'Tauscht JETZT ein Kleidungsstück miteinander – Pulli, Cap, Sonnenbrille oder Schuh. Wird für die nächsten 3 Runden getragen, dann zurückgetauscht.', timer: null },
  { id: 12, type: 'match', title: 'SIGNATURE-DRINK', tag: 'PAAR',
    text: 'Mixt zusammen aus allem, was am Camp da ist, einen neuen Signature-Drink. Gebt ihm einen Namen. Die Gruppe probiert reihum und bewertet.', timer: 120 },

  // ─── TEAM-BLUFF-CHALLENGES (Team gegen Team) ───
  { id: 13, type: 'bluff', title: 'BECHER-ROULETTE', tag: 'BLUFF', drinksRequired: true,
    text: 'Füllt heimlich 4 Becher: 3 mit einem normalen Getränk, 1 mit einem Shot. Vier Leute aus eurem Team trinken alle gleichzeitig mit Pokerface. Das andere Team muss raten, wer den Shot hatte.', timer: 60 },
  { id: 14, type: 'bluff', title: '2 WAHRHEITEN, 1 LÜGE', tag: 'BLUFF',
    text: 'Eine Person aus eurem Team nennt 3 Aussagen über sich selbst – 2 sind wahr, 1 ist gelogen. Das Gegner-Team berät kurz und tippt darauf, welche die Lüge ist.', timer: 45 },
  { id: 15, type: 'bluff', title: 'DER MAULWURF', tag: 'BLUFF',
    text: 'Euer Team bekommt heimlich ein Wort auf dem Handy gezeigt – eine Person aus eurem Team (der Maulwurf) sieht es NICHT. Reihum sagt jede:r EIN passendes Wort dazu. Das andere Team rät am Ende, wer der Maulwurf war.', timer: 60 },
  { id: 16, type: 'bluff', title: 'FAKE-EXPERTE', tag: 'BLUFF',
    text: 'Eine Person aus eurem Team bekommt ein absurdes Thema (z. B. „Käfersprache") und spielt überzeugend Expert:in. Das andere Team stellt 3 Fragen und rät am Ende: echtes Wissen oder Bullshit?', timer: 90 },
  { id: 17, type: 'bluff', title: 'WER VON UNS?', tag: 'BLUFF',
    text: 'Das andere Team stellt eine Frage über euer Team (z. B. „Wer würde am ehesten einschlafen?"). Bevor ihr zeigt, tippt das Gegnerteam, auf wen die Mehrheit zeigen wird. Auf 3 zeigen alle gleichzeitig.', timer: 30 },
  { id: 18, type: 'bluff', title: 'LÜGEN-DETEKTOR', tag: 'BLUFF',
    text: 'Eine Person aus eurem Team erzählt eine Geschichte aus dem eigenen Leben. Sie kann komplett wahr oder komplett erfunden sein. Das andere Team berät und rät: wahr oder gelogen?', timer: 60 },
  { id: 19, type: 'bluff', title: 'GESCHMACKSTEST', tag: 'BLUFF',
    text: 'Mixt heimlich aus 3–4 Zutaten am Camp einen Drink. Eine Person aus dem anderen Team trinkt mit verbundenen Augen und versucht zu raten, was alles drin ist.', timer: 60 },
  { id: 20, type: 'bluff', title: 'PANTOMIME-KETTE', tag: 'BLUFF',
    text: 'Stellt euch in einer Reihe auf. Die erste Person sieht einen Begriff auf dem Handy und spielt ihn der zweiten stumm vor. Diese spielt es der dritten vor und so weiter. Die letzte Person rät den Begriff. Das andere Team kennt das Original und bewertet.', timer: 90 },
];

const RUDEL_TEAM_NAMES = [
  'BIERZELT-BANDITEN',
  'MOSH-PIT MAFIA',
  'PAVILLON-PIRATEN',
  'GLITZER GANG',
  'DOSEN-DRACHEN',
  'VOLLGAS VIKINGS',
  'NÜRBURG-NACHTSCHWÄRMER',
  'PYRO-POETEN',
  'KRAUTROCK-KRIEGER',
  'CAMPING-HYÄNEN',
  'BÜHNEN-BANDITEN',
  'SCHLAMM-SIRENEN',
  'TAPE-TORNADOS',
  'WODKA-WIKINGER',
  'PFAND-PHARAONEN',
  'FESTIVAL-FALKEN',
  'HEADBANG-HOOLIGANS',
  'BECHER-BARBAREN',
  'PYRAMIDEN-PUNKS',
  'STAGE-DIVE-STARS',
];

Object.assign(window, { RUDEL_THEME, RUDEL_CARDS, RUDEL_TEAM_NAMES });


