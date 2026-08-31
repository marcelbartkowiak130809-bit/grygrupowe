import { escapeHtml } from "./utils.js?v=20260822-1";
import { hasGamePass } from "./gamePasses.js?v=20260831-5";

export const secretRuleDefaults = {
  category: "random",
  ruleTime: 60,
  reviewTime: 20,
  guessTime: 30,
  guessMode: "interval",
  guessInterval: 3,
};

export const secretRuleCategories = [
  "Piosenkarze", "Zespoły muzyczne", "Raperzy", "Piosenki", "Instrumenty", "Gatunki muzyczne", "Aktorzy", "Reżyserzy", "Filmy", "Seriale",
  "Postacie filmowe", "Postacie serialowe", "Anime", "Postacie anime", "Gry komputerowe", "Gry planszowe", "Konsole", "Bohaterowie gier", "Zwierzęta", "Psy",
  "Koty", "Ptaki", "Morskie zwierzęta", "Owady", "Dinozaury", "Kraje", "Stolice", "Miasta", "Wyspy", "Rzeki",
  "Góry", "Zabytki", "Języki", "Zawody", "Przedmioty szkolne", "Przedmioty domowe", "Urządzenia", "Aplikacje", "Strony internetowe", "Media społecznościowe",
  "Marki", "Samochody", "Motocykle", "Pojazdy", "Sporty", "Piłkarze", "Drużyny sportowe", "Sportowcy", "Turnieje", "Jedzenie",
  "Owoce", "Warzywa", "Napoje", "Fast food", "Słodycze", "Kuchnie świata", "Przyprawy", "Ubrania", "Buty", "Akcesoria",
  "Kolory", "Kształty", "Liczby", "Pory dnia", "Pory roku", "Święta", "Wydarzenia", "Rzeczy w plecaku", "Rzeczy w lodówce", "Rzeczy w łazience",
  "Rzeczy na biurku", "Rzeczy na imprezie", "Rzeczy na wakacjach", "Hobby", "Czynności", "Emocje", "Cechy charakteru", "Miejsca randki", "Sposoby podróży", "Gatunki książek",
  "Książki", "Komiksy", "Superbohaterowie", "Złoczyńcy", "Fikcyjne krainy", "Mityczne stworzenia", "Wynalazki", "Nauki", "Planety", "Kosmos",
  "Żywioły", "Materiały", "Narzędzia", "Rzeczy, które hałasują", "Rzeczy okrągłe", "Rzeczy czerwone", "Rzeczy znalezione w szkole", "Rzeczy zakazane", "Memy", "Słowa na literę A",
  "Rzeczy drogie", "Rzeczy tanie", "Rzeczy, które można zgubić", "Rzeczy, które robi się rano", "Miejsca w mieście", "Sklepy", "Przekąski", "Naprawy", "Pogoda", "Rzeczy z dzieciństwa",
];

const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const cleanPlayers = players => [...new Set(Array.isArray(players) ? players : [])].slice(0, 2);
const clamp = (value, min, max, fallback) => Math.max(min, Math.min(max, Number(value) || fallback));
const deadline = seconds => Date.now() + clamp(seconds, 5, 180, 30) * 1000;
const other = (game, uid) => game.players.find(player => player !== uid) || "";
const clean = value => String(value || "").replace(/[\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);
const normalize = value => clean(value).toLocaleLowerCase("pl-PL").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const words = value => new Set(normalize(value).split(" ").filter(word => word.length >= 4));
const random = list => list[Math.floor(Math.random() * list.length)] || list[0];

export function sanitizeSecretRuleSettings(settings = {}) {
  return {
    category: settings.category === "random" || secretRuleCategories.includes(settings.category) ? settings.category : "random",
    ruleTime: clamp(settings.ruleTime, 30, 120, 60),
    reviewTime: clamp(settings.reviewTime, 10, 60, 20),
    guessTime: clamp(settings.guessTime, 10, 60, 30),
    guessMode: settings.guessMode === "ready" ? "ready" : "interval",
    guessInterval: clamp(settings.guessInterval, 2, 5, 3),
  };
}

function autoMatch(example, rule) {
  const input = normalize(example), target = normalize(rule);
  if (!input || !target) return false;
  if (input === target || input.includes(target) || target.includes(input)) return true;
  const shared = [...words(input)].filter(word => words(target).has(word));
  return shared.length >= 1;
}

function ruleSimilarity(guess, rule) {
  const input = normalize(guess), target = normalize(rule);
  if (!input || !target) return false;
  if (input === target || input.includes(target) || target.includes(input)) return true;
  const a = words(input), b = words(target), shared = [...a].filter(word => b.has(word)).length;
  return shared >= Math.max(1, Math.ceil(Math.min(a.size, b.size) / 2));
}

function addHistory(game, uid, item) {
  game.history = object(game.history);
  game.history[uid] = Array.isArray(game.history[uid]) ? game.history[uid] : [];
  game.history[uid].push({ number: game.history[uid].length + 1, ...item, at: Date.now() });
}

function beginTurn(game, uid, settings) {
  game.phase = "turn";
  game.turnUid = uid;
  game.currentExample = null;
  game.currentGuess = null;
  game.reviewerUid = "";
  game.autoVerdict = null;
  game.autoGuessCorrect = null;
  game.phaseEndsAt = 0;
  game.guessBlocked = object(game.guessBlocked);
  if (settings.guessMode === "interval" && Number(game.turnsCompleted) % Number(settings.guessInterval) !== 0) game.guessBlocked[uid] = false;
}

export function createSecretRuleGame(players, settings = {}) {
  const order = cleanPlayers(players), s = sanitizeSecretRuleSettings(settings), category = s.category === "random" ? random(secretRuleCategories) : s.category;
  return {
    mode: "tajna-zasada", phase: "rules", players: order, category, secretRules: {}, history: Object.fromEntries(order.map(uid => [uid, []])),
    turnUid: order[0] || "", currentExample: null, currentGuess: null, reviewerUid: "", autoVerdict: null, autoGuessCorrect: null,
    scores: Object.fromEntries(order.map(uid => [uid, 0])),
    turnsCompleted: 0, guessBlocked: {}, guessCheckpoint: {}, passUses: {}, winner: "", finished: false, phaseEndsAt: deadline(s.ruleTime),
  };
}

export const SecretRuleEngine = {
  setRule(game, uid, value, settings = {}) {
    if (game.phase !== "rules") return "Tajne zasady zostały już zapisane.";
    if (!game.players.includes(uid)) return "Nie bierzesz udziału w tej grze.";
    const rule = clean(value);
    if (rule.length < 2) return "Wpisz krótką tajną zasadę.";
    game.secretRules = object(game.secretRules); game.secretRules[uid] = rule;
    if (game.players.every(player => clean(game.secretRules[player]).length >= 2)) beginTurn(game, game.players[0], sanitizeSecretRuleSettings(settings));
  },
  example(game, uid, value, settings = {}) {
    if (game.phase !== "turn" || game.turnUid !== uid) return "Teraz rusza przeciwnik.";
    const example = clean(value);
    if (example.length < 2) return "Wpisz przykład pasujący do kategorii.";
    const reviewerUid = other(game, uid);
    game.currentExample = { uid, text: example, number: (game.history?.[uid] || []).length + 1 };
    game.reviewerUid = reviewerUid; game.autoVerdict = autoMatch(example, game.secretRules?.[reviewerUid]); game.phase = "reviewExample"; game.phaseEndsAt = deadline(settings.reviewTime);
  },
  reviewExample(game, uid, verdict, settingsRaw = {}) {
    const settings = sanitizeSecretRuleSettings(settingsRaw);
    if (game.phase !== "reviewExample" || game.reviewerUid !== uid) return "To nie jest Twoja decyzja.";
    const item = game.currentExample; if (!item?.uid || !clean(item.text)) return "Brak przykładu do sprawdzenia.";
    addHistory(game, item.uid, { text: item.text, verdict: Boolean(verdict), manual: Boolean(Boolean(verdict) !== Boolean(game.autoVerdict)) });
    game.turnsCompleted = Number(game.turnsCompleted || 0) + 1;
    beginTurn(game, uid, settings);
  },
  startGuess(game, uid, settings = {}, allowEarly = false) {
    if (game.phase !== "turn" || game.turnUid !== uid) return "Zgadywać możesz tylko podczas swojego ruchu.";
    if (!allowEarly && settings.guessMode === "interval" && (Number(game.turnsCompleted) < 1 || Number(game.turnsCompleted) % Number(settings.guessInterval) !== 0 || game.guessBlocked?.[uid])) return "Najpierw odkryj jeszcze kilka przykładów.";
    game.guessCheckpoint = object(game.guessCheckpoint); game.guessCheckpoint[uid] = Math.floor(Number(game.turnsCompleted || 0) / Math.max(2, Number(settings.guessInterval) || 3));
    game.phase = "guessing"; game.guessUid = uid; game.phaseEndsAt = deadline(settings.guessTime);
  },
  creativeGuess(game, uid, settings = {}) {
    game.passUses = object(game.passUses);
    if (game.passUses[uid]?.["creative-license"]) return "Licencja kreatywności została już użyta.";
    const result = this.startGuess(game, uid, settings, true);
    if (result) return result;
    game.passUses[uid] = { ...(game.passUses[uid] || {}), "creative-license":true };
    return null;
  },
  guess(game, uid, value, settings = {}) {
    if (game.phase !== "guessing" || game.guessUid !== uid) return "To nie jest moment na to zgadywanie.";
    const guess = clean(value); if (guess.length < 2) return "Wpisz swoją propozycję zasady.";
    game.currentGuess = { uid, text: guess }; game.reviewerUid = other(game, uid); game.autoGuessCorrect = ruleSimilarity(guess, game.secretRules?.[game.reviewerUid]); game.phase = "reviewGuess"; game.phaseEndsAt = deadline(settings.reviewTime);
  },
  reviewGuess(game, uid, accepted, settingsRaw = {}) {
    const settings = sanitizeSecretRuleSettings(settingsRaw);
    if (game.phase !== "reviewGuess" || game.reviewerUid !== uid) return "To nie jest Twoja decyzja.";
    if (accepted) { game.winner = game.currentGuess?.uid || ""; game.scores = object(game.scores); if (game.winner) game.scores[game.winner] = Number(game.scores[game.winner] || 0) + 1; game.phase = "result"; game.finished = true; game.phaseEndsAt = 0; return; }
    const guesser = game.currentGuess?.uid || game.turnUid, next = other(game, guesser);
    game.guessBlocked = { ...object(game.guessBlocked), [guesser]: true };
    game.turnsCompleted = Number(game.turnsCompleted || 0) + 1; beginTurn(game, next, settings);
  },
  timeout(game, settingsRaw = {}) {
    const settings = sanitizeSecretRuleSettings(settingsRaw);
    if (game.phase === "rules") { game.secretRules = object(game.secretRules); game.players.forEach(uid => { if (!clean(game.secretRules[uid])) game.secretRules[uid] = "Dowolny przykład z kategorii"; }); beginTurn(game, game.players[0], settings); return; }
    if (game.phase === "reviewExample") { this.reviewExample(game, game.reviewerUid, Boolean(game.autoVerdict), settings); return; }
    if (game.phase === "guessing") { this.reviewGuess(game, other(game, game.guessUid), false, settings); return; }
    if (game.phase === "reviewGuess") { this.reviewGuess(game, game.reviewerUid, false, settings); }
  },
  canGuess(game, uid, settings = {}) {
    if (game.phase !== "turn" || game.turnUid !== uid) return false;
    const s = sanitizeSecretRuleSettings(settings);
    const checkpoint = Math.floor(Number(game.turnsCompleted || 0) / s.guessInterval);
    return s.guessMode === "ready" || (Number(game.turnsCompleted) >= s.guessInterval && checkpoint > Number(game.guessCheckpoint?.[uid] || 0));
  },
  botRule(game, uid) { return random(["Ma związek z muzyką", "Jest czymś, co można spotkać na co dzień", "Ma więcej niż jedną część", "Kojarzy się z emocjami", "Pochodzi ze świata popkultury"]); },
  botExample(game) { return random(["telefon", "pizza", "Minecraft", "Warszawa", "kot", "film", "Drake", "rower"]); },
  botGuess(game) { return random(["Rzeczy związane z muzyką", "Coś, co zna większość ludzi", "Rzeczy spotykane na co dzień", "Elementy popkultury"]); },
};

function nick(accounts, uid) { return accounts?.[uid]?.nick || (String(uid).startsWith("bot:") ? "Bot" : "Gracz"); }
function timerHtml(game) { const seconds = Math.max(0, Math.ceil((Number(game.phaseEndsAt || 0) - Date.now()) / 1000)); return seconds ? `<p class="secret-rule-timer">Pozostało: <b>${seconds}s</b></p>` : ""; }
function historyHtml(game, uid) {
  const history = Array.isArray(game.history?.[uid]) ? game.history[uid] : [], yes = history.filter(item => item.verdict), no = history.filter(item => !item.verdict);
  const column = (title, entries, tone) => `<div class="secret-rule-history-column ${tone}"><h3>${title}</h3>${entries.length ? entries.map(item => `<div class="secret-rule-history-entry"><small>#${item.number}</small><span>${escapeHtml(item.text)}</span></div>`).join("") : `<p class="muted">Jeszcze nic tu nie trafiło.</p>`}</div>`;
  return `<section class="secret-rule-history"><div class="section-intro"><div><p class="eyebrow">ODKRYWANIE ZASADY PRZECIWNIKA</p><h2>Twoje dotychczasowe próby</h2></div><span class="badge">${history.length}</span></div><div class="secret-rule-history-grid">${column("✅ PASUJE", yes, "is-yes")}${column("❌ NIE PASUJE", no, "is-no")}</div></section>`;
}
function rankingHtml(game, accounts) { return [...game.players].sort((a, b) => Number(game.scores?.[b] || 0) - Number(game.scores?.[a] || 0)).map((uid, index) => `<div class="secret-rule-ranking-row"><span>${index + 1}. ${escapeHtml(nick(accounts, uid))}</span><b>${Number(game.scores?.[uid] || 0)} pkt ${uid === game.winner ? "🏆" : ""}</b></div>`).join(""); }
function rulesHtml(game, accounts) { return game.players.map(uid => `<div class="secret-rule-final-rule"><b>${escapeHtml(nick(accounts, uid))}</b><span>${escapeHtml(game.secretRules?.[uid] || "—")}</span></div>`).join(""); }

export function renderSecretRuleLobbySettings(room, isHost) {
  const s = sanitizeSecretRuleSettings(room.settings), current = s.category === "random" ? "Losowa kategoria" : s.category;
  const categoryButtons = secretRuleCategories.map(category => `<button type="button" class="ghost secret-rule-category-choice" data-secret-rule-category="${escapeHtml(category)}" ${isHost ? "" : "disabled"}>${escapeHtml(category)}</button>`).join("");
  return `<div class="secret-rule-settings"><label class="setting-row"><span>Kategoria startowa</span><strong class="secret-rule-selected-category">${escapeHtml(current)}</strong></label><div class="secret-rule-category-actions"><button type="button" class="primary" id="secret-rule-random-category" ${isHost ? "" : "disabled"}>🎲 Losuj kategorię</button><details><summary>📚 Pokaż 100 kategorii</summary><div class="secret-rule-category-grid">${categoryButtons}</div></details></div><label class="setting-row"><span>Czas na tajną zasadę</span><select data-secret-rule-setting="ruleTime" ${isHost ? "" : "disabled"}>${[30,60,90,120].map(value => `<option value="${value}" ${s.ruleTime === value ? "selected" : ""}>${value}s</option>`).join("")}</select></label><label class="setting-row"><span>Kiedy można zgadywać?</span><select data-secret-rule-setting="guessMode" ${isHost ? "" : "disabled"}><option value="interval" ${s.guessMode === "interval" ? "selected" : ""}>Co określoną liczbę tur</option><option value="ready" ${s.guessMode === "ready" ? "selected" : ""}>Gdy gracz będzie gotowy</option></select></label>${s.guessMode === "interval" ? `<label class="setting-row"><span>Odstęp między zgadywaniem</span><select data-secret-rule-setting="guessInterval" ${isHost ? "" : "disabled"}>${[2,3,4,5].map(value => `<option value="${value}" ${s.guessInterval === value ? "selected" : ""}>Po ${value} zaakceptowanych przykładach</option>`).join("")}</select></label>` : ""}<p class="tiny">Obaj gracze widzą kategorię, ale każdy zna tylko własną zasadę. Wynik automatyczny jest jedynie sugestią — właściciel zasady zawsze zatwierdza odpowiedź.</p></div>`;
}

export function renderSecretRuleGame(root, { room, accounts, currentUser }, actions) {
  const game = room.game, me = currentUser, expected = { phase: game.phase, phaseEndsAt: game.phaseEndsAt }, ownRule = game.secretRules?.[me] || "";
  let content = `<p class="eyebrow">TAJNA ZASADA · ${game.phase === "result" ? "KONIEC GRY" : "POJEDYNEK 1V1"}</p><div class="secret-rule-category-banner"><span>WSPÓLNA KATEGORIA</span><strong>${escapeHtml(game.category || "—")}</strong></div>`;
  if (game.phase === "rules") content += `<h1>Ustalcie tajne zasady</h1><p class="muted">Wymyśl zasadę dotyczącą elementów kategorii. Przeciwnik jej nie zobaczy.</p><form id="secret-rule-rule-form" class="secret-rule-form">${ownRule ? `<div class="secret-rule-own"><span>🔒 TWOJA TAJNA ZASADA</span><b>${escapeHtml(ownRule)}</b></div>` : `<label for="secret-rule-rule">Twoja tajna zasada<input id="secret-rule-rule" maxlength="120" required placeholder="np. Raperzy albo rzeczy czerwone"></label><button class="primary">Zapisz zasadę</button>`}</form><p class="muted">Gotowe zasady: ${Object.keys(game.secretRules || {}).length}/2</p>`;
  else if (game.phase === "turn") { const myTurn = game.turnUid === me, canGuess = SecretRuleEngine.canGuess(game, me, room.settings), creativeReady = myTurn && hasGamePass(accounts?.[me], "creative-license") && room.settings?.gamePassesEnabled !== false && !game.passUses?.[me]?.["creative-license"]; content += `<h1>${myTurn ? "TWÓJ RUCH" : "RUCH PRZECIWNIKA"}</h1><div class="secret-rule-own"><span>🔒 TWOJA TAJNA ZASADA</span><b>${escapeHtml(ownRule || "ukryta")}</b></div>${myTurn ? `<form id="secret-rule-example-form" class="secret-rule-form"><label for="secret-rule-example">Podaj przykład z kategorii<input id="secret-rule-example" maxlength="180" required placeholder="np. Drake"></label><button class="primary">Sprawdź przykład</button></form>${canGuess ? `<button type="button" class="ghost secret-rule-guess-start" id="secret-rule-start-guess">🎯 Zgadnij tajną zasadę</button>` : ""}${creativeReady ? `<button type="button" class="ghost secret-rule-guess-start" id="secret-rule-creative-guess">💡 Zgadnij teraz dzięki Licencji kreatywności</button>` : ""}` : `<div class="secret-rule-waiting"><b>🔍 Przeciwnik odkrywa Twoją zasadę...</b><p>Gdy zatwierdzi wynik, ruch przejdzie na Ciebie.</p></div>`}${historyHtml(game, me)}`; }
  else if (game.phase === "reviewExample") { const item = game.currentExample, reviewer = game.reviewerUid === me; content += `<h1>${reviewer ? "Sprawdź przykład przeciwnika" : "Przeciwnik sprawdza Twój przykład"}</h1>${reviewer ? `<div class="secret-rule-review-card"><span>PRZYKŁAD #${item?.number || "—"}</span><strong>${escapeHtml(item?.text || "—")}</strong><p>Gra uważa: <b>${game.autoVerdict ? "✅ PASUJE" : "❌ NIE PASUJE"}</b></p><div class="choice-row"><button class="primary" data-secret-rule-review="yes">✅ Tak, pasuje</button><button class="ghost" data-secret-rule-review="no">🔄 Nie, nie pasuje</button></div></div>` : `<div class="secret-rule-waiting"><b>🔍 Przeciwnik sprawdza Twój przykład...</b><p>Automatyczna sugestia nie jest jeszcze widoczna — decyzję zatwierdzi właściciel zasady.</p></div>`}${historyHtml(game, me)}${timerHtml(game)}`; }
  else if (game.phase === "guessing") content += `<h1>${game.guessUid === me ? "Spróbuj odgadnąć zasadę" : "Przeciwnik zgaduje zasadę"}</h1>${game.guessUid === me ? `<form id="secret-rule-guess-form" class="secret-rule-form"><label for="secret-rule-guess">Moim zdaniem zasada przeciwnika to:<input id="secret-rule-guess" maxlength="120" required placeholder="np. Rzeczy czerwone"></label><button class="primary">Wyślij zgadywanie</button></form>` : `<div class="secret-rule-waiting"><b>🎯 Przeciwnik zgaduje Twoją zasadę...</b><p>Jeśli odrzucisz propozycję, jego ruch przepada.</p></div>`}${timerHtml(game)}`;
  else if (game.phase === "reviewGuess") { const reviewer = game.reviewerUid === me; content += `<h1>${reviewer ? "Oceń zgadywanie przeciwnika" : "Przeciwnik ocenia Twoją propozycję"}</h1>${reviewer ? `<div class="secret-rule-review-card"><span>PRZECIWNIK ZGADUJE</span><strong>${escapeHtml(game.currentGuess?.text || "—")}</strong><p>Gra uważa: <b>${game.autoGuessCorrect ? "✅ ZNACZENIE PASUJE" : "❌ RACZEJ NIE PASUJE"}</b></p><div class="choice-row"><button class="primary" data-secret-rule-guess-review="yes">✅ Uznaj jako poprawne</button><button class="ghost" data-secret-rule-guess-review="no">❌ Odrzuć</button></div></div>` : `<div class="secret-rule-waiting"><b>🔍 Właściciel zasady ocenia Twoje zgadywanie...</b><p>Jeśli propozycja zostanie odrzucona, stracisz tę turę.</p></div>`}${timerHtml(game)}`; }
  else { const winner = game.winner ? nick(accounts, game.winner) : "—"; content += `<div class="secret-rule-final"><span>🧠</span><h1>Tajna zasada odkryta!</h1><p><strong>${escapeHtml(winner)}</strong> odgadł zasadę przeciwnika.</p><div class="secret-rule-final-rules"><h2>Obie zasady</h2>${rulesHtml(game, accounts)}</div><h2>Końcowe wyniki</h2><div class="secret-rule-ranking">${rankingHtml(game, accounts)}</div>${game.players.map(uid => historyHtml(game, uid)).join("")}<button class="primary" id="secret-rule-lobby">🔄 Zagraj ponownie</button></div>`; }
  root.innerHTML = `<main class="page secret-rule-page enter"><section class="panel secret-rule-panel">${content}</section><button id="secret-rule-leave" class="ghost">Wyjdź z pokoju</button></main>`;
  root.querySelector("#secret-rule-rule-form")?.addEventListener("submit", event => { event.preventDefault(); actions.secretRuleSetRule(root.querySelector("#secret-rule-rule")?.value || "", expected); });
  root.querySelector("#secret-rule-example-form")?.addEventListener("submit", event => { event.preventDefault(); actions.secretRuleExample(root.querySelector("#secret-rule-example").value, expected); });
  root.querySelector("#secret-rule-start-guess")?.addEventListener("click", () => actions.secretRuleStartGuess(expected));
  root.querySelector("#secret-rule-creative-guess")?.addEventListener("click", () => actions.secretRuleCreativeGuess(expected));
  root.querySelectorAll("[data-secret-rule-review]").forEach(button => button.addEventListener("click", () => actions.secretRuleReviewExample(button.dataset.secretRuleReview === "yes", expected)));
  root.querySelector("#secret-rule-guess-form")?.addEventListener("submit", event => { event.preventDefault(); actions.secretRuleGuess(root.querySelector("#secret-rule-guess").value, expected); });
  root.querySelectorAll("[data-secret-rule-guess-review]").forEach(button => button.addEventListener("click", () => actions.secretRuleReviewGuess(button.dataset.secretRuleGuessReview === "yes", expected)));
  root.querySelector("#secret-rule-lobby")?.addEventListener("click", () => actions.returnToRoom());
  root.querySelector("#secret-rule-leave")?.addEventListener("click", () => actions.leaveRoom());
  if (!["turn", "result"].includes(game.phase)) renderSecretRuleGame.timer = window.setTimeout(() => actions.secretRuleTimeout(expected), Math.max(100, Number(game.phaseEndsAt || Date.now()) - Date.now() + 50));
}

export function stopSecretRuleTimer() { clearTimeout(renderSecretRuleGame.timer); renderSecretRuleGame.timer = 0; }
