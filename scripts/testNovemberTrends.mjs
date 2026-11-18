import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {novemberTrendTracks} from '../js/novemberTrendMusic.js';
import {americanRapTracks} from '../js/americanRapMusic.js';
import {tournamentMusicCatalog} from '../js/tournamentMusic.js';
import {cupTrackKey} from '../js/tournamentMusicKey.js';
import {songSpotTrackMetadata} from '../js/songSpotFilters.js';
const report=JSON.parse(readFileSync(new URL('../docs/november-2026-trend-research.json',import.meta.url),'utf8'));
test('both full current Top 100 lists are covered, including alternate release titles',()=>{
 const keys=new Set(tournamentMusicCatalog.map(cupTrackKey)),ids=new Set(tournamentMusicCatalog.map(t=>t.id));
 for(const chart of report.charts){assert.equal(chart.sources[0].tracks,100);assert.equal(chart.sources[0].advertisedTracks,100);assert.equal(chart.unavailable.length,0);
  for(const id of chart.sources[0].trackIds){
   const row=chart.duplicatesFound.find(t=>t.id===id),equivalent=report.result.equivalentReleases.find(t=>t.chartId===`itunes-${id}`);
   assert.ok(ids.has(`itunes-${id}`)||(row&&keys.has(cupTrackKey(row)))||(equivalent&&ids.has(equivalent.existingId||equivalent.addedId)),id);
  }
 }
 for(const row of report.tiktok.observations.filter(t=>['matched','existing'].includes(t.status))){
  if(row.title==='All I Want for Christmas Is You'||row.title==='Last Christmas')assert.ok(tournamentMusicCatalog.some(t=>t.artist.includes(row.artist)&&t.title.startsWith(row.title)));
  else assert.ok(ids.has(row.id||row.existingId),row.title);
 }
});
test('27 valid additions retain the existing 1485 tracks without duplicates',()=>{
 const priorPool=tournamentMusicCatalog.filter(t=>!americanRapTracks.some(track=>track.id===t.id));
 assert.equal(novemberTrendTracks.length,27);assert.equal(priorPool.length,1512);
 assert.equal(new Set(priorPool.map(cupTrackKey)).size,1512);assert.equal(new Set(priorPool.map(t=>t.id)).size,1512);
 assert.equal(novemberTrendTracks.filter(t=>t.region==='polish').length,5);
 for(const t of novemberTrendTracks){const meta=songSpotTrackMetadata(t);assert.ok(meta.year>=1900&&meta.year<=2026);assert.ok(meta.artists.length&&meta.genres.length&&meta.source);assert.match(t.coverUrl,/600x600bb/);assert.match(t.previewUrl,/^https:\/\/audio-ssl\.itunes\.apple\.com\//);}
});
