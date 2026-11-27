import { categories } from "./categories.js?v=20261127-10";
import { escapeHtml, icon, normalizeAnswer, playerMiniHtml, resultPlayerMiniHtml } from "./utils.js?v=20261121-8";
import { Audio } from "./audio.js?v=20261123-7";
import { canonicalAnswerKey } from "../content/udowodnij/expandedPools.js?v=20260604-8";
import { serverNow } from "./firebase.js?v=20261124-2";

let timerId;
let lastCountdown;
const presentation = new Map();
export const proveSummaryMs = 5000;

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

export function createNewRound(players, answerTime, round = 1, totalRounds = 5, recentTaskIds = []) {
  const seen = new Set(answerList(recentTaskIds));
  const available = categories.filter(category => category.tasks.some(task => !seen.has(task.id)));
  const pool = available.length ? available : categories;
  const category = pool[Math.floor(Math.random() * pool.length)];
  const tasks = available.length ? category.tasks.filter(task => !seen.has(task.id)) : category.tasks;
  const task = tasks[Math.floor(Math.random() * tasks.length)];
  const starter = players[Math.floor(Math.random() * players.length)];
  return {
    phase: "initialBid", categoryId: category.id, taskId: task.id,
    usedTaskIds: [...seen,task.id], starter,
    currentBid: 1, currentBidder: starter,
    decisionPlayer: nextProvePlayer(players, starter),
    answers: [], validCount: 0, requiredCount: 1, result: null,
    answerTime, round:Math.max(1, Number(round) || 1), totalRounds:Math.max(1, Number(totalRounds) || 5), roundWins:Object.fromEntries(players.map(uid => [uid, 0])), passUses:{}, lastChance:false, phaseEndsAt: provePhaseEnd(answerTime),
  };
}

export function stopGameTimer() {
  clearInterval(timerId);
  timerId = null;

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

const playerName = (accounts, uid) => escapeHtml(accounts[uid]?.nick || "Gracz");
const stageLabels = { initialBid:"Deklaracja", bidding:"Licytacja", answering:"Odpowiedzi", result:"Wynik rundy" };

function scoreRows(game, players, accounts, activeUid) {
  return players.map(uid=>`<article class="prove-player ${uid===activeUid?"is-active":""}">
    ${playerMiniHtml(accounts[uid]||{nick:"Gracz"})}<b>${Number(game.roundWins?.[uid])||0} pkt</b>
  </article>`).join("");
}

function answerFeed(game) {
  const answers = answerList(game.answers);
  return `<section class="prove-feed"><h3>Odpowiedzi <span>${answers.length}</span></h3>
    <ul>${answers.map((answer,index)=>`<li class="${answer.valid?"is-valid":"is-invalid"}" data-prove-answer="${index}">
      <span aria-label="${answer.valid?"Poprawna":"Błędna"}">${answer.valid?"✓":"×"}</span>${escapeHtml(answer.raw)}
    </li>`).join("") || '<li class="muted">Jeszcze brak odpowiedzi</li>'}</ul>
  </section>`;
}

function roundContent(game, accounts, currentUser, hostUid, totalRounds) {
  if (game.phase === "initialBid") return `<div class="prove-focus">
    <h2>${game.starter===currentUser?"Ile odpowiedzi podasz?":playerName(accounts,game.starter)+" zaczyna"}</h2>
    ${game.starter===currentUser
      ? `<form class="prove-form" id="bid-form"><input id="bid-input" type="number" aria-label="Liczba odpowiedzi" min="1" max="50" required value="${Number(game.currentBid)||1}" inputmode="numeric"><button class="primary">Deklaruję</button></form>`
      : '<p class="muted">Czekamy na pierwszą deklarację.</p>'}
  </div>`;
  if (game.phase === "bidding") return `<div class="prove-focus">
    <div class="prove-bid" data-prove-bid><strong>${Number(game.currentBid)||1}</strong><span>Deklaracja gracza ${playerName(accounts,game.currentBidder)}</span></div>
    <h2>${game.decisionPlayer===currentUser?"Przebijasz czy sprawdzasz?":"Decyduje: "+playerName(accounts,game.decisionPlayer)}</h2>
    ${game.decisionPlayer===currentUser ? `<div class="prove-actions"><button class="primary" id="plus-one">${icon("plus",18)} Podbij do ${Number(game.currentBid)+1}</button><button class="danger" id="challenge">${icon("shield",18)} Udowodnij!</button></div>`:""}
  </div>`;
  if (game.phase === "answering") {
    const count = Number(game.validCount)||0, target = Math.max(1,Number(game.requiredCount)||1);
    return `<div class="prove-play-grid">
      <div class="prove-focus">
        <h2>${game.currentBidder===currentUser?"Twoja kolej":"Odpowiada: "+playerName(accounts,game.currentBidder)}</h2>
        <div class="prove-answer-count"><strong>${count}</strong><span>/ ${target}</span></div>
        <div class="prove-progress" role="progressbar" aria-label="Poprawne odpowiedzi" aria-valuemin="0" aria-valuemax="${target}" aria-valuenow="${count}"><div style="transform:scaleX(${Math.min(1,count/target)})"></div></div>
        ${game.lastChance ? '<p class="prove-last-chance">Ostatnia szansa · dodatkowe 8 sekund</p>' : ""}
        ${game.currentBidder===currentUser ? '<form class="prove-form" id="answer-form"><input id="answer-input" aria-label="Odpowiedź" placeholder="Wpisz odpowiedź…" autocomplete="off" enterkeyhint="send" required><button class="primary">Dodaj</button></form><button class="ghost prove-surrender" id="surrender-round" type="button">Poddaję się</button>' : ""}
      </div>${answerFeed(game)}</div>`;
  }
  const winner = game.result?.success, left = game.result?.leftRoom;
  const title = left ? "Runda przerwana" : winner ? "Dał radę!" : "Nie dał rady!";
  const final = Number(game.round)>=totalRounds;
  const rewards = left ? "" : `<small>${winner?"Odpowiadający":"Pozostali gracze"} · +100$</small>`;
  return `<div class="prove-play-grid">
    <div class="prove-focus prove-round-result ${winner?"is-win":left?"":"is-loss"}" data-prove-result>
      <h2>${title}</h2><p>${escapeHtml(game.result?.text||"")}</p>${rewards}
      <div class="prove-round-clock" data-prove-round-clock>
        <span>${final?"Wyniki końcowe":"Następna runda"} za <b data-round-advance-countdown>5 s</b></span>
        <div class="prove-progress" aria-hidden="true"><div data-prove-advance-fill></div></div>
      </div>
      <button class="ghost" id="next-round" ${hostUid!==currentUser?"hidden":""}>${final?"Pokaż wyniki":"Przejdź dalej"}</button>
    </div>${answerFeed(game)}</div>`;
}

function finalContent(game, accounts, currentUser) {
  const rank = Object.entries(game.roundWins||{}).sort(([,a],[,b])=>Number(b)-Number(a));
  const top = Number(rank[0]?.[1])||0;
  return `<section class="prove-surface prove-final" data-prove-result>
    <h1>Wyniki końcowe</h1><div class="prove-final-ranking">${rank.map(([uid,score],index)=>`<div class="${uid===currentUser?"is-self":""}">
    <b>${index+1}.</b>${resultPlayerMiniHtml(accounts[uid],top>0&&Number(score)===top?"win":"lose")}<span>${Number(score)||0} pkt</span></div>`).join("")}</div>
    <button class="primary" id="return-to-room">Wróć do lobby</button>
  </section>`;
}

function presentUpdate(root,room) {
  const game = room.game;
  const match = JSON.stringify([room.roomId,game.siteGameId||game.startedAt||"",game.round]);
  const answers = answerList(game.answers);
  const key = JSON.stringify([match,game.phase,game.currentBid,answers.length,game.lastChance]);
  const previous = presentation.get(room.roomId);
  if (previous?.key === key) return;
  if (!previous && presentation.size >= 24) presentation.delete(presentation.keys().next().value);
  presentation.set(room.roomId,{key,match,phase:game.phase});
  const stageChanged = previous?.match!==match || previous?.phase!==game.phase;
  const animate = (node,frames)=>{
    if (node?.animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) node.animate(frames,{duration:300,easing:"ease-out"});
  };
  if (stageChanged) {
    animate(root.querySelector(".prove-surface:last-of-type"),[{opacity:.65,translate:"0 5px"},{opacity:1,translate:"0 0"}]);
    if (game.phase==="result") Audio.play(game.result?.success?"success":"roundEnd");
  } else if (game.phase==="bidding") {
    animate(root.querySelector("[data-prove-bid] strong"),[{scale:1.14},{scale:1}]);
  } else if (game.phase==="answering" && answers.length) {
    animate(root.querySelector(`[data-prove-answer="${answers.length-1}"]`),[{opacity:.4,translate:"-9px 0"},{opacity:1,translate:"0 0"}]);
    Audio.play(answers.at(-1).valid?"success":"error");
  }
}

export function renderGame(root, {room, accounts, currentUser}, actions) {
  const game = room.game;
  const activeUid = game.phase==="initialBid" ? game.starter : game.phase==="bidding" ? game.decisionPlayer : game.phase==="answering" ? game.currentBidder : "";
  const category = categories.find(item=>item.id===game.categoryId)||categories[0];
  const task = category.tasks.find(item=>item.id===game.taskId)||category.tasks[0];
  const total = Number(game.totalRounds)||Number(room.settings?.rounds)||5;
  const final = game.phase==="gameSummary";
  root.innerHTML = `<main class="page prove-page prove-redesign">
    ${final ? finalContent(game,accounts,currentUser) : `
      <header class="prove-surface prove-header"><div class="prove-heading">
        <p class="eyebrow">Udowodnij! · Runda ${Number(game.round)||1}/${total}</p><p class="prove-category">${escapeHtml(category.name)}</p>
        <h1>${escapeHtml(task.prompt)}</h1>
      </div>${activeUid ? '<div class="prove-clock"><b id="timer"></b><div class="prove-progress" aria-hidden="true"><div data-prove-timer-fill></div></div></div>' : ""}</header>
      <section class="prove-surface prove-stage"><p class="eyebrow">${stageLabels[game.phase]||"Udowodnij!"}</p>
        ${roundContent(game,accounts,currentUser,room.hostUid,total)}
      </section>`}
    ${final ? "" : `<div class="prove-player-grid">${scoreRows(game,room.players,accounts,activeUid)}</div>`}
    <button class="ghost prove-leave" id="leave-room">Wyjdź z pokoju</button>
  </main>`;
  const on = (id,event,handler)=>root.querySelector(id)?.addEventListener(event,handler);
  on("#leave-room","click",actions.leaveRoom);
  on("#bid-form","submit",event=>{event.preventDefault();actions.submitInitialBid(root.querySelector("#bid-input").value);});
  on("#plus-one","click",actions.plusOne);
  on("#challenge","click",actions.challenge);
  on("#next-round","click",actions.nextRound);
  on("#return-to-room","click",actions.returnToRoom);
  on("#surrender-round","click",actions.surrenderRound);
  on("#answer-form","submit",async event=>{
    event.preventDefault();
    const input = root.querySelector("#answer-input");
    const value = input.value;
    if (input.dataset.sending) return;
    input.dataset.sending = "true";
    // Clearing before the transaction prevents the old answer entering the next draft.
    input.value = "";
    try {
      if (!await actions.submitAnswer(value,task.answers) && input.isConnected && !input.value) input.value = value;
    } finally {
      delete input.dataset.sending;
    }
  });
  presentUpdate(root,room);
  startTimer(root,room,accounts,currentUser,actions);
}

function startTimer(root,room,accounts,currentUser,actions) {
  stopGameTimer();
  const timer = root.querySelector("#timer");
  if (!timer) return;
  const game = room.game;
  const fill = root.querySelector("[data-prove-timer-fill]");
  const duration = 1000*(game.lastChance ? 8 : game.phase==="bidding"
    ? Math.round((Number(room.settings?.answerTime)||20)/2) : Number(game.answerTime)||20);
  const phase = JSON.stringify([room.roomId,game.round,game.phase,game.phaseEndsAt]);
  timerId = setInterval(tick,125);
  tick();
  function tick() {
    if (!timer.isConnected) return stopGameTimer();
    const remaining = Math.max(0,game.phaseEndsAt-serverNow());
    const timeLeft = Math.ceil(remaining/1000);
    const label = `${timeLeft} s`;
    if (timer.textContent!==label) timer.textContent = label;
    timer.parentElement.classList.toggle("is-urgent",timeLeft<=5);
    fill.style.transform = `scaleX(${Math.min(1,remaining/duration)})`;
    if (timeLeft===3 && lastCountdown!==phase) {
      lastCountdown = phase;
      Audio.play("countdown");
    }
    if (remaining) return;
    stopGameTimer();
    if (game.phase==="initialBid" && game.starter===currentUser) actions.submitInitialBid(game.currentBid||1);
    if (game.phase==="answering" && !game.result && game.currentBidder===currentUser) actions.failRound(game.currentBidder,`${accounts[game.currentBidder]?.nick||"Gracz"} nie dał rady zdobyć wymaganych odpowiedzi.`);
    if (game.phase==="bidding" && game.decisionPlayer===currentUser) actions.challenge();
  }
}
