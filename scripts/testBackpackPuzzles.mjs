import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {backpackAction as action,backpackLevels,createBackpackState,restoreBackpack,saveBackpack,backpackRecipe,backpackProgress} from '../js/lastBackpackEngine.js';
import {solveBackpackLevel} from './backpackTestSolutions.mjs';
import {puzzleItems,extraTile} from '../js/backpackPuzzles.js';
import {backpackTerrain} from '../js/lastBackpackEngine.js';
for(let level=3;level<backpackLevels.length;level++)test(`new challenge ${level+1}: ${backpackLevels[level].name} is solvable with its own stock`,()=>{
 const s=createBackpackState();s.level=level;s.stock={...backpackLevels[level].stock};solveBackpackLevel(s);assert.equal(backpackProgress(s).current,backpackProgress(s).total);for(const count of Object.values(s.stock))assert.ok(count>=0);
});
test('whole campaign replays every action, including new mechanics and undo, after reload',()=>{
 let s=createBackpackState();assert.equal(backpackLevels.length,20);
 for(let level=0;level<backpackLevels.length;level++){
  assert.equal(s.level,level);solveBackpackLevel(s);const solvedStock={...s.stock};action(s,{type:'undo'});assert.equal(s.solved,false);
  s=restoreBackpack(saveBackpack(s));assert.equal(s.level,level);
  // Replay the final accepted step, not the entire solution with spent resources.
  const last=s.log.slice(0,-1).at(-1);assert.ok(action(s,last));assert.ok(s.solved);assert.deepEqual(s.stock,solvedStock);
  action(s,{type:'next'});s=restoreBackpack(saveBackpack(s));
 }
 assert.ok(s.done);assert.equal(s.level,20);
});
test('legacy completed three-level saves continue at the first new puzzle',()=>{
 const s=createBackpackState();for(let i=0;i<3;i++){solveBackpackLevel(s);action(s,{type:'next'});}
 const old=JSON.parse(saveBackpack(s));old.finishedAt=Date.now();old.done=true;const restored=restoreBackpack(old);
 assert.equal(restored.level,3);assert.equal(restored.done,false);assert.equal(restored.finishedAt,0);assert.deepEqual(restored.stock,backpackLevels[3].stock);
});
test('completed ten-level saves continue at archery with all former progress preserved',()=>{
 const s=createBackpackState();for(let i=0;i<10;i++){solveBackpackLevel(s);action(s,{type:'next'});}
 const saved=JSON.parse(saveBackpack(s));saved.finishedAt=Date.now();const r=restoreBackpack(saved);
 assert.equal(r.level,10);assert.equal(r.done,false);assert.equal(r.finishedAt,0);assert.equal(r.moves,s.moves);assert.deepEqual(r.stock,backpackLevels[10].stock);
});
test('advanced prerequisites, red herrings and failed deliveries preserve scarce resources',()=>{
 const stage=i=>Object.assign(createBackpackState(),{level:i,stock:{...backpackLevels[i].stock}});
 const put=(s,index,item)=>action(s,{type:'place',index,item});
 const archery=stage(10);archery.stock.arrow=4;put(archery,10,'arrow');assert.equal(archery.stock.arrow,4);archery.stock.bow=1;put(archery,10,'arrow');put(archery,10,'arrow');assert.equal(archery.stock.arrow,3);assert.deepEqual(archery.puzzle.hits,[10]);
 const honey=stage(11);put(honey,10,'glass_bottle');assert.equal(honey.stock.glass_bottle,2);put(honey,18,'torch');assert.equal(honey.stock.torch,3);put(honey,18,'campfire');put(honey,10,'glass_bottle');put(honey,10,'glass_bottle');assert.equal(honey.stock.honey_bottle,1);
 const sponge=stage(12);put(sponge,9,'sponge');assert.equal(sponge.puzzle.dry.length,4);assert.equal(sponge.stock.sponge,0);put(sponge,35,'wet_sponge');put(sponge,35);assert.equal(sponge.stock.sponge,0);put(sponge,36,'coal');put(sponge,35);assert.equal(sponge.stock.sponge,1);
 const hopper=stage(13);for(const i of [10,11,19,27,28,29])put(hopper,i,'hopper');put(hopper,9,'iron_ingot');assert.equal(hopper.stock.iron_ingot,1);put(hopper,11);put(hopper,19);put(hopper,9,'iron_ingot');assert.equal(hopper.solved,true);
 const brew=stage(14);put(brew,21,'nether_wart');assert.equal(brew.stock.nether_wart,1);put(brew,10,'glass_bottle');put(brew,21,'potion');put(brew,21,'nether_wart');assert.equal(brew.stock.nether_wart,1);
 const golem=stage(15);put(golem,11,'carved_pumpkin');assert.equal(golem.stock.carved_pumpkin,1);put(golem,1,'iron_block');action(golem,{type:'remove',index:1});assert.equal(golem.stock.iron_block,4);
 const tnt=stage(16);put(tnt,21,'tnt');put(tnt,21,'flint_and_steel');assert.equal(tnt.placed[21],'tnt');assert.equal(tnt.solved,false);action(tnt,{type:'undo'});assert.equal(tnt.stock.tnt,1);put(tnt,0,'tnt');put(tnt,0,'flint_and_steel');assert.equal(tnt.solved,false);action(tnt,{type:'undo'});assert.equal(tnt.placed[0],'tnt');
 const logic=stage(17);put(logic,17,'lever');put(logic,17);assert.equal(logic.solved,false);action(logic,{type:'remove',index:17});assert.equal(logic.puzzle.switches[17],undefined);
 const beacon=stage(18);beacon.stock.beacon=1;put(beacon,19,'beacon');assert.equal(beacon.stock.beacon,1);for(const i of backpackLevels[18].base)put(beacon,i,'iron_block');put(beacon,19,'beacon');put(beacon,19,'red_stained_glass');assert.equal(beacon.solved,false);action(beacon,{type:'remove',index:19});assert.equal(beacon.stock.red_stained_glass,1);assert.equal(beacon.puzzle.filter,undefined);
 const conduit=stage(19);conduit.stock.conduit=1;put(conduit,19,'conduit');put(conduit,20,'water_bucket');assert.equal(conduit.solved,false);assert.equal(conduit.stock.bucket,1);put(conduit,20,'water_bucket');assert.equal(conduit.stock.bucket,1);
});
test('advanced shaped recipes reject substitutions and support mirrored bows',()=>{
 assert.deepEqual(backpackRecipe(['','stick','string','stick','','string','','stick','string']),{item:'bow',count:1});
 assert.deepEqual(backpackRecipe(['string','stick','','string','','stick','string','stick','']),{item:'bow',count:1});
 assert.equal(backpackRecipe(['','stick','string','stick','','string','','stick','feather']),null);
 assert.equal(backpackRecipe(Array(9).fill('nautilus_shell')),null);
 assert.deepEqual(backpackRecipe(Array.from({length:9},(_,i)=>i===4?'heart_of_the_sea':'nautilus_shell')),{item:'conduit',count:1});
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
 for(let level=3;level<backpackLevels.length;level++){
  const s=Object.assign(createBackpackState(),{level,stock:{...backpackLevels[level].stock}});
  for(const phase of [false,true]){s.solved=phase;s.puzzle={water:phase,smelted:phase,ore:phase?3:0,fuel:phase?1:0,planted:phase?[18,20,22]:[]};for(let i=0;i<40;i++){names.add(backpackTerrain(level,i,s));const tile=extraTile(backpackLevels[level],i,s);if(tile.icon)names.add(tile.icon);}}
 }
 for(const name of names){const png=readFileSync(new URL('../assets/minecraft/backpack/'+name+'.png',import.meta.url));assert.equal(png.subarray(1,4).toString(),'PNG',name);assert.ok(png.readUInt32BE(16)>=16&&png.readUInt32BE(20)>=16,name);}
});
