import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createJourney,journeyAction as a,journeyScenes,journeyScene,restoreJourney,saveJourney,journeyCanCross,journeyItems,journeyAssetId,journeySurface} from '../js/alexJourneyEngine.js';
import {journeyObjective,journeyTime} from '../js/alexJourneyObjectives.js';
import {solveJourneyScene} from './journeyTestSolutions.mjs';
test('minimal route completes all ten scenes with a single persistent inventory and world',()=>{
 let s=createJourney();assert.deepEqual(s.stock,{});
 for(let i=0;i<10;i++){assert.equal(s.scene,i);assert.ok(journeySurface(s,i,s.hero.x)>=4,'character stays below cave ceiling');solveJourneyScene(s);assert.ok(Object.values(s.stock).every(n=>n>=0));const before=JSON.stringify(s.world),stock={...s.stock};s=restoreJourney(saveJourney(s));assert.equal(s.scene,i);assert.equal(JSON.stringify(s.world),before);assert.deepEqual(s.stock,stock);if(i<9){assert.ok(a(s,{type:'next'}));assert.deepEqual(s.stock,stock);}}
 assert.ok(s.done);assert.ok(s.stock.iron_pickaxe);assert.equal(s.completed.filter(Boolean).length,10);
});
test('exploration provides extra reserves and food genuinely increases extraction',()=>{
 const minimal=createJourney(),explorer=createJourney();for(let i=0;i<10;i++){solveJourneyScene(minimal);solveJourneyScene(explorer,{explore:true});if(i===3){assert.ok(explorer.stock.cobblestone>minimal.stock.cobblestone);assert.ok(explorer.stock.oak_log>minimal.stock.oak_log);}if(i<9){a(minimal,{type:'next'});a(explorer,{type:'next'});}}
 assert.ok(explorer.looted>minimal.looted);assert.ok(explorer.stock.coal>minimal.stock.coal);assert.ok(explorer.stock.bread>minimal.stock.bread);assert.ok(explorer.done&&minimal.done);
});
test('old scenes keep depleted nodes and constructions when revisited; no double loot',()=>{
 const s=createJourney();solveJourneyScene(s,{explore:true});a(s,{type:'next'});solveJourneyScene(s);a(s,{type:'next'});a(s,{type:'travel',scene:0});const inventory={...s.stock};a(s,{type:'node',id:'starter-cache'});a(s,{type:'node',id:'first-log'});assert.deepEqual(s.stock,inventory);a(s,{type:'travel',scene:1});assert.ok(journeyCanCross(s,1));assert.equal(s.world[1].placed[104],'oak_planks');assert.equal(a(s,{type:'travel',scene:9}),false);
});
test('tools, darkness, unsupported blocks and unfinished crossings reject attempts without consuming resources',()=>{
 const s=createJourney();solveJourneyScene(s);a(s,{type:'next'});assert.equal(journeyCanCross(s,1),false);a(s,{type:'exit'});assert.equal(s.completed[1],false);a(s,{type:'prepare',id:'oak_planks'});a(s,{type:'craft'});a(s,{type:'tile',x:10,y:5,item:'oak_planks'});assert.equal(s.stock.oak_planks,4);
 for(const x of [8,9,10,11])a(s,{type:'tile',x,y:6,item:'oak_planks'});a(s,{type:'exit'});a(s,{type:'next'});solveJourneyScene(s);a(s,{type:'next'});const before={...s.stock};a(s,{type:'node',id:'quarry-stone',item:'stick'});assert.deepEqual(s.stock,before);assert.equal(s.world[3].nodes['quarry-stone'],undefined);
});
test('undo restores resource collection, constructions and travel together, including after reload',()=>{
 let s=createJourney();a(s,{type:'node',id:'first-log'});a(s,{type:'undo'});assert.equal(s.stock.oak_log,undefined);assert.equal(s.world[0].nodes['first-log'],undefined);solveJourneyScene(s);a(s,{type:'next'});s=restoreJourney(saveJourney(s));a(s,{type:'undo'});assert.equal(s.scene,0);assert.equal(s.farthest,0);assert.ok(s.completed[0]);
});
test('save replay ignores forged inventory, rejects foreign actions and preserves ending timestamps',()=>{
 const s=createJourney();solveJourneyScene(s);const saved=JSON.parse(saveJourney(s));saved.stock={diamond:999};saved.scene=9;const r=restoreJourney(saved);assert.equal(r.scene,0);assert.equal(r.stock.diamond,undefined);assert.equal(r.startedAt,s.startedAt);
 for(const raw of [null,'{bad',{version:2,log:[]},{version:1,log:[{type:'travel',scene:9}]},{version:1,log:[{type:'tile',x:-1,y:0}]}])assert.deepEqual(restoreJourney(raw).stock,{});
});
test('all journey item assets and native character skins are local PNG files',()=>{
 for(const id of [...Object.keys(journeyItems),'steve','alex','pig']){const png=readFileSync(new URL('../assets/minecraft/backpack/'+journeyAssetId(id)+'.png',import.meta.url));assert.equal(png.subarray(1,4).toString(),'PNG',id);}
 assert.equal(journeyScenes.length,10);assert.equal(new Set(journeyScenes.flatMap(l=>l.nodes.map(n=>n.id))).size,journeyScenes.flatMap(l=>l.nodes).length);
});

test('old shipped saves replay their original rules at every chapter and at the reunion',()=>{
 const fixture=JSON.parse(readFileSync(new URL('./fixtures/journey-v1.json',import.meta.url)));
 for(const length of [...fixture.starts,fixture.log.length]){
  const s=restoreJourney({version:1,log:fixture.log.slice(0,length),startedAt:Date.now()-90000});
  assert.equal(s.rulesVersion,1);assert.equal(s.log.length,length);assert.deepEqual(restoreJourney(saveJourney(s)).stock,s.stock);
  if(length===fixture.log.length){assert.ok(s.done);assert.ok(s.completed.every(Boolean));}
 }
});

test('fresh expeditions contain at most five logs in the entire world including chest loot',()=>{
 const s=createJourney();let logs=0;
 for(let i=0;i<10;i++)for(const n of journeyScene(s,i).nodes)logs+=(n.type==='log'?n.amount:0)+(n.loot?.oak_log||0);
 assert.equal(logs,5);assert.equal(s.rulesVersion,2);
});

test('environment mechanisms alter the world once, consume only their required item, and undo/reload safely',()=>{
 let s=createJourney();solveJourneyScene(s);a(s,{type:'next'});const stock={...s.stock};
 a(s,{type:'node',id:'bridge-prop'});assert.equal(s.world[1].placed[104],'oak_planks');assert.equal(s.world[1].placed[105],'oak_planks');assert.deepEqual(s.stock,stock);assert.equal(journeyCanCross(s,1),false);
 a(s,{type:'undo'});assert.equal(s.world[1].placed[104],undefined);assert.equal(s.world[1].flags.bridgeReleased,undefined);
 for(let i=1;i<=5;i++){solveJourneyScene(s);a(s,{type:'next'});}
 assert.equal(s.scene,6);a(s,{type:'node',id:'well',item:'iron_pickaxe'});assert.equal(s.world[6].flags.map,undefined);
 a(s,{type:'node',id:'well-pulley',item:'iron_pickaxe'});assert.equal(s.world[6].nodes.well,undefined);
 a(s,{type:'node',id:'well-weight',item:'iron_pickaxe'});const count=s.stock.cobblestone;
 a(s,{type:'node',id:'well-pulley',item:'cobblestone'});assert.equal(s.stock.cobblestone,count-1);assert.ok(s.world[6].nodes.well.opened);
 s=restoreJourney(saveJourney(s));assert.ok(s.world[6].flags.counterweight);a(s,{type:'node',id:'well-pulley',item:'cobblestone'});assert.equal(s.stock.cobblestone,count-1);
 a(s,{type:'node',id:'well'});assert.ok(s.completed[6]);assert.equal(s.stock.map,1);
});

test('objectives change after actions and the ending time survives reload',()=>{
 let s=createJourney();assert.match(journeyObjective(s)[0],/pień/);a(s,{type:'node',id:'first-log'});assert.match(journeyObjective(s)[0],/świnię/);
 for(let i=0;i<10;i++){solveJourneyScene(s);if(i<9)a(s,{type:'next'});}
 s.startedAt=s.finishedAt-125000;assert.equal(journeyTime(s),'2:05');const end=s.finishedAt;s=restoreJourney(saveJourney(s));assert.equal(s.finishedAt,end);assert.equal(journeyTime(s),'2:05');assert.match(journeyObjective(s)[0],/koniec wyprawy/);
});
