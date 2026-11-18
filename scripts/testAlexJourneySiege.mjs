import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';
import { canPlayThirdChapter, chapterMenu, THIRD_CHAPTER_AT } from '../js/alexJourneyChapters.js';
import { createSiege, restoreSiege, saveSiege, siegeAction, siegeCraftReady, siegeItems, siegeScenes } from '../js/alexJourneySiege.js';

const node = id => ({type:'node',id});
const select = id => ({type:'select',id});
const use = (id,item) => [select(item),node(id)];
const slot = index => ({type:'slot',index});
const frame = {type:'frame'};
const next = {type:'next'};
const craft = {type:'craft'};

const route = [
 [node('supply'),node('map'),node('leave-home')],
 [node('shield-bench'),select('oak_planks'),...[0,2,3,4,5,7].map(slot),select('iron_ingot'),slot(1),craft],
 [node('rods'),node('threads'),node('bow-bench'),select('stick'),...[1,3,7].map(slot),select('string'),...[2,5,8].map(slot),craft,node('fletching'),node('arrows')],
 [node('wool'),node('halter'),node('old-bell'),...use('decoy','string')],
 [...use('read-map','map'),node('path-leaf'),node('path-star'),node('path-crest'),node('supply-chain')],
 [...use('trap-chain','chain'),...use('trap-bell','bell'),node('trap')],
 [...use('cover','shield'),...use('target','bow')],
 [node('inspect-track'),node('rail-a'),node('rail-c'),...use('cart','chain'),node('crank')],
 [node('signal'),node('code-sun'),node('code-quill'),node('code-key'),...use('free-alex','tripwire_hook')],
 [...use('ramp','oak_planks'),...use('wheel','lever'),node('hold'),...use('latch','bow'),node('escape')],
];

test('the release boundary and chapter 2 completion both control access', () => {
 assert.equal(new Date(THIRD_CHAPTER_AT).toISOString(),'2026-11-20T19:00:00.000Z');
 assert.equal(canPlayThirdChapter(true,THIRD_CHAPTER_AT-1),false);
 assert.equal(canPlayThirdChapter(false,THIRD_CHAPTER_AT),false);
 assert.equal(canPlayThirdChapter(true,THIRD_CHAPTER_AT),true);
 const card = (complete,now) => chapterMenu(2,true,complete,now).match(/<button[^>]+data-journey-chapter="3"[^>]*>/)[0];
 assert.match(card(true,THIRD_CHAPTER_AT-1),/disabled/);
 assert.match(card(false,THIRD_CHAPTER_AT),/disabled/);
 assert.doesNotMatch(card(true,THIRD_CHAPTER_AT),/disabled/);
});

test('all ten scenes solve from one inventory and reload at every checkpoint', () => {
 let state = createSiege(), now = 1000;
 const act = action => assert.equal(siegeAction(state,action,now+=137),true,JSON.stringify(action));
 for (let i=0;i<3;i++) act(frame);
 assert.equal(state.startedAt,0);
 for (const [i,actions] of route.entries()) {
  assert.equal(state.scene,i);
  assert.equal(siegeAction(state,next,now),false);
  for (const action of actions) act(action);
  assert.equal(state.flags[siegeScenes[i].finish],true);
  if (i<9) act(next);
  const restored = restoreSiege(saveSiege(state),now+137);
  assert.deepEqual(restored.flags,state.flags);
  assert.deepEqual(restored.stock,state.stock);
  assert.equal(restored.finishedAt,state.finishedAt);
  state = restored;
 }
 assert.equal(state.phase,'outro');
 assert.equal(state.stock.arrow,0);
 assert.equal(state.stock.oak_planks,0);
 assert.equal(state.stock.tripwire_hook,0);
 assert.ok(state.finishedAt>state.startedAt);
 const time = state.finishedAt;
 act(frame); act(frame);
 state=restoreSiege(saveSiege(state),now+137);
 assert.equal(state.frame,2);
 act(frame);
 assert.equal(state.phase,'result');
 act({type:'replay'});act(frame);act(frame);act(frame);
 assert.equal(state.finishedAt,time);
});

test('blocked mechanisms, wrong symbols and rearranged crafting never lose equipment', () => {
 const state=createSiege();
 const act = (type,id) => siegeAction(state,{type,id},2000);
 for(let i=0;i<3;i++) act('frame');
 route[0].forEach(action=>siegeAction(state,action,2000));act('next');act('node','shield-bench');
 act('select','iron_ingot');assert.ok(siegeAction(state,slot(0),2000));
 assert.equal(state.stock.iron_ingot,0);
 assert.equal(siegeCraftReady(state),false);
 assert.ok(siegeAction(state,slot(0),2000));assert.equal(state.stock.iron_ingot,1);
 assert.equal(siegeAction(state,craft,2000),false);
 for(const actions of route.slice(1,4)){
  actions.forEach(action=>assert.ok(siegeAction(state,action,2000),JSON.stringify(action)));
  act('next');
 }
 assert.ok(act('select','map')); assert.ok(act('node','read-map'));
 assert.ok(act('node','path-leaf')); assert.ok(act('node','path-crest'));
 assert.deepEqual(state.sequence,[]);
 assert.equal(act('node','supply-chain'),false);
 assert.equal(state.stock.map,1);
});

test('inventory icons and chapter props are packaged locally', () => {
 const textures = new Set([...Object.keys(siegeItems),...siegeScenes.flatMap(scene=>scene.nodes.map(node=>node.icon)),'pillager','crossbow_standby']);
 for (const texture of textures) assert.ok(existsSync(new URL(`../assets/minecraft/backpack/${texture}.png`,import.meta.url)),texture);
 assert.ok(existsSync(new URL('../assets/fonts/pinyon-script/PinyonScript-Regular.ttf',import.meta.url)));
});
