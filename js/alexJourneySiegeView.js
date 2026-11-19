import {minecraftHintPanel,bindMinecraftHints} from './minecraftHints.js?v=20261118-19';
import {alexHintOptions} from './alexJourneyHints.js?v=20261119-25';
import { escapeHtml } from './utils.js?v=20260903-7';
import { backpackAnimate, backpackReducedMotion, patchBackpackView } from './backpackMotion.js?v=20261117-10';
import { bindChapterMenu, chapterMenu } from './alexJourneyChapters.js?v=20261119-16';
import { gameFullscreenButton, gameRotationHint, bindGamePresentation } from './gamePresentation.js?v=20261118-11';
import { createSiege, restoreSiege, saveSiege, siegeAction, siegeCraftReady, siegeItems, siegeScenes } from './alexJourneySiege.js?v=20261118-19';

const sessions = new Map();
const clocks = new WeakMap();
const moves = new WeakMap();
const asset = id => new URL(`../assets/minecraft/backpack/${id}.png`, import.meta.url).href;
const at = (x, y, w = 1, h = 1) => `left:${x / 16 * 100}%;top:${y / 9 * 100}%;width:${w / 16 * 100}%;height:${h / 9 * 100}%`;
const tile = (x, y, id, w = 1, h = 1) => `<i class="siege-tile" style="${at(x,y,w,h)};--tile:url('${asset(id)}');--tiles:${w}" aria-hidden="true"></i>`;
const prop = (x,y,id,w=1,h=1,cl='') => `<span class="siege-prop ${cl}" style="${at(x,y,w,h)}">${art(id)}</span>`;

function art(id) {
 if (id === 'lantern') return `<svg viewBox="0 0 16 16" aria-hidden="true"><image href="${asset('lantern')}" width="16" height="48"/></svg>`;
 if (id === 'shield') return `<svg viewBox="1 1 12 22" aria-hidden="true"><image href="${asset('shield')}" width="64" height="64"/></svg>`;
 return `<img src="${asset(id)}" alt="" draggable="false">`;
}

function pillager() {
 const piece = (x,y,w,h,dx,dy) => `<svg x="${dx}" y="${dy}" width="${w}" height="${h}" viewBox="${x} ${y} ${w} ${h}"><image href="${asset('pillager')}" width="64" height="64"/></svg>`;
 return `<svg viewBox="0 0 18 32" class="journey-person" aria-hidden="true">${piece(8,8,8,10,5,0)}${piece(26,2,2,4,8,6)}${piece(20,20,8,12,5,9)}${piece(44,22,4,10,1,10)}${piece(44,22,4,10,13,10)}${piece(4,20,4,12,5,20)}${piece(4,20,4,12,9,20)}<image href="${asset('crossbow_standby')}" x="2" y="13" width="14" height="12"/></svg>`;
}

const actor = (person, id, x, y, w = 1.5, h = 2.8, style = '') =>
 `<span class="siege-actor ${style}" style="${at(x,y,w,h)}" aria-hidden="true">${id === 'pillager' ? pillager() : person(id)}</span>`;

function stretch(id, y, w = 16, h = 1) {
 return Array.from({ length: h }, (_, row) => tile(0,y+row,id,w)).join('');
}

function chamber(look, flags) {
 const outdoors = look === 'woods' || look === 'yard';
 const floor = outdoors ? 'grass_block_side' : look === 'home' || look === 'forge' ? 'oak_planks' : 'stone_bricks';
 let html = stretch(floor, 6) + stretch(outdoors ? 'dirt' : floor, 7, 16, 2);
 if (look === 'forge') {
  html += stretch('oak_log', 1);
  for (const x of [1,7,14]) html += tile(x,2,'oak_log') + tile(x,3,'oak_log') + tile(x,4,'oak_log');
  html += prop(2,2.4,'lantern') + prop(12.5,2.4,'lantern') + tile(9,5,'furnace_front_on');
 } else if (look === 'woods') {
  for (const x of [1,4,8,12]) {
   for (let y=2;y<6;y++) html += tile(x,y,'oak_log');
   html += tile(x-1,1,'oak_leaves',3) + tile(x,0.3,'oak_leaves');
  }
  html += tile(15,2,'cracked_stone_bricks') + tile(15,3,'stone_bricks') + tile(15,4,'stone_bricks') + prop(13,5,'campfire');
 } else if (look === 'yard') {
  for (const x of [0,3,6,12,15]) for(let y=2;y<6;y++) html += tile(x,y,'stone_bricks');
  html += tile(6,1,'cracked_stone_bricks',7) + tile(6,2,'stone_bricks',7) + prop(7,2.75,'lantern');
  if (flags.trap) for (let y=3;y<6;y++) html += tile(8,y,'iron_bars');
 } else if (look !== 'home') {
  html += stretch('cracked_stone_bricks',0);
  for (const x of [1,6,11,15]) for (let y=1;y<6;y++) html += tile(x,y,'cracked_stone_bricks');
  html += prop(2,2.4,'lantern') + prop(12,1.5,'lantern');
  if (look === 'gallery') {
   html += tile(9,4,'stone_bricks',6);
   html += flags.target ? tile(5,5.85,'oak_planks',4,.16) : tile(8,3.6,'oak_planks',1,2.4);
  }
  if (look === 'store') {
   for (let x=4;x<15;x++) html += prop(x,5.82,'rail',1,.24);
   html += tile(3,4,'bookshelf') + tile(13,4,'oak_log');
  }
  if (look === 'cell') {
   for (const x of [12,14.5]) for (let y=2;y<6;y++) {
    if (!(x===12 && flags['free-alex'])) html += tile(x,y,'iron_bars');
   }
  }
  if (look === 'tower') {
   html += tile(12.5,2,'stone_bricks',3) + tile(12.5,5,'stone_bricks',3);
   if (!flags.latch) html += tile(13.5,3,'glass',2,2);
   else html += `<span class="siege-window-glow" style="${at(13,2.9,2.5,2.3)}"></span>`;
   if (flags.ramp) html += tile(5,5.55,'oak_planks',2,.45) + tile(7,5.15,'oak_planks',2,.85) + tile(9,4.67,'oak_planks',3,1.33);
  }
 }
 return html;
}

function composition(scene,state,visuals) {
 const { look } = scene, { flags } = state;
 let html = look === 'home' ? visuals.home() : chamber(look,flags);
 if (look === 'home') html += prop(9.5,4.8,'bread') + prop(12.7,5.1,'paper');
 if (look === 'yard') {
  const patrol = flags['trap-bell'] ? [9.5,10.7,11.8] : [7.5,12.8,14.2];
  html += patrol.map(x => actor(visuals.person,'pillager',x,3.8,1.4,2.2,'siege-patrol')).join('');
 }
 if (look === 'gallery') html += actor(visuals.person,'pillager',12.2,2,1.4,2.2,flags.target?'siege-blocked-guard':'siege-lookout');
 if (look === 'woods' && flags['read-map']) html += '<div class="siege-plaque" aria-label="Mapa: listek, gwiazda, tarcza">❧ <i>›</i> ✦ <i>›</i> ⛨</div>';
 if (look === 'store' && flags['inspect-track']) html += '<div class="siege-plaque" aria-label="Trasa: góra, dół, góra">↑ <i>›</i> ↓ <i>›</i> ↑</div>';
 if (look === 'cell' && flags.signal) html += '<div class="siege-plaque" aria-label="Znaki Alex: słońce, pióro, klucz">☼ <i>›</i> ✒ <i>›</i> ⅄</div>';
 if (look === 'tower') html += actor(visuals.person,'pillager',.6,3.69,1.3,2.31,'siege-lookout');
 return html;
}

function gameScene(scene,index,state,visuals,moving) {
 const active = index === state.scene;
 if (Math.abs(index-state.scene) > 1) return '<section class="siege-scene" aria-hidden="true"></section>';
 const nodes = scene.nodes.map(node => {
  if ((node.id === 'hold' && !state.flags.wheel) || (node.id === 'escape' && !state.flags.latch)) return '';
  const done = !!state.flags[node.id] && !node.opens;
  const withinSequence = node.sequence && state.sequence.includes(node.sequence);
  const locked = node.after?.some(key => !state.flags[key]);
  const switched = node.switch !== undefined;
  const x = node.id === 'cart' && done ? node.x + 1.35 : node.x;
  const hidden = done && (node.give || node.id === 'free-alex');
  const img = node.actor ? visuals.person(node.icon) : art(node.icon);
  return `<button type="button" class="siege-node ${node.actor?'is-actor':''} ${locked?'is-linked':''} ${hidden?'siege-taken':''} ${withinSequence?'is-lit':''} ${switched?'is-switch':''}" style="${at(x,node.actor?3.65:node.y,node.actor?1.1:1.55,node.actor?2.35:1.1)}" data-siege-node="${node.id}" aria-label="${escapeHtml(node.label)}" title="${escapeHtml(node.label)}" ${!active||done||moving?'disabled':''}>${img}${node.mark?`<b class="siege-mark" aria-hidden="true">${node.mark}</b>`:''}${switched?`<b class="siege-mark" aria-hidden="true">${state.switches[node.switch]?'↑':'↓'}</b>`:''}</button>`;
 }).join('');
 const effect = active ? state.effect : '';
 return `<section class="siege-scene siege-${scene.look}" aria-hidden="${!active}" aria-label="${escapeHtml(scene.name)}">${composition(scene,state,visuals)}${nodes}
 ${effect==='arrow'?'<i class="siege-flight" aria-hidden="true">➶</i>':''}
 ${effect==='trap'?'<i class="siege-impact" aria-hidden="true"></i>':''}</section>`;
}

function opening(state,visuals) {
 const home = visuals.home(), person = visuals.person;
 if (state.frame === 0) {
  return `<div class="siege-comic-art siege-sunset"><div class="siege-camera-pan">${home}${actor(person,'steve',6.3,3.15,2.1,3.7,'siege-walk-in')}${prop(7.8,5.3,'chest_minecart',1.4,1.3,'siege-groceries')}${prop(7.85,4.9,'bread',1,.85,'siege-groceries')}${prop(8.4,4.9,'melon_slice',.75,.75,'siege-groceries')}</div></div>
   <p class="siege-caption">Steve: „Alex? Przyniosłem kolację.”</p>`;
 }
 if (state.frame === 1) {
  return `<div class="siege-comic-art siege-house-night"><div class="siege-camera-pan siege-room-zoom">${home}${actor(person,'steve',10,3.35,1.75,3.15,'siege-startled')}${prop(11.8,5.9,'bread',1,1,'siege-drop')}${prop(13,4.8,'paper',1.4,1.35,'siege-letter-glint')}${prop(14.1,5.7,'oak_slab',1.4,.55,'siege-overturned')}</div></div>
   <p class="siege-caption">Cisza. Przewrócone krzesło. List pod oknem.</p>`;
 }
 return `<div class="siege-comic-art siege-house-night"><div class="siege-letter-background">${home}</div>
  <article class="siege-letter" aria-label="List porywaczy"><div><span class="siege-letter-ornament" aria-hidden="true">❧ ◇ ❦ ◇ ❧</span><h2>Do Steve’a</h2>
  <p>Alex jest w naszych rękach.<br>Przyjdź sam do Wieży Kruków po zmroku.</p>
  <p>Jeśli w wiosce zabrzmi dzwon, już jej tu nie zastaniesz.</p>
  <footer>Kapitan pillagerów <span class="siege-wax" aria-hidden="true">✠</span></footer></div></article></div>`;
}

function closing(state,visuals) {
 const p = visuals.person;
 const art = chamber('tower', state.flags);
 if (state.frame === 0) return `<div class="siege-comic-art siege-tower"><div class="siege-camera-pan">${art}${actor(p,'pillager',2.4,3.4,2,2.6,'siege-chase')}${actor(p,'pillager',4,3.3,2,2.7,'siege-chase')}${actor(p,'steve',10,2.8,1.7,3.1,'siege-run')}${actor(p,'alex',12,2.8,1.6,3.1,'siege-run')}</div></div><p class="siege-caption">Alex: „Na trzy?” Steve: „Teraz.”</p>`;
 if (state.frame === 1) return `<div class="siege-comic-art siege-tower"><div class="siege-window-rush">${art}${actor(p,'steve',12.7,2.3,1.8,3,'siege-jump')}${actor(p,'alex',14,2.1,1.5,3,'siege-jump')}${actor(p,'pillager',10.7,2.9,1.5,2.6,'siege-chase')}</div></div>`;
 return `<div class="siege-comic-art siege-freeze"><div class="siege-freeze-tower">${tile(0,0,'stone_bricks',6,9)}
   <div class="siege-freeze-window" style="${at(.85,2.02,5.15,3.75)}"></div>${tile(.55,5.5,'cracked_stone_bricks',5.75,.45)}
   ${actor(p,'pillager',1.13,2.6,1.8,2.85)}${actor(p,'pillager',3.03,2.52,1.9,2.9)}</div>
   <div class="siege-moon"></div><div class="siege-speedlines"></div><div class="siege-shards" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
   ${actor(p,'steve',6.9,2.0,2.65,4.08,'freeze-steve')}${actor(p,'alex',10.15,1.22,2.5,4.05,'freeze-alex')}
   <div class="siege-moat"></div></div><p class="siege-caption">Ciąg dalszy w rozdziale 4</p>`;
}

function storyboard(state,visuals) {
 const intro = state.phase === 'intro';
 const finalFrame = state.frame === 2;
 return `<section class="siege-storyboard ${finalFrame?'is-last-frame':''}" aria-label="${intro?'Powrót do domu':'Ucieczka z wieży'}">
  <div class="siege-comic-frame" data-siege-frame="${state.phase}-${state.frame}">${intro?opening(state,visuals):closing(state,visuals)}</div>
  <div class="siege-comic-footer"><div class="siege-frame-dots" aria-label="Kadr ${state.frame+1} z 3">${[0,1,2].map(i=>`<i ${i===state.frame?'class="active"':''}></i>`).join('')}</div>
  <button type="button" class="primary" data-siege-frame-next>${finalFrame?intro?'Ruszaj po Alex →':'Zobacz wynik →':'Dalej →'}</button></div></section>`;
}

function game(root,state,visuals,moving,actions) {
 const scene = siegeScenes[state.scene];
 const next = state.flags[scene.finish];
 const ready = siegeCraftReady(state), bench = scene.craft && scene.nodes.some(node=>node.opens&&state.flags[node.id]) && !state.flags[scene.craft.id];
 const inventory = Object.entries(state.stock).filter(([,count])=>count>0);
 return `<div class="siege-layout"><section class="journey-play siege-play">
  <div class="siege-quest"><div><p class="eyebrow">${String(state.scene+1).padStart(2,'0')}/10 · ${scene.region}</p><h2>${scene.name}</h2><p>${scene.goal}</p></div>
  </div>
  ${minecraftHintPanel(root,actions,alexHintOptions(3,state.scene,scene,!next))}
  <div class="siege-camera" aria-busy="${moving}"><div class="siege-track" style="--scene:${state.scene}">
  ${siegeScenes.map((entry,i)=>gameScene(entry,i,state,visuals,moving)).join('')}
  <div class="siege-hero ${state.effect==='block'?'siege-hero-block':''}" style="--hero:${state.scene*16+state.hero}">${visuals.person('steve')}${state.effect==='block'?art('shield'):''}</div>
  </div></div>
  <div class="siege-status"><p role="status">${escapeHtml(state.message)}</p>${next?'<button class="primary" type="button" data-siege-next>Idź dalej →</button>':''}</div></section>
  <aside class="journey-pack siege-pack"><h3>Plecak</h3><div class="journey-inventory">${inventory.map(([id,count])=>`<button class="journey-slot ${state.selected===id?'selected':''}" type="button" data-siege-item="${id}" aria-label="${siegeItems[id]}: ${count}" aria-pressed="${state.selected===id}">${art(id)}<b>${count}</b></button>`).join('')||'<small>Pusto</small>'}</div>
  <p class="siege-item-name">${state.selected?siegeItems[state.selected]:'Wybierz przedmiot, aby go użyć.'}</p>
  ${bench?`<div class="siege-bench"><h3>Stół rzemieślniczy</h3><div class="journey-craft-grid">${state.grid.map((id,i)=>`<button type="button" class="journey-slot" data-siege-slot="${i}" aria-label="Pole ${i+1}${id?', '+siegeItems[id]:''}">${id?art(id):''}</button>`).join('')}</div><button type="button" class="primary" data-siege-craft ${ready?'':'disabled'}>Wytwórz: ${siegeItems[scene.craft.id]}</button></div>`:''}
  </aside></div>`;
}

function summary(state) {
 const seconds = Math.max(1,Math.round((state.finishedAt-state.startedAt)/1000));
 const time = `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
 return `<section class="siege-summary"><p class="eyebrow">ROZDZIAŁ UKOŃCZONY</p><h2>Po drugiej stronie okna</h2>
  <p>Alex jest wolna. Pod nimi jeszcze fosa.</p><dl><div><dt>Zagadki</dt><dd>10/10</dd></div><div><dt>Ruchy</dt><dd>${state.steps}</dd></div><div><dt>Czas przejścia</dt><dd>${time}</dd></div></dl>
  <button type="button" class="primary" data-siege-replay>Jeszcze raz zobacz finał</button><button type="button" class="ghost" data-siege-home>Wróć do Minecrafta</button></section>`;
}

const storageKey = id => `grygrupowe-alex-siege-v1:${id}`;
export function resetAlexSiege(id) {
 localStorage.removeItem(storageKey(id));
 sessions.delete(id);
}
function session(id) {
 if (!sessions.has(id)) {
  let state;
  try { state = restoreSiege(localStorage.getItem(storageKey(id))); } catch { state = createSiege(); }
  sessions.set(id,state);
 }
 return sessions.get(id);
}

export function renderAlexSiege(root,context) {
 const { playerId, visuals, actions, selectChapter, rank } = context;
 const state = session(playerId);
 rank.observe(3,state.finishedAt>0);
 const reduced = backpackReducedMotion();
 const motion = moves.get(root);
 const moving = !!motion && motion.playerId === playerId && motion.scene === state.scene && performance.now() < motion.until;
 const rerender = () => renderAlexSiege(root,context);
 const act = action => {
  if (!['frame','replay'].includes(action.type) && !rank.canMove(3)) return;
  if (moving && action.type === "node") return;
  const before = state.message;
  const wasFinished = state.finishedAt;
  if (!siegeAction(state,action)) {
   if (before !== state.message) rerender();
   return;
  }
  if (!wasFinished && state.finishedAt) actions.completeSoloGame?.('minecraft-journey', `chapter-3:${state.startedAt}`, state.startedAt, state.finishedAt);
  if (action.type === 'next' && !reduced) {
   clearTimeout(motion?.timer);
   const slide = {playerId,scene:state.scene,until:performance.now()+770};
   moves.set(root,slide);
   slide.timer = setTimeout(()=>{
    if (moves.get(root)!==slide) return;
    moves.delete(root);
    if (root.querySelector('.siege-page')) rerender();
   },780);
  }
  try { localStorage.setItem(storageKey(playerId),saveSiege(state)); } catch {}
  rerender();
  if (action.type === 'node' && state.phase === 'play') {
   const node = root.querySelector(`[data-siege-node="${action.id}"]`);
   backpackAnimate(node,[{opacity:.6,scale:.91},{opacity:1,scale:1.08},{opacity:1,scale:1}],{duration:290});
  }
 };
 const cutscene = ['intro','outro'].includes(state.phase);
 patchBackpackView(root,`<main class="page journey-page siege-page ${reduced?'siege-reduced':''}">
  <header class="journey-heading"><div><p class="eyebrow">MINECRAFT · ROZDZIAŁ 3</p><h1>Wieża Kruków</h1></div><div class="game-view-tools">${gameFullscreenButton}<button type="button" class="ghost" data-siege-home>← Minecraft</button></div></header>
  ${gameRotationHint}${chapterMenu(3,true,true)}
  ${!cutscene?rank.html():''}
  ${cutscene?storyboard(state,visuals):state.phase==='result'?summary(state):game(root,state,visuals,moving,actions)}
  <footer class="journey-credit">Nieoficjalna przygoda fanowska · tekstury Minecraft Java 1.21.4 · Mojang / Microsoft</footer>
 </main>`);
 bindChapterMenu(root,selectChapter);
 rank.bind();
 bindGamePresentation(root);
 root.querySelectorAll('[data-siege-home]').forEach(button=>{button.onclick=()=>actions.goMinecraftModes?.();});
 root.querySelectorAll('[data-siege-node]:not(:disabled)').forEach(button=>{button.onclick=()=>act({type:'node',id:button.dataset.siegeNode});});
 root.querySelectorAll('[data-siege-item]').forEach(button=>{button.onclick=()=>act({type:'select',id:button.dataset.siegeItem});});
 root.querySelectorAll('[data-siege-slot]').forEach(button=>{button.onclick=()=>act({type:'slot',index:Number(button.dataset.siegeSlot)});});
 const bind = (selector,fn) => { const button=root.querySelector(selector); if (button) button.onclick=fn; };
 bindMinecraftHints(root,actions,rerender);
 bind('[data-siege-next]',()=>act({type:'next'}));
 bind('[data-siege-craft]',()=>act({type:'craft'}));
 bind('[data-siege-replay]',()=>act({type:'replay'}));
 bind('[data-siege-frame-next]',()=>act({type:'frame'}));
 clearTimeout(clocks.get(root));
 if (cutscene && state.frame<2 && !reduced) {
  const frame = root.querySelector('[data-siege-frame]'), key = frame.dataset.siegeFrame;
  clocks.set(root,setTimeout(()=>{
   if (frame.isConnected && root.querySelector('[data-siege-frame]')?.dataset.siegeFrame===key) act({type:'frame'});
  }, state.phase==='intro' ? 2800 : 2150));
 }
}
