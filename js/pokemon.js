import { pokemonDex } from "./pokemonData.js?v=20260804-2";
import { escapeHtml, icon } from "./utils.js?v=20260613-2";

export const pokemonTypes = ["normal", "fire", "water", "grass", "electric", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"];
const typeNames = { normal:"Normal", fire:"Fire", water:"Water", grass:"Grass", electric:"Electric", ice:"Ice", fighting:"Fighting", poison:"Poison", ground:"Ground", flying:"Flying", psychic:"Psychic", bug:"Bug", rock:"Rock", ghost:"Ghost", dragon:"Dragon", dark:"Dark", steel:"Steel", fairy:"Fairy" };
const clean = value => String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
const byName = new Map(pokemonDex.map(item => [clean(item.name), item]));
const randomItem = list => list[Math.floor(Math.random() * list.length)];
const filteredDex = settings => pokemonDex.filter(item => {
  const generations = Array.isArray(settings?.generations) && settings.generations.length ? settings.generations : [1,2,3,4,5,6,7,8,9];
  return generations.includes(item.generation) && (!settings?.strongOnly || item.bst >= 500) && (settings?.legendaries !== false || !item.legendary) && (settings?.mythicals !== false || !item.mythical);
});
const scoreMap = players => Object.fromEntries(players.map(uid => [uid, 0]));
const phaseEnd = seconds => Date.now() + Math.max(3, Number(seconds) || 15) * 1000;
const pokemon = text => byName.get(clean(text));
const label = item => item ? `${item.name} (#${item.id})` : "Nieznany Pokémon";

export const pokemonDefaults = {
  "pokemon-dex": { generations:[1,2,3,4,5,6,7,8,9], answerTime:15, rounds:5 },
  "pokemon-last-letter": { generations:[1,2,3,4,5,6,7,8,9], answerTime:15, rounds:10 },
  "pokemon-evolution": { generations:[1,2,3,4,5,6,7,8,9], answerTime:15, difficulty:"any", rounds:5 },
  "pokemon-auction": { generations:[1,2,3,4,5,6,7,8,9], budget:50, teamSize:6, auctionCount:12, strongOnly:false, legendaries:true, mythicals:true },
  "pokemon-types": { generations:[1,2,3,4,5,6,7,8,9], selectTime:10, answerTime:15, rounds:5 },
};

function candidates(settings) { return filteredDex(settings).filter(item => item.id <= 1025); }
function pickTarget(settings, used = []) { const pool = candidates(settings).filter(item => !used.includes(item.id)); return randomItem(pool.length ? pool : candidates(settings)); }

export function createPokemonGame(mode, players, settings) {
  const scores = scoreMap(players);
  if (mode === "pokemon-dex") return { mode, phase:"answers", round:1, scores, target:pickTarget(settings).id, answers:{}, phaseEndsAt:phaseEnd(settings.answerTime), usedTargets:[] };
  if (mode === "pokemon-last-letter") return { mode, phase:"chain", round:1, scores, order:[...players], turnIndex:0, chain:[], usedIds:[], phaseEndsAt:phaseEnd(settings.answerTime) };
  if (mode === "pokemon-evolution") { const base = pickTarget(settings); return { mode, phase:"answers", round:1, scores, baseId:base.id, answers:{}, phaseEndsAt:phaseEnd(settings.answerTime), usedTargets:[] }; }
  if (mode === "pokemon-auction") {
    const items = [...candidates(settings)].sort(() => Math.random() - .5).slice(0, Math.max(4, Number(settings.auctionCount) || 12));
    return { mode, phase:"auction", round:1, scores, teamSize:Number(settings.teamSize) || 6, items:items.map(item => item.id), auctionIndex:0, budgets:Object.fromEntries(players.map(uid => [uid, Number(settings.budget) || 50])), teams:Object.fromEntries(players.map(uid => [uid, []])), currentBid:0, highestBidder:"", passed:[], phaseEndsAt:phaseEnd(10) };
  }
  return { mode:"pokemon-types", phase:"choose", round:1, scores, selectedTypes:{}, blockedPairs:[], answers:{}, phaseEndsAt:phaseEnd(settings.selectTime) };
}

function finishDex(game, players) {
  const target = pokemonDex.find(item => item.id === game.target);
  const ranking = players.map(uid => ({ uid, answer:game.answers[uid] || null, difference:game.answers[uid] ? Math.abs(game.answers[uid].id - target.id) : Infinity })).sort((a,b) => a.difference - b.difference);
  ranking.forEach((row, index) => { if (Number.isFinite(row.difference)) game.scores[row.uid] += Math.max(1, players.length - index); });
  game.ranking = ranking; game.phase = "result";
}
function finishEvolution(game, players) {
  const base = pokemonDex.find(item => item.id === game.baseId);
  const ranking = players.map(uid => ({ uid, answer:game.answers[uid] || null, correct:Boolean(game.answers[uid] && game.answers[uid].evolutionChain === base.evolutionChain && game.answers[uid].id !== base.id) }));
  ranking.forEach(row => { if (row.correct) game.scores[row.uid] += 1; });
  game.ranking = ranking; game.phase = "result";
}
function finishTypes(game, players) {
  const picked = Object.values(game.selectedTypes);
  const ranking = players.map(uid => ({ uid, answer:game.answers[uid] || null, correct:Boolean(game.answers[uid] && picked.every(type => game.answers[uid].types.includes(type))) }));
  const winner = ranking.find(row => row.correct); if (winner) game.scores[winner.uid] += 1;
  game.ranking = ranking; game.phase = "result";
}
function settleAuction(game, players) {
  if (game.highestBidder) { const item = pokemonDex.find(row => row.id === game.items[game.auctionIndex]); game.budgets[game.highestBidder] -= game.currentBid; game.teams[game.highestBidder].push(item.id); }
  game.auctionIndex += 1; game.currentBid = 0; game.highestBidder = ""; game.passed = [];
  if (game.auctionIndex >= game.items.length || players.every(uid => game.teams[uid].length >= game.teamSize)) {
    const ranking = players.map(uid => ({ uid, bst:game.teams[uid].reduce((sum,id) => sum + (pokemonDex.find(row => row.id === id)?.bst || 0), 0), team:game.teams[uid] })).sort((a,b) => b.bst - a.bst);
    ranking.forEach((row,index) => { if (index === 0) game.scores[row.uid] += 3; }); game.ranking = ranking; game.phase = "result";
  } else game.phaseEndsAt = phaseEnd(10);
}

export const PokemonEngine = {
  answer(game, uid, text, players, settings) {
    const item = pokemon(text); if (!item) return "Wpisz poprawną nazwę Pokémona.";
    const pool = candidates(settings); if (!pool.some(row => row.id === item.id)) return "Ten Pokémon nie jest dostępny w wybranych generacjach.";
    if (game.mode === "pokemon-dex") { if (game.answers[uid]) return "Odpowiedź została już wysłana."; game.answers[uid] = item; if (Object.keys(game.answers).length >= players.length) finishDex(game, players); return; }
    if (game.mode === "pokemon-evolution") { if (game.answers[uid]) return "Odpowiedź została już wysłana."; game.answers[uid] = item; if (Object.keys(game.answers).length >= players.length) finishEvolution(game, players); return; }
    if (game.mode === "pokemon-types") { if (game.phase !== "answer") return "Najpierw wybierzcie typy."; if (!game.answers[uid] && game.selectedTypes && Object.values(game.selectedTypes).every(type => item.types.includes(type))) { game.answers[uid] = item; game.scores[uid] += 1; game.ranking = [{ uid, answer:item, correct:true }]; game.phase = "result"; } return; }
    if (game.mode === "pokemon-last-letter") {
      if (game.order[game.turnIndex] !== uid) return "Teraz odpowiada inny gracz.";
      const previous = game.chain.at(-1); const required = previous ? clean(previous.name).slice(-1) : "";
      if (required && !clean(item.name).startsWith(required)) return `Nazwa musi zaczynać się na literę ${required.toUpperCase()}.`;
      if (game.usedIds.includes(item.id)) return "Ten Pokémon już był użyty.";
      game.chain.push(item); game.usedIds.push(item.id); game.scores[uid] += 1; game.turnIndex += 1;
      if (game.turnIndex >= game.order.length * (Number(settings.rounds) || 10)) game.phase = "result"; else { game.turnIndex %= game.order.length; game.phaseEndsAt = phaseEnd(settings.answerTime); } return;
    }
  },
  timeout(game, uid, players, settings) {
    if (game.phase === "result") return;
    if (game.mode === "pokemon-dex") { finishDex(game, players); return; }
    if (game.mode === "pokemon-evolution") { finishEvolution(game, players); return; }
    if (game.mode === "pokemon-types") { if (game.phase === "choose") { const available = pokemonTypes.filter(type => !Object.values(game.selectedTypes).includes(type)); players.forEach(player => { if (!game.selectedTypes[player]) game.selectedTypes[player] = randomItem(available); }); game.phase = "answer"; game.phaseEndsAt = phaseEnd(settings.answerTime); } else finishTypes(game, players); return; }
    if (game.mode === "pokemon-last-letter") { game.turnIndex += 1; if (game.turnIndex >= game.order.length * (Number(settings.rounds) || 10)) game.phase = "result"; else { game.turnIndex %= game.order.length; game.phaseEndsAt = phaseEnd(settings.answerTime); } }
    if (game.mode === "pokemon-auction") settleAuction(game, players);
  },
  selectType(game, uid, type, players, settings) {
    if (game.phase !== "choose" || !pokemonTypes.includes(type)) return "Wybór typu jest już zamknięty.";
    if (game.selectedTypes[uid]) return "Typ został już wybrany.";
    game.selectedTypes[uid] = type;
    if (Object.keys(game.selectedTypes).length >= players.length) {
      const selected = [...new Set(Object.values(game.selectedTypes))]; const exists = candidates(settings).some(item => selected.every(itemType => item.types.includes(itemType)));
      if (!exists) { game.blockedPairs.push(selected.join("+")); game.selectedTypes = {}; game.phaseEndsAt = phaseEnd(settings.selectTime); }
      else { game.phase = "answer"; game.phaseEndsAt = phaseEnd(settings.answerTime); }
    }
  },
  bid(game, uid, amount, players) { if (game.phase !== "auction") return "Aukcja jest zakończona."; const bid = Number(amount), budget = Number(game.budgets[uid] || 0); if (!Number.isFinite(bid) || bid <= game.currentBid || bid > budget) return "Podaj wyższą stawkę, mieszczącą się w budżecie."; game.currentBid = bid; game.highestBidder = uid; game.passed = []; game.phaseEndsAt = phaseEnd(10); },
  pass(game, uid, players) { if (game.phase !== "auction") return "Aukcja jest zakończona."; if (!game.passed.includes(uid)) game.passed.push(uid); if (game.passed.length >= players.length - 1 || players.every(player => game.teams[player].length >= game.teamSize || game.budgets[player] <= game.currentBid)) settleAuction(game, players); },
  nextRound(game, players, settings) { if (game.phase !== "result") return "Runda jeszcze się nie zakończyła."; if (game.mode === "pokemon-dex") { game.round += 1; game.target = pickTarget(settings, game.usedTargets).id; game.usedTargets.push(game.target); game.answers = {}; game.ranking = []; game.phase = "answers"; game.phaseEndsAt = phaseEnd(settings.answerTime); } else if (game.mode === "pokemon-evolution") { game.round += 1; game.baseId = pickTarget(settings).id; game.answers = {}; game.ranking = []; game.phase = "answers"; game.phaseEndsAt = phaseEnd(settings.answerTime); } else if (game.mode === "pokemon-types") { game.round += 1; game.selectedTypes = {}; game.answers = {}; game.ranking = []; game.phase = "choose"; game.phaseEndsAt = phaseEnd(settings.selectTime); } else game.phase = "result"; }
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
function formMarkup(id, placeholder = "Nazwa Pokémona") { return `<form class="pokemon-answer-form" data-pokemon-form="${id}"><input id="pokemon-answer" autocomplete="off" placeholder="${placeholder}"><button class="primary" type="submit">Odpowiedz</button></form>`; }
function sprite(item, className = "") { return `<img class="${className}" src="${item.sprite}" alt="${escapeHtml(item.name)}" onerror="this.onerror=null;this.src='${item.spriteFallback}'">`; }
function resultMarkup(game, accounts, actions, title = "Wyniki rundy") { const rows = (game.ranking || []).map(row => { const team = Array.isArray(row.team) ? `<div class="pokemon-mini-team">${row.team.map(id => { const item = pokemonDex.find(pokemon => pokemon.id === id); return item ? sprite(item) : ""; }).join("")}</div>` : ""; return `<div class="pokemon-result-row"><div><b>${escapeHtml(accounts[row.uid]?.nick || "Gracz")}</b>${team}</div><span>${row.answer ? `${sprite(row.answer,"pokemon-result-sprite")} ${escapeHtml(label(row.answer))}` : row.bst != null ? `${row.bst} BST` : row.difference != null ? (Number.isFinite(row.difference) ? `różnica ${row.difference}` : "brak odpowiedzi") : row.correct ? "trafienie" : "-"}</span></div>`; }).join(""); return `<section class="panel pokemon-panel center"><p class="eyebrow">PODSUMOWANIE</p><h1>${title}</h1><div class="pokemon-results">${rows || "<p class=muted>Brak wyników.</p>"}</div><button class="primary" id="pokemon-next">Następna runda</button></section>`; }
function card(item, showBst = false) { return `<div class="pokemon-card">${sprite(item)}<div><b>${escapeHtml(item.name)}</b><small>#${item.id} · Gen ${item.generation} · ${item.types.map(type => typeNames[type] || type).join(" / ")}</small>${showBst ? `<strong>${item.bst} BST</strong>` : ""}</div></div>`; }

export function renderPokemonGame(root, { room, accounts, currentUser }, actions) {
  const game = room.game, settings = room.settings || pokemonDefaults[game.mode], current = game.mode === "pokemon-last-letter" ? game.order[game.turnIndex] : currentUser;
  let body = "";
  if (game.phase === "result") { root.innerHTML = `<main class="page pokemon-game-page enter">${resultMarkup(game, accounts, actions, game.mode === "pokemon-auction" ? "Wynik aukcji" : "Wyniki rundy")}</main>`; root.querySelector("#pokemon-next")?.addEventListener("click", actions.pokemonNextRound); return; }
  if (game.mode === "pokemon-dex") { const target = pokemonDex.find(item => item.id === game.target); body = `<p class="eyebrow">NAJBLIŻSZY NUMER POKEDEX</p><h1>Znajdź Pokémona najbliżej numeru</h1><div class="pokemon-target">#${target.id}</div><p class="muted">Wpisz nazwę, ale nie podawaj numeru Dex.</p>${timerMarkup(game)}${formMarkup("answer")}`; }
  if (game.mode === "pokemon-last-letter") { const previous = game.chain.at(-1); body = `<p class="eyebrow">OSTATNIA LITERA</p><h1>${current === currentUser ? "Twoja kolej" : `${escapeHtml(accounts[current]?.nick || "Gracz")} odpowiada`}</h1><p class="muted">${previous ? `Następny Pokémon zaczyna się na: ${clean(previous.name).slice(-1).toUpperCase()}` : "Zacznij łańcuch Pokémonów."}</p><div class="pokemon-chain">${game.chain.slice(-8).map(card).join("")}</div>${timerMarkup(game)}${current === currentUser ? formMarkup("answer") : "<p class=muted>Czekamy na odpowiedź gracza.</p>"}`; }
  if (game.mode === "pokemon-evolution") { const base = pokemonDex.find(item => item.id === game.baseId); body = `<p class="eyebrow">EVOLUTION RACE</p><h1>Znajdź ewolucję</h1>${card(base)}<p class="muted">Wpisz kolejną albo końcową ewolucję.</p>${timerMarkup(game)}${formMarkup("answer")}`; }
  if (game.mode === "pokemon-auction") { const item = pokemonDex.find(row => row.id === game.items[game.auctionIndex]); const budget = game.budgets[currentUser] || 0; body = `<p class="eyebrow">LICYTACJA TEAMU POKÉMONÓW</p><h1>Aukcja ${game.auctionIndex + 1}/${game.items.length}</h1>${card(item)}<p class="muted">Twoja oferta: ${game.currentBid}$ · Budżet: ${budget}$</p>${timerMarkup(game)}<form class="pokemon-bid-form"><input id="pokemon-bid" type="number" min="${game.currentBid + 1}" max="${budget}" placeholder="Oferta"><button class="primary" type="submit">Licytuj</button><button class="ghost" id="pokemon-pass" type="button">Pas</button></form>`; }
  if (game.mode === "pokemon-types") { body = game.phase === "choose" ? `<p class="eyebrow">WYBÓR TYPÓW I SZYBKA ODPOWIEDŹ</p><h1>Wybierz typ</h1><p class="muted">Każdy gracz wybiera jeden typ. Potem znajdźcie wspólnego Pokémona.</p>${timerMarkup(game)}<div class="pokemon-types">${pokemonTypes.map(type => `<button data-pokemon-type="${type}" ${game.selectedTypes[currentUser] ? "disabled" : ""}>${typeNames[type]}</button>`).join("")}</div>` : `<p class="eyebrow">ODPOWIEDŹ</p><h1>Znajdź Pokémona tych typów</h1><div class="pokemon-picked-types">${Object.values(game.selectedTypes).map(type => `<span>${typeNames[type]}</span>`).join("")}</div>${timerMarkup(game)}${formMarkup("answer")}`; }
  root.innerHTML = `<main class="page pokemon-game-page enter"><section class="panel pokemon-panel">${body}</section></main>`;
  if (game.mode === "pokemon-auction") body = body.replace("</form>", `${auctionStatusMarkup(game, accounts, currentUser)}</form>`);
  const expected = { phase:game.phase, phaseEndsAt:game.phaseEndsAt, round:game.round, mode:game.mode };
  const form = root.querySelector("[data-pokemon-form]"); form?.addEventListener("submit", event => { event.preventDefault(); actions.pokemonAnswer(root.querySelector("#pokemon-answer").value, expected); });
  root.querySelectorAll("[data-pokemon-type]").forEach(button => button.addEventListener("click", () => actions.pokemonSelectType(button.dataset.pokemonType, expected)));
  root.querySelector(".pokemon-bid-form")?.addEventListener("submit", event => { event.preventDefault(); actions.pokemonBid(root.querySelector("#pokemon-bid").value, expected); });
  root.querySelector("#pokemon-pass")?.addEventListener("click", () => actions.pokemonPass(expected));
  root.querySelector("#pokemon-next")?.addEventListener("click", actions.pokemonNextRound);
  window.clearTimeout(renderPokemonGame.timer); renderPokemonGame.timer = window.setTimeout(() => actions.pokemonTimeout(expected), Math.max(100, game.phaseEndsAt - Date.now() + 50));
}

export function renderPokemonLobbySettings(room, isHost) {
  const s = room.settings || pokemonDefaults[room.gameMode] || pokemonDefaults["pokemon-dex"];
  const generations = [1,2,3,4,5,6,7,8,9].map(generation => `<label class="check"><input data-pokemon-generation="${generation}" type="checkbox" ${(!s.generations || s.generations.includes(generation)) ? "checked" : ""} ${isHost ? "" : "disabled"}> Gen ${generation}</label>`).join("");
  const common = `<label>Czas odpowiedzi <input data-pokemon-setting="answerTime" type="number" min="5" max="60" value="${s.answerTime || 15}" ${isHost ? "" : "disabled"}></label>${room.gameMode === "pokemon-types" ? `<label>Czas wyboru typu <input data-pokemon-setting="selectTime" type="number" min="5" max="30" value="${s.selectTime || 10}" ${isHost ? "" : "disabled"}></label>` : ""}<label>Liczba rund <input data-pokemon-setting="rounds" type="number" min="1" max="20" value="${s.rounds || 5}" ${isHost ? "" : "disabled"}></label><div><p class="tiny">GENERACJE</p><div class="pokemon-types">${generations}</div></div>`;
  const auction = room.gameMode === "pokemon-auction" ? `<label>Budżet <input data-pokemon-setting="budget" type="number" min="10" max="500" value="${s.budget || 50}" ${isHost ? "" : "disabled"}></label><label>Pokémonów w teamie <input data-pokemon-setting="teamSize" type="number" min="2" max="10" value="${s.teamSize || 6}" ${isHost ? "" : "disabled"}></label><label>Pokémonów na aukcji <input data-pokemon-setting="auctionCount" type="number" min="4" max="30" value="${s.auctionCount || 12}" ${isHost ? "" : "disabled"}></label><label class="check"><input data-pokemon-setting="strongOnly" type="checkbox" ${s.strongOnly ? "checked" : ""} ${isHost ? "" : "disabled"}> Tylko mocniejsze Pokémony</label><label class="check"><input data-pokemon-setting="legendaries" type="checkbox" ${s.legendaries !== false ? "checked" : ""} ${isHost ? "" : "disabled"}> Legendy</label><label class="check"><input data-pokemon-setting="mythicals" type="checkbox" ${s.mythicals !== false ? "checked" : ""} ${isHost ? "" : "disabled"}> Mythical</label>` : "";
  return `<div class="pokemon-settings">${common}${auction}<p class="tiny">Wszystkie fazy mają automatyczny limit czasu, więc brak ruchu nie zatrzyma pokoju.</p></div>`;
}

export function stopPokemonTimer() { window.clearTimeout(renderPokemonGame.timer); renderPokemonGame.timer = null; }
