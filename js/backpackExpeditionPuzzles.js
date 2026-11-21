// Stages 21–30. Turn-based puzzle abstractions, not real-time Minecraft simulation.
export const expeditionItems={piston:'Tłok',copper_ingot:'Sztabka miedzi',brush:'Pędzel',brick:'Cegła',decorated_pot:'Zdobiony dzban',stone_shovel:'Kamienna łopata',shears:'Nożyce',white_wool:'Biała wełna',red_wool:'Czerwona wełna',blue_wool:'Niebieska wełna',yellow_wool:'Żółta wełna',red_dye:'Czerwony barwnik',yellow_dye:'Żółty barwnik',compass:'Kompas',paper:'Papier',map:'Mapa',milk_bucket:'Wiadro mleka',sugar:'Cukier',egg:'Jajko',wheat:'Pszenica',cake:'Ciasto',candle:'Świeca',pumpkin:'Dynia',oak_slab:'Dębowa półpłyta',composter:'Kompostownik',bone_meal:'Mączka kostna',oak_sapling:'Sadzonka dębu',diamond_chestplate:'Diamentowy napierśnik',netherite_chestplate:'Netherytowy napierśnik',netherite_ingot:'Sztabka netherytu',netherite_upgrade_smithing_template:'Szablon ulepszenia do netherytu',coast_armor_trim_smithing_template:'Szablon zdobienia Wybrzeże',emerald:'Szmaragd',note_block:'Blok dźwiękowy',iron_axe:'Żelazna siekiera',honeycomb:'Plaster miodu',ender_pearl:'Perła Endu',ender_eye:'Oko Endera'};
const decoys={rotten_flesh:2,snowball:3};
export const expeditionLevels=[
 {kind:'pistons',name:'Przesyłka na tłokach',goal:'Przesuń blok za oba zakręty, aż dotrze na złotą płytkę.',tip:'Tłoki ustaw na trzech oznaczonych stanowiskach. Każde kliknięcie zamontowanego tłoka przesuwa ładunek o jedno pole w kierunku strzałki, jeśli jest na jego linii. Tłok: 3 deski u góry; bruk–żelazo–bruk w środku; bruk–redstone–bruk na dole.',stock:{piston:2,oak_planks:3,cobblestone:4,iron_ingot:1,redstone:1,feather:2,...decoys},outputs:['piston'],controls:[17,12,29],directions:[1,8,-1],route:[18,19,20,28,27,26],start:18,end:26},
 {kind:'archaeology',name:'Skarb pod piaskiem',goal:'Oczyść cztery znaleziska i z odzyskanych cegieł zrób dzban.',tip:'Pędzel: pióro nad sztabką miedzi nad patykiem. Każdy podejrzany piasek wymaga dwóch delikatnych użyć pędzla. Z każdej próbki odzyskasz cegłę. Cztery cegły w górnym, lewym, prawym i dolnym środkowym polu craftingu tworzą dzban. Ustaw go na postumencie.',stock:{copper_ingot:1,feather:1,stick:1,stone_shovel:1,...decoys},outputs:['brush','brick','decorated_pot'],sites:[10,13,26,29],pedestal:20},
 {kind:'wool',name:'Barwy po strzyżeniu',goal:'Pozyskaj wełnę, ufarbuj ją i ułóż trzy kolory we właściwej kolejności.',tip:'Nożyce powstają z dwóch sztabek żelaza ułożonych po skosie. Użyj ich na trzech kępkach runa. Biała wełna i barwnik w craftingu dają kolorową wełnę. Dopasuj kolory do próbek: czerwony, niebieski, żółty. Nożyce są wielorazowe.',stock:{iron_ingot:2,red_dye:1,blue_dye:1,yellow_dye:1,string:3,...decoys},outputs:['shears','white_wool','red_wool','blue_wool','yellow_wool'],sources:[9,17,25],targets:[12,20,28],colors:['red_wool','blue_wool','yellow_wool']},
 {kind:'treasure',name:'Mapa do ukrytej skrzyni',goal:'Przygotuj mapę, odsłoń ścieżkę i przejdź nią do skarbu.',tip:'Kompas: redstone w środku i 4 sztabki żelaza nad, pod, z lewej i prawej. Otocz kompas ośmioma kartkami papieru. Użyj mapy na stanowisku startowym. Potem dotykaj kolejnych sąsiednich pól odsłoniętej drogi; po skosie przejść się nie da.',stock:{iron_ingot:4,redstone:1,paper:8,feather:2,...decoys},outputs:['compass','map'],start:9,end:13,path:[9,10,18,19,27,28,29,21,13]},
 {kind:'birthday',name:'Urodziny przy pochodniach',goal:'Upiecz ciasto, ustaw świecę i zapal ją na przyjęcie.',tip:'Ciasto: 3 wiadra mleka u góry, cukier–jajko–cukier w środku, 3 pszenice na dole. Puste wiadra wrócą do plecaka. Ciasto postaw na stole, potem dodaj świecę, a na koniec użyj krzesiwa.',stock:{milk_bucket:3,sugar:2,egg:1,wheat:3,candle:1,flint_and_steel:1,pumpkin:1,...decoys},outputs:['cake','bucket'],table:19},
 {kind:'compost',name:'Z odpadków do korony drzewa',goal:'Zamień nasiona w nawóz i wyhoduj dąb w trzech etapach.',tip:'Kompostownik: 7 półpłyt w kształcie U (cała lewa i prawa kolumna oraz dół). Trzy deski w poziomie dają 6 półpłyt. Ustaw go na stanowisku, a sadzonkę na grządce. Tutaj każde 4 nasiona napełniają kompostownik — kliknij go ponownie, aby odebrać mączkę. Użyj nawozu na sadzonce 3 razy. To skrócony, deterministyczny cykl wzrostu.',stock:{oak_planks:6,wheat_seeds:12,oak_sapling:1,gravel:2,...decoys},outputs:['oak_slab','composter','bone_meal'],bin:9,sapling:30},
 {kind:'smith',name:'Zbroja godna wyprawy',goal:'Ulepsz napierśnik do netherytu, a potem ozdób go szmaragdem.',tip:'Do oznaczonych pól stołu włóż szablon ulepszenia, diamentowy napierśnik i sztabkę netherytu. Kliknij stół, aby odebrać wynik. Potem użyj szablonu Wybrzeże, nowego napierśnika i szmaragdu w tych samych trzech polach. Ponownie uruchom stół. Pomyłki cofniesz przyciskiem Cofnij.',stock:{diamond_chestplate:1,netherite_ingot:1,netherite_upgrade_smithing_template:1,coast_armor_trim_smithing_template:1,emerald:1,iron_ingot:2,...decoys},outputs:['netherite_chestplate'],template:10,armor:18,material:26,table:20},
 {kind:'melody',name:'Melodia otwiera drzwi',goal:'Nastrój cztery bloki na RE · SOL · DO · MI i sprawdź zamek.',tip:'Ustaw cztery bloki dźwiękowe i dźwignię przy drzwiach. Kliknięcie bloku zmienia nutę w pętli DO → RE → MI → FA → SOL → DO. Ustaw melodię od lewej: RE, SOL, DO, MI. Kliknięcie postawionej dźwigni sprawdzi cały układ. Nie ma limitu prób.',stock:{note_block:4,lever:1,redstone:3,torch:2,...decoys},notes:[17,18,19,20],tune:[1,4,0,2],switch:22},
 {kind:'copper',name:'Patyna pod kontrolą',goal:'Przywróć trzem blokom różne odcienie i zabezpiecz je woskiem.',tip:'Siekiera zdejmuje po jednej warstwie utlenienia: zielony → zielonkawy → przyciemniony → czysta miedź. Dopasuj trzy bloki do podpisanych próbek i dopiero wtedy użyj plastra miodu. Wosk blokuje dalsze skrobanie. Przesadzisz ze skrobaniem? Cofnij ruch.',stock:{iron_axe:1,honeycomb:3,copper_ingot:2,...decoys},blocks:[11,19,27],ages:[0,1,2]},
 {kind:'endgate',name:'Wejście do Endu',goal:'Uzupełnij oczy w ramie i wejdź do otwartego portalu.',tip:'Perła Endu i płomienny proszek dają oko Endera. Sześć oczu już jest na miejscu. Dodaj pozostałe tylko do pustych gniazd. Kiedy rama się uruchomi, dotknij środka portalu. Za portalem czeka dalsza część wyprawy.',stock:{ender_pearl:6,blaze_powder:6,lapis_lazuli:3,...decoys},outputs:['ender_eye'],frame:[2,3,4,9,13,17,21,25,29,34,35,36],filled:[2,4,17,21,34,36],inside:[10,11,12,18,19,20,26,27,28],center:19}
].map(l=>({...l,expedition:true,theme:l.kind}));
const row=i=>Math.floor(i/8),col=i=>i%8,adjacent=(a,b)=>Math.abs(row(a)-row(b))+Math.abs(col(a)-col(b))===1;
const copperTextures=['copper_block','exposed_copper','weathered_copper','oxidized_copper'];
const copperNames=['CZYSTA','CIEMNA','PATYNA'];
const noteNames=['DO','RE','MI','FA','SOL'];
export function expeditionTerrain(l,i,s){const p=s.puzzle;
 if(l.kind==='archaeology')return l.sites.includes(i)&&!(p.brushed?.[i]>=2)?((p.brushed?.[i]||0)===1?'suspicious_sand_1':'suspicious_sand_0'):'sand';
 if(l.kind==='treasure')return p.mapped&&l.path.includes(i)?'sandstone':'deepslate_tiles';
 if(l.kind==='copper'&&l.blocks.includes(i))return copperTextures[p.ages?.[i]??3];
 if(l.kind==='endgate'){if(l.frame.includes(i))return 'end_portal_frame_top';if(p.open&&l.inside.includes(i))return 'end_portal';return 'end_stone';}
 if(l.kind==='compost'){if((p.growth||0)>=1&&i===22)return 'oak_log';if((p.growth||0)>=2&&i===14||(p.growth||0)>=3&&[13,15].includes(i))return 'oak_leaves';return 'moss_block';}
 return l.kind==='wool'?'moss_block':'stone_bricks';
}
export function expeditionTile(l,i,s){const p=s.puzzle;let icon='',label='',mark=false,fx='',surface=false,template=false;
 if(l.kind==='pistons'){const pos=p.cargo??l.start;if(i===pos){icon='cobblestone';fx='cargo';}if(l.controls.includes(i)){mark=true;label=['→','↓','←'][l.controls.indexOf(i)];}if(i===l.end){label='META';if(!icon)icon='light_weighted_pressure_plate';}mark=mark||l.route.includes(i);}
 if(l.kind==='archaeology'){if(l.sites.includes(i)){mark=true;label=p.brushed?.[i]>=2?'ODKRYTE':`OCZYŚĆ ${p.brushed?.[i]||0}/2`;}if(i===l.pedestal){mark=true;label='DZBAN';}}
 if(l.kind==='wool'){if(l.sources.includes(i)){label=(p.sheared||[]).includes(i)?'OSTRZYŻONE':'RUNO';if(!(p.sheared||[]).includes(i))icon='white_wool';}if(l.targets.includes(i)){mark=true;icon=l.colors[l.targets.indexOf(i)];label=['CZERWONY','NIEBIESKI','ŻÓŁTY'][l.targets.indexOf(i)];}surface=l.targets.includes(i);}
 if(l.kind==='treasure'){if(i===l.start){icon='map';label=p.mapped?'START':'ODKRYJ MAPĘ';}if(i===l.end){icon='chest_minecart';label='SKARB';}if(p.mapped&&i===p.position){icon='diamond';fx='cargo';}mark=!!p.mapped&&l.path.includes(i);}
 if(l.kind==='birthday'&&i===l.table){mark=true;label=p.candle?(s.solved?'STO LAT!':'ZAPAL ŚWIECĘ'):'STÓŁ';if(p.candle)fx=s.solved?'lit':'candle';}
 if(l.kind==='compost'){if(i===l.bin){mark=true;label=`KOMPOST ${p.compost||0}/4`;}if(i===l.sapling){mark=true;label=`DĄB ${p.growth||0}/3`;}surface=i===l.bin;}
 if(l.kind==='smith'){if(i===l.table){icon=(p.forged||0)?'netherite_chestplate':'smithing_table_front';label=(p.forged||0)?'ZDOBIENIE':'ULEPSZENIE';if(s.solved)fx='beam';}for(const [field,text]of [['template','SZABLON'],['armor','ZBROJA'],['material','MATERIAŁ']])if(i===l[field]){mark=true;label=text;if(p.inputs?.[field])icon=p.inputs[field];}}
 if(l.kind==='melody'){if(l.notes.includes(i)){mark=true;label=s.placed[i]?noteNames[p.pitches?.[i]||0]:'BLOK';if(s.placed[i])fx='note';}if(i===l.switch){mark=true;label=s.solved?'OTWARTE':'SPRAWDŹ';if(!s.placed[i])icon='iron_door';}}
 if(l.kind==='copper'&&l.blocks.includes(i)){mark=true;label=`${copperNames[l.ages[l.blocks.indexOf(i)]]}${(p.waxed||[]).includes(i)?' ✓':''}`;if((p.waxed||[]).includes(i))fx='waxed';}
 if(l.kind==='endgate'){if(l.frame.includes(i)){mark=true;icon='ender_eye';template=!l.filled.includes(i)&&!(p.eyes||[]).includes(i);if(template)label='OKO';}if(i===l.center)label=p.open?'WEJDŹ':'PORTAL';}
 return {icon,label,mark,fx,surface,template};
}
export function expeditionRecipe(grid){
 const cells=grid.map((item,i)=>({item,x:i%3,y:Math.floor(i/3)})).filter(c=>c.item);if(!cells.length)return null;
 const minX=Math.min(...cells.map(c=>c.x)),minY=Math.min(...cells.map(c=>c.y));
 const shape=cells.map(c=>`${c.x-minX},${c.y-minY}:${c.item}`).sort().join('|');
 const shapes=[
  [['0,0:oak_planks','1,0:oak_planks','2,0:oak_planks','0,1:cobblestone','1,1:iron_ingot','2,1:cobblestone','0,2:cobblestone','1,2:redstone','2,2:cobblestone'],'piston'],
  [['0,0:feather','0,1:copper_ingot','0,2:stick'],'brush'],
  [['1,0:brick','0,1:brick','2,1:brick','1,2:brick'],'decorated_pot'],
  [['1,0:iron_ingot','0,1:iron_ingot'],'shears'],[['0,0:iron_ingot','1,1:iron_ingot'],'shears'],
  [['1,0:iron_ingot','0,1:iron_ingot','1,1:redstone','2,1:iron_ingot','1,2:iron_ingot'],'compass'],
  [['0,0:oak_slab','2,0:oak_slab','0,1:oak_slab','2,1:oak_slab','0,2:oak_slab','1,2:oak_slab','2,2:oak_slab'],'composter']
 ];
 if(shape==='0,0:oak_planks|1,0:oak_planks|2,0:oak_planks')return {item:'oak_slab',count:6};
 for(const [parts,item]of shapes)if([...parts].sort().join('|')===shape)return {item,count:1};
 if(grid[4]==='compass'&&grid.every((v,i)=>i===4||v==='paper'))return {item:'map',count:1};
 if(!grid[1]&&grid.every((item,index)=>index===1||item==='diamond'))return {item:'diamond_chestplate',count:1};
 if(grid.join('|')==='milk_bucket|milk_bucket|milk_bucket|sugar|egg|sugar|wheat|wheat|wheat')return {item:'cake',count:1,returns:{bucket:3}};
 if(cells.length===2){const ids=cells.map(c=>c.item);for(const color of ['red','blue','yellow'])if(ids.includes('white_wool')&&ids.includes(color+'_dye'))return {item:color+'_wool',count:1};if(ids.includes('ender_pearl')&&ids.includes('blaze_powder'))return {item:'ender_eye',count:1};}
 return null;
}
export function expeditionProgress(l,s){const p=s.puzzle;switch(l.kind){
 case 'pistons':return {current:l.route.indexOf(p.cargo??l.start),total:l.route.length-1,label:'przesunięcia ładunku'};
 case 'archaeology':return {current:l.sites.reduce((n,i)=>n+(p.brushed?.[i]||0),0)+(s.solved?1:0),total:9,label:'etapy odkrycia'};
 case 'wool':return {current:l.targets.filter((i,n)=>s.placed[i]===l.colors[n]).length,total:3,label:'gotowe kolory'};
 case 'treasure':return {current:p.mapped?l.path.indexOf(p.position):0,total:l.path.length-1,label:'kroki do skarbu'};
 case 'birthday':return {current:(s.placed[l.table]==='cake'?1:0)+(p.candle?1:0)+(s.solved?1:0),total:3,label:'przygotowania'};
 case 'compost':return {current:p.growth||0,total:3,label:'etapy wzrostu'};
 case 'smith':return {current:p.forged||0,total:2,label:'etapy kowalstwa'};
 case 'melody':return {current:l.notes.filter((i,n)=>s.placed[i]==='note_block'&&(p.pitches?.[i]||0)===l.tune[n]).length+(s.solved?1:0),total:5,label:'etapy melodii'};
 case 'copper':return {current:(p.waxed||[]).length,total:3,label:'zabezpieczone odcienie'};
 case 'endgate':return {current:(p.eyes||[]).length+(s.solved?1:0),total:7,label:'etapy finału'};
 }}
export function expeditionPlace(s,l,i,item){const p=s.puzzle,has=id=>(s.stock[id]||0)>0;
 const take=id=>{s.stock[id]--;s.used++;},give=(id,n=1)=>s.stock[id]=(s.stock[id]||0)+n;
 const place=id=>{if(s.placed[i]||!has(id))return false;take(id);s.placed[i]=id;return true;};let ok=false;
 if(l.kind==='pistons'){
  if(l.controls.includes(i)&&s.placed[i]==='piston'){
   const cargo=p.cargo??l.start,dir=l.directions[l.controls.indexOf(i)],next=cargo+dir;
   const aligned=dir===8?col(cargo)===col(i)&&row(cargo)>row(i):row(cargo)===row(i)&&(dir===1?cargo>i:cargo<i);
   if(aligned&&adjacent(cargo,next)&&l.route.includes(next)){p.cargo=next;ok=true;}
  }else if(l.controls.includes(i)&&item==='piston')ok=place(item);
  s.solved=(p.cargo??l.start)===l.end&&l.controls.every(j=>s.placed[j]==='piston');
 }else if(l.kind==='archaeology'){
  if(l.sites.includes(i)&&item==='brush'&&has(item)&&(p.brushed?.[i]||0)<2){(p.brushed||={})[i]=(p.brushed?.[i]||0)+1;if(p.brushed[i]===2)give('brick');ok=true;}
  if(i===l.pedestal&&item==='decorated_pot'&&l.sites.every(j=>p.brushed?.[j]===2)&&place(item)){ok=true;s.solved=true;}
 }else if(l.kind==='wool'){
  if(l.sources.includes(i)&&item==='shears'&&has(item)&&!(p.sheared||[]).includes(i)){(p.sheared||=[]).push(i);give('white_wool');ok=true;}
  if(l.targets.includes(i)&&item===l.colors[l.targets.indexOf(i)])ok=place(item);
  s.solved=l.targets.every((j,n)=>s.placed[j]===l.colors[n]);
 }else if(l.kind==='treasure'){
  if(i===l.start&&item==='map'&&has(item)&&!p.mapped){take(item);p.mapped=true;p.position=l.start;ok=true;}
  else if(p.mapped&&l.path.includes(i)&&adjacent(p.position,i)){p.position=i;ok=true;s.solved=i===l.end;}
 }else if(l.kind==='birthday'){
  if(i===l.table){if(item==='cake')ok=place(item);if(item==='candle'&&has(item)&&s.placed[i]==='cake'&&!p.candle){take(item);p.candle=true;ok=true;}if(item==='flint_and_steel'&&has(item)&&s.placed[i]==='cake'&&p.candle){ok=true;s.solved=true;}}
 }else if(l.kind==='compost'){
  if(i===l.bin&&s.placed[i]==='composter'){
   if((p.compost||0)===4){p.compost=0;give('bone_meal');ok=true;}
   else if(item==='wheat_seeds'&&has(item)){take(item);p.compost=(p.compost||0)+1;ok=true;}
  }else if(i===l.bin&&item==='composter')ok=place(item);
  if(i===l.sapling&&item==='oak_sapling')ok=place(item);
  if(i===l.sapling&&item==='bone_meal'&&has(item)&&s.placed[i]==='oak_sapling'&&(p.growth||0)<3){take(item);p.growth=(p.growth||0)+1;ok=true;s.solved=p.growth===3;}
 }else if(l.kind==='smith'){
  const upgrade=(p.forged||0)===0,expected={template:upgrade?'netherite_upgrade_smithing_template':'coast_armor_trim_smithing_template',armor:upgrade?'diamond_chestplate':'netherite_chestplate',material:upgrade?'netherite_ingot':'emerald'};
  for(const field of ['template','armor','material'])if(i===l[field]&&item===expected[field]&&has(item)&&!p.inputs?.[field]){take(item);(p.inputs||={})[field]=item;ok=true;}
  if(i===l.table&&Object.keys(expected).every(field=>p.inputs?.[field]===expected[field])){p.inputs={};p.forged=(p.forged||0)+1;give('netherite_chestplate');ok=true;s.solved=p.forged===2;}
 }else if(l.kind==='melody'){
  if(l.notes.includes(i)&&s.placed[i]==='note_block'){(p.pitches||={})[i]=((p.pitches?.[i]||0)+1)%5;ok=true;}
  else if(l.notes.includes(i)&&item==='note_block'&&place(item)){(p.pitches||={})[i]=0;ok=true;}
  if(i===l.switch&&s.placed[i]==='lever'){s.solved=l.notes.every((j,n)=>s.placed[j]==='note_block'&&(p.pitches?.[j]||0)===l.tune[n]);ok=s.solved;}
  else if(i===l.switch&&item==='lever')ok=place(item);
 }else if(l.kind==='copper'){
  if(l.blocks.includes(i)&&!(p.waxed||[]).includes(i)){
   const age=p.ages?.[i]??3;
   if(item==='iron_axe'&&has(item)&&age>0){(p.ages||={})[i]=age-1;ok=true;}
   if(item==='honeycomb'&&has(item)&&age===l.ages[l.blocks.indexOf(i)]){take(item);(p.waxed||=[]).push(i);ok=true;}
  }s.solved=(p.waxed||[]).length===3;
 }else if(l.kind==='endgate'){
  if(l.frame.includes(i)&&!l.filled.includes(i)&&!(p.eyes||[]).includes(i)&&item==='ender_eye'&&has(item)){take(item);(p.eyes||=[]).push(i);p.open=(p.eyes||[]).length===6;ok=true;}
  if(i===l.center&&p.open){ok=true;s.solved=true;}
 }
 if(ok){s.moves++;s.message=s.solved?'Wyzwanie ukończone!':'Dobrze! Kontynuuj.';}
 else s.message='To jeszcze nie ten układ lub etap. Próba niczego nie zużyła. Sprawdź wskazówkę lub cofnij ruch.';
 return true;
}
