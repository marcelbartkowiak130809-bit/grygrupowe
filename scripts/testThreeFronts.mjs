import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cards,cardById} from '../js/fronts/cards.mjs';
import {applyAction,attackPlays,cardPlays,createMatch,legalActions,matchView,occupied,tableLimit,turnMs} from '../js/fronts/engine.mjs';
import {botMove} from '../js/fronts/bot.mjs';
import {statusFor,updatePool} from '../js/fronts/queue.mjs';

const setup = (a=[],b=[]) => {
  const match = createMatch(['Lis','Sowa'],0,()=>.58);
  for (const [i, cards] of [a,b].entries()) {
    match.players[i].hand=cards;
    match.players[i].energy=6;
  }
  return match;
};
const play = (state,side,action) => {
  const result=applyAction(state,side,action,1);
  assert.ok(result,`Nielegalny ruch: ${JSON.stringify(action)}`);
  return result;
};
const unit = (card,key=1) => ({card,key,hp:cardById[card].hp,readyAt:1});

test('wspólna talia ma 50 niepowtarzalnych kart i gotowe otwarcie',()=>{
  const state=createMatch(['Lis','Sowa'],11,()=>.48);
  assert.equal(cards.filter(card=>card.type==='unit').length,35);
  assert.equal(cards.filter(card=>card.type==='tactic').length,15);
  assert.equal(new Set([...state.deck,...state.players.flatMap(p=>p.hand)]).size,50);
  for (const player of state.players) {
    assert.equal(player.hand.length,4);
    assert.ok(player.hand.some(id=>cardById[id].type==='unit'&&cardById[id].cost<=2));
  }
  assert.ok(!('deck' in matchView(state,0)));
  assert.deepEqual(matchView(state,0).players[1].hand,[]);
  assert.equal(matchView(state,0).players[1].handCount,4);
});

test('każdą z 50 kart można zagrać zgodnie z jej celowaniem',()=>{
  for (const card of cards) {
    const state=setup([card.id]);
    state.players[0].board={0:unit('ent'),1:unit('golem')};
    state.players[1].board={0:unit('ent'),2:unit('knight')};
    const actions=cardPlays(state,0,0);
    assert.ok(actions.length,card.id);
    for (const action of actions) assert.ok(play(state,0,action).effects.length,card.id);
  }
});

test('atak wskazuje dowolną jednostkę i dopiero pusty stół odsłania zamek',()=>{
  let state=setup(['knight','lancer']);
  state.players[1].board={8:unit('ent',8),11:unit('knight',11)};
  state=play(state,0,{type:'play',index:0,target:-1});
  assert.deepEqual(attackPlays(state,0,1),[]);
  state=play(state,0,{type:'play',index:0,target:-1});
  assert.deepEqual(attackPlays(state,0,2),[{type:'attack',from:2,to:8},{type:'attack',from:2,to:11}]);
  state=play(state,0,{type:'attack',from:2,to:8});
  assert.equal(state.players[1].board[8].hp,3);
  assert.deepEqual(attackPlays(state,0,2),[]);
  state.players[0].board[3]=unit('archer',3);
  state.players[1].board={};
  assert.deepEqual(attackPlays(state,0,3),[{type:'attack',from:3,to:-1}]);
});

test('w kolejnej turze dobierasz raz, a rywal widzi tylko rewers',()=>{
  let state=setup();
  state=play(state,0,{type:'end'});
  assert.deepEqual(legalActions(state,1),[{type:'draw'}]);
  const card=state.deck[0], count=state.deck.length;
  state=play(state,1,{type:'draw'});
  assert.equal(state.players[1].hand[0],card);
  assert.equal(state.deck.length,count-1);
  assert.equal(applyAction(state,1,{type:'draw'},1),null);
  assert.deepEqual(matchView(state,0).effects,[{type:'draw',side:1,key:-1,accepted:true}]);
  assert.deepEqual(matchView(state,0).players[1].hand,[]);
});

test('pułapka, szlam i feniks działają przy wspólnym stole',()=>{
  let state=setup(['trap','bolt']);
  state.unitSerial=10;
  state.players[1].board={5:unit('lancer',5),6:unit('slime',6),7:{...unit('phoenix',7),hp:2}};
  state=play(state,0,{type:'play',index:0,target:-1});
  state=play(state,0,{type:'play',index:0,target:6});
  assert.equal(Object.values(state.players[1].board).filter(unit=>unit.card==='mini').length,2);
  state.players[0].hand=['bolt'];
  state=play(state,0,{type:'play',index:0,target:7});
  assert.equal(Object.values(state.players[1].board).find(unit=>unit.card==='egg').hp,2);
  state=play(state,0,{type:'end'});
  assert.equal(Object.values(state.players[1].board).find(unit=>unit.card==='phoenix').hp,2);
  state=play(state,1,{type:'draw'});
  state=play(state,1,{type:'attack',from:5,to:-1});
  assert.equal(state.players[0].hp,20);
  assert.equal(state.players[1].board[5],undefined);
  assert.equal(state.players[0].trapped,undefined);
});

test('stół mieści do pięciu kart i wczytuje zapis ze starej planszy',()=>{
  let state=setup(['fox']);
  delete state.tableVersion;
  state.players[0].board={0:unit('archer',18),2:unit('ent',19)};
  state.players[0].traps={1:'trap'};
  state.unitSerial=19;
  const migrated=matchView(state,0);
  assert.deepEqual(occupied(migrated,0),[18,19]);
  assert.equal(migrated.players[0].trapped,true);
  assert.equal(migrated.tableVersion,2);
  state=setup(['fox']);
  state.players[0].board=Object.fromEntries(Array.from({length:tableLimit},(_,index)=>[1+index,unit('slime',index+1)]));
  assert.deepEqual(cardPlays(state,0,0),[]);
});

test('kolejka paruje dwóch graczy, odrzuca ponowioną i cudzą akcję',()=>{
  const random=()=>.56;
  const change=(pool,uid,request,now=20)=>updatePool(pool,uid,request,now,random,'m1');
  let pool=change({},'a',{kind:'join',name:'Lis'});
  assert.equal(statusFor(pool,'a',20).stage,'searching');
  pool=change(pool,'b',{kind:'join',name:'Sowa'});
  const alice=statusFor(pool,'a',20);
  const bob=statusFor(pool,'b',20);
  assert.equal(alice.id,bob.id);
  assert.notEqual(alice.match.you,bob.match.you);
  assert.equal(statusFor(pool,'intruder',20).stage,'idle');
  const end={kind:'act',id:'m1',revision:0,action:{type:'end'}};
  pool=change(pool,'b',end);
  assert.equal(statusFor(pool,'a',20).match.turn,1);
  pool=change(pool,'a',end);
  assert.equal(statusFor(pool,'b',20).match.turn,2);
  pool=change(pool,'b',end);
  assert.equal(statusFor(pool,'a',20).match.turn,2);
  pool=change(pool,'b',{kind:'status'},20+turnMs);
  assert.equal(statusFor(pool,'a',20+turnMs).match.turn,3);
});

test('dwadzieścia pełnych partii bota kończy się poprawnym wynikiem',()=>{
  for (let seed=1;seed<=20;seed++) {
    let n=seed;
    const random=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/2**32;};
    let state=createMatch(['Lis','Sowa'],0,random);
    for (let i=0;i<600&&state.phase==='battle';i++) {
      const action=botMove(state,state.active,1,random);
      assert.deepEqual(legalActions(state,state.active).some(candidate=>JSON.stringify(candidate)===JSON.stringify(action)),true);
      state=play(state,state.active,action);
    }
    assert.equal(state.phase,'finished');
    assert.ok([-1,0,1].includes(state.winner));
    assert.ok(state.players.some(player=>player.hp===0));
  }
});
