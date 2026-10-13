import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {ImpostorEngine, createImpostorGame, sanitizeImpostorSettings} from '../js/impostor.js';

// Exercise the actual capture listener's resolver without booting the whole app.
const source = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
const body = source.match(/function clickedRoomPlayerUid\(target\) \{([\s\S]*?)\n\}/)[1];
const room = {players: ['a', 'b', 'c', 'd']};
const resolve = new Function('target', 'activeRoom', 'state', body);
const mini = {closest: () => ({dataset: {playerUid: 'b'}}), querySelector: () => ({textContent: 'Gracz B'})};
const account = {accounts: {b: {nick: 'Gracz B'}}};
const target = (vote, profile = mini, accountButton = false) => ({closest(selector) {
  if (selector === '[data-vote-player]') return vote ? {} : null;
  if (selector === '.mini-player') return profile;
  if (selector === '.account-button') return accountButton ? {} : null;
  return null;
}});

test('avatar, nickname, level badge and card clicks cannot trigger a profile while voting', () => {
  for (const part of ['avatar', 'nickname', 'level', 'background']) {
    assert.equal(resolve(target(true, part === 'background' ? null : mini), () => room, account), '', part);
  }
});

test('ordinary player cards still open the correct profile, account button does not', () => {
  assert.equal(resolve(target(false), () => room, account), 'b');
  assert.equal(resolve(target(false, mini, true), () => room, account), '');
  assert.equal(resolve(target(false), () => null, account), '');
});

test('unintercepted voting records exactly one vote and duplicate clicks cannot change it', () => {
  const settings = sanitizeImpostorSettings({}, 4), game = createImpostorGame(room.players, settings);
  game.phase = 'voting';
  assert.equal(resolve(target(true), () => room, account), '');
  ImpostorEngine.vote(game, 'a', 'b');
  ImpostorEngine.vote(game, 'a', 'c');
  assert.deepEqual(game.votes, {a: 'b'});
});
