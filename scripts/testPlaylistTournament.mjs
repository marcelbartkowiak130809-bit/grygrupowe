import assert from 'node:assert/strict';
import {test} from 'node:test';
import {PlaylistTournamentEngine as engine, tournamentMatchKey, tournamentPair, tournamentTracks} from '../js/playlistTournamentEngine.js';
const saved = new Map();
globalThis.localStorage = {getItem:key => saved.get(key) || null, setItem:(key,value) => saved.set(key,value)};
const tracks = count => Array.from({length:count}, (_,id) => ({id:`t-${id}`,title:`Song ${id}`,artist:`Artist ${id}`,previewUrl:`https://audio.example.com/${id}.m4a`,coverUrl:'https://cover.example.com/test.jpg'}));

test('every playlist size 2–200 needs exactly n−1 choices and loses no entrants', () => {
  for (let count=2; count<=200; count++) {
    const owner=`size-${count}`; engine.load(owner,tracks(count)); let state=engine.start(owner,()=>.5);
    while(state.status==='playing') {
      const key=tournamentMatchKey(state), pair=tournamentPair(state);
      assert.equal(pair.length,2); assert.notEqual(pair[0].id,pair[1].id);
      assert.equal(engine.finishPreview(owner,'left',key),true);
      assert.equal(engine.finishPreview(owner,'right',key),true);
      assert.equal(engine.choose(owner,state.match%2?'left':'right',key),true);
      state=engine.get(owner);
    }
    assert.equal(state.history.length,count-1);
    assert.equal(new Set(state.history.map(m=>m.loserId)).size,count-1);
    assert.ok(!state.history.some(m=>m.loserId===state.winnerId));
    assert.ok(state.tracks.some(t=>t.id===state.winnerId));
    if(count%2 && count>2) assert.ok(state.byes.length);
  }
});
test('stale previews, premature choices and rapid double clicks cannot change the bracket', () => {
  const owner='race';engine.load(owner,tracks(4));const state=engine.start(owner,()=>.5), key=tournamentMatchKey(state);
  assert.equal(engine.choose(owner,'left',key),false);
  assert.equal(engine.finishPreview(owner,'right',key),false);
  assert.equal(engine.finishPreview(owner,'left','old-match'),false);
  assert.equal(engine.progress(owner,'left',5,key),true);assert.equal(state.seconds.left,5);
  engine.finishPreview(owner,'left',key);engine.finishPreview(owner,'right',key);
  assert.equal(engine.choose(owner,'left',key),true);
  assert.equal(engine.choose(owner,'right',key),false);
  assert.equal(engine.finishPreview(owner,'left',key),false);
  assert.equal(state.history.length,1);
  assert.equal(state.stage,'left');assert.deepEqual(state.seconds,{left:0,right:0});
});
test('duplicates and unsafe media are removed and minimum size is enforced', () => {
  const list=tracks(2);
  assert.equal(tournamentTracks([...list,list[0],{...list[0],id:'duplicate'},{...list[1],id:'unsafe',title:'Unsafe',previewUrl:'javascript:alert(1)'}]).length,2);
  assert.throws(()=>engine.load('invalid',[list[0]]),/co najmniej 2/);
});
test('restart shuffles the same songs and reset preserves the loaded playlist', () => {
  engine.load('restart',tracks(5));let state=engine.start('restart',()=>.5);
  const previousKey=tournamentMatchKey(state);state=engine.start('restart',()=>0);
  assert.notEqual(tournamentMatchKey(state),previousKey);assert.equal(state.history.length,0);
  assert.equal(state.entrants.length,5);state=engine.reset('restart');assert.equal(state.status,'setup');assert.equal(state.tracks.length,5);
});
test('bracket and imported media restore without relying on the built-in catalog', async () => {
  engine.load('restore',tracks(3));const state=engine.start('restore',()=>.5), key=tournamentMatchKey(state);
  engine.finishPreview('restore','left',key);
  const restored=await import('../js/playlistTournamentEngine.js?restore-test');
  assert.equal(restored.PlaylistTournamentEngine.get('restore').stage,'right');
  assert.deepEqual(restored.tournamentPair(restored.PlaylistTournamentEngine.get('restore')),tournamentPair(state));
});
