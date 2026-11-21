import { escapeHtml } from "./utils.js?v=20261121-7";
import { guessPeople } from "./guessPeopleCatalog.js?v=20261117-11";
import { isBotId } from "./bots.js?v=20261118-15";
import { UNKNOWN_BOT_ANSWER } from "./guessPeopleBot.js?v=20261121-7";
import { guessPeopleBios } from "./guessPeopleBios.js?v=20261117-14";

export const GUESS_PEOPLE_MODE = "board-zgadnij-kto";
export const guessPeopleDefaults = { boardSize:24, targetOrder:"clockwise", turnTime:60 };
const cards = new Map(guessPeople.map(card => [card[0], card]));
const prompts = [
  "Czy widać dłonie?", "Czy ta osoba się uśmiecha?", "Czy nosi okulary?",
  "Czy ma długie włosy?", "Czy ma nakrycie głowy?", "Czy widać zarost?",
];

function shuffle(values) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function sanitizeGuessPeopleSettings(settings = {}) {
  return {
    boardSize: Number(settings.boardSize) === 40 ? 40 : 24,
    targetOrder: settings.targetOrder === "random" ? "random" : "clockwise",
    turnTime: Math.max(15, Math.min(180, Number(settings.turnTime) || 60)),
  };
}

const targetsFrom = order => Object.fromEntries(order.map((uid, i) => [uid, order[(i + 1) % order.length]]));
const deadline = settings => Date.now() + settings.turnTime * 1000;

export function createGuessPeopleGame(players, settings) {
  const order = [...new Set(players)].slice(0, 4);
  const deck = shuffle([...cards.keys()]).slice(0, settings.boardSize);
  const cycle = settings.targetOrder === "random" ? shuffle(order) : order;
  return {
    boardMode:GUESS_PEOPLE_MODE, matchId:globalThis.crypto.randomUUID(),
    phase:"playing", finished:false, players:order, deck,
    cycle, targets:targetsFrom(cycle),
    secrets:Object.fromEntries(order.map((uid, i) => [uid, deck[i]])),
    turnIndex:0, currentUid:order[0], turnNumber:1, phaseEndsAt:deadline(settings),
    scores:Object.fromEntries(order.map(uid => [uid, 0])),
    history:[], wrongGuesses:{},
  };
}

function finish(game, winner, reason) {
  game.phase = "result";
  game.finished = true;
  game.finishedAt = Date.now();
  game.phaseEndsAt = 0;
  game.winner = winner || "";
  game.winners = winner ? [winner] : [];
  if (winner) game.scores[winner] = 1;
  game.finishReason = reason;
  delete game.question;
}

function openTurn(game, index, settings) {
  game.turnIndex = index % game.players.length;
  game.currentUid = game.players[game.turnIndex];
  game.turnNumber += 1;
  game.phaseEndsAt = deadline(settings);
  delete game.question;
}

export function reconcileGuessPeople(game, players, settings) {
  if (game.finished || !Array.isArray(game.players)) return false;
  const remaining = game.players.filter(uid => players.includes(uid));
  if (remaining.length === game.players.length) return false;
  const next = game.players.slice(game.turnIndex).concat(game.players.slice(0, game.turnIndex))
    .find(uid => remaining.includes(uid));
  game.players = remaining;
  if (remaining.length < 2) finish(game, remaining[0], "departure");
  else {
    game.cycle = game.cycle.filter(uid => remaining.includes(uid));
    game.targets = targetsFrom(game.cycle);
    openTurn(game, remaining.indexOf(next), settings);
  }
  return true;
}

export function guessPeopleAction(game, uid, action, value, settings) {
  if (game.finished || !game.players.includes(uid)) return "Ten mecz jest już zakończony.";
  const target = game.targets[game.currentUid];
  const expired = Date.now() >= game.phaseEndsAt;
  const advance = () => openTurn(game, game.turnIndex + 1, settings);
  if (action === "timeout") {
    if (!expired) return "Ta tura jeszcze trwa.";
    game.lastEvent = {kind:"timeout", turn:game.turnNumber, player:game.question ? target : game.currentUid};
    advance();
    return;
  }
  if (expired) return "Czas na ten ruch minął.";
  if (action === "guess-people-answer") {
    const valid = ["Tak", "Nie", "Nie widać"].includes(value) || (isBotId(uid) && value === UNKNOWN_BOT_ANSWER);
    if (!game.question || uid !== target || !valid) return "Tylko pytany gracz może teraz odpowiedzieć.";
    game.history = [...(game.history || []).slice(-79), {
      from:game.currentUid, to:target, question:game.question, answer:value,
    }];
    game.lastEvent = {kind:"answer", turn:game.turnNumber};
    advance();
    return;
  }
  if (uid !== game.currentUid || game.question) return "Poczekaj na swoją kolej.";
  if (action === "guess-people-ask") {
    const question = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
    if (question.length < 3 || question.length > 160) return "Wpisz pytanie od 3 do 160 znaków.";
    game.question = question;
    game.phaseEndsAt = deadline(settings);
    return;
  }
  if (action === "guess-people-try" && game.deck.includes(value)) {
    if (game.secrets[target] === value) {
      finish(game, uid, "guess");
      return;
    }
    game.wrongGuesses ||= {};
    const key = `${uid}:${target}`;
    const wrong = game.wrongGuesses[key] || [];
    if (wrong.includes(value)) return "Ta osoba była już sprawdzana.";
    game.wrongGuesses[key] = [...wrong, value];
    game.lastEvent = {kind:"miss", turn:game.turnNumber, player:uid};
    advance();
    return;
  }
  return "Wybierz kartę z planszy lub zadaj pytanie.";
}

const photo = card => new URL(`../assets/guess-people/${card[0]}.webp`, import.meta.url).href;
const nameOf = (accounts, uid) => escapeHtml(accounts[uid]?.nick || "Gracz");
const cardPhoto = card => `<img src="${photo(card)}" alt="${escapeHtml(card[1])}" draggable="false">`;
const localBoards = new Map();

function localBoard(game, uid, target) {
  const key = JSON.stringify([game.matchId, uid, target]);
  if (!localBoards.has(key)) {
    if (localBoards.size >= 48) localBoards.delete(localBoards.keys().next().value);
    localBoards.set(key, { flipped:new Set(), seenMisses:new Set(), turnKey:"", eventKey:"" });
  }
  return localBoards.get(key);
}

function renderCredits(card) {
  const license = card[6] ? `<a href="${escapeHtml(card[6])}" target="_blank" rel="noopener">${escapeHtml(card[5])}</a>` : escapeHtml(card[5]);
  return `<a href="${escapeHtml(card[3])}" target="_blank" rel="noopener">Zdjęcie w Wikimedia Commons</a> · ${escapeHtml(card[4])} · ${license} · zmieniono rozmiar`;
}

const infoButton = card => `<button type="button" class="gp-info" data-gp-info="${card[0]}" aria-label="O osobie: ${escapeHtml(card[1])}" title="O osobie">i</button>`;
const photoDialog = '<dialog class="gp-dialog" data-gp-dialog aria-labelledby="gp-dialog-title"></dialog>';

function bindCardDialog(root, onGuess) {
  const dialog = root.querySelector("[data-gp-dialog]");
  function showCard(card, mode = "photo") {
    const info = mode === "info";
    dialog.classList.toggle("gp-dialog-info", info);
    const heading = `<h2 id="gp-dialog-title">${escapeHtml(card[1])}</h2>`;
    const content = info
      ? `<div class="gp-bio">${cardPhoto(card)}<div>${heading}<p>${escapeHtml(guessPeopleBios[card[1]])}</p></div></div>`
      : cardPhoto(card) + heading;
    dialog.innerHTML = `<form method="dialog"><button class="ghost" aria-label="Zamknij">✕</button></form>
      ${content}<p class="gp-photo-credit">${renderCredits(card)}</p>
      ${mode === "guess" ? '<button class="primary" data-gp-confirm>Potwierdź typ</button>' : ""}`;
    dialog.querySelector("[data-gp-confirm]")?.addEventListener("click", () => {
      dialog.close();
      onGuess(card[0]);
    }, { once:true });
    dialog.showModal();
  }
  root.querySelectorAll("[data-gp-info]").forEach(button => {
    button.onclick = () => showCard(cards.get(button.dataset.gpInfo), "info");
  });
  root.querySelectorAll("[data-gp-photo]").forEach(button => {
    button.onclick = () => showCard(cards.get(button.dataset.gpPhoto));
  });
  return showCard;
}

function tableSeats(game, accounts, currentUser) {
  const receiver = game.targets[game.currentUid];
  return `<ol class="gp-seats" style="--seats:${game.players.length}" aria-label="Gracze i ich cele">
    ${game.players.map((uid, seat) => {
      const active = game.currentUid === uid;
      const answering = Boolean(game.question) && receiver === uid;
      const status = answering ? "Odpowiada" : active ? (game.question ? "Czeka na odpowiedź" : "Zadaje pytanie") : "";
      return `<li class="gp-seat ${active ? "is-active" : ""} ${answering ? "is-answering" : ""}" data-seat="${seat}">
        <span class="gp-seat-icon" aria-hidden="true">${seat + 1}</span>
        <span class="gp-seat-copy"><strong>${nameOf(accounts, uid)}${uid === currentUser ? ' <small>Ty</small>' : ""}</strong>
          <span class="gp-seat-target" title="Cel gracza">→ ${nameOf(accounts, game.targets[uid])}</span></span>
        ${status ? `<span class="gp-seat-status">${status}</span>` : ""}
      </li>`;
    }).join("")}</ol>`;
}

function tableEvent(game, accounts) {
  const event = game.lastEvent;
  if (!event || event.turn !== game.turnNumber - 1) return "";
  if (event.kind === "miss") return `<strong>${nameOf(accounts, event.player)}</strong> nie trafił(a).`;
  if (event.kind === "timeout") return `Minął czas gracza <strong>${nameOf(accounts, event.player)}</strong>.`;
  const row = game.history?.at(-1);
  return row ? `<div class="gp-event-pair">${nameOf(accounts, row.from)} → ${nameOf(accounts, row.to)}</div><span>${escapeHtml(row.question)}</span> <strong class="gp-answer-chip" data-answer="${escapeHtml(row.answer)}">${escapeHtml(row.answer)}</strong>` : "";
}

function renderResult(root, game, room, accounts, currentUser, actions) {
  const guessedUid = game.finishReason === "guess" ? game.targets[game.winner] : "";
  const result = localBoard(game, currentUser, "result");
  const animate = !result.shown;
  result.shown = true;
  root.innerHTML = `<main class="page gp-page"><section class="gp-panel gp-result">
    <p class="eyebrow">ZGADNIJ KTO? · KONIEC MECZU</p>
    ${guessedUid ? `<div class="gp-trophy ${animate ? "gp-arrive" : ""}" aria-hidden="true">✦</div>` : ""}
    <h1>${game.winner ? `Wygrywa ${nameOf(accounts, game.winner)}!` : "Koniec gry"}</h1>
    ${game.finishReason === "departure" ? "<p>Przeciwnik opuścił rozgrywkę.</p>" : ""}
    <div class="gp-reveal ${animate ? "gp-deal" : ""}">${game.players.map((uid, i) => {
      const card = cards.get(game.secrets[uid]);
      return card ? `<article class="${uid === guessedUid ? "gp-solved-card" : ""}" style="--i:${i}">${cardPhoto(card)}${infoButton(card)}<strong>${escapeHtml(card[1])}</strong><span>Karta gracza ${nameOf(accounts, uid)}</span>${uid === guessedUid ? "<b>Odgadnięta karta</b>" : ""}<details><summary>Źródło zdjęcia</summary>${renderCredits(card)}</details></article>` : "";
    }).join("")}</div>
    <div class="gp-actions">${room.hostUid === currentUser ? '<button class="primary" data-gp-restart>Zagraj ponownie</button>' : ""}<button class="ghost" data-gp-lobby>Wróć do lobby</button><button class="ghost" data-gp-leave>Wyjdź z pokoju</button></div>
    </section>${photoDialog}</main>`;
  bindCardDialog(root);
  root.querySelector("[data-gp-restart]")?.addEventListener("click", actions.boardRestart);
  root.querySelector("[data-gp-lobby]").onclick = () => actions.returnToRoom();
  root.querySelector("[data-gp-leave]").onclick = () => actions.leaveRoom();
}

export function renderGuessPeopleGame(root, {room, accounts, currentUser}, actions) {
  const game = room.game;
  if (game.finished) return renderResult(root, game, room, accounts, currentUser, actions);
  const target = game.targets[currentUser];
  const responding = game.question && game.targets[game.currentUid] === currentUser;
  const canPlay = game.currentUid === currentUser && !game.question;
  const ownCard = cards.get(game.secrets[currentUser]);
  const board = localBoard(game, currentUser, target);
  const firstDeal = !board.turnKey;
  const turnKey = `${game.turnNumber}:${game.question ? "answer" : "ask"}`;
  const turnChanged = board.turnKey !== turnKey;
  if (turnChanged) board.guess = false;
  board.turnKey = turnKey;
  const event = tableEvent(game, accounts);
  const eventKey = event ? game.lastEvent.turn : "";
  const newEvent = eventKey !== board.eventKey;
  board.eventKey = eventKey;
  const wrong = new Set(game.wrongGuesses?.[`${currentUser}:${target}`] || []);
  for (const id of wrong) {
    if (board.seenMisses.has(id)) continue;
    board.seenMisses.add(id);
    board.flipped.add(id);
  }
  const history = (game.history || []).filter(row => row.from === currentUser && row.to === target).reverse();
  const expected = {phase:game.phase,phaseEndsAt:game.phaseEndsAt};
  let sending = false;
  const send = async (action, value) => {
    if (sending) return;
    sending = true;
    try { await actions.boardAction(action, value, expected); }
    finally { sending = false; }
  };
  root.innerHTML = `<main class="page gp-page">
    <header class="gp-heading"><div><p class="eyebrow">PLANSZÓWKI</p><h1>Zgadnij kto?</h1></div><button class="ghost" data-gp-leave>Wyjdź</button></header>
    ${tableSeats(game, accounts, currentUser)}
    <div class="gp-layout"><section class="gp-panel gp-table ${board.guess ? "gp-guessing" : ""}">
      <div class="gp-toolbar"><div><h2>Zgadujesz kartę gracza ${nameOf(accounts, target)}</h2>
        <div class="gp-count" data-gp-count></div><div class="gp-candidates" aria-hidden="true"><i></i></div></div>
        <label class="gp-toggle"><input type="checkbox" data-gp-guess ${board.guess ? "checked" : ""} ${canPlay ? "" : "disabled"}> Wskaż odpowiedź</label></div>
      <p class="gp-help" data-gp-help>${board.guess ? "Wybierz osobę i potwierdź typ. Pomyłka kończy turę." : "Kliknij kartę, by ją odwrócić lub przywrócić."}</p>
      <div class="gp-grid ${game.deck.length === 40 ? "gp-grid-large" : ""} ${firstDeal ? "gp-deal" : ""}">
        ${game.deck.map((id, i) => {
          const card = cards.get(id);
          const face = `${cardPhoto(card)}<strong>${escapeHtml(card[1])}</strong><small>${escapeHtml(card[2])}</small>`;
          return `<article class="gp-card" style="--i:${i}">
            <button type="button" class="gp-face ${board.flipped.has(id) ? "gp-flipped" : ""}" data-gp-card="${id}" aria-label="${escapeHtml(card[1])}" aria-pressed="${board.flipped.has(id)}">
              <span class="gp-card-front" aria-hidden="true">${face}</span>
              <span class="gp-card-back" aria-hidden="true">${face}</span>
            </button>
            ${infoButton(card)}
            <button type="button" class="gp-zoom" data-gp-photo="${id}" aria-label="Powiększ zdjęcie: ${escapeHtml(card[1])}">⤢</button>
          </article>`;
        }).join("")}
      </div>
    </section><aside class="gp-side">
      <section class="gp-panel gp-turn ${canPlay || responding ? "gp-turn-mine" : ""} ${turnChanged ? "gp-arrive" : ""}"><div class="gp-turn-top"><h2>${responding ? "Odpowiedz na pytanie" : canPlay ? "Twój ruch" : game.question ? `Czekamy na odpowiedź` : `Ruch gracza ${nameOf(accounts, game.currentUid)}`}</h2><strong data-board-timer></strong></div>
      <div class="gp-timer-meter" aria-hidden="true"><i></i></div>
      ${game.question ? `<p class="gp-question-pair">${nameOf(accounts, game.currentUid)} → ${nameOf(accounts, game.targets[game.currentUid])}</p><blockquote>${escapeHtml(game.question)}</blockquote>` : ""}
      ${responding ? '<div class="gp-actions">' + ["Tak","Nie","Nie widać"].map(answer => `<button class="ghost" data-gp-answer="${answer}">${answer}</button>`).join("") + '</div>' : ""}
      ${canPlay ? `<form data-gp-form><label for="gp-question">Pytanie o zdjęcie</label><textarea id="gp-question" minlength="3" maxlength="160" required placeholder="Czy ma okulary?"></textarea>
        <div class="gp-prompts">${prompts.map((prompt, i) => `<button type="button" class="ghost" data-gp-prompt="${i}">${prompt}</button>`).join("")}</div>
        <button class="primary" type="submit">Zadaj pytanie</button></form>` : ""}
      ${event && !game.question ? `<div class="gp-event ${newEvent ? "gp-arrive" : ""}" role="status">${event}</div>` : ""}
      </section>
      ${ownCard ? `<section class="gp-panel gp-secret"><h2>Twoja tajna karta</h2><div class="gp-secret-card"><button class="ghost" data-gp-photo="${ownCard[0]}">${cardPhoto(ownCard)}<span>${escapeHtml(ownCard[1])}</span></button>${infoButton(ownCard)}</div></section>` : ""}
      <details class="gp-panel gp-history" ${history.length ? "open" : ""}><summary>Twoje pytania (${history.length})</summary>
        ${history.map(row => `<p>${escapeHtml(row.question)} <strong>${escapeHtml(row.answer)}</strong></p>`).join("")}
      </details>
    </aside></div>${photoDialog}
  </main>`;

  const update = () => {
    root.querySelectorAll("[data-gp-card]").forEach(button => {
      const id = button.dataset.gpCard;
      const flipped = board.flipped.has(id);
      button.classList.toggle("gp-flipped", flipped);
      button.setAttribute("aria-pressed", String(flipped));
      button.disabled = toggle.checked && wrong.has(id);
    });
    const remaining = game.deck.length - board.flipped.size;
    root.querySelector("[data-gp-count]").textContent = `${remaining} z ${game.deck.length} odkrytych kart`;
    root.querySelector(".gp-candidates i").style.transform = `scaleX(${remaining / game.deck.length})`;
  };
  const toggle = root.querySelector("[data-gp-guess]");
  update();
  toggle.onchange = () => {
    board.guess = toggle.checked;
    root.querySelector("[data-gp-help]").textContent = toggle.checked
      ? "Wybierz osobę i potwierdź typ. Pomyłka kończy turę."
      : "Kliknij kartę, by ją odwrócić lub przywrócić.";
    root.querySelector(".gp-table").classList.toggle("gp-guessing", toggle.checked);
    update();
  };
  const showCard = bindCardDialog(root, id => send("guess-people-try", id));
  root.querySelectorAll("[data-gp-card]").forEach(button => button.onclick = () => {
    const id = button.dataset.gpCard;
    if (toggle.checked) return showCard(cards.get(id), "guess");
    if (board.flipped.has(id)) board.flipped.delete(id);
    else board.flipped.add(id);
    update();
  });
  root.querySelectorAll("[data-gp-answer]").forEach(button => button.onclick = () => send("guess-people-answer", button.dataset.gpAnswer));
  const form = root.querySelector("[data-gp-form]");
  if (form) {
    const input = form.querySelector("textarea");
    form.querySelectorAll("[data-gp-prompt]").forEach(button => button.onclick = () => {
      input.value = prompts[Number(button.dataset.gpPrompt)];
      input.focus();
    });
    form.onsubmit = event => { event.preventDefault(); send("guess-people-ask", input.value); };
  }
  root.querySelector("[data-gp-leave]").onclick = () => actions.leaveRoom();
}
