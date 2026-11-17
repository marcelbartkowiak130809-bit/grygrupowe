import assert from 'node:assert/strict';
import {journeyAction as act,journeyRecipes,journeyRecipe} from '../js/alexJourneyEngine.js';
export function solveJourneyScene(s,{explore=false,perform=a=>act(s,a)}={}){
 const node=(id,item)=>{assert.ok(perform({type:'node',id,item}),id);};
 const stock=id=>s.stock[id]||0;
 const craft=id=>{
  const r=journeyRecipes.find(r=>r.id===id),needed={};for(const [,item]of r.slots)needed[item]=(needed[item]||0)+1;
  for(let tries=0;tries<30;tries++){const missing=Object.entries(needed).find(([item,count])=>stock(item)<count);if(!missing)break;const [item,count]=missing;if(item==='oak_planks')craft('oak_planks');else if(item==='stick')craft('stick');else throw Error(`Missing ${item}: ${stock(item)}/${count}, scene ${s.scene}`);}
  assert.ok(perform({type:'prepare',id}));assert.equal(journeyRecipe(s.grid)?.id,id);assert.ok(perform({type:'craft'}));
 };
 const mine=(id,item,until)=>{for(let n=0;n<15&&!until();n++)node(id,item);assert.ok(until(),id+' did not supply required stock');};
 const tile=(x,y,item)=>assert.ok(perform({type:'tile',x,y,item}));
 switch(s.scene){
 case 0:node('first-log');node('pig');node('pig');if(explore){node('berries');node('starter-cache');}break;
 case 1:if(s.rulesVersion===2)node('bridge-prop');while(stock('oak_planks')<(s.rulesVersion===2?2:4))craft('oak_planks');for(const x of [8,9,10,11])if(!s.world[1].placed[96+x])tile(x,6,'oak_planks');if(explore&&s.rulesVersion!==2)node('river-log');assert.ok(perform({type:'exit'}));break;
 case 2:node('camp-log');if(explore)node('camp-cache');node('camp-stove',stock('coal')?'coal':'oak_log');node('camp-stove','porkchop');if(explore){node('camp-stove','porkchop');node('camp-stove','porkchop');assert.ok(perform({type:'eat',item:'cooked_porkchop'}));}break;
 case 3:node('quarry-log');craft('wooden_pickaxe');mine('quarry-stone','wooden_pickaxe',()=>stock('cobblestone')>=3);craft('stone_pickaxe');if(explore)mine('quarry-extra','stone_pickaxe',()=>s.world[3].nodes['quarry-extra']?.done);break;
 case 4:mine('mine-coal','stone_pickaxe',()=>s.world[4].nodes['mine-coal']?.done);while(stock('torch')<2)craft('torch');tile(8,4,'torch');tile(12,4,'torch');mine('mine-iron','stone_pickaxe',()=>s.world[4].flags.iron>=3);if(explore)node('mine-cache');break;
 case 5:if(s.rulesVersion!==2)node('forge-log');mine('forge-stone','stone_pickaxe',()=>stock('cobblestone')>=8);craft('furnace');tile(10,5,'furnace');if(explore)node('forge-coal','stone_pickaxe');node('hearth',stock('coal')?'coal':'oak_log');for(let i=0;i<3;i++)node('hearth','iron_ore');craft('iron_pickaxe');break;
 case 6:if(s.rulesVersion===2){node('well-weight','iron_pickaxe');node('well-pulley','cobblestone');}else node('well','iron_pickaxe');node('well');if(explore){node('village-cache');node('pantry');}break;
 case 7:mine('ridge-stone','iron_pickaxe',()=>stock('cobblestone')>=6);for(const [x,y]of [[8,6],[9,6],[10,6],[9,5],[10,5],[10,4]])tile(x,y,'cobblestone');if(explore&&s.rulesVersion!==2)node('ridge-cache');assert.ok(perform({type:'exit'}));break;
 case 8:if(s.rulesVersion!==2)node('gate-log');if(stock('cobblestone')<1)node('gate-stone','iron_pickaxe');mine('gate-redstone','iron_pickaxe',()=>stock('redstone')>=4);craft('lever');tile(7,5,'lever');for(const x of [8,9,10,11])tile(x,5,'redstone');assert.ok(perform({type:'switch'}));assert.ok(perform({type:'exit'}));break;
 case 9:if(stock('torch')<1){node('home-log');node('home-cache');craft('torch');}node('lantern','torch');node('alex');break;
 }
 assert.ok(s.completed[s.scene],`Scene ${s.scene}: ${s.message}`);
}
