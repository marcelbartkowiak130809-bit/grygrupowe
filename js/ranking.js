import { $, boardPlayerStripHtml, escapeHtml, playerMiniHtml, resultPlayerMiniHtml } from "./utils.js?v=20260903-7";
import { Effects } from "./effects.js";

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || min));
const arrayOrEmpty = value => Array.isArray(value) ? value : [];
const objectOrEmpty = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const shuffle = items => [...items].sort(() => Math.random() - .5);

export const rankingCategories = [
  { id:"food", name:"Jedzenie", sets:[
    ["Pizza","Kebab","Hamburger","Hot Dog"],
    ["Sushi","Ramen","Pierogi","Taco"],
    ["Lody","Czekolada","Ciasto","Popcorn"],
    ["Frytki","Nuggetsy","Zapiekanka","Nachosy"],
    ["Rosol","Pomidorowa","Zurek","Barszcz"],
    ["Burger","Pizza","Sushi","Ramen"],
    ["Chipsy","Paluszki","Orzeszki","Popcorn"],
    ["Nalesniki","Gofry","Racuchy","Tosty"],
    ["Truskawki","Arbuz","Mango","Winogrona"],
    ["Kawa","Herbata","Kakao","Lemoniada"],
    ["Owsianka","Jajecznica","Kanapki","Płatki"],
    ["Lasagne","Spaghetti","Carbonara","Ravioli"],
    ["Sernik","Szarlotka","Brownie","Tiramisu"],
    ["Czosnek","Chili","Pieprz","Cynamon"],
    ["Śniadanie","Obiad","Kolacja","Deser"],
  ] },
  { id:"games", name:"Gry", sets:[
    ["Minecraft","Fortnite","Roblox","GTA"],
    ["Mario Kart","FIFA","Rocket League","Forza"],
    ["Among Us","Brawl Stars","Clash Royale","Fall Guys"],
    ["Elden Ring","Wiedzmin","Skyrim","Cyberpunk"],
    ["Valorant","Counter-Strike","Overwatch","Apex Legends"],
    ["The Sims","Stardew Valley","Animal Crossing","Terraria"],
    ["League of Legends","Dota 2","Hearthstone","Teamfight Tactics"],
    ["Genshin Impact","Honkai Star Rail","Pokemon","Zelda"],
    ["Portal","Hades","Hollow Knight","Cuphead"],
    ["Need for Speed","Forza","Gran Turismo","Mario Kart"],
    ["The Last of Us","Red Dead Redemption","God of War","Uncharted"],
    ["Pokemon Go","Pokemon Unite","Pokemon Sleep","Pokemon Legends"],
    ["Super Mario","Sonic","Kirby","Donkey Kong"],
    ["Wiedźmin 3","Baldur's Gate 3","Divinity Original Sin 2","Dragon Age"],
    ["Overcooked","It Takes Two","A Way Out","Human Fall Flat"],
  ] },
  { id:"animals", name:"Zwierzeta", sets:[
    ["Pies","Kot","Krolik","Chomik"],
    ["Lew","Tygrys","Wilk","Niedzwiedz"],
    ["Delfin","Pingwin","Zolw","Foka"],
    ["Slon","Zyrafa","Panda","Koala"],
    ["Lis","Sowa","Jelen","Borsuk"],
    ["Rekin","Osmiornica","Krab","Meduza"],
    ["Papuga","Kanarek","Kruk","Orzel"],
    ["Kangur","Leniwiec","Alpaka","Kapibara"],
    ["Mysz","Szczur","Jeż","Wiewiórka"],
    ["Koń","Krowa","Świnia","Owca"],
    ["Żaba","Jaszczurka","Wąż","Kameleon"],
    ["Motyl","Pszczoła","Biedronka","Ważka"],
    ["Goryl","Szympans","Orangutan","Lemur"],
  ] },
  { id:"movies", name:"Filmy", sets:[
    ["Shrek","Avatar","Titanic","Barbie"],
    ["Star Wars","Harry Potter","Matrix","Avengers"],
    ["Toy Story","Krol Lew","Kraina lodu","Minionki"],
    ["Batman","Spider-Man","Iron Man","Deadpool"],
    ["Interstellar","Incepcja","Diuna","Oppenheimer"],
    ["Forrest Gump","Gladiator","Rocky","Top Gun"],
    ["Madagaskar","Kung Fu Panda","Auta","Ratatouille"],
    ["John Wick","Mission Impossible","James Bond","Szybcy i wsciekli"],
    ["Hobbit","Wladca Pierscieni","Piraci z Karaibow","Jurassic Park"],
    ["Kac Vegas","Drużyna A","American Pie","Projekt X"],
    ["Kung Fu Panda","Jak wytresować smoka","Shrek","Epoka lodowcowa"],
    ["Szczęki","Obcy","To","Krzyk"],
    ["Zielona mila","Skazani na Shawshank","Nietykalni","Lista Schindlera"],
    ["WALL-E","Nemo","Coco","Vaiana"],
  ] },
  { id:"powers", name:"Supermoce", sets:[
    ["Latanie","Niewidzialnosc","Teleportacja","Czytanie w myslach"],
    ["Supersila","Zatrzymanie czasu","Leczenie","Kontrola ognia"],
    ["Oddychanie pod woda","Zmiana ksztaltu","Laserowy wzrok","Szybkosc"],
    ["Kontrola pogody","Telekineza","Klonowanie","Pole silowe"],
    ["Nieomylnosc","Szczescie","Pamiec absolutna","Rozmowa ze zwierzetami"],
    ["Podroz w czasie","Nieśmiertelnosc","Kontrola snu","Przewidywanie przyszlosci"],
    ["Magnetyzm","Kontrola roslin","Iluzje","Nadludzki sluch"],
    ["Tworzenie portali","Oddychanie w kosmosie","Zmiana rozmiaru","Zamiana w cien"],
    ["Kontrola lodu","Kontrola wody","Kontrola ziemi","Kontrola powietrza"],
    ["Superinteligencja","Superrefleks","Superwzrok","Superpamięć"],
    ["Rozmowa z maszynami","Rozmowa z duchami","Rozmowa z roślinami","Rozmowa z kosmitami"],
    ["Kopiowanie mocy","Wygaszanie mocy","Wzmacnianie mocy","Kradzież mocy"],
    ["Szczęśliwy przypadek","Zmiana przeszłości","Zmiana przyszłości","Zatrzymanie starzenia"],
  ] },
  { id:"holidays", name:"Wakacje", sets:[
    ["Morze","Gory","Miasto","Jezioro"],
    ["Hotel","Namiot","Kamper","Apartament"],
    ["Basen","Plaza","Zwiedzanie","Park rozrywki"],
    ["Lody","Pamiatki","Zdjecia","Ognisko"],
    ["Samolot","Pociag","Auto","Autobus"],
    ["Hiszpania","Wlochy","Grecja","Chorwacja"],
    ["All inclusive","Road trip","City break","Kemping"],
    ["Snorkeling","Kajaki","Wspinaczka","Rower"],
    ["Muzeum","Galeria","Zamek","Latarnia morska"],
    ["Paszport","Walizka","Mapa","Przewodnik"],
    ["Wschód słońca","Zachód słońca","Nocne zwiedzanie","Drzemka"],
    ["Egipt","Japonia","Norwegia","Australia"],
    ["Leżak","Ręcznik","Krem z filtrem","Okulary przeciwsłoneczne"],
  ] },
  { id:"school", name:"Szkola", sets:[
    ["Przerwa","WF","Matematyka","Historia"],
    ["Sprawdzian","Kartkowka","Projekt","Odpowiedz ustna"],
    ["Plecak","Zeszyt","Tablica","Dziennik"],
    ["Wycieczka","Dzien sportu","Apel","Zastepstwo"],
    ["Polski","Angielski","Biologia","Geografia"],
    ["Siedzenie z tylu","Siedzenie z przodu","Lawka przy oknie","Lawka przy drzwiach"],
    ["Kanapka","Drozdzowka","Energetyk","Woda"],
    ["Nauczyciel luzak","Nauczyciel kosa","Wychowawca","Dyrektor"],
    ["Ołówek","Długopis","Flamaster","Zakreślacz"],
    ["Biblioteka","Stołówka","Sala gimnastyczna","Boisko"],
    ["Fizyka","Chemia","Informatyka","Plastyka"],
    ["Lektura","Notatka","Ściąga","Podręcznik"],
    ["Samorząd","Klasa","Kółko zainteresowań","Zawody szkolne"],
  ] },
  { id:"apps", name:"Aplikacje", sets:[
    ["TikTok","YouTube","Instagram","Spotify"],
    ["Discord","Messenger","WhatsApp","Snapchat"],
    ["Netflix","Twitch","Steam","Allegro"],
    ["Mapy","Kalendarz","Notatki","Pogoda"],
    ["CapCut","Canva","Pinterest","Picsart"],
    ["Duolingo","Quizlet","Notion","ChatGPT"],
    ["Uber","Bolt","Jakdojade","Google Maps"],
    ["BLIK","Revolut","PayPal","mObywatel"],
    ["Vinted","OLX","Aliexpress","Amazon"],
    ["Steam","Epic Games","GOG","GeForce Now"],
    ["Google Drive","Dropbox","OneDrive","iCloud"],
    ["Zoom","Teams","Google Meet","Skype"],
    ["Strava","Fitbit","Google Fit","Garmin"],
  ] },
  { id:"music", name:"Muzyka", sets:[
    ["Pop","Rap","Rock","Elektronika"],
    ["Koncert","Festiwal","Domowka","Sluchawki w autobusie"],
    ["Gitara","Perkusja","Pianino","Skrzypce"],
    ["Refren","Bit","Solo","Drop"],
    ["Spotify","YouTube Music","Apple Music","SoundCloud"],
    ["Karaoke","Taniec","Freestyle","Remix"],
    ["Album","Singiel","EP","Playlista"],
    ["Bas","Wokal","Tekst","Melodia"],
    ["Saksofon","Trąbka","Flet","Wiolonczela"],
    ["Jazz","Blues","Metal","Reggae"],
    ["Intro","Zwrotka","Bridge","Outro"],
    ["DJ set","Winyl","Kaseta","Płyta CD"],
    ["Nuty","Tempo","Rytm","Akordy"],
  ] },
  { id:"internet", name:"Internet", sets:[
    ["Mem","Shorts","Stream","Podcast"],
    ["Komentarze","Reakcje","Udostepnienia","Polubienia"],
    ["YouTube","TikTok","Instagram","Twitch"],
    ["Discord","Reddit","X","Facebook"],
    ["Influencer","Streamer","Youtuber","Tiktoker"],
    ["Tutorial","Recenzja","Gameplay","Vlog"],
    ["Spam","Clickbait","Drama","Spoiler"],
    ["Emoji","GIF","Sticker","Reakcja"],
    ["Hashtag","Trend","Viral","Algorytm"],
    ["Profil","Bio","Awatar","Nazwa użytkownika"],
    ["Powiadomienie","Wiadomość","Połączenie","Komentarz"],
    ["Link","Kod QR","Nazwa domeny","Przeglądarka"],
    ["Memy","Fanart","Teoria","Parodia"],
  ] },
  { id:"party", name:"Impreza", sets:[
    ["Planszowki","Karaoke","Kalambury","Quiz"],
    ["Pizza","Chipsy","Nachosy","Popcorn"],
    ["Muzyka","Swiatla","Dekoracje","Zdjecia"],
    ["Domowka","Grill","Ognisko","Urodziny"],
    ["Taniec","Rozmowy","Gry","Jedzenie"],
    ["DJ","Playlista","Glosnik","Mikrofon"],
    ["Sok","Cola","Woda","Lemoniada"],
    ["Kanapa","Kuchnia","Balkon","Ogrod"],
    ["Zaproszenie","Lista gości","Gospodarz","Sąsiad"],
    ["Tort","Świeczki","Prezent","Kartka"],
    ["Kostium","Maska","Brokat","Balony"],
    ["Przekąski","Talerzyki","Kubki","Serwetki"],
    ["Tańce","Śmiech","Zdjęcia grupowe","Wspomnienia"],
  ] },
  { id:"life", name:"Zycie", sets:[
    ["Spanie","Jedzenie","Granie","Scrollowanie"],
    ["Poranek","Poludnie","Wieczor","Noc"],
    ["Kino","Restauracja","Spacer","Zakupy"],
    ["Praca","Szkola","Wolne","Wakacje"],
    ["Oszczedzanie","Wydawanie","Planowanie","Improwizacja"],
    ["Telefon","Laptop","Sluchawki","Powerbank"],
    ["Porzadek","Chaos","Minimalizm","Kolekcjonowanie"],
    ["Szczescie","Spokoj","Adrenalina","Ambicja"],
    ["Gotowanie","Sprzątanie","Pranie","Zakupy"],
    ["Autobus","Tramwaj","Pociąg","Rower"],
    ["Książka","Serial","Film","Podcast"],
    ["Budzik","Kalendarz","Lista zadań","Przypomnienie"],
    ["Przyjaźń","Rodzina","Związek","Samotność"],
  ] },
  { id:"brands", name:"Marki", sets:[
    ["Nike","Adidas","Puma","New Balance"],
    ["Apple","Samsung","Xiaomi","Sony"],
    ["McDonalds","KFC","Burger King","Subway"],
    ["Netflix","Spotify","YouTube","Twitch"],
    ["Lego","IKEA","Zara","Reserved"],
    ["Coca-Cola","Pepsi","Fanta","Sprite"],
    ["PlayStation","Xbox","Nintendo","Steam"],
    ["BMW","Mercedes","Audi","Toyota"],
    ["Adidas","Nike","Reebok","Converse"],
    ["Oral-B","Colgate","Nivea","Dove"],
    ["Lidl","Biedronka","Żabka","Kaufland"],
    ["Ikea","Jysk","Agata Meble","Leroy Merlin"],
    ["Ford","Volkswagen","Skoda","Honda"],
  ] },
  { id:"would-you-rather", name:"Co wybierasz", sets:[
    ["Zawsze lato","Zawsze zima","Zawsze wiosna","Zawsze jesien"],
    ["Teleportacja","Latanie","Niewidzialnosc","Czytanie mysli"],
    ["Pizza codziennie","Sushi codziennie","Kebab codziennie","Makaron codziennie"],
    ["Bez telefonu","Bez sluchawek","Bez internetu","Bez slodyczy"],
    ["Super bogaty","Super slawny","Super madry","Super szczesliwy"],
    ["Mieszkac w miescie","Mieszkac nad morzem","Mieszkac w gorach","Mieszkac za granica"],
    ["Umiec spiewac","Umiec tanczyc","Umiec rysowac","Umiec gotowac"],
    ["Wygrac quiz","Wygrac turniej","Wygrac konkurs","Wygrac wyscig"],
    ["Mieć dużo czasu","Mieć dużo pieniędzy","Mieć dużo energii","Mieć dużo szczęścia"],
    ["Podróżować samemu","Podróżować z rodziną","Podróżować ze znajomymi","Podróżować z partnerem"],
    ["Znać przyszłość","Znać przeszłość","Zmienić teraźniejszość","Nie wiedzieć nic"],
    ["Mieszkać wysoko","Mieszkać pod ziemią","Mieszkać na łodzi","Mieszkać w lesie"],
    ["Zawsze mówić prawdę","Zawsze mieć rację","Zawsze wygrywać","Zawsze mieć wybór"],
  ] },
];

export const rankingDefaults = {
  rounds:8,
  targetScore:20,
  categories:["food","games","animals","movies","powers","holidays","school","apps","music","internet","party","life","brands","would-you-rather"],
};

const categoryMap = Object.fromEntries(rankingCategories.map(category => [category.id, category]));

// Kolejność układana przez gracza jest roboczym stanem UI. Nie zapisujemy jej do
// pokoju przed kliknięciem „Zapisz ranking”, ale musimy zachować ją między
// renderami wywołanymi przez synchronizację odpowiedzi innych graczy.
const rankingDrafts = new Map();

function rankingDraftKey(room, game, currentUser) {
  return `${room.roomId}:${game.round || 1}:${game.set?.id || "set"}:${currentUser}`;
}

function validRankingOrder(order, ids) {
  return Array.isArray(order) && order.length === ids.length && new Set(order).size === ids.length && order.every(id => ids.includes(id));
}

function rememberRankingDraft(key, order) {
  rankingDrafts.set(key, [...order]);
  if (rankingDrafts.size > 40) rankingDrafts.delete(rankingDrafts.keys().next().value);
}

export function sanitizeRankingSettings(raw = {}) {
  const selected = [...new Set(arrayOrEmpty(raw.categories).filter(id => categoryMap[id]))];
  const categories = selected.length ? selected : rankingDefaults.categories;
  return {
    ...rankingDefaults,
    ...raw,
    rounds:clamp(raw.rounds || rankingDefaults.rounds, 3, 20),
    targetScore:clamp(raw.targetScore || rankingDefaults.targetScore, 5, 80),
    categories,
  };
}

function itemId(categoryId, setIndex, itemIndex) {
  return `${categoryId}:${setIndex}:${itemIndex}`;
}

function setPool(settings, used = []) {
  const blocked = new Set(arrayOrEmpty(used));
  const selected = sanitizeRankingSettings(settings).categories;
  const pool = selected.flatMap(id => (categoryMap[id]?.sets || []).map((items, index) => ({
    id:`${id}:${index}`,
    categoryId:id,
    categoryName:categoryMap[id].name,
    items:items.map((label, itemIndex) => ({ id:itemId(id, index, itemIndex), label })),
  })));
  const fresh = pool.filter(set => !blocked.has(set.id));
  return fresh.length ? fresh : pool;
}

function chooseSet(settings, used) {
  const pool = setPool(settings, used);
  return pool[Math.floor(Math.random() * pool.length)] || setPool(rankingDefaults, [])[0];
}

function makeRound(players, settings, round, scores = {}, usedSets = []) {
  const set = chooseSet(settings, usedSets);
  return {
    phase:"ranking",
    round,
    set,
    baseOrder:shuffle(set.items.map(item => item.id)),
    usedSets:[...arrayOrEmpty(usedSets), set.id],
    submissions:{},
    scores:{ ...Object.fromEntries(players.map(uid => [uid, 0])), ...scores },
    groupRanking:[],
    similarity:[],
    roundScores:{},
    revealedAt:null,
  };
}

export function createRankingGame(players, rawSettings) {
  return makeRound(players, sanitizeRankingSettings(rawSettings), 1);
}

function normalize(game, players = []) {
  game.submissions = objectOrEmpty(game.submissions);
  game.scores = objectOrEmpty(game.scores);
  game.roundScores = objectOrEmpty(game.roundScores);
  game.groupRanking = arrayOrEmpty(game.groupRanking);
  game.similarity = arrayOrEmpty(game.similarity).filter(row => players.includes(row.uid));
  game.usedSets = arrayOrEmpty(game.usedSets);
  game.baseOrder = arrayOrEmpty(game.baseOrder);
  players.forEach(uid => { if (!(uid in game.scores)) game.scores[uid] = 0; });
  Object.keys(game.scores).forEach(uid => { if (!players.includes(uid)) delete game.scores[uid]; });
  Object.keys(game.submissions).forEach(uid => { if (!players.includes(uid)) delete game.submissions[uid]; });
  return game;
}

function scoreRound(game, players, settings) {
  const ids = game.set.items.map(item => item.id);
  const averages = ids.map(id => {
    const positions = players.map(uid => arrayOrEmpty(game.submissions?.[uid]).indexOf(id)).filter(index => index >= 0).map(index => index + 1);
    const avg = positions.reduce((sum, value) => sum + value, 0) / Math.max(1, positions.length);
    return { id, avg };
  }).sort((a, b) => a.avg - b.avg || ids.indexOf(a.id) - ids.indexOf(b.id));
  const groupPositions = Object.fromEntries(averages.map((row, index) => [row.id, index + 1]));
  const similarity = players.map(uid => {
    const order = arrayOrEmpty(game.submissions?.[uid]);
    const distance = ids.reduce((sum, id) => sum + Math.abs((order.indexOf(id) + 1 || ids.length) - groupPositions[id]), 0);
    return { uid, distance };
  }).sort((a, b) => a.distance - b.distance);
  let place = 0;
  let previousDistance = null;
  game.similarity = similarity.map((row, index) => {
    if (previousDistance === null || row.distance !== previousDistance) place = index + 1;
    previousDistance = row.distance;
    return { ...row, place, points:Math.max(1, players.length - place + 1) };
  });
  game.groupRanking = averages;
  game.roundScores = {};
  game.similarity.forEach(row => {
    game.roundScores[row.uid] = row.points;
    game.scores[row.uid] = Number(game.scores?.[row.uid] || 0) + row.points;
  });
  game.phase = "roundResult";
  game.revealedAt = Date.now();
  const maxScore = Math.max(0, ...Object.values(game.scores || {}).map(Number));
  if (Number(game.round) >= Number(settings.rounds) || maxScore >= Number(settings.targetScore)) {
    game.phase = "gameSummary";
    game.result = { gameOver:true };
  }
}

export const RankingEngine = {
  submit(game, uid, order, players, rawSettings) {
    const settings = sanitizeRankingSettings(rawSettings);
    normalize(game, players);
    if (game.phase !== "ranking") return "Ta runda jest juz zamknieta.";
    if (!players.includes(uid)) return "Nie ma cie w tej rundzie.";
    if (uid in game.submissions) return "Twoj ranking jest juz zapisany.";
    const ids = game.set.items.map(item => item.id);
    const cleaned = arrayOrEmpty(order).filter(id => ids.includes(id));
    if (new Set(cleaned).size !== ids.length) return "Uloz wszystkie elementy.";
    game.submissions[uid] = cleaned;
    if (players.every(player => player in game.submissions)) scoreRound(game, players, settings);
    return null;
  },
  nextRound(game, players, rawSettings) {
    const settings = sanitizeRankingSettings(rawSettings);
    normalize(game, players);
    if (game.phase !== "roundResult") return "Najpierw trzeba zobaczyc ranking grupy.";
    Object.assign(game, makeRound(players, settings, Number(game.round || 1) + 1, game.scores, game.usedSets));
    return null;
  },
};

export function renderRankingLobbySettings(room, isHost) {
  const settings = sanitizeRankingSettings(room.settings);
  const selected = settings.categories;
  return `<div class="impostor-settings-grid ranking-settings-grid">
    <label>Liczba rund<select data-ranking-setting="rounds" ${isHost ? "" : "disabled"}>${[3,5,8,10,12,15,20].map(n => `<option value="${n}" ${settings.rounds === n ? "selected" : ""}>${n}</option>`).join("")}</select></label>
    <label>Punkty do wygranej<select data-ranking-setting="targetScore" ${isHost ? "" : "disabled"}>${[10,15,20,25,30,40,60,80].map(n => `<option value="${n}" ${settings.targetScore === n ? "selected" : ""}>${n}</option>`).join("")}</select></label>
    <div class="most-category-box"><b>Kategorie</b><small>baza: ${rankingCategories.reduce((sum, category) => sum + category.sets.length, 0)} list</small><div class="multi-category-list">${rankingCategories.map(category => {
      const disabled = !isHost || selected.includes(category.id) && selected.length <= 1;
      return `<label class="check category-chip"><input data-ranking-category="${category.id}" type="checkbox" ${selected.includes(category.id) ? "checked" : ""} ${disabled ? "disabled" : ""}> <span>${escapeHtml(category.name)}</span><span class="category-count">${category.sets.length}</span></label>`;
    }).join("")}</div></div>
  </div>`;
}

function itemLabel(game, id) {
  return game.set.items.find(item => item.id === id)?.label || id;
}

function rankingList(game, currentUser, draftOrder) {
  const submitted = currentUser in objectOrEmpty(game.submissions);
  const ids = game.set.items.map(item => item.id);
  const fallback = arrayOrEmpty(game.baseOrder).length ? game.baseOrder : ids;
  const order = submitted ? game.submissions[currentUser] : validRankingOrder(draftOrder, ids) ? draftOrder : fallback;
  return `<div class="ranking-sorter ${submitted ? "ranking-locked" : ""}" id="ranking-sorter">${order.map((id, index) => `<article class="ranking-tile" draggable="${submitted ? "false" : "true"}" data-rank-id="${escapeHtml(id)}">
    <b>${index + 1}</b><span>${escapeHtml(itemLabel(game, id))}</span><div class="ranking-move-buttons"><button type="button" data-rank-move="up" ${submitted || index === 0 ? "disabled" : ""}>&uarr;</button><button type="button" data-rank-move="down" ${submitted || index === order.length - 1 ? "disabled" : ""}>&darr;</button></div>
  </article>`).join("")}</div>`;
}

function rankingStage(room, accounts, currentUser, game, draftOrder) {
  const done = Object.keys(game.submissions || {}).length;
  const submitted = currentUser in objectOrEmpty(game.submissions);
  return `<section class="ranking-stage">
    <div class="ranking-prompt">
      <p class="eyebrow">${escapeHtml(game.set?.categoryName || "Kategoria")} - runda ${Number(game.round) || 1}</p>
      <h1>Uloz ranking</h1>
      <p>Przeciagnij elementy od najlepszego do najslabszego.</p>
      <div class="truth-progress"><span style="width:${Math.round(done / Math.max(1, room.players.length) * 100)}%"></span></div>
      <small>${done}/${room.players.length} rankingow zapisanych</small>
    </div>
    <div class="ranking-play-area">${rankingList(game, currentUser, draftOrder)}${submitted ? `<div class="waiting-state ranking-waiting"><span class="waiting-pulse">OK</span><h3>Ranking zapisany</h3><p>Czekamy na reszte ekipy.</p></div>` : `<button class="primary big" id="ranking-submit">Zapisz ranking</button>`}</div>
    <div class="truth-answer-grid">${room.players.map(uid => `<article class="${uid in objectOrEmpty(game.submissions) ? "answered" : ""}">${playerMiniHtml(accounts[uid])}<b>${uid in objectOrEmpty(game.submissions) ? "Gotowe" : "Uklada..."}</b></article>`).join("")}</div>
  </section>`;
}

function resultStage(room, accounts, game) {
  const maxDistance = Math.max(1, ...arrayOrEmpty(game.similarity).map(row => Number(row.distance) || 0));
  return `<section class="ranking-stage ranking-reveal">
    <div class="ranking-prompt reveal-card"><p class="eyebrow">${escapeHtml(game.set?.categoryName || "Kategoria")} - ranking grupy</p><h1>Ranking grupowy</h1></div>
    <div class="group-ranking-list">${arrayOrEmpty(game.groupRanking).map((row, index) => `<article style="--delay:${index}"><b>#${index + 1}</b><span>${escapeHtml(itemLabel(game, row.id))}</span><small>srednia pozycja ${Number(row.avg).toLocaleString("pl-PL", { maximumFractionDigits:2 })}</small></article>`).join("")}</div>
    <div class="ranking-similarity">${arrayOrEmpty(game.similarity).map((row, index) => {
      const closeness = Math.max(0, Math.round((1 - (Number(row.distance) || 0) / maxDistance) * 100));
      return `<article class="${index === 0 ? "closest" : ""}" style="--truth:${closeness}">
        <div class="truth-bar-head"><b>#${row.place}</b>${resultPlayerMiniHtml(accounts[row.uid], Number(row.points) > 0 ? "win" : "lose")}<strong>+${row.points} pkt</strong></div>
        <div class="truth-scale"><span></span></div>
        <div class="truth-values"><span>podobienstwo ${closeness}%</span><span>roznica pozycji: ${row.distance}</span></div>
      </article>`;
    }).join("")}</div>
    <div class="truth-round-ranking final-ranking">${room.players.slice().sort((a,b)=>Number(game.scores?.[b]||0)-Number(game.scores?.[a]||0)).map((uid,index,rows)=>{const topScore=Math.max(0,...rows.map(player=>Number(game.scores?.[player]||0)));return `<article class="${Number(game.scores?.[uid]||0)===topScore&&topScore>0?"winner-card":""}"><b>#${index + 1}</b>${resultPlayerMiniHtml(accounts[uid], Number(game.scores?.[uid]||0)===topScore&&topScore>0 ? "win" : "lose")}<strong>${Number(game.scores?.[uid] || 0)} pkt</strong></article>`;}).join("")}</div>
    <button class="primary" id="ranking-next-round">Nastepna runda</button>
  </section>`;
}

function summaryStage(room, accounts, game) {
  const max = Math.max(0, ...Object.values(game.scores || {}).map(Number));
  const winners = max > 0 ? room.players.filter(uid => Number(game.scores?.[uid] || 0) === max) : [];
  Effects.play("roundWin", `${room.roomId}:ranking:summary`);
  return `<section class="ranking-stage ranking-summary"><p class="eyebrow">KONIEC GRY</p><h1>${winners.map(uid => escapeHtml(accounts[uid]?.nick || "Gracz")).join(", ")} zna gust grupy</h1><div class="final-ranking">${room.players.slice().sort((a,b)=>Number(game.scores?.[b]||0)-Number(game.scores?.[a]||0)).map((uid,index)=>`<article class="${winners.includes(uid) ? "winner-card" : ""}"><b>#${index + 1}</b>${resultPlayerMiniHtml(accounts[uid], winners.includes(uid) ? "win" : "lose")}<strong>${Number(game.scores?.[uid] || 0)} pkt</strong></article>`).join("")}</div><button class="primary" id="ranking-lobby">Wroc do lobby</button></section>`;
}

function refreshTileNumbers(list) {
  [...list.querySelectorAll(".ranking-tile")].forEach((tile, index, tiles) => {
    tile.querySelector("b").textContent = String(index + 1);
    const up = tile.querySelector('[data-rank-move="up"]');
    const down = tile.querySelector('[data-rank-move="down"]');
    if (up) up.disabled = index === 0;
    if (down) down.disabled = index === tiles.length - 1;
  });
}

function setupRankingDrag(root, onChange) {
  const list = $("#ranking-sorter", root);
  if (!list || list.classList.contains("ranking-locked")) return;
  const changed = () => { refreshTileNumbers(list); onChange?.([...list.querySelectorAll(".ranking-tile")].map(tile => tile.dataset.rankId)); };
  let dragged = null;
  list.addEventListener("dragstart", event => {
    dragged = event.target.closest(".ranking-tile");
    if (!dragged) return;
    dragged.classList.add("dragging");
    event.dataTransfer?.setData("text/plain", dragged.dataset.rankId || "");
    if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
  });
  list.addEventListener("dragover", event => {
    event.preventDefault();
    const target = event.target.closest(".ranking-tile");
    if (!dragged || !target || target === dragged) return;
    const rect = target.getBoundingClientRect();
    list.insertBefore(dragged, event.clientY < rect.top + rect.height / 2 ? target : target.nextSibling);
    changed();
  });
  list.addEventListener("dragend", () => { dragged?.classList.remove("dragging"); dragged = null; changed(); });
  let pointerTile = null;
  list.addEventListener("pointerdown", event => {
    if (event.target.closest("button")) return;
    pointerTile = event.target.closest(".ranking-tile");
    if (!pointerTile) return;
    pointerTile.setPointerCapture?.(event.pointerId);
    pointerTile.classList.add("dragging");
  });
  list.addEventListener("pointermove", event => {
    if (!pointerTile) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest(".ranking-tile");
    if (!target || target === pointerTile || !list.contains(target)) return;
    const rect = target.getBoundingClientRect();
    list.insertBefore(pointerTile, event.clientY < rect.top + rect.height / 2 ? target : target.nextSibling);
    changed();
  });
  list.addEventListener("pointerup", event => {
    pointerTile?.releasePointerCapture?.(event.pointerId);
    pointerTile?.classList.remove("dragging");
    pointerTile = null;
    changed();
  });
  list.addEventListener("click", event => {
    const button = event.target.closest("[data-rank-move]");
    if (!button) return;
    const tile = button.closest(".ranking-tile");
    if (button.dataset.rankMove === "up" && tile.previousElementSibling) list.insertBefore(tile, tile.previousElementSibling);
    if (button.dataset.rankMove === "down" && tile.nextElementSibling) list.insertBefore(tile.nextElementSibling, tile);
    changed();
  });
}

export function renderRankingGame(root, { room, accounts, currentUser }, actions) {
  const game = normalize(room.game, room.players);
  const draftKey = rankingDraftKey(room, game, currentUser);
  const submitted = currentUser in objectOrEmpty(game.submissions);
  if (submitted) rankingDrafts.delete(draftKey);
  const draftOrder = submitted ? null : rankingDrafts.get(draftKey);
  const stage = game.phase === "ranking" ? rankingStage(room, accounts, currentUser, game, draftOrder) : game.phase === "roundResult" ? resultStage(room, accounts, game) : summaryStage(room, accounts, game);
  root.innerHTML = `<main class="page ranking-page board-shell enter">${boardPlayerStripHtml(room.players, accounts, { scores:game.scores })}${stage}<button class="ghost leave-game" id="leave-room">Wyjdz z pokoju</button></main>`;
  $("#leave-room")?.addEventListener("click", actions.leaveRoom);
  setupRankingDrag(root, order => rememberRankingDraft(draftKey, order));
  $("#ranking-submit")?.addEventListener("click", () => actions.rankingSubmit([...root.querySelectorAll(".ranking-tile")].map(tile => tile.dataset.rankId)));
  $("#ranking-next-round")?.addEventListener("click", actions.rankingNext);
  $("#ranking-lobby")?.addEventListener("click", actions.returnToRoom);
}
