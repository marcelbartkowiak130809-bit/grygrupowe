import { escapeHtml } from "./utils.js?v=20260822-1";

export const numberMysteryDefaults = {
  communicationMode: "hybrid",
  roundMode: "race",
  questionTime: 30,
  rounds: 7,
};

const quickGroups = [
  ["Czy byłoby dziwnie, gdybym robił to bardzo często?", "Czy byłoby dziwnie, gdybym robił to tylko od czasu do czasu?", "Czy to brzmiałoby jak coś, co zdarza się niemal codziennie?", "Czy to brzmiałoby jak coś, co zdarza się naprawdę rzadko?", "Czy większość osób uznałaby taką wartość za przesadzoną?", "Czy większość osób uznałaby taką wartość za zaskakująco małą?", "Czy taka wartość pasowałaby do spokojnego dnia?", "Czy taka wartość pasowałaby do wyjątkowo intensywnego dnia?", "Czy byłoby to raczej normalne dla dorosłej osoby?", "Czy byłoby to raczej nietypowe dla dorosłej osoby?"],
  ["Czy dziwnie by było, gdybym tyle razy dziennie zaglądał do telefonu?", "Czy dziwnie by było, gdybym tyle czasu spędzał na spacerze?", "Czy dziwnie by było, gdybym tyle razy dziennie pił kawę?", "Czy dziwnie by było, gdybym tyle razy w tygodniu gotował?", "Czy dziwnie by było, gdybym tyle czasu potrzebował na zaśnięcie?", "Czy dziwnie by było, gdybym tyle razy w miesiącu odwiedzał kino?", "Czy dziwnie by było, gdybym tyle czasu poświęcał na sprzątanie?", "Czy dziwnie by było, gdybym tyle razy dziennie sprawdzał pogodę?", "Czy dziwnie by było, gdybym tyle czasu spędzał w podróży?", "Czy dziwnie by było, gdybym tyle razy w tygodniu zamawiał jedzenie?"],
  ["Czy taka liczba pasowałaby do liczby osób na dużym przyjęciu?", "Czy taka liczba pasowałaby do liczby książek na półce?", "Czy taka liczba pasowałaby do liczby zdjęć z wyjazdu?", "Czy taka liczba pasowałaby do liczby rzeczy w plecaku?", "Czy taka liczba pasowałaby do liczby wiadomości w zatłoczonym czacie?", "Czy taka liczba pasowałaby do liczby kroków podczas krótkiego spaceru?", "Czy taka liczba pasowałaby do liczby produktów w dużych zakupach?", "Czy taka liczba pasowałaby do liczby piosenek na krótkiej playliście?", "Czy taka liczba pasowałaby do liczby gości na rodzinnej uroczystości?", "Czy taka liczba pasowałaby do liczby zadań w pracowitym dniu?"],
  ["Czy gdybym był z kimś w związku w takim wieku, byłoby to dziwne?", "Czy taki wiek pasowałby do osoby zaczynającej samodzielne życie?", "Czy taki wiek pasowałby do osoby z dużym doświadczeniem zawodowym?", "Czy taki wiek pasowałby do studenta?", "Czy taki wiek pasowałby do osoby, która pamięta czasy bez internetu?", "Czy taki wiek pasowałby do kogoś, kto dopiero uczy się prowadzić?", "Czy taki wiek pasowałby do osoby planującej emeryturę?", "Czy taka różnica wieku w związku byłaby społecznie zaskakująca?", "Czy taki wiek kojarzyłby się raczej z młodością?", "Czy taki wiek kojarzyłby się raczej z dojrzałością?"],
  ["Czy tyle pieniędzy wystarczyłoby na skromny dzień bez zakupów?", "Czy tyle pieniędzy wystarczyłoby na spontaniczny weekend?", "Czy taka kwota byłaby rozsądna za używany telefon?", "Czy taka kwota byłaby przesadą za zwykły obiad?", "Czy taka kwota pasowałaby do kieszonkowego?", "Czy tyle pieniędzy wystarczyłoby na duże zakupy spożywcze?", "Czy taka kwota byłaby typowa za bilet na koncert?", "Czy taka kwota brzmiałaby jak drogi prezent?", "Czy taka kwota byłaby za mała na miesięczny czynsz?", "Czy taka kwota wyglądałaby jak oszczędności na czarną godzinę?"],
  ["Czy tyle snu wystarczyłoby, żeby dobrze funkcjonować?", "Czy taka długość filmu byłaby męcząca?", "Czy taki czas oczekiwania byłby irytujący?", "Czy tyle czasu wystarczyłoby na ugotowanie obiadu?", "Czy taka przerwa byłaby wystarczająca na odpoczynek?", "Czy tyle czasu wystarczyłoby na szybkie zakupy?", "Czy taka podróż byłaby za długa na jeden dzień?", "Czy tyle czasu wystarczyłoby na nauczenie się prostej umiejętności?", "Czy taka długość rozmowy byłaby niezręczna?", "Czy taki czas pasowałby do krótkiego treningu?"],
  ["Czy taka temperatura byłaby komfortowa na spacer?", "Czy taka temperatura pasowałaby do gorącej herbaty?", "Czy taka temperatura oznaczałaby lekką kurtkę?", "Czy taka temperatura byłaby zbyt niska dla kąpieli w jeziorze?", "Czy taki wynik temperatury kojarzyłby się z upałem?", "Czy taki wynik temperatury kojarzyłby się z mrozem?", "Czy taka temperatura byłaby typowa dla wiosennego poranka?", "Czy taka temperatura byłaby typowa dla letniego popołudnia?", "Czy taka temperatura byłaby niebezpieczna dla roślin?", "Czy taka temperatura pasowałaby do lodówki?"],
  ["Czy tyle punktów wystarczyłoby do wygrania spokojnej rundy?", "Czy taki wynik byłby imponujący w trudnym quizie?", "Czy taki wynik wyglądałby jak remis?", "Czy taka liczba punktów byłaby raczej słaba?", "Czy taki wynik sugerowałby bardzo dobrą passę?", "Czy tyle punktów byłoby możliwe bez żadnego błędu?", "Czy taka liczba pasowałaby do wysokiego wyniku sportowego?", "Czy taki wynik byłby typowy dla początkującego gracza?", "Czy taki wynik wyglądałby jak rekord?", "Czy tyle punktów wystarczyłoby do awansu?"],
  ["Czy taka liczba kroków byłaby realna podczas krótkiego spaceru?", "Czy taka liczba kroków pasowałaby do całego dnia poza domem?", "Czy tyle kilometrów dałoby się przejść bez odpoczynku?", "Czy taki dystans byłby dobry na rower?", "Czy taki dystans pasowałby do codziennego dojazdu?", "Czy tyle kilometrów byłoby za dużo na spontaniczny spacer?", "Czy taki dystans dałoby się pokonać w godzinę?", "Czy taka odległość pasowałaby do wycieczki za miasto?", "Czy taki dystans brzmiałby jak podróż między miastami?", "Czy tyle kroków można zrobić w domu?"],
  ["Czy tyle rzeczy zmieściłoby się w małym pokoju?", "Czy taka liczba osób zmieściłaby się przy jednym stole?", "Czy tyle pudeł wystarczyłoby do przeprowadzki?", "Czy taka liczba roślin byłaby trudna do pielęgnacji?", "Czy tyle zwierząt byłoby za dużo w mieszkaniu?", "Czy taka liczba krzeseł pasowałaby do sali?", "Czy tyle walizek byłoby kłopotliwe w pociągu?", "Czy taka liczba prezentów wyglądałaby hojnie?", "Czy tyle talerzy wystarczyłoby na większą kolację?", "Czy taka liczba dekoracji byłaby przesadą?"],
  ["Czy taka liczba lat różnicy między rodzeństwem byłaby typowa?", "Czy taka liczba dni wystarczyłaby na urlop?", "Czy tyle tygodni nauki wystarczyłoby do egzaminu?", "Czy tyle miesięcy bez przerwy byłoby długo?", "Czy taka liczba godzin pracy byłaby męcząca?", "Czy tyle minut czekania byłoby jeszcze do zniesienia?", "Czy taka liczba sezonów serialu byłaby imponująca?", "Czy tyle lat mieszkania w jednym miejscu byłoby długo?", "Czy taka liczba dni na odpowiedź byłaby przesadą?", "Czy tyle czasu bez snu byłoby niepokojące?"],
  ["Czy taka wartość kojarzyłaby się bardziej z minimum czy maksimum?", "Czy byłoby to bliżej małej czy dużej porcji?", "Czy taka liczba brzmiałaby jak połowa drogi?", "Czy taka wartość byłaby raczej bezpieczna czy ryzykowna?", "Czy taki wynik byłby bliżej początku czy końca skali?", "Czy taka liczba pasowałaby do czegoś codziennego?", "Czy taka wartość byłaby za duża dla dziecka?", "Czy taka liczba brzmiałaby jak rozsądny kompromis?", "Czy taki wynik zaskoczyłby większość osób?", "Czy taka wartość byłaby raczej graniczna?"],
];

export const numberMysteryQuickQuestions = quickGroups.flat();

const cleanPlayers = players => [...new Set(Array.isArray(players) ? players : [])].slice(0, 2);
const phaseEnd = seconds => Date.now() + Math.max(10, Math.min(180, Number(seconds) || 30)) * 1000;
const other = (game, uid) => game.players.find(player => player !== uid) || "";
const normalizeQuestion = value => String(value || "").replace(/[\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);
const hasDigit = value => /\d/.test(String(value || ""));
const numberWords = /(?<![\p{L}])(zero|jeden|jedna|jedno|jednego|jednej|jednym|dwa|dwie|dwóch|dwoch|trzy|trzech|cztery|czterech|pięć|piec|pięciu|pieciu|sześć|szesc|sześciu|szesciu|siedem|siedmiu|osiem|ośmiu|osmiu|dziewięć|dziewiec|dziewięciu|dziewieciu|dziesięć|dziesiec|dziesięciu|dziesieciu|sto|stu|tysiąc|tysiac|tysiąca|tysiaca|milion|miliona)(?![\p{L}])/iu;
const directNumberQuestion = /(?<![\p{L}])(numer|jaki mam|jaka mam|jaką mam|zgadnij mój|zgadnij moj|wpisz mój|wpisz moj)(?![\p{L}])/iu;

function addHistory(game, item) {
  game.history = Array.isArray(game.history) ? game.history : [];
  game.history.push({ ...item, round: Number(game.round) || 1, at: Date.now() });
}

function rotate(game) {
  game.turnUid = other(game, game.turnUid);
  game.pendingQuestion = "";
  game.pendingBy = "";
  game.responder = "";
  game.answer = "";
  game.phase = "ask";
  game.phaseEndsAt = phaseEnd(game.questionTime);
  game.turnsCompleted = Number(game.turnsCompleted || 0) + 1;
  if (game.roundMode === "rounds") {
    if (game.turnsCompleted % game.players.length === 0) game.round = Math.min(game.rounds, Number(game.round || 1) + 1);
    if (game.turnsCompleted >= game.rounds * game.players.length) {
      game.phase = "guess";
      game.phaseEndsAt = phaseEnd(game.questionTime);
    }
  }
}

function finishRoundGuess(game) {
  const guesses = game.guesses || {};
  game.players.forEach(player => {
    if (!Number.isInteger(Number(guesses[player]))) guesses[player] = 75;
  });
  const distances = Object.fromEntries(game.players.map(player => [player, Math.abs(Number(guesses[player]) - Number(game.numbers?.[player]))]));
  const best = Math.min(...Object.values(distances));
  game.distances = distances;
  game.winner = game.players.find(player => distances[player] === best) || "";
  game.phase = "result";
  game.finished = true;
}

export function createNumberMysteryGame(players, settings = {}) {
  const order = cleanPlayers(players), questionTime = Math.max(10, Math.min(180, Number(settings.questionTime) || 30));
  const roundMode = settings.roundMode === "rounds" ? "rounds" : "race";
  return {
    mode: "number-mystery", phase: "ask", players: order, round: 1, rounds: Math.max(1, Math.min(20, Number(settings.rounds) || 7)),
    roundMode, communicationMode: ["free", "quick", "hybrid"].includes(settings.communicationMode) ? settings.communicationMode : "hybrid", questionTime,
    numbers: Object.fromEntries(order.map(uid => [uid, 1 + Math.floor(Math.random() * 150)])),
    turnUid: order[0] || "", pendingQuestion: "", pendingBy: "", responder: "", answer: "", history: [], guesses: {}, wrongGuesses: {}, turnsCompleted: 0,
    phaseEndsAt: phaseEnd(questionTime), winner: "", finished: false,
  };
}

export const NumberMysteryEngine = {
  ask(game, uid, question) {
    if (game.phase !== "ask" || game.turnUid !== uid) return "Teraz pyta druga osoba.";
    const text = normalizeQuestion(question);
    if (text.length < 5) return "Wpisz pytanie albo wybierz szybkie pytanie.";
    if (hasDigit(text) || numberWords.test(text) || directNumberQuestion.test(text)) return "W pytaniu nie można wpisywać liczb ani pytać bezpośrednio o numer.";
    game.pendingQuestion = text; game.pendingBy = uid; game.responder = other(game, uid); game.phase = "answer"; game.phaseEndsAt = phaseEnd(game.questionTime); return;
  },
  answer(game, uid, answer) {
    if (game.phase !== "answer" || game.responder !== uid) return "Na odpowiedź czeka druga osoba.";
    const value = ["yes", "no", "maybe"].includes(answer) ? answer : "maybe";
    addHistory(game, { asker: game.pendingBy, responder: uid, question: game.pendingQuestion, answer: value });
    rotate(game);
  },
  guess(game, uid, value) {
    if (game.finished) return "Gra jest już zakończona.";
    if (game.roundMode === "rounds" && game.phase !== "guess") return "Najpierw zakończcie ustaloną liczbę rund pytań.";
    const guess = Math.round(Number(value));
    if (!Number.isInteger(guess) || guess < 1 || guess > 150) return "Podaj liczbę od 1 do 150.";
    game.guesses = { ...(game.guesses || {}), [uid]: guess };
    addHistory(game, { asker: uid, question: "Próba odgadnięcia numeru", guess });
    if (game.roundMode === "race" && guess === Number(game.numbers?.[uid])) { game.phase = "result"; game.winner = uid; game.finished = true; return; }
    if (game.roundMode === "rounds" && game.players.every(player => Number.isInteger(game.guesses?.[player]))) finishRoundGuess(game);
  },
  timeout(game) {
    if (game.phase === "guess" && game.roundMode === "rounds") { finishRoundGuess(game); return; }
    if (!["ask", "answer"].includes(game.phase)) return;
    if (game.phase === "ask") addHistory(game, { asker: game.turnUid, question: "Brak pytania w czasie" });
    else addHistory(game, { asker: game.pendingBy, responder: game.responder, question: game.pendingQuestion, answer: "timeout" });
    rotate(game);
  },
};

function questionLabel(value) { return value === "yes" ? "Tak" : value === "no" ? "Nie" : value === "timeout" ? "Brak odpowiedzi" : "Trudno powiedzieć"; }
function name(accounts, uid) { return accounts?.[uid]?.nick || "Gracz"; }
function quickQuestionHtml(game, actions, expected) {
  const start = (Number(game.turnsCompleted || 0) * 12) % numberMysteryQuickQuestions.length;
  const sample = Array.from({ length: 12 }, (_, index) => numberMysteryQuickQuestions[(start + index) % numberMysteryQuickQuestions.length]);
  return `<div class="number-mystery-quick"><p class="eyebrow">SZYBKIE PYTANIA</p><div class="choice-grid">${sample.map((question, index) => `<button class="ghost number-mystery-quick-question" data-number-mystery-quick="${index}">${escapeHtml(question)}</button>`).join("")}</div></div>`;
}

export function renderNumberMysteryGame(root, { room, accounts, currentUser }, actions) {
  const game = room.game, me = currentUser, opponent = other(game, me), expected = { phase: game.phase, phaseEndsAt: game.phaseEndsAt };
  if (game.phase === "result") {
    const winner = game.winner ? name(accounts, game.winner) : "Remis", numbers = game.players.map(uid => `<div class="number-mystery-result-row"><b>${escapeHtml(name(accounts, uid))}</b><span>Numer: <strong>${game.numbers?.[uid] ?? "—"}</strong> · Próba: <strong>${game.guesses?.[uid] ?? "—"}</strong>${game.distances ? ` · Różnica: <strong>${game.distances[uid]}</strong>` : ""}</span></div>`).join("");
    root.innerHTML = `<main class="page number-mystery-page"><section class="panel number-mystery-panel center"><p class="eyebrow">TAJEMNICZA LICZBA · WYNIKI</p><h1>${escapeHtml(winner)}${game.winner ? " wygrywa" : ""}</h1><p class="muted">Numery zostają ujawnione dopiero po zakończeniu gry.</p><div class="number-mystery-results">${numbers}</div><button class="primary" id="number-mystery-room">Wróć do lobby</button></section></main>`;
    root.querySelector("#number-mystery-room").addEventListener("click", actions.returnToRoom); return;
  }
  const myTurn = game.phase === "ask" && game.turnUid === me, mustAnswer = game.phase === "answer" && game.responder === me;
  const history = (Array.isArray(game.history) ? game.history : []).slice().reverse().map(item => `<li><b>${escapeHtml(name(accounts, item.asker))}</b>: ${escapeHtml(item.question)}${item.answer ? ` <span>→ ${escapeHtml(questionLabel(item.answer))}</span>` : item.guess ? ` <span>→ próba: ${item.guess}</span>` : ""}</li>`).join("") || `<li class="muted">Historia pytań pojawi się tutaj.</li>`;
  const composer = myTurn && game.roundMode !== "rounds" || myTurn ? `<div class="number-mystery-composer">${game.communicationMode !== "quick" ? `<form id="number-mystery-question"><input id="number-mystery-input" maxlength="180" placeholder="Zadaj pytanie bez liczb..."><button class="primary">Zadaj pytanie</button></form>` : ""}${game.communicationMode !== "free" ? quickQuestionHtml(game, actions, expected) : ""}</div>` : mustAnswer ? `<div class="number-mystery-answer"><p class="question-card">„${escapeHtml(game.pendingQuestion)}”</p><p class="muted">Odpowiedz zgodnie z tym, co wiesz o numerze tej osoby.</p><div class="choice-row"><button class="primary" data-number-mystery-answer="yes">Tak</button><button class="ghost" data-number-mystery-answer="no">Nie</button><button class="ghost" data-number-mystery-answer="maybe">Trudno powiedzieć</button></div></div>` : `<div class="number-mystery-waiting"><p>${game.phase === "answer" ? `Czekamy na odpowiedź gracza ${escapeHtml(name(accounts, game.responder))}.` : `Czekamy na pytanie gracza ${escapeHtml(name(accounts, game.turnUid))}.`}</p>${game.pendingQuestion ? `<p class="question-card">„${escapeHtml(game.pendingQuestion)}”</p>` : ""}</div>`;
  const guessAllowed = game.roundMode === "race" || game.phase === "guess";
  root.innerHTML = `<main class="page number-mystery-page enter"><section class="panel number-mystery-panel"><p class="eyebrow">TAJEMNICZA LICZBA · ${game.roundMode === "rounds" ? `RUNDA ${Math.min(game.round, game.rounds)}/${game.rounds}` : "POLOWANIE"}</p><h1>Zgadnij swój numer</h1><p class="muted">Twój numer jest ukryty. Znasz numer przeciwnika: <strong>${game.numbers?.[opponent] ?? "—"}</strong>.</p><div class="number-mystery-status"><span>${game.phase === "guess" ? "Czas na końcowe typowanie" : myTurn ? "Twoja kolej na pytanie" : mustAnswer ? "Odpowiedz na pytanie" : "Czekamy na ruch przeciwnika"}</span><b data-number-mystery-countdown></b></div>${composer}${guessAllowed ? `<form id="number-mystery-guess" class="number-mystery-guess"><label>Próba odgadnięcia własnego numeru<input id="number-mystery-guess-input" type="number" min="1" max="150" placeholder="1–150"><button class="primary">Zgaduję</button></label></form>` : ""}<section class="number-mystery-history"><div class="section-intro"><div><p class="eyebrow">HISTORIA PYTAŃ</p><h2>Co już padło?</h2></div><span class="badge">${game.history?.length || 0}</span></div><ol>${history}</ol></section></section></main>`;
  root.querySelector("#number-mystery-question")?.addEventListener("submit", event => { event.preventDefault(); actions.numberMysteryAsk(root.querySelector("#number-mystery-input").value, expected); });
  root.querySelectorAll("[data-number-mystery-quick]").forEach(button => button.addEventListener("click", () => actions.numberMysteryAsk(button.textContent, expected)));
  root.querySelectorAll("[data-number-mystery-answer]").forEach(button => button.addEventListener("click", () => actions.numberMysteryAnswer(button.dataset.numberMysteryAnswer, expected)));
  root.querySelector("#number-mystery-guess")?.addEventListener("submit", event => { event.preventDefault(); actions.numberMysteryGuess(root.querySelector("#number-mystery-guess-input").value, expected); });
  if (game.phase !== "result") { const countdown = root.querySelector("[data-number-mystery-countdown]"); const tick = () => { if (!countdown?.isConnected) return; const left = Math.max(0, Math.ceil((Number(game.phaseEndsAt || 0) - Date.now()) / 1000)); countdown.textContent = `${left}s`; if (!left) actions.numberMysteryTimeout(expected); else renderNumberMysteryGame.timer = setTimeout(tick, 500); }; tick(); }
}

export function renderNumberMysteryLobbySettings(room, isHost) {
  const s = { ...numberMysteryDefaults, ...(room.settings || {}) };
  return `<div class="number-mystery-settings"><label>Tryb pytań <select data-number-mystery-setting="communicationMode" ${isHost ? "" : "disabled"}><option value="free" ${s.communicationMode === "free" ? "selected" : ""}>Free chat — własne pytania</option><option value="quick" ${s.communicationMode === "quick" ? "selected" : ""}>Quick chat — gotowe pytania</option><option value="hybrid" ${s.communicationMode === "hybrid" ? "selected" : ""}>Free chat + quick chat</option></select></label><label>Warunek zwycięstwa <select data-number-mystery-setting="roundMode" ${isHost ? "" : "disabled"}><option value="race" ${s.roundMode !== "rounds" ? "selected" : ""}>Kto pierwszy odgadnie</option><option value="rounds" ${s.roundMode === "rounds" ? "selected" : ""}>Najbliżej po rundach</option></select></label><label>Czas na pytanie <select data-number-mystery-setting="questionTime" ${isHost ? "" : "disabled"}>${[15, 30, 45, 60].map(value => `<option value="${value}" ${Number(s.questionTime) === value ? "selected" : ""}>${value} sekund</option>`).join("")}</select></label>${s.roundMode === "rounds" ? `<label>Liczba rund pytań <select data-number-mystery-setting="rounds" ${isHost ? "" : "disabled"}>${[3, 5, 7, 10].map(value => `<option value="${value}" ${Number(s.rounds) === value ? "selected" : ""}>${value} rund</option>`).join("")}</select></label>` : ""}<p class="tiny">Gra jest dla dwóch osób. Nie wpisuj liczb ani ich nazw w pytaniach.</p></div>`;
}

export function stopNumberMysteryTimer() { clearTimeout(renderNumberMysteryGame.timer); renderNumberMysteryGame.timer = 0; }
