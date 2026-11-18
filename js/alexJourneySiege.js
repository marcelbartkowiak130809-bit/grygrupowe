const node = (id, x, icon, label, options = {}) => ({ id, x, y: 5, icon, label, ...options });

export const siegeItems = {
 bread: 'Chleb', map: 'Mapa', oak_planks: 'Dębowe deski', iron_ingot: 'Żelazo',
 stick: 'Patyk', string: 'Nić', shield: 'Tarcza', bow: 'Łuk', arrow: 'Strzała',
 flint: 'Krzemień', feather: 'Pióro', white_wool: 'Wełna', bell: 'Dzwon',
 chain: 'Łańcuch', tripwire_hook: 'Klucz do celi', lever: 'Korba',
};

export const siegeScenes = [
 {
  name: 'Co zostało w domu', region: 'DOM', look: 'home',
  goal: 'Znajdź drogę do twierdzy i zabierz zapasy.',
  hint: 'Alex zaznaczała nowe drogi na mapie przy półce. Obejrzyj ją i sprawdź skrzynię pod oknem.',
  finish: 'leave-home',
  nodes: [
   node('supply', 4, 'chest_minecart', 'Otwórz domową skrzynię', { give: { oak_planks: 9, iron_ingot: 1, bread: 2 }, message: 'Deski, żelazo i trochę prowiantu.' }),
   node('map', 10, 'map', 'Zabierz mapę Alex', { y: 4, give: { map: 1 }, message: 'Przy starej wieży Alex zaznaczyła boczne wejście.' }),
   node('leave-home', 14.4, 'oak_log', 'Otwórz wyjście na ścieżkę', { after: ['supply', 'map'], message: 'Ścieżka prowadzi do warsztatu.' }),
  ],
 }, {
  name: 'Tarcza na ostrzał', region: 'WARSZTAT', look: 'forge',
  goal: 'Ułóż sześć desek i sztabkę tak, żeby złożyć tarczę.',
  hint: 'Górny rząd: deska, sztabka, deska. Środkowy: trzy deski. Na dole tylko środkowa deska.',
  craft: { id: 'shield', grid: ['oak_planks','iron_ingot','oak_planks','oak_planks','oak_planks','oak_planks','','oak_planks',''] },
  finish: 'shield',
  nodes: [
   node('shield-bench', 8, 'smithing_table_front', 'Podejdź do stołu z tarczą', { opens: 'craft', message: 'Możesz układać recepturę na stole.' }),
  ],
 }, {
  name: 'Łuk i zapas strzał', region: 'FLETCHER', look: 'forge',
  goal: 'Zbierz części, zrób łuk i obrób dwie strzały.',
  hint: 'W recepturze łuku nić biegnie prawą kolumną. Patyki to środkowe pole góry i dołu oraz lewe pole środka. Krzemień i pióra przy stojaku posłużą do zrobienia strzał.',
  craft: { id: 'bow', grid: ['','stick','string','stick','','string','','stick','string'] },
  finish: 'arrows',
  nodes: [
   node('rods', 3, 'stick', 'Zabierz patyki', { give: { stick: 4 }, message: 'Cztery patyki. Jeden zostanie na strzały.' }),
   node('threads', 5.5, 'string', 'Zabierz szpulę nici', { y: 4, give: { string: 4 }, message: 'Masz nić do łuku i zapas na później.' }),
   node('bow-bench', 8, 'smithing_table_front', 'Podejdź do stołu łuczarza', { opens: 'craft', message: 'Stół gotowy do złożenia łuku.' }),
   node('fletching', 11, 'feather', 'Zbierz pióra i krzemień', { y: 4, give: { feather: 1, flint: 1 }, message: 'Z tym zrobisz strzały przy stojaku.' }),
   node('arrows', 14, 'arrow', 'Obrób dwie strzały', { after: ['bow', 'fletching'], take: { feather: 1, flint: 1, stick: 1 }, give: { arrow: 2 }, message: 'Łuk i dwie strzały są gotowe.' }),
  ],
 }, {
  name: 'Cichy pakunek', region: 'STARA STAJNIA', look: 'forge',
  goal: 'Owiń dzwon wełną. Odezwie się dopiero na dziedzińcu.',
  hint: 'Najpierw zbierz wełnę ze żłobu. Rozwiąż uwiąz, żeby zdjąć dzwon. Przy stole użyj nici.',
  finish: 'decoy',
  nodes: [
   node('wool', 4, 'white_wool', 'Zabierz dwie garście wełny', { give: { white_wool: 2 }, message: 'Wełna wytłumi dzwon podczas podejścia.' }),
   node('halter', 7, 'chain', 'Zwolnij stary uwiąz', { y: 4, message: 'Dzwon zsunął się na żłób.' }),
   node('old-bell', 9, 'bell', 'Podnieś dzwon', { after: ['halter'], give: { bell: 1 }, message: 'Owiń go, nim ruszysz do lasu.' }),
   node('decoy', 13, 'smithing_table_front', 'Owiń dzwon wełną i zwiąż nicią', { after: ['old-bell', 'wool'], use: 'string', take: { string: 1, white_wool: 2 }, message: 'Dzwon ucichł. Rozwiążesz go dopiero przy zasadzce.' }),
  ],
 }, {
  name: 'Szlak między ogniskami', region: 'POD TWIERDZĄ', look: 'woods',
  goal: 'Wybierz kamienie ze śladami Alex i dotrzyj do bocznej bramy.',
  hint: 'Odczytaj mapę. Jej trzy znaki wskazują kamienie. Jeśli trafisz na ślepy trop, zacznij od pierwszego znaku.',
  sequence: { id: 'path', order: ['leaf', 'star', 'crest'] },
  finish: 'supply-chain',
  nodes: [
   node('read-map', 2, 'map', 'Odczytaj mapę przy wejściu na szlak', { use: 'map', message: 'Ślady Alex: listek → gwiazda → tarcza.' }),
   node('path-star', 7.2, 'stone', 'Kamień z gwiazdą', { y: 5, mark: '✦', sequence: 'star', after: ['read-map'] }),
   node('path-leaf', 5.1, 'moss_block', 'Kamień z listkiem', { y: 4.5, mark: '❧', sequence: 'leaf', after: ['read-map'] }),
   node('path-crest', 11.7, 'stone_bricks', 'Kamień z tarczą', { y: 4.7, mark: '⛨', sequence: 'crest', after: ['read-map'] }),
   node('path-decoy', 9.6, 'cobblestone', 'Kamień z kółkiem', { y: 5.05, mark: '○', sequence: 'circle', after: ['read-map'] }),
   node('supply-chain', 14, 'chain', 'Zdejmij dwa kawałki łańcucha z bramy', { after: ['path'], give: { chain: 2 }, message: 'Przejście prowadzi prosto na dziedziniec.' }),
  ],
 }, {
  name: 'Pułapka na dziedzińcu', region: 'DZIEDZINIEC', look: 'yard',
  goal: 'Zwab patrol pod kratę i zamknij go w bocznym przejściu.',
  hint: 'Łańcuch zaczep o prowadnicę kraty. Zawieś i rozwiąż dzwon pod łukiem. Kiedy strażnicy się zbiegną, pociągnij dźwignię.',
  finish: 'trap',
  nodes: [
   node('trap-chain', 4, 'chain', 'Załóż łańcuch na prowadnicę', { y: 4, use: 'chain', take: { chain: 1 }, message: 'Krata jest podpięta do dźwigni.' }),
   node('trap-bell', 10, 'bell', 'Zawieś i rozwiąż dzwon', { y: 3.8, after: ['trap-chain'], use: 'bell', take: { bell: 1 }, message: 'Patrol pobiegł sprawdzić hałas!', effect: 'lure' }),
   node('trap', 7, 'lever', 'Zrzuć kratę za strażnikami', { after: ['trap-bell'], message: 'Patrol jest po drugiej stronie krat. Biegnij pod galerię.', effect: 'trap' }),
  ],
 }, {
  name: 'Pod ostrzałem galerii', region: 'GALERIA', look: 'gallery',
  goal: 'Przetrwaj salwę i traf w amarantowy przycisk nad pomostem.',
  hint: 'Zaznacz tarczę i kliknij osłonę przy wejściu. Po salwie zaznacz łuk i kliknij tarczę strzelniczą nad strażą.',
  finish: 'target',
  nodes: [
   node('cover', 4.5, 'shield', 'Osłoń się przed salwą', { use: 'shield', effect: 'block', message: 'Bełty odbiły się od tarczy. Masz chwilę na strzał.' }),
   node('target', 11.8, 'target_side', 'Traf strzałą w przycisk mostu', { y: 2.3, after: ['cover'], use: 'bow', take: { arrow: 1 }, effect: 'arrow', message: 'Pomost opadł i odciął strażnika na galerii.' }),
  ],
 }, {
  name: 'Przeciwwaga ze spiżarni', region: 'MAGAZYN', look: 'store',
  goal: 'Ustaw trzy zwrotnice i dociągnij ciężki wagon do wciągarki.',
  hint: 'Na tablicy nad torem jest trasa do wciągarki: góra, dół, góra. Każda dźwignia zmienia oznaczoną zwrotnicę. Potem podepnij łańcuch.',
  switches: { id: 'route', pattern: [true, false, true] },
  finish: 'crank',
  nodes: [
   node('inspect-track', 2.5, 'rail', 'Odczytaj tablicę nad torem', { y: 3, message: 'Trasa do magazynu kluczy: ↑ ↓ ↑.' }),
   node('rail-a', 5, 'lever', 'Zmień zwrotnicę pierwszą', { switch: 0, after: ['inspect-track'] }),
   node('rail-b', 7.5, 'lever', 'Zmień zwrotnicę drugą', { switch: 1, after: ['inspect-track'] }),
   node('rail-c', 10, 'lever', 'Zmień zwrotnicę trzecią', { switch: 2, after: ['inspect-track'] }),
   node('cart', 12.1, 'chest_minecart', 'Podepnij wagon z przeciwwagą', { after: ['route'], use: 'chain', take: { chain: 1 }, effect: 'cart', message: 'Ciężar naciągnął wciągarkę i uniósł skrytkę.' }),
   node('crank', 14.3, 'tripwire_hook', 'Weź klucz i korbę z dolnej skrytki', { y: 4, after: ['cart'], give: { tripwire_hook: 1, lever: 1 }, message: 'Klucz pasuje do klatki. Korbę zatrzymaj na drogę powrotną.' }),
  ],
 }, {
  name: 'Szyfr spod celi', region: 'LOCH', look: 'cell',
  goal: 'Odczytaj znaki Alex i otwórz zamek klatki.',
  hint: 'Alex podpowiada gestami. Kliknij jej sylwetkę i powtórz symbole od lewej do prawej. Na końcu użyj klucza na kracie.',
  sequence: { id: 'cipher', order: ['sun', 'quill', 'key'] },
  finish: 'free-alex',
  nodes: [
   node('signal', 13.6, 'alex', 'Odczytaj znaki od Alex', { actor: true, message: 'Alex rysuje na kurzu: słońce, pióro, klucz.' }),
   node('code-key', 4.2, 'tripwire_hook', 'Płytka z kluczem', { mark: '⅄', sequence: 'key', after: ['signal'] }),
   node('code-sun', 6.6, 'redstone_lamp', 'Płytka ze słońcem', { mark: '☼', sequence: 'sun', after: ['signal'] }),
   node('code-quill', 9, 'feather', 'Płytka z piórem', { mark: '✒', sequence: 'quill', after: ['signal'] }),
   node('free-alex', 12, 'iron_bars', 'Otwórz klatkę Alex kluczem', { after: ['cipher'], use: 'tripwire_hook', take: { tripwire_hook: 1 }, message: 'Alex jest wolna. Oboje słyszycie kroki na schodach.', effect: 'release' }),
  ],
 }, {
  name: 'Tylko jedno wyjście', region: 'GÓRNA WIEŻA', look: 'tower',
  goal: 'Otwórz okno, zanim strażnicy dojdą do wieży.',
  hint: 'Zostały deski na rampę. Użyj korby przy lewej podporze i poproś Alex, żeby przytrzymała mechanizm. Ostatnia strzała zwolni rygiel u góry.',
  finish: 'escape',
  nodes: [
   node('ramp', 5, 'oak_slab', 'Zbuduj rampę z trzech desek', { use: 'oak_planks', take: { oak_planks: 3 }, effect: 'release', message: 'Rampa prowadzi na wysokość okna.' }),
   node('wheel', 7.7, 'lever', 'Zamocuj korbę do podpory', { after: ['ramp'], use: 'lever', take: { lever: 1 }, message: 'Korba obraca się ciężko. Alex może ją przytrzymać.' }),
   node('hold', 10, 'alex', 'Poproś Alex o przytrzymanie korby', { after: ['wheel'], actor: true, message: 'Alex: „Mam ją. Teraz rygiel!”' }),
   node('latch', 13, 'target_side', 'Strzel w rygiel okna', { y: 2.7, after: ['hold'], use: 'bow', take: { arrow: 1 }, effect: 'arrow', message: 'Okno otwarte! Szeroki parapet jest nad fosą.' }),
   node('escape', 14.8, 'glass', 'Wyskocz z Alex przez okno', { y: 3.9, after: ['latch'], message: 'Alex: „Na trzy?” Steve: „Teraz.”' }),
  ],
 },
];

export function createSiege() {
 return { phase: 'intro', frame: 0, scene: 0, hero: 1.6, stock: {}, flags: {}, selected: '',
  grid: Array(9).fill(''), sequence: [], switches: [false, false, false],
  log: [], startedAt: 0, finishedAt: 0, steps: 0, message: '', effect: '' };
}

export function siegeCraftReady(state) {
 const recipe = siegeScenes[state.scene].craft;
 return !!recipe && recipe.grid.every((item, index) => item === state.grid[index]);
}

function record(state, action, now) {
 if (!state.startedAt) state.startedAt = now;
 state.steps++;
 state.log.push(action);
}

function countStock(state, items) {
 for (const [id, count] of Object.entries(items || {})) state.stock[id] = (state.stock[id] || 0) + count;
}

function performNode(state, scene, id) {
 const action = scene.nodes.find(item => item.id === id);
 if (!action || (state.flags[id] && action.switch === undefined && !action.opens)) return false;
 if (action.after?.some(flag => !state.flags[flag])) {
  state.message = 'Coś jeszcze blokuje ten ruch. Sprawdź cel albo wskazówkę.';
  return false;
 }
 if (action.use && (state.selected !== action.use || !(state.stock[action.use] > 0))) {
  state.message = `Wybierz w plecaku: ${siegeItems[action.use]}.`;
  return false;
 }
 if (Object.entries(action.take || {}).some(([item, count]) => (state.stock[item] || 0) < count)) {
  state.message = 'Brakuje składników.';
  return false;
 }
 state.hero = Math.max(1, action.x - 1.3);
 if (action.sequence) {
  const { id: solved, order } = scene.sequence;
  if (state.flags[solved]) return false;
  if (order[state.sequence.length] !== action.sequence) {
   state.sequence = [];
   state.message = scene.look === 'woods' ? 'Ślepy trop. Wróć do pierwszego znaku.' : 'Zamek kliknął i wrócił do początku.';
   state.effect = 'miss';
  } else {
   state.sequence.push(action.sequence);
   state.flags[solved] = state.sequence.length === order.length;
   state.message = state.flags[solved] ? (scene.look === 'woods' ? 'Znalazłeś właściwą ścieżkę.' : 'Szyfr pasuje. Użyj klucza.') : `Właściwy znak · ${state.sequence.length}/${order.length}`;
   state.effect = 'signal';
  }
 } else if (action.switch !== undefined) {
  state.switches[action.switch] = !state.switches[action.switch];
  state.flags[scene.switches.id] = scene.switches.pattern.every((value, index) => value === state.switches[index]);
  state.message = state.flags[scene.switches.id] ? 'Tor prowadzi do wciągarki.' : 'Zwrotnica przestawiona.';
  state.effect = 'signal';
 } else {
  countStock(state, Object.fromEntries(Object.entries(action.take || {}).map(([item, count]) => [item, -count])));
  countStock(state, action.give);
  if (!state.stock[state.selected]) state.selected = '';
  state.flags[id] = true;
  state.message = action.message;
  state.effect = action.effect || (action.give ? 'loot' : 'walk');
 }
 return true;
}

export function siegeAction(state, action, now = Date.now()) {
 const { type, id, index } = action || {};
 if (type === 'replay' && state.phase === 'result') {
  state.phase = 'outro'; state.frame = 0; state.log.push({ type });
  return true;
 }
 if (type === 'frame' && ['intro', 'outro'].includes(state.phase)) {
  if (state.frame < 2) state.frame++;
  else if (state.phase === 'intro') { state.phase = 'play'; state.message = siegeScenes[0].goal; }
  else state.phase = 'result';
  state.log.push({ type });
  return true;
 }
 if (state.phase !== 'play') return false;
 const scene = siegeScenes[state.scene];
 if (type === 'select') {
  if (!Object.hasOwn(siegeItems, id) || !(state.stock[id] > 0)) return false;
  state.selected = state.selected === id ? '' : id;
  state.log.push({ type, id });
  return true;
 }
 if (type === 'node') {
  if (!performNode(state, scene, id)) return false;
  record(state, { type, id }, now);
  if (id === 'escape') {
   state.phase = 'outro'; state.frame = 0; state.finishedAt = now;
  }
  return true;
 }
 if (type === 'slot' && scene.craft && !state.flags[scene.finish] && scene.nodes.some(node => node.opens && state.flags[node.id])) {
  if (!Number.isInteger(index) || index < 0 || index >= 9) return false;
  const current = state.grid[index], selected = state.selected;
  if (!current && !(state.stock[selected] > 0)) return false;
  if (current) countStock(state, { [current]: 1 });
  if (current && current === selected || !(state.stock[selected] > 0)) state.grid[index] = '';
  else { state.grid[index] = selected; countStock(state, { [selected]: -1 }); }
  state.effect = 'signal';
  record(state, { type, index }, now);
  return true;
 }
 if (type === 'craft' && !state.flags[scene.finish] && siegeCraftReady(state)) {
  const item = scene.craft.id;
  countStock(state, { [item]: 1 });
  state.grid.fill('');
  state.flags[item] = true;
  state.selected = item;
  state.effect = 'loot';
  state.message = item === 'bow' ? 'Łuk gotowy do użycia.' : 'Tarcza gotowa do użycia.';
  record(state, { type }, now);
  return true;
 }
 if (type === 'next' && state.flags[scene.finish] && state.scene < siegeScenes.length - 1) {
  state.scene++; state.hero = 1.6;
  state.grid.fill(''); state.sequence = []; state.switches = [false, false, false];
  state.effect = 'walk'; state.message = siegeScenes[state.scene].goal;
  record(state, { type }, now);
  return true;
 }
 return false;
}

export function saveSiege(state) {
 return JSON.stringify({ version: 1, log: state.log, startedAt: state.startedAt, finishedAt: state.finishedAt });
}

export function restoreSiege(raw, now = Date.now()) {
 const state = createSiege();
 try {
  const saved = JSON.parse(raw || 'null');
  if (saved?.version !== 1 || !Array.isArray(saved.log) || saved.log.length > 5000) return state;
  for (const action of saved.log) if (!siegeAction(state, action, now)) return createSiege();
  if (state.startedAt && saved.startedAt > 0 && saved.startedAt <= now) state.startedAt = saved.startedAt;
  if (state.finishedAt && saved.finishedAt >= state.startedAt && saved.finishedAt <= now) state.finishedAt = saved.finishedAt;
  state.effect = '';
  return state;
 } catch { return createSiege(); }
}
