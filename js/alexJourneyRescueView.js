import {escapeHtml} from './utils.js?v=20260903-7';
import {patchBackpackView} from './backpackMotion.js?v=20261117-10';
import {createRescue,rescueAction,rescueItems,rescueScenes,restoreRescue,saveRescue} from './alexJourneyRescue.js?v=20261118-18';
import {renderAlexComic} from './alexJourneyComic.js?v=20261118-18';
import {bindChapterMenu,chapterMenu} from './alexJourneyChapters.js?v=20261118-17';

import {gameFullscreenButton,gameRotationHint,bindGamePresentation} from './gamePresentation.js?v=20261118-11';

import {minecraftHintPanel,bindMinecraftHints} from './minecraftHints.js?v=20261118-19';
import {alexHintOptions} from './alexJourneyHints.js?v=20261118-19';
const sessions=new Map();
const asset=id=>new URL(`../assets/minecraft/backpack/${id}.png`,import.meta.url).href;
const image=id=>`<img src="${asset(id)}" alt="" draggable="false">`;
const at=(x,y,width=1,height=1)=>`left:${x/16*100}%;top:${y/9*100}%;width:${width/16*100}%;height:${height/9*100}%`;
const block=(x,y,id)=>`<i class="rescue-block" style="${at(x,y)};background-image:url('${asset(id)}')"></i>`;
const prop=(x,y,id,height=1)=>`<span class="rescue-prop" style="${at(x,y,1,height)}">${image(id)}</span>`;
const hearts=(x,y)=>`<span class="rescue-hearts" style="${at(x,y,2,1)}" aria-hidden="true">♥ ♥ <b>♥</b></span>`;

function scenery(scene,state){
 const {biome}=scene,flags=state.flags;
 const floor={armory:'oak_planks',mine:'deepslate_tiles',forge:'stone_bricks',sluice:'deepslate_tiles',lair:'stone_bricks'}[biome];
 let html='';
 for(let x=0;x<16;x++)for(let y=6;y<9;y++){
  const channel=biome==='sluice'&&x>=7&&x<=11&&y===6;
  html+=block(x,y,channel?flags.flood?'water_still':'prismarine':floor);
 }
 if(biome==='armory'){
  for(let x=0;x<16;x++)html+=block(x,1,'oak_log');
  for(const x of [0,15])for(let y=2;y<6;y++)html+=block(x,y,'oak_log');
  html+=block(3,3,flags.shutter?'oak_planks':'glass')+block(6,5,'bookshelf')+block(9,6,'white_wool');
  html+=prop(1,3,'lantern')+prop(14,3,'lantern');
 }else if(biome==='forge'){
  for(const x of [1,5,9,14])html+=block(x,3,'stone_bricks')+block(x,4,'stone_bricks');
  html+=prop(4,3,'lantern')+prop(11,3,'lantern');
 }else{
  for(let x=0;x<16;x++)if(biome!=='lair'||x!==7||!flags.hatch)html+=block(x,0,'deepslate_tiles');
  if(biome==='mine'){
   for(let x=5;x<12;x++)html+=prop(x,5.65,'rail',.35);
   if(flags.lamp)html+=`<span class="rescue-light" style="${at(1,1,7,6)}"></span>`;
  }
  if(biome==='sluice'){
   html+=block(6,5,'stone_bricks')+block(12,5,'stone_bricks');
   for(let x=7;x<=11;x++)html+=block(x,7,flags.flood?'water_still':'prismarine');
  }
  if(biome==='lair'){
   for(let x=3;x<7;x++)html+=prop(x,5.65,'rail',.35);
   html+=prop(6,5.8,'light_weighted_pressure_plate',.2);
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
     (complete&&['embrace','warden','cell','ore','coal','wool','chock'].includes(entry.id)))continue;
  const x=complete&&entry.doneX!==undefined?entry.doneX:entry.x;
  const locked=entry.after?.some(key=>!flags[key]);
  const label=entry.id==='guard'&&flags.alert?'Wycofaj się od obudzonego strażnika':entry.label;
  const character=entry.character;
  const art=character?visuals.person(entry.texture):image(complete&&entry.doneTexture||entry.texture);
  const classes=[character?'rescue-character':'',complete?'is-complete':'',locked?'is-blocked':'',
   entry.id==='guard'?(flags.alert?'guard-awake':'guard-asleep'):'',
   entry.id==='warden'&&flags.hatch?'warden-lit':'',complete&&entry.doneX!==undefined?'cart-rolled':''].join(' ');
  html+=`<button type="button" class="rescue-node ${classes}" style="${at(x-.2,character?4:entry.y,1.4,character?2:1)}" data-rescue-node="${entry.id}" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}" ${!active||state.done||complete&&!entry.repeat?'disabled':''}>${art}${entry.id==='guard'?'<span class="guard-indicator" aria-hidden="true">'+(flags.alert?'!':'Zz')+'</span>':''}</button>`;
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
  if(!rescueAction(state,action))return;
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
