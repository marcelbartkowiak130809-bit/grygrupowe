import { $, boardPlayerStripHtml, escapeHtml, playerMiniHtml } from "./utils.js?v=20260605-5";
import { Effects } from "./effects.js";

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || min));
const arrayOrEmpty = value => Array.isArray(value) ? value : [];
const objectOrEmpty = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const shuffle = items => [...items].sort(() => Math.random() - .5);

export const closestTruthCategories = [
  { id:"geography", name:"Geografia", questions:[
    { text:"Ile kilometrow ma Wisla?", answer:1047, unit:"km" },
    { text:"Ile panstw jest w Europie?", answer:44, unit:"panstw" },
    { text:"Ile kilometrow ma rownik Ziemi?", answer:40075, unit:"km" },
    { text:"Ile metrow wysokosci ma Mount Everest?", answer:8849, unit:"m" },
    { text:"Ile wojewodztw ma Polska?", answer:16, unit:"" },
    { text:"Ile kilometrow ma Nil?", answer:6650, unit:"km" },
    { text:"Ile panstw graniczy z Polska?", answer:7, unit:"panstw" },
    { text:"Ile metrow glebokosci ma Row Marianski?", answer:10984, unit:"m" },
  ] },
  { id:"animals", name:"Zwierzeta", questions:[
    { text:"Ile kilogramow wazy dorosly slon afrykanski?", answer:6000, unit:"kg" },
    { text:"Ile lat moze zyc zolw olbrzymi?", answer:150, unit:"lat" },
    { text:"Ile kilometrow na godzine potrafi biec gepard?", answer:110, unit:"km/h" },
    { text:"Ile serc ma osmiornica?", answer:3, unit:"" },
    { text:"Ile kilogramow moze wazyc pletwal blekitny?", answer:150000, unit:"kg" },
    { text:"Ile dni trwa ciaza slonia?", answer:660, unit:"dni" },
    { text:"Ile zebow ma dorosly rekin bialy naraz?", answer:300, unit:"zebow" },
    { text:"Ile metrow wysokosci ma dorosla zyrafa?", answer:5.5, unit:"m" },
  ] },
  { id:"space", name:"Kosmos", questions:[
    { text:"Ile planet ma Uklad Sloneczny?", answer:8, unit:"" },
    { text:"Ile minut leci swiatlo ze Slonca na Ziemie?", answer:8.3, unit:"min" },
    { text:"Ile kilometrow wynosi srednia odleglosc Ziemi od Slonca?", answer:149600000, unit:"km" },
    { text:"Ile ziemskich dni trwa rok na Marsie?", answer:687, unit:"dni" },
    { text:"Ile naturalnych ksiezycow ma Mars?", answer:2, unit:"" },
    { text:"Ile kilometrow srednicy ma Ksiezyc?", answer:3474, unit:"km" },
    { text:"Ile lat swietlnych od Ziemi jest Proxima Centauri?", answer:4.24, unit:"lat sw." },
    { text:"Ile stopni Celsjusza ma srednia temperatura powierzchni Wenus?", answer:464, unit:"C" },
  ] },
  { id:"history", name:"Historia", questions:[
    { text:"W ktorym roku odbyl sie chrzest Polski?", answer:966, unit:"rok" },
    { text:"W ktorym roku wybuchla II wojna swiatowa?", answer:1939, unit:"rok" },
    { text:"Ile lat trwala I wojna swiatowa?", answer:4, unit:"lata" },
    { text:"W ktorym roku czlowiek pierwszy raz stanal na Ksiezycu?", answer:1969, unit:"rok" },
    { text:"W ktorym roku upadl mur berlinski?", answer:1989, unit:"rok" },
    { text:"Ile lat trwala wojna stuletnia?", answer:116, unit:"lat" },
    { text:"W ktorym roku Polska weszla do Unii Europejskiej?", answer:2004, unit:"rok" },
    { text:"W ktorym roku zakonczyl sie rozbior Polski numer trzy?", answer:1795, unit:"rok" },
  ] },
  { id:"sport", name:"Sport", questions:[
    { text:"Ile minut trwa podstawowy mecz pilki noznej?", answer:90, unit:"min" },
    { text:"Ile zawodnikow jednej druzyny jest na boisku w siatkowce?", answer:6, unit:"" },
    { text:"Ile punktow daje rzut za trzy w koszykowce?", answer:3, unit:"pkt" },
    { text:"Ile kilometrow ma maraton?", answer:42.195, unit:"km" },
    { text:"Ile okrazen ma finalowy bieg na 400 metrow?", answer:1, unit:"okrazenie" },
    { text:"Ile setow trzeba wygrac w meczu tenisowym do 3 wygranych setow?", answer:3, unit:"sety" },
    { text:"Ile metrow ma basen olimpijski?", answer:50, unit:"m" },
    { text:"Ile zawodnikow jednej druzyny gra na parkiecie w koszykowce?", answer:5, unit:"" },
  ] },
  { id:"technology", name:"Technologia", questions:[
    { text:"W ktorym roku powstal pierwszy iPhone?", answer:2007, unit:"rok" },
    { text:"Ile bitow ma jeden bajt?", answer:8, unit:"bitow" },
    { text:"Ile znakow ma standardowy kod koloru HEX bez znaku #?", answer:6, unit:"znakow" },
    { text:"W ktorym roku powstal YouTube?", answer:2005, unit:"rok" },
    { text:"Ile megabajtow ma jeden gigabajt w zapisie binarnym?", answer:1024, unit:"MB" },
    { text:"Ile klawiszy ma standardowa pelna klawiatura PC?", answer:104, unit:"klawisze" },
    { text:"W ktorym roku wystartowal system Android?", answer:2008, unit:"rok" },
    { text:"Ile pikseli szerokosci ma obraz Full HD?", answer:1920, unit:"px" },
  ] },
];

export const closestTruthDefaults = {
  rounds:8,
  targetScore:20,
  categories:["geography","animals","space","history","sport","technology"],
};

const categoryMap = Object.fromEntries(closestTruthCategories.map(category => [category.id, category]));
const minCategories = 3;

export function sanitizeClosestTruthSettings(raw = {}) {
  const selected = [...new Set(arrayOrEmpty(raw.categories).filter(id => categoryMap[id]))];
  const categories = selected.length >= minCategories ? selected : closestTruthDefaults.categories.slice(0, minCategories);
  return {
    ...closestTruthDefaults,
    ...raw,
    rounds:clamp(raw.rounds || closestTruthDefaults.rounds, 3, 20),
    targetScore:clamp(raw.targetScore || closestTruthDefaults.targetScore, 5, 80),
    categories,
  };
}

function questionPool(settings, used = []) {
  const blocked = new Set(arrayOrEmpty(used));
  const selected = sanitizeClosestTruthSettings(settings).categories;
  const pool = selected.flatMap(id => (categoryMap[id]?.questions || []).map((question, index) => ({ ...question, id:`${id}:${index}`, categoryId:id, categoryName:categoryMap[id].name })));
  const fresh = pool.filter(question => !blocked.has(question.id));
  return fresh.length ? fresh : pool;
}

function chooseQuestion(settings, used) {
  const pool = questionPool(settings, used);
  return pool[Math.floor(Math.random() * pool.length)] || questionPool(closestTruthDefaults, [])[0];
}

function scoreRows(game, players) {
  const answer = Number(game.question?.answer) || 0;
  const rows = players.map(uid => {
    const value = Number(game.answers?.[uid]);
    const distance = Math.abs(value - answer);
    return { uid, value, distance:Number.isFinite(distance) ? distance : Infinity };
  }).sort((a, b) => a.distance - b.distance || a.value - b.value);
  let place = 0;
  let previousDistance = null;
  return rows.map((row, index) => {
    if (previousDistance === null || row.distance !== previousDistance) place = index + 1;
    previousDistance = row.distance;
    return { ...row, place, points:Math.max(1, players.length - place + 1) };
  });
}

function createRound(players, settings, round, scores = {}, usedQuestions = []) {
  const question = chooseQuestion(settings, usedQuestions);
  return {
    phase:"answering",
    round,
    question,
    usedQuestions:[...arrayOrEmpty(usedQuestions), question.id],
    answers:{},
    scores:{ ...Object.fromEntries(players.map(uid => [uid, 0])), ...scores },
    roundScores:{},
    ranking:[],
    revealedAt:null,
  };
}

export function createClosestTruthGame(players, rawSettings) {
  return createRound(players, sanitizeClosestTruthSettings(rawSettings), 1);
}

function normalize(game, players = []) {
  game.answers = objectOrEmpty(game.answers);
  game.scores = objectOrEmpty(game.scores);
  game.roundScores = objectOrEmpty(game.roundScores);
  game.ranking = arrayOrEmpty(game.ranking).filter(row => players.includes(row.uid));
  game.usedQuestions = arrayOrEmpty(game.usedQuestions);
  players.forEach(uid => { if (!(uid in game.scores)) game.scores[uid] = 0; });
  Object.keys(game.scores).forEach(uid => { if (!players.includes(uid)) delete game.scores[uid]; });
  Object.keys(game.answers).forEach(uid => { if (!players.includes(uid)) delete game.answers[uid]; });
  return game;
}

function finishRound(game, players, settings) {
  const ranking = scoreRows(game, players);
  game.ranking = ranking;
  game.roundScores = {};
  ranking.forEach(row => {
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

export const ClosestTruthEngine = {
  answer(game, uid, rawValue, players, rawSettings) {
    const settings = sanitizeClosestTruthSettings(rawSettings);
    normalize(game, players);
    if (game.phase !== "answering") return "Ta runda juz jest zamknieta.";
    if (!players.includes(uid)) return "Nie ma cie w tej rundzie.";
    if (uid in game.answers) return "Twoja odpowiedz juz jest zapisana.";
    const normalized = String(rawValue ?? "").trim().replace(",", ".");
    if (!normalized) return "Wpisz liczbe.";
    const value = Number(normalized);
    if (!Number.isFinite(value)) return "To musi byc liczba.";
    game.answers[uid] = value;
    if (players.every(player => player in game.answers)) finishRound(game, players, settings);
    return null;
  },
  nextRound(game, players, rawSettings) {
    const settings = sanitizeClosestTruthSettings(rawSettings);
    normalize(game, players);
    if (game.phase !== "roundResult") return "Najpierw trzeba odslonic wyniki rundy.";
    Object.assign(game, createRound(players, settings, Number(game.round || 1) + 1, game.scores, game.usedQuestions));
    return null;
  },
};

export function renderClosestTruthLobbySettings(room, isHost) {
  const settings = sanitizeClosestTruthSettings(room.settings);
  const selected = settings.categories;
  return `<div class="impostor-settings-grid truth-settings-grid">
    <label>Liczba rund<select data-truth-setting="rounds" ${isHost ? "" : "disabled"}>${[3,5,8,10,12,15,20].map(n => `<option value="${n}" ${settings.rounds === n ? "selected" : ""}>${n}</option>`).join("")}</select></label>
    <label>Punkty do wygranej<select data-truth-setting="targetScore" ${isHost ? "" : "disabled"}>${[10,15,20,25,30,40,60,80].map(n => `<option value="${n}" ${settings.targetScore === n ? "selected" : ""}>${n}</option>`).join("")}</select></label>
    <div class="most-category-box"><b>Kategorie</b><small>minimum ${minCategories}, baza: ${closestTruthCategories.reduce((sum, category) => sum + category.questions.length, 0)} pytan</small><div class="multi-category-list">${closestTruthCategories.map(category => {
      const disabled = !isHost || selected.includes(category.id) && selected.length <= minCategories;
      return `<label class="check category-chip"><input data-truth-category="${category.id}" type="checkbox" ${selected.includes(category.id) ? "checked" : ""} ${disabled ? "disabled" : ""}> <span>${escapeHtml(category.name)}</span><span class="category-count">${category.questions.length}</span></label>`;
    }).join("")}</div></div>
  </div>`;
}

const numberText = (value, unit = "") => `${Number(value).toLocaleString("pl-PL", { maximumFractionDigits:3 })}${unit ? ` ${escapeHtml(unit)}` : ""}`;

function answerForm(game, currentUser) {
  if (currentUser in objectOrEmpty(game.answers)) return `<div class="waiting-state truth-waiting"><span class="waiting-pulse">OK</span><h3>Odpowiedz zapisana</h3><p>Czekamy na reszte ekipy.</p></div>`;
  return `<form id="truth-answer-form" class="truth-answer-form"><input id="truth-answer-input" type="number" step="any" placeholder="Twoja liczba..." autocomplete="off" autofocus><button class="primary">Zatwierdz</button></form>`;
}

function answeringStage(room, accounts, currentUser, game) {
  const answered = Object.keys(game.answers || {}).length;
  return `<section class="truth-stage">
    <div class="truth-question-card">
      <p class="eyebrow">${escapeHtml(game.question?.categoryName || "Kategoria")} - runda ${Number(game.round) || 1}</p>
      <h1>${escapeHtml(game.question?.text || "Pytanie liczbowe")}</h1>
      <div class="truth-progress"><span style="width:${Math.round(answered / Math.max(1, room.players.length) * 100)}%"></span></div>
      <small>${answered}/${room.players.length} odpowiedzi</small>
    </div>
    <div class="truth-answer-grid">${room.players.map(uid => `<article class="${uid in objectOrEmpty(game.answers) ? "answered" : ""}">${playerMiniHtml(accounts[uid])}<b>${uid in objectOrEmpty(game.answers) ? "Gotowe" : "Mysli..."}</b></article>`).join("")}</div>
    ${answerForm(game, currentUser)}
  </section>`;
}

function resultStage(room, accounts, game) {
  const ranking = arrayOrEmpty(game.ranking);
  const maxDistance = Math.max(1, ...ranking.map(row => Number(row.distance) || 0));
  return `<section class="truth-stage truth-reveal">
    <div class="truth-question-card reveal-card">
      <p class="eyebrow">${escapeHtml(game.question?.categoryName || "Kategoria")} - odpowiedz</p>
      <h1>${numberText(game.question?.answer, game.question?.unit)}</h1>
      <p>${escapeHtml(game.question?.text || "")}</p>
    </div>
    <div class="truth-bars">${ranking.map((row, index) => {
      const closeness = Math.max(0, Math.round((1 - (Number(row.distance) || 0) / maxDistance) * 100));
      return `<article class="${index === 0 ? "closest" : ""}" style="--truth:${closeness}">
        <div class="truth-bar-head"><b>#${row.place}</b>${playerMiniHtml(accounts[row.uid])}<strong>+${row.points} pkt</strong></div>
        <div class="truth-scale"><span></span></div>
        <div class="truth-values"><span>${numberText(row.value, game.question?.unit)}</span><span>roznica: ${numberText(row.distance, game.question?.unit)}</span></div>
      </article>`;
    }).join("")}</div>
    <div class="truth-round-ranking final-ranking">${room.players.slice().sort((a,b)=>Number(game.scores?.[b]||0)-Number(game.scores?.[a]||0)).map((uid,index)=>`<article class="${index === 0 ? "winner-card" : ""}"><b>#${index + 1}</b>${playerMiniHtml(accounts[uid])}<strong>${Number(game.scores?.[uid] || 0)} pkt</strong></article>`).join("")}</div>
    <button class="primary" id="truth-next-round">Nastepna runda</button>
  </section>`;
}

function summaryStage(room, accounts, game) {
  const max = Math.max(0, ...Object.values(game.scores || {}).map(Number));
  const winners = room.players.filter(uid => Number(game.scores?.[uid] || 0) === max);
  Effects.play("roundWin", `${room.roomId}:truth:summary`);
  return `<section class="truth-stage truth-summary"><p class="eyebrow">KONIEC GRY</p><h1>${winners.map(uid => escapeHtml(accounts[uid]?.nick || "Gracz")).join(", ")} najblizej prawdy</h1><div class="final-ranking">${room.players.slice().sort((a,b)=>Number(game.scores?.[b]||0)-Number(game.scores?.[a]||0)).map((uid,index)=>`<article class="${winners.includes(uid) ? "winner-card" : ""}"><b>#${index + 1}</b>${playerMiniHtml(accounts[uid])}<strong>${Number(game.scores?.[uid] || 0)} pkt</strong></article>`).join("")}</div><button class="primary" id="truth-lobby">Wroc do lobby</button></section>`;
}

export function renderClosestTruthGame(root, { room, accounts, currentUser }, actions) {
  const game = normalize(room.game, room.players);
  const activeScores = game.scores || {};
  const stage = game.phase === "answering" ? answeringStage(room, accounts, currentUser, game) : game.phase === "roundResult" ? resultStage(room, accounts, game) : summaryStage(room, accounts, game);
  root.innerHTML = `<main class="page truth-page board-shell enter">${boardPlayerStripHtml(room.players, accounts, { scores:activeScores })}${stage}<button class="ghost leave-game" id="leave-room">Wyjdz z pokoju</button></main>`;
  $("#leave-room")?.addEventListener("click", actions.leaveRoom);
  $("#truth-answer-form")?.addEventListener("submit", event => {
    event.preventDefault();
    actions.closestTruthAnswer($("#truth-answer-input")?.value || "");
  });
  $("#truth-answer-input")?.focus();
  $("#truth-next-round")?.addEventListener("click", actions.closestTruthNext);
  $("#truth-lobby")?.addEventListener("click", actions.returnToRoom);
}
