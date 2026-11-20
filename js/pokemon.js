import { pokemonDex } from "./pokemonData.js?v=20260804-2";
import { avatarHtml, escapeHtml, icon, resultPlayerMiniHtml } from "./utils.js?v=20260903-7";
import { hasGamePass } from "./gamePasses.js?v=20260901-13";
import { serverNow } from "./firebase.js?v=20261119-15";
import { patchRoomView } from "./roomViewPatch.js?v=20261119-15";
import { auctionBattlePhases, auctionBattlePokemon, auctionBattleTimeout, prepareAuctionBattle } from "./pokemonAuctionBattle.js?v=20261120-5";
import { renderAuctionBattle } from "./pokemonAuctionBattleView.js?v=20261120-7";

export const pokemonTypes = ["normal", "fire", "water", "grass", "electric", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"];
const typeNames = { normal:"Normal", fire:"Fire", water:"Water", grass:"Grass", electric:"Electric", ice:"Ice", fighting:"Fighting", poison:"Poison", ground:"Ground", flying:"Flying", psychic:"Psychic", bug:"Bug", rock:"Rock", ghost:"Ghost", dragon:"Dragon", dark:"Dark", steel:"Steel", fairy:"Fairy" };
const typeSymbols = { normal:"○", fire:"♨", water:"◈", grass:"✿", electric:"ϟ", ice:"❄", fighting:"✦", poison:"☠", ground:"⌁", flying:"⌁", psychic:"◉", bug:"✣", rock:"⬟", ghost:"◌", dragon:"♢", dark:"☾", steel:"⬢", fairy:"✧" };
const clean = value => String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
const byId = new Map(pokemonDex.map(item => [item.id, item]));
const byName = new Map(pokemonDex.map(item => [clean(item.name), item]));
const randomItem = list => list[Math.floor(Math.random() * list.length)];
const filteredDex = settings => pokemonDex.filter(item => {
  const generations = Array.isArray(settings?.generations) && settings.generations.length ? settings.generations : [1,2,3,4,5,6,7,8,9];
  return generations.includes(item.generation) && (!settings?.strongOnly || item.bst >= 500) && (settings?.legendaries !== false || !item.legendary) && (settings?.mythicals !== false || !item.mythical);
});
const scoreMap = players => Object.fromEntries(players.map(uid => [uid, 0]));
const phaseEnd = seconds => Date.now() + Math.max(3, Number(seconds) || 15) * 1000;
const auctionBidMs = 7000;
const auctionRevealMs = 1250;
const auctionEnd = () => serverNow() + auctionBidMs;
const pokemonNow = game => ["pokemon-auction","pokemon-type-draw"].includes(game.mode) ? serverNow() : Date.now();
const pokemon = text => { const key = clean(text); return byName.get(key) || pokemonDex.find(item => clean(item.name).startsWith(key)); };
const label = item => item ? `${item.name} (#${item.id})` : "Nieznany Pokémon";

export const pokemonDefaults = {
  "pokemon-dex": { generations:[1,2,3,4,5,6,7,8,9], answerTime:15, rounds:5 },
  "pokemon-last-letter": { generations:[1,2,3,4,5,6,7,8,9], answerTime:15, hearts:3 },
  "pokemon-evolution": { generations:[1,2,3,4,5,6,7,8,9], answerTime:15, difficulty:"any", evolutionMode:"both", rounds:5 },
  "pokemon-auction": { generations:[1,2,3,4,5,6,7,8,9], budget:50, teamSize:6, strongOnly:false, legendaries:true, mythicals:true, battleAfterAuction:false },
  "pokemon-types": { generations:[1,2,3,4,5,6,7,8,9], selectTime:10, answerTime:15, rounds:5 },
  "pokemon-type-draw": { generations:[1,2,3,4,5,6,7,8,9], typeCount:0, answerTime:15, rounds:5 },
  "pokemon-match-type": { generations:[1,2,3,4,5,6,7,8,9], answerTime:15, hearts:3 },
};

export function pokemonCandidates(settings) { return filteredDex(settings).filter(item => item.id <= 1025); }
export function typeRaceCandidates(types, settings) {
  return types?.length ? pokemonCandidates(settings).filter(item => types.every(type => item.types.includes(type))) : [];
}

function startTypeRaceRound(game, players, settings) {
  const combinations = new Map();
  for (const item of pokemonCandidates(settings)) {
    for (const type of item.types) combinations.set(type, [type]);
    if (item.types.length === 2) {
      const pair = [...item.types].sort();
      combinations.set(pair.join("+"), pair);
    }
  }
  const count = [1,2].includes(Number(settings.typeCount)) ? Number(settings.typeCount) : (Math.random() < .5 ? 1 : 2);
  const preferred = [...combinations].filter(([,types]) => types.length === count);
  const pool = preferred.length || count === 1 ? preferred : [...combinations];
  const previous = game.usedTypeKeys || [];
  const available = pool.filter(([key]) => !previous.includes(key));
  const pick = randomItem(available.length ? available : pool);
  if (!pick) {
    finishTypeRace(game, players, settings);
    game.finished = true;
    return;
  }
  const [key, types] = pick;
  Object.assign(game, {
    phase:"type-draw", phaseEndsAt:serverNow() + 1800, drawnTypes:types,
    usedTypeKeys:[...(available.length ? previous : []),key], raceWinner:"", raceAnswerId:0, raceBotMisses:[],
  });
}

function finishTypeRace(game, players, settings, winner = "", item = null) {
  if (winner) {
    game.scores ||= scoreMap(players);
    game.scores[winner] = (Number(game.scores[winner]) || 0) + 1;
  }
  game.raceWinner = winner;
  game.raceAnswerId = (item || randomItem(typeRaceCandidates(game.drawnTypes, settings)))?.id || 0;
  game.phase = "result";
  game.phaseEndsAt = 0;
  game.finished = game.round >= (Number(settings.rounds) || 5);
}
function pickEvolutionBase(settings) {
  const pool = pokemonCandidates(settings);
  const valid = pool.filter(base => pool.some(item => item.id !== base.id && item.evolutionChain === base.evolutionChain));
  return randomItem(valid.length ? valid : pool);
}
function pickTarget(settings, used = []) { const source = settings?.evolutionMode ? pokemonCandidates(settings).filter(base => pokemonCandidates(settings).some(item => item.id !== base.id && item.evolutionChain === base.evolutionChain)) : pokemonCandidates(settings); const pool = source.filter(item => !used.includes(item.id)); return randomItem(pool.length ? pool : source); }
function lastLetterActive(game) { return (game.order || []).filter(uid => !(game.eliminated || []).includes(uid)); }
function advanceLastLetter(game, settings) {
  const active = lastLetterActive(game);
  if (active.length <= 1) { game.phase = "result"; game.finished = true; game.winner = active[0] || ""; return; }
  let index = Number(game.turnIndex) || 0;
  for (let step = 0; step < (game.order || []).length; step += 1) {
    index = (index + 1) % game.order.length;
    if (!game.eliminated.includes(game.order[index])) { game.turnIndex = index; game.phaseEndsAt = phaseEnd(settings.answerTime); return; }
  }
  game.phase = "result"; game.finished = true;
}
function loseLastLetterHeart(game, uid, settings) {
  game.hearts = game.hearts && typeof game.hearts === "object" && !Array.isArray(game.hearts) ? game.hearts : {};
  game.eliminated = Array.isArray(game.eliminated) ? game.eliminated : [];
  game.hearts[uid] = Math.max(0, Number(game.hearts[uid] ?? settings.hearts ?? 3) - 1);
  if (game.hearts[uid] === 0 && !game.eliminated.includes(uid)) game.eliminated.push(uid);
  advanceLastLetter(game, settings);
}

export function createPokemonGame(mode, players, settings) {
  const scores = scoreMap(players);
  const extras = { passUses:{}, scoutHints:{} };
  if (mode === "pokemon-type-draw") {
    const game = {mode, round:1, scores, ...extras};
    startTypeRaceRound(game, players, settings);
    return game;
  }
  if (mode === "pokemon-dex") return { mode, phase:"answers", round:1, scores, target:pickTarget(settings).id, answers:{}, phaseEndsAt:phaseEnd(settings.answerTime), usedTargets:[], ...extras };
  if (mode === "pokemon-last-letter") { const hearts=Math.max(1,Math.min(5,Number(settings.hearts)||3)); return { mode, phase:"chain", round:1, scores, order:[...players], turnIndex:0, chain:[], chainAuthors:[], usedIds:[], hearts:Object.fromEntries(players.map(uid=>[uid,hearts])), eliminated:[], phaseEndsAt:phaseEnd(settings.answerTime), ...extras }; }
  if (mode === "pokemon-evolution") { const base = pickEvolutionBase(settings); return { mode, phase:"answers", round:1, scores, baseId:base.id, answers:{}, phaseEndsAt:phaseEnd(settings.answerTime), usedTargets:[], ...extras }; }
  if (mode === "pokemon-auction") {
    const teamSize = Math.max(2, Math.min(10, Math.floor(Number(settings.teamSize) || 6)));
    const budget = Math.max(10, Math.min(500, Math.floor(Number(settings.budget) || 50)));
    const pool = pokemonCandidates(settings);
    const count = Math.min(pool.length, teamSize * players.length);
    // Partial Fisher–Yates gives every eligible Pokémon the same chance.
    for (let index = 0; index < count; index++) {
      const other = index + Math.floor(Math.random() * (pool.length - index));
      [pool[index], pool[other]] = [pool[other], pool[index]];
    }
    const game = {
      mode, phase: "auction", round: 1, scores, teamSize, battleAfterAuction:settings.battleAfterAuction===true,
      items: pool.slice(0, count).map(item => item.id), auctionIndex: 0,
      budgets: Object.fromEntries(players.map(uid => [uid, budget])),
      teams: Object.fromEntries(players.map(uid => [uid, []])),
      purchases: Object.fromEntries(players.map(uid => [uid, []])),
      currentBid: 0, highestBidder: "", passed: [], phaseEndsAt: auctionEnd(), ...extras,
    };
    if (!count) finishAuction(game, players);
    return game;
  }
  if (mode === "pokemon-match-type") { const hearts=Math.max(1,Math.min(5,Number(settings.hearts)||3)); return { mode, phase:"answers", round:1, scores, target:pickTarget(settings).id, answers:{}, hearts:Object.fromEntries(players.map(uid=>[uid,hearts])), eliminated:[], phaseEndsAt:phaseEnd(settings.answerTime), ...extras }; }
  return { mode:"pokemon-types", phase:"choose", round:1, scores, selectedTypes:{}, blockedPairs:[], answers:{}, phaseEndsAt:phaseEnd(settings.selectTime), ...extras };
}

function finishDex(game, players, settings = {}) {
  game.answers = game.answers && typeof game.answers === "object" && !Array.isArray(game.answers) ? game.answers : {};
  const target = pokemonDex.find(item => item.id === game.target);
  if (!target) { game.ranking = players.map(uid => ({ uid, answer:game.answers[uid] || null, difference:Infinity })); game.phase = "result"; game.finished = true; return; }
  const ranking = players.map(uid => ({ uid, answer:game.answers[uid] || null, difference:game.answers[uid] ? Math.abs(game.answers[uid].id - target.id) : Infinity })).sort((a,b) => a.difference - b.difference);
  ranking.forEach((row, index) => { if (Number.isFinite(row.difference)) game.scores[row.uid] += Math.max(1, players.length - index); });
  game.ranking = ranking; game.phase = "result"; game.finished = Number(game.round) >= Math.max(1, Number(settings.rounds) || 5);
}
function finishEvolution(game, players, settings = {}) {
  game.answers = game.answers && typeof game.answers === "object" && !Array.isArray(game.answers) ? game.answers : {};
  const base = pokemonDex.find(item => item.id === game.baseId);
  const chain = pokemonDex.filter(item => item.evolutionChain === base?.evolutionChain).sort((a,b) => a.id - b.id);
  const baseIndex = chain.findIndex(item => item.id === base?.id);
  const ranking = players.map(uid => { const answers = Array.isArray(game.answers[uid]) ? game.answers[uid] : game.answers[uid] ? [game.answers[uid]] : []; const valid = answers.filter((item,index,array) => item && item.id !== base?.id && array.findIndex(other => other?.id === item.id) === index && item.evolutionChain === base?.evolutionChain && (settings.evolutionMode !== "later" || chain.indexOf(item) > baseIndex)); return { uid, answer:answers, correct:valid.length > 0, points:valid.length }; });
  ranking.forEach(row => { game.scores[row.uid] += row.points; });
  game.ranking = ranking; game.phase = "result"; game.finished = Number(game.round) >= Math.max(1, Number(settings.rounds) || 5);
}
function finishTypes(game, players, settings = {}) {
  game.scores = game.scores && typeof game.scores === "object" && !Array.isArray(game.scores) ? game.scores : scoreMap(players);
  game.answers = game.answers && typeof game.answers === "object" && !Array.isArray(game.answers) ? game.answers : {};
  game.selectedTypes = game.selectedTypes && typeof game.selectedTypes === "object" && !Array.isArray(game.selectedTypes) ? game.selectedTypes : {};
  const picked = Object.values(game.selectedTypes);
  const ranking = players.map(uid => ({ uid, answer:game.answers[uid] || null, correct:Boolean(game.answers[uid] && picked.every(type => game.answers[uid].types.includes(type))) }));
  const winner = ranking.find(row => row.correct); if (winner) game.scores[winner.uid] += 1;
  game.ranking = ranking; game.phase = "result"; game.finished = Number(game.round) >= Math.max(1, Number(settings.rounds) || 5);
}
export function canStartPokemonAuction(settings) {
  return pokemonCandidates(settings).length > 0;
}

function auctionPassed(game, uid) {
  return Array.isArray(game.passed) && game.passed.includes(uid);
}

function auctionHasSlot(game, uid) {
  return (game.teams?.[uid]?.length || 0) < Number(game.teamSize || 6);
}

export function repairPokemonAuctionClock(game) {
  if (!["auction", "auction-reveal"].includes(game.phase)) return false;
  const now = serverNow(), deadline = Number(game.phaseEndsAt);
  if (Number.isFinite(deadline) && deadline > 0 && deadline <= now + 20_000) return false;
  game.phaseEndsAt = now + (game.phase === "auction" ? auctionBidMs : auctionRevealMs);
  return true;
}

export function pokemonAuctionCanBid(game, uid) {
  return game.phase === "auction" && uid !== game.highestBidder && !auctionPassed(game, uid)
    && auctionHasSlot(game, uid) && Number(game.budgets?.[uid] || 0) >= Math.floor(Number(game.currentBid || 0)) + 1;
}

function auctionLeader(game, players) {
  const uid = game.highestBidder;
  const price = Number(game.currentBid);
  return uid && players.includes(uid) && auctionHasSlot(game, uid)
    && Number.isFinite(price) && price > 0 && Number(game.budgets?.[uid]) >= price ? uid : "";
}

function finishAuction(game, players) {
  if (game.battleAfterAuction && prepareAuctionBattle(game, players, serverNow())) return;
  game.ranking = players.map(uid => {
    const team = game.teams?.[uid] || [];
    const bst = team.reduce((sum, id) => sum + (byId.get(id)?.bst || 0), 0);
    return { uid, bst, team };
  }).sort((a, b) => b.bst - a.bst);
  const best = game.ranking[0]?.bst || 0;
  game.winners = game.ranking.filter(row => best > 0 && row.bst === best).map(row => row.uid);
  game.scores = scoreMap(players);
  for (const uid of game.winners) game.scores[uid] = 3;
  game.phase = "result";
  game.phaseEndsAt = 0;
  game.finished = true;
}

function settleAuction(game, players) {
  const item = byId.get(game.items?.[game.auctionIndex]);
  const winner = item ? auctionLeader(game, players) : "";
  const price = winner ? Number(game.currentBid) : 0;
  if (winner) {
    game.budgets[winner] -= price;
    game.teams ||= {};
    game.purchases ||= {};
    game.teams[winner] = [...(game.teams[winner] || []), item.id];
    game.purchases[winner] = [...(game.purchases[winner] || []), { id: item.id, price }];
  }
  game.auctionResult = { itemId: item?.id || 0, winner, price };
  game.phase = "auction-reveal";
  game.phaseEndsAt = serverNow() + auctionRevealMs;
}

function advanceAuction(game, players) {
  game.auctionIndex = Number(game.auctionIndex || 0) + 1;
  if (game.auctionIndex >= (game.items?.length || 0) ||
      !players.some(uid => auctionHasSlot(game, uid) && Number(game.budgets?.[uid] || 0) >= 1)) {
    finishAuction(game, players);
    return;
  }
  game.round = game.auctionIndex + 1;
  game.currentBid = 0;
  game.highestBidder = "";
  game.passed = [];
  game.auctionResult = null;
  game.phase = "auction";
  game.phaseEndsAt = auctionEnd();
}

function checkAuctionSettlement(game, players) {
  if (!players.some(uid => pokemonAuctionCanBid(game, uid))) settleAuction(game, players);
}

function auctionActionError(game, uid, players) {
  if (game.mode !== "pokemon-auction" || game.phase !== "auction" || serverNow() >= Number(game.phaseEndsAt)) return "Oferty w tej aukcji są już zamknięte.";
  if (!players.includes(uid)) return "Nie ma cię w tej aukcji.";
  // A player may leave while their offer is leading. Release the price floor.
  if (game.highestBidder && !auctionLeader(game, players)) {
    game.highestBidder = "";
    game.currentBid = 0;
  }
  if (uid === game.highestBidder) return "Twoja oferta już prowadzi.";
  if (auctionPassed(game, uid)) return "Już spasowałeś w tej aukcji.";
  if (!auctionHasSlot(game, uid)) return "Twój team jest już pełny.";
  if (!pokemonAuctionCanBid(game, uid)) return "Budżet nie wystarcza na przebicie oferty.";
}

function finishMatchTypeRound(game, players, settings) {
  game.answers = game.answers && typeof game.answers === "object" && !Array.isArray(game.answers) ? game.answers : {};
  game.eliminated = Array.isArray(game.eliminated) ? game.eliminated : [];
  const target = pokemonDex.find(item => item.id === game.target), active = players.filter(uid => !game.eliminated.includes(uid));
  const correctTypes = [...(target?.types || [])].sort();
  const ranking = players.map(uid => { const answer = Array.isArray(game.answers[uid]) ? [...game.answers[uid]].sort() : []; return { uid, answer, correct:answer.join("+") === correctTypes.join("+") }; });
  game.ranking = ranking;
  const winner = ranking.find(row => row.correct && active.includes(row.uid));
  if (winner) { game.scores[winner.uid] = (Number(game.scores[winner.uid]) || 0) + 1; game.winner = winner.uid; }
  else if (active.length <= 1) game.winner = active[0] || "";
  game.phase = "result";
  game.finished = players.filter(uid => !game.eliminated.includes(uid)).length <= 1;
}
function loseMatchTypeHeart(game, uid, settings) {
  game.hearts = game.hearts && typeof game.hearts === "object" && !Array.isArray(game.hearts) ? game.hearts : {};
  game.eliminated = Array.isArray(game.eliminated) ? game.eliminated : [];
  game.hearts[uid] = Math.max(0, Number(game.hearts[uid] ?? settings.hearts ?? 3) - 1);
  if (game.hearts[uid] === 0 && !game.eliminated.includes(uid)) game.eliminated.push(uid);
}

export const PokemonEngine = {
  useScout(game, uid, players = [], settings = {}) {
    if (game.phase === "result") return "Ta runda jest już zakończona.";
    game.passUses ||= {};
    if (game.passUses[uid]?.["pokemon-scout"] === Number(game.round || 1)) return "Skaner został już użyty w tej rundzie.";
    let text = "";
    if (game.mode === "pokemon-dex") {
      const target = pokemonDex.find(item => item.id === game.target);
      text = target ? `Cel pochodzi z generacji ${target.generation}.` : "Cel jest w wybranej puli Pokémonów.";
    } else if (game.mode === "pokemon-evolution") {
      const base = pokemonDex.find(item => item.id === game.baseId);
      const sibling = pokemonDex.find(item => item.evolutionChain === base?.evolutionChain && item.id !== base?.id);
      text = sibling ? `W tej linii występuje też ${sibling.name}.` : "Cel ma co najmniej jedną powiązaną ewolucję.";
    } else if (game.mode === "pokemon-match-type") {
      const target = pokemonDex.find(item => item.id === game.target);
      text = target?.types?.length ? `Ten Pokémon ma ${target.types.length} typ${target.types.length === 1 ? "" : "y"}.` : "Sprawdź dokładnie wszystkie typy celu.";
    } else if (game.mode === "pokemon-types") {
      const selected = Object.values(game.selectedTypes || {});
      text = selected.length ? `Wspólny Pokémon musi mieć typ: ${selected[0]}.` : "Wybierz typ przed skanowaniem celu.";
    } else if (game.mode === "pokemon-type-draw") {
      if (game.phase !== "type-race") return "Poczekaj na wylosowanie typów.";
      const sample = typeRaceCandidates(game.drawnTypes, settings)[0];
      if (sample) text = `Jeden z pasujących Pokémonów zaczyna się na ${sample.name[0].toUpperCase()}.`;
    } else if (game.mode === "pokemon-last-letter") {
      const previous = game.chain?.at(-1), required = previous ? clean(previous.name).slice(-1).toUpperCase() : "DOWOLNA";
      text = required === "DOWOLNA" ? "Pierwsza odpowiedź może zaczynać się dowolną literą." : `Następna nazwa zaczyna się na literę ${required}.`;
    } else if (game.mode === "pokemon-auction") {
      const target = pokemonDex.find(item => item.id === game.items?.[game.auctionIndex]);
      text = target ? `Cel ma ${target.types?.length || 1} typ${target.types?.length === 1 ? "" : "y"} i pochodzi z generacji ${target.generation}.` : "Sprawdź aktualnie licytowanego Pokémona.";
    }
    if (!text) return "Skaner nie ma jeszcze bezpiecznej wskazówki.";
    game.scoutHints ||= {};
    game.scoutHints[uid] = { round:Number(game.round || 1), text };
    game.passUses[uid] = { ...(game.passUses[uid] || {}), "pokemon-scout":Number(game.round || 1) };
    return null;
  },
  matchType(game, uid, types, players, settings) {
    if (game.mode !== "pokemon-match-type" || game.phase !== "answers") return "Ta runda jest już zakończona.";
    game.answers = game.answers && typeof game.answers === "object" && !Array.isArray(game.answers) ? game.answers : {};
    game.eliminated = Array.isArray(game.eliminated) ? game.eliminated : [];
    if (game.eliminated.includes(uid) || game.answers[uid]) return "Odpowiedź została już wysłana.";
    const selected = [...new Set((Array.isArray(types) ? types : []).filter(type => pokemonTypes.includes(type)))].sort();
    game.answers[uid] = selected;
    const target = pokemonDex.find(item => item.id === game.target), correct = selected.join("+") === [...(target?.types || [])].sort().join("+");
    if (correct) { game.scores[uid] = (Number(game.scores[uid]) || 0) + 1; game.winner = uid; game.ranking = players.map(player => ({ uid:player, answer:game.answers[player] || [], correct:player === uid })); game.phase = "result"; game.finished = players.filter(player => !game.eliminated.includes(player)).length <= 1; return; }
    loseMatchTypeHeart(game, uid, settings);
    const active = players.filter(player => !game.eliminated.includes(player));
    if (Object.keys(game.answers).filter(player => active.includes(player)).length >= active.length || active.length <= 1) finishMatchTypeRound(game, players, settings);
  },
  answer(game, uid, text, players, settings) {
    if (game.mode === "pokemon-type-draw") {
      if (game.phase !== "type-race" || serverNow() >= Number(game.phaseEndsAt)) return "Czas na odpowiedź już minął.";
      if (!players.includes(uid)) return "Nie bierzesz udziału w tej rundzie.";
      const key = clean(text);
      const item = typeRaceCandidates(game.drawnTypes, settings).find(candidate =>
        clean(candidate.name) === key || clean(pokemonDisplayName(candidate)) === key);
      if (!item) return "Ten Pokémon nie pasuje do losowania. Spróbuj jeszcze raz.";
      finishTypeRace(game, players, settings, uid, item);
      return;
    }
    if (game.mode === "pokemon-last-letter") {
      game.order = Array.isArray(game.order) && game.order.length ? game.order : [...players];
      game.chain = Array.isArray(game.chain) ? game.chain : [];
      game.chainAuthors = Array.isArray(game.chainAuthors) ? game.chainAuthors : [];
      game.usedIds = Array.isArray(game.usedIds) ? game.usedIds : [];
      game.eliminated = Array.isArray(game.eliminated) ? game.eliminated : [];
      if (game.order[game.turnIndex] !== uid || game.eliminated.includes(uid)) return "Teraz odpowiada inny gracz.";
      const item = pokemon(text), previous = game.chain.at(-1), required = previous ? clean(previous.name).slice(-1) : "";
      const pool = pokemonCandidates(settings);
      if (!item || !pool.some(row => row.id === item.id) || game.usedIds.includes(item.id) || (required && !clean(item.name).startsWith(required))) { loseLastLetterHeart(game, uid, settings); return; }
      game.scores = game.scores && typeof game.scores === "object" && !Array.isArray(game.scores) ? game.scores : scoreMap(players);
      game.scores[uid] = Number(game.scores[uid]) || 0;
      game.chain.push(item); game.chainAuthors.push(uid); game.usedIds.push(item.id); game.scores[uid] += 1;
      advanceLastLetter(game, settings); return;
    }
    if (game.mode === "pokemon-evolution") {
      if (game.answers?.[uid]) return "Odpowiedź została już wysłana.";
      const names = Array.isArray(text) ? text : [text], items = names.filter(value => String(value || "").trim()).map(value => pokemon(value));
      if (!items.length || items.some(item => !item)) return "Wpisz poprawną nazwę Pokémona.";
      const pool = pokemonCandidates(settings), base = pokemonDex.find(item => item.id === game.baseId), chain = pokemonDex.filter(item => item.evolutionChain === base?.evolutionChain).sort((a,b) => a.id - b.id), baseIndex = chain.findIndex(item => item.id === base?.id);
      if (items.some(item => !pool.some(row => row.id === item.id))) return "Ten Pokémon nie jest dostępny w wybranych generacjach.";
      if (settings.evolutionMode === "later" && items.some(item => chain.indexOf(item) <= baseIndex)) return "W tym ustawieniu wpisuj tylko późniejsze ewolucje.";
      game.answers = game.answers && typeof game.answers === "object" && !Array.isArray(game.answers) ? game.answers : {};
      game.answers[uid] = items;
      if (Object.keys(game.answers).length >= players.length) finishEvolution(game, players, settings);
      return;
    }
    const item = pokemon(text); if (!item) return "Wpisz poprawną nazwę Pokémona.";
    game.answers = game.answers && typeof game.answers === "object" && !Array.isArray(game.answers) ? game.answers : {};
    const pool = pokemonCandidates(settings); if (!pool.some(row => row.id === item.id)) return "Ten Pokémon nie jest dostępny w wybranych generacjach.";
    if (game.mode === "pokemon-dex") { if (game.answers[uid]) return "Odpowiedź została już wysłana."; game.answers[uid] = item; if (Object.keys(game.answers).length >= players.length) finishDex(game, players, settings); return; }
    if (game.mode === "pokemon-evolution") { return "Wpisz odpowiedzi w polach ewolucji."; }
    if (game.mode === "pokemon-types") { game.scores = game.scores && typeof game.scores === "object" && !Array.isArray(game.scores) ? game.scores : scoreMap(players); game.scores[uid] = Number(game.scores[uid]) || 0; game.selectedTypes = game.selectedTypes && typeof game.selectedTypes === "object" && !Array.isArray(game.selectedTypes) ? game.selectedTypes : {}; if (game.phase !== "answer") return "Najpierw wybierzcie typy."; if (!game.answers[uid] && Object.values(game.selectedTypes).every(type => item.types.includes(type))) { game.answers[uid] = item; game.scores[uid] += 1; game.ranking = [{ uid, answer:item, correct:true }]; game.phase = "result"; game.finished = Number(game.round) >= Math.max(1, Number(settings.rounds) || 5); } return; }
    if (game.mode === "pokemon-last-letter") {
      game.chain = Array.isArray(game.chain) ? game.chain : [];
      game.usedIds = Array.isArray(game.usedIds) ? game.usedIds : [];
      if (game.order[game.turnIndex] !== uid) return "Teraz odpowiada inny gracz.";
      const previous = game.chain.at(-1); const required = previous ? clean(previous.name).slice(-1) : "";
      if (required && !clean(item.name).startsWith(required)) return `Nazwa musi zaczynać się na literę ${required.toUpperCase()}.`;
      if (game.usedIds.includes(item.id)) return "Ten Pokémon już był użyty.";
      game.chain.push(item); game.usedIds.push(item.id); game.scores[uid] += 1; game.turnIndex += 1;
      if (game.turnIndex >= game.order.length * (Number(settings.rounds) || 10)) { game.phase = "result"; game.finished = true; } else { game.turnIndex %= game.order.length; game.phaseEndsAt = phaseEnd(settings.answerTime); } return;
    }
  },
  timeout(game, uid, players, settings) {
    if (game.phase === "result") return;
    if (game.mode === "pokemon-type-draw") {
      if (serverNow() < Number(game.phaseEndsAt)) return;
      if (game.phase === "type-draw") {
        game.phase = "type-race";
        game.phaseEndsAt = serverNow() + (Number(settings.answerTime) || 15) * 1000;
      } else if (game.phase === "type-race") finishTypeRace(game, players, settings);
      return;
    }
    if (game.mode === "pokemon-dex") { finishDex(game, players, settings); return; }
    if (game.mode === "pokemon-evolution") { finishEvolution(game, players, settings); return; }
    if (game.mode === "pokemon-types") { game.selectedTypes = game.selectedTypes && typeof game.selectedTypes === "object" && !Array.isArray(game.selectedTypes) ? game.selectedTypes : {}; if (game.phase === "choose") { const available = pokemonTypes.filter(type => !Object.values(game.selectedTypes).includes(type)); players.forEach(player => { if (!game.selectedTypes[player]) game.selectedTypes[player] = randomItem(available); }); game.phase = "answer"; game.phaseEndsAt = phaseEnd(settings.answerTime); } else finishTypes(game, players, settings); return; }
    if (game.mode === "pokemon-last-letter") { const activeUid = game.order?.[game.turnIndex] || uid; if (activeUid) loseLastLetterHeart(game, activeUid, settings); }
    if (game.mode === "pokemon-match-type") { const active = players.filter(player => !game.eliminated?.includes(player)); active.forEach(player => { if (!game.answers?.[player]) { game.answers = game.answers || {}; game.answers[player] = []; loseMatchTypeHeart(game, player, settings); } }); finishMatchTypeRound(game, players, settings); }
    if (game.mode === "pokemon-auction" && serverNow() >= Number(game.phaseEndsAt)) {
      if (game.phase === "auction-reveal") advanceAuction(game, players);
      else if (game.phase === "auction") settleAuction(game, players);
      else if (auctionBattlePhases.includes(game.phase)) auctionBattleTimeout(game, players, serverNow());
    }
  },
  selectType(game, uid, type, players, settings) {
    game.scores = game.scores && typeof game.scores === "object" && !Array.isArray(game.scores) ? game.scores : scoreMap(players);
    game.selectedTypes = game.selectedTypes && typeof game.selectedTypes === "object" && !Array.isArray(game.selectedTypes) ? game.selectedTypes : {};
    game.blockedPairs = Array.isArray(game.blockedPairs) ? game.blockedPairs : [];
    if (game.phase !== "choose" || !pokemonTypes.includes(type)) return "Wybór typu jest już zamknięty.";
    if (game.selectedTypes[uid]) return "Typ został już wybrany.";
    game.selectedTypes[uid] = type;
    if (Object.keys(game.selectedTypes).length >= players.length) {
      const selected = [...new Set(Object.values(game.selectedTypes))]; const exists = pokemonCandidates(settings).some(item => selected.every(itemType => item.types.includes(itemType)));
      if (!exists) { game.blockedPairs.push(selected.join("+")); game.selectedTypes = {}; game.phaseEndsAt = phaseEnd(settings.selectTime); }
      else { game.phase = "answer"; game.phaseEndsAt = phaseEnd(settings.answerTime); }
    }
  },
  bid(game, uid, amount, players) {
    const error = auctionActionError(game, uid, players);
    if (error) return error;
    const offer = Number(amount);
    if (offer !== Number(game.currentBid || 0) + 1) {
      return "Stawka się zmieniła. Kliknij, żeby podbić aktualną ofertę o 1 monetę.";
    }
    game.currentBid = offer;
    game.highestBidder = uid;
    game.phaseEndsAt = auctionEnd();
    checkAuctionSettlement(game, players);
  },
  pass(game, uid, players) {
    const error = auctionActionError(game, uid, players);
    if (error) return error;
    game.passed = [...(Array.isArray(game.passed) ? game.passed : []), uid];
    checkAuctionSettlement(game, players);
  },
  nextRound(game, players, settings) { if (game.phase !== "result") return "Runda jeszcze się nie zakończyła."; if (game.mode === "pokemon-type-draw") { if (game.finished) return "Gra jest już zakończona."; game.round += 1; startTypeRaceRound(game, players, settings); return; } if (game.mode === "pokemon-dex") { game.round += 1; game.usedTargets = Array.isArray(game.usedTargets) ? game.usedTargets : []; game.target = pickTarget(settings, game.usedTargets).id; game.usedTargets.push(game.target); game.answers = {}; game.ranking = []; game.phase = "answers"; game.phaseEndsAt = phaseEnd(settings.answerTime); } else if (game.mode === "pokemon-evolution") { game.round += 1; game.baseId = pickTarget(settings).id; game.answers = {}; game.ranking = []; game.phase = "answers"; game.phaseEndsAt = phaseEnd(settings.answerTime); } else if (game.mode === "pokemon-types") { game.round += 1; game.selectedTypes = {}; game.answers = {}; game.ranking = []; game.phase = "choose"; game.phaseEndsAt = phaseEnd(settings.selectTime); } else if (game.mode === "pokemon-match-type") { if (players.filter(uid => !game.eliminated?.includes(uid)).length <= 1) { game.finished = true; return; } game.round += 1; game.target = pickTarget(settings).id; game.answers = {}; game.ranking = []; game.winner = ""; game.phase = "answers"; game.phaseEndsAt = phaseEnd(settings.answerTime); } else game.phase = "result"; }
};

function timerMarkup(game) { return `<div class="pokemon-timer" data-pokemon-countdown="${game.phaseEndsAt}">${Math.max(0, Math.ceil((game.phaseEndsAt - pokemonNow(game)) / 1000))}s</div>`; }

function typeChip(type) {
  if (!Object.hasOwn(typeNames, type)) return "";
  const iconUrl = new URL(`../assets/pokemon/types/${type}.svg`, import.meta.url);
  return `<span class="pokemon-picked-type pokemon-type-${type}"><img src="${iconUrl.href}" width="30" height="30" alt="" draggable="false">${typeNames[type]}</span>`;
}

function typeRaceMarkup(game, settings) {
  const drawing = game.phase === "type-draw";
  const typeSlots = game.drawnTypes.map((type, index) => {
    if (!drawing) return typeChip(type);
    const offset = (game.round * 5 + index * 7) % pokemonTypes.length;
    const strip = [...pokemonTypes.slice(offset), ...pokemonTypes.slice(0,offset), pokemonTypes[offset]];
    return `<div class="pokemon-draw-slot" aria-hidden="true"><div class="pokemon-draw-strip">${strip.map(typeChip).join("")}</div><span class="pokemon-draw-static">?</span></div>`;
  }).join("");
  return `<div class="pokemon-draw-stage ${drawing ? "is-drawing" : ""}">
    <p class="eyebrow">RUNDA ${game.round}/${settings.rounds || 5}</p>
    <h1>${drawing ? "Losowanie typów…" : game.drawnTypes.length === 2 ? "Podaj Pokémona z oboma typami" : "Podaj Pokémona z tym typem"}</h1>
    <div class="pokemon-drawn-types">${typeSlots}</div>
    ${drawing ? "" : `${timerMarkup(game)}${pokemonAnswerFormMarkup("answer")}`}
  </div>`;
}

function typeRaceResult(game, accounts, players) {
  const sorted = players.slice().sort((a,b) => Number(game.scores?.[b] || 0) - Number(game.scores?.[a] || 0));
  const best = Number(game.scores?.[sorted[0]] || 0);
  const leaders = sorted.filter(uid => best > 0 && Number(game.scores?.[uid]) === best);
  const playerName = uid => escapeHtml(accounts[uid]?.nick || "Gracz");
  const title = game.finished
    ? leaders.length === 1 ? `${playerName(leaders[0])} wygrywa` : leaders.length ? "Remis" : "Koniec gry"
    : game.raceWinner ? `${playerName(game.raceWinner)} trafia!` : "Czas minął";
  const example = byId.get(game.raceAnswerId);
  return `<section class="panel pokemon-panel center">
    <p class="eyebrow">POKÉMON · LOSOWANIE TYPÓW</p><h1>${title}</h1>
    ${example ? `<div class="pokemon-draw-answer"><p>${game.raceWinner ? "Poprawna odpowiedź" : "Przykładowa odpowiedź"}</p>${card(example)}</div>` : ""}
    <div class="pokemon-results">${sorted.map(uid => `<div class="pokemon-result-row"><b>${playerName(uid)}</b><span>${Number(game.scores?.[uid] || 0)} pkt</span></div>`).join("")}</div>
    ${game.finished ? '<button class="primary" id="pokemon-lobby">Wróć do lobby</button>' : '<button class="primary" id="pokemon-next">Następna runda</button>'}
  </section>`;
}
function auctionTeamMarkup(game, accounts, currentUser) {
  const profile = accounts[currentUser] || {};
  const team = game.teams?.[currentUser] || [];
  const purchases = game.purchases?.[currentUser] || [];
  const slots = Array.from({ length: Number(game.teamSize) || 6 }, (_, index) => {
    const item = byId.get(team[index]);
    if (!item) return '<span class="auction-slot is-empty" aria-label="Wolne miejsce">+</span>';
    const purchase = purchases.find(entry => entry.id === item.id);
    return `<div class="auction-slot">${sprite(item)}<b>${escapeHtml(pokemonDisplayName(item))}</b><small>${purchase ? `${Number(purchase.price)}$` : ""}</small></div>`;
  });
  return `<aside class="pokemon-auction-team auction-roster"><div class="pokemon-auction-team-head">${avatarHtml(profile,"pokemon-player-avatar")}<b>Twój team · ${team.length}/${game.teamSize}</b></div><div class="auction-slots">${slots.join("")}</div></aside>`;
}

function auctionOpponentsMarkup(game, accounts, players, currentUser) {
  const opponents = players.filter(uid => uid !== currentUser);
  if (!opponents.length) return "";
  return `<section class="auction-opponents" aria-label="Rywale">
    <h2>Rywale</h2>
    <ul class="auction-opponent-list">${opponents.map(uid => {
      const nick = escapeHtml(accounts[uid]?.nick || "Gracz");
      const team = (game.teams?.[uid] || []).map(id => byId.get(id)).filter(Boolean);
      const budget = Number(game.budgets?.[uid] || 0);
      return `<li class="auction-opponent">
        <div class="auction-opponent-head"><b title="${nick}">${nick}</b><strong title="Pozostały budżet">${budget}$</strong></div>
        <div class="auction-opponent-team" aria-label="Team gracza ${nick}">${team.length ? team.map(item => `<span title="${escapeHtml(pokemonDisplayName(item))}">${sprite(item)}</span>`).join("") : "<small>Pusty team</small>"}</div>
      </li>`;
    }).join("")}</ul>
  </section>`;
}

function auctionMarkup(game, accounts, currentUser, players) {
  const item = byId.get(game.items?.[game.auctionIndex]);
  const revealing = game.phase === "auction-reveal";
  const result = game.auctionResult;
  const leaderName = escapeHtml(accounts[game.highestBidder]?.nick || "Gracz");
  const leading = game.highestBidder === currentUser;
  const passed = auctionPassed(game, currentUser);
  const able = pokemonAuctionCanBid(game, currentUser);
  const price = Number(game.currentBid || 0);
  const bidFloor = price + 1;
  const budget = Number(game.budgets?.[currentUser] || 0);
  const status = leading ? "Prowadzisz" : game.highestBidder ? `${leaderName} prowadzi` : "Czekamy na pierwszą ofertę";
  const note = passed ? "Spasowałeś. Wrócisz do gry przy następnym Pokémonie."
    : !auctionHasSlot(game, currentUser) ? "Twój team jest pełny."
    : !able && !leading ? "Za mało monet, żeby przebić ofertę."
    : leading ? "Czekasz na przebicie albo pas." : "Pas dotyczy tego Pokémona.";
  const winner = result?.winner;
  const outcome = winner === currentUser ? "Pokémon dołącza do twojego teamu!" : winner ? `Kupuje ${escapeHtml(accounts[winner]?.nick || "Gracz")}` : "Nikt nie kupił tego Pokémona";
  return `<div class="pokemon-auction-layout auction-stage" data-auction-lot="${game.auctionIndex}" data-auction-item="${item?.id || 0}" data-auction-bid="${price}" data-auction-leading="${leading}">
    <div class="auction-main">
      <header class="auction-header"><div><p class="eyebrow">POKÉMON · ${game.auctionIndex + 1}/${game.items.length}</p><h1>Licytacja teamu</h1></div>${timerMarkup(game)}</header>
      <div class="auction-wallet" aria-label="Twój portfel"><span>🪙 Twój portfel</span><strong>${budget}$</strong></div>
      <div class="auction-spotlight">${item ? card(item, revealing) : "<p>Brak Pokémona do licytacji.</p>"}</div>
      <div class="auction-turn">
      ${revealing ? `<div class="auction-outcome ${winner === currentUser ? "is-mine" : ""}" role="status"><small>${winner ? "SPRZEDANO" : "BEZ OFERT"}</small><strong>${outcome}</strong>${winner ? `<span>${Number(result.price)}$</span>` : ""}</div>` : `
        <div class="auction-price ${leading ? "is-leading" : ""}" role="status"><span>${status}</span><strong>${price}$</strong></div>
        <div class="auction-controls">
          <button class="primary" data-pokemon-bid="${bidFloor}" type="button" ${able ? "" : "disabled"}>${price ? "Przebij" : "Licytuj"} · ${bidFloor}$</button>
          <button class="ghost" id="pokemon-pass" type="button" ${able ? "" : "disabled"}>Pas</button>
        </div><p class="auction-note">${note}</p>`}
      </div>
    </div>
    <div class="auction-sidebar">${auctionTeamMarkup(game, accounts, currentUser)}${auctionOpponentsMarkup(game, accounts, players, currentUser)}</div>
  </div>`;
}

function updateAuctionView(root, previousAuction, html) {
  if (!previousAuction) {
    root.innerHTML = html;
    return;
  }
  const template = root.ownerDocument.createElement("template");
  template.innerHTML = html;
  const nextAuction = template.content.querySelector("[data-auction-lot]");
  if (previousAuction.dataset.auctionLot !== nextAuction.dataset.auctionLot ||
      previousAuction.dataset.auctionItem !== nextAuction.dataset.auctionItem) {
    root.innerHTML = html;
    return;
  }
  for (const selector of [".auction-scout", ".auction-header", ".auction-wallet", ".auction-turn", ".auction-sidebar"]) {
    const current = root.querySelector(selector);
    const next = template.content.querySelector(selector);
    if (current.outerHTML !== next.outerHTML) current.replaceWith(next);
  }
  // The image stays mounted even when BST is revealed or a sprite fallback is already loaded.
  const currentBst = previousAuction.querySelector(".auction-spotlight strong");
  const nextBst = nextAuction.querySelector(".auction-spotlight strong");
  if (!currentBst && nextBst) previousAuction.querySelector(".auction-spotlight .pokemon-card > div").append(nextBst);
  if (currentBst && !nextBst) currentBst.remove();
  previousAuction.dataset.auctionBid = nextAuction.dataset.auctionBid;
  previousAuction.dataset.auctionLeading = nextAuction.dataset.auctionLeading;
}

function auctionFinalMarkup(game, accounts) {
  const winners = game.winners || (game.ranking || []).filter(row => Number(game.scores?.[row.uid]) > 0).map(row => row.uid);
  const champion = winners.length > 1 ? "Remis na szczycie" : winners.length ? `${escapeHtml(accounts[winners[0]]?.nick || "Gracz")} wygrywa` : "Bez zwycięzcy";
  const rows = (game.ranking || []).map((row, index) => {
    const won = winners.includes(row.uid);
    const team = (row.team || []).map(id => game.battle ? auctionBattlePokemon(id) : byId.get(id)).filter(Boolean).map(item => `<span>${sprite(item)}${game.battle?"":`<b>${item.bst}</b>`}</span>`);
    const score = game.battle ? `${row.remaining || 0}/${team.length} aktywnych` : `${row.bst} BST`;
    return `<article class="auction-ranking-row ${won ? "is-winner" : ""}" style="--auction-rank:${index}"><div>${resultPlayerMiniHtml(accounts[row.uid] || { nick: "Gracz" }, won ? "win" : "lose")}<strong>${score}</strong></div><div class="auction-ranking-team">${team.join("") || "<small>Pusty skład</small>"}</div></article>`;
  });
  return `<section class="panel pokemon-panel auction-final" data-auction-final><p class="eyebrow">${game.battle?"BITWA ZAKOŃCZONA":"LICYTACJA ZAKOŃCZONA"}</p><h1>${champion}</h1><div class="auction-ranking">${rows.join("")}</div><button class="primary" id="pokemon-lobby">Wróć do lobby</button></section>`;
}
function formMarkup(id, placeholder = "Nazwa Pokémona") { return `<form class="pokemon-answer-form" data-pokemon-form="${id}"><input id="pokemon-answer" autocomplete="off" placeholder="${placeholder}"><button class="primary" type="submit">Odpowiedz</button></form>`; }
function pokemonAnswerFormMarkup(id) { return `<form class="pokemon-answer-form" data-pokemon-form="${id}"><div class="pokemon-autocomplete"><input id="pokemon-answer" autocomplete="off" placeholder="Nazwa Pokémona"><div id="pokemon-suggestions" class="pokemon-suggestions"></div></div><button class="primary" type="submit">Odpowiedz</button></form>`; }
function dexFormMarkup(answer) { const answered=Boolean(answer), value=answered ? escapeHtml(pokemonDisplayName(answer)) : ""; return `<form class="pokemon-answer-form" data-pokemon-form="answer"><div class="pokemon-autocomplete"><input id="pokemon-answer" autocomplete="off" placeholder="Nazwa Pokémona" value="${value}" ${answered ? "disabled" : ""}><div id="pokemon-suggestions" class="pokemon-suggestions"></div></div><button class="primary" type="submit" ${answered ? "disabled" : ""}>${answered ? "Wysłano" : "Odpowiedz"}</button></form>`; }
function pokemonDisplayName(item) { return item?.name?.replace(/-normal$/, "") || ""; }
function evolutionFormMarkup(base, answers = []) { const chain=pokemonDex.filter(item => item.evolutionChain === base?.evolutionChain), fields=chain.length >= 3 ? 2 : 1, locked=Array.isArray(answers) && answers.length > 0, anchor=`<div class="evolution-anchor" draggable="true" data-evolution-anchor>${sprite(base,"pokemon-evolution-sprite")}<span>${escapeHtml(pokemonDisplayName(base))}</span><small>Przeciągnij między odpowiedzi</small></div>`, slot=index=>`<div class="evolution-answer-slot" data-evolution-slot="${index}"><div class="tiny">${index === 0 && fields > 1 ? "Wcześniejsza ewolucja" : index === 1 ? "Późniejsza ewolucja" : "Ewolucja"}</div><div class="pokemon-autocomplete"><input data-pokemon-evolution-input="${index}" autocomplete="off" placeholder="Nazwa Pokémona" value="${locked ? escapeHtml(pokemonDisplayName(answers[index])) : ""}" ${locked ? "disabled" : ""}><div class="pokemon-suggestions" data-pokemon-evolution-suggestions="${index}"></div></div></div>`; return `<form class="pokemon-evolution-form" data-pokemon-evolution-form><div class="evolution-race-fields">${fields === 1 ? `${anchor}${slot(0)}` : `${slot(0)}${anchor}${slot(1)}`}</div><button class="primary" type="submit" ${locked ? "disabled" : ""}>${locked ? "Wysłano" : "Zatwierdź ewolucję"}</button></form>`; }
function sprite(item, className = "") { return `<img class="${className}" src="${item.sprite}" alt="${escapeHtml(item.name)}" onerror="this.onerror=null;this.src='${item.spriteFallback}'">`; }

const pokemonSuggestionPools = new WeakMap();

function bindPokemonAnswerSuggestions(input, suggestions, pool, {tabComplete=false} = {}) {
  if (!input || !suggestions || input.disabled) return;
  const bound = pokemonSuggestionPools.has(input);
  pokemonSuggestionPools.set(input, pool);
  if (bound) return;
  let active = -1;
  const close = () => {
    active = -1;
    suggestions.replaceChildren();
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
  };
  const select = option => {
    input.value = option.dataset.pokemonSuggestion;
    close();
    input.focus();
  };
  input.setAttribute("role", "combobox");
  input.setAttribute("aria-autocomplete", "list");
  input.setAttribute("aria-controls", suggestions.id);
  input.setAttribute("aria-expanded", "false");
  suggestions.setAttribute("role", "listbox");
  suggestions.setAttribute("aria-label", "Podpowiedzi nazw Pokémonów");
  input.addEventListener("input", () => {
    close();
    const query = clean(input.value);
    if (!query) return;
    const matches = pokemonSuggestionPools.get(input).filter(item => clean(item.name).startsWith(query)).slice(0, 8);
    suggestions.innerHTML = matches.map((item, index) => {
      const name = escapeHtml(pokemonDisplayName(item));
      return `<button type="button" tabindex="-1" role="option" aria-label="${name}" aria-selected="false" id="${suggestions.id}-${index}" class="pokemon-suggestion" data-pokemon-suggestion="${name}">${sprite(item, "pokemon-suggestion-sprite")}<span>${name}</span></button>`;
    }).join("");
    input.setAttribute("aria-expanded", String(matches.length > 0));
  });
  suggestions.addEventListener("pointerdown", event => {
    if (event.target.closest("[data-pokemon-suggestion]")) event.preventDefault();
  });
  suggestions.addEventListener("click", event => {
    const option = event.target.closest("[data-pokemon-suggestion]");
    if (option) select(option);
  });
  input.addEventListener("blur", close);
  input.form?.addEventListener("submit", close);
  input.addEventListener("keydown", event => {
    const options = suggestions.children;
    if (!options.length || event.isComposing) return;
    if (event.key === "Tab" && tabComplete && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
      event.preventDefault();
      select(options[active] || options[0]);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
    if (event.key === "Enter" && active >= 0) {
      if (!tabComplete) event.preventDefault();
      select(options[active]);
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      options[active]?.setAttribute("aria-selected", "false");
      const step = event.key === "ArrowDown" ? 1 : -1;
      active = active < 0 && step < 0 ? options.length - 1 : (active + step + options.length) % options.length;
      const option = options[active];
      option.setAttribute("aria-selected", "true");
      input.setAttribute("aria-activedescendant", option.id);
      option.scrollIntoView({block:"nearest"});
    }
  });
}
function resultMarkup(game, accounts, actions, title = "Wyniki rundy") { const topPoints = Math.max(0, ...(game.ranking || []).map(row => Number(row.points) || 0)); const rows = (game.ranking || []).map(row => { const team = Array.isArray(row.team) ? `<div class="pokemon-mini-team">${row.team.map(id => { const item = pokemonDex.find(pokemon => pokemon.id === id); return item ? sprite(item) : ""; }).join("")}</div>` : ""; const answer = Array.isArray(row.answer) ? row.answer.map(item => item ? `${sprite(item,"pokemon-result-sprite")} ${escapeHtml(label(item))}` : "").join(" ") : row.answer ? `${sprite(row.answer,"pokemon-result-sprite")} ${escapeHtml(label(row.answer))}` : ""; return `<div class="pokemon-result-row"><div>${resultPlayerMiniHtml(accounts[row.uid], Number(row.points) === topPoints && topPoints > 0 ? "win" : "lose")}${team}</div><span>${answer || (row.bst != null ? `${row.bst} BST` : row.difference != null ? (Number.isFinite(row.difference) ? `różnica ${row.difference}` : "brak odpowiedzi") : row.points != null ? `${row.points} pkt` : row.correct ? "trafienie" : "-")}</span></div>`; }).join(""); const button=game.finished ? `<button class="primary" id="pokemon-lobby">Wróć do lobby</button>` : `<button class="primary" id="pokemon-next">Następna runda</button>`; return `<section class="panel pokemon-panel center"><p class="eyebrow">PODSUMOWANIE</p><h1>${title}</h1><div class="pokemon-results">${rows || "<p class=muted>Brak wyników.</p>"}</div>${game.finished ? `<p class="money-pop">To koniec gry. Nagrody zostały przyznane.</p>` : ""}${button}</section>`; }
function dexResultMarkup(game, accounts) { const target = pokemonDex.find(item => item.id === game.target); const rows = (game.ranking || []).map((row, index) => `<article class="pokemon-dex-result-row ${index === 0 ? "winner" : ""}"><div>${resultPlayerMiniHtml(accounts[row.uid], index === 0 ? "win" : "lose")}${row.answer ? `${sprite(row.answer,"pokemon-result-sprite")} ${escapeHtml(label(row.answer))}` : "Brak odpowiedzi"}</div><strong>${Number.isFinite(row.difference) ? `Różnica: ${row.difference}` : "Poza rankingiem"} · ${Number(game.scores?.[row.uid] || 0)} pkt</strong></article>`).join(""); const button=game.finished ? `<button class="primary" id="pokemon-lobby">Wróć do lobby</button>` : `<button class="primary" id="pokemon-next">Następna runda</button>`; return `<section class="panel pokemon-panel center"><p class="eyebrow">PODSUMOWANIE POKÉDEXU</p><h1>Numer ${game.target} skrywał...</h1>${target ? `<div class="pokemon-dex-reveal">${sprite(target,"pokemon-reveal-sprite")}<div><b>${escapeHtml(label(target))}</b><small>National Dex #${target.id}</small></div></div>` : ""}<p class="muted">Najbliżej celu był:</p><div class="pokemon-results">${rows || "<p class=muted>Brak wyników.</p>"}</div>${game.finished ? `<p class="money-pop">To koniec gry. Nagrody zostały przyznane.</p>` : ""}${button}</section>`; }
function card(item, showBst = false) { return `<div class="pokemon-card">${sprite(item)}<div><b>${escapeHtml(item.name)}</b><small>#${item.id} · Gen ${item.generation} · ${item.types.map(type => typeNames[type] || type).join(" / ")}</small>${showBst ? `<strong>${item.bst} BST</strong>` : ""}</div></div>`; }
function lastLetterHearts(game, uid, settings) { const max = Math.max(1, Math.min(5, Number(settings.hearts) || 3)), left = Math.max(0, Math.min(max, Number(game.hearts?.[uid] ?? max))); return `<span class="pokemon-hearts" aria-label="${left}/${max} serc">${Array.from({ length:max }, (_, index) => `<span class="${index < left ? "heart-live" : "heart-lost"}">♥</span>`).join("")}</span>`; }
function lastLetterPlayers(game, accounts, settings, current) { return `<aside class="pokemon-player-list"><p class="eyebrow">GRACZE</p>${(game.order || []).map(uid => `<div class="pokemon-player-row ${uid === current ? "is-current" : ""} ${game.eliminated?.includes(uid) ? "is-eliminated" : ""}">${avatarHtml(accounts[uid] || { nick:"Gracz" }, "pokemon-player-avatar")}<div><b>${escapeHtml(accounts[uid]?.nick || "Gracz")}</b>${lastLetterHearts(game, uid, settings)}</div></div>`).join("")}</aside>`; }
function lastLetterCard(item, author, accounts) { const profile = accounts[author] || { nick:"Gracz" }; return `<div class="pokemon-card pokemon-chain-card">${sprite(item)}<div><b>${escapeHtml(pokemonDisplayName(item))}</b><small>Gen ${item.generation} · ${item.types.map(type => typeNames[type] || type).join(" / ")}</small></div><div class="pokemon-chain-author">${avatarHtml(profile, "pokemon-author-avatar")}<small>${escapeHtml(profile.nick || "Gracz")}</small></div></div>`; }
function lastLetterResultMarkup(game, accounts, settings) { const ranking = (game.order || []).map(uid => ({ uid, score:Number(game.scores?.[uid] || 0), hearts:Number(game.hearts?.[uid] || 0) })).sort((a,b) => b.score - a.score || b.hearts - a.hearts); const winner = game.winner || ranking[0]?.uid; const rows = ranking.map((row, index) => `<div class="pokemon-result-row"><div>${resultPlayerMiniHtml(accounts[row.uid], row.uid === winner ? "win" : "lose")}<small>${row.uid === winner ? "Ostatni gracz w łańcuchu" : `${row.hearts} serc pozostało`}</small></div><span>${row.score} pkt</span></div>`).join(""); return `<section class="panel pokemon-panel center"><p class="eyebrow">PODSUMOWANIE ŁAŃCUCHA</p><h1>${winner ? `${escapeHtml(accounts[winner]?.nick || "Gracz")} wygrywa` : "Koniec gry"}</h1><p class="muted">Serca i punkty decydowały o tym, kto został w grze.</p><div class="pokemon-results">${rows || "<p class=muted>Brak wyników.</p>"}</div><p class="money-pop">To koniec gry. Nagrody zostały przyznane.</p><button class="primary" id="pokemon-lobby">Wróć do lobby</button></section>`; }
function matchTypePlayers(game, accounts, settings) { return `<aside class="pokemon-player-list"><p class="eyebrow">GRACZE</p>${Object.keys(game.hearts || {}).map(uid => `<div class="pokemon-player-row ${game.eliminated?.includes(uid) ? "is-eliminated" : ""}">${avatarHtml(accounts[uid] || { nick:"Gracz" }, "pokemon-player-avatar")}<div><b>${escapeHtml(accounts[uid]?.nick || "Gracz")}</b>${lastLetterHearts(game, uid, settings)}</div></div>`).join("")}</aside>`; }
function matchTypeCard(item) { return item ? `<div class="pokemon-card">${sprite(item)}<div><b>${escapeHtml(pokemonDisplayName(item))}</b><small>#${item.id} · Gen ${item.generation}</small></div></div>` : `<div class="pokemon-card"><p class="muted">Pokémon niedostępny — odświeżono stan rundy.</p></div>`; }
function matchTypeResultMarkup(game, accounts, settings) { const rows = Object.keys(game.hearts || {}).map(uid => `<div class="pokemon-result-row"><div>${resultPlayerMiniHtml(accounts[uid], game.winner === uid ? "win" : "lose")}<small>${game.eliminated?.includes(uid) ? "Odpadł" : `${Number(game.hearts[uid] || 0)} serc`}</small></div><span>${Number(game.scores?.[uid] || 0)} pkt</span></div>`).join(""); const button=game.finished ? `<button class="primary" id="pokemon-lobby">Wróć do lobby</button>` : `<button class="primary" id="pokemon-next">Następna runda</button>`; return `<section class="panel pokemon-panel center"><p class="eyebrow">DOPASUJ TYP · RUNDA ${game.round}</p><h1>${game.winner ? `${escapeHtml(accounts[game.winner]?.nick || "Gracz")} ma rację` : "Nikt nie trafił"}</h1><div class="pokemon-results">${rows}</div>${game.finished ? `<p class="money-pop">To koniec gry. Nagrody zostały przyznane.</p>` : ""}${button}</section>`; }

export function renderPokemonGame(root, { room, accounts, currentUser }, actions) {
  const game = room.game, settings = room.settings || pokemonDefaults[game.mode];
  if (game.mode === "pokemon-last-letter") { game.order = Array.isArray(game.order) && game.order.length ? game.order : [currentUser]; game.chain = Array.isArray(game.chain) ? game.chain : []; game.chainAuthors = Array.isArray(game.chainAuthors) ? game.chainAuthors : []; game.usedIds = Array.isArray(game.usedIds) ? game.usedIds : []; game.eliminated = Array.isArray(game.eliminated) ? game.eliminated : []; game.hearts = game.hearts && typeof game.hearts === "object" && !Array.isArray(game.hearts) ? game.hearts : {}; game.order.forEach(uid => { if (!Number.isFinite(Number(game.hearts[uid]))) game.hearts[uid] = Math.max(1, Math.min(5, Number(settings.hearts) || 3)); }); const active = lastLetterActive(game); if (active.length && game.eliminated.includes(game.order[game.turnIndex])) game.turnIndex = game.order.indexOf(active[0]); game.turnIndex = Math.max(0, Math.min(Number(game.turnIndex) || 0, game.order.length - 1)); }
  const current = game.mode === "pokemon-last-letter" ? game.order[game.turnIndex] : currentUser;
  window.clearTimeout(renderPokemonGame.timer);
  window.clearInterval(renderPokemonGame.countdown);
  if (game.mode === "pokemon-auction" && auctionBattlePhases.includes(game.phase)) {
    renderAuctionBattle(root, room, accounts, currentUser, actions, timerMarkup(game));
    startPokemonTimer(root, game, {phase:game.phase,phaseEndsAt:game.phaseEndsAt,turn:game.battle.turn}, actions);
    return;
  }
  let body = "";
  if (game.phase === "result" && game.mode === "pokemon-auction") {
    const key = JSON.stringify(["auction-final", room.roomId, game.siteGameId || game.startedAt]);
    const profiles = game.battle ? {...room.playerProfiles,...accounts} : accounts;
    patchRoomView(root, key, `<main class="page pokemon-game-page enter">${auctionFinalMarkup(game, profiles)}</main>`);
    root.querySelector("#pokemon-lobby").onclick = actions.returnToRoom;
    return;
  }
  if (game.phase === "result") { root.innerHTML = `<main class="page pokemon-game-page enter">${game.mode === "pokemon-dex" ? dexResultMarkup(game, accounts) : game.mode === "pokemon-last-letter" ? lastLetterResultMarkup(game, accounts, settings) : game.mode === "pokemon-match-type" ? matchTypeResultMarkup(game, accounts, settings) : game.mode === "pokemon-type-draw" ? typeRaceResult(game, accounts, room.players) : resultMarkup(game, accounts, actions)}</main>`; root.querySelector("#pokemon-next")?.addEventListener("click", actions.pokemonNextRound); root.querySelector("#pokemon-lobby")?.addEventListener("click", actions.returnToRoom); return; }
  if (game.mode === "pokemon-dex") { const target = pokemonDex.find(item => item.id === game.target), answer=game.answers?.[currentUser]; body = `<p class="eyebrow">NAJBLIŻSZY NUMER POKEDEX · RUNDA ${game.round}/${settings.rounds || 5}</p><h1>Znajdź Pokémona najbliżej numeru</h1><div class="pokemon-target">${target ? `#${target.id}` : "Cel niedostępny"}</div><p class="muted">Wpisz nazwę, ale nie podawaj numeru Dex.</p>${target ? `${timerMarkup(game)}${dexFormMarkup(answer)}` : `<p class="warning">Ta runda ma niepełny cel. Przejdź do podsumowania.</p>`}`; }
  if (game.mode === "pokemon-last-letter") { const previous = game.chain.at(-1), start = Math.max(0, game.chain.length - 8); body = `<div class="pokemon-last-letter-layout"><div><p class="eyebrow">OSTATNIA LITERA</p><h1>${current === currentUser ? "Twoja kolej" : `${escapeHtml(accounts[current]?.nick || "Gracz")} odpowiada`}</h1><p class="muted">${previous ? `Następny Pokémon zaczyna się na: ${clean(previous.name).slice(-1).toUpperCase()}` : "Zacznij łańcuch Pokémonów."}</p><div class="pokemon-chain">${game.chain.slice(-8).map((item, index) => lastLetterCard(item, game.chainAuthors?.[start + index], accounts)).join("")}</div>${timerMarkup(game)}${current === currentUser ? formMarkup("answer") : "<p class=muted>Czekamy na odpowiedź gracza.</p>"}</div>${lastLetterPlayers(game, accounts, settings, current)}</div>`; }
  if (game.mode === "pokemon-evolution") { const base = pokemonDex.find(item => item.id === game.baseId); body = `<p class="eyebrow">EVOLUTION RACE · RUNDA ${game.round}/${settings.rounds || 5}</p><h1>Ułóż linię ewolucji</h1><p class="muted">Wpisz Pokémony przed i po wylosowanym. Każde poprawne pole daje punkt.</p>${timerMarkup(game)}${evolutionFormMarkup(base, game.answers?.[currentUser])}`; }
  const previousAuction = game.mode === "pokemon-auction" ? root.querySelector("[data-auction-lot]") : null;
  const previousLot = previousAuction?.dataset.auctionLot;
  const previousPrice = Number(previousAuction?.dataset.auctionBid || 0);
  const previousLeading = previousAuction?.dataset.auctionLeading === "true";
  if (game.mode === "pokemon-type-draw") body = typeRaceMarkup(game, settings);
  if (game.mode === "pokemon-auction") body = auctionMarkup(game, accounts, currentUser, room.players);
  if (game.mode === "pokemon-types") { body = game.phase === "choose" ? `<p class="eyebrow">TYPY NA START</p><h1>Wybierz typ</h1><p class="muted">Każdy gracz wybiera jeden typ. Potem znajdźcie wspólnego Pokémona.</p>${timerMarkup(game)}<div class="pokemon-types">${pokemonTypes.map(type => `<button class="pokemon-type-button pokemon-type-${type}" data-pokemon-type="${type}" data-type-symbol="${typeSymbols[type]}" ${game.selectedTypes[currentUser] ? "disabled" : ""}>${typeNames[type]}</button>`).join("")}</div>` : `<p class="eyebrow">ODPOWIEDŹ</p><h1>Znajdź Pokémona tych typów</h1><div class="pokemon-picked-types">${Object.values(game.selectedTypes).map(type => `<span class="pokemon-picked-type pokemon-type-${type}">${typeNames[type]}</span>`).join("")}</div>${timerMarkup(game)}${pokemonAnswerFormMarkup("answer")}`; }
  if (game.mode === "pokemon-match-type") { const target = pokemonDex.find(item => item.id === game.target), submitted = Boolean(game.answers?.[currentUser]); body = `<div class="pokemon-match-layout"><div><p class="eyebrow">DOPASUJ TYP · RUNDA ${game.round}</p><h1>Jakie typy ma ten Pokémon?</h1><div class="pokemon-match-target">${matchTypeCard(target)}</div><p class="muted">Zaznacz wszystkie typy tego Pokémona i zatwierdź odpowiedź.</p>${timerMarkup(game)}<div class="pokemon-types pokemon-match-types">${pokemonTypes.map(type => `<button class="pokemon-type-button pokemon-type-${type} ${game.answers?.[currentUser]?.includes(type) ? "is-selected" : ""}" data-pokemon-match-type="${type}" data-type-symbol="${typeSymbols[type]}" ${submitted ? "disabled" : ""}>${typeNames[type]}</button>`).join("")}</div><button class="primary pokemon-match-submit" data-pokemon-match-submit ${submitted ? "disabled" : ""}>Sprawdź</button></div>${matchTypePlayers(game, accounts, settings)}</div>`; }
  const scoutOwned = hasGamePass(accounts?.[currentUser], "pokemon-scout");
  const scoutHint = game.scoutHints?.[currentUser]?.round === Number(game.round || 1) ? game.scoutHints[currentUser].text : "";
  const scoutUsed = game.passUses?.[currentUser]?.["pokemon-scout"] === Number(game.round || 1);
  const scoutPanel = scoutOwned ? `<section class="pokemon-scout-panel">${scoutHint ? `<b>🧬 Wskazówka Skanera Pokédex</b><span>${escapeHtml(scoutHint)}</span>` : `<button class="ghost" data-pokemon-scout ${scoutUsed ? "disabled" : ""}>🧬 Użyj Skanera Pokédex</button>`}</section>` : "";
  if (game.mode === "pokemon-auction") {
    updateAuctionView(root, previousAuction, `<main class="page pokemon-game-page enter"><section class="panel pokemon-panel"><div class="auction-scout">${scoutPanel}</div>${body}</section></main>`);
  } else if (game.mode === "pokemon-type-draw") {
    const key = JSON.stringify([game.mode, room.roomId, game.siteGameId || game.startedAt, game.round, game.phase]);
    patchRoomView(root, key, `<main class="page pokemon-game-page enter" data-type-race-view><section class="panel pokemon-panel"><div ${scoutPanel?"":"hidden"}>${scoutPanel}</div>${body}</section></main>`);
  } else {
    root.innerHTML = `<main class="page pokemon-game-page enter"><section class="panel pokemon-panel">${scoutPanel}${body}</section></main>`;
  }
  const expected = { phase:game.phase, phaseEndsAt:game.phaseEndsAt, round:game.round, mode:game.mode, activeUid:current, auctionIndex:game.auctionIndex };
  if (game.mode === "pokemon-auction" && previousLot === String(game.auctionIndex) && game.phase === "auction") {
    if (previousPrice < Number(game.currentBid || 0)) {
      const price = root.querySelector(".auction-price");
      price.classList.add("auction-raised");
      if (previousLeading && game.highestBidder !== currentUser) {
        price.classList.add("auction-outbid");
        price.querySelector("span").prepend("Przebito twoją ofertę · ");
      }
    }
  }
  const form = root.querySelector("[data-pokemon-form]");
  if (form) form.onsubmit = event => {
    event.preventDefault();
    const input = form.querySelector("#pokemon-answer");
    if (input && !input.disabled) actions.pokemonAnswer(input.value, expected);
  };
  root.querySelector("[data-pokemon-evolution-form]")?.addEventListener("submit", event => { event.preventDefault(); const inputs=[...root.querySelectorAll("[data-pokemon-evolution-input]")]; if (inputs.some(input=>input.disabled)) return; actions.pokemonAnswer(inputs.map(input=>input.value), expected); });
  const suggestions = root.querySelector("#pokemon-suggestions");
  if (suggestions) {
    // Respect the available generations without revealing which Pokémon have the drawn types.
    const pool = game.mode === "pokemon-type-draw" ? pokemonCandidates(settings) : pokemonDex;
    bindPokemonAnswerSuggestions(root.querySelector("#pokemon-answer"), suggestions, pool, {tabComplete:game.mode === "pokemon-type-draw"});
  }
  if (game.mode === "pokemon-evolution") {
    root.querySelectorAll("[data-pokemon-evolution-input]").forEach(input => {
      const suggestions=root.querySelector(`[data-pokemon-evolution-suggestions="${input.dataset.pokemonEvolutionInput}"]`);
      const updateSuggestions=()=>{ if(input.disabled||!suggestions)return; const query=clean(input.value); if(!query){suggestions.innerHTML="";return;} const matches=pokemonDex.filter(item=>clean(item.name).startsWith(query)).slice(0,8); suggestions.innerHTML=matches.map(item=>`<button type="button" class="pokemon-suggestion" data-pokemon-suggestion="${escapeHtml(pokemonDisplayName(item))}">${sprite(item,"pokemon-suggestion-sprite")}<span>${escapeHtml(pokemonDisplayName(item))}</span></button>`).join(""); suggestions.querySelectorAll("[data-pokemon-suggestion]").forEach(button=>button.addEventListener("click",()=>{input.value=button.dataset.pokemonSuggestion;suggestions.innerHTML="";input.focus();})); };
      input.addEventListener("input",updateSuggestions); input.addEventListener("keydown",event=>{if(event.key==="Escape")suggestions.innerHTML="";});
    });
    const anchor=root.querySelector("[data-evolution-anchor]"); anchor?.addEventListener("dragstart",()=>anchor.classList.add("is-dragging")); anchor?.addEventListener("dragend",()=>anchor.classList.remove("is-dragging")); root.querySelectorAll("[data-evolution-slot]").forEach(slot=>{slot.addEventListener("dragover",event=>event.preventDefault());slot.addEventListener("drop",event=>{event.preventDefault();if(!anchor)return; if(slot.dataset.evolutionSlot==="0")slot.before(anchor);else slot.after(anchor);});});
  }
  root.querySelectorAll("[data-pokemon-type]").forEach(button => button.addEventListener("click", () => actions.pokemonSelectType(button.dataset.pokemonType, expected)));
  const matchSelection = new Set(game.answers?.[currentUser] || []);
  root.querySelectorAll("[data-pokemon-match-type]").forEach(button => button.addEventListener("click", () => { const type=button.dataset.pokemonMatchType; if (matchSelection.has(type)) { matchSelection.delete(type); button.classList.remove("is-selected"); } else { matchSelection.add(type); button.classList.add("is-selected"); } }));
  root.querySelector("[data-pokemon-match-submit]")?.addEventListener("click", () => actions.pokemonMatchType([...matchSelection], expected));
  const scoutButton = root.querySelector("[data-pokemon-scout]");
  if (scoutButton) scoutButton.onclick = () => actions.pokemonUseScout();
  const bidButton = root.querySelector("[data-pokemon-bid]");
  if (bidButton) bidButton.onclick = () => actions.pokemonBid(bidButton.dataset.pokemonBid, expected);
  const passButton = root.querySelector("#pokemon-pass");
  if (passButton) passButton.onclick = () => actions.pokemonPass(expected);
  root.querySelector("#pokemon-next")?.addEventListener("click", actions.pokemonNextRound);
  startPokemonTimer(root, game, expected, actions);
}

function startPokemonTimer(root, game, expected, actions) {
  renderPokemonGame.countdown = window.setInterval(() => { const timer = root.querySelector("[data-pokemon-countdown]"); if (timer) timer.textContent = `${Math.max(0, Math.ceil((game.phaseEndsAt - pokemonNow(game)) / 1000))}s`; }, 1000);
  renderPokemonGame.timer = window.setTimeout(() => actions.pokemonTimeout(expected), Math.max(100, game.phaseEndsAt - pokemonNow(game) + 50));
}

export function renderPokemonLobbySettings(room, isHost) {
  const s = room.settings || pokemonDefaults[room.gameMode] || pokemonDefaults["pokemon-dex"];
  const generations = [1,2,3,4,5,6,7,8,9].map(generation => `<label class="check"><input data-pokemon-generation="${generation}" type="checkbox" ${(!s.generations || s.generations.includes(generation)) ? "checked" : ""} ${isHost ? "" : "disabled"}> Gen ${generation}</label>`).join("");
  const roundOrHearts = ["pokemon-last-letter", "pokemon-match-type"].includes(room.gameMode) ? `<label>Serca na gracza <input data-pokemon-setting="hearts" type="number" min="1" max="5" value="${Math.max(1, Math.min(5, s.hearts || 3))}" ${isHost ? "" : "disabled"}></label>` : `<label>Liczba rund <input data-pokemon-setting="rounds" type="number" min="1" max="20" value="${s.rounds || 5}" ${isHost ? "" : "disabled"}></label>`;
  const questionSettings = `<label>Czas odpowiedzi <input data-pokemon-setting="answerTime" type="number" min="5" max="60" value="${s.answerTime || 15}" ${isHost ? "" : "disabled"}></label>${room.gameMode === "pokemon-types" ? `<label>Czas wyboru typu <input data-pokemon-setting="selectTime" type="number" min="5" max="30" value="${s.selectTime || 10}" ${isHost ? "" : "disabled"}></label>` : ""}${roundOrHearts}${room.gameMode === "pokemon-evolution" ? `<label>Dozwolone kierunki<select data-pokemon-setting="evolutionMode" ${isHost ? "" : "disabled"}><option value="both" ${s.evolutionMode !== "later" ? "selected" : ""}>Wcześniejsze i późniejsze ewolucje</option><option value="later" ${s.evolutionMode === "later" ? "selected" : ""}>Tylko późniejsze ewolucje</option></select></label>` : ""}`;
  const typeCountSetting = room.gameMode === "pokemon-type-draw" ? `<label>Liczba typów<select data-pokemon-setting="typeCount" ${isHost ? "" : "disabled"}>${[[0,"Losowo"],[1,"Jeden typ"],[2,"Dwa typy"]].map(([value,label]) => `<option value="${value}" ${Number(s.typeCount || 0) === value ? "selected" : ""}>${label}</option>`).join("")}</select></label>` : "";
  const generationSettings = `<div><p class="tiny">GENERACJE</p><div class="pokemon-types">${generations}</div></div>`;
  const auctionDisplay = room.gameMode === "pokemon-auction" ? `<div class="pokemon-auction-settings"><label>Budżet <input data-pokemon-setting="budget" type="number" min="10" max="500" value="${s.budget || 50}" ${isHost ? "" : "disabled"}></label><label>Wielkość teamu <input data-pokemon-setting="teamSize" type="number" min="2" max="10" value="${Math.max(2,Math.min(10,Number(s.teamSize)||6))}" ${isHost ? "" : "disabled"}></label><p class="tiny">Każde przebicie podnosi cenę o 1 monetę i daje rywalom ${auctionBidMs / 1000} s. Bez bitwy wygrywa najwyższa suma BST składu.</p><label class="check"><input data-pokemon-setting="battleAfterAuction" type="checkbox" ${s.battleAfterAuction===true ? "checked" : ""} ${isHost ? "" : "disabled"}> Bitwa drużyn po licytacji</label><label class="check"><input data-pokemon-setting="strongOnly" type="checkbox" ${s.strongOnly ? "checked" : ""} ${isHost ? "" : "disabled"}> Tylko mocniejsze Pokémony</label><label class="check"><input data-pokemon-setting="legendaries" type="checkbox" ${s.legendaries !== false ? "checked" : ""} ${isHost ? "" : "disabled"}> Legendy</label><label class="check"><input data-pokemon-setting="mythicals" type="checkbox" ${s.mythicals !== false ? "checked" : ""} ${isHost ? "" : "disabled"}> Mythical</label></div>` : "";
  return `<div class="pokemon-settings">${room.gameMode === "pokemon-auction" ? auctionDisplay : questionSettings}${typeCountSetting}${generationSettings}</div>`;
}

export function stopPokemonTimer() { window.clearTimeout(renderPokemonGame.timer); window.clearInterval(renderPokemonGame.countdown); renderPokemonGame.timer = null; renderPokemonGame.countdown = null; }
