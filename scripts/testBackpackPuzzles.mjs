import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {backpackAction as action,backpackLevels,createBackpackState,restoreBackpack,saveBackpack,backpackRecipe,backpackProgress} from '../js/lastBackpackEngine.js';
import {solveBackpackLevel} from './backpackTestSolutions.mjs';
import {puzzleItems,extraTile} from '../js/backpackPuzzles.js';
import {backpackTerrain} from '../js/lastBackpackEngine.js';
for(let level=3;level<10;level++)test(`new challenge ${level+1}: ${backpackLevels[level].name} is solvable with its own stock`,()=>{
 const s=createBackpackState();s.level=level;s.stock={...backpackLevels[level].stock};solveBackpackLevel(s);assert.equal(backpackProgress(s).current,backpackProgress(s).total);for(const count of Object.values(s.stock))assert.ok(count>=0);
});
test('whole campaign replays every action, including new mechanics and undo, after reload',()=>{
 let s=createBackpackState();assert.equal(backpackLevels.length,10);
 for(let level=0;level<10;level++){
  assert.equal(s.level,level);solveBackpackLevel(s);const solvedStock={...s.stock};action(s,{type:'undo'});assert.equal(s.solved,false);
  s=restoreBackpack(saveBackpack(s));assert.equal(s.level,level);
  // Replay the final accepted step, not the entire solution with spent resources.
  const last=s.log.slice(0,-1).at(-1);assert.ok(action(s,last));assert.ok(s.solved);assert.deepEqual(s.stock,solvedStock);
  action(s,{type:'next'});s=restoreBackpack(saveBackpack(s));
 }
 assert.ok(s.done);assert.equal(s.level,10);
});
test('legacy completed three-level saves continue at the first new puzzle',()=>{
 const s=createBackpackState();for(let i=0;i<3;i++){solveBackpackLevel(s);action(s,{type:'next'});}
 const old=JSON.parse(saveBackpack(s));old.finishedAt=Date.now();old.done=true;const restored=restoreBackpack(old);
 assert.equal(restored.level,3);assert.equal(restored.done,false);assert.equal(restored.finishedAt,0);assert.deepEqual(restored.stock,backpackLevels[3].stock);
});
test('new gates reject skipped prerequisites and do not consume the wrong item',()=>{
 const stage=i=>Object.assign(createBackpackState(),{level:i,stock:{...backpackLevels[i].stock}});
 const farm=stage(3);action(farm,{type:'place',index:18,item:'wheat_seeds'});assert.equal(farm.stock.wheat_seeds,3);assert.equal(farm.solved,false);
 const rail=stage(4);action(rail,{type:'place',index:17,item:'minecart'});assert.equal(rail.stock.minecart,1);action(rail,{type:'place',index:20,item:'rail'});assert.equal(rail.stock.rail,4);
 const forge=stage(6);action(forge,{type:'place',index:18});assert.equal(forge.stock.iron_ingot,undefined);
 const library=stage(7);action(library,{type:'place',index:18,item:'bookshelf'});assert.equal(library.stock.bookshelf,4);action(library,{type:'place',index:19,item:'book'});assert.equal(library.stock.book,1);
 const portal=stage(8);action(portal,{type:'place',index:10,item:'obsidian'});assert.equal(portal.stock.obsidian,10);assert.equal(portal.solved,false);
 const mine=stage(9);action(mine,{type:'place',index:21,item:'wooden_pickaxe'});assert.equal(mine.solved,false);assert.equal(mine.stock.diamond,undefined);
});
test('falling blocks fill bottom first; removing supporting blocks cannot leave floating sand',()=>{
 const s=Object.assign(createBackpackState(),{level:5,stock:{...backpackLevels[5].stock}});action(s,{type:'place',index:18,item:'sand'});assert.equal(s.placed[26],'sand');assert.equal(s.placed[18],undefined);
 action(s,{type:'place',index:18,item:'sand'});const stock={...s.stock};action(s,{type:'remove',index:26});assert.deepEqual(s.stock,stock);assert.equal(s.placed[26],'sand');
 action(s,{type:'remove',index:18});action(s,{type:'remove',index:26});assert.equal(s.stock.sand,4);
});
test('shaped tools and bucket recipes respect materials, placement and mirroring',()=>{
 assert.deepEqual(backpackRecipe(['iron_ingot','','iron_ingot','','iron_ingot','','','','']),{item:'bucket',count:1});
 assert.deepEqual(backpackRecipe(['oak_planks','oak_planks','','stick','','','stick','','']),{item:'wooden_hoe',count:1});
 assert.equal(backpackRecipe(['oak_planks','oak_planks','oak_planks','stick','stick','','','','']),null);
 assert.deepEqual(backpackRecipe(['flint','','','','','','','','iron_ingot']),{item:'flint_and_steel',count:1});
});
test('every new icon and terrain uses a locally available original PNG',()=>{
 const names=new Set(Object.keys(puzzleItems));
 for(let level=3;level<10;level++){
  const s=Object.assign(createBackpackState(),{level,stock:{...backpackLevels[level].stock}});
  for(const phase of [false,true]){s.solved=phase;s.puzzle={water:phase,smelted:phase,ore:phase?3:0,fuel:phase?1:0,planted:phase?[18,20,22]:[]};for(let i=0;i<40;i++){names.add(backpackTerrain(level,i,s));const tile=extraTile(backpackLevels[level],i,s);if(tile.icon)names.add(tile.icon);}}
 }
 for(const name of names){const png=readFileSync(new URL('../assets/minecraft/backpack/'+name+'.png',import.meta.url));assert.equal(png.subarray(1,4).toString(),'PNG',name);assert.ok(png.readUInt32BE(16)>=16&&png.readUInt32BE(20)>=16,name);}
});
