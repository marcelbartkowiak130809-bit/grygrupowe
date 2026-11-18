const node=(id,x,label,texture,options={})=>({id,x,label,texture,y:5,...options});

export const rescueItems={
 white_wool:'Biała wełna',stone_pickaxe:'Kamienny kilof',torch:'Pochodnia',stick:'Patyk',
 iron_ore:'Ruda żelaza',coal:'Węgiel',iron_ingot:'Sztabka żelaza',iron_sword:'Żelazny miecz',
 bell:'Dzwon',chain:'Łańcuch',tripwire_hook:'Klucz do celi',
};

export const rescueScenes=[
 {
  name:'Ten sam dom, inna noc',region:'DOM ALEX',biome:'home',
  goal:'Podejdź do Alex.',
  hint:'Kliknij Alex. Gdy sytuacja się zmieni, rozejrzyj się za tropem przy drzwiach.',
  finish:'trail',
  nodes:[
   node('embrace',12,'Podejdź do Alex','alex',{character:true,hero:10.8,message:'Zombie porwał Alex! Zostawił ślady przy drzwiach.',effect:'abduction'}),
   node('trail',14,'Zbadaj ślady','rotten_flesh',{after:['embrace'],reveal:true,hero:13,message:'Ślady prowadzą przez wieś w stronę starej kopalni.'}),
  ],
 },{
  name:'Zbrojownia na palcach',region:'WIOSKA',biome:'armory',
  goal:'Weź zapasy ze skrzyni, póki strażnik śpi.',
  hint:'Domknij okiennicę. Wełna z regału wyciszy skrzypiącą deskę pod skrzynią. Gdy strażnik się obudzi, odsuń się i poczekaj, aż zaśnie.',
  finish:'locker',
  nodes:[
   node('shutter',3,'Domknij okiennicę','oak_planks',{y:3,message:'Okiennica tłumi wiatr i światło. Strażnikowi będzie łatwiej zasnąć.'}),
   node('wool',6,'Zabierz wełnę z regału','white_wool',{give:{white_wool:1},message:'Zabrano wełnę. Przyda się do wytłumienia podłogi.'}),
   node('guard',9,'Śpiący strażnik','villager',{character:true,repeat:true,hero:7}),
   node('floor',12,'Wycisz skrzypiącą deskę','oak_planks',{y:6,need:'white_wool',take:{white_wool:1},doneTexture:'white_wool',message:'Wełna tłumi deskę. Możesz podejść do skrzyni.'}),
   node('locker',12,'Otwórz skrzynię z wyposażeniem','chest_minecart',{after:['shutter','floor'],startle:true,give:{stone_pickaxe:1,torch:1,stick:1},message:'Skrzynia otwarta bez hałasu. Masz kilof, pochodnię i patyk.'}),
  ],
 },{
  name:'Kopalnia z zablokowanym torem',region:'KOPALNIA',biome:'mine',
  goal:'Przesuń wagonik i wydobądź żelazo oraz węgiel.',
  hint:'Pochodnia pasuje do uchwytu przy torze. Po oświetleniu zwolnij klin, a potem popchnij wagonik na bocznicę. Wybierz kilof do obu złóż.',
  finish:'marks',
  nodes:[
   node('lamp',4,'Oświetl tor','lantern',{need:'torch',take:{torch:1},doneTexture:'torch',effect:'light',message:'Światło odsłoniło klin blokujący koło.'}),
   node('chock',6,'Wyciągnij klin spod koła','oak_slab',{after:['lamp'],message:'Wagonik może się teraz poruszyć.'}),
   node('cart',8,'Popchnij wagonik na bocznicę','minecart',{after:['chock'],doneX:10,effect:'roll',message:'Wagonik odsłonił dostęp do złóż.'}),
   node('ore',11,'Wydobądź dwie rudy żelaza','iron_ore',{after:['cart'],need:'stone_pickaxe',give:{iron_ore:2},effect:'strike',message:'Zebrano dwie rudy żelaza.'}),
   node('coal',13,'Wydobądź węgiel','coal_ore',{after:['cart'],need:'stone_pickaxe',give:{coal:1},effect:'strike',message:'Masz węgiel na opał.'}),
   node('marks',14,'Obejrzyj ślady na ścianie','cracked_stone_bricks',{y:3,after:['ore','coal'],message:'Alex wydrapała strzałkę w stronę podziemnej kuźni.'}),
  ],
 },{
  name:'Żelazo ze starego pieca',region:'KUŹNIA',biome:'forge',
  goal:'Rozpal piec, wytop żelazo i wykonaj miecz.',
  hint:'Wybierz węgiel do paleniska i rudę do pieca. Przy stole wybierz sztabkę. Do miecza potrzebne są dwie sztabki i patyk ze zbrojowni.',
  finish:'sword',
  nodes:[
   node('fuel',4,'Rozpal palenisko węglem','campfire',{need:'coal',take:{coal:1},effect:'light',message:'Ciepło dotarło do pieca.'}),
   node('smelt',7,'Wytop dwie sztabki','furnace_front',{after:['fuel'],need:'iron_ore',take:{iron_ore:2},give:{iron_ingot:2},doneTexture:'furnace_front_on',effect:'light',message:'Dwie sztabki są gotowe.'}),
   node('sword',12,'Wykonaj miecz ze sztabek i patyka','smithing_table_front',{after:['smelt'],need:'iron_ingot',take:{iron_ingot:2,stick:1},give:{iron_sword:1},doneTexture:'iron_sword',effect:'strike',message:'Żelazny miecz gotowy. Z jaskini dobiega pomruk.'}),
  ],
 },{
  name:'Echo przy śluzie',region:'JASKINIA ZOMBIE',biome:'sluice',
  goal:'Zwab grupę zombie w boczny kanał i rozpraw się z nią za pomocą śluzy.',
  hint:'Najpierw zabierz dzwon i łańcuch z porzuconego mechanizmu. Napraw śluzę łańcuchem. Zawieś dzwon na ramie i pociągnij za dźwignię, gdy zombie podejdą.',
  finish:'flood',
  nodes:[
   node('gear',3,'Zdejmij dzwon i łańcuch','chain',{give:{chain:1,bell:1},message:'Łańcuch pasuje do śluzy, a dzwon może odciągnąć zombie.'}),
   node('repair',6,'Podepnij łańcuch do śluzy','chain',{y:4,need:'chain',take:{chain:1},message:'Śluza jest sprawna. Potrzebujesz przynęty.'}),
   node('ring',9,'Zawieś i uderz w dzwon','bell',{y:4,after:['repair'],need:'bell',take:{bell:1},effect:'lure',message:'Zombie zeszły do kanału. Zwolnij śluzę.'}),
   node('flood',12,'Otwórz śluzę','lever',{y:4,after:['ring'],effect:'flood',message:'Nurt zmiótł zombie do zamkniętego szybu. Droga do celi jest wolna.'}),
  ],
 },{
  name:'Promień nad celą',region:'LEGOWISKO',biome:'lair',
  goal:'Unieruchom strażnika, odzyskaj klucz i uwolnij Alex.',
  hint:'Przestaw wagonik pod właz, aby nacisnąć płytkę. Otwarty właz wpuści światło i odetnie strażnikowi drogę. Wybierz miecz, pokonaj zombie i użyj klucza na kracie.',
  finish:'rescue',
  nodes:[
   node('weight',4,'Popchnij wagonik na płytkę','minecart',{doneX:6,effect:'roll',message:'Wagonik nacisnął płytkę pod włazem.'}),
   node('hatch',7,'Otwórz właz nad strażnikiem','oak_planks',{y:2,after:['weight'],effect:'light',message:'Światło zagrodziło strażnikowi ucieczkę.'}),
   node('warden',10,'Pokonaj zombie z kluczem','zombie',{character:true,after:['hatch'],need:'iron_sword',give:{tripwire_hook:1},effect:'strike',message:'Zombie pokonany. Klucz wpadł do plecaka.'}),
   node('cell',12,'Otwórz kratę kluczem','iron_bars',{after:['warden'],need:'tripwire_hook',take:{tripwire_hook:1},effect:'light',message:'Krata podniosła się. Alex jest wolna!'}),
   node('rescue',14,'Podejdź do uratowanej Alex','alex',{character:true,after:['cell'],hero:13,message:'Alex uratowana. Zza włazu dobiega jeszcze jedno echo…',effect:'reunion'}),
  ],
 },
];

export function createRescue(now=Date.now()){
 return {scene:0,hero:10.8,selected:'',stock:{},flags:{},log:[],steps:0,done:false,
  startedAt:now,finishedAt:0,message:'Dom Alex. Chwilę temu znaleźliście się po długiej wędrówce.',effect:''};
}

export function rescueAction(state,action,now=Date.now()){
 if(!action||state.done)return false;
 const {type,id}=action;
 const scene=rescueScenes[state.scene];
 const flags=state.flags;
 state.effect='';
 if(type==='select'){
  if(!Object.hasOwn(rescueItems,id)||!(state.stock[id]>0))return false;
  state.selected=id;
  state.message=`Wybrano: ${rescueItems[id]}.`;
 }else if(type==='next'){
  if(!flags[scene.finish]||state.scene>=rescueScenes.length-1)return false;
  state.scene++;
  state.hero=2;
  state.message=rescueScenes[state.scene].goal;
  state.steps++;
  state.effect='walk';
 }else if(type==='node'){
  const target=scene.nodes.find(node=>node.id===id);
  if(!target||flags[id]&&!target.repeat||target.reveal&&target.after.some(key=>!flags[key]))return false;
  if(id==='guard'){
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
  }else if(target.after?.some(key=>!flags[key])){
   state.message='Jeszcze za wcześnie. Sprawdź, co blokuje ten mechanizm.';
  }else if(target.need&&(target.need!==(action.item||state.selected)||!(state.stock[target.need]>0))){
   state.message=`Wybierz w plecaku: ${rescueItems[target.need]}.`;
  }else if(Object.entries(target.take||{}).some(([item,count])=>state.stock[item]<count||!state.stock[item])){
   state.message='Brakuje materiałów. Sprawdź wskazówkę przy planszy.';
  }else{
   for(const [item,count]of Object.entries(target.take||{}))state.stock[item]-=count;
   for(const [item,count]of Object.entries(target.give||{}))state.stock[item]=(state.stock[item]||0)+count;
   flags[id]=true;
   state.hero=target.hero??Math.max(1,target.x-1);
   state.steps++;
   state.message=target.message;
   state.effect=target.effect||'walk';
   if(id==='rescue'){state.done=true;state.finishedAt=now;}
  }
 }else return false;
 state.log.push({type,...(id?{id}:{}),...(typeof action.item==='string'?{item:action.item}:{})});
 return true;
}

export function saveRescue(state){
 return JSON.stringify({version:1,log:state.log,startedAt:state.startedAt,finishedAt:state.finishedAt});
}

export function restoreRescue(raw,now=Date.now()){
 const state=createRescue(now);
 try{
  const saved=JSON.parse(raw||'null');
  if(saved?.version!==1||!Array.isArray(saved.log)||saved.log.length>5000)return state;
  for(const action of saved.log)if(!rescueAction(state,action,now))return createRescue(now);
  if(Number.isFinite(saved.startedAt)&&saved.startedAt>0&&saved.startedAt<=now)state.startedAt=saved.startedAt;
  if(state.done&&Number.isFinite(saved.finishedAt)&&saved.finishedAt>=state.startedAt&&saved.finishedAt<=now)state.finishedAt=saved.finishedAt;
  state.effect='';
 }catch{return createRescue(now);}
 return state;
}
