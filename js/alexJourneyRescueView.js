import {escapeHtml} from './utils.js?v=20260903-7';
import {patchBackpackView} from './backpackMotion.js?v=20261117-10';
import {createRescue,rescueAction,rescueItems,rescueScenes,restoreRescue,saveRescue} from './alexJourneyRescue.js?v=20261119-23';
import {renderAlexComic} from './alexJourneyComic.js?v=20261119-21';
import {bindChapterMenu,chapterMenu} from './alexJourneyChapters.js?v=20261119-16';

import {gameFullscreenButton,gameRotationHint,bindGamePresentation} from './gamePresentation.js?v=20261118-11';

import {minecraftHintPanel,bindMinecraftHints} from './minecraftHints.js?v=20261118-19';
import {alexHintOptions} from './alexJourneyHints.js?v=20261119-23';
const sessions=new Map();
const asset=id=>new URL(`../assets/minecraft/backpack/${id}.png`,import.meta.url).href;
const image=id=>`<img src="${asset(id)}" alt="" draggable="false">`;
const at=(x,y,width=1,height=1)=>`left:${x/16*100}%;top:${y/9*100}%;width:${width/16*100}%;height:${height/9*100}%`;
const block=(x,y,id)=>`<i class="rescue-block" style="${at(x,y)};background-image:url('${asset(id)}')"></i>`;
const prop=(x,y,id,height=1,width=1)=>`<span class="rescue-prop" style="${at(x,y,width,height)}">${image(id)}</span>`;
const rails=(x,length)=>`<i class="rescue-rails" style="${at(x,5.78,length,.22)};--rail-length:${length}"></i>`;
const hearts=(x,y)=>`<span class="rescue-hearts" style="${at(x,y,2,1)}" aria-hidden="true">♥ ♥ <b>♥</b></span>`;

function mineScenery(lampLit){
 let html=rails(5,6);
 for(let y=1;y<6;y++)html+=block(4,y,'rescue_spruce_log');
 for(const x of [3,5])html+=block(x,1,'rescue_spruce_log');
 for(const [offset,top] of [5,4,3,2,2].entries()){
  for(let y=top;y<6;y++)html+=block(11+offset,y,'rescue_deepslate');
 }
 if(lampLit)html+=`<span class="rescue-light" style="${at(1.5,1.3,7,6)}"></span>`;
 return html;
}

function scenery(scene,state){
 const {biome}=scene,flags=state.flags;
 const floor={armory:'oak_planks',mine:'deepslate_tiles',forge:'stone_bricks',sluice:'deepslate_tiles',lair:'stone_bricks'}[biome];
 let html='';
 for(let x=0;x<16;x++)for(let y=6;y<9;y++){
  const channel=biome==='sluice'&&x>=7&&x<=11&&y===6;
  html+=block(x,y,channel?flags.flood?'rescue_water':'rescue_prismarine':floor);
 }
 if(biome==='armory'){
  for(let x=0;x<16;x++)html+=block(x,1,'oak_log');
  for(const x of [0,15])for(let y=2;y<6;y++)html+=block(x,y,'oak_log');
  html+=block(3,3,'glass')+block(4,3,'glass')+block(3,4,'oak_planks');
  html+=prop(1,3,'lantern_item')+prop(14,3,'lantern_item');
  html+=prop(6.85,5.55,'rescue_bed',.45,3)+prop(10.3,3.29,'bell');
  if(!flags.tripwire)html+=`<i class="rescue-cord-drop" style="${at(10.8,4.1,.05,.46)}"></i><i class="rescue-cord-drop" style="${at(13.42,4.55,.05,.68)}"></i>`;
 }else if(biome==='forge'){
  for(const x of [1,5,9,14])html+=block(x,3,'stone_bricks')+block(x,4,'stone_bricks');
  html+=prop(4,3,'lantern_item')+prop(11,3,'lantern_item');
 }else{
  for(let x=0;x<16;x++)if(biome!=='lair'||x!==7||!flags.hatch)html+=block(x,0,'deepslate_tiles');
  if(biome==='mine')html+=mineScenery(flags.lamp);
  if(biome==='sluice'){
   html+=block(6,5,'stone_bricks')+block(12,5,'stone_bricks');
   for(let x=7;x<=11;x++)html+=block(x,7,flags.flood?'rescue_water':'rescue_prismarine');
  }
  if(biome==='lair'){
   html+=rails(3,3)+prop(6,5.8,'light_weighted_pressure_plate',.2);
   for(let y=3;y<6;y++)html+=flags.cell?'':block(12,y,'iron_bars');
   if(flags.hatch)html+=`<span class="rescue-sunbeam" style="${at(7,0,4,6)}"></span>`;
  }
 }
 return html;
}

function renderScene(scene,index,state,visuals){
 const flags=state.flags,active=index===state.scene;
 const effect=active?state.effect:'';
 let html=index===0?visuals.home():scenery(scene,state);
 if(index===4&&!flags.flood){
  for(const [i,x]of (flags.ring?[7.5,9,10.5]:[10,12.5,14]).entries()){
   html+=`<span class="rescue-actor rescue-horde" style="${at(x,4,1.2,2)};--mob:${i}">${visuals.person('zombie')}</span>`;
  }
 }
 if(index===5&&flags.rescue)html+=hearts(12.8,3.2);
 for(const entry of scene.nodes){
  const complete=Boolean(flags[entry.id]);
  if((entry.reveal&&!entry.after.every(key=>flags[key]))||
     (complete&&['embrace','warden','cell','ore','coal','shears','chock'].includes(entry.id)))continue;
  const x=complete&&entry.doneX!==undefined?entry.doneX:entry.x;
  const locked=entry.after?.some(key=>!flags[key]);
  const character=entry.character;
  const wire=entry.id==='tripwire';
  const cell=entry.id==='cell';
  const art=wire?'<span class="rescue-wire"></span>':cell?'':character?visuals.person(entry.texture):image(complete&&entry.doneTexture||entry.texture);
  const bounds=wire?at(x,entry.y,2.66,.8):cell?at(x,3,1,3):entry.width?at(x,entry.y,entry.width,entry.height):at(x-.2,character?4:entry.y,1.4,character?2:1);
  const classes=[character?'rescue-character':'',complete?'is-complete':'',locked?'is-blocked':'',
   entry.id==='guard'?'guard-asleep':'',wire?'rescue-wire-target':'',
   entry.width?'rescue-fitted-node':'',entry.wallTile?'rescue-wall-tile':'',
   entry.id==='warden'&&flags.hatch?'warden-lit':'',complete&&entry.doneX!==undefined?'cart-rolled':''].join(' ');
  html+=`<button type="button" class="rescue-node ${classes}" style="${bounds}" data-rescue-node="${entry.id}" aria-label="${escapeHtml(entry.label)}" title="${escapeHtml(entry.label)}" ${!active||state.done||complete&&!entry.repeat?'disabled':''}>${art}${entry.id==='guard'?'<span class="guard-indicator" aria-hidden="true">Zz</span>':''}</button>`;
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
 const readyToLeave=state.flags[scene.finish]&&!state.done;
 const title=state.scene===0&&state.flags.embrace?'Alex zniknęła. Zbadaj ślady przy drzwiach.':scene.goal;
 const elapsed=Math.max(1,Math.round((state.finishedAt-state.startedAt)/1000));
 const act=action=>{
  if(!rank.canMove(2))return;
  const wasDone=state.done;
  if(!rescueAction(state,action))return;
  if(!wasDone&&state.done)actions.completeSoloGame?.('minecraft-journey', `chapter-2:${state.startedAt}`, state.startedAt, state.finishedAt);
  if(!storeSession(playerId,state))state.message+=' Nie udało się zapisać postępu.';
  renderAlexRescue(root,{playerId,actions,visuals,selectChapter,rank});
 };
 patchBackpackView(root,`<main class="page journey-page rescue-page ${state.done?'rescue-finished':''}">
  <header class="journey-heading"><div><p class="eyebrow">MINECRAFT · ROZDZIAŁ 2</p><h1>Śladami zombie</h1></div><div class="game-view-tools">${gameFullscreenButton}<button class="ghost" type="button" data-rescue-home>← Minecraft</button></div></header>
  ${gameRotationHint}
  ${chapterMenu(2,true,state.done)}
  ${rank.html()}
  <div class="rescue-layout"><section class="journey-play">
   <div class="rescue-quest"><div><p class="eyebrow">${state.scene+1} / ${rescueScenes.length} · ${scene.region}</p><h2>${state.done?'Alex uratowana!':scene.name}</h2><p>${state.done?`${state.steps} ruchów · ${Math.floor(elapsed/60)}:${String(elapsed%60).padStart(2,'0')}`:escapeHtml(readyToLeave?'Droga wolna. Ruszaj dalej.':title)}</p></div>
   </div>
   ${minecraftHintPanel(root,actions,alexHintOptions(2,state.scene,scene,!state.flags[scene.finish]))}
   <div class="rescue-camera"><div class="rescue-track" style="--scene:${state.scene}">
     ${rescueScenes.map((item,index)=>renderScene(item,index,state,visuals)).join('')}
     <div class="rescue-hero ${state.effect==='strike'?'hero-strike':''}" style="--hero:${state.scene*16+state.hero}" aria-hidden="true">${visuals.person('steve')}</div>
   </div></div>
   <div class="rescue-foot"><p role="status">${escapeHtml(state.message)}</p>${readyToLeave?'<button class="primary journey-next" type="button" data-rescue-next>Idź dalej →</button>':''}</div>
  </section><aside class="journey-pack rescue-pack"><h3>Plecak</h3>
   ${stock.length?`<div class="journey-inventory">${stock.map(([id,count])=>`<button type="button" class="journey-slot ${state.selected===id?'selected':''}" data-rescue-item="${id}" aria-label="${rescueItems[id]}: ${count}" aria-pressed="${state.selected===id}" ${state.done?'disabled':''}>${image(id)}<b>${count}</b></button>`).join('')}</div>`:'<p>Pusto</p>'}
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
  button.onclick=()=>act({type:'node',id:button.dataset.rescueNode});
 });
 root.querySelectorAll('[data-rescue-item]:not(:disabled)').forEach(button=>{
  button.onclick=()=>act({type:'select',id:button.dataset.rescueItem});
 });
 const next=root.querySelector('[data-rescue-next]');
 if(next)next.onclick=()=>act({type:'next'});
}
