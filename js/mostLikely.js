import { mostLikelyCategories, mostLikelyPrompts } from "../content/kto-najpredzej/prompts.js";
import { $, boardPlayerStripHtml, escapeHtml, playerMiniHtml } from "./utils.js";
import { Audio } from "./audio.js";
import { Effects } from "./effects.js";

let timerId, lastCountdown;
const now = () => Date.now();
const shuffle = items => [...items].sort(() => Math.random() - .5);
const mini = profile => playerMiniHtml(profile);
export const mostLikelyDefaults = { questionTime:30, voteTime:15, rounds:8, usePool:true, playerQuestions:true, allowSelfVote:false, showVoteDetails:true, category:"Wszystkie" };

function pool(settings) {
  const available = settings.category === "Wszystkie" ? mostLikelyPrompts : mostLikelyPrompts.filter(item => item.category === settings.category);
  return shuffle(available).map(item => item.text);
}
function startVoting(game, settings) {
  if (!game.questions.length) game.questions = pool(settings).slice(0, settings.rounds);
  game.phase = "voting"; game.votes = {}; game.phaseEndsAt = now() + settings.voteTime * 1000;
}
function collectQuestions(game, settings) {
  const submitted = shuffle(Object.values(game.submissions).filter(Boolean));
  const fallback = pool(settings).filter(text => !submitted.includes(text));
  game.questions = [...submitted, ...(settings.usePool ? fallback : [])].slice(0, Math.max(submitted.length, settings.rounds));
  while (game.questions.length < settings.rounds) game.questions.push(...pool(settings).slice(0, settings.rounds - game.questions.length));
  game.questions = shuffle(game.questions).slice(0, Math.max(submitted.length, settings.rounds));
  startVoting(game, settings);
}
function finishVote(game) {
  const counts = {}; Object.values(game.votes).forEach(uid => counts[uid] = (counts[uid] || 0) + 1);
  const max = Math.max(0, ...Object.values(counts)), winners = Object.keys(counts).filter(uid => counts[uid] === max && max);
  winners.forEach(uid => game.totals[uid] = (game.totals[uid] || 0) + 1);
  game.results.push({ question:game.questions[game.round - 1], counts, votes:{ ...game.votes }, winners });
  game.phase = "roundResult"; game.phaseEndsAt = null;
}

export function createMostLikelyGame(players, rawSettings) {
  const settings = { ...mostLikelyDefaults, ...rawSettings };
  const phase = settings.playerQuestions ? "writingQuestions" : "voting";
  const game = { phase, submissions:{}, questions:settings.playerQuestions ? [] : pool(settings).slice(0, settings.rounds), votes:{}, results:[], totals:Object.fromEntries(players.map(uid => [uid, 0])), round:1, phaseEndsAt:null };
  game.phaseEndsAt = now() + (phase === "writingQuestions" ? settings.questionTime : settings.voteTime) * 1000;
  return game;
}
export const MostLikelyEngine = {
  submitQuestion(game, uid, text, players, settings) {
    if (game.phase !== "writingQuestions" || uid in game.submissions) return;
    if (!text.trim()) return "Wpisz pytanie.";
    const question = text.trim().toLowerCase().startsWith("kto najprędzej") ? text.trim() : `Kto najprędzej ${text.trim()}?`;
    game.submissions[uid] = question;
    if (Object.keys(game.submissions).length >= players.length) collectQuestions(game, settings);
  },
  vote(game, uid, target, players, settings) {
    if (game.phase !== "voting" || uid in game.votes) return;
    if (!settings.allowSelfVote && uid === target) return "Nie możesz głosować na siebie.";
    game.votes[uid] = target;
    if (Object.keys(game.votes).length >= players.length) finishVote(game);
  },
  timeout(game, players, settings) {
    if (game.phase === "writingQuestions") collectQuestions(game, settings);
    else if (game.phase === "voting") finishVote(game);
  },
  next(game, settings) {
    if (game.round >= game.questions.length) { game.phase = "gameSummary"; return; }
    game.round++; startVoting(game, settings);
  },
};

export function renderMostLikelyLobbySettings(room, isHost) {
  const s = { ...mostLikelyDefaults, ...room.settings };
  return `<div class="impostor-settings-grid">
    <label>Czas na pytanie <b>${s.questionTime}s</b><input data-most-setting="questionTime" type="range" min="15" max="60" step="5" value="${s.questionTime}" ${isHost ? "" : "disabled"}></label>
    <label>Czas głosowania <b>${s.voteTime}s</b><input data-most-setting="voteTime" type="range" min="10" max="30" step="5" value="${s.voteTime}" ${isHost ? "" : "disabled"}></label>
    <label>Liczba rund<select data-most-setting="rounds" ${isHost ? "" : "disabled"}>${[3,5,8,10,12,16].map(n => `<option ${s.rounds === n ? "selected" : ""}>${n}</option>`).join("")}</select></label>
    <label>Kategoria<select data-most-setting="category" ${isHost ? "" : "disabled"}>${["Wszystkie", ...mostLikelyCategories].map(x => `<option ${s.category === x ? "selected" : ""}>${x}</option>`).join("")}</select></label>
    <label class="check"><input data-most-setting="playerQuestions" type="checkbox" ${s.playerQuestions ? "checked" : ""} ${isHost ? "" : "disabled"}> Pytania od graczy</label>
    <label class="check"><input data-most-setting="usePool" type="checkbox" ${s.usePool ? "checked" : ""} ${isHost ? "" : "disabled"}> Gotowa pula pytań</label>
    <label class="check"><input data-most-setting="allowSelfVote" type="checkbox" ${s.allowSelfVote ? "checked" : ""} ${isHost ? "" : "disabled"}> Można głosować na siebie</label>
    <label class="check"><input data-most-setting="showVoteDetails" type="checkbox" ${s.showVoteDetails ? "checked" : ""} ${isHost ? "" : "disabled"}> Pokaż kto na kogo głosował</label>
  </div>`;
}
export function stopMostLikelyTimer() { clearInterval(timerId); timerId = null; lastCountdown = null; }
const timer = game => `<div class="timer-box"><b id="most-timer">${Math.max(0, Math.ceil((game.phaseEndsAt - now()) / 1000))}s</b></div>`;
export function renderMostLikelyGame(root, { room, accounts, currentUser }, actions) {
  stopMostLikelyTimer(); const g = room.game, s = { ...mostLikelyDefaults, ...room.settings }; let body;
  if(g.phase==="roundResult")Effects.play("voteResult",`${room.roomId}:most:${g.round}`);if(g.phase==="gameSummary")Effects.play("roundWin",`${room.roomId}:most:summary`);
  if (g.phase === "writingQuestions") body = `<section class="panel center phase-card"><p class="eyebrow">PRZYGOTOWANIE</p><h1>Napisz pytanie</h1><p class="muted">W stylu: Kto najprędzej zaśnie na filmie?</p>${timer(g)}${currentUser in g.submissions ? `<div class="waiting-state"><span class="waiting-pulse">✓</span><h3>Pytanie zapisane</h3><p>Czekamy jeszcze na ${room.players.length - Object.keys(g.submissions).length} graczy. Głosowanie wystartuje automatycznie.</p></div>` : '<form id="most-question-form" class="answer-form"><input id="most-question" placeholder="Kto najprędzej..."><button class="primary">Dodaj</button></form>'}<p>${Object.keys(g.submissions).length}/${room.players.length} graczy wysłało pytanie</p></section>`;
  else if (g.phase === "voting") body = `<section class="panel center phase-card"><p class="eyebrow">RUNDA ${g.round}/${g.questions.length}</p><h1>${escapeHtml(g.questions[g.round - 1])}</h1>${timer(g)}${currentUser in g.votes ? `<div class="waiting-state"><span class="waiting-pulse">✓</span><h3>Głos zapisany</h3><p>Czekamy na pozostałych graczy. Wynik rundy pojawi się automatycznie.</p></div>` : `<div class="vote-grid">${room.players.map(uid => `<button data-most-vote="${uid}" ${!s.allowSelfVote && uid === currentUser ? "disabled" : ""}>${mini(accounts[uid])}</button>`).join("")}</div>`}</section>`;
  else if (g.phase === "roundResult") { const result = g.results.at(-1); body = `<section class="panel center phase-card"><p class="eyebrow">WYNIK RUNDY</p><h1>${escapeHtml(result.question)}</h1><div class="result-player-grid">${room.players.map(uid => `<article class="${result.winners.includes(uid) ? "winner-card" : ""}">${mini(accounts[uid])}<strong>${result.counts[uid] || 0} gł.</strong></article>`).join("")}</div>${s.showVoteDetails ? `<div class="vote-details">${Object.entries(result.votes).map(([uid, target]) => `<span>${escapeHtml(accounts[uid]?.nick)} → ${escapeHtml(accounts[target]?.nick)}</span>`).join("")}</div>` : ""}<button class="primary" id="most-next">Następne pytanie</button></section>`; }
  else { const ranking = Object.entries(g.totals).sort((a, b) => b[1] - a[1]); body = `<section class="panel center phase-card"><p class="eyebrow">PODSUMOWANIE</p><h1>Najczęściej wybierani</h1><p class="muted">Ekipa przemówiła. Nie przyjmujemy reklamacji.</p><div class="final-ranking">${ranking.map(([uid, score], index) => `<article><b>#${index + 1}</b>${mini(accounts[uid])}<strong>${score} razy</strong></article>`).join("")}</div><p class="money-pop">Każdy uczestnik otrzymuje +25$, zwycięzcy rund po +10$.</p><button class="primary" id="most-lobby">Wróć do lobby</button></section>`; }
  root.innerHTML = `<main class="page social-page vote-board board-shell enter">${boardPlayerStripHtml(room.players,accounts,{scores:g.totals})}<section class="vote-table">${body}</section><button class="ghost" id="leave-room">Wyjdź z pokoju</button></main>`;
  $("#leave-room").addEventListener("click", actions.leaveRoom); $("#most-question-form")?.addEventListener("submit", event => { event.preventDefault(); actions.mostLikelyQuestion($("#most-question").value); });
  root.querySelectorAll("[data-most-vote]").forEach(button => button.addEventListener("click", () => actions.mostLikelyVote(button.dataset.mostVote)));
  $("#most-next")?.addEventListener("click", actions.mostLikelyNext); $("#most-lobby")?.addEventListener("click", actions.returnToRoom);
  if (["writingQuestions", "voting"].includes(g.phase)) startTimer(actions);
}
function startTimer(actions) { timerId = setInterval(() => { const el = $("#most-timer"); if (!el) return; const left = Math.max(0, Number(el.textContent.replace("s", "")) - 1); el.textContent = `${left}s`; if (left > 0 && left <= 3 && lastCountdown !== left) { lastCountdown = left; Audio.play("countdown"); } if (!left) { stopMostLikelyTimer(); actions.mostLikelyTimeout(); } }, 1000); }
