import {escapeHtml} from './utils.js?v=20260903-7';
import {patchBackpackView} from './backpackMotion.js?v=20261117-10';
import {createRescue,rescueAction,rescueItems,rescueScenes,rescueSceneReady,restoreRescue,saveRescue} from './alexJourneyRescue.js?v=20261119-25';
import {journeyHearts,renderAlexComic} from './alexJourneyComic.js?v=20261119-24';
import {bindChapterMenu,chapterMenu} from './alexJourneyChapters.js?v=20261119-16';

import {gameFullscreenButton,gameRotationHint,bindGamePresentation} from './gamePresentation.js?v=20261118-11';

import {minecraftHintPanel,bindMinecraftHints} from './minecraftHints.js?v=20261118-19';
import {alexHintOptions} from './alexJourneyHints.js?v=20261119-25';
const sessions=new Map();
const asset=id=>new URL(`../assets/minecraft/backpack/${id}.png`,import.meta.url).href;
const image=id=>`<img src="${asset(id)}" alt="" draggable="false">`;
const at=(x,y,width=1,height=1)=>`left:${x/16*100}%;top:${y/9*100}%;width:${width/16*100}%;height:${height/9*100}%`;
const block=(x,y,id)=>`<i class="rescue-block" style="${at(x,y)};background-image:url('${asset(id)}')"></i>`;
const prop=(x,y,id,height=1,width=1)=>`<span class="rescue-prop" style="${at(x,y,width,height)}">${image(id)}</span>`;
const rails=(x,length)=>`<i class="rescue-rails" style="${at(x,5.78,length,.22)};--rail-length:${length}"></i>`;
const detail=(className,x,y,width,height)=>`<i class="${className}" style="${at(x,y,width,height)}" aria-hidden="true"></i>`;

function rescueReunion(person,animate){
 const actor=(id,x)=>`<div class="rescue-actor rescue-reunion-${id}" style="${at(x,4,2.2,2)}">
  <div class="rescue-reunion-stand">${person(id,'stand')}</div>
  <div class="rescue-reunion-hug">${person(id,'hug')}</div>
 </div>`;
 return `<div class="rescue-reunion ${animate?'rescue-reuniting':''}" role="img" aria-label="Steve i Alex przytulają się po ucieczce z celi">
  <span class="rescue-reunion-light" style="${at(9.5,1.9,6.5,5)}"></span>
  ${actor('steve',11.3)}${actor('alex',12.27)}
  ${journeyHearts(at(10.8,2.65,4.6,3.65))}
 </div>`;
}

function mineScenery(lampLit){
 let html=rails(5,4);
 for(let y=1;y<6;y++)html+=block(4,y,'rescue_spruce_log');
 for(const x of [3,5])html+=block(x,1,'rescue_spruce_log');
 for(const [offset,top] of [5,5,4,4,3,2,2].entries()){
  for(let y=top;y<6;y++)html+=block(9+offset,y,'rescue_deepslate');
 }
 if(lampLit)html+=`<span class="rescue-light" style="${at(1.5,1.3,7,6)}"></span>`;
 return html;
}

function forgeScenery(flags){
 let html='';
 for(let x=4;x<=8;x++)html+=block(x,0,'deepslate_tiles');
 for(let y=1;y<4;y++)html+=block(6,y,'deepslate_tiles');
 html+=block(6,4,'stone_bricks')+block(6,5,'furnace_front')+block(11,5,'smithing_table_front')+block(12,5,'smithing_table_front')+block(13,5,'smithing_table_front');
 html+=detail('rescue-recipe-board',10.6,1.7,3.8,3.4);
 html+=`<span class="rescue-recipe-arrow" style="${at(12,3,1,1)}" aria-hidden="true">→</span>`;
 html+=prop(2,3,'lantern_item')+prop(14,3,'lantern_item');
 if(flags.fuel)html+=detail('rescue-light',3.6,2.4,5.7,5);
 return html;
}

function sluiceScenery(flags){
 let html='';
 for(let x=0;x<7;x++){
  for(let y=2;y<4;y++)if(x<6)html+=block(x,y,'rescue_water');
  html+=block(x,4,'stone_bricks');
 }
 for(const x of [0,7])for(let y=1;y<4;y++)html+=block(x,y,'stone_bricks');
 html+=`<i class="rescue-sluice-gate" style="${at(6,flags.flood?.5:1.8,1,2.2)};--gate-texture:url('${asset('iron_bars')}')"></i>`;
 if(flags.flood)html+=detail('rescue-spill',6,3.8,2.1,3.2);
 html+=detail(`rescue-drive ${flags.repair?'connected':''}`,4.5,4.12,2,.08);
 for(const [x,y] of [[9,2],[10,2],[11,2],[9,3],[11,3]])html+=block(x,y,'rescue_spruce_log');
 return html;
}

function lairScenery(flags){
 let html=rails(3,3)+prop(6,5.8,'light_weighted_pressure_plate',.2);
 const wire=flags.weight?'rescue-hatch-wire powered':'rescue-hatch-wire';
 html+=detail(wire,6.5,5.91,2.6,.06)+detail(wire,9.04,.6,.06,5.35)+detail(wire,9.04,.6,.46,.06);
 if(flags.hatch){
  html+=`<i class="rescue-open-hatch" style="${at(8.8,.12,.96,.23)};--hatch-texture:url('${asset('oak_planks')}')"></i>`;
  html+=detail('rescue-sunbeam',9,0,3,6);
 }
 if(!flags.cell)html+=detail('rescue-cell-bars',12,2.1,.85,3.9);
 for(let x=12;x<16;x++)html+=block(x,1.1,'stone_bricks');
 for(let y=2;y<6;y++)html+=block(15,y,'stone_bricks');
 return html;
}

function scenery(scene,state){
 const {biome}=scene,flags=state.flags;
 const floor={armory:'oak_planks',mine:'deepslate_tiles',forge:'stone_bricks',sluice:'deepslate_tiles',lair:'stone_bricks'}[biome];
 let html='';
 for(let x=0;x<16;x++)for(let y=6;y<9;y++){
  const channel=biome==='sluice'&&x>=7&&x<=12&&y===6;
  if(!channel||flags.flood){
   const channelBed=biome==='sluice'&&x>=7&&x<=12&&y===7;
   html+=block(x,y,channel?'rescue_water':channelBed?'rescue_prismarine':floor);
  }
 }
 if(biome==='armory'){
  for(let x=0;x<16;x++)html+=block(x,1,'oak_log');
  for(const x of [0,15])for(let y=2;y<6;y++)html+=block(x,y,'oak_log');
  html+=block(3,3,'glass')+block(4,3,'glass')+block(3,4,'oak_planks');
  html+=prop(1,3,'lantern_item')+prop(14,3,'lantern_item');
  html+=prop(6.85,5.55,'rescue_bed',.45,3)+prop(10.3,3.29,'bell');
  if(!flags.tripwire)html+=`<i class="rescue-cord-drop" style="${at(10.8,4.1,.05,.46)}"></i><i class="rescue-cord-drop" style="${at(13.42,4.55,.05,.68)}"></i>`;
 }else if(biome==='forge'){
  html+=forgeScenery(flags);
 }else{
  for(let x=0;x<16;x++)if(biome!=='lair'||x!==9)html+=block(x,0,'deepslate_tiles');
  if(biome==='mine')html+=mineScenery(flags.lamp);
  if(biome==='sluice')html+=sluiceScenery(flags);
  if(biome==='lair')html+=lairScenery(flags);
 }
 return html;
}

function renderScene(scene,index,state,visuals){
 const flags=state.flags,active=index===state.scene;
 const effect=active?state.effect:'';
 let html=index===0?visuals.home():scenery(scene,state);
 if(index===0&&flags.embrace){
  html+=prop(13.2,5.58,'rescue_chock',.28,.55);
  for(const [x,y] of [[13.7,5.78],[14.12,5.88],[14.55,5.78],[14.98,5.88]])html+=detail('rescue-footprint',x,y,.2,.09);
 }
 if(scene.biome==='sluice'&&(!flags.flood||effect==='flood')){
  for(const [i,x]of (flags.ring?[7.55,9.05,10.55]:[12.85,13.8,14.75]).entries()){
   html+=`<span class="rescue-actor rescue-horde ${flags.flood?'rescue-horde-swept':''}" style="${at(x,flags.ring?5:4,.95,2)};--mob:${i}">${visuals.person('zombie','stand')}</span>`;
  }
 }
 if(scene.biome==='lair'&&flags.rescue)html+=rescueReunion(visuals.person,effect==='reunion');
 for(const entry of scene.nodes){
  const complete=Boolean(flags[entry.id]);
  if((entry.reveal&&!entry.after.every(key=>flags[key]))||
     (complete&&['embrace','warden','cell','rescue','ore','coal','shears','chock','hatch'].includes(entry.id)))continue;
  const x=complete&&entry.doneX!==undefined?entry.doneX:entry.x;
  const locked=entry.after?.some(key=>!flags[key]);
  const character=entry.character;
  const wire=entry.id==='tripwire';
  const cell=entry.id==='cell';
  let art=wire?'<span class="rescue-wire"></span>':cell?'<span class="rescue-cell-lock" aria-hidden="true"></span>':character?visuals.person(entry.texture,'stand'):image(complete&&entry.doneTexture||entry.texture);
  if(entry.id==='warden')art+=`<span class="rescue-key-marker" aria-hidden="true">${image('tripwire_hook')}</span>`;
  const bounds=wire?at(x,entry.y,2.66,.8):cell?at(x,2.1,.85,3.9):entry.width?at(x,entry.y,entry.width,entry.height):at(x-.2,character?4:entry.y,1.4,character?2:1);
  const classes=[character?'rescue-character':'',complete?'is-complete':'',locked?'is-blocked':'',
   entry.id==='guard'?'guard-asleep':'',wire?'rescue-wire-target':'',
   entry.width?'rescue-fitted-node':'',entry.wallTile?'rescue-wall-tile':'',entry.slot?'rescue-recipe-slot':'',
   !locked&&!complete&&entry.need===state.selected&&state.stock[entry.need]>0?'is-tool-target':'',
   entry.id==='warden'&&flags.hatch?'warden-lit':'',complete&&entry.doneX!==undefined?'cart-rolled':''].join(' ');
  const enabled=active&&!state.done&&(!complete||entry.repeat);
  html+=`<button type="button" class="rescue-node ${classes}" style="${bounds}" data-rescue-node="${entry.id}" aria-label="${escapeHtml(entry.label)}" ${enabled?'':'disabled'}>${art}${entry.id==='guard'?'<span class="guard-indicator" aria-hidden="true">Zz</span>':''}${enabled?`<span class="rescue-target-label" aria-hidden="true">${escapeHtml(entry.label)}</span>`:''}</button>`;
 }
 return `<section class="rescue-scene rescue-${scene.biome} ${index===0?'biome-sunset':''} effect-${effect}" aria-hidden="${!active}" aria-label="${escapeHtml(scene.name)}">${html}</section>`;
}

function getSession(playerId){
 if(!sessions.has(playerId)){
  let raw;
  try{raw=localStorage.getItem(`grygrupowe-alex-rescue-v1:${playerId}`);}catch{}
  sessions.set(playerId,restoreRescue(raw));
 }
 return sessions.get(playerId);
}

export function hasCompletedRescue(playerId){return getSession(playerId).done;}

export function resetAlexRescue(playerId){
 localStorage.removeItem(`grygrupowe-alex-rescue-v1:${playerId}`);
 sessions.set(playerId,createRescue());
}

function storeSession(playerId,state){
 try{localStorage.setItem(`grygrupowe-alex-rescue-v1:${playerId}`,saveRescue(state));return true;}catch{return false;}
}

export function renderAlexRescue(root,{playerId,actions,visuals,selectChapter,rank}){
 const state=getSession(playerId),scene=rescueScenes[state.scene];
 rank.observe(2,state.done);
 if(state.scene===0&&!state.flags.embrace){
  return renderAlexComic(root,{kind:'raid',playerId,visuals,onHome:()=>actions.goMinecraftModes?.(),onDone:()=>{
   if(!state.log.length)state.startedAt=Date.now();
   // The existing opening move keeps both new and older saves replayable.
   rescueAction(state,{type:'node',id:'embrace'});
   state.effect='';
   if(!storeSession(playerId,state))state.message+=' Nie udało się zapisać postępu.';
   renderAlexRescue(root,{playerId,actions,visuals,selectChapter,rank});
   root.querySelector('[data-rescue-node="trail"]')?.focus({preventScroll:true});
  }});
 }
 const stock=Object.entries(state.stock).filter(([,count])=>count>0);
 const readyToLeave=!state.done&&rescueSceneReady(state,scene);
 const elapsed=Math.max(1,Math.round((state.finishedAt-state.startedAt)/1000));
 const act=action=>{
  if(!rank.canMove(2))return;
  const wasDone=state.done;
  if(!rescueAction(state,action))return;
  if(!wasDone&&state.done)actions.completeSoloGame?.('minecraft-journey', `chapter-2:${state.startedAt}`, state.startedAt, state.finishedAt);
  if(!storeSession(playerId,state))state.message+=' Nie udało się zapisać postępu.';
  renderAlexRescue(root,{playerId,actions,visuals,selectChapter,rank});
  if(!wasDone&&state.done)root.querySelector('.rescue-quest h2')?.focus({preventScroll:true});
 };
 patchBackpackView(root,`<main class="page journey-page rescue-page ${state.done?'rescue-finished':''}">
  <header class="journey-heading"><div><p class="eyebrow">MINECRAFT · ROZDZIAŁ 2</p><h1>Śladami zombie</h1></div><div class="game-view-tools">${gameFullscreenButton}<button class="ghost" type="button" data-rescue-home>← Minecraft</button></div></header>
  ${gameRotationHint}
  ${chapterMenu(2,true,state.done)}
  ${rank.html()}
  <div class="rescue-layout"><section class="journey-play">
   <div class="rescue-quest"><div><p class="eyebrow">${state.scene+1} / ${rescueScenes.length} · ${scene.region}</p><h2 ${state.done?'tabindex="-1"':''}>${state.done?'Alex uratowana!':scene.name}</h2><p>${state.done?`${state.steps} ruchów · ${Math.floor(elapsed/60)}:${String(elapsed%60).padStart(2,'0')}`:escapeHtml(readyToLeave?'Droga wolna. Ruszaj dalej.':scene.goal)}</p>${!state.done&&!readyToLeave?`<p class="rescue-clue">${escapeHtml(scene.clue)}</p>`:''}</div>
   </div>
   ${minecraftHintPanel(root,actions,alexHintOptions(2,state.scene,scene,!state.done&&!readyToLeave))}
   <div class="rescue-camera"><div class="rescue-track" style="--scene:${state.scene}">
     ${rescueScenes.map((item,index)=>renderScene(item,index,state,visuals)).join('')}
     ${state.done?'':`<div class="rescue-hero ${state.effect==='strike'?'hero-strike':''}" style="--hero:${state.scene*16+state.hero}" aria-hidden="true">${visuals.person('steve')}</div>`}
   </div></div>
   <div class="rescue-foot"><p role="status">${escapeHtml(state.message)}</p>${readyToLeave?'<button class="primary journey-next" type="button" data-rescue-next>Idź dalej →</button>':''}${state.done?'<button class="ghost" type="button" data-rescue-replay>Obejrzyj spotkanie ↻</button>':''}</div>
  </section><aside class="journey-pack rescue-pack"><h3>Plecak</h3>
   ${stock.length?`<div class="journey-inventory">${stock.map(([id,count])=>`<button type="button" class="journey-slot ${state.selected===id?'selected':''}" data-rescue-item="${id}" aria-label="${rescueItems[id]}: ${count}" aria-pressed="${state.selected===id}" draggable="${!state.done}" ${state.done?'disabled':''}>${image(id)}<b>${count}</b></button>`).join('')}</div>`:'<p>Pusto</p>'}
   ${state.stock[state.selected]>0?`<p class="rescue-selected">${rescueItems[state.selected]}</p>`:''}
  </aside></div>
  <footer class="journey-credit">Nieoficjalna przygoda fanowska · tekstury Minecraft Java Edition 1.21.4 · Mojang / Microsoft</footer>
 </main>`);
 bindGamePresentation(root);
 bindChapterMenu(root,selectChapter);
 rank.bind();
 root.querySelector('[data-rescue-home]').onclick=()=>actions.goMinecraftModes?.();
 bindMinecraftHints(root,actions,()=>renderAlexRescue(root,{playerId,actions,visuals,selectChapter,rank}));
 root.querySelectorAll('[data-rescue-node]:not(:disabled)').forEach(button=>{
  const id=button.dataset.rescueNode;
  button.onclick=()=>act({type:'node',id});
  button.ondragover=event=>{if(event.dataTransfer?.types.includes('application/x-rescue-item'))event.preventDefault();};
  button.ondrop=event=>{
   const item=event.dataTransfer?.getData('application/x-rescue-item');
   if(!item)return;
   event.preventDefault();
   act({type:'node',id,item});
  };
 });
 root.querySelectorAll('[data-rescue-item]:not(:disabled)').forEach(button=>{
  button.onclick=()=>act({type:'select',id:button.dataset.rescueItem});
  button.ondragstart=event=>event.dataTransfer?.setData('application/x-rescue-item',button.dataset.rescueItem);
 });
 const next=root.querySelector('[data-rescue-next]');
 if(next)next.onclick=()=>act({type:'next'});
 const replay=root.querySelector('[data-rescue-replay]');
 if(replay)replay.onclick=()=>{
  const reunion=root.querySelector('.rescue-reunion');
  if(!reunion.classList.contains('rescue-reuniting')){
   state.effect='reunion';
   renderAlexRescue(root,{playerId,actions,visuals,selectChapter,rank});
  }else{
   for(const animation of reunion.getAnimations?.({subtree:true})||[]){
    animation.currentTime=0;
    animation.play();
   }
  }
  root.querySelector('.rescue-camera')?.scrollIntoView?.({block:'nearest'});
 };
}
