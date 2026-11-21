import assert from "node:assert/strict";
import test from "node:test";
import { createPokemonGame, pokemonCandidates, pokemonDefaults, PokemonEngine, typeRaceCandidates } from "../js/pokemon.js";
import { gamesRegistry } from "../js/games.js";
import { isModeLocked } from "../js/upcomingModes.js";

const mode = "pokemon-type-draw";
const players = ["a", "b"];
const defaults = pokemonDefaults[mode];
const expire = (game, settings) => {
  game.phaseEndsAt = Date.now() - 1;
  PokemonEngine.timeout(game, players[0], players, settings);
};

test("the first correct full name ends the round and a wrong answer can be retried", () => {
  const settings = { ...defaults, typeCount:2, generations:[1] };
  const game = createPokemonGame(mode, players, settings);
  game.drawnTypes = ["grass","poison"];
  assert.match(PokemonEngine.answer(game, "a", "bulbasaur", players, settings), /Czas/);
  expire(game, settings);
  assert.equal(game.phase, "type-race");
  assert.match(PokemonEngine.answer(game, "b", "tangela", players, settings), /Spróbuj/);
  assert.match(PokemonEngine.answer(game, "b", "bulb", players, settings), /Spróbuj/);
  assert.match(PokemonEngine.answer(game, "spectator", "bulbasaur", players, settings), /Nie bierzesz/);
  assert.equal(PokemonEngine.answer(game, "b", "Bulbasaur", players, settings), undefined);
  assert.match(PokemonEngine.answer(game, "a", "Ivysaur", players, settings), /Czas/);
  assert.equal(game.raceAnswerId, 1);
  assert.equal(game.raceWinner, "b");
  assert.deepEqual(game.scores, {a:0,b:1});
});

test("each configured draw is solvable and a timeout reveals a sample without awarding points", () => {
  for (const typeCount of [0,1,2]) {
    const settings = { ...defaults, typeCount, generations:[1], rounds:2 };
    const game = createPokemonGame(mode, players, settings);
    const first = [...game.drawnTypes];
    if (typeCount) assert.equal(first.length, typeCount);
    assert.ok(typeRaceCandidates(first, settings).length);
    expire(game, settings);
    expire(game, settings);
    assert.ok(typeRaceCandidates(first, settings).some(item => item.id === game.raceAnswerId));
    assert.deepEqual(game.scores, {a:0,b:0});
    assert.equal(game.finished, false);
    PokemonEngine.nextRound(game, players, settings);
    assert.notDeepEqual(game.drawnTypes, first);
    expire(game, settings);
    expire(game, settings);
    assert.equal(game.finished, true);
    assert.match(PokemonEngine.nextRound(game, players, settings), /zakończona/);
  }
});

test("the new mode is immediately available in Pokémon", () => {
  assert.equal(gamesRegistry[mode].audience, "pokemon");
  assert.equal(isModeLocked(mode), false);
});

test("generation bans and repeated answers are enforced for the entire room", () => {
  const settings = { ...defaults, generations:[1], noRepeatPokemon:true };
  const game = createPokemonGame(mode, players, settings);
  game.drawnTypes = ["fire"];
  expire(game, settings);
  assert.match(PokemonEngine.answer(game, "a", "Cyndaquil", players, settings), /Generacja.*wyłączona/);
  assert.equal(game.phase, "type-race");
  PokemonEngine.answer(game, "a", "Charmander", players, settings);
  assert.deepEqual(game.usedRacePokemonIds, [4]);
  const saved = JSON.parse(JSON.stringify(game));
  PokemonEngine.nextRound(saved, players, settings);
  saved.drawnTypes = ["fire"];
  expire(saved, settings);
  assert.match(PokemonEngine.answer(saved, "b", "CHARMANDER", players, settings), /już zaliczony/);
  assert.equal(saved.phase, "type-race");
  PokemonEngine.answer(saved, "b", "Charmeleon", players, settings);
  assert.deepEqual(saved.scores, {a:1,b:1});
  assert.deepEqual(saved.usedRacePokemonIds, [4,5]);
});

test("a consumed combination is skipped, and timeout examples remain playable", () => {
  const settings = { ...defaults, generations:[1], noRepeatPokemon:true, typeCount:2 };
  const game = createPokemonGame(mode, players, settings);
  game.drawnTypes = ["electric","flying"];
  expire(game, settings);
  expire(game, settings);
  assert.equal(game.raceAnswerId, 145);
  assert.equal(game.usedRacePokemonIds, undefined);
  PokemonEngine.nextRound(game, players, settings);
  game.drawnTypes = ["electric","flying"];
  expire(game, settings);
  PokemonEngine.answer(game, "a", "Zapdos", players, settings);
  assert.deepEqual(typeRaceCandidates(["electric","flying"], settings, game), []);
  PokemonEngine.nextRound(game, players, settings);
  assert.equal(game.drawnTypes.length, 2);
  assert.ok(typeRaceCandidates(game.drawnTypes, settings, game).length);
  expire(game, settings);
  expire(game, settings);
  game.usedRacePokemonIds = pokemonCandidates(settings).map(item => item.id);
  PokemonEngine.nextRound(game, players, settings);
  assert.equal(game.finished, true);
  assert.equal(game.round, 3);
});

test("older games and rooms with the repeat option off still accept a previous answer", () => {
  const settings = {generations:[], rounds:5};
  const game = createPokemonGame(mode, players, settings);
  game.usedRacePokemonIds = [4];
  game.drawnTypes = ["fire"];
  expire(game, settings);
  PokemonEngine.answer(game, "a", "Charmander", players, settings);
  assert.equal(game.raceWinner, "a");
});
