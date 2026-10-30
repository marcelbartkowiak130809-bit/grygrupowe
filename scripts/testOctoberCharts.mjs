import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {octoberChartTracks} from '../js/octoberChartMusic.js';
import {tournamentMusicCatalog} from '../js/tournamentMusic.js';
import {cupTrackKey} from '../js/tournamentMusicKey.js';
import {songSpotTrackMetadata,filterSongSpotTracks} from '../js/songSpotFilters.js';
const report=JSON.parse(readFileSync(new URL('../docs/top100-2026-10-31.json',import.meta.url),'utf8'));
test('both complete daily Top 100 charts are represented without alternate-release duplicates',()=>{
 assert.equal(report.sources.length,2);assert.equal(report.unavailable.length,0);
 const keys=new Set(tournamentMusicCatalog.map(cupTrackKey)),ids=new Set(tournamentMusicCatalog.map(t=>t.id));
 for(const source of report.sources){assert.equal(source.tracks,100);assert.equal(source.advertisedTracks,100);
  for(const id of source.trackIds){const row=report.chartRows.find(t=>String(t.id).replace(/^itunes-/,'')===id);assert.ok(row,id);
   const equivalent=report.excludedEquivalent.find(t=>t.id===`itunes-${id}`);
   assert.ok(keys.has(cupTrackKey(row))||(equivalent&&ids.has(equivalent.existingId)),`${row.artist}: ${row.title}`);
  }
 }
});
test('32 playable chart additions expand the shared library to 1485 unique tracks',()=>{
 assert.equal(octoberChartTracks.length,32);assert.equal(tournamentMusicCatalog.length,1485);
 assert.equal(new Set(tournamentMusicCatalog.map(cupTrackKey)).size,1485);assert.equal(new Set(tournamentMusicCatalog.map(t=>t.id)).size,1485);
 assert.equal(octoberChartTracks.filter(t=>t.region==='polish').length,13);
 for(const t of octoberChartTracks){assert.ok(tournamentMusicCatalog.some(s=>s.id===t.id));assert.match(t.coverUrl,/600x600bb/);assert.match(t.previewUrl,/^https:\/\/audio-ssl\.itunes\.apple\.com\//);assert.ok(t.chartHit);const meta=songSpotTrackMetadata(t);assert.ok(meta.year>=1900&&meta.year<=2026);assert.ok(meta.artists.length&&meta.genres.length&&meta.source);}
 const halloween=octoberChartTracks.find(t=>t.title==='This Is Halloween');assert.equal(filterSongSpotTracks([halloween],{era:'classic'}).length,1);
});
