import { advancedAttack, advancedMove, auctionBattlePokemon, auctionDuelTactics, battleSlots, battleSurvivors, battleTeam, finishBattle } from "./pokemonAuctionBattle.js?v=20261122-2";
import { auctionAbility, auctionBattleSpeed, auctionDuelEnter, auctionDuelLeave, auctionDuelPriority, auctionDuelResidual, duelRoll } from "./pokemonAuctionAbilities.js?v=20261122-2";

const commandMs = 20000;
const revealMs = 5000;
const switchMs = 15000;
const hitMs = 1300;
export const activeBattleSlot = (game,uid) => game.battle.activeSlots?.[uid];
export const activeBattleUnit = (game,uid) => battleTeam(game,uid)[activeBattleSlot(game,uid)];
const units = (game,players) => battleSurvivors(game,players).filter(uid => activeBattleUnit(game,uid)?.hp);
const reserves = (game,uid) => battleSlots(game,uid).filter(slot => battleTeam(game,uid)[slot]?.hp && slot !== activeBattleSlot(game,uid));
const pokemon = unit => auctionBattlePokemon(unit.id);
const opposingUnit = (game,uid,players) => activeBattleUnit(game,targetFor(game,uid,players)) ||
  players.filter(player=>player !== uid).map(player=>activeBattleUnit(game,player)).find(Boolean);
const targetFor = (game,uid,players,preferred) => {
  const candidates = units(game,players).filter(rival => rival !== uid);
  return candidates.includes(preferred) ? preferred : candidates[0];
};

function phase(game,name,now,duration) {
  game.phase = name;
  game.phaseEndsAt = now + duration;
}

function event(game,uid,entry) {
  (game.battle.events ||= []).push({uid,slot:activeBattleSlot(game,uid),...entry});
}

function enter(game,uid,players) {
  const rival = opposingUnit(game,uid,players);
  const unit = activeBattleUnit(game,uid);
  if (!unit?.hp || !rival) return;
  const abilityEvents = auctionDuelEnter(unit,rival,game.battle,auctionBattlePokemon);
  if (abilityEvents.length) event(game,uid,{name:"Wejście na pole",abilityEvents});
}

function switchIn(game,uid,slot,players) {
  const battle = game.battle;
  const old = activeBattleUnit(game,uid);
  const rival = opposingUnit(game,uid,players);
  const ability = old && rival ? auctionDuelLeave(old,rival,battle) : "";
  battle.activeSlots[uid] = slot;
  const unit = activeBattleUnit(game,uid);
  event(game,uid,{name:`Wchodzi ${pokemon(unit).name}`,...(ability ? {abilityEvents:[ability]} : {})});
  enter(game,uid,players);
}

export function auctionDuelPP(unit,move) {
  return Math.max(0,advancedMove(unit,move).pp - (unit.usedPP?.[move] || 0));
}

export function auctionDuelMoves(unit) {
  return ["basic","signature",...auctionDuelTactics(unit).filter(Boolean).map(String)];
}

export function auctionDuelMoveAvailable(unit,move) {
  return auctionDuelPP(unit,move) > 0 && !(unit.disabledMove === move && unit.disabledUntil > (unit.actions || 0));
}

function showTurn(game,players,now) {
  const battle = game.battle;
  const survivors = battleSurvivors(game,players);
  if (survivors.length < 2) return finishBattle(game,players,survivors);
  if (battle.turn >= 180) return finishBattle(game,players,[]);
  const need = survivors.filter(uid => !activeBattleUnit(game,uid)?.hp);
  if (need.length) {
    battle.replacements = {};
    return phase(game,"auction-switch",now,switchMs);
  }
  battle.turn++;
  battle.commits = {};
  battle.reveals = {};
  phase(game,"auction-command",now,commandMs);
}

function beginBattle(game,players,now) {
  const battle = game.battle;
  const survivors = battleSurvivors(game,players);
  battle.activeSlots = Object.fromEntries(survivors.map(uid => [uid,battleSlots(game,uid)[0]]));
  const speed = uid => auctionBattleSpeed(activeBattleUnit(game,uid),pokemon(activeBattleUnit(game,uid)),battle);
  [...survivors].sort((a,b) => speed(b)-speed(a)).forEach(uid=>enter(game,uid,players));
  showTurn(game,players,now);
}

function megaEvolve(game,uid,players) {
  const unit = activeBattleUnit(game,uid);
  if (!unit?.megaTarget || !unit.hp || unit.transformBase) return;
  const fromId = unit.id;
  unit.tactics = [...auctionDuelTactics(unit)];
  unit.lockedSignature = advancedMoveSignature(unit);
  unit.id = unit.megaTarget;
  delete unit.megaTarget;
  delete unit.ability;
  delete unit.copiedAbility;
  delete unit.entered;
  event(game,uid,{name:`Megaewolucja · ${pokemon(unit).name}`,fromId,toId:unit.id});
  enter(game,uid,players);
}

function advancedMoveSignature(unit) {
  const {name,type,power,kind} = advancedMove(unit,"signature");
  return [name,type,power,kind];
}

function normalizeOrder(game,uid,request,players) {
  const unit = activeBattleUnit(game,uid);
  if (!unit?.hp || !request) return;
  if (request.kind === "switch" && reserves(game,uid).includes(request.slot)) return {kind:"switch",slot:request.slot};
  if (request.kind !== "move") return;
  const valid = auctionDuelMoves(unit).filter(move=>auctionDuelMoveAvailable(unit,move));
  if (!(valid.length ? valid.includes(request.move) : request.move === "struggle")) return;
  const target = targetFor(game,uid,players,request.target);
  if (!target) return;
  return {kind:"move",move:request.move,target,mega:Boolean(request.mega && unit.megaTarget && !unit.transformBase)};
}

export function auctionDuelAutoOrder(game,uid,players) {
  const unit = activeBattleUnit(game,uid);
  const targetUid = targetFor(game,uid,players);
  const target = activeBattleUnit(game,targetUid);
  if (!unit?.hp || !target?.hp) return {kind:"pass"};
  const choices = auctionDuelMoves(unit).filter(move=>auctionDuelMoveAvailable(unit,move));
  const attackValue = move => {
    const details = advancedMove(unit,move);
    if (details.effect === "heal" && 2 * unit.hp < unit.maxHp) return 35;
    if (!details.power) return -1;
    return advancedAttack(unit,target,move,game.battle,true,targetUid).damage + details.priority;
  };
  const move = choices.sort((a,b)=>attackValue(b)-attackValue(a))[0] || "struggle";
  return {kind:"move",move,target:targetUid,mega:Boolean(unit.megaTarget && !unit.transformBase)};
}

function revealPhase(game,players,now) {
  phase(game,"auction-reveal-moves",now,revealMs);
  if (units(game,players).every(uid=>game.battle.commits?.[uid] === "bot")) resolveRound(game,players,now);
}

function executeMove(game,uid,order,players) {
  const attacker = activeBattleUnit(game,uid);
  const targetUid = targetFor(game,uid,players,order.target);
  const target = activeBattleUnit(game,targetUid);
  if (!attacker?.hp || !target?.hp) return;
  const battle = game.battle;
  const playable = order.move === "struggle" || auctionDuelMoveAvailable(attacker,order.move);
  const move = advancedMove(attacker,order.move);
  if (!playable) {
    event(game,uid,{name:move.name,skipped:true,abilityEvents:["Cursed Body"]});
    return;
  }
  battle.activeUid = uid;
  const hit = advancedAttack(attacker,target,order.move,battle,false,targetUid);
  if (!hit.skipped && order.move !== "struggle") {
    const pressure = ((move.power > 0 || ["status","lower"].includes(move.effect)) && auctionAbility(target) === "pressure") ? 2 : 1;
    (attacker.usedPP ||= {})[order.move] = (attacker.usedPP?.[order.move] || 0) + pressure;
  }
  if (hit.copies && move.name === "Transform" && !target.transformBase && !attacker.transformBase) {
    attacker.transformBase = attacker.id;
    attacker.id = target.id;
    attacker.copiedAbility = auctionAbility(target) || "";
    attacker.stages = {...target.stages};
  } else if (hit.copies && move.name === "Sketch" && move.name !== advancedMove(target,"signature").name) {
    attacker.copiedSignature = advancedMoveSignature(target);
  }
  event(game,uid,{...hit,targetUid,targetSlot:activeBattleSlot(game,targetUid),knockedOut:!target.hp,attackerOut:!attacker.hp});
  if (hit.pivot && attacker.hp && reserves(game,uid).length) return true;
}

function finishRound(game,players,now) {
  const battle = game.battle;
  const active = units(game,players);
  const opponents = Object.fromEntries(active.map(uid => [uid, activeBattleUnit(game,targetFor(game,uid,players))]));
  for (const uid of active) {
    const unit = activeBattleUnit(game,uid);
    const rival = opponents[uid] || players.map(id=>activeBattleUnit(game,id)).find(candidate=>candidate && candidate !== unit);
    if (!rival) continue;
    const abilityEvents = auctionDuelResidual(unit,rival,battle,auctionBattlePokemon);
    if (abilityEvents.length || !unit.hp) event(game,uid,{name:!unit.hp ? "Nokaut" : "Koniec tury",abilityEvents});
  }
  const source = {harshSun:"desolate-land",heavyRain:"primordial-sea",winds:"delta-stream"}[battle.weather?.kind];
  if (source && !units(game,players).some(uid=>auctionAbility(activeBattleUnit(game,uid)) === source)) delete battle.weather;
  delete battle.pending;
  delete battle.pivotUid;
  delete battle.activeUid;
  battle.last = [...(battle.events || [])].reverse().find(entry=>entry.damage) || battle.events?.at(-1) || {name:"Koniec tury"};
  phase(game,"auction-hit",now,hitMs);
}

function executeRemaining(game,players,now) {
  const battle = game.battle;
  while (battle.pending?.length) {
    const {uid,order} = battle.pending.shift();
    if (executeMove(game,uid,order,players)) {
      battle.pivotUid = uid;
      return phase(game,"auction-pivot",now,switchMs);
    }
    (battle.roundActed ||= []).push(uid);
  }
  finishRound(game,players,now);
}

function resolveRound(game,players,now) {
  const battle = game.battle;
  const active = units(game,players);
  const orders = Object.fromEntries(active.map(uid => [uid,
    battle.reveals?.[uid] || (!battle.commits?.[uid] || battle.commits[uid] === "bot" ? auctionDuelAutoOrder(game,uid,players) : {kind:"pass"})]));
  battle.events = [];
  battle.roundActed = [];
  const speed = uid => auctionBattleSpeed(activeBattleUnit(game,uid),pokemon(activeBattleUnit(game,uid)),battle);
  const tie = uid => duelRoll(battle.turn,players.indexOf(uid)+1,0,123);
  const compareSpeed = (a,b) => speed(b)-speed(a) || tie(a)-tie(b);
  for (const uid of [...active].sort(compareSpeed)) {
    if (orders[uid].kind === "switch") {
      switchIn(game,uid,orders[uid].slot,players);
      battle.roundActed.push(uid);
    }
  }
  const attackers = active.filter(uid=>orders[uid].kind === "move");
  [...attackers].sort(compareSpeed).forEach(uid=>{ if (orders[uid].mega) megaEvolve(game,uid,players); });
  const priority = uid => {
    const unit = activeBattleUnit(game,uid);
    return auctionDuelPriority(unit,advancedMove(unit,orders[uid].move));
  };
  battle.pending = attackers.sort((a,b)=>priority(b)-priority(a) || compareSpeed(a,b)).map(uid=>({uid,order:orders[uid]}));
  executeRemaining(game,players,now);
}

function replaceUnits(game,players,now) {
  const staff = battleSurvivors(game,players).filter(uid=>!activeBattleUnit(game,uid)?.hp);
  for (const uid of staff) {
    const options = reserves(game,uid);
    game.battle.activeSlots[uid] = options.includes(game.battle.replacements?.[uid]) ? game.battle.replacements[uid] : options[0];
    event(game,uid,{name:`Wchodzi ${pokemon(activeBattleUnit(game,uid)).name}`});
  }
  staff.sort((a,b)=>auctionBattleSpeed(activeBattleUnit(game,b),pokemon(activeBattleUnit(game,b)),game.battle) -
    auctionBattleSpeed(activeBattleUnit(game,a),pokemon(activeBattleUnit(game,a)),game.battle)).forEach(uid=>enter(game,uid,players));
  showTurn(game,players,now);
}

function finishPivot(game,uid,slot,players,now) {
  delete game.battle.pivotUid;
  if (reserves(game,uid).includes(slot) && activeBattleUnit(game,uid)?.hp) switchIn(game,uid,slot,players);
  (game.battle.roundActed ||= []).push(uid);
  executeRemaining(game,players,now);
}

export function advanceAuctionDuel(game,players,now) {
  if (game.phase === "auction-prep") return beginBattle(game,players,now);
  if (game.phase === "auction-command") return revealPhase(game,players,now);
  if (game.phase === "auction-reveal-moves") return resolveRound(game,players,now);
  if (game.phase === "auction-switch") return replaceUnits(game,players,now);
  if (game.phase === "auction-pivot") return finishPivot(game,game.battle.pivotUid,reserves(game,game.battle.pivotUid)[0],players,now);
  if (game.phase === "auction-hit") return showTurn(game,players,now);
}

export function auctionDuelAction(game,uid,action,players,now) {
  const battle = game.battle;
  if (!battle?.duel || !battleSurvivors(game,players).includes(uid) || now >= game.phaseEndsAt) return "Ta decyzja nie jest już dostępna.";
  if (game.phase === "auction-command" && action.kind === "commit" && /^[a-f0-9]{64}$/.test(action.digest) && !battle.commits?.[uid]) {
    (battle.commits ||= {})[uid] = action.digest;
    if (units(game,players).every(player=>battle.commits[player])) revealPhase(game,players,now);
    return;
  }
  if (game.phase === "auction-reveal-moves" && action.kind === "reveal" && /^[a-f0-9]{64}$/.test(action.digest) && action.digest === battle.commits?.[uid] &&
      action.digest !== "bot" && !battle.reveals?.[uid]) {
    const order = normalizeOrder(game,uid,action.order,players);
    if (!order) return "Ten ruch nie jest dostępny.";
    (battle.reveals ||= {})[uid] = order;
    if (units(game,players).every(player=>battle.reveals[player] || battle.commits?.[player] === "bot")) resolveRound(game,players,now);
    return;
  }
  if (action.kind === "switch" && reserves(game,uid).includes(action.slot)) {
    if (game.phase === "auction-pivot" && battle.pivotUid === uid) return finishPivot(game,uid,action.slot,players,now);
    if (game.phase === "auction-switch" && !activeBattleUnit(game,uid)?.hp && battle.replacements?.[uid] === undefined) {
      (battle.replacements ||= {})[uid] = action.slot;
      if (battleSurvivors(game,players).every(player=>activeBattleUnit(game,player)?.hp || battle.replacements[player] !== undefined)) replaceUnits(game,players,now);
      return;
    }
  }
  return "Ten wybór nie jest teraz dostępny.";
}

export function auctionDuelNeedsBot(game,uid) {
  if (game.phase === "auction-command") return activeBattleUnit(game,uid)?.hp && !game.battle.commits?.[uid];
  if (game.phase === "auction-pivot") return game.battle.pivotUid === uid;
  return game.phase === "auction-switch" && reserves(game,uid).length && !activeBattleUnit(game,uid)?.hp && game.battle.replacements?.[uid] === undefined;
}

export function auctionDuelBot(game,uid,players,now) {
  if (!auctionDuelNeedsBot(game,uid) || now >= game.phaseEndsAt) return;
  if (game.phase !== "auction-command") return auctionDuelAction(game,uid,{kind:"switch",slot:reserves(game,uid)[0]},players,now);
  const commits = (game.battle.commits ||= {});
  commits[uid] = "bot";
  if (units(game,players).every(player=>commits[player])) revealPhase(game,players,now);
}

export function auctionDuelSurrender(game,uid,players,now) {
  if (game.phase === "auction-prep" || game.finished || !battleSurvivors(game,players).includes(uid)) return "Nie możesz się teraz poddać.";
  (game.battle.surrendered ||= []).push(uid);
  for (const unit of battleTeam(game,uid)) unit.hp = 0;
  const survivors = battleSurvivors(game,players);
  if (survivors.length < 2) return finishBattle(game,players,survivors);
  if (game.phase === "auction-pivot" && game.battle.pivotUid === uid) return finishPivot(game,uid,-1,players,now);
  if (game.phase === "auction-switch" && survivors.every(player=>activeBattleUnit(game,player)?.hp || game.battle.replacements?.[player] !== undefined)) replaceUnits(game,players,now);
  if (game.phase === "auction-command" && units(game,players).every(player=>game.battle.commits?.[player])) revealPhase(game,players,now);
  if (game.phase === "auction-reveal-moves" && units(game,players).every(player=>game.battle.reveals?.[player] || game.battle.commits?.[player] === "bot")) resolveRound(game,players,now);
}
