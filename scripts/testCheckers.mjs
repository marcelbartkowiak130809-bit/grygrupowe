import assert from "node:assert/strict";
import { test } from "node:test";
import { BoardEngine, createBoardGame } from "../js/boardGames.js";

const players = ["a","b"];
const start = () => createBoardGame("board-warcaby",players);
const move = (game,uid,from,to) => BoardEngine.action(game,uid,"checkers-move",`${from}|${to}`,players);
const piece = (id,uid,pos,king=false) => ({id,uid,pos,king});

test("checkers saves a short history and switches to the other player", () => {
  const game=start();
  assert.equal(game.pieces.length,24);
  delete game.checkersHistory;
  assert.match(move(game,"b","1-5-0",33),/kolej/);
  assert.equal(move(game,"a","0-2-1",24),undefined);
  assert.equal(game.currentUid,"b");
  assert.deepEqual(game.checkersHistory,[{uid:"a",from:17,to:24,capture:false,promoted:false}]);
});

test("mandatory captures continue with the same token", () => {
  const game=start();
  game.pieces=[piece("first","a",17),piece("other","a",19),piece("one","b",26),
    piece("two","b",44),piece("three","b",28),piece("four","b",55)];
  assert.ok(move(game,"a","first",24));
  assert.equal(move(game,"a","first",35),undefined);
  assert.equal(game.checkersChain,"first");
  assert.ok(move(game,"a","other",37));
  assert.equal(move(game,"a","first",53),undefined);
  assert.equal(game.checkersChain,"");
  assert.equal(game.currentUid,"b");
  assert.deepEqual(game.checkersHistory.map(move=>move.capture),[true,true]);
});

test("promotion and the last capture finish the match correctly", () => {
  const game=start();
  game.pieces=[piece("a-man","a",42),piece("b-man","b",51)];
  assert.equal(move(game,"a","a-man",60),undefined);
  assert.equal(game.pieces[0].king,true);
  assert.equal(game.checkersHistory[0].promoted,true);
  assert.deepEqual(game.winners,["a"]);
  assert.equal(game.phase,"result");
});
