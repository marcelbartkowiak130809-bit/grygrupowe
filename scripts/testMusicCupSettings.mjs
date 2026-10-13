import assert from 'node:assert/strict';
import {test} from 'node:test';
import {cupSettings,cupEstimate,randomCupTracks,cupSizes} from '../js/musicCupSettings.js';
import {PlaylistTournamentEngine as engine,tournamentMatchKey} from '../js/playlistTournamentEngine.js';
import {musicPreviewCatalog,musicCatalogForRegion} from '../js/music.js';
test('each region supplies 128 unique playable songs and every supported size samples without repeats',()=>{
  for(const pool of [musicPreviewCatalog,musicCatalogForRegion('polish'),musicCatalogForRegion('global')])for(const size of cupSizes){const songs=randomCupTracks(pool,size);assert.equal(songs.length,size);assert.equal(new Set(songs.map(t=>t.id)).size,size);}
  assert.throws(()=>randomCupTracks([],8),/mniejszy/);
});
test('estimates include both previews per match and decision time; defaults are bounded',()=>{
  assert.deepEqual(cupEstimate(8,10),{min:3,max:4,matches:7});assert.deepEqual(cupEstimate(128,30),{min:134,max:144,matches:127});
  assert.deepEqual(cupSettings({size:999,previewSeconds:999,region:'bad'}),{size:16,previewSeconds:10,region:'all'});
});
test('preview length is frozen per tournament and survives next matches, rematch and restore',async()=>{
  const saved=new Map();globalThis.localStorage={getItem:key=>saved.get(key)||null,setItem:(key,value)=>saved.set(key,value)};
  engine.load('custom-preview',randomCupTracks(musicPreviewCatalog,8),{previewSeconds:5,settings:{size:8,previewSeconds:5,region:'all'}});
  let state=engine.start('custom-preview'),key=tournamentMatchKey(state);engine.progress('custom-preview','left',9,key);assert.equal(state.seconds.left,5);
  engine.finishPreview('custom-preview','left',key);engine.finishPreview('custom-preview','right',key);engine.choose('custom-preview','left',key);assert.equal(state.previewSeconds,5);
  const fresh=await import('../js/playlistTournamentEngine.js?settings-restore');assert.equal(fresh.PlaylistTournamentEngine.get('custom-preview').previewSeconds,5);
  assert.equal(engine.start('custom-preview').previewSeconds,5);
});
