import { escapeHtml } from "./utils.js?v=20260822-1";
import { hasGamePass } from "./gamePasses.js?v=20260901-13";

export const liarDefaults = { rounds: 5, answerTime: 30, discussionTime: 20, voteTime: 25 };

export const liarQuestions = [
  "Ile najdłużej nie spałeś?", "Jaka była najgłupsza rzecz, którą zrobiłeś w szkole?", "Ile najwięcej pieniędzy wydałeś jednego dnia?", "Jaki jest twój największy guilty pleasure?", "Gdzie najdziwniej zdarzyło ci się zasnąć?", "Jaką aplikację usunąłbyś jako pierwszą?", "Jaka była twoja najgorsza wymówka?", "Jaki film możesz oglądać bez końca?", "Jaki posiłek mógłbyś jeść przez cały tydzień?", "Czego najbardziej nie lubiłeś jako dziecko?",
  "Jaka była twoja najbardziej pechowa podróż?", "Jaką rzecz zawsze odkładasz na później?", "Co ostatnio zrobiło na tobie duże wrażenie?", "Jaki talent chciałbyś mieć?", "Który przedmiot szkolny wspominasz najlepiej?", "Jaki był twój najbardziej niezręczny moment?", "Co najczęściej gubisz?", "Jaki zapach najbardziej kojarzy ci się z domem?", "W jakim miejscu mógłbyś spędzić cały dzień?", "Jaki zwyczaj innych ludzi najbardziej cię dziwi?",
  "Jaką rzecz kupiłeś i prawie od razu pożałowałeś?", "Jaki był twój najlepszy spontaniczny pomysł?", "Co robisz, kiedy nikt cię nie obserwuje?", "Jakie danie robisz najlepiej?", "Którą porę dnia lubisz najbardziej?", "Jaki był twój najdziwniejszy sen?", "Co zawsze masz przy sobie?", "Jaki dźwięk najbardziej cię irytuje?", "Jak wyglądałby twój idealny wolny dzień?", "Jaki komplement zapamiętałeś na długo?",
  "Jaką supermoc wybrałbyś dla siebie?", "Gdzie chciałbyś zamieszkać na rok?", "Jaka rzecz z dzieciństwa nadal cię cieszy?", "Której potrawy nie odważyłbyś się spróbować?", "Co najczęściej robisz w telefonie?", "Jaki był twój najdłuższy spacer?", "Co potrafi popsuć ci humor w kilka sekund?", "Jaką piosenkę znasz prawie na pamięć?", "Jaki prezent najbardziej cię zaskoczył?", "Co robisz, kiedy masz za dużo energii?",
  "Jaki był twój najgorszy poranek?", "Jakie zwierzę najbardziej pasuje do twojego charakteru?", "Jaki przedmiot w domu jest dla ciebie najważniejszy?", "Czego nauczyłeś się dopiero jako dorosły?", "Jaką pracę chciałbyś sprawdzić przez jeden dzień?", "Jaki trend najbardziej cię zmęczył?", "Gdzie najchętniej pojechałbyś jutro?", "Jaką rzecz umiesz naprawić?", "Jaki był twój najbardziej udany żart?", "Co robisz, gdy musisz szybko podjąć decyzję?",
  "Jaką cechę najbardziej cenisz u znajomych?", "Jaki był twój najbardziej nietypowy zakup?", "Jak wyglądałaby twoja wymarzona impreza?", "Co najłatwiej wyprowadza cię z równowagi?", "Jaki sport chciałbyś umieć uprawiać?", "Jakie miejsce w twojej okolicy lubisz najbardziej?", "Jaki był twój najbardziej leniwy dzień?", "Co najczęściej jesz między posiłkami?", "Jaką rzecz chciałbyś umieć robić bez nauki?", "Jaki był najdziwniejszy pseudonim, jaki miałeś?",
  "Co robisz jako pierwsze po przebudzeniu?", "Jaki przedmiot zabrałbyś na bezludną wyspę?", "Jakie zachowanie u ludzi od razu zauważasz?", "Jaki był twój najlepszy dzień w ostatnim roku?", "Czego najbardziej nie chciałbyś zapomnieć?", "Jakie miejsce kojarzy ci się z wakacjami?", "Jaki błąd najwięcej cię nauczył?", "Jaką rzecz robisz szybciej niż większość ludzi?", "Jaka była twoja najdziwniejsza rozmowa?", "Co najczęściej poprawia ci humor?",
  "Jaki jest twój najbardziej niepraktyczny talent?", "Co wybrałbyś: tydzień bez telefonu czy tydzień bez słodyczy?", "Jaki typ pogody lubisz najbardziej?", "Którą fikcyjną postać zaprosiłbyś na kolację?", "Jaką rzecz chciałbyś mieć w wersji kieszonkowej?", "Jaka była twoja najbardziej spontaniczna decyzja?", "Co najczęściej robisz przed snem?", "Jaki przedmiot szkolny mógłby zniknąć?", "Jaką rzecz zawsze robisz po swojemu?", "Co według ciebie jest mocno przecenione?",
  "Jaki był twój najdziwniejszy posiłek?", "Jaką umiejętność chciałbyś odziedziczyć po kimś znajomym?", "Co zabrałbyś na długą podróż pociągiem?", "Jaki film lub serial poleciłbyś każdemu?", "Jaki był twój najdłuższy dzień?", "Co robisz, gdy nie możesz zasnąć?", "Jakie miejsce wygląda ciekawiej nocą?", "Jaki zwyczaj chciałbyś wprowadzić w swoim życiu?", "Jaka rzecz najbardziej kojarzy ci się ze szczęściem?", "Które zadanie domowe pamiętasz do dziś?",
  "Jakie małe zwycięstwo ostatnio cię ucieszyło?", "Jaki był twój najdziwniejszy strój?", "Co potrafi cię rozśmieszyć w złym momencie?", "Jaką rzecz chciałbyś dostać bez ograniczeń budżetu?", "Jaki jest twój sposób na nudę?", "Jaki smak najbardziej cię zaskoczył?", "Gdzie najchętniej oglądasz filmy?", "Co robisz, kiedy spóźniasz się na spotkanie?", "Jaką zasadę najczęściej łamiesz?", "Co jest twoim najbardziej charakterystycznym nawykiem?"
];

const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const clamp = (value, min, max, fallback) => Math.max(min, Math.min(max, Number(value) || fallback));
const active = game => (game.players || []).filter(uid => !game.eliminated?.includes(uid));
const deadline = seconds => Date.now() + clamp(seconds, 5, 180, 30) * 1000;
const clean = value => String(value || "").trim().replace(/\s+/g, " ").slice(0, 280);
const nick = (accounts, uid) => accounts?.[uid]?.nick || (String(uid).startsWith("bot:") ? "Bot" : "Gracz");
const shuffle = list => [...list].sort(() => Math.random() - .5);

export function sanitizeLiarSettings(settings = {}) {
  return { rounds: clamp(settings.rounds, 1, 10, 5), answerTime: clamp(settings.answerTime, 15, 120, 30), discussionTime: clamp(settings.discussionTime, 10, 60, 20), voteTime: clamp(settings.voteTime, 10, 90, 25) };
}

function chooseQuestion(game) {
  const used = new Set(game.usedQuestions || []);
  const choices = liarQuestions.map((_, index) => index).filter(index => !used.has(index));
  const index = shuffle(choices.length ? choices : liarQuestions.map((_, item) => item))[0] || 0;
  game.usedQuestions = [...(game.usedQuestions || []), index];
  return liarQuestions[index];
}

function chooseLiar(game) {
  const players = game.players || [], counts = object(game.liarCounts), previous = game.liarUid;
  const minimum = players.length ? Math.min(...players.map(uid => Number(counts[uid] || 0))) : 0;
  let candidates = players.filter(uid => Number(counts[uid] || 0) === minimum);
  if (candidates.length > 1 && previous) candidates = candidates.filter(uid => uid !== previous);
  const liar = shuffle(candidates.length ? candidates : players.filter(uid => uid !== previous))[0] || players[0] || "";
  counts[liar] = Number(counts[liar] || 0) + 1;
  game.liarCounts = counts;
  game.liarHistory = [...(game.liarHistory || []), liar];
  return liar;
}

export function createLiarGame(players, settings = {}) {
  const s = sanitizeLiarSettings(settings);
  const game = { mode: "klamca", phase: "answering", round: 1, totalRounds: s.rounds, players: [...players], question: "", liarUid: "", liarCounts: Object.fromEntries(players.map(uid => [uid, 0])), liarHistory: [], usedQuestions: [], answers: {}, votes: {}, scores: Object.fromEntries(players.map(uid => [uid, 0])), creativeEdits: {}, passUses: {}, roundResult: null, finished: false, phaseEndsAt: deadline(s.answerTime) };
  game.question = chooseQuestion(game); game.liarUid = chooseLiar(game); return game;
}

function enterDiscussion(game, settings) { game.phase = "discussion"; game.phaseEndsAt = deadline(settings.discussionTime); }
function enterVoting(game, settings) { game.phase = "voting"; game.votes = {}; game.phaseEndsAt = deadline(settings.voteTime); }

function resolveVoting(game) {
  const answers = object(game.answers), votes = object(game.votes), voteCounts = {};
  Object.values(votes).forEach(target => { if (target && target in answers) voteCounts[target] = Number(voteCounts[target] || 0) + 1; });
  const otherPlayers = active(game).filter(uid => uid !== game.liarUid);
  const correctVoters = otherPlayers.filter(uid => votes[uid] === game.liarUid);
  const liarCaught = correctVoters.length > otherPlayers.length - correctVoters.length;
  game.scores = object(game.scores);
  correctVoters.forEach(uid => { game.scores[uid] = Number(game.scores[uid] || 0) + 1; });
  if (!liarCaught && game.liarUid) game.scores[game.liarUid] = Number(game.scores[game.liarUid] || 0) + 2;
  game.roundResult = { round: game.round, question: game.question, answers: { ...answers }, votes: { ...votes }, voteCounts, liarUid: game.liarUid, correctVoters, liarCaught, liarPoints: liarCaught ? 0 : 2 };
  game.phase = "roundResult"; game.phaseEndsAt = Date.now() + 10000;
}

export const LiarEngine = {
  editAnswer(game, uid, text) {
    if (game.phase !== "answering") return "Odpowiedź może być poprawiona tylko przed końcem rundy.";
    if (!(uid in object(game.answers))) return "Najpierw zapisz odpowiedź.";
    if (game.passUses?.[uid]?.["creative-license"]) return "Licencja kreatywności została już użyta w tej grze.";
    const answer = clean(text);
    if (answer.length < 2) return "Napisz krótką odpowiedź.";
    game.answers[uid] = answer;
    game.passUses = { ...(game.passUses || {}), [uid]: { ...(game.passUses?.[uid] || {}), "creative-license": true } };
    game.creativeEdits = { ...(game.creativeEdits || {}), [uid]:true };
    return null;
  },
  answer(game, uid, text, settings = {}) {
    if (game.phase !== "answering") return "Czas na odpowiedzi już minął.";
    if (!active(game).includes(uid)) return "Nie bierzesz udziału w tej rundzie.";
    if (uid in object(game.answers)) return "Twoja odpowiedź jest już zapisana.";
    const answer = clean(text);
    if (answer.length < 2) return "Napisz krótką odpowiedź.";
    game.answers = object(game.answers); game.answers[uid] = answer;
    if (active(game).every(player => player in game.answers)) enterDiscussion(game, sanitizeLiarSettings(settings));
  },
  startVoting(game, settings = {}) { if (game.phase !== "discussion") return "Dyskusja jeszcze się nie skończyła."; enterVoting(game, sanitizeLiarSettings(settings)); },
  vote(game, uid, target) {
    if (game.phase !== "voting") return "Głosowanie jest już zakończone.";
    if (!active(game).includes(uid)) return "Nie bierzesz udziału w tej rundzie.";
    if (!target || target === uid || !(target in object(game.answers))) return "Nie możesz głosować na siebie ani na brakującą odpowiedź.";
    game.votes = object(game.votes);
    if (uid in game.votes) return "Twój głos został już zapisany.";
    game.votes[uid] = target;
    if (active(game).every(player => player in game.votes)) resolveVoting(game);
  },
  timeout(game, settings = {}) {
    if (game.phase === "answering") { game.answers = object(game.answers); active(game).forEach(uid => { if (!(uid in game.answers)) game.answers[uid] = ""; }); enterDiscussion(game, sanitizeLiarSettings(settings)); }
    else if (game.phase === "discussion") enterVoting(game, sanitizeLiarSettings(settings));
    else if (game.phase === "voting") { game.votes = object(game.votes); resolveVoting(game); }
  },
  nextRound(game, settings = {}) {
    const s = sanitizeLiarSettings(settings);
    if (game.phase !== "roundResult") return "Wynik rundy nie jest jeszcze gotowy.";
    if (Number(game.round) >= Number(game.totalRounds || s.rounds)) { game.phase = "gameSummary"; game.finished = true; game.phaseEndsAt = null; return; }
    game.round += 1; game.question = chooseQuestion(game); game.liarUid = chooseLiar(game); game.answers = {}; game.votes = {}; game.creativeEdits = {}; game.roundResult = null; game.phase = "answering"; game.phaseEndsAt = deadline(s.answerTime);
  },
  botAnswer(game, uid) {
    const truthful = ["Raczej coś prostego, co poprawia mi humor.", "Chyba wybrałbym coś spontanicznego i trochę głupiego.", "Najbardziej pasuje do mnie odpowiedź związana z muzyką.", "Pewnie zależałoby to od dnia, ale mam jedno skojarzenie.", "To byłoby coś, o czym znajomi raczej by się nie zdziwili."];
    const lies = ["Nigdy mi się to nie zdarzyło, ale brzmi jak coś, co mógłbym zrobić.", "Powiedziałbym, że bardzo nietypowo, choć brzmi to całkiem wiarygodnie.", "Mam tu dość zaskakującą historię, ale zachowam szczegóły dla siebie.", "Zdecydowanie odpowiedź, której nikt by po mnie nie oczekiwał.", "To zależy od sytuacji, ale moja pierwsza myśl jest dość dziwna."];
    const pool = uid === game.liarUid ? lies : truthful; return pool[Math.floor(Math.random() * pool.length)];
  }
};

function rankingHtml(game, accounts) {
  return [...(game.players || [])].sort((a, b) => Number(game.scores?.[b] || 0) - Number(game.scores?.[a] || 0)).map((uid, index) => "<div class=\"liar-ranking-row\"><span>" + (index + 1) + ". " + escapeHtml(nick(accounts, uid)) + "</span><b>" + Number(game.scores?.[uid] || 0) + " pkt</b></div>").join("");
}

function answersHtml(game, accounts, currentUser, reveal = false) {
  const answers = game.roundResult?.answers || game.answers || {};
  return Object.entries(answers).map(([uid, answer], index) => {
    const votes = Number(game.roundResult?.voteCounts?.[uid] || 0);
    const label = reveal || game.phase === "discussion" ? nick(accounts, uid) : "Odpowiedź " + (index + 1);
    const button = game.phase === "voting" ? "<button class=\"ghost\" data-liar-vote=\"" + escapeHtml(uid) + "\" " + (uid === currentUser || !answer || currentUser in object(game.votes) ? "disabled" : "") + ">Podejrzewam tę osobę</button>" : "";
    return "<article class=\"liar-answer-card\"><div class=\"liar-answer-head\"><b>" + escapeHtml(label) + "</b>" + (reveal ? "<span>" + votes + " " + (votes === 1 ? "głos" : "głosów") + "</span>" : "") + "</div><p>" + escapeHtml(answer || "Brak odpowiedzi") + "</p>" + button + "</article>";
  }).join("");
}

export function renderLiarLobbySettings(room, isHost) {
  const s = sanitizeLiarSettings(room.settings);
  const select = (key, label, values, suffix = "") => "<label class=\"setting-row\"><span>" + label + "</span><select data-liar-setting=\"" + key + "\" " + (isHost ? "" : "disabled") + ">" + values.map(value => "<option value=\"" + value + "\" " + (s[key] === value ? "selected" : "") + ">" + value + suffix + "</option>").join("") + "</select></label>";
  return "<div class=\"liar-settings\">" + select("rounds", "Liczba rund", [1, 3, 5, 7, 10]) + select("answerTime", "Czas na odpowiedź", [15, 30, 45, 60, 90], "s") + select("discussionTime", "Czas dyskusji", [10, 20, 30, 45], "s") + select("voteTime", "Czas głosowania", [15, 25, 30, 45, 60], "s") + "<p class=\"tiny\">Najpierw wszyscy odpowiadają, potem czytacie odpowiedzi i głosujecie, kto kłamie.</p></div>";
}

export function renderLiarGame(root, { room, accounts, currentUser }, actions) {
  const game = room.game, expected = { phase: game.phase, phaseEndsAt: game.phaseEndsAt }, timer = Math.max(0, Math.ceil((Number(game.phaseEndsAt || 0) - Date.now()) / 1000));
  let content = "<p class=\"eyebrow\">KŁAMCA · RUNDA " + Math.min(game.round, game.totalRounds) + "/" + game.totalRounds + "</p><h1>Znajdźcie osobę, która kłamie</h1><div class=\"liar-question\"><span>Wszyscy odpowiadają na pytanie</span><strong>" + escapeHtml(game.question || "—") + "</strong></div>";
  if (game.phase === "answering") {
    const isLiar = currentUser === game.liarUid, instruction = isLiar ? "<strong class=\"liar-role liar-secret\">JESTEŚ KŁAMCĄ 🎭</strong><p>Odpowiedz na pytanie, ale skłam tak, żeby inni ci uwierzyli.</p>" : "<strong class=\"liar-role\">ODPOWIEDZ SZCZERZE</strong><p>Podaj swoją prawdziwą odpowiedź — jedna osoba próbuje was oszukać.</p>";
    content += "<div class=\"liar-instruction\">" + instruction + "</div>";
    content += currentUser in object(game.answers) ? `<div class="waiting-state"><h2>Odpowiedź zapisana ✓</h2><p>Czekamy na pozostałych graczy.</p>${hasGamePass(accounts?.[currentUser], "creative-license") && !game.passUses?.[currentUser]?.["creative-license"] ? `<form id="liar-edit-form" class="creative-edit-form"><textarea id="liar-edit" maxlength="280" placeholder="Możesz poprawić własną odpowiedź"></textarea><button class="ghost">Popraw odpowiedź za darmo</button></form>` : ""}</div>` : "<form id=\"liar-answer-form\" class=\"liar-answer-form\"><textarea id=\"liar-answer\" maxlength=\"280\" required placeholder=\"Wpisz swoją odpowiedź...\"></textarea><button class=\"primary\">Wyślij odpowiedź</button></form>";
    content += "<p class=\"liar-timer\">Czas: <b>" + timer + "s</b></p>";
  } else if (game.phase === "discussion") {
    content += "<h2>Przeczytajcie odpowiedzi</h2><p class=\"muted\">Odpowiedzi są już podpisane nickami. Zastanówcie się, kto mógł nie mówić prawdy.</p><div class=\"liar-answers\">" + answersHtml(game, accounts, currentUser) + "</div>" + (currentUser === room.hostUid ? "<button id=\"liar-start-voting\" class=\"primary\">Przejdź do głosowania</button>" : "<p class=\"waiting-state\">Czekamy na hosta — głosowanie rozpocznie się automatycznie za <b>" + timer + "s</b>.</p>") + "<p class=\"liar-timer\">Dyskusja: <b>" + timer + "s</b></p>";
  } else if (game.phase === "voting") {
    content += "<h2>Kto jest Kłamcą?</h2><p class=\"muted\">Wybierz jedną osobę. Nie możesz głosować na siebie.</p><div class=\"liar-answers\">" + answersHtml(game, accounts, currentUser) + "</div>" + (currentUser in object(game.votes) ? "<div class=\"waiting-state\"><h2>Głos zapisany ✓</h2><p>Czekamy na pozostałych graczy.</p></div>" : "") + "<p class=\"liar-timer\">Głosowanie kończy się za <b>" + timer + "s</b></p>";
  } else if (game.phase === "roundResult") {
    const liar = game.roundResult?.liarUid || game.liarUid;
    content += "<h2>Wyniki głosowania</h2><div class=\"liar-answers\">" + answersHtml(game, accounts, currentUser, true) + "</div><div class=\"liar-reveal\"><span>KŁAMCĄ BYŁ...</span><strong>🎭 " + escapeHtml(nick(accounts, liar)) + "</strong><p>Jego fałszywa odpowiedź: „" + escapeHtml(game.roundResult?.answers?.[liar] || "Brak odpowiedzi") + "”</p><b>" + (game.roundResult?.liarCaught ? "Większość go wykryła." : "Kłamca przechytrzył większość i zdobywa 2 pkt.") + "</b></div><div class=\"liar-ranking\">" + rankingHtml(game, accounts) + "</div><button id=\"liar-next\" class=\"primary\"" + (currentUser === room.hostUid ? "" : " disabled") + ">" + (Number(game.round) >= Number(game.totalRounds) ? "Pokaż podsumowanie" : "Następna runda") + "</button><p class=\"round-advance-notice\">" + (currentUser === room.hostUid ? "Kolejna runda rozpocznie się automatycznie za <b>" + timer + "s</b>." : "Czekamy na hosta. Kolejna runda rozpocznie się automatycznie za <b>" + timer + "s</b>.") + "</p>";
  } else {
    const top = Math.max(0, ...Object.values(game.scores || {}).map(Number)), winners = (game.players || []).filter(uid => Number(game.scores?.[uid] || 0) === top);
    content += "<div class=\"liar-final\"><span>🏆</span><h2>Koniec gry</h2><p>Najlepszy blef i najlepsze śledztwo zostały rozstrzygnięte.</p><div class=\"liar-ranking\">" + rankingHtml(game, accounts) + "</div><p class=\"liar-winner\">Zwycięzca: " + winners.map(uid => escapeHtml(nick(accounts, uid))).join(", ") + "</p></div><button id=\"liar-lobby\" class=\"primary\">Zagraj ponownie</button>";
  }
  root.innerHTML = "<main class=\"page liar-page enter\"><section class=\"panel liar-panel\">" + content + "</section><button id=\"liar-leave\" class=\"ghost\">Wyjdź z pokoju</button></main>";
  root.querySelector("#liar-answer-form")?.addEventListener("submit", event => { event.preventDefault(); actions.liarAnswer(root.querySelector("#liar-answer").value, expected); });
  root.querySelector("#liar-edit-form")?.addEventListener("submit", event => { event.preventDefault(); actions.liarEditAnswer(root.querySelector("#liar-edit").value, expected); });
  root.querySelectorAll("[data-liar-vote]").forEach(button => button.addEventListener("click", () => actions.liarVote(button.dataset.liarVote, expected)));
  root.querySelector("#liar-start-voting")?.addEventListener("click", () => actions.liarStartVoting(expected));
  root.querySelector("#liar-next")?.addEventListener("click", () => actions.liarNext());
  root.querySelector("#liar-lobby")?.addEventListener("click", () => actions.returnToRoom());
  root.querySelector("#liar-leave")?.addEventListener("click", () => actions.leaveRoom());
  if (["answering", "discussion", "voting", "roundResult"].includes(game.phase)) renderLiarGame.timer = window.setTimeout(() => { if (["answering", "discussion", "voting"].includes(game.phase)) actions.liarTimeout(expected); else if (currentUser === room.hostUid) actions.liarNext(); }, Math.max(100, Number(game.phaseEndsAt || Date.now()) - Date.now() + 50));
}

export function stopLiarTimer() { clearTimeout(renderLiarGame.timer); renderLiarGame.timer = 0; }
