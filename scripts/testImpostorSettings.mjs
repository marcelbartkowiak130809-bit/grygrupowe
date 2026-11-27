import assert from 'node:assert/strict';
import {test} from 'node:test';
import {bindImpostorLobbySettings, renderImpostorLobbySettings, sanitizeImpostorSettings, createImpostorGame, ImpostorEngine} from '../js/impostor.js';
import {impostorWords} from '../content/impostor/words.js';
import {impostorPairId} from '../js/impostorPairFeedback.js';

function slider(disabled = false) {
  const output = {textContent: '20s'}, handlers = {}, attributes = {};
  const input = {type: 'range', value: '20', disabled, dataset: {impostorSetting: 'clueTime'},
    closest: () => ({querySelector: () => output}),
    setAttribute: (key, value) => attributes[key] = value,
    addEventListener: (event, handler) => (handlers[event] ??= []).push(handler)};
  return {input, output, attributes, root: {querySelectorAll: () => [input]},
    fire: event => handlers[event]?.forEach(handler => handler())};
}

test('drag updates label immediately and commits numeric time only on release', () => {
  const ui = slider(), saved = [];
  bindImpostorLobbySettings(ui.root, {setImpostorSetting: (...args) => saved.push(args)});
  for (const value of ['30', '10', '24']) {
    ui.input.value = value; ui.fire('input');
    assert.equal(ui.output.textContent, `${value}s`);
    assert.equal(ui.attributes['aria-valuetext'], `${value} sekund`);
    assert.equal(saved.length, 0);
  }
  ui.fire('change'); assert.deepEqual(saved, [['clueTime', 24]]);
});

test('rebinding does not duplicate saves and guests cannot change settings', () => {
  const ui = slider(), saved = [], actions = {setImpostorSetting: (...args) => saved.push(args)};
  bindImpostorLobbySettings(ui.root, actions); bindImpostorLobbySettings(ui.root, actions);
  ui.fire('change'); assert.equal(saved.length, 1);
  ui.input.disabled = true; ui.fire('change'); assert.equal(saved.length, 1);
});

test('saved time survives rendering and controls first, submitted and timed-out turns', () => {
  const players = ['a', 'b', 'c', 'd'];
  for (const clueTime of [10, 20, 24, 30]) {
    const settings = sanitizeImpostorSettings({clueTime: String(clueTime)}, players.length);
    assert.equal(settings.clueTime, clueTime);
    const html = renderImpostorLobbySettings({settings, players}, true);
    assert.ok(html.includes(`value="${clueTime}"`));
    assert.ok(html.includes(`data-impostor-setting-value>${clueTime}s`));
    const game = createImpostorGame(players, settings), start = Date.now();
    for (const uid of players) ImpostorEngine.acknowledge(game, uid, settings);
    assert.equal(game.phase, 'clues');
    assert.ok(Math.abs(game.phaseEndsAt - start - clueTime * 1000) < 100);
    assert.equal(ImpostorEngine.clue(game, game.turnOrder[0], 'skojarzenie', settings), undefined);
    assert.ok(Math.abs(game.phaseEndsAt - Date.now() - clueTime * 1000) < 100);
    ImpostorEngine.timeout(game, settings);
    assert.ok(Math.abs(game.phaseEndsAt - Date.now() - clueTime * 1000) < 100);
  }
});

test('saved categories and usage carry over to the merged lobby and next draw', () => {
  const players = ['a', 'b', 'c', 'd'];
  const settings = {
    categories: ['Owoce', 'Warzywa', 'Minecraft', 'Roblox', 'Muzyka'],
    categoryUsage: {Owoce: 3, Warzywa: 2, 'Jedzenie i napoje': 1, Minecraft: 2, Gry: 1},
  };
  const expected = ['Jedzenie i napoje', 'Gry', 'Muzyka'];
  assert.deepEqual(sanitizeImpostorSettings(settings, players.length).categories, expected);
  const lobby = renderImpostorLobbySettings({settings, players}, true);
  assert.match(lobby, /data-impostor-category="Jedzenie i napoje" type="checkbox" checked[^]*?class="category-count">6\//);
  for (let i = 0; i < 30; i++) {
    const game = createImpostorGame(players, settings);
    assert.ok(expected.includes(game.category));
    assert.equal(game.categoryUsage['Jedzenie i napoje'], game.category === 'Jedzenie i napoje' ? 7 : 6);
    assert.equal(game.categoryUsage.Gry, game.category === 'Gry' ? 4 : 3);
    assert.ok(!Object.hasOwn(game.categoryUsage, 'Warzywa'));
  }
});

test('moved pairs keep the same feedback key at the end of a game', () => {
  const pair = impostorWords.find(word => word.feedbackCategory === 'Minecraft');
  assert.equal(pair.category, 'Gry');
  const game = {
    phase: 'voting', category: pair.category, mainWord: pair.main, impostorWord: pair.impostor,
    pairFeedbackCategory: pair.feedbackCategory, turnOrder: ['a', 'b'], votes: {b: 'a'},
    roles: {a: {role: 'citizen'}, b: {role: 'impostor'}},
  };
  ImpostorEngine.vote(game, 'a', 'a');
  assert.equal(game.phase, 'results');
  assert.equal(game.pairFeedbackId, impostorPairId('Minecraft', pair.main, pair.impostor));
});

test('category-only mode keeps citizen and white roles, and applies to purchased roles', () => {
  const players = ['a', 'b', 'c', 'd', 'e', 'f'];
  const settings = sanitizeImpostorSettings({impostorCategoryOnly: true, whiteEnabled: true, whiteCount: 1}, players.length);
  const game = createImpostorGame(players, settings);
  assert.equal(game.impostorWord, null);
  assert.equal(game.impostorCategoryOnly, true);
  const holder = players.find(uid => game.roles[uid].role === 'impostor');
  const buyer = players.find(uid => game.roles[uid].role === 'citizen');
  const white = players.find(uid => game.roles[uid].role === 'white');
  assert.equal(game.roles[buyer].word, game.mainWord);
  assert.equal(game.roles[holder].word, null);
  assert.equal(game.roles[white].word, null);
  assert.equal(ImpostorEngine.buyRole(game, buyer, 'impostor', settings), undefined);
  assert.deepEqual(game.roles[buyer], {role: 'impostor', word: null});
  assert.deepEqual(game.roles[holder], {role: 'citizen', word: game.mainWord});
  game.phase = 'voting';
  for (const uid of players) ImpostorEngine.vote(game, uid, buyer);
  assert.equal(game.phase, 'finalGuess');
  assert.equal(ImpostorEngine.finalGuess(game, buyer, game.mainWord), undefined);
  assert.equal(game.phase, 'results');
  assert.equal(game.result.citizensWin, false);
  assert.equal(game.pairFeedbackId, undefined);
});
