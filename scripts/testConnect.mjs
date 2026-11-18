import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ConnectEngine, connectWord, createConnectGame, submitConnectWord, revealConnectWord } from '../js/connect.js';

test('two players get the previous pair until their words match and both win',()=>{
 const game=createConnectGame(['host','guest'],{},1);
 const a='a'.repeat(64), b='b'.repeat(64);
 for (const [index,words] of [['jajko','komputer'],['farma','świnia'],['kurczak','KURCZAK']].entries()) {
  const now=1000+4000*index;
  assert.equal(ConnectEngine.commit(game,'host',a,now),undefined);
  assert.equal(game.phase,'thinking');
  assert.deepEqual(game.revealed,{});
  assert.equal(ConnectEngine.commit(game,'guest',b,now+1),undefined);
  assert.equal(game.phase,'revealing');
  assert.equal(ConnectEngine.reveal(game,'host',words[0],b,now+2),'Nie udało się odsłonić słowa.');
  ConnectEngine.reveal(game,'host',words[0],a,now+2);
  assert.equal(game.phase,'revealing');
  ConnectEngine.reveal(game,'guest',words[1],b,now+3);
  if(index<2){
   assert.equal(game.phase,'roundResult');
   assert.equal(game.roundResult.matched,false);
   ConnectEngine.nextRound(game,{},now+4);
   assert.deepEqual(game.pair,words);
  }
 }
 assert.equal(game.finished,true);
 assert.equal(game.phase,'gameSummary');
 assert.deepEqual(game.winners,['host','guest']);
 assert.equal(game.round,3);
});

test('timeout preserves the pair and advances only the attempt',()=>{
 const game=createConnectGame(['host','guest'],{answerTime:15},100);
 game.pair=['farma','świnia'];
 assert.ok(ConnectEngine.timeout(game,200));
 assert.equal(ConnectEngine.timeout(game,15100),undefined);
 assert.deepEqual(game.roundResult.words,[]);
 ConnectEngine.nextRound(game,{},16000);
 assert.deepEqual(game.pair,['farma','świnia']);
 assert.equal(game.round,1);
 assert.equal(game.attempt,2);
 assert.equal(ConnectEngine.interrupt(game,['host']),true);
 assert.equal(game.phase,'interrupted');
});

test('words must be single and private storage reveals the matching commit after reload',async()=>{
 for(const value of ['dwa słowa','kot!',42,''])assert.equal(connectWord(value),'');
 assert.equal(connectWord(' świnia '),'świnia');
 const saved=new Map();
 globalThis.localStorage={setItem:(key,value)=>saved.set(key,value),getItem:key=>saved.get(key)};
 const room={roomId:'CODE',game:createConnectGame(['host','guest'])};
 room.game.siteGameId='one-test-game';
 let digest;
 await submitConnectWord(room,'host','świnia',value=>{digest=value;ConnectEngine.commit(room.game,'host',value);});
 assert.match(digest,/^[a-f0-9]{64}$/);
 assert.ok(!JSON.stringify(room.game).includes('świnia'));
 ConnectEngine.commit(room.game,'guest','b'.repeat(64));
 await revealConnectWord(room,'host',(word,value)=>ConnectEngine.reveal(room.game,'host',word,value));
 assert.equal(room.game.revealed.host,'świnia');
 room.game.attempt++;
 await revealConnectWord(room,'host',()=>assert.fail('Old word must not reveal on retry'));
});
