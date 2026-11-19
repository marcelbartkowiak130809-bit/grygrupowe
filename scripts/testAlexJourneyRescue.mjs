import assert from 'node:assert/strict';
import {test} from 'node:test';
import {existsSync} from 'node:fs';
import {createRescue,rescueAction,rescueScenes,rescueSceneReady,restoreRescue,saveRescue} from '../js/alexJourneyRescue.js';
import {THIRD_CHAPTER_AT,chapterCountdown,chapterMenu} from '../js/alexJourneyChapters.js';

const walkthrough=[
 [['embrace'],['trail']],
 [['shears'],['tripwire','shears'],['locker']],
 [['marks'],['lamp','torch'],['chock'],['cart'],['ore','stone_pickaxe'],['coal','stone_pickaxe']],
 [['fuel','coal'],['smelt','iron_ore'],['bladeTop','iron_ingot'],['bladeBottom','iron_ingot'],['hilt','stick'],['sword']],
 [['gear'],['ring','bell'],['repair','chain'],['flood']],
 [['weight'],['hatch'],['warden','iron_sword'],['cell','tripwire_hook'],['rescue']],
];

test('all six rescue scenes can be solved, resumed, and completed with one inventory',()=>{
 let state=createRescue(1000);
 for(const [scene,steps]of walkthrough.entries()){
  assert.equal(state.scene,scene);
  assert.equal(rescueAction(state,{type:'next'},2000),false);
  for(const [id,item]of steps){
   if(item)assert.ok(rescueAction(state,{type:'select',id:item},2000));
   assert.ok(rescueAction(state,{type:'node',id},4500));
   assert.equal(state.flags[id],true,id);
  }
  if(scene<walkthrough.length-1)assert.ok(rescueAction(state,{type:'next'},4500));
  const loaded=restoreRescue(saveRescue(state),9000);
  assert.equal(loaded.scene,state.scene);
  assert.deepEqual(loaded.flags,state.flags);
  assert.deepEqual(loaded.stock,state.stock);
  state=loaded;
 }
 assert.equal(state.done,true);
 assert.equal(state.finishedAt,4500);
 assert.equal(state.stock.iron_sword,1);
});

test('the chest requires disarming the tripwire and keeps the shears',()=>{
 const state=createRescue();
 const node=(id,item)=>rescueAction(state,{type:'node',id,item});
 node('embrace');node('trail');rescueAction(state,{type:'next'});
 node('locker');
 assert.equal(state.stock.stone_pickaxe,undefined);
 assert.match(state.message,/linka/);
 node('shears');
 node('tripwire');
 assert.equal(state.flags.tripwire,undefined);
 node('tripwire','shears');
 assert.equal(state.flags.tripwire,true);
 assert.equal(state.stock.shears,1);
 node('locker');
 assert.equal(state.stock.stone_pickaxe,1);
 assert.equal(node('locker'),false);
});

test('legacy armory saves preserve earned loot and can continue with the new puzzle',()=>{
 const node=(id,item)=>({type:'node',id,...(item?{item}:{})});
 const opening=[node('embrace'),node('trail'),{type:'next'},node('shutter'),node('wool')];
 const partial=restoreRescue(JSON.stringify({version:1,log:opening}));
 assert.equal(partial.scene,1);
 assert.equal(partial.stock.white_wool,undefined);
 for(const move of [node('shears'),node('tripwire','shears'),node('locker')])assert.ok(rescueAction(partial,move));
 assert.deepEqual(restoreRescue(saveRescue(partial)).stock,partial.stock);
 const oldFinished=restoreRescue(JSON.stringify({version:1,log:[...opening,node('floor','white_wool'),node('locker'),{type:'next'}]}));
 assert.equal(oldFinished.scene,2);
 assert.equal(oldFinished.stock.stone_pickaxe,1);
 assert.equal(restoreRescue(saveRescue(oldFinished)).scene,2);
});

test('old unsuccessful clicks and the old sword recipe keep their original results when replayed',()=>{
 const state=createRescue();
 const action=(id,item)=>({type:'node',id,...(item?{item}:{})});
 for(const scene of walkthrough.slice(0,2)){
  for(const [id,item] of scene)assert.ok(rescueAction(state,action(id,item)));
  assert.ok(rescueAction(state,{type:'next'}));
 }
 const oldMine=[action('marks'),...walkthrough[2].slice(1).map(([id,item])=>action(id,item)),action('marks'),{type:'next'}];
 const oldForge=[action('fuel','coal'),action('smelt','iron_ore'),action('sword','iron_ingot'),{type:'next'}];
 const legacy=restoreRescue(JSON.stringify({version:2,log:[...state.log,...oldMine,...oldForge,action('gear'),action('ring','bell')]}));
 assert.equal(legacy.scene,4);
 assert.equal(legacy.stock.iron_sword,1);
 assert.equal(legacy.flags.ring,undefined);
 assert.equal(legacy.stock.bell,1);
 assert.ok(rescueAction(legacy,action('ring','bell')));
 assert.ok(rescueAction(legacy,action('flood')));
 assert.equal(rescueSceneReady(legacy),false);
 assert.match(legacy.message,/łańcucha/);
 assert.ok(rescueAction(legacy,action('repair','chain')));
 assert.ok(rescueAction(legacy,action('flood')));
 assert.equal(rescueSceneReady(restoreRescue(saveRescue(legacy))),true);
});

test('all chapter props exist and the premiere countdown reaches Friday at 20:00 Poland time',()=>{
 const textures=rescueScenes.flatMap(scene=>scene.nodes.flatMap(node=>[node.texture,node.doneTexture].filter(Boolean)));
 for(const texture of textures)assert.ok(existsSync(new URL(`../assets/minecraft/backpack/${texture}.png`,import.meta.url)),texture);
 assert.equal(new Date(THIRD_CHAPTER_AT).toISOString(),'2026-11-20T19:00:00.000Z');
 assert.equal(chapterCountdown(THIRD_CHAPTER_AT-3600000),'01:00:00');
 assert.equal(chapterCountdown(THIRD_CHAPTER_AT),'Już dostępny');
 assert.match(chapterMenu(1,false),/data-journey-chapter="2"\s+disabled/);
 assert.match(chapterMenu(2,true),/data-journey-chapter="2" aria-current/);
});
