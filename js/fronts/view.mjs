import {cards, cardById, rarities} from './cards.mjs';
import {effectiveCost,lanes} from './engine.mjs';

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

export function landing(status,error,nick,canResume=false) {
  return `<header class="tf-top"><a class="tf-brand" href="/"><img src="${logo}" alt=""> Gry grupowe</a><span>⚔ Karcianka dla dwóch osób</span></header>
  <main class="tf-lobby">
    <div class="tf-lobby-copy">
      <p class="tf-crest" aria-hidden="true">✶</p>
      <h1>Trzy<br><em>Fronty</em></h1>
      <p class="tf-pitch">Wezwij jednostki, zastaw pułapki i przełam obronę zamku.</p>
      <div class="tf-lobby-actions">
        ${status ? `<div class="tf-searchbox" role="status"><span class="tf-spinner"></span><strong>${status}</strong><button type="button" class="tf-quiet" data-do="cancel">Anuluj</button></div>` :
        `<label class="tf-nick">Twój nick<input data-nick maxlength="22" value="${escape(nick)}" placeholder="Wędrowiec" autocomplete="nickname"></label>
        <button type="button" class="tf-primary" data-do="online">Szukaj rywala <span aria-hidden="true">↗</span></button>`}
        <div class="tf-secondary"><button type="button" class="tf-quiet" data-do="practice" ${status?'disabled':''}>${canResume?'Wróć do treningu':'Trening z botem'}</button><button type="button" class="tf-quiet" data-do="catalog">Katalog kart <span>50</span></button></div>
        ${error ? `<p class="tf-error" role="alert">${escape(error)}</p>` : ''}
      </div>
    </div>
    <div class="tf-lobby-fan" aria-hidden="true">${['slime','knight','elemental'].map(id => `<div class="tf-card tf-r${cardById[id].rarity}">${cardFace(cardById[id],{compact:true})}</div>`).join('')}</div>
  </main>
  <footer class="tf-lobby-footer"><span>35 jednostek</span><span>15 taktyk</span><button type="button" data-do="rules">Jak grać? <b>ⓘ</b></button></footer>`;
}

function castle(state,side,now) {
  const player = state.players[side];
  const own = side === state.you;
  const energy = Array.from({length:6},(_,i) => `<i class="${i<player.energy?'lit':i<player.maxEnergy?'spent':''}"></i>`).join('');
  return `<div class="tf-castle ${state.active === side?'tf-active':''}" data-anchor="${side}:-1">
    <span class="tf-fort ${player.hp<=7?'tf-fort-damaged':''}" aria-hidden="true">♜</span>
    <div class="tf-castle-label"><strong>${own?'Ty':escape(player.name)}</strong><span title="Życie zamku" class="tf-hp">♥ <b>${player.hp}</b><small>/20</small></span></div>
    <div class="tf-energy" title="Energia ${player.energy} z ${player.maxEnergy}" aria-label="Energia ${player.energy} z ${player.maxEnergy}">${energy}</div>
    ${state.active === side && state.phase==='battle' ? `<time class="tf-clock" data-clock>${Math.max(0,Math.ceil((state.deadline-now)/1000))} s</time>` : ''}
  </div>`;
}

function boardSlot(state,side,lane,targets,canAttack,selected) {
  const player = state.players[side];
  const unit = player.board[lane];
  const card = cardById[unit?.card];
  const own = side === state.you;
  const ready = own && canAttack.includes(lane);
  const target = targets.has(`${side}:${lane}`);
  const selectedUnit = own && selected?.type==='attack' && selected.from===lane;
  const shields = (unit?.shield || 0)+(unit?.temporaryShield || 0);
  const effects = [state.fog[lane]>state.turn?'Mgła':'',state.barriers[lane]>state.turn?'Lawina':'',player.thorns[lane]>state.turn?'Ciernie':''].filter(Boolean);
  const hitLabel = unit ? `${card.name}, atak ${card.attack}, życie ${unit.hp}` : `${own?'Twoje':'Wrogie'} pole ${lane+1}`;
  return `<div class="tf-slot-wrap" data-anchor="${side}:${lane}">
    <button type="button" class="tf-slot ${ready?'tf-ready':''} ${target?'tf-target':''} ${selectedUnit?'tf-selected':''} ${unit?'tf-occupied':''}"
      data-side="${side}" data-lane="${lane}" data-do="slot" aria-label="${hitLabel}" aria-pressed="${selectedUnit}">
      ${card ? `<span class="tf-card tf-r${card.rarity}">${cardFace(card,{hp:unit.hp,cost:undefined,compact:true})}</span>` : `<span class="tf-slot-empty" aria-hidden="true">${target?own?'+':'◎':'◇'}</span>`}
      ${card ? `<span class="tf-unit-conditions">${shields?`<i title="Tarcza ${shields}">◈ ${shields}</i>`:''}${unit.poison?'<i title="Trucizna">☠</i>':''}${unit.freezeUntil>state.turn?'<i title="Zamrożenie">❄</i>':''}${unit.mark?'<i title="Oznaczenie">◎</i>':''}${unit.readyAt>state.turn?'<i title="Odpoczywa">zZ</i>':''}</span>` : ''}
    </button>
    ${player.traps[lane] ? `<span class="tf-trap-mark" title="${own?'Fałszywy odwrót':'Zakryta pułapka'}">${back}</span>` : ''}
    ${effects.length ? `<span class="tf-tile-effects" title="${effects.join(', ')}">${effects.join(' · ')}</span>` : ''}
  </div>`;
}

export function battle(state,{now,targets,canAttack,selected,status,choices,error,busy}){
  const you = state.you;
  const rival = state.players[1-you];
  const yours = state.players[you];
  const active = state.active === you;
  const done = state.phase === 'finished';
  const rivalHand = Math.min(rival.handCount,8);
  const deckName = `Wspólna talia, kart: ${state.deckCount}`;
  return `<header class="tf-top tf-battle-top"><strong class="tf-wordmark">Trzy <i>Fronty</i></strong>
      <div><button type="button" class="tf-quiet" data-do="catalog">Karty</button><button type="button" class="tf-quiet" data-do="leave">${done?'Menu':'Wyjdź'}</button></div></header>
    <main class="tf-arena" aria-label="Pole bitwy" aria-busy="${busy}">
      <div class="tf-arena-clearing">
        <div class="tf-rival">
          <div class="tf-hidden-hand" role="img" aria-label="Karty rywala: ${rival.handCount}">${Array.from({length:rivalHand},()=>back).join('')}</div>
          ${castle(state,1-you,now)}
          <div class="tf-deck" title="${deckName}" aria-label="${deckName}" role="img">${back}<b>${state.deckCount}</b></div>
        </div>
        <div class="tf-field" data-scene>
          ${lanes.map((lane,i)=>`<div class="tf-lane tf-lane-${lane}">
            ${boardSlot(state,1-you,lane,targets,canAttack,selected)}
            <span class="tf-front-label">${['Bór','Trakt','Przełęcz'][i]}</span>
            ${boardSlot(state,you,lane,targets,canAttack,selected)}
          </div>`).join('')}
        </div>
        <div class="tf-own">${castle(state,you,now)}
          <button type="button" class="tf-end" data-do="end" ${!active||done||busy?'disabled':''}>Zakończ turę <span aria-hidden="true">→</span></button>
        </div>
      </div>
      <div class="tf-command" ${error?'role="alert"':'aria-live="polite"'}>
        <span class="tf-turn">${done?'Koniec':active?'Twoja tura':'Tura rywala'} <b>· ${Math.ceil(state.turn/2)}</b></span>
        <span>${escape(error || status)}</span>
        ${choices.map(({label,index})=>`<button type="button" class="tf-quiet" data-do="choice" data-index="${index}">${label}</button>`).join('')}
        ${selected ? '<button type="button" class="tf-clear" data-do="clear" aria-label="Anuluj wybór">×</button>' : ''}
      </div>
      <div class="tf-hand" aria-label="Twoje karty">${yours.hand.map((id,index)=>{
        const card = cardById[id];
        const cost = effectiveCost(state,you,card);
        return `<button type="button" data-do="hand" data-index="${index}" class="tf-card tf-r${card.rarity} ${active && cost<=yours.energy?'tf-affordable':''} ${selected?.index===index?'tf-selected':''}" aria-pressed="${selected?.index===index}" aria-label="${card.name}, koszt ${cost}. ${card.text}">${cardFace(card,{cost})}</button>`;
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
