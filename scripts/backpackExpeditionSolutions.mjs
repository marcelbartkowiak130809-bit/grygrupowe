// Shared interaction sequence driven independently through engine actions and UI buttons.
export function solveExpedition(level,{put,craft}){
 const around=(center,outer)=>Array.from({length:9},(_,i)=>[i,i===4?center:outer]);
 switch(level){
 case 20:
  craft([[0,'oak_planks'],[1,'oak_planks'],[2,'oak_planks'],[3,'cobblestone'],[4,'iron_ingot'],[5,'cobblestone'],[6,'cobblestone'],[7,'redstone'],[8,'cobblestone']]);
  for(const i of [17,12,29])put(i,'piston');put(17);put(17);put(12);put(29);put(29);break;
 case 21:
  craft([[0,'feather'],[3,'copper_ingot'],[6,'stick']]);for(const i of [10,13,26,29]){put(i,'brush');put(i,'brush');}
  craft([[1,'brick'],[3,'brick'],[5,'brick'],[7,'brick']]);put(20,'decorated_pot');break;
 case 22:
  craft([[1,'iron_ingot'],[3,'iron_ingot']]);for(const i of [9,17,25])put(i,'shears');
  for(const [i,color]of [[12,'red'],[20,'blue'],[28,'yellow']]){craft([[0,'white_wool'],[1,color+'_dye']]);put(i,color+'_wool');}break;
 case 23:
  craft([[1,'iron_ingot'],[3,'iron_ingot'],[4,'redstone'],[5,'iron_ingot'],[7,'iron_ingot']]);craft(around('compass','paper'));put(9,'map');for(const i of [10,18,19,27,28,29,21,13])put(i);break;
 case 24:
  craft([[0,'milk_bucket'],[1,'milk_bucket'],[2,'milk_bucket'],[3,'sugar'],[4,'egg'],[5,'sugar'],[6,'wheat'],[7,'wheat'],[8,'wheat']]);put(19,'cake');put(19,'candle');put(19,'flint_and_steel');break;
 case 25:
  for(let n=0;n<2;n++)craft([[0,'oak_planks'],[1,'oak_planks'],[2,'oak_planks']]);
  craft([0,2,3,5,6,7,8].map(i=>[i,'oak_slab']));put(9,'composter');put(30,'oak_sapling');
  for(let n=0;n<3;n++){for(let seed=0;seed<4;seed++)put(9,'wheat_seeds');put(9);put(30,'bone_meal');}break;
 case 26:
  put(10,'netherite_upgrade_smithing_template');put(18,'diamond_chestplate');put(26,'netherite_ingot');put(20);
  put(10,'coast_armor_trim_smithing_template');put(18,'netherite_chestplate');put(26,'emerald');put(20);break;
 case 27:
  for(const i of [17,18,19,20])put(i,'note_block');put(22,'lever');for(const [i,n]of [[17,1],[18,4],[20,2]])for(let j=0;j<n;j++)put(i);put(22);break;
 case 28:
  for(const [i,n]of [[11,3],[19,2],[27,1]]){for(let j=0;j<n;j++)put(i,'iron_axe');put(i,'honeycomb');}break;
 case 29:
  for(const i of [3,9,13,25,29,35]){craft([[0,'ender_pearl'],[1,'blaze_powder']]);put(i,'ender_eye');}put(19);break;
 default:throw Error('No expedition solution for '+level);
 }
}
