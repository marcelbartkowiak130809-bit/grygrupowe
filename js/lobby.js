import { $, escapeHtml, icon } from "./utils.js?v=20260605-1";
import { getGameMode } from "./games.js?v=20260605-2";

function roomCard(room, mode) {
  const identityFlow = mode.id === "kim-jestem" ? `<span class="room-mode-pill">${room.settings?.gameFlow === "browserVoice" || room.settings?.gameFlow === "voice" ? "Voice chat w grze" : room.settings?.gameFlow === "externalVoice" ? "Glos poza gra" : "Tryb tekstowy"}</span>` : "";
  const adult = Boolean(mode.adult || [room.settings?.category, ...(Array.isArray(room.settings?.categories) ? room.settings.categories : [])].some(item => String(item || "").startsWith("18+")));
  return `<article class="room-card">
    <div><div class="room-mode">${mode.symbol} ${mode.name}</div><h3>${escapeHtml(room.name)}</h3>
      <p class="muted">${room.roomId} · ${room.players.length}/${mode.maxPlayers} · ${room.status === "lobby" ? "oczekuje" : "gra trwa"}</p>${adult ? '<span class="adult-room-badge">18+</span>' : ""}${identityFlow}</div>
    <div class="room-right">${room.isPrivate ? icon("lock", 18) : ""}<button data-join-room="${room.roomId}">Wejdź</button></div>
  </article>`;
}

export function renderLobby(root, { rooms, selectedGameMode, onlineBackend }, actions) {
  const mode = getGameMode(selectedGameMode);
  const modeRooms = rooms.filter(room => room.gameMode === mode.id && room.status === "lobby");
  const backendNote = onlineBackend === null
    ? '<section class="online-note">Łączenie z Firebase Realtime Database...</section>'
    : onlineBackend
      ? '<section class="online-note">Tryb online aktywny. Pokoje są synchronizowane między urządzeniami przez Firebase.</section>'
      : '<section class="warning">Nie udało się połączyć z Firebase. Odśwież stronę. Jeśli problem nie zniknie, sprawdź czy Anonymous Auth jest włączone.</section>';
  root.innerHTML = `<main class="page enter">
    <section class="mode-hero panel">
      <div class="game-symbol game-symbol-${mode.art}">${mode.symbol}</div>
      <div><p class="eyebrow">WYBRANY TRYB</p><h1>${mode.name}</h1><p class="muted">${mode.description}</p><span class="players-count">${icon("users", 17)} ${mode.players}</span></div>
      <div class="mode-hero-actions"><button class="icon-btn info-button" id="mode-info" aria-label="Jak grać">i</button><button class="ghost" id="change-mode">Zmień tryb</button></div>
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
  $("#change-mode").addEventListener("click", actions.goPlatform);
  $("#mode-info").addEventListener("click", () => actions.showGameInfo(mode.id));
  $("#create-room").addEventListener("click", actions.openCreateRoom);
  $("#join-code-button").addEventListener("click", () => actions.joinByCode($("#join-code").value, $("#join-pass").value));
  root.querySelectorAll("[data-join-room]").forEach(button => button.addEventListener("click", () => actions.joinRoom(button.dataset.joinRoom)));
}

export function createRoomModal(mode, actions) {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  const isUdowodnij = mode.id === "udowodnij";
  backdrop.innerHTML = `<section class="modal enter" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="modal-title"><div><p class="eyebrow">${mode.name}</p><h2 id="modal-title">Nowy pokój</h2></div><button class="icon-btn" data-close>${icon("x", 18)}</button></div>
    <label for="room-name">Nazwa pokoju</label><input id="room-name" placeholder="Pokój dla ekipy">
    <label class="check"><input id="room-private" type="checkbox"> Pokój prywatny z hasłem</label><input id="room-password" class="hidden" placeholder="hasło pokoju">
    ${isUdowodnij ? `<label>Czas na wymienianie</label><div class="time-pills">${[15,30,45,60].map(time => `<button data-time="${time}" class="${time === 30 ? "active" : ""}">${time}s</button>`).join("")}</div>` : ""}
    <div class="modal-actions"><button class="ghost" data-close>Anuluj</button><button class="primary" id="confirm-create">Stwórz</button></div>
  </section>`;
  let answerTime = mode.defaultSettings.answerTime || 30;
  const close = () => actions.closeModal(backdrop);
  backdrop.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", close));
  $("#room-private", backdrop).addEventListener("change", event => $("#room-password", backdrop).classList.toggle("hidden", !event.target.checked));
  backdrop.querySelectorAll("[data-time]").forEach(button => button.addEventListener("click", () => {
    answerTime = Number(button.dataset.time);
    backdrop.querySelectorAll("[data-time]").forEach(item => item.classList.toggle("active", item === button));
  }));
  $("#confirm-create", backdrop).addEventListener("click", async () => {
    if (await actions.createRoom({ name: $("#room-name", backdrop).value, isPrivate: $("#room-private", backdrop).checked, password: $("#room-password", backdrop).value, settings: { ...mode.defaultSettings, answerTime } }) !== false) close();
  });
  return backdrop;
}
