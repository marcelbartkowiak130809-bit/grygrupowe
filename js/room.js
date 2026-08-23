import { escapeHtml, icon, playerMiniHtml } from "./utils.js?v=20260822-1";
import { getGameMode } from "./games.js?v=20260823-9";
import { pokemonDex } from "./pokemonData.js?v=20260804-2";
import { renderImpostorLobbySettings } from "./impostor.js?v=20260822-1";
import { renderIdentityLobbySettings } from "./identity.js?v=20260611-1";
import { renderOtherQuestionLobbySettings } from "./otherQuestion.js?v=20260605-4";
import { renderMostLikelyLobbySettings } from "./mostLikely.js?v=20260612-1";
import { renderFriendshipLobbySettings } from "./friendshipTest.js?v=20260605-1";
import { renderPoisonCandyLobbySettings } from "./poisonCandy.js?v=20260822-9";
import { renderBombLobbySettings } from "./bomb.js?v=20260621-1";
import { renderClosestTruthLobbySettings } from "./closestTruth.js?v=20260612-3";
import { renderRankingLobbySettings } from "./ranking.js?v=20260612-2";
import { renderFiveSecondsLobbySettings } from "./fiveSeconds.js?v=20260612-2";
import { renderClockLobbySettings } from "./clock.js?v=20260613-1";
import { renderPokemonLobbySettings } from "./pokemon.js?v=20260822-8";
import { renderWavelengthLobbySettings } from "./wavelength.js?v=20260822-1";
import { renderQuizLobbySettings } from "./quiz.js?v=20260823-5";
import { renderMathematicsLobbySettings } from "./mathematics.js?v=20260805-1";
import { renderMarkerLobbySettings } from "./marker.js?v=20260823-1";
import { renderSequenceLobbySettings } from "./sequence.js?v=20260813-2";
import { renderFamilyLobbySettingsV2 as renderFamilyLobbySettings } from "./family.js?v=20260822-2";
import { renderWordChainLobbySettings } from "./wordChain.js?v=20260822-2";
import { renderNumberMysteryLobbySettings } from "./numberMystery.js?v=20260823-2";
import { adSenseBlock } from "./publicPages.js?v=20260822-1";
import { BOT_DIFFICULTIES, BOT_NOTICE, botTooltip, botIds, isBotId, roomAllowsBots } from "./bots.js?v=20260823-2";

const pokemonCardIds = { "pokemon-dex":25, "pokemon-last-letter":133, "pokemon-evolution":1, "pokemon-auction":149, "pokemon-types":7, "pokemon-match-type":4 };
const modeEmojis = { wavelength:"🌈", quiz:"🎲", mathematics:"🧮", marker:"🖍️", sequence:"🔐", family:"📊", "word-chain":"🔗" };
function modeVisual(mode) { const pokemon = mode.audience === "pokemon" && pokemonDex.find(item => item.id === pokemonCardIds[mode.id]); return pokemon ? `<img class="mode-pokemon-symbol" src="${pokemon.sprite}" alt="${escapeHtml(pokemon.name)}" onerror="this.onerror=null;this.src='${pokemon.spriteFallback}'">` : (modeEmojis[mode.id] || mode.symbol); }

export function playerMini(profile = {}, options = {}) {
  return `${profile?.isBot ? `<span class="bot-player-mark" ${botTooltip} aria-label="Bot eksperymentalny">🤖</span>` : ""}${playerMiniHtml(profile, "", options)}`;
}

function lobbyAgeStatus(uid, room, accounts) {
  const status = room.playerProfiles?.[uid]?.adultStatus || accounts[uid]?.adultStatus || "unknown";
  return ["adult", "minor"].includes(status) ? status : "unknown";
}

function lobbyAgeBadge(uid, room, accounts) {
  const status = lobbyAgeStatus(uid, room, accounts);
  const label = status === "adult" ? "18+" : status === "minor" ? "&lt;18" : "-";
  return `<span class="age-badge age-${status}">${label}</span>`;
}

function settingsHtml(mode, room, isHost, actions) {
  if (mode.id === "udowodnij") return `<p class="muted">Po starcie gry nie da sie zmienic ustawien.</p><p class="tiny">Czas odpowiedzi</p><div class="time-pills">${[15,30,45,60].map(time => `<button data-room-time="${time}" ${isHost ? "" : "disabled"} class="${Number(room.settings.answerTime) === time ? "active" : ""}">${time}s</button>`).join("")}</div><p class="tiny rounds-setting-label">Liczba rund</p><div class="time-pills">${[3,5,7,10].map(rounds => `<button data-room-rounds="${rounds}" ${isHost ? "" : "disabled"} class="${Number(room.settings.rounds || 5) === rounds ? "active" : ""}">${rounds}</button>`).join("")}</div>`;
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
  if (mode.id === "number-mystery") return renderNumberMysteryLobbySettings(room, isHost);
  if (mode.audience === "pokemon") return renderPokemonLobbySettings(room, isHost);
  return `<p class="muted">Tryb uzyje ustawien domyslnych.</p>`;
}

export function renderRoom(root, { room, accounts, currentUser }, actions) {
  const mode = getGameMode(room.gameMode);
  const isHost = room.hostUid === currentUser;
  const competitiveQuiz = mode.id === "quiz" && room.settings?.quizVariant === "competitive";
  const inviteFriendButton = competitiveQuiz ? "" : '<button class="ghost" id="invite-friend">Zaproś znajomego</button>';
  const canReport = Boolean(mode.allowReports);
  const canAddBots = roomAllowsBots(room, mode) && isHost;
  const roomCapacity = Math.max(mode.minPlayers, Math.min(mode.maxPlayers, Number(room.maxPlayers) || mode.maxPlayers));
  const openSlots = room.status === "lobby" ? Math.min(1, Math.max(0, roomCapacity - room.players.length)) : 0;
  const inviteLink = actions.inviteLink?.(room) || "";
  room.viewerUid = currentUser;
  root.innerHTML = `<main class="page room-page enter">
    <section class="panel room-header">
      <div><p class="eyebrow">${modeVisual(mode)} ${mode.name}</p><span class="room-type-badge ${room.roomType === "betting" ? "is-betting" : "is-standard"}">${room.roomType === "betting" ? "◈ ZAKŁADY · " + Number(room.entryFee || 0).toLocaleString("pl-PL") + "$" : "● STANDARD"}</span><h1>${escapeHtml(room.name)}</h1><p class="muted">Kod: <b>${room.roomId}</b> · Gracze ${room.players.length}/${roomCapacity}</p></div>
      <div class="room-header-actions"><button class="icon-btn info-button" id="mode-info" aria-label="Jak grać">i</button><button class="ghost" id="leave-room">Wyjdz</button></div>
    </section>
    <section class="lobby-layout">
      <section class="panel lobby-settings"><p class="eyebrow">USTAWIENIA</p><h2>Przygotuj rozgrywke</h2>${settingsHtml(mode, room, isHost, actions)}</section>
      <aside class="panel room-code"><p class="eyebrow">KOD POKOJU</p><strong>${room.roomId}</strong><p class="muted">Podaj kod znajomym albo wyślij link zaproszenia.</p><label class="tiny" for="invite-link">Link zaproszenia</label><input id="invite-link" class="invite-link-field" value="${escapeHtml(inviteLink)}" readonly><div class="invite-actions"><button class="primary" id="copy-invite-link">Kopiuj link zaproszenia</button><button class="ghost" id="share-invite-link">Udostępnij</button>${inviteFriendButton}</div>${adSenseBlock("Reklama", "lobby")}</aside>
    </section>
    <div class="section-intro"><div><p class="eyebrow">EKIPA</p><h2>Gracze w pokoju</h2>${(canAddBots || botIds(room).length) ? `<p class="bot-experimental-note" ${botTooltip}>🤖 Boty są funkcją testową · ${BOT_NOTICE}</p>` : ""}</div><span class="badge">${room.players.length}/${roomCapacity}</span></div>
    <section class="player-grid">${room.players.map(uid => `<article class="player-card">
      ${uid === room.hostUid ? `<span class="crown">${icon("crown", 20)}</span>` : ""}
      ${playerMini({...accounts[uid],...room.playerProfiles?.[uid],uid}, { disableIdle: true })}<p class="player-status"><i></i>${uid === room.hostUid ? "Host" : "Gotowy"} ${lobbyAgeBadge(uid, room, accounts)}${uid !== currentUser && accounts[currentUser]?.friends?.includes(uid) ? '<span class="friend-lobby-mark" title="Znajomy">♥</span>' : ""}</p>
      ${isHost && room.status === "lobby" && isBotId(uid) ? `<label class="bot-difficulty-control"><span ${botTooltip}>Inteligencja bota</span><select data-bot-difficulty="${uid}">${BOT_DIFFICULTIES.map(item=>`<option value="${item.id}" ${item.id===(room.playerProfiles?.[uid]?.botDifficulty||"normal")?"selected":""}>${item.label}</option>`).join("")}</select></label>` : ""}
      ${canReport && uid !== currentUser ? `<button class="icon-btn report-player-button" data-report-player="${uid}" aria-label="Zgłoś gracza">⚠️</button>` : ""}
      ${isHost && uid !== currentUser ? `<button class="danger" data-kick="${uid}">Wyrzuc</button>` : ""}
    </article>`).join("")}</section>
    ${openSlots ? `<section class="player-grid bot-slots">${Array.from({length:openSlots},()=>`<article class="player-card empty-player-slot"><div class="empty-slot-icon">${icon("users", 22)}</div><p class="muted">Wolne miejsce</p>${canAddBots ? `<div class="empty-slot-actions"><button class="ghost" data-add-bot ${botTooltip}>🤖 Dodaj bota</button><button class="ghost" data-invite-slot>Zaproś gracza</button></div>` : ""}</article>`).join("")}</section>` : ""}
    <section class="room-actions">${isHost ? `<button class="primary big" id="start-game" ${room.players.length < mode.minPlayers ? "disabled" : ""}>${icon("play", 20)} Start gry</button>` : '<p class="muted">Czekamy, az host rozpocznie gre.</p>'}
      ${room.players.length < mode.minPlayers ? `<p class="muted">Do startu potrzeba minimum ${mode.minPlayers} graczy.</p>` : ""}</section>
  </main>`;
  root.querySelector("#leave-room").addEventListener("click", () => actions.leaveRoom());
  root.querySelector("#mode-info").addEventListener("click", () => actions.showGameInfo(mode.id));
  if (mode.id === "ranking") actions.showRankingIntro?.();
  root.querySelector("#copy-invite-link")?.addEventListener("click", () => actions.copyInviteLink(room.roomId));
  root.querySelector("#share-invite-link")?.addEventListener("click", () => actions.shareInviteLink(room.roomId));
  root.querySelector("#invite-friend")?.addEventListener("click", () => actions.openFriends({ inviteMode:true }));
  root.querySelectorAll("[data-room-time]").forEach(button => button.addEventListener("click", () => actions.setRoomTime(Number(button.dataset.roomTime))));
  root.querySelectorAll("[data-room-rounds]").forEach(button => button.addEventListener("click", () => actions.setModeSetting("rounds", Number(button.dataset.roomRounds))));
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
  root.querySelectorAll("[data-number-mystery-setting]").forEach(input => input.addEventListener("change", () => actions.setModeSetting(input.dataset.numberMysterySetting, input.value)));
  root.querySelector("#save-identity-words")?.addEventListener("click", () => actions.saveIdentityWords(root.querySelector("#identity-custom-words").value));
  root.querySelectorAll("[data-kick]").forEach(button => button.addEventListener("click", () => actions.kickPlayer(button.dataset.kick)));
  root.querySelectorAll("[data-add-bot]").forEach(button => button.addEventListener("click", () => actions.addBot()));
  root.querySelectorAll("[data-invite-slot]").forEach(button => button.addEventListener("click", () => actions.openFriends({ inviteMode:true })));
  root.querySelectorAll("[data-bot-difficulty]").forEach(select => select.addEventListener("change", event => actions.setBotDifficulty(select.dataset.botDifficulty, event.target.value)));
  root.querySelectorAll("[data-report-player]").forEach(button => button.addEventListener("click", () => actions.openReportModal(button.dataset.reportPlayer)));
  root.querySelector("#start-game")?.addEventListener("click", actions.startGame);
}
