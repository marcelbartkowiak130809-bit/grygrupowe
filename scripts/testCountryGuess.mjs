import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { applyCountryGuessAction, countryFlagCodes, createCountryGuessGame, currentCountry } from "../js/countryGuess.js";

const players = ["a","b"];
const start = 10_000;

function gameWithFlags(flagCodes) {
  return {...createCountryGuessGame(players,{rounds:3,flagSeconds:10},start),flagCodes};
}

test("draws distinct countries with real SVG flag assets",()=>{
  assert.ok(countryFlagCodes.length>=150);
  assert.equal(new Set(countryFlagCodes).size,countryFlagCodes.length);
  for (const code of countryFlagCodes) {
    assert.match(code,/^[a-z]{2}$/);
    assert.ok(existsSync(new URL(`../assets/country-flags/${code}.svg`,import.meta.url)),code);
    assert.ok(currentCountry(gameWithFlags([code])).name);
  }
  for (let run=0;run<20;run++) {
    const {flagCodes} = createCountryGuessGame(players,{rounds:30},start);
    assert.equal(new Set(flagCodes).size,30);
  }
});

test("wrong answers leave the race open and a second correct answer earns nothing",()=>{
  const game = gameWithFlags(["gb"]);
  assert.ok(applyCountryGuessAction(game,"a","guess","Irlandia",players,start));
  assert.equal(game.phase,"country-guess");
  assert.equal(applyCountryGuessAction(game,"b","guess","UK",players,start+500),undefined);
  assert.ok(applyCountryGuessAction(game,"a","guess","Wielka Brytania",players,start+500));
  assert.deepEqual(game.scores,{a:0,b:1});
  assert.equal(game.roundWinner,"b");
});

test("expiry reveals the answer, advances after the reveal and counts only winning guesses",()=>{
  const game = gameWithFlags(["np","kr"]);
  assert.ok(applyCountryGuessAction(game,"a","guess","Nepal",players,20_000));
  assert.equal(applyCountryGuessAction(game,"a","tick",null,players,20_000),undefined);
  assert.equal(game.phase,"country-reveal");
  assert.equal(game.roundWinner,undefined);
  assert.ok(applyCountryGuessAction(game,"b","tick",null,players,23_499));
  assert.equal(applyCountryGuessAction(game,"b","tick",null,players,23_500),undefined);
  assert.equal(game.round,2);
  assert.equal(applyCountryGuessAction(game,"a","guess","korea poludniowa",players,24_000),undefined);
  assert.equal(applyCountryGuessAction(game,"b","tick",null,players,27_500),undefined);
  assert.equal(game.finished,true);
  assert.deepEqual(game.winners,["a"]);
});
