import assert from "node:assert/strict";
import test from "node:test";
import { createPokemonGame, PokemonEngine, pokemonAuctionCanBid, repairPokemonAuctionClock } from "../js/pokemon.js";
import { botActor } from "../js/botController.js";
import { pokemonDex } from "../js/pokemonData.js";

const mode = "pokemon-auction";
const items = [25, 133, 149, 150];
const settings = { teamSize: 2, budget: 10 };
const play = (players = ["a", "b"]) => ({ ...createPokemonGame(mode, players, settings), items });
function expire(game, players, rules = settings) {
  game.phaseEndsAt = Date.now() - 1;
  PokemonEngine.timeout(game, players[0], players, rules);
}

test("passing and expiry advance unsold lots all the way to an empty final", () => {
  const players = ["a", "b"];
  const game = play(players);
  PokemonEngine.pass(game, "a", players);
  assert.match(PokemonEngine.bid(game, "a", 1, players), /spasowałeś/);
  PokemonEngine.pass(game, "b", players);
  assert.equal(game.phase, "auction-reveal");
  assert.equal(game.auctionResult.winner, "");
  expire(game, players);
  assert.deepEqual(game.passed, []);
  for (let index = 1; index < items.length; index++) {
    assert.equal(game.auctionIndex, index);
    assert.equal(game.round, index + 1);
    expire(game, players);
    assert.equal(game.auctionResult.itemId, items[index]);
    expire(game, players);
  }
  assert.equal(game.phase, "result");
  assert.deepEqual(game.winners, []);
  assert.deepEqual(game.scores, { a: 0, b: 0 });
});

test("full-team auctions add unseen lots until both teams fill and then enter battle", () => {
  const players = ["a", "b"];
  const rules = {...settings, requireFullTeams:true, battleAfterAuction:true, generations:[1]};
  const game = createPokemonGame(mode, players, rules);
  const original = game.items.slice();
  Object.assign(game, {
    auctionIndex:3, round:4, teams:{a:original.slice(0,2),b:original.slice(2,3)},
  });
  assert.equal(PokemonEngine.pass(game,"b",players),undefined);
  expire(game,players,rules);
  assert.equal(game.phase,"auction");
  assert.equal(game.round,5);
  assert.deepEqual(game.passed,[]);
  expire(game,players,rules); // The first extra lot gets no bids.
  expire(game,players,rules);
  assert.equal(game.round,6);
  assert.equal(game.items.length,6);
  assert.equal(new Set(game.items).size,6);
  assert.ok(game.items.every(id=>id<=151));
  assert.equal(pokemonAuctionCanBid(game,"a"),false);
  assert.equal(PokemonEngine.bid(game,"b",1,players),undefined);
  expire(game,players,rules);
  assert.equal(game.teams.b.length,2);
  assert.equal(game.items.length,6);
  assert.equal(game.phase,"auction-prep");
});

test("full-team auctions stop when the budget or the filtered pool runs out", () => {
  const players = ["a", "b"];
  const rules = {...settings, requireFullTeams:true, strongOnly:true, legendaries:false, mythicals:false, generations:[1]};
  const pool = pokemonDex.filter(item=>item.generation===1 && item.bst>=500 && !item.legendary && !item.mythical).map(item=>item.id);
  for (const cause of ["budget","pool"]) {
    const game = createPokemonGame(mode,players,rules);
    if (cause==="pool") game.items=pool;
    else game.budgets.b=0;
    Object.assign(game, {
      teams:{a:game.items.slice(0,2),b:[]}, phase:"auction-reveal", auctionIndex:game.items.length-1,
    });
    const itemCount = game.items.length;
    expire(game,players,rules);
    assert.equal(game.phase,"result",cause);
    assert.equal(game.items.length,itemCount,cause);
  }
});

test("an auction settles once all eligible rivals are out and charges its winner once", () => {
  const players = ["a", "b", "c"];
  const game = play(players);
  assert.match(PokemonEngine.bid(game, "a", 1.5, players), /o 1 monetę/);
  assert.match(PokemonEngine.bid(game, "a", 10, players), /o 1 monetę/);
  PokemonEngine.bid(game, "a", 1, players);
  assert.equal(pokemonAuctionCanBid(game, "a"), false);
  assert.match(PokemonEngine.pass(game, "a", players), /prowadzi/);
  PokemonEngine.pass(game, "b", players);
  PokemonEngine.bid(game, "c", 2, players);
  PokemonEngine.bid(game, "a", 3, players);
  PokemonEngine.bid(game, "c", 4, players);
  assert.deepEqual(game.passed, ["b"]);
  assert.equal(game.phase, "auction");
  PokemonEngine.pass(game, "a", players);
  assert.equal(game.phase, "auction-reveal");
  assert.deepEqual(game.auctionResult, { itemId: 25, winner: "c", price: 4 });
  assert.equal(game.budgets.c, 6);
  assert.match(PokemonEngine.bid(game, "a", 9, players), /zamknięte/);
  PokemonEngine.timeout(game, "c", players, settings);
  assert.deepEqual(game.purchases.c, [{ id: 25, price: 4 }]);
});

test("a departed bidder cannot win and the final ranks BST, including ties", () => {
  const players = ["a", "b", "c"];
  const game = play(players);
  PokemonEngine.bid(game, "c", 1, players);
  expire(game, ["a", "b"]);
  assert.equal(game.auctionResult.winner, "");
  assert.equal(game.budgets.c, 10);
  const match = pokemonDex.find(item => item.id !== 25 && item.bst === pokemonDex.find(row => row.id === 25).bst);
  const final = { ...play(["a", "b"]), items: [25, match.id] };
  PokemonEngine.bid(final, "a", 1, ["a", "b"]);
  expire(final, ["a", "b"]);
  expire(final, ["a", "b"]);
  PokemonEngine.bid(final, "b", 1, ["a", "b"]);
  expire(final, ["a", "b"]);
  expire(final, ["a", "b"]);
  assert.deepEqual(final.winners, ["a", "b"]);
  assert.deepEqual(final.scores, { a: 3, b: 3 });
});

test("long lobbies get unique matching lots and capped integer settings", () => {
  const players = Array.from({ length: 8 }, (_, i) => String(i + 1));
  const game = createPokemonGame(mode, players, { teamSize: 20, budget: 999, generations: [1] });
  assert.equal(game.teamSize, 10);
  assert.equal(game.budgets["1"], 500);
  assert.equal(game.items.length, 80);
  assert.equal(new Set(game.items).size, 80);
  assert.ok(game.items.every(id => id <= 151));
});

test("the next eligible bot can act after another bot passes", () => {
  const players = ["a", "bot:b", "bot:c"];
  const game = play(players);
  const room = { gameMode: mode, game, players };
  assert.equal(botActor(room), "bot:b");
  PokemonEngine.pass(game, "bot:b", players);
  assert.equal(botActor(room), "bot:c");
});

test("a raise renews the seven-second clock and invalid legacy deadlines are bounded", () => {
  const players = ["a", "b"];
  const game = play(players);
  game.phaseEndsAt = Date.now() + 7_200_000;
  assert.equal(repairPokemonAuctionClock(game), true);
  assert.ok(game.phaseEndsAt - Date.now() <= 7000);
  game.phaseEndsAt = Date.now() + 3_000;
  assert.equal(PokemonEngine.bid(game, "a", 1, players), undefined);
  const firstDeadline = game.phaseEndsAt;
  assert.ok(firstDeadline - Date.now() > 6500);
  assert.match(PokemonEngine.bid(game, "b", 1, players), /Stawka się zmieniła/);
  assert.equal(game.phaseEndsAt, firstDeadline);
  assert.equal(PokemonEngine.bid(game, "b", 2, players), undefined);
  assert.equal(repairPokemonAuctionClock(game), false);
  assert.deepEqual(game.budgets, {a:10,b:10});
  expire(game, players);
  assert.equal(game.auctionResult.winner, "b");
  assert.ok(game.phaseEndsAt - Date.now() <= 1250);
});
