// Ten additional, resource-bounded puzzles. World rules are deliberate abstractions.
export const advancedItems={bow:'Łuk',arrow:'Strzała',campfire:'Ognisko',glass_bottle:'Szklana butelka',honey_bottle:'Butelka miodu',sponge:'Gąbka',wet_sponge:'Mokra gąbka',hopper:'Lej',blaze_powder:'Płomienny proszek',nether_wart:'Brodawka',melon_slice:'Kawałek arbuza',gold_nugget:'Samorodek złota',glistering_melon_slice:'Lśniący arbuz',potion:'Butelka wody',carved_pumpkin:'Wydrążona dynia',iron_block:'Blok żelaza',tnt:'TNT',glass:'Szkło',nether_star:'Gwiazda Netheru',beacon:'Latarnia',blue_dye:'Niebieski barwnik',blue_stained_glass:'Niebieskie szkło',red_stained_glass:'Czerwone szkło',heart_of_the_sea:'Serce oceanu',nautilus_shell:'Muszla łodzika',conduit:'Przewodnia',prismarine:'Pryzmaryn'};
const decoys={rotten_flesh:2,snowball:3};
const ring=[1,2,3,4,5,9,13,17,21,25,29,33,34,35,36,37];
export const advancedLevels=[
 {kind:'archery',name:'Trzy cele, jedna cięciwa',goal:'Zrób łuk i strzały, potem traf trzy tarcze.',tip:'Łuk: patyki w lewym środkowym, górnym i dolnym środkowym polu, nici w prawej kolumnie (można odbić poziomo). Krzemień nad patykiem nad piórem daje 4 strzały. Wybierz strzałę i dotknij tarczy; łuk musi być w plecaku.',stock:{oak_planks:2,string:3,flint:1,feather:1,...decoys},outputs:['stick','bow','arrow'],targets:[10,20,30]},
 {kind:'honey',name:'Miód bez pościgu',goal:'Zbierz miód z dwóch uli, nie drażniąc pszczół.',tip:'Ustaw ognisko dokładnie pod każdym ulem. Dopiero wtedy użyj przy ulu szklanej butelki. Ognisko w innym miejscu nie uspokoi pszczół.',stock:{campfire:2,glass_bottle:2,torch:3,feather:2,...decoys},outputs:['honey_bottle'],hives:[10,13],fires:[18,21]},
 {kind:'sponge',name:'Jedna gąbka na cały zalew',goal:'Osusz obie zalane komory, używając jednej gąbki.',tip:'Gąbka w tej łamigłówce pochłania wodę z obszaru 3×3 wokół wskazanego pola. Mokrą gąbkę trzeba wysuszyć w piecu z węglem; potem można użyć jej ponownie. Kliknij piec po włożeniu gąbki i paliwa.',stock:{sponge:1,coal:4,feather:2,...decoys},outputs:['wet_sponge'],water:[9,10,17,18,25,26,13,14,21,22,29,30],furnace:35,fuel:36},
 {kind:'hopper',name:'Paczka z zakrętem',goal:'Doprowadź sztabkę z podajnika do skrzyni przez sześć lejów.',tip:'Postaw leje na trasie. Dotknięcie postawionego leja obraca jego wylot: prawo → dół → lewo → góra. Strzałki pokazują kierunek. Gdy trasa jest gotowa, włóż sztabkę do podajnika.',stock:{hopper:6,iron_ingot:1,rail:3,...decoys},path:[10,11,19,27,28,29],input:9,end:30},
 {kind:'brew',name:'Alchemia w dobrej kolejności',goal:'Uwarz miksturę leczenia, zaczynając od pustej butelki.',tip:'Napełnij butelkę w sadzawce. Do statywu dodaj płomienny proszek, butelkę wody, brodawkę i na końcu lśniący arbuz. Arbuz powstaje z kawałka arbuza otoczonego 8 samorodkami złota.',stock:{glass_bottle:1,blaze_powder:1,nether_wart:1,melon_slice:1,gold_nugget:8,...decoys},outputs:['potion','glistering_melon_slice'],pool:10,stand:21},
 {kind:'golem',name:'Strażnik wioski',goal:'Zbuduj żelaznego strażnika i na końcu dodaj dynię.',tip:'Cztery bloki żelaza tworzą literę T: trzy w poprzeczce i jeden pod jej środkiem. Wydrążoną dynię ustaw nad środkiem jako ostatni element. Złe bloki możesz odzyskać.',stock:{iron_block:4,carved_pumpkin:1,cobblestone:3,...decoys},body:[18,19,20,27],head:11},
 {kind:'demolition',name:'Wyburz mur, ocal skarb',goal:'Jednym TNT usuń trzy fragmenty muru, nie uszkadzając skrzyni.',tip:'W tej planszy wybuch obejmuje obszar 3×3 wokół TNT. Przed odpaleniem zobaczysz jego zasięg. Szukaj miejsca, które obejmie wszystkie fragmenty muru, ale nie skrzynię. Krzesiwo uruchamia postawione TNT. Nieudane wyburzenie można cofnąć.',stock:{tnt:1,flint_and_steel:1,sand:3,...decoys},walls:[18,19,20],chest:22},
 {kind:'logic',name:'Dwie jasne, jedna ciemna',goal:'Włącz dwie górne lampy, a dolną pozostaw zgaszoną.',tip:'Postaw trzy dźwignie. Kolejne kliknięcia zmieniają ich pozycję. Górna lampa świeci, gdy A i B są różne; środkowa, gdy B i C są różne; dolna, gdy A i C są obie włączone. To plansza logiczna, nie symulator obwodów redstone.',stock:{lever:3,redstone:4,...decoys},switches:[9,17,25],lamps:[12,20,28]},
 {kind:'beacon',name:'Niebieski sygnał ratunkowy',goal:'Zbuduj podstawę i uruchom latarnię z niebieską wiązką.',tip:'Podstawa to pełne 3×3 z bloków żelaza. Latarnia: 3 szkła u góry, szkło–gwiazda–szkło w środku, 3 obsydiany na dole. Postaw ją na środku podstawy. Niebieskie szkło: barwnik pośrodku i 8 szkieł dookoła. Użyj go na latarni.',stock:{iron_block:9,glass:13,obsidian:3,nether_star:1,blue_dye:1,red_stained_glass:1,...decoys},outputs:['beacon','blue_stained_glass'],base:[10,11,12,18,19,20,26,27,28],center:19},
 {kind:'conduit',name:'Serce zatopionej świątyni',goal:'Uruchom przewodnię w pryzmarynowej ramie pod wodą.',tip:'Ramka 5×5 potrzebuje 16 bloków pryzmarynu. Środek zostaje na przewodnię. W craftingu otocz serce oceanu 8 muszlami. Dodaj wodę na oznaczonym polu. Ten przekrój jest uproszczoną łamigłówką, nie pełną symulacją podwodnej budowli.',stock:{prismarine:16,heart_of_the_sea:1,nautilus_shell:8,water_bucket:1,...decoys},outputs:['conduit','bucket'],frame:ring,center:19,pool:20}
].map(l=>({...l,advanced:true,theme:l.kind}));
const x=i=>i%8,y=i=>Math.floor(i/8),near=(a,b)=>Math.max(Math.abs(x(a)-x(b)),Math.abs(y(a)-y(b)))<=1;
export function advancedTerrain(l,i,s){const p=s.puzzle;
 if(l.kind==='sponge')return l.water.includes(i)&&!(p.dry||[]).includes(i)?'water_still':'stone_bricks';
 if(l.kind==='brew')return i===l.pool?'water_still':'oak_planks';
 if(l.kind==='conduit')return p.water&&x(i)>=2&&x(i)<=4&&y(i)>=1&&y(i)<=3?'water_still':'prismarine';
 if(l.kind==='beacon')return (p.base||[]).includes(i)?'iron_block':'moss_block';
 if(l.kind==='demolition')return l.walls.includes(i)&&!(p.broken||[]).includes(i)?'cracked_stone_bricks':'stone_bricks';
 if(l.kind==='honey'||l.kind==='golem'||l.kind==='archery')return 'moss_block';
 return 'stone_bricks';
}
export function logicLights(l,s){const a=!!s.puzzle.switches?.[l.switches[0]],b=!!s.puzzle.switches?.[l.switches[1]],c=!!s.puzzle.switches?.[l.switches[2]];return [a!==b,b!==c,a&&c];}
export function advancedTile(l,i,s){const p=s.puzzle;let icon='',label='',mark=false,fx='';
 if(l.kind==='archery'&&l.targets.includes(i)){icon='target_side';mark=true;label=(p.hits||[]).includes(i)?'TRAFIONA':'TARCZA';}
 if(l.kind==='honey'){if(l.hives.includes(i)){icon='beehive_front_honey';label=(p.honey||[]).includes(i)?'ZEBRANE':'UL';}mark=l.fires.includes(i);}
 if(l.kind==='sponge'){if(i===l.furnace){icon=p.wet?'furnace_front_on':'furnace_front';label=p.wet?'SUSZ':'GĄBKA';}if(i===l.fuel)label=`WĘGIEL ${p.fuel||0}`;mark=l.water.includes(i)||i===l.furnace||i===l.fuel;}
 if(l.kind==='hopper'){if(i===l.input){icon='iron_ingot';label='PODAJNIK';}if(i===l.end){icon='chest_minecart';label='SKRZYNIA';}if(s.placed[i]==='hopper')label=['→','↓','←','↑'][p.dirs?.[i]||0];mark=l.path.includes(i);}
 if(l.kind==='brew'){if(i===l.pool)label='WODA';if(i===l.stand){icon='brewing_stand';label=['STATYW','WODA','NIEZRĘCZNY','LECZENIE'][p.brew||0];mark=true;}}
 if(l.kind==='golem'){mark=l.body.includes(i)||i===l.head;label=i===l.head?'GŁOWA':'';}
 if(l.kind==='demolition'){if(i===l.chest){icon='chest_minecart';label='OCAL SKARB';}if(l.walls.includes(i)&&!(p.broken||[]).includes(i))label='MUR';const tnt=Object.keys(s.placed).find(k=>s.placed[k]==='tnt');mark=tnt!==undefined&&near(i,Number(tnt));if(mark)fx=i===l.chest?'danger':'blast';}
 if(l.kind==='logic'){if(l.switches.includes(i))label=`${'ABC'[l.switches.indexOf(i)]} ${p.switches?.[i]?'ON':'OFF'}`;if(l.lamps.includes(i)){const n=l.lamps.indexOf(i);icon=logicLights(l,s)[n]?'redstone_lamp_on':'redstone_lamp';label=n<2?'WŁĄCZ':'WYŁĄCZ';}mark=l.switches.includes(i);}
 if(l.kind==='beacon'){mark=l.base.includes(i);if(s.placed[i]==='beacon'){label=p.filter==='blue_stained_glass'?'NIEBIESKA':'FILTR';fx=s.solved?'beam':'';}}
 if(l.kind==='conduit'){mark=l.frame.includes(i)||i===l.center;if(i===l.pool)label='WODA';if(i===l.center)label=s.solved?'AKTYWNA':'SERCE';}
 return {icon,label,mark,fx,surface:['golem','conduit'].includes(l.kind)};
}
export function advancedRecipe(grid){
 const cells=grid.map((item,i)=>({item,x:i%3,y:Math.floor(i/3)})).filter(c=>c.item);if(!cells.length)return null;
 const minX=Math.min(...cells.map(c=>c.x)),minY=Math.min(...cells.map(c=>c.y));
 const shape=cells.map(c=>`${c.x-minX},${c.y-minY}:${c.item}`).sort().join('|');
 const recipes=[
  [['1,0:stick','0,1:stick','1,2:stick','2,0:string','2,1:string','2,2:string'],'bow',1],
  [['1,0:stick','2,1:stick','1,2:stick','0,0:string','0,1:string','0,2:string'],'bow',1],
  [['0,0:flint','0,1:stick','0,2:feather'],'arrow',4],
  [['0,0:glass','2,0:glass','1,1:glass'],'glass_bottle',3],
  [['0,0:glass','1,0:glass','2,0:glass','0,1:glass','1,1:nether_star','2,1:glass','0,2:obsidian','1,2:obsidian','2,2:obsidian'],'beacon',1],
 ];
 for(const [parts,item,count]of recipes)if([...parts].sort().join('|')===shape)return {item,count};
 for(const [center,around,item,count]of [['melon_slice','gold_nugget','glistering_melon_slice',1],['blue_dye','glass','blue_stained_glass',8],['heart_of_the_sea','nautilus_shell','conduit',1]])if(grid[4]===center&&grid.every((v,i)=>i===4||v===around))return {item,count};
 return null;
}
export function advancedProgress(l,s){const p=s.puzzle;switch(l.kind){
 case 'archery':return {current:(p.hits||[]).length,total:3,label:'trafione tarcze'};
 case 'honey':return {current:(p.honey||[]).length,total:2,label:'zebrane ule'};
 case 'sponge':return {current:(p.dry||[]).length,total:l.water.length,label:'osuszone pola'};
 case 'hopper':return {current:l.path.filter(i=>s.placed[i]==='hopper').length+(s.solved?1:0),total:7,label:'etapy dostawy'};
 case 'brew':return {current:(p.brew||0)+(p.brewFuel?1:0),total:4,label:'etapy warzenia'};
 case 'golem':return {current:l.body.filter(i=>s.placed[i]==='iron_block').length+(s.solved?1:0),total:5,label:'części strażnika'};
 case 'demolition':return {current:(p.broken||[]).length,total:3,label:'usunięte fragmenty muru'};
 case 'logic':{const lights=logicLights(l,s);return {current:s.solved?3:lights.filter((v,i)=>v===(i<2)).length,total:3,label:'poprawne lampy'};}
 case 'beacon':return {current:(p.base||[]).length+(s.placed[l.center]==='beacon'?1:0)+(s.solved?1:0),total:11,label:'etapy sygnału'};
 case 'conduit':return {current:l.frame.filter(i=>s.placed[i]==='prismarine').length+(s.placed[l.center]==='conduit'?1:0)+(p.water?1:0),total:18,label:'elementy świątyni'};
 }}
export function advancedPlace(s,l,i,item){const p=s.puzzle,has=id=>(s.stock[id]||0)>0;
 const take=id=>{s.stock[id]--;s.used++;},give=(id,n=1)=>s.stock[id]=(s.stock[id]||0)+n;
 const place=id=>{if(s.placed[i]||!has(id))return false;take(id);s.placed[i]=id;return true;};let ok=false;
 if(l.kind==='archery'){
  if(l.targets.includes(i)&&item==='arrow'&&has(item)&&has('bow')&&!(p.hits||[]).includes(i)){take(item);(p.hits||=[]).push(i);ok=true;}s.solved=(p.hits||[]).length===3;
 }else if(l.kind==='honey'){
  if(l.fires.includes(i)&&item==='campfire')ok=place(item);
  if(l.hives.includes(i)&&item==='glass_bottle'&&has(item)&&s.placed[i+8]==='campfire'&&!(p.honey||[]).includes(i)){take(item);give('honey_bottle');(p.honey||=[]).push(i);ok=true;}s.solved=(p.honey||[]).length===2;
 }else if(l.kind==='sponge'){
  if(l.water.includes(i)&&item==='sponge'&&has(item)){const targets=l.water.filter(j=>!(p.dry||[]).includes(j)&&near(i,j));if(targets.length){take(item);give('wet_sponge');p.dry=[...(p.dry||[]),...targets];ok=true;}}
  if(i===l.fuel&&item==='coal'&&has(item)){take(item);p.fuel=(p.fuel||0)+1;ok=true;}
  if(i===l.furnace&&item==='wet_sponge'&&has(item)&&!p.wet){take(item);p.wet=true;ok=true;}
  else if(i===l.furnace&&p.wet&&p.fuel>0){p.fuel--;p.wet=false;give('sponge');ok=true;}
  s.solved=(p.dry||[]).length===l.water.length;
 }else if(l.kind==='hopper'){
  if(l.path.includes(i)&&s.placed[i]==='hopper'){(p.dirs||={})[i]=((p.dirs?.[i]||0)+1)%4;ok=true;}
  else if(l.path.includes(i)&&item==='hopper'&&place(item)){(p.dirs||={})[i]=0;ok=true;}
  if(i===l.input&&item==='iron_ingot'&&has(item)){
   let at=l.input+1;const seen=new Set();while(s.placed[at]==='hopper'&&!seen.has(at)){seen.add(at);const dir=p.dirs?.[at]||0;const next=at+[1,8,-1,-8][dir];if(next<0||next>=40||dir%2===0&&y(next)!==y(at))break;at=next;}
   if(at===l.end&&seen.size===l.path.length){take(item);s.solved=true;ok=true;}
  }
 }else if(l.kind==='brew'){
  if(i===l.pool&&item==='glass_bottle'&&has(item)){take(item);give('potion');ok=true;}
  if(i===l.stand){if(item==='blaze_powder'&&has(item)&&!p.brewFuel){take(item);p.brewFuel=true;ok=true;}
   if(item==='potion'&&has(item)&&!p.brew){take(item);p.brew=1;ok=true;}
   if(item==='nether_wart'&&has(item)&&p.brew===1&&p.brewFuel){take(item);p.brew=2;ok=true;}
   if(item==='glistering_melon_slice'&&has(item)&&p.brew===2&&p.brewFuel){take(item);p.brew=3;s.solved=true;ok=true;}}
 }else if(l.kind==='golem'){
  if(item==='iron_block'&&i!==l.head)ok=place(item);
  if(i===l.head&&item==='carved_pumpkin'&&has(item)&&l.body.every(j=>s.placed[j]==='iron_block')){take(item);s.placed[i]=item;s.solved=true;ok=true;}
 }else if(l.kind==='demolition'){
  if(item==='tnt'&&has(item)&&!l.walls.includes(i)&&i!==l.chest&&!Object.values(s.placed).includes('tnt'))ok=place(item);
  if(item==='flint_and_steel'&&has(item)&&s.placed[i]==='tnt'&&!near(i,l.chest)){p.broken=l.walls.filter(j=>near(i,j));delete s.placed[i];ok=true;s.solved=p.broken.length===l.walls.length;}
 }else if(l.kind==='logic'){
  if(l.switches.includes(i)&&s.placed[i]==='lever'){(p.switches||={})[i]=!p.switches?.[i];ok=true;}
  else if(l.switches.includes(i)&&item==='lever'&&place(item)){(p.switches||={})[i]=false;ok=true;}
  const lights=logicLights(l,s);s.solved=l.switches.every(j=>s.placed[j]==='lever')&&lights[0]&&lights[1]&&!lights[2];s.on=s.solved;
 }else if(l.kind==='beacon'){
  if(l.base.includes(i)&&item==='iron_block'&&has(item)&&!(p.base||[]).includes(i)){take(item);(p.base||=[]).push(i);ok=true;}
  if(i===l.center&&item==='beacon'&&has(item)&&(p.base||[]).length===9&&!s.placed[i])ok=place(item);
  if(i===l.center&&s.placed[i]==='beacon'&&['blue_stained_glass','red_stained_glass'].includes(item)&&has(item)){if(p.filter)give(p.filter);take(item);p.filter=item;ok=true;s.solved=item==='blue_stained_glass';s.on=s.solved;}
 }else if(l.kind==='conduit'){
  if(l.frame.includes(i)&&item==='prismarine')ok=place(item);
  if(i===l.center&&item==='conduit')ok=place(item);
  if(i===l.pool&&item==='water_bucket'&&has(item)&&!p.water){take(item);give('bucket');p.water=true;ok=true;}
  s.solved=!!(p.water&&s.placed[l.center]==='conduit'&&l.frame.every(j=>s.placed[j]==='prismarine'));s.on=s.solved;
 }
 if(ok){s.moves++;s.message=s.solved?'Wyzwanie ukończone!':'Dobrze! Obserwuj zmianę na planszy.';}
 else s.message='Sprawdź kolejność i układ. Ta próba niczego nie zużywa; wcześniejszy ruch możesz cofnąć.';
 return true;
}
