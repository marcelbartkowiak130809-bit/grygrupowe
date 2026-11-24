import {cardById} from './cards.mjs?v=5';
import {applyAction,attackPlays,cardPlays,createMatch,effectiveCost,hydrateMatch,legalActions,matchView,occupied,tableLimit} from './engine.mjs?v=6';
import {botMove} from './bot.mjs?v=6';
import {art,back,battle,cardFace,catalogBody,landing} from './view.mjs?v=6';
import {burst,cardEffect,soundUrl,strike} from './effects.mjs?v=2';

// The former standalone HTML can still be cached at the address ending in a slash.
if (document.getElementById('fronts-dialog')) location.replace('/trzy-fronty');

export function mountFronts(container, {accountId, getNick, openAuth, playSound}) {
  const scope = document.createElement('div');
  scope.className = 'fronts';
  const root = document.createElement('div');
  const dialog = document.createElement('dialog');
  dialog.className = 'tf-dialog';
  scope.append(root, dialog);
  container.replaceChildren(scope);
  const listeners = new AbortController();
  const storageKey = key => `fronts-v2-${accountId}-${key}`;
  const storage = {
    get(key) { try { return accountId ? localStorage.getItem(storageKey(key)) : null; } catch { return null; } },
    set(key,value) { try { if (accountId) value === null ? localStorage.removeItem(storageKey(key)) : localStorage.setItem(storageKey(key),value); } catch {} },
  };
  const effectsRoot = document.body.appendChild(Object.assign(document.createElement('div'),{className:'tf-fx-layer'}));
  effectsRoot.setAttribute('aria-hidden','true');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  function restorePractice() {
    const saved = storage.get('practice');
    if (saved) return JSON.parse(saved);
    const legacy = localStorage.getItem('fronts-v1-practice');
    if (!accountId || !legacy) return null;
    const match = JSON.parse(legacy);
    if (!match.players?.[0]?.name || match.players[0].name !== getNick()) return null;
    storage.set('practice',legacy);
    if (storage.get('practice') === legacy) localStorage.removeItem('fronts-v1-practice');
    return match;
  }
  function restoreOnline() {
    if (storage.get('token') || getNick() !== localStorage.getItem('fronts-v1-nick')) return;
    const match = localStorage.getItem('fronts-v1-online');
    const token = localStorage.getItem('fronts-v1-token');
    if (!match || !token) return;
    storage.set('token',token);
    storage.set('online',match);
    if (storage.get('token') === token && storage.get('online') === match) {
      localStorage.removeItem('fronts-v1-online');
      localStorage.removeItem('fronts-v1-token');
    }
  }
  try { if (accountId) restoreOnline(); } catch {}
  let practice;
  try { practice = restorePractice(); } catch { practice=null; }
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

  function getStatus() {
    if (!isMyTurn()) return view.phase==='finished' ? '' : 'Rywal planuje ruch.';
    if (selection?.type==='attack') return 'Wybierz podświetlony cel.';
    if (view.players[view.you].pendingDraw) return 'Talia rozdaje kartę…';
    if (options.length) return selection ? cardById[view.players[view.you].hand[selection.index]].name : '';
    if (selection?.type==='card') return targets.has(`${view.you}:-2`) ? 'Wyłóż kartę przed sobą.' : 'Wybierz podświetlony cel.';
    const actions = legalActions(view,view.you);
    const canPlay = actions.some(action=>action.type==='play');
    const canAttack = actions.some(action=>action.type==='attack');
    if (canPlay && canAttack) return 'Zagraj kartę z ręki albo wybierz gotową jednostkę do ataku.';
    if (canPlay) return 'Wybierz kartę z podświetloną obwódką.';
    if (canAttack) return 'Wybierz gotową jednostkę, aby zaatakować.';
    return 'Brak dostępnych ruchów. Zakończ turę.';
  }

  function render() {
    const hand = root.querySelector('.tf-hand');
    const scroll = hand?.scrollLeft || 0;
    const active = root.contains(document.activeElement) ? document.activeElement.dataset : null;
    const focus = active?.do ? {...active} : null;
    if (!view) root.innerHTML = landing(searching,error,resumeAvailable);
    else {
      root.innerHTML = battle(view,{
        now:now(),targets,
        playable:new Set(isMyTurn() ? legalActions(view,view.you).filter(action=>action.type==='play').map(action=>action.index) : []),
        canAttack:isMyTurn() ? occupied(view,view.you).filter(key => attackPlays(view,view.you,key).length) : [],
        selected:selection,status:getStatus(),choices:options,error,busy
      });
      root.querySelector('.tf-hand').scrollLeft = scroll;
    }
    if (focus && !dialog.open) {
      const replacement = [...root.querySelectorAll('[data-do]')].find(element => ['do','index','side','key']
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

  const anchor = (side,key) => root.querySelector(`[data-anchor="${side}:${key}"]`);
  function sound(name,delay=0) {
    const current = generation;
    if (!delay) return playSound(soundUrl(name));
    setTimeout(()=>{
      if (current === generation) playSound(soundUrl(name));
    },delay);
  }

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

  function flyDraw(destination,card,delay=0) {
    const start = point(root.querySelector('[data-deck]'));
    const end = point(destination);
    sound('draw',delay);
    if (reduced.matches || !start || !end || !destination || !destination.animate) return;
    const from = root.querySelector('[data-deck]').getBoundingClientRect();
    const to = destination.getBoundingClientRect();
    const width = Math.min(from.width,72);
    const height = width*1.45;
    const sprite = document.createElement('div');
    sprite.className = 'tf-card-flight';
    sprite.style.cssText = `left:${start.x-width/2}px;top:${start.y-height/2}px;width:${width}px;height:${height}px`;
    sprite.innerHTML = `<div class="tf-flight-inner">${back}${card?`<span class="tf-flight-face"><img src="${art(card)}" alt=""></span>`:''}</div>`;
    effectsRoot.append(sprite);
    destination.classList.add('tf-in-flight');
    const x = end.x-start.x, y = end.y-start.y;
    const duration = 480;
    const flight = sprite.animate([
      {offset:0,transform:'translate3d(0,0,0) rotate(10deg)'},
      {offset:.24,transform:`translate3d(${x*.27}px,${y*.20-35}px,0) rotate(-13deg) scale(1.17)`},
      {offset:.73,transform:`translate3d(${x*.85}px,${y*.83-10}px,0) rotate(6deg) scale(1.12)`},
      {offset:1,transform:`translate3d(${x}px,${y}px,0) rotate(0) scale(${to.width/width},${to.height/height})`}
    ],{duration,delay,fill:'both',easing:'cubic-bezier(.2,.6,.33,1)'});
    if (card) sprite.firstElementChild.animate(
      [{transform:'rotateY(0deg)'},{transform:'rotateY(0deg)',offset:.41},{transform:'rotateY(180deg)',offset:.89},{transform:'rotateY(180deg)'}],
      {duration,delay,fill:'both'}
    );
    flight.onfinish = ()=>{
      sprite.remove();
      destination.classList.remove('tf-in-flight');
      if (destination.isConnected) burst(effectsRoot,end,{color:'#ffdea6',glyph:'·',motion:'flutter'},'draw');
    };
  }

  function dealCards() {
    const own = [...root.querySelectorAll('.tf-hand .tf-card')];
    const opposing = [...root.querySelectorAll('.tf-hidden-hand .tf-card-back')];
    const hand = view.players[view.you].hand;
    own.forEach((card,index)=>flyDraw(card,cardById[hand[index]],index*135+65));
    opposing.forEach((card,index)=>flyDraw(card,null,index*135));
  }

  function announce(text,color,portrait) {
    if (reduced.matches) return;
    const center = point(root.querySelector('[data-scene]'));
    if (!center) return;
    const splash = particle('tf-banner-fx',center,text);
    splash.style.setProperty('--banner-color',color);
    if (portrait) {
      splash.classList.add('tf-banner-legend');
      const face = document.createElement('img');
      face.src = art(portrait);
      face.alt = '';
      splash.prepend(face);
    }
  }

  function animate(effects,origin,oldAnchors) {
    const attacking = effects.some(effect=>effect.type==='attack');
    const castDelay = attacking ? 230 : 65;
    const heard = new Set();
    const followUp = name => {
      if (heard.has(name)) return;
      heard.add(name);
      sound(name,castDelay);
    };
    if (!attacking && effects.some(e=>['summon','spell','trap-set'].includes(e.type))) sound('place');

    for (const effect of effects) {
      const {type,side,key,amount,card,to,element} = effect;
      const cell = anchor(side,key);
      const target = type==='spell' && key===-1 ? point(root.querySelector('[data-scene]')) : point(cell) || oldAnchors.get(`${side}:${key}`);
      if (type==='draw') {
        const own = side===view.you;
        const drawn = effect.accepted && root.querySelector(own ? '.tf-hand .tf-card:last-child' : '.tf-hidden-hand .tf-card-back:last-child');
        if (drawn && own && !reduced.matches) {
          const hand = drawn.parentElement;
          if (drawn.offsetLeft+drawn.offsetWidth > hand.scrollLeft+hand.clientWidth) hand.scrollLeft = hand.scrollWidth;
        }
        flyDraw(drawn,own && effect.accepted ? cardById[view.players[side].hand.at(-1)] : null);
        continue;
      }
      if (type==='attack') {
        const style = cardEffect(card);
        sound('attack-'+card);
        const end = point(anchor(1-side,to)) || oldAnchors.get(`${1-side}:${to}`);
        if (reduced.matches || !target || !end) continue;
        strike(effectsRoot,target,end,style);
        const table = root.querySelector('[data-table]');
        table?.style.setProperty('--strike-color',style.color);
        table?.classList.add('tf-table-impact');
        const attacker = cell?.querySelector('.tf-card');
        if (attacker) {
          attacker.style.setProperty('--lunge-x',Math.round((end.x-target.x)*.19)+'px');
          attacker.style.setProperty('--lunge-y',Math.round((end.y-target.y)*.27)+'px');
          attacker.classList.add('tf-lunge');
        }
        continue;
      }
      if (type==='summon' || type==='spell' || type==='trap-set') {
        if (type==='trap-set') {
          if (side===view.you) sound('trap-set',85);
          if (!reduced.matches && target) burst(effectsRoot,target,cardEffect('trap'),'place',75);
          continue;
        }
        const style = cardEffect(card,element);
        sound(element ? 'element-'+element : 'play-'+card,type==='summon'?195:castDelay);
        if (reduced.matches || !target) continue;
        const definition = cardById[card];
        if (!element && !attacking && definition.rarity===3 && card!=='egg') {
          announce(definition.name,style.color,definition);
        }
        if (type==='summon') {
          const start = origin && side===view.you ? origin : point(root.querySelector(side===view.you ? '.tf-hand' : '.tf-hidden-hand'));
          if (start) {
            const fly = particle('tf-flying',start,'',art(cardById[card]));
            fly.style.setProperty('--to-x',target.x+'px');
            fly.style.setProperty('--to-y',target.y+'px');
          }
          burst(effectsRoot,target,style,'place',190);
        } else {
          const splash = particle('tf-spell-art',target,'',art(cardById[card]));
          splash.style.setProperty('--spell',style.color);
          splash.dataset.spell = element || card;
          burst(effectsRoot,target,style,'spell',120);
        }
        continue;
      }
      const feedback = {
        hit: ['hit','−'+amount,'#ffb08d'],
        'base-hit': ['castle','−'+amount,'#ff956f'],
        heal: ['heal','+'+amount,'#91ffb2'],
        shield: ['shield','◈','#b8eaff'],
        fall: ['fall','✧','#ddd2ee'],
      }[type];
      if (!feedback) continue;
      const [cue,label,color] = feedback;
      followUp(cue);
      if (reduced.matches || !target) continue;
      const impact = particle('tf-impact',target,label);
      impact.style.setProperty('--spell',color);
      impact.style.setProperty('--delay',castDelay+'ms');
      if (type==='shield' || type==='heal' || type==='base-hit') {
        const style = cardEffect(type==='shield'?'barrier':type==='heal'?'rain':'quake');
        burst(effectsRoot,target,style,'impact',castDelay);
      }
    }
  }

  function updateView(next,origin) {
    const previous = view;
    if (previous && next.revision < previous.revision) return;
    const changed = !view || next.revision !== view.revision || view.phase !== next.phase;
    if (!changed) return;
    const oldAnchors = new Map([...root.querySelectorAll('[data-anchor]')].map(node=>[node.dataset.anchor,point(node)]));
    view = next;
    error = '';
    dismissChoice();
    render();
    if (previous) {
      if (next.turn !== previous.turn && next.active === next.you && next.phase==='battle') {
        sound('turn');
        announce('Twoja tura','#b1ffe0');
      }
      animate(next.effects,origin,oldAnchors);
    }
    else if (next.revision===0) dealCards();
    if (next.phase === 'finished') {
      if (dialog.open) dialog.close();
      const current = generation;
      setTimeout(()=>{
        if (view!==next || generation!==current) return;
        if (next.winner!==-1) sound(next.winner===next.you?'victory':'defeat');
        showResult();
      },reduced.matches?0:570);
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
      body:JSON.stringify({name:getNick(),...input}),
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
    if (!resume || !resumeAvailable) practice=createMatch([getNick(),'Strażnik Szlaku'],now());
    else {
      practice = hydrateMatch(practice);
      practice.deadline = now()+45000;
      if (practice.players[practice.active].pendingDraw) {
        practice = applyAction(practice,practice.active,{type:'draw'},now()) || practice;
      }
    }
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
    if (view.players[view.you].pendingDraw) return;
    if (selection?.index===index) { dismissChoice(); error=''; return render(); }
    const card = cardById[view.players[ownSide()].hand[index]];
    const plays = cardPlays(view,view.you,index);
    if (!card) return;
    dismissChoice();
    if (!plays.length) {
      const player = view.players[view.you];
      const cost = effectiveCost(view,view.you,card);
      error = cost > player.energy ? `Ta karta potrzebuje ${cost} energii. Masz ${player.energy}.` :
        card.type==='unit' ? (occupied(view,view.you).length>=tableLimit ? 'Masz już pięć jednostek na stole.' : 'Lawina blokuje wykładanie jednostek w tej turze.') :
        card.id==='trap' && player.trapped ? 'Pułapka już czeka na stole.' : 'Ta karta nie ma teraz celu.';
      return render();
    }
    error='';
    selection={type:'card',index,card,plays};
    if (plays[0].target===-1) {
      if (card.type==='unit') targets.set(`${ownSide()}:-2`,plays);
      options=[{label:card.type==='unit'?'Wyłóż na stół':'Zagraj taktykę',index:0,action:plays[0]}];
    } else {
      const side = card.type==='unit' || card.target==='enemy' ? 1-ownSide() : ownSide();
      for (const play of plays) {
        const key = `${side}:${play.target}`;
        targets.set(key,[...(targets.get(key) || []),play]);
      }
    }
    render();
  }

  function chooseTarget(side,key) {
    const plays = targets.get(`${side}:${key}`);
    if (plays) {
      if (plays.length===1) return act(plays[0]);
      targets.clear();
      options=plays.map((action,index)=>({
        index,action,label:action.element==='fire'?'🔥 Ogień':action.element==='ice'?'❄ Lód':'↬ Wiatr'
      }));
      return render();
    }
    if (side===ownSide() && isMyTurn() && !busy) {
      const attacks=attackPlays(view,view.you,key);
      if (attacks.length && !(selection?.type==='attack' && selection.from===key)) {
        dismissChoice();
        selection={type:'attack',from:key};
        for (const action of attacks) targets.set(`${1-side}:${action.to}`,[action]);
        error='';
        return render();
      }
    }
    const unit = view.players[side].board[key];
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
  },{signal:listeners.signal});
  scope.addEventListener('click',async event=>{
    const button=event.target.closest('[data-do]');
    if (!button || button.disabled) return;
    const {do:action,index,side,key}=button.dataset;
    switch(action) {
      case 'online': return accountId ? startOnline() : openAuth();
      case 'practice': return accountId ? startPractice() : openAuth();
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
        <ol class="tf-rules"><li>Na początku tury talia automatycznie dobiera ci kartę. Kliknij podświetloną kartę, a potem „Wyłóż kartę”, „Zagraj” lub jej cel.</li>
        <li>Wyłóż do pięciu jednostek. Gotową jednostką atakujesz dowolnego wroga. Gdy rywal nie ma jednostek, możesz uderzyć w zamek.</li>
        <li>Zagrywaj taktyki, by leczyć, osłaniać, zamrażać albo zastawiać pułapki.</li>
        <li>Wygrywasz, gdy zamek rywala straci 20 HP. Gdy zabraknie kart, dobieranie rani zamek.</li></ol>`);
      case 'catalog': filter='all'; rarity='all'; return refreshCatalog();
      case 'close': return dialog.close();
      case 'menu': storage.set('online',null); return toMenu();
      case 'again':
        dialog.close();
        return mode==='online' ? startOnline() : startPractice(false);
      case 'end': return act({type:'end'});
      case 'clear': dismissChoice(); error=''; return render();
      case 'target': return chooseTarget(Number(side),Number(key));
      case 'hand': return selectCard(Number(index));
      case 'choice': return act(options[Number(index)]?.action);
      case 'leave':
        if (view?.phase==='finished') { storage.set('online',null); return toMenu(); }
        return popup('<div class="tf-result"><h2>Poddać partię?</h2><p>Rywal wygra ten pojedynek.</p><div><button class="tf-primary" data-do="surrender">Poddaj się</button><button class="tf-quiet" data-do="close">Wróć</button></div></div>');
      case 'surrender':
        dialog.close();
        return act({type:'leave'});
    }
  },{signal:listeners.signal});

  const clockInterval = setInterval(()=>{
    const clock=root.querySelector('[data-clock]');
    if (!clock || !view) return;
    const remaining=Math.max(0,Math.ceil((view.deadline-now())/1000));
    clock.textContent=remaining+' s';
    if (!remaining && mode==='practice') applyPractice(view.active,{type:'timeout'});
  },250);

  render();
  if (storage.get('online')) startOnline(true);
  return () => {
    const wasSearching = mode === 'online' && Boolean(queuedRequest || searching === 'Szukam rywala…');
    generation++;
    stopTimer();
    clearInterval(clockInterval);
    listeners.abort();
    effectsRoot.remove();
    if (dialog.open) dialog.close();
    if (wasSearching) {
      void Promise.resolve(queuedRequest).catch(()=>{}).then(()=>request({kind:'cancel'})).then(response=>{
        if (response.stage==='battle') storage.set('online',response.id);
      }).catch(()=>{});
    }
  };
}
