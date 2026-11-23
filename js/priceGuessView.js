import { escapeHtml, playerMiniHtml, resultPlayerMiniHtml } from "./utils.js?v=20261121-8";
import { serverNow } from "./firebase.js?v=20261123-20";
import { patchRoomView } from "./roomViewPatch.js?v=20261119-15";
import { priceGuessSourceDate, priceGuessItems } from "./priceGuessData.js?v=20261122-6";
import { currentPriceGuessItem, priceGuessCategories, priceGuessHasAnswer, priceGuessRanking, priceGuessRoundOptions, priceGuessSettings, priceGuessTimeOptions } from "./priceGuess.js?v=20261122-6";

const formatter = new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN",minimumFractionDigits:0,maximumFractionDigits:2});
const currency = cents => formatter.format(cents/100);
let timer;

export function stopPriceGuessTimer() {
  clearInterval(timer);
  timer = null;
}

export function renderPriceGuessLobby(room,isHost) {
  const settings = priceGuessSettings(room.settings);
  const count = priceGuessItems.filter(item=>settings.priceCategories.includes(item.category)).length;
  const rounds = [...new Set([...priceGuessRoundOptions.filter(n=>n<=count), settings.rounds])].sort((a,b)=>a-b);
  const choices = (values,selected,suffix="") => values.map(n=>`<option value="${n}" ${selected===n?"selected":""}>${n}${suffix}</option>`).join("");
  const disabled = isHost?"":"disabled";
  return `<div class="impostor-settings-grid price-lobby">
    <label>Liczba rund<select data-price-setting="rounds" ${disabled}>${choices(rounds,settings.rounds)}</select></label>
    <label>Czas na strzał<select data-price-setting="priceSeconds" ${disabled}>${choices(priceGuessTimeOptions,settings.priceSeconds," s")}</select></label>
    <div class="most-category-box"><b>Kategorie produktów</b><div class="multi-category-list">
      ${Object.entries(priceGuessCategories).map(([id,category])=>`<label class="check category-chip">
        <input type="checkbox" data-price-category="${id}" ${settings.priceCategories.includes(id)?"checked":""}
          ${!isHost||settings.priceCategories.length===1&&settings.priceCategories[0]===id?"disabled":""}>
        <span>${category.symbol} ${category.name}</span></label>`).join("")}
    </div></div>
  </div>`;
}

function productMarkup(item,reveal) {
  const category = priceGuessCategories[item.category];
  return `<article class="price-product">
    <div class="price-photo">
      <span class="price-photo-fallback" aria-hidden="true">${category.symbol}</span>
      ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" decoding="async" referrerpolicy="no-referrer">` : ""}
    </div>
    <div class="price-product-copy">
      <p class="eyebrow">${category.symbol} ${category.name}</p>
      <h1>${escapeHtml(item.name)}</h1>
      <p>${escapeHtml(item.detail)}</p>
      ${reveal ? `<div class="price-answer-reveal"><small>Cena referencyjna</small><strong>${currency(item.cents)}</strong>
        <a href="${escapeHtml(item.source)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.store)} · ${priceGuessSourceDate} ↗</a></div>` : ""}
    </div>
  </article>`;
}

function guessMarkup(game,players,accounts,uid) {
  const submitted = priceGuessHasAnswer(game,uid);
  return `<div class="price-guess-controls">
    ${submitted ? '<p class="price-saved" role="status">✓ Twój strzał zapisany</p>' : `<form data-price-guess-form class="price-guess-form">
      <label for="price-amount">Ile to kosztuje?</label>
      <div><input id="price-amount" name="price" inputmode="decimal" maxlength="18" required placeholder="np. 49,99" autocomplete="off"><span aria-hidden="true">zł</span></div>
      <button class="primary" type="submit">Zatwierdź strzał</button>
    </form>`}
    <ul class="price-players" aria-label="Odpowiedzi graczy">${players.map(id=>{
      const answered = priceGuessHasAnswer(game,id);
      return `<li data-answered="${answered}">${playerMiniHtml(accounts[id] || {nick:"Gracz"})}
        <small aria-label="${answered?"Gotowe":"Czeka na strzał"}">${answered?"✓":"…"}</small></li>`;
    }).join("")}</ul>
  </div>`;
}

function scoresMarkup(game,players,accounts) {
  return `<ol class="price-scores">${priceGuessRanking(game,players).map(({uid,score})=>`<li>
    ${resultPlayerMiniHtml(accounts[uid] || {nick:"Gracz"},game.winners?.includes(uid)?"win":"")}
    <b>${score} pkt</b></li>`).join("")}</ol>`;
}

function revealMarkup(game,players,accounts,item,isHost) {
  const rows = players.map(uid=>({uid,guess:priceGuessHasAnswer(game,uid)? game.guesses[uid]:null}))
    .sort((a,b)=>(a.guess===null?Infinity:Math.abs(a.guess-item.cents))-(b.guess===null?Infinity:Math.abs(b.guess-item.cents)));
  return `<ul class="price-guesses" aria-label="Wynik rundy">${rows.map(row=>{
    const win = game.roundWinners?.includes(row.uid);
    const distance = row.guess===null?null:Math.abs(row.guess-item.cents);
    return `<li class="${win?"price-closest":""}">${resultPlayerMiniHtml(accounts[row.uid] || {nick:"Gracz"},win?"win":"")}
      <span>${row.guess===null?"Brak strzału":currency(row.guess)}</span>
      <b>${distance===null?"—":distance===0?"W punkt!":`${currency(distance)} różnicy`}${win?" · +1 pkt":""}</b></li>`;
  }).join("")}</ul>${scoresMarkup(game,players,accounts)}
  ${isHost ? `<button type="button" class="primary" data-price-next>${game.round===game.itemIds.length?"Wyniki gry":"Następny produkt"}</button>` : '<p class="price-wait">Czekamy na hosta.</p>'}`;
}

export function renderPriceGuessGame(root,{room,accounts,currentUser},actions) {
  const game = room.game;
  const profiles = {...room.playerProfiles,...accounts};
  const item = currentPriceGuessItem(game);
  const isHost = room.hostUid===currentUser;
  const guessing = game.phase==="price-guess";
  const done = game.phase==="result";
  const winners = (game.winners || []).filter(uid=>room.players.includes(uid)).map(uid=>escapeHtml(profiles[uid]?.nick || "Gracz"));
  const key = JSON.stringify([room.roomId,game.siteGameId,game.round,game.phase]);
  const progress = `<header class="price-heading"><p class="eyebrow">ZGADNIJ CENĘ · ${game.round}/${game.itemIds.length}</p>
    ${guessing ? '<span class="price-countdown" data-price-countdown></span>' : ""}</header>`;
  patchRoomView(root,key,`<main class="page price-game" data-price-game><section class="price-panel">
    ${progress}
    ${done ? `<h1>${winners.length ? (winners.length===1?`${winners[0]} wygrywa`:`Remis · ${winners.join(", ")}`) : "Brak rozstrzygnięcia"}</h1>
      ${scoresMarkup(game,room.players,profiles)}
      ${isHost?'<button class="primary" data-price-lobby>Wróć do pokoju</button>':""}`
      : !item ? "<h1>Produkt niedostępny</h1>" : `${productMarkup(item,!guessing)}
        ${guessing ? guessMarkup(game,room.players,profiles,currentUser) : revealMarkup(game,room.players,profiles,item,isHost)}`}
  </section><button class="ghost leave-game" data-price-leave>Wyjdź z pokoju</button></main>`);
  const expected = {round:game.round,phase:game.phase};
  const form = root.querySelector("[data-price-guess-form]");
  if (form) form.onsubmit=async event=>{
    event.preventDefault();
    const button=form.querySelector("button");
    if(button.disabled)return;
    button.disabled=true;
    try { await actions.priceGuessAction("guess",form.elements.price.value,expected); }
    finally { button.disabled=false; }
  };
  const next=root.querySelector("[data-price-next]");
  if(next) next.onclick=()=>actions.priceGuessAction("next",null,expected);
  const lobby=root.querySelector("[data-price-lobby]");
  if(lobby) lobby.onclick=actions.returnToRoom;
  root.querySelector("[data-price-leave]").onclick=actions.leaveRoom;
  const image=root.querySelector(".price-photo img");
  if(image) {
    const hide=()=>{image.hidden=true;};
    image.onerror=hide;
    if(image.complete&&!image.naturalWidth)hide();
  }
  stopPriceGuessTimer();
  if(!guessing) return;
  const countdown=root.querySelector("[data-price-countdown]");
  let pending=false;
  let retryAt=0;
  const tick=async()=>{
    const remaining=Math.max(0,Math.ceil((game.phaseEndsAt-serverNow())/1000));
    if(!countdown.isConnected)return;
    countdown.textContent=`${remaining} s`;
    countdown.dataset.urgent=String(remaining<=5);
    if(remaining>0 || pending || Date.now()<retryAt)return;
    pending=true;
    retryAt=Date.now()+1800;
    try { await actions.priceGuessAction("timeout",null,expected); }
    finally { pending=false; }
  };
  timer=setInterval(tick,350);
  tick();
}
