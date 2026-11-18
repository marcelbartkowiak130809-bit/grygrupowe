import {backpackReducedMotion,patchBackpackView} from './backpackMotion.js?v=20261117-10';
import {bindGamePresentation,gameFullscreenButton} from './gamePresentation.js?v=20261118-11';

const sequences = {
 reunion: {
  chapter:1, title:'Wreszcie razem', finish:'Zobacz podsumowanie →',
  frames:[
   { label:'Alex dostrzega Steve’a przed domem', caption:'Alex!', duration:2050 },
   { label:'Steve i Alex biegną w swoją stronę', duration:2100 },
   { label:'Steve i Alex przytulają się przed domem' },
  ],
 },
 raid: {
  chapter:2, title:'Śladami zombie', finish:'Zbadaj ślady →',
  frames:[
   { label:'Steve i Alex stoją razem przed domem, nad którym zapada zmrok', duration:2050 },
   { label:'Zombie wpadają na podwórze, dobijając się do domu', caption:'TRZASK!', duration:2200 },
   { label:'Zombie porywają Alex i znikają w ciemności', caption:'Alex!' },
  ],
 },
};

const active = new WeakMap();
const asset = id => new URL(`../assets/minecraft/backpack/${id}.png`,import.meta.url).href;
const at = (x,y,w,h) => `left:${x/16*100}%;top:${y/9*100}%;width:${w/16*100}%;height:${h/9*100}%`;
const actor = (person,id,x,y,classes='',pose='') =>
 `<span class="siege-actor alex-comic-actor ${classes}" style="${at(x,y,1.65,2.85)}">${person(id,pose)}</span>`;

function couple(person,hearts) {
 return `${actor(person,'steve',10.7,3.15,'alex-hug-steve','hug')}${actor(person,'alex',11.8,3.15,'alex-hug-alex','hug')}
 ${hearts?`<div class="alex-comic-hearts" style="${at(10.3,2.45,3.1,1.7)}">${[12,38,67,88].map((x,i)=>`<i style="--heart-x:${x}%;--heart-delay:${i*-410}ms">♥</i>`).join('')}</div>`:''}`;
}

function reunionArt(frame,person) {
 if (frame===0) return actor(person,'steve',6.7,3.15)+actor(person,'alex',12.8,3.15,'alex-notices');
 if (frame===1) return actor(person,'steve',10.55,3.15,'alex-run-steve')+actor(person,'alex',11.92,3.15,'alex-run-alex');
 return couple(person,true);
}

function raidArt(frame,person) {
 if (frame===0) return couple(person,false);
 if (frame===1) {
  return `<i class="alex-door" style="${at(13.1,4.15,1,1.8)};--door:url('${asset('oak_planks')}')"></i>
   ${actor(person,'steve',8.8,3.15,'alex-startled')}${actor(person,'alex',12.1,3.15,'alex-startled')}
   ${actor(person,'zombie',3.15,3.15,'alex-zombie-left','reach')}
   ${actor(person,'zombie',5.32,3.15,'alex-zombie-left alex-zombie-delay','reach')}
   ${actor(person,'zombie',13.6,3.15,'alex-zombie-right','reach')}`;
 }
 return `${actor(person,'steve',8.3,3.15,'alex-reaches','hug')}
  ${actor(person,'zombie',10.45,3.15,'alex-pursuer','reach')}
  <div class="alex-kidnap-group">${actor(person,'zombie',13.55,3.15,'','reach')}${actor(person,'alex',13.0,2.42,'alex-captive')}</div>
  <img class="alex-lost-trail" src="${asset('rotten_flesh')}" style="${at(14.18,5.46,.55,.55)}" alt="">`;
}

export function renderAlexComic(root,{kind,playerId,visuals,onHome,onDone}) {
 const sequence = sequences[kind];
 let playback = active.get(root);
 if (playback?.kind!==kind || playback.playerId!==playerId || !root.querySelector('[data-alex-comic]')) {
  clearTimeout(playback?.timer);
  playback = {kind,playerId,frame:0};
  active.set(root,playback);
 }
 function draw() {
  const frame = playback.frame;
  const shot = sequence.frames[frame];
  const last = frame===sequence.frames.length-1;
  const frameKey = `${kind}-${frame}`;
  const reduced = backpackReducedMotion();
  patchBackpackView(root,`<main class="page journey-page alex-comic-page ${reduced?'siege-reduced':''}" data-alex-comic="${frameKey}">
   <header class="journey-heading"><div><p class="eyebrow">MINECRAFT · ROZDZIAŁ ${sequence.chapter}</p><h1>${sequence.title}</h1></div>
    <div class="game-view-tools">${gameFullscreenButton}<button class="ghost" type="button" data-comic-home>← Minecraft</button></div></header>
   <section class="siege-storyboard alex-comic-${kind}" aria-label="${sequence.title}">
    <div class="siege-comic-frame"><div class="siege-comic-art siege-sunset alex-comic-frame-${frame}" role="img" aria-label="${shot.label}">
     <div class="alex-comic-stage alex-shot-${frame}" aria-hidden="true"><div class="alex-comic-backdrop">${visuals.home()}</div>
      ${kind==='reunion'?reunionArt(frame,visuals.person):raidArt(frame,visuals.person)}</div>
    </div>${shot.caption?`<p class="siege-caption ${kind==='raid'&&frame===1?'alex-comic-bang':''}">${shot.caption}</p>`:''}</div>
    <div class="siege-comic-footer"><div class="siege-frame-dots" aria-label="Kadr ${frame+1} z ${sequence.frames.length}">
     ${sequence.frames.map((_, index)=>`<i ${index===frame?'class="active"':''}></i>`).join('')}</div>
     <button class="primary" type="button" data-comic-next>${last?sequence.finish:'Dalej →'}</button></div>
   </section>
  </main>`);
  bindGamePresentation(root);
  const advance = () => {
   if (!root.isConnected || active.get(root)!==playback || root.querySelector('[data-alex-comic]')?.dataset.alexComic!==frameKey) return;
   clearTimeout(playback.timer);
   if (last) {
    active.delete(root);
    onDone();
   } else {
    playback.frame++;
    draw();
   }
  };
  root.querySelector('[data-comic-next]').onclick = advance;
  root.querySelector('[data-comic-home]').onclick = () => {
   clearTimeout(playback.timer);
   active.delete(root);
   onHome();
  };
  clearTimeout(playback.timer);
  if (shot.duration && !reduced) playback.timer = setTimeout(advance,shot.duration);
 }
 draw();
}
