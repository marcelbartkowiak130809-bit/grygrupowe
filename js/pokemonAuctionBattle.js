import { pokemonDex } from "./pokemonData.js?v=20260804-2";
import { battleAlternateForms, battleSpeciesData, battleMoveData, battleTypeFactors } from "./pokemonAuctionBattleData.js?v=20261120-5";

export const auctionBattleDefaults = { freeEvolutions:1, megaEnabled:true, megaPrice:5, showDamagePreview:false };
export const auctionBattleLimits = { freeEvolutions:10, megaPrice:500 };
export function sanitizeAuctionBattleRules(settings = {}) {
  const integer = key => {
    const value = settings[key];
    return (typeof value === "number" || typeof value === "string" && value.trim()) && Number.isFinite(Number(value))
      ? Math.min(auctionBattleLimits[key], Math.max(0, Math.trunc(Number(value)))) : auctionBattleDefaults[key];
  };
  return {freeEvolutions:integer("freeEvolutions"), megaEnabled:settings.megaEnabled !== false, megaPrice:integer("megaPrice"), showDamagePreview:settings.showDamagePreview === true};
}

export const battleEvolutionsUsed = prep => prep.evolutionsUsed ?? (prep.evolved ? 1 : 0);
export const battleUpgradeUsed = prep => Boolean(prep.transformed || prep.mega);
export const auctionBattlePhases = ["auction-prep", "auction-battle", "auction-hit"];
const prepMs = 60000;
const turnMs = 20000;
const hitMs = 770;
const dex = new Map(pokemonDex.map(item => [item.id, item]));
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
  const spritePath = id===10301 ? "other/official-artwork/10301.png" : `${id}.png`;
  return [id, {
    ...base, id, name:formName || base.name, types:formTypes || base.types, bst:hp+attack+defense+specialAttack+specialDefense+speed,
    sprite:formName ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${spritePath}` : base.sprite,
    spriteFallback:formName ? base.sprite : base.spriteFallback,
    formKind:form ? "form" : formName ? "mega" : "",
    stats:{hp, attack, defense, specialAttack, specialDefense, speed},
    signature:fallbackSignatures[id] || battleMoveData[signature], evolutions, megas, forms:battleAlternateForms[id] || [],
  }];
}));

export const auctionBattlePokemon = id => catalog.get(id);
export const battleTeam = (game, uid) => game.battle?.teams?.[uid] || [];
export const battleSignature = unit => unit.copiedSignature || catalog.get(unit.id).signature;
export const battleSlots = (game, uid) => game.battle?.prep?.[uid]?.order || battleTeam(game, uid).map((_, slot) => slot);
export const battleHasUnits = (game, uid) => battleTeam(game, uid).some(unit => unit.hp > 0);
export const battleSurrendered = (game, uid) => game.battle?.surrendered?.includes(uid);
const living = (game, players) => players.filter(uid => battleHasUnits(game, uid));
const createUnit = id => {
  const maxHp = 44 + catalog.get(id).stats.hp;
  return {id, hp:maxHp, maxHp, signatureSpent:false};
};

export function prepareAuctionBattle(game, players, now) {
  const teams = Object.fromEntries(players.map(uid => [uid, (game.teams?.[uid] || []).filter(id => catalog.has(id)).map(createUnit)]));
  if (players.filter(uid => teams[uid].length).length < 2) return false;
  game.battle = {teams, prep:{}, turn:0};
  game.phase = "auction-prep";
  game.phaseEndsAt = now + prepMs;
  return true;
}

function finishBattle(game, players, survivors) {
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
  const survivors = living(game, players);
  if (survivors.length < 2) return finishBattle(game, players, survivors);
  if (!battle.order) {
    const leadSpeed = uid => catalog.get(battleTeam(game, uid)[battleSlots(game, uid)[0]].id).stats.speed;
    battle.order = survivors.sort((a, b) => leadSpeed(b) - leadSpeed(a));
  }
  const previous = battle.order.indexOf(battle.activeUid);
  for (let step = 1; step <= battle.order.length; step++) {
    const uid = battle.order[(previous + step) % battle.order.length];
    if (survivors.includes(uid)) {
      battle.activeUid = uid;
      break;
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
  if (!["evolve","mega","form"].includes(kind)) return "Nieznana akcja.";
  const paid = kind !== "evolve";
  const options = {evolve:species?.evolutions, mega:species?.megas, form:species?.forms}[kind];
  if (!options?.includes(action.target)) return "Ten Pokémon nie ma takiego ulepszenia.";
  const {freeEvolutions, megaEnabled, megaPrice} = game.battleRules || auctionBattleDefaults;
  const used = battleEvolutionsUsed(player);
  if (paid && !megaEnabled) return "Host wyłączył Megaewolucje i zmiany formy.";
  if (paid && battleUpgradeUsed(player)) return "Płatne ulepszenie zostało już wykorzystane.";
  if (!paid && used >= freeEvolutions) return "Brak dostępnych darmowych ewolucji.";
  if (paid && Number(game.budgets?.[uid] || 0) < megaPrice) return `Ulepszenie kosztuje ${megaPrice}$ z budżetu aukcji.`;
  if (paid && megaPrice > 0) game.budgets[uid] -= megaPrice;
  battleTeam(game, uid)[action.slot] = createUnit(action.target);
  player.evolution = {slot:action.slot, fromId:unit.id, toId:action.target, kind, sequence:(player.evolution?.sequence || 0)+1};
  if (paid) player.transformed = true;
  else player.evolutionsUsed = used + 1;
}

function moveTypeFactor(type, targetSpecies) {
  return targetSpecies.types.reduce((value, defense) => value * (battleTypeFactors[type]?.[defense] ?? 1), 1);
}

export function battleSignatureEffectiveness(attacker, target) {
  const [,type, power] = battleSignature(attacker);
  return power ? moveTypeFactor(type, catalog.get(target.id)) : 0;
}

export function auctionBattleDamage(attacker, target, move) {
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
  const hit = auctionBattleDamage(attacker, target, move);
  const name = (move === "signature" ? battleSignature(attacker) : battleMoveData[0])[0];
  attacker.signatureSpent = move === "signature";
  if (hit.copies && name === "Transform") {
    attacker.id = target.id;
    delete attacker.copiedSignature;
  } else if (hit.copies) {
    const signature = battleSignature(target);
    attacker.copiedSignature = signature[2] ? signature : ["Uderzenie", "normal", 60, "physical"];
  }
  target.hp -= hit.damage;
  battle.last = {turn:battle.turn, uid, slot:action.slot, targetUid:action.targetUid, targetSlot:action.targetSlot, name, ...hit, knockedOut:target.hp === 0};
  game.phase = "auction-hit";
  game.phaseEndsAt = now + hitMs;
}

export function auctionBattleSurrender(game, uid, players, now) {
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
    if (!megaEnabled) return auctionBattlePrep(game, uid, {kind:"ready"}, players, now);
    const upgrades = team.flatMap((unit, slot) => {
      const pokemon = catalog.get(unit.id);
      return [...pokemon.megas, ...pokemon.forms].map(target => ({
        kind:catalog.get(target).formKind, slot, target, gain:catalog.get(target).bst - pokemon.bst,
      }));
    }).sort((a,b) => b.gain - a.gain);
    if (upgrades.length) auctionBattlePrep(game, uid, upgrades[0], players, now);
    return auctionBattlePrep(game, uid, {kind:"ready"}, players, now);
  }
  let best;
  for (const slot of battleSlots(game, uid)) {
    const attacker = battleTeam(game, uid)[slot];
    if (!attacker.hp) continue;
    for (const targetUid of living(game, players)) {
      if (targetUid === uid) continue;
      for (const [targetSlot, target] of battleTeam(game, targetUid).entries()) {
        if (!target.hp) continue;
        for (const move of attacker.signatureSpent ? ["basic"] : ["basic","signature"]) {
          const {damage} = auctionBattleDamage(attacker, target, move);
          const weight = damage + (damage === target.hp ? 22 : 0);
          if (!best || weight > best.weight) best = {slot, targetUid, targetSlot, move, weight};
        }
      }
    }
  }
  if (best) return auctionBattleAttack(game, uid, best, players, now, automated);
}

export function auctionBattleTimeout(game, players, now) {
  if (now < game.phaseEndsAt) return;
  if (game.phase !== "auction-battle") return nextBattleTurn(game, players, now);
  const survivors = living(game, players);
  if (survivors.length < 2 || !survivors.includes(game.battle.activeUid)) return nextBattleTurn(game, players, now);
  return auctionBattleBotAction(game, game.battle.activeUid, players, now, true);
}
