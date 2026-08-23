import { escapeHtml } from "./utils.js?v=20260822-1";

export const uniqueAnswerDefaults = { lives: 3, answerTime: 30, hostQuestionMode: false };

// Open prompts are intentionally broad: the game is about matching answers,
// not about finding one canonical answer. Keeping them here also makes adding
// themed packs later straightforward.
export const uniqueAnswerQuestions = [
  "Jakie zwierzę jest większe od człowieka?", "Co zabierzesz na bezludną wyspę?", "Jaki przedmiot najczęściej gubi się w domu?", "Co można znaleźć w każdej kuchni?", "Jakie zwierzę kojarzy się z zimą?", "Co robisz, gdy pada deszcz?", "Jaki prezent ucieszy prawie każdego?", "Co warto mieć podczas długiej podróży?", "Jakie jedzenie najlepiej pasuje do filmu?", "Co może obudzić całą okolicę?",
  "Jaki kolor najczęściej widzisz w mieście?", "Co robisz od razu po przebudzeniu?", "Jakie miejsce jest dobre na odpoczynek?", "Co można znaleźć w plecaku ucznia?", "Jakie zwierzę potrafi szybko biegać?", "Co przydaje się na plaży?", "Jaki napój pijesz latem?", "Co może być bardzo głośne?", "Jakie danie je się łyżką?", "Co znajduje się na biurku?",
  "Jaki sport kojarzy się z piłką?", "Co robisz, kiedy jesteś głodny?", "Jakie miejsce odwiedzasz podczas wakacji?", "Co można kupić w piekarni?", "Jakie zwierzę mieszka w lesie?", "Co sprawia, że ktoś się śmieje?", "Jaki przedmiot może mieć baterie?", "Co zabierasz do szkoły?", "Jakie warzywo jest pomarańczowe?", "Co można zobaczyć nocą na niebie?",
  "Jaki zawód nosi specjalny mundur?", "Co robisz, gdy zgubisz klucze?", "Jakie miejsce ma dużo książek?", "Co może być ostre?", "Jakie zwierzę ma skrzydła?", "Co robisz podczas przerwy?", "Jaki smak kojarzy się z lodami?", "Co może pływać po wodzie?", "Jakie urządzenie służy do robienia zdjęć?", "Co można znaleźć w ogrodzie?",
  "Jaki przedmiot przydaje się zimą?", "Co robisz, gdy ktoś dzwoni do drzwi?", "Jakie zwierzę kojarzy się z gospodarstwem?", "Co może być przezroczyste?", "Jaki posiłek jesz rano?", "Co można zrobić z papieru?", "Jakie miejsce jest zatłoczone w godzinach szczytu?", "Co zabierasz na basen?", "Jaki owoc ma pestkę?", "Co może być miękkie?",
  "Jakie zwierzę kojarzy się z morzem?", "Co można znaleźć w łazience?", "Jaki przedmiot pomaga mierzyć czas?", "Co robisz przed snem?", "Jakie miejsce ma scenę?", "Co może się stłuc?", "Jaki kolor kojarzy się z ogniem?", "Co można zjeść na śniadanie?", "Jakie zwierzę jest domowym pupilem?", "Co przydaje się podczas burzy?",
  "Jaki przedmiot zabierasz na trening?", "Co można znaleźć w kieszeni?", "Jakie miejsce ma peron?", "Co robisz, gdy jest ci zimno?", "Jaki owoc kojarzy się z latem?", "Co może mieć koła?", "Jakie zwierzę ma długi ogon?", "Co jest potrzebne do gotowania?", "Jaki przedmiot może świecić?", "Co można zobaczyć w muzeum?",
  "Jaki sport uprawia się na lodzie?", "Co robisz podczas burzy?", "Jakie miejsce kojarzy się z ciszą?", "Co można znaleźć w garażu?", "Jaki napój pije się na gorąco?", "Co może być bardzo ciężkie?", "Jakie zwierzę kojarzy się z Afryką?", "Co można zrobić z drewna?", "Jaki przedmiot chroni przed słońcem?", "Co znajduje się w lodówce?",
  "Jakie miejsce ma dużo drzew?", "Co robisz, gdy jesteś zmęczony?", "Jaki kolor kojarzy się z naturą?", "Co może mieć ekran?", "Jakie zwierzę potrafi latać?", "Co zabierasz na piknik?", "Jaki przedmiot służy do pisania?", "Co można usłyszeć na koncercie?", "Jakie danie często je się widelcem?", "Co może być bardzo zimne?",
  "Jakie miejsce odwiedza się po książki?", "Co robisz, gdy masz wolny dzień?", "Jaki przedmiot ma zamek?", "Jakie zwierzę kojarzy się z pustynią?", "Co można znaleźć na stadionie?", "Jaki smak jest kwaśny?", "Co przydaje się podczas przeprowadzki?", "Jakie miejsce jest dobre do nauki?", "Co może być kolorowe?", "Jaki przedmiot zakładasz na głowę?",
  "Co robisz, kiedy ktoś opowiada dowcip?", "Jakie zwierzę żyje w wodzie?", "Co można znaleźć w apteczce?", "Jaki przedmiot służy do sprzątania?", "Co może być bardzo wysokie?", "Jakie miejsce kojarzy się z wakacjami?", "Co jesz, kiedy masz ochotę na coś słodkiego?", "Jaki sport wymaga rakiety?", "Co może mieć strony?", "Jakie zwierzę kojarzy się z nocą?",
  "Co zabierasz na biwak?", "Jaki przedmiot można otworzyć kluczem?", "Co robisz, gdy jesteś chory?", "Jakie miejsce ma kasę biletową?", "Co może być gorące?", "Jaki owoc jest żółty?", "Jakie zwierzę ma rogi?", "Co można znaleźć pod łóżkiem?", "Jaki przedmiot pomaga gotować?", "Co widać na mapie?",
  "Jakie miejsce ma dużo ludzi?", "Co robisz, gdy czekasz?", "Jaki przedmiot może być elektroniczny?", "Co można założyć na nogi?", "Jakie zwierzę kojarzy się z górami?", "Co bywa trudne do zapamiętania?", "Jaki napój pije się do obiadu?", "Co może mieć igły?", "Jakie miejsce odwiedzasz u lekarza?", "Co można znaleźć w piwnicy?",
  "Jakie zwierzę jest szybkie?", "Co robisz podczas przerwy w pracy?", "Jaki przedmiot przydaje się w kuchni?", "Co może być okrągłe?", "Jakie miejsce ma dużo świateł?", "Co można zobaczyć przez okno?", "Jaki kolor kojarzy się z nocą?", "Jakie zwierzę ma futro?", "Co zabierasz na rower?", "Co może być mokre?", "Jaki przedmiot przydaje się w podróży?", "Co można znaleźć na strychu?", "Jakie zwierzę kojarzy się z farmą?", "Co robisz, gdy masz dobry humor?", "Jaki posiłek je się wieczorem?", "Co może być bardzo małe?", "Jakie miejsce ma recepcję?", "Co nosisz, gdy jest zimno?", "Jaki owoc pasuje do sałatki?", "Co można usłyszeć w lesie?", "Jakie zwierzę kojarzy się z lodem?", "Co znajduje się w piórniku?", "Jaki przedmiot pomaga otworzyć paczkę?", "Co robisz przed wyjściem z domu?", "Jakie miejsce ma boisko?", "Co może mieć uchwyt?", "Jaki smak kojarzy się z cytryną?", "Co zabierasz do kina?", "Jakie zwierzę ma dziób?", "Co można znaleźć w szafie?", "Jaki przedmiot ma ekran dotykowy?", "Co robisz, gdy ktoś ci pomaga?", "Jakie miejsce ma bilet wstępu?", "Co może być bardzo jasne?", "Jaki napój pasuje do śniadania?", "Co można zbudować z klocków?", "Jakie zwierzę kojarzy się z dżunglą?", "Co leży na półce?", "Jaki przedmiot chroni przed deszczem?", "Co robisz w weekend?", "Jakie miejsce ma windę?", "Co można znaleźć na talerzu?", "Jaki kolor kojarzy się z morzem?", "Co może być drewniane?", "Jakie zwierzę porusza się powoli?", "Co zabierasz na spacer?", "Jaki przedmiot ma wskazówki?", "Co można zobaczyć w parku?", "Jakie miejsce kojarzy się z ciszą?", "Co robisz, gdy czegoś nie rozumiesz?", "Jaki owoc można obrać?", "Co może być pełne ludzi?", "Jakie zwierzę ma kopyta?", "Co znajduje się przy łóżku?", "Jaki przedmiot służy do cięcia?", "Co można znaleźć na plaży?", "Jakie miejsce ma drzwi obrotowe?", "Co robisz, gdy wygrywasz?", "Jaki kolor pasuje do śniegu?", "Co może być sprężyste?"
];

const clamp = (value, min, max, fallback) => Math.max(min, Math.min(max, Number(value) || fallback));
export function sanitizeUniqueAnswerSettings(settings = {}, playerCount = 3) {
  return { lives: clamp(settings.lives, 1, 5, 3), answerTime: clamp(settings.answerTime, 15, 90, 30), hostQuestionMode: playerCount > 4 && Boolean(settings.hostQuestionMode) };
}
const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const active = game => (game.players || []).filter(uid => !Array.isArray(game.eliminated) || !game.eliminated.includes(uid));
const deadline = seconds => Date.now() + Math.max(10, Number(seconds) || 30) * 1000;
const normalized = value => String(value || "").trim().toLocaleLowerCase("pl-PL").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ł/g, "l").replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ");
const validText = value => { const text = String(value || "").trim(); if (text.length < 1 || text.length > 120) return false; return !/[0-9]/.test(text); };
const validAnswerText = value => { const text = String(value || "").trim(); return text.length >= 1 && text.length <= 120; };
const pickQuestion = game => { const used = new Set(game.usedQuestions || []); const pool = uniqueAnswerQuestions.filter(item => !used.has(item)); const question = pool[Math.floor(Math.random() * pool.length)] || uniqueAnswerQuestions[Math.floor(Math.random() * uniqueAnswerQuestions.length)]; game.usedQuestions = [...(game.usedQuestions || []), question]; return question; };

export function createUniqueAnswerGame(players, settings = {}, requestedHostUid = "") {
  const s = sanitizeUniqueAnswerSettings(settings, players.length), hostUid = players.includes(requestedHostUid) ? requestedHostUid : players[0];
  const game = { mode: "unique-answer", phase: s.hostQuestionMode ? "hostPrompt" : "answering", round: 1, players: [...players], hostUid, hostQuestionMode: s.hostQuestionMode, prompt: "", answers: {}, lives: Object.fromEntries(players.map(uid => [uid, s.lives])), eliminated: [], history: [], usedQuestions: [], phaseEndsAt: deadline(s.answerTime), finished: false };
  if (!s.hostQuestionMode) game.prompt = pickQuestion(game);
  return game;
}

function resolve(game, settings) {
  game.answers = object(game.answers); game.lives = object(game.lives); game.eliminated ||= [];
  const groups = {};
  Object.entries(game.answers).forEach(([uid, answer]) => { const key = normalized(answer); if (key) (groups[key] ||= []).push(uid); });
  const lost = new Set(Object.keys(game.answers).filter(uid => !normalized(game.answers[uid])));
  Object.values(groups).filter(group => group.length > 1).forEach(group => group.forEach(uid => { if (!(game.hostQuestionMode && uid === game.hostUid)) lost.add(uid); }));
  const eliminatedThisRound = [];
  lost.forEach(uid => { if (game.hostQuestionMode && uid === game.hostUid) return; game.lives[uid] = Math.max(0, Number(game.lives[uid] || 0) - 1); if (game.lives[uid] === 0 && !game.eliminated.includes(uid)) { game.eliminated.push(uid); eliminatedThisRound.push(uid); } });
  const duplicateGroups = Object.values(groups).filter(group => group.length > 1).map(group => ({ answer: game.answers[group[0]], players: group }));
  game.history = [...(game.history || []), { round: game.round, prompt: game.prompt, answers: { ...game.answers }, duplicateGroups, lost: [...lost], eliminated: eliminatedThisRound }];
  const alive = active(game);
  game.result = { duplicateGroups, lost: [...lost], eliminated: eliminatedThisRound, alive: [...alive] };
  if (alive.length <= 1) { game.phase = "result"; game.finished = true; game.winner = alive[0] || ""; game.phaseEndsAt = null; return; }
  game.phase = "roundResult"; game.phaseEndsAt = Date.now() + 8000;
}

export const UniqueAnswerEngine = {
  hostPrompt(game, uid, text, settings) { if (game.phase !== "hostPrompt" || uid !== game.hostUid) return "Tylko host może ustawić pytanie."; if (!validText(text)) return "Pytanie nie może zawierać cyfr i musi mieć do 120 znaków."; game.prompt = String(text).trim(); game.phase = "answering"; game.answers = {}; game.phaseEndsAt = deadline(settings.answerTime); },
  answer(game, uid, text, settings) { if (game.phase !== "answering") return "Ta runda jest już zakończona."; if (!active(game).includes(uid)) return "Odpadłeś z gry."; game.answers = object(game.answers); if (uid in game.answers) return "Odpowiedź została już zapisana."; if (!validAnswerText(text)) return "Wpisz jedną odpowiedź."; game.answers[uid] = String(text).trim(); if (active(game).every(player => player in game.answers)) resolve(game, settings); },
  timeout(game, settings) { if (game.phase !== "answering") return; game.answers = object(game.answers); active(game).forEach(uid => { if (!(uid in game.answers)) game.answers[uid] = ""; }); resolve(game, settings); },
  nextRound(game, settings) { if (game.phase !== "roundResult") return "Runda jest już zmieniona."; game.round += 1; game.answers = {}; game.result = null; game.prompt = ""; game.phase = game.hostQuestionMode ? "hostPrompt" : "answering"; if (!game.hostQuestionMode) game.prompt = pickQuestion(game); game.phaseEndsAt = deadline(settings.answerTime); },
};

const nick = (accounts, uid) => accounts?.[uid]?.nick || (String(uid).startsWith("bot:") ? "Bot" : "Gracz");
const answerRows = (game, accounts, reveal = false) => Object.entries(game.answers || {}).map(([uid, value]) => `<li><b>${escapeHtml(nick(accounts, uid))}</b>${reveal ? `: ${escapeHtml(value || "brak odpowiedzi")}` : " · odpowiedź zapisana"}</li>`).join("");
const livesHtml = (game, accounts) => (game.players || []).map(uid => `<span class="unique-answer-player ${game.eliminated?.includes(uid) ? "is-out" : ""}"><b>${escapeHtml(nick(accounts, uid))}</b><small>${"❤".repeat(Math.max(0, Number(game.lives?.[uid] || 0)))}${"♡".repeat(Math.max(0, 5 - Number(game.lives?.[uid] || 0)))}</small></span>`).join("");

export function renderUniqueAnswerLobbySettings(room, isHost) {
  const s = sanitizeUniqueAnswerSettings(room.settings, room.players.length);
  return `<div class="unique-answer-settings"><label class="setting-row"><span>Liczba żyć</span><select data-unique-answer-setting="lives" ${isHost ? "" : "disabled"}>${[1, 2, 3, 4, 5].map(value => `<option value="${value}" ${s.lives === value ? "selected" : ""}>${value}</option>`).join("")}</select></label><label class="setting-row"><span>Czas na odpowiedź <small>dla każdej rundy</small></span><select data-unique-answer-setting="answerTime" ${isHost ? "" : "disabled"}>${[20, 30, 45, 60].map(value => `<option value="${value}" ${s.answerTime === value ? "selected" : ""}>${value}s</option>`).join("")}</select></label>${room.players.length > 4 ? `<label class="setting-row check"><span><b>Pytania wymyśla host</b><small>Host także odpowiada, ale nie odpada za powtórkę</small></span><input type="checkbox" data-unique-answer-setting="hostQuestionMode" ${s.hostQuestionMode ? "checked" : ""} ${isHost ? "" : "disabled"}></label>` : `<p class="tiny">Przy 5–8 graczach odblokuje się wariant, w którym pytania tworzy host.</p>`}<p class="tiny">Wszyscy odpowiadają na to samo pytanie. Powtórzone odpowiedzi tracą życie; po utracie wszystkich odpadasz.</p></div>`;
}

export function renderUniqueAnswerGame(root, { room, accounts, currentUser }, actions) {
  const game = room.game, expected = { phase: game.phase, phaseEndsAt: game.phaseEndsAt }, timer = Math.max(0, Math.ceil((Number(game.phaseEndsAt || 0) - Date.now()) / 1000));
  let content = `<p class="eyebrow">BEZ POWTÓREK · RUNDA ${game.round}</p><h1>Odpowiedz inaczej niż wszyscy</h1><div class="unique-answer-roster">${livesHtml(game, accounts)}</div>`;
  if (game.phase === "hostPrompt") content += currentUser === game.hostUid ? `<form id="unique-answer-host-form" class="unique-answer-form"><p class="muted">Wymyśl pytanie bez cyfr. Pozostali gracze odpowiedzą, a Ty również podasz swoją odpowiedź.</p><input maxlength="120" placeholder="Np. Co zabierzesz na bezludną wyspę?"><button class="primary">Rozpocznij rundę</button></form>` : `<div class="waiting-state"><h3>Host przygotowuje pytanie</h3><p>Pytanie pojawi się za chwilę.</p></div>`;
  else if (game.phase === "answering") content += `<div class="unique-answer-prompt"><small>PYTANIE</small><strong>${escapeHtml(game.prompt)}</strong></div>${currentUser in (game.answers || {}) ? `<div class="waiting-state"><h3>Odpowiedź zapisana ✓</h3><p>Czekamy na pozostałych graczy.</p></div>` : `<form id="unique-answer-form" class="unique-answer-form"><input maxlength="120" autocomplete="off" placeholder="Jedna odpowiedź"><button class="primary">Odpowiedz</button></form>`}<p class="unique-answer-progress">${Object.keys(game.answers || {}).length}/${active(game).length} odpowiedzi · ${timer}s</p><ul class="unique-answer-submissions">${answerRows(game, accounts)}</ul>`;
  else if (game.phase === "roundResult") content += `<div class="unique-answer-prompt"><small>WYNIK RUNDY</small><strong>${escapeHtml(game.prompt)}</strong></div><ul class="unique-answer-submissions">${answerRows(game, accounts, true)}</ul><p class="muted">${game.result?.duplicateGroups?.length ? "Powtórzone odpowiedzi zabierają życie." : "Nikt nie podał takiej samej odpowiedzi."}</p><button id="unique-answer-next" class="primary">Następna runda</button>`;
  else content += `<div class="unique-answer-final"><span>🏆</span><h2>${game.winner ? `${escapeHtml(nick(accounts, game.winner))} wygrywa!` : "Koniec gry"}</h2><p>Wszyscy gracze przetrwali swoje rundy. Poniżej pełna historia odpowiedzi.</p></div><div class="unique-answer-history">${(game.history || []).map(item => `<article><b>Runda ${item.round}</b><p>${escapeHtml(item.prompt)}</p><ul>${Object.entries(item.answers || {}).map(([uid, answer]) => `<li>${escapeHtml(nick(accounts, uid))}: ${escapeHtml(answer || "brak odpowiedzi")}</li>`).join("")}</ul></article>`).join("")}</div><button id="unique-answer-lobby" class="primary">Wróć do lobby</button>`;
  root.innerHTML = `<main class="page unique-answer-page enter"><section class="panel unique-answer-panel">${content}</section><button id="unique-answer-leave" class="ghost">Wyjdź z pokoju</button></main>`;
  root.querySelector("#unique-answer-form")?.addEventListener("submit", event => { event.preventDefault(); actions.uniqueAnswerSubmit(root.querySelector("#unique-answer-form input").value, expected); });
  root.querySelector("#unique-answer-host-form")?.addEventListener("submit", event => { event.preventDefault(); actions.uniqueAnswerHostPrompt(root.querySelector("#unique-answer-host-form input").value, expected); });
  root.querySelector("#unique-answer-next")?.addEventListener("click", () => actions.uniqueAnswerNext());
  root.querySelector("#unique-answer-lobby")?.addEventListener("click", () => actions.returnToRoom());
  root.querySelector("#unique-answer-leave")?.addEventListener("click", () => actions.leaveRoom());
  if (["answering", "hostPrompt", "roundResult"].includes(game.phase)) { renderUniqueAnswerGame.timer = window.setTimeout(() => game.phase === "answering" ? actions.uniqueAnswerTimeout(expected) : undefined, Math.max(100, Number(game.phaseEndsAt || Date.now()) - Date.now() + 50)); }
}
export function stopUniqueAnswerTimer() { clearTimeout(renderUniqueAnswerGame.timer); renderUniqueAnswerGame.timer = 0; }
