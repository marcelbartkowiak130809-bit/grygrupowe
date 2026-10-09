import test from 'node:test';
import assert from 'node:assert/strict';
import { chartMusicTracks, chartMusicUpdates } from '../js/chartMusic.js';
import { musicPreviewCatalog, musicCatalogForRegion } from '../js/music.js';

test('chart additions have unique IDs, complete original media and valid regions', () => {
  const pools = Object.fromEntries(['polish', 'global'].map(region => [region, new Set(musicCatalogForRegion(region).map(track => track.id))]));
  assert.equal(new Set(musicPreviewCatalog.map(track => track.id)).size, musicPreviewCatalog.length);
  assert.equal(chartMusicTracks.length, 132);
  for (const track of chartMusicTracks) {
    assert.ok(track.title && track.artist);
    assert.match(track.previewUrl, /^https:\/\/audio-ssl\.itunes\.apple\.com\//);
    assert.match(track.coverUrl, /^https:\/\/is\d-ssl\.mzstatic\.com\//);
    assert.match(track.externalUrl, /^https:\/\/music\.apple\.com\//);
    assert.ok(['polish', 'global'].includes(track.region));
    assert.ok(pools[track.region].has(track.id));
    assert.ok(!pools[track.region === 'polish' ? 'global' : 'polish'].has(track.id));
  }
});

test('existing IDs receive repaired previews without creating duplicate songs', () => {
  assert.equal(Object.keys(chartMusicUpdates).length, 5);
  for (const [id, media] of Object.entries(chartMusicUpdates)) {
    const matches = musicPreviewCatalog.filter(track => track.id === id);
    assert.equal(matches.length, 1);
    assert.equal(matches[0].previewUrl, media.previewUrl);
  }
});

test('fresh Polish and international hits are available to shared game pools', () => {
  const polish = musicCatalogForRegion('polish'), global = musicCatalogForRegion('global');
  for (const title of ['NIENAWIDZĘ WARSZAWY', 'Mami', 'CYRK', 'SŁOWA BOLĄ']) assert.ok(polish.some(track => track.title === title && track.previewUrl));
  for (const title of ['Patient Zero', 'Nicole Kidman', 'Solar Eclipse', 'Babydoll']) assert.ok(global.some(track => track.title === title && track.previewUrl));
});
