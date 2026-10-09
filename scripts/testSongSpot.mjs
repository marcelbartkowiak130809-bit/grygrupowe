import assert from 'node:assert/strict';
import { test } from 'node:test';

let writes = 0;
const saved = new Map();
globalThis.localStorage = {
  getItem: key => saved.get(key) ?? null,
  setItem: (key, value) => { writes++; saved.set(key, value); },
};
const { SongSpotSoloEngine: engine } = await import('../js/songSpot.js');
const { musicCatalogForRegion } = await import('../js/music.js?v=20260903-9');
const trackFor = state => musicCatalogForRegion(state.region).find(track => String(track.id) === state.trackId);

test('an answer is accepted while the snippet is still playing, and is scored once', () => {
  const state = engine.start('during-playback');
  engine.markPlayed(state.playerId);
  engine.markPlaybackStarted(state.playerId);
  engine.updatePlaybackPosition(state.playerId, 0.04);
  assert.equal(state.playbackDone, false);
  engine.guess(state.playerId, trackFor(state).title, { trackId:state.trackId });
  assert.equal(state.status, 'reveal');
  assert.equal(state.streak, 1);
  assert.equal(state.lastResult.seconds, 0.04);
  engine.guess(state.playerId, trackFor(state).title);
  assert.equal(state.streak, 1);
});

test('guessing without playback works; empty and stale answers leave the round intact', () => {
  const state = engine.start('without-playback');
  engine.guess(state.playerId, ' ');
  engine.guess(state.playerId, trackFor(state).title, { trackId:'stale-track' });
  assert.equal(state.status, 'playing');
  engine.guess(state.playerId, trackFor(state).title);
  assert.equal(state.lastResult.correct, true);
  assert.equal(state.lastResult.seconds, 0);
});

test('Skip preserves the track and cumulative position; replay resets the playback clock', () => {
  const state = engine.start('cumulative-skip'), id = state.trackId;
  engine.markPlayed(state.playerId);
  engine.setPlaybackPosition(state.playerId, 0.1);
  engine.markPlaybackDone(state.playerId);
  engine.skip(state.playerId);
  assert.equal(state.trackId, id);
  assert.equal(state.playbackPosition, 0.1);
  assert.equal(state.timeIndex, 1);
  assert.equal(state.playbackDone, false);
  engine.markPlayed(state.playerId);
  assert.equal(state.playbackPosition, 0);
  assert.equal(state.playbackPersistedPosition, 0);
});

test('frequent clock updates avoid synchronous storage writes on every tick', () => {
  const state = engine.start('storage-budget');
  engine.markPlayed(state.playerId);
  const baseline = writes;
  for (let tick = 1; tick <= 300; tick++) engine.updatePlaybackPosition(state.playerId, tick * 0.05);
  assert.equal(state.playbackPosition, 15);
  assert.ok(writes - baseline <= 38, `Too many writes: ${writes - baseline}`);
  engine.setPlaybackPosition(state.playerId, 15);
  engine.markPlaybackDone(state.playerId);
  const persisted = JSON.parse(saved.get('grygrupowe-songspot-solo-v1:storage-budget'));
  assert.equal(persisted.playbackPosition, 15);
  assert.equal(persisted.playbackDone, true);
});
