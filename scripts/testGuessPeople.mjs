import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BoardEngine, createBoardGame, renderBoardLobbySettings } from "../js/boardGames.js";
import { GUESS_PEOPLE_MODE as mode } from "../js/guessPeople.js";
import { guessPeople } from "../js/guessPeopleCatalog.js";
import { guessPeopleBios } from "../js/guessPeopleBios.js";
import { guessPeopleBotAction } from "../js/guessPeopleBot.js";
import { botActor, scheduleBot } from "../js/botController.js";
import { getGameMode } from "../js/games.js";
import { isModeLocked } from "../js/upcomingModes.js";
import { roomAllowsBots } from "../js/bots.js";

test("the public board mode has 200 unique licensed local photos", () => {
  assert.equal(getGameMode(mode).audience, "board");
  assert.equal(isModeLocked(mode), false);
  assert.equal(roomAllowsBots({status:"lobby"}, getGameMode(mode)), true);
  assert.equal(guessPeople.length, 200);
  assert.equal(new Set(guessPeople.map(card => card[0])).size, 200);
  assert.equal(new Set(guessPeople.map(card => card[3])).size, 200);
  assert.deepEqual(Object.keys(guessPeopleBios).sort(), guessPeople.map(card => card[1]).sort());
  for (const [id, name, category, source, author, license] of guessPeople) {
    assert.ok(guessPeopleBios[name].length >= 35 && guessPeopleBios[name].length <= 200, name);
    assert.ok(name && category && license && source.startsWith("https://commons.wikimedia.org/wiki/File:"));
    if (license.startsWith("CC BY")) assert.ok(author);
    const bytes = readFileSync(new URL(`../assets/guess-people/${id}.webp`, import.meta.url));
    assert.equal(bytes.toString("ascii", 8, 12), "WEBP");
  }
});

test("both board sizes use distinct cards and all target assignments are fair cycles", () => {
  for (const size of [24, 40]) for (const count of [2, 3, 4]) {
    const players = ["a","b","c","d"].slice(0, count);
    for (const targetOrder of ["clockwise", "random"]) {
      for (let retry = 0; retry < 30; retry++) {
        const game = createBoardGame(mode, players, {boardSize:size,targetOrder});
        assert.equal(new Set(game.deck).size, size);
        assert.equal(new Set(Object.values(game.secrets)).size, count);
        assert.equal(new Set(Object.values(game.targets)).size, count);
        const visited = new Set();
        let next = "a";
        for (let i = 0; i < count; i++) { visited.add(next); next = game.targets[next]; }
        assert.equal(next, "a");
        assert.equal(visited.size, count);
        if (targetOrder === "clockwise") players.forEach((uid, i) => assert.equal(game.targets[uid], players[(i+1)%count]));
      }
    }
  }
  assert.match(renderBoardLobbySettings({gameMode:mode,settings:{boardSize:40,targetOrder:"random"}},true), /value="40" selected/);
});

test("only the assigned player answers, a missed guess ends the turn, and a correct guess wins", () => {
  const players = ["a","b","c","d"];
  const actions = (game, uid, action, value) => BoardEngine.action(game,uid,action,value,players);
  let game = createBoardGame(mode, players);
  const wrong = game.deck.find(card => card !== game.secrets.c);
  assert.ok(actions(game,"c","guess-people-ask","Czy nosi okulary?"));
  assert.equal(actions(game,"a","guess-people-ask","Czy nosi okulary?"), undefined);
  game = JSON.parse(JSON.stringify(game));
  assert.ok(actions(game,"c","guess-people-answer","Tak"));
  assert.ok(actions(game,"a","guess-people-try",game.secrets.b));
  assert.equal(actions(game,"b","guess-people-answer","Nie widać"), undefined);
  assert.equal(game.history[0].answer, "Nie widać");
  assert.deepEqual(game.lastEvent, {kind:"answer",turn:1});
  assert.equal(game.currentUid,"b");
  assert.equal(actions(game,"b","guess-people-try",wrong),undefined);
  assert.deepEqual(game.wrongGuesses["b:c"],[wrong]);
  assert.deepEqual(game.lastEvent, {kind:"miss",turn:2,player:"b"});
  assert.equal(game.currentUid,"c");
  assert.equal(actions(game,"c","guess-people-try",game.secrets.d),undefined);
  assert.equal(game.phase,"result");
  assert.equal(game.winner,"c");
  assert.ok(actions(game,"c","guess-people-ask","Czy nosi okulary?"));
  BoardEngine.restart(game,players,{boardSize:40});
  assert.equal(game.finished,false);
  assert.equal(game.deck.length,40);
});

test("timeout advances and a departure safely replaces the missing target", () => {
  const players = ["a","b","c"];
  const game = createBoardGame(mode, players);
  BoardEngine.action(game,"a","guess-people-ask","Czy ma kapelusz?",players);
  assert.ok(BoardEngine.action(game,"c","timeout","",players));
  BoardEngine.action(game,"a","timeout","",["a","c"]);
  assert.equal(game.targets.a,"c");
  assert.equal(game.question,undefined);
  game.phaseEndsAt = 0;
  BoardEngine.action(game,"c","timeout","",["a","c"]);
  assert.equal(game.currentUid,"c");
  assert.deepEqual(game.lastEvent, {kind:"timeout",turn:2,player:"a"});
  BoardEngine.action(game,"c","timeout","",["c"]);
  assert.equal(game.winner,"c");
});

test("a bot answers from its photo, including when it must admit it cannot tell", async () => {
  const players = ["human", "bot:opponent", "other"];
  const game = createBoardGame(mode, players);
  const glasses = guessPeople.find(([, name]) => name === "Elton John")[0];
  game.secrets["bot:opponent"] = glasses;
  const room = { game, players, gameMode: mode, hostUid: "human" };
  assert.equal(botActor(room), "");
  assert.equal(BoardEngine.action(game, "human", "guess-people-ask", "Czy nosi okulary?", players), undefined);
  assert.equal(botActor(room), "bot:opponent");
  const run = () => scheduleBot(room, {
    mutate: mutation => mutation(game, room),
    onDone() {},
  }).run();
  assert.equal(await run(), undefined);
  assert.equal(game.history[0].answer, "Tak");

  game.currentUid = "human";
  game.turnIndex = 0;
  assert.equal(BoardEngine.action(game, "human", "guess-people-ask", "Czy kryje się za nim pies?", players), undefined);
  assert.equal(await run(), undefined);
  assert.equal(game.history[1].answer, "Nie umiem ocenić");
});

test("a bot asks, waits for the assigned human, then guesses from clues without accessing their secret", async () => {
  const players = ["bot:detective", "human", "bot:other", "guest"];
  const game = createBoardGame(mode, players);
  const [own, candidate, rejected, ...others] = guessPeople.map(([id]) => id);
  game.deck = [own, candidate, rejected, ...others.slice(0, 10)];
  game.secrets["bot:detective"] = own;
  const secret = game.secrets;
  game.secrets = new Proxy(secret, {
    get(object, key) {
      assert.notEqual(key, "human", "bot must never read the target's secret");
      return object[key];
    },
  });
  const room = { game, players, gameMode: mode, hostUid: "human", playerProfiles: { "bot:detective": { botDifficulty: "expert" } } };
  const scheduled = () => scheduleBot(room, { mutate: mutation => mutation(game, room), onDone() {} });
  assert.equal(await scheduled().run(), undefined);
  assert.ok(game.question);
  assert.equal(botActor(room), "");
  assert.equal(scheduled(), false);
  assert.equal(BoardEngine.action(game, "human", "guess-people-answer", "Nie widać", players), undefined);

  game.currentUid = "bot:detective";
  game.turnIndex = 0;
  game.wrongGuesses["bot:detective:human"] = [rejected, ...others.slice(0, 10)];
  assert.deepEqual(guessPeopleBotAction(game, "bot:detective", "expert"), {
    action: "guess-people-try", payload: candidate,
  });
  game.secrets = secret;
  game.secrets.human = candidate;
  assert.equal(await scheduled().run(), undefined);
  assert.equal(game.winner, "bot:detective");
});
