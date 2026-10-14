import assert from 'node:assert/strict';
import {test} from 'node:test';
import {tournamentMusicCatalog as musicPreviewCatalog} from '../js/tournamentMusic.js';
import {songSpotTier,songSpotRoundTier,parseSongSpotPlaylist,matchSongSpotPlaylistEntry,importSongSpotPlaylist,songSpotTrackLinks} from '../js/songSpotLibrary.js';
import {songSpotRanked,songSpotArtistOptions} from '../js/songSpotFilters.js';
const stored=new Map();globalThis.localStorage={getItem:key=>stored.get(key)||null,setItem:(key,value)=>stored.set(key,value)};
const {SongSpotSoloEngine:engine}=await import('../js/songSpot.js');
const trackFor=state=>musicPreviewCatalog.find(t=>t.id===state.trackId);
test('wrong answers advance cumulative stages and lose only on the last stage',()=>{
  const player='wrong-stages',state=engine.start(player),id=state.trackId;
  engine.markPlayed(player);engine.setPlaybackPosition(player,.08);
  for(let index=1;index<5;index++){engine.guess(player,'not a valid song',{trackId:id});assert.equal(state.status,'playing');assert.equal(state.timeIndex,index);assert.equal(state.trackId,id);assert.equal(state.streak,0);assert.equal(state.playbackPosition,.08);}
  engine.guess(player,'not a valid song');assert.equal(state.status,'over');assert.equal(state.lastResult.correct,false);assert.equal(state.trackId,id);
});
test('correct guess after a wrong answer reports heard seconds and counts once',()=>{
  const player='second-chance',state=engine.start(player);engine.guess(player,'incorrect');engine.markPlayed(player);engine.setPlaybackPosition(player,.4);
  engine.guess(player,trackFor(state).title);assert.equal(state.status,'reveal');assert.equal(state.streak,1);assert.equal(state.lastResult.seconds,.4);assert.ok(state.lastResult.previewUrl);
  engine.guess(player,trackFor(state).title);assert.equal(state.streak,1);
});
test('tiers select correct pools; only All is ranked; cycle repeats easy medium hard',()=>{
  for(const region of ['global','polish'])for(const level of ['easy','medium','hard']){
    const player=`tier-${region}-${level}`;engine.setFilters(player,{level});const state=engine.start(player,region);assert.equal(songSpotTier(trackFor(state)),level);assert.equal(state.rankedRun,false);
    engine.guess(player,trackFor(state).title);assert.equal(state.records[region],0);
  }
  const player='cycle';engine.setFilters(player,{level:'cycle'});let state=engine.start(player);
  for(let round=1;round<=7;round++){assert.equal(songSpotTier(trackFor(state)),songSpotRoundTier('cycle',round));engine.guess(player,trackFor(state).title);state=engine.next(player);}
  assert.equal(songSpotRanked({level:'easy'}),false);assert.equal(songSpotRanked({mode:'playlist'}),false);assert.equal(songSpotRanked({level:'all'}),true);
});
test('artist counts include featured credits in the actual playable pool',()=>{
  const pool=musicPreviewCatalog.filter(t=>t.previewUrl),options=songSpotArtistOptions(pool);
  assert.ok(options.find(([id])=>id==='doja cat')[3]>10);
  assert.ok(options.find(([id])=>id==='sza')[3]>0);
});
test('playlist parsing, exact matching and imports report missing/ambiguous songs',async()=>{
  assert.throws(()=>parseSongSpotPlaylist('https://open.spotify.com/playlist/abc'),/nie link/);
  assert.throws(()=>parseSongSpotPlaylist(Array(201).fill('Adele — Hello').join('\n')),/200/);
  assert.equal(matchSongSpotPlaylistEntry({artist:'Original',title:'Song'},[{artist:'Cover',title:'Song',previewUrl:'a'}]),null);
  assert.ok(matchSongSpotPlaylistEntry({artist:'Ariana Grande',title:'Break Free'},[{artist:'Ariana Grande',title:'Break Free (feat. Zedd)',previewUrl:'a'}]));
  assert.equal(matchSongSpotPlaylistEntry({artist:'Queen',title:'Song'},[{artist:'Queen Naija',title:'Song',previewUrl:'a'}]),null);
  const entry=musicPreviewCatalog.find(t=>t.previewUrl),text=`${entry.artist} — ${entry.title}\nUnknown Artist — Missing`;
  const result=await importSongSpotPlaylist(text,musicPreviewCatalog,{fetcher:async()=>({ok:true,json:async()=>({results:[]})}),pause:async()=>{}});
  assert.equal(result.tracks.length,1);assert.deepEqual(result.missing,['Unknown Artist — Missing']);
  assert.equal(engine.setPlaylist,undefined);
});
test('retired personal playlists are reset on restore and external song links stay safe',()=>{
  const track={id:'playlist-itunes-qa',title:'Test song',artist:'Test artist',previewUrl:'https://audio-ssl.itunes.apple.com/preview.m4a',externalUrl:'https://music.apple.com/pl/song/123'};
  localStorage.setItem('grygrupowe-songspot-solo-v1:imported',JSON.stringify({status:'playing',filters:{mode:'playlist'},trackId:track.id,playlist:{tracks:[track]}}));
  const state=engine.get('imported');assert.equal(state.status,'idle');assert.equal(state.filters.mode,'mix');assert.equal(state.playlist,undefined);
  const links=songSpotTrackLinks(track);assert.ok(links.embed.startsWith('https://embed.music.apple.com/'));assert.equal(songSpotTrackLinks({...track,externalUrl:'javascript:alert(1)'}).embed,'');
});
