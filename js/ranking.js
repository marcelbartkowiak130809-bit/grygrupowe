import { $, boardPlayerStripHtml, escapeHtml, playerMiniHtml } from "./utils.js?v=20260605-5";
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
  ] },
  { id:"games", name:"Gry", sets:[
    ["Minecraft","Fortnite","Roblox","GTA"],
    ["Mario Kart","FIFA","Rocket League","Forza"],
    ["Among Us","Brawl Stars","Clash Royale","Fall Guys"],
    ["Elden Ring","Wiedzmin","Skyrim","Cyberpunk"],
  ] },
  { id:"animals", name:"Zwierzeta", sets:[
    ["Pies","Kot","Krolik","Chomik"],
    ["Lew","Tygrys","Wilk","Niedzwiedz"],
    ["Delfin","Pingwin","Zolw","Foka"],
    ["Slon","Zyrafa","Panda","Koala"],
  ] },
  { id:"movies", name:"Filmy", sets:[
    ["Shrek","Avatar","Titanic","Barbie"],
    ["Star Wars","Harry Potter","Matrix","Avengers"],
    ["Toy Story","Krol Lew","Kraina lodu","Minionki"],
    ["Batman","Spider-Man","Iron Man","Deadpool"],
  ] },
  { id:"powers", name:"Supermoce", sets:[
    ["Latanie","Niewidzialnosc","Teleportacja","Czytanie w myslach"],
    ["Supersila","Zatrzymanie czasu","Leczenie","Kontrola ognia"],
    ["Oddychanie pod woda","Zmiana ksztaltu","Laserowy wzrok","Szybkosc"],
    ["Kontrola pogody","Telekineza","Klonowanie","Pole silowe"],
  ] },
  { id:"holidays", name:"Wakacje", sets:[
    ["Morze","Gory","Miasto","Jezioro"],
    ["Hotel","Namiot","Kamper","Apartament"],
    ["Basen","Plaza","Zwiedzanie","Park rozrywki"],
    ["Lody","Pamiatki","Zdjecia","Ognisko"],
  ] },
  { id:"school", name:"Szkola", sets:[
    ["Przerwa","WF","Matematyka","Historia"],
    ["Sprawdzian","Kartkowka","Projekt","Odpowiedz ustna"],
    ["Plecak","Zeszyt","Tablica","Dziennik"],
    ["Wycieczka","Dzien sportu","Apel","Zastepstwo"],
  ] },
  { id:"apps", name:"Aplikacje", sets:[
    ["TikTok","YouTube","Instagram","Spotify"],
    ["Discord","Messenger","WhatsApp","Snapchat"],
    ["Netflix","Twitch","Steam","Allegro"],
    ["Mapy","Kalendarz","Notatki","Pogoda"],
  ] },
];

export const rankingDefaults = {
  rounds:8,
  targetScore:20,
  categories:["food","games","animals","movies","powers","holidays","school","apps"],
};

const categoryMap = Object.fromEntries(rankingCategories.map(category => [category.id, category]));

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

function rankingList(game, currentUser) {
  const submitted = currentUser in objectOrEmpty(game.submissions);
  const order = submitted ? game.submissions[currentUser] : arrayOrEmpty(game.baseOrder).length ? game.baseOrder : game.set.items.map(item => item.id);
  return `<div class="ranking-sorter ${submitted ? "ranking-locked" : ""}" id="ranking-sorter">${order.map((id, index) => `<article class="ranking-tile" draggable="${submitted ? "false" : "true"}" data-rank-id="${escapeHtml(id)}">
    <b>${index + 1}</b><span>${escapeHtml(itemLabel(game, id))}</span><div class="ranking-move-buttons"><button type="button" data-rank-move="up" ${submitted || index === 0 ? "disabled" : ""}>&uarr;</button><button type="button" data-rank-move="down" ${submitted || index === order.length - 1 ? "disabled" : ""}>&darr;</button></div>
  </article>`).join("")}</div>`;
}

function rankingStage(room, accounts, currentUser, game) {
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
    <div class="ranking-play-area">${rankingList(game, currentUser)}${submitted ? `<div class="waiting-state ranking-waiting"><span class="waiting-pulse">OK</span><h3>Ranking zapisany</h3><p>Czekamy na reszte ekipy.</p></div>` : `<button class="primary big" id="ranking-submit">Zapisz ranking</button>`}</div>
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
        <div class="truth-bar-head"><b>#${row.place}</b>${playerMiniHtml(accounts[row.uid])}<strong>+${row.points} pkt</strong></div>
        <div class="truth-scale"><span></span></div>
        <div class="truth-values"><span>podobienstwo ${closeness}%</span><span>roznica pozycji: ${row.distance}</span></div>
      </article>`;
    }).join("")}</div>
    <div class="truth-round-ranking final-ranking">${room.players.slice().sort((a,b)=>Number(game.scores?.[b]||0)-Number(game.scores?.[a]||0)).map((uid,index)=>`<article class="${index === 0 ? "winner-card" : ""}"><b>#${index + 1}</b>${playerMiniHtml(accounts[uid])}<strong>${Number(game.scores?.[uid] || 0)} pkt</strong></article>`).join("")}</div>
    <button class="primary" id="ranking-next-round">Nastepna runda</button>
  </section>`;
}

function summaryStage(room, accounts, game) {
  const max = Math.max(0, ...Object.values(game.scores || {}).map(Number));
  const winners = room.players.filter(uid => Number(game.scores?.[uid] || 0) === max);
  Effects.play("roundWin", `${room.roomId}:ranking:summary`);
  return `<section class="ranking-stage ranking-summary"><p class="eyebrow">KONIEC GRY</p><h1>${winners.map(uid => escapeHtml(accounts[uid]?.nick || "Gracz")).join(", ")} zna gust grupy</h1><div class="final-ranking">${room.players.slice().sort((a,b)=>Number(game.scores?.[b]||0)-Number(game.scores?.[a]||0)).map((uid,index)=>`<article class="${winners.includes(uid) ? "winner-card" : ""}"><b>#${index + 1}</b>${playerMiniHtml(accounts[uid])}<strong>${Number(game.scores?.[uid] || 0)} pkt</strong></article>`).join("")}</div><button class="primary" id="ranking-lobby">Wroc do lobby</button></section>`;
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

function setupRankingDrag(root) {
  const list = $("#ranking-sorter", root);
  if (!list || list.classList.contains("ranking-locked")) return;
  let dragged = null;
  list.addEventListener("dragstart", event => {
    dragged = event.target.closest(".ranking-tile");
    if (!dragged) return;
    dragged.classList.add("dragging");
    event.dataTransfer?.setData("text/plain", dragged.dataset.rankId || "");
  });
  list.addEventListener("dragover", event => {
    event.preventDefault();
    const target = event.target.closest(".ranking-tile");
    if (!dragged || !target || target === dragged) return;
    const rect = target.getBoundingClientRect();
    list.insertBefore(dragged, event.clientY < rect.top + rect.height / 2 ? target : target.nextSibling);
    refreshTileNumbers(list);
  });
  list.addEventListener("dragend", () => { dragged?.classList.remove("dragging"); dragged = null; refreshTileNumbers(list); });
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
    refreshTileNumbers(list);
  });
  list.addEventListener("pointerup", event => {
    pointerTile?.releasePointerCapture?.(event.pointerId);
    pointerTile?.classList.remove("dragging");
    pointerTile = null;
    refreshTileNumbers(list);
  });
  list.addEventListener("click", event => {
    const button = event.target.closest("[data-rank-move]");
    if (!button) return;
    const tile = button.closest(".ranking-tile");
    if (button.dataset.rankMove === "up" && tile.previousElementSibling) list.insertBefore(tile, tile.previousElementSibling);
    if (button.dataset.rankMove === "down" && tile.nextElementSibling) list.insertBefore(tile.nextElementSibling, tile);
    refreshTileNumbers(list);
  });
}

export function renderRankingGame(root, { room, accounts, currentUser }, actions) {
  const game = normalize(room.game, room.players);
  const stage = game.phase === "ranking" ? rankingStage(room, accounts, currentUser, game) : game.phase === "roundResult" ? resultStage(room, accounts, game) : summaryStage(room, accounts, game);
  root.innerHTML = `<main class="page ranking-page board-shell enter">${boardPlayerStripHtml(room.players, accounts, { scores:game.scores })}${stage}<button class="ghost leave-game" id="leave-room">Wyjdz z pokoju</button></main>`;
  $("#leave-room")?.addEventListener("click", actions.leaveRoom);
  setupRankingDrag(root);
  $("#ranking-submit")?.addEventListener("click", () => actions.rankingSubmit([...root.querySelectorAll(".ranking-tile")].map(tile => tile.dataset.rankId)));
  $("#ranking-next-round")?.addEventListener("click", actions.rankingNext);
  $("#ranking-lobby")?.addEventListener("click", actions.returnToRoom);
}
