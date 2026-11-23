import { botDelay, botDifficulty, botIds, botShouldBeCorrect, isBotId } from "./bots.js?v=20261121-8";
import { categories } from "./categories.js?v=20260824-2";
import { normalizeAnswer } from "./utils.js?v=20261121-8";
import { pokemonDex } from "./pokemonData.js?v=20260804-2";
import { ImpostorEngine } from "./impostor.js?v=20261123-8";
import { IdentityEngine, identityBotResponse, identityBotTurn } from "./identity.js?v=20261121-11";
import { OtherQuestionEngine } from "./otherQuestion.js?v=20261121-8";
import { MostLikelyEngine } from "./mostLikely.js?v=20261121-8";
import { FriendshipTestEngine } from "./friendshipTest.js?v=20261121-8";
import { PoisonCandyEngine } from "./poisonCandy.js?v=20261121-9";
import { BombEngine, bombCategories } from "./bomb.js?v=20261121-8";
import { ClosestTruthEngine } from "./closestTruth.js?v=20261121-8";
import { applyPriceGuessAction, currentPriceGuessItem, priceGuessBotAnswer, priceGuessHasAnswer, priceGuessMode } from "./priceGuess.js?v=20261122-6";
import { applyCountryGuessAction, countryGuessMode, currentCountry } from "./countryGuess.js?v=20261122-5";
import { applyChartForecastAction, chartForecastMode, currentForecastChart } from "./chartForecast.js?v=20261121-20";
import { chartForecastBotDueAt, chartForecastBotLine } from "./chartForecastBot.js?v=20261123-15";
import { RankingEngine } from "./ranking.js?v=20261121-8";
import { FiveSecondsEngine, fiveSecondsCategories } from "./fiveSeconds.js?v=20261121-8";
import { ClockEngine } from "./clock.js?v=20261121-8";
import { PokemonEngine, pokemonAuctionCanBid, pokemonCandidates, typeRaceCandidates } from "./pokemon.js?v=20261123-13";
import { auctionBattleBotAction, battleTeam } from "./pokemonAuctionBattle.js?v=20261123-10";
import { auctionDuelNeedsBot } from "./pokemonAuctionDuel.js?v=20261123-10";
import { auctionBotBidLimit } from "./pokemonAuctionBot.js?v=20261123-16";
import { WavelengthEngine } from "./wavelength.js?v=20261121-9";
import { QuizEngine, quizQuestions } from "./quiz.js?v=20261121-8";
import { MathematicsEngine } from "./mathematics.js?v=20261121-8";
import { MarkerEngine } from "./marker.js?v=20261121-8";
import { SequenceEngine, markSequenceReady, timeoutSequenceCreation } from "./sequence.js?v=20261121-8";
import { FamilyEngine } from "./family.js?v=20261121-8";
import { WordChainEngine, wordChainBotWord } from "./wordChain.js?v=20261121-8";
import { CharadesEngine } from "./charades.js?v=20261121-8";
import { HangmanEngine, hangmanWordBank } from "./hangman.js?v=20261121-8";
import { NumberMysteryEngine } from "./numberMystery.js?v=20261121-9";
import { UniqueAnswerEngine } from "./uniqueAnswer.js?v=20261121-8";
import { LiarEngine } from "./liar.js?v=20261121-9";
import { FalseMessageEngine } from "./falseMessage.js?v=20261121-9";
import { SecretRuleEngine } from "./secretRule.js?v=20261121-9";
import { MusicDuelEngine, MusicArenaEngine } from "./music.js?v=20261123-7";
import { LyricsEngine } from "./lyrics.js?v=20261123-7";
import { PopularityEngine } from "./popularity.js?v=20261123-7";
import { SongSpotEngine } from "./deferredMusicModes.js?v=20261121-8";
import { BoardEngine, boardBotAction } from "./boardGames.js?v=20261123-19";
import { chessMode } from "./chessGame.js?v=20261121-8";
import { chessBotAction } from "./chessBot.js?v=20261123-17";
import { GUESS_PEOPLE_MODE } from "./guessPeople.js?v=20261121-8";
import { MinecraftEngine, minecraftBotAnswer } from "./minecraft.js?v=20261121-12";
import { serverNow } from "./firebase.js?v=20261123-8";
import { gameMomentKey } from "./roomLifecycle.js";
import { hangmanBotLetter, numberMysteryBotAction, randomBotChoice, sequenceBotGuess, shuffledBotChoices } from "./botDeduction.js?v=20261121-8";

const playersOf = room => Array.isArray(room?.players) ? room.players : Object.keys(room?.players || {});
const botsOf = room => botIds(room).filter(Boolean);
const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const array = value => Array.isArray(value) ? value : [];
function expired(game) {
  if (!game || game.finished) return false;
  const endsAt = game.variant === "full-test" && game.phase === "test" ? [game.testEndsAt]
    : [game.phaseEndsAt, game.guessEndsAt, game.countdownEndsAt, game.roundEndsAt, game.explodesAt, game.phase === "create" && game.createEndsAt];
  const now = game.boardMode===chessMode || ["pokemon-auction","pokemon-type-draw"].includes(game.mode) ? serverNow() : Date.now();
  return endsAt.some(value => Number(value || 0) > 0 && now >= Number(value));
}
const activeFrom = (game, keys = []) => keys.map(key => game?.[key]).find(Boolean) || "";
const orderUid = (game, keys = ["order", "turnOrder"], index = "turnIndex") => {
  for (const key of keys) {
    const list = game?.[key];
    if (Array.isArray(list) && list.length) return list[Number(game?.[index] || 0) % list.length] || "";
  }
  return "";
};
const isMissing = (map, uid) => !(uid in object(map));
const isPopularityChoiceMissing = (map, uid) => !["left", "right"].includes(object(map)[uid]);
const firstMissingBot = (room, map) => botsOf(room).find(uid => isMissing(map, uid)) || botsOf(room)[0] || "";
const chartBotDueAt = (room,uid) => chartForecastBotDueAt(room.game,uid,botDifficulty(room,uid).id);

/*
 * Select the actor that is actually able to move in the current phase. The
 * old controller only knew a few legacy names (currentPlayer/answering),
 * which made most modern engines silently receive no bot turn at all.
 */
export function botActor(room) {
  const game = room?.game;
  const bots = botsOf(room);
  if (!game || !bots.length) return "";
  if (room.gameMode === chartForecastMode) {
    if (game.phase !== "chart-draw" || serverNow() >= game.phaseEndsAt) return "";
    return bots.filter(uid => game.players.includes(uid) && isMissing(game.forecasts,uid))
      .sort((a,b) => chartBotDueAt(room,a)-chartBotDueAt(room,b))[0] || "";
  }
  if (room.gameMode === 'marker') {
    const uid=game.phase==='select'?game.turnUid:bots.includes(game.drawerUid)?game.drawerUid:game.seekerUid;
    return bots.includes(uid)?uid:'';
  }
  if (room.gameMode === "udowodnij") {
    const active = game.phase === "initialBid" ? game.starter : game.phase === "bidding" ? game.decisionPlayer : game.phase === "answering" ? game.currentBidder : "";
    return isBotId(active) && bots.includes(active) ? active : "";
  }
  if (game.mode === "wavelength" || room.gameMode === "wavelength") {
    if (game.phase === "clue") return bots.find(uid => uid !== game.guesserUid && !game.clues?.[uid]) || "";
    if (game.phase === "guess" && bots.includes(game.guesserUid)) return game.guesserUid;
  }
  if (room.gameMode === "falszywa-wiadomosc") {
    if (game.phase === "answering") return bots.find(uid => uid !== game.heroUid && isMissing(game.answers, uid)) || "";
    if (game.phase === "selecting" && isBotId(game.heroUid) && !game.selectedAnswerUid) return game.heroUid;
  }
  if (room.gameMode === "tajna-zasada") {
    if (game.phase === "rules") return bots.find(uid => !game.secretRules?.[uid]) || "";
    if (game.phase === "turn" && isBotId(game.turnUid)) return game.turnUid;
    if (["reviewExample", "reviewGuess"].includes(game.phase) && isBotId(game.reviewerUid)) return game.reviewerUid;
    if (game.phase === "guessing" && isBotId(game.guessUid)) return game.guessUid;
  }
  if (game.boardMode === GUESS_PEOPLE_MODE) {
    const actor = game.question ? game.targets?.[game.currentUid] : game.currentUid;
    return bots.includes(actor) ? actor : "";
  }
  if (room.gameMode===chessMode) {
    if (game.phase!=="playing" || game.finished) return "";
    if (game.chessDrawOffer && !bots.includes(game.chessDrawOffer)) return bots.find(uid=>game.players?.includes(uid)) || "";
    return bots.includes(game.currentUid) ? game.currentUid : "";
  }
  if (game.boardMode?.startsWith("board-")) {
    if (game.boardMode === "board-statki" && game.phase === "placement") return bots.find(uid => !game.placementSubmitted?.[uid]) || "";
    if (game.phase === "playing" && isBotId(game.currentUid) && bots.includes(game.currentUid)) return game.currentUid;
  }
  if (room.gameMode === "pojedynek-hitow") {
    if (game.phase === "selecting") return bots.find(uid => isMissing(game.submissions, uid)) || "";
    if (game.phase === "continueDecision") return bots.find(uid => isMissing(game.continueVotes, uid)) || "";
    if (game.phase === "voting") return bots.find(uid => isMissing(game.votes, uid)) || "";
  }
  if (room.gameMode === "bitwa-hitow") {
    if (game.phase === "selecting") return bots.find(uid => game.duelists?.includes(uid) && isMissing(game.submissions, uid)) || "";
    if (game.phase === "voting") return bots.find(uid => !game.duelists?.includes(uid) && isMissing(game.votes, uid)) || "";
  }
  if (room.gameMode === "number-mystery") {
    if (game.phase === "guess") return bots.find(uid => isMissing(game.guesses, uid)) || "";
    const actor = game.phase === "answer" ? game.responder : game.turnUid;
    return bots.includes(actor) ? actor : "";
  }
  if (room.gameMode === "impostor") {
    if (game.phase === "roleReveal") return bots.find(uid => !game.acknowledged?.[uid]) || "";
    if (game.phase === "voting") return bots.find(uid => isMissing(game.votes, uid)) || "";
    if (game.phase === "finalGuess") return bots.includes(game.result?.expelled) ? game.result.expelled : "";
  }
  if (room.gameMode === "test-znajomosci" && game.phase === "assigning") {
    return bots.find(uid => array(game.answerOrder).some(id => id !== uid && isMissing(game.guesses?.[uid], id))) || "";
  }
  if (room.gameMode === "mathematics" && game.phase === "test") return bots.find(uid => !game.completed?.[uid]) || "";
  if (room.gameMode === "quiz" && game.phase?.endsWith("-buzz")) return bots.find(uid => !game.eliminated?.includes(uid)) || "";
  if (room.gameMode === "pokemon-types" && game.phase === "choose") return bots.find(uid => isMissing(game.selectedTypes, uid)) || "";
  if (room.gameMode === "sequence" && game.phase === "create") return bots.find(uid => !game.ready?.[uid]) || "";
  if (room.gameMode === priceGuessMode && game.phase === "price-guess") return bots.find(uid=>!priceGuessHasAnswer(game,uid)) || "";
  if (room.gameMode === countryGuessMode && game.phase === "country-guess") return bots.find(uid=>!game.botPasses?.[uid]) || "";
  if (room.gameMode === "pokemon-auction") {
    if (game.phase === "auction-prep") return bots.find(uid => battleTeam(game, uid).length && !game.battle.prep?.[uid]?.ready) || "";
    if (game.battle?.duel) return bots.find(uid=>auctionDuelNeedsBot(game,uid)) || "";
    if (game.phase === "auction-battle") return bots.includes(game.battle.activeUid) ? game.battle.activeUid : "";
    return bots.find(uid => pokemonAuctionCanBid(game, uid)) || "";
  }
  if (room.gameMode === "pokemon-type-draw") return bots.find(uid => !game.raceBotMisses?.includes(uid)) || "";
  if (room.gameMode === "popularnosc-hitow" && game.phase === "choosing") return bots.find(uid => isPopularityChoiceMissing(game.choices, uid)) || "";
  if (room.gameMode === "dokoncz-tekst" && game.phase === "answering") return bots.find(uid => isMissing(game.answers, uid)) || "";
  if (room.gameMode === "songspot" && ["preview", "answering"].includes(game.phase)) return bots.find(uid => isMissing(game.answers, uid)) || "";
  if (room.gameMode === "charades" && game.phase === "acting") return bots.find(uid => uid !== game.actorUid && !(game.guesses || []).some(row => row.uid === uid)) || "";
  if (room.gameMode === "hangman" && game.phase === "guessing" && isBotId(game.currentUid)) return game.currentUid;
  if (room.gameMode?.startsWith("minecraft-")) {
    if (game.mode === "minecraft-truth" && game.phase === "question") return bots.find(uid => isMissing(game.answers, uid)) || "";
    if (game.phase === "turn" && isBotId(game.currentUid)) return game.currentUid;
  }
  if (room.gameMode === "kim-jestem" && game.phase === "responses") return bots.find(uid => uid !== game.pending?.uid && isMissing(game.responses, uid)) || "";
  if (game.phase === "voting") return bots.find(uid => isMissing(game.votes, uid)) || "";
  const direct = activeFrom(game, ["starter", "decisionPlayer", "currentBidder", "currentUid", "turnUid", "activeUid", "drawerUid", "seekerUid", "responder"]);
  if (isBotId(direct) && bots.includes(direct)) return direct;
  const ordered = orderUid(game);
  if (isBotId(ordered) && bots.includes(ordered)) return ordered;
  const playerList = playersOf(room);
  const describer = game.describerIndex == null ? "" : Array.isArray(game.order)
    ? game.order[Number(game.describerIndex) % game.order.length]
    : playerList[Number(game.describerIndex) % Math.max(1, playerList.length)] || "";
  if (isBotId(describer) && bots.includes(describer)) return describer;
  for (const map of [game.answers, game.votes, game.submissions, game.guesses, game.acknowledged, game.selectedTypes, game.poisonChoices]) {
    if (!map || typeof map !== "object" || Array.isArray(map)) continue;
    const uid = firstMissingBot(room, map);
    if (uid && isMissing(map, uid)) return uid;
  }
  if (game.phase === "create") return bots.find(uid => (game.drafts?.[uid] || []).length < Number(game.length || 0)) || bots[0];
  return bots[0];
}

const textAnswer = game => {
  const pool = array(game?.validAnswers).concat(array(game?.answerPool)).concat(array(game?.answers));
  const value = pool.find(item => typeof item === "string" && item.trim()) || "gotowe";
  return String(value).replace(/\[object Object\]/g, "gotowe");
};
const familyAnswer = game => {
  const question = game?.questions?.[Math.max(0, Number(game?.round || 1) - 1)];
  const revealed = new Set(array(game?.revealed));
  return array(question?.answers).find((item, index) => !revealed.has(index))?.[0] || array(question?.answers)[0]?.[0] || "jabłko";
};
const numberAnswer = game => Number(game?.target ?? game?.correctAnswer ?? game?.answer ?? game?.value ?? 50) || 50;
const uniqueAnswerPool = ["pies", "kot", "słoń", "samolot", "telefon", "plecak", "pizza", "morze", "las", "rower", "książka", "czekolada", "parasol", "film", "muzyka", "hotel", "kawa", "lody", "zamek", "rakieta", "góry", "piłka", "aparat", "kurtka"];
function uniqueAnswerBot(game, room, bot) {
  const used = new Set(Object.values(game?.answers || {}).map(value => String(value).trim().toLocaleLowerCase("pl-PL")));
  const same = [...used][0];
  // Lower difficulties occasionally copy an existing answer; higher ones
  // prefer an answer nobody has used yet, but keep a little natural variance.
  if (same && botDifficulty(room, bot).id === "easy" && Math.random() < .35) return same;
  const free = uniqueAnswerPool.filter(value => !used.has(value));
  return free[Math.floor(Math.random() * free.length)] || uniqueAnswerPool[Math.floor(Math.random() * uniqueAnswerPool.length)];
}
const sequenceItems = game => array(game?.set?.items || game?.items || game?.elements || game?.order);
const orderAnswer = game => sequenceItems(game).map(item => typeof item === "string" ? item : item?.id || item?.name).filter(Boolean);
const guard = game => ({ phase:game?.phase, phaseEndsAt:game?.phaseEndsAt, startedAt:game?.startedAt, countdownEndsAt:game?.countdownEndsAt, turnUid:game?.turnUid, turnIndex:game?.turnIndex });

function proveAnswer(game) {
  const category = categories.find(item => item.id === game?.categoryId);
  const task = category?.tasks?.find(item => item.id === game?.taskId);
  const used = new Set(array(game?.answers).map(item => String(item?.normalized || item?.raw || "").trim().toLowerCase()));
  return task?.answers?.find(answer => answer && !used.has(String(answer).trim().toLowerCase())) || "";
}

const quizById = new Map(quizQuestions.map(question => [question.id, question]));
function quizBotOption(game, knowsAnswer) {
  const question = quizById.get(game.questionIds?.[game.questionIndex]) || quizQuestions[0];
  return knowsAnswer ? question.answer : randomBotChoice(question.options.map((_, i) => i).filter(i => i !== question.answer));
}

function mathematicsBotOption(game, uid, knows) {
  const index = game.phase === "test" ? Number(game.progress?.[uid]) || 0 : game.questionIndex;
  const question = game.questions[index];
  if (game.answerMode === "abcd") {
    if (knows) return question.options.indexOf(question.answer);
    return randomBotChoice(question.options.map((option, i) => option === question.answer ? -1 : i).filter(i => i >= 0));
  }
  return knows ? question.answer : randomBotChoice(question.options.filter(option => option !== question.answer));
}

function fiveSecondsBotAnswer(game, room, uid) {
  const category = fiveSecondsCategories.find(item => item.id === game.categoryId);
  if (!category?.words.length) return "";
  const recent = new Set(array(game.history).filter(row => row.uid === uid && row.categoryId === category.id)
    .slice(-4).flatMap(row => array(row.accepted)).map(normalizeAnswer));
  const fresh = category.words.filter(word => !recent.has(normalizeAnswer(word)));
  const ranked = [...shuffledBotChoices(fresh), ...shuffledBotChoices(category.words.filter(word => !fresh.includes(word)))];
  const learned = ranked.slice(0, 3).filter(() => botShouldBeCorrect(room, uid));
  return learned.join(", ");
}

function pokemonEvolutionAnswers(game, pool, knowsAnswer) {
  const base = pokemonDex.find(item => item.id === game.baseId);
  if (!base) return [];
  const family = pool.filter(item => item.evolutionChain === base.evolutionChain && item.id !== base.id)
    .sort((a, b) => a.id - b.id);
  return family.slice(0, knowsAnswer ? 2 : 1).map(item => item.name);
}

function pokemonLastLetterChoice(game, pool, difficulty) {
  const previous = game.chain?.at(-1);
  const last = previous ? normalizeAnswer(previous.name).at(-1) : "";
  const used = new Set(game.usedIds || []);
  const available = pool.filter(item => !used.has(item.id));
  const matching = available.filter(item => normalizeAnswer(item.name).startsWith(last));
  if (difficulty === "easy" || matching.length < 2) return randomBotChoice(matching);
  const startingCounts = new Map();
  for (const item of available) {
    const first = normalizeAnswer(item.name)[0];
    startingCounts.set(first, (startingCounts.get(first) || 0) + 1);
  }
  const replies = item => {
    const name = normalizeAnswer(item.name);
    const end = name.at(-1);
    return (startingCounts.get(end) || 0) - Number(end === name[0]);
  };
  return randomBotChoice(shuffledBotChoices(matching).sort((a, b) => replies(a) - replies(b))
    .slice(0, difficulty === "expert" ? 1 : difficulty === "hard" ? 3 : 7));
}

function pokemonTypeChoice(game, pool) {
  const chosen = Object.values(game.selectedTypes || {});
  const compatible = pool.filter(item => chosen.every(type => item.types.includes(type)));
  const types = [...new Set(compatible.flatMap(item => item.types))];
  const newTypes = types.filter(type => !chosen.includes(type) && !game.blockedPairs?.includes([...new Set([...chosen, type])].join("+")));
  return randomBotChoice(newTypes.length ? newTypes : types) || "water";
}

function bombAnswer(game) {
  const categoryWords = bombCategories.find(category => category.id === game?.categoryId)?.words || game?.category?.words || game?.words;
  const used = new Set(array(game?.usedAnswers).map(value => String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
  return array(categoryWords).find(value => !used.has(String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))) || "pies";
}

const wavelengthCluePools = [
  ["Bardzo blisko lewego końca skali.","Prawie przy samym lewym końcu.","Skrajnie po lewej stronie."],
  ["Wyraźnie bliżej lewego końca niż środka.","Dość mocno w stronę lewego końca.","Po lewej, ale jeszcze nie skrajnie."],
  ["Trochę bliżej lewego końca, ale nadal z zapasem.","Lekko po lewej stronie środka.","Umiarkowanie w lewo od środka."],
  ["Prawie na środku, tylko odrobinę w lewo.","Lekko na lewo od środka.","Minimalnie bliżej lewej strony."],
  ["Prawie idealnie na środku.","Dokładnie okolice środka skali.","Mniej więcej po równo między końcami."],
  ["Prawie na środku, tylko odrobinę w prawo.","Lekko na prawo od środka.","Minimalnie bliżej prawej strony."],
  ["Trochę bliżej prawego końca, ale nadal z zapasem.","Umiarkowanie w prawo od środka.","Lekko po prawej stronie środka."],
  ["Wyraźnie bliżej prawego końca niż środka.","Dość mocno w stronę prawego końca.","Po prawej, ale jeszcze nie skrajnie."],
  ["Bardzo blisko prawego końca skali.","Prawie przy samym prawym końcu.","Skrajnie po prawej stronie."],
  ["Praktycznie na samym prawym końcu.","Niemal maksymalnie po prawej.","Prawie poza prawym końcem skali."]
];

const impostorClueWords = {
  "Jedzenie":["smak","sos","talerz","obiad","przepis"],
  "Warzywa":["ogród","sałatka","liście","stragan","witamina"],
  "Owoce":["sad","sok","słodkie","pestka","witamina"],
  "Zwierzęta":["łapy","futro","dzikie","ogon","las"],
  "Szkoła":["lekcja","klasa","nauczyciel","sprawdzian","przerwa"],
  "Dom":["pokój","meble","klucz","sprzątanie","sąsiad"],
  "Napoje":["szklanka","lód","smak","butelka","łyk"],
  "Podróże":["bagaż","mapa","hotel","lotnisko","wakacje"],
  "Podroze":["bagaż","mapa","hotel","lotnisko","wakacje"],
  "Miasta":["ulica","centrum","most","metro","rynek"],
  "Kraje":["granica","język","flaga","stolica","kultura"],
  "Sport":["mecz","trening","drużyna","stadion","wynik"],
  "Gry":["gracz","poziom","plansza","wynik","rozgrywka"],
  "Filmy i seriale":["aktor","scena","fabuła","odcinek","reżyser"],
  "Muzyka":["refren","koncert","rytm","słuchawki","melodia"],
  "Technologia":["ekran","aplikacja","internet","bateria","urządzenie"],
  "Aplikacje":["telefon","konto","wiadomość","powiadomienie","profil"],
  "Internet i memy":["sieć","post","komentarz","viral","obrazek"],
  "Minecraft":["kopalnia","blok","crafting","jaskinia","potwór"],
  "Roblox":["avatar","serwer","mapa","gra","przedmiot"],
  "Pokémon":["trener","walka","typ","ewolucja","pokeball"],
  "Moda":["ubranie","kolor","buty","styl","sklep"],
  "Praca":["biuro","szef","projekt","wypłata","spotkanie"],
  "Rzeczy codzienne":["rano","zakupy","dom","telefon","czas"],
  "Emocje":["radość","strach","złość","spokój","niespodzianka"],
  "Twórcy internetowi":["kanał","film","stream","widzowie","subskrypcja"]
};
const impostorSpecificClues = {
  pizza:["ser","ciasto","piekarnik","okrągłe","dostawa"], burger:["bułka","grill","sos","fast food","dłonie"], kebab:["lawasz","sos","budka","mięso","noc"],
  rosół:["bulion","marchew","niedziela","makaron","garnek"], pierogi:["farsz","lepienie","mąka","śmietana","barszcz"], sushi:["ryż","pałeczki","surowe","soja","Japonia"],
  frytki:["ziemniaki","sól","chrupiące","olej","fast food"], czekolada:["kakao","tabliczka","słodkie","czekolada","deser"],
  ziemniak:["bulwa","obieranie","gotowanie","placki","warzywo"], pomidor:["czerwone","sałatka","sok","pestki","warzywo"], ogórek:["zielone","kiszenie","sałatka","chrupiące","warzywo"],
  jabłko:["sad","skórka","chrupiące","owoc","szarlotka"], arbuz:["lato","pestki","soczyste","skórka","owoc"], mango:["tropiki","słodkie","pestka","żółte","owoc"],
  pies:["smycz","szczeka","łapy","spacer","zwierzę"], kot:["mruczenie","wąsy","kuweta","drapanie","zwierzę"], lew:["grzywa","sawanna","ryczenie","drapieżnik","stado"], rekin:["płetwa","ocean","zęby","głębia","drapieżnik"],
  zeszyt:["kartki","notatki","linia","szkoła","okładka"], długopis:["atrament","pisanie","wkład","biurko","szkoła"], matematyka:["liczby","zadanie","wzory","lekcja","obliczenia"], plecak:["ramiona","zamek","książki","szkoła","kieszeń"],
  telefon:["ekran","połączenie","aplikacja","kieszeń","ładowanie"], laptop:["klawiatura","praca","ekran","bateria","biurko"], klawiatura:["klawisze","pisanie","spacja","biurko","enter"], słuchawki:["dźwięk","uszy","muzyka","kabel","głośność"], wifi:["router","zasięg","internet","hasło","sygnał"],
  minecraft:["bloki","kopanie","crafting","creeper","piksel"], fortnite:["skórki","budowanie","battle royale","wyspa","sezon"], roblox:["avatar","serwery","obby","platforma","gry"],
  "harry potter":["magia","różdżka","szkoła","czary","blizna"], shrek:["bagno","ogre","bajka","osioł","zielony"], "star wars":["kosmos","miecz","galaktyka","moc","roboty"], marvel:["bohaterowie","komiks","uniwersum","supermoce","kino"],
  gitara:["struny","akordy","instrument","koncert","muzyka"], spotify:["playlista","streaming","słuchawki","piosenki","aplikacja"], rap:["rym","bit","zwrotka","mikrofon","muzyka"], koncert:["scena","publiczność","bilety","głośno","muzyka"],
  "piłka nożna":["bramka","boisko","mecz","korki","sędzia"], koszykówka:["kosz","piłka","parkiet","rzut","mecz"], tenis:["rakieta","kort","siatka","serwis","mecz"], rower:["pedały","kask","koła","trasa","jazda"],
  Warszawa:["stolica","Wisła","centrum","Polska","metro"], Kraków:["Wawel","Rynek","smok","Małopolska","turystyka"], Paryż:["wieża","Francja","metro","moda","stolica"], Tokio:["Japonia","wieżowce","metro","tłum","technologia"],
  kubek:["ucho","napój","stół","ceramika","kuchnia"], widelec:["sztućce","zęby","obiad","kuchnia","metal"], kanapa:["salon","siedzenie","poduszki","meble","relaks"], parasol:["deszcz","rączka","pogoda","mokro","składany"],
  YouTube:["film","kanał","subskrypcja","twórca","wideo"], TikTok:["krótkie filmy","pionowo","trend","muzyka","aplikacja"], discord:["serwer","kanał","rozmowa","głos","społeczność"], mem:["internet","żart","obrazek","viral","humor"],
  Creeper:["wybuch","zielony","Minecraft","noc","potwór"], diament:["kopalnia","niebieski","rzadkie","klejnot","Minecraft"], Nether:["portal","lava","wymiar","Minecraft","ogień"],
  Pikachu:["elektryczny","żółty","Pokemon","uszy","iskry"], Charmander:["ogień","ogon","Pokemon","smok","płomień"], Mewtwo:["legendarny","psychiczny","Pokemon","laboratorium","moc"],
  cola:["gazowane","puszka","lód","napój","słodkie"], herbata:["kubek","gorące","liście","napój","czajnik"], kawa:["rano","filiżanka","kofeina","gorące","ziarna"], pizza:["ser","ciasto","piekarnik","okrągłe","dostawa"],
  lodówka:["zimne","kuchnia","jedzenie","drzwi","półki"], szampon:["włosy","łazienka","piana","mycie","butelka"], klucz:["zamek","drzwi","metal","kieszeń","otwieranie"],
  hotel:["pokój","nocleg","recepcja","wakacje","rezerwacja"], lotnisko:["samolot","walizka","odprawa","terminal","podróż"], mapa:["droga","kierunek","trasa","papier","nawigacja"],
  Netflix:["serial","ekran","subskrypcja","seans","platforma"], Steam:["gry","biblioteka","komputer","zakup","platforma"], "Among Us":["impostor","statek","zadania","głosowanie","załoga"],
  radość:["uśmiech","szczęście","emocje","świętowanie","dobra wiadomość"], stres:["nerwy","presja","egzamin","napięcie","emocje"]
};
const clueKey = value => normalizeAnswer(value).replace(/[^a-z0-9]/g, "");
const impostorWordClues = new Map(Object.entries(impostorSpecificClues).map(([word, clues]) => [clueKey(word), clues]));
const pick = values => values[Math.floor(Math.random() * values.length)] || "";
function impostorBotClue(game, room, bot) {
  const category = String(game?.category || "").trim();
  const word = normalizeAnswer(game.roles?.[bot]?.word);
  const used = new Set(array(game.clues).map(clue => normalizeAnswer(clue.text)));
  const safe = list => list.filter(clue => {
    const normalized = normalizeAnswer(clue);
    return normalized && !used.has(normalized) && (!word || !normalized.includes(word));
  });
  const specific = safe(impostorWordClues.get(clueKey(word)) || []);
  const generic = safe(impostorClueWords[category] || []);
  const preference = { easy: .3, normal: .62, hard: .82, expert: .92 }[botDifficulty(room, bot).id] || .62;
  const clues = Math.random() < preference ? [specific, generic] : [generic, specific];
  return pick(clues.find(list => list.length) || []) || (category ? `Kojarzy mi się z kategorią: ${category.toLowerCase()}` : "Mam skojarzenie, ale jeszcze się waham.");
}

function clueMatch(clue, tokens) {
  const words = normalizeAnswer(clue).split(" ");
  return words.some(word => word.length > 2 && tokens.has(word));
}

function impostorSuspect(game, uid, difficulty) {
  const others = game.turnOrder.filter(player => player !== uid);
  if (difficulty === "easy") return pick(others);
  const word = game.roles?.[uid]?.role === "citizen" ? game.roles[uid].word : "";
  const related = new Set((impostorWordClues.get(clueKey(word)) || []).flatMap(clue => normalizeAnswer(clue).split(" ")));
  const entries = array(game.clues);
  const ranked = shuffledBotChoices(others).map(player => {
    const clues = entries.filter(clue => clue.uid === player);
    const score = clues.reduce((sum, clue) => sum + (clue.missed ? 2 : related.size && !clueMatch(clue.text, related) ? 1 : 0), 0);
    return { player, score: clues.length ? score / clues.length : 1 };
  }).sort((a, b) => b.score - a.score);
  return pick(ranked.slice(0, difficulty === "normal" ? 2 : 1))?.player || pick(others);
}

function impostorFinalWord(game, uid) {
  const own = clueKey(game.roles?.[uid]?.word);
  const entries = array(game.clues).filter(clue => clue.uid !== uid && !clue.missed);
  const scored = [...impostorWordClues].filter(([word]) => word !== own).map(([word, clues]) => {
    const tokens = new Set(clues.flatMap(clue => normalizeAnswer(clue).split(" ")));
    const score = entries.filter(clue => clueMatch(clue.text, tokens)).length;
    return { word, score };
  }).sort((a, b) => b.score - a.score);
  if (!scored[0]?.score || scored[0].score === scored[1]?.score) return "";
  return Object.keys(impostorSpecificClues).find(word => clueKey(word) === scored[0].word);
}
const wavelengthExamples = {
  "gorace|zimne": ["kostka lodu", "sok z lodówki", "szklanka wody na stole", "kubek herbaty", "wrzątek"],
  "szybkie|wolne": ["ślimak na chodniku", "spacer z psem", "rower w mieście", "pociąg ekspresowy", "rakieta podczas startu"],
  "glosne|ciche": ["spadający płatek śniegu", "szept w bibliotece", "rozmowa przy stole", "motocykl", "start odrzutowca"],
  "jasne|ciemne": ["jaskinia bez latarki", "ulica w nocy", "pokój w pochmurny dzień", "stadion pod reflektorami", "słońce w południe"],
  "duze|male": ["ziarnko maku", "spinacz biurowy", "plecak", "autobus", "kontynent"],
  "wysokie|niskie": ["próg drzwi", "stołek", "dwupiętrowy dom", "wieżowiec", "Mount Everest"],
  "ciezkie|lekkie": ["piórko", "pusty kubek", "walizka na urlop", "pralka", "lokomotywa"],
  "slodkie|gorzkie": ["niesłodzone kakao", "czarna kawa", "ciemna czekolada", "dojrzałe mango", "syrop cukrowy"],
  "mokre|suche": ["piasek na pustyni", "ręcznik po suszeniu", "trawa o świcie", "gąbka po umyciu naczyń", "dno basenu"],
  "miekkie|twarde": ["granitowa płyta", "drewniany blat", "świeża bułka", "pianka do kąpieli", "puchowa poduszka"],
  "lato|zima": ["lepienie bałwana", "gołoledź", "pierwszy dzień wiosny", "wieczór pod namiotem", "plażowanie w sierpniu"],
  "miasto|wies": ["gospodarstwo na odludziu", "przystanek przy polu", "małe miasteczko", "galeria handlowa", "stacja metra na Manhattanie"],
  "tanie|drogie": ["prywatny odrzutowiec", "nowy samochód", "buty z porządnego sklepu", "bułka w piekarni", "guma do żucia na sztuki"],
  "spokojne|chaotyczne": ["ewakuacja w panice", "zatłoczony dworzec w szczycie", "niedzielne zakupy", "czytanie książki", "drzemka nad jeziorem"],
  "dlugie|krotkie": ["mrugnięcie okiem", "reklama w radiu", "odcinek serialu", "lot między kontynentami", "epoka lodowcowa"],
};
const examplePositions = [4, 25, 50, 75, 96];
const wavelengthBank = game => wavelengthExamples[(game.pair || []).map(normalizeAnswer).join("|")];

function wavelengthBotClue(game, room, bot) {
  const spread = { easy: 24, normal: 15, hard: 7, expert: 3 }[botDifficulty(room, bot).id] || 15;
  const approximate = Math.max(0, Math.min(100, Number(game.target) + (Math.random() - .5) * spread));
  const examples = wavelengthBank(game);
  if (examples) {
    const nearest = examplePositions.reduce((best, position, index) => Math.abs(position - approximate) < Math.abs(examplePositions[best] - approximate) ? index : best, 0);
    if (!game.pair.some(word => examples[nearest].toLocaleLowerCase("pl-PL").includes(word.toLocaleLowerCase("pl-PL")))) return examples[nearest];
  }
  const bucket = Math.max(0, Math.min(9, Math.floor(approximate / 10)));
  return randomBotChoice(wavelengthCluePools[bucket]);
}

function wavelengthBotPosition(game, room, bot) {
  const examples = (wavelengthBank(game) || []).map(normalizeAnswer);
  const estimates = [];
  for (const clue of Object.values(game.clues || {})) {
    const text = normalizeAnswer(clue);
    const example = examples.findIndex(value => value === text || text.includes(value));
    if (example !== -1) { estimates.push(examplePositions[example]); continue; }
    const pool = wavelengthCluePools.findIndex(list => list.some(value => normalizeAnswer(value) === text));
    if (pool !== -1) { estimates.push(pool * 10 + 5); continue; }
    const direction = /praw/.test(text) ? 1 : /lew/.test(text) ? -1 : 0;
    if (direction) estimates.push(50 + direction * (/skrajn|mocno/.test(text) ? 37 : /lekko|odrobin/.test(text) ? 14 : 27));
    else if (/srodk|polow/.test(text)) estimates.push(50);
  }
  const sorted = estimates.sort((a, b) => a - b);
  const estimate = sorted.length ? sorted[Math.floor((sorted.length - 1) / 2)] : 50;
  const spread = { easy: 28, normal: 17, hard: 8, expert: 3 }[botDifficulty(room, bot).id] || 17;
  return Math.round(Math.max(0, Math.min(100, estimate + (Math.random() - .5) * spread)));
}
function timeoutMutation(room, game, bot) {
  const settings = room.settings || {};
  const players = playersOf(room);
  switch (room.gameMode) {
    case "udowodnij":
      if (game.phase === "answering" && game.currentBidder === bot) return g => { g.phase = "result"; g.result = { success:false, loser:bot, text:`${bot} nie dal rady.` }; };
      return null;
    case "impostor": return g => ImpostorEngine.timeout(g, settings);
    case "kim-jestem": return g => IdentityEngine.timeout(g, settings, room.customWords);
    case "inne-pytanie": return g => OtherQuestionEngine.timeout(g, settings);
    case "kto-najpredzej": return g => MostLikelyEngine.timeout(g, players, settings);
    case "test-znajomosci": return g => FriendshipTestEngine.timeout(g, players, settings);
    case "zatruty-cukierek": return g => g.phase === "poisoning" ? PoisonCandyEngine.timeoutPoisoning(g, players, settings) : null;
    case "bomba": return g => BombEngine.timeout(g, "", players, settings, guard(game));
    case "najblizej-prawdy": return g => {
      players.forEach(uid => { if (!(uid in object(g.answers))) ClosestTruthEngine.answer(g, uid, numberAnswer(g), players, settings); });
    };
    case "ranking": return g => {
      players.forEach(uid => { if (!(uid in object(g.submissions))) RankingEngine.submit(g, uid, orderAnswer(g), players, settings); });
    };
    case "5-sekund": return g => FiveSecondsEngine.timeout(g, players, settings, guard(game));
    case "zegar": return g => game.phase === "countdown" ? ClockEngine.start(g, players, settings, guard(game)) : ClockEngine.timeout(g, players, settings, guard(game));
    case "pokemon-dex":
    case "pokemon-evolution":
    case "pokemon-types":
    case "pokemon-last-letter":
    case "pokemon-match-type":
    case "pokemon-type-draw":
    case "pokemon-auction": return g => PokemonEngine.timeout(g, bot, players, settings);
    case "wavelength": return g => WavelengthEngine.timeout(g, players, settings);
    case "quiz": return g => QuizEngine.timeout(g, players, settings);
    case "mathematics": return g => MathematicsEngine.timeout(g, players);
    case "family": return g => FamilyEngine.timeout(g);
    case "word-chain": return g => WordChainEngine.timeout(g);
    case "charades": return g => CharadesEngine.timeout(g);
    case "hangman": return g => HangmanEngine.timeout(g);
    case "sequence": return g => g.phase === "create" ? timeoutSequenceCreation(g, g.createEndsAt) : SequenceEngine.timeout(g, g.turnUid, g.guessEndsAt);
    case "number-mystery": return g => NumberMysteryEngine.timeout(g);
    case "unique-answer": return g => UniqueAnswerEngine.timeout(g, settings);
    case "klamca": return g => LiarEngine.timeout(g, settings);
    case "falszywa-wiadomosc": return g => FalseMessageEngine.timeout(g, settings);
    case "tajna-zasada": return g => SecretRuleEngine.timeout(g, settings);
    case "pojedynek-hitow": return g => MusicDuelEngine.timeout(g, settings);
    case "bitwa-hitow": return g => MusicArenaEngine.timeout(g, settings);
    case "dokoncz-tekst": return g => LyricsEngine.timeout(g, settings);
    case "popularnosc-hitow": return g => PopularityEngine.timeout(g);
    case "minecraft-sprint":
    case "minecraft-crafting":
    case "minecraft-mob":
    case "minecraft-biome":
    case "minecraft-truth":
    case "minecraft-redstone": return g => MinecraftEngine.timeout(g, players, settings);
    case "songspot": return g => SongSpotEngine.timeout(g, settings);
    case GUESS_PEOPLE_MODE: return g => BoardEngine.action(g, g.currentUid, "timeout", "", players, settings);
    default:
      if (room.gameMode?.startsWith("board-")) return g => BoardEngine.action(g, bot, "timeout", "", players, settings);
      return null;
  }
}

export function botMutation(room) {
  const game = room?.game;
  const players = playersOf(room);
  if (!game || !players.length || !botsOf(room).length) return null;
  if (room.gameMode === "wavelength" && !game.guesserUid) game.guesserUid = players[1] || players[0] || "";
  let bot = botActor(room);
  if (room.gameMode === chartForecastMode) {
    if (!bot) return null;
    const chart = currentForecastChart(game);
    if (!chart) return null;
    const visible = {history:chart.values.slice(0,chart.cut+1), horizon:chart.labels.length-chart.cut-1, scale:chart.scale, unit:chart.unit};
    const key = `${game.siteGameId || game.phaseEndsAt}:${game.round}:${chart.id}:${bot}`;
    const forecast = chartForecastBotLine(visible,botDifficulty(room,bot).id,key);
    return g => applyChartForecastAction(g,bot,"submit",forecast,players,serverNow());
  }
  const settings = room.settings || {};
  const correct = () => botShouldBeCorrect(room, bot);

  // Never submit a late answer. Engines that own a timeout get first chance
  // to advance the round; this is what was missing when the UI displayed 0s.
  if (expired(game)) {
    const timeout = timeoutMutation(room, game, bot);
    if (timeout) return timeout;
  }

  try {
    switch (room.gameMode) {
      case "udowodnij":
        if (game.phase === "initialBid" && game.starter === bot) return g => { g.currentBid = Math.max(1, Math.min(Number(g.maxBid || 5), 1 + Math.floor(Math.random() * 4))); g.phase = "bidding"; g.currentBidder = bot; g.decisionPlayer = players[(players.indexOf(bot) + 1) % players.length]; g.phaseEndsAt = serverNow() + Math.max(1, Math.round(Number(settings.answerTime || 20) / 2)) * 1000; };
        if (game.phase === "bidding" && game.decisionPlayer === bot) return g => { if (correct() && Math.random() < .45) { g.currentBid = Number(g.currentBid || 1) + 1; g.currentBidder = bot; g.decisionPlayer = players[(players.indexOf(bot) + 1) % players.length]; g.phaseEndsAt = serverNow() + Math.max(1, Math.round(Number(settings.answerTime || 20) / 2)) * 1000; } else { g.phase = "answering"; g.requiredCount = g.currentBid || 1; g.answers = []; g.validCount = 0; g.phaseEndsAt = serverNow() + Math.max(1, Number(settings.answerTime || 20)) * 1000; } };
        if (game.phase === "answering" && game.currentBidder === bot) return g => {
          const attempts = array(g.answers).length;
          const rawValid = proveAnswer(g);
          const shouldSurrender = !rawValid || Math.random() < (attempts === 0 ? .14 : .08);
          if (shouldSurrender) { g.phase = "result"; g.result = { success:false, loser:bot, text:`${bot} poddał się — nie znał już kolejnej odpowiedzi.` }; return; }
          const valid = correct(), raw = valid ? rawValid : "nie wiem";
          const answers = array(g.answers);
          answers.push({ raw:String(raw), normalized:String(raw).toLowerCase(), valid });
          g.answers = answers; g.validCount = answers.filter(item => item.valid).length;
          if (g.validCount >= Number(g.requiredCount || 1)) { g.phase = "result"; g.result = { success:true, loser:null, text:`${bot} udowodnil!` }; }
        };
        break;
      case "impostor":
        if (game.phase === "roleReveal" && bot && !game.acknowledged?.[bot]) return g => ImpostorEngine.acknowledge(g, bot, settings);
        if (game.phase === "clues" && orderUid(game, ["turnOrder"]) === bot) return g => ImpostorEngine.clue(g, bot, impostorBotClue(g, room, bot), settings);
        if (game.phase === "continueDecision" && bot && isMissing(game.continueVotes, bot)) return g => ImpostorEngine.decide(g, bot, g.roles?.[bot]?.role !== "citizen" && !impostorFinalWord(g, bot), settings);
        if (game.phase === "voting" && bot && isMissing(game.votes, bot)) return g => ImpostorEngine.vote(g, bot, impostorSuspect(g, bot, botDifficulty(room, bot).id));
        if (game.phase === "finalGuess" && bot && game.result?.expelled === bot) return g => {
          const word = impostorFinalWord(g, bot);
          return word ? ImpostorEngine.finalGuess(g, bot, word) : ImpostorEngine.finalSurrender(g, bot);
        };
        break;
      case "kim-jestem":
        if (game.phase === "turn" && orderUid(game, ["order"]) === bot) return g => {
          const move = identityBotTurn(g, bot, settings, room.customWords, botDifficulty(room, bot).id);
          if (move) return IdentityEngine.submit(g, bot, move.text, move.type, settings, room.customWords);
        };
        if (game.phase === "responses" && bot && game.pending?.uid !== bot) return g => IdentityEngine.respond(g, bot, identityBotResponse(g, settings, room.customWords), settings, room.customWords);
        break;
      case "inne-pytanie":
        if (game.phase === "answering" && isMissing(game.answers, bot)) return g => OtherQuestionEngine.answer(g, bot, correct() ? "Tak" : "Nie wiem", settings);
        if (game.phase === "voting" && isMissing(game.votes, bot)) return g => OtherQuestionEngine.vote(g, bot, players.find(uid => uid !== bot) || players[0]);
        break;
      case "kto-najpredzej":
        if (game.phase === "writingQuestions" && isMissing(game.submissions, bot)) return g => MostLikelyEngine.submitQuestion(g, bot, correct() ? "Kto najpredzej pomoze innym?" : "Kto najpredzej sie spozni?", players, settings);
        if (game.phase === "voting" && isMissing(game.votes, bot)) return g => MostLikelyEngine.vote(g, bot, players.find(uid => uid !== bot) || players[0], players, settings);
        break;
      case "test-znajomosci":
        if (game.phase === "waitingForAnswers" && isMissing(game.answers, bot)) return g => FriendshipTestEngine.answer(g, bot, correct() ? "Tak" : "Nie", players, settings);
        if (game.phase === "assigning" && bot) return g => {
          const choices = Object.values(g.guesses?.[bot] || {});
          const available = shuffledBotChoices(players.filter(uid => uid !== bot && !choices.includes(uid)));
          for (const answerId of array(g.answerOrder)) {
            if (answerId === bot || !isMissing(g.guesses?.[bot], answerId)) continue;
            const target = available.pop();
            if (target) FriendshipTestEngine.guess(g, bot, answerId, target, players);
          }
        };
        break;
      case "zatruty-cukierek":
        if (game.phase === "poisoning" && isMissing(game.poisonChoices, bot)) return g => PoisonCandyEngine.poison(g, bot, array(g.candies).filter(item => !item.poisoners?.length).slice(0, Number(settings.poisonedPerPlayer || 1)).map(item => item.id), players, settings);
        if (game.phase === "eating" && activeFrom(game, ["currentUid", "activeUid"]) === bot || game.phase === "eating" && orderUid(game, ["order"]) === bot) return g => PoisonCandyEngine.eat(g, bot, array(g.candies).find(item => !item.eatenBy && !array(item.poisoners).includes(bot))?.id);
        break;
      case "bomba":
        // Bomb accepts only words from the current category. Intelligence
        // changes the choice/timing, never sends an invalid submission that
        // would leave the bot stuck on the same turn forever.
        if (game.phase === "answering" && orderUid(game, ["order"]) === bot) return g => BombEngine.answer(g, bot, bombAnswer(g), players, settings);
        break;
      case "najblizej-prawdy":
        if (game.phase === "answering" && isMissing(game.answers, bot)) return g => ClosestTruthEngine.answer(g, bot, correct() ? numberAnswer(g) : numberAnswer(g) + 17, players, settings);
        break;
      case countryGuessMode:
        if (bot && game.phase==="country-guess" && currentCountry(game) && serverNow()<game.phaseEndsAt) {
          return g=>{
            if (correct()) return applyCountryGuessAction(g,bot,"guess",currentCountry(g).name,players,serverNow());
            (g.botPasses ||= {})[bot] = true;
          };
        }
        break;
      case priceGuessMode:
        if (game.phase==="price-guess" && !priceGuessHasAnswer(game,bot) && currentPriceGuessItem(game)) {
          const guess=priceGuessBotAnswer(game,botDifficulty(room,bot).id);
          return g=>applyPriceGuessAction(g,bot,"guess",guess,players,serverNow());
        }
        break;
      case "ranking":
        if (game.phase === "ranking" && isMissing(game.submissions, bot)) return g => RankingEngine.submit(g, bot, orderAnswer(g), players, settings);
        break;
      case "5-sekund":
        if (game.phase === "prepare" || game.phase === "prompt") return g => FiveSecondsEngine.advance(g, players, settings, guard(game));
        if (game.phase === "turn" && game.activeUid === bot) return g => FiveSecondsEngine.answer(g, bot, fiveSecondsBotAnswer(g, room, bot), players, settings, guard(game));
        break;
      case "zegar":
        if (game.phase === "countdown") return g => ClockEngine.start(g, players, settings, guard(game));
        if (game.phase === "running" && !game.stops?.[bot]) return g => ClockEngine.stop(g, bot, players, settings, guard(game));
        break;
      case "pokemon-dex":
        if (game.phase === "answers" && isMissing(game.answers, bot)) return g => {
          const spread = { easy: 130, normal: 65, hard: 28, expert: 8 }[botDifficulty(room, bot).id] || 65;
          const target = g.target + Math.round((Math.random() - Math.random()) * spread);
          const entry = pokemonCandidates(settings).reduce((best, item) => !best || Math.abs(item.id - target) < Math.abs(best.id - target) ? item : best, null);
          return entry && PokemonEngine.answer(g, bot, entry.name, players, settings);
        };
        break;
      case "pokemon-evolution":
        if (game.phase === "answers" && isMissing(game.answers, bot)) return g => {
          const pool = pokemonCandidates(settings).filter(item => settings.evolutionMode !== "later" || item.id > g.baseId);
          const answers = pokemonEvolutionAnswers(g, pool, correct());
          if (answers.length) return PokemonEngine.answer(g, bot, answers, players, settings);
        };
        break;
      case "pokemon-last-letter":
        if (game.phase === "chain" && orderUid(game, ["order"]) === bot) return g => {
          const item = pokemonLastLetterChoice(g, pokemonCandidates(settings), botDifficulty(room, bot).id);
          return item ? PokemonEngine.answer(g, bot, item.name, players, settings) : PokemonEngine.timeout(g, bot, players, settings);
        };
        break;
      case "pokemon-types":
        if (game.phase === "choose" && isMissing(game.selectedTypes, bot)) return g => PokemonEngine.selectType(g, bot, pokemonTypeChoice(g, pokemonCandidates(settings)), players, settings);
        if (game.phase === "answer" && isMissing(game.answers, bot)) return g => {
          const picked = Object.values(g.selectedTypes);
          const item = randomBotChoice(pokemonCandidates(settings).filter(entry => picked.every(type => entry.types.includes(type))));
          if (item) return PokemonEngine.answer(g, bot, item.name, players, settings);
        };
        break;
      case "pokemon-match-type":
        if (game.phase === "answers" && isMissing(game.answers, bot)) { const target = pokemonDex.find(item => item.id === game.target); return g => PokemonEngine.matchType(g, bot, correct() ? target?.types || [] : ["normal"], players, settings); }
        break;
      case "pokemon-type-draw":
        if (game.phase === "type-race" && bot) return g => {
          const item = correct() && randomBotChoice(typeRaceCandidates(g.drawnTypes, settings, g));
          if (item) return PokemonEngine.answer(g, bot, item.name, players, settings);
          g.raceBotMisses = [...(g.raceBotMisses || []),bot];
        };
        break;
      case "pokemon-auction":
        if (bot && (game.battle?.duel || ["auction-prep","auction-battle"].includes(game.phase))) return g => auctionBattleBotAction(g, bot, players, serverNow());
        if (pokemonAuctionCanBid(game, bot)) return g => {
          const offer = Number(g.currentBid || 0)+1;
          const limit = auctionBotBidLimit(g,bot,players,botDifficulty(room,bot).id);
          return offer<=limit ? PokemonEngine.bid(g,bot,offer,players) : PokemonEngine.pass(g,bot,players);
        };
        break;
      case "wavelength":
        if (game.phase === "clue" && bot && bot !== game.guesserUid && !game.clues?.[bot]) return g => WavelengthEngine.clue(g, bot, wavelengthBotClue(g, room, bot), players, settings);
        if (game.phase === "guess" && game.guesserUid === bot) return g => { const position=wavelengthBotPosition(g,room,bot); WavelengthEngine.move(g,bot,position); return WavelengthEngine.confirm(g,bot,players,settings); };
        break;
      case "quiz":
        if (game.variant === "casual" && game.phase === "question" && isMissing(game.answers, bot)) return g => QuizEngine.answer(g, bot, quizBotOption(g, correct()), players, settings);
        if (["r1"].includes(game.phase) && orderUid(game, ["order"]) === bot) return g => QuizEngine.answer(g, bot, quizBotOption(g, correct()), players, settings);
        if (["r2-buzz", "r3-buzz"].includes(game.phase) && !game.responder && bot) return g => QuizEngine.buzz(g, bot, players);
        if (["r2-answer", "r3-answer"].includes(game.phase) && game.responder === bot) return g => QuizEngine.answer(g, bot, quizBotOption(g, correct()), players, settings);
        if (game.phase === "r3-choose" && game.responder === bot) return g => QuizEngine.choose(g, bot, players.find(uid => uid !== bot && !game.eliminated?.includes(uid)) || players[0], players);
        break;
      case "mathematics":
        if (bot && ((game.phase === "question" && isMissing(game.answers, bot)) || (game.phase === "test" && !game.completed?.[bot]))) {
          return g => MathematicsEngine.answer(g, bot, mathematicsBotOption(g, bot, correct()), players);
        }
        break;
      case "marker":
        if (game.phase === "select" && game.turnUid === bot) return g => { const numbers=Array.isArray(g.numbers)?g.numbers:[]; const marked=g.marked&&typeof g.marked==="object"?g.marked:{}; const cell=numbers.findIndex((value,index)=>value!=null&&!marked[index]); return cell>=0 ? MarkerEngine.select(g,bot,cell) : MarkerEngine.timeout(g); };
        if (game.phase === "draw" && game.drawerUid === bot) return g => { const cell=Array.from({length:g.size*g.size},(_,i)=>i).find(i=>!g.coverage?.[bot]?.[i]); return MarkerEngine.coverage(g,bot,cell,[[[.15,.15],[.85,.85]],[[.85,.15],[.15,.85]]]); };
        if (game.phase === "draw" && game.seekerUid === bot) return g => MarkerEngine.find(g, bot, g.selectedCell);
        break;
      case "sequence":
        if (game.phase === "create" && bot && !game.ready?.[bot]) return g => {
          while (g.phase === "create" && array(g.drafts?.[bot]).length < g.length) {
            const error = SequenceEngine.draft(g, bot, randomBotChoice(g.colors));
            if (error) return error;
          }
          return markSequenceReady(g, bot);
        };
        if (game.phase === "guess" && game.turnUid === bot) return g => SequenceEngine.guess(g, bot, sequenceBotGuess(g, bot, botDifficulty(room, bot).id));
        break;
      case "family":
        if (game.phase === "wheel") return g => FamilyEngine.timeout(g);
        if (game.phase === "answer" && game.currentUid === bot) return g => FamilyEngine.answer(g, bot, correct() ? familyAnswer(g) : "nie wiem");
        break;
      case "word-chain":
        if (game.phase === "answer" && game.currentUid === bot) return g => {
          const word = wordChainBotWord(g);
          return correct() && word ? WordChainEngine.answer(g, bot, word) : WordChainEngine.timeout(g);
        };
        break;
      case "charades":
        if (game.phase === "acting" && bot !== game.actorUid && !(game.guesses || []).some(row => row.uid === bot)) {
          const correctGuess = botShouldBeCorrect(room, bot);
          const guesses = ["niebo", "rower", "śmieszna mina", "samochód", "taniec"];
          return g => CharadesEngine.guess(g, bot, correctGuess ? g.word : guesses[Math.floor(Math.random() * guesses.length)]);
        }
        break;
      case "hangman":
        if (game.phase === "guessing" && game.currentUid === bot) return g => {
          const letter = hangmanBotLetter(g, hangmanWordBank(g.category), botDifficulty(room, bot).id);
          return letter ? HangmanEngine.guess(g, bot, letter) : HangmanEngine.timeout(g, bot);
        };
        break;
      case "number-mystery":
        if (bot && ((game.phase === "ask" && game.turnUid === bot) || (game.phase === "answer" && game.responder === bot) || (game.phase === "guess" && isMissing(game.guesses, bot)))) return g => {
          const { action, value } = numberMysteryBotAction(g, bot, botDifficulty(room, bot).id);
          return NumberMysteryEngine[action](g, bot, value);
        };
        break;
      case "unique-answer":
        if (game.phase === "answering" && isMissing(game.answers, bot)) return g => UniqueAnswerEngine.answer(g, bot, uniqueAnswerBot(g, room, bot), settings);
        break;
      case "klamca":
        if (game.phase === "answering" && isMissing(game.answers, bot)) return g => LiarEngine.answer(g, bot, LiarEngine.botAnswer(g, bot), settings);
        if (game.phase === "voting" && isMissing(game.votes, bot)) return g => {
          const targets = players.filter(uid => uid !== bot && uid in object(g.answers));
          if (!targets.length) return null;
          const citizens = targets.filter(uid => uid !== g.liarUid);
          const shouldDetect = botShouldBeCorrect(room, bot) && Math.random() < .9;
          const target = bot === g.liarUid ? (citizens[0] || targets[0]) : (shouldDetect ? g.liarUid : targets[Math.floor(Math.random() * targets.length)]);
          return target ? LiarEngine.vote(g, bot, target) : null;
        };
        break;
      case "falszywa-wiadomosc":
        if (game.phase === "answering" && bot && bot !== game.heroUid && isMissing(game.answers, bot)) return g => FalseMessageEngine.answer(g, bot, FalseMessageEngine.botAnswer(g), settings);
        if (game.phase === "selecting" && bot && bot === game.heroUid && !game.selectedAnswerUid) return g => FalseMessageEngine.choose(g, bot, FalseMessageEngine.botChoose(g));
        break;
      case "tajna-zasada":
        if (game.phase === "rules" && bot && !game.secretRules?.[bot]) return g => SecretRuleEngine.setRule(g, bot, SecretRuleEngine.botRule(g, bot), settings);
        if (game.phase === "turn" && game.turnUid === bot) return g => SecretRuleEngine.canGuess(g, bot, settings) && Math.random() < .2 ? SecretRuleEngine.startGuess(g, bot, settings) : SecretRuleEngine.example(g, bot, SecretRuleEngine.botExample(g), settings);
        if (game.phase === "reviewExample" && game.reviewerUid === bot) return g => SecretRuleEngine.reviewExample(g, bot, Boolean(g.autoVerdict), settings);
        if (game.phase === "guessing" && game.guessUid === bot) return g => SecretRuleEngine.guess(g, bot, SecretRuleEngine.botGuess(g), settings);
        if (game.phase === "reviewGuess" && game.reviewerUid === bot) return g => SecretRuleEngine.reviewGuess(g, bot, Boolean(g.autoGuessCorrect), settings);
        break;
      case "pojedynek-hitow":
        if (game.phase === "selecting" && isMissing(game.submissions, bot)) return g => MusicDuelEngine.select(g, bot, MusicDuelEngine.botTrack(g, bot, botDifficulty(room, bot).id), settings);
        if (game.phase === "voting" && isMissing(game.votes, bot)) return g => {
          const target = MusicDuelEngine.botVote(g, bot, botDifficulty(room, bot).id);
          return target ? MusicDuelEngine.vote(g, bot, target) : null;
        };
        break;
      case "bitwa-hitow":
        if (game.phase === "selecting" && game.duelists?.includes(bot) && isMissing(game.submissions, bot)) return g => MusicArenaEngine.select(g, bot, MusicArenaEngine.botTrack(g, bot, botDifficulty(room, bot).id), settings);
        if (game.phase === "voting" && !game.duelists?.includes(bot) && isMissing(game.votes, bot)) return g => {
          const target = MusicArenaEngine.botVote(g, bot, botDifficulty(room, bot).id);
          return target ? MusicArenaEngine.vote(g, bot, target) : null;
        };
        break;
      case "popularnosc-hitow":
        if (bot && game.phase === "choosing" && isPopularityChoiceMissing(game.choices, bot)) return g => PopularityEngine.choose(g, bot, PopularityEngine.botChoice(g, botDifficulty(room, bot).id));
        break;
      case "dokoncz-tekst":
        if (game.phase === "answering" && isMissing(game.answers, bot)) return g => LyricsEngine.answer(g, bot, LyricsEngine.botAnswer(g, bot, correct(), botDifficulty(room, bot).id), players, settings);
        break;
      case "songspot":
        if (["preview", "answering"].includes(game.phase) && isMissing(game.answers, bot)) return g => SongSpotEngine.answer(g, bot, SongSpotEngine.botAnswer(g, bot, botDifficulty(room, bot).id));
        break;
      case "minecraft-sprint":
      case "minecraft-crafting":
      case "minecraft-mob":
      case "minecraft-biome":
      case "minecraft-redstone":
        if (game.phase === "turn" && game.currentUid === bot) return g => MinecraftEngine.answer(g, bot, minecraftBotAnswer(g, room, bot, correct(), botDifficulty(room, bot).id), players, settings);
        break;
      case "minecraft-truth":
        if (game.phase === "question" && isMissing(game.answers, bot)) return g => MinecraftEngine.answer(g, bot, minecraftBotAnswer(g, room, bot, correct(), botDifficulty(room, bot).id), players, settings);
        break;
      case GUESS_PEOPLE_MODE:
      case chessMode:
        if (bot && game.phase==="playing" && !game.finished) return g => {
          const action=chessBotAction(g,bot,botDifficulty(room,bot).id,g.phaseEndsAt-serverNow());
          if (action) return BoardEngine.action(g,bot,action.action,action.payload,players,settings);
        };
        break;
      case "board-chinczyk":
      case "board-slowotwor":
      case "board-statki":
      case "board-reversi":
      case "board-warcaby":
      case "board-cztery":
      case "board-memory":
      case "board-domino": {
        if (game.boardMode === "board-cztery" && game.currentUid === bot && !game.finished && game.phase === "playing") return g => {
          const move = boardBotAction(g, bot, botDifficulty(room, bot).id);
          if (move) return BoardEngine.action(g, bot, move.action, move.payload, players, settings);
        };
        const action = boardBotAction(game, bot, botDifficulty(room, bot).id);
        if (action) return g => BoardEngine.action(g, bot, action.action, action.payload, players, settings);
        break;
      }
      default: break;
    }
  } catch {
    // A stale remote phase must not stop the host bot loop. Timeout handling
    // below still gets a chance to advance the engine on the next tick.
  }
  return expired(game) ? timeoutMutation(room, game, bot) : null;
}

export function scheduleBot(room, { mutate, onDone }) {
  if (!room?.game || !botsOf(room).length) return false;
  const chart = room.gameMode === chartForecastMode;
  const chess = room.gameMode === chessMode;
  const bidding = room.gameMode === "pokemon-auction" && room.game.phase === "auction";
  if (!chart && !chess && !botMutation(room)) return false;
  const actor = botActor(room);
  if ((chart || chess) && !actor) return false;
  const scheduledActor = actor || botsOf(room)[0];
  const moment = gameMomentKey(room.game), hostUid = room.hostUid, mode = room.gameMode;
  const {currentBid,highestBidder} = room.game;
  const drawOffer = room.game.chessDrawOffer || "";
  const key = chart || bidding || chess ? JSON.stringify([room.roomId,hostUid,moment,actor,currentBid,highestBidder,drawOffer]) : mode==='marker'
    ? `${room.roomId}:marker:${room.game.turn}:${room.game.phase}:${scheduledActor}:${room.game.phaseEndsAt||0}:${scheduledActor===room.game.drawerUid?Object.keys(room.game.coverage?.[scheduledActor]||{}).length:0}`
    : `${room.roomId}:${room.updatedAt}:${room.game.phase}:${room.game.turnIndex || 0}:${room.game.turnUid || ""}:${room.game.phaseEndsAt || ""}`;
  const deadline = room.game.variant === "full-test" ? room.game.testEndsAt
    : room.game.guessEndsAt || (room.game.phase === "create" ? room.game.createEndsAt : room.game.phaseEndsAt);
  const timeLeft = Number(deadline || 0) - (chess || ["pokemon-auction","pokemon-type-draw",countryGuessMode].includes(room.gameMode) ? serverNow() : Date.now());
  const baseDelay = bidding ? (currentBid ? 600 : 850)+Math.round(Math.random()*450)
    : chess ? 650+Math.round(Math.random()*650) : botDelay(room, "answer", scheduledActor);
  const think = ["pokemon-type-draw",countryGuessMode].includes(room.gameMode) ? Math.max(2500,baseDelay) : baseDelay;
  const delay = chart ? Math.max(50,chartBotDueAt(room,actor)-serverNow())
    : expired(room.game) ? 80 : timeLeft > 0 ? Math.min(think, Math.max(80, timeLeft - 190)) : think;
  return { key, delay, run:() => Promise.resolve().then(() => mutate((game, currentRoom = room) => {
    if (currentRoom.hostUid !== hostUid || currentRoom.gameMode !== mode || gameMomentKey(game) !== moment) return;
    if ((chart || bidding || chess) && botActor({...currentRoom,game}) !== actor) return;
    if (bidding && (game.currentBid !== currentBid || game.highestBidder !== highestBidder)) return;
    if (chess && (game.chessDrawOffer || "") !== drawOffer) return;
    // Re-evaluate against the transaction snapshot, including expiry and votes
    // submitted while the bot was thinking. Never replay a captured answer.
    const freshMutation = botMutation({ ...currentRoom, game });
    return freshMutation?.(game);
  })).finally(() => onDone?.()) };
}
