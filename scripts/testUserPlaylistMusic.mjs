import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {userPlaylistTracks} from '../js/userPlaylistMusic.js';
import {tournamentMusicCatalog} from '../js/tournamentMusic.js';
import {cupTrackKey} from '../js/tournamentMusicKey.js';
import {songSpotTrackMetadata,songSpotArtistOptions,filterSongSpotTracks} from '../js/songSpotFilters.js';
const report=JSON.parse(readFileSync(new URL('../docs/user-playlist-music-research.json',import.meta.url),'utf8'));
test('all 16 supplied public Apple sources were completely read and every song is represented',()=>{
 assert.equal(report.sources.length,16);assert.equal(report.unavailable.length,0);
 const keys=new Set(tournamentMusicCatalog.map(cupTrackKey));
 for(const source of report.sources){assert.ok(!source.error,source.url);assert.equal(source.tracks,source.advertisedTracks);assert.equal(source.trackIds.length,source.tracks);
  for(const id of source.trackIds){const row=report.playlistRows.find(t=>t.id===id);assert.ok(row,`${source.title}: ${id}`);assert.ok(keys.has(cupTrackKey(row)),`${row.artist} — ${row.title}`);}
 }
});
test('250 new playable tracks are additive, unique and use high-resolution artwork',()=>{
 assert.equal(userPlaylistTracks.length,250);assert.equal(tournamentMusicCatalog.length,1450);
 assert.equal(new Set(tournamentMusicCatalog.map(t=>t.id)).size,1450);
 assert.equal(new Set(tournamentMusicCatalog.map(cupTrackKey)).size,1450);
 assert.equal(report.trackResearch.length,250);
 for(const t of userPlaylistTracks){assert.ok(tournamentMusicCatalog.some(s=>s.id===t.id));assert.match(t.coverUrl,/\/600x600bb/);assert.match(t.previewUrl,/^https:\/\/audio-ssl\.itunes\.apple\.com\//);assert.match(t.externalUrl,/^https:\/\/music\.apple\.com\//);const meta=songSpotTrackMetadata(t);assert.ok(meta.year>=1970&&meta.year<=2026);assert.ok(meta.artists.length&&meta.genres.length&&meta.source);}
});
test('requested evergreen hits, correct eras and featured artists work in quiz filters',()=>{
 for(const title of ["Livin' la Vida Loca",'Burn','Lights','Love Me Like You Do','Whenever, Wherever','Sweet but Psycho','Gimme More'])assert.ok(tournamentMusicCatalog.some(t=>t.title===title),title);
 const ellie=songSpotArtistOptions(tournamentMusicCatalog).find(a=>a[0]==='ellie goulding');assert.ok(ellie[3]>=8);
 const song=userPlaylistTracks.find(t=>t.artist==='Ellie Goulding'&&t.title==='Your Song');assert.equal(songSpotTrackMetadata(song).year,2010);assert.equal(filterSongSpotTracks([song],{era:'classic'}).length,0);
 const polish=userPlaylistTracks.filter(t=>t.region==='polish');assert.ok(polish.some(t=>t.artist==='Justyna Steczkowska'));
 const outside=tournamentMusicCatalog.find(t=>t.title.startsWith('Outside')&&t.artist.includes('Calvin'));assert.ok(songSpotTrackMetadata(outside).artists.includes('Ellie Goulding'));
});
