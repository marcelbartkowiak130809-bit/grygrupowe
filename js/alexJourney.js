import {escapeHtml} from './utils.js?v=20260903-7';
import {patchBackpackView} from './backpackMotion.js?v=20261117-10';
import {createJourney,restoreJourney,saveJourney,journeyAction,journeyScenes,journeyScene,journeyItems,journeyRecipes,journeyRecipe,journeySurface,journeyTerrain,journeyLit,journeyAssetId} from './alexJourneyEngine.js?v=20261118-6';
import {baseJourneyTerrain} from './alexJourneyWorld.js?v=20261118-6';
import {journeyObjective,journeyTime,journeyTorchTargets} from './alexJourneyObjectives.js?v=20261118-6';
import {chapterMenu,bindChapterMenu,canPlayThirdChapter} from './alexJourneyChapters.js?v=20261118-17';
import {renderAlexRescue,hasCompletedRescue} from './alexJourneyRescueView.js?v=20261118-18';
import {renderAlexComic} from './alexJourneyComic.js?v=20261118-18';
import {renderAlexSiege} from './alexJourneySiegeView.js?v=20261118-17';
import {gameFullscreenButton,gameRotationHint,bindGamePresentation} from './gamePresentation.js?v=20261118-11';
const asset=id=>new URL(`../assets/minecraft/backpack/${journeyAssetId(id)}.png`,import.meta.url).href;
const image=(id,alt='',className='')=>`<img src="${asset(id)}" alt="${escapeHtml(alt)}" class="${className}" draggable="false">`;
const stateByPlayer=new Map(),views=new Map(),motion=new WeakMap();
const activeChapters=new Map(),unlockedChapters=new Set();
const storageKey=id=>`grygrupowe-alex-journey-v1:${id}`;
const chapterKey=(playerId,field)=>`grygrupowe-alex-chapter-${field}:${playerId}`;
const reduced=()=>!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const defaultPan=s=>s.scene===4||s.hero.x>9?4:0;
function load(id){try{return restoreJourney(localStorage.getItem(storageKey(id)));}catch{return createJourney();}}
function save(id,s){try{localStorage.setItem(storageKey(id),saveJourney(s));return true;}catch{return false;}}
function skinPiece(id,x,y,w,h,dx,dy,dw=w,dh=h,cls=''){return `<svg class="${cls}" x="${dx}" y="${dy}" width="${dw}" height="${dh}" viewBox="${x} ${y} ${w} ${h}" overflow="hidden"><image href="${asset(id)}" x="0" y="0" width="64" height="64"/></svg>`;}
export function journeyPerson(id='steve',pose=''){
 if(id==='villager')return `<svg viewBox="0 0 16 32" class="journey-person" aria-hidden="true">
  ${skinPiece(id,8,8,8,10,4,0)}${skinPiece(id,26,24,8,12,3,10,10,14)}
  ${skinPiece(id,48,25,8,4,3,12,10,5)}${skinPiece(id,4,26,4,8,4,24)}${skinPiece(id,4,26,4,8,8,24)}
 </svg>`;
 const armA=skinPiece(id,44,20,4,12,0,8,4,12,'person-arm arm-a');
 const armB=skinPiece(id,36,52,4,12,12,8,id==='alex'?3:4,12,'person-arm arm-b');
 const arms=pose==='reach'?`<g transform="rotate(-60 2 10)">${armA}</g><g transform="rotate(-75 13 10)">${armB}</g>`
  :pose==='hug'?(id==='alex'?`<g transform="rotate(55 2 9)">${armA}</g>${armB}`:`${armA}<g transform="rotate(-62 13 9)">${armB}</g>`):armA+armB;
 const bounds=pose==='reach'||pose==='hug'?'-5 0 26 32':'0 0 16 32';
 return `<svg viewBox="${bounds}"${pose?' preserveAspectRatio="xMidYMax meet"':''} class="journey-person" aria-hidden="true">${skinPiece(id,8,8,8,8,4,0)}${skinPiece(id,20,20,8,12,4,8)}${arms}${skinPiece(id,4,20,4,12,4,20,4,12,'person-leg leg-a')}${skinPiece(id,20,52,4,12,8,20,4,12,'person-leg leg-b')}</svg>`;
}
function pig(){const piece=(x,y,w,h,dx,dy,dw,dh)=>`<svg x="${dx}" y="${dy}" width="${dw}" height="${dh}" viewBox="${x} ${y} ${w} ${h}"><image href="${asset('pig')}" width="64" height="32"/></svg>`;return `<svg viewBox="0 0 20 15" class="journey-pig" aria-hidden="true">${piece(36,16,10,8,6,3,13,8)}${piece(4,20,4,6,7,10,3,5)}${piece(4,20,4,6,15,10,3,5)}${piece(8,8,8,8,0,2,9,9)}${piece(17,17,4,3,2,7,4,3)}</svg>`;}
const at=(x,y,w=1,h=1)=>`left:${x/16*100}%;top:${y/9*100}%;width:${w/16*100}%;height:${h/9*100}%`;
function scenery(l,index,s){
 let html=`<div class="journey-sky" aria-hidden="true"><i class="journey-sun"></i><i class="journey-cloud cloud-a"></i><i class="journey-cloud cloud-b"></i><i class="journey-mountain mountain-a" style="--rock:url('${asset('stone')}')"></i><i class="journey-mountain mountain-b" style="--rock:url('${asset('stone')}')"></i></div>`;
 for(let y=0;y<9;y++)for(let x=0;x<16;x++){
  const tile=baseJourneyTerrain(l,x,y);if(tile)html+=`<span class="journey-terrain ${tile==='water_still'?'journey-water':''}" style="${at(x,y)};background-image:url('${asset(tile)}')" aria-hidden="true"></span>`;
 }
 for(const x of l.trees||[]){for(const [dx,dy,t]of [[0,5,'oak_log'],[0,4,'oak_log'],[0,3,'oak_log'],[-1,2,'oak_leaves'],[0,2,'oak_leaves'],[1,2,'oak_leaves'],[0,1,'oak_leaves']])html+=`<span class="journey-decor ${t==='oak_leaves'?'tree-leaf':''}" style="${at(x+dx,dy)};background-image:url('${asset(t)}')" aria-hidden="true"></span>`;}
 if(['village','sunset'].includes(l.biome)){
  for(const [homeX,homeW]of l.biome==='village'?[[0,4],[10,5]]:[[9,6]]){
   for(let y=2;y<=5;y++)for(let x=homeX;x<homeX+homeW;x++){const tex=y===2?'oak_log':y===3&&(x===homeX+1||x===homeX+homeW-2)?'glass':'oak_planks';html+=`<span class="journey-house" style="${at(x,y)};background-image:url('${asset(tex)}')" aria-hidden="true"></span>`;}
  }
 }
 if(l.id==='gate')html+=`<span class="journey-door ${s.world[index].flags.powered?'open':''}" style="${at(12,3,1,3)};background-image:url('${asset('iron_door')}')" aria-hidden="true"></span>`;
 if(l.id==='alex')html+=`<div class="journey-meeting-light ${s.world[index].flags.lantern?'lit':''}" style="${at(9,2,5,4)}" aria-hidden="true"></div>`;
 if(l.id==='river'&&s.rulesVersion===2&&!s.world[index].flags.bridgeReleased)html+=`<span class="journey-suspended-log" style="${at(7,4,2,1)};background-image:url('${asset('oak_log')}')" aria-hidden="true"></span>`;
 if(l.id==='village'&&s.rulesVersion===2)html+=`<span class="journey-pulley-rope ${s.world[index].flags.counterweight?'released':''}" style="${at(7,2,2,4)};--wood:url('${asset('oak_planks')}');--stone:url('${asset('cobblestone')}')" aria-hidden="true"><i></i><b></b></span>`;
 if(l.id==='alex'&&s.done)html+=`<div class="journey-hearts" style="${at(10,2,4,4)}" aria-label="Steve i Alex razem">${[[5,50],[8,15],[30,0],[60,0],[88,15],[95,50],[15,80],[85,80]].map(([x,y],i)=>`<span style="--i:${i};left:${x}%;top:${y}%">♥</span>`).join('')}</div>`;
 return html;
}
function nodeLabel(n,ns){if(ns.done)return n.type==='chest'?'Skrzynia opróżniona':'Zebrane';return {log:'Zbierz drewno',pig:'Zdobądź jedzenie',berries:'Zbierz jagody',stone:'Wydobądź bruk',coal:'Wydobądź węgiel',iron:'Wydobądź żelazo',redstone:'Wydobądź redstone',well:ns.opened?'Otwórz odsłoniętą skrzynię':'Usuń głaz ze studni',chest:'Otwórz skrzynię',stove:'Użyj pieca',hearth:'Kamienne palenisko',lantern:'Zapal światło',prop:'Zwolnij podporę kłody',pulley:'Obciąż linę brukiem',alex:'Przywitaj Alex'}[n.type];}
function nodeIcon(n,ns,w){if(n.type==='pig')return pig();if(n.type==='alex')return journeyPerson('alex');
 const id={prop:'stick',pulley:'lever',log:'oak_log',berries:'sweet_berries',stone:'cobblestone',coal:'coal_ore',iron:'iron_ore',redstone:'redstone_ore',well:ns.opened?'chest_minecart':'cobblestone',chest:'chest_minecart',stove:(w.fuel[n.id]||0)>0?'furnace_front_on':'furnace_front',hearth:w.placed[90]==='furnace'?((w.fuel[n.id]||0)>0?'furnace_front_on':'furnace_front'):'stone_bricks',lantern:w.flags.lantern?'torch':'oak_log'}[n.type];return image(id);
}
function sceneHtml(l,index,s){const w=s.world[index],active=index===s.scene;
 let html=scenery(l,index,s);
 for(const [key,id]of Object.entries(w.placed)){const x=Number(key)%16,y=Math.floor(Number(key)/16);html+=`<span class="journey-placed ${['oak_planks','cobblestone'].includes(id)?'full-block':''}" style="${at(x,y)}" aria-hidden="true">${image(id)}</span>`;}
 for(const n of l.nodes){const ns=w.nodes[n.id]||{},done=ns.done,label=nodeLabel(n,ns),lit=l.id!=='mine'||journeyLit(s,index,n.x)||n.x<=5;
  html+=`<button class="journey-node node-${n.type} ${done?'depleted':''} ${lit?'':'unlit'} ${n.optional?'optional':''}" style="${at(n.x,n.type==='alex'?4:n.y,n.type==='pig'?1.5:1,n.type==='alex'?2:1)}" data-j-node="${n.id}" data-j-scene="${index}" aria-label="${escapeHtml(label)}${n.amount&&!done?', pozostało '+(ns.remaining??n.amount):''}" title="${escapeHtml(label)}" ${!active||done||s.done?'disabled':''} tabindex="${active?'0':'-1'}">${done&&!['chest','well','pulley'].includes(n.type)?'':nodeIcon(n,ns,w)}${done?'<span class="journey-collected">✓</span>':''}${n.optional&&!done?'<span class="journey-secret-dot" aria-hidden="true"></span>':''}</button>`;
 }
 if(active&&!s.done){
  if(s.effect?.kind==='loot'){const n=l.nodes.find(n=>n.id===s.effect.node);if(n)html+=`<span class="journey-loot-pop" style="${at(n.x-.3,n.y-1,2,1)}">+${s.effect.count}${image(s.effect.item)}</span>`;}
  const cells=[];if(l.build)for(let y=l.id==='river'?6:4;y<=6;y++)for(let x=8;x<=11;x++)if(!baseJourneyTerrain(l,x,y))cells.push([x,y]);
  if(l.id==='mine')for(let x=6;x<=14;x++)cells.push([x,4]);
  if(l.id==='forge')cells.push([10,5]);
  if(l.id==='gate')for(const x of [7,8,9,10,11])cells.push([x,5]);
  const torchTargets=l.id==='mine'?journeyTorchTargets(s):[];
  for(const [x,y]of cells){
   const item=w.placed[y*16+x],target=torchTargets.includes(x);
   const optional=l.id==='mine'&&!target&&!item;
   const label=target?'Tu postaw pochodnię':`Pole budowy ${x+1}, ${y+1}${item?', '+journeyItems[item]:''}`;
   html+=`<button class="journey-build ${item?'occupied':''} ${s.selected?'item-ready':''} ${target?'torch-target':''} ${optional?'torch-optional':''}" style="${at(x,y)}" data-j-x="${x}" data-j-y="${y}" aria-label="${escapeHtml(label)}" ${optional?'tabindex="-1"':''}>${target?image('torch','','torch-target-icon'):''}</button>`;
  }
  html+=`<button class="journey-exit" style="${at(l.exit,l.id==='ridge'?3:5)}" data-j-exit aria-label="Przejdź na drugi brzeg lub do końca drogi">→</button>`;
 }
 if(l.id==='mine'){for(let x=0;x<16;x++)html+=`<span class="journey-dark ${journeyLit(s,index,x)||x<=5?'is-lit':''}" style="${at(x,1,1,5)}" aria-hidden="true"></span>`;}
 return `<section class="journey-scene biome-${l.biome}" data-j-scene-panel="${index}" aria-label="${escapeHtml(l.name)}" aria-hidden="${!active}">${html}</section>`;
}
function feedback(root,s,a){if(reduced())return;
 root.querySelector('.journey-loot-pop')?.animate?.([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-28px)'}],{duration:800,fill:'forwards',easing:'ease-out'});const old=motion.get(root);if(old)clearTimeout(old);
 const actor=root.querySelector('.journey-actor');if(['node','next','travel','exit'].includes(a.type)){actor?.classList.add('walking');motion.set(root,setTimeout(()=>actor?.classList.remove('walking'),a.type==='next'||a.type==='travel'?1000:550));}
 if(s.effect?.node){const target=root.querySelector(`[data-j-node="${s.effect.node}"][data-j-scene="${s.scene}"]`);target?.animate?.([{transform:'scale(.85)'},{transform:'scale(1.08)'},{transform:'scale(1)'}],{duration:260,easing:'ease-out'});}
 if(['loot','craft','chest','smelt','eat','complete'].includes(s.effect?.kind))root.querySelector('.journey-message')?.animate?.([{opacity:.2,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:250});
}
export function renderAlexJourney(root,{playerId='guest'}={},actions={}){
 root.setAttribute('data-journey-player',String(playerId));
 if(!stateByPlayer.has(playerId))stateByPlayer.set(playerId,load(playerId));const s=stateByPlayer.get(playerId);
 if(s.done&&!unlockedChapters.has(playerId)){
  unlockedChapters.add(playerId);
  try{localStorage.setItem(chapterKey(playerId,'unlocked'),'2');}catch{}
 }
 if(!activeChapters.has(playerId)){
  try{
   if(localStorage.getItem(chapterKey(playerId,'unlocked'))==='2')unlockedChapters.add(playerId);
   activeChapters.set(playerId,Number(localStorage.getItem(chapterKey(playerId,'active')))||1);
  }catch{activeChapters.set(playerId,1);}
 }
 const unlocked=unlockedChapters.has(playerId);
 const secondComplete=unlocked&&hasCompletedRescue(playerId);
 const allowed=chapter=>chapter===1||chapter===2&&unlocked||chapter===3&&canPlayThirdChapter(unlocked&&hasCompletedRescue(playerId));
 const selectChapter=chapter=>{
  if(!allowed(chapter)||activeChapters.get(playerId)===chapter)return;
  activeChapters.set(playerId,chapter);
  try{localStorage.setItem(chapterKey(playerId,'active'),String(chapter));}catch{}
  renderAlexJourney(root,{playerId},actions);
 };
 let active=activeChapters.get(playerId);
 if(!allowed(active)){active=unlocked?2:1;activeChapters.set(playerId,active);}
 const visuals={
  person:journeyPerson,
  home:()=>scenery(journeyScene(s,9),9,{...s,done:false})+
   `<span class="rescue-prop" style="${at(10,4)}">${image('torch')}</span>`,
 };
 if(active===2)return renderAlexRescue(root,{playerId,actions,selectChapter,visuals});
 if(active===3)return renderAlexSiege(root,{playerId,actions,selectChapter,visuals});
 if(!views.has(playerId))views.set(playerId,{pan:defaultPan(s),lastScene:s.scene,recipes:false,hint:false,until:0});const ui=views.get(playerId);if(ui.lastScene!==s.scene){ui.pan=defaultPan(s);ui.lastScene=s.scene;}
 if(ui.showReunion&&s.done){
  return renderAlexComic(root,{kind:'reunion',playerId,visuals,onHome:()=>actions.goMinecraftModes?.(),onDone:()=>{
   ui.showReunion=false;
   renderAlexJourney(root,{playerId},actions);
   root.querySelector('[data-j-reunion]')?.focus({preventScroll:true});
  }});
 }
 const scene=journeyScene(s),objective=journeyObjective(s),finished=s.done&&s.scene===9,recipe=journeyRecipe(s.grid),current=s.discovered.filter(id=>journeyItems[id]).map(id=>[id,journeyItems[id]]);
 const act=a=>{if(Date.now()<ui.until&&a.type!=='undo')return;const before=s.scene;const wasDone=s.done;if(!journeyAction(s,a))return;
  const persisted=save(playerId,s);if(before!==s.scene){ui.pan=defaultPan(s);ui.lastScene=s.scene;ui.until=Date.now()+(reduced()?0:850);}else if(s.hero.scene===s.scene&&s.hero.x>9)ui.pan=4;
  if(!wasDone&&s.done)ui.showReunion=true;
  renderAlexJourney(root,{playerId},actions);
  const msg=root.querySelector('.journey-message');
  if(!persisted&&msg)msg.textContent+=' Przeglądarka nie zapisała postępu — zostaw kartę otwartą.';
  if(ui.showReunion)root.querySelector('.alex-comic-page')?.scrollIntoView?.({block:'start'});
  else feedback(root,s,a);
 };
 const heroSurface=Math.min(7,journeySurface(s,s.hero.scene,s.hero.x));
 patchBackpackView(root,`<main class="page journey-page ${finished?'is-finished':''}"><header class="journey-heading"><div><p class="eyebrow">MINECRAFT · JEDNA WYPRAWA</p><h1>Droga do Alex<span>Jeden świat. Jeden plecak.</span></h1></div><div class="game-view-tools">${gameFullscreenButton}<button class="ghost" data-j-home>← Minecraft</button></div></header>${gameRotationHint}${chapterMenu(1,unlocked,secondComplete)}<nav class="journey-chapters" aria-label="Odkryte miejsca">${journeyScenes.map((l,i)=>`<button class="${i===s.scene?'current':''} ${s.completed[i]?'visited':''}" data-j-travel="${i}" aria-label="${i+1}. ${escapeHtml(l.name)}" ${i>s.farthest?'disabled':''}>${s.completed[i]?'✓':i+1}</button>`).join('')}<span>${s.farthest+1}/10 miejsc</span></nav><div class="journey-layout"><section class="journey-play"><div class="journey-quest"><div><span>${s.scene+1} · ${scene.region}</span><h2>${scene.name}</h2><p class="journey-objective" aria-live="polite">${escapeHtml(objective[0])}</p><p class="journey-objective-detail">${escapeHtml(objective[1])}</p></div><button class="journey-hint-toggle ghost" data-j-hint aria-expanded="${ui.hint}">?</button></div><p class="journey-hint" ${ui.hint?'':'hidden'}>${scene.hint}</p><section class="journey-ending" aria-label="Podsumowanie wyprawy" ${finished?'':'hidden'}>${finished?`<div class="journey-ending-title"><span aria-hidden="true">♥</span><div><p class="eyebrow">KONIEC GRY · ALEX ODNALEZIONA</p><h2>Wreszcie razem.</h2></div></div><div class="journey-ending-stats"><span><b>${journeyTime(s)}</b>czas przejścia</span><span><b>10 / 10</b>miejsc</span><span><b>${s.looted}</b>odkrytych skrytek</span></div><p>Alex: „Już myślałam, że znowu poszedłeś po diamenty…”</p><button class="primary" type="button" data-journey-chapter="2">Przejdź do rozdziału 2 →</button><button class="ghost" data-j-reunion>Obejrzyj spotkanie</button><button class="ghost" data-j-restart>Zagraj jeszcze raz ↻</button>`:''}</section><div class="journey-camera" aria-label="Połączony świat, ${escapeHtml(scene.name)}"><div class="journey-track" style="--camera:${s.scene*16};--pan:${ui.pan}">${journeyScenes.map((l,i)=>sceneHtml(journeyScene(s,i),i,s)).join('')}<div class="journey-actor" style="left:${(s.hero.scene*16+s.hero.x+.5)/160*100}%;bottom:${(9-heroSurface)/9*100}%" aria-label="Steve">${journeyPerson()}</div></div><div class="journey-camera-vignette" aria-hidden="true"></div></div><div class="journey-underworld"><span>Kliknij świat · postaw wybrany przedmiot</span><div class="journey-look"><button class="ghost" data-j-look="-2" aria-label="Rozejrzyj się w lewo">←</button><span>Rozejrzyj się</span><button class="ghost" data-j-look="2" aria-label="Rozejrzyj się w prawo">→</button></div></div><div class="journey-quick" aria-label="Szybki plecak"><div class="journey-belt">${current.map(([id,name])=>`<button class="journey-slot ${s.selected===id?'selected':''}" data-j-item="${id}" aria-label="${name}: ${s.stock[id]||0}" ${s.stock[id]>0?'':'disabled'}>${image(id,name)}<b>${s.stock[id]||0}</b></button>`).join('')}</div><button class="ghost journey-to-pack" data-j-pack>Crafting ↓</button></div><p class="journey-message ${s.completed[s.scene]?'good':''}" role="status">${escapeHtml(s.message)}</p><div class="journey-route-actions"><button class="ghost" data-j-undo ${s.undo.length?'':'disabled'}>↶ Cofnij</button>${s.completed[s.scene]&&s.scene<9?'<button class="primary journey-next" data-j-next>Idź dalej <span>→</span></button>':'<span class="journey-food">Siły <b>'+s.food+'/8</b> · posiłek przyspiesza wydobycie</span>'}</div></section><aside class="journey-pack" id="journey-workbench"><button class="ghost journey-back-to-world" data-j-world>↑ Wróć do świata</button><div class="journey-pack-title"><h3>Twój plecak</h3><span>${Object.values(s.stock).reduce((n,v)=>n+v,0)} przedm.</span></div><div class="journey-inventory">${current.length?current.map(([id,name])=>`<button class="journey-slot ${s.selected===id?'selected':''}" data-j-item="${id}" draggable="${s.stock[id]>0}" aria-label="${name}: ${s.stock[id]||0}" aria-pressed="${s.selected===id}" ${s.stock[id]>0?'':'disabled'}>${image(id,name)}<b>${s.stock[id]||0}</b></button>`).join(''):'<p class="journey-empty">Na razie pusto.<br>Kliknij surowiec na polanie.</p>'}</div><div class="journey-selected">${s.selected?image(s.selected)+`<span>${journeyItems[s.selected]}</span>`:'Wybierz przedmiot, aby go użyć.'}${['cooked_porkchop','bread','sweet_berries'].includes(s.selected)?'<button class="ghost" data-j-eat>Zjedz</button>':''}</div><div class="journey-pack-title"><h3>Crafting</h3><button class="ghost" data-j-clear>Zwróć</button></div><div class="journey-crafting"><div class="journey-craft-grid">${s.grid.map((id,i)=>`<button class="journey-slot" data-j-slot="${i}" aria-label="Składnik ${i+1}${id?', '+journeyItems[id]:''}">${id?image(id):''}</button>`).join('')}</div><button class="journey-craft-output journey-slot" data-j-craft aria-label="${recipe?'Wytwórz '+journeyItems[recipe.id]:'Ułóż recepturę'}" ${recipe?'':'disabled'}>${recipe?image(recipe.id)+`<b>${recipe.count}</b>`:'→'}</button></div><details class="journey-recipes" ${ui.recipes?'open':''}><summary>Receptury · ułóż jednym kliknięciem</summary><div>${journeyRecipes.map(r=>`<button data-j-recipe="${r.id}" class="ghost">${image(r.id)}<span>${r.label}</span></button>`).join('')}</div></details><button class="ghost journey-restart" data-j-restart>Rozpocznij wyprawę od nowa</button></aside></div><footer class="journey-credit">Nieoficjalna przygoda fanowska · oryginalne tekstury i skórki Minecraft Java 1.21.4 · Mojang / Microsoft</footer></main>`);
 bindGamePresentation(root);
 bindChapterMenu(root,selectChapter);
 root.querySelector('[data-j-pack]').onclick=()=>root.querySelector('.journey-pack').scrollIntoView({behavior:reduced()?'auto':'smooth',block:'start'});
 root.querySelector('[data-j-world]').onclick=()=>root.querySelector('.journey-play').scrollIntoView({behavior:reduced()?'auto':'smooth',block:'start'});
 const replay=root.querySelector('[data-j-reunion]');
 if(replay)replay.onclick=()=>{ui.showReunion=true;renderAlexJourney(root,{playerId},actions);root.querySelector('.alex-comic-page')?.scrollIntoView?.({block:'start'});};
 root.querySelector('[data-j-home]').onclick=()=>actions.goMinecraftModes?.();
 root.querySelector('[data-j-hint]').onclick=()=>{ui.hint=!ui.hint;renderAlexJourney(root,{playerId},actions);};
 root.querySelectorAll('[data-j-restart]').forEach(b=>b.onclick=()=>{if(!window.confirm('Rozpocząć nową wyprawę? Stracisz postęp tej historii i jej plecak.'))return;stateByPlayer.set(playerId,createJourney());ui.pan=0;ui.until=0;ui.showReunion=false;save(playerId,stateByPlayer.get(playerId));renderAlexJourney(root,{playerId},actions);});
 root.querySelector('.journey-recipes').ontoggle=e=>ui.recipes=e.currentTarget.open;
 root.querySelectorAll('[data-j-travel]').forEach(b=>b.onclick=()=>act({type:'travel',scene:Number(b.getAttribute('data-j-travel'))}));
 root.querySelectorAll('[data-j-look]').forEach(b=>b.onclick=()=>{ui.pan=Math.max(0,Math.min(4,ui.pan+Number(b.getAttribute('data-j-look'))));renderAlexJourney(root,{playerId},actions);});
 root.querySelectorAll('[data-j-item]').forEach(b=>{b.onclick=()=>act({type:'select',item:b.getAttribute('data-j-item')});b.ondragstart=e=>{e.dataTransfer?.setData('text/plain',b.getAttribute('data-j-item'));};});
 const dropTarget=(b,fn)=>{b.ondragover=e=>{e.preventDefault();};b.ondrop=e=>{e.preventDefault();fn(e.dataTransfer?.getData('text/plain'));};};
 root.querySelectorAll('[data-j-slot]').forEach(b=>{b.onclick=()=>act({type:'slot',index:Number(b.getAttribute('data-j-slot'))});dropTarget(b,item=>act({type:'slot',index:Number(b.getAttribute('data-j-slot')),item}));});
 root.querySelectorAll('[data-j-node]').forEach(b=>{b.onclick=()=>act({type:'node',id:b.getAttribute('data-j-node')});dropTarget(b,item=>act({type:'node',id:b.getAttribute('data-j-node'),item}));});
 root.querySelectorAll('[data-j-x]').forEach(b=>{const a={x:Number(b.getAttribute('data-j-x')),y:Number(b.getAttribute('data-j-y'))};b.onclick=()=>{if(scene.id==='gate'&&a.x===7&&s.world[s.scene].placed[a.y*16+a.x]==='lever')act({type:'switch'});else if(scene.id==='forge'&&a.x===10&&s.world[s.scene].placed[a.y*16+a.x]==='furnace')act({type:'node',id:'hearth'});else act({type:'tile',...a});};b.oncontextmenu=e=>{e.preventDefault();act({type:'remove',...a});};dropTarget(b,item=>{if(scene.id==='forge'&&a.x===10&&s.world[s.scene].placed[a.y*16+a.x]==='furnace')act({type:'node',id:'hearth',item});else act({type:'tile',...a,item});});});
 root.querySelectorAll('[data-j-recipe]').forEach(b=>b.onclick=()=>act({type:'prepare',id:b.getAttribute('data-j-recipe')}));
 for(const [sel,type]of [['[data-j-next]','next'],['[data-j-exit]','exit'],['[data-j-craft]','craft'],['[data-j-clear]','clear'],['[data-j-undo]','undo'],['[data-j-eat]','eat']]){const b=root.querySelector(sel);if(b)b.onclick=()=>act({type});}
}
