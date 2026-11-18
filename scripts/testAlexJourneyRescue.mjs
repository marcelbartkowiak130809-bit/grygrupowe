import assert from 'node:assert/strict';
import {test} from 'node:test';
import {existsSync} from 'node:fs';
import {createRescue,rescueAction,rescueScenes,restoreRescue,saveRescue} from '../js/alexJourneyRescue.js';
import {THIRD_CHAPTER_AT,chapterCountdown,chapterMenu} from '../js/alexJourneyChapters.js';

const walkthrough=[
 [['embrace'],['trail']],
 [['shutter'],['wool'],['floor','white_wool'],['locker']],
 [['lamp','torch'],['chock'],['cart'],['ore','stone_pickaxe'],['coal','stone_pickaxe'],['marks']],
 [['fuel','coal'],['smelt','iron_ore'],['sword','iron_ingot']],
 [['gear'],['repair','chain'],['ring','bell'],['flood']],
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

test('the guard can wake, block the chest, and fall asleep again without consuming resources',()=>{
 const state=createRescue();
 const node=(id,item)=>rescueAction(state,{type:'node',id,item});
 assert.equal(node('trail'),false);
 node('embrace');node('trail');rescueAction(state,{type:'next'});
 node('locker');
 assert.equal(state.flags.alert,true);
 assert.equal(state.stock.stone_pickaxe,undefined);
 node('wool');
 node('floor','white_wool');
 node('shutter');
 node('locker');
 assert.equal(state.stock.stone_pickaxe,undefined);
 node('guard');
 assert.equal(state.flags.alert,false);
 node('locker');
 assert.equal(state.stock.stone_pickaxe,1);
 assert.equal(node('locker'),false);
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
