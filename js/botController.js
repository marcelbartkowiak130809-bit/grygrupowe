import { botDelay, botIds, botShouldBeCorrect, isBotId } from "./bots.js?v=20260804-3";
import { ImpostorEngine } from "./impostor.js?v=20260605-5";
import { IdentityEngine } from "./identity.js?v=20260611-1";
import { OtherQuestionEngine } from "./otherQuestion.js?v=20260605-4";
import { MostLikelyEngine } from "./mostLikely.js?v=20260612-1";
import { FriendshipTestEngine } from "./friendshipTest.js?v=20260605-1";
import { PoisonCandyEngine } from "./poisonCandy.js?v=20260605-6";
import { BombEngine } from "./bomb.js?v=20260621-1";
import { ClosestTruthEngine } from "./closestTruth.js?v=20260612-3";
import { RankingEngine } from "./ranking.js?v=20260612-2";
import { FiveSecondsEngine } from "./fiveSeconds.js?v=20260612-2";
import { ClockEngine } from "./clock.js?v=20260613-1";
import { PokemonEngine } from "./pokemon.js?v=20260804-13";
import { WavelengthEngine } from "./wavelength.js?v=20260804-1";
import { QuizEngine } from "./quiz.js?v=20260804-2";
import { MathematicsEngine } from "./mathematics.js?v=20260804-1";
import { MarkerEngine } from "./marker.js?v=20260804-1";
import { SequenceEngine } from "./sequence.js?v=20260804-1";
import { FamilyEngine } from "./family.js?v=20260804-1";
import { WordChainEngine, wordChainBotWord } from "./wordChain.js?v=20260804-3";

const actorKeys = ["starter", "currentPlayer", "currentPlayerId", "currentTurn", "turnPlayer", "activeUid", "activePlayer", "decisionPlayer", "currentBidder", "answeringPlayer", "clueGiver", "selector", "targetPlayer"];
const firstBot = (room, game) => actorKeys.map(key => game?.[key]).find(uid => isBotId(uid)) || botIds(room)[0];
const pick = (value, fallback = "") => Array.isArray(value) ? value[0] : value || fallback;
const textAnswer = game => String(pick(game?.validAnswers, pick(game?.answers, pick(game?.answerPool, "ok")))).replace(/\[object Object\]/g, "ok");
const numberAnswer = game => Number(game?.target ?? game?.correctAnswer ?? game?.answer ?? game?.value ?? 50) || 50;
const orderAnswer = game => [...(game?.items || game?.order || game?.elements || [])].map(item => typeof item === "string" ? item : item?.id || item?.name).filter(Boolean);
const expected = game => ({ phase:game?.phase, phaseEndsAt:game?.phaseEndsAt, activeUid:game?.activeUid, selectedCell:game?.selectedCell });

function timeoutFallback(game) { if (game?.phaseEndsAt) game.phaseEndsAt = Date.now() - 1; return true; }

export function botMutation(room) {
  const game=room?.game, bot=firstBot(room,game); if(!game||!bot)return null;
  const settings=room.settings||{}, players=room.players||[], guard=expected(game), correct=botShouldBeCorrect(room,bot);
  try {
    switch(room.gameMode) {
      case "udowodnij": return game.phase === "initialBid" && game.starter === bot ? g=>{g.currentBid=Math.max(1,Math.min(Number(g.maxBid||5),Math.round(1+Math.random()*4)));g.phase="bidding";g.currentBidder=bot;g.decisionPlayer=players[(players.indexOf(bot)+1)%players.length];g.phaseEndsAt=Date.now()+4000;} : game.phase === "bidding" && game.decisionPlayer === bot ? g=>{if(Math.random()<.45){g.phase="answering";g.currentBidder=bot;g.requiredCount=g.currentBid||1;g.answers=[];g.validCount=0;}else{g.currentBid=(g.currentBid||1)+1;g.currentBidder=bot;g.decisionPlayer=players[(players.indexOf(bot)+1)%players.length];}} : game.phase === "answering" && game.currentBidder === bot ? g=>{g.answers=[...(g.answers||[]),{text:textAnswer(g),valid:correct}];g.validCount=(g.answers||[]).filter(item=>item.valid).length;if(g.validCount>=(g.requiredCount||1))g.phase="result";} : null;
      case "impostor": return game.phase === "clues" && game.currentPlayer === bot ? g=>ImpostorEngine.clue(g,bot,correct?"ciekawy":"hmm",settings) : game.phase === "voting" && !game.votes?.[bot] ? g=>ImpostorEngine.vote(g,bot,players.find(uid=>!isBotId(uid))||players[0]) : game.phase === "continueDecision" && game.decisionPlayer === bot ? g=>ImpostorEngine.decide(g,bot,Math.random()<.65,settings) : game.phaseEndsAt ? g=>{g.phaseEndsAt=Date.now()-1;return true;} : null;
      case "kim-jestem": return game.phase === "clues" && game.currentPlayer === bot ? g=>IdentityEngine.submit(g,bot,correct?"moze":"nie wiem","clue",settings,room.customWords) : game.phaseEndsAt ? timeoutFallback : null;
      case "inne-pytanie": return game.phase === "answers" && game.currentPlayer === bot ? g=>OtherQuestionEngine.answer(g,bot,textAnswer(g),settings) : game.phase === "voting" && !game.votes?.[bot] ? g=>OtherQuestionEngine.vote(g,bot,players.find(uid=>!isBotId(uid))||players[0]) : game.phaseEndsAt ? timeoutFallback : null;
      case "kto-najpredzej": return game.phase === "answering" && !game.answers?.[bot] ? g=>MostLikelyEngine.submitQuestion(g,bot,textAnswer(g),players,settings) : game.phase === "voting" && !game.votes?.[bot] ? g=>MostLikelyEngine.vote(g,bot,players[Math.floor(Math.random()*players.length)],players,settings) : game.phaseEndsAt ? timeoutFallback : null;
      case "test-znajomosci": return game.phase === "answering" && game.currentPlayer === bot ? g=>FriendshipTestEngine.answer(g,bot,textAnswer(g),players,settings) : game.phase === "guessing" && !game.guesses?.[bot] ? g=>FriendshipTestEngine.guess(g,bot,game.answerId||"",players[0],players) : game.phaseEndsAt ? timeoutFallback : null;
      case "zatruty-cukierek": return game.phase === "poisoning" && !game.poisoned?.[bot] ? g=>PoisonCandyEngine.poison(g,bot,(g.candies||[]).slice(0,Math.max(1,Number(settings.poisonedPerPlayer)||1)).map(item=>item.id||item),players,settings) : game.phase === "eating" && game.currentPlayer === bot ? g=>PoisonCandyEngine.eat(g,bot,(g.candies||[]).find(item=>!item.eaten)?.id) : game.phaseEndsAt ? timeoutFallback : null;
      case "bomba": return game.phase === "answering" && game.activeUid === bot ? g=>BombEngine.answer(g,bot,correct?textAnswer(g):"x",players,settings) : game.phaseEndsAt ? timeoutFallback : null;
      case "najblizej-prawdy": return game.phase === "answering" && !game.answers?.[bot] ? g=>ClosestTruthEngine.answer(g,bot,correct?numberAnswer(g):numberAnswer(g)+Math.round(30+Math.random()*70),players,settings) : game.phaseEndsAt ? timeoutFallback : null;
      case "ranking": return game.phase === "answering" && !game.answers?.[bot] ? g=>RankingEngine.submit(g,bot,orderAnswer(g),players,settings) : game.phaseEndsAt ? timeoutFallback : null;
      case "5-sekund": return game.phase === "answering" && game.currentPlayer === bot ? g=>FiveSecondsEngine.answer(g,bot,correct?"kot, pies, koń":"x",players,settings,guard) : game.phaseEndsAt ? timeoutFallback : null;
      case "zegar": return game.phase === "running" && game.currentPlayer === bot ? g=>ClockEngine.stop(g,bot,players,settings,guard) : game.phase === "countdown" && game.currentPlayer === bot ? g=>ClockEngine.start(g,players,settings,guard) : null;
      case "pokemon-dex": case "pokemon-last-letter": case "pokemon-evolution": return game.phase === "answering" && (game.currentPlayer === bot || !game.answers?.[bot]) ? g=>PokemonEngine.answer(g,bot,textAnswer(g),players,settings) : game.phaseEndsAt ? timeoutFallback : null;
      case "pokemon-types": return game.phase === "selecting" && !game.selectedTypes?.[bot] ? g=>PokemonEngine.selectType(g,bot,"water",players,settings) : game.phase === "answering" ? g=>PokemonEngine.answer(g,bot,textAnswer(g),players,settings) : game.phaseEndsAt ? timeoutFallback : null;
      case "pokemon-match-type": return game.phase === "answering" && !game.answers?.[bot] ? g=>PokemonEngine.matchType(g,bot,correct?(g.pokemon?.types||[]):["normal"],players,settings) : game.phaseEndsAt ? timeoutFallback : null;
      case "pokemon-auction": return game.phase === "auction" && game.currentPlayer === bot ? g=>correct?PokemonEngine.bid(g,bot,Math.min(Number(g.currentBid||0)+10,Number(g.budget||50))):PokemonEngine.pass(g,bot,players) : game.phaseEndsAt ? timeoutFallback : null;
      case "wavelength": return game.phase === "clue" && game.clueGiver === bot ? g=>WavelengthEngine.clue(g,bot,"coś umiarkowanego",players,settings) : game.phase === "positioning" ? g=>WavelengthEngine.move(g,Math.round(35+Math.random()*30)) : game.phaseEndsAt ? timeoutFallback : null;
      case "quiz": return game.phase === "question" && !game.answers?.[bot] ? g=>QuizEngine.answer(g,bot,correct?0:1,players,settings) : game.phase === "buzz" && !game.buzzes?.[bot] ? g=>QuizEngine.buzz(g,bot,players) : game.phaseEndsAt ? timeoutFallback : null;
      case "mathematics": return game.phase === "question" && !game.answers?.[bot] ? g=>MathematicsEngine.answer(g,bot,correct?numberAnswer(g):numberAnswer(g)+1,players) : game.phaseEndsAt ? timeoutFallback : null;
      case "marker": return game.phase === "selecting" && game.currentPlayer === bot ? g=>MarkerEngine.select(g,bot,g.grid?.[0]?.id||g.selectedCell) : game.phase === "drawing" && game.currentPlayer === bot ? g=>MarkerEngine.coverage(g,bot,correct?.9:.2) : game.phase === "searching" && game.currentPlayer === bot ? g=>MarkerEngine.find(g,bot) : null;
      case "sequence": return game.phase === "guessing" && game.currentPlayer === bot ? g=>SequenceEngine.guess(g,bot,game.colors?.slice(0,game.length)||[]) : game.phase === "creating" && game.currentPlayer === bot ? g=>SequenceEngine.draft(g,bot,(g.colors||["red"])[0]) : null;
      case "family": return game.phase === "answering" && game.currentPlayer === bot ? g=>FamilyEngine.answer(g,bot,textAnswer(g)) : game.phaseEndsAt ? timeoutFallback : null;
      case "word-chain": return game.phase === "answer" && game.currentUid === bot ? g=>correct?WordChainEngine.answer(g,bot,wordChainBotWord(g)):WordChainEngine.timeout(g) : game.phaseEndsAt ? timeoutFallback : null;
      default: return game.phaseEndsAt ? timeoutFallback : null;
    }
  } catch { return game.phaseEndsAt ? timeoutFallback : null; }
}

export function scheduleBot(room, { mutate, onDone }) {
  if(!room?.game||!botIds(room).length)return false;
  const mutation=botMutation(room);if(!mutation)return false;
  const key=`${room.roomId}:${room.updatedAt}:${room.game.phase}:${room.game.turnIndex||0}`;
  return { key, delay:botDelay(room, "answer", firstBot(room, room.game)), run:()=>mutate(mutation).finally(()=>onDone?.()) };
}
