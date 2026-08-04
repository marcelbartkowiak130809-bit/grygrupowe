import { $, boardPlayerStripHtml, escapeHtml, normalizeAnswer, playerMiniHtml } from "./utils.js?v=20260605-5";
import { Audio } from "./audio.js";
import { Effects } from "./effects.js";

let timerId;
let tickBeat = 0;
let lastCountdown = 0;

const now = () => Date.now();
const prepareMs = 3000;
const promptMs = 2000;
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || min));
const arrayOrEmpty = value => Array.isArray(value) ? value : [];
const objectOrEmpty = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const shuffle = items => [...items].sort(() => Math.random() - .5);

export const fiveSecondsCategories = [
  { id:"animals", name:"Zwierzeta", prompt:"zwierzeta", words:["pies","kot","kon","krowa","owca","koza","swinia","kura","kaczka","krolik","chomik","mysz","szczur","lis","wilk","niedzwiedz","dzik","jelen","sarna","lew","tygrys","gepard","slon","zyrafa","zebra","nosorozec","malpa","goryl","kangur","koala","panda","pingwin","foka","delfin","wieloryb","rekin","osmiornica","krab","zolw","krokodyl","waz","zaba","orzel","sokol","sowa","bocian","papuga","pajak","mrowka","pszczola","motyl"] },
  { id:"food", name:"Jedzenie", prompt:"jedzenia", words:["pizza","kebab","hamburger","hot dog","taco","sushi","ramen","pierogi","nalesniki","spaghetti","lasagne","rosol","pomidorowa","schabowy","bigos","zapiekanka","kanapka","jajecznica","salatka","ryz","makaron","ziemniaki","kurczak","wolowina","losos","ser","jogurt","chleb","bulka","bagietka","ciasto","tort","sernik","lody","czekolada","cukierek","chipsy","popcorn","banan","jablko","gruszka","truskawka","pomarancza","arbuz","ananas","marchew","pomidor","ogorek","papryka"] },
  { id:"games", name:"Gry", prompt:"gry", words:["minecraft","roblox","fortnite","gta","valorant","league of legends","counter strike","among us","brawl stars","clash royale","pokemon","terraria","stardew valley","the sims","fifa","rocket league","genshin impact","call of duty","overwatch","apex legends","pubg","dota","diablo","hearthstone","wiedzmin","cyberpunk","skyrim","elden ring","hades","hollow knight","cuphead","undertale","portal","red dead redemption","animal crossing","mario kart","zelda","palworld","fall guys","subnautica","tekken","mortal kombat","street fighter","forza","need for speed"] },
  { id:"countries", name:"Kraje", prompt:"kraje", words:["polska","niemcy","francja","hiszpania","portugalia","wlochy","czechy","slowacja","ukraina","litwa","lotwa","estonia","szwecja","norwegia","finlandia","dania","islandia","irlandia","wielka brytania","holandia","belgia","austria","szwajcaria","grecja","chorwacja","serbia","rumunia","bulgaria","turcja","usa","kanada","meksyk","brazylia","argentyna","chile","peru","egipt","maroko","rpa","kenia","nigeria","chiny","japonia","korea","indie","tajlandia","wietnam","australia"] },
  { id:"movies", name:"Filmy", prompt:"filmy", words:["shrek","avatar","titanic","barbie","oppenheimer","star wars","avengers","iron man","thor","batman","joker","superman","spider man","deadpool","matrix","john wick","james bond","harry potter","wladca pierscieni","hobbit","jurassic park","transformers","top gun","interstellar","incepcja","diuna","krol lew","toy story","auta","kraina lodu","minionki","kung fu panda","madagaskar","piraci z karaibow","terminator","alien","rocky","forrest gump","gladiator","coco","ratatuj","godzilla","venom"] },
  { id:"brands", name:"Marki", prompt:"marki", words:["nike","adidas","puma","reebok","apple","samsung","xiaomi","sony","lenovo","asus","hp","dell","coca cola","pepsi","fanta","sprite","mcdonalds","kfc","burger king","subway","starbucks","lego","ikea","netflix","spotify","playstation","xbox","nintendo","steam","zara","reserved","cropp","zabka","biedronka","lidl","allegro","amazon","tesla","bmw","mercedes","audi","toyota","volkswagen","ferrari","red bull","monster","lays","oreo","milka","nutella"] },
  { id:"sport", name:"Sport", prompt:"sporty", words:["pilka nozna","koszykowka","siatkowka","tenis","ping pong","badminton","pilka reczna","hokej","baseball","rugby","golf","boks","mma","karate","judo","zapasy","plywanie","bieganie","maraton","kolarstwo","narciarstwo","snowboard","lyzwy","skoki narciarskie","formula 1","zuzel","lekkoatletyka","gimnastyka","wspinaczka","surfing","kajakarstwo","wioslarstwo","szermierka"] },
  { id:"random", name:"Losowe", prompt:"rzeczy z losowej kategorii", words:[] },
];

export const fiveSecondsDefaults = {
  answerTime:5,
  rounds:8,
  categories:["animals","food","games","countries","movies","brands","sport","random"],
};

const categoryMap = Object.fromEntries(fiveSecondsCategories.map(category => [category.id, category]));

export function sanitizeFiveSecondsSettings(raw = {}) {
  const selected = [...new Set(arrayOrEmpty(raw.categories).filter(id => categoryMap[id]))];
  const answerTime = [5, 10, 15].includes(Number(raw.answerTime)) ? Number(raw.answerTime) : fiveSecondsDefaults.answerTime;
  return {
    ...fiveSecondsDefaults,
    ...raw,
    answerTime,
    rounds:clamp(raw.rounds || fiveSecondsDefaults.rounds, 3, 20),
    categories:selected.length ? selected : fiveSecondsDefaults.categories,
  };
}

function categoryForTurn(settings) {
  const selected = sanitizeFiveSecondsSettings(settings).categories;
  let id = selected[Math.floor(Math.random() * selected.length)] || "animals";
  if (id === "random") {
    const concrete = fiveSecondsCategories.filter(category => category.id !== "random");
    id = concrete[Math.floor(Math.random() * concrete.length)]?.id || "animals";
  }
  return categoryMap[id] || categoryMap.animals;
}

function makeTurn(players, settings, turnNumber, scores = {}, history = [], order = []) {
  const safeOrder = arrayOrEmpty(order).filter(uid => players.includes(uid));
  const nextOrder = safeOrder.length ? safeOrder : shuffle(players);
  const player = nextOrder[0] || players[0] || "";
  const category = categoryForTurn(settings);
  const createdAt = now();
  return {
    phase:"prepare",
    turnNumber,
    round:Math.floor((turnNumber - 1) / Math.max(1, players.length)) + 1,
    order:nextOrder.slice(1),
    activeUid:player,
    categoryId:category.id,
    categoryName:category.name,
    prompt:category.prompt,
    scores:{ ...Object.fromEntries(players.map(uid => [uid, 0])), ...scores },
    history:arrayOrEmpty(history),
    current:null,
    startedAt:null,
    phaseEndsAt:createdAt + prepareMs,
    prepareEndsAt:createdAt + prepareMs,
    promptEndsAt:createdAt + prepareMs + promptMs,
  };
}

export function createFiveSecondsGame(players, rawSettings) {
  return makeTurn(players, sanitizeFiveSecondsSettings(rawSettings), 1);
}

function normalize(game, players = []) {
  game.order = arrayOrEmpty(game.order).filter(uid => players.includes(uid));
  game.history = arrayOrEmpty(game.history);
  game.scores = objectOrEmpty(game.scores);
  players.forEach(uid => { if (!(uid in game.scores)) game.scores[uid] = 0; });
  Object.keys(game.scores).forEach(uid => { if (!players.includes(uid)) delete game.scores[uid]; });
  if (!players.includes(game.activeUid)) game.activeUid = players[0] || "";
  return game;
}

function parseAnswers(text) {
  return String(text || "").split(/[,;\n]+/).map(item => item.trim()).filter(Boolean);
}

function evaluate(text, categoryId) {
  const raw = parseAnswers(text);
  const category = categoryMap[categoryId] || categoryMap.animals;
  const validKeys = new Set(category.words.map(normalizeAnswer));
  const seen = new Set();
  const accepted = [];
  const rejected = [];
  raw.forEach(answer => {
    const key = normalizeAnswer(answer);
    if (!key || seen.has(key)) return;
    seen.add(key);
    if (validKeys.has(key) && accepted.length < 3) accepted.push(answer);
    else rejected.push(answer);
  });
  return { raw, accepted, rejected, points:accepted.length };
}

function totalTurns(players, settings) {
  return Math.max(1, players.length) * Number(settings.rounds);
}

function finishTurn(game, players, settings, text = "", reason = "answer") {
  const result = evaluate(text, game.categoryId);
  game.scores[game.activeUid] = Number(game.scores?.[game.activeUid] || 0) + result.points;
  const entry = { uid:game.activeUid, categoryId:game.categoryId, categoryName:game.categoryName, prompt:game.prompt, text:String(text || ""), reason, ...result, at:now() };
  game.current = entry;
  game.history.push(entry);
  if (Number(game.turnNumber || 1) >= totalTurns(players, settings)) {
    game.phase = "gameSummary";
    game.result = { gameOver:true };
    game.phaseEndsAt = null;
    return;
  }
  Object.assign(game, makeTurn(players, settings, Number(game.turnNumber || 1) + 1, game.scores, game.history, game.order));
}

export const FiveSecondsEngine = {
  advance(game, players, rawSettings, expected = {}) {
    const settings = sanitizeFiveSecondsSettings(rawSettings);
    normalize(game, players);
    if (!["prepare","prompt"].includes(game.phase)) return;
    if (expected.phase && expected.phase !== game.phase) return "Faza gry juz sie zmienila.";
    if (expected.phaseEndsAt && Number(game.phaseEndsAt || 0) !== Number(expected.phaseEndsAt)) return "Tura juz sie zmienila.";
    if (game.phase === "prepare") {
      game.phase = "prompt";
      game.phaseEndsAt = Number(game.promptEndsAt || now() + promptMs);
      return null;
    }
    const startedAt = Math.max(now(), Number(game.promptEndsAt || now()));
    game.phase = "turn";
    game.startedAt = startedAt;
    game.phaseEndsAt = startedAt + Number(settings.answerTime) * 1000;
    return null;
  },
  answer(game, uid, text, players, rawSettings, expected = {}) {
    const settings = sanitizeFiveSecondsSettings(rawSettings);
    normalize(game, players);
    if (game.phase !== "turn") return "Ta tura juz sie zakonczyla.";
    if (game.activeUid !== uid) return "Teraz odpowiada inny gracz.";
    if (expected.phaseEndsAt && Number(game.phaseEndsAt || 0) !== Number(expected.phaseEndsAt)) return "Tura juz sie zmienila.";
    finishTurn(game, players, settings, text, "answer");
    return null;
  },
  timeout(game, players, rawSettings, expected = {}) {
    const settings = sanitizeFiveSecondsSettings(rawSettings);
    normalize(game, players);
    if (game.phase !== "turn") return;
    if (expected.phaseEndsAt && Number(game.phaseEndsAt || 0) !== Number(expected.phaseEndsAt)) return "Tura juz sie zmienila.";
    finishTurn(game, players, settings, expected.text || "", "timeout");
    return null;
  },
};

export function renderFiveSecondsLobbySettings(room, isHost) {
  const settings = sanitizeFiveSecondsSettings(room.settings);
  const selected = settings.categories;
  return `<div class="impostor-settings-grid five-settings-grid">
    <label>Czas odpowiedzi<select data-five-setting="answerTime" ${isHost ? "" : "disabled"}>${[5,10,15].map(n => `<option value="${n}" ${settings.answerTime === n ? "selected" : ""}>${n} sekund</option>`).join("")}</select></label>
    <label>Liczba rund<select data-five-setting="rounds" ${isHost ? "" : "disabled"}>${[3,5,8,10,12,15,20].map(n => `<option value="${n}" ${settings.rounds === n ? "selected" : ""}>${n}</option>`).join("")}</select></label>
    <div class="most-category-box"><b>Kategorie</b><small>zadania: wymien 3 odpowiedzi</small><div class="multi-category-list">${fiveSecondsCategories.map(category => {
      const disabled = !isHost || selected.includes(category.id) && selected.length <= 1;
      const count = category.id === "random" ? fiveSecondsCategories.filter(item => item.id !== "random").reduce((sum, item) => sum + item.words.length, 0) : category.words.length;
      return `<label class="check category-chip"><input data-five-category="${category.id}" type="checkbox" ${selected.includes(category.id) ? "checked" : ""} ${disabled ? "disabled" : ""}> <span>${escapeHtml(category.name)}</span><span class="category-count">${count}</span></label>`;
    }).join("")}</div></div>
  </div>`;
}

function answerField(game, currentUser) {
  if (game.activeUid !== currentUser) return `<div class="waiting-state five-waiting"><span class="waiting-pulse">...</span><h3>Czekamy na odpowiedz</h3><p>Teraz gra inna osoba.</p></div>`;
  return `<form id="five-answer-form" class="five-answer-form"><input id="five-answer-input" placeholder="np. pies, kot, slon" autocomplete="off" autofocus><button class="primary">Zapisz</button></form>`;
}

function latestResult(game, accounts) {
  const entry = game.history?.[game.history.length - 1];
  if (!entry) return "";
  const accepted = arrayOrEmpty(entry.accepted);
  return `<aside class="five-last-result"><p class="eyebrow">OSTATNIA TURA</p>${playerMiniHtml(accounts[entry.uid])}<strong>+${Number(entry.points) || 0} pkt</strong><small>${accepted.length}/3 poprawne: ${accepted.map(escapeHtml).join(", ") || "brak"}</small></aside>`;
}

function prepStage(room, accounts, game) {
  const left = Math.max(0, Math.ceil((Number(game.phaseEndsAt || 0) - now()) / 1000));
  const reveal = game.phase === "prompt";
  return `<section class="five-stage" style="--danger:${reveal ? 62 : 24}">
    <div class="five-head"><div><p class="eyebrow">RUNDA ${game.round}</p><h1>${reveal ? `Wymien 3 ${escapeHtml(game.prompt)}` : "Przygotuj sie"}</h1></div><div class="five-timer ${left <= 2 ? "timer-urgent" : ""}" id="five-turn-timer">${left}</div></div>
    <div class="five-table">
      <div class="five-player-now"><p class="eyebrow">ZARAZ GRA</p>${playerMiniHtml(accounts[game.activeUid])}<strong>${escapeHtml(accounts[game.activeUid]?.nick || "Gracz")}</strong></div>
      <div class="five-pressure"><i></i><i></i><b>${reveal ? "CZYTAJ" : "START"}</b></div>
      ${latestResult(game, accounts)}
    </div>
    <div class="waiting-state five-waiting"><span class="waiting-pulse">${reveal ? "TEMAT" : "READY"}</span><h3>${reveal ? escapeHtml(game.categoryName) : "Mentalne przygotowanie"}</h3><p>${reveal ? "Za chwile ruszy czas odpowiedzi." : "Temat pojawi sie po 3 sekundach."}</p></div>
  </section>`;
}

function gameStage(room, accounts, currentUser, game) {
  const left = Math.max(0, Math.ceil((Number(game.phaseEndsAt || 0) - now()) / 1000));
  const danger = Math.max(0, Math.min(100, Math.round((1 - left / Math.max(1, Number(room.settings.answerTime) || 5)) * 100)));
  return `<section class="five-stage" style="--danger:${danger}">
    <div class="five-head"><div><p class="eyebrow">RUNDA ${game.round} - ${escapeHtml(game.categoryName)}</p><h1>Wymien 3 ${escapeHtml(game.prompt)}</h1></div><div class="five-timer ${left <= 3 ? "timer-urgent" : ""}" id="five-turn-timer">${left}</div></div>
    <div class="five-table">
      <div class="five-player-now"><p class="eyebrow">TERAZ</p>${playerMiniHtml(accounts[game.activeUid])}<strong>${escapeHtml(accounts[game.activeUid]?.nick || "Gracz")}</strong></div>
      <div class="five-pressure"><i></i><i></i><b>5 sekund</b></div>
      ${latestResult(game, accounts)}
    </div>
    ${answerField(game, currentUser)}
  </section>`;
}

function summaryStage(room, accounts, game) {
  const max = Math.max(0, ...Object.values(game.scores || {}).map(Number));
  const winners = room.players.filter(uid => Number(game.scores?.[uid] || 0) === max);
  Effects.play("roundWin", `${room.roomId}:five:summary`);
  return `<section class="five-stage five-summary"><p class="eyebrow">KONIEC GRY</p><h1>${winners.map(uid => escapeHtml(accounts[uid]?.nick || "Gracz")).join(", ")} wygrywa refleks</h1><div class="final-ranking">${room.players.slice().sort((a,b)=>Number(game.scores?.[b]||0)-Number(game.scores?.[a]||0)).map((uid,index)=>`<article class="${winners.includes(uid) ? "winner-card" : ""}"><b>#${index + 1}</b>${playerMiniHtml(accounts[uid])}<strong>${Number(game.scores?.[uid] || 0)} pkt</strong></article>`).join("")}</div><button class="primary" id="five-lobby">Wroc do lobby</button></section>`;
}

export function renderFiveSecondsGame(root, { room, accounts, currentUser }, actions) {
  stopFiveSecondsTimer();
  const game = normalize(room.game, room.players);
  const stage = ["prepare","prompt"].includes(game.phase) ? prepStage(room, accounts, game) : game.phase === "turn" ? gameStage(room, accounts, currentUser, game) : summaryStage(room, accounts, game);
  root.innerHTML = `<main class="page five-page board-shell enter">${boardPlayerStripHtml(room.players, accounts, { activeUid:["prepare","prompt","turn"].includes(game.phase) ? game.activeUid : "", scores:game.scores })}${stage}<button class="ghost leave-game" id="leave-room">Wyjdz z pokoju</button></main>`;
  $("#leave-room")?.addEventListener("click", actions.leaveRoom);
  $("#five-answer-form")?.addEventListener("submit", event => {
    event.preventDefault();
    actions.fiveSecondsAnswer($("#five-answer-input")?.value || "", { phaseEndsAt:game.phaseEndsAt });
  });
  $("#five-answer-input")?.focus();
  $("#five-lobby")?.addEventListener("click", actions.returnToRoom);
  if (["prepare","prompt","turn"].includes(game.phase)) startFiveSecondsTimer(game, actions);
}

function startFiveSecondsTimer(game, actions) {
  const guard = { phase:game.phase, phaseEndsAt:Number(game.phaseEndsAt || 0), activeUid:game.activeUid };
  const tick = () => {
    const left = Math.max(0, Math.ceil((guard.phaseEndsAt - now()) / 1000));
    const timer = $("#five-turn-timer");
    if (timer) {
      timer.textContent = String(left);
      timer.classList.toggle("timer-urgent", left <= 3);
      timer.closest(".five-stage")?.style.setProperty("--danger", String(Math.max(0, Math.min(100, 100 - left * 20))));
    }
    tickBeat = (tickBeat + 1) % 2;
    if (tickBeat && left > 0 && left <= 3 && lastCountdown !== left) { lastCountdown = left; Audio.play("countdown"); }
    if (left <= 0) {
      stopFiveSecondsTimer();
      if (guard.phase === "turn") actions.fiveSecondsTimeout?.({ phaseEndsAt:guard.phaseEndsAt, activeUid:guard.activeUid, text:$("#five-answer-input")?.value || "" });
      else actions.fiveSecondsAdvance?.({ phase:guard.phase, phaseEndsAt:guard.phaseEndsAt, activeUid:guard.activeUid });
    }
  };
  tick();
  timerId = setInterval(tick, 250);
}

export function stopFiveSecondsTimer() {
  clearInterval(timerId);
  timerId = null;
  tickBeat = 0;
  lastCountdown = 0;
}
