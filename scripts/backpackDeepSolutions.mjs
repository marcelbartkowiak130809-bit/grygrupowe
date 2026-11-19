import assert from 'node:assert/strict';
import {backpackAction,backpackLevels} from '../js/lastBackpackEngine.js';
import {isDeepRouteOpen} from '../js/backpackDeepPuzzles.js';

const recipes={
 bucket:[[0,'iron_ingot'],[2,'iron_ingot'],[4,'iron_ingot']],
 brush:[[0,'feather'],[3,'copper_ingot'],[6,'stick']],
 decorated_pot:[[1,'brick'],[3,'brick'],[5,'brick'],[7,'brick']],
 red_wool:[[0,'white_wool'],[1,'red_dye']],
 blue_wool:[[0,'white_wool'],[1,'blue_dye']],
 yellow_wool:[[0,'white_wool'],[1,'yellow_dye']],
 compass:[[1,'iron_ingot'],[3,'iron_ingot'],[4,'redstone'],[5,'iron_ingot'],[7,'iron_ingot']],
 map:Array.from({length:9},(_,index)=>[index,index===4?'compass':'paper']),
 blue_stained_glass:Array.from({length:9},(_,index)=>[index,index===4?'blue_dye':'glass']),
 torch:[[0,'coal'],[3,'stick']],
 glistering_melon_slice:Array.from({length:9},(_,index)=>[index,index===4?'melon_slice':'gold_nugget']),
 lever:[[0,'stick'],[3,'cobblestone']],
 iron_pickaxe:[[0,'iron_ingot'],[1,'iron_ingot'],[2,'iron_ingot'],[4,'stick'],[7,'stick']],
 ender_eye:[[0,'ender_pearl'],[1,'blaze_powder']],
 oak_planks:[[0,'oak_log']],
 stick:[[0,'oak_planks'],[3,'oak_planks']],
 piston:['oak_planks','oak_planks','oak_planks','cobblestone','iron_ingot','cobblestone','cobblestone','redstone','cobblestone'].map((item,index)=>[index,item]),
 shears:[[0,'iron_ingot'],[4,'iron_ingot']],
 oak_slab:[0,1,2].map(index=>[index,'oak_planks']),
 composter:[0,2,3,5,6,7,8].map(index=>[index,'oak_slab']),
 conduit:Array.from({length:9},(_,index)=>[index,index===4?'heart_of_the_sea':'nautilus_shell']),
 bow:[[1,'stick'],[2,'string'],[3,'stick'],[5,'string'],[7,'stick'],[8,'string']],
 arrow:[[0,'flint'],[3,'stick'],[6,'feather']],
 red_stained_glass:Array.from({length:9},(_,index)=>[index,index===4?'red_dye':'glass']),
 flint_and_steel:[[0,'flint'],[1,'iron_ingot']],
 diamond_chestplate:[0,2,3,4,5,6,7,8].map(index=>[index,'diamond']),
 cake:['milk_bucket','milk_bucket','milk_bucket','sugar','egg','sugar','wheat','wheat','wheat'].map((item,index)=>[index,item]),
 beacon:['glass','glass','glass','glass','nether_star','glass','obsidian','obsidian','obsidian'].map((item,index)=>[index,item]),
};

export function solveDeepLevel(state,perform=action=>backpackAction(state,action)){
 const level=backpackLevels[state.level];
 const act=action=>assert.ok(perform(action),JSON.stringify(action));
 const place=(index,item)=>act({type:'place',index,item});
 const done=id=>state.puzzle.stations?.[id];
 const ensure=(item,count=1)=>{
  while((state.stock[item]||0)<count){
   assert.ok(recipes[item],`${level.name}: missing ${item}`);
   const previous=state.stock[item]||0;
   const needed={};
   for(const [,ingredient]of recipes[item])needed[ingredient]=(needed[ingredient]||0)+1;
   for(const [ingredient,amount]of Object.entries(needed))ensure(ingredient,amount);
   for(const [index,ingredient]of recipes[item]){
    assert.ok(state.stock[ingredient]>0,`${level.name}: missing recipe ingredient ${ingredient}`);
    act({type:'craft-slot',index,item:ingredient});
   }
   act({type:'craft'});
   assert.ok(state.stock[item]>previous);
  }
 };
 const reach=finish=>{
  const {route}=level,start=state.puzzle.cart??route.start;
  const mask=(level.switches||[]).reduce((result,_,index)=>result+(state.puzzle.switches[index]?1<<index:0),0);
  const queue=[{cell:start,mask,actions:[]}], seen=new Set([`${start}:${mask}`]);
  const add=(cell,mask,actions,index)=>{
   const key=`${cell}:${mask}`;
   if(!seen.has(key)){seen.add(key);queue.push({cell,mask,actions:[...actions,index]});}
  };
  for(const current of queue){
   if(current.cell===finish){
    for(const tile of current.actions)place(tile);
    assert.equal(state.puzzle.cart??route.start,finish);
    return;
   }
   const switches=(level.switches||[]).map((_,index)=>Boolean(current.mask&(1<<index)));
   const routeState={puzzle:{...state.puzzle,switches}};
   for(const tile of route.cells){
    if(!isDeepRouteOpen(level,routeState,tile))continue;
    if(Math.abs(tile%8-current.cell%8)+Math.abs(Math.floor(tile/8)-Math.floor(current.cell/8))!==1)continue;
    add(tile,current.mask,current.actions,tile);
   }
   if(route.signals)level.switches.forEach((index,i)=>add(current.cell,current.mask^(1<<i),current.actions,index));
  }
  assert.fail(`${level.name}: no route to ${finish}`);
 };
 for(const [index,cell]of (level.switches||[]).entries()){
  ensure('lever');
  place(cell,'lever');
  assert.equal(state.puzzle.switches[index],false);
 }
 for(const station of level.steps){
  assert.ok((station.after||[]).every(done));
  if(station.at!==undefined)reach(station.at);
  if(station.pattern)station.pattern.forEach((on,i)=>{if(state.puzzle.switches[i]!==on)place(level.switches[i]);});
  const ingredients=Object.entries(station.take||{});
  for(const [id,count]of ingredients)ensure(id,count);
  const item=ingredients[0]?.[0]||station.tool;
  if(station.tool)ensure(station.tool);
  place(station.cell,item);
  assert.ok(done(station.id),`${level.name}: ${station.label}`);
 }
 if(level.route)reach(level.route.finish);
 assert.ok(state.solved,level.name);
}
