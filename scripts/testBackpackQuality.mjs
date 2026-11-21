import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {backpackAction as action,backpackLevels,backpackBatch,createBackpackState,restoreBackpack,saveBackpack} from '../js/lastBackpackEngine.js';
import {shelfPower,railRoute} from '../js/backpackQuality.js';
import {extraTile} from '../js/backpackPuzzles.js';
import {isDeepRouteOpen} from '../js/backpackDeepPuzzles.js';
import {solveDeepLevel} from './backpackDeepSolutions.mjs';
const baseline=JSON.parse(readFileSync(new URL('./fixtures/backpack-v5.5.6.json',import.meta.url),'utf8'));
const stage=i=>restoreBackpack({version:1,log:baseline.log.slice(0,baseline.starts[i])});
const put=(s,index,item)=>action(s,{type:'place',index,item,free:true});
test('all 30 pre-audit starts and completions replay without losing progress',()=>{
 for(let i=0;i<30;i++){for(const [end,solved]of [[baseline.starts[i],false],[baseline.ends[i],true]]){const s=restoreBackpack({version:1,log:baseline.log.slice(0,end)});assert.equal(s.level,i);assert.equal(s.solved,solved);assert.equal(s.log.length,end);}}
 const continued=restoreBackpack({version:1,log:baseline.log});
 assert.equal(continued.level,30);
 assert.equal(continued.done,false);
});
test('a full lamp progress bar completes the puzzle without all three levers, including in old saves',()=>{
 const s=stage(17);
 put(s,9,'lever');put(s,17,'lever');put(s,17);
 assert.ok(s.solved);
 assert.equal(backpackLevels[17].switches.filter(index=>s.placed[index]==='lever').length,2);
 const old=restoreBackpack({version:1,log:s.log});
 assert.equal(old.solved,true);
 assert.equal(old.unlocked,18);
 const restored=restoreBackpack(saveBackpack(old));
 assert.equal(restored.solved,true);
 assert.ok(action(restored,{type:'next'}));
 assert.equal(restoreBackpack(saveBackpack(restored)).level,18);
});
test('reset affects only the current attempt and chapter changes preserve drafts, unlocks and the completed run',()=>{
 const s=restoreBackpack({version:1,log:baseline.log});
 for(let i=30;i<backpackLevels.length;i++){solveDeepLevel(s);assert.ok(action(s,{type:'next'}));}
 const {finishedAt,finishedMoves}=s;
 assert.equal(s.completed.filter(Boolean).length,backpackLevels.length);
 assert.ok(action(s,{type:'level',index:0}));
 assert.ok(action(s,{type:'reset-level'}));
 put(s,18,'cobblestone');
 assert.ok(action(s,{type:'level',index:17}));
 assert.ok(action(s,{type:'reset-level'}));
 put(s,17,'lever');
 assert.ok(action(s,{type:'level',index:0}));
 assert.equal(s.placed[18],'cobblestone');
 const moves=s.moves;
 assert.ok(action(s,{type:'undo'}));
 assert.equal(s.moves,moves-1);
 assert.equal(s.completed.filter(Boolean).length,backpackLevels.length);
 const restored=restoreBackpack(saveBackpack(s));
 assert.ok(action(restored,{type:'level',index:17}));
 assert.equal(restored.placed[17],'lever');
 assert.ok(action(restored,{type:'summary'}));
 assert.equal(restored.finishedAt,finishedAt);
 assert.equal(restored.finishedMoves,finishedMoves);
 assert.equal(action(createBackpackState(),{type:'level',index:1}),false);
});
test('old summaries still open the new extension after replaying an earlier level',()=>{
 const log=[...baseline.log,{type:'level',index:0},{type:'summary'}];
 const s=restoreBackpack({version:2,legacyActions:baseline.log.length,log});
 assert.equal(s.level,30);
 assert.equal(s.completed.filter(Boolean).length,30);
 assert.equal(restoreBackpack(saveBackpack(s)).level,30);
});
test('completed 50-level saves open level 51 and retain all previous attempts',()=>{
 const s=restoreBackpack({version:1,log:baseline.log});
 for(let i=30;i<50;i++){solveDeepLevel(s);assert.ok(action(s,{type:'next'}));}
 assert.equal(s.level,50);
 const old={...JSON.parse(saveBackpack(s)),campaignLength:50,finishedAt:Date.now()};
 old.log.push({type:'level',index:0},{type:'summary'});
 const upgraded=restoreBackpack(old);
 assert.equal(upgraded.level,50);
 assert.equal(upgraded.completed.filter(Boolean).length,50);
 assert.equal(upgraded.finishedAt,0);
 assert.deepEqual(upgraded.stock,backpackLevels[50].stock);
 assert.equal(restoreBackpack(saveBackpack(upgraded)).level,50);
});

test('level 50 shows how to unlock the siding and retains the signal on reload',()=>{
 const s=restoreBackpack({version:1,log:baseline.log});
 for(let i=30;i<49;i++){solveDeepLevel(s);assert.ok(action(s,{type:'next'}));}
 const level=backpackLevels[49];
 put(s,12,'redstone');
 for(const index of level.switches)put(s,index,'lever');
 put(s,3);
 assert.equal(extraTile(level,13,s).label,'SKRYTKA');
 put(s,4);
 assert.equal(extraTile(level,13,s).label,'OTWÓRZ');
 assert.match(s.message,/Sygnał poprawny/);
 assert.equal(isDeepRouteOpen(level,s,11),false);
 const restored=restoreBackpack(saveBackpack(s));
 assert.deepEqual(restored.puzzle.switches,{0:false,1:true,2:true});
 put(restored,13);
 assert.match(restored.message,/Bocznica odblokowana/);
 assert.equal(isDeepRouteOpen(level,restored,11),true);
 for(const index of [17,18,19,11])put(restored,index);
 put(restored,10);
 assert.equal(restored.stock.ender_pearl,2);
});
test('late challenges add real steps and recoverable inventory decoys',()=>{
 const totals=[0,0];
 for(let i=40;i<60;i++){
  const level=backpackLevels[i];
  const s=Object.assign(createBackpackState(),{level:i,stock:{...level.stock}});
  solveDeepLevel(s);
  totals[i<50?0:1]+=s.moves;
  if(i>=50){
   const used=new Set(s.log.map(action=>action.item).filter(Boolean));
   assert.ok(Object.keys(level.stock).filter(item=>!used.has(item)).length>=5,level.name);
  }
 }
 assert.ok(totals[1]>=totals[0]*1.45,`Late moves ${totals[1]}, previous ${totals[0]}`);
});
test('old rejected placements stay rejected during replay; new free placements are recorded separately',()=>{
 const old=stage(7);action(old,{type:'place',index:18,item:'bookshelf'});assert.equal(old.stock.bookshelf,4);
 assert.equal(restoreBackpack(saveBackpack(old)).stock.bookshelf,4);
 const newer=stage(7);put(newer,18,'bookshelf');assert.equal(newer.stock.bookshelf,3);const restored=restoreBackpack(saveBackpack(newer));assert.equal(restored.stock.bookshelf,3);assert.equal(restored.placed[18],'bookshelf');assert.equal(restored.log.at(-1).free,true);
});
test('rail accepts different powered-rail and adjacent torch locations instead of a prescribed paint pattern',()=>{
 const s=stage(4);for(const i of [19,20,21,22])put(s,i,'rail');put(s,18,'powered_rail');put(s,10,'redstone_torch');assert.deepEqual(railRoute(backpackLevels[4],s),[17,18,19,20,21,22]);put(s,17,'minecart');assert.ok(s.solved);assert.ok(restoreBackpack(saveBackpack(s)).solved);
});
test('unpowered rail routes reject cart launch without consuming the cart',()=>{
 const s=stage(4);for(const i of [19,20,21,22])put(s,i,'rail');put(s,18,'powered_rail');put(s,28,'redstone_torch');put(s,17,'minecart');assert.equal(s.stock.minecart,1);assert.equal(s.solved,false);
});
test('library requires four effective shelves with clear intervening spaces',()=>{
 const s=stage(7);for(const i of [1,3,5,10])put(s,i,'bookshelf');assert.equal(shelfPower(backpackLevels[7],s),2);put(s,19,'lapis_lazuli');put(s,19,'book');assert.equal(s.stock.book,1);assert.equal(s.solved,false);
 action(s,{type:'remove',index:10});put(s,33,'bookshelf');assert.equal(shelfPower(backpackLevels[7],s),4);put(s,19,'book');assert.ok(s.solved);assert.ok(restoreBackpack(saveBackpack(s)).solved);
});
test('spatial construction stages reveal anchors rather than all solution cells',()=>{
 for(const level of [7,8,15,18,19]){const s=stage(level);const marks=Array.from({length:40},(_,i)=>extraTile(backpackLevels[level],i,s)).filter(tile=>tile.mark);assert.ok(marks.length<=1,`stage ${level+1}: ${marks.length} solution markers`);}
});
test('incorrect construction remains visible, costs its block and can be reversed',()=>{
 const portal=stage(8);put(portal,10,'obsidian');assert.equal(portal.stock.obsidian,9);assert.equal(portal.placed[10],'obsidian');action(portal,{type:'undo'});assert.equal(portal.stock.obsidian,10);
 const conduit=stage(19);put(conduit,20,'prismarine');assert.equal(conduit.stock.prismarine,15);action(conduit,{type:'remove',index:20});assert.equal(conduit.stock.prismarine,16);
 const beacon=stage(18);put(beacon,0,'iron_block');assert.equal(beacon.stock.iron_block,8);assert.deepEqual(beacon.puzzle.base,[0]);action(beacon,{type:'remove',index:0});assert.equal(beacon.stock.iron_block,9);assert.deepEqual(beacon.puzzle.base,[]);
});
test('batch crafting conserves ingredients, replays, and undo restores the entire input grid',()=>{
 const s=stage(29);action(s,{type:'craft-slot',index:0,item:'ender_pearl'});action(s,{type:'craft-slot',index:1,item:'blaze_powder'});assert.equal(backpackBatch(s),6);action(s,{type:'craft-all'});assert.equal(s.stock.ender_eye,6);assert.equal(s.stock.ender_pearl,0);assert.equal(s.stock.blaze_powder,0);assert.equal(restoreBackpack(saveBackpack(s)).stock.ender_eye,6);action(s,{type:'undo'});assert.equal(s.stock.ender_eye,undefined);assert.equal(s.stock.ender_pearl,5);assert.equal(s.grid[0],'ender_pearl');assert.equal(s.grid[1],'blaze_powder');
});
test('batch compost fills only the missing capacity and undo refunds exactly those seeds',()=>{
 const start=baseline.starts[25],binPlaced=baseline.log.findIndex((a,i)=>i>=start&&a.type==='place'&&a.item==='composter');
 const s=restoreBackpack({version:1,log:baseline.log.slice(0,binPlaced+1)});put(s,9,'wheat_seeds');assert.equal(s.puzzle.compost,1);action(s,{type:'fill-compost'});assert.equal(s.stock.wheat_seeds,8);assert.equal(s.puzzle.compost,4);assert.equal(restoreBackpack(saveBackpack(s)).puzzle.compost,4);action(s,{type:'undo'});assert.equal(s.stock.wheat_seeds,11);assert.equal(s.puzzle.compost,1);
});
test('batch actions refuse empty recipes and unbuilt composters without changing stock or the log',()=>{
 const crafting=stage(29),stock={...crafting.stock},count=crafting.log.length;assert.equal(action(crafting,{type:'craft-all'}),false);assert.deepEqual(crafting.stock,stock);assert.equal(crafting.log.length,count);
 const compost=stage(25);assert.equal(action(compost,{type:'fill-compost'}),false);assert.equal(compost.stock.wheat_seeds,12);assert.equal(compost.puzzle.compost,undefined);
});
