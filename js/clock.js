import { $, boardPlayerStripHtml, escapeHtml, playerMiniHtml } from "./utils.js?v=20260605-5";
import { Audio } from "./audio.js";
import { Effects } from "./effects.js";

let timerId;

const now = () => Date.now();
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || min));
const objectOrEmpty = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const arrayOrEmpty = value => Array.isArray(value) ? value : [];

export const clockDefaults = {
  rounds:8,
  targetScore:5,
};

export function sanitizeClockSettings(raw = {}) {
  return {
    ...clockDefaults,
    ...raw,
    rounds:clamp(raw.rounds || clockDefaults.rounds, 3, 20),
    targetScore:clamp(raw.targetScore || clockDefaults.targetScore, 3, 20),
  };
}

function targetMs() {
  return (3 + Math.floor(Math.random() * 13)) * 1000;
}

function createRound(players, settings, round, scores = {}) {
  const startedAt = now();
  return {
    phase:"running",
    round,
    targetMs:targetMs(),
    startedAt,
    roundEndsAt:startedAt + 20000,
    stops:{},
    scores:{ ...Object.fromEntries(players.map(uid => [uid, 0])), ...scores },
    ranking:[],
    result:null,
  };
}

export function createClockGame(players, rawSettings) {
  return createRound(players, sanitizeClockSettings(rawSettings), 1);
}

function normalize(game, players = []) {
  game.stops = objectOrEmpty(game.stops);
  game.scores = objectOrEmpty(game.scores);
  game.ranking = arrayOrEmpty(game.ranking).filter(row => players.includes(row.uid));
  players.forEach(uid => { if (!(uid in game.scores)) game.scores[uid] = 0; });
  Object.keys(game.scores).forEach(uid => { if (!players.includes(uid)) delete game.scores[uid]; });
  Object.keys(game.stops).forEach(uid => { if (!players.includes(uid)) delete game.stops[uid]; });
  return game;
}

function buildRanking(game, players) {
  return players.map(uid => {
    const elapsedMs = Number(game.stops?.[uid]?.elapsedMs);
    const safeElapsed = Number.isFinite(elapsedMs) ? elapsedMs : Number(game.roundEndsAt || now()) - Number(game.startedAt || now());
    const differenceMs = Math.abs(safeElapsed - Number(game.targetMs || 0));
    return { uid, elapsedMs:safeElapsed, differenceMs };
  }).sort((a, b) => a.differenceMs - b.differenceMs || a.elapsedMs - b.elapsedMs);
}

function finishRound(game, players, settings) {
  const ranking = buildRanking(game, players);
  const best = ranking[0]?.differenceMs ?? Infinity;
  const winners = ranking.filter(row => row.differenceMs === best).map(row => row.uid);
  winners.forEach(uid => game.scores[uid] = Number(game.scores?.[uid] || 0) + 1);
  game.ranking = ranking.map((row, index) => ({ ...row, place:row.differenceMs === best ? 1 : index + 1, points:winners.includes(row.uid) ? 1 : 0 }));
  game.phase = "roundResult";
  game.result = { winners, at:now() };
  if (Number(game.round) >= Number(settings.rounds) || Math.max(0, ...Object.values(game.scores || {}).map(Number)) >= Number(settings.targetScore)) {
    game.phase = "gameSummary";
    game.result.gameOver = true;
  }
}

export const ClockEngine = {
  stop(game, uid, players, rawSettings, expected = {}) {
    const settings = sanitizeClockSettings(rawSettings);
    normalize(game, players);
    if (game.phase !== "running") return "Ta runda juz sie zakonczyla.";
    if (!players.includes(uid)) return "Nie ma cie w tej rundzie.";
    if (game.stops[uid]) return "Juz zatrzymales zegar.";
    if (expected.startedAt && Number(game.startedAt || 0) !== Number(expected.startedAt)) return "Runda juz sie zmienila.";
    const elapsedMs = Math.max(0, now() - Number(game.startedAt || now()));
    game.stops[uid] = { elapsedMs, at:now() };
    if (players.every(player => game.stops[player])) finishRound(game, players, settings);
    return null;
  },
  timeout(game, players, rawSettings, expected = {}) {
    const settings = sanitizeClockSettings(rawSettings);
    normalize(game, players);
    if (game.phase !== "running") return;
    if (expected.startedAt && Number(game.startedAt || 0) !== Number(expected.startedAt)) return "Runda juz sie zmienila.";
    const elapsedMs = Math.max(0, Number(game.roundEndsAt || now()) - Number(game.startedAt || now()));
    players.forEach(uid => { if (!game.stops[uid]) game.stops[uid] = { elapsedMs, at:now(), auto:true }; });
    finishRound(game, players, settings);
    return null;
  },
  nextRound(game, players, rawSettings) {
    const settings = sanitizeClockSettings(rawSettings);
    normalize(game, players);
    if (game.phase !== "roundResult") return "Najpierw trzeba zobaczyc wyniki rundy.";
    Object.assign(game, createRound(players, settings, Number(game.round || 1) + 1, game.scores));
    return null;
  },
};

export function renderClockLobbySettings(room, isHost) {
  const settings = sanitizeClockSettings(room.settings);
  return `<div class="impostor-settings-grid clock-settings-grid">
    <label>Liczba rund<select data-clock-setting="rounds" ${isHost ? "" : "disabled"}>${[3,5,8,10,12,15,20].map(n => `<option value="${n}" ${settings.rounds === n ? "selected" : ""}>${n}</option>`).join("")}</select></label>
    <label>Punkty do wygranej<select data-clock-setting="targetScore" ${isHost ? "" : "disabled"}>${[3,5,7,10,12,15,20].map(n => `<option value="${n}" ${settings.targetScore === n ? "selected" : ""}>${n}</option>`).join("")}</select></label>
  </div>`;
}

const secondsText = ms => `${(Number(ms || 0) / 1000).toLocaleString("pl-PL", { minimumFractionDigits:2, maximumFractionDigits:2 })}s`;

function runningStage(room, accounts, currentUser, game) {
  const stopped = currentUser in objectOrEmpty(game.stops);
  const done = Object.keys(game.stops || {}).length;
  return `<section class="clock-stage">
    <div class="clock-head"><div><p class="eyebrow">RUNDA ${Number(game.round) || 1}</p><h1>Znajdz ${Math.round(Number(game.targetMs || 0) / 1000)} sekund</h1></div><div class="clock-done">${done}/${room.players.length}</div></div>
    <div class="clock-table">
      <div class="clock-face ${stopped ? "clock-stopped" : ""}">
        <span class="clock-glow"></span><i class="clock-hand hour"></i><i class="clock-hand minute"></i><i class="clock-hand second"></i><b></b>
      </div>
      <div class="clock-side">
        <p class="eyebrow">TWOJ ZEGAR</p>
        ${playerMiniHtml(accounts[currentUser])}
        ${stopped ? `<div class="waiting-state clock-waiting"><span class="waiting-pulse">STOP</span><h3>Zegar zatrzymany</h3><p>Czekamy na reszte stolu.</p></div>` : `<button class="primary clock-stop-button" id="clock-stop">STOP</button>`}
      </div>
    </div>
    <div class="truth-answer-grid">${room.players.map(uid => `<article class="${uid in objectOrEmpty(game.stops) ? "answered" : ""}">${playerMiniHtml(accounts[uid])}<b>${uid in objectOrEmpty(game.stops) ? "STOP" : "mierzy..."}</b></article>`).join("")}</div>
  </section>`;
}

function resultStage(room, accounts, game) {
  const maxMs = Math.max(Number(game.roundEndsAt || 0) - Number(game.startedAt || 0), Number(game.targetMs || 0), ...arrayOrEmpty(game.ranking).map(row => Number(row.elapsedMs) || 0), 1);
  const targetPct = Math.max(0, Math.min(100, Number(game.targetMs || 0) / maxMs * 100));
  return `<section class="clock-stage clock-results">
    <div class="clock-freeze"><p class="eyebrow">CZAS ZATRZYMANY</p><h1>${secondsText(game.targetMs)}</h1><p>Poprawny czas rundy</p></div>
    <div class="clock-axis" style="--target:${targetPct}">
      <span class="clock-axis-target"><b>${secondsText(game.targetMs)}</b></span>
      ${arrayOrEmpty(game.ranking).map((row, index) => {
        const pct = Math.max(0, Math.min(100, Number(row.elapsedMs || 0) / maxMs * 100));
        return `<article class="${index === 0 ? "closest" : ""}" style="--pos:${pct};--delay:${index}">
          <span></span>${playerMiniHtml(accounts[row.uid])}<strong>${secondsText(row.elapsedMs)}</strong><small>roznica ${secondsText(row.differenceMs)} ${row.points ? "+1 pkt" : ""}</small>
        </article>`;
      }).join("")}
    </div>
    <div class="truth-round-ranking final-ranking">${room.players.slice().sort((a,b)=>Number(game.scores?.[b]||0)-Number(game.scores?.[a]||0)).map((uid,index)=>`<article class="${index === 0 ? "winner-card" : ""}"><b>#${index + 1}</b>${playerMiniHtml(accounts[uid])}<strong>${Number(game.scores?.[uid] || 0)} pkt</strong></article>`).join("")}</div>
    <button class="primary" id="clock-next-round">Nastepna runda</button>
  </section>`;
}

function summaryStage(room, accounts, game) {
  const max = Math.max(0, ...Object.values(game.scores || {}).map(Number));
  const winners = room.players.filter(uid => Number(game.scores?.[uid] || 0) === max);
  Effects.play("roundWin", `${room.roomId}:clock:summary`);
  return `<section class="clock-stage clock-summary"><p class="eyebrow">KONIEC GRY</p><h1>${winners.map(uid => escapeHtml(accounts[uid]?.nick || "Gracz")).join(", ")} wygrywa czas</h1><div class="final-ranking">${room.players.slice().sort((a,b)=>Number(game.scores?.[b]||0)-Number(game.scores?.[a]||0)).map((uid,index)=>`<article class="${winners.includes(uid) ? "winner-card" : ""}"><b>#${index + 1}</b>${playerMiniHtml(accounts[uid])}<strong>${Number(game.scores?.[uid] || 0)} pkt</strong></article>`).join("")}</div><button class="primary" id="clock-lobby">Wroc do lobby</button></section>`;
}

export function renderClockGame(root, { room, accounts, currentUser }, actions) {
  stopClockTimer();
  const game = normalize(room.game, room.players);
  const stage = game.phase === "running" ? runningStage(room, accounts, currentUser, game) : game.phase === "roundResult" ? resultStage(room, accounts, game) : summaryStage(room, accounts, game);
  root.innerHTML = `<main class="page clock-page board-shell enter">${boardPlayerStripHtml(room.players, accounts, { scores:game.scores })}${stage}<button class="ghost leave-game" id="leave-room">Wyjdz z pokoju</button></main>`;
  $("#leave-room")?.addEventListener("click", actions.leaveRoom);
  $("#clock-stop")?.addEventListener("click", () => actions.clockStop({ startedAt:game.startedAt }));
  $("#clock-next-round")?.addEventListener("click", actions.clockNextRound);
  $("#clock-lobby")?.addEventListener("click", actions.returnToRoom);
  if (game.phase === "running") startClockTimer(game, actions);
}

function startClockTimer(game, actions) {
  const guard = { startedAt:Number(game.startedAt || 0), roundEndsAt:Number(game.roundEndsAt || 0) };
  const tick = () => {
    if (now() >= guard.roundEndsAt) {
      stopClockTimer();
      actions.clockTimeout?.(guard);
    }
  };
  timerId = setInterval(tick, 300);
}

export function stopClockTimer() {
  clearInterval(timerId);
  timerId = null;
}
