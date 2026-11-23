import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { BoardEngine, createBoardGame } from "../js/boardGames.js";
import { letterTableAction, letterTableMode, previewLetterPlay, tableCenter, tableSize } from "../js/letterTable.js";

const players=["a","b"], settings={turnTime:90};
const finish=(game,winners,scores)=>Object.assign(game,{phase:"result",finished:true,winners,scores});
const dictionary=word=>{
  const file=new URL(`../assets/letter-table/dictionary/${word.charCodeAt(0)}.gz`,import.meta.url);
  return (`\n${gunzipSync(readFileSync(file)).toString("utf8")}`).includes(`\n${word}\n`);
};
const tile=(id,letter)=>({id,letter});
const make=()=>createBoardGame(letterTableMode,players,settings);
const move=(game,uid,action,payload,now=game.phaseEndsAt-1)=>letterTableAction(game,uid,action,payload,now,settings,finish,dictionary);

test("each player starts with seven unique tiles and valid Polish words score on the board",()=>{
  const game=make();
  assert.deepEqual(Object.values(game.letterRacks).map(rack=>rack.length),[7,7]);
  const tiles=[...game.letterBag,...Object.values(game.letterRacks).flat()];
  assert.equal(new Set(tiles.map(item=>item.id)).size,tiles.length);
  game.letterRacks.a=[tile(1,"k"),tile(2,"o"),tile(3,"t")];
  const placements=[{square:tableCenter,id:1},{square:tableCenter+1,id:2},{square:tableCenter+2,id:3}];
  assert.equal(boardError(game,[{square:0,id:1},{square:1,id:2}]),"Pierwsze słowo musi przechodzić przez środek.");
  assert.match(boardError(game,[{square:tableCenter,id:1},{square:tableCenter+2,id:3}]),/przerwy/);
  assert.equal(previewLetterPlay(game,"a",placements).points,10);
  assert.equal(move(game,"a","letter-play",placements),undefined);
  assert.equal(game.scores.a,10);
  assert.equal(game.currentUid,"b");
  assert.equal(game.letterRacks.a.length,7);
  assert.equal(game.letterHistory[0].words[0].text,"kot");

  game.letterRacks.b=[tile(111,"?"),tile(112,"o"),tile(113,"m")];
  const second=[
    {square:tableCenter+2+tableSize,id:111,blank:"o"},
    {square:tableCenter+2+2*tableSize,id:113},
  ];
  assert.equal(previewLetterPlay(game,"b",second).words[0].text,"tom");
  const before=JSON.stringify(game);
  assert.match(move(game,"b","letter-play",[{...second[0],blank:"ź"},second[1]]),/Brak w słowniku/);
  assert.equal(JSON.stringify(game),before);
  assert.equal(move(game,"b","letter-play",second),undefined);
  assert.equal(game.letterBoard[tableCenter+2+tableSize].blank,true);
  assert.equal(game.scores.b,4);
});

function boardError(game,placements) { return previewLetterPlay(game,"a",placements).error; }

test("exchange replaces only selected tiles, the timer passes, and repeated passes end the game",()=>{
  const game=make();
  const original=game.letterRacks.a.slice();
  const count=game.letterBag.length;
  const data=[original[0].id,original[1].id];
  assert.equal(BoardEngine.action(game,"a","letter-exchange",data,players,settings),undefined);
  assert.equal(game.letterRacks.a.length,7);
  assert.equal(game.letterBag.length,count);
  assert.ok(data.every(id=>game.letterBag.some(item=>item.id===id)));
  assert.deepEqual(game.letterRacks.a.slice(0,5),original.slice(2));
  assert.equal(game.currentUid,"b");
  const time=game.phaseEndsAt;
  move(game,"a","timeout",null,time);
  assert.equal(game.currentUid,"a");
  assert.equal(move(game,"a","letter-pass"),undefined);
  assert.equal(move(game,"b","letter-pass"),undefined);
  assert.equal(game.finished,true);
  assert.equal(game.phase,"result");
});
