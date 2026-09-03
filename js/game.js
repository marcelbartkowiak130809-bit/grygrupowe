import { categories } from "./categories.js?v=20260824-2";
import { $, escapeHtml, icon, normalizeAnswer, resultPlayerMiniHtml } from "./utils.js?v=20260903-7";
import { playerMini } from "./room.js?v=20260901-10";
import { Audio } from "./audio.js";
import { Effects } from "./effects.js";
import { canonicalAnswerKey } from "../content/udowodnij/expandedPools.js?v=20260604-8";
import { serverNow } from "./firebase.js?v=20260902-2";

let timerId;
let lastCountdown;

export function answerList(value) {
  return Array.isArray(value) ? value : Object.values(value || {});
}

export function nextProvePlayer(players, currentPlayer) {
  const currentIndex = players.indexOf(currentPlayer);
  return players[(currentIndex < 0 ? 0 : currentIndex + 1) % players.length];
}

export function provePhaseEnd(seconds) {
  return serverNow() + Number(seconds || 0) * 1000;
}

export function createNewRound(players, answerTime, round = 1, totalRounds = 5) {
  const category = categories[Math.floor(Math.random() * categories.length)];
  const task = category.tasks[Math.floor(Math.random() * category.tasks.length)];
  const starter = players[Math.floor(Math.random() * players.length)];
  return {
    phase: "initialBid", categoryId: category.id, taskId: task.id, starter,
    currentBid: 1, currentBidder: starter,
    decisionPlayer: nextProvePlayer(players, starter),
    answers: [], validCount: 0, requiredCount: 1, result: null,
    answerTime, round:Math.max(1, Number(round) || 1), totalRounds:Math.max(1, Number(totalRounds) || 5), roundWins:Object.fromEntries(players.map(uid => [uid, 0])), passUses:{}, lastChance:false, phaseEndsAt: provePhaseEnd(answerTime),
  };
}

export function stopGameTimer() {
  clearInterval(timerId);
  timerId = null;
  lastCountdown = null;
}

export function evaluateAnswer(value, validAnswers, previousAnswers = []) {
  const normalized = normalizeAnswer(value);
  if (!normalized) return { error: "Wpisz odpowiedź." };
  const canonical = canonicalAnswerKey(normalized);
  if (answerList(previousAnswers).some(answer => canonicalAnswerKey(answer.normalized) === canonical)) return { error: "Ta odpowiedź już została podana." };
  return {
    answer: {
      raw: String(value).trim(),
      normalized: canonical,
      valid: new Set(validAnswers.map(canonicalAnswerKey)).has(canonical),
    },
  };
}

function gameContent(room, accounts, currentUser) {
  const game = room.game;
  const roundLabel = `<p class="eyebrow">RUNDA ${Number(game.round) || 1}/${Number(game.totalRounds) || Number(room.settings?.rounds) || 5}</p>`;
  if (game.phase === "gameSummary") {
    const ranking = Object.entries(game.roundWins || {}).sort(([,a],[,b]) => Number(b) - Number(a));
    const topScore = Math.max(0, ...ranking.map(([, score]) => Number(score) || 0));
    return `<section class="panel center result-card prove-turn-card"><p class="eyebrow">KONIEC GRY</p><h1>Wyniki końcowe</h1><p class="muted">Rozegrano ${Number(game.totalRounds) || 5} rund.</p><div class="prove-final-ranking">${ranking.map(([uid, score], index) => `<div><b>${index + 1}.</b>${resultPlayerMiniHtml(accounts[uid], Number(score) === topScore && topScore > 0 ? "win" : "lose")}<span>${Number(score) || 0} pkt</span></div>`).join("") || '<p class="muted">Brak wyników.</p>'}</div><button class="primary" id="return-to-room">Wróć do lobby</button></section>`;
  }
  if (game.phase === "initialBid") return `<section class="panel center prove-turn-card">${roundLabel}
    <h2>Startuje: ${accounts[game.starter]?.nick}</h2>
    ${game.starter === currentUser ? `<p>Ile dasz radę wymienić?</p><form class="bid-entry" id="bid-form"><input id="bid-input" class="number-input" type="number" min="1" max="50" value="${game.currentBid || 1}" inputmode="numeric"><button class="primary" type="submit">Deklaruję</button></form>` : '<p class="muted">Czekamy aż gracz poda pierwszą liczbę.</p>'}
  </section>`;
  if (game.phase === "bidding") return `<section class="panel center prove-turn-card">${roundLabel}
    <p class="eyebrow">LICYTACJA</p><h2>Aktualna deklaracja: <span class="bid">${game.currentBid}</span></h2>
    <p>Licytuje: <b>${accounts[game.currentBidder]?.nick}</b></p><p>Decyduje teraz: <b>${accounts[game.decisionPlayer]?.nick}</b></p>
    ${game.decisionPlayer === currentUser ? `<div class="choice-row"><button class="primary" id="plus-one">${icon("plus", 18)} +1</button><button class="danger big" id="challenge">${icon("shield", 18)} Udowodnij!</button></div>` : '<p class="muted">Czekamy na decyzję innego gracza.</p>'}
  </section>`;
  if (game.phase === "answering") return `<section class="panel center prove-turn-card">${roundLabel}
    <p class="eyebrow">UDOWODNIJ</p><h2>${accounts[game.currentBidder]?.nick} musi udowodnić: <span class="bid">${game.validCount}/${game.requiredCount}</span></h2>
    ${game.lastChance ? '<p class="warning">⏳ Ostatnia szansa aktywna — masz jeszcze 8 sekund na odpowiedź.</p>' : ""}<div class="answering-layout">
      <div>${game.currentBidder === currentUser ? '<form class="answer-form" id="answer-form"><input id="answer-input" placeholder="wpisz odpowiedź..." autocomplete="off" autofocus><button class="primary" type="submit">Dodaj</button></form><button class="danger full" id="surrender-round" type="button">Poddaję się</button>' : '<p class="muted">Czekamy na odpowiedzi gracza.</p>'}</div>
      <aside class="answer-list"><p class="eyebrow">WPISANE ODPOWIEDZI</p><div class="answers">${answerList(game.answers).map(answer => `<span class="answer ${answer.valid ? "valid" : "invalid"}">${escapeHtml(answer.raw)}</span>`).join("") || '<span class="muted">Jeszcze brak odpowiedzi.</span>'}</div></aside>
    </div>
  </section>`;
  return `<section class="panel center result-card prove-turn-card">${roundLabel}
    <h1>${game.result?.success ? "Dał radę!" : "Nie dał rady!"}</h1><div class="result-focus-player">${resultPlayerMiniHtml(accounts[game.currentBidder], game.result?.success ? "win" : "lose")}</div><p>${game.result?.text}</p>
    ${game.result?.leftRoom ? '<p class="muted">Gracz został usunięty z kolejnych rund. Ta runda nie przyznaje coinów.</p>' : game.result?.success ? '<p class="money-pop">Udowadniający gracz dostał +100$</p>' : '<p class="money-pop">Pozostali gracze dostali +100$</p>'}
    <div class="answer-list result-answer-list"><p class="eyebrow">ODPOWIEDZI W TEJ RUNDZIE</p><div class="answers">${answerList(game.answers).map(answer => `<span class="answer ${answer.valid ? "valid" : "invalid"}">${escapeHtml(answer.raw)}</span>`).join("") || '<span class="muted">Brak wpisanych odpowiedzi.</span>'}</div></div>
    <button class="primary" id="next-round">${Number(game.round) >= Number(game.totalRounds || room.settings?.rounds || 5) ? "Pokaż wyniki" : "Następna runda"}</button>
  </section>`;
}

export function renderGame(root, { room, accounts, currentUser }, actions) {
  const game = room.game;
  const activeUid = game.phase === "initialBid" ? game.starter : game.phase === "bidding" ? game.decisionPlayer : game.phase === "answering" ? game.currentBidder : "";
  const category = categories.find(item => item.id === game.categoryId) || categories[0];
  const task = category.tasks.find(item => item.id === game.taskId) || category.tasks[0];
  const timeLeft = Math.max(0, Math.ceil((game.phaseEndsAt - serverNow()) / 1000));
  const roundNumber = Number(game.round) || 1, totalRounds = Number(game.totalRounds) || Number(room.settings?.rounds) || 5;
  const summary = game.phase === "gameSummary";
  root.innerHTML = `<main class="page enter board-shell prove-page">
    <section class="panel game-top prove-board-head">
      <div><p class="eyebrow">RUNDA ${roundNumber}/${totalRounds} · KATEGORIA</p><h1>${game.phase === "gameSummary" ? "Podsumowanie" : category.name}</h1><h2>${game.phase === "gameSummary" ? "Zakończona rozgrywka" : task.prompt}</h2></div>
      <div class="timer-box ${!summary && timeLeft <= 5 ? "timer-urgent" : ""}">${icon("timer", 24)}<b id="timer">${summary ? "Koniec" : `${timeLeft}s`}</b></div>
    </section>
    <section class="prove-table"><i></i><i></i><i></i><i></i>${gameContent(room, accounts, currentUser)}</section>
    <section class="player-grid board-game-players">${room.players.map(uid => `<article class="player-card ${uid === activeUid ? "active-board-player" : ""}">${playerMini(accounts[uid])}<p class="muted">$${accounts[uid]?.nickOnly ? accounts[uid]?.sessionMoney || 0 : accounts[uid]?.money || 0}</p></article>`).join("")}</section>
    <button class="ghost leave-game" id="leave-room">Wyjdź z pokoju</button>
  </main>`;
  if(game.phase==="result")Effects.play(game.result?.success?"roundWin":"roundFail",`${room.roomId}:udowodnij:${game.result?.success}:${game.phaseEndsAt}`);
  $("#leave-room").addEventListener("click", actions.leaveRoom);
  $("#bid-form")?.addEventListener("submit", event => { event.preventDefault(); actions.submitInitialBid($("#bid-input").value); });
  $("#plus-one")?.addEventListener("click", actions.plusOne);
  $("#challenge")?.addEventListener("click", actions.challenge);
  $("#next-round")?.addEventListener("click", actions.nextRound);
  $("#return-to-room")?.addEventListener("click", actions.returnToRoom);
  const submitCurrentAnswer = async () => {
    const input = $("#answer-input");
    if (!input) return;
    const accepted = await actions.submitAnswer(input.value, task.answers);
    const freshInput = $("#answer-input");
    if (accepted && freshInput) {
      freshInput.value = "";
      freshInput.focus();
    }
  };
  $("#answer-form")?.addEventListener("submit", event => {
    event.preventDefault();
    submitCurrentAnswer();
  });
  $("#surrender-round")?.addEventListener("click", actions.surrenderRound);
  $("#answer-input")?.addEventListener("keydown", event => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    submitCurrentAnswer();
  });
  $("#answer-input")?.focus();
  startTimer(room, accounts, currentUser, actions);
}

function startTimer(room, accounts, currentUser, actions) {
  stopGameTimer();
  const game = room.game;
  timerId = setInterval(() => {
    const timeLeft = Math.max(0, Math.ceil((game.phaseEndsAt - serverNow()) / 1000));
    const timer = $("#timer");
    if (timer) {
      timer.textContent = `${timeLeft}s`;
      timer.parentElement.classList.toggle("timer-urgent", timeLeft <= 5);
    }
    if (timeLeft > 0 && timeLeft <= 3 && lastCountdown !== timeLeft) {
      lastCountdown = timeLeft;
      Audio.play("countdown");
    }
    if (timeLeft !== 0) return;
    stopGameTimer();
    if (game.phase === "initialBid" && game.starter === currentUser) actions.submitInitialBid(game.currentBid || 1);
    if (game.phase === "answering" && !game.result && game.currentBidder === currentUser) actions.failRound(game.currentBidder, `${accounts[game.currentBidder]?.nick} nie dał rady.`);
    if (game.phase === "bidding" && game.decisionPlayer === currentUser) actions.challenge();
  }, 250);
}
