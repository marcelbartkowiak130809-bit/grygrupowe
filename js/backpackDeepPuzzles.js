// Stages 31–50. Stations describe individual operations; dependencies join them into a puzzle.
export const step=(id,cell,label,icon,options={})=>({id,cell,label,icon,...options});
export const use=(item,count=1)=>({[item]:count});
export const carry=(start,finish,cells,gates={})=>({start,finish,cells,gates});
export const deep=(name,goal,tip,terrain,stock,steps,options={})=>({
 name,goal,tip,terrain,kind:'deep',theme:'deep',stock:{...stock,rotten_flesh:2,snowball:2},
 steps,...options,outputs:[...new Set([...steps.flatMap(station=>Object.keys(station.give||{})),...(options.outputs||[])])]
});

export const deepLevels=[
 deep('Kuźnia pod osuwiskiem','Wydobądź rudę, wytop ją i zrób wiadro, żeby opróżnić szyb.',
  'Kamienny kilof zbiera całe złoże. Piec ruszy po dostarczeniu rudy i węgla. Wiadro ułóż z trzech sztabek: dwie u góry po bokach i jedna niżej pośrodku.',
  'deepslate_tiles',{stone_pickaxe:1,coal:1,gravel:3},[
   step('ore',10,'ZŁOŻE','iron_ore',{tool:'stone_pickaxe',give:use('iron_ore',3)}),
   step('ore-in',18,'3 RUDY','iron_ore',{take:use('iron_ore',3)}),
   step('fuel',26,'PALIWO','coal',{take:use('coal')}),
   step('forge',19,'WYTOP','furnace_front',{after:['ore-in','fuel'],give:use('iron_ingot',3),doneIcon:'furnace_front_on'}),
   step('drain',22,'ODPOMPUJ','water_still',{take:use('bucket'),give:use('water_bucket'),doneIcon:'stone_bricks'}),
  ],{outputs:['bucket']}),
 deep('Stacja wśród uli','Uspokój pszczoły, zbierz miód i użyj wosku na znaku szlaku.',
  'Rozpal ognisko pod ulem. Pustą butelką odbierz miód, a nożycami plaster. Zabezpiecz odnowiony znak plastrem.',
  'moss_block',{campfire:1,glass_bottle:1,shears:1,iron_axe:1},[
   step('smoke',19,'OGNISKO','campfire',{take:use('campfire')}),
   step('honey',11,'MIÓD','beehive_front_honey',{after:['smoke'],take:use('glass_bottle'),give:use('honey_bottle')}),
   step('wax',12,'PLASTER','honeycomb',{after:['smoke'],tool:'shears',give:use('honeycomb')}),
   step('scrape',22,'OCZYŚĆ','weathered_copper',{tool:'iron_axe',doneIcon:'copper_block'}),
   step('seal',23,'NAŁÓŻ WOSK','copper_block',{after:['scrape'],take:use('honeycomb'),fx:'waxed'}),
  ]),
 deep('Wózek nad rozpadliną','Napraw przeprawę i przeprowadź wagonik do skrzyni.',
  'Deski zamkną pierwszą przerwę, a zasilany tor i pochodnia redstone otworzą drugi odcinek. Klikaj sąsiednie pola trasy, aby przesuwać wagonik.',
  'deepslate_tiles',{oak_planks:1,powered_rail:1,redstone_torch:1,rail:2},[
   step('plank',10,'PRZĘSŁO','oak_planks',{take:use('oak_planks')}),
   step('track',19,'TOR','powered_rail',{take:use('powered_rail')}),
   step('power',27,'ZASIL','redstone_torch',{after:['track'],take:use('redstone_torch')}),
  ],{route:carry(8,21,[8,9,10,11,19,20,21],{10:['plank'],19:['power']})}),
 deep('Archiwum spod piasku','Oczyść dwie próbki, dokończ dzban i ustaw go obok zapieczętowanej kroniki.',
  'Pędzel: pióro, miedź i patyk pionowo. Obie próbki zawierają po jednej cegle. Dzban: po jednej cegle z góry, dołu, lewej i prawej od środka craftingu.',
  'sandstone',{feather:1,copper_ingot:1,stick:1,brick:2,lapis_lazuli:1},[
   step('sand-a',10,'PIASEK','suspicious_sand_0',{tool:'brush',give:use('brick'),doneIcon:'sand'}),
   step('sand-b',26,'PIASEK','suspicious_sand_1',{tool:'brush',give:use('brick'),doneIcon:'sand'}),
   step('pot',20,'DZBAN','decorated_pot',{take:use('decorated_pot')}),
   step('seal',21,'PIECZĘĆ','lapis_lazuli',{after:['pot'],take:use('lapis_lazuli')}),
   step('book',22,'KRONIKA','book',{after:['seal'],doneIcon:'enchanted_book'}),
  ],{outputs:['brush','decorated_pot']}),
 deep('Sygnał z trzech barw','Przygotuj flagi i dopasuj barwy do oznaczeń nad trzema stanowiskami.',
  'Ufarbuj dwie białe wełny w craftingu, zachowaj jedną bez barwnika. Przy pulpicie sygnałowym liczy się komplet.',
  'oak_planks',{white_wool:3,red_dye:1,blue_dye:1,yellow_dye:1,lever:1},[
   step('red',10,'CZERWONA','red_wool',{take:use('red_wool')}),
   step('white',18,'BIAŁA','white_wool',{take:use('white_wool')}),
   step('blue',26,'NIEBIESKA','blue_wool',{take:use('blue_wool')}),
   step('signal',21,'ZASYGNALIZUJ','lever',{after:['red','white','blue'],tool:'lever',doneIcon:'redstone_lamp_on'}),
  ],{outputs:['red_wool','blue_wool']}),
 deep('Dwie bramy, jedno wiadro','Zabierz wodę z pierwszego zbiornika i użyj jej, żeby otworzyć drugi korytarz.',
  'Kilof usuwa głaz. Puste wiadro zabierze wodę znad bramy, a pełne schłodzi lawę poniżej. Wagonik musi pokonać oba przejścia.',
  'blackstone',{stone_pickaxe:1,bucket:1,sponge:1},[
   step('rock',12,'SKUJ GŁAZ','cobblestone',{tool:'stone_pickaxe',doneIcon:'cracked_stone_bricks'}),
   step('water',11,'NABIERZ','water_still',{after:['rock'],take:use('bucket'),give:use('water_bucket'),doneIcon:'stone'}),
   step('lava',27,'SCHŁÓDŹ','lava_still',{after:['water'],take:use('water_bucket'),give:use('bucket'),doneIcon:'obsidian'}),
  ],{route:carry(8,29,[8,9,10,11,19,27,28,29],{11:['water'],27:['lava']})}),
 deep('Warsztat detektywa','Złóż kompas, odszyfruj wskazówkę i oznacz skrytkę mapą.',
  'Otocz redstone czterema sztabkami w kształcie plusa. Papier leży w skrytce pod tablicą, którą można odczytać z kompasem. Osiem kartek wokół kompasu da mapę.',
  'stone_bricks',{redstone:1,iron_ingot:4,book:1,feather:2},[
   step('read',11,'TABLICA','compass',{tool:'compass'}),
   step('paper',19,'PAPIER','chest_minecart',{after:['read'],give:use('paper',8)}),
   step('map',21,'SKRYTKA','map',{take:use('map'),doneIcon:'emerald'}),
  ],{outputs:['compass','map']}),
 deep('Ogród za zaworem','Przywróć nawodnienie, obsiej dwie grządki i rozpocznij wzrost sadzonki.',
  'Ustaw dźwignię przed wlaniem wody. Na nawodnionych grządkach najpierw użyj motyki, potem nasion. Mączkę dostaniesz, gdy obie grządki będą gotowe.',
  'moss_block',{lever:1,water_bucket:1,wooden_hoe:1,wheat_seeds:2,oak_sapling:1},[
   step('valve',11,'ZAWÓR','lever',{take:use('lever')}),
   step('water',12,'NALEJ','water_still',{after:['valve'],take:use('water_bucket'),give:use('bucket')}),
   step('hoe-a',17,'SPULCHNIJ','dirt',{after:['water'],tool:'wooden_hoe',doneIcon:'farmland_moist'}),
   step('hoe-b',25,'SPULCHNIJ','dirt',{after:['water'],tool:'wooden_hoe',doneIcon:'farmland_moist'}),
   step('seed-a',18,'NASIONA','wheat_seeds',{after:['hoe-a'],take:use('wheat_seeds'),doneIcon:'wheat_stage3'}),
   step('seed-b',26,'NASIONA','wheat_seeds',{after:['hoe-b'],take:use('wheat_seeds'),doneIcon:'wheat_stage3'}),
   step('fertilizer',20,'NAWÓZ','composter',{after:['seed-a','seed-b'],give:use('bone_meal')}),
   step('plant',21,'SADZONKA','oak_sapling',{take:use('oak_sapling')}),
   step('grow',22,'NAWIEŹ','bone_meal',{after:['plant'],take:use('bone_meal'),doneIcon:'oak_leaves'}),
  ]),
 deep('Latarnia na odpływie','Osusz oba stanowiska i ułóż niebieski filtr dla latarni.',
  'Gąbka osuszy pierwszą zatokę. Włóż mokrą gąbkę do pieca i użyj jej ponownie. Filtr powstaje z ośmiu szyb otaczających błękitny barwnik.',
  'prismarine',{sponge:1,coal:1,glass:8,blue_dye:1},[
   step('bay',17,'ZATOKA','water_still',{take:use('sponge'),give:use('wet_sponge'),doneIcon:'prismarine'}),
   step('fuel',10,'PALIWO','coal',{take:use('coal')}),
   step('dry',11,'OSUSZ','furnace_front',{after:['fuel'],take:use('wet_sponge'),give:use('sponge'),doneIcon:'furnace_front_on'}),
   step('lock',21,'ŚLUZA','water_still',{after:['dry'],take:use('sponge'),doneIcon:'prismarine'}),
   step('light',22,'FILTR','beacon',{after:['lock'],take:use('blue_stained_glass'),fx:'beam'}),
  ],{outputs:['blue_stained_glass']}),
 deep('Sztandar na rozjeździe','Najpierw dostarcz wagonik do punktu kontroli, potem przestaw zwrotnicę i dotrzyj do mety.',
  'Żółtą wełną oznacz punkt kontroli. Wjedź wagonikiem na żółte pole, zawróć na rozwidlenie i udaj się do mety, gdy druga gałąź się otworzy.',
  'stone_bricks',{white_wool:1,yellow_dye:1,redstone:1},[
   step('flag',12,'SZTANDAR','yellow_wool',{take:use('yellow_wool')}),
   step('track',26,'ZWROTNICA','redstone',{at:11,take:use('redstone')}),
  ],{outputs:['yellow_wool'],route:carry(17,29,[17,18,19,11,27,28,29],{11:['flag'],27:['track']})}),
 deep('Piec w zimnym tunelu','Zasil piec, odzyskaj żelazo i napraw dwa punkty świetlne.',
  'Z jednego węgla zasilisz piec, drugi zachowaj na pochodnie. Połącz węgiel z patykiem. Pochodnię zainstaluj osobno na każdym z dwóch wsporników.',
  'deepslate_tiles',{iron_ore:2,coal:2,stick:1,redstone_torch:1},[
   step('fuel',9,'PALIWO','coal',{take:use('coal')}),
   step('ore',17,'2 RUDY','iron_ore',{take:use('iron_ore',2)}),
   step('forge',18,'WYTOP','furnace_front',{after:['ore','fuel'],give:use('iron_ingot',2)}),
   step('left',12,'WSPORNIK','iron_ingot',{take:use('iron_ingot')}),
   step('right',28,'WSPORNIK','iron_ingot',{take:use('iron_ingot')}),
   step('lamp-a',13,'POCHODNIA','torch',{after:['left'],take:use('torch'),fx:'lit'}),
   step('lamp-b',29,'POCHODNIA','torch',{after:['right'],take:use('torch'),fx:'lit'}),
  ],{outputs:['torch']}),
 deep('Dwa odczynniki','Przygotuj wywar, znajdź złote składniki i dokończ miksturę.',
  'Najpierw wlej bazę, dodaj płomienny proszek i brodawkę. Złote samorodki są w zamkniętym magazynie. Owiń plaster arbuza ośmioma samorodkami w craftingu.',
  'netherrack',{potion:1,blaze_powder:1,nether_wart:1,melon_slice:1},[
   step('potion',10,'BAZA','potion',{take:use('potion')}),
   step('fuel',18,'PROSZEK','blaze_powder',{take:use('blaze_powder')}),
   step('brew',19,'WARZ','brewing_stand',{after:['potion','fuel'],take:use('nether_wart')}),
   step('gold',21,'ZŁOTO','chest_minecart',{after:['brew'],give:use('gold_nugget',8)}),
   step('finish',27,'ZŁOTY ARBUZ','glistering_melon_slice',{after:['brew'],take:use('glistering_melon_slice'),doneIcon:'potion'}),
  ],{outputs:['glistering_melon_slice']}),
 deep('Trzy przełączniki powrotu','Zbuduj panel. A i C mają być wyłączone, a B ma mieć przeciwne ustawienie.',
  'Zamontuj trzy dźwignie. Każdy montaż zaczyna od OFF. Kolejne kliknięcie przestawia przełącznik. Gdy ustawienie pasuje, kliknij lampę kontrolną.',
  'stone_bricks',{lever:2,stick:1,cobblestone:1,redstone:2},[
   step('feed',20,'DOPROWADŹ','redstone',{take:use('redstone',2)}),
   step('check',22,'SPRAWDŹ','redstone_lamp',{after:['feed'],pattern:[false,true,false],doneIcon:'redstone_lamp_on'}),
  ],{outputs:['lever'],switches:[10,18,26]}),
 deep('Szyb po dwóch stronach','Odblokuj pierwszy szlaban, zabierz ładunek z bocznicy i wywieź go drugą rampą.',
  'Do naprawy użyj tłoka. Bocznica zawiera zasilanie do drugiej rampy, ale odbierzesz je dopiero, gdy wagonik dojedzie do końca bocznicy.',
  'deepslate_tiles',{piston:1,powered_rail:1},[
   step('piston',10,'NAPRAW','piston',{take:use('piston')}),
   step('power',13,'ODBIERZ','chest_minecart',{at:12,give:use('redstone_torch')}),
   step('rail',28,'TOR','powered_rail',{take:use('powered_rail')}),
   step('ramp',29,'ZASIL','redstone_torch',{after:['rail'],take:use('redstone_torch')}),
  ],{route:carry(17,30,[17,18,19,11,12,27,28,29,30],{19:['piston'],28:['ramp']})}),
 deep('Próba dwóch narzędzi','Oczyść znalezisko i wydobądź klejnot za pieczęcią, żeby naprawić gablotę.',
  'Pędzel odsłoni naczynie, ale do pieczęci potrzebujesz żelaznego kilofa. Złóż go z trzech żelaznych sztabek i dwóch patyków. Po zebraniu klejnotu osadź go obok dzbana.',
  'sandstone',{brush:1,iron_ingot:3,stick:2,glass:1,stone_pickaxe:1},[
   step('brush',10,'OCZYŚĆ','suspicious_sand_1',{tool:'brush',give:use('decorated_pot'),doneIcon:'sand'}),
   step('display',19,'DZBAN','decorated_pot',{take:use('decorated_pot')}),
   step('seal',21,'PIECZĘĆ','cracked_stone_bricks',{after:['display'],tool:'iron_pickaxe'}),
   step('gem',22,'KLEJNOT','diamond_ore',{after:['seal'],tool:'iron_pickaxe',give:use('diamond'),doneIcon:'deepslate_tiles'}),
   step('mount',27,'OPRAWA','diamond',{take:use('diamond')}),
   step('glass',28,'GABLOTA','glass',{after:['mount'],take:use('glass'),fx:'beam'}),
  ],{outputs:['iron_pickaxe']}),
 deep('Wrota za kanałem','Zabezpiecz kanał i uruchom obwód otwierający wrota.',
  'Zacznij od schłodzenia lawy. Użyj pustego wiadra po drugiej stronie zaworu. Przed sprawdzeniem wrót dołóż oba odcinki redstone. Ustaw A włączone, B wyłączone i C włączone.',
  'blackstone',{water_bucket:1,redstone:2,lever:3},[
   step('cool',9,'SCHŁÓDŹ','lava_still',{take:use('water_bucket'),give:use('bucket'),doneIcon:'obsidian'}),
   step('drain',10,'ODPOMPUJ','water_still',{after:['cool'],take:use('bucket'),doneIcon:'stone'}),
   step('wire-a',20,'PRZEWÓD','redstone',{after:['drain'],take:use('redstone')}),
   step('wire-b',21,'PRZEWÓD','redstone',{after:['drain'],take:use('redstone')}),
   step('open',22,'WROTA','iron_door',{after:['wire-a','wire-b'],pattern:[true,false,true],doneIcon:'redstone_lamp_on'}),
  ],{switches:[11,19,27]}),
 deep('Polana z dwiema dostawami','Przygotuj tablicę barw, przenieś wózek za rozwidlenie i dostarcz sadzonkę.',
  'Czerwona tablica otwiera północną odnogę. Z niej odbierzesz mączkę. Posadź dąb za rozwidleniem, nawóz odblokuje ostatni przejazd.',
  'moss_block',{white_wool:1,red_dye:1,oak_sapling:1},[
   step('flag',12,'TABLICA','red_wool',{take:use('red_wool')}),
   step('soil',13,'ODBIERZ','composter',{at:11,give:use('bone_meal')}),
   step('tree',25,'POSADŹ','oak_sapling',{take:use('oak_sapling')}),
   step('grow',26,'NAWIEŹ','bone_meal',{after:['tree'],take:use('bone_meal'),doneIcon:'oak_leaves'}),
  ],{outputs:['red_wool'],route:carry(16,30,[16,17,18,19,11,27,28,29,30],{11:['flag'],28:['grow']})}),
 deep('Znaki po wielkiej burzy','Odnów trzy znaki w różnych odcieniach i dodaj lampę w porcie.',
  'Lewy znak ma zostać zielony, środkowy wymaga jednego skrobania, prawy dwóch. Dopiero potem użyj wosku. Ostatnie stanowisko wymaga pochodni i kompletu znaków.',
  'prismarine',{iron_axe:1,honeycomb:3,coal:1,stick:1},[
   step('left',9,'ZIELONY','oxidized_copper',{take:use('honeycomb'),fx:'waxed'}),
   step('mid-a',17,'ZESKROB','oxidized_copper',{tool:'iron_axe',doneIcon:'weathered_copper'}),
   step('mid-b',18,'WOSK','weathered_copper',{after:['mid-a'],take:use('honeycomb'),fx:'waxed'}),
   step('right-a',25,'ZESKROB','oxidized_copper',{tool:'iron_axe',doneIcon:'weathered_copper'}),
   step('right-b',26,'ZESKROB','weathered_copper',{after:['right-a'],tool:'iron_axe',doneIcon:'exposed_copper'}),
   step('right-c',27,'WOSK','exposed_copper',{after:['right-b'],take:use('honeycomb'),fx:'waxed'}),
   step('light',22,'LATARNIA','torch',{after:['left','mid-b','right-c'],take:use('torch'),fx:'lit'}),
  ],{outputs:['torch']}),
 deep('Echo po drugiej stronie','Otwórz warsztat właściwym sygnałem, odbierz nagrodę i dowieź ją wagonikiem.',
  'Włącz dwa sąsiednie przełączniki, zaczynając od A. Sprawdź pulpit, a potem wjedź na bocznicę po klejnot potrzebny do uruchomienia bariery.',
  'deepslate_tiles',{lever:3,iron_pickaxe:1},[
   step('panel',13,'SPRAWDŹ','redstone_lamp',{pattern:[true,true,false],doneIcon:'redstone_lamp_on'}),
   step('loot',12,'KLEJNOT','diamond_ore',{after:['panel'],at:11,tool:'iron_pickaxe',give:use('diamond')}),
   step('exit',22,'BARIERA','diamond',{take:use('diamond'),doneIcon:'light_weighted_pressure_plate'}),
  ],{switches:[2,3,4],route:carry(16,29,[16,17,18,19,11,27,28,29],{11:['panel'],29:['exit']})}),
 deep('Droga do portalu powrotnego','Odzyskaj dwie perły, uruchom ramę i doprowadź wagonik do portalu.',
  'Zasil skrytkę. Na panelu włącz C, ustaw B tak samo jak C, a A przeciwnie. Dojedź na bocznicę po drugą perłę. Z każdej perły i płomiennego proszku zrób oko. Uzupełnij dwa gniazda, otwórz portal i wjedź do środka.',
  'end_stone',{lever:3,blaze_powder:2,redstone:2},[
   step('power',12,'ZASIL','redstone',{take:use('redstone',2)}),
   step('stash',13,'SKRYTKA','chest_minecart',{after:['power'],pattern:[false,true,true],give:use('ender_pearl')}),
   step('cargo',10,'SKRZYNIA','chest_minecart',{at:11,give:use('ender_pearl')}),
   step('eye-a',21,'OKO','end_portal_frame_top',{take:use('ender_eye'),doneIcon:'ender_eye'}),
   step('eye-b',29,'OKO','end_portal_frame_top',{take:use('ender_eye'),doneIcon:'ender_eye'}),
   step('portal',22,'OTWÓRZ','end_portal_frame_top',{after:['eye-a','eye-b'],doneIcon:'end_portal',fx:'beam'}),
  ],{outputs:['ender_eye'],switches:[2,3,4],route:carry(16,30,[16,17,18,19,11,27,28,29,30],{11:['stash'],30:['portal']})}),
];

const done=(state,id)=>Boolean(state.puzzle.stations?.[id]);
const position=(level,state)=>state.puzzle.cart??level.route?.start;
const matchesSignal=(pattern,state)=>pattern.every((on,i)=>state.puzzle.switches?.[i]===on);
const ready=(station,state)=>!done(state,station.id)&&
 (station.after||[]).every(id=>done(state,id))&&
 (station.at===undefined||state.puzzle.cart===station.at)&&
 (!station.pattern||matchesSignal(station.pattern,state));
const adjacent=(a,b)=>Math.abs(a%8-b%8)+Math.abs(Math.floor(a/8)-Math.floor(b/8))===1;
export const isDeepRouteOpen=(level,state,index)=>(level.route?.gates[index]||[]).every(id=>done(state,id))&&
 (!level.route?.signals?.[index]||matchesSignal(level.route.signals[index],state));
const isOpen=isDeepRouteOpen;
const moving=(level,state,index)=>level.route?.cells.includes(index)&&isOpen(level,state,index)&&adjacent(position(level,state),index);

export function deepTile(level,index,state){
 const station=level.steps.find(entry=>entry.cell===index);
 const switchIndex=level.switches?.indexOf(index)??-1;
 const path=level.route?.cells.includes(index);
 const cart=path&&position(level,state)===index;
 const blocked=path&&!isOpen(level,state,index);
 const stop=path&&level.steps.some(entry=>entry.at===index);
 const signal=level.route?.signals?.[index];
 if(switchIndex>=0){
  const power=state.puzzle.switches?.[switchIndex];
  return {mark:true,icon:'lever',template:power===undefined,label:`${'ABC'[switchIndex]} · ${power===undefined?'MONTAŻ':power?'ON':'OFF'}`};
 }
 const finished=station&&done(state,station.id);
 return {
  mark:Boolean(station||path),
  icon:cart?'minecart':station?(finished&&station.doneIcon||station.icon):index===level.route?.finish?'light_weighted_pressure_plate':path?'rail':'',
  template:!cart&&!finished&&Boolean(station?.take?.[station.icon]),
  label:station?`${station.label}${finished?' ✓':''}`:signal?`${signal.map((on,i)=>on?'ABC'[i]:'–').join(' ')}`:blocked?'BLOKADA':stop?'BOCZNICA':cart?'WAGONIK':index===level.route?.finish?'META':'',
  fx:cart?'cargo':finished?(station.fx==='lit'?'deep-lit':station.fx||'deep-done'):station&&ready(station,state)?'deep-ready':blocked?'deep-closed':stop?'deep-stop':path?'deep-path':'',
 };
}

export function deepProgress(level,state){
 const installed=level.switches?.filter((_,i)=>state.puzzle.switches?.[i]!==undefined).length||0;
 const delivered=level.route&&position(level,state)===level.route.finish?1:0;
 return {
  current:level.steps.filter(station=>done(state,station.id)).length+installed+delivered,
  total:level.steps.length+(level.switches?.length||0)+Number(Boolean(level.route)),
  label:'elementy zagadki',
 };
}

export function deepPlace(state,level,index,item){
 const station=level.steps.find(entry=>entry.cell===index);
 const switchIndex=level.switches?.indexOf(index)??-1;
 let message;
 if(switchIndex>=0&&state.puzzle.switches?.[switchIndex]!==undefined){
  state.puzzle.switches[switchIndex]=!state.puzzle.switches[switchIndex];
  message='Przestawiono dźwignię.';
 }else if(switchIndex>=0&&item==='lever'&&state.stock.lever>0){
  state.stock.lever--;state.used++;
  (state.puzzle.switches||={})[switchIndex]=false;
  message='Dźwignia zamontowana.';
 }else if(station&&ready(station,state)&&(!station.tool||item===station.tool&&state.stock[item]>0)){
  const cost=Object.entries(station.take||{});
  if(!cost.length||(Object.hasOwn(station.take,item)&&cost.every(([id,count])=>state.stock[id]>=count))){
   for(const [id,count]of cost){state.stock[id]-=count;state.used+=count;}
   for(const [id,count]of Object.entries(station.give||{}))state.stock[id]=(state.stock[id]||0)+count;
   (state.puzzle.stations||={})[station.id]=true;
   message=`${station.label} — gotowe.`;
  }
 }
 if(!message&&moving(level,state,index)){
  state.puzzle.cart=index;
  message='Wagonik przesunięty.';
 }
 if(!message){
  const signal=level.route?.signals?.[index];
  if(signal&&!matchesSignal(signal,state))state.message='Zablokowany tor. Ustaw dźwignie zgodnie z literami na polu.';
  else if(station?.pattern)state.message='Pulpit nie odpowiada. Sprawdź zasilanie i ustawienie wszystkich dźwigni.';
  else if(station)state.message='Sprawdź potrzebny przedmiot lub wcześniejszy etap we wskazówce.';
  else state.message=level.route?'Wagonik jedzie na sąsiednie, odblokowane pole toru.':'Kliknij oznaczone stanowisko.';
  return true;
 }
 const progress=deepProgress(level,state);
 state.moves++;
 state.solved=progress.current===progress.total;
 state.message=state.solved?'Wyzwanie ukończone!':message;
 return true;
}
