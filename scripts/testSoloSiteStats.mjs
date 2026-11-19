import test from 'node:test';
import assert from 'node:assert/strict';
import {aggregateSiteStatEvents, mergeSiteStats} from '../js/firebase.js';
import {newSoloRun, soloGameEvent} from '../js/soloSiteStats.js';

test('separate completed runs in the same solo mode get separate events', () => {
  const first = newSoloRun(1000), second = newSoloRun(1000);
  const event = soloGameEvent('popularnosc-solo', first, 62000);
  assert.equal(event.minutes, 2);
  assert.equal(event.type, 'gameFinished');
  assert.notEqual(event.eventId, soloGameEvent('popularnosc-solo', second, 62000).eventId);
  assert.equal(soloGameEvent('popularnosc-solo', first, 999), null);
  assert.equal(soloGameEvent('popularnosc-solo', first, NaN), null);
});

test('solo games add to the historic totals without duplication across identities', () => {
  const first = soloGameEvent('songspot', {id:'first', startedAt:1000}, 2000);
  const second = soloGameEvent('popularnosc-solo', {id:'second', startedAt:1000}, 182000);
  const {stats, solo} = aggregateSiteStatEvents({
    guest:{first,second},
    otherIdentity:{first},
    host:{group:{type:'gameFinished',eventId:'game:group',modeId:'songspot',minutes:4}},
  });
  const historical = {gamesPlayed:10,playedMinutes:80,modeCounts:{songspot:3}};
  const combined = mergeSiteStats(historical, stats, solo);
  assert.equal(combined.gamesPlayed, 12);
  assert.equal(combined.playedMinutes, 85);
  assert.deepEqual(combined.modeCounts, {songspot:4,'popularnosc-solo':1});
});
