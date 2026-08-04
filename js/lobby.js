import { $, escapeHtml, icon } from "./utils.js?v=20260605-5";
import { getGameMode } from "./games.js?v=20260804-8";
import { pokemonDex } from "./pokemonData.js?v=20260804-2";

const pokemonCardIds = { "pokemon-dex":25, "pokemon-last-letter":133, "pokemon-evolution":1, "pokemon-auction":149, "pokemon-types":7, "pokemon-match-type":4 };
function modeVisual(mode) { const pokemon = mode.audience === "pokemon" && pokemonDex.find(item => item.id === pokemonCardIds[mode.id]); return pokemon ? `<img class="mode-pokemon-symbol" src="${pokemon.sprite}" alt="${escapeHtml(pokemon.name)}" onerror="this.onerror=null;this.src='${pokemon.spriteFallback}'">` : mode.symbol; }
export const ENTRY_FEE_OPTIONS = [50, 100, 250, 500, 1000, 2500, 5000];
const roomTypeLabel = room => room?.roomType === "betting" ? `ZAKŁADY · ${Number(room.entryFee || 0).toLocaleString("pl-PL")}$` : "STANDARD";

function roomCard(room, mode) {
  const identityFlow = mode.id === "kim-jestem" ? `<span class="room-mode-pill">${room.settings?.gameFlow === "browserVoice" || room.settings?.gameFlow === "voice" ? "Voice chat w grze" : room.settings?.gameFlow === "externalVoice" ? "Glos poza gra" : "Tryb tekstowy"}</span>` : "";
  const adult = Boolean(mode.adult || [room.settings?.category, ...(Array.isArray(room.settings?.categories) ? room.settings.categories : [])].some(item => String(item || "").startsWith("18+")));
  return `<article class="room-card">
    <div><div class="room-mode">${mode.symbol} ${mode.name} <span class="room-type-badge ${room.roomType === "betting" ? "is-betting" : "is-standard"}">${room.roomType === "betting" ? "◈" : "●"} ${roomTypeLabel(room)}</span></div><h3>${escapeHtml(room.name)}</h3>
      <p class="muted">${room.roomId} · ${room.players.length}/${room.maxPlayers || mode.maxPlayers} · ${room.status === "lobby" ? "oczekuje" : "gra trwa"}</p>${adult ? '<span class="adult-room-badge">18+</span>' : ""}${identityFlow}</div>
    <div class="room-right">${room.isPrivate ? icon("lock", 18) : ""}<button data-join-room="${room.roomId}">Wejdź</button></div>
  </article>`;
}

export function renderLobby(root, { rooms, selectedGameMode, onlineBackend }, actions) {
  const mode = getGameMode(selectedGameMode);
  const wavelengthHint = mode.id === "wavelength" && localStorage.getItem("wavelengthTutorialSeen") !== "1" ? '<span class="wavelength-info-hint">↗ Kliknij „i”, aby poznać zasady</span>' : "";
  const modeRooms = rooms.filter(room => room.gameMode === mode.id && room.status === "lobby");
  const backendNote = onlineBackend === null
    ? '<section class="online-note">Łączenie z trybem online...</section>'
    : onlineBackend
      ? '<section class="online-note">Tryb online aktywny. Pokoje są synchronizowane między urządzeniami.</section>'
      : '<section class="warning">Nie udało się połączyć z trybem online. Odśwież stronę i spróbuj ponownie.</section>';
  root.innerHTML = `<main class="page lobby-page enter">
    <section class="mode-hero panel">
      <div class="game-symbol game-symbol-${mode.art}">${modeVisual(mode)}</div>
      <div><p class="eyebrow">WYBRANY TRYB</p><h1>${mode.name}</h1><p class="muted">${mode.description}</p><span class="players-count">${icon("users", 17)} ${mode.players}</span></div>
      <div class="mode-hero-actions">${wavelengthHint}<button class="icon-btn info-button" id="mode-info" aria-label="Jak grać">i</button><button class="ghost" id="change-mode">Zmień tryb</button></div>
    </section>
    <section class="panel">
      <div class="section-heading"><div><p class="eyebrow">NOWA ROZGRYWKA</p><h2>Stwórz pokój lub dołącz kodem</h2></div><button id="create-room" class="primary">${icon("userPlus", 18)} Stwórz pokój</button></div>
      <div class="row lobby-code-row"><input id="join-code" placeholder="KOD POKOJU" maxlength="6"><input id="join-pass" placeholder="hasło, jeśli prywatny"><button id="join-code-button">Dołącz</button></div>
    </section>
    ${backendNote}
    <section class="panel"><div class="section-heading"><h2>Otwarte pokoje</h2><span class="badge">${modeRooms.length}</span></div>
      <div class="room-grid">${modeRooms.length ? modeRooms.map(room => roomCard(room, mode)).join("") : '<p class="muted">Brak pokoi w tym trybie. Stwórz pierwszy i zaproś ekipę.</p>'}</div>
    </section>
  </main>`;
  if (mode.id === "quiz" && localStorage.getItem("quizTutorialSeen") !== "1") { const hint = document.createElement("span"); hint.className = "quiz-info-hint"; hint.textContent = "Kliknij i, aby poznać zasady"; root.querySelector(".mode-hero-actions")?.prepend(hint); }
  $("#change-mode").addEventListener("click", actions.goPlatform);
  $("#mode-info").addEventListener("click", () => { if (mode.id === "wavelength") localStorage.setItem("wavelengthTutorialSeen", "1"); actions.showGameInfo(mode.id); });
  $("#create-room").addEventListener("click", actions.openCreateRoom);
  $("#join-code-button").addEventListener("click", () => actions.joinByCode($("#join-code").value, $("#join-pass").value));
  root.querySelectorAll("[data-join-room]").forEach(button => button.addEventListener("click", () => actions.joinRoom(button.dataset.joinRoom)));
}

export function createRoomModal(mode, actions) {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  const isUdowodnij = mode.id === "udowodnij";
  let roomType = "standard";
  let entryFee = ENTRY_FEE_OPTIONS[0];
  let maxPlayers = mode.maxPlayers;
  backdrop.innerHTML = `<section class="modal enter" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="modal-title"><div><p class="eyebrow">${mode.name}</p><h2 id="modal-title">Nowy pokój</h2></div><button class="icon-btn" data-close>${icon("x", 18)}</button></div>
    <label for="room-name">Nazwa pokoju</label><input id="room-name" placeholder="Pokój dla ekipy">
    <label class="check"><input id="room-private" type="checkbox"> Pokój prywatny z hasłem</label><input id="room-password" class="hidden" placeholder="hasło pokoju">
    <fieldset class="room-type-choice"><legend>Rodzaj pokoju</legend><label class="room-type-option is-selected"><input type="radio" name="room-type" value="standard" checked> <span><b>● Standard</b><small>Bez wpisowego, nagrody z banku gry.</small></span></label><label class="room-type-option"><input type="radio" name="room-type" value="betting"> <span><b>◈ Zakłady</b><small>Każdy gracz wpłaca wpisowe, zwycięzcy dzielą pulę.</small></span></label><label id="entry-fee-field" class="hidden">Wpisowe<select id="entry-fee">${ENTRY_FEE_OPTIONS.map(fee => `<option value="${fee}">${fee.toLocaleString("pl-PL")}$</option>`).join("")}</select></label></fieldset>
    ${isUdowodnij ? `<label>Czas na wymienianie</label><div class="time-pills">${[15,30,45,60].map(time => `<button data-time="${time}" class="${time === 30 ? "active" : ""}">${time}s</button>`).join("")}</div>` : ""}
    <div class="modal-actions"><button class="ghost" data-close>Anuluj</button><button class="primary" id="confirm-create">Stwórz</button></div>
  </section>`;
  const maxPlayersField = document.createElement("label");
  maxPlayersField.htmlFor = "room-max-players";
  maxPlayersField.textContent = "Liczba graczy";
  const maxPlayersSelect = document.createElement("select");
  maxPlayersSelect.id = "room-max-players";
  maxPlayersSelect.innerHTML = Array.from({length:Math.max(1,mode.maxPlayers-mode.minPlayers+1)},(_,index)=>mode.minPlayers+index).map(value=>`<option value="${value}" ${value===mode.maxPlayers?"selected":""}>${value} ${value===1?"osoba":"osób"}</option>`).join("");
  maxPlayersField.append(maxPlayersSelect);
  backdrop.querySelector("#room-name").insertAdjacentElement("afterend",maxPlayersField);
  let answerTime = mode.defaultSettings.answerTime || 30;
  const close = () => actions.closeModal(backdrop);
  backdrop.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", close));
  $("#room-private", backdrop).addEventListener("change", event => $("#room-password", backdrop).classList.toggle("hidden", !event.target.checked));
  backdrop.querySelectorAll("[data-time]").forEach(button => button.addEventListener("click", () => {
    answerTime = Number(button.dataset.time);
    backdrop.querySelectorAll("[data-time]").forEach(item => item.classList.toggle("active", item === button));
  }));
  backdrop.querySelectorAll("[name='room-type']").forEach(input => input.addEventListener("change", () => { roomType=input.value; backdrop.querySelectorAll(".room-type-option").forEach(item=>item.classList.toggle("is-selected",item.querySelector("input")?.checked)); backdrop.querySelector("#entry-fee-field").classList.toggle("hidden",roomType!=="betting"); }));
  backdrop.querySelector("#entry-fee").addEventListener("change", event => { entryFee=Number(event.target.value)||ENTRY_FEE_OPTIONS[0]; });
  backdrop.querySelector("#room-max-players")?.addEventListener("change", event => { maxPlayers=Number(event.target.value)||mode.maxPlayers; });
  $("#confirm-create", backdrop).addEventListener("click", async () => {
    if (await actions.createRoom({ name: $("#room-name", backdrop).value, maxPlayers, isPrivate: $("#room-private", backdrop).checked, password: $("#room-password", backdrop).value, roomType, entryFee, settings: { ...mode.defaultSettings, answerTime } }) !== false) close();
  });
  return backdrop;
}
