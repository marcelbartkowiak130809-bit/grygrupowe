import {backpackNeedsReset} from './backpackDeadlock.js?v=20261118-29';
import {minecraftHintPanel,bindMinecraftHints} from './minecraftHints.js?v=20261121-6';
import {escapeHtml} from './utils.js?v=20261121-6';
import {backpackItems,backpackLevels,backpackTerrain,backpackRecipe,createBackpackState,backpackAction,backpackLight,backpackProgress,restoreBackpack,saveBackpack,backpackBatch} from './lastBackpackEngine.js?v=20261121-2';
import {patchBackpackView,backpackFeedback} from './backpackMotion.js?v=20261118-3';
import {extraTile,puzzleItems} from './backpackPuzzles.js?v=20261121-2';
import {gameFullscreenButton,gameRotationHint,bindGamePresentation} from './gamePresentation.js?v=20261119-26';
// Custom-property URLs are resolved at the stylesheet, so use module-relative absolute URLs.
const asset=id=>new URL(`../assets/minecraft/backpack/${id}.png${id==='potion'?'?v=20261119-6':''}`,import.meta.url).href;
const img=(id,label='',className='')=>`<img src="${asset(id)}" alt="${escapeHtml(label)}" class="${className}" draggable="false">`;
const sessions=new Map();
const levelPages=new WeakMap();
const levelsPerPage=10;
const key=id=>`grygrupowe-backpack-v1:${id}`;
function load(id){try{return restoreBackpack(localStorage.getItem(key(id)));}catch{return createBackpackState();}}
function persist(id,state){try{localStorage.setItem(key(id),saveBackpack(state));return true;}catch{return false;}}

function levelButtons(state,start=0,end=backpackLevels.length){
 return backpackLevels.slice(start,end).map((level,offset)=>{
  const i=start+offset;
  return `<button type="button" class="${state.completed[i]?'complete':''} ${i===state.level?'current':''}" data-bp-level="${i}" aria-label="Poziom ${i+1}: ${escapeHtml(level.name)}${state.completed[i]?', ukończony':''}" ${i===state.level?'aria-current="step"':''} ${i>state.unlocked?'disabled':''}>${i+1}</button>`;
 }).join('');
}

export function renderLastBackpack(root,{playerId='guest'}={},actions={}){
 if(!sessions.has(playerId))sessions.set(playerId,load(playerId));
 const s=sessions.get(playerId),level=backpackLevels[Math.min(s.level,backpackLevels.length-1)],recipe=backpackRecipe(s.grid),batch=backpackBatch(s);
 const progress=backpackProgress(s);
 const draw=()=>{const focus=root.ownerDocument.activeElement;const attrs=['data-bp-item','data-bp-tile','data-bp-craft-slot','data-bp-craft','data-bp-craft-all','data-bp-fill-compost','data-bp-undo','data-bp-clear','data-bp-next','data-bp-level','data-bp-reset-level','data-bp-summary','data-bp-turn-page','data-bp-all-levels'];const attr=attrs.find(a=>focus?.hasAttribute(a));const value=attr?focus.getAttribute(attr):null;renderLastBackpack(root,{playerId},actions);if(attr){const button=[...root.querySelectorAll('['+attr+']')].find(b=>b.getAttribute(attr)===value&&!b.disabled);(button||(attr==='data-bp-turn-page'?root.querySelector('[data-bp-turn-page]:not(:disabled)'):null))?.focus({preventScroll:true});}};
 const act=action=>{if(action.type==='place')action={...action,free:true};const before={placed:{...s.placed},on:s.on,moves:s.moves,solved:s.solved,puzzle:JSON.stringify(s.puzzle)};const wasFinished=s.finishedAt;if(!backpackAction(s,action))return;if(!wasFinished&&s.finishedAt)actions.completeSoloGame?.("minecraft-backpack",s.startedAt,s.startedAt,s.finishedAt);persist(playerId,s);if(action.type==='select'){root.querySelectorAll('[data-bp-item]').forEach(b=>{const chosen=b.dataset.bpItem===s.selected;b.classList.toggle('selected',chosen);b.setAttribute('aria-pressed',String(chosen));});root.querySelector('[data-bp-selected]').textContent=backpackItems[s.selected];root.querySelector('.backpack-status').textContent=s.message;backpackFeedback(root,action,before,s);return;}draw();backpackFeedback(root,action,before,s);};
 let menu=levelPages.get(root);
 if(menu?.playerId!==playerId||menu.level!==s.level){
  menu={playerId,level:s.level,page:Math.floor(s.level/levelsPerPage)};
  levelPages.set(root,menu);
 }
 const first=menu.page*levelsPerPage,end=Math.min(first+levelsPerPage,backpackLevels.length);
 const dialogOpen=root.querySelector('.backpack-level-dialog')?.hasAttribute('open');
 const chapters=`<nav class="backpack-level-picker" aria-label="Wybór poziomu">
  <div class="backpack-level-tools">
   <button class="ghost" type="button" data-bp-turn-page="-1" aria-label="Poprzednie poziomy" ${first===0?'disabled':''}>←</button>
   <span aria-live="polite">${first+1}–${end} / ${backpackLevels.length}</span>
   <button class="ghost" type="button" data-bp-turn-page="1" aria-label="Następne poziomy" ${end===backpackLevels.length?'disabled':''}>→</button>
   <button class="ghost backpack-all-levels" type="button" data-bp-all-levels aria-haspopup="dialog">Wszystkie</button>
  </div>
  <div class="backpack-chapters">${levelButtons(s,first,end)}</div>
  <dialog class="backpack-level-dialog" aria-label="Wszystkie poziomy" ${dialogOpen?'open':''}>
   <div class="backpack-level-dialog-head"><h3>Wszystkie poziomy</h3><button class="ghost" type="button" data-bp-close-levels aria-label="Zamknij wybór poziomu">×</button></div>
   <div class="backpack-chapters">${dialogOpen?levelButtons(s):''}</div>
  </dialog>
 </nav>`;
 const goal=i=>s.level===0&&i===level.end||s.level===2&&i===level.end;
 patchBackpackView(root,`<main class="page backpack-page"><header class="backpack-head"><div><p class="eyebrow">MINECRAFT · INTERAKTYWNE WYZWANIA</p><h1>Ostatni plecak</h1></div><div class="game-view-tools">${gameFullscreenButton}<button class="ghost" data-bp-home>← Minecraft</button></div></header>${gameRotationHint}${s.done?`<section class="backpack-finish panel">${img('diamond','Diament')}<p class="eyebrow">PLECAK MAŁY. PRZYGODA WIELKA.</p><h2>Wszystkie przeszkody pokonane!</h2><div class="backpack-stats"><span><b>${backpackLevels.length}/${backpackLevels.length}</b>wyzwania</span><span><b>${s.finishedMoves}</b>ruchów</span><span><b>${Math.max(1,Math.round((s.finishedAt-s.startedAt)/1000))} s</b>czas</span></div>${chapters}</section>`:`<section class="backpack-shell"><div class="backpack-mission"><div><span class="backpack-step">WYZWANIE ${s.level+1} / ${backpackLevels.length}</span><h2>${level.name}</h2><p>${level.goal}</p></div>${chapters}</div><div class="backpack-layout"><div class="backpack-world-wrap"><div class="backpack-world ${level.theme} ${s.solved?'is-complete':''} ${s.on?'powered':''}" aria-label="Plansza wyzwania"><div class="backpack-world-grid">${Array.from({length:40},(_,i)=>{const ext=s.level>=3?extraTile(level,i,s):{},placed=s.placed[i],lit=s.level===1&&backpackLight(s,i),target=s.level===1&&level.targets.includes(i),socket=s.level===2&&level.sockets.includes(i);return `<button class="backpack-tile ${placed?'has-item':''} ${!placed&&backpackTerrain(s.level,i,s)==='lava_still'?'lava-tile':''} ${target?'light-target':''} ${lit?'is-lit':''} ${target&&lit?'target-done':''} ${socket?'wire-target':''} ${ext.mark?'puzzle-target':''} ${ext.fx?'puzzle-'+ext.fx:''}" style="--tile-texture:url('${asset(placed&&(s.level===0||ext.surface)?placed:(s.level===2&&i===level.switch?'redstone_block':backpackTerrain(s.level,i,s)))}')" data-bp-tile="${i}" aria-label="Pole ${Math.floor(i/8)+1}, ${i%8+1}${target?', oświetl to miejsce':''}${socket?', brakujący przewód':''}${placed?', '+backpackItems[placed]:''}${ext.label?', '+escapeHtml(ext.label):''}" ${s.solved?'disabled':''}>${placed?img(placed,backpackItems[placed],s.level===0||ext.surface?'backpack-block-surface':''):''}${goal(i)?img(s.level===0?'chest_minecart':s.solved?'redstone_lamp_on':'iron_door',s.level===0?'Cel — skrzynia':'Wyjście'):''}${s.level===0&&i===level.start?img('diamond','Start'):''}${s.level===2&&i===level.switch&&!placed?'<span class="backpack-socket-label">DŹWIGNIA</span>':''}${target?'<span class="backpack-light-ring"></span>':''}${ext.icon&&!placed?img(ext.icon,ext.template?'':ext.label||level.name,ext.template?'backpack-placement-template':''):''}${ext.label?`<span class="backpack-puzzle-label">${escapeHtml(ext.label)}</span>`:''}</button>`;}).join('')}</div><div class="backpack-world-caption"><span>${s.level>=3?escapeHtml(level.name.toUpperCase()):s.level===0?'NETHER / PRZEJŚCIE':s.level===1?'KOPALNIA / ŚWIATŁO':'BAZA / ZASILANIE'}</span><span>${s.solved?'CEL OSIĄGNIĘTY':s.level===2&&s.on?'ZASILANIE ON':'TRYB BUDOWANIA'}</span></div></div><div class="backpack-objective"><span>${progress.current} / ${progress.total} ${progress.label}</span><div><i style="width:${progress.current/progress.total*100}%"></i></div></div><p class="backpack-status ${s.solved?'success':''}" role="status">${escapeHtml(s.message)}</p>${s.solved?'<button class="primary backpack-next" data-bp-next>'+(s.level===backpackLevels.length-1?'Zobacz podsumowanie':'Następne wyzwanie →')+'</button>':`<p class="backpack-input-tip">${level.kind==='deep'?'Użyj przedmiotu na stanowisku lub kliknij je, gdy jest gotowe. „Cofnij” przywraca zużyty przedmiot.':'Przeciągnij przedmiot lub wybierz go i kliknij pole. Prawy przycisk odzyskuje blok. „Cofnij” działa również na telefonie.'}</p>`}${level.route?.signals?'<p class="backpack-signal-key">Tory: litera = dźwignia ON, kreska = OFF.</p>':''}</div><aside class="backpack-workbench"><div class="backpack-section-title"><h3>Plecak</h3><span data-bp-selected>${s.selected?escapeHtml(backpackItems[s.selected]):'WYBIERZ ITEM'}</span></div><div class="backpack-inventory">${Object.entries(backpackItems).filter(([id])=>s.level<3?!Object.hasOwn(puzzleItems,id):Object.hasOwn(level.stock,id)||(level.outputs||[]).includes(id)).map(([id,name])=>`<button class="backpack-slot ${s.selected===id?'selected':''}" draggable="${!!s.stock[id]}" data-bp-item="${id}" aria-label="${name}: ${s.stock[id]||0}" aria-pressed="${s.selected===id}" ${!s.stock[id]||s.solved?'disabled':''}>${img(id,name)}<b>${s.stock[id]||0}</b></button>`).join('')}</div><div class="backpack-section-title"><h3>Crafting</h3><button class="ghost" data-bp-clear ${s.solved?'disabled':''}>Zwróć składniki</button></div><div class="backpack-crafting"><div class="backpack-craft-grid">${s.grid.map((item,i)=>`<button class="backpack-slot" data-bp-craft-slot="${i}" aria-label="Składnik ${i+1}${item?': '+backpackItems[item]:''}" ${s.solved?'disabled':''}>${item?img(item,backpackItems[item]):''}</button>`).join('')}</div><span class="backpack-craft-arrow" aria-hidden="true">→</span><button class="backpack-slot backpack-output" data-bp-craft aria-label="${recipe?'Odbierz '+recipe.count+' '+backpackItems[recipe.item]:'Brak receptury'}" ${!recipe||s.solved?'disabled':''}>${recipe?img(recipe.item,backpackItems[recipe.item])+`<b>${recipe.count}</b>`:'?'}</button></div>${s.level>=3&&batch>1?`<button class="ghost backpack-batch" data-bp-craft-all>Wytwórz ×${batch*recipe.count}</button>`:''}${level.kind==='compost'&&s.placed[level.bin]==='composter'&&(s.puzzle.compost||0)<4&&s.stock.wheat_seeds>0?`<button class="ghost backpack-batch" data-bp-fill-compost>Wsyp ${Math.min(4-(s.puzzle.compost||0),s.stock.wheat_seeds)} nasiona</button>`:''}${minecraftHintPanel(root,actions,{key:`backpack-${s.level+1}`,hint:level.tip,available:!s.solved})}<details class="backpack-hint" ${root.querySelector('.backpack-hint')?.hasAttribute('open')?'open':''}><summary>Receptury i sterowanie</summary>${s.level<3?'<p>1 drewno → 4 deski<br>2 deski pionowo → 4 patyki<br>Węgiel nad patykiem → 4 pochodnie<br>Patyk nad brukiem → dźwignia</p>':''}<p>Dotknij składnika w craftingu, aby go odzyskać. Ustawiony blok zużywa zasób — odzyskasz go przez Cofnij lub prawy przycisk. Odrzucona próba niczego nie zużywa.</p></details><div class="backpack-tools"><button class="ghost" data-bp-undo ${!s.undo.length?'disabled':''}>↶ Cofnij ruch</button><button class="ghost${backpackNeedsReset(level,s)?' backpack-reset-needed':''}" data-bp-reset-level>Resetuj poziom</button></div>${s.finishedAt?'<button type="button" class="ghost backpack-summary-link" data-bp-summary>Podsumowanie</button>':''}</aside></div></section>`}<footer class="backpack-credit">Tekstury: Minecraft Java Edition 1.21.4 · Mojang / Microsoft · niezależna gra fanowska, nieoficjalna.</footer></main>`);
 for(const [selector,type]of [['[data-bp-craft-all]','craft-all'],['[data-bp-fill-compost]','fill-compost']]){const button=root.querySelector(selector);if(button)button.onclick=()=>act({type});}
 bindGamePresentation(root);
 bindMinecraftHints(root,actions,draw);
 root.querySelector('[data-bp-home]').onclick=()=>actions.goMinecraftModes?.();
 const picker=root.querySelector('.backpack-level-picker');
 const dialog=picker.querySelector('dialog');
 const all=picker.querySelector('[data-bp-all-levels]');
 const grid=dialog.querySelector('.backpack-chapters');
 all.onclick=()=>{
  grid.innerHTML=levelButtons(s);
  dialog.showModal();
  dialog.querySelector('[aria-current="step"]')?.focus();
 };
 picker.querySelector('[data-bp-close-levels]').onclick=()=>dialog.close();
 dialog.onclose=()=>{if(!dialog.open)grid.textContent='';};
 picker.onclick=event=>{
  if(event.target===dialog){dialog.close();return;}
  const levelButton=event.target.closest('[data-bp-level]');
  if(levelButton&&!levelButton.disabled){
   const index=Number(levelButton.dataset.bpLevel);
   if(dialog.contains(levelButton)){
    dialog.close();
    grid.textContent='';
    menu.page=Math.floor(index/levelsPerPage);
    if(index===s.level){draw();return;}
   }
   act({type:'level',index});
   return;
  }
  const arrow=event.target.closest('[data-bp-turn-page]');
  if(arrow&&!arrow.disabled){menu.page+=Number(arrow.dataset.bpTurnPage);draw();}
 };
 const reset=root.querySelector('[data-bp-reset-level]');
 if(reset)reset.onclick=()=>{if(window.confirm('Zacząć ten poziom od nowa?'))act({type:'reset-level'});};
 const summary=root.querySelector('[data-bp-summary]');
 if(summary)summary.onclick=()=>act({type:'summary'});
 {const button=root.querySelector('[data-bp-next]');if(button)button.onclick=()=>act({type:'next'});}
 {const button=root.querySelector('[data-bp-craft]');if(button)button.onclick=()=>act({type:'craft'});}
 {const button=root.querySelector('[data-bp-clear]');if(button)button.onclick=()=>act({type:'clear'});}
 {const button=root.querySelector('[data-bp-undo]');if(button)button.onclick=()=>act({type:'undo'});}
 root.querySelectorAll('[data-bp-item]').forEach(b=>{b.onclick=()=>{if(b.dataset.suppressClick==='true'){delete b.dataset.suppressClick;return;}act({type:'select',item:b.dataset.bpItem});};b.ondragstart=e=>{e.dataTransfer.setData('application/x-backpack-item',b.dataset.bpItem);e.dataTransfer.effectAllowed='copy';};});
 const destinations=root.querySelectorAll('[data-bp-tile],[data-bp-craft-slot]');
 const use=(el,item)=>act({type:el.hasAttribute('data-bp-tile')?'place':'craft-slot',index:Number(el.dataset.bpTile??el.dataset.bpCraftSlot),item});
 destinations.forEach(el=>{el.onclick=()=>use(el);el.oncontextmenu=e=>{e.preventDefault();if(el.hasAttribute('data-bp-tile'))act({type:'remove',index:Number(el.dataset.bpTile)});};el.ondragover=e=>{e.preventDefault();el.classList.add('drag-over');};el.ondragleave=()=>el.classList.remove('drag-over');el.ondrop=e=>{e.preventDefault();el.classList.remove('drag-over');const item=e.dataTransfer.getData('application/x-backpack-item');if(backpackItems[item])use(el,item);};});
 // Touch dragging uses a local ghost; taps retain the select-then-place path.
 root.querySelectorAll('[data-bp-item]:not(:disabled)').forEach(b=>{let drag;
  b.onpointerdown=e=>{if(e.pointerType==='mouse')return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,item:b.dataset.bpItem};b.setPointerCapture(e.pointerId);};
  b.onpointermove=e=>{if(!drag||e.pointerId!==drag.id)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>8&&!drag.ghost){drag.ghost=b.querySelector('img').cloneNode();drag.ghost.className='backpack-drag-ghost';document.body.append(drag.ghost);}if(drag.ghost){e.preventDefault();drag.ghost.style.left=e.clientX+'px';drag.ghost.style.top=e.clientY+'px';}};
  const end=e=>{if(!drag)return;const d=drag;drag=null;d.ghost?.remove();if(d.ghost&&e.type==='pointerup'){const dest=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-bp-tile],[data-bp-craft-slot]');b.dataset.suppressClick='true';if(dest&&root.contains(dest))use(dest,d.item);}};
  b.onpointerup=end;b.onpointercancel=end;b.onlostpointercapture=end;
 });
}
