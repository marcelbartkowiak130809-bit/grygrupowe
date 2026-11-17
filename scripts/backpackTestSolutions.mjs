import assert from 'node:assert/strict';
import {backpackAction as action,backpackRecipe,backpackLevels} from '../js/lastBackpackEngine.js';
export function solveBackpackLevel(s){
 const put=(index,item)=>{assert.ok(action(s,{type:'place',index,item}));};
 const craft=slots=>{for(const [index,item]of slots)assert.ok(action(s,{type:'craft-slot',index,item}));assert.ok(backpackRecipe(s.grid));action(s,{type:'craft'});};
 const sticks=()=>craft([[0,'oak_planks'],[3,'oak_planks']]);
 const pick=mat=>craft([[0,mat],[1,mat],[2,mat],[4,'stick'],[7,'stick']]);
 switch(s.level){
  case 0:for(const i of [18,19,20,21])put(i,'cobblestone');break;
  case 1:sticks();craft([[0,'coal'],[3,'stick']]);for(const i of backpackLevels[1].targets)put(i,'torch');break;
  case 2:sticks();craft([[0,'stick'],[3,'cobblestone']]);put(17,'lever');for(const i of [18,19,20,21])put(i,'redstone');put(17);break;
  case 3:sticks();craft([[0,'oak_planks'],[1,'oak_planks'],[4,'stick'],[7,'stick']]);put(12,'water_bucket');for(const i of [18,20,22]){put(i,'wooden_hoe');put(i,'wheat_seeds');}break;
  case 4:for(const i of [18,19,21,22])put(i,'rail');put(20,'powered_rail');put(28,'redstone_torch');put(17,'minecart');break;
  case 5:for(const [i,item]of [[18,'sand'],[18,'sand'],[19,'sand'],[19,'sand'],[20,'gravel'],[20,'gravel']])put(i,item);break;
  case 6:for(let j=0;j<3;j++)put(10,'iron_ore');put(26,'coal');put(18);craft([[0,'iron_ingot'],[2,'iron_ingot'],[4,'iron_ingot']]);put(22,'bucket');break;
  case 7:for(const i of [1,3,5,33])put(i,'bookshelf');put(19,'lapis_lazuli');put(19,'book');break;
  case 8:for(const i of backpackLevels[8].frame)put(i,'obsidian');craft([[0,'flint'],[8,'iron_ingot']]);put(10,'flint_and_steel');break;
  case 9:craft([[0,'oak_log']]);craft([[0,'oak_log']]);sticks();pick('oak_planks');for(const i of [9,17,25])put(i,'wooden_pickaxe');pick('cobblestone');for(const i of [11,19,27])put(i,'stone_pickaxe');for(let j=0;j<3;j++)put(14,'iron_ore');put(30,'coal');put(22);sticks();pick('iron_ingot');put(21,'iron_pickaxe');break;
  default:throw Error('No solution for stage '+s.level);
 }
 assert.ok(s.solved,`Stage ${s.level}: ${s.message}`);
}
