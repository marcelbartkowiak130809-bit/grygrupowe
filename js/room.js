import { escapeHtml, icon, playerMiniHtml } from "./utils.js?v=20260901-3";
import { getGameMode } from "./games.js?v=20261119-9";
import { pokemonDex } from "./pokemonData.js?v=20260804-2";
import { renderImpostorLobbySettings, bindImpostorLobbySettings } from "./impostor.js?v=20261117-10";
import { renderIdentityLobbySettings } from "./identity.js?v=20261118-16";
import { renderOtherQuestionLobbySettings } from "./otherQuestion.js?v=20260605-4";
import { renderMostLikelyLobbySettings } from "./mostLikely.js?v=20260612-1";
import { renderFriendshipLobbySettings } from "./friendshipTest.js?v=20260605-1";
import { renderPoisonCandyLobbySettings } from "./poisonCandy.js?v=20260831-12";
import { renderBombLobbySettings } from "./bomb.js?v=20260621-1";
import { renderClosestTruthLobbySettings } from "./closestTruth.js?v=20260612-3";
import { renderRankingLobbySettings } from "./ranking.js?v=20260612-2";
import { renderFiveSecondsLobbySettings } from "./fiveSeconds.js?v=20260612-2";
import { renderClockLobbySettings } from "./clock.js?v=20260831-3";
import { renderPokemonLobbySettings } from "./pokemon.js?v=20261119-4";
import { renderWavelengthLobbySettings } from "./wavelength.js?v=20260903-6";
import { renderQuizLobbySettings } from "./quiz.js?v=20260823-5";
import { renderMathematicsLobbySettings } from "./mathematics.js?v=20260805-1";
import { renderMarkerLobbySettings } from "./marker.js?v=20261117-10";
import { renderSequenceLobbySettings } from "./sequence.js?v=20260813-2";
import { renderFamilyLobbySettingsV2 as renderFamilyLobbySettings } from "./family.js?v=20260822-2";
import { renderWordChainLobbySettings } from "./wordChain.js?v=20260822-2";
import { renderCharadesLobbySettings } from "./charades.js?v=20260922-1";
import { renderHangmanLobbySettings } from "./hangman.js?v=20261118-16";
import { renderNumberMysteryLobbySettings } from "./numberMystery.js?v=20260831-4";
import { renderUniqueAnswerLobbySettings } from "./uniqueAnswer.js?v=20260823-5";
import { renderConnectLobbySettings } from "./connect.js?v=20261118-27";
import { renderLiarLobbySettings } from "./liar.js?v=20260831-4";
import { renderFalseMessageLobbySettings } from "./falseMessage.js?v=20260831-4";
import { renderSecretRuleLobbySettings } from "./secretRule.js?v=20260831-5";
import { adSenseBlock } from "./publicPages.js?v=20261119-9";
import { BOT_DIFFICULTIES, botTooltip, isBotId, roomAllowsBots } from "./bots.js?v=20261118-27";
import { commerceSummaryHtml } from "./gamePasses.js?v=20261118-27";
import { renderMusicDuelLobbySettings, renderMusicArenaLobbySettings } from "./music.js?v=20261117-10";
import { renderLyricsLobbySettings } from "./lyrics.js?v=20261117-10";
import { renderPopularityLobbySettings } from "./popularity.js?v=20260905-1";
import { renderSongSpotLobbySettings } from "./deferredMusicModes.js?v=20261117-16";
import { renderBoardLobbySettings } from "./boardGames.js?v=20261118-16";
import { minecraftModeIcons, renderMinecraftLobbySettings } from "./minecraft.js?v=20261118-13";

const pokemonCardIds = { "pokemon-dex":25, "pokemon-last-letter":133, "pokemon-evolution":1, "pokemon-auction":149, "pokemon-types":7, "pokemon-match-type":4 };
const modeEmojis = { wavelength:"🌈", quiz:"🎲", mathematics:"🧮", marker:"🖍️", sequence:"🔐", family:"📊", "word-chain":"🔗", charades:"🎭", hangman:"🪢", klamca:"🎭", "falszywa-wiadomosc":"📱", "tajna-zasada":"🧠", "pojedynek-hitow":"🎵", "bitwa-hitow":"🎶", "popularnosc-hitow":"📈", "dokoncz-tekst":"✍️" };
function modeVisual(mode) { const pokemon = mode.audience === "pokemon" && pokemonDex.find(item => item.id === pokemonCardIds[mode.id]); if (pokemon) return `<img class="mode-pokemon-symbol" src="${pokemon.sprite}" alt="${escapeHtml(pokemon.name)}" onerror="this.onerror=null;this.src='${pokemon.spriteFallback}'">`; if (mode.audience === "minecraft" && minecraftModeIcons[mode.id]) return `<img class="mode-minecraft-symbol" src="${minecraftModeIcons[mode.id]}" alt="Minecraft">`; return modeEmojis[mode.id] || mode.symbol; }

export function playerMini(profile = {}, options = {}) {
  return `${profile?.isBot ? `<span class="bot-player-mark" ${botTooltip} aria-label="Bot eksperymentalny">🤖</span>` : ""}${playerMiniHtml(profile, "", options)}`;
}

function lobbyAgeStatus(uid, room, accounts) {
  const status = room.playerProfiles?.[uid]?.adultStatus || accounts[uid]?.adultStatus || "unknown";
  return ["adult", "minor"].includes(status) ? status : "unknown";
}

function lobbyAgeBadge(uid, room, accounts) {
  const status = lobbyAgeStatus(uid, room, accounts);
  if (status === "unknown") return "";
  return `<span class="age-badge age-${status}">${status === "adult" ? "18+" : "&lt;18"}</span>`;
}

function settingsHtml(mode, room, isHost, actions) {
  if (mode.id === "udowodnij") return `<p class="tiny">Czas odpowiedzi</p><div class="time-pills">${[15,30,45,60].map(time => `<button data-room-time="${time}" ${isHost ? "" : "disabled"} class="${Number(room.settings.answerTime) === time ? "active" : ""}">${time}s</button>`).join("")}</div><p class="tiny rounds-setting-label">Liczba rund</p><div class="time-pills">${[3,5,7,10].map(rounds => `<button data-room-rounds="${rounds}" ${isHost ? "" : "disabled"} class="${Number(room.settings.rounds || 5) === rounds ? "active" : ""}">${rounds}</button>`).join("")}</div>`;
  if (mode.id === "impostor") return renderImpostorLobbySettings(room, isHost);
  if (mode.id === "kim-jestem") return renderIdentityLobbySettings(room, isHost);
  if (mode.id === "inne-pytanie") return renderOtherQuestionLobbySettings(room, isHost);
  if (mode.id === "kto-najpredzej") return renderMostLikelyLobbySettings(room, isHost, { adultLocked: actions.roomHasNonAdultPlayer?.(room) });
  if (mode.id === "test-znajomosci") return renderFriendshipLobbySettings(room, isHost);
  if (mode.id === "zatruty-cukierek") return renderPoisonCandyLobbySettings(room, isHost);
  if (mode.id === "bomba") return renderBombLobbySettings(room, isHost);
  if (mode.id === "najblizej-prawdy") return renderClosestTruthLobbySettings(room, isHost);
  if (mode.id === "ranking") return renderRankingLobbySettings(room, isHost);
  if (mode.id === "5-sekund") return renderFiveSecondsLobbySettings(room, isHost);
  if (mode.id === "zegar") return renderClockLobbySettings(room, isHost);
  if (mode.id === "wavelength") return renderWavelengthLobbySettings(room, isHost);
  if (mode.id === "quiz") return renderQuizLobbySettings(room, isHost);
  if (mode.id === "mathematics") return renderMathematicsLobbySettings(room, isHost);
  if (mode.id === "marker") return renderMarkerLobbySettings(room, isHost);
  if (mode.id === "sequence") return renderSequenceLobbySettings(room, isHost);
  if (mode.id === "family") return renderFamilyLobbySettings(room, isHost);
  if (mode.id === "word-chain") return renderWordChainLobbySettings(room, isHost);
  if (mode.id === "charades") return renderCharadesLobbySettings(room, isHost);
  if (mode.id === "hangman") return renderHangmanLobbySettings(room, isHost);
  if (mode.id === "number-mystery") return renderNumberMysteryLobbySettings(room, isHost);
  if (mode.id === "unique-answer") return renderUniqueAnswerLobbySettings(room, isHost);
  if (mode.id === "polacz-nas") return renderConnectLobbySettings(room, isHost);
  if (mode.id === "klamca") return renderLiarLobbySettings(room, isHost);
  if (mode.id === "falszywa-wiadomosc") return renderFalseMessageLobbySettings(room, isHost);
  if (mode.id === "tajna-zasada") return renderSecretRuleLobbySettings(room, isHost);
  if (mode.id === "pojedynek-hitow") return renderMusicDuelLobbySettings(room, isHost);
  if (mode.id === "bitwa-hitow") return renderMusicArenaLobbySettings(room, isHost);
  if (mode.id === "dokoncz-tekst") return renderLyricsLobbySettings(room, isHost);
  if (mode.id === "popularnosc-hitow") return renderPopularityLobbySettings(room, isHost);
  if (mode.id === "songspot") return renderSongSpotLobbySettings(room, isHost);
  if (mode.audience === "board") return renderBoardLobbySettings(room, isHost);
  if (mode.audience === "minecraft") return renderMinecraftLobbySettings(room, isHost);
  if (mode.audience === "pokemon") return renderPokemonLobbySettings(room, isHost);
  return `<p class="muted">Tryb uzyje ustawien domyslnych.</p>`;
}

function bindRoomSettings(root, actions) {
  root.querySelectorAll("[data-room-time]").forEach(button => button.addEventListener("click", () => actions.setRoomTime(Number(button.dataset.roomTime))));
  root.querySelectorAll("[data-room-rounds]").forEach(button => button.addEventListener("click", () => actions.setModeSetting("rounds", Number(button.dataset.roomRounds))));
  bindImpostorLobbySettings(root, actions);
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
  root.querySelectorAll("[data-bomb-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.bombSetting, input.type === "checkbox" ? input.checked : input.value)));
  root.querySelectorAll("[data-bomb-category]").forEach(input => input.addEventListener("change", () => actions.setBombCategories([...root.querySelectorAll("[data-bomb-category]:checked")].map(item => item.dataset.bombCategory))));
  root.querySelectorAll("[data-truth-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.truthSetting, input.type === "checkbox" ? input.checked : input.value)));
  root.querySelectorAll("[data-truth-category]").forEach(input => input.addEventListener("change", () => actions.setClosestTruthCategories([...root.querySelectorAll("[data-truth-category]:checked")].map(item => item.dataset.truthCategory))));
  root.querySelectorAll("[data-ranking-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.rankingSetting, input.type === "checkbox" ? input.checked : input.value)));
  root.querySelectorAll("[data-ranking-category]").forEach(input => input.addEventListener("change", () => actions.setRankingCategories([...root.querySelectorAll("[data-ranking-category]:checked")].map(item => item.dataset.rankingCategory))));
  root.querySelectorAll("[data-five-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.fiveSetting, input.type === "checkbox" ? input.checked : input.value)));
  root.querySelectorAll("[data-five-category]").forEach(input => input.addEventListener("change", () => actions.setFiveSecondsCategories([...root.querySelectorAll("[data-five-category]:checked")].map(item => item.dataset.fiveCategory))));
  root.querySelectorAll("[data-clock-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.clockSetting, input.type === "checkbox" ? input.checked : input.value)));
  root.querySelectorAll("[data-pokemon-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.pokemonSetting, input.type === "checkbox" ? input.checked : input.value)));
  root.querySelectorAll("[data-pokemon-generation]").forEach(input => input.addEventListener("change", () => actions.setModeSetting("generations", [...root.querySelectorAll("[data-pokemon-generation]:checked")].map(item => Number(item.dataset.pokemonGeneration)))));
  root.querySelectorAll("[data-wavelength-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.wavelengthSetting, input.value)));
  root.querySelectorAll("[data-quiz-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.quizSetting, input.type === "checkbox" ? input.checked : input.value)));
  root.querySelectorAll("[data-math-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.mathSetting, input.type === "checkbox" ? input.checked : input.value)));
  root.querySelectorAll("[data-math-category]").forEach(input => input.addEventListener("change", () => actions.setModeSetting("categories", [...root.querySelectorAll("[data-math-category]:checked")].map(item => item.dataset.mathCategory))));
  root.querySelectorAll("[data-marker-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.markerSetting, input.value)));
  root.querySelectorAll("[data-sequence-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.sequenceSetting, input.type === "checkbox" ? input.checked : input.value)));
  root.querySelectorAll("[data-family-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.familySetting, input.type === "checkbox" ? input.checked : input.value)));
  root.querySelectorAll("[data-word-chain-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.wordChainSetting, input.type === "checkbox" ? input.checked : input.value)));
  root.querySelectorAll("[data-charades-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.charadesSetting, input.value)));
  root.querySelectorAll("[data-hangman-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.hangmanSetting, input.value)));
  root.querySelectorAll("[data-number-mystery-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.numberMysterySetting, input.value)));
  root.querySelectorAll("[data-unique-answer-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.uniqueAnswerSetting, input.type === "checkbox" ? input.checked : input.value)));
  root.querySelectorAll("[data-connect-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.connectSetting, input.value)));
  root.querySelectorAll("[data-liar-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.liarSetting, input.value)));
  root.querySelectorAll("[data-false-message-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.falseMessageSetting, input.value)));
  root.querySelectorAll("[data-false-message-category]").forEach(input => input.addEventListener("change", () => actions.setModeSetting("categories", [...root.querySelectorAll("[data-false-message-category]:checked")].map(item => item.dataset.falseMessageCategory))));
  root.querySelectorAll("[data-secret-rule-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.secretRuleSetting, input.value)));
  root.querySelectorAll("[data-secret-rule-category]").forEach(button => button.addEventListener("click", () => actions.setModeSetting("category", button.dataset.secretRuleCategory)));
  root.querySelector("#secret-rule-random-category")?.addEventListener("click", () => actions.randomSecretRuleCategory());
  root.querySelectorAll("[data-music-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.musicSetting, input.value)));
  root.querySelectorAll("[data-lyrics-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.lyricsSetting, input.type === "checkbox" ? input.checked : input.value)));
  root.querySelectorAll("[data-popularity-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.popularitySetting, input.type === "checkbox" ? input.checked : input.value)));
  root.querySelectorAll("[data-songspot-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.songspotSetting, input.type === "checkbox" ? input.checked : input.value)));
  root.querySelectorAll("[data-board-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.boardSetting, input.value)));
  root.querySelectorAll("[data-minecraft-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.minecraftSetting, input.value)));
}

function roomSettingsHtml(mode, room, isHost, actions) {
  return `<h2>Ustawienia</h2>${settingsHtml(mode, room, isHost, actions)}${commerceSummaryHtml(room.gameMode, room.settings, { readOnly:true })}`;
}

export function refreshRoomSettings(root, { room, currentUser }, actions) {
  const panel = root.querySelector(".lobby-settings");
  if (!panel || !room || room.status !== "lobby") return false;
  const mode = getGameMode(room.gameMode);
  panel.innerHTML = roomSettingsHtml(mode, room, room.hostUid === currentUser, actions);
  bindRoomSettings(panel, actions);
  return true;
}

function roomPlayerRow(uid, room, accounts, currentUser, isHost, canReport) {
  const key = escapeHtml(uid);
  const profile = {...accounts[uid], ...room.playerProfiles?.[uid], uid};
  const host = uid === room.hostUid;
  const friend = uid !== currentUser && accounts[currentUser]?.friends?.includes(uid);
  const canManageBot = isHost && room.status === "lobby" && isBotId(uid);
  return `<li class="room-player-row" data-player-uid="${key}">
    <div class="room-player-identity">${playerMini(profile, { disableIdle:true })}
      ${host ? `<span class="room-host-mark" title="Host" aria-label="Host">${icon("crown", 14)}</span>` : ""}
      ${lobbyAgeBadge(uid, room, accounts)}
      ${friend ? '<span class="friend-lobby-mark" title="Znajomy" aria-label="Znajomy">♥</span>' : ""}
    </div>
    ${uid !== currentUser && (isHost || canReport) ? `<div class="room-player-tools">
      ${canReport ? `<button class="ghost room-icon-action" data-report-player="${key}" aria-label="Zgłoś gracza" title="Zgłoś gracza">⚠️</button>` : ""}
      ${isHost ? `<button class="danger room-icon-action" data-kick="${key}" aria-label="Wyrzuć z pokoju" title="Wyrzuć z pokoju">${icon("x", 15)}</button>` : ""}
    </div>` : ""}
    ${canManageBot ? `<select class="room-bot-difficulty" data-bot-difficulty="${key}" aria-label="Poziom trudności bota" title="Poziom trudności bota">
      ${BOT_DIFFICULTIES.map(item => `<option value="${item.id}" ${item.id === (profile.botDifficulty || "normal") ? "selected" : ""}>${item.label}</option>`).join("")}
    </select>` : ""}
  </li>`;
}

export function renderRoom(root, { room, accounts, currentUser }, actions) {
  const mode = getGameMode(room.gameMode);
  const isHost = room.hostUid === currentUser;
  const competitiveQuiz = mode.id === "quiz" && room.settings?.quizVariant === "competitive";
  const canReport = Boolean(mode.allowReports);
  const canAddBots = roomAllowsBots(room, mode) && isHost;
  const roomCapacity = Math.max(mode.minPlayers, Math.min(mode.maxPlayers, Number(room.maxPlayers) || mode.maxPlayers));
  const hasSpace = room.status === "lobby" && room.players.length < roomCapacity;
  const canStart = room.players.length >= mode.minPlayers;
  const activity = Array.isArray(room.activity) ? room.activity.slice().reverse() : [];
  const activityPanel = activity.length ? `<details class="panel room-activity-panel compact-room-activity"><summary>Aktywność <span class="badge">${activity.length}</span></summary><div class="room-activity-list">${activity.map(item => `<div class="room-activity-item"><i></i><span>${escapeHtml(item.text)}</span><time>${new Date(Number(item.createdAt)||Date.now()).toLocaleTimeString("pl-PL",{hour:"2-digit",minute:"2-digit"})}</time></div>`).join("")}</div></details>` : "";
  room.viewerUid = currentUser;
  root.innerHTML = `<main class="page room-page compact-room enter">
    <section class="panel room-header">
      <div class="room-heading"><p class="eyebrow">${modeVisual(mode)} ${mode.name}</p><h1>${escapeHtml(room.name)}</h1>
        ${room.roomType === "betting" ? `<span class="room-type-badge is-betting">◈ Zakład · ${Number(room.entryFee || 0).toLocaleString("pl-PL")}$</span>` : ""}
      </div>
      <div class="room-header-actions">
        <code class="compact-room-code" title="Kod pokoju" aria-label="Kod pokoju ${escapeHtml(room.roomId)}">${escapeHtml(room.roomId)}</code>
        <button class="ghost room-icon-action" id="copy-invite-link" aria-label="Kopiuj link zaproszenia" title="Kopiuj link zaproszenia">${icon("copy", 17)}</button>
        <button class="ghost room-icon-action" id="share-invite-link" aria-label="Udostępnij zaproszenie" title="Udostępnij zaproszenie">${icon("share", 17)}</button>
        <button class="ghost room-icon-action info-button" id="mode-info" aria-label="Jak grać" title="Jak grać">i</button>
        ${isHost && room.status === "lobby" ? '<div class="host-announcement-anchor" data-host-announcement-anchor></div>' : ""}
        <button class="ghost compact-room-leave" id="leave-room" aria-label="Wyjdź" title="Wyjdź">${icon("logout", 17)} <span>Wyjdź</span></button>
      </div>
    </section>
    <section class="lobby-layout">
      <section class="panel compact-room-roster" aria-labelledby="room-players-title">
        <div class="room-roster-head"><h2 id="room-players-title">Gracze</h2><span class="badge" title="Gracze w pokoju">${room.players.length}/${roomCapacity}</span>
          <div class="room-roster-tools">
            ${hasSpace && canAddBots ? `<button class="ghost room-icon-action compact-add-bot" data-add-bot ${botTooltip} aria-label="Dodaj bota">🤖 <span aria-hidden="true">+</span></button>` : ""}
            ${hasSpace && !competitiveQuiz ? `<button class="ghost room-icon-action" id="invite-friend" aria-label="Zaproś znajomego" title="Zaproś znajomego">${icon("userPlus", 18)}</button>` : ""}
          </div>
        </div>
        <ul class="room-player-list">${room.players.map(uid => roomPlayerRow(uid, room, accounts, currentUser, isHost, canReport)).join("")}</ul>
        <div class="compact-room-start">${isHost ? `<button class="primary" id="start-game" ${canStart ? "" : "disabled"}>${icon("play", 16)} Start gry</button>${canStart ? "" : `<small>Min. ${mode.minPlayers} graczy</small>`}` : '<small>Czekamy na hosta</small>'}</div>
      </section>
      <section class="panel lobby-settings">${roomSettingsHtml(mode, room, isHost, actions)}</section>
    </section>
    ${activityPanel}
    ${adSenseBlock("Reklama", "lobby")}
  </main>`;
  root.querySelector("#leave-room").addEventListener("click", () => actions.leaveRoom());
  root.querySelector("#mode-info").addEventListener("click", () => actions.showGameInfo(mode.id));
  if (mode.id === "ranking") actions.showRankingIntro?.();
  root.querySelector("#copy-invite-link")?.addEventListener("click", () => actions.copyInviteLink(room.roomId));
  root.querySelector("#share-invite-link")?.addEventListener("click", () => actions.shareInviteLink(room.roomId));
  root.querySelector("#invite-friend")?.addEventListener("click", () => actions.openFriends({ inviteMode:true }));
  bindRoomSettings(root, actions);
  root.querySelector("#save-identity-words")?.addEventListener("click", () => actions.saveIdentityWords(root.querySelector("#identity-custom-words").value));
  root.querySelectorAll("[data-kick]").forEach(button => button.addEventListener("click", () => actions.kickPlayer(button.dataset.kick)));
  root.querySelectorAll("[data-add-bot]").forEach(button => button.addEventListener("click", () => actions.addBot()));
  root.querySelectorAll("[data-bot-difficulty]").forEach(select => select.addEventListener("change", event => actions.setBotDifficulty(select.dataset.botDifficulty, event.target.value)));
  root.querySelectorAll("[data-report-player]").forEach(button => button.addEventListener("click", () => actions.openReportModal(button.dataset.reportPlayer)));
  root.querySelector("#start-game")?.addEventListener("click", actions.startGame);
}
