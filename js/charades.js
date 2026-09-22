import { escapeHtml, resultPlayerMiniHtml } from "./utils.js?v=20260922-1";

export const charadesDefaults = { rounds: 2, answerTime: 75, category: "all" };
const promptBank = {
  zwierzeta: "kot|pies|koń|słoń|żyrafa|pingwin|krokodyl|kangur|małpa|żółw|delfin|kura|kaczka|lew|tygrys|niedźwiedź|królik|wąż|papuga|żaba|owca|nietoperz|ośmiornica|wiewiórka",
  czynnosci: "mycie zębów|jazda na rowerze|gotowanie obiadu|pływanie|taniec|odkurzanie|łowienie ryb|gra na gitarze|wspinaczka|robienie selfie|pakowanie walizki|jazda na nartach|podlewanie kwiatów|wiązanie butów|lepienie bałwana|gra w kręgle|dmuchanie balona|szukanie kluczy",
  postacie: "pirat|astronauta|detektyw|kucharz|królowa|czarodziej|robot|wampir|superbohater|klaun|kowboj|ninja|duch|lekarz|nauczyciel|strażak|kapitan statku|wróżka|rycerz|dyrygent",
  rzeczy: "parasol|gitara|telefon|szczoteczka do zębów|okulary|walizka|aparat fotograficzny|rower|zegar|samolot|drabina|młotek|szczotka|klucz|lornetka|mikrofon|kubek gorącej herbaty|deskorolka|latarka|pudełko prezentowe",
  filmy: "Harry Potter|Król Lew|Shrek|Titanic|Spider-Man|Kevin sam w domu|Kraina lodu|Minionki|Avatar|Matrix|Toy Story|Jurassic Park|Piraci z Karaibów|Kung Fu Panda|Gdzie jest Nemo|Epoka lodowcowa|Alicja w Krainie Czarów",
};
const normalize = value => String(value || "").toLocaleLowerCase("pl-PL").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ł/g, "l").replace(/[^a-z0-9]/g, "");
const phaseEnd = seconds => Date.now() + Math.max(10, Number(seconds) || 75) * 1000;
const shuffle = values => [...values].sort(() => Math.random() - .5);
function prompts(category = "all") {
  const source = category === "all" ? Object.values(promptBank).join(" ") : promptBank[category] || promptBank.zwierzeta;
  return [...new Set(source.split("|").filter(Boolean))];
}

export function createCharadesGame(players, settings = {}) {
  const rounds = Math.max(1, Math.min(10, Number(settings.rounds) || 2));
  const order = [...players];
  const pool = prompts(settings.category);
  const deck = shuffle(pool).slice(0, Math.min(pool.length, rounds * order.length));
  return {
    mode: "charades", phase: "acting", round: 1, rounds: Math.max(1, deck.length),
    players: order, actorIndex: 0, actorUid: order[0], prompts: deck,
    word: deck[0] || "kot", scores: Object.fromEntries(order.map(uid => [uid, 0])),
    guesses: [], guessedBy: "", answerTime: Math.max(20, Number(settings.answerTime) || 75),
    phaseEndsAt: phaseEnd(settings.answerTime), finished: false,
  };
}

function finish(game, winner = "") {
  game.phase = "reveal";
  game.guessedBy = winner;
  game.finished = Number(game.round) >= Number(game.rounds);
  game.phaseEndsAt = Date.now() + 4500;
}

export const CharadesEngine = {
  guess(game, uid, value) {
    if (game.phase !== "acting" || uid === game.actorUid) return "Teraz zgaduje reszta ekipy.";
    const text = String(value || "").trim().slice(0, 80);
    if (!text) return "Wpisz swoją odpowiedź.";
    game.guesses = Array.isArray(game.guesses) ? game.guesses : [];
    if (game.guesses.some(row => row.uid === uid)) return "W tej rundzie masz już zapisane zgadywanie.";
    const correct = normalize(text) === normalize(game.word);
    game.guesses.push({ uid, text, correct });
    if (correct) {
      game.scores[uid] = (Number(game.scores[uid]) || 0) + 2;
      game.scores[game.actorUid] = (Number(game.scores[game.actorUid]) || 0) + 1;
      finish(game, uid);
      return;
    }
    if (game.guesses.length >= game.players.length - 1) finish(game);
  },
  timeout(game) {
    if (game.phase !== "acting") return;
    finish(game);
  },
  next(game) {
    if (game.phase !== "reveal") return "Poczekaj na koniec rundy.";
    if (game.finished) { game.phase = "result"; return; }
    game.round += 1;
    game.actorIndex = (Number(game.actorIndex) + 1) % game.players.length;
    game.actorUid = game.players[game.actorIndex];
    game.word = game.prompts[game.round - 1] || prompts("all")[Math.floor(Math.random() * prompts("all").length)];
    game.guesses = [];
    game.guessedBy = "";
    game.phase = "acting";
    game.phaseEndsAt = phaseEnd(game.answerTime);
  },
};

export function renderCharadesGame(root, { room, accounts, currentUser }, actions) {
  const game = room.game, actor = game.actorUid === currentUser, expected = { phase: game.phase, phaseEndsAt: game.phaseEndsAt, round: game.round };
  if (game.phase === "result") {
    const ranking = Object.entries(game.scores || {}).sort((a, b) => b[1] - a[1]);
    root.innerHTML = `<main class="page charades-page enter"><section class="charades-panel charades-final center"><span class="charades-mime" aria-hidden="true">🎉</span><p class="eyebrow">KALAMBURY · PODSUMOWANIE</p><h1>Koniec przedstawienia!</h1><p class="muted">Najlepiej pokazałcie hasła razem.</p><div class="charades-ranking">${ranking.map(([uid, score], index) => `<article>${index + 1}. ${escapeHtml(accounts[uid]?.nick || "Gracz")} <b>${Number(score) || 0} pkt</b></article>`).join("")}</div><button class="primary" id="charades-room">Wróć do lobby</button></section></main>`;
    root.querySelector("#charades-room").addEventListener("click", actions.returnToRoom);
    return;
  }
  const rows = (game.guesses || []).map(row => `<article class="charades-guess ${row.correct ? "is-correct" : ""}"><span>${escapeHtml(accounts[row.uid]?.nick || "Gracz")}</span><b>${row.correct ? "Odgadnięte!" : "Jeszcze nie…"}</b></article>`).join("");
  if (game.phase === "reveal") {
    root.innerHTML = `<main class="page charades-page enter"><section class="charades-panel charades-reveal center"><div class="charades-reveal-burst">${game.guessedBy ? "✨" : "💡"}</div><p class="eyebrow">RUNDA ${game.round} / ${game.rounds}</p><h1>${escapeHtml(game.word)}</h1><p>${game.guessedBy ? `${escapeHtml(accounts[game.guessedBy]?.nick || "Gracz")} odgadł hasło!` : "Tym razem hasło pozostało tajemnicą."}</p><div class="charades-guess-list">${rows || '<span class="muted">Nikt jeszcze nie zgadł.</span>'}</div><button class="primary" id="charades-next" ${room.hostUid === currentUser ? "" : "disabled"}>${game.finished ? "Zobacz wyniki" : "Następne hasło"}</button><small class="charades-wait">Nowa runda za chwilę</small></section></main>`;
    root.querySelector("#charades-next").addEventListener("click", actions.charadesNext);
    renderCharadesGame.timer = setTimeout(() => actions.charadesNext(), Math.max(100, Number(game.phaseEndsAt) - Date.now() + 40));
    return;
  }
    root.innerHTML = `<main class="page charades-page enter"><section class="charades-panel"><header class="charades-heading"><div><p class="eyebrow">KALAMBURY · RUNDA ${game.round} / ${game.rounds}</p><h1>${actor ? "Pokaż to bez słów!" : `${escapeHtml(accounts[game.actorUid]?.nick || "Gracz")} pokazuje`}</h1></div><div class="charades-clock"><span>⏱</span><b data-charades-clock>${Math.max(0, Math.ceil((game.phaseEndsAt - Date.now()) / 1000))}</b></div></header>${actor ? `<div class="charades-secret"><small>TWOJE HASŁO · POKAŻ JE EKIPIE</small><strong>${escapeHtml(game.word)}</strong><p>Nie mów, nie pisz i nie pokazuj liter. Reszta wpisuje swoje odpowiedzi.</p></div>` : `<div class="charades-stage"><div class="charades-spotlight"></div><span aria-hidden="true">🎭</span><p>Patrz uważnie i zgadnij hasło!</p></div>`}<div class="charades-score-strip">${game.players.map(uid => `<span class="${uid === game.actorUid ? "is-actor" : ""}">${escapeHtml(accounts[uid]?.nick || "Gracz")} <b>${Number(game.scores?.[uid]) || 0}</b></span>`).join("")}</div>${rows ? `<div class="charades-guess-list">${rows}</div>` : ""}${!actor ? `<form class="charades-guess-form" id="charades-guess-form"><input id="charades-guess-input" maxlength="80" autocomplete="off" placeholder="Co pokazuje gracz?" ${game.guesses?.some(row => row.uid === currentUser) ? "disabled" : ""}><button class="primary" ${game.guesses?.some(row => row.uid === currentUser) ? "disabled" : ""}>Zgaduję!</button></form>` : '<p class="charades-actor-note">Nie widzisz hasła? Tylko ty powinieneś je znać.</p>'}</section></main>`;
  root.querySelector("#charades-guess-form")?.addEventListener("submit", event => { event.preventDefault(); actions.charadesGuess(root.querySelector("#charades-guess-input").value, expected); });
  renderCharadesGame.countdown = setInterval(() => { const clock = root.querySelector("[data-charades-clock]"); if (clock) clock.textContent = String(Math.max(0, Math.ceil((game.phaseEndsAt - Date.now()) / 1000))); }, 250);
  renderCharadesGame.timer = setTimeout(() => actions.charadesTimeout(expected), Math.max(100, Number(game.phaseEndsAt) - Date.now() + 50));
}
export function stopCharadesTimer() { clearTimeout(renderCharadesGame.timer); clearInterval(renderCharadesGame.countdown); }
export function renderCharadesLobbySettings(room, isHost) { const s = { ...charadesDefaults, ...(room.settings || {}) }; return `<div class="charades-settings"><label>Liczba haseł na osobę<select data-charades-setting="rounds" ${isHost ? "" : "disabled"}>${[1,2,3,4].map(value => `<option value="${value}" ${Number(s.rounds) === value ? "selected" : ""}>${value}</option>`).join("")}</select></label><label>Czas na pokazanie i zgadywanie<select data-charades-setting="answerTime" ${isHost ? "" : "disabled"}>${[45,60,75,90,120].map(value => `<option value="${value}" ${Number(s.answerTime) === value ? "selected" : ""}>${value} sekund</option>`).join("")}</select></label><label>Kategoria haseł<select data-charades-setting="category" ${isHost ? "" : "disabled"}><option value="all" ${s.category === "all" ? "selected" : ""}>Wszystko po trochu</option>${Object.keys(promptBank).map(key => `<option value="${key}" ${s.category === key ? "selected" : ""}>${key[0].toUpperCase() + key.slice(1)}</option>`).join("")}</select></label><p class="tiny">Każdy po kolei pokazuje hasło gestami. Trafienie daje 2 punkty zgadującemu i 1 osobie pokazującej.</p></div>`; }
