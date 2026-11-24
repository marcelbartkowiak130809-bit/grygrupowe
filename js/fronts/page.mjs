import {cardById} from './cards.mjs';
import {applyAction,attackPlays,cardPlays,createMatch,legalActions,matchView} from './engine.mjs';
import {botMove} from './bot.mjs';
import {art,battle,cardFace,catalogBody,landing} from './view.mjs?v=3';

const root = document.querySelector('#fronts');
const dialog = document.querySelector('#fronts-dialog');
const storage = {
  get(key) { try { return localStorage.getItem('fronts-v1-'+key); } catch { return null; } },
  set(key,value) { try { value === null ? localStorage.removeItem('fronts-v1-'+key) : localStorage.setItem('fronts-v1-'+key,value); } catch {} },
};
const effectsRoot = document.body.appendChild(Object.assign(document.createElement('div'),{className:'tf-fx-layer'}));
effectsRoot.setAttribute('aria-hidden','true');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

let name = storage.get('nick') || '';
let practice;
try { practice = JSON.parse(storage.get('practice')) || null; } catch { practice=null; }
let mode = null;
let view = null;
let matchId = '';
let offset = 0;
let searching = '';
let error = '';
let selection = null;
let targets = new Map();
let options = [];
let busy = false;
let generation = 0;
let lastHeartbeat = 0;
let queuedRequest;
let timer;
let announcedResult = false;
let filter = 'all';
let rarity = 'all';
let resumeAvailable = Boolean(practice?.phase==='battle');

const now = () => Date.now()+offset;
const isMyTurn = () => view?.phase==='battle' && view.active===view.you;
const ownSide = () => view.you;
const dismissChoice = () => { selection = null; targets = new Map(); options = []; };
const displayLane = lane => ['Bór','Trakt','Przełęcz'][lane];
const moveTargets = new Set(['moveEnemy','moveAlly','swap']);

function getStatus() {
  if (!isMyTurn()) return view.phase==='finished' ? '' : 'Rywal planuje ruch.';
  if (selection?.type==='attack') return 'Wybierz podświetlony cel.';
  if (selection?.playsTo) return 'Wskaż pole docelowe.';
  if (options.length) return selection ? cardById[view.players[view.you].hand[selection.index]].name : '';
  if (selection?.type==='card') return 'Wybierz podświetlone pole.';
  const actions = legalActions(view,view.you);
  return actions.length>1 ? 'Zagraj kartę lub wybierz jednostkę do ataku.' : 'Możesz zakończyć turę.';
}

function render() {
  const hand = root.querySelector('.tf-hand');
  const scroll = hand?.scrollLeft || 0;
  const active = root.contains(document.activeElement) ? document.activeElement.dataset : null;
  const focus = active?.do ? {...active} : null;
  if (!view) root.innerHTML = landing(searching,error,name,resumeAvailable);
  else {
    root.innerHTML = battle(view,{
      now:now(),targets,
      canAttack:isMyTurn() ? [0,1,2].filter(lane => attackPlays(view,view.you,lane).length) : [],
      selected:selection,status:getStatus(),choices:options,error,busy
    });
    root.querySelector('.tf-hand').scrollLeft = scroll;
  }
  if (focus && !dialog.open) {
    const replacement = [...root.querySelectorAll('[data-do]')].find(element => ['do','index','side','lane']
      .every(key => element.dataset[key] === focus[key]));
    replacement?.focus({preventScroll:true});
  }
}

function popup(content) {
  dialog.innerHTML = content;
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
}

function showResult() {
  if (announcedResult) return;
  announcedResult = true;
  const won = view.winner === view.you;
  const title = view.winner === -1 ? 'Remis' : won ? 'Fronty zdobyte!' : 'Twój zamek padł';
  const explanation = view.reason === 'timeout' ? 'Dwie tury minęły bez ruchu.' :
    view.reason === 'leave' ? 'Partia zakończona poddaniem.' : won ? 'Zamek przeciwnika został zdobyty.' : 'Bitwa dobiegła końca.';
  popup(`<div class="tf-result"><span class="tf-crest">${won?'✺':'♜'}</span><h2>${title}</h2><p>${explanation}</p>
    <div><button class="tf-primary" data-do="again">Zagraj jeszcze raz</button><button class="tf-quiet" data-do="menu">Menu</button></div></div>`);
  if (won) dialog.querySelector('.tf-result').classList.add('tf-victory');
}

function point(element) {
  if (!element) return null;
  const box = element.getBoundingClientRect();
  return {x:box.left+box.width/2,y:box.top+box.height/2};
}

const anchor = (side,lane) => root.querySelector(`[data-anchor="${side}:${lane}"]`);
const colors = {
  fire:'#ff895f', ice:'#8cdeff', wind:'#bdffe0', hail:'#b3ddff', quake:'#ffc694',
  rain:'#90ffd0', fog:'#cad7e9', trap:'#ffc785', gust:'#abf8d9', cleanse:'#96e1ff',
  order:'#ffcf93', portal:'#eca1ff', camp:'#ffae56', thorns:'#cbef86', meteor:'#ff9a68',
  barrier:'#83ffd9', boulder:'#cebaa7', bolt:'#fff199'
};

function particle(className,{x,y},text='',fromArt='') {
  const element = document.createElement(fromArt?'img':'i');
  element.className = className;
  element.style.setProperty('--x',x+'px');
  element.style.setProperty('--y',y+'px');
  if (fromArt) element.src = fromArt;
  else element.textContent = text;
  effectsRoot.appendChild(element);
  setTimeout(()=>element.remove(),850);
  return element;
}

function animate(effects,previous,origin) {
  if (reduced.matches) return;
  for (const effect of effects) {
    const {type,side,lane,amount,card,to,element:elementType} = effect;
    const cell = anchor(side,lane);
    const target = type==='spell' && lane===-1 ? point(root.querySelector('[data-scene]')) : point(cell);
    if (type==='draw') {
      const drawn = side===view.you ? root.querySelector('.tf-hand .tf-card:last-child') : root.querySelector('.tf-hidden-hand .tf-card-back:last-child');
      if (drawn) drawn.classList.add('tf-incoming');
      continue;
    }
    if (!target) continue;
    if (type==='attack') {
      const end = point(anchor(1-side,previous?.players[1-side].board[to] ? to : -1));
      if (!end) continue;
      const trail = particle('tf-attack-trail',target);
      const x = end.x-target.x;
      const y = end.y-target.y;
      trail.style.setProperty('--travel',Math.hypot(x,y)+'px');
      trail.style.setProperty('--angle',Math.atan2(y,x)+'rad');
      const attacker = cell.querySelector('.tf-card');
      if (attacker) {
        attacker.style.setProperty('--lunge',side===view.you ? '-18px' : '18px');
        attacker.classList.add('tf-lunge');
      }
      continue;
    }
    if (type==='summon' || type==='move') {
      const start = type==='move' ? point(anchor(side,effect.from)) :
        origin && side===view.you ? origin : point(root.querySelector(side===view.you ? '.tf-hand' : '.tf-hidden-hand'));
      if (start) {
        const fly = particle('tf-flying',start,'',art(cardById[card]));
        fly.style.setProperty('--to-x',target.x+'px');
        fly.style.setProperty('--to-y',target.y+'px');
      }
      particle('tf-impact',target,'✦').style.setProperty('--spell','#a8ffd9');
      continue;
    }
    if (type==='spell') {
      const splash = particle('tf-spell-art',target,'',art(cardById[card]));
      splash.style.setProperty('--spell',colors[elementType || card] || '#edbdff');
      splash.dataset.spell = elementType || card;
      continue;
    }
    const label = ['hit','base-hit'].includes(type) ? '−'+amount :
      type==='heal' ? '+'+amount : type==='shield' ? '◈' : type==='trap-set' ? '◇' : '✧';
    const impact = particle('tf-impact',target,label);
    impact.style.setProperty('--spell',type==='heal'?'#91ffb2':type==='hit'||type==='base-hit'?'#ffa38d':'#b8eaff');
    if (['hit','fall','shield','base-hit'].includes(type)) impact.style.setProperty('--delay','140ms');
  }
}

function updateView(next,origin) {
  const previous = view;
  if (previous && next.revision < previous.revision) return;
  const changed = !view || next.revision !== view.revision || view.phase !== next.phase;
  if (!changed) return;
  view = next;
  error = '';
  dismissChoice();
  render();
  if (previous) animate(next.effects,previous,origin);
  else root.querySelector('.tf-hand')?.classList.add('tf-deal');
  if (next.phase === 'finished') {
    if (dialog.open) dialog.close();
    setTimeout(()=>{ if(view===next) showResult(); },reduced.matches?0:570);
  }
}

const localHost = ['localhost','127.0.0.1'].includes(location.hostname);
let endpoint;
async function request(input) {
  if (!endpoint) {
    if (localHost) endpoint = 'http://127.0.0.1:8789/match';
    else {
      const config = await fetch('/assets/fronts/live.json',{cache:'no-store',signal:AbortSignal.timeout(6500)}).then(result=>result.ok ? result.json() : null);
      endpoint = config?.matchmaker || '';
    }
  }
  if (!endpoint) throw new Error('Nie udało się połączyć. Spróbuj ponownie albo zagraj z botem.');
  let token = storage.get('token');
  if (!token) {
    token = crypto.randomUUID();
    storage.set('token',token);
  }
  const result = await fetch(endpoint,{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
    body:JSON.stringify({name,...input}),
    signal:AbortSignal.timeout(8000)
  });
  if (!result.ok) throw new Error('Połączenie z pojedynkiem nie odpowiada.');
  return result.json();
}

function queueRequest(input) {
  const pending = request(input);
  queuedRequest = pending;
  return pending.finally(()=>{
    if (queuedRequest===pending) queuedRequest=undefined;
  });
}

function receive(response,origin) {
  offset = response.now-Date.now();
  if (response.match) {
    searching = '';
    mode = 'online';
    if (matchId!==response.id) {
      matchId = response.id;
      view = null;
      announcedResult = false;
    }
    storage.set('online',response.id);
    updateView(response.match,origin);
    return;
  }
  if (mode==='online' && view) {
    view = null;
    mode = null;
    storage.set('online',null);
    error = 'Ta partia wygasła.';
    render();
  }
  if (response.stage==='searching' && searching!=='Szukam rywala…') {
    searching = 'Szukam rywala…';
    error = '';
    render();
  }
}

function stopTimer() { clearTimeout(timer); timer = undefined; }

function schedule() {
  stopTimer();
  const current = generation;
  if (mode==='online' && (searching || view?.phase==='battle')) {
    timer = setTimeout(async ()=>{
      if (current!==generation) return;
      if (busy) return schedule();
      try {
        const heartbeat = searching && Date.now()-lastHeartbeat>13000;
        const response = await (heartbeat ? queueRequest({kind:'join'}) : request({kind:'status'}));
        if(current!==generation) return;
        if(heartbeat) lastHeartbeat=Date.now();
        receive(response);
        if(error) { error=''; render(); }
      } catch {
        if(current!==generation) return;
        const message = 'Łączenie ponownie…';
        if(error!==message) { error=message; render(); }
      }
      if(current===generation) schedule();
    }, searching ? 1700 : 1350);
  }
  if (mode==='practice' && view?.phase==='battle' && view.active!==view.you) {
    timer = setTimeout(()=>{
      if(current!==generation) return;
      const time = now();
      const action = time>=practice.deadline ? {type:'timeout'} : botMove(practice,1,time);
      applyPractice(1,action);
    },620);
  }
}

async function startOnline(resume=false) {
  generation++;
  const current = generation;
  stopTimer();
  mode='online';
  view=null;
  matchId='';
  announcedResult=false;
  offset=0;
  searching=resume?'Wczytuję pojedynek…':'Szukam rywala…';
  error='';
  render();
  try {
    const result = await (resume ? request({kind:'status'}) : queueRequest({kind:'join'}));
    if(current!==generation) return;
    if (resume && result.stage==='idle') {
      storage.set('online',null);
      return toMenu();
    }
    lastHeartbeat=Date.now();
    receive(result);
    schedule();
  } catch (reason) {
    if(current!==generation) return;
    mode=null;
    searching='';
    error=reason.message;
    render();
  }
}

function startPractice(resume=true) {
  generation++;
  stopTimer();
  offset=0;
  storage.set('online',null);
  mode='practice';
  view=null;
  error='';
  searching='';
  announcedResult=false;
  if (!resume || !resumeAvailable) practice=createMatch([name || 'Wędrowiec','Strażnik Szlaku'],now());
  else practice.deadline=now()+45000;
  resumeAvailable=true;
  storePractice();
  updateView(matchView(practice,0));
  schedule();
}

function storePractice() {
  resumeAvailable=practice.phase==='battle';
  storage.set('practice',resumeAvailable?JSON.stringify(practice):null);
}

function applyPractice(side,action,origin) {
  const result = applyAction(practice,side,action,now());
  if (result) {
    practice=result;
    storePractice();
    updateView(matchView(practice,0),origin);
  }
  schedule();
}

function toMenu() {
  generation++;
  stopTimer();
  mode=null;
  view=null;
  searching='';
  error='';
  busy=false;
  matchId='';
  dismissChoice();
  if (dialog.open) dialog.close();
  render();
}

async function act(action) {
  if (!action || busy || !view || (!isMyTurn() && action.type!=='leave')) return;
  const origin = selection?.type==='card' ? point(root.querySelector(`[data-do="hand"][data-index="${selection.index}"]`)) : null;
  if (mode==='practice') return applyPractice(0,action,origin);
  const current = generation;
  busy=true;
  stopTimer();
  try {
    const revision = view.revision;
    const response = await request({kind:'act',id:matchId,revision,action});
    if (current!==generation) return;
    busy=false;
    receive(response,origin);
    if (view?.revision===revision) {
      error='Ten ruch nie jest już dostępny.';
      if (dialog.open) dialog.close();
      dismissChoice();
      render();
    }
  } catch {
    if (current!==generation) return;
    busy=false;
    error='Ruch nie został potwierdzony. Sprawdzam planszę…';
    render();
  }
  if (current===generation) schedule();
}

function selectCard(index) {
  if (!isMyTurn() || busy) return;
  if (selection?.index===index) { dismissChoice(); error=''; return render(); }
  const card = cardById[view.players[ownSide()].hand[index]];
  const plays = cardPlays(view,view.you,index);
  if (!card) return;
  dismissChoice();
  if (!plays.length) {
    error='Brakuje energii lub wolnego celu.';
    return render();
  }
  error='';
  selection={type:'card',index,card,plays};
  if (plays[0].lane===-1) options=[{label:'Zagraj',index:0,action:plays[0]}];
  else {
    const side = ['enemy','moveEnemy'].includes(card.target) ? 1-ownSide() : ownSide();
    for (const play of plays) {
      const key = `${side}:${play.lane}`;
      targets.set(key,[...(targets.get(key) || []),play]);
    }
  }
  render();
}

function chooseSlot(side,lane) {
  const plays = targets.get(`${side}:${lane}`);
  if (plays) {
    if (selection?.type==='card' && !selection.playsTo && moveTargets.has(selection.card.target)) {
      selection.playsTo=true;
      targets.clear();
      for (const play of plays) targets.set(`${side}:${play.to}`,[play]);
      return render();
    }
    if (plays.length===1) return act(plays[0]);
    targets.clear();
    options=plays.map((action,index)=>({
      index,action,label:action.element==='fire'?'🔥 Ogień':action.element==='ice'?'❄ Lód':`↬ Wiatr · ${displayLane(action.to)}`
    }));
    return render();
  }
  if (side===ownSide() && isMyTurn() && !busy) {
    const attacks=attackPlays(view,view.you,lane);
    if (attacks.length && !(selection?.type==='attack' && selection.from===lane)) {
      dismissChoice();
      selection={type:'attack',from:lane};
      for (const action of attacks) targets.set(`${1-side}:${action.to}`,[action]);
      error='';
      return render();
    }
  }
  const unit = view.players[side].board[lane];
  if (unit) {
    const card=cardById[unit.card];
    popup(`<header class="tf-dialog-header"><h2>${card.name}</h2><button class="tf-quiet" data-do="close" aria-label="Zamknij">×</button></header>
      <div class="tf-card tf-r${card.rarity}" style="max-width:180px;margin:auto">${cardFace(card,{hp:unit.hp})}</div>`);
  }
}

function refreshCatalog(focusType) {
  popup(catalogBody(filter,rarity));
  if (focusType) dialog.querySelector(focusType)?.focus({preventScroll:true});
}

dialog.addEventListener('change',event=>{
  if (event.target.matches('[data-filter]')) { filter=event.target.value; refreshCatalog('[data-filter]'); }
  if (event.target.matches('[data-rarity]')) { rarity=event.target.value; refreshCatalog('[data-rarity]'); }
});
root.addEventListener('input',event=>{
  if (event.target.matches('[data-nick]')) { name=event.target.value; storage.set('nick',name); }
});
root.addEventListener('keydown',event=>{
  if (event.key==='Enter' && event.target.matches('[data-nick]')) startOnline();
});
document.addEventListener('click',async event=>{
  const button=event.target.closest('[data-do]');
  if (!button || button.disabled) return;
  const {do:action,index,side,lane}=button.dataset;
  switch(action) {
    case 'online': return startOnline();
    case 'practice': return startPractice();
    case 'cancel': {
      toMenu();
      const current = generation;
      try {
        await queuedRequest?.catch(()=>{});
        if (current!==generation) return;
        const result=await request({kind:'cancel'});
        if (current===generation && result.stage==='battle') { receive(result); schedule(); }
      } catch { /* An inactive ticket expires after 35 seconds. */ }
      return;
    }
    case 'rules': return popup(`<header class="tf-dialog-header"><h2>Jak grać?</h2><button class="tf-quiet" data-do="close" aria-label="Zamknij">×</button></header>
      <ol class="tf-rules"><li>Wybierz kartę i podświetlone pole. Na turę masz 45 s. Energia odnawia się i rośnie do 6.</li>
      <li>Wybierz gotową jednostkę i jej cel. Puste pole naprzeciwko oznacza atak na zamek.</li>
      <li>Zagrywaj taktyki, by leczyć, przesuwać, zamrażać albo zastawiać pułapki.</li>
      <li>Wygrywasz, gdy zamek rywala straci 20 HP. Gdy zabraknie kart, dobieranie rani zamek.</li></ol>`);
    case 'catalog': filter='all'; rarity='all'; return refreshCatalog();
    case 'close': return dialog.close();
    case 'menu': storage.set('online',null); return toMenu();
    case 'again':
      dialog.close();
      return mode==='online' ? startOnline() : startPractice(false);
    case 'end': return act({type:'end'});
    case 'clear': dismissChoice(); error=''; return render();
    case 'slot': return chooseSlot(Number(side),Number(lane));
    case 'hand': return selectCard(Number(index));
    case 'choice': return act(options[Number(index)]?.action);
    case 'leave':
      if (view?.phase==='finished') { storage.set('online',null); return toMenu(); }
      return popup('<div class="tf-result"><h2>Poddać partię?</h2><p>Rywal wygra ten pojedynek.</p><div><button class="tf-primary" data-do="surrender">Poddaj się</button><button class="tf-quiet" data-do="close">Wróć</button></div></div>');
    case 'surrender':
      dialog.close();
      return act({type:'leave'});
  }
});

setInterval(()=>{
  const clock=root.querySelector('[data-clock]');
  if (!clock || !view) return;
  const remaining=Math.max(0,Math.ceil((view.deadline-now())/1000));
  clock.textContent=remaining+' s';
  if (!remaining && mode==='practice') applyPractice(view.active,{type:'timeout'});
},250);

render();
if (storage.get('online')) startOnline(true);
