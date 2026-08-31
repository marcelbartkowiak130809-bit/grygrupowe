import { impostorCategories, impostorWords } from "../content/impostor/words.js?v=20260605-2";
import { $, escapeHtml, icon, normalizeAnswer, playerMiniHtml } from "./utils.js?v=20260822-1";
import { Audio } from "./audio.js";
import { Effects } from "./effects.js";
import { botTooltip } from "./bots.js?v=20260823-2";
import { inGamePurchaseById } from "./gamePasses.js?v=20260831-3";

let timerId;
let lastCountdown;
let lastTimeoutKey = "";
let timerRunId = 0;
const clueReviewMs = 5000;
export const impostorDefaults = { impostorCount:1, whiteEnabled:false, whiteCount:0, clueTime:20, minRounds:2, chatEnabled:true, category:"Wszystkie", categories:["Jedzenie","Gry","Filmy i seriale"] };
export const maxSpecialRoles = playerCount => Math.floor(playerCount / 2);
export const impostorCategoryCounts = Object.fromEntries(impostorCategories.map(category => [category, impostorWords.filter(item => item.category === category).length]));

const shuffled = items => [...items].sort(() => Math.random() - .5);
const now = () => Date.now();
const roleLabel = role => ({ citizen:"Obywatel", impostor:"Impostor", white:"Pan Biały" })[role];
const objectOrEmpty = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const arrayOrEmpty = value => Array.isArray(value) ? value : [];
function categoryUsage(settings = {}) {
  return settings.categoryUsage && typeof settings.categoryUsage === "object" && !Array.isArray(settings.categoryUsage) ? { ...settings.categoryUsage } : {};
}
function bumpCategoryUsage(usage, category) {
  if (category) usage[category] = Number(usage[category] || 0) + 1;
  return usage;
}
function playerMini(profile={}) {
  return `${profile?.isBot ? `<span class="bot-player-mark" ${botTooltip} aria-label="Bot eksperymentalny">🤖</span>` : ""}${playerMiniHtml(profile)}`;
}
function normalizeImpostorGame(game, players = []) {
  game.roles = objectOrEmpty(game.roles);
  game.roleRequests = objectOrEmpty(game.roleRequests);
  game.rolePurchaseResults = objectOrEmpty(game.rolePurchaseResults);
  game.rolePurchaseRefunds = objectOrEmpty(game.rolePurchaseRefunds);
  game.rolePurchaseRefundsClaimed = objectOrEmpty(game.rolePurchaseRefundsClaimed);
  game.acknowledged = objectOrEmpty(game.acknowledged);
  game.reactions = objectOrEmpty(game.reactions);
  game.reactionCooldowns = objectOrEmpty(game.reactionCooldowns);
  game.continueVotes = objectOrEmpty(game.continueVotes);
  game.votes = objectOrEmpty(game.votes);
  game.chat = arrayOrEmpty(game.chat);
  game.clues = arrayOrEmpty(game.clues);
  game.turnOrder = Array.isArray(game.turnOrder) ? game.turnOrder : Object.keys(game.turnOrder || {});
  if (!game.turnOrder.length) game.turnOrder = players.length ? [...players] : Object.keys(game.roles);
  if (!Number.isFinite(Number(game.turnIndex))) game.turnIndex = 0;
  if (!Number.isFinite(Number(game.continueCount))) game.continueCount = 0;
  return game;
}

export function sanitizeImpostorSettings(settings, playerCount) {
  const max = Math.max(1, maxSpecialRoles(playerCount));
  const impostorCount = Math.max(1, Math.min(Number(settings.impostorCount) || 1, max));
  const whiteEnabled = Boolean(settings.whiteEnabled);
  const whiteCount = whiteEnabled ? Math.max(0, Math.min(Number(settings.whiteCount) || 1, max - impostorCount)) : 0;
  const rawCategories = Array.isArray(settings.categories) ? settings.categories : settings.category && settings.category !== "Wszystkie" ? [settings.category] : impostorDefaults.categories;
  const categories = [...new Set(rawCategories.filter(name => impostorCategories.includes(name)))];
  impostorCategories.forEach(name => { if (categories.length < 3 && !categories.includes(name)) categories.push(name); });
  return { ...impostorDefaults, ...settings, category:categories.length === impostorCategories.length ? "Wszystkie" : categories[0] || "Wszystkie", categories, impostorCount, whiteEnabled: whiteEnabled && whiteCount > 0, whiteCount, clueTime:Math.max(10,Math.min(30,Number(settings.clueTime)||20)), minRounds:Math.max(1,Math.min(5,Number(settings.minRounds)||2)) };
}

export function createImpostorGame(players, rawSettings) {
  const settings = sanitizeImpostorSettings(rawSettings, players.length);
  const selectedPool = settings.categories?.length ? impostorWords.filter(item => settings.categories.includes(item.category)) : impostorWords;
  const pool = selectedPool.length ? selectedPool : impostorWords;
  const words = pool[Math.floor(Math.random() * pool.length)];
  const usage = bumpCategoryUsage(categoryUsage(settings), words.category);
  const assigned = shuffled(players), roles = {};
  assigned.forEach((uid,index) => roles[uid] = index < settings.impostorCount ? { role:"impostor", word:words.impostor } : index < settings.impostorCount + settings.whiteCount ? { role:"white", word:null } : { role:"citizen", word:words.main });
  const order = shuffled(players);
  return { phase:"roleReveal", category:words.category, mainWord:words.main, impostorWord:words.impostor, categoryUsage:usage, roles, roleRequests:{}, rolePurchaseResults:{}, rolePurchaseRefunds:{}, rolePurchaseRefundsClaimed:{}, acknowledged:{}, turnOrder:order, turnIndex:0, round:1, clues:[], chat:[], reactions:{}, reactionCooldowns:{}, continueVotes:{}, continueCount:0, votes:{}, result:null, phaseEndsAt:now()+15000 };
}

function startClues(game, settings) { game.phase="clues"; game.phaseEndsAt=now()+settings.clueTime*1000; }
function startVoting(game) { game.phase="voting"; game.votes={}; game.phaseEndsAt=now()+15000; }
function startDecision(game) { game.phase="continueDecision"; game.continueVotes={}; game.phaseEndsAt=now()+10000; }
function startClueReview(game) { game.phase="clueReview"; game.phaseEndsAt=now()+clueReviewMs; }
function nextClueTurn(game, settings) {
  game.turnIndex += 1;
  if (game.turnIndex >= game.turnOrder.length) {
    game.turnIndex = 0;
    if (game.round >= settings.minRounds) return startClueReview(game);
    game.round += 1;
  }
  game.phaseEndsAt=now()+settings.clueTime*1000;
}
function finishDecision(game,settings) {
  normalizeImpostorGame(game);
  const continueVotes=Object.values(game.continueVotes).filter(Boolean).length;
  if (game.continueCount >= 3 || continueVotes <= game.turnOrder.length / 2) return startVoting(game);
  game.continueCount += 1; game.round += 1; game.turnIndex=0; startClues(game,settings);
}
function finishVote(game) {
  normalizeImpostorGame(game);
  const counts={}; Object.values(game.votes).forEach(uid=>counts[uid]=(counts[uid]||0)+1);
  const expelled=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0] || game.turnOrder[0];
  const revealed=game.roles[expelled] || { role:"citizen", word:game.mainWord || "" };
  if (revealed.role === "impostor") {
    game.phase="finalGuess";
    game.phaseEndsAt=now()+15000;
    game.result={ expelled, revealedRole:revealed.role, revealedWord:revealed.word, citizensWin:true, counts, finalGuess:null };
    return;
  }
  game.phase="results"; game.phaseEndsAt=null; game.result={ expelled, revealedRole:revealed.role, revealedWord:revealed.word, citizensWin:revealed.role!=="citizen", counts };
}
function finishFinalGuess(game, guess = "", surrendered = false) {
  normalizeImpostorGame(game);
  const result = game.result || {};
  const correct = !surrendered && normalizeAnswer(guess) === normalizeAnswer(game.mainWord || "");
  game.phase="results";
  game.phaseEndsAt=null;
  game.result={ ...result, citizensWin:!correct, finalGuess:{ text:String(guess||"").trim(), correct, surrendered, mainWord:game.mainWord || "" } };
}

export const ImpostorEngine = {
  acknowledge(game,uid,settings){ normalizeImpostorGame(game); game.acknowledged[uid]=true; if(Object.keys(game.acknowledged).length>=game.turnOrder.length) startClues(game,settings); },
  buyRole(game,uid,requestedRole,settings){
    normalizeImpostorGame(game);
    if(game.phase!=="roleReveal") return "Wybor roli jest mozliwy tylko przed startem gry.";
    if(game.rolePurchaseResults[uid]) return "Wykorzystałeś już wybór roli.";
    const allowed = requestedRole === "citizen" || requestedRole === "impostor" || (requestedRole === "white" && settings.whiteEnabled && Number(settings.whiteCount) > 0);
    if(!allowed) return "Ta rola nie jest dostępna w tym pokoju.";
    const requests = Array.isArray(game.roleRequests[requestedRole]) ? game.roleRequests[requestedRole] : [];
    if(requests.includes(uid)) return "Wykorzystałeś już wybór roli.";
    const originalRole = game.roles[uid] || { role:"citizen", word:game.mainWord || "" };
    game.roleRequests[requestedRole] = [...requests,uid];
    if(!requests.length){
      const holder = game.turnOrder.find(player => player !== uid && game.roles[player]?.role === requestedRole);
      if(holder){ game.roles[uid] = game.roles[holder]; game.roles[holder] = originalRole; }
      else game.roles[uid] = { role:requestedRole, word:requestedRole === "impostor" ? game.impostorWord : null };
      return;
    }
    const contenders = [...requests,uid], winner = contenders[Math.floor(Math.random()*contenders.length)];
    contenders.forEach(player => { game.rolePurchaseResults[player] = player === winner ? "won" : "lost"; });
    const currentWinner = game.roles[winner] || { role:"citizen", word:game.mainWord || "" };
    const currentHolder = game.turnOrder.find(player => player !== winner && game.roles[player]?.role === requestedRole);
    if(currentHolder && currentHolder !== winner){ game.roles[winner] = game.roles[currentHolder]; game.roles[currentHolder] = currentWinner; }
    else game.roles[winner] = { role:requestedRole, word:requestedRole === "impostor" ? game.impostorWord : null };
    contenders.filter(player => player !== winner).forEach(player => { game.rolePurchaseRefunds[player] = true; });
  },
  clue(game,uid,text,settings){
    normalizeImpostorGame(game);
    if(game.phase!=="clues"||game.turnOrder[game.turnIndex]!==uid) return "To nie jest twoja tura.";
    const clean=normalizeAnswer(text); if(!clean) return "Wpisz podpowiedź.";
    if(mainWordIncluded(game,text)) return "Podpowiedź nie może zawierać tajnego hasła.";
    game.clues.push({ uid,text:text.trim(),round:game.round }); nextClueTurn(game,settings);
  },
  timeout(game,settings){
    normalizeImpostorGame(game);
    if(game.phase==="roleReveal") startClues(game,settings);
    else if(game.phase==="clues"){ game.clues.push({uid:game.turnOrder[game.turnIndex],text:"brak odpowiedzi",round:game.round,missed:true}); nextClueTurn(game,settings); }
    else if(game.phase==="clueReview") startDecision(game);
    else if(game.phase==="continueDecision") finishDecision(game,settings);
    else if(game.phase==="voting") finishVote(game);
    else if(game.phase==="finalGuess") finishFinalGuess(game,"",true);
  },
  decide(game,uid,keepPlaying,settings){ normalizeImpostorGame(game); if(game.phase!=="continueDecision"||uid in game.continueVotes)return; game.continueVotes[uid]=keepPlaying; if(Object.keys(game.continueVotes).length>=game.turnOrder.length)finishDecision(game,settings); },
  vote(game,uid,target){ normalizeImpostorGame(game); if(game.phase!=="voting"||uid in game.votes)return; game.votes[uid]=target; if(Object.keys(game.votes).length>=game.turnOrder.length)finishVote(game); },
  finalGuess(game,uid,text){ normalizeImpostorGame(game); if(game.phase!=="finalGuess")return "Teraz nie ma ostatniej szansy."; if(game.result?.expelled!==uid)return "Tylko wyrzucony impostor moze zgadywac."; if(!String(text||"").trim())return "Wpisz haslo albo poddaj sie."; finishFinalGuess(game,text,false); },
  finalSurrender(game,uid){ normalizeImpostorGame(game); if(game.phase!=="finalGuess")return "Teraz nie ma ostatniej szansy."; if(game.result?.expelled!==uid)return "Tylko wyrzucony impostor moze sie poddac."; finishFinalGuess(game,"",true); },
  react(game,uid,text){ normalizeImpostorGame(game); const current=now(); if((game.reactionCooldowns[uid]||0)>current)return false; game.reactionCooldowns[uid]=current+5000; game.reactions[uid]={text,expiresAt:current+2600}; return true; },
  chat(game,uid,text){ normalizeImpostorGame(game); if(!text.trim())return; if(mainWordIncluded(game,text))return "Nie możesz wysłać wiadomości zawierającej tajne hasło."; game.chat.push({uid,text:text.trim(),createdAt:now()}); },
};
function mainWordIncluded(game,text){ const value=normalizeAnswer(text); return Boolean(game.mainWord && value.includes(normalizeAnswer(game.mainWord))); }

export function renderImpostorLobbySettings(room,isHost) {
  const settings=sanitizeImpostorSettings(room.settings,room.players.length), max=maxSpecialRoles(room.players.length);
  const selected = new Set(settings.categories || []);
  const usage = room.game?.categoryUsage || room.settings?.categoryUsage || {};
  const categoryBadge = name => `<span class="category-count">${Number(usage[name] || 0)}/${impostorCategoryCounts[name] || 0}</span>`;
  return `<p class="muted">Specjalne role moga zajmowac maksymalnie 50% miejsc. Teraz: ${settings.impostorCount+settings.whiteCount}/${max}.</p>
  <div class="impostor-settings-grid">
    <label>Impostorzy <select data-impostor-setting="impostorCount" ${isHost?"":"disabled"}>${[1,2,3,4].map(n=>`<option value="${n}" ${settings.impostorCount===n?"selected":""}>${n}</option>`).join("")}</select></label>
    <label class="check"><input data-impostor-setting="whiteEnabled" type="checkbox" ${settings.whiteEnabled?"checked":""} ${isHost?"":"disabled"}> Pan Bialy</label>
    <label>Panowie Biali <select data-impostor-setting="whiteCount" ${isHost&&settings.whiteEnabled?"":"disabled"}>${[1,2,3,4].map(n=>`<option value="${n}" ${settings.whiteCount===n?"selected":""}>${n}</option>`).join("")}</select></label>
    <label>Czas podpowiedzi <b>${settings.clueTime}s</b><input data-impostor-setting="clueTime" type="range" min="10" max="30" value="${settings.clueTime}" ${isHost?"":"disabled"}></label>
    <label>Minimum kolejek <select data-impostor-setting="minRounds" ${isHost?"":"disabled"}>${[1,2,3,4,5].map(n=>`<option value="${n}" ${settings.minRounds===n?"selected":""}>${n}</option>`).join("")}</select></label>
    <label class="check"><input data-impostor-setting="chatEnabled" type="checkbox" ${settings.chatEnabled?"checked":""} ${isHost?"":"disabled"}> Czat w grze</label>
  </div>
  <div class="category-picker impostor-category-picker"><p class="tiny">Kategorie hasel: wybierz minimum 3, bez limitu.</p>${impostorCategories.map(name=>`<label class="check category-chip"><span><input data-impostor-category="${escapeHtml(name)}" type="checkbox" ${selected.has(name)?"checked":""} ${isHost?"":"disabled"}> ${escapeHtml(name)}</span>${categoryBadge(name)}</label>`).join("")}</div>`;
}
function roleCard(game,currentUser,accounts){
  const role=game.roles[currentUser]; if(!role)return "";
  const acknowledged=game.acknowledged?.[currentUser];
  return `<section class="panel role-card role-${role.role}"><div class="role-owner">${playerMini(accounts[currentUser])}</div><p class="eyebrow">TAJNA ROLA</p><h1>${roleLabel(role.role)}</h1>${role.word?`<p>Twoje słowo:</p><strong>${escapeHtml(role.word)}</strong>`:'<strong>Nie dostajesz słowa.</strong><p>Obserwuj podpowiedzi i spróbuj się wpasować.</p>'}<button class="primary" id="ack-role" ${acknowledged?"disabled":""}>${acknowledged?"Zapamiętane · czekamy na resztę":"Zapamiętałem"}</button></section>`;
}
function timer(game){const left=Math.max(0,Math.ceil(((game.phaseEndsAt||now())-now())/1000));return `<div class="timer-box ${left<=5?"timer-urgent":""}">${icon("timer",22)}<b id="impostor-timer">${left}s</b></div>`;}
function playerRail(game,accounts){
  const reactions = game.reactions || {};
  return `<section class="impostor-players">${game.turnOrder.map((uid,index)=>`<article class="impostor-player ${game.phase==="clues"&&index===game.turnIndex?"active-turn":""}" data-player-uid="${escapeHtml(uid)}">${playerMini(accounts[uid])}${reactions[uid]?.expiresAt>now()?`<span class="reaction-bubble">${reactions[uid].text}</span>`:""}<small>${index+1}</small></article>`).join("")}</section>`;
}
function clues(game,accounts){return `<div class="clue-list">${game.clues.map(clue=>`<div class="clue ${clue.missed?"missed":""}"><b>${escapeHtml(accounts[clue.uid]?.nick||"Gracz")}</b><span>${escapeHtml(clue.text)}</span><small>R${clue.round}</small></div>`).join("")||'<p class="muted">Pierwsza podpowiedź dopiero przed nami.</p>'}</div>`;}
function chat(game,accounts){return `<aside class="panel impostor-chat"><h3>Czat</h3><div class="chat-messages">${game.chat.map(msg=>`<p><b>${escapeHtml(accounts[msg.uid]?.nick||"Gracz")}:</b> ${escapeHtml(msg.text)}</p>`).join("")||'<p class="muted">Brak wiadomości.</p>'}</div><form id="chat-form"><input id="chat-input" placeholder="Napisz wiadomość..."><button>Wyślij</button></form></aside>`;}

function roleRevealSummary(game,accounts){
  return `<div class="role-reveal-grid">${game.turnOrder.map(uid=>{const role=game.roles[uid]||{role:"citizen",word:game.mainWord||""};return `<article class="role-reveal-card role-${role.role}">${playerMini(accounts[uid])}<strong>${roleLabel(role.role)}</strong><span>${role.word?escapeHtml(role.word):"bez slowa"}</span></article>`;}).join("")}</div>`;
}
function finalGuessPanel(game,accounts,currentUser,expelled){
  return `<section class="panel center result-card"><p class="eyebrow">OSTATNIA SZANSA IMPOSTORA</p><h1>${escapeHtml(accounts[expelled]?.nick||"Impostor")} zgaduje haslo</h1>${timer(game)}<p class="muted">Impostor zostal wyglosowany, ale ma 15 sekund. Jesli trafi haslo obywateli, mimo glosowania wygrywa.</p><div class="result-focus-player">${playerMini(accounts[expelled])}</div>${currentUser===expelled?`<form id="impostor-final-guess" class="answer-form"><input id="impostor-final-input" placeholder="wpisz haslo obywateli" autocomplete="off"><button class="primary">Zgadnij</button></form><button class="ghost" id="impostor-final-surrender">Poddaje sie</button>`:'<p>Czekamy na decyzje wyrzuconego impostora...</p>'}</section>`;
}
function rolePurchasePanel(game,currentUser,settings,account={}){
  const purchase=inGamePurchaseById("impostor-role"), requested=Object.values(game.roleRequests||{}).some(list=>Array.isArray(list)&&list.includes(currentUser));
  if(!purchase || requested) return requested ? `<section class="panel role-purchase-panel"><p class="eyebrow">ZAKUP W GRZE</p><b>Wybrana rola oczekuje na losowanie.</b><p class="tiny">Jeśli więcej osób wybierze tę samą rolę, gra rozstrzygnie to losowo.</p></section>` : "";
  const enough=Number(account?.money||account?.sessionMoney||0)>=purchase.price;
  return `<section class="panel role-purchase-panel"><p class="eyebrow">DODATKOWA OPCJA</p><h3>Wybierz rolę · ${purchase.price}$</h3><p class="tiny">Jednorazowy zakup jest prywatny. Przy dwóch chętnych na tę samą rolę gra losuje zwycięzcę.</p><div class="choice-row"><button class="ghost" data-impostor-role="citizen" ${enough?"":"disabled"}>🙂 Obywatel</button><button class="ghost" data-impostor-role="impostor" ${enough?"":"disabled"}>🎭 Impostor</button>${settings.whiteEnabled&&Number(settings.whiteCount)>0?`<button class="ghost" data-impostor-role="white" ${enough?"":"disabled"}>⚪ Pan Biały</button>`:""}</div>${enough?"":"<small class=\"tiny\">Za mało monet na ten zakup.</small>"}</section>`;
}
export function stopImpostorTimer(){clearInterval(timerId);timerId=null;lastCountdown=null;timerRunId += 1;}
export function renderImpostorGame(root,{room,accounts,currentUser},actions){
  stopImpostorTimer(); const game=normalizeImpostorGame(room.game, Array.isArray(room.players) ? room.players : Object.keys(room.players || {}));
  const role=game.roles[currentUser] || { role:"citizen", word:game.mainWord || "" }, current=game.turnOrder[game.turnIndex] || game.turnOrder[0], voted=currentUser in (game.votes||{}), decided=currentUser in (game.continueVotes||{});
  const result = game.result || {}, resultCounts = result.counts || {}, expelled = result.expelled || game.turnOrder[0] || currentUser;
  const revealedRole = result.revealedRole || game.roles[expelled]?.role || "citizen", revealedWord = result.revealedWord ?? game.roles[expelled]?.word;
  const citizensWin = result.citizensWin ?? revealedRole !== "citizen";
  if(game.phase==="roleReveal"){root.innerHTML=`<main class="page impostor-page impostor-board role-board-${role.role} board-shell">${playerRail(game,accounts)}${roleCard(game,currentUser,accounts)}${room.settings.gamePurchases!==false?rolePurchasePanel(game,currentUser,room.settings,accounts[currentUser]):""}<p class="center muted">${Object.keys(game.acknowledged).length}/${game.turnOrder.length} graczy zna już swoją rolę.</p><div class="center"><button class="ghost" id="leave-room">Wyjdź z pokoju</button></div></main>`;$("#ack-role")?.addEventListener("click",actions.impostorAcknowledgeRole);root.querySelectorAll("[data-impostor-role]").forEach(button=>button.addEventListener("click",()=>actions.impostorBuyRole(button.dataset.impostorRole)));$("#leave-room").addEventListener("click",actions.leaveRoom);return;}
  const phasePanel=game.phase==="clues"?`<section class="panel impostor-main"><div class="game-top"><div><p class="eyebrow">RUNDA ${game.round}</p><h2>Podpowiada: ${escapeHtml(accounts[current]?.nick||"Gracz")}</h2></div>${timer(game)}</div>${current===currentUser?'<form id="clue-form" class="answer-form"><input id="clue-input" placeholder="jedno słowo lub krótka podpowiedź" autocomplete="off"><button class="primary">Dodaj</button></form>':'<p class="muted">Czekamy na podpowiedź...</p>'}${clues(game,accounts)}</section>`
  :game.phase==="clueReview"?`<section class="panel impostor-main center"><div class="game-top"><div><p class="eyebrow">OSTATNIA PODPOWIEDZ</p><h2>Za chwile decyzja ekipy</h2></div>${timer(game)}</div><p class="muted">Macie 5 sekund, zeby zobaczyc ostatnia podpowiedz przed wyborem: glosowanie czy gramy dalej.</p>${clues(game,accounts)}</section>`
  :game.phase==="continueDecision"?`<section class="panel center"><p class="eyebrow">DECYZJA EKIPY</p><h1>Głosujemy?</h1>${timer(game)}<p class="muted">Możecie zagrać dalej jeszcze ${3-game.continueCount} razy.</p>${decided?'<p>Twój głos został zapisany.</p>':'<div class="choice-row"><button class="danger" id="vote-now">Głosujemy</button><button class="primary" id="keep-playing">Gramy dalej</button></div>'}</section>`
  :game.phase==="finalGuess"?finalGuessPanel(game,accounts,currentUser,expelled)
  :game.phase==="voting"?`<section class="panel center"><p class="eyebrow">GŁOSOWANIE</p><h1>Kto jest podejrzany?</h1>${timer(game)}${voted?'<p>Twój głos został zapisany.</p>':`<div class="vote-grid">${room.players.map(uid=>`<button data-vote-player="${uid}">${playerMini(accounts[uid])}</button>`).join("")}</div>`}</section>`
  :`<section class="panel center result-card"><p class="eyebrow">WYNIK</p><h1>${citizensWin?"Obywatele wygrywają!":"Specjalne role wygrywają!"}</h1><p>Wyrzucony gracz:</p><div class="result-focus-player">${playerMini(accounts[expelled])}</div><div class="revealed-role">${roleLabel(revealedRole)}${revealedWord?` · ${escapeHtml(revealedWord)}`:" · bez słowa"}</div><div class="vote-results">${Object.entries(resultCounts).map(([uid,count])=>`<span>${escapeHtml(accounts[uid]?.nick||"Gracz")}: <b>${count}</b></span>`).join("")}</div>${revealedRole!=="impostor"?`<h3>Ujawnione role</h3>${roleRevealSummary(game,accounts)}`:""}<p class="money-pop">Zwycięzcy dostają +150$</p><button class="primary" id="impostor-again">Zagraj ponownie</button></section>`;
  root.innerHTML=`<main class="page impostor-page impostor-board role-board-${role.role} board-shell"><section class="panel secret-strip"><span>Twoja rola: <b>${roleLabel(role.role)}</b></span><span>${role.word?`Słowo: <b>${escapeHtml(role.word)}</b>`:"Bez tajnego słowa"}</span></section>${playerRail(game,accounts)}<div class="impostor-layout"><div>${phasePanel}</div>${room.settings.chatEnabled?chat(game,accounts):""}</div><button class="ghost leave-game" id="leave-room">Wyjdź z pokoju</button></main>`;
  if(game.phase==="results")Effects.play(citizensWin?"citizensWin":"impostorWin",`${room.roomId}:impostor:${expelled}`);
  $("#leave-room").addEventListener("click",actions.leaveRoom);$("#clue-form")?.addEventListener("submit",e=>{e.preventDefault();actions.impostorSubmitClue($("#clue-input").value);});$("#vote-now")?.addEventListener("click",()=>actions.impostorDecision(false));$("#keep-playing")?.addEventListener("click",()=>actions.impostorDecision(true));root.querySelectorAll("[data-vote-player]").forEach(b=>b.addEventListener("click",()=>actions.impostorVote(b.dataset.votePlayer)));root.querySelectorAll("[data-reaction]").forEach(b=>b.addEventListener("click",()=>actions.impostorReact(b.dataset.reaction)));$("#chat-form")?.addEventListener("submit",async e=>{e.preventDefault();const input=$("#chat-input"),text=input.value;if(await actions.impostorChat(text)!==false)input.value="";});$("#impostor-final-guess")?.addEventListener("submit",e=>{e.preventDefault();actions.impostorFinalGuess($("#impostor-final-input").value);});$("#impostor-final-surrender")?.addEventListener("click",actions.impostorFinalSurrender);$("#impostor-again")?.addEventListener("click",actions.impostorPlayAgain);if(["clues","clueReview","continueDecision","voting","finalGuess"].includes(game.phase))startTimer(actions,game);
}
export function renderImpostorGameStable(root,{room,accounts,currentUser},actions){
  if(room.game?.phase!=="roleReveal")return renderImpostorGame(root,{room,accounts,currentUser},actions);
  stopImpostorTimer();
  const game=normalizeImpostorGame(room.game, Array.isArray(room.players) ? room.players : Object.keys(room.players || {}));
  if(game.rolePurchaseRefunds?.[currentUser] && !game.rolePurchaseRefundsClaimed?.[currentUser]) window.setTimeout(()=>actions.impostorClaimRoleRefund?.(),0);
  const role=game.roles[currentUser] || { role:"citizen", word:game.mainWord || "" };
  if(!game.phaseEndsAt)game.phaseEndsAt=now()+15000;
  root.innerHTML=`<main class="page impostor-page impostor-board role-board-${role.role} board-shell">${playerRail(game,accounts)}${roleCard(game,currentUser,accounts)}${room.settings.gamePurchases!==false?rolePurchasePanel(game,currentUser,room.settings,accounts[currentUser]):""}<div class="center">${timer(game)}</div><p class="center muted">${Object.keys(game.acknowledged||{}).length}/${game.turnOrder.length} graczy zna już swoją rolę.</p><p class="center tiny">Gra ruszy automatycznie po 15 sekundach.</p><div class="center"><button class="ghost" id="leave-room">Wyjdź z pokoju</button></div></main>`;
  $("#ack-role")?.addEventListener("click",actions.impostorAcknowledgeRole);
  root.querySelectorAll("[data-impostor-role]").forEach(button=>button.addEventListener("click",()=>actions.impostorBuyRole(button.dataset.impostorRole)));
  $("#leave-room")?.addEventListener("click",actions.leaveRoom);
  startTimer(actions,game);
}
function startTimer(actions,game){
  stopImpostorTimer();
  const endsAt=Number(game?.phaseEndsAt||0);
  if(!endsAt)return;
  const runId=timerRunId;
  const timeoutGuard={phase:game?.phase||"",phaseEndsAt:endsAt,round:game?.round||0,turnIndex:game?.turnIndex??""};
  const timeoutKey=`${timeoutGuard.phase}:${timeoutGuard.phaseEndsAt}:${timeoutGuard.round}:${timeoutGuard.turnIndex}`;
  const finish=()=>{
    if(runId!==timerRunId||lastTimeoutKey===timeoutKey)return;
    lastTimeoutKey=timeoutKey;
    window.setTimeout(()=>{if(runId===timerRunId)actions.impostorTimeout(timeoutGuard);},0);
  };
  const tick=()=>{
    if(runId!==timerRunId)return;
    const timer=$("#impostor-timer");
    if(!timer){clearInterval(timerId);timerId=null;return;}
    const left=Math.max(0,Math.ceil((endsAt-Date.now())/1000));
    timer.textContent=`${left}s`;
    timer.parentElement?.classList.toggle("timer-urgent",left<=5);
    if(left>0&&left<=3&&lastCountdown!==left){lastCountdown=left;Audio.play("countdown");}
    if(left<=0){clearInterval(timerId);timerId=null;finish();}
  };
  tick();
  if(runId===timerRunId)timerId=window.setInterval(tick,250);
}
