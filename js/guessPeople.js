import { escapeHtml } from "./utils.js?v=20260903-7";
import { guessPeople } from "./guessPeopleCatalog.js?v=20261117-11";

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
    advance();
    return;
  }
  if (expired) return "Czas na ten ruch minął.";
  if (action === "guess-people-answer") {
    if (!game.question || uid !== target || !["Tak", "Nie", "Nie widać"].includes(value)) return "Tylko pytany gracz może teraz odpowiedzieć.";
    game.history = [...(game.history || []).slice(-79), {
      from:game.currentUid, to:target, question:game.question, answer:value,
    }];
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
    localBoards.set(key, { flipped:new Set() });
  }
  return localBoards.get(key);
}

function renderCredits(card) {
  const license = card[6] ? `<a href="${escapeHtml(card[6])}" target="_blank" rel="noopener">${escapeHtml(card[5])}</a>` : escapeHtml(card[5]);
  return `<a href="${escapeHtml(card[3])}" target="_blank" rel="noopener">Zdjęcie w Wikimedia Commons</a> · ${escapeHtml(card[4])} · ${license} · zmieniono rozmiar`;
}

function renderResult(root, game, room, accounts, currentUser, actions) {
  root.innerHTML = `<main class="page gp-page"><section class="gp-panel gp-result">
    <p class="eyebrow">ZGADNIJ KTO? · KONIEC MECZU</p>
    <h1>${game.winner ? `Wygrywa ${nameOf(accounts, game.winner)}!` : "Koniec gry"}</h1>
    ${game.finishReason === "departure" ? "<p>Przeciwnik opuścił rozgrywkę.</p>" : ""}
    <div class="gp-reveal">${game.players.map(uid => {
      const card = cards.get(game.secrets[uid]);
      return card ? `<article>${cardPhoto(card)}<strong>${escapeHtml(card[1])}</strong><span>Karta gracza ${nameOf(accounts, uid)}</span><details><summary>Źródło zdjęcia</summary>${renderCredits(card)}</details></article>` : "";
    }).join("")}</div>
    <div class="gp-actions">${room.hostUid === currentUser ? '<button class="primary" data-gp-restart>Zagraj ponownie</button>' : ""}<button class="ghost" data-gp-lobby>Wróć do lobby</button><button class="ghost" data-gp-leave>Wyjdź z pokoju</button></div>
    </section></main>`;
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
  const wrong = new Set(game.wrongGuesses?.[`${currentUser}:${target}`] || []);
  const history = (game.history || []).filter(row => row.from === currentUser && row.to === target).reverse();
  const expected = {phase:game.phase,phaseEndsAt:game.phaseEndsAt};
  const send = (action, value) => actions.boardAction(action, value, expected);
  root.innerHTML = `<main class="page gp-page">
    <header class="gp-heading"><div><p class="eyebrow">PLANSZÓWKI</p><h1>Zgadnij kto?</h1></div><button class="ghost" data-gp-leave>Wyjdź</button></header>
    <div class="gp-layout"><section class="gp-panel gp-table">
      <div class="gp-toolbar"><div><h2>Zgadujesz kartę gracza ${nameOf(accounts, target)}</h2>
        <div class="gp-count" data-gp-count></div></div>
        <label class="gp-toggle"><input type="checkbox" data-gp-guess ${canPlay ? "" : "disabled"}> Wskaż odpowiedź</label></div>
      <p class="gp-help" data-gp-help>Kliknij kartę, by ją odwrócić. Kliknij ponownie, by ją przywrócić.</p>
      <div class="gp-grid ${game.deck.length === 40 ? "gp-grid-large" : ""}">
        ${game.deck.map(id => {
          const card = cards.get(id);
          return `<article class="gp-card">
            <button type="button" class="gp-face" data-gp-card="${id}" aria-label="${escapeHtml(card[1])}" aria-pressed="false">
              <span class="gp-card-front">${cardPhoto(card)}<strong>${escapeHtml(card[1])}</strong><small>${escapeHtml(card[2])}</small></span>
              <span class="gp-card-back" aria-hidden="true">?</span>
            </button>
            <button type="button" class="gp-zoom" data-gp-photo="${id}" aria-label="Powiększ zdjęcie: ${escapeHtml(card[1])}">⤢</button>
          </article>`;
        }).join("")}
      </div>
    </section><aside class="gp-side">
      <section class="gp-panel gp-turn"><div class="gp-turn-top"><h2>${responding ? "Odpowiedz na pytanie" : canPlay ? "Twój ruch" : `Ruch gracza ${nameOf(accounts, game.currentUid)}`}</h2><strong data-board-timer></strong></div>
      ${game.question ? `<p>${nameOf(accounts, game.currentUid)} → ${nameOf(accounts, game.targets[game.currentUid])}</p><blockquote>${escapeHtml(game.question)}</blockquote>` : ""}
      ${responding ? '<div class="gp-actions">' + ["Tak","Nie","Nie widać"].map(answer => `<button class="ghost" data-gp-answer="${answer}">${answer}</button>`).join("") + '</div>' : ""}
      ${canPlay ? `<form data-gp-form><label for="gp-question">Pytanie o zdjęcie</label><textarea id="gp-question" minlength="3" maxlength="160" required placeholder="Czy ma okulary?"></textarea>
        <div class="gp-prompts">${prompts.map((prompt, i) => `<button type="button" class="ghost" data-gp-prompt="${i}">${prompt}</button>`).join("")}</div>
        <button class="primary" type="submit">Zadaj pytanie</button></form>` : ""}
      </section>
      ${ownCard ? `<section class="gp-panel gp-secret"><h2>Twoja tajna karta</h2><button class="ghost" data-gp-photo="${ownCard[0]}">${cardPhoto(ownCard)}<span>${escapeHtml(ownCard[1])}</span></button></section>` : ""}
      <details class="gp-panel gp-history" ${history.length ? "open" : ""}><summary>Twoje pytania (${history.length})</summary>
        ${history.map(row => `<p>${escapeHtml(row.question)} <strong>${escapeHtml(row.answer)}</strong></p>`).join("")}
      </details>
    </aside></div><dialog class="gp-dialog" data-gp-dialog></dialog>
  </main>`;

  const update = () => {
    root.querySelectorAll("[data-gp-card]").forEach(button => {
      const id = button.dataset.gpCard;
      const flipped = board.flipped.has(id) || wrong.has(id);
      button.classList.toggle("gp-flipped", flipped);
      button.setAttribute("aria-pressed", String(flipped));
      button.disabled = wrong.has(id);
    });
    const remaining = game.deck.filter(id => !board.flipped.has(id) && !wrong.has(id)).length;
    root.querySelector("[data-gp-count]").textContent = `${remaining} z ${game.deck.length} odkrytych kart`;
  };
  update();
  const toggle = root.querySelector("[data-gp-guess]");
  toggle.onchange = () => {
    root.querySelector("[data-gp-help]").textContent = toggle.checked
      ? "Wybierz osobę i potwierdź typ. Pomyłka kończy turę."
      : "Kliknij kartę, by ją odwrócić. Kliknij ponownie, by ją przywrócić.";
    root.querySelector(".gp-table").classList.toggle("gp-guessing", toggle.checked);
  };
  const dialog = root.querySelector("[data-gp-dialog]");
  const showPhoto = (card, guess = false) => {
    dialog.innerHTML = `<form method="dialog"><button class="ghost" aria-label="Zamknij">✕</button></form>
      ${cardPhoto(card)}<h2>${escapeHtml(card[1])}</h2><p>${renderCredits(card)}</p>
      ${guess ? '<button class="primary" data-gp-confirm>Potwierdź typ</button>' : ""}`;
    dialog.querySelector("[data-gp-confirm]")?.addEventListener("click", () => {
      dialog.close();
      send("guess-people-try", card[0]);
    }, { once:true });
    dialog.showModal();
  };
  root.querySelectorAll("[data-gp-card]").forEach(button => button.onclick = () => {
    const id = button.dataset.gpCard;
    if (toggle.checked) return showPhoto(cards.get(id), true);
    if (board.flipped.has(id)) board.flipped.delete(id);
    else board.flipped.add(id);
    update();
  });
  root.querySelectorAll("[data-gp-photo]").forEach(button => button.onclick = () => showPhoto(cards.get(button.dataset.gpPhoto)));
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
