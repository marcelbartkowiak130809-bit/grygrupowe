import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {backpackAction as action,createBackpackState,backpackRecipe,backpackLevels,restoreBackpack,saveBackpack,backpackProgress,backpackLight} from '../js/lastBackpackEngine.js';
import {isCategoryModeReleased,categoryModeProgress,categoryModesRemaining} from '../js/categoryVoting.js';
const craft=(s,a,b)=>{action(s,{type:'craft-slot',index:0,item:a});if(b)action(s,{type:'craft-slot',index:3,item:b});assert.ok(backpackRecipe(s.grid));action(s,{type:'craft'});};
test('original three interactive challenges lead into the expanded campaign',()=>{
 const s=createBackpackState();
 assert.equal(action(s,{type:'next'}),false);
 for(const index of [18,19,20,21])action(s,{type:'place',index,item:'cobblestone'});
 assert.ok(s.solved);action(s,{type:'next'});
 craft(s,'oak_planks','oak_planks');craft(s,'coal','stick');
 for(const index of backpackLevels[1].targets)action(s,{type:'place',index,item:'torch'});
 assert.ok(s.solved);action(s,{type:'next'});
 craft(s,'oak_planks','oak_planks');craft(s,'stick','cobblestone');
 action(s,{type:'place',index:17,item:'lever'});for(const index of [18,19,20,21])action(s,{type:'place',index,item:'redstone'});
 assert.equal(s.solved,false);action(s,{type:'place',index:17});assert.ok(s.solved);action(s,{type:'next'});
 assert.equal(s.level,3);assert.equal(s.done,false);assert.equal(backpackLevels[s.level].kind,'farm');
});
test('crafting uses real shaped recipes and conserves ingredients on refunds and invalid actions',()=>{
 const s=createBackpackState();craft(s,'oak_log');assert.equal(s.stock.oak_planks,4);
 action(s,{type:'craft-slot',index:8,item:'oak_planks'});action(s,{type:'clear'});assert.equal(s.stock.oak_planks,4);
 const stock={...s.stock};action(s,{type:'place',index:0,item:'oak_planks'});assert.deepEqual(s.stock,stock);
 action(s,{type:'place',index:18,item:'oak_planks'});action(s,{type:'remove',index:18});assert.deepEqual(s.stock,stock);
 assert.equal(backpackRecipe(['coal','stick','','','','','','','']),null);
 assert.deepEqual(backpackRecipe(['','','','coal','','','stick','','']),{item:'torch',count:4});
 assert.equal(action(s,{type:'place',index:99,item:'oak_planks'}),false);
});
test('bridge accepts alternative routes, disconnected blocks do not win',()=>{
 const s=createBackpackState();for(const i of [2,3,4,5])action(s,{type:'place',index:i,item:'cobblestone'});assert.equal(s.solved,true);
 const t=createBackpackState();for(const i of [2,11,20,29])action(t,{type:'place',index:i,item:'cobblestone'});assert.equal(t.solved,false);
});
test('the two owner-released Minecraft adventures are counted outside voting',()=>{
 assert.ok(isCategoryModeReleased('minecraft-backpack',{}));
 assert.ok(isCategoryModeReleased('minecraft-journey',{}));
 assert.equal(categoryModeProgress('minecraft',{}).filter(t=>t.released).length,2);
 assert.equal(categoryModesRemaining('minecraft',{}).length,6);
 assert.ok(!isCategoryModeReleased('minecraft-truth',{}));
});
test('undo restores the exact previous inventory including crafting and solved state',()=>{
 const s=createBackpackState();craft(s,'oak_log');assert.equal(s.stock.oak_planks,4);action(s,{type:'undo'});assert.equal(s.stock.oak_planks,undefined);assert.equal(s.grid[0],'oak_log');
 action(s,{type:'undo'});assert.equal(s.stock.oak_log,2);
 const t=createBackpackState();for(const i of [18,19,20,21])action(t,{type:'place',index:i,item:'cobblestone'});assert.ok(t.solved);
 action(t,{type:'undo'});assert.equal(t.solved,false);assert.equal(t.stock.cobblestone,1);assert.equal(t.placed[21],undefined);
 action(t,{type:'place',index:21,item:'cobblestone'});action(t,{type:'next'});assert.equal(action(t,{type:'undo'}),false);
});
test('save and reload replay valid actions, preserve timing, ignore forged inventory',()=>{
 const s=createBackpackState();action(s,{type:'select',item:'oak_log'});action(s,{type:'craft-slot',index:0});action(s,{type:'craft'});action(s,{type:'undo'});
 const t=restoreBackpack(saveBackpack(s));assert.deepEqual(t.stock,s.stock);assert.deepEqual(t.grid,s.grid);assert.equal(t.startedAt,s.startedAt);assert.deepEqual(t.log,s.log);
 assert.equal(restoreBackpack({...JSON.parse(saveBackpack(s)),stock:{diamond:999},solved:true}).solved,false);
 for(const raw of ['{bad',null,{version:2,log:[]},{version:1,log:[{type:'place',index:99,item:'oak_planks'}]},{version:1,log:Array(10001).fill({type:'clear'})}])assert.deepEqual(restoreBackpack(raw).stock,backpackLevels[0].stock);
});
test('lighting and circuit progress accurately describe partial completion',()=>{
 const s=createBackpackState();for(const i of [18,19,20,21])action(s,{type:'place',index:i,item:'cobblestone'});action(s,{type:'next'});craft(s,'oak_planks','oak_planks');craft(s,'coal','stick');
 assert.equal(backpackProgress(s).current,0);action(s,{type:'place',index:10,item:'torch'});assert.ok(backpackLight(s,11));assert.equal(backpackLight(s,17),false);assert.equal(backpackProgress(s).current,1);
});
test('Minecraft icons and terrain are local PNG assets, with mobile and keyboard safeguards',()=>{
 for(const name of ['oak_log','oak_planks','stick','coal','torch','cobblestone','redstone','lever','grass_block_side','lava_still','stone','deepslate_tiles','stone_bricks','redstone_block','redstone_lamp_on','iron_door','diamond','chest_minecart']){
  const png=readFileSync(new URL('../assets/minecraft/backpack/'+name+'.png',import.meta.url));assert.equal(png.subarray(1,4).toString(),'PNG');assert.ok(png.readUInt32BE(16)>=16&&png.readUInt32BE(20)>=16,name);
 }
 const css=readFileSync(new URL('../css/lastBackpack.css',import.meta.url),'utf8'),js=readFileSync(new URL('../js/lastBackpack.js',import.meta.url),'utf8');
 assert.ok(css.includes('image-rendering:pixelated'));assert.ok(css.includes('min-height:44px'));assert.ok(css.includes('prefers-reduced-motion:reduce'));assert.ok(js.includes('focus({preventScroll:true})'));assert.ok(js.includes("action.type==='select'"));assert.ok(js.includes("data-bp-selected"));
});
test('each stage adds four usable inventory decoys without changing solutions or consuming rejected placements',()=>{
 const decoys=['feather','string','snowball','rotten_flesh'];
 for(let level=0;level<3;level++){
  const s=createBackpackState();s.level=level;s.stock={...backpackLevels[level].stock};
  for(const item of decoys){assert.ok(s.stock[item]>0);const stock={...s.stock};action(s,{type:'select',item});action(s,{type:'place',index:18,item});assert.deepEqual(s.stock,stock);assert.equal(s.solved,false);
   action(s,{type:'craft-slot',index:0,item});assert.equal(backpackRecipe(s.grid),null);action(s,{type:'clear'});assert.deepEqual(s.stock,stock);
   const png=readFileSync(new URL('../assets/minecraft/backpack/'+item+'.png',import.meta.url));assert.equal(png.subarray(1,4).toString(),'PNG');
  }
 }
});
