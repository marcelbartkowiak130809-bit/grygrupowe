import { escapeHtml, resultPlayerMiniHtml } from "./utils.js?v=20261121-8";
import { serverNow } from "./firebase.js?v=20261124-2";
import { patchRoomView } from "./roomViewPatch.js?v=20261119-15";
import { countryGuessRanking, countryGuessRounds, countryGuessSettings, countryGuessTimes, currentCountry } from "./countryGuess.js?v=20261122-5";

let timer;

export function stopCountryGuessTimer() {
  clearInterval(timer);
  timer = null;
}

export function renderCountryGuessLobby(room,isHost) {
  const settings = countryGuessSettings(room.settings);
  const select = (label,key,values,suffix="") => `<label>${label}
    <select data-country-setting="${key}" ${isHost?"":"disabled"}>
      ${values.map(value=>`<option value="${value}" ${value===settings[key]?"selected":""}>${value}${suffix}</option>`).join("")}
    </select></label>`;
  return `<div class="impostor-settings-grid">
    ${select("Liczba rund","rounds",countryGuessRounds)}
    ${select("Czas na odpowiedź","flagSeconds",countryGuessTimes," s")}
  </div>`;
}

export function renderCountryGuessGame(root,{room,accounts,currentUser},actions) {
  stopCountryGuessTimer();
  const game = room.game;
  const profiles = {...room.playerProfiles,...accounts};
  const nick = uid => escapeHtml(profiles[uid]?.nick || "Gracz");
  const country = currentCountry(game);
  const guessing = game.phase==="country-guess";
  const done = game.phase==="result";
  const winners = (game.winners || []).filter(uid=>room.players.includes(uid)).map(nick);
  const key = JSON.stringify([room.roomId,game.siteGameId,game.round,done]);
  const scores = `<ol class="country-scores" aria-label="Punkty">${countryGuessRanking(game,room.players).map(({uid,score})=>`<li>
    ${resultPlayerMiniHtml(profiles[uid] || {nick:"Gracz"},(done ? game.winners?.includes(uid) : uid===game.roundWinner)?"win":"")}
    <b>${score} pkt</b></li>`).join("")}</ol>`;
  patchRoomView(root,key,`<main class="page country-game" data-country-game>
    <section class="country-panel">
      <header class="country-heading">
        <p class="eyebrow">GUESS THE COUNTRY · ${game.round}/${game.flagCodes.length}</p>
        ${done ? "" : '<span class="country-timer" data-country-timer></span>'}
      </header>
      ${done ? `<h1>${winners.length===1 ? `${winners[0]} wygrywa!` : winners.length ? `Remis · ${winners.join(", ")}` : "Brak rozstrzygnięcia"}</h1>
        ${scores}
        ${room.hostUid===currentUser?'<button type="button" class="primary" data-country-lobby>Wróć do pokoju</button>':""}`
      : !country ? "<h1>Flaga niedostępna</h1>" : `
        <h1>${guessing ? "Co to za kraj?" : escapeHtml(country.name)}</h1>
        <div class="country-stage"><img src="/assets/country-flags/${country.code}.svg" alt="${guessing ? "Flaga do odgadnięcia" : `Flaga · ${escapeHtml(country.name)}`}" draggable="false"></div>
        <div class="country-controls">
          ${guessing ? `<form class="country-form" data-country-form>
            <input name="country" aria-label="Nazwa kraju" placeholder="Wpisz nazwę kraju" maxlength="80" autocomplete="off" autocorrect="off" spellcheck="false" required>
            <button type="submit" class="primary">Zgadnij</button>
          </form>` : `<p class="country-reveal" role="status">${game.roundWinner ? `${nick(game.roundWinner)} · +1 pkt` : "Nikt nie odgadł flagi"}</p>`}
        </div>
        ${scores}`}
    </section>
    <button type="button" class="ghost leave-game" data-country-leave>Wyjdź z pokoju</button>
  </main>`);

  const expected = {round:game.round,phase:game.phase};
  const form = root.querySelector("[data-country-form]");
  if (form) form.onsubmit = async event=>{
    event.preventDefault();
    const input = form.elements.country;
    const button = form.querySelector("button");
    if (button.disabled || !input.value.trim()) return;
    button.disabled = true;
    try {
      const accepted = await actions.countryGuessAction("guess",input.value,expected);
      if (!accepted && input.isConnected && document.activeElement===input) input.select();
    } finally { button.disabled = false; }
  };
  const lobby = root.querySelector("[data-country-lobby]");
  if (lobby) lobby.onclick = actions.returnToRoom;
  root.querySelector("[data-country-leave]").onclick = actions.leaveRoom;

  const clock = root.querySelector("[data-country-timer]");
  if (!clock) return;
  let pending = false;
  let retryAt = 0;
  const tick = async ()=>{
    const remaining = Math.max(0,Math.ceil((game.phaseEndsAt-serverNow())/1000));
    const text = guessing ? `${remaining} s` : game.round===game.flagCodes.length ? "Wyniki" : "Następna flaga";
    if (clock.textContent!==text) clock.textContent = text;
    clock.dataset.urgent = String(guessing && remaining<=5);
    if (remaining || pending || Date.now()<retryAt) return;
    pending = true;
    retryAt = Date.now()+1800;
    try { await actions.countryGuessAction("tick",null,expected); }
    finally { pending = false; }
  };
  timer = setInterval(tick,250);
  tick();
}
