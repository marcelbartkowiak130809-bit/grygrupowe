import { escapeHtml, icon, playerMiniHtml } from "./utils.js?v=20260605-6";
import { getGameMode } from "./games.js?v=20260612-1";
import { renderImpostorLobbySettings } from "./impostor.js?v=20260605-5";
import { renderIdentityLobbySettings } from "./identity.js?v=20260611-1";
import { renderOtherQuestionLobbySettings } from "./otherQuestion.js?v=20260605-4";
import { renderMostLikelyLobbySettings } from "./mostLikely.js?v=20260612-1";
import { renderFriendshipLobbySettings } from "./friendshipTest.js?v=20260605-1";
import { renderPoisonCandyLobbySettings } from "./poisonCandy.js?v=20260605-6";
import { adSenseBlock } from "./publicPages.js?v=20260611-3";

export function playerMini(profile = {}, options = {}) {
  return playerMiniHtml(profile, "", options);
}

function settingsHtml(mode, room, isHost, actions) {
  if (mode.id === "udowodnij") return `<p class="muted">Po starcie gry nie da sie zmienic czasu.</p><div class="time-pills">${[15,30,45,60].map(time => `<button data-room-time="${time}" ${isHost ? "" : "disabled"} class="${room.settings.answerTime === time ? "active" : ""}">${time}s</button>`).join("")}</div>`;
  if (mode.id === "impostor") return renderImpostorLobbySettings(room, isHost);
  if (mode.id === "kim-jestem") return renderIdentityLobbySettings(room, isHost);
  if (mode.id === "inne-pytanie") return renderOtherQuestionLobbySettings(room, isHost);
  if (mode.id === "kto-najpredzej") return renderMostLikelyLobbySettings(room, isHost, { adultLocked: actions.roomHasNonAdultPlayer?.(room) });
  if (mode.id === "test-znajomosci") return renderFriendshipLobbySettings(room, isHost);
  if (mode.id === "zatruty-cukierek") return renderPoisonCandyLobbySettings(room, isHost);
  return `<p class="muted">Tryb uzyje ustawien domyslnych.</p>`;
}

export function renderRoom(root, { room, accounts, currentUser }, actions) {
  const mode = getGameMode(room.gameMode);
  const isHost = room.hostUid === currentUser;
  const canReport = Boolean(mode.allowReports);
  const inviteLink = actions.inviteLink?.(room) || "";
  room.viewerUid = currentUser;
  root.innerHTML = `<main class="page enter">
    <section class="panel room-header">
      <div><p class="eyebrow">${mode.symbol} ${mode.name}</p><h1>${escapeHtml(room.name)}</h1><p class="muted">Kod: <b>${room.roomId}</b> · Gracze ${room.players.length}/${mode.maxPlayers}</p></div>
      <div class="room-header-actions"><button class="icon-btn info-button" id="mode-info" aria-label="Jak grać">i</button><button class="ghost" id="leave-room">Wyjdz</button></div>
    </section>
    <section class="lobby-layout">
      <section class="panel lobby-settings"><p class="eyebrow">USTAWIENIA</p><h2>Przygotuj rozgrywke</h2>${settingsHtml(mode, room, isHost, actions)}</section>
      <aside class="panel room-code"><p class="eyebrow">KOD POKOJU</p><strong>${room.roomId}</strong><p class="muted">Podaj kod znajomym albo wyślij link zaproszenia.</p><label class="tiny" for="invite-link">Link zaproszenia</label><input id="invite-link" class="invite-link-field" value="${escapeHtml(inviteLink)}" readonly><div class="invite-actions"><button class="primary" id="copy-invite-link">Kopiuj link zaproszenia</button><button class="ghost" id="share-invite-link">Udostępnij</button></div>${adSenseBlock("Reklama", "lobby")}</aside>
    </section>
    <div class="section-intro"><div><p class="eyebrow">EKIPA</p><h2>Gracze w pokoju</h2></div><span class="badge">${room.players.length}/${mode.maxPlayers}</span></div>
    <section class="player-grid">${room.players.map(uid => `<article class="player-card">
      ${uid === room.hostUid ? `<span class="crown">${icon("crown", 20)}</span>` : ""}
      ${playerMini(accounts[uid], { disableIdle: true })}<p class="player-status"><i></i>${uid === room.hostUid ? "Host" : "Gotowy"} <span class="age-badge age-${accounts[uid]?.adultStatus || room.playerProfiles?.[uid]?.adultStatus || "unknown"}">${(accounts[uid]?.adultStatus || room.playerProfiles?.[uid]?.adultStatus) === "adult" ? "18+" : "&lt;18"}</span></p>
      ${canReport && uid !== currentUser ? `<button class="icon-btn report-player-button" data-report-player="${uid}" aria-label="Zgłoś gracza">⚠️</button>` : ""}
      ${isHost && uid !== currentUser ? `<button class="danger" data-kick="${uid}">Wyrzuc</button>` : ""}
    </article>`).join("")}</section>
    <section class="room-actions">${isHost ? `<button class="primary big" id="start-game" ${room.players.length < mode.minPlayers ? "disabled" : ""}>${icon("play", 20)} Start gry</button>` : '<p class="muted">Czekamy, az host rozpocznie gre.</p>'}
      ${room.players.length < mode.minPlayers ? `<p class="muted">Do startu potrzeba minimum ${mode.minPlayers} graczy.</p>` : ""}</section>
  </main>`;
  root.querySelector("#leave-room").addEventListener("click", () => actions.leaveRoom());
  root.querySelector("#mode-info").addEventListener("click", () => actions.showGameInfo(mode.id));
  root.querySelector("#copy-invite-link")?.addEventListener("click", () => actions.copyInviteLink(room.roomId));
  root.querySelector("#share-invite-link")?.addEventListener("click", () => actions.shareInviteLink(room.roomId));
  root.querySelectorAll("[data-room-time]").forEach(button => button.addEventListener("click", () => actions.setRoomTime(Number(button.dataset.roomTime))));
  root.querySelectorAll("[data-impostor-setting]").forEach(input => input.addEventListener("change", () => actions.setImpostorSetting(input.dataset.impostorSetting, input.type === "checkbox" ? input.checked : input.value)));
  root.querySelectorAll("[data-impostor-category]").forEach(input => input.addEventListener("change", () => actions.setImpostorSetting("categories", [...root.querySelectorAll("[data-impostor-category]:checked")].map(item => item.dataset.impostorCategory))));
  root.querySelectorAll("[data-identity-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.identitySetting, input.type === "checkbox" ? input.checked : input.value)));
  root.querySelectorAll("[data-identity-category]").forEach(input => input.addEventListener("change", () => actions.setModeSetting("categories", [...root.querySelectorAll("[data-identity-category]:checked")].map(item => item.dataset.identityCategory))));
  root.querySelectorAll("[data-other-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.otherSetting, input.type === "checkbox" ? input.checked : input.value)));
  root.querySelectorAll("[data-other-category]").forEach(input => input.addEventListener("change", () => actions.setModeSetting("categories", [...root.querySelectorAll("[data-other-category]:checked")].map(item => item.dataset.otherCategory))));
  root.querySelectorAll("[data-most-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.mostSetting, input.type === "checkbox" ? input.checked : input.value)));
  root.querySelectorAll("[data-most-category]").forEach(input => input.addEventListener("change", () => actions.setMostCategories([...root.querySelectorAll("[data-most-category]:checked")].map(item => item.dataset.mostCategory))));
  root.querySelectorAll("[data-friend-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.friendSetting, input.type === "checkbox" ? input.checked : input.value)));
  root.querySelectorAll("[data-friend-category]").forEach(input => input.addEventListener("change", () => actions.setModeSetting("categories", [...root.querySelectorAll("[data-friend-category]:checked")].map(item => item.dataset.friendCategory))));
  root.querySelectorAll("[data-candy-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.candySetting, input.type === "checkbox" ? input.checked : input.value)));
  root.querySelector("#save-identity-words")?.addEventListener("click", () => actions.saveIdentityWords(root.querySelector("#identity-custom-words").value));
  root.querySelectorAll("[data-kick]").forEach(button => button.addEventListener("click", () => actions.kickPlayer(button.dataset.kick)));
  root.querySelectorAll("[data-report-player]").forEach(button => button.addEventListener("click", () => actions.openReportModal(button.dataset.reportPlayer)));
  root.querySelector("#start-game")?.addEventListener("click", actions.startGame);
}
