import assert from "node:assert/strict";
import test from "node:test";
import { BoardEngine, createBoardGame, sanitizeBoardSettings } from "../js/boardGames.js";
import { chessGameAction, chessMode, chessPosition, chessTime } from "../js/chessGame.js";
import { weeklyModeRelease } from "../js/weeklyUnlocks.js";
import { botActor, scheduleBot } from "../js/botController.js";
import { chessBotAction } from "../js/chessBot.js";

const players=["white","black"];
const newGame=()=>JSON.parse(JSON.stringify(createBoardGame(chessMode,players,{chessMinutes:5,chessIncrement:3})));
const move=(game,payload)=>BoardEngine.action(game,game.currentUid,"chess-move",payload,players);
const play=(game,sequence)=>sequence.forEach(payload=>assert.equal(move(game,payload),undefined,payload));

test("online chess uses its own clock and leaves checkers in the unlock queue",()=>{
  assert.deepEqual(sanitizeBoardSettings({chessMinutes:"3",chessIncrement:"0"},chessMode),{chessMinutes:3,chessIncrement:0});
  assert.equal(weeklyModeRelease(chessMode),undefined);
  assert.ok(weeklyModeRelease("board-warcaby"));
  const game=newGame();
  delete game.chessMoves; // Empty arrays are omitted from rooms stored in Firebase.
  assert.match(BoardEngine.action(game,"black","chess-move","e7|e5",players),/kolej/);
  assert.match(move(game,"e2|e5"),/niedozwolony/);
  const start=game.chessStartedAt;
  assert.equal(chessGameAction(game,"white","chess-move","e2|e4",start+2_000),undefined);
  assert.equal(game.chessClock.w,301_000);
  assert.equal(chessTime(game,"b",start+4_000),298_000);
  assert.equal(game.currentUid,"black");
});

test("mate, notation, previous position and color swap on rematch",()=>{
  const game=newGame();
  play(game,["f2|f3","e7|e5","g2|g4","d8|h4"]);
  assert.deepEqual(game.chessMoves,["f3","e5","g4","Qh4#"]);
  assert.equal(game.chessEnd,"mate");
  assert.deepEqual(game.winners,["black"]);
  assert.equal(chessPosition(game,2).get("e5").type,"p");
  assert.equal(chessPosition(game,2).get("h4"),undefined);
  BoardEngine.restart(game,players,{});
  assert.deepEqual(game.chessMoves,[]);
  assert.equal(game.currentUid,"black");
});

test("special moves and automatic repetition draw",()=>{
  const enPassant=newGame();
  play(enPassant,["e2|e4","a7|a6","e4|e5","d7|d5","e5|d6"]);
  assert.equal(chessPosition(enPassant).get("d5"),undefined);
  assert.equal(chessPosition(enPassant).history({verbose:true}).at(-1).captured,"p");
  const castle=newGame();
  castle.chessStartFen="r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1";
  play(castle,["e1|g1","e8|c8"]);
  assert.deepEqual(castle.chessMoves,["O-O","O-O-O"]);
  const promotion=newGame();
  promotion.chessStartFen="4k3/P7/8/8/8/8/8/4K3 w - - 0 1";
  assert.match(move(promotion,"a7|a8"),/niedozwolony/);
  play(promotion,["a7|a8|n"]);
  assert.equal(chessPosition(promotion).get("a8").type,"n");
  assert.equal(promotion.chessEnd,"material");
  const repeat=newGame();
  const cycle=["g1|f3","g8|f6","f3|g1","f6|g8"];
  play(repeat,[...cycle,...cycle]);
  assert.equal(repeat.chessEnd,"repetition");
  assert.deepEqual(repeat.winners,[]);
});

test("remis, poddanie i przekroczenie czasu rozstrzygają partię raz",()=>{
  const draw=newGame();
  BoardEngine.action(draw,"white","chess-offer","",players);
  assert.match(BoardEngine.action(draw,"white","chess-accept","",players),/rywala/);
  BoardEngine.action(draw,"black","chess-accept","",players);
  assert.equal(draw.chessEnd,"agreement");
  assert.deepEqual(draw.winners,[]);
  const resignation=newGame();
  BoardEngine.action(resignation,"black","chess-resign","",players);
  assert.deepEqual(resignation.winners,["white"]);
  const flag=newGame();
  flag.phaseEndsAt=Date.now()-1;
  BoardEngine.action(flag,"black","timeout","",players);
  assert.deepEqual(flag.winners,["black"]);
  assert.equal(flag.chessClock.w,0);
  assert.match(BoardEngine.action(flag,"white","timeout","",players),/zakończony/);
});

test("chess bots choose legal moves without changing the game and can deliver mate",()=>{
  for(const level of ["easy","normal","hard","expert"]){
    const game=newGame();
    const before=JSON.stringify(game);
    const choice=chessBotAction(game,"white",level);
    assert.equal(JSON.stringify(game),before);
    assert.equal(BoardEngine.action(game,"white",choice.action,choice.payload,players),undefined);
    assert.equal(game.chessMoves.length,1);
    assert.equal(game.currentUid,"black");
  }
  const game=newGame();
  game.chessStartFen="7k/8/5KQ1/8/8/8/8/8 w - - 0 1";
  const choice=chessBotAction(game,"white","expert");
  assert.equal(move(game,choice.payload),undefined);
  assert.equal(game.chessEnd,"mate");
});

test("host schedules chess turns and responds to draw offers without waiting for the bot's own turn",async()=>{
  const bot="bot:black", players=["white",bot];
  const game=createBoardGame(chessMode,players,{chessMinutes:5,chessIncrement:3});
  const room={roomId:"CHESS",gameMode:chessMode,game,players,hostUid:"white",playerProfiles:{[bot]:{botDifficulty:"normal"}}};
  const options={mutate:mutation=>mutation(game,room)};
  assert.equal(scheduleBot(room,options),false);
  BoardEngine.action(game,"white","chess-offer","",players);
  assert.equal(botActor(room),bot);
  await scheduleBot(room,options).run();
  assert.equal(game.chessDrawOffer,"");
  assert.equal(game.currentUid,"white");
  BoardEngine.action(game,"white","chess-move","e2|e4",players);
  const plan=scheduleBot(room,options);
  assert.equal(scheduleBot({...room,updatedAt:123},options).key,plan.key);
  await plan.run();
  assert.equal(game.chessMoves.length,2);
  assert.equal(game.currentUid,"white");
  await plan.run();
  assert.equal(game.chessMoves.length,2);
  BoardEngine.action(game,"white","chess-resign","",players);
  BoardEngine.restart(game,players,{chessMinutes:5,chessIncrement:3});
  assert.equal(botActor(room),bot);
  await scheduleBot(room,options).run();
  assert.equal(game.chessMoves.length,1);
});
