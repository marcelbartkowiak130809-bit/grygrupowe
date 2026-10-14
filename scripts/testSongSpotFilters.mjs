import assert from 'node:assert/strict';
import {test} from 'node:test';
import {tournamentMusicCatalog as musicPreviewCatalog} from '../js/tournamentMusic.js';
import {filterSongSpotTracks, songSpotRanked, songSpotTrackMetadata, songSpotArtistOptions, normalizeSongSpotFilters} from '../js/songSpotFilters.js';
const stored=new Map();
globalThis.localStorage={getItem:key=>stored.get(key)||null,setItem:(key,value)=>stored.set(key,value)};
const {SongSpotSoloEngine:engine}=await import('../js/songSpot.js');

test('all playable songs have researched era, genre and performer metadata',()=>{
  for(const track of musicPreviewCatalog.filter(t=>t.previewUrl)) {
    const metadata=songSpotTrackMetadata(track);
    assert.ok(metadata.year>=1900 && metadata.year<=2026,`${track.artist} — ${track.title}: year`);
    assert.ok(metadata.genres.length,`${track.title}: genre`);
    assert.ok(metadata.artists.length && metadata.source,`${track.title}: artist/source`);
  }
});
test('decades, genres and featured artists filter a shared track pool',()=>{
  const all=filterSongSpotTracks(musicPreviewCatalog,{era:'all',genre:'all',artists:[]});
  assert.equal(all.length,musicPreviewCatalog.length);
  for(const era of ['classic','2000s','2010s','2020s']) assert.ok(filterSongSpotTracks(all,{era}).length>0);
  const featured=all.find(t=>t.title.includes('feat. SZA'));
  assert.ok(songSpotTrackMetadata(featured).artists.includes('SZA'));
  const options=songSpotArtistOptions(all);assert.ok(options.some(([id])=>id==='sza'));
  assert.ok(!options.some(([id])=>['a smile','fire','luv (feat. halsey'].includes(id)));
  assert.ok(songSpotTrackMetadata(all.find(t=>t.title.startsWith('Boy With Luv'))).artists.includes('Halsey'));
  assert.equal(filterSongSpotTracks(all,{artists:['sza','doja cat']}).length,0);
  assert.ok(filterSongSpotTracks(all,{artists:['sza','doja cat','ariana grande']}).length>0);
  const kpop=all.find(t=>songSpotTrackMetadata(t).genres.includes('kpop'));
  if(kpop) assert.ok(filterSongSpotTracks([kpop],{genre:'pop'}).length===1);
});
test('only all-filter runs count and regional records do not leak',()=>{
  const player='filter-regression';
  let state=engine.start(player,'global');
  const title=()=>musicPreviewCatalog.find(t=>t.id===state.trackId).title;
  engine.guess(player,title());assert.equal(state.records.global,1);assert.equal(state.records.polish,0);
  assert.ok(engine.setFilters(player,{artists:['sza']}).error);
  engine.setFilters(player,{genre:'hiphop'});state=engine.start(player,'global');
  engine.guess(player,title());assert.equal(state.records.global,1);assert.equal(state.rankedRun,false);
  engine.setFilters(player,{});engine.setRegion(player,'polish');state=engine.start(player,'polish');
  engine.guess(player,title());assert.equal(state.records.polish,1);assert.equal(state.records.global,1);
  assert.equal(songSpotRanked({era:'2010s'}),false);assert.equal(songSpotRanked({artists:['a','b','c']}),false);
});

test('edition dates do not move original classics into modern decades',()=>{
  for(const [id,year] of [['itunes-1525933490',1995],['fallback-46',1982],['polish-extra-11',1983]]) {
    const track=musicPreviewCatalog.find(t=>t.id===id);
    assert.equal(songSpotTrackMetadata(track).year,year);
    assert.equal(filterSongSpotTracks([track],{era:'classic'}).length,1);
    assert.equal(filterSongSpotTracks([track],{era:'2020s'}).length,0);
  }
  assert.ok(songSpotTrackMetadata(musicPreviewCatalog.find(t=>t.title==='Lose Yourself')).genres.includes('hiphop'));
});

test('changing filters ends a run; empty combinations do not fall back to all tracks',()=>{
  const player='filter-empty-regression';
  engine.start(player,'global');
  const state=engine.setFilters(player,{mode:'mix',era:'classic',genre:'kpop'});
  assert.equal(state.status,'idle');assert.equal(state.streak,0);
  const empty=engine.start(player,'global');
  assert.equal(empty.status,'idle');assert.equal(empty.trackId,'');assert.match(empty.lastError,/Brak utworów/);
  engine.setFilters(player,{});
  const ranked=engine.start(player,'global');assert.equal(ranked.rankedRun,true);assert.equal(ranked.streak,0);
});

test('artist filters and genre/decade filters are mutually exclusive',()=>{
  const artists=normalizeSongSpotFilters({mode:'artists',era:'classic',genre:'hiphop',artists:['sza','doja cat','ariana grande']});
  assert.equal(artists.era,'all');assert.equal(artists.genre,'all');assert.equal(artists.artists.length,3);
  const mix=normalizeSongSpotFilters({...artists,mode:'mix',era:'2010s',genre:'pop'});
  assert.deepEqual(mix.artists,[]);assert.equal(mix.era,'2010s');assert.equal(mix.genre,'pop');
  assert.equal(songSpotRanked({mode:'artists',artists:[]}),true);
  for(const [id,name,cover] of songSpotArtistOptions(musicPreviewCatalog.filter(t=>t.previewUrl))) assert.ok(cover,`${name}: album icon missing`);
});
