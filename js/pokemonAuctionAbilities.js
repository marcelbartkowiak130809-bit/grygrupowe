import { battleAbilityFlags, battleAbilityNames, battleSpeciesAbilities } from "./pokemonAuctionAbilityData.js?v=20261122-1";
import { checkHeldBerry, consumeItem, heldItem } from "./pokemonAuctionTactics.js?v=20261122-1";

export const auctionAbilityChoices = id => battleSpeciesAbilities[id] || [];
export const auctionAbility = unit => unit?.copiedAbility || unit?.ability || auctionAbilityChoices(unit?.id)[0];
export const auctionAbilityName = id => battleAbilityNames[id] || "";
export const fieldNames = {sun:"Słońce", rain:"Deszcz", sand:"Burza piaskowa", snow:"Śnieg", harshSun:"Ostre słońce", heavyRain:"Ulewa", winds:"Silne wiatry", electric:"Elektryczne pole", grassy:"Trawiaste pole", psychic:"Psychiczne pole", misty:"Mgła"};
export const statusNames = {burn:"Poparzenie", poison:"Zatrucie", toxic:"Narastające zatrucie", paralysis:"Paraliż", sleep:"Sen", freeze:"Zamrożenie", confusion:"Dezorientacja"};

const weather = {drought:"sun", drizzle:"rain", "sand-stream":"sand", "snow-warning":"snow", "desolate-land":"harshSun", "primordial-sea":"heavyRain", "delta-stream":"winds", "orichalcum-pulse":"sun"};
const terrain = {"electric-surge":"electric", "grassy-surge":"grassy", "psychic-surge":"psychic", "misty-surge":"misty", "hadron-engine":"electric"};
const severeWeather = ["harshSun","heavyRain","winds"];
const absorbs = {
  electric:{"volt-absorb":"hp", "lightning-rod":"specialAttack", "motor-drive":"speed"},
  water:{"water-absorb":"hp", "dry-skin":"hp", "storm-drain":"specialAttack"},
  fire:{"flash-fire":"fireReady", "well-baked-body":"defense"},
  grass:{"sap-sipper":"attack"},
  ground:{"earth-eater":"hp", levitate:"", eelevate:""},
};
const lowHpBoosts = {overgrow:"grass", blaze:"fire", torrent:"water", swarm:"bug"};
const typeBoosts = {steelworker:["steel",1.5], "steely-spirit":["steel",1.5], "dragons-maw":["dragon",1.5], transistor:["electric",1.3], "rocky-payload":["rock",1.5], "water-bubble":["water",2]};
const flagBoosts = {"iron-fist":["punch",1.2], "strong-jaw":["bite",1.5], "mega-launcher":["pulse",1.5], sharpness:["slicing",1.5], "tough-claws":["contact",1.3], "punk-rock":["sound",1.3]};
const conversions = {aerilate:"flying", pixilate:"fairy", refrigerate:"ice", galvanize:"electric", dragonize:"dragon"};
const contactStatus = {static:"paralysis","flame-body":"burn","poison-point":"poison","effect-spore":"random"};
const koBoost = {moxie:"attack","chilling-neigh":"attack","as-one-glastrier":"attack","grim-neigh":"specialAttack","as-one-spectrier":"specialAttack","soul-heart":"specialAttack"};
const abilityFlag = (id, flag) => battleAbilityFlags[id]?.includes(flag);
const notes = {
  levitate:"Odporność na ataki typu Ground.",
  intimidate:"Przy pierwszym starciu obniża Atak przeciwnika.",
  "wonder-guard":"Przepuszcza tylko bezpośrednie ataki super skuteczne.",
  sturdy:"Przy pełnym HP ratuje przed nokautem, zostawiając 1 HP.",
  "huge-power":"Podwaja Atak fizyczny.",
  "pure-power":"Podwaja Atak fizyczny.",
  disguise:"Jednorazowo pochłania trafienie kosztem ⅛ maksymalnego HP.",
  "flame-body":"Kontaktowy atak przeciwnika ma 30% szans na poparzenie go.",
  static:"Kontaktowy atak przeciwnika ma 30% szans na sparaliżowanie go.",
  "mold-breaker":"Ataki omijają większość obronnych zdolności celu.",
  "neutralizing-gas":"Tłumi większość zdolności podczas starcia.",
  "ice-face":"Blokuje pierwsze fizyczne trafienie. Śnieg może odnowić osłonę.",
  "bad-dreams":"Odbiera śpiącemu przeciwnikowi ⅛ maksymalnego HP.",
  "battle-bond":"Po pierwszym nokaucie podnosi Atak, Atak Specjalny i Szybkość.",
  "cursed-body":"Trafienie ma 30% szans na czasową blokadę ruchu atakującego.",
  "regenerator":"Odnawia ⅓ maksymalnego HP przy zejściu z pola.",
  "natural-cure":"Usuwa status przy zejściu z pola.",
  "power-construct":"Przy połowie HP lub mniej Zygarde przyjmuje Formę Kompletną.",
  truant:"Co druga własna akcja przepada.",
  imposter:"Przy pierwszym starciu kopiuje formę i zdolność przeciwnika.",
};
const supported = new Set([
  ...Object.keys(weather), ...Object.keys(terrain), ...Object.keys(lowHpBoosts), ...Object.keys(typeBoosts), ...Object.keys(flagBoosts),
  ...Object.keys(conversions), ...Object.keys(contactStatus), ...Object.keys(koBoost), ...Object.keys(notes),
  ...Object.values(absorbs).flatMap(Object.keys),
  ...("cheek-pouch good-as-gold klutz magic-bounce piercing-drill prankster pressure ripen unburden unnerve unseen-fist").split(" "),
  ...("analytic aura-guard fire-mane gale-wings guard-dog illuminate mega-sol mimicry moody perish-body spicy-spray stakeout supersweet-syrup triage victory-star").split(" "),
  ...("adaptability aftermath air-lock anger-point anger-shell armor-tail aura-break battle-armor beads-of-ruin beast-boost berserk big-pecks bulletproof chlorophyll clear-body cloud-nine color-change comatose competitive compound-eyes contrary corrosion cotton-down damp dark-aura dazzling defeatist defiant download dry-skin early-bird electromorphosis fairy-aura filter flare-boost flower-gift fluffy forecast full-metal-body fur-coat gooey grass-pelt guts heatproof hustle hydration hyper-cutter ice-body ice-scales immunity inner-focus innards-out insomnia intrepid-sword iron-barbs justified keen-eye leaf-guard libero limber lingering-aroma liquid-ooze liquid-voice long-reach magic-guard magma-armor marvel-scale merciless minds-eye mirror-armor multiscale mummy neuroforce no-guard normalize oblivious overcoat own-tempo parental-bond pastel-veil poison-heal poison-puppeteer poison-touch power-construct prism-armor protean protosynthesis purifying-salt quark-drive queenly-majesty quick-feet rain-dish rattled reckless rock-head rough-skin sand-force sand-rush sand-spit sand-veil scrappy seed-sower serene-grace shadow-shield shed-skin sheer-force shell-armor shield-dust simple skill-link slush-rush slow-start sniper snow-cloak solar-power solid-rock soundproof speed-boost stamina stance-change steam-engine super-luck supreme-overlord surge-surfer sweet-veil swift-swim sword-of-ruin synchronize tablets-of-ruin tangling-hair tangled-feet technician tera-shell teravolt thermal-exchange thick-fat tinted-lens toxic-boost toxic-chain trace turboblaze unaware vessel-of-ruin vital-spirit wandering-spirit water-compaction water-veil weak-armor white-smoke wind-power wind-rider dauntless-shield").split(" "),
]);
export const auctionAbilitySupported = id => supported.has(id);
export const auctionAbilityDescription = id => notes[id] ||
  (Object.hasOwn(weather,id) ? `Przy pierwszym starciu zmienia pogodę: ${fieldNames[weather[id]]}.` :
  Object.hasOwn(terrain,id) ? `Przy pierwszym starciu zmienia pole bitwy: ${fieldNames[terrain[id]]}.` :
  Object.hasOwn(lowHpBoosts,id) ? `Wzmacnia ruchy typu ${lowHpBoosts[id]}, gdy zostaje najwyżej ⅓ HP.` : "");

const stageFactor = stage => stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage);
const fraction = (unit, divisor) => Math.max(1, Math.floor(unit.maxHp / divisor));
const heal = (unit, amount) => { unit.hp = Math.min(unit.maxHp, unit.hp + amount); };
const hurt = (unit, amount) => { unit.hp = Math.max(0, unit.hp - amount); };
const grounded = (types, id) => !types.includes("flying") && !["levitate","eelevate"].includes(id);
const stats = ["attack","defense","specialAttack","specialDefense","speed"];
const protectedStats = {"hyper-cutter":"attack","big-pecks":"defense","keen-eye":"accuracy","minds-eye":"accuracy",illuminate:"accuracy"};
const stage = (unit, stat) => unit.stages?.[stat] || 0;
const statValue = (unit,species,stat,ignore) => species.stats[stat] * stageFactor(ignore ? 0 : stage(unit,stat));
const highestStat = (unit,species) => stats.reduce((best,stat) => statValue(unit,species,stat) > statValue(unit,species,best) ? stat : best);

function boost(unit, stat, by, id, log, source) {
  if (id === "contrary") by *= -1;
  if (id === "simple") by *= 2;
  if (source && by < 0) {
    if (source.id === "intimidate" && id === "guard-dog") { boost(unit,"attack",1,id,log); log(id); return; }
    if (["clear-body","white-smoke","full-metal-body"].includes(id) || protectedStats[id] === stat ||
        source.id === "intimidate" && ["scrappy","minds-eye","own-tempo","inner-focus","oblivious"].includes(id)) { log(id); return; }
    if (id === "mirror-armor" && source.unit !== unit) {
      boost(source.unit,stat,by,source.id,log);
      log(id);
      return;
    }
  }
  const old = stage(unit,stat);
  const value = Math.max(-6,Math.min(6,old + by));
  if (old === value) return;
  (unit.stages ||= {})[stat] = value;
  if (source && value < old && ["defiant","competitive"].includes(id)) {
    boost(unit,id === "defiant" ? "attack" : "specialAttack",2,id,log);
    log(id);
  }
}

function cure(unit) {
  delete unit.condition;
  delete unit.conditionTurns;
  delete unit.toxicTurns;
}

function status(unit, condition, types, id, source, field, log) {
  if (condition === "confusion" ? unit.confusion : unit.condition) return false;
  if (id === "comatose" || id === "purifying-salt" && condition !== "confusion" || id === "leaf-guard" && field.sun ||
      field.terrain === "misty" && grounded(types,id)) return false;
  if (condition === "burn" && (types.includes("fire") || ["water-veil","water-bubble","thermal-exchange"].includes(id))) return false;
  if (condition === "freeze" && (types.includes("ice") || id === "magma-armor" || field.sun)) return false;
  if (["poison","toxic"].includes(condition) && (["immunity","pastel-veil"].includes(id) || source !== "corrosion" && types.some(t => t === "steel" || t === "poison"))) return false;
  if (condition === "paralysis" && (types.includes("electric") || id === "limber")) return false;
  if (condition === "sleep" && (["insomnia","vital-spirit","sweet-veil"].includes(id) || field.terrain === "electric" && grounded(types,id))) return false;
  if (condition === "confusion") {
    if (id === "own-tempo") return false;
    unit.confusion = 3;
  } else {
    unit.condition = condition;
    if (condition === "sleep") unit.conditionTurns = id === "early-bird" ? 2 : 3;
  }
  log(statusNames[condition],true);
  return true;
}

function setField(battle, field, kind, duration, id, log) {
  const current = battle[field];
  if (current?.end >= battle.turn && (current.kind === kind ||
       field === "weather" && severeWeather.includes(current.kind) && !severeWeather.includes(kind))) return;
  battle[field] = {kind,end:Math.max(1,battle.turn) + duration - 1};
  log(id);
}

function readField(battle, a, b) {
  const ignoreWeather = [a,b].some(id => id === "air-lock" || id === "cloud-nine");
  const weather = !ignoreWeather && battle.weather?.end >= battle.turn ? battle.weather.kind : "";
  const terrain = battle.terrain?.end >= battle.turn ? battle.terrain.kind : "";
  return {weather,terrain,sun:weather === "sun" || weather === "harshSun",rain:weather === "rain" || weather === "heavyRain"};
}

export function auctionBattleSpeed(unit,species,battle) {
  const id = auctionAbility(unit);
  const field = readField(battle,id);
  let speed = statValue(unit,species,"speed");
  if (id === "unburden" && unit.unburdened && !unit.item) speed *= 2;
  if (unit.condition === "paralysis" && id !== "quick-feet") speed *= .5;
  if (id === "slow-start" && (unit.actions || 0) < 5) speed *= .5;
  if (id === "quick-feet" && unit.condition) speed *= 1.5;
  if (id === "chlorophyll" && field.sun || id === "swift-swim" && field.rain ||
      id === "sand-rush" && field.weather === "sand" || id === "slush-rush" && field.weather === "snow" ||
      id === "surge-surfer" && field.terrain === "electric") speed *= 2;
  if ((id === "protosynthesis" && field.sun || id === "quark-drive" && field.terrain === "electric") &&
      highestStat(unit,species) === "speed") speed *= 1.5;
  return speed;
}

function effectiveAbilities(attacker,target) {
  const ids = [auctionAbility(attacker),auctionAbility(target)];
  if (!ids.includes("neutralizing-gas")) return ids;
  return ids.map(id => id === "neutralizing-gas" || abilityFlag(id,"cantsuppress") ? id : "");
}

function onEntry(unit, rival, rivalSpecies, id, rivalId, battle, log, rounds) {
  if (unit.entered) return;
  unit.entered = true;
  if (id === "trace" && rivalId && !abilityFlag(rivalId,"notrace")) {
    unit.copiedAbility = rivalId;
    log(id);
    id = rivalId;
  }
  if (id === "imposter" && rivalId !== "imposter") {
    if (battle.duel) unit.transformBase = unit.id;
    unit.id = rival.id;
    unit.copiedAbility = rivalId || "imposter";
    log(id);
    return;
  }
  if (id === "intimidate") {
    boost(rival,"attack",-1,rivalId,log,{unit,id});
    log(id);
  }
  if (id === "supersweet-syrup" && !unit.syrupUsed) {
    unit.syrupUsed = true;
    boost(rival,"evasion",-1,rivalId,log,{unit,id});
    log(id);
  }
  if (id === "download") {
    const stat = statValue(rival,rivalSpecies,"defense") < statValue(rival,rivalSpecies,"specialDefense") ? "attack" : "specialAttack";
    boost(unit,stat,1,id,log);
    log(id);
  }
  if (["intrepid-sword","dauntless-shield"].includes(id) && !unit.entryBoostUsed) {
    unit.entryBoostUsed = true;
    boost(unit,id === "intrepid-sword" ? "attack" : "defense",1,id,log);
    log(id);
  }
  if (weather[id]) {
    const severe = severeWeather.includes(weather[id]);
    setField(battle,"weather",weather[id],battle.duel && severe ? 9999 : rounds * (severe ? 1 : 5),id,log);
  }
  if (terrain[id]) setField(battle,"terrain",terrain[id],rounds * 5,id,log);
}

export function auctionBattleTypes(unit, species, battle, id = auctionAbility(unit), field = readField(battle,id)) {
  if (id === "forecast") return [field.sun ? "fire" : field.rain ? "water" : field.weather === "snow" ? "ice" : "normal"];
  if (id === "mimicry" && field.terrain) return [{electric:"electric",grassy:"grass",psychic:"psychic",misty:"fairy"}[field.terrain]];
  return unit.battleType ? [unit.battleType] : species.types;
}

export function auctionBattleField(battle) {
  return [battle.weather,battle.terrain].filter(effect => effect?.end >= battle.turn).map(effect => fieldNames[effect.kind]);
}

function residual(unit, id, types, field, log, active) {
  if (!unit.hp) return;
  if (id === "hydration" && field.rain && unit.condition) { cure(unit); log(id); }
  if (id === "poison-heal" && ["poison","toxic"].includes(unit.condition)) { heal(unit,fraction(unit,8)); log(id); }
  else if (unit.condition === "toxic") {
    unit.toxicTurns = Math.min(15,(unit.toxicTurns || 0) + 1);
    if (id !== "magic-guard") hurt(unit,Math.max(1,Math.floor(unit.maxHp * unit.toxicTurns / 16)));
  }
  else if (id !== "magic-guard" && unit.condition === "poison") hurt(unit,fraction(unit,8));
  else if (id !== "magic-guard" && unit.condition === "burn") hurt(unit,fraction(unit,16));
  if (field.terrain === "grassy" && grounded(types,id) && unit.hp) heal(unit,fraction(unit,16));
  if (field.weather === "sand" && unit.hp && !types.some(t => ["rock","ground","steel"].includes(t)) &&
      !["magic-guard","overcoat","sand-force","sand-rush","sand-veil"].includes(id)) hurt(unit,fraction(unit,16));
  if (!unit.hp) return;
  if (id === "dry-skin" && field.rain) { heal(unit,fraction(unit,8)); log(id); }
  if (id === "rain-dish" && field.rain || id === "ice-body" && field.weather === "snow") { heal(unit,fraction(unit,16)); log(id); }
  if (id === "dry-skin" && field.sun || id === "solar-power" && field.sun) { hurt(unit,fraction(unit,8)); log(id); }
  if (active && id === "speed-boost") { boost(unit,"speed",1,id,log); log(id); }
  if (unit.hp && heldItem(unit,id) === "leftovers" && unit.hp < unit.maxHp) { heal(unit,fraction(unit,16)); log("Leftovers",true); }
}

function canMove(unit, id, move, field, chance, log) {
  unit.actions = (unit.actions || 0) + 1;
  if (id === "truant" && unit.actions % 2 === 0) { log(id); return false; }
  if (unit.condition === "sleep") {
    unit.conditionTurns = (unit.conditionTurns || 1) - (id === "early-bird" ? 2 : 1);
    if (unit.conditionTurns > 0) { log("Sen",true); return false; }
    cure(unit);
  }
  if (unit.condition === "freeze") {
    if (move.flags.includes("defrost") || field.sun || chance(20)) cure(unit);
    else { log("Zamrożenie",true); return false; }
  }
  if (unit.condition === "paralysis" && chance(25)) { log("Paraliż",true); return false; }
  if (unit.confusion) {
    unit.confusion--;
    if (unit.confusion && chance(33)) { hurt(unit,fraction(unit,8)); log("Dezorientacja",true); return false; }
  }
  return true;
}

function adjustedMove(move, attacker, id, log) {
  const result = {...move};
  const newType = id === "normalize" ? "normal"
    : id === "liquid-voice" && move.flags.includes("sound") ? "water"
    : move.type === "normal" && conversions[id];
  if (newType) {
    result.type = newType;
    if (id !== "liquid-voice") result.power *= 1.2;
    log(id);
  }
  if (["protean","libero"].includes(id) && !attacker.proteanUsed && result.type) {
    attacker.proteanUsed = true;
    attacker.battleType = result.type;
    log(id);
  }
  if (id === "long-reach") result.flags = result.flags.filter(flag => flag !== "contact");
  if (id === "gale-wings" && result.type === "flying" && attacker.hp === attacker.maxHp) result.priority++;
  if (id === "triage" && result.drain > 0) result.priority += 3;
  return result;
}

function typeFactor(move, targetTypes, a, field, factors) {
  return targetTypes.reduce((value,defense) => {
    let factor = factors[move.type]?.[defense] ?? 1;
    if (defense === "ghost" && ["scrappy","minds-eye"].includes(a) && ["normal","fighting"].includes(move.type)) factor = 1;
    if (move.key === "freeze-dry" && defense === "water") factor = 2;
    if (field.weather === "winds" && defense === "flying" && factor > 1) factor = 1;
    return value * factor;
  },1);
}

function applyImmunity(unit, move, id, log) {
  const group = absorbs[move.type];
  if (group && Object.hasOwn(group,id)) {
    const effect = group[id];
    if (effect === "hp") heal(unit,fraction(unit,4));
    else if (effect === "fireReady") unit.fireReady = true;
    else if (effect) boost(unit,effect,id === "well-baked-body" ? 2 : 1,id,log);
  } else if (id === "wind-rider" && move.flags.includes("wind")) {
    boost(unit,"attack",1,id,log);
  } else if (!(id === "soundproof" && move.flags.includes("sound") ||
               id === "bulletproof" && move.flags.some(flag => flag === "bullet" || flag === "ballistics") ||
               id === "overcoat" && move.flags.includes("powder"))) return false;
  log(id);
  return true;
}

function powerFactor(attacker,target,move,a,b,field,fromTypes,toTypes,factor,team,log) {
  let value = 1;
  const multiply = (id, amount) => { value *= amount; log(id); };
  const typed = typeBoosts[a], flagged = flagBoosts[a];
  if (typed?.[0] === move.type) multiply(a,typed[1]);
  if (flagged && move.flags.includes(flagged[0])) multiply(a,flagged[1]);
  if (move.type === lowHpBoosts[a] && attacker.hp * 3 <= attacker.maxHp) multiply(a,1.5);
  if (a === "technician" && move.basePower <= 60) multiply(a,1.5);
  if (a === "reckless" && move.drain < 0) multiply(a,1.2);
  if (a === "sheer-force" && move.secondary) multiply(a,1.3);
  if (a === "neuroforce" && factor > 1) multiply(a,1.25);
  if (a === "tinted-lens" && factor < 1) multiply(a,2);
  if (a === "flash-fire" && attacker.fireReady && move.type === "fire") multiply(a,1.5);
  if (a === "sand-force" && field.weather === "sand" && ["ground","steel","rock"].includes(move.type)) multiply(a,1.3);
  if (attacker.charged && move.type === "electric") multiply(a,2);
  if (a === "supreme-overlord") {
    const lost = team.filter(unit => unit.hp === 0).length;
    if (lost) multiply(a,1 + .1 * Math.min(5,lost));
  }
  if (["dark","fairy"].includes(move.type) && [a,b].includes(move.type + "-aura")) {
    const broken = [a,b].includes("aura-break");
    multiply(broken ? "aura-break" : move.type + "-aura",broken ? .75 : 4/3);
  }
  if (field.sun && move.type === "fire" || field.rain && move.type === "water") value *= 1.5;
  if (field.rain && move.type === "fire" || field.sun && move.type === "water") value *= .5;
  if (move.type === field.terrain && grounded(fromTypes,a)) value *= 1.3;
  if (field.terrain === "misty" && move.type === "dragon" && grounded(toTypes,b)) value *= .5;
  if (b === "dry-skin" && move.type === "fire") multiply(b,1.25);
  if (["thick-fat","heatproof","water-bubble"].includes(b) &&
      (move.type === "fire" || move.type === "ice" && b === "thick-fat")) multiply(b,.5);
  if (b === "purifying-salt" && move.type === "ghost" || b === "ice-scales" && move.kind === "special" ||
      b === "punk-rock" && move.flags.includes("sound")) multiply(b,.5);
  if (b === "fluffy") {
    if (move.flags.includes("contact")) multiply(b,.5);
    if (move.type === "fire") multiply(b,2);
  }
  if (b === "aura-guard" && move.flags.includes("contact")) multiply(b,.5);
  if (["filter","solid-rock","prism-armor"].includes(b) && factor > 1) multiply(b,.75);
  return value;
}

function damageStats(attacker,target,from,to,toTypes,move,a,b,field,log,duel,critical) {
  const special = move.kind === "special";
  const atk = special ? "specialAttack" : "attack";
  const def = special ? "specialDefense" : "defense";
  let offense = (from.stats[atk] + (duel ? 20 : 0)) * stageFactor(b === "unaware" || critical && stage(attacker,atk) < 0 ? 0 : stage(attacker,atk));
  let defense = (to.stats[def] + (duel ? 20 : 0)) * stageFactor(a === "unaware" || critical && stage(target,def) > 0 ? 0 : stage(target,def));
  const power = (id, amount) => { offense *= amount; log(id); };
  const block = (id, amount) => { defense *= amount; log(id); };
  if (!special && ["pure-power","huge-power"].includes(a)) power(a,2);
  if (!special && (a === "hustle" || a === "guts" && attacker.condition || a === "toxic-boost" && attacker.condition === "poison")) power(a,1.5);
  if (special && (a === "flare-boost" && attacker.condition === "burn" || a === "solar-power" && field.sun)) power(a,1.5);
  if (a === "fire-mane" && move.type === "fire") power(a,1.5);
  if (!special && a === "slow-start" && attacker.actions <= 5 || a === "defeatist" && attacker.hp * 2 <= attacker.maxHp) power(a,.5);
  if (!special && a === "orichalcum-pulse" && field.sun || special && a === "hadron-engine" && field.terrain === "electric") power(a,4/3);
  const paradox = id => id === "protosynthesis" && field.sun || id === "quark-drive" && field.terrain === "electric";
  if (paradox(a) && highestStat(attacker,from) === atk) power(a,1.3);
  if (paradox(b) && highestStat(target,to) === def) block(b,1.3);
  if (!special && b === "fur-coat") block(b,2);
  if (!special && (b === "marvel-scale" && target.condition || b === "grass-pelt" && field.terrain === "grassy")) block(b,1.5);
  if (field.sun && special && b === "flower-gift") block(b,1.5);
  if (field.sun && !special && a === "flower-gift") power(a,1.5);
  if (b === "tablets-of-ruin" && !special || b === "vessel-of-ruin" && special) power(b,.75);
  if (a === "sword-of-ruin" && !special || a === "beads-of-ruin" && special) block(a,.75);
  if (!special && field.weather === "snow" && toTypes.includes("ice") || special && field.weather === "sand" && toTypes.includes("rock")) defense *= 1.5;
  return [offense,defense];
}

const disablesDefense = ["mold-breaker","turboblaze","teravolt"];
const piercingMoves = ["sunsteel-strike","moongeist-beam","photon-geyser"];

function onHit({attacker,target,move,a,b,fromTypes,toTypes,field,log,chance,battle,rounds,catalog,critical}, damage, before) {
  const contact = move.flags.includes("contact");
  const boostTarget = (stat,by) => boost(target,stat,by,b,log);
  const boostAttacker = (stat,by) => boost(attacker,stat,by,a,log);
  if (move.drain) {
    const hp = Math.max(1,Math.floor(damage * Math.abs(move.drain) / 100));
    if (move.drain > 0 && b !== "liquid-ooze") heal(attacker,hp);
    if (move.drain > 0 && b === "liquid-ooze") { hurt(attacker,hp); log(b); }
    if (move.drain < 0 && !["rock-head","magic-guard"].includes(a)) hurt(attacker,hp);
  }
  if (contact && ["rough-skin","iron-barbs"].includes(b) && a !== "magic-guard") { hurt(attacker,fraction(attacker,8)); log(b); }
  if (contact && b === "aftermath" && !target.hp && !["magic-guard","damp"].includes(a)) { hurt(attacker,fraction(attacker,4)); log(b); }
  if (b === "innards-out" && !target.hp && a !== "magic-guard") { hurt(attacker,before); log(b); }
  if (contact && ["mummy","lingering-aroma","wandering-spirit"].includes(b) && !abilityFlag(a,"cantsuppress")) {
    attacker.copiedAbility = b;
    if (b === "wandering-spirit" && a) target.copiedAbility = a;
    log(b);
  }
  if (contact && ["tangling-hair","gooey"].includes(b) || b === "cotton-down") {
    boost(attacker,"speed",-1,a,log,{unit:target,id:b});
    log(b);
  }
  if (contact && attacker.hp && contactStatus[b] && chance(30)) {
    const condition = contactStatus[b] === "random"
      ? ["sleep","paralysis","poison"][chance(100/3) ? 0 : chance(50) ? 1 : 2] : contactStatus[b];
    if ((b !== "effect-spore" || !fromTypes.includes("grass") && a !== "overcoat") &&
        status(attacker,condition,fromTypes,a,b,field,log)) log(b);
  }
  if (b === "spicy-spray" && attacker.hp && status(attacker,"burn",fromTypes,a,b,field,log)) log(b);
  if (contact && b === "perish-body" && !attacker.perishTurn) {
    attacker.perishTurn = target.perishTurn = battle.turn + rounds * 3;
    log(b);
  }
  if (b === "cursed-body" && attacker.hp && (attacker.disabledUntil || 0) <= attacker.actions && chance(30)) {
    attacker.disabledMove = move.slot;
    attacker.disabledUntil = attacker.actions + 3;
    log(b);
  }
  if (!target.hp) {
    const stat = koBoost[a] || (["beast-boost","eelevate"].includes(a) ? highestStat(attacker,catalog(attacker.id)) : "");
    if (stat && attacker.hp) { boostAttacker(stat,1); log(a); }
    if (a === "battle-bond" && attacker.hp && !attacker.bondUsed) {
      for (const stat of ["attack","specialAttack","speed"]) boostAttacker(stat,1);
      attacker.bondUsed = true;
      log(a);
    }
    return;
  }
  if (b === "stamina") { boostTarget("defense",1); log(b); }
  if (b === "anger-point" && critical) { boostTarget("attack",6 - stage(target,"attack")); log(b); }
  if (b === "weak-armor" && move.kind === "physical") { boostTarget("defense",-1); boostTarget("speed",2); log(b); }
  const perType = {
    "water-compaction":move.type === "water" && ["defense",2],
    "steam-engine":["fire","water"].includes(move.type) && ["speed",6],
    "thermal-exchange":move.type === "fire" && ["attack",1],
    justified:move.type === "dark" && ["attack",1],
    rattled:["dark","ghost","bug"].includes(move.type) && ["speed",1],
  }[b];
  if (perType) { boostTarget(...perType); log(b); }
  if (b === "color-change" && !toTypes.includes(move.type)) { target.battleType = move.type; log(b); }
  if (b === "electromorphosis" || b === "wind-power" && move.flags.includes("wind")) { target.charged = true; log(b); }
  if (b === "sand-spit") setField(battle,"weather","sand",rounds * 5,b,log);
  if (b === "seed-sower") setField(battle,"terrain","grassy",rounds * 5,b,log);
  if (before * 2 > target.maxHp && target.hp * 2 <= target.maxHp) {
    if (b === "berserk") { boostTarget("specialAttack",1); log(b); }
    if (b === "anger-shell") {
      for (const stat of stats) boostTarget(stat,["defense","specialDefense"].includes(stat) ? -1 : 1);
      log(b);
    }
  }
  const inflict = condition => {
    if (!status(target,condition,toTypes,b,a,field,log)) return false;
    if (a === "poison-puppeteer" && condition === "poison") { status(target,"confusion",toTypes,b,a,field,log); log(a); }
    if (b === "synchronize" && ["burn","poison","paralysis"].includes(condition) &&
        status(attacker,condition,fromTypes,a,b,field,log)) log(b);
    return true;
  };
  if (a !== "sheer-force" && b !== "shield-dust" && move.ailment && chance(move.ailmentChance * (a === "serene-grace" ? 2 : 1))) inflict(move.ailment);
  if (b !== "shield-dust" && (a === "toxic-chain" || a === "poison-touch" && contact) && chance(30) && inflict("poison")) log(a);
}

export const completeZygarde = 10120;
export const bladeAegislash = 10026;
export const noiceEiscue = 10185;

function afterAction(attacker,target,a,b,battle,catalog,chance,log,only) {
  const field = readField(battle,a,b);
  for (const [unit,id,rival,rivalId] of [[attacker,a,target,b],[target,b,attacker,a]]) {
    if (only && unit !== only) continue;
    if (!unit.hp) continue;
    if (id === "shed-skin" && unit.condition && chance(33)) { cure(unit); log(id); }
    if (id === "bad-dreams" && rival.hp && (rival.condition === "sleep" || rivalId === "comatose") && rivalId !== "magic-guard") {
      hurt(rival,fraction(rival,8));
      log(id);
    }
    residual(unit,id,auctionBattleTypes(unit,catalog(unit.id),battle,id,field),field,log,unit === attacker);
    checkHeldBerry(unit,id,rivalId,log);
    if (id === "moody" && unit === attacker && unit.hp) {
      const increase = stats.filter(stat => stage(unit,stat) < 6);
      const chosen = increase.find((_,i) => chance(100/(increase.length-i)));
      const decrease = stats.filter(stat => stat !== chosen && stage(unit,stat) > -6);
      const lowered = decrease.find((_,i) => chance(100/(decrease.length-i)));
      if (chosen) boost(unit,chosen,2,id,log);
      if (lowered) boost(unit,lowered,-1,id,log);
      if (chosen || lowered) log(id);
    }
    if (id === "power-construct" && unit.hp && unit.hp * 2 <= unit.maxHp && unit.id !== completeZygarde) {
      const max = (battle.duel ? 75 : 44) + catalog(completeZygarde).stats.hp;
      unit.hp += max - unit.maxHp;
      unit.maxHp = max;
      unit.id = completeZygarde;
      log(id);
    }
  }
}

const combatLog = entries => (id,literal = false) => {
  const name = literal ? id : auctionAbilityName(id);
  if (name) entries.add(name);
};

export function auctionDuelLeave(unit, opponent, battle) {
  const [id] = effectiveAbilities(unit,opponent);
  if (id === "regenerator" && unit.hp) heal(unit,fraction(unit,3));
  if (id === "natural-cure") cure(unit);
  if (unit.id === bladeAegislash) unit.id = 681;
  if (unit.transformBase) unit.id = unit.transformBase;
  for (const key of ["transformBase","entered","stages","actions","battleType","copiedAbility","copiedSignature","confusion",
    "toxicTurns","perishTurn","disabledMove","disabledUntil","unburdened","proteanUsed","fireReady","charged","protect","protectChain","activeTurns"]) delete unit[key];
  for (const name of severeWeather) {
    if (battle.weather?.kind === name && weather[id] === name) delete battle.weather;
  }
  return ["natural-cure","regenerator"].includes(id) ? auctionAbilityName(id) : "";
}

export function auctionDuelEnter(unit, rival, battle, catalog) {
  const entries = new Set();
  const [a,b] = effectiveAbilities(unit,rival);
  onEntry(unit,rival,catalog(rival.id),a,b,battle,combatLog(entries),1);
  return [...entries];
}

export function auctionDuelResidual(unit, rival, battle, catalog) {
  const entries = new Set();
  const [a,b] = effectiveAbilities(unit,rival);
  afterAction(unit,rival,a,b,battle,catalog,percent => duelRoll(battle.turn,unit.id,rival.id,31) * 100 < percent,combatLog(entries),unit);
  if (unit.perishTurn && unit.perishTurn <= battle.turn) { unit.hp = 0; entries.add("Perish Body"); }
  delete unit.protect;
  unit.activeTurns = (unit.activeTurns || 0) + 1;
  return [...entries];
}

export const duelRoll = (turn, a, b, salt = 0) =>
  ((Math.imul(Math.imul(turn,1597334677) ^ Math.imul(a,919627) ^ Math.imul(b,383167) ^ salt,1664525) + 1013904223) >>> 0) / 4294967296;

export function auctionDuelPriority(unit, move) {
  const a = auctionAbility(unit);
  return move.priority + Number(a === "prankster" && move.kind === "status") +
    Number(a === "gale-wings" && move.type === "flying" && unit.hp === unit.maxHp) +
    Number(a === "triage" && (move.effect === "heal" || move.drain > 0)) * 3;
}

function tacticalEffect({attacker,target,move,a,b,battle,field,catalog,log,chance,factors}) {
  if (move.effect === "protect") {
    if (a === "stance-change" && attacker.id === bladeAegislash) { attacker.id = 681; log(a); }
    attacker.protectChain = (attacker.protectChain || 0) + 1;
    if (!chance(100 / (3 ** (attacker.protectChain - 1)))) {
      delete attacker.protectChain;
      return {failed:true};
    }
    attacker.protect = true;
    return {};
  }
  if (move.effect === "boost") {
    for (const [stat,value] of Object.entries(move.stats)) boost(attacker,stat,value,a,log);
    return {};
  }
  if (move.effect === "heal") {
    if (attacker.hp === attacker.maxHp) return {failed:true};
    heal(attacker,fraction(attacker,2));
    return {};
  }
  if (move.effect === "weather") {
    const before = battle.weather;
    setField(battle,"weather",move.weather,5,fieldNames[move.weather],name=>log(name,true));
    return {failed:before === battle.weather};
  }
  const types = auctionBattleTypes(target,catalog(target.id),battle,b,field);
  if (a === "prankster" && types.includes("dark") || b === "good-as-gold" || target.protect ||
      b === "soundproof" && move.flags.includes("sound") ||
      auctionDuelPriority(attacker,move) > 0 && (field.terrain === "psychic" && grounded(types,b) ||
      ["dazzling","queenly-majesty","armor-tail"].includes(b)) ||
      move.ailment === "paralysis" && (!typeFactor(move,types,a,field,factors) || applyImmunity(target,move,b,log))) {
    if (b === "good-as-gold" || b === "soundproof") log(b);
    return {failed:true};
  }
  const fromTypes = auctionBattleTypes(attacker,catalog(attacker.id),battle,a,field);
  const reflected = b === "magic-bounce";
  if (reflected) log(b);
  if (!chance(move.ailment === "toxic" && fromTypes.includes("poison") ? 100 : move.accuracy)) return {missed:true};
  const [unit,id,unitTypes,source,sourceId] = reflected ? [attacker,a,fromTypes,target,b] : [target,b,types,attacker,a];
  if (move.effect === "lower") {
    for (const [stat,value] of Object.entries(move.stats)) boost(unit,stat,value,id,log,{unit:source,id:sourceId});
    return {};
  }
  const applied = status(unit,move.ailment,unitTypes,id,sourceId,field,log);
  if (applied) checkHeldBerry(unit,id,sourceId,log);
  return {failed:!applied};
}

function hitCount(move, id, chance) {
  if (id === "parental-bond" && move.maxHits === 1) return 2;
  if (id === "skill-link") return move.maxHits;
  if (move.maxHits - move.minHits === 3) return move.minHits + (chance(70) ? Number(chance(50)) : chance(50) ? 2 : 3);
  if (move.maxHits > move.minHits && chance(50)) return move.maxHits;
  return move.minHits;
}

export function resolveAuctionAbilityAttack({attacker,target,battle,getMove,catalog,factors,preview,targetUid}) {
  const events = new Set();
  const log = combatLog(events);
  const rounds = battle.duel ? 1 : battle.order?.length || 2;
  const targetEntering = battle.duel ? !target.activeTurns : !target.entered;
  let [a,b] = effectiveAbilities(attacker,target);
  // A Pokémon enters the first time it is chosen to attack or defend.
  onEntry(target,attacker,catalog(attacker.id),b,a,battle,log,rounds);
  [a,b] = effectiveAbilities(attacker,target);
  onEntry(attacker,target,catalog(target.id),a,b,battle,log,rounds);
  [a,b] = effectiveAbilities(attacker,target);
  let from = catalog(attacker.id), to = catalog(target.id);
  const move = getMove(attacker);
  let visualType = move.type;
  const field = readField(battle,a,b);
  if (a === "mega-sol" || b === "mega-sol") { field.sun = true; field.rain = false; log("mega-sol"); }
  const bypass = disablesDefense.includes(a) || piercingMoves.includes(move.key);
  const defenseAbility = bypass && abilityFlag(b,"breakable") ? "" : b;
  let seed = (Math.imul(battle.turn,1597334677) ^ Math.imul(attacker.id,919627) ^ Math.imul(target.id,383167)) >>> 0;
  // Firebase can retry the same turn. Reuse the same chances on each retry.
  const chance = percent => {
    if (percent >= 100) return true;
    if (percent <= 0 || preview) return false;
    seed = (Math.imul(seed,1664525) + 1013904223) >>> 0;
    return seed / 4294967296 * 100 < percent;
  };
  const finish = (damage,factor,extra = {}) => {
    if (!preview && !battle.duel) afterAction(attacker,target,a,b,battle,catalog,chance,log);
    return {damage,factor,name:move.name,moveType:visualType,moveCategory:move.kind,moveEffect:move.effect || "",abilityEvents:[...events],...extra};
  };
  if (a === "neutralizing-gas" || b === "neutralizing-gas") log("neutralizing-gas");
  if (move.effect !== "protect") delete attacker.protectChain;
  if (!canMove(attacker,a,move,field,chance,log)) { delete attacker.protectChain; return finish(0,1,{skipped:true}); }
  if (attacker.disabledMove === move.slot && attacker.disabledUntil >= attacker.actions) {
    log("cursed-body");
    return finish(0,1,{skipped:true,disabled:true});
  }
  if (move.kind === "status") {
    return finish(0,1,{tactical:true,...tacticalEffect({attacker,target,move,a,b:defenseAbility,battle,field,catalog,log,chance,factors})});
  }
  if (target.protect && !(["unseen-fist","piercing-drill"].includes(a) && move.flags.includes("contact"))) {
    log("Protect",true);
    return finish(0,0,{blocked:true});
  }
  if (!move.power) return finish(0,1,{copies:true});
  if (a === "stance-change" && attacker.id === 681) {
    attacker.id = bladeAegislash;
    from = catalog(attacker.id);
    log(a);
  }
  if (b === "ice-face" && target.id === noiceEiscue && field.weather === "snow" && target.iceWeather !== battle.weather.end) {
    target.id = 875;
    target.busted = false;
    to = catalog(target.id);
    log(b);
  }
  const attack = adjustedMove(move,attacker,a,log);
  visualType = attack.type;
  const fromTypes = auctionBattleTypes(attacker,from,battle,a,field);
  const toTypes = auctionBattleTypes(target,to,battle,defenseAbility,field);
  let factor = typeFactor(attack,toTypes,a,field,factors);
  const charge = attacker.charged && attack.type === "electric";
  if (field.weather === "harshSun" && attack.type === "water" || field.weather === "heavyRain" && attack.type === "fire") {
    log(fieldNames[field.weather],true);
    return finish(0,0);
  }
  if (attack.priority > 0 && (field.terrain === "psychic" && grounded(toTypes,defenseAbility) ||
      ["queenly-majesty","dazzling","armor-tail"].includes(defenseAbility))) {
    log(field.terrain === "psychic" ? fieldNames.psychic : auctionAbilityName(defenseAbility),true);
    return finish(0,0);
  }
  if (!factor) return finish(0,0);
  if (bypass && b && !defenseAbility) log(a);
  if (defenseAbility === "wonder-guard" && factor <= 1) { log(defenseAbility); return finish(0,0); }
  if (applyImmunity(target,attack,defenseAbility,log)) return finish(0,0);
  if (defenseAbility === "tera-shell" && target.hp === target.maxHp) { factor = .5; log(b); }
  const evasion = defenseAbility === "sand-veil" && field.weather === "sand" ||
    defenseAbility === "snow-cloak" && field.weather === "snow";
  const evasionStage = ["keen-eye","minds-eye","illuminate"].includes(a) ? 0 : stage(target,"evasion");
  const aim = Math.max(-6,Math.min(6,stage(attacker,"accuracy") - evasionStage));
  const aimFactor = aim < 0 ? 3/(3-aim) : (3+aim)/3;
  const accuracy = attack.accuracy * aimFactor * (a === "compound-eyes" ? 1.3 : a === "victory-star" ? 1.1 : 1) *
    (a === "hustle" && attack.kind === "physical" ? .8 : 1) * (defenseAbility === "tangled-feet" && target.confusion ? .5 : evasion ? .8 : 1);
  if (!preview && ![a,defenseAbility].includes("no-guard") && !chance(accuracy)) return finish(0,factor,{missed:true});
  const critStage = attack.crit + Number(a === "super-luck");
  const critChance = a === "merciless" && ["poison","toxic"].includes(target.condition) ? 100 : [100/24,12.5,50,100][Math.min(3,critStage)];
  const critical = !["battle-armor","shell-armor"].includes(defenseAbility) && chance(critChance);
  let [offense,defense] = damageStats(attacker,target,from,to,toTypes,attack,a,defenseAbility,field,log,battle.duel,battle.duel && critical);
  if (a === "stakeout" && targetEntering) { offense *= 2; log(a); }
  const stab = fromTypes.includes(attack.type) ? a === "adaptability" ? (battle.duel ? 2 : 1.6) : (battle.duel ? 1.5 : 1.2) : 1;
  if (a === "adaptability" && stab > 1) log(a);
  const burn = attack.kind === "physical" && attacker.condition === "burn" && a !== "guts" && attack.key !== "facade" ? .5 : 1;
  if (critical && ["merciless","sniper","super-luck"].includes(a)) log(a);
  const crit = critical ? (a === "sniper" ? 2.25 : 1.5) : 1;
  let multiplier = powerFactor(attacker,target,attack,a,defenseAbility,field,fromTypes,toTypes,factor,battle.teams?.[battle.activeUid] || [],log);
  if (a === "analytic" && battle.roundActed?.includes(targetUid)) { multiplier *= 1.3; log(a); }
  if (charge) delete attacker.charged;
  const base = battle.duel ? Math.floor(Math.floor(22 * attack.power * offense / defense) / 50) + 2 :
    13 + Math.min(165,attack.power) * (offense + 24) / (defense + 54) * .45;
  const randomFactor = battle.duel ? (preview ? .925 : (85 + Math.floor(duelRoll(battle.turn,attacker.id,target.id,891) * 16)) / 100) : 1;
  const damageBase = base * randomFactor * stab * burn * crit * factor * multiplier;
  const hits = preview && !["parental-bond","skill-link"].includes(a) ? attack.minHits : hitCount(attack,a,chance);
  if (hits > 1 && ["parental-bond","skill-link"].includes(a)) log(a);
  const hitContext = {attacker,target,move:attack,a,b:defenseAbility,fromTypes,toTypes,field,log,chance,battle,rounds,catalog,critical};
  let damage = 0;
  for (let n = 0; n < hits && attacker.hp && target.hp; n++) {
    const before = target.hp;
    let power = damageBase * (n && a === "parental-bond" && attack.maxHits === 1 ? .25 : 1);
    if (["multiscale","shadow-shield"].includes(defenseAbility) && before === target.maxHp) { power *= .5; log(b); }
    let hit = Math.max(1,battle.duel ? Math.floor(power) : Math.round(power));
    if (defenseAbility === "disguise" && !target.busted) {
      target.busted = true;
      hurt(target,fraction(target,8));
      log(b);
      continue;
    }
    const snow = field.weather === "snow" ? battle.weather.end : 0;
    if (defenseAbility === "ice-face" && attack.kind === "physical" && (!target.busted || snow && target.iceWeather !== snow)) {
      target.busted = true;
      target.iceWeather = snow;
      if (target.id === 875) target.id = noiceEiscue;
      log(b);
      continue;
    }
    if (defenseAbility === "sturdy" && before === target.maxHp && hit >= before) { hit = before - 1; log(b); }
    if (heldItem(target,b) === "focus-sash" && before === target.maxHp && hit >= before) {
      hit = before - 1;
      consumeItem(target,b,log);
    }
    const dealt = Math.min(hit,before);
    damage += dealt;
    hurt(target,dealt);
    if (dealt) onHit(hitContext,dealt,before);
    checkHeldBerry(target,b,a,log);
    checkHeldBerry(attacker,a,target.hp ? b : "",log);
  }
  if (move.key === "struggle" && damage) hurt(attacker,fraction(attacker,4));
  return finish(damage,factor,{...(critical ? {critical:true} : {}),...(move.effect === "pivot" ? {pivot:true} : {})});
}
