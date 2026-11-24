import {cards, cardById} from './cards.mjs?v=5';

export const tableLimit = 5;
export const turnMs = 45000;
const opponent = side => 1-side;
const unitsOf = (state, side) => state.players[side].board;
const unitAt = (state, side, key) => unitsOf(state,side)[key];
const definition = unit => cardById[unit?.card];
const expires = state => state.turn+2;
const isActive = (state, property) => (property || 0) > state.turn;
export const occupied = (state, side) => Object.keys(unitsOf(state,side)).map(Number);
const hasAura = (state, side, ability) => Object.values(unitsOf(state,side)).some(unit => definition(unit)?.ability === ability);

function emit(state, type, side, key, options = {}) {
  state.effects.push({type, side, key, ...options});
}

function healBase(state, side, amount) {
  const player = state.players[side];
  if (player.hp <= 0) return;
  const gain = Math.min(amount,20-player.hp);
  if (!gain) return;
  player.hp += gain;
  emit(state,'heal',side,-1,{amount:gain});
}

function hitBase(state, side, amount) {
  if (amount <= 0) return;
  state.players[side].hp = Math.max(0,state.players[side].hp-amount);
  emit(state,'base-hit',side,-1,{amount});
}

function heal(state,side,key,amount) {
  const unit = unitAt(state,side,key);
  if (!unit) return;
  const gain = Math.min(amount, definition(unit).hp-unit.hp);
  if (!gain) return;
  unit.hp += gain;
  emit(state,'heal',side,key,{amount:gain});
}

function draw(state, side) {
  delete state.players[side].pendingDraw;
  const player = state.players[side];
  const next = state.deck.shift();
  if (!next) {
    player.fatigue = (player.fatigue || 0)+1;
    hitBase(state,side,player.fatigue);
    return;
  }
  const accepted = player.hand.length < 8;
  if (accepted) player.hand.push(next);
  emit(state,'draw',side,-1,{accepted});
}

function place(state,side,card,{ready=false,reborn=false,hp=cardById[card].hp} = {}) {
  const key = ++state.unitSerial;
  const unit = {key,card,hp,readyAt:state.turn+(ready?0:2)};
  if (reborn) unit.reborn = true;
  unitsOf(state,side)[key] = unit;
  emit(state,'summon',side,key,{card});
  return unit;
}

function remove(state, side, key) {
  const unit = unitAt(state,side,key);
  delete unitsOf(state,side)[key];
  emit(state,'fall',side,key,{card:unit.card});
  const enemy = opponent(side);
  switch (definition(unit).ability) {
    case 'bomb': {
      const target = occupied(state,enemy)[0];
      if (target !== undefined) hit(state,enemy,target,2);
      break;
    }
    case 'spore': healBase(state,side,1); break;
    case 'rebirth': if (!unit.reborn) place(state,side,'egg'); break;
    case 'split':
      place(state,side,'mini');
      if (occupied(state,side).length < tableLimit) place(state,side,'mini');
      break;
  }
}

function hit(state, side, key, damage, {attack=false} = {}) {
  let unit = unitAt(state,side,key);
  if (!unit || damage <= 0) return {dead:false, excess:0};
  if (attack && definition(unit).ability === 'shell' && !unit.used) {
    unit.used = true;
    damage--;
    emit(state,'shield',side,key,{amount:1});
  }
  if (attack && unit.mark) {
    damage++;
    delete unit.mark;
  }
  if (damage <= 0) return {dead:false,excess:0};
  const guardLane = attack ? occupied(state,side).filter(other => other !== key).find(other => {
    const guard = unitAt(state,side,other);
    return definition(guard)?.ability === 'guard' && guard.guardedRound !== Math.floor((state.turn-1)/2);
  }) : undefined;
  if (guardLane !== undefined) {
    key = guardLane;
    unit = unitAt(state,side,key);
    unit.guardedRound = Math.floor((state.turn-1)/2);
    emit(state,'shield',side,key,{amount:damage});
  }
  const bonus = Math.min(damage,unit.temporaryShield || 0);
  if (bonus) unit.temporaryShield -= bonus;
  const shield = Math.min(damage-bonus,unit.shield || 0);
  if (shield) unit.shield -= shield;
  damage -= bonus+shield;
  if (bonus+shield) emit(state,'shield',side,key,{amount:bonus+shield});
  if (damage) emit(state,'hit',side,key,{amount:damage});
  const excess = Math.max(0,damage-unit.hp);
  unit.hp -= damage;
  const dead = unit.hp <= 0;
  if (dead) remove(state,side,key);
  return {dead,excess,key};
}

function rallyUnit(state,side,key) {
  const unit = unitAt(state,side,key);
  const ability = definition(unit).ability;
  if (ability === 'river') heal(state,side,key,2);
  if (ability === 'wind') unit.shield = (unit.shield || 0)+1;
}

function canExhaust(unit) {
  return definition(unit)?.ability !== 'rooted';
}

function exhaust(state,side,key) {
  const unit = unitAt(state,side,key);
  if (unit && canExhaust(unit)) unit.freezeUntil = state.turn+2;
}

function freeze(state,side,key) {
  const target = unitAt(state,side,key);
  if (target) target.freezeUntil = state.turn+2;
}

function summonPower(state,side,unit,element,target) {
  const enemy = opponent(side);
  const allies = occupied(state,side).filter(key => key !== unit.key);
  switch (definition(unit).ability) {
    case 'ward': case 'bubble': unit.shield = 2; break;
    case 'rally': for (const key of allies) {
      const ally = unitAt(state,side,key);
      ally.shield = (ally.shield || 0)+1;
    } break;
    case 'medic': for (const key of allies) heal(state,side,key,2); break;
    case 'oak': if (allies.length) unit.shield = 1; break;
    case 'scout': draw(state,side); break;
    case 'lantern': healBase(state,side,2); break;
    case 'moon': for (const ally of Object.values(unitsOf(state,side))) {
      delete ally.poison; delete ally.freezeUntil;
    } break;
    case 'element':
      if (!element) break;
      emit(state,'spell',enemy,target,{card:'elemental',element});
      if (element === 'fire') hit(state,enemy,target,2);
      if (element === 'ice') freeze(state,enemy,target);
      if (element === 'wind') unitAt(state,enemy,target).exposedUntil = expires(state);
      break;
  }
}

function tacticPower(state,side,card,target) {
  const player = state.players[side];
  const enemy = opponent(side);
  const rival = state.players[enemy];
  const unit = unitAt(state,side,target);
  if (card.id === 'trap') {
    player.trapped = true;
    emit(state,'trap-set',side,-1);
    return;
  }
  emit(state,'spell',card.target === 'ally' || ['camp','fog','thorns'].includes(card.id) ? side : enemy,target,{card:card.id});
  switch (card.id) {
    case 'hail': for (const key of occupied(state,enemy)) hit(state,enemy,key,1); break;
    case 'quake': for (const owner of [enemy,side]) {
      for (const key of occupied(state,owner)) hit(state,owner,key,1);
    } break;
    case 'rain': heal(state,side,target,3); break;
    case 'fog': player.fogUntil = expires(state); break;
    case 'gust': exhaust(state,enemy,target); break;
    case 'cleanse': for (const owner of state.players) {
      for (const ally of Object.values(owner.board)) delete ally.poison;
    } break;
    case 'order':
      delete unit.freezeUntil;
      delete unit.attacked;
      unit.readyAt = state.turn;
      rallyUnit(state,side,target);
      break;
    case 'portal':
      unit.shield = (unit.shield || 0)+2;
      delete unit.poison;
      delete unit.freezeUntil;
      rallyUnit(state,side,target);
      break;
    case 'camp': healBase(state,side,3); break;
    case 'thorns': player.thornsUntil = expires(state); break;
    case 'meteor': hit(state,enemy,target,4); break;
    case 'barrier':
      unit.temporaryShield = 3;
      unit.shieldUntil = expires(state);
      break;
    case 'boulder': rival.barrierUntil = expires(state); break;
    case 'bolt': hit(state,enemy,target,2); break;
  }
}

function attack(state,side,from,to) {
  const enemy = opponent(side);
  const rival = state.players[enemy];
  const unit = unitAt(state,side,from);
  const card = definition(unit);
  unit.attacked = state.turn;
  const defend = unitAt(state,enemy,to);
  emit(state,'attack',side,from,{to,card:card.id});
  if (isActive(state,rival.thornsUntil)) {
    delete rival.thornsUntil;
    hit(state,side,from,2);
    if (unitAt(state,side,from) !== unit) return;
  }
  if (!defend && rival.trapped) {
    delete rival.trapped;
    emit(state,'spell',side,from,{card:'trap'});
    hit(state,side,from,3);
    return;
  }
  if (isActive(state,rival.fogUntil)) {
    delete rival.fogUntil;
    emit(state,'shield',enemy,to,{amount:1});
    return;
  }

  let damage = card.attack;
  if (card.ability === 'pack' && occupied(state,side).length > 1) damage++;
  if (card.ability === 'crusher' && (defend?.shield || defend?.temporaryShield)) damage += 2;
  if (card.ability === 'range' && to === -1) damage++;
  if (isActive(state,defend?.exposedUntil)) {
    damage++;
    delete defend.exposedUntil;
  }

  if (defend) {
    const result = hit(state,enemy,to,damage,{attack:true});
    const target = unitAt(state,enemy,result.key ?? to);
    const originalSurvived = target && !result.dead;
    if (originalSurvived && card.ability === 'mark') target.mark = true;
    if (originalSurvived && card.ability === 'poison') target.poison = true;
    if (originalSurvived && card.ability === 'freeze' && !unit.used) {
      freeze(state,enemy,result.key ?? to);
      unit.used = true;
    }
    if (originalSurvived && card.ability === 'web' && !unit.used && canExhaust(target)) {
      exhaust(state,enemy,result.key ?? to);
      unit.used = true;
    }
    if (result.dead && card.ability === 'cleave') {
      const other = occupied(state,enemy).find(key => key !== result.key);
      if (other !== undefined) hit(state,enemy,other,1);
    }
    if (result.dead && card.ability === 'trample') hitBase(state,enemy,result.excess);
    if (card.ability === 'fireball') {
      const other = occupied(state,enemy).find(key => key !== result.key);
      if (other !== undefined) hit(state,enemy,other,1);
    }
  } else {
    hitBase(state,enemy,damage);
  }
  if (card.ability === 'scorch') for (const key of occupied(state,enemy)) {
    if (key !== to) hit(state,enemy,key,1);
  }
  if (card.ability === 'vanish' && !unit.used && unitAt(state,side,from) === unit) {
    unit.used = true;
    unit.shield = (unit.shield || 0)+2;
  }
}

function finish(state,winner,reason) {
  state.phase = 'finished';
  state.winner = winner;
  state.reason = reason;
  state.deadline = 0;
}

function checkBases(state) {
  const fallen = state.players.map(player => player.hp <= 0);
  if (fallen.includes(true)) finish(state,fallen.every(Boolean) ? -1 : fallen[0] ? 1 : 0,'base');
}

function nextTurn(state,now,timeout) {
  const player = state.players[state.active];
  if (player.pendingDraw) draw(state,state.active);
  player.timeouts = timeout ? (player.timeouts || 0)+1 : 0;
  if (player.timeouts >= 2) {
    finish(state,opponent(state.active),'timeout');
    return;
  }
  for (const key of occupied(state,state.active)) {
    const unit = unitAt(state,state.active,key);
    if (!unit?.poison) continue;
    delete unit.poison;
    hit(state,state.active,key,1);
  }
  checkBases(state);
  if (state.phase === 'finished') return;
  state.turn++;
  state.active = opponent(state.active);
  state.deadline = now+turnMs;
  const incoming = state.players[state.active];
  incoming.maxEnergy = Math.min(6,2+Math.floor((state.turn-1)/2));
  incoming.energy = incoming.maxEnergy;
  delete incoming.tacticPlayed;
  for (const key of occupied(state,state.active)) {
    const unit = unitAt(state,state.active,key);
    if (unit.shieldUntil && !isActive(state,unit.shieldUntil)) {
      delete unit.shieldUntil;
      delete unit.temporaryShield;
    }
    if (unit.card === 'egg') {
      delete incoming.board[key];
      place(state,state.active,'phoenix',{ready:true,reborn:true,hp:2});
    }
    if (definition(unit).ability === 'renew') heal(state,state.active,key,1);
  }
  draw(state,state.active);
}

export function createMatch(names,now,random=Math.random) {
  const deck = cards.map(card => card.id);
  for (let i=deck.length-1;i>0;i--) {
    const j = Math.floor(random()*(i+1));
    [deck[i],deck[j]] = [deck[j],deck[i]];
  }
  const players = names.map(name => {
    const cheap = deck.findIndex(id => cardById[id].type === 'unit' && cardById[id].cost <= 2);
    return {name,hp:20,energy:2,maxEnergy:2,hand:deck.splice(cheap,1),board:{}};
  });
  for (let i=0;i<3;i++) for (const player of players) player.hand.push(deck.shift());
  return {players,deck,turn:1,active:0,phase:'battle',deadline:now+turnMs,tableVersion:2,unitSerial:0,revision:0,effects:[]};
}

// Realtime Database omits empty containers. Restore them before applying moves.
export function hydrateMatch(match) {
  const state = structuredClone(match);
  state.effects ||= [];
  state.deck ||= [];
  if (!state.tableVersion) {
    for (const player of state.players) {
      if (Object.keys(player.traps || {}).length) player.trapped = true;
      const thornsUntil = Math.max(0,...Object.values(player.thorns || {}));
      if (thornsUntil > state.turn) player.thornsUntil = thornsUntil;
      player.board = Object.fromEntries(Object.values(player.board || {}).filter(Boolean).map(unit => [unit.key,unit]));
      delete player.traps;
      delete player.thorns;
    }
    delete state.fog;
    delete state.barriers;
    state.tableVersion = 2;
    state.effects = [];
  }
  for (const player of state.players) {
    player.hand ||= [];
    player.board = Object.fromEntries(Object.entries(player.board || {}).filter(([,unit]) => unit));
  }
  return state;
}

export function effectiveCost(state,side,card) {
  return Math.max(0, card.cost-(card.type === 'tactic' && !state.players[side].tacticPlayed && hasAura(state,side,'archive') ? 1 : 0));
}

export function cardPlays(state,side,index) {
  const player = state.players[side];
  const card = cardById[player.hand[index]];
  if (player.pendingDraw || !card || effectiveCost(state,side,card) > player.energy) return [];
  const enemy = opponent(side);
  const play = (target=-1,extra={}) => ({type:'play',index,target,...extra});
  const rivals = occupied(state,enemy);
  if (card.type === 'unit') {
    if (occupied(state,side).length >= tableLimit || isActive(state,player.barrierUntil)) return [];
    if (card.ability !== 'element' || !rivals.length) return [play()];
    return rivals.flatMap(target => ['fire','ice','wind'].map(element => play(target,{element})));
  }
  if (card.id === 'trap' && player.trapped) return [];
  if (card.target === 'ally') return occupied(state,side).map(key => play(key));
  if (card.target === 'enemy') return rivals.filter(key => card.id !== 'gust' || canExhaust(unitAt(state,enemy,key))).map(key => play(key));
  return [play()];
}

export function attackPlays(state,side,from) {
  const unit = unitAt(state,side,from);
  if (state.players[side].pendingDraw || !unit || unit.readyAt > state.turn || unit.attacked === state.turn || isActive(state,unit.freezeUntil)) return [];
  const card = definition(unit);
  if (!card.attack) return [];
  const targets = occupied(state,opponent(side));
  if (!targets.length && (card.ability !== 'charge' || unit.readyAt !== state.turn)) targets.push(-1);
  return targets.map(to => ({type:'attack',from,to}));
}

export function legalActions(state,side) {
  if (state.phase !== 'battle' || side !== state.active) return [];
  if (state.players[side].pendingDraw) return [{type:'draw'}];
  return [
    ...state.players[side].hand.flatMap((_,index) => cardPlays(state,side,index)),
    ...occupied(state,side).flatMap(from => attackPlays(state,side,from)),
    {type:'end'}
  ];
}

function matches(action, legal) {
  return ['type','index','target','from','to','element'].every(key => (action[key] ?? null) === (legal[key] ?? null));
}

export function applyAction(match,side,action,now) {
  const state = hydrateMatch(match);
  if (state.phase !== 'battle' || ![0,1].includes(side) || !action || typeof action !== 'object') return null;
  state.effects = [];
  if (action.type === 'leave') {
    finish(state,opponent(side),'leave');
  } else if (action.type === 'timeout') {
    if (now < state.deadline) return null;
    nextTurn(state,now,true);
  } else {
    if (now >= state.deadline || !legalActions(state,side).some(legal => matches(action,legal))) return null;
    const {index,target,to,element} = action;
    const player = state.players[side];
    if (action.type === 'play') {
      const card = cardById[player.hand[index]];
      player.energy -= effectiveCost(state,side,card);
      player.hand.splice(index,1);
      if (card.type === 'unit') {
        const unit = place(state,side,card.id,{ready:['haste','charge'].includes(card.ability)});
        summonPower(state,side,unit,element,target);
      } else {
        player.tacticPlayed = true;
        tacticPower(state,side,card,target);
      }
    } else if (action.type === 'draw') {
      draw(state,side);
    } else if (action.type === 'attack') {
      attack(state,side,action.from,to);
    } else {
      nextTurn(state,now,false);
    }
  }
  if (state.phase === 'battle') checkBases(state);
  state.revision++;
  return state;
}

export function matchView(match,side) {
  const view = hydrateMatch(match);
  view.deckCount = view.deck.length;
  delete view.deck;
  const rival = view.players[opponent(side)];
  rival.handCount = rival.hand.length;
  rival.hand = [];
  view.you = side;
  return view;
}
