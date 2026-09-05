import assert from 'node:assert/strict';
import { test } from 'node:test';
import { gameMomentKey, roundAdvanceDeadline } from '../js/roomLifecycle.js';
import { createPopularityGame, PopularityEngine } from '../js/popularity.js';
import { scheduleBot } from '../js/botController.js';

const makeRoom = () => ({ roomId:'QA', hostUid:'human', gameMode:'popularnosc-hitow',
  players:['human', 'other', 'bot:1'], settings:{ choiceTime:30, rounds:3 },
  game:createPopularityGame(['human', 'other', 'bot:1'], { choiceTime:30, rounds:3 }) });
const planFor = room => scheduleBot(room, { mutate:fn => Promise.resolve(fn(room.game, room)) });

test('a delayed bot cannot answer in a replacement round or match', async () => {
  for (const replace of [r => r.game.round++, r => r.game.siteGameId = 'replacement']) {
    const room = makeRoom(), plan = planFor(room);
    replace(room);
    await plan.run();
    assert.deepEqual(room.game.choices, {});
  }
});
test('old host and departed bot cannot submit a scheduled move', async () => {
  for (const change of [r => r.hostUid = 'other', r => r.players = ['human','other']]) {
    const room = makeRoom(), plan = planFor(room);
    change(room);
    await plan.run();
    assert.deepEqual(room.game.choices, {});
  }
});
test('bot waiting past the deadline times out without inventing human answers', async () => {
  const room = makeRoom();
  room.game.phaseEndsAt = Date.now() + 100;
  const plan = planFor(room);
  const original = Date.now;
  Date.now = () => room.game.phaseEndsAt + 1;
  try { await plan.run(); } finally { Date.now = original; }
  assert.equal(room.game.phase, 'roundResult');
  assert.deepEqual(room.game.roundResult.awarded, []);
  assert.ok(Object.values(room.game.choices).every(choice => choice === null));
});
test('duplicate bot callbacks do not change a saved answer or play for a human', async () => {
  const room = makeRoom(), first = planFor(room), duplicate = planFor(room);
  await first.run();
  const choices = structuredClone(room.game.choices);
  await duplicate.run();
  assert.deepEqual(room.game.choices, choices);
  assert.equal(room.game.phase, 'choosing');
});
test('early timeout, null placeholders, spam and late clicks', () => {
  const room = makeRoom(), game = room.game;
  game.choices = { human:null, other:null, 'bot:1':null };
  PopularityEngine.timeout(game);
  assert.equal(game.phase, 'choosing');
  PopularityEngine.choose(game, 'human', 'left');
  for (let i = 0; i < 20; i++) PopularityEngine.choose(game, 'human', 'right');
  assert.equal(game.choices.human, 'left');
  assert.equal(game.phase, 'choosing');
  game.phaseEndsAt = Date.now() - 1;
  assert.ok(PopularityEngine.choose(game, 'other', 'right'));
  assert.equal(game.choices.other, null);
  PopularityEngine.timeout(game);
  const scores = structuredClone(game.scores);
  PopularityEngine.timeout(game);
  assert.deepEqual(game.scores, scores);
});
test('countdowns survive rerenders and reconnect; game identity ignores profile updates', () => {
  assert.equal(gameMomentKey(null), gameMomentKey({}));
  const room = makeRoom(), key = gameMomentKey(room.game);
  room.updatedAt = Date.now() + 1000;
  room.game.choices.human = 'left';
  assert.equal(gameMomentKey(room.game), key);
  assert.equal(roundAdvanceDeadline({}, 1000, 10000, 2000), 1000);
  assert.equal(roundAdvanceDeadline({ phaseEndsAt:3000 }, 0, 10000, 2000), 3000);
  assert.equal(roundAdvanceDeadline({}, 0, 10000, 2000), 12000);
});
