import assert from 'node:assert/strict';
import {test} from 'node:test';
import {songSpotShareData, SONGSPOT_SHARE_URL} from '../js/songSpotShare.js';
const state={status:'reveal',region:'polish',streak:3,rankedRun:true,lastResult:{title:'Małgośka',artist:'Maryla Rodowicz',coverUrl:'cover',correct:true,seconds:0.5,guess:'private'},playlist:{tracks:['private']}};
test('SongSpot share uses exact listening time, region and public profile only',()=>{
  const data=songSpotShareData(state,{nick:'Żółw',avatarImage:'avatar',email:'private',password:'secret'});
  assert.equal(data.timeText,'Zgadnięto po: 0,5 s odsłuchu');assert.equal(data.nick,'Żółw');assert.equal(data.modeLabel,'ZGADNIJ UTWÓR');
  assert.equal(data.footer,'Polskie · Streak: 3 · Ranking');assert.equal(data.coverUrl,'cover');
  assert.ok(!JSON.stringify(data).includes('private'));assert.ok(!JSON.stringify(data).includes('secret'));
  assert.equal(SONGSPOT_SHARE_URL,'https://grygrupowe.pages.dev/songspot-solo');
});
test('failure and training are not presented as a ranked win; unfinished songs cannot be shared',()=>{
  const data=songSpotShareData({...state,rankedRun:false,filters:{mode:'playlist'},lastResult:{...state.lastResult,correct:false,seconds:15}});
  assert.equal(data.timeText,'Nie odgadnięto · odsłuch: 15 s');assert.equal(data.playerLabel,'NIE ODGADNIĘTO');assert.equal(data.footer,'Twoja playlista · Streak: 3 · Trening');
  assert.throws(()=>songSpotShareData({...state,status:'playing'}),/zakończ/);
  assert.throws(()=>songSpotShareData({...state,lastResult:null}),/zakończ/);
});
