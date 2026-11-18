import {journeyScenes,journeyScene,journeyItems,journeyRecipes,baseJourneyTerrain} from './alexJourneyWorld.js?v=20261118-6';
export {journeyScenes,journeyScene,journeyItems,journeyRecipes};
export const journeyTier=item=>({wooden_pickaxe:1,stone_pickaxe:2,iron_pickaxe:3}[item]||0);
export function createJourney(rulesVersion=2){return {version:1,rulesVersion,log:[],undo:[],scene:0,farthest:0,stock:{},discovered:[],grid:Array(9).fill(''),selected:'',world:journeyScenes.map(()=>({nodes:{},placed:{},fuel:{},flags:{}})),completed:Array(10).fill(false),hero:{scene:0,x:6},steps:0,crafted:0,looted:0,food:0,done:false,startedAt:Date.now(),finishedAt:0,message:'Alex czeka po drugiej stronie gór. Zacznij od zapasów.',effect:null};}
const give=(s,item,n=1)=>{s.stock[item]=(s.stock[item]||0)+n;if(!s.discovered.includes(item))s.discovered.push(item);};
const has=(s,item,n=1)=>Number.isInteger(n)&&n>0&&(s.stock[item]||0)>=n;
const take=(s,item,n=1)=>{s.stock[item]-=n;};
export const journeyAssetId=id=>id==='furnace'?'furnace_front':id;
export function journeyRecipe(grid){for(const r of journeyRecipes){const expected=Array(9).fill('');for(const [i,id]of r.slots)expected[i]=id;
 // Shaped recipes can be translated within the 3×3 grid.
 const shape=g=>{const cells=g.map((id,i)=>({id,x:i%3,y:Math.floor(i/3)})).filter(c=>c.id);if(!cells.length)return '';const x=Math.min(...cells.map(c=>c.x)),y=Math.min(...cells.map(c=>c.y));return cells.map(c=>`${c.x-x},${c.y-y}:${c.id}`).sort().join('|');};
 if(shape(grid)===shape(expected))return r;
 }return null;}
export function journeyTerrain(s,scene,x,y){return s.world[scene].placed[y*16+x]||baseJourneyTerrain(journeyScenes[scene],x,y);}
export function journeySurface(s,scene,x){for(let y=3;y<9;y++)if(hasGround(s,scene,x,y))return y;return 9;}
export function journeyLit(s,scene,x){return Object.entries(s.world[scene].placed).some(([key,item])=>item==='torch'&&Math.abs(Number(key)%16-x)<=2);}
function hasGround(s,scene,x,y){const id=journeyTerrain(s,scene,x,y);return !!id&&id!=='water_still'&&id!=='torch'&&id!=='redstone'&&id!=='lever'&&id!=='furnace';}
export function journeyCanCross(s,scene){const l=journeyScenes[scene];if(l.id==='gate'&&!s.world[scene].flags.powered)return false;
 let previous=6;for(let x=6;x<=l.exit;x++){let surface=9;for(let y=0;y<9;y++)if(hasGround(s,scene,x,y)){surface=y;break;}
 if(surface>6||Math.abs(surface-previous)>1)return false;previous=surface;}return true;
}
function reachable(s,node){const l=journeyScenes[s.scene];if(l.gap&&node.x>=12&&!journeyCanCross(s,s.scene))return false;if(l.id==='gate'&&node.x>12&&!s.world[s.scene].flags.powered)return false;return true;}
function complete(s){const w=s.world[s.scene],f=w.flags;const passed=[()=>!!f.food&&!!f.wood,()=>!!f.crossed,()=>!!f.cooked,()=>!!f.stonePick,()=>f.iron>=3&&journeyScenes[4].lights.every(x=>journeyLit(s,4,x)),()=>!!f.ironPick,()=>!!f.map,()=>!!f.crossed,()=>!!f.crossed&&!!f.powered,()=>!!f.greeted&&!!f.lantern][s.scene]();
 if(passed&&!s.completed[s.scene]){s.completed[s.scene]=true;s.message=s.scene===9?'Alex odnaleziona. Cała droga była warta zachodu!':'Droga otwarta. Możesz jeszcze rozejrzeć się po okolicy.';s.effect={kind:'complete'};}
 if(s.completed[9]&&!s.done){s.done=true;s.finishedAt=Date.now();}
}
function execute(s,a){const scene=journeyScene(s),w=s.world[s.scene],item=a.item||s.selected;
 s.effect=null;
 if(a.type==='select'){if(!journeyItems[a.item]||!has(s,a.item))return false;s.selected=a.item;s.message=`Wybrano: ${journeyItems[a.item]}.`;return true;}
 if(a.type==='travel'){
  if(!Number.isInteger(a.scene)||a.scene<0||a.scene>=10||a.scene>s.farthest)return false;
  s.hero={scene:a.scene,x:s.done&&a.scene===9?11:6};s.scene=a.scene;s.message=s.completed[s.scene]?'Tu już byłeś. Pozostałe zapasy nadal czekają.':journeyScene(s).goal;s.effect={kind:'travel'};complete(s);return true;
 }
 if(a.type==='next'){if(!s.completed[s.scene]||s.scene>=9)return false;s.scene++;s.farthest=Math.max(s.farthest,s.scene);s.hero={scene:s.scene,x:6};s.message=journeyScene(s).goal;s.steps++;s.effect={kind:'travel'};complete(s);return true;}
 if(a.type==='slot'){
  if(!Number.isInteger(a.index)||a.index<0||a.index>8)return false;
  if(s.grid[a.index]){give(s,s.grid[a.index]);s.grid[a.index]='';}else{if(!journeyItems[item]||!has(s,item))return false;take(s,item);s.grid[a.index]=item;}s.message='Ułóż recepturę. Składniki odzyskasz kliknięciem.';return true;
 }
 if(a.type==='clear'){if(!s.grid.some(Boolean))return false;for(const id of s.grid)if(id)give(s,id);s.grid.fill('');return true;}
 if(a.type==='prepare'){
  const recipe=journeyRecipes.find(r=>r.id===a.id);if(!recipe)return false;const available={...s.stock},needed={};for(const id of s.grid)if(id)available[id]=(available[id]||0)+1;for(const [,id]of recipe.slots)needed[id]=(needed[id]||0)+1;
  const missing=Object.entries(needed).filter(([id,n])=>(available[id]||0)<n);if(missing.length){s.message='Brakuje: '+missing.map(([id,n])=>`${n-(available[id]||0)} × ${journeyItems[id]}`).join(', ');return true;}
  s.stock=available;s.grid.fill('');for(const [i,id]of recipe.slots){take(s,id);s.grid[i]=id;}s.message='Receptura ułożona. Odbierz wynik strzałką.';return true;
 }
 if(a.type==='craft'){
  const recipe=journeyRecipe(s.grid);if(!recipe)return false;give(s,recipe.id,recipe.count);s.grid.fill('');s.selected=recipe.id;s.crafted++;s.steps++;s.message=`Wytworzono: ${recipe.count} × ${journeyItems[recipe.id]}.`;if(recipe.id==='stone_pickaxe')s.world[3].flags.stonePick=true;if(recipe.id==='iron_pickaxe')s.world[5].flags.ironPick=true;s.effect={kind:'craft',item:recipe.id};complete(s);return true;
 }
 if(a.type==='eat'){const value={cooked_porkchop:3,bread:2,sweet_berries:1}[item];if(!value||!has(s,item))return false;if(s.food>=8){s.message='Masz już pełno sił. Zachowaj prowiant na później.';return true;}take(s,item);s.food=Math.min(8,s.food+value);s.steps++;s.message='Posiłek dodaje sił: kolejne wydobycia dadzą o jeden surowiec więcej.';s.effect={kind:'eat',item};return true;}
 if(a.type==='remove'){
  const key=a.y*16+a.x,id=w.placed[key];if(!Number.isInteger(a.x)||!Number.isInteger(a.y)||!id)return false;
  if(['oak_planks','cobblestone'].includes(id)&&w.placed[key-16]){s.message='Najpierw zdejmij górny blok.';return true;}
  if(scene.id==='forge'&&id==='furnace'&&(w.fuel.hearth||0)>0){s.message='Piec ma jeszcze paliwo. Cofnij jego ustawienie, jeśli chcesz odzyskać cały poprzedni stan.';return true;}
  delete w.placed[key];give(s,id);if(scene.id==='gate')w.flags.powered=false;s.steps++;s.message='Przedmiot wrócił do plecaka.';return true;
 }
 if(a.type==='tile'){
  const {x,y}=a;if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||x>=16||y<0||y>=9)return false;const key=y*16+x;
  if(!has(s,item)){s.message='Wybierz przedmiot z plecaka.';return true;}
  if(scene.build&&['oak_planks','cobblestone'].includes(item)&&x>=8&&x<=11&&y>=3&&y<=6&&!journeyTerrain(s,s.scene,x,y)){
   const supported=scene.id==='river'?y===6&&scene.gap.includes(x)&&(hasGround(s,s.scene,x-1,y)||hasGround(s,s.scene,x+1,y)):hasGround(s,s.scene,x,y+1);
   if(!supported){s.message=scene.id==='river'?'Zacznij most przy brzegu i dokładaj bloki obok siebie.':'Blok potrzebuje podpory. Zacznij od dołu.';return true;}
   take(s,item);w.placed[key]=item;
  }else if(scene.id==='mine'&&item==='torch'&&y===4&&x>=6&&x<=14&&!w.placed[key]){take(s,item);w.placed[key]=item;
  }else if(scene.id==='gate'&&y===5&&((scene.wires.includes(x)&&item==='redstone')||(x===scene.switch&&item==='lever'))&&!w.placed[key]){take(s,item);w.placed[key]=item;
  }else if(scene.id==='forge'&&x===10&&y===5&&item==='furnace'&&!w.placed[key]){take(s,item);w.placed[key]=item;
  }else{s.message='Ten przedmiot tutaj nie rozwiąże problemu. Sprawdź ukształtowanie terenu i podpowiedź.';return true;}
  s.steps++;s.message='Postawione. Zobacz, jak zmieniła się droga.';s.effect={kind:'place',x,y,item};complete(s);return true;
 }
 if(a.type==='switch'){
  if(scene.id!=='gate'||w.placed[5*16+7]!=='lever')return false;
  if(!scene.wires.every(x=>w.placed[5*16+x]==='redstone')){s.message='Obwód ma przerwę.';return true;}w.flags.powered=!w.flags.powered;s.message=w.flags.powered?'Brama otwarta. Kliknij drogę za nią.':'Zasilanie wyłączone.';s.steps++;s.effect={kind:'power'};return true;
 }
 if(a.type==='exit'){
  if(['river','ridge','gate'].includes(scene.id)&&!journeyCanCross(s,s.scene)){s.message='Droga jeszcze nie jest bezpieczna. Steve potrzebuje ciągłego przejścia.';return true;}
  if(!['river','ridge','gate'].includes(scene.id)&&!s.completed[s.scene]){s.message=scene.goal;return true;}
  s.hero={scene:s.scene,x:scene.exit};w.flags.crossed=true;s.steps++;s.effect={kind:'walk'};complete(s);return true;
 }
 if(a.type!=='node')return false;
 const n=scene.nodes.find(n=>n.id===a.id);if(!n||!reachable(s,n))return false;
 const ns=w.nodes[n.id]||{},remaining=ns.remaining??n.amount??1;
 if(ns.done){s.message='To miejsce zostało już zebrane. Nic nie odrasta po przejściu dalej.';return true;}
 s.hero={scene:s.scene,x:Math.max(1,Math.min(n.x-1,scene.id==='ridge'?7:14))};
 if(n.type==='prop'){
  for(const x of [8,9])if(!w.placed[96+x])w.placed[96+x]='oak_planks';
  w.nodes[n.id]={done:true};w.flags.bridgeReleased=true;s.steps++;s.message='Kłoda opadła! Uzupełnij dwa wolne pola deskami, a potem przejdź przez most.';s.effect={kind:'mechanism',node:n.id};
 }else if(n.type==='pulley'){
  if(item!=='cobblestone'||!has(s,item)){s.message='Lina potrzebuje przeciwwagi. Wybierz bruk i kliknij mechanizm.';return true;}
  take(s,item);w.nodes[n.id]={done:true};w.nodes.well={opened:true};w.flags.counterweight=true;s.steps++;s.message='Ciężar opadł, pokrywa się podniosła. Kliknij odsłoniętą skrzynię w studni.';s.effect={kind:'mechanism',node:n.id};
 }else if(['log','pig','berries','stone','coal','iron','redstone','well'].includes(n.type)){
  if(n.type==='well'&&s.rulesVersion===2&&!ns.opened){s.message='Pokrywa jest za ciężka. Obciąż linę brukiem, by ją podnieść.';return true;}
  const tier=journeyTier(item),required=n.type==='well'&&ns.opened?0:({stone:1,coal:1,iron:2,redstone:3,well:3}[n.type]||0);
  if(required&&(!has(s,item)||tier<required)){s.message=`Potrzebujesz ${required===1?'drewnianego':required===2?'kamiennego':'żelaznego'} kilofa lub lepszego.`;return true;}
  if(scene.id==='mine'&&['iron','chest'].includes(n.type)&&!journeyLit(s,s.scene,n.x)){s.message='Jest za ciemno. Najpierw doświetl to miejsce.';return true;}
  const hits=(ns.hits||0)+1;if(n.hits&&hits<n.hits){w.nodes[n.id]={...ns,hits};s.steps++;s.message='Jeszcze jedno uderzenie.';s.effect={kind:'hit',node:n.id};return true;}
  if(n.type==='well'){w.nodes[n.id]={done:false,opened:true};s.steps++;s.message='Pod głazem jest skrzynia. Kliknij ją, aby otworzyć.';s.effect={kind:'hit',node:n.id};if(ns.opened){give(s,'map');give(s,'bread',2);w.nodes[n.id]={done:true,opened:true};w.flags.map=true;s.looted++;s.message='Mapa prowadzi za przełęcz. Alex jest blisko.';}complete(s);return true;}
  const natural=['log','pig','berries'].includes(n.type),gathered=natural?remaining:Math.min(remaining,(n.type==='stone'&&tier>=2?2:1)+(s.food>0?1:0)),id={log:'oak_log',pig:'porkchop',berries:'sweet_berries',stone:'cobblestone',coal:'coal',iron:'iron_ore',redstone:'redstone'}[n.type];
  if(!natural&&s.food>0)s.food--;
  give(s,id,gathered);w.nodes[n.id]={remaining:remaining-gathered,done:remaining===gathered,hits};if(n.type==='pig')w.flags.food=true;if(n.type==='log')w.flags.wood=true;if(n.type==='iron')w.flags.iron=(w.flags.iron||0)+gathered;
  s.steps++;s.message=`+${gathered} ${journeyItems[id]}`;s.effect={kind:'loot',item:id,count:gathered,node:n.id};
 }else if(n.type==='chest'){
  if(scene.id==='mine'&&!journeyLit(s,s.scene,n.x)){s.message='Skrzynia ginie w ciemności. Postaw światło bliżej.';return true;}
  for(const [id,count]of Object.entries(n.loot))give(s,id,count);w.nodes[n.id]={done:true};s.looted++;s.steps++;s.message='Skrzynia opróżniona. Zapasy zostają z tobą.';s.effect={kind:'chest',node:n.id};
 }else if(n.type==='stove'||n.type==='hearth'){
  if(n.type==='hearth'&&w.placed[5*16+10]!=='furnace'){s.message='Tu jest miejsce na własny piec.';return true;}
  const fuel={coal:8,oak_log:2,oak_planks:1}[item];if(fuel&&has(s,item)){take(s,item);w.fuel[n.id]=(w.fuel[n.id]||0)+fuel;s.message=`Piec ma ${w.fuel[n.id]} jednostek ciepła.`;
  }else if(['porkchop','iron_ore'].includes(item)&&has(s,item)){
   if(!(w.fuel[n.id]>0)){s.message='Najpierw dodaj paliwo.';return true;}take(s,item);w.fuel[n.id]--;const result=item==='porkchop'?'cooked_porkchop':'iron_ingot';give(s,result);if(item==='porkchop')w.flags.cooked=true;s.message=`Gotowe: ${journeyItems[result]}.`;s.effect={kind:'smelt',item:result};
  }else{s.message='Wybierz paliwo, surowy schab albo rudę żelaza.';return true;}s.steps++;
 }else if(n.type==='lantern'){
  if(item!=='torch'||!has(s,item)){s.message='Na słupku zmieści się pochodnia.';return true;}take(s,item);w.flags.lantern=true;w.nodes[n.id]={done:true};s.steps++;s.message='W oknie zrobiło się jasno.';s.effect={kind:'light'};
 }else if(n.type==='alex'){
  if(!w.flags.lantern){s.message='Alex prosi o światło przy ścieżce. Zapal lampę obok domu.';return true;}w.flags.greeted=true;s.steps++;s.hero={scene:9,x:11};
 }else return false;
 complete(s);return true;
}
const snapshot=s=>JSON.stringify({scene:s.scene,farthest:s.farthest,stock:s.stock,discovered:s.discovered,grid:s.grid,selected:s.selected,world:s.world,completed:s.completed,hero:s.hero,steps:s.steps,crafted:s.crafted,looted:s.looted,food:s.food,done:s.done,finishedAt:s.finishedAt});
export function journeyAction(s,a){if(!a||typeof a!=='object'||!Array.isArray(s.log)||s.done&&!['undo','travel','select'].includes(a.type))return false;
 if(a.type==='undo'){const old=s.undo.pop();if(!old)return false;Object.assign(s,JSON.parse(old));s.message='Cofnięto ostatnią czynność. Świat i plecak wróciły razem.';s.effect={kind:'undo'};s.log.push({type:'undo'});return true;}
 const before=snapshot(s);if(!execute(s,a))return false;
 if(!['select','travel'].includes(a.type)&&snapshot(s)!==before)s.undo.push(before);
 s.log.push({type:a.type,...(typeof a.item==='string'?{item:a.item}:{}),...(typeof a.id==='string'?{id:a.id}:{}),...Object.fromEntries(['scene','index','x','y'].filter(k=>Number.isInteger(a[k])).map(k=>[k,a[k]]))});return true;
}
export function saveJourney(s){return JSON.stringify({version:1,rulesVersion:s.rulesVersion,log:s.log,startedAt:s.startedAt,finishedAt:s.finishedAt});}
export function restoreJourney(raw){try{const data=typeof raw==='string'?JSON.parse(raw):raw;if(data?.version!==1||!Array.isArray(data.log)||data.log.length>12000||data.rulesVersion!==undefined&&![1,2].includes(data.rulesVersion))return createJourney();const s=createJourney(data.rulesVersion??1);for(const a of data.log)if(!journeyAction(s,a))return createJourney();if(Number.isFinite(data.startedAt)&&data.startedAt>0&&data.startedAt<=Date.now())s.startedAt=data.startedAt;if(s.done&&Number.isFinite(data.finishedAt)&&data.finishedAt>=s.startedAt&&data.finishedAt<=Date.now())s.finishedAt=data.finishedAt;return s;}catch{return createJourney();}}
