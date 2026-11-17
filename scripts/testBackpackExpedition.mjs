import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {backpackAction as action,backpackLevels,createBackpackState,backpackRecipe,restoreBackpack,saveBackpack,backpackTerrain} from '../js/lastBackpackEngine.js';
import {extraTile} from '../js/backpackPuzzles.js';
import {solveBackpackLevel} from './backpackTestSolutions.mjs';
import {solveExpedition} from './backpackExpeditionSolutions.mjs';
const stage=level=>Object.assign(createBackpackState(),{level,stock:{...backpackLevels[level].stock}});
const put=(s,index,item)=>action(s,{type:'place',index,item});
const craft=(s,slots)=>{for(const [index,item]of slots)assert.ok(action(s,{type:'craft-slot',index,item}));assert.ok(backpackRecipe(s.grid));assert.ok(action(s,{type:'craft'}));};

test('pistons cannot push off the path or across an unaligned row; undo restores cargo',()=>{
 const s=stage(20);for(const i of [17,12])put(s,i,'piston');put(s,12);assert.equal(s.puzzle.cargo,undefined);put(s,17);assert.equal(s.puzzle.cargo,19);put(s,17);put(s,17);assert.equal(s.puzzle.cargo,20);put(s,12);assert.equal(s.puzzle.cargo,28);action(s,{type:'undo'});assert.equal(s.puzzle.cargo,20);assert.equal(s.solved,false);
});
test('archaeology requires a brush and two passes per find, and never duplicates recovered bricks',()=>{
 const s=stage(21);put(s,10,'stone_shovel');assert.equal(s.stock.brick,undefined);assert.equal(s.stock.stone_shovel,1);
 craft(s,[[0,'feather'],[3,'copper_ingot'],[6,'stick']]);put(s,10,'brush');assert.equal(s.stock.brick,undefined);put(s,10,'brush');put(s,10,'brush');assert.equal(s.stock.brick,1);assert.equal(s.stock.brush,1);action(s,{type:'undo'});assert.equal(s.stock.brick,undefined);assert.equal(s.puzzle.brushed[10],1);
});
test('wool cannot be sheared twice; a wrong target does not consume dyed wool',()=>{
 const s=stage(22);craft(s,[[0,'iron_ingot'],[4,'iron_ingot']]);put(s,9,'shears');put(s,9,'shears');assert.equal(s.stock.white_wool,1);assert.equal(s.stock.shears,1);
 craft(s,[[2,'white_wool'],[8,'red_dye']]);put(s,20,'red_wool');assert.equal(s.stock.red_wool,1);put(s,12,'red_wool');assert.equal(s.stock.red_wool,0);action(s,{type:'remove',index:12});assert.equal(s.stock.red_wool,1);
});
test('treasure movement requires a map and orthogonal revealed neighbors; undo restores position',()=>{
 const s=stage(23);put(s,13);assert.equal(s.solved,false);s.stock.map=1;put(s,9,'map');put(s,13);assert.equal(s.puzzle.position,9);put(s,18);assert.equal(s.puzzle.position,9);put(s,10);assert.equal(s.puzzle.position,10);action(s,{type:'undo'});assert.equal(s.puzzle.position,9);
});
test('cake crafting returns exactly three buckets, undo refunds milk, removal refunds its candle',()=>{
 const s=stage(24),slots=[[0,'milk_bucket'],[1,'milk_bucket'],[2,'milk_bucket'],[3,'sugar'],[4,'egg'],[5,'sugar'],[6,'wheat'],[7,'wheat'],[8,'wheat']];
 put(s,19,'candle');assert.equal(s.stock.candle,1);craft(s,slots);assert.equal(s.stock.bucket,3);action(s,{type:'undo'});assert.equal(s.stock.bucket,undefined);assert.equal(s.grid.filter(i=>i==='milk_bucket').length,3);action(s,{type:'craft'});put(s,19,'cake');put(s,19,'flint_and_steel');assert.equal(s.solved,false);put(s,19,'candle');action(s,{type:'remove',index:19});assert.equal(s.stock.candle,1);assert.equal(s.stock.cake,1);assert.equal(s.puzzle.candle,undefined);
});
test('composter uses seven slabs; growth needs a planted sapling and one fertilizer per stage',()=>{
 const s=stage(25);s.stock.bone_meal=1;put(s,30,'bone_meal');assert.equal(s.stock.bone_meal,1);put(s,30,'oak_sapling');put(s,30,'bone_meal');assert.equal(s.puzzle.growth,1);assert.equal(s.stock.bone_meal,0);put(s,30,'bone_meal');assert.equal(s.puzzle.growth,1);
 assert.equal(backpackRecipe(['oak_planks','','oak_planks','oak_planks','','oak_planks','oak_planks','oak_planks','oak_planks']),null);
 assert.deepEqual(backpackRecipe(['oak_slab','','oak_slab','oak_slab','','oak_slab','oak_slab','oak_slab','oak_slab']),{item:'composter',count:1});
});
test('smithing rejects the wrong template/material and requires both complete operations',()=>{
 const s=stage(26);put(s,20);assert.equal(s.stock.netherite_chestplate,undefined);put(s,10,'coast_armor_trim_smithing_template');put(s,26,'emerald');assert.equal(s.stock.emerald,1);assert.equal(s.stock.coast_armor_trim_smithing_template,1);
 put(s,10,'netherite_upgrade_smithing_template');put(s,18,'diamond_chestplate');put(s,26,'netherite_ingot');put(s,20);assert.equal(s.puzzle.forged,1);assert.equal(s.stock.netherite_chestplate,1);assert.equal(s.solved,false);action(s,{type:'undo'});assert.equal(s.stock.netherite_chestplate,undefined);assert.equal(s.puzzle.inputs.armor,'diamond_chestplate');
});
test('musical lock wraps notes and opens only after all four notes and the explicit check',()=>{
 const s=stage(27);for(const i of [17,18,19,20])put(s,i,'note_block');put(s,22,'lever');put(s,22);assert.equal(s.solved,false);for(let n=0;n<5;n++)put(s,17);assert.equal(s.puzzle.pitches[17],0);
 for(const [i,n]of [[17,1],[18,4],[20,2]])for(let j=0;j<n;j++)put(s,i);assert.equal(s.solved,false);put(s,22);assert.equal(s.solved,true);
});
test('copper rejects premature waxing, locks waxed blocks and lets undo repair over-scraping',()=>{
 const s=stage(28);put(s,27,'honeycomb');assert.equal(s.stock.honeycomb,3);put(s,27,'iron_axe');put(s,27,'iron_axe');assert.equal(s.puzzle.ages[27],1);action(s,{type:'undo'});assert.equal(s.puzzle.ages[27],2);put(s,27,'honeycomb');put(s,27,'iron_axe');put(s,27,'honeycomb');assert.equal(s.puzzle.ages[27],2);assert.equal(s.stock.honeycomb,2);
});
test('End frame refuses pre-filled eyes and entry until all six missing sockets are filled',()=>{
 const s=stage(29);put(s,19);assert.equal(s.solved,false);craft(s,[[0,'ender_pearl'],[1,'blaze_powder']]);put(s,2,'ender_eye');assert.equal(s.stock.ender_eye,1);put(s,3,'ender_eye');put(s,3,'ender_eye');assert.equal(s.puzzle.eyes.length,1);assert.equal(s.puzzle.open,false);
 for(const i of [9,13,25,29,35]){craft(s,[[0,'ender_pearl'],[1,'blaze_powder']]);put(s,i,'ender_eye');}assert.equal(s.puzzle.open,true);assert.equal(s.solved,false);put(s,19);assert.equal(s.solved,true);action(s,{type:'undo'});assert.equal(s.solved,false);assert.equal(s.puzzle.open,true);
});
test('former twenty-stage completion continues at stage 21 without losing prior moves or start time',()=>{
 const s=createBackpackState();for(let i=0;i<20;i++){solveBackpackLevel(s);action(s,{type:'next'});}const saved=JSON.parse(saveBackpack(s));saved.finishedAt=Date.now();const r=restoreBackpack(saved);
 assert.equal(r.level,20);assert.equal(r.done,false);assert.equal(r.finishedAt,0);assert.equal(r.startedAt,s.startedAt);assert.equal(r.moves,s.moves);assert.deepEqual(r.stock,backpackLevels[20].stock);
});
test('all intermediate expedition visuals use local PNGs, including oxidation, foliage and open portal',()=>{
 const names=new Set();for(let level=20;level<30;level++){const s=stage(level);const inspect=()=>{for(let i=0;i<40;i++){names.add(backpackTerrain(level,i,s));const tile=extraTile(backpackLevels[level],i,s);if(tile.icon)names.add(tile.icon);}};inspect();
  solveExpedition(level,{put:(i,item)=>{put(s,i,item);inspect();},craft:slots=>{craft(s,slots);inspect();}});assert.ok(s.solved);
 }for(const name of names){const png=readFileSync(new URL('../assets/minecraft/backpack/'+name+'.png',import.meta.url));assert.equal(png.subarray(1,4).toString(),'PNG',name);}
});
