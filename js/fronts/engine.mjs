import {cards, cardById} from './cards.mjs';

export const lanes = [0,1,2];
export const turnMs = 45000;
const adjacent = lane => lanes.filter(other => Math.abs(other-lane) === 1);
const opponent = side => 1-side;
const unitsOf = (state, side) => state.players[side].board;
const unitAt = (state, side, lane) => unitsOf(state,side)[lane];
const definition = unit => cardById[unit?.card];
const expires = state => state.turn+2;
const isActive = (state, property) => (property || 0) > state.turn;
const otherAlive = (state, side) => lanes.filter(lane => unitAt(state,side,lane));
const hasAura = (state, side, ability) => Object.values(unitsOf(state,side)).some(unit => definition(unit)?.ability === ability);

function emit(state, type, side, lane, options = {}) {
  state.effects.push({type, side, lane, ...options});
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

function heal(state,side,lane,amount) {
  const unit = unitAt(state,side,lane);
  if (!unit) return;
  const gain = Math.min(amount, definition(unit).hp-unit.hp);
  if (!gain) return;
  unit.hp += gain;
  emit(state,'heal',side,lane,{amount:gain});
}

function draw(state, side) {
  const player = state.players[side];
  const next = state.deck.shift();
  if (!next) {
    player.fatigue = (player.fatigue || 0)+1;
    hitBase(state,side,player.fatigue);
    return;
  }
  if (player.hand.length < 8) player.hand.push(next);
  emit(state,'draw',side,-1);
}

function place(state,side,lane,card,{ready=false,reborn=false,hp=cardById[card].hp} = {}) {
  const unit = {key:++state.unitSerial,card,hp,readyAt:state.turn+(ready?0:2)};
  if (reborn) unit.reborn = true;
  unitsOf(state,side)[lane] = unit;
  emit(state,'summon',side,lane,{card});
  return unit;
}

function remove(state, side, lane) {
  const unit = unitAt(state,side,lane);
  delete unitsOf(state,side)[lane];
  emit(state,'fall',side,lane,{card:unit.card});
  switch (definition(unit).ability) {
    case 'bomb': hit(state,opponent(side),lane,2); break;
    case 'spore': healBase(state,side,1); break;
    case 'rebirth': if (!unit.reborn) place(state,side,lane,'egg'); break;
    case 'split': {
      const next = adjacent(lane).find(other => !unitAt(state,side,other));
      place(state,side,lane,'mini');
      if (next !== undefined) place(state,side,next,'mini');
      break;
    }
  }
}

function hit(state, side, lane, damage, {attack=false, range=false} = {}) {
  let unit = unitAt(state,side,lane);
  if (!unit || damage <= 0) return {dead:false, excess:0};
  if (attack && range && definition(unit).ability === 'shell') damage--;
  if (attack && unit.mark) {
    damage++;
    delete unit.mark;
  }
  if (damage <= 0) return {dead:false,excess:0};
  const guardLane = attack ? adjacent(lane).find(other => {
    const guard = unitAt(state,side,other);
    return definition(guard)?.ability === 'guard' && guard.guardedRound !== Math.floor((state.turn-1)/2);
  }) : undefined;
  if (guardLane !== undefined) {
    lane = guardLane;
    unit = unitAt(state,side,lane);
    unit.guardedRound = Math.floor((state.turn-1)/2);
    emit(state,'shield',side,lane,{amount:damage});
  }
  const bonus = Math.min(damage,unit.temporaryShield || 0);
  if (bonus) unit.temporaryShield -= bonus;
  const shield = Math.min(damage-bonus,unit.shield || 0);
  if (shield) unit.shield -= shield;
  damage -= bonus+shield;
  if (bonus+shield) emit(state,'shield',side,lane,{amount:bonus+shield});
  if (damage) emit(state,'hit',side,lane,{amount:damage});
  const excess = Math.max(0,damage-unit.hp);
  unit.hp -= damage;
  const dead = unit.hp <= 0;
  if (dead) remove(state,side,lane);
  return {dead,excess,lane};
}

function canMove(state,side,from,to,foreign,swap=false) {
  const unit = unitAt(state,side,from);
  return unit && from !== to && lanes.includes(to) && (swap || !unitAt(state,side,to))
    && !(foreign && definition(unit).ability === 'rooted')
    && !isActive(state,unit.webUntil) && !isActive(state,state.barriers[from]) && !isActive(state,state.barriers[to]);
}

function afterMove(state,side,from,to) {
  const unit = unitAt(state,side,to);
  emit(state,'move',side,to,{from,card:unit.card});
  if (definition(unit).ability === 'river') heal(state,side,to,2);
  if (definition(unit).ability === 'wind') unit.shield = (unit.shield || 0)+1;
}

function move(state,side,from,to) {
  unitsOf(state,side)[to] = unitAt(state,side,from);
  delete unitsOf(state,side)[from];
  afterMove(state,side,from,to);
}

function freeze(state,side,lane) {
  const target = unitAt(state,side,lane);
  if (target) target.freezeUntil = state.turn+2;
}

function summonPower(state,side,lane,unit,element,to) {
  const enemy = opponent(side);
  switch (definition(unit).ability) {
    case 'ward': case 'bubble': unit.shield = 2; break;
    case 'rally': for (const next of adjacent(lane)) {
      const ally = unitAt(state,side,next);
      if (ally) ally.shield = (ally.shield || 0)+1;
    } break;
    case 'medic': for (const next of adjacent(lane)) heal(state,side,next,2); break;
    case 'oak': if (adjacent(lane).some(next => unitAt(state,side,next))) unit.shield = 1; break;
    case 'scout': draw(state,side); break;
    case 'lantern': healBase(state,side,2); break;
    case 'moon': for (const ally of Object.values(unitsOf(state,side))) {
      delete ally.poison; delete ally.freezeUntil;
    } break;
    case 'element':
      if (!element) break;
      emit(state,'spell',enemy,lane,{card:'elemental',element});
      if (element === 'fire') hit(state,enemy,lane,2);
      if (element === 'ice') freeze(state,enemy,lane);
      if (element === 'wind') move(state,enemy,lane,to);
      break;
  }
}

function tacticPower(state,side,card,lane,to) {
  const player = state.players[side];
  const enemy = opponent(side);
  const targetSide = ['ally','moveAlly','swap','empty'].includes(card.target) || card.id === 'thorns' ? side : enemy;
  if (card.id === 'trap') {
    player.traps[lane] = 'trap';
    emit(state,'trap-set',side,lane);
    return;
  }
  emit(state,'spell',targetSide,lane,{card:card.id});
  switch (card.id) {
    case 'hail': for (const next of lanes) hit(state,enemy,next,1); break;
    case 'quake': hit(state,enemy,lane,2); hit(state,side,lane,2); break;
    case 'rain': heal(state,side,lane,3); break;
    case 'fog': state.fog[lane] = expires(state); break;
    case 'gust': move(state,enemy,lane,to); break;
    case 'cleanse': for (const ally of [...Object.values(unitsOf(state,side)), ...Object.values(unitsOf(state,enemy))]) delete ally.poison; break;
    case 'order': move(state,side,lane,to); break;
    case 'portal': {
      const board = unitsOf(state,side);
      [board[lane],board[to]] = [board[to],board[lane]];
      afterMove(state,side,lane,to);
      afterMove(state,side,to,lane);
      break;
    }
    case 'camp': healBase(state,side,3); break;
    case 'thorns': player.thorns[lane] = expires(state); break;
    case 'meteor': hit(state,enemy,lane,4); break;
    case 'barrier': {
      const ally = unitAt(state,side,lane);
      ally.temporaryShield = 3;
      ally.shieldUntil = expires(state);
      break;
    }
    case 'boulder': state.barriers[lane] = expires(state); break;
    case 'bolt': hit(state,enemy,lane,2); break;
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
  if (isActive(state,rival.thorns[to])) {
    delete rival.thorns[to];
    hit(state,side,from,2);
    if (unitAt(state,side,from) !== unit) return;
  }
  if (!defend && rival.traps[to]) {
    delete rival.traps[to];
    emit(state,'spell',side,from,{card:'trap'});
    hit(state,side,from,3);
    return;
  }

  let damage = card.attack;
  if (card.ability === 'pack' && adjacent(from).some(lane => unitAt(state,side,lane))) damage++;
  if (card.ability === 'fireball' && from !== to) damage--;
  if (card.ability === 'crusher' && (defend?.shield || defend?.temporaryShield)) damage += 2;

  if (defend) {
    const result = hit(state,enemy,to,damage,{attack:true,range:from!==to});
    const target = unitAt(state,enemy,result.lane ?? to);
    const originalSurvived = target && !result.dead;
    if (originalSurvived && card.ability === 'mark') target.mark = true;
    if (originalSurvived && card.ability === 'poison') target.poison = true;
    if (originalSurvived && card.ability === 'freeze' && !unit.used) {
      freeze(state,enemy,result.lane ?? to);
      unit.used = true;
    }
    if (originalSurvived && card.ability === 'web' && !unit.used) {
      target.webUntil = state.turn+2;
      unit.used = true;
    }
    if (result.dead && card.ability === 'cleave') for (const lane of adjacent(result.lane)) hit(state,enemy,lane,1);
    if (result.dead && card.ability === 'trample') hitBase(state,enemy,result.excess);
  } else {
    hitBase(state,enemy,damage);
  }
  if (card.ability === 'scorch') for (const lane of lanes.filter(lane => lane !== to)) hit(state,enemy,lane,1);
  if (card.ability === 'vanish' && !unit.used && unitAt(state,side,from) === unit) {
    unit.used = true;
    const next = adjacent(from).find(lane => canMove(state,side,from,lane,false));
    if (next !== undefined) move(state,side,from,next);
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
  player.timeouts = timeout ? (player.timeouts || 0)+1 : 0;
  if (player.timeouts >= 2) {
    finish(state,opponent(state.active),'timeout');
    return;
  }
  for (const lane of otherAlive(state,state.active)) {
    const unit = unitAt(state,state.active,lane);
    if (!unit?.poison) continue;
    delete unit.poison;
    hit(state,state.active,lane,1);
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
  for (const lane of otherAlive(state,state.active)) {
    const unit = unitAt(state,state.active,lane);
    if (unit.shieldUntil && !isActive(state,unit.shieldUntil)) {
      delete unit.shieldUntil;
      delete unit.temporaryShield;
    }
    if (unit.card === 'egg') place(state,state.active,lane,'phoenix',{ready:true,reborn:true,hp:2});
    if (definition(unit).ability === 'renew') heal(state,state.active,lane,1);
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
    return {name,hp:20,energy:2,maxEnergy:2,hand:deck.splice(cheap,1),board:{},traps:{},thorns:{}};
  });
  for (let i=0;i<3;i++) for (const player of players) player.hand.push(deck.shift());
  return {players,deck,turn:1,active:0,phase:'battle',deadline:now+turnMs,fog:{},barriers:{},unitSerial:0,revision:0,effects:[]};
}

// Realtime Database omits empty containers. Restore them before applying moves.
export function hydrateMatch(match) {
  const state = structuredClone(match);
  state.effects ||= [];
  state.deck ||= [];
  state.fog ||= {};
  state.barriers ||= {};
  for (const player of state.players) {
    player.hand ||= [];
    player.board = Object.fromEntries(Object.entries(player.board || {}).filter(([,unit]) => unit));
    player.traps ||= {};
    player.thorns ||= {};
  }
  return state;
}

export function effectiveCost(state,side,card) {
  return Math.max(0, card.cost-(card.type === 'tactic' && !state.players[side].tacticPlayed && hasAura(state,side,'archive') ? 1 : 0));
}

export function cardPlays(state,side,index) {
  const player = state.players[side];
  const card = cardById[player.hand[index]];
  if (!card || effectiveCost(state,side,card) > player.energy) return [];
  const enemy = opponent(side);
  const play = (lane,extra={}) => ({type:'play',index,lane,...extra});
  if (card.type === 'unit') return lanes.filter(lane => !unitAt(state,side,lane)).flatMap(lane => {
    if (card.ability !== 'element' || !unitAt(state,enemy,lane)) return [play(lane)];
    return [play(lane,{element:'fire'}),play(lane,{element:'ice'}),
      ...adjacent(lane).filter(to => canMove(state,enemy,lane,to,true)).map(to => play(lane,{element:'wind',to}))];
  });
  switch (card.target) {
    case 'instant': return [play(-1)];
    case 'lane': return lanes.map(lane => play(lane));
    case 'empty': return lanes.filter(lane => !unitAt(state,side,lane) && !player.traps[lane]).map(lane => play(lane));
    case 'ally': return otherAlive(state,side).map(lane => play(lane));
    case 'enemy': return otherAlive(state,enemy).map(lane => play(lane));
    case 'swap': return otherAlive(state,side).flatMap(from => otherAlive(state,side)
      .filter(to => canMove(state,side,from,to,false,true) && canMove(state,side,to,from,false,true)).map(to => play(from,{to})));
    default: {
      const moving = card.target === 'moveEnemy' ? enemy : side;
      return otherAlive(state,moving).flatMap(from => adjacent(from)
        .filter(to => canMove(state,moving,from,to,moving === enemy)).map(to => play(from,{to})));
    }
  }
}

export function attackPlays(state,side,from) {
  const unit = unitAt(state,side,from);
  if (!unit || unit.readyAt > state.turn || unit.attacked === state.turn || isActive(state,unit.freezeUntil)) return [];
  const card = definition(unit);
  if (!card.attack) return [];
  const enemy = opponent(side);
  const choices = [from];
  if (['range','fireball'].includes(card.ability)) for (const lane of adjacent(from)) {
    if (unitAt(state,enemy,lane) && !isActive(state,state.fog[from]) && !isActive(state,state.fog[lane])) choices.push(lane);
  }
  return choices
    .filter(to => card.ability !== 'charge' || unit.readyAt !== state.turn || unitAt(state,enemy,to))
    .map(to => ({type:'attack',from,to}));
}

export function legalActions(state,side) {
  if (state.phase !== 'battle' || side !== state.active) return [];
  return [
    ...state.players[side].hand.flatMap((_,index) => cardPlays(state,side,index)),
    ...lanes.flatMap(from => attackPlays(state,side,from)),
    {type:'end'}
  ];
}

function matches(action, legal) {
  return ['type','index','lane','from','to','element'].every(key => (action[key] ?? null) === (legal[key] ?? null));
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
    const {index,lane,to,element} = action;
    const player = state.players[side];
    if (action.type === 'play') {
      const card = cardById[player.hand[index]];
      player.energy -= effectiveCost(state,side,card);
      player.hand.splice(index,1);
      if (card.type === 'unit') {
        const unit = place(state,side,lane,card.id,{ready:['haste','charge'].includes(card.ability)});
        summonPower(state,side,lane,unit,element,to);
      } else {
        player.tacticPlayed = true;
        tacticPower(state,side,card,lane,to);
      }
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
  rival.traps = Object.fromEntries(Object.keys(rival.traps).map(lane => [lane,true]));
  view.you = side;
  return view;
}
