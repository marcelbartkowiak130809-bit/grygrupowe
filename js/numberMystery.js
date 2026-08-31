import { escapeHtml } from "./utils.js?v=20260822-1";
import { hasGamePass, inGamePurchaseById } from "./gamePasses.js?v=20260831-5";

export const numberMysteryDefaults = {
  communicationMode: "hybrid",
  roundMode: "race",
  questionTime: 30,
  rounds: 7,
};

const quickGroups = [
  ["Czy dziwnie by było, gdybym tyle razy dziennie zaglądał do telefonu?", "Czy tyle powiadomień dziennie utrudniałoby skupienie?", "Czy tak częste sprawdzanie telefonu wyglądałoby na nawyk?", "Czy tyle wiadomości dziennie byłoby trudne do nadrobienia?", "Czy tyle czasu przed ekranem martwiłoby rodziców?", "Czy tak częste korzystanie z telefonu przeszkadzałoby w rozmowie?", "Czy tyle filmów dziennie wyglądałoby jak intensywne oglądanie?", "Czy tak częste robienie zdjęć byłoby nietypowe?", "Czy tyle godzin bez telefonu byłoby dla mnie trudne?", "Czy tak częste odświeżanie aplikacji wyglądałoby nerwowo?"],
  ["Czy tyle minut wystarczyłoby na szybki prysznic?", "Czy tyle minut czekania na autobus byłoby irytujące?", "Czy tyle minut wystarczyłoby na przygotowanie śniadania?", "Czy taka długość spaceru byłaby dobra po pracy?", "Czy tyle minut rozmowy telefonicznej byłoby długo?", "Czy tyle minut wystarczyłoby na krótką drzemkę?", "Czy taka długość kolejki zniechęciłaby do zakupów?", "Czy tyle minut wystarczyłoby na spakowanie plecaka?", "Czy taka długość przerwy pozwoliłaby odpocząć?", "Czy tyle minut oczekiwania na pizzę byłoby normalne?"],
  ["Czy taki wiek pasowałby do osoby zaczynającej samodzielne życie?", "Czy taki wiek pasowałby do studenta?", "Czy taki wiek pasowałby do osoby z dużym doświadczeniem zawodowym?", "Czy taki wiek pasowałby do kogoś, kto dopiero uczy się prowadzić?", "Czy taki wiek pasowałby do osoby planującej emeryturę?", "Czy taka różnica wieku w związku byłaby społecznie zaskakująca?", "Czy taki wiek kojarzyłby się z młodością?", "Czy taki wiek kojarzyłby się z dorosłością?", "Czy taki wiek pasowałby do właściciela firmy?", "Czy taki wiek pasowałby do osoby wychowującej nastolatka?"],
  ["Czy taka kwota wystarczyłaby na skromny dzień w mieście?", "Czy taka kwota wystarczyłaby na spontaniczny weekend?", "Czy taka cena byłaby rozsądna za używany telefon?", "Czy taka cena byłaby przesadą za zwykły obiad?", "Czy taka kwota pasowałaby do kieszonkowego?", "Czy taka kwota wystarczyłaby na duże zakupy spożywcze?", "Czy taka cena byłaby typowa za bilet na koncert?", "Czy taka kwota brzmiałaby jak drogi prezent?", "Czy taka kwota wystarczyłaby na miesięczny rachunek?", "Czy taka kwota wyglądałaby jak oszczędności na nagły wydatek?"],
  ["Czy tyle snu wystarczyłoby, żeby dobrze funkcjonować?", "Czy taka długość filmu byłaby męcząca?", "Czy tyle czasu wystarczyłoby na ugotowanie obiadu?", "Czy taka długość podróży byłaby za duża na dobę?", "Czy tyle czasu wystarczyłoby na nauczenie się prostej umiejętności?", "Czy taka długość rozmowy byłaby niezręczna?", "Czy tyle czasu wystarczyłoby na szybkie zakupy?", "Czy taki czas treningu byłby odpowiedni dla początkującego?", "Czy tyle czasu bez snu byłoby niepokojące?", "Czy taka długość przerwy wystarczyłaby na odpoczynek?"],
  ["Czy taka temperatura byłaby komfortowa na spacer?", "Czy taka temperatura pasowałaby do gorącej herbaty?", "Czy taka temperatura oznaczałaby lekką kurtkę?", "Czy taka temperatura byłaby bezpieczna do kąpieli w jeziorze?", "Czy taka temperatura kojarzyłaby się z upałem?", "Czy taka temperatura kojarzyłaby się z mrozem?", "Czy taka temperatura byłaby typowa dla wiosennego poranka?", "Czy taka temperatura byłaby typowa dla letniego popołudnia?", "Czy taka temperatura zaszkodziłaby roślinom na balkonie?", "Czy taka temperatura pasowałaby do zamrażarki?"],
  ["Czy tyle punktów wystarczyłoby do wygrania rundy?", "Czy taki wynik byłby imponujący w trudnym quizie?", "Czy taki wynik wyglądałby jak remis?", "Czy taka liczba punktów byłaby raczej słaba?", "Czy taki wynik sugerowałby dobrą passę?", "Czy tyle punktów byłoby możliwe bez żadnego błędu?", "Czy taki wynik sportowy wyglądałby na wysoki?", "Czy taki wynik byłby typowy dla początkującego gracza?", "Czy taki wynik mógłby być rekordem?", "Czy tyle punktów wystarczyłoby do awansu?"],
  ["Czy taka liczba kroków byłaby realna podczas krótkiego spaceru?", "Czy taka liczba kroków pasowałaby do całego dnia poza domem?", "Czy tyle kilometrów dałoby się przejść bez odpoczynku?", "Czy taki dystans byłby dobry na rower?", "Czy taki dystans pasowałby do codziennego dojazdu?", "Czy tyle kilometrów byłoby za dużo na spontaniczny spacer?", "Czy taki dystans dałoby się pokonać w godzinę?", "Czy taka odległość pasowałaby do wycieczki za miasto?", "Czy taki dystans brzmiałby jak podróż między miastami?", "Czy tyle kroków można zrobić podczas dnia w domu?"],
  ["Czy tyle osób zmieściłoby się przy dużym stole?", "Czy taka liczba gości pasowałaby do rodzinnej uroczystości?", "Czy tyle osób byłoby za dużo w małym mieszkaniu?", "Czy taka liczba krzeseł pasowałaby do sali lekcyjnej?", "Czy tyle walizek byłoby kłopotliwe w pociągu?", "Czy taka liczba prezentów wyglądałaby hojnie?", "Czy tyle talerzy wystarczyłoby na większą kolację?", "Czy taka liczba dekoracji byłaby przesadą na urodzinach?", "Czy tyle osób wystarczyłoby do drużyny?", "Czy taka liczba miejsc pasowałaby do małego samochodu?"],
  ["Czy tyle produktów byłoby dużymi zakupami spożywczymi?", "Czy taka liczba książek zmieściłaby się na półce?", "Czy tyle zdjęć z wyjazdu zanudziłoby znajomych?", "Czy tyle rzeczy zmieściłoby się w plecaku?", "Czy taka liczba wiadomości byłaby trudna do przeczytania?", "Czy tyle piosenek wystarczyłoby na playlistę na podróż?", "Czy taka liczba zadań byłaby dużym obciążeniem?", "Czy tyle ubrań wystarczyłoby na długi wyjazd?", "Czy taka liczba roślin byłaby trudna do pielęgnacji?", "Czy tyle pudeł wystarczyłoby do przeprowadzki?"],
  ["Czy taka liczba godzin nauki byłaby męcząca?", "Czy tyle zadań wystarczyłoby na pracowity dzień?", "Czy taka liczba lekcji byłaby trudna do zapamiętania?", "Czy tyle czasu pracy dziennie byłoby niezdrowe?", "Czy taka liczba spotkań zmieściłaby się w kalendarzu?", "Czy tyle maili czekałoby na odpowiedź po urlopie?", "Czy taka liczba egzaminów w sesji byłaby stresująca?", "Czy tyle stron wystarczyłoby na pracę domową?", "Czy taka liczba przerw poprawiłaby skupienie?", "Czy tyle godzin nauki wystarczyłoby do przygotowania prezentacji?"],
  ["Czy taka liczba sezonów serialu byłaby imponująca?", "Czy tyle odcinków wystarczyłoby na długi weekend?", "Czy taka długość filmu byłaby za duża na wieczór?", "Czy tyle minut koncertu zmęczyłoby publiczność?", "Czy taka liczba piosenek wystarczyłaby na imprezę?", "Czy tyle godzin grania byłoby przesadą w wolny dzień?", "Czy taka liczba poziomów oznaczałaby długą grę?", "Czy tyle książek przeczytanych w roku byłoby dobrym wynikiem?", "Czy taka liczba filmów w miesiącu wyglądałaby na dużo?", "Czy tyle minut podcastu pasowałoby do podróży?"],
  ["Czy taki wynik w meczu wyglądałby na wysokie zwycięstwo?", "Czy tyle treningów w tygodniu byłoby intensywne?", "Czy taki czas biegu byłby dobry dla początkującego?", "Czy tyle kilometrów na rowerze byłoby dobrym wyzwaniem?", "Czy taka liczba powtórzeń ćwiczenia byłaby męcząca?", "Czy tyle punktów w turnieju dawałoby awans?", "Czy taki wynik w rzucie byłby imponujący?", "Czy tyle meczów w weekend byłoby przesadą?", "Czy taka liczba zawodników wystarczyłaby do drużyny?", "Czy tyle minut rozgrzewki byłoby wystarczające?"],
  ["Czy taka liczba wizyt w sklepie w tygodniu byłaby nietypowa?", "Czy tyle kaw dziennie mogłoby przeszkadzać w śnie?", "Czy taka liczba spacerów w ciągu dnia byłaby zdrowym nawykiem?", "Czy tyle gotowania w tygodniu byłoby czasochłonne?", "Czy taka liczba kąpieli w miesiącu byłaby normalna?", "Czy tyle razy podlewać roślinę oznaczałoby upał?", "Czy taka liczba godzin snu w weekend byłaby przesadą?", "Czy tyle razy sprzątać w tygodniu byłoby bardzo często?", "Czy taka liczba dni bez wychodzenia z domu byłaby nietypowa?", "Czy tyle razy zamawiać jedzenie w miesiącu byłoby kosztowne?"],
  ["Czy taki dystans byłby dobry na codzienny spacer z psem?", "Czy tyle kilometrów pasowałoby do trasy autobusu miejskiego?", "Czy taka odległość byłaby wygodna do przejścia pieszo?", "Czy tyle kilometrów można przejechać rowerem po pracy?", "Czy taki dystans brzmiałby jak wycieczka za miasto?", "Czy tyle minut podróży byłoby wygodne bez samochodu?", "Czy taka odległość między sklepami byłaby uciążliwa?", "Czy tyle kilometrów dzieliłoby sąsiednie miejscowości?", "Czy taki dystans dałoby się pokonać hulajnogą?", "Czy tyle czasu wystarczyłoby na dojazd do pracy?"],
  ["Czy taka liczba procent baterii wystarczyłaby do wieczora?", "Czy tyle gigabajtów wystarczyłoby na zdjęcia z wyjazdu?", "Czy taka liczba aplikacji spowalniałaby telefon?", "Czy tyle plików byłoby trudne do uporządkowania?", "Czy taka liczba godzin przed ekranem byłaby przesadą?", "Czy tyle urządzeń podłączonych do sieci obciążyłoby router?", "Czy taka liczba obserwowanych kont utrudniałaby przeglądanie?", "Czy tyle powiadomień wyglądałoby na cyfrowy chaos?", "Czy taka liczba haseł byłaby trudna do zapamiętania?", "Czy tyle zdjęć zajęłoby dużo miejsca w pamięci?"],
  ["Czy taka liczba dni urlopu wystarczyłaby na odpoczynek?", "Czy tyle dni w hotelu byłoby dobrym wyjazdem?", "Czy taka liczba godzin lotu byłaby męcząca?", "Czy tyle walizek byłoby za dużo na krótki wyjazd?", "Czy taka liczba atrakcji zmieściłaby się w planie dnia?", "Czy tyle kilometrów trasy byłoby dobrym road tripem?", "Czy taka liczba przesiadek utrudniłaby podróż?", "Czy tyle zdjęć z wakacji byłoby trudne do wybrania?", "Czy taka liczba noclegów wystarczyłaby na zwiedzanie miasta?", "Czy tyle czasu na lotnisku byłoby irytujące?"],
  ["Czy taka liczba zwierząt byłaby za duża w mieszkaniu?", "Czy tyle spacerów dziennie wystarczyłoby dla aktywnego psa?", "Czy taka liczba godzin samotności byłaby trudna dla zwierzęcia?", "Czy tyle karmy wystarczyłoby na miesiąc?", "Czy taka liczba wizyt u weterynarza byłaby niepokojąca?", "Czy tyle zabawek byłoby przesadą dla kota?", "Czy taka liczba rybek zmieściłaby się w akwarium?", "Czy tyle czasu zabawy byłoby dobrym wynikiem?", "Czy taka liczba zwierząt wymagałaby dużego domu?", "Czy tyle dni opieki nad pupilem byłoby trudne podczas urlopu?"],
  ["Czy tyle prania w tygodniu byłoby dużo?", "Czy taka liczba naczyń po kolacji wymagałaby zmywarki?", "Czy tyle minut sprzątania wystarczyłoby na pokój?", "Czy taka liczba roślin wymagałaby codziennej opieki?", "Czy tyle mebli zmieściłoby się w małym pokoju?", "Czy taka liczba lamp byłaby przesadą w mieszkaniu?", "Czy tyle pudeł utrudniałoby przeprowadzkę?", "Czy taka liczba kluczy w kieszeni byłaby kłopotliwa?", "Czy tyle ręczników wystarczyłoby dla gości?", "Czy taka liczba domowych obowiązków byłaby przytłaczająca?"],
  ["Czy tyle osób na imprezie byłoby kameralnym spotkaniem?", "Czy taka liczba gości wymagałaby wynajęcia sali?", "Czy tyle zaproszeń wysłanych na urodziny byłoby dużo?", "Czy taka liczba prezentów zrobiłaby wrażenie?", "Czy tyle godzin imprezy byłoby męczące?", "Czy taka liczba osób zmieściłaby się przy grillu?", "Czy tyle porcji tortu wystarczyłoby dla gości?", "Czy taka liczba zdjęć z imprezy byłaby normalna?", "Czy tyle osób w grupowym czacie byłoby trudne do ogarnięcia?", "Czy taka liczba dni przygotowań byłaby potrzebna do wesela?"],
  ["Czy tyle stopni na zewnątrz wymagałoby czapki?", "Czy taka temperatura byłaby dobra na piknik?", "Czy tyle deszczu w ciągu dnia popsułoby spacer?", "Czy taka liczba dni bez deszczu byłaby suszą?", "Czy tyle śniegu utrudniłoby dojazd?", "Czy taka prędkość wiatru byłaby niebezpieczna?", "Czy tyle godzin słońca poprawiłoby humor?", "Czy taka liczba dni upału byłaby męcząca?", "Czy tyle chmur oznaczałoby pochmurny dzień?", "Czy taka temperatura byłaby dobra dla roślin na balkonie?"],
  ["Czy tyle stron byłoby krótką książką?", "Czy taka liczba rozdziałów oznaczałaby długą lekturę?", "Czy tyle minut audiobooka wystarczyłoby na drogę do pracy?", "Czy taka liczba piosenek wystarczyłaby na playlistę?", "Czy tyle utworów artysty znałby przeciętny fan?", "Czy taka liczba książek w roku byłaby dobrym wynikiem?", "Czy tyle minut muzyki zmieściłoby się na krótkiej płycie?", "Czy taka liczba rozdziałów byłaby odpowiednia dla dzieci?", "Czy tyle cytatów zapamiętałby fan filmu?", "Czy taka liczba tomów oznaczałaby dużą serię?"],
  ["Czy taka liczba poziomów oznaczałaby długą rozgrywkę?", "Czy tyle godzin gry w tygodniu byłoby dużo?", "Czy taki wynik wystarczyłby do odblokowania nagrody?", "Czy tyle punktów dawałoby wysokie miejsce w rankingu?", "Czy taka liczba graczy pasowałaby do drużyny?", "Czy tyle rund byłoby męczące podczas turnieju?", "Czy taki czas oczekiwania na mecz byłby irytujący?", "Czy tyle zwycięstw oznaczałoby dobrą serię?", "Czy taka liczba przedmiotów byłaby dużym ekwipunkiem?", "Czy tyle zadań dziennych byłoby trudne do wykonania?"],
  ["Czy tyle godzin snu byłoby zdrowe dla dorosłej osoby?", "Czy taka liczba kroków byłaby dobrym celem na dzień?", "Czy tyle minut ćwiczeń wystarczyłoby na trening?", "Czy taka liczba dni odpoczynku pomogłaby po chorobie?", "Czy tyle wody wystarczyłoby na aktywny dzień?", "Czy taka liczba godzin siedzenia byłaby niezdrowa?", "Czy tyle minut przerwy wystarczyłoby na regenerację?", "Czy taka liczba posiłków pasowałaby do całego dnia?", "Czy tyle godzin pracy bez przerwy byłoby szkodliwe?", "Czy taka liczba dni rekonwalescencji byłaby długa?"],
];

export const numberMysteryQuickQuestions = quickGroups.flat();

const cleanPlayers = players => [...new Set(Array.isArray(players) ? players : [])].slice(0, 2);
const phaseEnd = seconds => Date.now() + Math.max(10, Math.min(180, Number(seconds) || 30)) * 1000;
const other = (game, uid) => game.players.find(player => player !== uid) || "";
const normalizeQuestion = value => String(value || "").replace(/[\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);
const hasDigit = value => /\d/.test(String(value || ""));
const letter = "A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż";
const numberWords = new RegExp(`(?<![${letter}])(zero|jeden|jedna|jedno|jednego|jednej|jednym|dwa|dwie|dwóch|dwoch|trzy|trzech|cztery|czterech|pięć|piec|pięciu|pieciu|sześć|szesc|sześciu|szesciu|siedem|siedmiu|osiem|ośmiu|osmiu|dziewięć|dziewiec|dziewięciu|dziewieciu|dziesięć|dziesiec|dziesięciu|dziesieciu|sto|stu|tysiąc|tysiac|tysiąca|tysiaca|milion|miliona)(?![${letter}])`, "iu");
const directNumberQuestion = new RegExp(`(?<![${letter}])(numer|jaki mam|jaka mam|jaką mam|zgadnij mój|zgadnij moj|wpisz mój|wpisz moj)(?![${letter}])`, "iu");

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
    phaseEndsAt: phaseEnd(questionTime), winner: "", finished: false, privateHints:{}, oracleHints:{}, purchaseUses:{}, passUses:{},
  };
}

export const NumberMysteryEngine = {
  oracle(game, uid) {
    if (game.finished || game.phase === "result") return "Gra jest już zakończona.";
    if (!game.oracleHints || typeof game.oracleHints !== "object") game.oracleHints = {};
    const used = Array.isArray(game.oracleHints[uid]) ? game.oracleHints[uid] : [];
    if (used.length >= 2) return "Wyrocznia wykorzystała już obie podpowiedzi.";
    const number = Number(game.numbers?.[uid]);
    if (!Number.isFinite(number)) return "Twój numer nie jest jeszcze gotowy.";
    const thresholds = [75, 112];
    const threshold = thresholds[used.length];
    const text = number > threshold ? `Twój numer jest większy niż ${threshold}.` : `Twój numer jest równy lub mniejszy niż ${threshold}.`;
    game.oracleHints[uid] = [...used, text];
    game.passUses = game.passUses || {};
    game.passUses[uid] = { ...(game.passUses[uid] || {}), "number-oracle":used.length + 1 };
    return null;
  },
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
    if (game.roundMode === "race" && (game.phase !== "ask" || game.turnUid !== uid)) return "Możesz zgadywać tylko zamiast własnego pytania.";
    if (game.roundMode === "rounds" && game.phase !== "guess") return "Najpierw zakończcie ustaloną liczbę rund pytań.";
    if (game.roundMode === "rounds" && Number.isInteger(Number(game.guesses?.[uid]))) return "Twój numer został już zgadnięty.";
    const guess = Math.round(Number(value));
    if (!Number.isInteger(guess) || guess < 1 || guess > 150) return "Podaj liczbę od 1 do 150.";
    game.guesses = { ...(game.guesses || {}), [uid]: guess };
    addHistory(game, { asker: uid, question: "Próba odgadnięcia numeru", guess });
    if (game.roundMode === "race" && guess === Number(game.numbers?.[uid])) { game.phase = "result"; game.winner = uid; game.finished = true; return; }
    if (game.roundMode === "race") { rotate(game); return; }
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
  const guessAllowed = (game.roundMode === "race" && myTurn) || (game.roundMode === "rounds" && game.phase === "guess" && !Number.isInteger(Number(game.guesses?.[me])));
  const hintUsed=Boolean(game.purchaseUses?.[me]?.["number-hint"]), hint=game.privateHints?.[me], hintPurchase=inGamePurchaseById("number-hint");
  const oracleHints=Array.isArray(game.oracleHints?.[me]) ? game.oracleHints[me] : [], oracleOwned=hasGamePass(accounts?.[me], "number-oracle") && room.settings?.gamePassesEnabled !== false;
  const hintPanel=`${hint ? `<p class="number-mystery-private-hint">🔢 Twoja wskazówka: ${escapeHtml(hint)}</p>` : room.settings?.gamePurchases !== false && !hintUsed ? `<button class="ghost number-mystery-hint-button" data-number-mystery-hint>🔢 Wskazówka za ${hintPurchase?.price || 500}$</button>` : ""}${oracleHints.map((value,index)=>`<p class="number-mystery-private-hint oracle-hint">🧙 Wyrocznia ${index + 1}/2: ${escapeHtml(value)}</p>`).join("")}${oracleOwned && oracleHints.length < 2 ? `<button class="ghost number-mystery-hint-button" data-number-mystery-oracle>🧙 Użyj Wyroczni (${oracleHints.length}/2)</button>` : ""}`;
  root.innerHTML = `<main class="page number-mystery-page enter"><section class="panel number-mystery-panel"><p class="eyebrow">TAJEMNICZA LICZBA · ${game.roundMode === "rounds" ? `RUNDA ${Math.min(game.round, game.rounds)}/${game.rounds}` : "POLOWANIE"}</p><h1>Zgadnij swój numer</h1><div class="number-mystery-player-cards"><article class="number-mystery-player-card number-mystery-own-card"><span class="number-mystery-card-pin"></span><small>TWÓJ NUMER</small><strong>???</strong><b>${escapeHtml(name(accounts, me))}</b><em>Ukryty przed wszystkimi</em></article><article class="number-mystery-player-card number-mystery-opponent-card"><span class="number-mystery-card-pin"></span><small>NUMER PRZECIWNIKA</small><strong>${game.numbers?.[opponent] ?? "—"}</strong><b>${escapeHtml(name(accounts, opponent))}</b><em>Ten numer znasz</em></article></div><p class="muted number-mystery-card-note">Każdy zna numer przeciwnika, ale nie zna własnego. Pytaj pośrednio albo zgadnij zamiast pytania.</p><div class="number-mystery-status"><span>${game.phase === "guess" ? "Czas na końcowe typowanie" : myTurn ? "Twoja kolej — możesz zadać pytanie albo zgadnąć" : mustAnswer ? "Odpowiedz na pytanie" : "Czekamy na ruch przeciwnika"}</span><b data-number-mystery-countdown></b></div>${hintPanel}${composer}${guessAllowed ? `<form id="number-mystery-guess" class="number-mystery-guess"><label>Zgadnij zamiast pytania<input id="number-mystery-guess-input" type="number" min="1" max="150" placeholder="Wpisz liczbę od 1 do 150"><button class="primary">Zgaduję</button></label><small>Jeśli nie trafisz, ta tura przepada i kolej przechodzi na przeciwnika.</small></form>` : ""}<section class="number-mystery-history"><div class="section-intro"><div><p class="eyebrow">HISTORIA PYTAŃ</p><h2>Co już padło?</h2></div><span class="badge">${game.history?.length || 0}</span></div><ol>${history}</ol></section></section></main>`;
  root.querySelector("#number-mystery-question")?.addEventListener("submit", event => { event.preventDefault(); actions.numberMysteryAsk(root.querySelector("#number-mystery-input").value, expected); });
  root.querySelectorAll("[data-number-mystery-quick]").forEach(button => button.addEventListener("click", () => actions.numberMysteryAsk(button.textContent, expected)));
  root.querySelectorAll("[data-number-mystery-answer]").forEach(button => button.addEventListener("click", () => actions.numberMysteryAnswer(button.dataset.numberMysteryAnswer, expected)));
  root.querySelector("#number-mystery-guess")?.addEventListener("submit", event => { event.preventDefault(); actions.numberMysteryGuess(root.querySelector("#number-mystery-guess-input").value, expected); });
  root.querySelector("[data-number-mystery-hint]")?.addEventListener("click", () => actions.numberMysteryBuyHint());
  root.querySelector("[data-number-mystery-oracle]")?.addEventListener("click", () => actions.numberMysteryUseOracle());
  if (game.phase !== "result") { const countdown = root.querySelector("[data-number-mystery-countdown]"); const tick = () => { if (!countdown?.isConnected) return; const left = Math.max(0, Math.ceil((Number(game.phaseEndsAt || 0) - Date.now()) / 1000)); countdown.textContent = `${left}s`; if (!left) actions.numberMysteryTimeout(expected); else renderNumberMysteryGame.timer = setTimeout(tick, 500); }; tick(); }
}

export function renderNumberMysteryLobbySettings(room, isHost) {
  const s = { ...numberMysteryDefaults, ...(room.settings || {}) };
  return `<div class="number-mystery-settings"><label>Tryb pytań <select data-number-mystery-setting="communicationMode" ${isHost ? "" : "disabled"}><option value="free" ${s.communicationMode === "free" ? "selected" : ""}>Free chat — własne pytania</option><option value="quick" ${s.communicationMode === "quick" ? "selected" : ""}>Quick chat — gotowe pytania</option><option value="hybrid" ${s.communicationMode === "hybrid" ? "selected" : ""}>Free chat + quick chat</option></select></label><label>Warunek zwycięstwa <select data-number-mystery-setting="roundMode" ${isHost ? "" : "disabled"}><option value="race" ${s.roundMode !== "rounds" ? "selected" : ""}>Kto pierwszy odgadnie</option><option value="rounds" ${s.roundMode === "rounds" ? "selected" : ""}>Najbliżej po rundach</option></select></label><label>Czas na pytanie <select data-number-mystery-setting="questionTime" ${isHost ? "" : "disabled"}>${[15, 30, 45, 60].map(value => `<option value="${value}" ${Number(s.questionTime) === value ? "selected" : ""}>${value} sekund</option>`).join("")}</select></label>${s.roundMode === "rounds" ? `<label>Liczba rund pytań <select data-number-mystery-setting="rounds" ${isHost ? "" : "disabled"}>${[3, 5, 7, 10].map(value => `<option value="${value}" ${Number(s.rounds) === value ? "selected" : ""}>${value} rund</option>`).join("")}</select></label>` : ""}<p class="tiny">Gra jest dla dwóch osób. Nie wpisuj liczb ani ich nazw w pytaniach.</p></div>`;
}

export function stopNumberMysteryTimer() { clearTimeout(renderNumberMysteryGame.timer); renderNumberMysteryGame.timer = 0; }
