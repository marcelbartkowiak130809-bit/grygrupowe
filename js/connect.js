import { escapeHtml, resultPlayerMiniHtml } from "./utils.js?v=20260903-7";
import { hasGamePass } from "./gamePasses.js?v=20260901-13";

export const connectDefaults = { rounds: 5, answerTime: 30, category: "random" };

const pairPacks = {
  easy: [
    ["Minecraft", "McDonald's"], ["kot", "samochód"], ["szkoła", "więzienie"], ["TikTok", "babcia"],
    ["wakacje", "matematyka"], ["Shrek", "siłownia"], ["pizza", "kosmos"], ["deszcz", "parasol"],
    ["telefon", "lodówka"], ["pies", "policjant"], ["morze", "czekolada"], ["rower", "wiatr"],
    ["film", "popcorn"], ["pociąg", "poniedziałek"], ["kawa", "poranek"], ["książka", "sen"],
    ["basen", "ręcznik"], ["lotnisko", "walizka"], ["las", "cisza"], ["deskorolka", "gips"],
    ["komputer", "spóźnienie"], ["kanapka", "plecak"], ["lody", "słońce"], ["muzyka", "słuchawki"],
    ["kino", "randka"], ["mapa", "zgubienie"], ["kuchnia", "eksperyment"], ["namiot", "komary"],
    ["królik", "kapelusz"], ["długopis", "egzamin"]
  ],
  weird: [
    ["dinozaur", "bankomat"], ["rekin", "przedszkole"], ["wampir", "dentysta"], ["kaczka", "prezydent"],
    ["księżyc", "ziemniak"], ["robot", "rosół"], ["smok", "paragon"], ["pingwin", "sauna"],
    ["duch", "windy"], ["jednorożec", "podatki"], ["pirat", "GPS"], ["słoń", "szpilka"],
    ["czarodziej", "mikrofala"], ["małpa", "krawat"], ["wulkan", "lody"], ["kosmita", "Biedronka"],
    ["zombie", "dentysta"], ["kapibara", "drukarka"], ["mumia", "pralka"], ["krab", "fortepian"],
    ["wieloryb", "rower miejski"], ["nietoperz", "biblioteka"], ["kot", "formularz PIT"], ["rycerz", "pizza"],
    ["tęcza", "pralka"], ["bałwan", "klimatyzacja"], ["kaktus", "parasolka"], ["ninja", "kolejka"],
    ["foka", "mikrofon"], ["koza", "internet"]
  ],
  hard: [
    ["demokracja", "grzyby"], ["nostalgia", "pusty peron"], ["grawitacja", "plotka"], ["czas", "kolejka"],
    ["wolność", "walizka"], ["przypadek", "szachy"], ["pamięć", "zapach"], ["ryzyko", "parasol"],
    ["cierpliwość", "mikrofala"], ["ambicja", "winda"], ["tajemnica", "lodówka"], ["odwaga", "telefon"],
    ["sprawiedliwość", "pizza"], ["sztuka", "remont"], ["technologia", "cisza"], ["przyjaźń", "deszcz"],
    ["szczęście", "zgubione klucze"], ["prawda", "lustro"], ["wyobraźnia", "kalendarz"], ["rutyna", "huragan"],
    ["nauka", "sen"], ["chaos", "bibliotekarz"], ["przyszłość", "stary sweter"], ["dzieciństwo", "hasło"],
    ["sukces", "pusty portfel"], ["spokój", "powiadomienie"], ["odpowiedzialność", "pilot do telewizora"], ["wstyd", "karaoke"],
    ["nadzieja", "korek"], ["logika", "mem"]
  ],
  random: [
    ["Minecraft", "babcia"], ["McDonald's", "deszcz"], ["Shrek", "podatek"], ["TikTok", "biblioteka"],
    ["futbol", "księżyc"], ["szkoła", "kosmos"], ["hotel", "dinozaur"], ["telefon", "smok"],
    ["kawa", "wulkan"], ["Netflix", "kaktus"], ["pociąg", "czarodziej"], ["wakacje", "bankomat"],
    ["pizza", "ninja"], ["kot", "egzamin"], ["samochód", "sen"], ["morze", "drukarka"],
    ["siłownia", "pingwin"], ["lotnisko", "duch"], ["słuchawki", "rycerz"], ["rower", "tęcza"],
    ["zakupy", "robot"], ["koncert", "formularz"], ["las", "internet"], ["lody", "praca"],
    ["mapa", "kapibara"], ["kanapa", "przygoda"], ["parasol", "superbohater"], ["film", "pustynia"],
    ["plecak", "tajemnica"], ["poniedziałek", "słoń"]
  ]
};
const allPairs = [...pairPacks.easy, ...pairPacks.weird, ...pairPacks.hard];
const clamp = (value, min, max, fallback) => Math.max(min, Math.min(max, Number(value) || fallback));
const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const active = game => (game.players || []).filter(uid => !game.eliminated?.includes(uid));
const deadline = seconds => Date.now() + clamp(seconds, 10, 120, 30) * 1000;
const pairKey = pair => pair.map(item => String(item).toLocaleLowerCase("pl-PL")).join("|" );
const cleanText = value => String(value || "").trim().slice(0, 240);
const validText = value => { const text = cleanText(value); return text.length >= 2 && text.length <= 240; };
const nick = (accounts, uid) => accounts?.[uid]?.nick || (String(uid).startsWith("bot:") ? "Bot" : "Gracz");
const shuffled = list => [...list].sort(() => Math.random() - .5);

export function sanitizeConnectSettings(settings = {}) {
  return { rounds: clamp(settings.rounds, 1, 10, 5), answerTime: clamp(settings.answerTime, 15, 90, 30), category: ["easy", "weird", "hard", "random"].includes(settings.category) ? settings.category : "random" };
}

function pickPair(game, settings) {
  const requested = settings.category === "random" ? allPairs : pairPacks[settings.category];
  const used = new Set(game.usedPairs || []);
  const available = requested.filter(pair => !used.has(pairKey(pair)));
  const pair = shuffled(available.length ? available : requested)[0] || ["kot", "samochód"];
  game.usedPairs = [...(game.usedPairs || []), pairKey(pair)];
  return pair;
}

export function createConnectGame(players, settings = {}) {
  const s = sanitizeConnectSettings(settings);
  const game = { mode: "polacz-nas", phase: "answering", round: 1, totalRounds: s.rounds, players: [...players], pair: [], category: s.category, answers: {}, votes: {}, scores: Object.fromEntries(players.map(uid => [uid, 0])), usedPairs: [], creativeEdits: {}, passUses: {}, roundResult: null, finished: false, phaseEndsAt: deadline(s.answerTime) };
  game.pair = pickPair(game, s);
  return game;
}

function enterVoting(game) {
  game.phase = "voting";
  game.votes = {};
  game.phaseEndsAt = deadline(30);
}

function resolveVoting(game) {
  const answers = object(game.answers), votes = object(game.votes), counts = {};
  game.scores = object(game.scores);
  Object.values(votes).forEach(uid => { if (uid && uid in answers) counts[uid] = (counts[uid] || 0) + 1; });
  const max = Math.max(0, ...Object.values(counts).map(Number));
  const winners = max > 0 ? Object.keys(counts).filter(uid => Number(counts[uid]) === max) : [];
  winners.forEach(uid => { game.scores[uid] = Number(game.scores[uid] || 0) + 1; });
  game.roundResult = { round: game.round, pair: [...game.pair], answers: { ...answers }, votes: { ...votes }, voteCounts: counts, winners };
  game.phase = "roundResult";
  game.phaseEndsAt = Date.now() + 10000;
}

export const ConnectEngine = {
  editAnswer(game, uid, text) {
    if (game.phase !== "answering") return "Odpowiedź może być poprawiona tylko przed końcem rundy.";
    if (!(uid in object(game.answers))) return "Najpierw zapisz odpowiedź.";
    if (game.passUses?.[uid]?.["creative-license"]) return "Licencja kreatywności została już użyta w tej grze.";
    if (!validText(text)) return "Napisz krótkie wyjaśnienie (2–240 znaków).";
    game.answers[uid] = cleanText(text);
    game.passUses = { ...(game.passUses || {}), [uid]: { ...(game.passUses?.[uid] || {}), "creative-license": true } };
    game.creativeEdits = { ...(game.creativeEdits || {}), [uid]:true };
    return null;
  },
  answer(game, uid, text) {
    if (game.phase !== "answering") return "Czas na odpowiedzi już minął.";
    if (!active(game).includes(uid)) return "Nie bierzesz już udziału w tej rundzie.";
    game.answers = object(game.answers);
    if (uid in game.answers) return "Twoja odpowiedź jest już zapisana.";
    if (!validText(text)) return "Napisz krótkie wyjaśnienie (2–240 znaków).";
    game.answers[uid] = cleanText(text);
    if (active(game).every(player => player in game.answers)) enterVoting(game);
  },
  vote(game, uid, target) {
    if (game.phase !== "voting") return "Głosowanie jest już zakończone.";
    if (!active(game).includes(uid)) return "Nie bierzesz już udziału w tej rundzie.";
    if (!target || target === uid || !(target in object(game.answers))) return "Nie możesz głosować na tę odpowiedź.";
    game.votes = object(game.votes);
    if (uid in game.votes) return "Twój głos został już zapisany.";
    game.votes[uid] = target;
    if (active(game).every(player => player in game.votes)) resolveVoting(game);
  },
  timeout(game) {
    if (game.phase === "answering") {
      game.answers = object(game.answers);
      active(game).forEach(uid => { if (!(uid in game.answers)) game.answers[uid] = ""; });
      enterVoting(game);
    } else if (game.phase === "voting") resolveVoting(game);
  },
  nextRound(game, settings = {}) {
    if (game.phase !== "roundResult") return "Wynik rundy nie jest jeszcze gotowy.";
    if (Number(game.round) >= Number(game.totalRounds || settings.rounds || 5)) { game.phase = "gameSummary"; game.finished = true; game.phaseEndsAt = null; return; }
    const nextSettings = sanitizeConnectSettings(settings); game.round += 1; game.pair = pickPair(game, nextSettings); game.answers = {}; game.votes = {}; game.creativeEdits = {}; game.roundResult = null; game.phase = "answering"; game.phaseEndsAt = deadline(nextSettings.answerTime);
  },
  botAnswer(game, uid) {
    const [left, right] = game.pair || [];
    const options = [`Obie rzeczy łączy to, że wywołują dużo emocji.`, `${left} i ${right} pasują do siebie, bo można je spotkać w dobrej historii.`, `Jedno i drugie potrafi być częścią bardzo dziwnego dnia.`, `Łączy je skojarzenie z ludźmi, którzy lubią próbować nowych rzeczy.`];
    return options[Math.floor(Math.random() * options.length)];
  }
};

function rankingHtml(game, accounts, winners = []) {
  const winnerSet = new Set(winners);
  return [...(game.players || [])].sort((a, b) => Number(game.scores?.[b] || 0) - Number(game.scores?.[a] || 0)).map((uid, index) => `<div class="connect-ranking-row"><span>${index + 1}.</span>${resultPlayerMiniHtml(accounts[uid], winnerSet.has(uid) ? "win" : "lose")}<b>${Number(game.scores?.[uid] || 0)} pkt</b></div>`).join("");
}

function answerCards(game, accounts, currentUser, reveal = false) {
  return Object.entries(game.answers || {}).map(([uid, text], index) => {
    const votes = Number(game.roundResult?.voteCounts?.[uid] || 0);
    return `<article class="connect-answer-card"><div class="connect-answer-label">${reveal ? escapeHtml(nick(accounts, uid)) : `Odpowiedź ${index + 1}`}</div><p>${escapeHtml(text || "Brak odpowiedzi")}</p>${reveal ? `<b class="connect-votes">${votes} ${votes === 1 ? "głos" : "głosów"}</b>` : `<button class="ghost" data-connect-vote="${escapeHtml(uid)}" ${uid === currentUser || !text ? "disabled" : ""}>Głosuję na tę odpowiedź</button>`}</article>`;
  }).join("");
}

export function renderConnectLobbySettings(room, isHost) {
  const s = sanitizeConnectSettings(room.settings);
  return `<div class="connect-settings"><label class="setting-row"><span>Liczba rund</span><select data-connect-setting="rounds" ${isHost ? "" : "disabled"}>${[1, 3, 5, 7, 10].map(value => `<option value="${value}" ${s.rounds === value ? "selected" : ""}>${value}</option>`).join("")}</select></label><label class="setting-row"><span>Czas na odpowiedź</span><select data-connect-setting="answerTime" ${isHost ? "" : "disabled"}>${[15, 30, 45, 60, 90].map(value => `<option value="${value}" ${s.answerTime === value ? "selected" : ""}>${value}s</option>`).join("")}</select></label><label class="setting-row"><span>Rodzaj par</span><select data-connect-setting="category" ${isHost ? "" : "disabled"}><option value="random" ${s.category === "random" ? "selected" : ""}>Totalnie losowe</option><option value="easy" ${s.category === "easy" ? "selected" : ""}>Łatwe</option><option value="weird" ${s.category === "weird" ? "selected" : ""}>Dziwne</option><option value="hard" ${s.category === "hard" ? "selected" : ""}>Trudne</option></select></label><p class="tiny">Najpierw każdy pisze własne połączenie, potem głosujecie anonimowo na najlepszą odpowiedź. Nie można głosować na siebie.</p></div>`;
}

export function renderConnectGame(root, { room, accounts, currentUser }, actions) {
  const game = room.game;
  const expected = { phase: game.phase, phaseEndsAt: game.phaseEndsAt };
  const timer = Math.max(0, Math.ceil((Number(game.phaseEndsAt || 0) - Date.now()) / 1000));
  let content = `<p class="eyebrow">POŁĄCZ NAS · RUNDA ${Math.min(game.round, game.totalRounds)}/${game.totalRounds}</p><h1>Co łączy te dwie rzeczy?</h1><div class="connect-pair"><span>${escapeHtml(game.pair?.[0] || "—")}</span><b>＋</b><span>${escapeHtml(game.pair?.[1] || "—")}</span></div>`;
  if (game.phase === "answering") content += currentUser in (game.answers || {}) ? `<div class="waiting-state"><h2>Odpowiedź zapisana ✓</h2><p>Czekamy na pozostałych graczy.</p>${hasGamePass(accounts?.[currentUser], "creative-license") && !game.passUses?.[currentUser]?.["creative-license"] ? `<form id="connect-edit-form" class="creative-edit-form"><textarea id="connect-edit" maxlength="240" placeholder="Możesz jeszcze poprawić własne połączenie"></textarea><button class="ghost">Popraw odpowiedź za darmo</button></form>` : ""}</div>` : `<form id="connect-answer-form" class="connect-answer-form"><label for="connect-answer">Co je łączy?</label><textarea id="connect-answer" maxlength="240" required placeholder="Wymyśl logiczne albo zabawne połączenie..."></textarea><button class="primary">Wyślij odpowiedź</button></form><p class="connect-timer">Czas: <b>${timer}s</b></p><p class="muted">Odpowiedzi są ukryte do końca tej fazy.</p>`;
  else if (game.phase === "voting") content += `<h2>Wybierz najlepsze połączenie</h2><p class="muted">Odpowiedzi są anonimowe. Nie możesz głosować na siebie.</p><div class="connect-answers">${answerCards(game, accounts, currentUser)}</div><p class="connect-timer">Głosowanie kończy się za <b>${timer}s</b></p>`;
  else if (game.phase === "roundResult") { const winners = game.roundResult?.winners || []; content += `<h2>Wynik rundy</h2><div class="connect-answers">${answerCards(game, accounts, currentUser, true)}</div><p class="connect-winner">${winners.length ? `🏆 Wygrywa: ${winners.map(uid => escapeHtml(nick(accounts, uid))).join(", ")}` : "Nikt nie zdobył punktu."}</p><div class="connect-ranking">${rankingHtml(game, accounts, winners)}</div><button id="connect-next" class="primary">${Number(game.round) >= Number(game.totalRounds) ? "Pokaż podsumowanie" : "Następna runda"}</button><p class="round-advance-notice">${currentUser === room.hostUid ? `Podsumowanie pojawi się automatycznie za <b>${timer}s</b>.` : `Czekamy na hosta. Następna runda rozpocznie się automatycznie za <b>${timer}s</b>.`}</p>`; }
  else { const top = Math.max(...Object.values(game.scores || {}).map(Number), 0); const winners = top > 0 ? (game.players || []).filter(uid => Number(game.scores?.[uid] || 0) === top) : []; content += `<div class="connect-final"><span>🏆</span><h2>Koniec gry</h2><p>Najlepsze połączenia wygrywają rundy. Dzięki za grę!</p><div class="connect-ranking">${rankingHtml(game, accounts, winners)}</div><p class="connect-winner">Zwycięzca: ${winners.map(uid => escapeHtml(nick(accounts, uid))).join(", ") || "brak"}</p></div><button id="connect-lobby" class="primary">Zagraj ponownie</button>`; }
  root.innerHTML = `<main class="page connect-page enter"><section class="panel connect-panel">${content}</section><button id="connect-leave" class="ghost">Wyjdź z pokoju</button></main>`;
  root.querySelector("#connect-answer-form")?.addEventListener("submit", event => { event.preventDefault(); actions.connectAnswer(root.querySelector("#connect-answer").value, expected); });
  root.querySelector("#connect-edit-form")?.addEventListener("submit", event => { event.preventDefault(); actions.connectEditAnswer(root.querySelector("#connect-edit").value, expected); });
  root.querySelectorAll("[data-connect-vote]").forEach(button => button.addEventListener("click", () => actions.connectVote(button.dataset.connectVote, expected)));
  root.querySelector("#connect-next")?.addEventListener("click", () => actions.connectNext());
  root.querySelector("#connect-lobby")?.addEventListener("click", () => actions.returnToRoom());
  root.querySelector("#connect-leave")?.addEventListener("click", () => actions.leaveRoom());
  if (["answering", "voting", "roundResult"].includes(game.phase)) renderConnectGame.timer = window.setTimeout(() => { if (game.phase === "answering" || game.phase === "voting") actions.connectTimeout(expected); else if (currentUser === room.hostUid) actions.connectNext(); }, Math.max(100, Number(game.phaseEndsAt || Date.now()) - Date.now() + 50));
}

export function stopConnectTimer() { clearTimeout(renderConnectGame.timer); renderConnectGame.timer = 0; }
