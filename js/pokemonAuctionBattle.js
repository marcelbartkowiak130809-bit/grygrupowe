import { pokemonDex } from "./pokemonData.js?v=20260804-2";
import { battleAlternateForms, battleSpeciesData, battleMoveData, battleTypeFactors } from "./pokemonAuctionBattleData.js?v=20261123-1";
import { battleMoveProperties } from "./pokemonAuctionAbilityData.js?v=20261123-1";
import { auctionAbility, auctionAbilityChoices, auctionAbilitySupported, auctionBattleSpeed, bladeAegislash, completeZygarde, noiceEiscue, resolveAuctionAbilityAttack } from "./pokemonAuctionAbilities.js?v=20261123-1";
import { auctionHeldItems, learnableTactics, tacticalMoves } from "./pokemonAuctionTactics.js?v=20261123-1";
import { advanceAuctionDuel, auctionDuelBot, auctionDuelSurrender } from "./pokemonAuctionDuel.js?v=20261123-3";

export const auctionBattleDefaults = { freeEvolutions:1, megaEnabled:true, megaPrice:5, showDamagePreview:false, advancedAbilities:false };
export const auctionBattleLimits = { freeEvolutions:10, megaPrice:500 };
export function sanitizeAuctionBattleRules(settings = {}) {
  const integer = key => {
    const value = settings[key];
    return (typeof value === "number" || typeof value === "string" && value.trim()) && Number.isFinite(Number(value))
      ? Math.min(auctionBattleLimits[key], Math.max(0, Math.trunc(Number(value)))) : auctionBattleDefaults[key];
  };
  return {freeEvolutions:integer("freeEvolutions"), megaEnabled:settings.megaEnabled !== false, megaPrice:integer("megaPrice"),
    showDamagePreview:settings.showDamagePreview === true, advancedAbilities:settings.advancedAbilities === true};
}

export const battleEvolutionsUsed = prep => prep.evolutionsUsed ?? (prep.evolved ? 1 : 0);
export const battleUpgradeUsed = prep => Boolean(prep.transformed || prep.mega);
export const auctionBattlePhases = ["auction-prep", "auction-battle", "auction-hit", "auction-command", "auction-reveal-moves", "auction-switch", "auction-pivot"];
const prepMs = 60000;
const advancedPrepMs = 120000;
const turnMs = 20000;
const hitMs = 770;
const dex = new Map(pokemonDex.map(item => [item.id, item]));
const megaZygarde = 10301;
const fallbackSignatures = {
  132:["Transform",null,0,"physical"],
  202:["Counter","fighting",85,"physical"],
  235:["Sketch",null,0,"physical"],
  360:["Mirror Coat","psychic",80,"special"],
  771:["Purify","water",68,"special"],
  789:["Moc kosmiczna","psychic",65,"special"],
  790:["Moc kosmiczna","psychic",75,"special"],
};

const catalog = new Map(Object.entries(battleSpeciesData).map(([key, entry]) => {
  const id = Number(key);
  const [[hp, attack, defense, specialAttack, specialDefense, speed], signature, evolutions, megas, formName, formTypes, baseId] = entry;
  const base = dex.get(baseId || id);
  const form = battleAlternateForms[baseId]?.includes(id);
  const spritePath = id===megaZygarde ? `other/official-artwork/${id}.png` : `${id}.png`;
  return [id, {
    ...base, id, baseId:baseId || id, name:formName || base.name, types:formTypes || base.types, bst:hp+attack+defense+specialAttack+specialDefense+speed,
    sprite:formName ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${spritePath}` : base.sprite,
    spriteFallback:formName ? base.sprite : base.spriteFallback,
    formKind:form ? "form" : formName ? "mega" : "",
    stats:{hp, attack, defense, specialAttack, specialDefense, speed},
    signature:fallbackSignatures[id] || battleMoveData[signature], evolutions, megas, forms:battleAlternateForms[id] || [],
  }];
}));
const zygarde = catalog.get(718);
catalog.set(completeZygarde,{
  ...zygarde,id:completeZygarde,name:"Zygarde Complete",bst:708,sprite:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10120.png",
  stats:{...zygarde.stats,hp:216,specialAttack:91,specialDefense:95,speed:85},megas:[],
});
for (const [baseId,id,name,stats] of [
  [681,bladeAegislash,"Aegislash Blade",{attack:140,defense:50,specialAttack:140,specialDefense:50}],
  [875,noiceEiscue,"Eiscue Noice",{defense:70,specialDefense:50,speed:130}],
]) {
  const base = catalog.get(baseId);
  catalog.set(id,{...base,id,name,stats:{...base.stats,...stats},sprite:`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`});
}

export const auctionBattlePokemon = id => catalog.get(id);
export const battleTeam = (game, uid) => game.battle?.teams?.[uid] || [];
export const battleSignature = unit => unit.copiedSignature || unit.lockedSignature || catalog.get(unit.id).signature;
export const battleSlots = (game, uid) => game.battle?.prep?.[uid]?.order || battleTeam(game, uid).map((_, slot) => slot);
export const battleHasUnits = (game, uid) => battleTeam(game, uid).some(unit => unit.hp > 0);
export const battleSurrendered = (game, uid) => game.battle?.surrendered?.includes(uid);
export const usesAuctionAbilities = game => game.battleRules?.advancedAbilities === true;
export const battleSurvivors = (game, players) => players.filter(uid => battleHasUnits(game, uid));
const living = battleSurvivors;
const createUnit = (id,advanced,duel = advanced) => {
  const maxHp = id === 292 && advanced ? 1 : (duel ? 75 : 44) + catalog.get(id).stats.hp;
  const unit = {id,hp:maxHp,maxHp,signatureSpent:false};
  if (duel) unit.tactics = auctionDuelTactics(unit);
  return unit;
};

export function prepareAuctionBattle(game, players, now) {
  const teams = Object.fromEntries(players.map(uid => [uid, (game.teams?.[uid] || []).filter(id => catalog.has(id)).map(id => createUnit(id,usesAuctionAbilities(game)))]));
  if (players.filter(uid => teams[uid].length).length < 2) return false;
  game.battle = {teams, prep:{}, turn:0, ...(usesAuctionAbilities(game) ? {duel:true} : {})};
  game.phase = "auction-prep";
  game.phaseEndsAt = now + (game.battle.duel ? advancedPrepMs : prepMs);
  return true;
}

export function finishBattle(game, players, survivors) {
  const winner = survivors[0];
  game.winners = winner ? [winner] : [];
  game.scores = Object.fromEntries(players.map(uid => [uid, uid === winner ? 3 : 0]));
  game.ranking = players.map(uid => {
    const roster = battleTeam(game, uid);
    const team = battleSlots(game, uid).map(slot => roster[slot]);
    return {uid, team:team.map(unit => unit.id), bst:team.reduce((sum, unit) => sum + catalog.get(unit.id).bst, 0), remaining:team.filter(unit => unit.hp > 0).length};
  }).sort((a, b) => b.remaining - a.remaining);
  game.phase = "result";
  game.phaseEndsAt = 0;
  game.finished = true;
}

function nextBattleTurn(game, players, now) {
  const battle = game.battle;
  if (battle.duel) return advanceAuctionDuel(game,players,now);
  if (usesAuctionAbilities(game)) {
    for (const uid of players) {
      for (const unit of battleTeam(game,uid)) {
        if (unit.perishTurn && unit.perishTurn <= battle.turn + 1) {
          unit.hp = 0;
          delete unit.perishTurn;
        }
      }
    }
  }
  const survivors = living(game, players);
  if (survivors.length < 2) return finishBattle(game, players, survivors);
  if (usesAuctionAbilities(game) && (battle.noDamage >= 24 || battle.turn >= 180)) return finishBattle(game, players, []);
  if (!battle.order) {
    const leadSpeed = uid => {
      const unit = battleTeam(game,uid)[battleSlots(game,uid)[0]];
      const species = catalog.get(unit.id);
      return usesAuctionAbilities(game) ? auctionBattleSpeed(unit,species,battle) : species.stats.speed;
    };
    battle.order = survivors.sort((a, b) => leadSpeed(b) - leadSpeed(a));
  }
  if (usesAuctionAbilities(game)) {
    const remaining = survivors.filter(uid => !battle.roundActed?.includes(uid));
    if (!remaining.length) battle.roundActed = [];
    const speed = uid => {
      const team = battleTeam(game,uid);
      const previous = team[battle.latestSlots?.[uid]];
      const unit = previous?.hp ? previous : battleSlots(game,uid).map(slot => team[slot]).find(item => item.hp);
      return auctionBattleSpeed(unit,catalog.get(unit.id),battle);
    };
    battle.activeUid = (remaining.length ? remaining : survivors).sort((a,b) => speed(b) - speed(a) ||
      battle.order.indexOf(a) - battle.order.indexOf(b))[0];
  } else {
    const previous = battle.order.indexOf(battle.activeUid);
    for (let step = 1; step <= battle.order.length; step++) {
      const uid = battle.order[(previous + step) % battle.order.length];
      if (survivors.includes(uid)) {
        battle.activeUid = uid;
        break;
      }
    }
  }
  battle.turn++;
  game.phase = "auction-battle";
  game.phaseEndsAt = now + turnMs;
}

export function auctionBattlePrep(game, uid, action, players, now) {
  if (game.phase !== "auction-prep" || now >= game.phaseEndsAt || !players.includes(uid) || !battleTeam(game, uid).length) return "Przygotowania już się skończyły.";
  const prep = (game.battle.prep ||= {});
  const player = (prep[uid] ||= {});
  if (player.ready) return "Twój skład jest już gotowy.";
  if (action.kind === "ready") {
    player.ready = true;
    if (living(game, players).every(id => prep[id]?.ready)) nextBattleTurn(game, players, now);
    return;
  }
  if (action.kind === "reorder") {
    const order = [...battleSlots(game, uid)];
    const index = order.indexOf(action.slot), next = index + action.direction;
    if (index < 0 || ![-1,1].includes(action.direction) || next < 0 || next >= order.length) return "Nie można przesunąć Pokémona dalej.";
    [order[index], order[next]] = [order[next], order[index]];
    player.order = order;
    return;
  }
  const unit = battleTeam(game, uid)[action.slot];
  const species = catalog.get(unit?.id);
  const {kind} = action;
  if (kind === "ability") {
    if (!usesAuctionAbilities(game) || !auctionAbilityChoices(unit?.id).includes(action.ability)) return "Ten Pokémon nie ma takiej zdolności.";
    unit.ability = action.ability;
    return;
  }
  if (game.battle.duel && kind === "item") {
    if (!unit || megaUsesHeldSlot(unit) || action.item && !Object.hasOwn(auctionHeldItems,action.item)) return "Ten przedmiot jest niedostępny.";
    if (action.item && battleTeam(game,uid).some(teammate=>teammate !== unit && teammate.item === action.item)) return "Inny Pokémon w Twojej drużynie trzyma już ten przedmiot.";
    if (action.item) unit.item = action.item;
    else delete unit.item;
    return;
  }
  if (game.battle.duel && kind === "tactic") {
    if (!unit || ![0,1].includes(action.index) || action.move !== 0 &&
        (!learnableTactics(species).includes(action.move) || tacticalMoves[action.move].name === battleSignature(unit)[0])) return "Ten Pokémon nie uczy się tego ruchu.";
    const moves = [...auctionDuelTactics(unit)];
    if (action.move && moves[1-action.index] === action.move) return "Wybierz inny ruch w tym polu.";
    moves[action.index] = action.move;
    unit.tactics = moves;
    return;
  }
  if (!["evolve","mega","form"].includes(kind)) return "Nieznana akcja.";
  const paid = kind !== "evolve";
  const options = {evolve:species?.evolutions, mega:species?.megas, form:species?.forms}[kind];
  if (!options?.includes(action.target)) return "Ten Pokémon nie ma takiego ulepszenia.";
  const {freeEvolutions, megaEnabled, megaPrice} = game.battleRules || auctionBattleDefaults;
  const used = battleEvolutionsUsed(player);
  if (paid && !megaEnabled) return "Host wyłączył Megaewolucje i zmiany formy.";
  if (paid && battleUpgradeUsed(player)) return "Płatne ulepszenie zostało już wykorzystane.";
  if (!paid && used >= freeEvolutions) return "Brak dostępnych darmowych ewolucji.";
  if (game.battle.duel && !paid && unit.megaTarget) return "Najpierw dokończ wybór formy tej ewolucji.";
  if (paid && Number(game.budgets?.[uid] || 0) < megaPrice) return `Ulepszenie kosztuje ${megaPrice}$ z budżetu aukcji.`;
  if (paid && megaPrice > 0) game.budgets[uid] -= megaPrice;
  if (game.battle.duel && kind === "mega") {
    unit.megaTarget = action.target;
    if (megaUsesHeldSlot(unit)) delete unit.item;
    player.transformed = true;
    return;
  }
  const evolved = createUnit(action.target,usesAuctionAbilities(game),Boolean(game.battle.duel));
  if (unit.item) evolved.item = unit.item;
  battleTeam(game, uid)[action.slot] = evolved;
  player.evolution = {slot:action.slot, fromId:unit.id, toId:action.target, kind, sequence:(player.evolution?.sequence || 0)+1};
  if (paid) player.transformed = true;
  else player.evolutionsUsed = used + 1;
}

export const megaUsesHeldSlot = unit => Boolean(unit.megaTarget && unit.id !== 384);

function moveTypeFactor(type, targetSpecies) {
  return targetSpecies.types.reduce((value, defense) => value * (battleTypeFactors[type]?.[defense] ?? 1), 1);
}

export function battleSignatureEffectiveness(attacker, target, game, targetUid) {
  const [,type, power] = battleSignature(attacker);
  if (power && game && usesAuctionAbilities(game)) return auctionBattleDamage(attacker,target,"signature",game,targetUid).factor;
  return power ? moveTypeFactor(type, catalog.get(target.id)) : 0;
}

const moveProperties = new Map(Object.entries(battleMoveData).map(([id, [name]]) => [name,battleMoveProperties[id]]));

export function auctionDuelTactics(unit) {
  if (unit.tactics) return unit.tactics;
  const learned = learnableTactics(catalog.get(unit.transformBase || unit.id));
  const signature = battleSignature(unit)[0];
  const options = learned.filter(id => tacticalMoves[id].name !== signature);
  return [options[0] || 0,options[1] || 0];
}

export function advancedMove(unit, kind) {
  if (kind === "struggle") return {name:"Struggle",type:"",power:50,basePower:50,kind:"physical",key:"struggle",
    accuracy:100,flags:["contact"],minHits:1,maxHits:1,priority:0,crit:0,slot:kind,pp:1};
  if (tacticalMoves[kind]) return tacticalMoves[kind];
  const [name,type,power,category] = kind === "signature"
    ? (unit.id === megaZygarde && !unit.copiedSignature ? battleMoveData[920] : battleSignature(unit)) : battleMoveData[0];
  const [key,accuracy,flags,ailment,ailmentChance,drain,minHits,maxHits,secondary,priority,crit,pp] =
    moveProperties.get(name) || [name.toLowerCase(),100,["contact"],"",0,0,1,1,0,0,0,kind === "basic" ? 35 : 10];
  return {name,type:type || "normal",power,basePower:power,kind:category,key,accuracy,flags,ailment,ailmentChance,drain,minHits,maxHits,secondary,priority,crit,slot:kind,pp};
}

export function advancedAttack(attacker,target,move,battle,preview,targetUid) {
  const clone = unit => ({...unit,stages:{...unit.stages}});
  return resolveAuctionAbilityAttack({
    attacker:preview ? clone(attacker) : attacker,target:preview ? clone(target) : target,
    battle:preview ? {...battle} : battle,getMove:unit => advancedMove(unit,move),catalog:auctionBattlePokemon,
    factors:battleTypeFactors,preview,targetUid,
  });
}

export function auctionBattleDamage(attacker, target, move, game, targetUid) {
  if (game && usesAuctionAbilities(game)) return advancedAttack(attacker,target,move,game.battle,true,targetUid);
  const from = catalog.get(attacker.id), to = catalog.get(target.id);
  const [, type, power, kind] = move === "signature" ? battleSignature(attacker) : battleMoveData[0];
  if (!power) return {damage:0, factor:1, copies:true};
  const factor = moveTypeFactor(type, to);
  if (!factor) return {damage:0, factor};
  const [offense, defense] = kind === "special"
    ? [from.stats.specialAttack, to.stats.specialDefense] : [from.stats.attack, to.stats.defense];
  const affinity = type && from.types.includes(type) ? 1.2 : 1;
  const damage = Math.max(1, Math.round((13 + Math.min(110, power) * (offense + 24) / (defense + 54) * .45) * affinity * factor));
  return {damage:Math.min(target.hp, damage), factor};
}

export function auctionBattleAttack(game, uid, action, players, now, automated = false) {
  const battle = game.battle;
  if (game.phase !== "auction-battle" || battle?.activeUid !== uid || !players.includes(uid) || (!automated && now >= game.phaseEndsAt)) return "To nie jest twoja tura.";
  const attacker = battleTeam(game, uid)[action.slot];
  const target = battleTeam(game, action.targetUid)[action.targetSlot];
  if (!attacker?.hp || !target?.hp || uid === action.targetUid || !players.includes(action.targetUid)) return "Wybierz aktywnego Pokémona i cel z drużyny rywala.";
  const move = action.move;
  if (!["basic","signature"].includes(move) || (move === "signature" && attacker.signatureSpent)) return "Użyj zwykłego ataku, żeby odnowić atak specjalny.";
  const advanced = usesAuctionAbilities(game);
  const oldHp = target.hp, oldAttackerHp = attacker.hp;
  const hit = advanced ? advancedAttack(attacker,target,move,battle,false,action.targetUid) : auctionBattleDamage(attacker,target,move);
  const cryId = attacker.id;
  const [moveName,moveType,,moveCategory] = move === "signature" ? battleSignature(attacker) : battleMoveData[0];
  const name = hit.name || moveName;
  if (!hit.skipped || hit.disabled && move === "basic") attacker.signatureSpent = move === "signature";
  if (hit.copies && name === "Transform") {
    attacker.id = target.id;
    delete attacker.copiedSignature;
    if (advanced) {
      delete attacker.ability;
      delete attacker.copiedAbility;
    }
  } else if (hit.copies) {
    const signature = battleSignature(target);
    attacker.copiedSignature = signature[2] ? signature : ["Uderzenie", "normal", 60, "physical"];
  }
  if (!advanced) target.hp -= hit.damage;
  if (advanced) {
    battle.roundActed = [...(battle.roundActed || []),uid];
    (battle.latestSlots ||= {})[uid] = action.slot;
    battle.noDamage = target.hp >= oldHp && attacker.hp >= oldAttackerHp ? (battle.noDamage || 0) + 1 : 0;
    hit.attackerOut = attacker.hp === 0;
  }
  battle.last = {turn:battle.turn,uid,cryId,slot:action.slot,targetUid:action.targetUid,targetSlot:action.targetSlot,
    name,moveType:moveType || "normal",moveCategory,...hit,knockedOut:target.hp === 0};
  game.phase = "auction-hit";
  game.phaseEndsAt = now + hitMs;
}

export function auctionBattleSurrender(game, uid, players, now) {
  if (game.battle?.duel) return auctionDuelSurrender(game,uid,players,now);
  if (!["auction-battle","auction-hit"].includes(game.phase) || !players.includes(uid) || !battleHasUnits(game, uid)) {
    return "Nie możesz się teraz poddać.";
  }
  game.battle.surrendered = [...(game.battle.surrendered || []), uid];
  for (const unit of battleTeam(game, uid)) unit.hp = 0;
  const survivors = living(game, players);
  if (survivors.length < 2) finishBattle(game, players, survivors);
  else if (game.phase === "auction-battle" && game.battle.activeUid === uid) nextBattleTurn(game, players, now);
}

export function auctionBattleBotAction(game, uid, players, now, automated = false) {
  if (game.phase === "auction-prep") {
    const team = battleTeam(game, uid);
    const {freeEvolutions, megaEnabled} = game.battleRules || auctionBattleDefaults;
    for (let used = battleEvolutionsUsed(game.battle.prep?.[uid] || {}); used < freeEvolutions; used++) {
      const slot = team.findIndex(unit => catalog.get(unit.id).evolutions.length);
      if (slot < 0 || auctionBattlePrep(game, uid, {kind:"evolve", slot, target:catalog.get(team[slot].id).evolutions[0]}, players, now)) break;
    }
    const upgrades = megaEnabled ? team.flatMap((unit, slot) => {
      const pokemon = catalog.get(unit.id);
      return [...pokemon.megas, ...pokemon.forms].map(target => ({
        kind:catalog.get(target).formKind, slot, target, gain:catalog.get(target).bst - pokemon.bst,
      }));
    }).sort((a,b) => b.gain - a.gain) : [];
    if (upgrades.length) auctionBattlePrep(game, uid, upgrades[0], players, now);
    if (usesAuctionAbilities(game)) {
      team.forEach((unit,slot) => {
        if (!auctionAbilitySupported(auctionAbility(unit))) {
          const ability = auctionAbilityChoices(unit.id).find(auctionAbilitySupported);
          if (ability) auctionBattlePrep(game,uid,{kind:"ability",slot,ability},players,now);
        }
        if (game.battle.duel && !unit.item && !megaUsesHeldSlot(unit)) {
          const item = auctionAbility(unit) === "unburden" || catalog.get(unit.id).stats.hp >= 70 ? "sitrus-berry" : "focus-sash";
          auctionBattlePrep(game,uid,{kind:"item",slot,item},players,now);
        }
      });
    }
    return auctionBattlePrep(game, uid, {kind:"ready"}, players, now);
  }
  if (game.battle?.duel) return auctionDuelBot(game,uid,players,now);
  let best;
  for (const slot of battleSlots(game, uid)) {
    const attacker = battleTeam(game, uid)[slot];
    if (!attacker.hp) continue;
    for (const targetUid of living(game, players)) {
      if (targetUid === uid) continue;
      for (const [targetSlot, target] of battleTeam(game, targetUid).entries()) {
        if (!target.hp) continue;
        for (const move of attacker.signatureSpent ? ["basic"] : ["basic","signature"]) {
          const {damage,skipped,copies} = auctionBattleDamage(attacker,target,move,game,targetUid);
          const weight = damage + (damage === target.hp ? 22 : 0) + (usesAuctionAbilities(game) && copies ? 5 : 0) - (skipped ? 4 : 0);
          if (!best || weight > best.weight) best = {slot, targetUid, targetSlot, move, weight};
        }
      }
    }
  }
  if (best) return auctionBattleAttack(game, uid, best, players, now, automated);
}

export function auctionBattleTimeout(game, players, now) {
  if (now < game.phaseEndsAt) return;
  if (game.battle?.duel && game.phase !== "auction-prep") return advanceAuctionDuel(game,players,now);
  if (game.phase !== "auction-battle") return nextBattleTurn(game, players, now);
  const survivors = living(game, players);
  if (survivors.length < 2 || !survivors.includes(game.battle.activeUid)) return nextBattleTurn(game, players, now);
  return auctionBattleBotAction(game, game.battle.activeUid, players, now, true);
}
