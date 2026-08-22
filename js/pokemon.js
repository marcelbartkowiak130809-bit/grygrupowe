import { pokemonDex } from "./pokemonData.js?v=20260804-2";
import { avatarHtml, escapeHtml, icon } from "./utils.js?v=20260822-1";

export const pokemonTypes = ["normal", "fire", "water", "grass", "electric", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"];
const typeNames = { normal:"Normal", fire:"Fire", water:"Water", grass:"Grass", electric:"Electric", ice:"Ice", fighting:"Fighting", poison:"Poison", ground:"Ground", flying:"Flying", psychic:"Psychic", bug:"Bug", rock:"Rock", ghost:"Ghost", dragon:"Dragon", dark:"Dark", steel:"Steel", fairy:"Fairy" };
const typeSymbols = { normal:"○", fire:"♨", water:"◈", grass:"✿", electric:"ϟ", ice:"❄", fighting:"✦", poison:"☠", ground:"⌁", flying:"⌁", psychic:"◉", bug:"✣", rock:"⬟", ghost:"◌", dragon:"♢", dark:"☾", steel:"⬢", fairy:"✧" };
const clean = value => String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
const byName = new Map(pokemonDex.map(item => [clean(item.name), item]));
const randomItem = list => list[Math.floor(Math.random() * list.length)];
const filteredDex = settings => pokemonDex.filter(item => {
  const generations = Array.isArray(settings?.generations) && settings.generations.length ? settings.generations : [1,2,3,4,5,6,7,8,9];
  return generations.includes(item.generation) && (!settings?.strongOnly || item.bst >= 500) && (settings?.legendaries !== false || !item.legendary) && (settings?.mythicals !== false || !item.mythical);
});
const scoreMap = players => Object.fromEntries(players.map(uid => [uid, 0]));
const phaseEnd = seconds => Date.now() + Math.max(3, Number(seconds) || 15) * 1000;
const pokemon = text => { const key = clean(text); return byName.get(key) || pokemonDex.find(item => clean(item.name).startsWith(key)); };
const label = item => item ? `${item.name} (#${item.id})` : "Nieznany Pokémon";

export const pokemonDefaults = {
  "pokemon-dex": { generations:[1,2,3,4,5,6,7,8,9], answerTime:15, rounds:5 },
  "pokemon-last-letter": { generations:[1,2,3,4,5,6,7,8,9], answerTime:15, hearts:3 },
  "pokemon-evolution": { generations:[1,2,3,4,5,6,7,8,9], answerTime:15, difficulty:"any", evolutionMode:"both", rounds:5 },
  "pokemon-auction": { generations:[1,2,3,4,5,6,7,8,9], budget:50, teamSize:6, strongOnly:false, legendaries:true, mythicals:true },
  "pokemon-types": { generations:[1,2,3,4,5,6,7,8,9], selectTime:10, answerTime:15, rounds:5 },
  "pokemon-match-type": { generations:[1,2,3,4,5,6,7,8,9], answerTime:15, hearts:3 },
};

function candidates(settings) { return filteredDex(settings).filter(item => item.id <= 1025); }
function pickEvolutionBase(settings) {
  const pool = candidates(settings);
  const valid = pool.filter(base => pool.some(item => item.id !== base.id && item.evolutionChain === base.evolutionChain));
  return randomItem(valid.length ? valid : pool);
}
function pickTarget(settings, used = []) { const source = settings?.evolutionMode ? candidates(settings).filter(base => candidates(settings).some(item => item.id !== base.id && item.evolutionChain === base.evolutionChain)) : candidates(settings); const pool = source.filter(item => !used.includes(item.id)); return randomItem(pool.length ? pool : source); }
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
  if (mode === "pokemon-dex") return { mode, phase:"answers", round:1, scores, target:pickTarget(settings).id, answers:{}, phaseEndsAt:phaseEnd(settings.answerTime), usedTargets:[] };
  if (mode === "pokemon-last-letter") { const hearts=Math.max(1,Math.min(5,Number(settings.hearts)||3)); return { mode, phase:"chain", round:1, scores, order:[...players], turnIndex:0, chain:[], chainAuthors:[], usedIds:[], hearts:Object.fromEntries(players.map(uid=>[uid,hearts])), eliminated:[], phaseEndsAt:phaseEnd(settings.answerTime) }; }
  if (mode === "pokemon-evolution") { const base = pickEvolutionBase(settings); return { mode, phase:"answers", round:1, scores, baseId:base.id, answers:{}, phaseEndsAt:phaseEnd(settings.answerTime), usedTargets:[] }; }
  if (mode === "pokemon-auction") {
    const teamSize = Number(settings.teamSize) || 6;
    const items = [...candidates(settings)].sort(() => Math.random() - .5).slice(0, Math.max(4, teamSize * players.length));
    return { mode, phase:"auction", round:1, scores, teamSize:Math.max(2,Math.min(10,teamSize)), items:items.map(item => item.id), auctionIndex:0, budgets:Object.fromEntries(players.map(uid => [uid, Number(settings.budget) || 50])), teams:Object.fromEntries(players.map(uid => [uid, []])), purchases:Object.fromEntries(players.map(uid => [uid, []])), currentBid:0, highestBidder:"", passed:[], phaseEndsAt:phaseEnd(10) };
  }
  if (mode === "pokemon-match-type") { const hearts=Math.max(1,Math.min(5,Number(settings.hearts)||3)); return { mode, phase:"answers", round:1, scores, target:pickTarget(settings).id, answers:{}, hearts:Object.fromEntries(players.map(uid=>[uid,hearts])), eliminated:[], phaseEndsAt:phaseEnd(settings.answerTime) }; }
  return { mode:"pokemon-types", phase:"choose", round:1, scores, selectedTypes:{}, blockedPairs:[], answers:{}, phaseEndsAt:phaseEnd(settings.selectTime) };
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
function settleAuction(game, players) {
  game.teams = game.teams || {};
  game.budgets = game.budgets || {};
  game.purchases = game.purchases || {};
  players.forEach(uid => { if (!Array.isArray(game.teams[uid])) game.teams[uid] = []; if (!Number.isFinite(Number(game.budgets[uid]))) game.budgets[uid] = 0; });
  if (game.highestBidder) { const item = pokemonDex.find(row => row.id === game.items?.[game.auctionIndex]); if (item && game.teams[game.highestBidder]) { game.budgets[game.highestBidder] -= game.currentBid; game.teams[game.highestBidder].push(item.id); game.purchases[game.highestBidder] ??= []; game.purchases[game.highestBidder].push({id:item.id,price:game.currentBid}); } }
  game.auctionIndex += 1; game.currentBid = 0; game.highestBidder = ""; game.passed = [];
  if (game.auctionIndex >= (game.items?.length || 0) || players.every(uid => game.teams[uid].length >= game.teamSize)) {
    const ranking = players.map(uid => ({ uid, bst:game.teams[uid].reduce((sum,id) => sum + (pokemonDex.find(row => row.id === id)?.bst || 0), 0), team:game.teams[uid] })).sort((a,b) => b.bst - a.bst);
    ranking.forEach((row,index) => { if (index === 0) game.scores[row.uid] += 3; }); game.ranking = ranking; game.phase = "result"; game.finished = true;
  } else game.phaseEndsAt = phaseEnd(10);
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
    if (game.mode === "pokemon-last-letter") {
      game.order = Array.isArray(game.order) && game.order.length ? game.order : [...players];
      game.chain = Array.isArray(game.chain) ? game.chain : [];
      game.chainAuthors = Array.isArray(game.chainAuthors) ? game.chainAuthors : [];
      game.usedIds = Array.isArray(game.usedIds) ? game.usedIds : [];
      game.eliminated = Array.isArray(game.eliminated) ? game.eliminated : [];
      if (game.order[game.turnIndex] !== uid || game.eliminated.includes(uid)) return "Teraz odpowiada inny gracz.";
      const item = pokemon(text), previous = game.chain.at(-1), required = previous ? clean(previous.name).slice(-1) : "";
      const pool = candidates(settings);
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
      const pool = candidates(settings), base = pokemonDex.find(item => item.id === game.baseId), chain = pokemonDex.filter(item => item.evolutionChain === base?.evolutionChain).sort((a,b) => a.id - b.id), baseIndex = chain.findIndex(item => item.id === base?.id);
      if (items.some(item => !pool.some(row => row.id === item.id))) return "Ten Pokémon nie jest dostępny w wybranych generacjach.";
      if (settings.evolutionMode === "later" && items.some(item => chain.indexOf(item) <= baseIndex)) return "W tym ustawieniu wpisuj tylko późniejsze ewolucje.";
      game.answers = game.answers && typeof game.answers === "object" && !Array.isArray(game.answers) ? game.answers : {};
      game.answers[uid] = items;
      if (Object.keys(game.answers).length >= players.length) finishEvolution(game, players, settings);
      return;
    }
    const item = pokemon(text); if (!item) return "Wpisz poprawną nazwę Pokémona.";
    game.answers = game.answers && typeof game.answers === "object" && !Array.isArray(game.answers) ? game.answers : {};
    const pool = candidates(settings); if (!pool.some(row => row.id === item.id)) return "Ten Pokémon nie jest dostępny w wybranych generacjach.";
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
    if (game.mode === "pokemon-dex") { finishDex(game, players, settings); return; }
    if (game.mode === "pokemon-evolution") { finishEvolution(game, players, settings); return; }
    if (game.mode === "pokemon-types") { game.selectedTypes = game.selectedTypes && typeof game.selectedTypes === "object" && !Array.isArray(game.selectedTypes) ? game.selectedTypes : {}; if (game.phase === "choose") { const available = pokemonTypes.filter(type => !Object.values(game.selectedTypes).includes(type)); players.forEach(player => { if (!game.selectedTypes[player]) game.selectedTypes[player] = randomItem(available); }); game.phase = "answer"; game.phaseEndsAt = phaseEnd(settings.answerTime); } else finishTypes(game, players, settings); return; }
    if (game.mode === "pokemon-last-letter") { const activeUid = game.order?.[game.turnIndex] || uid; if (activeUid) loseLastLetterHeart(game, activeUid, settings); }
    if (game.mode === "pokemon-match-type") { const active = players.filter(player => !game.eliminated?.includes(player)); active.forEach(player => { if (!game.answers?.[player]) { game.answers = game.answers || {}; game.answers[player] = []; loseMatchTypeHeart(game, player, settings); } }); finishMatchTypeRound(game, players, settings); }
    if (game.mode === "pokemon-auction") { if (!game.highestBidder) { game.passed = []; game.phaseEndsAt = phaseEnd(10); } else settleAuction(game, players); }
  },
  selectType(game, uid, type, players, settings) {
    game.scores = game.scores && typeof game.scores === "object" && !Array.isArray(game.scores) ? game.scores : scoreMap(players);
    game.selectedTypes = game.selectedTypes && typeof game.selectedTypes === "object" && !Array.isArray(game.selectedTypes) ? game.selectedTypes : {};
    game.blockedPairs = Array.isArray(game.blockedPairs) ? game.blockedPairs : [];
    if (game.phase !== "choose" || !pokemonTypes.includes(type)) return "Wybór typu jest już zamknięty.";
    if (game.selectedTypes[uid]) return "Typ został już wybrany.";
    game.selectedTypes[uid] = type;
    if (Object.keys(game.selectedTypes).length >= players.length) {
      const selected = [...new Set(Object.values(game.selectedTypes))]; const exists = candidates(settings).some(item => selected.every(itemType => item.types.includes(itemType)));
      if (!exists) { game.blockedPairs.push(selected.join("+")); game.selectedTypes = {}; game.phaseEndsAt = phaseEnd(settings.selectTime); }
      else { game.phase = "answer"; game.phaseEndsAt = phaseEnd(settings.answerTime); }
    }
  },
  bid(game, uid, amount, players) { if (game.phase !== "auction") return "Aukcja jest zakończona."; game.budgets = game.budgets && typeof game.budgets === "object" && !Array.isArray(game.budgets) ? game.budgets : {}; game.teams = game.teams && typeof game.teams === "object" && !Array.isArray(game.teams) ? game.teams : {}; game.passed = Array.isArray(game.passed) ? game.passed : []; if (!players.includes(uid)) return "Nie ma cię w tej aukcji."; if ((game.teams[uid]||[]).length >= Number(game.teamSize||6)) return "Twój team jest już pełny."; const bid = Number(amount), budget = Number(game.budgets[uid] || 0); if (!Number.isFinite(bid) || bid <= Number(game.currentBid || 0) || bid > budget) return "Podaj wyższą stawkę, mieszczącą się w budżecie."; game.currentBid = bid; game.highestBidder = uid; game.passed = []; game.phaseEndsAt = phaseEnd(10); },
  pass(game, uid, players) { if (game.phase !== "auction") return "Aukcja jest zakończona."; game.passed = Array.isArray(game.passed) ? game.passed : []; game.teams = game.teams && typeof game.teams === "object" && !Array.isArray(game.teams) ? game.teams : {}; game.budgets = game.budgets && typeof game.budgets === "object" && !Array.isArray(game.budgets) ? game.budgets : {}; if (!players.includes(uid)) return "Nie ma cię w tej aukcji."; if (!game.passed.includes(uid)) game.passed.push(uid); const contested=Boolean(game.highestBidder)&&game.passed.length>=players.length-1; const noOneCanBid=players.every(player=>(game.teams?.[player]?.length||0)>=game.teamSize||Number(game.budgets?.[player]||0)<=Number(game.currentBid||0)); if (contested||noOneCanBid) settleAuction(game, players); else if (!game.highestBidder&&game.passed.length>=players.length) { game.passed=[]; game.phaseEndsAt=phaseEnd(10); } },
  nextRound(game, players, settings) { if (game.phase !== "result") return "Runda jeszcze się nie zakończyła."; if (game.mode === "pokemon-dex") { game.round += 1; game.usedTargets = Array.isArray(game.usedTargets) ? game.usedTargets : []; game.target = pickTarget(settings, game.usedTargets).id; game.usedTargets.push(game.target); game.answers = {}; game.ranking = []; game.phase = "answers"; game.phaseEndsAt = phaseEnd(settings.answerTime); } else if (game.mode === "pokemon-evolution") { game.round += 1; game.baseId = pickTarget(settings).id; game.answers = {}; game.ranking = []; game.phase = "answers"; game.phaseEndsAt = phaseEnd(settings.answerTime); } else if (game.mode === "pokemon-types") { game.round += 1; game.selectedTypes = {}; game.answers = {}; game.ranking = []; game.phase = "choose"; game.phaseEndsAt = phaseEnd(settings.selectTime); } else if (game.mode === "pokemon-match-type") { if (players.filter(uid => !game.eliminated?.includes(uid)).length <= 1) { game.finished = true; return; } game.round += 1; game.target = pickTarget(settings).id; game.answers = {}; game.ranking = []; game.winner = ""; game.phase = "answers"; game.phaseEndsAt = phaseEnd(settings.answerTime); } else game.phase = "result"; }
};

const pokemonAuctionPass = PokemonEngine.pass;
PokemonEngine.pass = (game, uid, players) => {
  game.passed = Array.isArray(game.passed) ? game.passed : [];
  game.teams = game.teams || Object.fromEntries(players.map(player => [player, []]));
  game.budgets = game.budgets || Object.fromEntries(players.map(player => [player, 0]));
  return pokemonAuctionPass(game, uid, players);
};

function timerMarkup(game) { return `<div class="pokemon-timer" data-pokemon-countdown="${game.phaseEndsAt}">${Math.max(0, Math.ceil((game.phaseEndsAt - Date.now()) / 1000))}s</div>`; }
function auctionStatusMarkup(game, accounts, currentUser) {
  const leader = game.highestBidder ? accounts[game.highestBidder]?.nick || "Gracz" : "Brak oferty";
  const passed = (Array.isArray(game.passed) ? game.passed : []).map(uid => accounts[uid]?.nick || "Gracz");
  const leading = game.highestBidder === currentUser;
  return `<div class="pokemon-auction-status ${leading ? "is-leading" : ""}"><strong>${leading ? "Prowadzisz aukcję" : game.highestBidder ? "Aktualnie wygrywa" : "Nikt jeszcze nie prowadzi"}</strong><span>${game.highestBidder ? `${escapeHtml(leader)} · ${game.currentBid}$` : "Złóż pierwszą ofertę"}</span>${passed.length ? `<small>Spasowali: ${escapeHtml(passed.join(", "))}</small>` : ""}</div>`;
}
function auctionTeamMarkup(game, accounts, currentUser) { const profile=accounts[currentUser]||{}; const purchases=Array.isArray(game.purchases?.[currentUser])?game.purchases[currentUser]:[]; return `<aside class="pokemon-auction-team"><div class="pokemon-auction-team-head">${avatarHtml(profile,"pokemon-player-avatar")}<div><b>${escapeHtml(profile.nick||"Gracz")}</b><small>Portfel: ${Number(game.budgets?.[currentUser]||0)}$</small></div></div><p class="eyebrow">TWÓJ TEAM · ${purchases.length}/${game.teamSize}</p>${purchases.length?purchases.map(purchase=>{const item=pokemonDex.find(row=>row.id===purchase.id);return item?`<div class="pokemon-auction-purchase">${sprite(item)}<span>${escapeHtml(pokemonDisplayName(item))}<small>${Number(purchase.price)||0}$</small></span></div>`:""}).join(""):"<p class=muted>Nie kupiłeś jeszcze żadnego Pokémona.</p>"}</aside>`; }
function formMarkup(id, placeholder = "Nazwa Pokémona") { return `<form class="pokemon-answer-form" data-pokemon-form="${id}"><input id="pokemon-answer" autocomplete="off" placeholder="${placeholder}"><button class="primary" type="submit">Odpowiedz</button></form>`; }
function pokemonAnswerFormMarkup(id) { return `<form class="pokemon-answer-form" data-pokemon-form="${id}"><div class="pokemon-autocomplete"><input id="pokemon-answer" autocomplete="off" placeholder="Nazwa Pokémona"><div id="pokemon-suggestions" class="pokemon-suggestions"></div></div><button class="primary" type="submit">Odpowiedz</button></form>`; }
function dexFormMarkup(answer) { const answered=Boolean(answer), value=answered ? escapeHtml(pokemonDisplayName(answer)) : ""; return `<form class="pokemon-answer-form" data-pokemon-form="answer"><div class="pokemon-autocomplete"><input id="pokemon-answer" autocomplete="off" placeholder="Nazwa Pokémona" value="${value}" ${answered ? "disabled" : ""}><div id="pokemon-suggestions" class="pokemon-suggestions"></div></div><button class="primary" type="submit" ${answered ? "disabled" : ""}>${answered ? "Wysłano" : "Odpowiedz"}</button></form>`; }
function pokemonDisplayName(item) { return item?.name?.replace(/-normal$/, "") || ""; }
function evolutionFormMarkup(base, answers = []) { const chain=pokemonDex.filter(item => item.evolutionChain === base?.evolutionChain), fields=chain.length >= 3 ? 2 : 1, locked=Array.isArray(answers) && answers.length > 0, anchor=`<div class="evolution-anchor" draggable="true" data-evolution-anchor>${sprite(base,"pokemon-evolution-sprite")}<span>${escapeHtml(pokemonDisplayName(base))}</span><small>Przeciągnij między odpowiedzi</small></div>`, slot=index=>`<div class="evolution-answer-slot" data-evolution-slot="${index}"><div class="tiny">${index === 0 && fields > 1 ? "Wcześniejsza ewolucja" : index === 1 ? "Późniejsza ewolucja" : "Ewolucja"}</div><div class="pokemon-autocomplete"><input data-pokemon-evolution-input="${index}" autocomplete="off" placeholder="Nazwa Pokémona" value="${locked ? escapeHtml(pokemonDisplayName(answers[index])) : ""}" ${locked ? "disabled" : ""}><div class="pokemon-suggestions" data-pokemon-evolution-suggestions="${index}"></div></div></div>`; return `<form class="pokemon-evolution-form" data-pokemon-evolution-form><div class="evolution-race-fields">${fields === 1 ? `${anchor}${slot(0)}` : `${slot(0)}${anchor}${slot(1)}`}</div><button class="primary" type="submit" ${locked ? "disabled" : ""}>${locked ? "Wysłano" : "Zatwierdź ewolucję"}</button></form>`; }
function sprite(item, className = "") { return `<img class="${className}" src="${item.sprite}" alt="${escapeHtml(item.name)}" onerror="this.onerror=null;this.src='${item.spriteFallback}'">`; }
function resultMarkup(game, accounts, actions, title = "Wyniki rundy") { const rows = (game.ranking || []).map(row => { const team = Array.isArray(row.team) ? `<div class="pokemon-mini-team">${row.team.map(id => { const item = pokemonDex.find(pokemon => pokemon.id === id); return item ? sprite(item) : ""; }).join("")}</div>` : ""; const answer = Array.isArray(row.answer) ? row.answer.map(item => item ? `${sprite(item,"pokemon-result-sprite")} ${escapeHtml(label(item))}` : "").join(" ") : row.answer ? `${sprite(row.answer,"pokemon-result-sprite")} ${escapeHtml(label(row.answer))}` : ""; return `<div class="pokemon-result-row"><div><b>${escapeHtml(accounts[row.uid]?.nick || "Gracz")}</b>${team}</div><span>${answer || (row.bst != null ? `${row.bst} BST` : row.difference != null ? (Number.isFinite(row.difference) ? `różnica ${row.difference}` : "brak odpowiedzi") : row.points != null ? `${row.points} pkt` : row.correct ? "trafienie" : "-")}</span></div>`; }).join(""); const button=game.finished ? `<button class="primary" id="pokemon-lobby">Wróć do lobby</button>` : `<button class="primary" id="pokemon-next">Następna runda</button>`; return `<section class="panel pokemon-panel center"><p class="eyebrow">PODSUMOWANIE</p><h1>${title}</h1><div class="pokemon-results">${rows || "<p class=muted>Brak wyników.</p>"}</div>${game.finished ? `<p class="money-pop">To koniec gry. Nagrody zostały przyznane.</p>` : ""}${button}</section>`; }
function dexResultMarkup(game, accounts) { const target = pokemonDex.find(item => item.id === game.target); const rows = (game.ranking || []).map((row, index) => `<article class="pokemon-dex-result-row ${index === 0 ? "winner" : ""}"><div><b>${index === 0 ? "🏆 " : ""}${escapeHtml(accounts[row.uid]?.nick || "Gracz")}</b>${row.answer ? `${sprite(row.answer,"pokemon-result-sprite")} ${escapeHtml(label(row.answer))}` : "Brak odpowiedzi"}</div><strong>${Number.isFinite(row.difference) ? `Różnica: ${row.difference}` : "Poza rankingiem"} · ${Number(game.scores?.[row.uid] || 0)} pkt</strong></article>`).join(""); const button=game.finished ? `<button class="primary" id="pokemon-lobby">Wróć do lobby</button>` : `<button class="primary" id="pokemon-next">Następna runda</button>`; return `<section class="panel pokemon-panel center"><p class="eyebrow">PODSUMOWANIE POKÉDEXU</p><h1>Numer ${game.target} skrywał...</h1>${target ? `<div class="pokemon-dex-reveal">${sprite(target,"pokemon-reveal-sprite")}<div><b>${escapeHtml(label(target))}</b><small>National Dex #${target.id}</small></div></div>` : ""}<p class="muted">Najbliżej celu był:</p><div class="pokemon-results">${rows || "<p class=muted>Brak wyników.</p>"}</div>${game.finished ? `<p class="money-pop">To koniec gry. Nagrody zostały przyznane.</p>` : ""}${button}</section>`; }
function card(item, showBst = false) { return `<div class="pokemon-card">${sprite(item)}<div><b>${escapeHtml(item.name)}</b><small>#${item.id} · Gen ${item.generation} · ${item.types.map(type => typeNames[type] || type).join(" / ")}</small>${showBst ? `<strong>${item.bst} BST</strong>` : ""}</div></div>`; }
function lastLetterHearts(game, uid, settings) { const max = Math.max(1, Math.min(5, Number(settings.hearts) || 3)), left = Math.max(0, Math.min(max, Number(game.hearts?.[uid] ?? max))); return `<span class="pokemon-hearts" aria-label="${left}/${max} serc">${Array.from({ length:max }, (_, index) => `<span class="${index < left ? "heart-live" : "heart-lost"}">♥</span>`).join("")}</span>`; }
function lastLetterPlayers(game, accounts, settings, current) { return `<aside class="pokemon-player-list"><p class="eyebrow">GRACZE</p>${(game.order || []).map(uid => `<div class="pokemon-player-row ${uid === current ? "is-current" : ""} ${game.eliminated?.includes(uid) ? "is-eliminated" : ""}">${avatarHtml(accounts[uid] || { nick:"Gracz" }, "pokemon-player-avatar")}<div><b>${escapeHtml(accounts[uid]?.nick || "Gracz")}</b>${lastLetterHearts(game, uid, settings)}</div></div>`).join("")}</aside>`; }
function lastLetterCard(item, author, accounts) { const profile = accounts[author] || { nick:"Gracz" }; return `<div class="pokemon-card pokemon-chain-card">${sprite(item)}<div><b>${escapeHtml(pokemonDisplayName(item))}</b><small>Gen ${item.generation} · ${item.types.map(type => typeNames[type] || type).join(" / ")}</small></div><div class="pokemon-chain-author">${avatarHtml(profile, "pokemon-author-avatar")}<small>${escapeHtml(profile.nick || "Gracz")}</small></div></div>`; }
function lastLetterResultMarkup(game, accounts, settings) { const ranking = (game.order || []).map(uid => ({ uid, score:Number(game.scores?.[uid] || 0), hearts:Number(game.hearts?.[uid] || 0) })).sort((a,b) => b.score - a.score || b.hearts - a.hearts); const winner = game.winner || ranking[0]?.uid; const rows = ranking.map((row, index) => `<div class="pokemon-result-row"><div><b>${index === 0 ? "🏆 " : ""}${escapeHtml(accounts[row.uid]?.nick || "Gracz")}</b><small>${row.uid === winner ? "Ostatni gracz w łańcuchu" : `${row.hearts} serc pozostało`}</small></div><span>${row.score} pkt</span></div>`).join(""); return `<section class="panel pokemon-panel center"><p class="eyebrow">PODSUMOWANIE ŁAŃCUCHA</p><h1>${winner ? `${escapeHtml(accounts[winner]?.nick || "Gracz")} wygrywa` : "Koniec gry"}</h1><p class="muted">Serca i punkty decydowały o tym, kto został w grze.</p><div class="pokemon-results">${rows || "<p class=muted>Brak wyników.</p>"}</div><p class="money-pop">To koniec gry. Nagrody zostały przyznane.</p><button class="primary" id="pokemon-lobby">Wróć do lobby</button></section>`; }
function matchTypePlayers(game, accounts, settings) { return `<aside class="pokemon-player-list"><p class="eyebrow">GRACZE</p>${Object.keys(game.hearts || {}).map(uid => `<div class="pokemon-player-row ${game.eliminated?.includes(uid) ? "is-eliminated" : ""}">${avatarHtml(accounts[uid] || { nick:"Gracz" }, "pokemon-player-avatar")}<div><b>${escapeHtml(accounts[uid]?.nick || "Gracz")}</b>${lastLetterHearts(game, uid, settings)}</div></div>`).join("")}</aside>`; }
function matchTypeCard(item) { return item ? `<div class="pokemon-card">${sprite(item)}<div><b>${escapeHtml(pokemonDisplayName(item))}</b><small>#${item.id} · Gen ${item.generation}</small></div></div>` : `<div class="pokemon-card"><p class="muted">Pokémon niedostępny — odświeżono stan rundy.</p></div>`; }
function matchTypeResultMarkup(game, accounts, settings) { const rows = Object.keys(game.hearts || {}).map(uid => `<div class="pokemon-result-row"><div><b>${game.winner === uid ? "🏆 " : ""}${escapeHtml(accounts[uid]?.nick || "Gracz")}</b><small>${game.eliminated?.includes(uid) ? "Odpadł" : `${Number(game.hearts[uid] || 0)} serc`}</small></div><span>${Number(game.scores?.[uid] || 0)} pkt</span></div>`).join(""); const button=game.finished ? `<button class="primary" id="pokemon-lobby">Wróć do lobby</button>` : `<button class="primary" id="pokemon-next">Następna runda</button>`; return `<section class="panel pokemon-panel center"><p class="eyebrow">DOPASUJ TYP · RUNDA ${game.round}</p><h1>${game.winner ? `${escapeHtml(accounts[game.winner]?.nick || "Gracz")} ma rację` : "Nikt nie trafił"}</h1><div class="pokemon-results">${rows}</div>${game.finished ? `<p class="money-pop">To koniec gry. Nagrody zostały przyznane.</p>` : ""}${button}</section>`; }

export function renderPokemonGame(root, { room, accounts, currentUser }, actions) {
  const game = room.game, settings = room.settings || pokemonDefaults[game.mode];
  if (game.mode === "pokemon-last-letter") { game.order = Array.isArray(game.order) && game.order.length ? game.order : [currentUser]; game.chain = Array.isArray(game.chain) ? game.chain : []; game.chainAuthors = Array.isArray(game.chainAuthors) ? game.chainAuthors : []; game.usedIds = Array.isArray(game.usedIds) ? game.usedIds : []; game.eliminated = Array.isArray(game.eliminated) ? game.eliminated : []; game.hearts = game.hearts && typeof game.hearts === "object" && !Array.isArray(game.hearts) ? game.hearts : {}; game.order.forEach(uid => { if (!Number.isFinite(Number(game.hearts[uid]))) game.hearts[uid] = Math.max(1, Math.min(5, Number(settings.hearts) || 3)); }); const active = lastLetterActive(game); if (active.length && game.eliminated.includes(game.order[game.turnIndex])) game.turnIndex = game.order.indexOf(active[0]); game.turnIndex = Math.max(0, Math.min(Number(game.turnIndex) || 0, game.order.length - 1)); }
  const current = game.mode === "pokemon-last-letter" ? game.order[game.turnIndex] : currentUser;
  window.clearTimeout(renderPokemonGame.timer);
  window.clearInterval(renderPokemonGame.countdown);
  let body = "";
  if (game.phase === "result") { root.innerHTML = `<main class="page pokemon-game-page enter">${game.mode === "pokemon-dex" ? dexResultMarkup(game, accounts) : game.mode === "pokemon-last-letter" ? lastLetterResultMarkup(game, accounts, settings) : game.mode === "pokemon-match-type" ? matchTypeResultMarkup(game, accounts, settings) : resultMarkup(game, accounts, actions, game.mode === "pokemon-auction" ? "Wynik aukcji" : "Wyniki rundy")}</main>`; root.querySelector("#pokemon-next")?.addEventListener("click", actions.pokemonNextRound); root.querySelector("#pokemon-lobby")?.addEventListener("click", actions.returnToRoom); return; }
  if (game.mode === "pokemon-dex") { const target = pokemonDex.find(item => item.id === game.target), answer=game.answers?.[currentUser]; body = `<p class="eyebrow">NAJBLIŻSZY NUMER POKEDEX · RUNDA ${game.round}/${settings.rounds || 5}</p><h1>Znajdź Pokémona najbliżej numeru</h1><div class="pokemon-target">${target ? `#${target.id}` : "Cel niedostępny"}</div><p class="muted">Wpisz nazwę, ale nie podawaj numeru Dex.</p>${target ? `${timerMarkup(game)}${dexFormMarkup(answer)}` : `<p class="warning">Ta runda ma niepełny cel. Przejdź do podsumowania.</p>`}`; }
  if (game.mode === "pokemon-last-letter") { const previous = game.chain.at(-1), start = Math.max(0, game.chain.length - 8); body = `<div class="pokemon-last-letter-layout"><div><p class="eyebrow">OSTATNIA LITERA</p><h1>${current === currentUser ? "Twoja kolej" : `${escapeHtml(accounts[current]?.nick || "Gracz")} odpowiada`}</h1><p class="muted">${previous ? `Następny Pokémon zaczyna się na: ${clean(previous.name).slice(-1).toUpperCase()}` : "Zacznij łańcuch Pokémonów."}</p><div class="pokemon-chain">${game.chain.slice(-8).map((item, index) => lastLetterCard(item, game.chainAuthors?.[start + index], accounts)).join("")}</div>${timerMarkup(game)}${current === currentUser ? formMarkup("answer") : "<p class=muted>Czekamy na odpowiedź gracza.</p>"}</div>${lastLetterPlayers(game, accounts, settings, current)}</div>`; }
  if (game.mode === "pokemon-evolution") { const base = pokemonDex.find(item => item.id === game.baseId); body = `<p class="eyebrow">EVOLUTION RACE · RUNDA ${game.round}/${settings.rounds || 5}</p><h1>Ułóż linię ewolucji</h1><p class="muted">Wpisz Pokémony przed i po wylosowanym. Każde poprawne pole daje punkt.</p>${timerMarkup(game)}${evolutionFormMarkup(base, game.answers?.[currentUser])}`; }
  if (game.mode === "pokemon-auction") { game.purchases=game.purchases&&typeof game.purchases==="object"&&!Array.isArray(game.purchases)?game.purchases:{}; const item = pokemonDex.find(row => row.id === game.items[game.auctionIndex]); const budget = game.budgets[currentUser] || 0; body = `<div class="pokemon-auction-layout"><div><p class="eyebrow">LICYTACJA TEAMU POKÉMONÓW</p><h1>Aukcja ${game.auctionIndex + 1}/${game.items.length}</h1>${item?card(item):"<p class=muted>Brak Pokémona do licytacji.</p>"}<p class="muted">Aktualna oferta: ${game.currentBid}$ · Budżet: ${budget}$</p>${timerMarkup(game)}<form class="pokemon-bid-form"><input id="pokemon-bid" type="number" min="${game.currentBid + 1}" max="${budget}" placeholder="Oferta"><button class="primary" type="submit">Licytuj</button><button class="ghost" id="pokemon-pass" type="button">Pas</button></form>${auctionStatusMarkup(game, accounts, currentUser)}</div>${auctionTeamMarkup(game,accounts,currentUser)}</div>`; }
  if (game.mode === "pokemon-types") { body = game.phase === "choose" ? `<p class="eyebrow">TYPY NA START</p><h1>Wybierz typ</h1><p class="muted">Każdy gracz wybiera jeden typ. Potem znajdźcie wspólnego Pokémona.</p>${timerMarkup(game)}<div class="pokemon-types">${pokemonTypes.map(type => `<button class="pokemon-type-button pokemon-type-${type}" data-pokemon-type="${type}" data-type-symbol="${typeSymbols[type]}" ${game.selectedTypes[currentUser] ? "disabled" : ""}>${typeNames[type]}</button>`).join("")}</div>` : `<p class="eyebrow">ODPOWIEDŹ</p><h1>Znajdź Pokémona tych typów</h1><div class="pokemon-picked-types">${Object.values(game.selectedTypes).map(type => `<span class="pokemon-picked-type pokemon-type-${type}">${typeNames[type]}</span>`).join("")}</div>${timerMarkup(game)}${pokemonAnswerFormMarkup("answer")}`; }
  if (game.mode === "pokemon-match-type") { const target = pokemonDex.find(item => item.id === game.target), submitted = Boolean(game.answers?.[currentUser]); body = `<div class="pokemon-match-layout"><div><p class="eyebrow">DOPASUJ TYP · RUNDA ${game.round}</p><h1>Jakie typy ma ten Pokémon?</h1><div class="pokemon-match-target">${matchTypeCard(target)}</div><p class="muted">Zaznacz wszystkie typy tego Pokémona i zatwierdź odpowiedź.</p>${timerMarkup(game)}<div class="pokemon-types pokemon-match-types">${pokemonTypes.map(type => `<button class="pokemon-type-button pokemon-type-${type} ${game.answers?.[currentUser]?.includes(type) ? "is-selected" : ""}" data-pokemon-match-type="${type}" data-type-symbol="${typeSymbols[type]}" ${submitted ? "disabled" : ""}>${typeNames[type]}</button>`).join("")}</div><button class="primary pokemon-match-submit" data-pokemon-match-submit ${submitted ? "disabled" : ""}>Sprawdź</button></div>${matchTypePlayers(game, accounts, settings)}</div>`; }
  root.innerHTML = `<main class="page pokemon-game-page enter"><section class="panel pokemon-panel">${body}</section></main>`;
  const expected = { phase:game.phase, phaseEndsAt:game.phaseEndsAt, round:game.round, mode:game.mode, activeUid:current };
  const form = root.querySelector("[data-pokemon-form]"); form?.addEventListener("submit", event => { event.preventDefault(); if (root.querySelector("#pokemon-answer")?.disabled) return; actions.pokemonAnswer(root.querySelector("#pokemon-answer").value, expected); });
  root.querySelector("[data-pokemon-evolution-form]")?.addEventListener("submit", event => { event.preventDefault(); const inputs=[...root.querySelectorAll("[data-pokemon-evolution-input]")]; if (inputs.some(input=>input.disabled)) return; actions.pokemonAnswer(inputs.map(input=>input.value), expected); });
  if (game.mode === "pokemon-dex" || (game.mode === "pokemon-types" && game.phase === "answer")) {
    const input = root.querySelector("#pokemon-answer");
    const suggestions = root.querySelector("#pokemon-suggestions");
    const updateSuggestions = () => {
      if (!input || input.disabled || !suggestions) return;
      const query = clean(input.value);
      if (!query) { suggestions.innerHTML = ""; return; }
      const matches = pokemonDex.filter(item => clean(item.name).startsWith(query)).slice(0, 8);
      suggestions.innerHTML = matches.map(item => `<button type="button" class="pokemon-suggestion" data-pokemon-suggestion="${escapeHtml(pokemonDisplayName(item))}">${sprite(item, "pokemon-suggestion-sprite")}<span>${escapeHtml(pokemonDisplayName(item))}</span></button>`).join("");
      suggestions.querySelectorAll("[data-pokemon-suggestion]").forEach(button => button.addEventListener("click", () => { input.value = button.dataset.pokemonSuggestion; suggestions.innerHTML = ""; input.focus(); }));
    };
    input?.addEventListener("input", updateSuggestions);
    input?.addEventListener("keydown", event => { if (event.key === "Escape" && suggestions) suggestions.innerHTML = ""; });
    updateSuggestions();
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
  root.querySelector(".pokemon-bid-form")?.addEventListener("submit", event => { event.preventDefault(); actions.pokemonBid(root.querySelector("#pokemon-bid").value, expected); });
  root.querySelector("#pokemon-pass")?.addEventListener("click", () => actions.pokemonPass(expected));
  root.querySelector("#pokemon-next")?.addEventListener("click", actions.pokemonNextRound);
  window.clearTimeout(renderPokemonGame.timer); window.clearInterval(renderPokemonGame.countdown); renderPokemonGame.countdown = window.setInterval(() => { const timer = root.querySelector("[data-pokemon-countdown]"); if (timer) timer.textContent = `${Math.max(0, Math.ceil((game.phaseEndsAt - Date.now()) / 1000))}s`; }, 250); renderPokemonGame.timer = window.setTimeout(() => actions.pokemonTimeout(expected), Math.max(100, game.phaseEndsAt - Date.now() + 50));
}

export function renderPokemonLobbySettings(room, isHost) {
  const s = room.settings || pokemonDefaults[room.gameMode] || pokemonDefaults["pokemon-dex"];
  const generations = [1,2,3,4,5,6,7,8,9].map(generation => `<label class="check"><input data-pokemon-generation="${generation}" type="checkbox" ${(!s.generations || s.generations.includes(generation)) ? "checked" : ""} ${isHost ? "" : "disabled"}> Gen ${generation}</label>`).join("");
  const roundOrHearts = ["pokemon-last-letter", "pokemon-match-type"].includes(room.gameMode) ? `<label>Serca na gracza <input data-pokemon-setting="hearts" type="number" min="1" max="5" value="${Math.max(1, Math.min(5, s.hearts || 3))}" ${isHost ? "" : "disabled"}></label>` : `<label>Liczba rund <input data-pokemon-setting="rounds" type="number" min="1" max="20" value="${s.rounds || 5}" ${isHost ? "" : "disabled"}></label>`;
  const common = `<label>Czas odpowiedzi <input data-pokemon-setting="answerTime" type="number" min="5" max="60" value="${s.answerTime || 15}" ${isHost ? "" : "disabled"}></label>${room.gameMode === "pokemon-types" ? `<label>Czas wyboru typu <input data-pokemon-setting="selectTime" type="number" min="5" max="30" value="${s.selectTime || 10}" ${isHost ? "" : "disabled"}></label>` : ""}${roundOrHearts}${room.gameMode === "pokemon-evolution" ? `<label>Dozwolone kierunki<select data-pokemon-setting="evolutionMode" ${isHost ? "" : "disabled"}><option value="both" ${s.evolutionMode !== "later" ? "selected" : ""}>Wcześniejsze i późniejsze ewolucje</option><option value="later" ${s.evolutionMode === "later" ? "selected" : ""}>Tylko późniejsze ewolucje</option></select></label>` : ""}<div><p class="tiny">GENERACJE</p><div class="pokemon-types">${generations}</div></div>`;
  const auctionDisplay = room.gameMode === "pokemon-auction" ? `<div class="pokemon-auction-settings"><label>Budżet <input data-pokemon-setting="budget" type="number" min="10" max="500" value="${s.budget || 50}" ${isHost ? "" : "disabled"}></label><label>Wielkość teamu <input data-pokemon-setting="teamSize" type="number" min="2" max="10" value="${Math.max(2,Math.min(10,Number(s.teamSize)||6))}" ${isHost ? "" : "disabled"}></label><p class="tiny">Każdy Pokémon jest licytowany osobno, aż każdy gracz zapełni team.</p><label class="check"><input data-pokemon-setting="strongOnly" type="checkbox" ${s.strongOnly ? "checked" : ""} ${isHost ? "" : "disabled"}> Tylko mocniejsze Pokémony</label><label class="check"><input data-pokemon-setting="legendaries" type="checkbox" ${s.legendaries !== false ? "checked" : ""} ${isHost ? "" : "disabled"}> Legendy</label><label class="check"><input data-pokemon-setting="mythicals" type="checkbox" ${s.mythicals !== false ? "checked" : ""} ${isHost ? "" : "disabled"}> Mythical</label></div>` : "";
  return `<div class="pokemon-settings">${common}${auctionDisplay}<p class="tiny">Wszystkie fazy mają automatyczny limit czasu, więc brak ruchu nie zatrzyma pokoju.</p></div>`;
}

export function stopPokemonTimer() { window.clearTimeout(renderPokemonGame.timer); window.clearInterval(renderPokemonGame.countdown); renderPokemonGame.timer = null; renderPokemonGame.countdown = null; }
