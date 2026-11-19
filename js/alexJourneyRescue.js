const node=(id,x,label,texture,options={})=>({id,x,label,texture,y:5,...options});

export const rescueItems={
 shears:'Nożyce',white_wool:'Biała wełna',stone_pickaxe:'Kamienny kilof',torch:'Pochodnia',stick:'Patyk',
 iron_ore:'Ruda żelaza',coal:'Węgiel',iron_ingot:'Sztabka żelaza',iron_sword:'Żelazny miecz',
 bell:'Dzwon',chain:'Łańcuch',tripwire_hook:'Klucz do celi',
};

const armoryLoot={stone_pickaxe:1,torch:1,stick:1};
// Used only to replay moves saved before the tripwire puzzle.
const legacyArmory=[
 node('shutter',3,'',''),
 node('wool',6,'','',{give:{white_wool:1}}),
 node('guard',9,'','',{repeat:true,hero:7}),
 node('floor',12,'','',{need:'white_wool',take:{white_wool:1}}),
 node('locker',12,'','',{after:['shutter','floor'],startle:true,give:armoryLoot}),
];

export const rescueScenes=[
 {
  name:'Ten sam dom, inna noc',region:'DOM ALEX',biome:'home',
  goal:'Zbadaj ślady przy drzwiach.',
  clue:'Ślady zaczynają się przy wyłamanych drzwiach i prowadzą w prawo.',
  hint:'Kliknij ślady na prawo od domu. Wskażą, dokąd zabrano Alex.',
  finish:'trail',
  nodes:[
   node('embrace',12,'Podejdź do Alex','alex',{character:true,hero:10.8,message:'Zombie porwały Alex! Przy drzwiach zostały ślady.',effect:'walk'}),
   node('trail',14,'Zbadaj ślady','rotten_flesh',{after:['embrace'],reveal:true,hero:13,message:'Ślady prowadzą przez wieś w stronę starej kopalni.'}),
  ],
 },{
  name:'Zbrojownia na palcach',region:'WIOSKA',biome:'armory',
  goal:'Rozbrój alarm przy skrzyni i zabierz zapasy po cichu.',
  clue:'Podniesienie wieka pociągnie za linkę dzwonu.',
  hint:'Weź nożyce z lewej ściany, wybierz je w plecaku i przetnij linkę między skrzynią a dzwonem. Potem otwórz skrzynię.',
  finish:'locker',
  nodes:[
   node('shears',3,'Zdejmij nożyce ze ściany','shears',{y:4,give:{shears:1},message:'Masz nożyce. Zobacz, co łączy dzwon ze skrzynią.'}),
   node('guard',7.8,'Śpiący strażnik','villager',{character:true,repeat:true}),
   node('tripwire',10.8,'Przetnij linkę alarmu','tripwire_hook',{y:4.15,need:'shears',hero:10.3,message:'Linka przecięta. Dzwon już nie zabrzmi.'}),
   node('locker',13,'Otwórz skrzynię z wyposażeniem','rescue_chest',{after:['tripwire'],doneTexture:'rescue_chest_open',give:armoryLoot,message:'Masz kilof, pochodnię i patyk. Strażnik dalej śpi.'}),
  ],
 },{
  name:'Kopalnia z zablokowanym torem',region:'KOPALNIA',biome:'mine',
  goal:'Zbierz zapasy do kuźni i sprawdź znak na ścianie.',
  clue:'Wagonik zastawia dojście do złóż. W ciemności trudno zobaczyć, co trzyma jego koło.',
  hint:'Zawieś pochodnię na drewnianej podporze. Wyjmij klin spod koła i odsuń wagonik w lewo. Zbierz kilofem obie rudy i odczytaj znak.',
  finish:'marks',
  requires:['ore','coal'],
  nodes:[
   node('lamp',4,'Zawieś pochodnię na podporze','tripwire_hook',{y:3.75,width:1,height:1,need:'torch',take:{torch:1},doneTexture:'torch',effect:'light',message:'Światło odsłoniło klin blokujący koło.'}),
   node('chock',8.7,'Wyciągnij klin spod koła','rescue_chock',{y:5.43,width:.64,height:.4,after:['lamp'],message:'Klin wyjęty. Koła są wolne.'}),
   node('cart',7.8,'Odsuń wagonik od złóż','rescue_minecart_side',{y:4.89,width:1.2,height:.95,after:['chock'],doneX:5.1,effect:'roll',message:'Wagonik odsunięty. Podejście do złóż jest wolne.'}),
   node('ore',10,'Wydobądź dwie rudy żelaza','rescue_deepslate_iron_ore',{width:1,height:1,wallTile:true,after:['cart'],need:'stone_pickaxe',give:{iron_ore:2},effect:'strike',message:'Zebrano dwie rudy żelaza.'}),
   node('coal',11,'Wydobądź węgiel','rescue_deepslate_coal_ore',{y:4,width:1,height:1,wallTile:true,after:['cart'],need:'stone_pickaxe',give:{coal:1},effect:'strike',message:'Masz węgiel na opał.'}),
   node('marks',14,'Obejrzyj wyrytą strzałkę','cracked_stone_bricks',{y:3,width:1,height:1,wallTile:true,message:'Strzałka Alex wskazuje podziemną kuźnię.'}),
  ],
 },{
  name:'Żelazo ze starego pieca',region:'KUŹNIA',biome:'forge',
  goal:'Rozpal piec, wytop żelazo i wykonaj miecz.',
  clue:'Palenisko jest na dole pieca, otwór na rudę na górze. Stół pokazuje kształt ostrza i rękojeści.',
  hint:'Rozgrzej piec węglem od dołu, a od góry dodaj rudę. Ułóż przy stole dwie sztabki nad patykiem i odbierz miecz.',
  finish:'sword',
  nodes:[
   node('fuel',6,'Dolny otwór pieca · opał','coal',{y:5,width:1,height:1,need:'coal',take:{coal:1},doneTexture:'furnace_front_on',effect:'light',message:'Piec rozgrzany. Górny otwór przyjmie rudę.'}),
   node('smelt',6,'Górny otwór pieca · przetop rudę','iron_ore',{y:4,width:1,height:1,after:['fuel'],need:'iron_ore',take:{iron_ore:2},give:{iron_ingot:2},doneTexture:'iron_ingot',effect:'light',message:'Dwie sztabki są w plecaku. Połącz je z patykiem na stole.'}),
   node('bladeTop',11,'Górna część ostrza · sztabka żelaza','iron_ingot',{y:2,width:1,height:1,slot:true,need:'iron_ingot',take:{iron_ingot:1},message:'Pierwsza część ostrza osadzona.'}),
   node('bladeBottom',11,'Dolna część ostrza · sztabka żelaza','iron_ingot',{y:3,width:1,height:1,slot:true,need:'iron_ingot',take:{iron_ingot:1},message:'Druga część ostrza osadzona.'}),
   node('hilt',11,'Rękojeść · patyk','stick',{y:4,width:1,height:1,slot:true,need:'stick',take:{stick:1},message:'Rękojeść na miejscu.'}),
   node('sword',13,'Odbierz miecz','iron_sword',{y:3,width:1,height:1,slot:true,after:['bladeTop','bladeBottom','hilt'],give:{iron_sword:1},effect:'strike',message:'Żelazny miecz gotowy. Z jaskini dobiega pomruk.'}),
  ],
 },{
  name:'Echo przy śluzie',region:'JASKINIA ZOMBIE',biome:'sluice',
  goal:'Zwab grupę zombie w boczny kanał i rozpraw się z nią za pomocą śluzy.',
  clue:'Dźwignia nie poruszy zasuwą bez łańcucha. Pusta rama stoi nad kanałem.',
  hint:'Weź dzwon i łańcuch ze skrzyni. Połącz zerwany napęd łańcuchem i zawieś dzwon nad kanałem. Kiedy zombie podejdą pod dzwon, użyj dźwigni.',
  finish:'flood',
  nodes:[
   node('gear',2,'Skrzynia serwisowa · dzwon i łańcuch','rescue_chest',{width:1,height:1,doneTexture:'rescue_chest_open',give:{chain:1,bell:1},message:'Ze skrzyni zabrano łańcuch i dzwon.'}),
   node('repair',5,'Połącz zerwany napęd łańcuchem','chain',{y:3.65,width:1,height:1,need:'chain',take:{chain:1},message:'Łańcuch znów łączy dźwignię z zasuwą.'}),
   node('ring',9.5,'Zawieś dzwon na ramie nad kanałem','tripwire_hook',{y:3.4,width:1,height:1,hero:6.35,need:'bell',take:{bell:1},doneTexture:'bell',effect:'lure',message:'Dzwon zwabił zombie na dno kanału.'}),
   node('flood',4,'Pociągnij dźwignię śluzy','lever',{y:4.5,width:1,height:1,after:['repair','ring'],effect:'flood',message:'Zasuwa się podniosła. Nurt zepchnął zombie do szybu.'}),
  ],
 },{
  name:'Promień nad celą',region:'LEGOWISKO',biome:'lair',
  goal:'Unieruchom strażnika, odzyskaj klucz i uwolnij Alex.',
  clue:'Przewód biegnie od płytki pod torem do rygla włazu. Zombie przy kracie ma klucz.',
  hint:'Popchnij wagonik na płytkę. Kiedy przewód zaświeci, otwórz odblokowany właz. Użyj miecza na zombie w świetle i klucza na kracie.',
  finish:'rescue',
  nodes:[
   node('weight',4,'Popchnij wagonik na płytkę','rescue_minecart_side',{y:4.95,width:1,height:.9,doneX:6,effect:'roll',message:'Wagonik nacisnął płytkę pod włazem.'}),
   node('hatch',9,'Otwórz właz w suficie','oak_planks',{y:.05,width:1,height:.6,after:['weight'],effect:'light',message:'Promień oślepił strażnika. Możesz użyć miecza.'}),
   node('warden',9,'Pokonaj zombie z kluczem','zombie',{character:true,after:['hatch'],need:'iron_sword',give:{tripwire_hook:1},effect:'strike',message:'Zombie upuścił klucz. Pasuje do zamka na kracie.'}),
   node('cell',12,'Otwórz kratę kluczem','iron_bars',{after:['warden'],need:'tripwire_hook',take:{tripwire_hook:1},effect:'light',message:'Krata podniosła się. Alex jest wolna!'}),
   node('rescue',14,'Podejdź do uratowanej Alex','alex',{character:true,after:['cell'],hero:13,message:'Alex uratowana. Zza włazu dobiega jeszcze jedno echo…',effect:'reunion'}),
  ],
 },
];

export function createRescue(now=Date.now()){
 return {scene:0,hero:10.8,selected:'',stock:{},flags:{},log:[],steps:0,done:false,
  startedAt:now,finishedAt:0,message:'Dom Alex. Chwilę temu znaleźliście się po długiej wędrówce.',effect:''};
}

export function rescueSceneReady(state,scene=rescueScenes[state.scene]){
 return Boolean(state.flags[scene.finish]&&(scene.requires||[]).every(id=>state.flags[id]));
}

const classicPrerequisites={marks:['ore','coal'],sword:['smelt'],ring:['repair'],flood:['ring']};
const blockedBy={
 trail:'Ślady zaczynają się przy drzwiach.',
 locker:'Jeśli podniesiesz wieko, linka pociągnie za dzwon.',
 chock:'Przy kole jest za ciemno. Rozejrzyj się za uchwytem na pochodnię.',
 cart:'Pod kołem tkwi klin. Bez jego wyjęcia wagonik nie ruszy.',
 ore:'Wagonik zastawia podejście do złoża.',
 coal:'Wagonik zastawia podejście do złoża.',
 smelt:'Piec jest zimny. Przyjrzyj się jego dolnemu otworowi.',
 sword:'Przy stole wciąż brakuje części miecza. Zobacz obrysy na polach.',
 hatch:'Rygiel trzyma właz. Płytka pod torem jest jeszcze zwolniona.',
 warden:'Strażnik widzi w ciemności. Oślep go promieniem przez właz.',
 cell:'Krata ma zamek. Klucz ma zombie obok celi.',
 rescue:'Alex wciąż jest za kratą. Otwórz zamek.',
};

export function rescueAction(state,action,now=Date.now()){
 return applyRescueAction(state,action,now,false,false);
}

function applyRescueAction(state,action,now,legacy,classic){
 if(!action||state.done)return false;
 const {type,id}=action;
 const scene=rescueScenes[state.scene];
 const flags=state.flags;
 state.effect='';
 if(type==='select'){
  if(!Object.hasOwn(rescueItems,id)||!(state.stock[id]>0))return false;
  state.selected=id;
 }else if(type==='next'){
  if(!rescueSceneReady(state,scene)||state.scene>=rescueScenes.length-1)return false;
  state.scene++;
  state.hero=2;
  state.message=rescueScenes[state.scene].goal;
  state.steps++;
  state.effect='walk';
 }else if(type==='node'){
  const legacyPuzzle=legacy&&scene.biome==='armory';
  const entry=(legacyPuzzle?legacyArmory:scene.nodes).find(node=>node.id===id);
  const target=classic&&id==='sword'&&entry
   ?{...entry,need:'iron_ingot',take:{iron_ingot:2,stick:1}}
   :entry;
  if(!target||flags[id]&&!target.repeat)return false;
  const prerequisites=(classic&&classicPrerequisites[id])||target.after||[];
  const missing=Object.entries(target.take||{}).find(([item,count])=>(state.stock[item]||0)<count);
  if(target.reveal&&prerequisites.some(key=>!flags[key]))return false;
  if(id==='guard'&&!legacyPuzzle){
   state.message='Strażnik śpi. Linka między skrzynią a dzwonem może go obudzić.';
  }else if(id==='guard'){
   if(!flags.alert)state.message='Strażnik śpi. Skrzypiąca deska może go obudzić.';
   else if(!flags.shutter)state.message='Wiatr go niepokoi. Domknij okiennicę.';
   else{
    flags.alert=false;
    state.hero=target.hero;
    state.steps++;
    state.message='Odsunąłeś się od regału. Strażnik znowu śpi.';
   }
  }else if(target.startle&&(!flags.floor||flags.alert)){
   flags.alert=true;
   state.hero=9.7;
   state.effect='alert';
   state.message='Strażnik się obudził. Domknij okiennicę i kliknij strażnika, żeby się wycofać.';
  }else if(prerequisites.some(key=>!flags[key])){
   state.message=id==='flood'
    ?(!flags.repair?'Dźwignia jest odłączona. Brakuje łańcucha do zasuwy.':'Zombie stoją poza kanałem. Sprowadź je pod ramę.')
    :blockedBy[id]||scene.clue;
  }else if(target.need&&(target.need!==(action.item||state.selected)||!(state.stock[target.need]>0))){
   state.message=state.stock[target.need]>0
    ?`Potrzebny przedmiot z plecaka · ${rescueItems[target.need]}.`
    :`Brakuje przedmiotu · ${rescueItems[target.need]}.`;
  }else if(missing){
   const [item,count]=missing;
   state.message=`Do tego potrzeba: ${rescueItems[item]} ×${count}.`;
  }else{
   for(const [item,count]of Object.entries(target.take||{}))state.stock[item]-=count;
   for(const [item,count]of Object.entries(target.give||{}))state.stock[item]=(state.stock[item]||0)+count;
   flags[id]=true;
   if(classic&&id==='sword')flags.bladeTop=flags.bladeBottom=flags.hilt=true;
   state.hero=target.hero??Math.max(1,target.x-1);
   state.steps++;
   state.message=target.message||'';
   state.effect=target.effect||'walk';
   if(id==='rescue'){state.done=true;state.finishedAt=now;}
  }
 }else return false;
 state.log.push({type,...(id?{id}:{}),...(typeof action.item==='string'?{item:action.item}:{})});
 return true;
}

export function saveRescue(state){
 return JSON.stringify({version:3,log:state.log,legacyMoves:state.legacyMoves,classicMoves:state.classicMoves,startedAt:state.startedAt,finishedAt:state.finishedAt});
}

function finishLegacyRescue(state){
 for(const id of ['shutter','wool','floor','alert'])delete state.flags[id];
 delete state.stock.white_wool;
 if(state.selected==='white_wool')state.selected='';
 if(state.flags.locker)state.flags.tripwire=true;
 if(rescueScenes[state.scene].biome==='armory')state.message=state.flags.locker?'Zapasy są już w plecaku.':rescueScenes[state.scene].goal;
}

export function restoreRescue(raw,now=Date.now()){
 const state=createRescue(now);
 try{
  const saved=JSON.parse(raw||'null');
  if(![1,2,3].includes(saved?.version)||!Array.isArray(saved.log)||saved.log.length>5000)return state;
  const legacyMoves=saved.version===1?saved.log.length:saved.legacyMoves??0;
  // Early clicks that used to be blocked must stay blocked when replaying older logs.
  const classicMoves=saved.version<3?saved.log.length:saved.classicMoves??0;
  if(!Number.isInteger(legacyMoves)||!Number.isInteger(classicMoves)||legacyMoves<0||legacyMoves>classicMoves||classicMoves>saved.log.length)return state;
  if(legacyMoves)state.legacyMoves=legacyMoves;
  if(classicMoves)state.classicMoves=classicMoves;
  for(const [index,action] of saved.log.entries()){
   if(!applyRescueAction(state,action,now,index<legacyMoves,index<classicMoves))return createRescue(now);
   if(index+1===legacyMoves)finishLegacyRescue(state);
  }
  if(Number.isFinite(saved.startedAt)&&saved.startedAt>0&&saved.startedAt<=now)state.startedAt=saved.startedAt;
  if(state.done&&Number.isFinite(saved.finishedAt)&&saved.finishedAt>=state.startedAt&&saved.finishedAt<=now)state.finishedAt=saved.finishedAt;
  state.effect='';
 }catch{return createRescue(now);}
 return state;
}
