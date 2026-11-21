import assert from "node:assert/strict";
import test from "node:test";
import { createMinecraftGame, MinecraftEngine, minecraftBotAnswer } from "../js/minecraft.js";

const mode = "minecraft-redstone";
const players = ["player"];
const settings = { difficulty: "medium", rounds: 20 };

test("awards one point and reveals the text when the first option is correct", () => {
  const game = createMinecraftGame(mode, players, settings);
  game.question = { options: ["Przycisk", "Dźwignia", "Skrzynia"], answer: 0 };
  assert.match(MinecraftEngine.answer(game, "player", { option: 3 }, players), /Wybierz/);
  assert.equal(game.phase, "turn");
  assert.equal(MinecraftEngine.answer(game, "player", { option: 0 }, players), undefined);
  const saved = JSON.parse(JSON.stringify(game));
  MinecraftEngine.reconcile(saved, players);
  assert.equal(saved.lastAnswer.raw, "Przycisk");
  assert.equal(saved.roundResult.answer, "Przycisk");
  assert.equal(saved.roundResult.expected, "Przycisk");
  assert.equal(saved.roundResult.timedOut, false);
  assert.equal(saved.roundResult.points.player, 1);
  assert.equal(saved.scores.player, 1);
  assert.match(MinecraftEngine.answer(saved, "player", { option: 0 }, players), /zamknięta/);
  assert.equal(saved.scores.player, 1);
});

test("distinguishes a wrong answer at index zero from a timeout", () => {
  const game = createMinecraftGame(mode, players, settings);
  game.question = { options: ["Dźwignia", "Przycisk", "Skrzynia"], answer: 1 };
  MinecraftEngine.answer(game, "player", { option: 0 }, players);
  assert.equal(game.roundResult.answer, "Dźwignia");
  assert.equal(game.roundResult.expected, "Przycisk");
  assert.equal(game.roundResult.timedOut, false);
  assert.equal(game.scores.player, 0);
  MinecraftEngine.nextRound(game, settings, players);
  MinecraftEngine.timeout(game, players, settings);
  assert.equal(game.roundResult.timedOut, true);
  assert.equal(game.scores.player, 0);
});

test("a 20-round medium match draws distinct questions and keeps bot answers in sync", () => {
  const game = createMinecraftGame(mode, players, settings);
  const seen = new Set();
  for (let round = 0; round < 20; round++) {
    assert.equal(seen.has(game.question.id), false);
    seen.add(game.question.id);
    assert.equal(new Set(game.question.options).size, 3);
    const answer = minecraftBotAnswer(game, null, "player");
    MinecraftEngine.answer(game, "player", answer, players, settings);
    assert.equal(game.roundResult.correct, true);
    assert.equal(game.roundResult.answer, game.question.options[answer.option]);
    MinecraftEngine.nextRound(game, settings, players);
  }
  assert.equal(game.scores.player, 20);
  assert.deepEqual(game.winners, players);
});
