import { botDelay, botIds, botShouldBeCorrect, isBotId } from "./bots.js?v=20260804-3";
import { categories } from "./categories.js?v=20260612-1";
import { pokemonDex } from "./pokemonData.js?v=20260804-2";
import { ImpostorEngine } from "./impostor.js?v=20260605-5";
import { IdentityEngine } from "./identity.js?v=20260611-1";
import { OtherQuestionEngine } from "./otherQuestion.js?v=20260605-4";
import { MostLikelyEngine } from "./mostLikely.js?v=20260612-1";
import { FriendshipTestEngine } from "./friendshipTest.js?v=20260605-1";
import { PoisonCandyEngine } from "./poisonCandy.js?v=20260605-6";
import { BombEngine, bombCategories } from "./bomb.js?v=20260621-1";
import { ClosestTruthEngine } from "./closestTruth.js?v=20260612-3";
import { RankingEngine } from "./ranking.js?v=20260612-2";
import { FiveSecondsEngine } from "./fiveSeconds.js?v=20260612-2";
import { ClockEngine } from "./clock.js?v=20260613-1";
import { PokemonEngine } from "./pokemon.js?v=20260804-15";
import { WavelengthEngine } from "./wavelength.js?v=20260804-1";
import { QuizEngine } from "./quiz.js?v=20260804-2";
import { MathematicsEngine } from "./mathematics.js?v=20260804-2";
import { MarkerEngine } from "./marker.js?v=20260804-1";
import { SequenceEngine } from "./sequence.js?v=20260804-1";
import { FamilyEngine } from "./family.js?v=20260804-1";
import { WordChainEngine, wordChainBotWord } from "./wordChain.js?v=20260804-5";

const playersOf = room => Array.isArray(room?.players) ? room.players : Object.keys(room?.players || {});
const botsOf = room => botIds(room).filter(Boolean);
const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const array = value => Array.isArray(value) ? value : [];
const expired = game => [game?.phaseEndsAt, game?.guessEndsAt, game?.countdownEndsAt, game?.roundEndsAt, game?.explodesAt].some(value => Number(value || 0) > 0 && Date.now() >= Number(value));
const activeFrom = (game, keys = []) => keys.map(key => game?.[key]).find(Boolean) || "";
const orderUid = (game, keys = ["order", "turnOrder"], index = "turnIndex") => {
  for (const key of keys) {
    const list = game?.[key];
    if (Array.isArray(list) && list.length) return list[Number(game?.[index] || 0) % list.length] || "";
  }
  return "";
};
const isMissing = (map, uid) => !(uid in object(map));
const firstMissingBot = (room, map) => botsOf(room).find(uid => isMissing(map, uid)) || botsOf(room)[0] || "";

/*
 * Select the actor that is actually able to move in the current phase. The
 * old controller only knew a few legacy names (currentPlayer/answering),
 * which made most modern engines silently receive no bot turn at all.
 */
export function botActor(room) {
  const game = room?.game;
  const bots = botsOf(room);
  if (!game || !bots.length) return "";
  if (game.phase === "responses") {
    const responder = bots.find(uid => uid !== game.pending?.uid && isMissing(game.responses, uid));
    if (responder) return responder;
  }
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
const numberAnswer = game => Number(game?.target ?? game?.correctAnswer ?? game?.answer ?? game?.value ?? 50) || 50;
const sequenceItems = game => array(game?.set?.items || game?.items || game?.elements || game?.order);
const orderAnswer = game => sequenceItems(game).map(item => typeof item === "string" ? item : item?.id || item?.name).filter(Boolean);
const guard = game => ({ phase:game?.phase, phaseEndsAt:game?.phaseEndsAt, startedAt:game?.startedAt, countdownEndsAt:game?.countdownEndsAt, turnUid:game?.turnUid, turnIndex:game?.turnIndex });

function proveAnswer(game) {
  const category = categories.find(item => item.id === game?.categoryId);
  const task = category?.tasks?.find(item => item.id === game?.taskId);
  return task?.answers?.find(Boolean) || "nie wiem";
}

function pokemonName(game, mode) {
  const base = pokemonDex.find(item => item.id === (game?.target || game?.baseId));
  if (mode === "pokemon-evolution") {
    const chain = pokemonDex.filter(item => item.evolutionChain === base?.evolutionChain).sort((a, b) => a.id - b.id);
    return chain.find(item => item.id !== base?.id)?.name || base?.name || "pikachu";
  }
  return base?.name || pokemonDex[0]?.name || "pikachu";
}

function pokemonEvolutionAnswers(game) {
  const base = pokemonDex.find(item => item.id === game?.baseId);
  return pokemonDex.filter(item => item.evolutionChain === base?.evolutionChain && item.id !== base?.id).sort((a, b) => a.id - b.id).slice(0, 2).map(item => item.name);
}

function bombAnswer(game) {
  const categoryWords = bombCategories.find(category => category.id === game?.categoryId)?.words || game?.category?.words || game?.words;
  const used = new Set(array(game?.usedAnswers).map(value => String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
  return array(categoryWords).find(value => !used.has(String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))) || "pies";
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
    case "pokemon-auction": return g => PokemonEngine.timeout(g, bot, players, settings);
    case "wavelength": return g => WavelengthEngine.timeout(g, players, settings);
    case "quiz": return g => QuizEngine.timeout(g, players, settings);
    case "mathematics": return g => MathematicsEngine.timeout(g, players);
    case "family": return g => FamilyEngine.timeout(g);
    case "word-chain": return g => WordChainEngine.timeout(g);
    case "sequence": return g => SequenceEngine.timeout(g, g.turnUid, g.guessEndsAt);
    default: return null;
  }
}

export function botMutation(room) {
  const game = room?.game;
  const players = playersOf(room);
  if (!game || !players.length || !botsOf(room).length) return null;
  let bot = botActor(room);
  const settings = room.settings || {};
  const correct = () => botShouldBeCorrect(room, bot);
  const missing = key => { bot = firstMissingBot(room, game[key]); return bot; };

  // Never submit a late answer. Engines that own a timeout get first chance
  // to advance the round; this is what was missing when the UI displayed 0s.
  if (expired(game)) {
    const timeout = timeoutMutation(room, game, bot);
    if (timeout) return timeout;
  }

  try {
    switch (room.gameMode) {
      case "udowodnij":
        if (game.phase === "initialBid" && game.starter === bot) return g => { g.currentBid = Math.max(1, Math.min(Number(g.maxBid || 5), 1 + Math.floor(Math.random() * 4))); g.phase = "bidding"; g.currentBidder = bot; g.decisionPlayer = players[(players.indexOf(bot) + 1) % players.length]; g.phaseEndsAt = Date.now() + 4000; };
        if (game.phase === "bidding" && game.decisionPlayer === bot) return g => { if (correct() && Math.random() < .45) { g.currentBid = Number(g.currentBid || 1) + 1; g.currentBidder = bot; g.decisionPlayer = players[(players.indexOf(bot) + 1) % players.length]; } else { g.phase = "answering"; g.requiredCount = g.currentBid || 1; g.answers = []; g.validCount = 0; } g.phaseEndsAt = Date.now() + Number(settings.answerTime || 20) * 1000; };
        if (game.phase === "answering" && game.currentBidder === bot) return g => {
          const valid = correct(), raw = valid ? proveAnswer(g) : "nie wiem";
          const answers = array(g.answers);
          answers.push({ raw:String(raw), normalized:String(raw).toLowerCase(), valid });
          g.answers = answers; g.validCount = answers.filter(item => item.valid).length;
          if (g.validCount >= Number(g.requiredCount || 1)) { g.phase = "result"; g.result = { success:true, loser:null, text:`${bot} udowodnil!` }; }
        };
        break;
      case "impostor":
        if (game.phase === "roleReveal" && !game.acknowledged?.[bot]) return g => ImpostorEngine.acknowledge(g, bot, settings);
        if (game.phase === "clues" && orderUid(game, ["turnOrder"]) === bot) return g => ImpostorEngine.clue(g, bot, correct() ? "To cos zwiazanego z tematem" : "Brzmi znajomo", settings);
        if (game.phase === "continueDecision" && game.decisionPlayer === bot) return g => ImpostorEngine.decide(g, bot, correct(), settings);
        if (game.phase === "voting" && !game.votes?.[bot]) return g => ImpostorEngine.vote(g, bot, players.find(uid => uid !== bot) || players[0]);
        if (game.phase === "finalGuess" && game.result?.expelled === bot) return g => correct() ? ImpostorEngine.finalGuess(g, bot, g.mainWord || "") : ImpostorEngine.finalSurrender(g, bot);
        break;
      case "kim-jestem":
        if (game.phase === "turn" && orderUid(game, ["order"]) === bot) return g => IdentityEngine.submit(g, bot, correct() ? "Czy jestem osoba?" : "nie wiem", correct() ? "question" : "guess", settings, room.customWords);
        if (game.phase === "responses" && game.pending && game.pending !== bot) return g => IdentityEngine.respond(g, bot, correct() ? "yes" : "no", settings, room.customWords);
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
        if (game.phase === "assigning" && !Object.keys(game.guesses?.[bot] || {}).length) { const answerId = game.answerOrder?.find(uid => uid !== bot); const target = players.find(uid => uid !== bot && uid !== answerId) || players[0]; return g => FriendshipTestEngine.guess(g, bot, answerId, target, players); }
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
      case "ranking":
        if (game.phase === "ranking" && isMissing(game.submissions, bot)) return g => RankingEngine.submit(g, bot, orderAnswer(g), players, settings);
        break;
      case "5-sekund":
        if (game.phase === "prepare" || game.phase === "prompt") return g => FiveSecondsEngine.advance(g, players, settings, guard(game));
        if (game.phase === "turn" && game.activeUid === bot) return g => FiveSecondsEngine.answer(g, bot, correct() ? "kot, pies, dom" : "x", players, settings, guard(game));
        break;
      case "zegar":
        if (game.phase === "countdown") return g => ClockEngine.start(g, players, settings, guard(game));
        if (game.phase === "running" && !game.stops?.[bot]) return g => ClockEngine.stop(g, bot, players, settings, guard(game));
        break;
      case "pokemon-dex":
      case "pokemon-evolution":
        if (game.phase === "answers" && isMissing(game.answers, bot)) return g => PokemonEngine.answer(g, bot, room.gameMode === "pokemon-evolution" ? pokemonEvolutionAnswers(g) : pokemonName(g, room.gameMode), players, settings);
        break;
      case "pokemon-last-letter":
        if (game.phase === "chain" && orderUid(game, ["order"]) === bot) {
          const last = String(game.chain?.at(-1)?.name || "").toLowerCase().replace(/[^a-z]/g, "").slice(-1);
          const item = pokemonDex.find(candidate => candidate.name.startsWith(last) && !game.usedIds?.includes(candidate.id));
          return g => PokemonEngine.answer(g, bot, item?.name || "pikachu", players, settings);
        }
        break;
      case "pokemon-types":
        if (game.phase === "choose" && isMissing(game.selectedTypes, bot)) return g => PokemonEngine.selectType(g, bot, "water", players, settings);
        if (game.phase === "answer" && isMissing(game.answers, bot)) return g => PokemonEngine.answer(g, bot, pokemonName(g, room.gameMode), players, settings);
        break;
      case "pokemon-match-type":
        if (game.phase === "answers" && isMissing(game.answers, bot)) { const target = pokemonDex.find(item => item.id === game.target); return g => PokemonEngine.matchType(g, bot, correct() ? target?.types || [] : ["normal"], players, settings); }
        break;
      case "pokemon-auction":
        if (game.phase === "auction" && !array(game.passed).includes(bot)) return g => correct() && Number(g.budgets?.[bot] || 0) > Number(g.currentBid || 0) + 10 ? PokemonEngine.bid(g, bot, Number(g.currentBid || 0) + 10, players) : PokemonEngine.pass(g, bot, players);
        break;
      case "wavelength":
        if (game.phase === "clue" && players[Number(game.describerIndex || 0) % Math.max(1, players.length)] === bot) return g => WavelengthEngine.clue(g, bot, "Cos umiarkowanego", players, settings);
        if (game.phase === "guess") return g => WavelengthEngine.move(g, 50);
        break;
      case "quiz":
        if (game.variant === "casual" && game.phase === "question" && isMissing(game.answers, bot)) return g => QuizEngine.answer(g, bot, correct() ? 0 : 1, players, settings);
        if (["r1"].includes(game.phase) && orderUid(game, ["order"]) === bot) return g => QuizEngine.answer(g, bot, correct() ? 0 : 1, players, settings);
        if (["r2-buzz", "r3-buzz"].includes(game.phase) && !game.responder) return g => QuizEngine.buzz(g, bot, players);
        if (["r2-answer", "r3-answer"].includes(game.phase) && game.responder === bot) return g => QuizEngine.answer(g, bot, correct() ? 0 : 1, players, settings);
        if (game.phase === "r3-choose" && game.responder === bot) return g => QuizEngine.choose(g, bot, players.find(uid => uid !== bot && !game.eliminated?.includes(uid)) || players[0], players);
        break;
      case "mathematics":
        if (game.phase === "question" && isMissing(game.answers, bot)) return g => MathematicsEngine.answer(g, bot, correct() ? (g.answerMode === "abcd" ? g.questions[g.questionIndex]?.options.indexOf(g.questions[g.questionIndex]?.answer) : g.questions[g.questionIndex]?.answer) : 0, players);
        break;
      case "marker":
        if (game.phase === "select" && game.turnUid === bot) return g => MarkerEngine.select(g, bot, g.numbers.findIndex((value, index) => value != null && !g.marked[index]));
        if (game.phase === "draw" && game.drawerUid === bot) return g => MarkerEngine.coverage(g, bot, correct() ? .9 : .2);
        if (game.phase === "draw" && game.seekerUid === bot) return g => MarkerEngine.find(g, bot);
        break;
      case "sequence":
        if (game.phase === "create") { bot = botsOf(room).find(uid => (game.drafts?.[uid] || []).length < Number(game.length || 0)) || bot; return g => SequenceEngine.draft(g, bot, g.colors?.[Math.floor(Math.random() * g.colors.length)]); }
        if (game.phase === "guess" && game.turnUid === bot) return g => SequenceEngine.guess(g, bot, correct() ? g.sequences?.[g.players.find(uid => uid !== bot)] || [] : g.colors.slice(0, g.length));
        break;
      case "family":
        if (game.phase === "wheel") return g => FamilyEngine.timeout(g);
        if (game.phase === "answer" && game.currentUid === bot) return g => FamilyEngine.answer(g, bot, correct() ? textAnswer(g) : "nie wiem");
        break;
      case "word-chain":
        if (game.phase === "answer" && game.currentUid === bot) return g => {
          const word = wordChainBotWord(g);
          return correct() && word ? WordChainEngine.answer(g, bot, word) : WordChainEngine.timeout(g);
        };
        break;
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
  const mutation = botMutation(room);
  if (!mutation) return false;
  const actor = botActor(room) || botsOf(room)[0];
  const key = `${room.roomId}:${room.updatedAt}:${room.game.phase}:${room.game.turnIndex || 0}:${room.game.turnUid || ""}:${room.game.phaseEndsAt || ""}`;
  const delay = expired(room.game) ? 80 : botDelay(room, "answer", actor);
  return { key, delay, run:() => mutate(mutation).finally(() => onDone?.()) };
}
