import { escapeHtml } from "./utils.js?v=20261121-6";

export const connectDefaults = { answerTime:30 };
const wordPattern = /^\p{L}[\p{L}\p{M}]{0,31}$/u;
const digestPattern = /^[a-f0-9]{64}$/;
const pending = new Set();

export function connectWord(value) {
  const word = String(value ?? "").trim().normalize("NFC");
  return wordPattern.test(word) ? word : "";
}

const comparable = word => word.toLocaleLowerCase("pl-PL").normalize("NFD").replace(/\p{M}/gu,"").replace(/ł/g,"l");
const answerTime = value => [15,30,45,60,90].includes(Number(value)) ? Number(value) : connectDefaults.answerTime;

export function createConnectGame(players, settings = {}, now = Date.now()) {
  return {
    version:2, mode:"polacz-nas", players:[...players],
    phase:"thinking", round:1, attempt:1, pair:[], history:[],
    commits:{}, revealed:{}, phaseEndsAt:now+answerTime(settings.answerTime)*1000,
  };
}

function showResult(game, now, retry = false) {
  const words = retry ? [] : game.players.map(uid => game.revealed[uid]);
  const matched = !retry && comparable(words[0]) === comparable(words[1]);
  game.roundResult = { retry, matched, words };
  game.commits = {};
  game.revealed = {};
  if (!retry) game.history = [...(game.history || []), { round:game.round, words }].slice(-12);
  game.phase = matched ? "gameSummary" : "roundResult";
  game.phaseEndsAt = matched ? null : now+5000;
  if (matched) {
    game.winners = [...game.players];
    game.finished = true;
  }
}

export const ConnectEngine = {
  commit(game, uid, digest, now = Date.now()) {
    if (game.phase !== "thinking" || now >= game.phaseEndsAt) return "Czas na słowo minął.";
    if (game.players?.length !== 2 || !game.players.includes(uid)) return "Ta runda jest dla dwóch graczy.";
    if (!digestPattern.test(digest)) return "Nie udało się zapisać słowa.";
    game.commits ||= {};
    if (Object.hasOwn(game.commits,uid)) return "Twoje słowo jest już zapisane.";
    game.commits[uid] = digest;
    if (game.players.every(player => Object.hasOwn(game.commits,player))) {
      game.phase = "revealing";
      game.phaseEndsAt = now+15000;
    }
  },
  reveal(game, uid, word, digest, now = Date.now()) {
    if (game.phase !== "revealing" || now >= game.phaseEndsAt) return "Czas na odsłonięcie słów minął.";
    if (!game.players?.includes(uid) || !connectWord(word) || !digestPattern.test(digest) || game.commits?.[uid] !== digest) return "Nie udało się odsłonić słowa.";
    game.revealed ||= {};
    if (Object.hasOwn(game.revealed,uid)) return "Twoje słowo jest już odsłonięte.";
    game.revealed[uid] = word;
    if (game.players.every(player => Object.hasOwn(game.revealed,player))) showResult(game,now);
  },
  timeout(game, now = Date.now()) {
    if (!["thinking","revealing"].includes(game.phase) || now < game.phaseEndsAt) return "Runda nadal trwa.";
    showResult(game,now,true);
  },
  nextRound(game, settings = {}, now = Date.now()) {
    if (game.phase !== "roundResult") return "Ta runda nadal trwa.";
    if (!game.roundResult.retry) {
      game.pair = game.roundResult.words;
      game.round++;
    }
    game.attempt++;
    game.roundResult = null;
    game.phase = "thinking";
    game.phaseEndsAt = now+answerTime(settings.answerTime)*1000;
  },
  interrupt(game, players) {
    if (["interrupted","gameSummary"].includes(game.phase)) return false;
    if (game.players?.length === 2 && game.players.every(uid => players.includes(uid) && !uid.startsWith("bot:"))) return false;
    game.phase = "interrupted";
    game.phaseEndsAt = null;
    game.commits = {};
    game.revealed = {};
    return true;
  },
};

const secretKey = (room, uid) => `grygrupowe-connect:${room.roomId}:${room.game.siteGameId || room.game.startedAt}:${uid}`;

async function connectDigest(room, uid, { word, salt, attempt }) {
  const bytes = new TextEncoder().encode(JSON.stringify([secretKey(room,uid),attempt,word,salt]));
  const digest = await globalThis.crypto.subtle.digest("SHA-256",bytes);
  return Array.from(new Uint8Array(digest),byte => byte.toString(16).padStart(2,"0")).join("");
}

export async function submitConnectWord(room, uid, text, send) {
  const word = connectWord(text), key = secretKey(room,uid);
  if (!word) return "Wpisz jedno słowo, do 32 liter.";
  if (pending.has(key)) return "";
  pending.add(key);
  try {
    const secret = { word, salt:globalThis.crypto.randomUUID(), attempt:room.game.attempt };
    const digest = await connectDigest(room,uid,secret);
    localStorage.setItem(key,JSON.stringify(secret));
    await send(digest);
    return "";
  } catch {
    return "Nie udało się zapisać słowa. Spróbuj jeszcze raz.";
  } finally { pending.delete(key); }
}

function savedWord(room, uid) {
  try {
    const secret = JSON.parse(localStorage.getItem(secretKey(room,uid)));
    return secret?.attempt === room.game.attempt && connectWord(secret.word) ? secret : null;
  } catch { return null; }
}

export async function revealConnectWord(room, uid, send) {
  const secret = savedWord(room,uid), key = secretKey(room,uid);
  if (!secret || pending.has(key)) return;
  pending.add(key);
  try {
    const digest = await connectDigest(room,uid,secret);
    if (digest === room.game.commits?.[uid]) await send(secret.word,digest);
  } finally { pending.delete(key); }
}

export function renderConnectLobbySettings(room, isHost) {
  const time = answerTime(room.settings?.answerTime);
  return `<label class="setting-row"><span>Czas na słowo</span><select data-connect-setting="answerTime" ${isHost?"":"disabled"}>${[15,30,45,60,90].map(value => `<option value="${value}" ${time===value?"selected":""}>${value}s</option>`).join("")}</select></label>`;
}

function wordsHtml(words, players, accounts, matched = false) {
  return `<div class="connect-word-pair ${matched?"is-match":""}">${words.map((word,index) => `<div class="connect-word"><small>${escapeHtml(accounts[players[index]]?.nick || `Gracz ${index+1}`)}</small><strong>${escapeHtml(word)}</strong></div>`).join('<span aria-hidden="true">+</span>')}</div>`;
}

export function renderConnectGame(root, { room, accounts, currentUser }, actions) {
  stopConnectTimer();
  const game = room.game;
  const expected = { phase:game.phase, attempt:game.attempt };
  const host = room.hostUid === currentUser;
  const pair = game.pair || [], result = game.roundResult;
  const playable = game.version === 2 && game.phase !== "interrupted";
  const privateWord = savedWord(room,currentUser);
  if (privateWord && !["thinking","revealing"].includes(game.phase)) {
    try { localStorage.removeItem(secretKey(room,currentUser)); } catch {}
  }
  let title, body;
  if (!playable) {
    title = game.version === 2 ? "Gracz opuścił rozgrywkę" : "Rozpocznij nową grę";
    body = host ? '<button class="primary" id="connect-lobby">Wróć do pokoju</button>' : '<p class="muted">Czekamy na hosta.</p>';
  } else if (game.phase === "gameSummary") {
    title = "Trafiliście!";
    body = wordsHtml(result.words,game.players,accounts,true) + (host ? '<button class="primary" id="connect-lobby">Zagraj ponownie</button>' : "");
  } else if (game.phase === "roundResult") {
    title = result.retry ? "Czas minął" : "Nowa para";
    body = (result.retry ? '<p class="muted">Spróbujcie ponownie w tej samej rundzie.</p>' : wordsHtml(result.words,game.players,accounts))
      + (host ? `<button class="primary" id="connect-next">${result.retry?"Powtórz rundę":"Następna runda"} →</button>` : "");
  } else {
    const waiting = game.phase === "revealing" || game.commits?.[currentUser];
    title = pair.length ? "Co łączy te słowa?" : "Podaj dowolne słowo";
    body = (pair.length ? wordsHtml(pair,game.players,accounts) : '<p class="muted">Każde z was wybiera jedno słowo w tajemnicy.</p>')
      + (waiting
        ? `<p class="connect-wait" role="status">${game.phase==="revealing"?"Odsłaniamy słowa…":"Zapisano · czekamy na drugiego gracza"}${privateWord?` <b>${escapeHtml(privateWord.word)}</b>`:""}</p>`
        : '<form id="connect-answer-form" class="connect-word-form"><input id="connect-answer" aria-label="Twoje słowo" minlength="1" maxlength="32" required autocomplete="off" placeholder="Twoje słowo…"><button class="primary">Zapisz</button></form>');
  }
  const history = (game.history || []).filter(item => item.round < game.round).slice(-6).reverse();
  root.innerHTML = `<main class="page connect-page enter"><section class="panel connect-panel connect-word-panel">
    <header class="connect-round-head"><p class="eyebrow">POŁĄCZ NAS · RUNDA ${Number(game.round)||1}</p>${playable&&game.phaseEndsAt?'<span class="connect-clock" data-connect-clock></span>':""}</header>
    <h1>${title}</h1>${body}<small class="connect-word-error" role="status" data-connect-error></small>
    ${history.length?`<details class="connect-word-history"><summary>Poprzednie pary</summary><ol>${history.map(item => `<li>${escapeHtml(item.words.join(" + "))}</li>`).join("")}</ol></details>`:""}
  </section><button id="connect-leave" class="ghost">Wyjdź z pokoju</button></main>`;
  root.querySelector("#connect-answer-form")?.addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget, button = form.querySelector("button");
    button.disabled = true;
    const error = await submitConnectWord(room,currentUser,form.querySelector("input").value,digest => actions.connectCommit(digest,expected));
    if (form.isConnected) {
      button.disabled = false;
      root.querySelector("[data-connect-error]").textContent = error;
    }
  });
  root.querySelector("#connect-next")?.addEventListener("click", () => actions.connectNext(expected));
  root.querySelector("#connect-lobby")?.addEventListener("click", () => actions.returnToRoom());
  root.querySelector("#connect-leave")?.addEventListener("click", () => actions.leaveRoom());
  if (!playable || !game.phaseEndsAt) return;
  if (game.phase === "revealing" && !game.revealed?.[currentUser] && privateWord) {
    const view = root.firstElementChild;
    const reveal = async () => {
      if (!view.isConnected || Date.now() >= game.phaseEndsAt) return;
      await revealConnectWord(room,currentUser,(word,digest) => actions.connectReveal(word,digest,expected)).catch(() => {});
      if (view.isConnected) connectRevealTimer = setTimeout(reveal,850);
    };
    connectRevealTimer = setTimeout(reveal,100);
  }
  const clock = root.querySelector("[data-connect-clock]");
  const tick = () => { if (clock) clock.textContent = `${Math.max(0,Math.ceil((game.phaseEndsAt-Date.now())/1000))} s`; };
  tick();
  connectClock = setInterval(tick,250);
  connectTimer = setTimeout(() => {
    stopConnectTimer();
    if (game.phase === "roundResult") { if (host) actions.connectNext(expected); }
    else actions.connectTimeout(expected);
  },Math.max(100,game.phaseEndsAt-Date.now()+70));
}

let connectTimer,connectClock,connectRevealTimer;
export function stopConnectTimer() {
  clearTimeout(connectTimer);
  clearTimeout(connectRevealTimer);
  clearInterval(connectClock);
}
