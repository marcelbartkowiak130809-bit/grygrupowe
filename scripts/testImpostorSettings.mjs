import assert from 'node:assert/strict';
import {test} from 'node:test';
import {bindImpostorLobbySettings, renderImpostorLobbySettings, sanitizeImpostorSettings, createImpostorGame, ImpostorEngine} from '../js/impostor.js';

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
