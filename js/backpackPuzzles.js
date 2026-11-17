import {advancedItems,advancedLevels,advancedTerrain,advancedTile,advancedRecipe,advancedProgress,advancedPlace} from './backpackAdvancedPuzzles.js?v=20261117-6';
// Handcrafted additions with independent resource budgets and goal checks.
export const puzzleItems={wooden_hoe:'Drewniana motyka',wheat_seeds:'Nasiona pszenicy',water_bucket:'Wiadro wody',bucket:'Wiadro',rail:'Tory',powered_rail:'Zasilane tory',redstone_torch:'Pochodnia redstone',minecart:'Wagonik',sand:'Piasek',gravel:'Żwir',iron_ore:'Ruda żelaza',iron_ingot:'Sztabka żelaza',bookshelf:'Biblioteczka',book:'Książka',lapis_lazuli:'Lazuryt',obsidian:'Obsydian',flint:'Krzemień',flint_and_steel:'Krzesiwo',wooden_pickaxe:'Drewniany kilof',stone_pickaxe:'Kamienny kilof',iron_pickaxe:'Żelazny kilof',diamond:'Diament',...advancedItems};
const decoys={feather:2,string:3,rotten_flesh:2};
export const extraBackpackLevels=[
 {kind:'farm',theme:'farm',name:'Ostatnie nasiona',goal:'Nawodnij grządki, spulchnij ziemię i posadź trzy ziarna.',tip:'Woda w kamiennej sadzawce nawodni grządki. Użyj motyki, dopiero potem nasion. Motyka: 2 deski w górnym rzędzie i 2 patyki pod jedną z nich.',stock:{oak_planks:4,water_bucket:1,wheat_seeds:3,...decoys},outputs:['stick','wooden_hoe','bucket'],plots:[18,20,22],pool:12},
 {kind:'rail',theme:'rail',name:'Ekspres do skrzyni',goal:'Dokończ trasę, zasil złoty odcinek i wypuść wagonik.',tip:'Złoty odcinek należy do zasilanych torów. Pochodnia redstone obok niego włączy zasilanie. Wagonik postaw na początku, gdy cała trasa będzie gotowa.',stock:{rail:4,powered_rail:1,redstone_torch:1,minecart:1,...decoys},route:[17,18,19,20,21,22],gaps:[18,19,20,21,22],power:20,source:28,start:17,end:22},
 {kind:'gravity',theme:'quarry',name:'Grawitacja nie wybacza',goal:'Zasyp szyb, aby wyrównać trzy przerwy w przejściu.',tip:'Piasek i żwir spadają na dno szybu. W każdym z trzech słupków są dwa puste miejsca. Klikaj w obrębie zaznaczonego szybu — materiał sam opadnie.',stock:{sand:4,gravel:2,...decoys},columns:[2,3,4],top:2,bottom:3},
 {kind:'forge',theme:'forge',name:'Woda za drzwiami',goal:'Wytop żelazo, zrób wiadro i osusz zalane przejście.',tip:'Do pieca włóż 3 rudy żelaza i 1 węgiel, a potem kliknij piec. Wiadro: sztabki w lewym i prawym górnym polu oraz jedna pośrodku pod nimi. Zbierz wodę wiadrem.',stock:{iron_ore:3,coal:1,...decoys},outputs:['iron_ingot','bucket','water_bucket'],ore:10,fuel:26,furnace:18,water:22},
 {kind:'library',theme:'library',name:'Czytelnia zaklęć',goal:'Ustaw cztery biblioteczki, dodaj lazuryt i zaklnij książkę.',tip:'Biblioteczki muszą stać dwa pola od stołu (również po skosie). Pole pomiędzy stołem a każdą biblioteczką musi zostać puste. Do stołu dodaj 1 lazuryt i książkę. To prosta łamigłówka, nie zaklęcie na poziomie 30.',stock:{bookshelf:4,book:1,lapis_lazuli:1,...decoys},table:19},
 {kind:'portal',theme:'portal',name:'Dziesięć sztuk obsydianu',goal:'Zbuduj minimalną ramę portalu i zapal jej wnętrze.',tip:'Narożniki nie są potrzebne: 2 bloki u góry, 2 u dołu i po 3 z każdej strony. Krzemień i sztabka żelaza w craftingu dają krzesiwo. Nie wypełniaj wnętrza obsydianem.',stock:{obsidian:10,flint:1,iron_ingot:1,gravel:3,...decoys},outputs:['flint_and_steel'],frame:[2,3,9,12,17,20,25,28,34,35],inside:[10,11,18,19,26,27]},
 {kind:'mine',theme:'mine',name:'Droga po diament',goal:'Zdobądź diament, stopniowo ulepszając kilof.',tip:'Najpierw zrób drewniany kilof i wydobądź 3 kamienie. Z bruku zrób kamienny kilof, wydobądź 3 rudy żelaza i wytop je w piecu (ruda na górnym polu, węgiel na dolnym). Żelazny kilof dopiero poradzi sobie z diamentem. Kilof: 3 materiały w górnym rzędzie i 2 patyki pod środkiem.',stock:{oak_log:2,coal:1,...decoys},outputs:['oak_planks','stick','wooden_pickaxe','cobblestone','stone_pickaxe','iron_ore','iron_ingot','iron_pickaxe'],stones:[9,17,25],ores:[11,19,27],diamond:21,ore:14,fuel:30,furnace:22}
 ,...advancedLevels
];
const x=i=>i%8,y=i=>Math.floor(i/8),distance=(a,b)=>Math.max(Math.abs(x(a)-x(b)),Math.abs(y(a)-y(b)));
export function extraTerrain(level,i,s){
 if(level.advanced)return advancedTerrain(level,i,s);
 if(level.kind==='farm')return i===level.pool?(s.puzzle.water?'water_still':'stone_bricks'):level.plots.includes(i)?(s.puzzle.tilled?.includes(i)?'farmland_moist':'dirt'):'moss_block';
 if(level.kind==='gravity')return level.columns.includes(x(i))&&y(i)>=level.top&&y(i)<=level.bottom?'blackstone':'stone';
 if(level.kind==='forge')return i===level.water&&!s.puzzle.drained?'water_still':'stone_bricks';
 if(level.kind==='library')return i===level.table?'enchanting_table_top':'oak_planks';
 if(level.kind==='portal')return s.solved&&level.inside.includes(i)?'nether_portal':'netherrack';
 if(level.kind==='mine'){if(!s.puzzle.mined?.includes(i)){if(level.stones.includes(i))return 'stone';if(level.ores.includes(i))return 'iron_ore';if(i===level.diamond)return 'diamond_ore';}return 'deepslate_tiles';}
 return 'stone_bricks';
}
export function extraTile(level,i,s){
 if(level.advanced)return advancedTile(level,i,s);
 let icon='',label='',mark=false;
 if(level.kind==='farm'){mark=level.plots.includes(i);label=mark?'GRZĄDKA':i===level.pool?'WODA':'';if(s.puzzle.planted?.includes(i))icon='wheat_stage3';}
 if(level.kind==='rail'){mark=level.route.includes(i)||i===level.source;label=i===level.source?'ZASILANIE':i===level.start?'START':i===level.end?'META':'';if(i===level.start)icon='rail';if(s.solved&&i===level.end)icon='minecart';}
 if(level.kind==='gravity'){mark=level.columns.includes(x(i))&&y(i)>=level.top&&y(i)<=level.bottom;label=mark&&y(i)===level.top?'SZYB':'';}
 if(level.kind==='forge'||level.kind==='mine'){if(i===level.ore){label=`RUDA ${s.puzzle.ore||0}/3`;if(s.puzzle.ore)icon='iron_ore';}if(i===level.fuel){label=`WĘGIEL ${s.puzzle.fuel||0}/1`;if(s.puzzle.fuel)icon='coal';}if(i===level.furnace){icon=s.puzzle.smelted?'furnace_front_on':'furnace_front';label=s.puzzle.smelted?'WYTOPIONE':'WYTOP';}mark=[level.ore,level.fuel,level.furnace].includes(i);if(level.kind==='forge'&&i===level.water)label=s.puzzle.drained?'SUCHO':'ZALEW';}
 if(level.kind==='library'){if(i===level.table){icon=s.solved?'enchanted_book':'book';label=s.solved?'ZAKLĘTE':`LAZURYT ${s.puzzle.lapis?1:0}/1`;}mark=i===level.table||distance(i,level.table)===2;}
 if(level.kind==='portal'){mark=level.frame.includes(i);if(level.inside.includes(i))label=s.solved?'PORTAL':'';}
 if(level.kind==='mine'&&!s.puzzle.mined?.includes(i)){if(level.stones.includes(i))label='KAMIEŃ';if(level.ores.includes(i))label='ŻELAZO';if(i===level.diamond)label='DIAMENT';mark=mark||level.stones.includes(i)||level.ores.includes(i)||i===level.diamond;}
 return {icon,label,mark,surface:level.kind==='gravity'||level.kind==='portal'||level.kind==='library'};
}
export function extraRecipe(grid){
 const advanced=advancedRecipe(grid);if(advanced)return advanced;
 const cells=grid.map((item,i)=>({item,x:i%3,y:Math.floor(i/3)})).filter(c=>c.item);if(!cells.length)return null;
 const minX=Math.min(...cells.map(c=>c.x)),minY=Math.min(...cells.map(c=>c.y));
 const shape=cells.map(c=>`${c.x-minX},${c.y-minY}:${c.item}`).sort().join('|');
 const shapes=[
  [['0,0:iron_ingot','2,0:iron_ingot','1,1:iron_ingot'],'bucket',1],
  ...['oak_planks','cobblestone','iron_ingot'].map((material,i)=>[[`0,0:${material}`,`1,0:${material}`,`2,0:${material}`,'1,1:stick','1,2:stick'],['wooden_pickaxe','stone_pickaxe','iron_pickaxe'][i],1]),
  [['0,0:oak_planks','1,0:oak_planks','1,1:stick','1,2:stick'],'wooden_hoe',1],
  [['0,0:oak_planks','1,0:oak_planks','0,1:stick','0,2:stick'],'wooden_hoe',1]
 ];
 for(const [parts,item,count]of shapes)if([...parts].sort().join('|')===shape)return {item,count};
 if(cells.length===2&&cells.some(c=>c.item==='flint')&&cells.some(c=>c.item==='iron_ingot'))return {item:'flint_and_steel',count:1};
 return null;
}
export function extraProgress(l,s){if(l.advanced)return advancedProgress(l,s);const p=s.puzzle;
 if(l.kind==='farm')return {current:(p.planted||[]).length,total:3,label:'obsiane grządki'};
 if(l.kind==='rail')return {current:l.gaps.filter(i=>s.placed[i]===(i===l.power?'powered_rail':'rail')).length+(s.placed[l.source]==='redstone_torch'?1:0)+(s.solved?1:0),total:7,label:'elementy trasy'};
 if(l.kind==='gravity')return {current:l.columns.filter(col=>s.placed[l.top*8+col]).length,total:3,label:'wyrównane słupki'};
 if(l.kind==='forge')return {current:(p.smelted?1:0)+(p.drained?1:0),total:2,label:'etapy ratunku'};
 if(l.kind==='library')return {current:Object.values(s.placed).filter(t=>t==='bookshelf').length+(p.lapis?1:0)+(s.solved?1:0),total:6,label:'elementy zaklęcia'};
 if(l.kind==='portal')return {current:l.frame.filter(i=>s.placed[i]==='obsidian').length+(s.solved?1:0),total:11,label:'elementy portalu'};
 return {current:(p.mined||[]).length+(p.smelted?1:0),total:8,label:'etapy wydobycia'};
}
export function extraPlace(s,l,i,item){
 if(l.advanced)return advancedPlace(s,l,i,item);
 const p=s.puzzle,has=id=>(s.stock[id]||0)>0;
 const take=id=>{s.stock[id]--;s.used++;};const give=(id,n=1)=>s.stock[id]=(s.stock[id]||0)+n;
 const place=(id,index=i)=>{if(s.placed[index]||!has(id))return false;take(id);s.placed[index]=id;return true;};
 let ok=false;
 if(l.kind==='farm'){
  if(i===l.pool&&item==='water_bucket'&&has(item)&&!p.water){take(item);give('bucket');p.water=true;ok=true;}
  if(l.plots.includes(i)&&item==='wooden_hoe'&&has(item)&&!(p.tilled||[]).includes(i)){(p.tilled||=[]).push(i);ok=true;}
  if(l.plots.includes(i)&&item==='wheat_seeds'&&has(item)&&p.water&&(p.tilled||[]).includes(i)&&!(p.planted||[]).includes(i)){take(item);(p.planted||=[]).push(i);ok=true;}
  s.solved=(p.planted||[]).length===3;
 }else if(l.kind==='rail'){
  if(l.gaps.includes(i)&&item===(i===l.power?'powered_rail':'rail'))ok=place(item);
  if(i===l.source&&item==='redstone_torch')ok=place(item);
  const ready=l.gaps.every(j=>s.placed[j]===(j===l.power?'powered_rail':'rail'))&&s.placed[l.source]==='redstone_torch';
  s.on=ready;if(i===l.start&&item==='minecart'&&has(item)&&ready){take(item);s.solved=true;ok=true;}
 }else if(l.kind==='gravity'){
  if(l.columns.includes(x(i))&&y(i)>=l.top&&y(i)<=l.bottom&&['sand','gravel'].includes(item)&&has(item)){
   for(let row=l.bottom;row>=l.top;row--)if(!s.placed[row*8+x(i)]){ok=place(item,row*8+x(i));break;}
  }
  s.solved=l.columns.every(col=>s.placed[l.top*8+col]);
 }else if(l.kind==='forge'||l.kind==='mine'){
  if(l.kind==='mine'){
   const mined=p.mined||[],tier={wooden_pickaxe:1,stone_pickaxe:2,iron_pickaxe:3}[item]||0;
   const required=l.stones.includes(i)?1:l.ores.includes(i)?2:i===l.diamond?3:0;
   if(required&&tier>=required&&has(item)&&!mined.includes(i)){
    (p.mined||=[]).push(i);give(required===1?'cobblestone':required===2?'iron_ore':'diamond');ok=true;if(required===3)s.solved=true;
   }
  }
  if(i===l.ore&&item==='iron_ore'&&has(item)&&(p.ore||0)<3&&!p.smelted){take(item);p.ore=(p.ore||0)+1;ok=true;}
  if(i===l.fuel&&item==='coal'&&has(item)&&!p.fuel&&!p.smelted){take(item);p.fuel=1;ok=true;}
  if(i===l.furnace&&p.ore===3&&p.fuel===1&&!p.smelted){give('iron_ingot',3);p.smelted=true;ok=true;}
  if(l.kind==='forge'&&i===l.water&&item==='bucket'&&has(item)&&!p.drained){take(item);give('water_bucket');p.drained=true;s.solved=true;ok=true;}
 }else if(l.kind==='library'){
  if(item==='bookshelf'&&distance(i,l.table)===2)ok=place(item);
  if(i===l.table&&item==='lapis_lazuli'&&has(item)&&!p.lapis){take(item);p.lapis=true;ok=true;}
  if(i===l.table&&item==='book'&&has(item)&&p.lapis&&Object.values(s.placed).filter(t=>t==='bookshelf').length===4){take(item);s.solved=true;ok=true;}
 }else if(l.kind==='portal'){
  // Wrong frame placement is reversible, but uses the limited obsidian budget.
  if(item==='obsidian'&&!l.inside.includes(i))ok=place(item);
  if(l.inside.includes(i)&&item==='flint_and_steel'&&has(item)&&l.frame.every(j=>s.placed[j]==='obsidian')){s.solved=true;s.on=true;ok=true;}
 }
 if(ok){s.moves++;s.message=s.solved?'Wyzwanie ukończone!':l.kind==='forge'||l.kind==='mine'?'Kolejny etap wykonany.':'Dobrze! Kontynuuj.';}
 else s.message='To jeszcze nie działa. Sprawdź miejsce, kolejność i dostępne narzędzia. Błędna próba niczego nie zużywa.';
 return true;
}
