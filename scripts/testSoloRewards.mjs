import {test} from 'node:test';
import assert from 'node:assert/strict';
import {claimSoloReward,soloRewardOffer,SOLO_DAILY_COINS} from '../js/soloRewards.js';
import {PlaylistTournamentEngine as engine,tournamentMatchKey,tournamentPair} from '../js/playlistTournamentEngine.js';
const store=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};};
const now=Date.parse('2026-10-14T12:00:00Z');
const correct=(trackId='song')=>({status:'reveal',rankedRun:true,lastResult:{correct:true,trackId}});
test('fast solo rewards are small, only correct results qualify',()=>{
 assert.equal(soloRewardOffer('songspot',correct()).amount,2);
 assert.equal(soloRewardOffer('songspot',{...correct(),rankedRun:false}).amount,1);
 assert.equal(soloRewardOffer('songspot',{...correct(),lastResult:{correct:false}}),null);
 assert.equal(soloRewardOffer('songspot',{...correct(),status:'playing'}),null);
 assert.equal(soloRewardOffer('popularnosc-solo',{status:'reveal',lastResult:{correct:true,metric:'views',pair:[{id:'a'},{id:'b'}]}}).amount,1);
});
test('reloads, duplicate claims and rapid clicking do not pay again',()=>{
 const storage=store();assert.equal(claimSoloReward(storage,'user','songspot',correct(),now),2);
 assert.equal(claimSoloReward(storage,'user','songspot',correct(),now+3000),0);
 assert.equal(claimSoloReward(storage,'user','songspot',correct('b'),now+1000),0);
 assert.equal(claimSoloReward(storage,'user','songspot',correct('b'),now+3000),2);
 assert.equal(claimSoloReward(storage,'other','songspot',correct(),now+3000),2);
 assert.equal(claimSoloReward(storage,'','songspot',correct(),now),0);
});
test('daily cap is shared across solo games and resets at Warsaw midnight',()=>{
 const storage=store();let paid=0;for(let i=0;i<100;i++)paid+=claimSoloReward(storage,'user','songspot',correct(String(i)),now+i*3000);
 assert.equal(paid,SOLO_DAILY_COINS);assert.equal(claimSoloReward(storage,'user','songspot',correct('tomorrow'),now+86400000),2);
 const midnight=Date.parse('2026-10-14T21:59:50Z');assert.equal(claimSoloReward(store(),'user','songspot',correct(),midnight),2);
});
test('turnament pays once on completion, skipped previews and replays cannot inflate listening',()=>{
 const tracks=Array.from({length:8},(_,i)=>({id:String(i),title:'Song '+i,artist:'Artist',previewUrl:'https://example.com/'+i+'.m4a'}));
 engine.load('reward',tracks,{previewSeconds:10});let state=engine.start('reward');
 while(state.status==='playing'){const key=tournamentMatchKey(state);for(const side of ['left','right']){engine.progress('reward',side,10,key);engine.progress('reward',side,10,key);engine.finishPreview('reward',side,key);}engine.choose('reward','left',key);}
 assert.equal(state.listenedSeconds,140);assert.equal(soloRewardOffer('playlista-cup',state).amount,4);
 const storage=store();assert.equal(claimSoloReward(storage,'user','playlista-cup',state,now),4);assert.equal(claimSoloReward(storage,'user','playlista-cup',state,now+3000),0);
 assert.equal(claimSoloReward(storage,'user','playlista-cup',state,now+86400000),0);
 engine.load('skip',tracks);state=engine.start('skip');while(state.status==='playing'){const key=tournamentMatchKey(state);engine.finishPreview('skip','left',key);engine.finishPreview('skip','right',key);engine.choose('skip','left',key);}assert.equal(soloRewardOffer('playlista-cup',state),null);
 const capped={...state,listenedSeconds:9000};assert.equal(soloRewardOffer('playlista-cup',capped).amount,30);
});
test('storage failure cannot pay an unrecorded repeatable reward',()=>{
 assert.equal(claimSoloReward({getItem(){return null;},setItem(){throw Error('full');}},'user','songspot',correct(),now),0);
});
