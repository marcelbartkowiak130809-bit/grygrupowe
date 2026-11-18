// One persistent, 160-column world. Scenery is authored, never regenerated on travel.
export const JOURNEY_WIDTH=16,JOURNEY_HEIGHT=9;
export const journeyItems={oak_log:'Drewno dębowe',oak_planks:'Deski',stick:'Patyk',porkchop:'Surowy schab',cooked_porkchop:'Pieczony schab',sweet_berries:'Jagody',cobblestone:'Bruk',coal:'Węgiel',torch:'Pochodnia',wooden_pickaxe:'Drewniany kilof',stone_pickaxe:'Kamienny kilof',iron_pickaxe:'Żelazny kilof',iron_ore:'Ruda żelaza',iron_ingot:'Sztabka żelaza',furnace:'Piec',wheat:'Pszenica',bread:'Chleb',map:'Mapa',redstone:'Redstone',lever:'Dźwignia'};
const node=(id,type,x,y=5,extra={})=>({id,type,x,y,...extra});
export const journeyScenes=[
 {id:'clearing',name:'Polana na dzień dobry',region:'LAS',goal:'Zabierz leżący pień i zdobądź jedzenie na drogę.',hint:'Kliknij leżący pień i świnię. Jedzenie możesz zachować na później. Rozejrzyj się też po krzakach i skrzynce.',biome:'meadow',nodes:[node('first-log','log',4,5,{amount:1}),node('pig','pig',9,5,{amount:3,hits:2}),node('berries','berries',12,5,{amount:2,optional:true}),node('starter-cache','chest',2,5,{loot:{stick:2},optional:true})],trees:[1,6,13],exit:14},
 {id:'river',name:'Dwa brzegi, jedna kłoda',region:'RZEKA',goal:'Zbuduj przejście i kliknij drugi brzeg.',hint:'Drewno w craftingu daje 4 deski. Uzupełnij przerwę na wysokości brzegu. Most musi być ciągły; Steve nie przeleci nad pustym polem.',biome:'river',gap:[8,9,10,11],build:true,nodes:[node('river-log','log',3,5,{amount:1,optional:true})],trees:[1,14],exit:14},
 {id:'camp',name:'Czyjś ostatni obóz',region:'OBOZOWISKO',goal:'Rozpal piec i upiecz przynajmniej jeden schab.',hint:'Wybierz drewno, deski lub węgiel i kliknij piec, by dodać paliwo. Potem wybierz surowy schab i kliknij piec. Nadmiar paliwa zostaje w tym piecu.',biome:'camp',nodes:[node('camp-log','log',3,5,{amount:2}),node('camp-stove','stove',10),node('camp-cache','chest',13,5,{loot:{coal:2},optional:true})],trees:[1,5,14],exit:14},
 {id:'quarry',name:'Pierwszy porządny kilof',region:'KAMIENIOŁOM',goal:'Wydobądź kamień i zrób kamienny kilof.',hint:'Deska nad deską daje 4 patyki. Kilof: 3 materiały w górnym rzędzie i 2 patyki pod środkiem. Kamień wydobędziesz drewnianym kilofem. Zapas bruku przyda się dalej.',biome:'quarry',nodes:[node('quarry-log','log',2,5,{amount:2}),node('quarry-stone','stone',9,5,{amount:3}),node('quarry-extra','stone',12,5,{amount:4,optional:true})],trees:[1],exit:14},
 {id:'mine',name:'Światło pod górą',region:'KOPALNIA',goal:'Oświetl tunel i wydobądź 3 rudy żelaza.',hint:'Węgiel nad patykiem daje 4 pochodnie. Do kopalni wystarczą dwie: po jednej w każdej złotej kratce. Żelazo wydobędziesz kamiennym kilofem po oświetleniu złoża.',biome:'cave',lights:[7,13],nodes:[node('mine-coal','coal',4,5,{amount:2}),node('mine-iron','iron',12,5,{amount:3}),node('mine-cache','chest',14,5,{loot:{coal:2,bread:1},optional:true})],exit:14},
 {id:'forge',name:'Kuźnia przy strumieniu',region:'KUŹNIA',goal:'Postaw piec, wytop żelazo i zrób żelazny kilof.',hint:'8 bloków bruku wokół pustego środka daje piec. Ustaw go na kamiennym palenisku, dodaj paliwo i przetapiaj rudy. Węgiel daje 8 jednostek ciepła, drewno 2, deska 1.',biome:'forge',nodes:[node('forge-log','log',2,5,{amount:2}),node('forge-stone','stone',4,5,{amount:8}),node('forge-coal','coal',6,5,{amount:1,optional:true}),node('hearth','hearth',10)],exit:14},
 {id:'village',name:'Wioska, która pamięta Alex',region:'WIOSKA',goal:'Odsłoń zasypaną skrzynię i znajdź mapę.',hint:'Żelazny kilof poradzi sobie z głazem na studni. Pod nim jest skrzynia. Nie wszystkie domy są puste — dodatkowe zapasy możesz zabrać na dalszą drogę.',biome:'village',nodes:[node('well','well',8,5,{amount:1}),node('village-cache','chest',3,5,{loot:{oak_log:2,coal:1},optional:true}),node('pantry','chest',12,5,{loot:{wheat:3,bread:1},optional:true})],exit:14},
 {id:'ridge',name:'Schody nad przepaścią',region:'PRZEŁĘCZ',goal:'Zbuduj podparte schody i przejdź na górną półkę.',hint:'Steve może wejść o jeden blok wyżej na każdym kroku. Bloki nie mogą wisieć w powietrzu. Najpierw fundament, potem stopnie. Bruk i deski możesz mieszać.',biome:'ridge',build:true,nodes:[node('ridge-stone','stone',3,5,{amount:6}),node('ridge-cache','chest',1,5,{loot:{oak_log:1},optional:true})],exit:14},
 {id:'gate',name:'Brama na końcu szlaku',region:'REDSTONE',goal:'Połącz obwód, włącz bramę i przejdź dalej.',hint:'Redstone wydobędziesz żelaznym kilofem. Patyk nad brukiem daje dźwignię. Połącz brakujące odcinki i kliknij zamontowaną dźwignię.',biome:'gate',wires:[8,9,10,11],switch:7,nodes:[node('gate-redstone','redstone',4,5,{amount:4}),node('gate-log','log',2,5,{amount:1}),node('gate-stone','stone',3,5,{amount:1})],exit:14},
 {id:'alex',name:'Światło w oknie',region:'DOM ALEX',goal:'Zapal światło przy domu i przywitaj się z Alex.',hint:'Postaw pochodnię na słupku obok domu. Jeśli zabrakło materiałów, zajrzyj do przydomowej skrzynki i zbierz pień. Potem kliknij Alex.',biome:'sunset',nodes:[node('home-log','log',3,5,{amount:1}),node('home-cache','chest',5,5,{loot:{coal:1},optional:true}),node('lantern','lantern',10,4),node('alex','alex',12,5)],trees:[1,7],exit:14}
];
// Keep the original route available for action-log saves made before the rebalance.
// Fresh expeditions use a smaller stock and two environmental mechanisms.
export function journeyScene(s,index=s.scene){
 const original=journeyScenes[index];if(s.rulesVersion!==2)return original;
 const omit={river:['river-log'],forge:['forge-log'],gate:['gate-log'],ridge:['ridge-cache']}[original.id]||[];
 let nodes=original.nodes.filter(n=>!omit.includes(n.id)).map(n=>{
  if(n.id==='camp-log')return {...n,amount:1};
  if(n.id==='village-cache')return {...n,loot:{coal:1,bread:1}};
  return n;
 });
 if(original.id==='river')return {...original,nodes:[...nodes,node('bridge-prop','prop',7)],goal:'Zwolnij podpartą kłodę, uzupełnij most i przejdź przez rzekę.',hint:'Kliknij patyk pod kłodą: pień opadnie na dwa pola rzeki. Pozostałe dwa uzupełnij deskami z craftingu. Potem kliknij strzałkę na drugim brzegu.'};
 if(original.id==='village')return {...original,nodes:[...nodes,node('well-weight','stone',5,5,{amount:1}),node('well-pulley','pulley',7,4)],goal:'Obciąż linę, podnieś pokrywę studni i znajdź mapę.',hint:'Wydobądź kamień obok studni. Wybierz bruk z plecaka i kliknij mechanizm na linie: przeciwwaga podniesie pokrywę. Wtedy zajrzyj do studni.'};
 return {...original,nodes};
}
export function baseJourneyTerrain(scene,x,y){
 if(scene.biome==='ridge')return y>=(x<8?6:x<=10?7:4)?(y===(x<8?6:x<=10?7:4)?'stone':'deepslate_tiles'):'';
 if(scene.gap?.includes(x))return y>=7?'water_still':'';
 if(scene.biome==='cave')return y===0||y>=6?'deepslate_tiles':'';
 if(y<6)return '';
 return y===6?(['quarry','forge','gate'].includes(scene.biome)?'stone':'grass_block_side'):['quarry','forge','gate'].includes(scene.biome)?'stone':'dirt';
}
export const journeyRecipes=[
 {id:'oak_planks',label:'Deski',slots:[[0,'oak_log']],count:4},
 {id:'stick',label:'Patyki',slots:[[0,'oak_planks'],[3,'oak_planks']],count:4},
 ...['oak_planks','cobblestone','iron_ingot'].map((id,i)=>({id:['wooden_pickaxe','stone_pickaxe','iron_pickaxe'][i],label:['Drewniany kilof','Kamienny kilof','Żelazny kilof'][i],slots:[[0,id],[1,id],[2,id],[4,'stick'],[7,'stick']],count:1})),
 {id:'torch',label:'Pochodnie',slots:[[0,'coal'],[3,'stick']],count:4},
 {id:'furnace',label:'Piec',slots:[0,1,2,3,5,6,7,8].map(i=>[i,'cobblestone']),count:1},
 {id:'lever',label:'Dźwignia',slots:[[0,'stick'],[3,'cobblestone']],count:1},
 {id:'bread',label:'Chleb',slots:[[0,'wheat'],[1,'wheat'],[2,'wheat']],count:1}
];
