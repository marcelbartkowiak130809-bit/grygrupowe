import { identityCategories, identityCategoryNames } from "../content/kim-jestem/categories.js";
import { $, avatarHtml, escapeHtml, normalizeAnswer, playerMiniHtml } from "./utils.js";
import { levelBadgeHtml } from "./progression.js";
import { Audio } from "./audio.js";
import { Effects } from "./effects.js";

let timerId, lastCountdown;

export const identityDefaults = {
  category: "Wszystkie",
  turnTime: 45,
  rounds: 3,
  responseMode: "extended",
  gameFlow: "normal",
  targetScore: 3,
  oneGuess: true,
  newAfterGuess: true,
  endAfterRounds: true,
  playerWordsEnabled: false,
};

const shuffle = a => [...a].sort(() => Math.random() - .5);
const now = () => Date.now();
const objectOrEmpty = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const arrayOrEmpty = value => Array.isArray(value) ? value : [];
const mini = p => playerMiniHtml(p);
const clampNumber = (value, min, max, fallback) => Math.max(min, Math.min(max, Number(value) || fallback));
const settingsWithDefaults = settings => {
  const s = { ...identityDefaults, ...settings };
  s.rounds = clampNumber(s.rounds, 1, 10, identityDefaults.rounds);
  s.targetScore = clampNumber(s.targetScore, 1, 5, identityDefaults.targetScore);
  s.turnTime = clampNumber(s.turnTime, 20, 90, identityDefaults.turnTime);
  s.gameFlow = s.gameFlow === "voice" ? "voice" : "normal";
  return s;
};
const roundLimit = (game, settings) => Math.min(99, clampNumber(game.roundsLimit || settings.rounds, 1, 99, settings.rounds));
const scoreDone = (game, uid, settings) => Number(game.scores?.[uid] || 0) >= settings.targetScore;

function pool(settings, customWords) {
  let base = settings.category === "Wszystkie" ? Object.values(identityCategories).flat() : identityCategories[settings.category] || [];
  const own = Object.values(customWords || {}).flat();
  return [...own, ...base];
}

function drawWord(game, uid, settings, customWords) {
  const choices = shuffle(pool(settings, customWords)).filter(word => !(customWords?.[uid] || []).includes(word));
  return choices[0] || shuffle(pool(settings, customWords))[0] || "tajemnicza postac";
}

function ensureWordHistory(game, players) {
  game.wordHistory = objectOrEmpty(game.wordHistory);
  players.forEach(uid => {
    if (!Array.isArray(game.wordHistory[uid])) {
      game.wordHistory[uid] = game.words?.[uid] ? [{ word: game.words[uid], startRound: 1, endRound: null }] : [];
    }
  });
  Object.keys(game.wordHistory).forEach(uid => { if (!players.includes(uid)) delete game.wordHistory[uid]; });
}

function closeWordHistory(game, uid, endRound = game.round) {
  const entries = game.wordHistory?.[uid];
  const last = Array.isArray(entries) ? entries[entries.length - 1] : null;
  if (last && !last.endRound) last.endRound = Math.max(Number(last.startRound) || 1, Number(endRound) || 1);
}

function assignNewWord(game, uid, settings, customWords) {
  const word = drawWord(game, uid, settings, customWords);
  game.words[uid] = word;
  game.wordHistory[uid] ||= [];
  game.wordHistory[uid].push({ word, startRound: Math.max(1, Number(game.round) || 1), endRound: null });
}

export function createIdentityGame(players, settings, customWords = {}) {
  const s = settingsWithDefaults(settings);
  const words = {};
  players.forEach(uid => words[uid] = drawWord({}, uid, s, customWords));
  const order = shuffle(players);
  return {
    phase: "turn",
    order,
    turnIndex: 0,
    round: 1,
    roundsLimit: s.rounds,
    words,
    wordHistory: Object.fromEntries(players.map(uid => [uid, [{ word: words[uid], startRound: 1, endRound: null }]])),
    history: [],
    responses: {},
    extendVotes: {},
    pending: null,
    scores: Object.fromEntries(players.map(uid => [uid, 0])),
    phaseEndsAt: now() + s.turnTime * 1000,
  };
}

function normalizeIdentityGame(game, players = []) {
  game.history = arrayOrEmpty(game.history);
  game.responses = objectOrEmpty(game.responses);
  game.extendVotes = objectOrEmpty(game.extendVotes);
  game.scores = objectOrEmpty(game.scores);
  game.words = objectOrEmpty(game.words);
  game.order = Array.isArray(game.order) ? game.order : (players.length ? [...players] : Object.keys(game.words));
  if (!Number.isFinite(Number(game.turnIndex))) game.turnIndex = 0;
  if (!Number.isFinite(Number(game.round))) game.round = 1;
  ensureWordHistory(game, players.length ? players : game.order);
  return game;
}

function finishGame(game, settings) {
  game.order.forEach(uid => closeWordHistory(game, uid, Math.min(Number(game.round) || 1, roundLimit(game, settings))));
  game.phase = "results";
  game.pending = null;
  game.responses = {};
  game.extendVotes = {};
  game.phaseEndsAt = null;
}

function startExtendVote(game, settings) {
  if (!settings.endAfterRounds || roundLimit(game, settings) >= 99) return finishGame(game, settings);
  game.phase = "extendVote";
  game.pending = null;
  game.responses = {};
  game.extendVotes = {};
  game.phaseEndsAt = now() + 15000;
}

function advance(game, settingsRaw, customWords) {
  const settings = settingsWithDefaults(settingsRaw);
  game.pending = null;
  game.responses = {};
  game.repeatUntil = null;
  if (!game.order.some(uid => !scoreDone(game, uid, settings))) return finishGame(game, settings);

  let checked = 0;
  while (checked < game.order.length) {
    game.turnIndex++;
    if (game.turnIndex >= game.order.length) {
      game.turnIndex = 0;
      game.round++;
      if (settings.endAfterRounds && game.round > roundLimit(game, settings)) return startExtendVote(game, settings);
    }
    if (!scoreDone(game, game.order[game.turnIndex], settings)) break;
    checked++;
  }
  if (checked >= game.order.length) return finishGame(game, settings);
  game.phase = "turn";
  game.phaseEndsAt = now() + settings.turnTime * 1000;
}

function settleExtendVote(game, players, settingsRaw, forceEnd = false) {
  const settings = settingsWithDefaults(settingsRaw);
  const votes = Object.values(game.extendVotes || {});
  const yes = votes.filter(Boolean).length;
  const no = votes.length - yes;
  if (!forceEnd && yes > no && roundLimit(game, settings) < 99) {
    game.roundsLimit = roundLimit(game, settings) + 1;
    game.phase = "turn";
    game.extendVotes = {};
    game.turnIndex = Math.max(0, Math.min(game.turnIndex || 0, game.order.length - 1));
    if (scoreDone(game, game.order[game.turnIndex], settings)) advance(game, settings, {});
    else game.phaseEndsAt = now() + settings.turnTime * 1000;
    return;
  }
  finishGame(game, settings);
}

export const IdentityEngine = {
  submit(game, uid, text, type, settingsRaw, customWords) {
    const settings = settingsWithDefaults(settingsRaw);
    normalizeIdentityGame(game);
    if (game.phase !== "turn" || game.order[game.turnIndex] !== uid) return "To nie jest twoja tura.";
    if (scoreDone(game, uid, settings)) return "Masz juz komplet punktow.";
    if (!text.trim()) return "Wpisz pytanie lub odpowiedz.";
    const correct = type === "guess" && normalizeAnswer(text) === normalizeAnswer(game.words[uid]);
    game.pending = { uid, text: text.trim(), type, correct };
    if (correct) {
      game.scores[uid] = (game.scores[uid] || 0) + 1;
      game.history.push({ ...game.pending, answer: "TRAFIONE" });
      if (scoreDone(game, uid, settings)) closeWordHistory(game, uid, game.round);
      else if (settings.newAfterGuess) { closeWordHistory(game, uid, game.round); assignNewWord(game, uid, settings, customWords); }
      advance(game, settings, customWords);
    } else {
      game.phase = "responses";
      game.responses = {};
      game.phaseEndsAt = now() + settings.turnTime * 1000;
    }
  },
  voiceQuestion(game, uid, settingsRaw) {
    const settings = settingsWithDefaults(settingsRaw);
    normalizeIdentityGame(game);
    if (settings.gameFlow !== "voice") return "Ten pokoj nie jest w trybie glosowym.";
    if (game.phase !== "turn" || game.order[game.turnIndex] !== uid) return "To nie jest twoja tura.";
    game.pending = { uid, text: "Pytanie glosowe", type: "question", correct: false, voice: true };
    game.phase = "responses";
    game.responses = {};
    game.repeatUntil = null;
    game.phaseEndsAt = now() + settings.turnTime * 1000;
  },
  respond(game, uid, response, settingsRaw, customWords) {
    normalizeIdentityGame(game);
    if (game.phase !== "responses") return "Pytanie nie oczekuje juz na odpowiedzi.";
    if (uid === game.pending?.uid) return "Aktywny gracz nie odpowiada na wlasne pytanie.";
    if (uid in game.responses) return "Twoja odpowiedz zostala juz zapisana.";
    game.responses[uid] = response;
    const needed = game.order.filter(id => id !== game.pending?.uid).length;
    if (Object.keys(game.responses).length >= needed) {
      game.history.push({ ...game.pending, answer: Object.values(game.responses).join(" / ") });
      advance(game, settingsRaw, customWords);
    }
    return null;
  },
  repeat(game, uid) {
    normalizeIdentityGame(game);
    if (game.phase !== "responses") return "Powtorke mozna prosic tylko podczas odpowiedzi.";
    if (Number(game.repeatUntil || 0) > now()) return "Powtórka jest już aktywna.";
    game.repeatUntil = now() + 15000;
    game.phaseEndsAt = Math.max(Number(game.phaseEndsAt) || 0, game.repeatUntil);
    game.repeatBy = uid;
    return null;
  },
  extendVote(game, uid, addRound, players, settingsRaw) {
    normalizeIdentityGame(game, players);
    if (game.phase !== "extendVote") return "Teraz nie ma glosowania nad dogrywka.";
    game.extendVotes[uid] = Boolean(addRound);
    const eligible = players?.length ? players : game.order;
    if (eligible.every(id => id in game.extendVotes)) settleExtendVote(game, eligible, settingsRaw);
    return null;
  },
  timeout(game, settingsRaw, customWords) {
    normalizeIdentityGame(game);
    const settings = settingsWithDefaults(settingsRaw);
    if (game.phase === "extendVote") return settleExtendVote(game, game.order, settings, true);
    if (game.phase === "turn") game.history.push({ uid: game.order[game.turnIndex], text: "brak pytania", type: "miss", answer: "CZAS" });
    else if (game.phase === "responses") game.history.push({ ...game.pending, answer: "CZAS" });
    advance(game, settings, customWords);
  },
};

export function renderIdentityLobbySettings(room, isHost) {
  const s = settingsWithDefaults(room.settings);
  return `<div class="impostor-settings-grid">
<label>Tryb gry<select data-identity-setting="gameFlow" ${isHost ? "" : "disabled"}><option value="normal" ${s.gameFlow === "normal" ? "selected" : ""}>Normalny, pisany</option><option value="voice" ${s.gameFlow === "voice" ? "selected" : ""}>Głosowy / Discord</option></select></label>
<label>Kategoria<select data-identity-setting="category" ${isHost ? "" : "disabled"}>${["Wszystkie", ...identityCategoryNames].map(x => `<option ${s.category === x ? "selected" : ""}>${x}</option>`).join("")}</select></label>
<label>Czas tury <b>${s.turnTime}s</b><input data-identity-setting="turnTime" type="range" min="20" max="90" step="5" value="${s.turnTime}" ${isHost ? "" : "disabled"}></label>
<label>Liczba rund<select data-identity-setting="rounds" ${isHost ? "" : "disabled"}>${[1,2,3,4,5,6,7,8,9,10].map(n => `<option ${s.rounds === n ? "selected" : ""}>${n}</option>`).join("")}</select></label>
<label>Gramy do<select data-identity-setting="targetScore" ${isHost ? "" : "disabled"}>${[1,2,3,4,5].map(n => `<option ${s.targetScore === n ? "selected" : ""}>${n} trafien${n === 1 ? "ia" : ""}</option>`).join("")}</select></label>
<label>Odpowiedzi<select data-identity-setting="responseMode" ${isHost ? "" : "disabled"}><option value="binary" ${s.responseMode === "binary" ? "selected" : ""}>TAK / NIE</option><option value="extended" ${s.responseMode === "extended" ? "selected" : ""}>TAK / NIE / NIE WIEM / CZESCIOWO</option></select></label>
<label class="check"><input data-identity-setting="oneGuess" type="checkbox" ${s.oneGuess ? "checked" : ""} ${isHost ? "" : "disabled"}> Jedna proba zgadniecia na ture</label>
<label class="check"><input data-identity-setting="newAfterGuess" type="checkbox" ${s.newAfterGuess ? "checked" : ""} ${isHost ? "" : "disabled"}> Nowa postac po trafieniu</label>
<label class="check"><input data-identity-setting="endAfterRounds" type="checkbox" ${s.endAfterRounds ? "checked" : ""} ${isHost ? "" : "disabled"}> Glosowanie po X rundach</label>
<label class="check"><input data-identity-setting="playerWordsEnabled" type="checkbox" ${s.playerWordsEnabled ? "checked" : ""} ${isHost ? "" : "disabled"}> Hasla graczy</label></div>
<p class="tiny identity-mode-note">${s.gameFlow === "voice" ? "Przed wejściem widać, że pokój koordynuje rozmowę głosową. Sama rozmowa może iść przez Discorda lub mikrofon przeglądarki u graczy." : "Tryb pisany: pytania i odpowiedzi idą przez ekran gry."}</p>
${s.playerWordsEnabled ? `<div class="custom-words"><label>Twoje wlasne hasla (1-5, oddziel przecinkami)</label><div class="row"><input id="identity-custom-words" value="${escapeHtml((room.customWords?.[room.viewerUid] || []).join(", "))}" placeholder="np. Shrek, lodowka, Warszawa"><button id="save-identity-words">Zapisz hasla</button></div></div>` : ""}`;
}

export function stopIdentityTimer() {
  clearInterval(timerId);
  timerId = null;
  lastCountdown = null;
}

const timer = g => g.phaseEndsAt ? `<div class="timer-box"><b id="identity-timer">${Math.max(0, Math.ceil((g.phaseEndsAt - now()) / 1000))}s</b></div>` : "";

function identityBoard(game, accounts, currentUser, active, settings) {
  return `<section class="identity-board">${game.order.map(uid => {
    const done = scoreDone(game, uid, settings);
    return `<article class="identity-player-card ${uid === active ? "active-identity-card" : ""} ${uid === currentUser ? "own-identity-card" : ""} ${done ? "identity-card-done" : ""}">
      <span class="identity-card-pin"></span>
      ${avatarHtml(accounts[uid], "identity-avatar")}
      <span class="identity-card-name"><span class="nick ${accounts[uid]?.selectedNickEffect || "defaultNick"}">${escapeHtml(accounts[uid]?.nick || "Gracz")}</span>${levelBadgeHtml(accounts[uid])}</span>
      <div class="identity-card-word">${uid === currentUser ? "???" : escapeHtml(game.words[uid] || "ukonczone")}</div>
      <small>${done ? "ukonczone" : uid === currentUser ? `${game.scores[uid] || 0}/${settings.targetScore} pkt` : `${game.scores[uid] || 0} pkt`}</small>
    </article>`;
  }).join("")}</section>`;
}

function notepadHtml(roomId, currentUser) {
  const key = `identity-notes:${roomId}:${currentUser}`;
  let value = "";
  try { value = localStorage.getItem(key) || ""; } catch {}
  return `<section class="panel identity-notepad"><div class="section-heading"><div><p class="eyebrow">NOTATNIK</p><h3>Twoje prywatne notatki</h3></div></div><textarea id="identity-notepad" data-note-key="${escapeHtml(key)}" placeholder="Pisz, co chcesz. Tego nie widza inni gracze.">${escapeHtml(value)}</textarea></section>`;
}

function resultsHistory(game, accounts) {
  const limit = roundLimit(game, settingsWithDefaults({ rounds: game.roundsLimit || game.round || 1 }));
  return `<div class="identity-history-grid">${game.order.map(uid => {
    const entries = arrayOrEmpty(game.wordHistory?.[uid]);
    return `<article class="identity-history-column">${mini(accounts[uid])}<div class="identity-history-items">${entries.map(item => {
      const start = Number(item.startRound) || 1;
      const end = Number(item.endRound) || Math.min(limit, Number(game.round) || limit);
      const label = start === end ? `runda ${start}` : `rundy ${start}-${end}`;
      return `<p><b>${escapeHtml(item.word || "???")}</b><small>${label}</small></p>`;
    }).join("") || '<p class="muted">Brak hasel.</p>'}</div></article>`;
  }).join("")}</div>`;
}

function normalTurnHtml(me, active, accounts) {
  return me
    ? `<form id="identity-form"><input id="identity-input" placeholder="zadaj pytanie albo zgadnij"><div class="choice-row"><button class="primary" data-identity-type="question">Zadaj pytanie</button><button data-identity-type="guess">Zgaduje</button></div></form>`
    : `<div class="waiting-state"><span class="waiting-pulse">...</span><h3>Teraz pyta ${escapeHtml(accounts[active]?.nick || "inny gracz")}</h3><p>Czekaj na pytanie. Potem wybierzesz odpowiedz.</p></div>`;
}

function voiceTurnHtml(me, active, accounts) {
  return me
    ? `<div class="identity-voice-box"><p class="eyebrow">TRYB GLOSOWY</p><h3>Twoj mikrofon jest teraz aktywny w rozmowie.</h3><p>Zadaj pytanie na glos, a potem kliknij, ze grupa ma odpowiadac. Gdy juz wiesz, wpisz zgadywana postac.</p><button class="primary" id="identity-voice-question">Zadalem pytanie</button><form id="identity-form" class="identity-guess-form"><input id="identity-input" placeholder="wpisz, kim jestes"><button data-identity-type="guess">Zgaduje</button></form></div>`
    : `<div class="waiting-state voice-listen"><span class="waiting-pulse">ON</span><h3>Sluchaj pytania od ${escapeHtml(accounts[active]?.nick || "gracza")}</h3><p>Po pytaniu gra przelaczy ekran na odpowiedzi grupy.</p><button id="identity-enable-mic">Popros o dostep do mikrofonu</button></div>`;
}

function responsesHtml(game, currentUser, accounts, answers) {
  const active = game.pending?.uid;
  const me = active === currentUser;
  const repeatActive = Number(game.repeatUntil || 0) > now();
  if (me) {
    return `<p>${game.pending?.voice ? "Pytanie zostało zadane na głos." : `Twoje pytanie: <b>${escapeHtml(game.pending?.text || "")}</b>`}</p><div class="waiting-state ${repeatActive ? "repeat-active" : ""}"><span class="waiting-pulse">${repeatActive ? "15" : "..."}</span><h3>${repeatActive ? "Powtórka aktywna" : "Czekamy na odpowiedzi grupy"}</h3><p>${repeatActive ? "Powtórz pytanie na głos. Po chwili grupa znowu odpowie." : "Znajomi odpowiadają teraz na twoje pytanie."}</p><button id="identity-repeat">Możesz powtórzyć?</button></div>`;
  }
  if (currentUser in game.responses) {
    return `<div class="waiting-state"><span class="waiting-pulse">OK</span><h3>Twoja odpowiedź została zapisana</h3><p>Czekamy jeszcze na ${Math.max(0, game.order.length - 1 - Object.keys(game.responses).length)} graczy.</p><button id="identity-repeat">Możesz powtórzyć?</button></div>`;
  }
  return `<p>${game.pending?.voice ? `${escapeHtml(accounts[active]?.nick || "Gracz")} zadał pytanie na głos.` : escapeHtml(game.pending?.text || "")}</p><div class="choice-row">${answers.map(a => `<button data-identity-response="${a}">${a}</button>`).join("")}</div><div class="choice-row"><button id="identity-repeat">Możesz powtórzyć?</button></div>`;
}

export function renderIdentityGame(root, { room, accounts, currentUser }, actions) {
  stopIdentityTimer();
  const g = normalizeIdentityGame(room.game, room.players);
  const s = settingsWithDefaults(room.settings);
  g.scores ||= Object.fromEntries(room.players.map(uid => [uid, 0]));
  g.roundsLimit ||= s.rounds;
  const active = g.order[g.turnIndex];
  const me = active === currentUser;
  if (g.phase === "results") Effects.play("roundWin", `${room.roomId}:identity:results`);
  const answers = s.responseMode === "binary" ? ["TAK", "NIE"] : ["TAK", "NIE", "NIE WIEM", "CZESCIOWO"];
  const roundText = `RUNDA ${Math.min(g.round, roundLimit(g, s))}/${roundLimit(g, s)}`;
  const main = g.phase === "results"
    ? `<section class="panel center identity-results"><h1>Koniec gry</h1><div class="final-ranking">${Object.entries(g.scores).sort((a,b) => b[1] - a[1]).map(([uid,n], index) => `<article><b>#${index + 1}</b>${mini(accounts[uid])}<strong>${n} pkt</strong></article>`).join("")}</div><h2>Kto kim byl</h2>${resultsHistory(g, accounts)}<button class="primary" id="identity-again">Wroc do lobby</button></section>`
    : g.phase === "extendVote"
      ? `<section class="panel identity-main center"><div class="game-top"><div><p class="eyebrow">DOGRYWKA</p><h1>Dodajemy jeszcze jedną rundę?</h1></div>${timer(g)}</div><p class="muted">Głosowanie kończy grę, jeżeli grupa nie chce dogrywki.</p><div class="choice-row"><button class="primary" data-identity-extend="true">Dodaj rundę</button><button data-identity-extend="false">Kończymy</button></div><div class="vote-details">${Object.entries(g.extendVotes || {}).map(([uid, vote]) => `<span>${escapeHtml(accounts[uid]?.nick || "Gracz")}: ${vote ? "jeszcze jedna" : "koniec"}</span>`).join("")}</div></section>`
      : `<section class="panel identity-main"><div class="game-top"><div><p class="eyebrow">${roundText} · ${s.gameFlow === "voice" ? "GŁOSOWY" : "PISANY"}</p><h1>${escapeHtml(accounts[active]?.nick || "Gracz")} zgaduje</h1></div>${timer(g)}</div><div class="identity-turn-token">${me ? "Twoja kolej. Patrz na karty znajomych i odkryj własną postać." : `${escapeHtml(accounts[active]?.nick || "Gracz")} próbuje odkryć swoją kartę.`}</div>${g.phase === "turn" ? (s.gameFlow === "voice" ? voiceTurnHtml(me, active, accounts) : normalTurnHtml(me, active, accounts)) : responsesHtml(g, currentUser, accounts, answers)}</section>`;

  root.innerHTML = `<main class="page identity-page board-shell enter"><section class="identity-table"><p class="eyebrow">STOL GRACZY</p>${identityBoard(g, accounts, currentUser, active, s)}</section>${main}<section class="identity-side-grid">${notepadHtml(room.roomId, currentUser)}<section class="panel"><h3>Historia</h3><div class="clue-list">${g.history.slice(-10).reverse().map(h => `<div class="clue"><b>${escapeHtml(accounts[h.uid]?.nick || "Gracz")}</b><span>${escapeHtml(h.text || "")}</span><small>${escapeHtml(h.answer || "")}</small></div>`).join("") || '<p class="muted">Brak pytan.</p>'}</div></section></section><button class="ghost" id="leave-room">Wyjdz</button></main>`;

  $("#leave-room").addEventListener("click", actions.leaveRoom);
  $("#identity-again")?.addEventListener("click", actions.returnToRoom);
  $("#identity-voice-question")?.addEventListener("click", () => actions.identityVoiceQuestion());
  $("#identity-repeat")?.addEventListener("click", () => actions.identityRepeatRequest());
  $("#identity-enable-mic")?.addEventListener("click", async event => {
    try {
      await navigator.mediaDevices?.getUserMedia?.({ audio: true });
      event.currentTarget.textContent = "Mikrofon dozwolony";
      event.currentTarget.disabled = true;
    } catch {
      event.currentTarget.textContent = "Brak dostepu do mikrofonu";
    }
  });
  $("#identity-notepad")?.addEventListener("input", event => {
    try { localStorage.setItem(event.currentTarget.dataset.noteKey, event.currentTarget.value); } catch {}
  });
  root.querySelectorAll("[data-identity-type]").forEach(b => b.addEventListener("click", e => {
    e.preventDefault();
    actions.identitySubmit($("#identity-input")?.value || "", b.dataset.identityType);
  }));
  root.querySelectorAll("[data-identity-response]").forEach(b => b.addEventListener("click", () => actions.identityRespond(b.dataset.identityResponse)));
  root.querySelectorAll("[data-identity-extend]").forEach(b => b.addEventListener("click", () => actions.identityExtendVote(b.dataset.identityExtend === "true")));
  if (g.phase !== "results") startTimer(actions);
}

function startTimer(actions) {
  timerId = setInterval(() => {
    const el = $("#identity-timer");
    if (!el) return;
    const left = Math.max(0, Number(el.textContent.replace("s", "")) - 1);
    el.textContent = `${left}s`;
    if (left > 0 && left <= 3 && lastCountdown !== left) { lastCountdown = left; Audio.play("countdown"); }
    if (!left) { stopIdentityTimer(); actions.identityTimeout(); }
  }, 1000);
}
