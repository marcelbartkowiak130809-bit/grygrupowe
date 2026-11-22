import assert from "node:assert/strict";
import { test } from "node:test";
import { applyPriceGuessAction, createPriceGuessGame, currentPriceGuessItem, parsePriceGuess, priceGuessMode } from "../js/priceGuess.js";
import { priceGuessItems } from "../js/priceGuessData.js";
import { gamesList } from "../js/games.js";
import { libraryModesFor } from "../js/gameCategories.js";

const players=["a","b","c"];
const create=()=>createPriceGuessGame(players,{rounds:3,priceSeconds:15},1000);
const guess=(game,uid,value)=>applyPriceGuessAction(game,uid,"guess",value,players,1100);

test("the mode appears in Wiedza and the catalogue provides unique sourced products from every category",()=>{
  assert.ok(libraryModesFor(gamesList,"knowledge").some(mode=>mode.id===priceGuessMode));
  assert.equal(new Set(priceGuessItems.map(item=>item.id)).size,priceGuessItems.length);
  const game=createPriceGuessGame(players,{rounds:20},0);
  assert.equal(new Set(game.itemIds).size,20);
  const all=new Set(priceGuessItems.map(item=>item.category));
  const opening=new Set(game.itemIds.slice(0,all.size).map(id=>priceGuessItems.find(item=>item.id===id).category));
  assert.deepEqual(opening,all);
  assert.ok(priceGuessItems.every(item=>item.cents>0 && Number.isInteger(item.cents) && item.source.startsWith("https://") && item.image.startsWith("https://")));
});

test("prices use exact cents and closest guesses split the round point in a tie",()=>{
  assert.equal(parsePriceGuess("12 345,50"),1_234_550);
  assert.equal(parsePriceGuess("0.19"),19);
  for(const input of ["-5","NaN","1e5","1.111","0,","20000000",""]) assert.equal(parsePriceGuess(input),null);
  const game=create();
  const cents=currentPriceGuessItem(game).cents;
  assert.equal(guess(game,"a",(cents+1)/100),undefined);
  assert.ok(guess(game,"a",1));
  assert.equal(guess(game,"b",(cents-1)/100),undefined);
  assert.equal(game.phase,"price-guess");
  assert.equal(guess(game,"c",(cents+900)/100),undefined);
  assert.equal(game.phase,"price-reveal");
  assert.deepEqual(game.scores,{a:1,b:1,c:0});
  assert.deepEqual(game.roundWinners,["a","b"]);
});

test("timeouts count submitted players only and a match with no guesses yields no winners",()=>{
  const game=create();
  guess(game,"a",7);
  assert.ok(applyPriceGuessAction(game,"b","timeout",null,players,2000));
  assert.equal(applyPriceGuessAction(game,"b","timeout",null,players,game.phaseEndsAt),undefined);
  assert.deepEqual(game.roundWinners,["a"]);
  assert.equal(applyPriceGuessAction(game,"b","timeout",null,players,game.phaseEndsAt), "Ta runda już się skończyła.");
  const blank=create();
  for(let n=0;n<3;n++){
    applyPriceGuessAction(blank,"a","timeout",null,players,blank.phaseEndsAt);
    applyPriceGuessAction(blank,"a","next",null,players,17000);
  }
  assert.equal(blank.phase,"result");
  assert.deepEqual(blank.winners,[]);
});
