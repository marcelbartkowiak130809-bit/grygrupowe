import { $, boardPlayerStripHtml, escapeHtml, normalizeAnswer, playerMiniHtml } from "./utils.js?v=20260901-3";
import { Audio } from "./audio.js";
import { Effects } from "./effects.js";

let timerId;
let tickBeat = 0;

const now = () => Date.now();
const shuffle = items => [...items].sort(() => Math.random() - .5);
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || min));
const objectOrEmpty = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const arrayOrEmpty = value => Array.isArray(value) ? value : [];

export const bombCategories = [
  { id:"animals", name:"Zwierzeta", words:["pies","kot","kon","krowa","owca","koza","swinia","kura","kogut","kaczka","ges","indyk","krolik","chomik","mysz","szczur","wiewiorka","lis","wilk","niedzwiedz","dzik","jelen","sarna","los","bobr","wydra","jez","nietoperz","lew","tygrys","pantera","lampart","gepard","slon","zyrafa","zebra","nosorozec","hipopotam","malpa","goryl","orangutan","lemur","kangur","koala","panda","pingwin","foka","mors","delfin","wieloryb","rekin","osmiornica","krab","homar","zolw","krokodyl","aligator","waz","jaszczurka","zaba","ropucha","orzel","sokol","sowa","bocian","papuga","golab","kruk","wrabel","labedz","flaming","pajak","mrowka","pszczola","osa","motyl"] },
  { id:"games", name:"Gry", words:["minecraft","roblox","fortnite","gta","valorant","league of legends","counter strike","among us","brawl stars","clash royale","clash of clans","pokemon go","terraria","stardew valley","the sims","fifa","ea fc","rocket league","genshin impact","call of duty","overwatch","apex legends","pubg","dota","world of warcraft","diablo","hearthstone","wiedzmin","cyberpunk","skyrim","elden ring","dark souls","hades","hollow knight","cuphead","undertale","portal","half life","red dead redemption","animal crossing","mario kart","zelda","pokemon","palworld","helldivers","dead by daylight","phasmophobia","rust","ark","geometry dash","osu","need for speed","forza horizon","tekken","mortal kombat","street fighter","rainbow six siege","warframe","destiny","fall guys","subnautica","sims"] },
  { id:"food", name:"Jedzenie", words:["pizza","burger","frytki","kebab","hot dog","taco","sushi","ramen","pierogi","nalesniki","spaghetti","lasagne","rosol","pomidorowa","schabowy","golabki","bigos","zapiekanka","kanapka","jajecznica","omlet","salatka","ryz","makaron","ziemniaki","kasza","kurczak","wolowina","wieprzowina","losos","tunczyk","ser","jogurt","mleko","maslo","chleb","bulka","bagietka","croissant","ciasto","tort","sernik","szarlotka","lody","czekolada","cukierek","chipsy","popcorn","orzechy","banan","jablko","gruszka","truskawka","malina","borowka","pomarancza","cytryna","arbuz","melon","ananas","mango","awokado","marchew","pomidor","ogorek","cebula","czosnek","papryka","brokul","kukurydza","fasola"] },
  { id:"countries", name:"Kraje", words:["polska","niemcy","francja","hiszpania","portugalia","wlochy","czechy","slowacja","ukraina","litwa","lotwa","estonia","szwecja","norwegia","finlandia","dania","islandia","irlandia","wielka brytania","holandia","belgia","austria","szwajcaria","grecja","chorwacja","serbia","rumunia","bulgaria","turcja","rosja","usa","kanada","meksyk","brazylia","argentyna","chile","peru","kolumbia","egipt","maroko","rpa","kenia","nigeria","chiny","japonia","korea","indie","tajlandia","wietnam","indonezja","australia","nowa zelandia","izrael","arabia saudyjska","iran","irak","kazachstan","wegry"] },
  { id:"movies", name:"Filmy", words:["shrek","avatar","titanic","barbie","oppenheimer","star wars","avengers","iron man","thor","hulk","batman","joker","superman","spider man","deadpool","matrix","john wick","james bond","harry potter","wladca pierscieni","hobbit","jurassic park","transformers","mission impossible","szybcy i wsciekli","top gun","interstellar","incepcja","diuna","krol lew","toy story","auta","kraina lodu","minionki","kung fu panda","madagaskar","piraci z karaibow","terminator","alien","predator","rocky","rambo","forrest gump","gladiator","lalaland","coco","ratatuj","up","wall e","inside out","godzilla","king kong","venom","aquaman","czarna pantera"] },
  { id:"characters", name:"Postacie", words:["mario","luigi","peach","bowser","sonic","pikachu","ash","link","zelda","kirby","lara croft","geralt","ciri","batman","joker","superman","wonder woman","spider man","iron man","thor","hulk","loki","thanos","harry potter","hermiona","ron","dumbledore","voldemort","shrek","osiolek","fiona","elsa","anna","simba","mufasa","woody","buzz","spongebob","patrick","scooby doo","garfield","homer simpson","bart simpson","rick","morty","naruto","sasuke","goku","vegeta","luffy","darth vader","yoda","mandalorian","john wick","barbie","ken"] },
  { id:"brands", name:"Marki", words:["nike","adidas","puma","reebok","new balance","vans","converse","apple","samsung","xiaomi","sony","lg","lenovo","asus","acer","hp","dell","huawei","coca cola","pepsi","fanta","sprite","mcdonalds","kfc","burger king","subway","starbucks","lego","ikea","netflix","spotify","playstation","xbox","nintendo","steam","epic games","zara","reserved","cropp","house","bershka","zabka","biedronka","lidl","kaufland","carrefour","allegro","amazon","tesla","bmw","mercedes","audi","toyota","volkswagen","ford","ferrari","lamborghini","porsche","red bull","monster","lays","oreo","milka","nutella","haribo"] },
  { id:"sport", name:"Sport", words:["pilka nozna","koszykowka","siatkowka","tenis","ping pong","badminton","pilka reczna","hokej","baseball","rugby","golf","boks","mma","karate","judo","zapasy","plywanie","bieganie","maraton","kolarstwo","narciarstwo","snowboard","lyzwy","skoki narciarskie","formula 1","zuzel","rajdy","lekkoatletyka","gimnastyka","wspinaczka","surfing","kajakarstwo","wioslarstwo","szermierka","strzelectwo","rzut oszczepem","rzut dyskiem","skok wzwyz","skok w dal","trojskok","bramkarz","napastnik","sedzia","trener","stadion","boisko","kort","ring","mecz","turniej","liga","puchar"] },
];

export const bombDefaults = {
  rounds:8,
  targetScore:7,
  answerTime:20,
  timeMode:"shared",
  showExplosionTime:false,
  visibleBombState:true,
  bombSkinMode:"roundFair",
  categories:["animals","games","food","countries","movies","characters","brands","sport"],
};

const categoryMap = Object.fromEntries(bombCategories.map(category => [category.id, category]));
const minCategories = 3;

export function sanitizeBombSettings(raw = {}) {
  const selected = [...new Set(arrayOrEmpty(raw.categories).filter(id => categoryMap[id]))];
  const categories = selected.length >= minCategories ? selected : bombDefaults.categories.slice(0, minCategories);
  return {
    ...bombDefaults,
    ...raw,
    rounds:clamp(raw.rounds || bombDefaults.rounds, 3, 20),
    targetScore:clamp(raw.targetScore || bombDefaults.targetScore, 3, 25),
    answerTime:clamp(raw.answerTime || bombDefaults.answerTime, 8, 45),
    timeMode:raw.timeMode === "individual" ? "individual" : "shared",
    showExplosionTime:Boolean(raw.showExplosionTime),
    visibleBombState:raw.visibleBombState !== false,
    bombSkinMode:raw.bombSkinMode === "currentHolder" ? "currentHolder" : "roundFair",
    categories,
  };
}

function chosenCategory(settings) {
  const ids = sanitizeBombSettings(settings).categories;
  return categoryMap[ids[Math.floor(Math.random() * ids.length)]] || bombCategories[0];
}

function answerKey(value) {
  return normalizeAnswer(value);
}

function bombWindowMs(players, settings) {
  const shared = settings.timeMode === "shared";
  const base = shared
    ? Math.max(14000, Number(settings.answerTime) * 1000 * Math.max(1.35, players.length * .9))
    : Math.max(9000, Number(settings.answerTime) * 1000 * Math.max(1.8, players.length * .65));
  return {
    min:Math.round(base * (shared ? .95 : .55)),
    max:Math.round(base * (shared ? 1.65 : 1.65)),
  };
}

function drawBombSkinOwner(players, previousPool = []) {
  let pool = arrayOrEmpty(previousPool).filter(uid => players.includes(uid));
  if (!pool.length) pool = shuffle(players);
  const owner = pool[0] || players[0] || "";
  return { owner, pool:pool.slice(1) };
}

function createRound(players, settings, round, scores = {}, previousSkinPool = []) {
  const category = chosenCategory(settings);
  const window = bombWindowMs(players, settings);
  const order = shuffle(players);
  const startedAt = now();
  const explodesAt = startedAt + window.min + Math.floor(Math.random() * (window.max - window.min + 1));
  const skinDraw = drawBombSkinOwner(players, previousSkinPool);
  return {
    phase:"answering",
    round,
    order,
    turnIndex:0,
    categoryId:category.id,
    usedAnswers:[],
    answers:[],
    scores:{ ...Object.fromEntries(players.map(uid => [uid, 0])), ...scores },
    timeMode:settings.timeMode,
    showExplosionTime:settings.showExplosionTime,
    bombSkinMode:settings.bombSkinMode,
    bombSkinOwner:skinDraw.owner,
    bombSkinPool:skinDraw.pool,
    startedAt,
    explodesAt,
    phaseEndsAt:settings.timeMode === "shared" ? explodesAt : startedAt + Number(settings.answerTime) * 1000,
    result:null,
  };
}

export function createBombGame(players, rawSettings) {
  const settings = sanitizeBombSettings(rawSettings);
  return createRound(players, settings, 1);
}

function normalize(game, players = []) {
  game.order = arrayOrEmpty(game.order).filter(uid => players.includes(uid));
  players.forEach(uid => { if (!game.order.includes(uid)) game.order.push(uid); });
  if (!game.order.length) game.order = [...players];
  game.usedAnswers = arrayOrEmpty(game.usedAnswers);
  game.answers = arrayOrEmpty(game.answers);
  game.scores = objectOrEmpty(game.scores);
  players.forEach(uid => { if (!(uid in game.scores)) game.scores[uid] = 0; });
  Object.keys(game.scores).forEach(uid => { if (!players.includes(uid)) delete game.scores[uid]; });
  if (!Number.isFinite(Number(game.turnIndex))) game.turnIndex = 0;
  if (game.turnIndex >= Math.max(1, game.order.length)) game.turnIndex = 0;
  return game;
}

const activeUid = game => game.order[game.turnIndex % Math.max(1, game.order.length)] || "";

function finishRound(game, players, loser, reason = "boom") {
  const winners = players.filter(uid => uid !== loser);
  winners.forEach(uid => game.scores[uid] = Number(game.scores[uid] || 0) + 1);
  game.phase = "roundResult";
  game.result = { loser, winners, reason, at:now(), bombSkinOwner:game.bombSkinMode === "currentHolder" ? loser : game.bombSkinOwner };
  game.phaseEndsAt = null;
}

function finishGameIfNeeded(game, settings) {
  const maxScore = Math.max(0, ...Object.values(game.scores || {}).map(Number));
  if (Number(game.round) >= Number(settings.rounds) || maxScore >= Number(settings.targetScore)) {
    game.phase = "gameSummary";
    game.result ||= {};
    game.result.gameOver = true;
    return true;
  }
  return false;
}

function nextTurn(game, settings) {
  game.turnIndex = (Number(game.turnIndex) + 1) % Math.max(1, game.order.length);
  if (settings.timeMode === "individual") game.phaseEndsAt = now() + Number(settings.answerTime) * 1000;
  else game.phaseEndsAt = Number(game.explodesAt || game.phaseEndsAt || now());
}

export const BombEngine = {
  answer(game, uid, text, players, rawSettings) {
    const settings = sanitizeBombSettings(rawSettings);
    normalize(game, players);
    if (game.phase !== "answering") return "Ta runda juz sie zakonczyla.";
    if (activeUid(game) !== uid) return "Teraz odpowiada inny gracz.";
    const raw = String(text || "").trim();
    const normalized = answerKey(raw);
    if (!normalized) return "Nie mozna zostawic pustej odpowiedzi.";
    if (game.usedAnswers.some(item => answerKey(item) === normalized)) return "Ta odpowiedz juz byla.";
    const category = categoryMap[game.categoryId] || bombCategories[0];
    const valid = category.words.some(word => answerKey(word) === normalized);
    if (!valid) return "Tej odpowiedzi nie ma w bazie tej kategorii.";
    game.usedAnswers.push(raw);
    game.answers.push({ uid, raw, at:now() });
    if (now() >= Number(game.explodesAt || 0)) {
      finishRound(game, players, uid);
      finishGameIfNeeded(game, settings);
      return null;
    }
    nextTurn(game, settings);
    return null;
  },
  timeout(game, uid, players, rawSettings, expected = {}) {
    const settings = sanitizeBombSettings(rawSettings);
    normalize(game, players);
    if (game.phase !== "answering") return;
    if (expected.phaseEndsAt && Number(game.phaseEndsAt || 0) !== Number(expected.phaseEndsAt)) return "Tura juz sie zmienila.";
    const loser = activeUid(game);
    if (uid && uid !== loser) return "To nie twoja bomba.";
    finishRound(game, players, loser, now() >= Number(game.explodesAt || 0) ? "boom" : "timeout");
    finishGameIfNeeded(game, settings);
    return null;
  },
  nextRound(game, players, rawSettings) {
    const settings = sanitizeBombSettings(rawSettings);
    normalize(game, players);
    if (game.phase !== "roundResult") return "Najpierw musi wybuchnac bomba.";
    Object.assign(game, createRound(players, settings, Number(game.round || 1) + 1, game.scores, game.bombSkinPool));
    return null;
  },
};

export function renderBombLobbySettings(room, isHost) {
  const settings = sanitizeBombSettings(room.settings);
  const selected = settings.categories;
  return `<div class="impostor-settings-grid bomb-settings-grid">
    <label>Liczba rund<select data-bomb-setting="rounds" ${isHost ? "" : "disabled"}>${[3,5,8,10,12,15,20].map(n => `<option value="${n}" ${settings.rounds === n ? "selected" : ""}>${n}</option>`).join("")}</select></label>
    <label>Punkty do wygranej<select data-bomb-setting="targetScore" ${isHost ? "" : "disabled"}>${[3,5,7,10,12,15,20,25].map(n => `<option value="${n}" ${settings.targetScore === n ? "selected" : ""}>${n}</option>`).join("")}</select></label>
    <label>Czas na odpowiedz <b>${settings.answerTime}s</b><input data-bomb-setting="answerTime" type="range" min="8" max="45" step="1" value="${settings.answerTime}" ${isHost ? "" : "disabled"}></label>
    <label>Tryb czasu<select data-bomb-setting="timeMode" ${isHost ? "" : "disabled"}><option value="shared" ${settings.timeMode === "shared" ? "selected" : ""}>Wspolna bomba</option><option value="individual" ${settings.timeMode === "individual" ? "selected" : ""}>Indywidualny czas</option></select></label>
    <label>Skin bomby<select data-bomb-setting="bombSkinMode" ${isHost ? "" : "disabled"}><option value="roundFair" ${settings.bombSkinMode === "roundFair" ? "selected" : ""}>Losowy gracz na runde</option><option value="currentHolder" ${settings.bombSkinMode === "currentHolder" ? "selected" : ""}>Aktualny gracz</option></select></label>
    <label class="check bomb-toggle-setting"><input data-bomb-setting="showExplosionTime" type="checkbox" ${settings.showExplosionTime ? "checked" : ""} ${isHost ? "" : "disabled"}> Widoczny czas wybuchu</label>
    <label class="check bomb-toggle-setting"><input data-bomb-setting="visibleBombState" type="checkbox" ${settings.visibleBombState ? "checked" : ""} ${isHost ? "" : "disabled"}> Widoczna zmiana stanu bomby</label>
    <div class="most-category-box"><b>Kategorie</b><small>minimum ${minCategories}, baza: ${bombCategories.reduce((sum, category) => sum + category.words.length, 0)} slow</small><div class="multi-category-list">${bombCategories.map(category => {
      const disabled = !isHost || selected.includes(category.id) && selected.length <= minCategories;
      return `<label class="check category-chip"><input data-bomb-category="${category.id}" type="checkbox" ${selected.includes(category.id) ? "checked" : ""} ${disabled ? "disabled" : ""}> <span>${escapeHtml(category.name)}</span><span class="category-count">${category.words.length}</span></label>`;
    }).join("")}</div></div>
  </div>`;
}

function timerLeft(game, settings) {
  const target = settings.showExplosionTime ? game.explodesAt : game.phaseEndsAt;
  return Math.max(0, Math.ceil(((target || now()) - now()) / 1000));
}

function timerText(game, settings) {
  const left = timerLeft(game, settings);
  return `${left}s`;
}

function timerBox(game, settings) {
  const left = timerLeft(game, settings);
  if (!settings.showExplosionTime) {
    const label = settings.timeMode === "shared" ? "Wspólna bomba" : "Ukryty wybuch";
    return `<div class="timer-box bomb-hidden-timer ${left <= 5 ? "timer-urgent" : ""}"><span class="tiny">${label}</span><b id="bomb-turn-timer" data-hidden-time="1">???</b></div>`;
  }
  const label = settings.timeMode === "shared" ? "DO WYBUCHU" : "WYBUCH";
  return `<div class="timer-box ${left <= 5 ? "timer-urgent" : ""}"><span class="tiny">${label}</span><b id="bomb-turn-timer">${timerText(game, settings)}</b></div>`;
}

function answerStack(game) {
  const latest = game.answers.slice(-10).reverse();
  return latest.length ? latest.map(answer => `<span>${escapeHtml(answer.raw)}</span>`).join("") : '<span class="muted">Jeszcze cisza przy stole.</span>';
}

function bombSkinId(game, settings, accounts, active) {
  const owner = settings.bombSkinMode === "currentHolder" ? active : game.bombSkinOwner || active;
  return accounts[owner]?.selectedBombSkin || "defaultBomb";
}

function bombStage(room, accounts, currentUser) {
  const game = normalize(room.game, room.players);
  const settings = sanitizeBombSettings(room.settings);
  const category = categoryMap[game.categoryId] || bombCategories[0];
  const active = activeUid(game);
  const elapsed = Math.max(0, now() - Number(game.startedAt || now()));
  const danger = Math.min(100, Math.round(elapsed / Math.max(1, Number(game.explodesAt || now()) - Number(game.startedAt || now())) * 100));
  const visualDanger = settings.visibleBombState ? danger : 0;
  if (game.phase === "answering") {
    const modeLabel = settings.timeMode === "shared" ? "Wspolna bomba" : "Indywidualny czas";
    const skin = bombSkinId(game, settings, accounts, active);
    return `<section class="bomb-stage ${settings.showExplosionTime ? "bomb-time-visible" : "bomb-time-hidden"}" style="--danger:${visualDanger}">
      <div class="bomb-head"><div><p class="eyebrow">KATEGORIA - ${modeLabel}</p><h1>${escapeHtml(category.name)}</h1></div>${timerBox(game, settings)}</div>
      <div class="bomb-table">
        <div class="bomb-answer-feed"><p class="eyebrow">PODANE</p>${answerStack(game)}</div>
        <div class="bomb-core-wrap bomb-skin-${skin} ${settings.visibleBombState && danger > 72 ? "bomb-danger" : ""}"><div class="bomb-fuse"><i></i></div><div class="bomb-core"><span></span><b>Bomba</b></div><div class="bomb-shadow"></div></div>
        <div class="bomb-current-player"><p class="eyebrow">TERAZ</p>${playerMiniHtml(accounts[active])}<strong>${escapeHtml(accounts[active]?.nick || "Gracz")}</strong><small>${room.players.indexOf(active) + 1}/${room.players.length}</small></div>
      </div>
      ${active === currentUser ? `<form id="bomb-answer-form" class="bomb-answer-form"><input id="bomb-answer-input" placeholder="Szybko, wpisz odpowiedz..." autocomplete="off" autofocus><button class="primary">Podaj dalej</button></form>` : `<div class="waiting-state"><span class="waiting-pulse">tik</span><h3>Czekamy na odpowiedz</h3><p>Bomba jest przy graczu ${escapeHtml(accounts[active]?.nick || "Gracz")}.</p></div>`}
    </section>`;
  }
  if (game.phase === "roundResult") {
    const loser = game.result?.loser;
    const resultSkinOwner = game.result?.bombSkinOwner;
    const skin = game.result?.bombSkin || (resultSkinOwner ? accounts[resultSkinOwner]?.selectedBombSkin || "defaultBomb" : bombSkinId(game, settings, accounts, loser));
    Effects.play("roundFail", `${room.roomId}:bomb:${game.round}:${loser}`);
    return `<section class="bomb-stage bomb-exploded bomb-explosion-${skin}"><p class="eyebrow">WYBUCH</p><h1>${escapeHtml(accounts[loser]?.nick || "Gracz")} przegrywa runde</h1><div class="bomb-blast bomb-blast-${skin}"><i></i><i></i><i></i><span></span><span></span><span></span><span></span><span></span><span></span><b>BOOM</b></div><p class="money-pop">Pozostali gracze dostaja po 1 punkcie.</p><div class="result-player-grid">${room.players.map(uid => `<article class="${uid !== loser ? "winner-card" : ""}">${playerMiniHtml(accounts[uid])}<strong>${Number(game.scores?.[uid] || 0)} pkt</strong></article>`).join("")}</div><button class="primary" id="bomb-next-round">Nastepna runda</button></section>`;
  }
  const max = Math.max(0, ...Object.values(game.scores || {}).map(Number));
  const winners = room.players.filter(uid => Number(game.scores?.[uid] || 0) === max);
  Effects.play("roundWin", `${room.roomId}:bomb:summary`);
  return `<section class="bomb-stage bomb-summary"><p class="eyebrow">KONIEC GRY</p><h1>${winners.map(uid => escapeHtml(accounts[uid]?.nick || "Gracz")).join(", ")} wygrywa</h1><div class="final-ranking">${room.players.slice().sort((a,b)=>Number(game.scores?.[b]||0)-Number(game.scores?.[a]||0)).map((uid,index)=>`<article class="${winners.includes(uid) ? "winner-card" : ""}"><b>#${index + 1}</b>${playerMiniHtml(accounts[uid])}<strong>${Number(game.scores?.[uid] || 0)} pkt</strong></article>`).join("")}</div><button class="primary" id="bomb-lobby">Wroc do lobby</button></section>`;
}

export function renderBombGame(root, { room, accounts, currentUser }, actions) {
  stopBombTimer();
  const game = normalize(room.game, room.players);
  const settings = sanitizeBombSettings(room.settings);
  const active = game.phase === "answering" ? activeUid(game) : "";
  root.innerHTML = `<main class="page bomb-page board-shell enter">${boardPlayerStripHtml(room.players, accounts, { activeUid:active, scores:game.scores })}${bombStage(room, accounts, currentUser)}<button class="ghost leave-game" id="leave-room">Wyjdz z pokoju</button></main>`;
  $("#leave-room").addEventListener("click", actions.leaveRoom);
  $("#bomb-answer-form")?.addEventListener("submit", event => {
    event.preventDefault();
    const input = $("#bomb-answer-input");
    actions.bombAnswer(input?.value || "");
  });
  $("#bomb-answer-input")?.focus();
  $("#bomb-next-round")?.addEventListener("click", actions.bombNextRound);
  $("#bomb-lobby")?.addEventListener("click", actions.returnToRoom);
  if (game.phase === "answering") startBombTimer(game, settings, actions);
}

function startBombTimer(game, settings, actions) {
  const guard = { phaseEndsAt:Number(game.phaseEndsAt || 0), explodesAt:Number(game.explodesAt || 0), activeUid:activeUid(game) };
  const tick = () => {
    const current = now();
    const responseLeft = Math.max(0, Math.ceil((guard.phaseEndsAt - current) / 1000));
    const explosionLeft = Math.max(0, Math.ceil((guard.explodesAt - current) / 1000));
    const visibleLeft = settings.showExplosionTime ? explosionLeft : responseLeft;
    const timer = $("#bomb-turn-timer");
    if (timer) {
      timer.textContent = settings.showExplosionTime ? `${visibleLeft}s` : "???";
      timer.parentElement?.classList.toggle("timer-urgent", (settings.showExplosionTime ? visibleLeft : explosionLeft) <= 5);
    }
    tickBeat = (tickBeat + 1) % 2;
    const tickLimit = settings.showExplosionTime ? visibleLeft : settings.visibleBombState ? explosionLeft : responseLeft;
    if (tickBeat && tickLimit > 0 && tickLimit <= 5) Audio.play("countdown");
    if (responseLeft <= 0 || current >= guard.explodesAt) {
      stopBombTimer();
      actions.bombTimeout?.(guard);
    }
  };
  tick();
  timerId = setInterval(tick, 500);
}

export function stopBombTimer() {
  clearInterval(timerId);
  timerId = null;
  tickBeat = 0;
}
