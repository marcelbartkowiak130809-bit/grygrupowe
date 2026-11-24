import {cards, cardById, rarities} from './cards.mjs?v=5';
import {effectiveCost} from './engine.mjs?v=6';

export const escape = value => String(value ?? '').replace(/[&<>"']/g,char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export const art = card => `/assets/fronts/${card.art}.webp?v=3`;
const logo = '/assets/icons/game-icon-180.png';
export const back = `<span class="tf-card-back" aria-hidden="true"><img src="${logo}" alt=""></span>`;

export function cardFace(card,{cost=card.cost, hp=card.hp, compact=false} = {}) {
  return `<span class="tf-card-name">${card.name}</span>
    <span class="tf-artwork" style="--illustration:url('${art(card)}')">
      <img class="tf-card-image" src="${art(card)}" alt="" ${compact?'':'loading="lazy"'} draggable="false">
      ${cost === undefined ? '' : `<i class="tf-cost" aria-label="Koszt ${cost}">${cost}</i>`}
    </span>
    ${card.type === 'unit' ? `<span class="tf-card-stats"><b title="Atak">⚔ ${card.attack}</b><b title="Życie">♥ ${hp}</b></span>` : '<span class="tf-card-stats tf-tactic-stat">✦ Taktyka</span>'}
    ${compact ? '' : `<span class="tf-card-text">${card.text}</span>`}`;
}

export function landing(status,error,canResume=false) {
  return `<main class="tf-lobby">
    <div class="tf-lobby-copy">
      <p class="tf-crest" aria-hidden="true">✶</p>
      <h1>Trzy<br><em>Fronty</em></h1>
      <p class="tf-pitch">Wezwij jednostki, zastaw pułapki i przełam obronę zamku.</p>
      <div class="tf-lobby-actions">
        ${status ? `<div class="tf-searchbox" role="status"><span class="tf-spinner"></span><strong>${status}</strong><button type="button" class="tf-quiet" data-do="cancel">Anuluj</button></div>` :
        `<button type="button" class="tf-primary" data-do="online">Szukaj rywala <span aria-hidden="true">↗</span></button>`}
        <div class="tf-secondary"><button type="button" class="tf-quiet" data-do="practice" ${status?'disabled':''}>${canResume?'Wróć do treningu':'Trening z botem'}</button><button type="button" class="tf-quiet" data-do="catalog">Katalog kart <span>50</span></button></div>
        ${error ? `<p class="tf-error" role="alert">${escape(error)}</p>` : ''}
      </div>
    </div>
    <div class="tf-lobby-fan" aria-hidden="true">${['slime','knight','elemental'].map(id => `<div class="tf-card tf-r${cardById[id].rarity}">${cardFace(cardById[id],{compact:true})}</div>`).join('')}</div>
  </main>
  <footer class="tf-lobby-footer"><span>35 jednostek</span><span>15 taktyk</span><button type="button" data-do="rules">Jak grać? <b>ⓘ</b></button></footer>`;
}

function castle(state,side,now,targets) {
  const player = state.players[side];
  const own = side === state.you;
  const energy = Array.from({length:6},(_,i) => `<i class="${i<player.energy?'lit':i<player.maxEnergy?'spent':''}"></i>`).join('');
  return `<button type="button" class="tf-castle ${state.active === side?'tf-active':''} ${targets.has(`${side}:-1`)?'tf-target':''}" data-anchor="${side}:-1" data-do="target" data-side="${side}" data-key="-1" aria-label="${own?'Twój zamek':'Zamek rywala'} · ${player.hp} HP">
    <span class="tf-fort ${player.hp<=7?'tf-fort-damaged':''}" aria-hidden="true"><i></i></span>
    <div class="tf-castle-label"><strong>${own?'Ty':escape(player.name)}</strong><span title="Życie zamku" class="tf-hp">♥ <b>${player.hp}</b><small>/20</small></span><span class="tf-hp-track" style="--health:${player.hp*5}%" aria-hidden="true"></span></div>
    <div class="tf-energy" title="Energia ${player.energy} z ${player.maxEnergy}" aria-label="Energia ${player.energy} z ${player.maxEnergy}">${energy}</div>
    ${state.active === side && state.phase==='battle' ? `<time class="tf-clock" data-clock>${Math.max(0,Math.ceil((state.deadline-now)/1000))} s</time>` : ''}
  </button>`;
}

const tilts = [-4, 2, -1, 4, -3];

function tableCard(state,side,key,targets,canAttack,selected) {
  const unit = state.players[side].board[key];
  const card = cardById[unit.card];
  const own = side === state.you;
  const ready = own && canAttack.includes(key);
  const target = targets.has(`${side}:${key}`);
  const selectedUnit = own && selected?.type==='attack' && selected.from===key;
  const shields = (unit.shield || 0)+(unit.temporaryShield || 0);
  return `<button type="button" class="tf-slot tf-occupied ${ready?'tf-ready':''} ${target?'tf-target':''} ${selectedUnit?'tf-selected':''}"
    style="--tilt:${tilts[key%tilts.length]}deg;--lift:${key%3*4}px" data-anchor="${side}:${key}" data-side="${side}" data-key="${key}" data-do="target"
    aria-label="${card.name}, atak ${card.attack}, życie ${unit.hp}" aria-pressed="${selectedUnit}">
    <span class="tf-card tf-r${card.rarity}">${cardFace(card,{hp:unit.hp,compact:true})}</span>
    <span class="tf-unit-conditions">${shields?`<i title="Tarcza ${shields}">◈ ${shields}</i>`:''}${unit.poison?'<i title="Trucizna">☠</i>':''}${unit.freezeUntil>state.turn?'<i title="Zamrożenie">❄</i>':''}${unit.mark||unit.exposedUntil>state.turn?'<i title="Oznaczenie">◎</i>':''}${unit.readyAt>state.turn?'<i title="Odpoczywa">zZ</i>':''}</span>
  </button>`;
}

function tabletop(state,side,targets,canAttack,selected) {
  const player = state.players[side];
  const own = side === state.you;
  const label = own?'Twoje jednostki':'Jednostki rywala';
  return `<div class="tf-table-row ${own?'tf-table-own':'tf-table-rival'}" aria-label="${label}">
    ${Object.keys(player.board).map(key=>tableCard(state,side,Number(key),targets,canAttack,selected)).join('')}
    ${targets.has(`${side}:-2`)?`<button type="button" class="tf-drop" data-do="target" data-side="${side}" data-key="-2">↓ Wyłóż kartę</button>`:''}
  </div>`;
}

function tableMarkers(player,turn) {
  const markers = [['❧','Ciernie',player.thornsUntil>turn],['☁','Mgła',player.fogUntil>turn],['⬢','Lawina',player.barrierUntil>turn]];
  return `<span class="tf-table-markers">${player.trapped?`<span class="tf-trap-mark" title="Zakryta pułapka">${back}</span>`:''}${markers.filter(([, ,active])=>active).map(([icon,label])=>`<i title="${label}" aria-label="${label}">${icon}</i>`).join('')}</span>`;
}

export function battle(state,{now,targets,canAttack,playable,selected,status,choices,error,busy}){
  const you = state.you;
  const rival = state.players[1-you];
  const yours = state.players[you];
  const active = state.active === you;
  const done = state.phase === 'finished';
  const deckName = `Wspólna talia, kart: ${state.deckCount}`;
  return `<header class="tf-top tf-battle-top"><strong class="tf-wordmark">Trzy <i>Fronty</i></strong>
      <div><button type="button" class="tf-quiet" data-do="rules" aria-label="Jak grać?" title="Jak grać?">?</button> <button type="button" class="tf-quiet" data-do="catalog">Karty</button> <button type="button" class="tf-quiet" data-do="leave">${done?'Menu':'Wyjdź'}</button></div></header>
    <main class="tf-arena" aria-label="Stół do gry" aria-busy="${busy}">
        <div class="tf-rival">
          <div class="tf-hidden-hand" role="img" aria-label="Karty rywala: ${rival.handCount}">${Array.from({length:rival.handCount},()=>back).join('')}</div>
          ${castle(state,1-you,now,targets)}
          ${tableMarkers(rival,state.turn)}
        </div>
        <div class="tf-stage">
        <div class="tf-arena-clearing" data-table>
        <div class="tf-field" data-scene>
          <div class="tf-inlay" aria-hidden="true"><span>♜</span></div>
          <div class="tf-table-cards">
            ${tabletop(state,1-you,targets,canAttack,selected)}
            ${tabletop(state,you,targets,canAttack,selected)}
          </div>
          <div class="tf-deck ${state.deckCount?'':'tf-deck-empty'}" role="img" aria-label="${deckName}" title="${deckName}">
            <span class="tf-deck-stack" data-deck>${back}${back}${back}</span>
            <span class="tf-deck-count">Talia <b>${state.deckCount}</b></span>
          </div>
        </div>
        </div>
        </div>
        <div class="tf-own">${tableMarkers(yours,state.turn)}${castle(state,you,now,targets)}
          <button type="button" class="tf-end" data-do="end" ${!active||done||busy||yours.pendingDraw?'disabled':''}>Zakończ turę <span aria-hidden="true">→</span></button>
        </div>
      <div class="tf-command" ${error?'role="alert"':'aria-live="polite"'}>
        <span class="tf-turn">${done?'Koniec':active?'Twoja tura':'Tura rywala'} <b>· ${Math.ceil(state.turn/2)}</b></span>
        <span class="tf-energy-text">❖ <b>${yours.energy}/${yours.maxEnergy}</b> energii</span>
        <span>${escape(error || status)}</span>
        ${choices.map(({label,index})=>`<button type="button" class="tf-end tf-confirm-card" data-do="choice" data-index="${index}">${label}</button>`).join('')}
        ${selected ? '<button type="button" class="tf-clear" data-do="clear" aria-label="Anuluj wybór">×</button>' : ''}
      </div>
      <div class="tf-hand" aria-label="Twoje karty">${yours.hand.map((id,index)=>{
        const card = cardById[id];
        const cost = effectiveCost(state,you,card);
        return `<button type="button" data-do="hand" data-index="${index}" style="--tilt:${(index-(yours.hand.length-1)/2)*2}deg;--lift:${Math.abs(index-(yours.hand.length-1)/2)*2.7}px" class="tf-card tf-r${card.rarity} ${playable.has(index)?'tf-affordable':''} ${selected?.index===index?'tf-selected':''}" aria-pressed="${selected?.index===index}" aria-label="${card.name}, koszt ${cost}. ${card.text}">${cardFace(card,{cost})}</button>`;
      }).join('')}</div>
    </main>`;
}

export function catalogBody(filter='all',rarity='all') {
  const filtered = cards.filter(card=>(filter==='all'||card.type===filter) && (rarity==='all'||card.rarity===Number(rarity)));
  return `<header class="tf-dialog-header"><h2>Katalog kart</h2><button type="button" class="tf-quiet" data-do="close" aria-label="Zamknij katalog">×</button></header>
    <div class="tf-filters">
      <label>Rodzaj <select data-filter><option value="all" ${filter==='all'?'selected':''}>Wszystkie</option><option value="unit" ${filter==='unit'?'selected':''}>Jednostki</option><option value="tactic" ${filter==='tactic'?'selected':''}>Taktyki</option></select></label>
      <label>Rzadkość <select data-rarity><option value="all">Wszystkie</option>${rarities.map((item,i)=>`<option value="${i}" ${rarity===String(i)?'selected':''}>${item}</option>`).join('')}</select></label>
      <b>${filtered.length} / 50</b>
    </div>
    <div class="tf-catalog">${filtered.map(card=>`<article class="tf-catalog-entry">
      <div class="tf-card tf-r${card.rarity}" data-card="${card.id}">${cardFace(card)}</div><span>${rarities[card.rarity]}</span></article>`).join('')}</div>`;
}
