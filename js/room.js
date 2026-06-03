import { escapeHtml, icon, playerMiniHtml } from "./utils.js";
import { getGameMode } from "./games.js?v=20260603-7";
import { renderImpostorLobbySettings } from "./impostor.js?v=20260602-1";
import { renderIdentityLobbySettings } from "./identity.js?v=20260602-1";
import { renderOtherQuestionLobbySettings } from "./otherQuestion.js";
import { renderMostLikelyLobbySettings } from "./mostLikely.js";
import { renderFriendshipLobbySettings } from "./friendshipTest.js";

export function playerMini(profile = {}) {
  return playerMiniHtml(profile);
}

export function renderRoom(root, { room, accounts, currentUser }, actions) {
  const mode = getGameMode(room.gameMode);
  const isHost = room.hostUid === currentUser;
  room.viewerUid=currentUser;
  root.innerHTML = `<main class="page enter">
    <section class="panel room-header">
      <div><p class="eyebrow">${mode.symbol} ${mode.name}</p><h1>${escapeHtml(room.name)}</h1><p class="muted">Kod: <b>${room.roomId}</b> · Gracze ${room.players.length}/${mode.maxPlayers}</p></div>
      <button class="ghost" id="leave-room">Wyjdź</button>
    </section>
    <section class="lobby-layout">
      <section class="panel lobby-settings"><p class="eyebrow">USTAWIENIA</p><h2>Przygotuj rozgrywkę</h2>
        ${mode.id === "udowodnij" ? `<p class="muted">Po starcie gry nie da się zmienić czasu.</p><div class="time-pills">${[15,30,45,60].map(time => `<button data-room-time="${time}" ${isHost ? "" : "disabled"} class="${room.settings.answerTime === time ? "active" : ""}">${time}s</button>`).join("")}</div>` : mode.id === "impostor" ? renderImpostorLobbySettings(room,isHost) : mode.id === "kim-jestem" ? renderIdentityLobbySettings(room,isHost) : mode.id === "inne-pytanie" ? renderOtherQuestionLobbySettings(room,isHost) : mode.id === "kto-najpredzej" ? renderMostLikelyLobbySettings(room,isHost) : mode.id === "test-znajomosci" ? renderFriendshipLobbySettings(room,isHost) : `<p class="muted">Tryb użyje ustawień domyślnych.</p>`}
      </section>
      <aside class="panel room-code"><p class="eyebrow">KOD POKOJU</p><strong>${room.roomId}</strong><p class="muted">Podaj kod znajomym, aby mogli dołączyć.</p></aside>
    </section>
    <div class="section-intro"><div><p class="eyebrow">EKIPA</p><h2>Gracze w pokoju</h2></div><span class="badge">${room.players.length}/${mode.maxPlayers}</span></div>
    <section class="player-grid">${room.players.map(uid => `<article class="player-card">
      ${uid === room.hostUid ? `<span class="crown">${icon("crown", 20)}</span>` : ""}
      ${playerMini(accounts[uid])}<p class="player-status"><i></i>${uid === room.hostUid ? "Host" : "Gotowy"}</p>
      ${isHost && uid !== currentUser ? `<button class="danger" data-kick="${uid}">Wyrzuć</button>` : ""}
    </article>`).join("")}</section>
    <section class="room-actions">${isHost ? `<button class="primary big" id="start-game" ${room.players.length < mode.minPlayers ? "disabled" : ""}>${icon("play", 20)} Start gry</button>` : '<p class="muted">Czekamy, aż host rozpocznie grę.</p>'}
      ${room.players.length < mode.minPlayers ? `<p class="muted">Do startu potrzeba minimum ${mode.minPlayers} graczy.</p>` : ""}</section>
  </main>`;
  root.querySelector("#leave-room").addEventListener("click", actions.leaveRoom);
  root.querySelectorAll("[data-room-time]").forEach(button => button.addEventListener("click", () => actions.setRoomTime(Number(button.dataset.roomTime))));
  root.querySelectorAll("[data-impostor-setting]").forEach(input => input.addEventListener("change", () => actions.setImpostorSetting(input.dataset.impostorSetting, input.type === "checkbox" ? input.checked : input.value)));
  root.querySelectorAll("[data-identity-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.identitySetting, input.type === "checkbox" ? input.checked : input.value)));
  root.querySelectorAll("[data-other-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.otherSetting, input.type === "checkbox" ? input.checked : input.value)));
  root.querySelectorAll("[data-most-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.mostSetting, input.type === "checkbox" ? input.checked : input.value)));
  root.querySelectorAll("[data-friend-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.friendSetting, input.type === "checkbox" ? input.checked : input.value)));
  root.querySelector("#save-identity-words")?.addEventListener("click", () => actions.saveIdentityWords(root.querySelector("#identity-custom-words").value));
  root.querySelectorAll("[data-kick]").forEach(button => button.addEventListener("click", () => actions.kickPlayer(button.dataset.kick)));
  root.querySelector("#start-game")?.addEventListener("click", actions.startGame);
}
