import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createMinecraftGame, MinecraftEngine } from "../js/minecraft.js";
import { mobQuestions } from "../js/minecraftMobQuestions.js";

const mode = "minecraft-mob";
const levels = ["easy", "medium", "hard", "expert"];

test("the mob catalogue uses distinct local PNG head portraits", async () => {
  assert.equal(mobQuestions.length, 48);
  assert.equal(new Set(mobQuestions.map(({ id }) => id)).size, mobQuestions.length);
  assert.equal(new Set(mobQuestions.map(({ icon }) => icon)).size, mobQuestions.length);
  for (const { icon } of mobQuestions) {
    const png = await readFile(new URL(icon, new URL("../", import.meta.url)));
    assert.equal(png.subarray(1, 4).toString(), "PNG");
    assert.ok(png.readUInt32BE(16) <= 34 && png.readUInt32BE(20) <= 21);
  }
});

test("a 20-round rematch never repeats a mob, even with a full history", () => {
  const players = ["alice", "bob"];
  for (const [level, difficulty] of levels.entries()) {
    const eligible = mobQuestions.filter(question => levels.indexOf(question.difficulty) <= level);
    const settings = { rounds: 20, difficulty, minecraftRecentQuestionIds: eligible.map(question => question.id) };
    const game = createMinecraftGame(mode, players, settings);
    const seen = new Set();
    for (let round = 1; round <= 20; round++) {
      const { question, currentUid } = game;
      assert.ok(eligible.some(({ id }) => id === question.id));
      assert.ok(!seen.has(question.id), `${difficulty}, runda ${round}, ${question.id}`);
      seen.add(question.id);
      MinecraftEngine.answer(game, currentUid, question.accepted.at(-1), players, settings);
      assert.equal(game.roundResult.correct, true);
      MinecraftEngine.nextRound(game, settings, players);
    }
    assert.equal(game.phase, "result");
    assert.equal(game.result.scores.alice, 10);
    assert.equal(game.result.scores.bob, 10);
  }
});
