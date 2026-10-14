import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const {Audio}=await import('../js/audio.js');
class Media extends EventTarget {
  dataset={};isConnected=true;paused=true;ended=false;currentTime=0;duration=30;readyState=0;volume=.7;src='';
  load(){this.currentTime=0;this.readyState=0;}
  metadata(){this.readyState=1;this.dispatchEvent(new Event('loadedmetadata'));}
  play(){this.paused=false;this.dispatchEvent(new Event('play'));return Promise.resolve();}
  pause(){this.paused=true;this.dispatchEvent(new Event('pause'));}
  removeAttribute(){this.src='';}
}
test('replaying either completed preview starts at zero after delayed metadata arrives',async()=>{
  const media=new Media();
  for(const side of ['A','B']){
    Audio.setTrackAudioSource(media,`replay:${side}`,`https://example.com/${side}.m4a`,{autoplay:false});
    media.metadata();await media.play();media.currentTime=10;media.pause();
  }
  for(const side of ['A','B','A']){
    Audio.setTrackAudioSource(media,`replay:${side}`,`https://example.com/${side}.m4a`,{autoplay:false,restart:true});
    media.currentTime=0;await media.play();media.metadata();
    assert.equal(media.currentTime,0);assert.equal(media.paused,false);
    media.currentTime=10;media.pause();
  }
  Audio.stopTrackAudio(media);
});
test('normal restoration remains available and obsolete metadata cannot seek a new source',()=>{
  const media=new Media();
  Audio.setTrackAudioSource(media,'saved','https://example.com/saved.m4a',{autoplay:false});media.metadata();media.currentTime=12;media.pause();
  Audio.setTrackAudioSource(media,'saved','https://example.com/saved.m4a',{autoplay:false});media.metadata();assert.equal(media.currentTime,12);
  Audio.setTrackAudioSource(media,'saved','https://example.com/saved.m4a',{autoplay:false});
  Audio.setTrackAudioSource(media,'fresh','https://example.com/fresh.m4a',{autoplay:false,restart:true});media.metadata();assert.equal(media.currentTime,0);
  Audio.stopTrackAudio(media);
});
test('tournament explicitly restarts previews without changing the choice phase on replay',()=>{
  const source=readFileSync(new URL('../js/playlistTournament.js',import.meta.url),'utf8');
  assert.ok(source.includes('{autoplay:false,restart:true}'));
  const play=source.slice(source.indexOf('  function play('),source.indexOf('  function finish('));
  assert.ok(!play.includes('finishPreview'));assert.ok(!play.includes('engine.start'));
});
