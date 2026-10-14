import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {musicPreviewCatalog} from '../js/music.js';
import {tournamentExtraTracks} from '../js/tournamentExtraMusic.js';
import {tournamentMusicCatalog,tournamentCatalogForRegion} from '../js/tournamentMusic.js';
import {cupTrackKey} from '../js/tournamentMusicKey.js';
import {randomCupTracks} from '../js/musicCupSettings.js';
test('tournament has 1200 unique playable songs; quiz catalog is unchanged',()=>{
 assert.equal(musicPreviewCatalog.length,866);assert.equal(tournamentExtraTracks.length,367);assert.equal(tournamentMusicCatalog.length,1200);
 const baseIds=new Set(musicPreviewCatalog.map(t=>String(t.id))),baseKeys=new Set(musicPreviewCatalog.map(cupTrackKey));
 for(const track of tournamentExtraTracks){assert.ok(!baseIds.has(track.id),track.title);assert.ok(!baseKeys.has(cupTrackKey(track)),track.title);}
 assert.equal(new Set(tournamentMusicCatalog.map(cupTrackKey)).size,1200);
 assert.equal(new Set(tournamentMusicCatalog.map(t=>t.id)).size,1200);
 for(const pool of [tournamentMusicCatalog,tournamentCatalogForRegion('polish'),tournamentCatalogForRegion('global')])assert.equal(randomCupTracks(pool,128).length,128);
});
test('new additions belong to existing artists and contain genuine Apple previews and high-resolution artwork',()=>{
 const artists=new Set(musicPreviewCatalog.map(t=>cupTrackKey({...t,title:''})));
 for(const t of tournamentExtraTracks){assert.ok(artists.has(cupTrackKey({...t,title:''})),t.artist);assert.match(t.previewUrl,/^https:\/\/audio-ssl\.itunes\.apple\.com\//);assert.match(t.coverUrl,/\/600x600bb/);assert.match(t.externalUrl,/^https:\/\/music\.apple\.com\//);assert.ok(t.title&&t.artist);}
});
test('rereleases and guest credits do not duplicate one composition',()=>{
 assert.equal(cupTrackKey({artist:'Taylor Swift',title:'Blank Space'}),cupTrackKey({artist:'Taylor Swift',title:"Blank Space (Taylor's Version)"}));
 assert.equal(cupTrackKey({artist:'Calvin Harris & Ellie Goulding',title:'Outside'}),cupTrackKey({artist:'Calvin Harris',title:'Outside (feat. Ellie Goulding)'}));
});
test('research documents 60 real monthly samples, distinct from monthly aggregated rankings',()=>{
 const report=JSON.parse(readFileSync(new URL('../docs/tournament-music-research.json',import.meta.url),'utf8'));
 assert.equal(report.sources.length,60);assert.equal(new Set(report.sources.map(s=>s.date.slice(0,7))).size,60);
 for(const source of report.sources){assert.ok(!source.error);assert.ok(source.rows>=100);assert.match(source.url,/^https:\/\/www.billboard.com\/charts\/billboard-global-200\//);}
 assert.equal(report.trackResearch.length,367);assert.ok(report.trackResearch.filter(t=>t.method==='billboard-monthly-snapshot').length>300);
 const playlist=readFileSync(new URL('../js/playlistTournament.js',import.meta.url),'utf8');assert.ok(playlist.includes('tournamentCatalogForRegion(selected.region)'));
 for(const file of ['songSpot.js','songSpotLibrary.js','popularity.js','lyrics.js'])assert.ok(!readFileSync(new URL('../js/'+file,import.meta.url),'utf8').includes('tournamentMusic.js'));
});
