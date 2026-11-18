import assert from 'node:assert/strict';
import {backpackAction,backpackLevels} from '../js/lastBackpackEngine.js';

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
  const paths=new Map([[start,[]]]),queue=[start];
  for(const cell of queue){
   for(const tile of route.cells){
    if(paths.has(tile)||!(route.gates[tile]||[]).every(done))continue;
    if(Math.abs(tile%8-cell%8)+Math.abs(Math.floor(tile/8)-Math.floor(cell/8))!==1)continue;
    paths.set(tile,[...paths.get(cell),tile]);
    queue.push(tile);
   }
  }
  assert.ok(paths.has(finish),`${level.name}: no route to ${finish}`);
  for(const tile of paths.get(finish)){place(tile);assert.equal(state.puzzle.cart,tile);}
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
  const [item,count]=Object.entries(station.take||{})[0]||[station.tool,1];
  if(item)ensure(item,count);
  place(station.cell,item);
  assert.ok(done(station.id),`${level.name}: ${station.label}`);
 }
 if(level.route)reach(level.route.finish);
 assert.ok(state.solved,level.name);
}
