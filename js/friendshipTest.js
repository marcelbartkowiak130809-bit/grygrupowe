import { friendshipCategories, friendshipQuestions } from "../content/test-znajomosci/questions.js";
import { $, boardPlayerStripHtml, escapeHtml, playerMiniHtml, resultPlayerMiniHtml } from "./utils.js?v=20260903-7";
import { Audio } from "./audio.js";
import { Effects } from "./effects.js";

let timerId, lastCountdown;
const now = () => Date.now();
const shuffle = items => [...items].sort(() => Math.random() - .5);
const mini = profile => playerMiniHtml(profile);
export const friendshipDefaults = { rounds:5, answerTime:15, assignTime:30, category:"", categories:friendshipCategories.slice(0,3), rewardCoins:true };
const minFriendCategories = 3;
const objectOrEmpty = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const arrayOrEmpty = value => Array.isArray(value) ? value : [];
function normalizeFriendshipGame(game) {
  game.answers = objectOrEmpty(game.answers);
  game.guesses = objectOrEmpty(game.guesses);
  game.scores = objectOrEmpty(game.scores);
  game.roundScores = objectOrEmpty(game.roundScores);
  game.answerOrder = arrayOrEmpty(game.answerOrder);
  game.usedQuestions = arrayOrEmpty(game.usedQuestions);
  return game;
}
function selectedFriendCategories(settings) {
  let picked = Array.isArray(settings.categories) ? settings.categories : (settings.category && settings.category !== "Wszystkie" ? [settings.category] : friendshipCategories.slice(0, 3));
  picked = [...new Set(picked)].filter(category => friendshipCategories.includes(category));
  friendshipCategories.forEach(category => { if (picked.length < minFriendCategories && !picked.includes(category)) picked.push(category); });
  return picked;
}
function pickQuestion(settings, used = []) {
  const categories = selectedFriendCategories(settings);
  const pool = friendshipQuestions.filter(item => categories.includes(item.category) && !used.includes(item.text));
  return shuffle(pool)[0] || shuffle(friendshipQuestions.filter(item => categories.includes(item.category)))[0];
}
function startAssigning(game, players, settings) {
  normalizeFriendshipGame(game);
  players.forEach(uid => game.answers[uid] ??= "brak odpowiedzi");
  game.answerOrder = shuffle(players); game.guesses = {}; game.phase = "assigning"; game.phaseEndsAt = now() + settings.assignTime * 1000;
}
function allAssigned(game, players) { normalizeFriendshipGame(game); return players.every(uid => Object.keys(game.guesses[uid] || {}).length >= players.length - 1); }
function startReveal(game) {
  game.phase = "revealing"; game.revealIndex = 0; game.phaseEndsAt = null;
}
function finishRound(game, players) {
  normalizeFriendshipGame(game);
  const gained = Object.fromEntries(players.map(uid => [uid, 0]));
  players.forEach(guesser => Object.entries(game.guesses[guesser] || {}).forEach(([answerId, target]) => { if (answerId === target) { gained[guesser]++; game.scores[guesser]++; } }));
  game.roundScores = gained; game.phase = "roundSummary";
}
function newRound(game, players, settings) {
  normalizeFriendshipGame(game);
  game.round++; game.question = pickQuestion(settings, game.usedQuestions); game.usedQuestions.push(game.question.text);
  Object.assign(game, { phase:"waitingForAnswers", answers:{}, guesses:{}, answerOrder:[], revealIndex:0, roundScores:{}, phaseEndsAt:now() + settings.answerTime * 1000 });
}
export function createFriendshipTestGame(players, rawSettings) {
  const settings = { ...friendshipDefaults, ...rawSettings }, question = pickQuestion(settings);
  return { phase:"waitingForAnswers", round:1, question, usedQuestions:[question.text], answers:{}, guesses:{}, answerOrder:[], revealIndex:0, scores:Object.fromEntries(players.map(uid => [uid, 0])), roundScores:{}, phaseEndsAt:now() + settings.answerTime * 1000 };
}
export const FriendshipTestEngine = {
  answer(game, uid, text, players, settings) {
    normalizeFriendshipGame(game);
    if (game.phase !== "waitingForAnswers" || uid in game.answers) return;
    if (!text.trim()) return "Wpisz odpowiedź.";
    game.answers[uid] = text.trim();
    if (Object.keys(game.answers).length >= players.length) startAssigning(game, players, settings);
  },
  guess(game, uid, answerId, target, players) {
    normalizeFriendshipGame(game);
    if (game.phase !== "assigning" || answerId === uid || target === uid) return;
    game.guesses[uid] ??= {};
    if (answerId in game.guesses[uid]) return;
    game.guesses[uid][answerId] = target;
    if (allAssigned(game, players)) startReveal(game);
  },
  timeout(game, players, settings) {
    normalizeFriendshipGame(game);
    if (game.phase === "waitingForAnswers") startAssigning(game, players, settings);
    else if (game.phase === "assigning") startReveal(game);
  },
  nextReveal(game, players) {
    normalizeFriendshipGame(game);
    if (game.revealIndex < game.answerOrder.length - 1) game.revealIndex++;
    else finishRound(game, players);
  },
  nextRound(game, players, settings) {
    normalizeFriendshipGame(game);
    if (game.round >= settings.rounds) game.phase = "gameSummary";
    else newRound(game, players, settings);
  },
};
export function renderFriendshipLobbySettings(room, isHost) {
  const s = { ...friendshipDefaults, ...room.settings };
  const selected = selectedFriendCategories(s);
  return `<div class="impostor-settings-grid">
    <label>Liczba rund<select data-friend-setting="rounds" ${isHost ? "" : "disabled"}>${[1,3,5,8,10].map(n => `<option ${s.rounds === n ? "selected" : ""}>${n}</option>`).join("")}</select></label>
    <label>Czas odpowiedzi <b>${s.answerTime}s</b><input data-friend-setting="answerTime" type="range" min="10" max="30" step="5" value="${s.answerTime}" ${isHost ? "" : "disabled"}></label>
    <label>Czas przypisywania <b>${s.assignTime}s</b><input data-friend-setting="assignTime" type="range" min="20" max="60" step="5" value="${s.assignTime}" ${isHost ? "" : "disabled"}></label>
    <div class="most-category-box"><b>Kategorie</b><small>minimum ${minFriendCategories}, bez limitu</small><div class="multi-category-list">${friendshipCategories.map(category => `<label class="check category-chip"><input data-friend-category="${escapeHtml(category)}" type="checkbox" ${selected.includes(category) ? "checked" : ""} ${!isHost || selected.length <= minFriendCategories && selected.includes(category) ? "disabled" : ""}> ${escapeHtml(category)}</label>`).join("")}</div></div>
    <label class="check"><input data-friend-setting="rewardCoins" type="checkbox" ${s.rewardCoins ? "checked" : ""} ${isHost ? "" : "disabled"}> Nagrody coinowe</label>
  </div>`;
}
export function stopFriendshipTimer() { clearInterval(timerId); timerId = null; lastCountdown = null; }
const timer = game => `<div class="timer-box"><b id="friend-timer">${Math.max(0, Math.ceil((game.phaseEndsAt - now()) / 1000))}s</b></div>`;
export function renderFriendshipTestGame(root, { room, accounts, currentUser }, actions) {
  stopFriendshipTimer(); const g = room.game, s = { ...friendshipDefaults, ...room.settings }; g.answers ||= {}; g.guesses ||= {}; g.answerOrder ||= []; g.scores ||= Object.fromEntries(room.players.map(uid => [uid, 0])); g.roundScores ||= {}; let body;
  if(g.phase==="revealing")Effects.play("reveal",`${room.roomId}:friend:${g.round}:${g.revealIndex}`);if(g.phase==="roundSummary")Effects.play("voteResult",`${room.roomId}:friend:round:${g.round}`);if(g.phase==="gameSummary")Effects.play("roundWin",`${room.roomId}:friend:summary`);
  if (g.phase === "waitingForAnswers") body = `<section class="panel center phase-card"><p class="eyebrow">RUNDA ${g.round}/${s.rounds} · PRYWATNA ODPOWIEDŹ</p><h1>${escapeHtml(g.question.text)}</h1>${timer(g)}${currentUser in g.answers ? `<div class="waiting-state"><span class="waiting-pulse">✓</span><h3>Odpowiedź zapisana</h3><p>Czekamy jeszcze na ${room.players.length - Object.keys(g.answers).length} graczy. Za chwilę będziecie przypisywać anonimowe odpowiedzi.</p></div>` : '<form id="friend-answer-form" class="answer-form"><input id="friend-answer" autocomplete="off" placeholder="twoja odpowiedź"><button class="primary">Wyślij</button></form>'}<p>${Object.keys(g.answers).length}/${room.players.length} odpowiedzi</p></section>`;
  else if (g.phase === "assigning") { const pending = g.answerOrder.filter(uid => uid !== currentUser && !(uid in (g.guesses[currentUser] || {}))), answerId = pending[0]; body = `<section class="panel center phase-card"><p class="eyebrow">PRZYPISYWANIE · RUNDA ${g.round}/${s.rounds}</p><h2>${escapeHtml(g.question.text)}</h2>${timer(g)}${answerId ? `<article class="anonymous-answer"><span>ANONIMOWA ODPOWIEDŹ</span><strong>${escapeHtml(g.answers[answerId])}</strong></article><p>Czyja to odpowiedź?</p><div class="vote-grid">${room.players.filter(uid => uid !== currentUser).map(uid => `<button data-friend-guess="${uid}" data-answer-id="${answerId}">${mini(accounts[uid])}</button>`).join("")}</div>` : '<div class="waiting-state"><span class="waiting-pulse">✓</span><h3>Wszystko przypisane</h3><p>Inni gracze nadal wybierają. Wyniki pojawią się automatycznie.</p></div>'}</section>`; }
  else if (g.phase === "revealing") { const answerId = g.answerOrder[g.revealIndex], guesses = room.players.filter(uid => uid !== answerId).map(uid => `<span class="${g.guesses[uid]?.[answerId] === answerId ? "correct" : ""}">${escapeHtml(accounts[uid]?.nick)}: ${escapeHtml(accounts[g.guesses[uid]?.[answerId]]?.nick || "brak")}</span>`).join(""); body = `<section class="panel center phase-card"><p class="eyebrow">REVEAL ${g.revealIndex + 1}/${g.answerOrder.length}</p><h2>${escapeHtml(g.question.text)}</h2><article class="anonymous-answer reveal-answer"><span>ODPOWIEDŹ</span><strong>${escapeHtml(g.answers[answerId])}</strong><small>To odpowiedź gracza</small><h1>${escapeHtml(accounts[answerId]?.nick)}</h1></article><div class="vote-details">${guesses}</div><button class="primary" id="friend-reveal-next">Pokaż dalej</button></section>`; }
  else if (g.phase === "roundSummary") { const roundTop = Math.max(0, ...Object.values(g.roundScores || {}).map(Number)); body = `<section class="panel center phase-card"><p class="eyebrow">PODSUMOWANIE RUNDY</p><h1>Kto zna ekipę najlepiej?</h1><div class="result-player-grid">${room.players.map(uid => `<article>${resultPlayerMiniHtml(accounts[uid], Number(g.roundScores?.[uid] || 0) === roundTop && roundTop > 0 ? "win" : "lose")}<strong>+${g.roundScores[uid] || 0} pkt</strong></article>`).join("")}</div><button class="primary" id="friend-round-next">${g.round >= s.rounds ? "Zobacz tabelę" : "Następna runda"}</button></section>`; }
  else { const ranking = Object.entries(g.scores).sort((a, b) => b[1] - a[1]), topScore = Math.max(0, ...ranking.map(([, score]) => Number(score) || 0)); body = `<section class="panel center phase-card"><p class="eyebrow">KONIEC TESTU</p><h1>Tabela znajomości</h1><div class="final-ranking">${ranking.map(([uid, score], index) => `<article><b>#${index + 1}</b>${resultPlayerMiniHtml(accounts[uid], Number(score) === topScore && topScore > 0 ? "win" : "lose")}<strong>${score} trafień</strong></article>`).join("")}</div>${s.rewardCoins ? '<p class="money-pop">Każde trafienie to +25$.</p>' : ""}<button class="primary" id="friend-lobby">Wróć do lobby</button></section>`; }
  root.innerHTML = `<main class="page social-page friendship-board board-shell enter">${boardPlayerStripHtml(room.players,accounts,{scores:g.scores})}<section class="friendship-table">${body}</section><button class="ghost" id="leave-room">Wyjdź z pokoju</button></main>`;
  $("#leave-room").addEventListener("click", actions.leaveRoom); $("#friend-answer-form")?.addEventListener("submit", event => { event.preventDefault(); actions.friendshipAnswer($("#friend-answer").value); });
  root.querySelectorAll("[data-friend-guess]").forEach(button => button.addEventListener("click", () => actions.friendshipGuess(button.dataset.answerId, button.dataset.friendGuess)));
  $("#friend-reveal-next")?.addEventListener("click", actions.friendshipRevealNext); $("#friend-round-next")?.addEventListener("click", actions.friendshipRoundNext); $("#friend-lobby")?.addEventListener("click", actions.returnToRoom);
  if (["waitingForAnswers", "assigning"].includes(g.phase)) startTimer(actions);
}
function startTimer(actions) { timerId = setInterval(() => { const el = $("#friend-timer"); if (!el) return; const left = Math.max(0, Number(el.textContent.replace("s", "")) - 1); el.textContent = `${left}s`; if (left > 0 && left <= 3 && lastCountdown !== left) { lastCountdown = left; Audio.play("countdown"); } if (!left) { stopFriendshipTimer(); actions.friendshipTimeout(); } }, 1000); }
