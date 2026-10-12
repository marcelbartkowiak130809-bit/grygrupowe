import assert from 'node:assert/strict';
import { polishClassicMusicTracks as classics } from '../js/polishClassicMusic.js';
import { musicPreviewCatalog, musicCatalogForRegion } from '../js/music.js';
import { songSpotTrackMetadata, filterSongSpotTracks } from '../js/songSpotFilters.js';

assert.ok(classics.length >= 50);
assert.equal(new Set(musicPreviewCatalog.map(t => t.id)).size, musicPreviewCatalog.length);
assert.equal(new Set(classics.map(t => `${t.artist}|${t.title}`.toLowerCase())).size, classics.length);
const addedIds = new Set(classics.map(t => t.id));
const normalizedTitle = text => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
  .replace(/ł/g, 'l').replace(/\([^)]*\)/g, '').replace(/[^a-z0-9]/g, '');
const oldTitles = new Set(musicPreviewCatalog.filter(t => !addedIds.has(t.id)).map(t => normalizedTitle(t.title)));
for (const track of classics) {
  assert.ok(!oldTitles.has(normalizedTitle(track.title)), `${track.title}: already in catalog`);
  assert.equal(track.region, 'polish');
  assert.ok(track.originalReleaseYear >= 1900 && track.originalReleaseYear < 2000);
  for (const field of ['previewUrl', 'coverUrl', 'externalUrl', 'spotifyUrl', 'originalReleaseSource']) {
    assert.equal(new URL(track[field]).protocol, 'https:', `${track.title}: ${field}`);
  }
  const metadata = songSpotTrackMetadata(track);
  assert.equal(metadata.year, track.originalReleaseYear);
  assert.ok(metadata.genres.length && metadata.artists.length && metadata.source);
  assert.ok(musicCatalogForRegion('polish').some(t => t.id === track.id));
  assert.ok(!musicCatalogForRegion('global').some(t => t.id === track.id));
}
assert.equal(filterSongSpotTracks(classics, {era: 'classic'}).length, classics.length);
assert.equal(filterSongSpotTracks(classics, {era: '2020s'}).length, 0);
const maryla = classics.filter(t => t.artist.includes('Maryla Rodowicz'));
assert.ok(maryla.length >= 8);
for (const title of ['Małgośka', 'Niech żyje bal', 'Remedium', 'To już było']) {
  assert.ok(maryla.some(t => t.title === title));
}
assert.ok(!classics.some(t => /swing|heavy rock/i.test(t.album)));
const polish = musicCatalogForRegion('polish');
console.log(JSON.stringify({newSongs: classics.length, maryla: maryla.length,
  total: musicPreviewCatalog.length, playable: musicPreviewCatalog.filter(t => t.previewUrl).length,
  polish: polish.length, polishPlayable: polish.filter(t => t.previewUrl).length,
  polishClassic: filterSongSpotTracks(polish, {era: 'classic'}).length,
  polishClassicPlayable: filterSongSpotTracks(polish.filter(t => t.previewUrl), {era: 'classic'}).length}, null, 2));
