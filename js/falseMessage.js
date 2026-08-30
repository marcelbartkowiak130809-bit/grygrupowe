import { escapeHtml } from "./utils.js?v=20260822-1";

export const falseMessageDefaults = { rounds: 0, answerTime: 30, voteTime: 25, categories: ["all"] };

const situationPacks = {
  embarrassment: [
    "[GRACZ] przypadkiem wysłał wiadomość do złej osoby. Co napisał chwilę później?",
    "[GRACZ] polubił zdjęcie sprzed sześciu lat osoby, którą oglądał zbyt długo. Co teraz pisze?",
    "[GRACZ] pomachał komuś, kto wcale nie machał do niego. Jaka wiadomość trafia na grupę?",
    "[GRACZ] przewrócił się przed pełnym przystankiem. Co wysyła znajomym?",
    "[GRACZ] wszedł do złej sali i usiadł, jakby nic się nie stało. Co pisze?",
    "[GRACZ] powiedział na głos coś, co miało zostać tylko w jego głowie. Jaki jest damage control?",
    "[GRACZ] założył dwie różne skarpetki i zauważył to dopiero wieczorem. Co ogłasza?",
    "[GRACZ] wysłał głosówkę z przypadkowym hałasem w tle. Co dopisuje?",
    "[GRACZ] pomylił imię nowej osoby trzy razy pod rząd. Co wysyła po spotkaniu?",
    "[GRACZ] zaśmiał się w absolutnie najgorszym momencie. Jak się tłumaczy?"
  ],
  school: [
    "[GRACZ] spóźnił się dwie godziny do szkoły. Jaką wymówkę wysłał nauczycielowi?",
    "[GRACZ] zapomniał, że dziś jest sprawdzian. Co pisze na klasowej grupie?",
    "[GRACZ] dostał uwagę za coś, czego nie zrobił. Jaka wiadomość leci do rodzica?",
    "[GRACZ] ma jutro prezentację, której jeszcze nie zaczął. Co wysyła ekipie?",
    "[GRACZ] pomylił plan lekcji i przyszedł dzień za wcześnie. Co pisze?",
    "[GRACZ] zostawił plecak w autobusie. Jaki dramatyczny komunikat wysyła?",
    "[GRACZ] został wywołany do odpowiedzi, a nie słuchał ani słowa. Co teraz pisze?",
    "[GRACZ] odkrył, że praca domowa była na wczoraj. Jak prosi o ratunek?",
    "[GRACZ] przypadkiem wysłał nauczycielowi mema zamiast zadania. Co dopisuje?",
    "[GRACZ] dowiaduje się, że jutro nie ma szkoły. Co jako pierwsze pisze?"
  ],
  relationships: [
    "[GRACZ] dostał wiadomość „musimy porozmawiać”. Co odpisuje po trzech sekundach?",
    "[GRACZ] chce zaprosić kogoś na randkę, ale udaje, że pyta o coś innego. Co pisze?",
    "[GRACZ] przypadkiem wysłał serduszko osobie, do której nie powinien. Jaki jest plan?",
    "[GRACZ] zobaczył, że jego sympatia jest online. Co wysyła znajomym?",
    "[GRACZ] zapomniał o ważnej rocznicy. Jak próbuje uratować sytuację?",
    "[GRACZ] ma wyjaśnić, dlaczego odpisał dopiero po dwóch dniach. Co pisze?",
    "[GRACZ] spotkał byłego partnera w sklepie. Jaka wiadomość trafia na grupę?",
    "[GRACZ] chce zakończyć rozmowę, ale druga osoba pisze coraz więcej. Co odpowiada?",
    "[GRACZ] otrzymał bardzo miły komplement i nie wie, co odpisać. Co wysyła?",
    "[GRACZ] pomylił datę spotkania. Jak tłumaczy się drugiej osobie?"
  ],
  games: [
    "[GRACZ] dostał bana w swojej ulubionej grze. Co wysyła znajomym?",
    "[GRACZ] przegrał mecz przez własny błąd w ostatniej sekundzie. Co pisze na czacie?",
    "[GRACZ] właśnie trafił ultra rzadki przedmiot. Jaka wiadomość leci na grupę?",
    "[GRACZ] obiecał, że zagra tylko jedną rundę, a jest już rano. Co pisze?",
    "[GRACZ] przypadkiem usunął zapis gry. Jak ogłasza katastrofę?",
    "[GRACZ] wygrał z przeciwnikiem, który przez cały mecz go prowokował. Co wysyła?",
    "[GRACZ] kupił dodatek i po pięciu minutach go znienawidził. Co pisze?",
    "[GRACZ] znalazł idealną wymówkę, żeby nie oddać pada. Co odpowiada?",
    "[GRACZ] pomylił przycisk i wyrzucił najlepszego przedmiotu. Jaki jest komunikat?",
    "[GRACZ] został oskarżony o oszukiwanie, choć po prostu miał szczęście. Co pisze?"
  ],
  money: [
    "[GRACZ] właśnie wygrał dwa miliony złotych. Jaka jest pierwsza wiadomość na grupę?",
    "[GRACZ] wydał całą wypłatę w jeden dzień. Jak tłumaczy to znajomym?",
    "[GRACZ] znalazł pieniądze w starej kurtce. Co pisze?",
    "[GRACZ] dostał przelew z dziwnym tytułem. Jaka wiadomość trafia do banku?",
    "[GRACZ] obiecał oszczędzać, ale zobaczył ogromną promocję. Co wysyła?",
    "[GRACZ] pożyczył komuś pieniądze i właśnie sobie o tym przypomniał. Co pisze?",
    "[GRACZ] kupił najdroższą rzecz w swoim życiu pod wpływem chwili. Jak się tłumaczy?",
    "[GRACZ] przez pomyłkę zapłacił za zakupy całej kolejki. Co ogłasza?",
    "[GRACZ] znalazł idealny sposób na szybki zarobek. Co pisze znajomym?",
    "[GRACZ] sprawdził konto po weekendzie i bardzo tego żałuje. Jaki wysyła komunikat?"
  ],
  party: [
    "[GRACZ] obudził się po imprezie w kompletnie nieznanym miejscu. Co pisze na grupie?",
    "[GRACZ] obiecał, że nie będzie tańczyć, a potem wszyscy mają nagranie. Co wysyła?",
    "[GRACZ] pomylił mieszkanie na imprezie. Jak tłumaczy się gospodarzowi?",
    "[GRACZ] zamówił jedzenie dla całej imprezy, ale wybrał absurdalny zestaw. Co pisze?",
    "[GRACZ] został DJ-em bez pytania. Jaki komunikat wysyła po pierwszej piosence?",
    "[GRACZ] zasnął na imprezie w najbardziej widocznym miejscu. Co pisze rano?",
    "[GRACZ] powiedział, że zna drogę, ale wszyscy się zgubili. Jaka wiadomość leci?",
    "[GRACZ] przyniósł prezent, który kompletnie nie pasuje do okazji. Co dopisuje?",
    "[GRACZ] przypadkiem wylał napój na najważniejszą rzecz w pokoju. Jak ogłasza problem?",
    "[GRACZ] wyszedł tylko po lód i wrócił po godzinie. Co pisze znajomym?"
  ],
  internet: [
    "[GRACZ] przypadkiem opublikował prywatne zdjęcie publicznie. Co pisze po minucie?",
    "[GRACZ] został oznaczony w bardzo dziwnym poście. Jak odpowiada?",
    "[GRACZ] zobaczył swój stary komentarz i natychmiast się go wstydzi. Co wysyła?",
    "[GRACZ] dostał wiadomość od celebryty, ale wygląda podejrzanie. Co pisze znajomym?",
    "[GRACZ] wrzucił film, który niespodziewanie stał się viralem. Jaki jest pierwszy komunikat?",
    "[GRACZ] zapomniał wyłączyć kamerkę na spotkaniu online. Co pisze po wszystkim?",
    "[GRACZ] został wyrzucony z grupy bez wyjaśnienia. Co wysyła administratorowi?",
    "[GRACZ] znalazł swoje zdjęcie jako mem. Jak komentuje sytuację?",
    "[GRACZ] odpisał na wiadomość, która była przeznaczona dla kogoś innego. Co dopisuje?",
    "[GRACZ] ma wymyślić idealny opis do bardzo nieudanego zdjęcia. Co publikuje?"
  ]
};

const allSituations = Object.entries(situationPacks).flatMap(([category, items]) => items.map((template, index) => ({ category, index, template, key: category + ":" + index })));
const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const clamp = (value, min, max, fallback) => Math.max(min, Math.min(max, Number(value) || fallback));
const activeResponders = game => (game.players || []).filter(uid => uid !== game.heroUid && !game.eliminated?.includes(uid));
const deadline = seconds => Date.now() + clamp(seconds, 5, 180, 30) * 1000;
const clean = value => String(value || "").trim().replace(/\s+/g, " ").slice(0, 280);
const shuffle = list => [...list].sort(() => Math.random() - .5);
const nick = (accounts, uid) => accounts?.[uid]?.nick || (String(uid).startsWith("bot:") ? "Bot" : "Gracz");

export function sanitizeFalseMessageSettings(settings = {}) {
  const categories = Array.isArray(settings.categories) ? settings.categories.filter(category => category === "all" || Object.hasOwn(situationPacks, category)) : ["all"];
  return { rounds: clamp(settings.rounds, 0, 10, 0), answerTime: clamp(settings.answerTime, 15, 120, 30), voteTime: clamp(settings.voteTime, 10, 90, 25), categories: categories.length ? [...new Set(categories)] : ["all"] };
}

function chooseHero(game) {
  const counts = object(game.heroCounts), previous = game.heroUid, players = game.players || [];
  const minimum = players.length ? Math.min(...players.map(uid => Number(counts[uid] || 0))) : 0;
  let candidates = players.filter(uid => Number(counts[uid] || 0) === minimum);
  if (candidates.length > 1 && previous) candidates = candidates.filter(uid => uid !== previous);
  const hero = shuffle(candidates.length ? candidates : players.filter(uid => uid !== previous))[0] || players[0] || "";
  counts[hero] = Number(counts[hero] || 0) + 1;
  game.heroCounts = counts; game.heroHistory = [...(game.heroHistory || []), hero];
  return hero;
}

function chooseSituation(game, settings) {
  const wanted = settings.categories.includes("all") ? allSituations : allSituations.filter(item => settings.categories.includes(item.category));
  const used = new Set(game.usedSituations || []);
  const available = wanted.filter(item => !used.has(item.key));
  const choice = shuffle(available.length ? available : wanted)[0] || allSituations[0];
  game.usedSituations = [...(game.usedSituations || []), choice.key];
  game.situationCategory = choice.category; return choice.template;
}

export function createFalseMessageGame(players, settings = {}) {
  const s = sanitizeFalseMessageSettings(settings), game = { mode: "falszywa-wiadomosc", phase: "answering", round: 1, totalRounds: s.rounds || players.length, players: [...players], heroUid: "", heroHistory: [], heroCounts: Object.fromEntries(players.map(uid => [uid, 0])), situation: "", situationCategory: "all", usedSituations: [], answers: {}, selectedAnswerUid: "", scores: Object.fromEntries(players.map(uid => [uid, 0])), roundResult: null, finished: false, phaseEndsAt: deadline(s.answerTime) };
  game.heroUid = chooseHero(game); game.situation = chooseSituation(game, s); return game;
}

function enterSelecting(game, settings) { game.phase = "selecting"; game.phaseEndsAt = deadline(settings.voteTime); }
function resolveSelection(game) {
  const answers = object(game.answers), selected = game.selectedAnswerUid && answers[game.selectedAnswerUid] ? game.selectedAnswerUid : "";
  game.scores = object(game.scores); if (selected) game.scores[selected] = Number(game.scores[selected] || 0) + 1;
  game.roundResult = { round: game.round, heroUid: game.heroUid, situation: game.situation, answers: { ...answers }, selectedAnswerUid: selected, winnerUid: selected };
  game.phase = "roundResult"; game.phaseEndsAt = Date.now() + 10000;
}

export const FalseMessageEngine = {
  answer(game, uid, text, settings = {}) {
    if (game.phase !== "answering") return "Czas na wiadomości już minął.";
    if (uid === game.heroUid) return "Bohater sytuacji nie pisze wiadomości w swojej rundzie.";
    if (!activeResponders(game).includes(uid)) return "Nie bierzesz udziału w tej rundzie.";
    if (uid in object(game.answers)) return "Twoja wiadomość jest już zapisana.";
    const answer = clean(text); if (answer.length < 2) return "Napisz krótką wiadomość.";
    game.answers = object(game.answers); game.answers[uid] = answer;
    if (activeResponders(game).every(player => player in game.answers)) enterSelecting(game, sanitizeFalseMessageSettings(settings));
  },
  choose(game, uid, answerUid) {
    if (game.phase !== "selecting") return "Wybór jest już zakończony.";
    if (uid !== game.heroUid) return "Tylko bohater sytuacji wybiera wiadomość.";
    if (!answerUid || !(answerUid in object(game.answers)) || !String(game.answers[answerUid] || "").trim()) return "Wybierz istniejącą wiadomość.";
    if (game.selectedAnswerUid) return "Wiadomość została już wybrana.";
    game.selectedAnswerUid = answerUid; resolveSelection(game);
  },
  timeout(game, settings = {}) {
    if (game.phase === "answering") { game.answers = object(game.answers); activeResponders(game).forEach(uid => { if (!(uid in game.answers)) game.answers[uid] = ""; }); enterSelecting(game, sanitizeFalseMessageSettings(settings)); }
    else if (game.phase === "selecting") resolveSelection(game);
  },
  nextRound(game, settings = {}) {
    const s = sanitizeFalseMessageSettings(settings);
    if (game.phase !== "roundResult") return "Wynik rundy nie jest jeszcze gotowy.";
    if (Number(game.round) >= Number(game.totalRounds || s.rounds || game.players.length)) { game.phase = "gameSummary"; game.finished = true; game.phaseEndsAt = null; return; }
    game.round += 1; game.heroUid = chooseHero(game); game.situation = chooseSituation(game, s); game.answers = {}; game.selectedAnswerUid = ""; game.roundResult = null; game.phase = "answering"; game.phaseEndsAt = deadline(s.answerTime);
  },
  botAnswer(game) {
    const choices = ["Nie pytajcie, długa historia.", "To był zdecydowanie mój najbardziej charakterystyczny moment.", "Mam na to wiadomość, ale brzmi zbyt absurdalnie.", "W tej sytuacji zachowałbym się dokładnie tak, jak wszyscy myślicie.", "Najpierw udawałbym, że nic się nie stało."];
    return choices[Math.floor(Math.random() * choices.length)];
  },
  botChoose(game) {
    const options = Object.keys(game.answers || {}).filter(uid => String(game.answers[uid] || "").trim());
    return options.sort((a, b) => String(game.answers[b]).length - String(game.answers[a]).length)[0] || options[0] || "";
  }
};

function situationText(game, accounts) { return String(game.situation || "").replaceAll("[GRACZ]", nick(accounts, game.heroUid)); }
function rankingHtml(game, accounts) {
  return [...(game.players || [])].sort((a, b) => Number(game.scores?.[b] || 0) - Number(game.scores?.[a] || 0)).map((uid, index) => "<div class=\"false-message-ranking-row\"><span>" + (index + 1) + ". " + escapeHtml(nick(accounts, uid)) + "</span><b>" + Number(game.scores?.[uid] || 0) + " pkt</b></div>").join("");
}
function bubblesHtml(game, accounts, reveal = false, selectable = false) {
  const answers = game.roundResult?.answers || game.answers || {};
  return Object.entries(answers).map(([uid, answer], index) => {
    const selected = uid === (game.roundResult?.selectedAnswerUid || game.selectedAnswerUid);
    const action = selectable && answer ? "<button class=\"ghost\" data-false-message-choice=\"" + escapeHtml(uid) + "\">Wybieram tę wiadomość</button>" : "";
    return "<article class=\"false-message-bubble " + (selected ? "is-selected" : "") + "\"><div class=\"false-message-bubble-meta\"><span class=\"false-message-avatar\">" + (reveal ? escapeHtml(nick(accounts, uid).slice(0, 1).toUpperCase()) : "?" ) + "</span><b>" + escapeHtml(reveal ? nick(accounts, uid) : "Wiadomość " + (index + 1)) + "</b></div><p>" + escapeHtml(answer || "Brak wiadomości") + "</p>" + action + "</article>";
  }).join("");
}

export function renderFalseMessageLobbySettings(room, isHost) {
  const s = sanitizeFalseMessageSettings(room.settings), options = [["all", "🎲 Wszystko"], ["embarrassment", "💀 Przypał"], ["school", "🏫 Szkoła"], ["relationships", "❤️ Relacje"], ["games", "🎮 Gry"], ["money", "💰 Pieniądze"], ["party", "🥳 Impreza"], ["internet", "📱 Internet"]];
  const categories = options.map(([value, label]) => "<label class=\"false-message-category\"><input type=\"checkbox\" data-false-message-category=\"" + value + "\" " + (s.categories.includes(value) ? "checked" : "") + " " + (isHost ? "" : "disabled") + ">" + label + "</label>").join("");
  return "<div class=\"false-message-settings\"><label class=\"setting-row\"><span>Liczba rund <small>0 = każdy gracz raz</small></span><select data-false-message-setting=\"rounds\" " + (isHost ? "" : "disabled") + ">"+ [[0, "Każdy gracz raz"], [3, "3"], [5, "5"], [7, "7"], [10, "10"]].map(([value, label]) => "<option value=\"" + value + "\" " + (s.rounds === value ? "selected" : "") + ">" + label + "</option>").join("") + "</select></label><label class=\"setting-row\"><span>Czas na wiadomość</span><select data-false-message-setting=\"answerTime\" " + (isHost ? "" : "disabled") + ">"+ [15, 30, 45, 60, 90].map(value => "<option value=\"" + value + "\" " + (s.answerTime === value ? "selected" : "") + ">" + value + "s</option>").join("") + "</select></label><label class=\"setting-row\"><span>Czas wyboru bohatera</span><select data-false-message-setting=\"voteTime\" " + (isHost ? "" : "disabled") + ">"+ [15, 25, 30, 45, 60].map(value => "<option value=\"" + value + "\" " + (s.voteTime === value ? "selected" : "") + ">" + value + "s</option>").join("") + "</select></label><div class=\"false-message-category-grid\">" + categories + "</div><p class=\"tiny\">Bohater rundy nie odpowiada. Po zebraniu wiadomości wybiera anonimowo tę, która najbardziej do niego pasuje.</p></div>";
}

export function renderFalseMessageGame(root, { room, accounts, currentUser }, actions) {
  const game = room.game, expected = { phase: game.phase, phaseEndsAt: game.phaseEndsAt }, timer = Math.max(0, Math.ceil((Number(game.phaseEndsAt || 0) - Date.now()) / 1000)), hero = nick(accounts, game.heroUid);
  let content = "<p class=\"eyebrow\">FAŁSZYWA WIADOMOŚĆ · RUNDA " + Math.min(game.round, game.totalRounds) + "/" + game.totalRounds + "</p><h1>Co napisze " + escapeHtml(hero) + "?</h1><div class=\"false-message-situation\"><span>BOHATER SYTUACJI</span><strong>" + escapeHtml(hero) + "</strong><p>" + escapeHtml(situationText(game, accounts)) + "</p></div>";
  if (game.phase === "answering") {
    content += currentUser === game.heroUid ? "<div class=\"waiting-state\"><h2>To Twoja runda ✓</h2><p>Nie piszesz wiadomości. Gdy pozostali odpowiedzą, wybierzesz anonimowo tę, która najbardziej do Ciebie pasuje.</p></div>" : currentUser in object(game.answers) ? "<div class=\"waiting-state\"><h2>Wiadomość zapisana ✓</h2><p>Czekamy na pozostałych graczy.</p></div>" : "<form id=\"false-message-answer-form\" class=\"false-message-answer-form\"><label for=\"false-message-answer\">Napisz wiadomość w imieniu bohatera</label><textarea id=\"false-message-answer\" maxlength=\"280\" required placeholder=\"Co " + escapeHtml(hero) + " napisałby teraz?\"></textarea><button class=\"primary\">Wyślij wiadomość</button></form>";
    content += "<p class=\"false-message-timer\">Czas: <b>" + timer + "s</b></p>";
  } else if (game.phase === "selecting") {
    const canChoose = currentUser === game.heroUid;
    content += "<h2>" + (canChoose ? "Wybierz wiadomość, która brzmi najbardziej jak Ty" : escapeHtml(hero) + " wybiera wiadomość") + "</h2><p class=\"muted\">Odpowiedzi są anonimowe. " + (canChoose ? "Kliknij tę, która najbardziej do Ciebie pasuje." : "Poczekaj na wybór bohatera.") + "</p><div class=\"false-message-bubbles\">" + bubblesHtml(game, accounts, false, canChoose) + "</div><p class=\"false-message-timer\">Wybór kończy się za <b>" + timer + "s</b></p>";
  } else if (game.phase === "roundResult") {
    const winner = game.roundResult?.winnerUid;
    content += "<h2>Wiadomość wybrana</h2><div class=\"false-message-bubbles\">" + bubblesHtml(game, accounts, true) + "</div>" + (winner ? "<div class=\"false-message-winner\"><span>🏆 Najbardziej pasowała wiadomość</span><strong>" + escapeHtml(nick(accounts, winner)) + " zdobywa punkt</strong></div>" : "<div class=\"false-message-winner\"><span>Brak wybranej wiadomości</span><strong>Nikt nie zdobywa punktu w tej rundzie.</strong></div>") + "<div class=\"false-message-ranking\">" + rankingHtml(game, accounts) + "</div><button id=\"false-message-next\" class=\"primary\" " + (currentUser === room.hostUid ? "" : "disabled") + ">" + (Number(game.round) >= Number(game.totalRounds) ? "Pokaż podsumowanie" : "Następna runda") + "</button><p class=\"round-advance-notice\">" + (currentUser === room.hostUid ? "Kolejna runda rozpocznie się automatycznie za <b>" + timer + "s</b>." : "Czekamy na hosta. Kolejna runda rozpocznie się automatycznie za <b>" + timer + "s</b>.") + "</p>";
  } else {
    const top = Math.max(0, ...Object.values(game.scores || {}).map(Number)), winners = (game.players || []).filter(uid => Number(game.scores?.[uid] || 0) === top);
    content += "<div class=\"false-message-final\"><span>🏆</span><h2>Koniec gry</h2><p>Najlepsza wiadomość wygrała najwięcej rund.</p><div class=\"false-message-ranking\">" + rankingHtml(game, accounts) + "</div><strong>Zwycięzca: " + winners.map(uid => escapeHtml(nick(accounts, uid))).join(", ") + "</strong></div><button id=\"false-message-lobby\" class=\"primary\">Zagraj ponownie</button>";
  }
  root.innerHTML = "<main class=\"page false-message-page enter\"><section class=\"panel false-message-panel\">" + content + "</section><button id=\"false-message-leave\" class=\"ghost\">Wyjdź z pokoju</button></main>";
  root.querySelector("#false-message-answer-form")?.addEventListener("submit", event => { event.preventDefault(); actions.falseMessageAnswer(root.querySelector("#false-message-answer").value, expected); });
  root.querySelectorAll("[data-false-message-choice]").forEach(button => button.addEventListener("click", () => actions.falseMessageChoose(button.dataset.falseMessageChoice, expected)));
  root.querySelector("#false-message-next")?.addEventListener("click", () => actions.falseMessageNext());
  root.querySelector("#false-message-lobby")?.addEventListener("click", () => actions.returnToRoom());
  root.querySelector("#false-message-leave")?.addEventListener("click", () => actions.leaveRoom());
  if (["answering", "selecting", "roundResult"].includes(game.phase)) renderFalseMessageGame.timer = window.setTimeout(() => { if (["answering", "selecting"].includes(game.phase)) actions.falseMessageTimeout(expected); else if (currentUser === room.hostUid) actions.falseMessageNext(); }, Math.max(100, Number(game.phaseEndsAt || Date.now()) - Date.now() + 50));
}

export function stopFalseMessageTimer() { clearTimeout(renderFalseMessageGame.timer); renderFalseMessageGame.timer = 0; }
