import { accountModal, authModal } from "./auth.js?v=20260831-3";
import { Audio } from "./audio.js";
import { changelogEntries, latestChangelog } from "./changelog.js?v=20260901-3";
import { Effects } from "./effects.js";
import { cosmetics } from "./cosmetics.js?v=20260901-3";
import { acknowledgeRemoteImpostorRole, authenticateGuest, authenticateNick, buyPotionPack as buyPotionPackRemote, buyPotionPackDatabase, claimLuckySpin as claimLuckySpinRemote, claimLuckySpinDatabase, clearSession, getFirebaseSession, hashRoomPassword, hasOnlineBackend, initFirebaseAuth, loadAccounts, loadFriendRequest, loadFriendRequestBucket, loadHonorCounts, loadModerationBans, loadModerationReports, loadInboxForNick, loadPublicProfiles, loadRemoteProfile, loadRemoteProfileState, loadRemoteRoom, loadSession, loadSiteStats, logoutAuth, mutateRemoteRoomGame, nickToEmail, recordSiteEvent, removeRemoteRoom, saveAccounts, saveSession, sendInboxMessageToNick, saveModerationBan, setFriendRequest, setRemoteBirthDateForNick, serverNow, startPresence, startRoomPresence, submitHonor as submitHonorRemote, submitModerationReport, subscribeFriendRequests, subscribeOnlineCount, subscribeRemoteRooms, subscribeSiteStats, syncPlayerProfile, syncRoomState, updateAuthPassword, updateFriendRequest, updateRemoteProfileFields, usePotion as usePotionRemote, usePotionDatabase, voteWouldYouRather } from "./firebase.js?v=20260901-4";
import { answerList, createNewRound, evaluateAnswer, nextProvePlayer, provePhaseEnd, stopGameTimer } from "./game.js?v=20260901-1";
import { gamesList, getGameMode } from "./games.js?v=20260901-3";
import { defaultCommercePreferences, gamePassById, gamePassState, hasGamePass, inGamePurchaseById, normalizeCommerceSettings } from "./gamePasses.js?v=20260901-10";
import { createImpostorGame, ImpostorEngine, sanitizeImpostorSettings, stopImpostorTimer } from "./impostor.js?v=20260831-4";
import { createIdentityGame, IdentityEngine, stopIdentityTimer } from "./identity.js?v=20260831-3";
import { createIdentityVoiceChat } from "./identityVoiceChat.js?v=20260822-5";
import { createOtherQuestionGame, OtherQuestionEngine, stopOtherQuestionTimer } from "./otherQuestion.js?v=20260605-4";
import { currentWouldYouRather, renderWouldYouRather, setWouldYouRatherVote, stopWouldYouRather, wouldYouRatherPlayerKey } from "./wouldYouRather.js?v=20260831-2";
import { createMostLikelyGame, MostLikelyEngine, stopMostLikelyTimer } from "./mostLikely.js?v=20260612-1";
import { createFriendshipTestGame, FriendshipTestEngine, stopFriendshipTimer } from "./friendshipTest.js?v=20260605-1";
import { createPoisonCandyGame, PoisonCandyEngine, sanitizePoisonCandySettings, stopPoisonCandyTimer } from "./poisonCandy.js?v=20260831-11";
import { createBombGame, BombEngine, sanitizeBombSettings, stopBombTimer } from "./bomb.js?v=20260621-1";
import { createClosestTruthGame, ClosestTruthEngine, sanitizeClosestTruthSettings } from "./closestTruth.js?v=20260612-3";
import { createRankingGame, RankingEngine, sanitizeRankingSettings } from "./ranking.js?v=20260824-2";
import { createFiveSecondsGame, FiveSecondsEngine, sanitizeFiveSecondsSettings, stopFiveSecondsTimer } from "./fiveSeconds.js?v=20260824-1";
import { createClockGame, ClockEngine, sanitizeClockSettings, stopClockTimer } from "./clock.js?v=20260831-3";
import { createPokemonGame, PokemonEngine, stopPokemonTimer } from "./pokemon.js?v=20260831-10";
import { createWavelengthGame, WavelengthEngine, stopWavelengthTimer } from "./wavelength.js?v=20260831-4";
import { createQuizGame, QuizEngine, renderQuizSelect, stopQuizTimer } from "./quiz.js?v=20260823-5";
import { createMathematicsGame, MathematicsEngine, stopMathematicsTimer } from "./mathematics.js?v=20260805-1";
import { createMarkerGame, MarkerEngine, stopMarkerTimer } from "./marker.js?v=20260823-1";
import { createSequenceGame, SequenceEngine, markSequenceReady, timeoutSequenceCreation, stopSequenceTimer } from "./sequence.js?v=20260813-2";
import { createFamilyGame, FamilyEngine, stopFamilyTimer } from "./family.js?v=20260822-2";
import { createWordChainGame, WordChainEngine, stopWordChainTimer } from "./wordChain.js?v=20260822-2";
import { createNumberMysteryGame, NumberMysteryEngine, stopNumberMysteryTimer } from "./numberMystery.js?v=20260831-3";
import { createUniqueAnswerGame, UniqueAnswerEngine, stopUniqueAnswerTimer, sanitizeUniqueAnswerSettings } from "./uniqueAnswer.js?v=20260823-5";
import { createConnectGame, ConnectEngine, stopConnectTimer } from "./connect.js?v=20260831-3";
import { createLiarGame, LiarEngine, sanitizeLiarSettings, stopLiarTimer } from "./liar.js?v=20260831-3";
import { createFalseMessageGame, FalseMessageEngine, sanitizeFalseMessageSettings, stopFalseMessageTimer } from "./falseMessage.js?v=20260831-3";
import { createSecretRuleGame, SecretRuleEngine, sanitizeSecretRuleSettings, secretRuleCategories, stopSecretRuleTimer } from "./secretRule.js?v=20260831-4";
import { createMusicDuelGame, createMusicArenaGame, MusicDuelEngine, MusicArenaEngine, searchMusicTracks, stopMusicTimer } from "./music.js?v=20260901-2";
import { PopularityEngine, PopularitySoloEngine, createPopularityGame, popularityTracks, renderPopularitySolo, sanitizePopularitySettings, stopPopularityTimer } from "./popularity.js?v=20260901-3";
import { BoardEngine, createBoardGame, renderBoardGame, renderBoardLobbySettings, sanitizeBoardSettings, stopBoardGameTimer } from "./boardGames.js?v=20260901-6";
import { createRoomModal, renderLobby } from "./lobby.js?v=20260901-3";
import { renderBoardModes, renderPlatform, renderPokemonModes } from "./platform.js?v=20260901-4";
import { activatePublicAds, adSenseBlock, deactivatePublicAds, renderPublicPage } from "./publicPages.js?v=20260901-2";
import { Router } from "./router.js";
import { playerMini, renderRoom, refreshRoomSettings } from "./room.js?v=20260901-4";
import { renderShop, stopShopTimer } from "./shop.js?v=20260901-5";
import { $, avatarHtml, escapeHtml, icon, normalizeNick, randomGuestNick, uid } from "./utils.js?v=20260822-1";
import { claimCompletedQuestRewards, grantProgression, levelProgressButtonHtml, noteQuestEvent, progressionModal, questNotificationKey } from "./progression.js?v=20260901-6";
import { isModeLocked, lockedModeMessage } from "./upcomingModes.js?v=20260901-7";
import { friendRequestCount, friendsModal, showFriendNotification } from "./friends.js?v=20260831-1";
import { loadPresenceUsers } from "./firebase.js?v=20260901-4";
import { BOT_DIFFICULTIES, botCount, botDelay, botIds, botName, botProfile, botRewardMultiplier, botShouldBeCorrect, isBotId, roomAllowsBots } from "./bots.js?v=20260823-2";
import { scheduleBot } from "./botController.js?v=20260901-3";
import { drawLocalLuckySpin, isLuckySpinAvailable, luckySpinModal } from "./luckySpin.js?v=20260901-9";
import { equipmentById, equipmentModal } from "./equipment.js?v=20260804-3";
import { potionPackById } from "./potionPacks.js?v=20260831-1";
import { honorModal } from "./honor.js?v=20260804-2";
import { QUICK_REACTIONS, renderQuickReactions } from "./quickReactions.js?v=20260804-1";
import { HOST_ANNOUNCEMENTS, renderHostAnnouncements } from "./quickAnnouncements.js?v=20260822-2";
import { formatHappyHourCountdown, happyHourAt, happyHourBannerHtml, happyHourMultiplier, happyHourNextChange } from "./happyHour.js?v=20260831-3";

const root = $("#app");
const APP_VERSION = "v6.0.0";
const APP_VERSION_KEY = "grygrupowe-app-version";
const previousAppVersion = localStorage.getItem(APP_VERSION_KEY);
if (previousAppVersion !== APP_VERSION) {
  localStorage.setItem(APP_VERSION_KEY, APP_VERSION);
  localStorage.removeItem("udowodnij_local_rooms_v1");
  window.setTimeout(() => window.location.reload(), 0);
}
const THEME_STORAGE_KEY = "grygrupowe-theme";
const POTION_INVENTORY_RESET_KEY = "grygrupowe-potion-inventory-reset-v2";
function applyTheme(theme = localStorage.getItem(THEME_STORAGE_KEY) || "dark") {
  document.documentElement.classList.toggle("light-theme", theme === "light");
  document.documentElement.style.colorScheme = theme === "light" ? "light" : "dark";
}
function lightThemeEnabled() { return document.documentElement.classList.contains("light-theme"); }
function normalizePotionInventory(inventory) {
  const source = inventory && typeof inventory === "object" ? inventory : {};
  return Object.fromEntries(Object.entries(source)
    .map(([id, value]) => [id, Math.max(0, Math.floor(Number(value) || 0))])
    .filter(([id, quantity]) => equipmentById[id] && quantity > 0));
}
applyTheme();
const accounts = loadAccounts();
Object.values(accounts).forEach(account => { if(account.password&&!account.passwordHash)account.passwordHash=hashRoomPassword(`account:${account.password}`);delete account.password;account.ownedCosmetics={defaultNick:true,defaultFrame:true,noAura:true,defaultCandy:true,defaultBomb:true,defaultClock:true,defaultMarker:true,defaultSequence:true,...(account.ownedCosmetics||{})};account.gamePasses={...(account.gamePasses||{})};account.selectedNickEffect ||= "defaultNick";account.selectedAvatarFrame ||= "defaultFrame";account.selectedAura ||= "noAura";account.selectedCandySkin ||= "defaultCandy";account.selectedBombSkin ||= "defaultBomb";account.selectedClockSkin ||= "defaultClock";account.selectedMarkerSkin ||= "defaultMarker";account.selectedSequenceSkin ||= "defaultSequence";account.selectedBoardLudoSkin ||= "defaultLudoBoard";account.selectedBoardMemorySkin ||= "defaultMemoryBoard";account.selectedIdleAnimation ||= "";account.selectedWinAnimation ||= "";account.selectedLoseAnimation ||= "";account.potionInventory=normalizePotionInventory(account.potionInventory);account.privacy={historyPublic:true,statsPublic:true, friendsPublic:true,...(account.privacy||{})};account.gameHistory=Array.isArray(account.gameHistory)?account.gameHistory:[];account.birthDate ||= "";account.adultStatus = adultStatusFor(account);account.inbox = Array.isArray(account.inbox) ? account.inbox : [];account.friends = Array.isArray(account.friends) ? account.friends : [];account.friendRequests = { incoming:{}, outgoing:{}, ...(account.friendRequests||{}), incoming:{...(account.friendRequests?.incoming||{})}, outgoing:{...(account.friendRequests?.outgoing||{})} }; });
Object.values(accounts).forEach(account => { account.honorCounts={nicePlayer:0,goodOpponent:0,greatHost:0,notVerySmart:0,poorSport:0,...(account.honorCounts||{})}; });
if (localStorage.getItem(POTION_INVENTORY_RESET_KEY) !== "1") {
  Object.values(accounts).forEach(account => { account.potionInventory = {}; });
  localStorage.setItem(POTION_INVENTORY_RESET_KEY, "1");
}
saveAccounts(accounts);
const session=loadSession();
const validModeIds = new Set(gamesList.map(mode => mode.id));
const normalizeModeParam = value => { const id = String(value || "").trim().toLowerCase(); return validModeIds.has(id) ? id : ""; };
const modePath = modeId => `/${encodeURIComponent(modeId || "").replace(/%2F/gi,"")}`;
function readUrlRoute() {
  try {
    const params = new URLSearchParams(window.location.search), pathMode = String(window.location.pathname || "").replace(/^\/+|\/+$/g,"").toLowerCase(), rawMode = normalizeModeParam(pathMode) || String(params.get("mode") || "").trim().toLowerCase(), room = String(params.get("room") || "").trim().toUpperCase();
    const mode = normalizeModeParam(rawMode);
    return { mode, room, invalidMode:Boolean(rawMode && !mode) };
  } catch { return { mode:"", room:"", invalidMode:false }; }
}
const initialUrlRoute = readUrlRoute();
const state = { accounts, currentUser:accounts[session.currentUser]?session.currentUser:null, rooms: [], activeRoomId:initialUrlRoute.room?null:(session.activeRoomId||null), selectedGameMode:initialUrlRoute.mode||session.selectedGameMode||"udowodnij", quizVariant:session.quizVariant||"casual", afterLogin: null, pendingJoin:null, pendingInviteMode:initialUrlRoute.mode?initialUrlRoute.mode:"", pendingInviteRoom:initialUrlRoute.room||"", pendingInviteInvalidMode:initialUrlRoute.room&&initialUrlRoute.invalidMode, pendingInviteJoining:false, inviteAuthPrompted:false, onlineBackend:null, networkOnline:navigator.onLine !== false, syncStatus:"idle", shopReturnScreen:null, onlineCount:1, globalStats:loadSiteStats(), globalStatsSignature:"" };
window.__globalStats = state.globalStats;
let friendDirectory = {};
let stopFriendRequestsSubscription = () => {};
let friendPresence = {};
let friendPollTimer = null;
const friendSeenNotifications = new Set();
const botSchedules = new Map();
let roundAdvanceTimer = 0;
let roundAdvanceInterval = 0;
const roundAdvanceDeadlines = new Map();
let happyHourTimer = 0;
let happyHourRefreshTimer = 0;
let happyHourResizeObserver = null;
let roomPresenceStop = () => {};
let roomPresenceId = "";
const ROOM_PRESENCE_TTL_MS = 45000;
const ROOM_STALE_JOIN_GRACE_MS = 15000;
const staleRoomCleanupLocks = new Set();
const profile = () => state.currentUser ? state.accounts[state.currentUser] : null;
const activeRoom = () => state.rooms.find(room => room.roomId === state.activeRoomId);
function ensureRoomPresence(room) {
  const nextId = room?.roomId && state.currentUser && room.players?.includes(state.currentUser) ? room.roomId : "";
  if (nextId === roomPresenceId) return;
  roomPresenceStop(); roomPresenceStop = () => {}; roomPresenceId = nextId;
  if (nextId) roomPresenceStop = startRoomPresence(nextId, state.currentUser);
}
function duoRoomHasGonePlayer(room) {
  // Lobby nie jest jeszcze rozgrywką. Nie zamykaj go podczas dołączania,
  // kiedy drugi klient może dopiero rejestrować swoją obecność.
  if (room?.status === "lobby" && !room.game) return false;
  const humans=(room?.players||[]).filter(uid=>!isBotId(uid)), presence=room?.presence||{};
  if (humans.length!==2 || !Object.keys(presence).length) return false;
  const live=uid=>Object.values(presence[uid]||{}).some(client=>Date.now()-Number(client?.seenAt||0)<45000);
  const missing=humans.find(uid=>!live(uid));
  if (!missing || !humans.some(live)) return false;
  // Po dołączeniu druga karta potrzebuje chwili na zapis pierwszego heartbeat'u.
  // Bez tej ochrony świeże lobby było zamykane zanim nowy gracz zdążył wejść.
  const joinedAt=Number(room.joinedAt?.[missing] || room.updatedAt || 0);
  if (joinedAt && Date.now() - joinedAt < 15000) return false;
  return true;
}
const roomEntryFee = room => room?.roomType === "betting" ? Math.max(0, Number(room.entryFee) || 0) : 0;
const playerMoney = (room, uid) => { const player=state.accounts[uid] || room?.playerProfiles?.[uid] || {}; return Number(player.nickOnly ? player.sessionMoney : player.money) || 0; };
function setUrlRoute(modeId = "", roomId = "") {
  try {
    const url = new URL(window.location.href);
    url.pathname = modeId ? modePath(modeId) : "/";
    url.searchParams.delete("mode");
    if (roomId) url.searchParams.set("room", roomId); else url.searchParams.delete("room");
    window.history.replaceState(null, "", url);
  } catch {}
}
const setModeUrl = modeId => setUrlRoute(modeId || state.selectedGameMode, "");
const setRoomUrl = room => room && setUrlRoute(room.gameMode || state.selectedGameMode, room.roomId);
const roomInviteLink = room => {
  try { const url = new URL(window.location.href); url.pathname = modePath(room.gameMode); url.searchParams.delete("mode"); url.searchParams.set("room", room.roomId); return url.toString(); }
  catch { return `${window.location.origin}/${encodeURIComponent(room.gameMode)}?room=${encodeURIComponent(room.roomId)}`; }
};
const stableStringify = value => JSON.stringify(value, (key, item) => {
  if (key === "updatedAt") return undefined;
  if (!item || typeof item !== "object" || Array.isArray(item)) return item;
  return Object.keys(item).sort().reduce((sorted, childKey) => {
    sorted[childKey] = item[childKey];
    return sorted;
  }, {});
});
function activeRoomSignature(room = activeRoom()) {
  if (!room) return "";
  const players = normalizedRoomPlayers(room);
  const revision = Number(room.updatedAt || room.createdAt || 0);
  if (revision) return [room.roomId, revision, room.status, room.gameMode, room.hostUid || "", players.join(","), room.pendingRewards?.[state.currentUser] || 0, room.pendingXp?.[state.currentUser] || 0].join("|");
  return stableStringify({ roomId:room.roomId, gameMode:room.gameMode, hostUid:room.hostUid, players, status:room.status, settings:room.settings, game:room.game });
}
function roomSettingsOnlyChanged(previous, next) {
  if (!previous || !next || previous.roomId !== next.roomId || previous.status !== "lobby" || next.status !== "lobby") return false;
  const withoutSettings = room => { const copy = { ...room }; delete copy.settings; return stableStringify(copy); };
  return withoutSettings(previous) === withoutSettings(next) && stableStringify(previous.settings) !== stableStringify(next.settings);
}
function lobbySignature() {
  const rooms = state.rooms.filter(room => room.gameMode === state.selectedGameMode && room.status === "lobby").map(room => [room.roomId, room.updatedAt || room.createdAt || 0, room.name, room.maxPlayers, room.isPrivate, room.roomType, room.entryFee, normalizedRoomPlayers(room).join(","), room.hostUid || ""].join("|"));
  return `${state.selectedGameMode}|${state.onlineBackend}|${rooms.join(";")}`;
}
function currentScreenSignature() {
  if (["room","game"].includes(Router.current)) return activeRoomSignature();
  if (Router.current === "lobby") return lobbySignature();
  if (Router.current === "platform") return stableStringify(activityStats());
  return "";
}
const accountByNick = nick => Object.entries(state.accounts).find(([, account]) => normalizeNick(account.nick) === normalizeNick(nick) && !account.nickOnly);
const publicProfile = player => ({ nick:player?.nick || "Gracz", avatarImage:player?.avatarImage || "", nickOnly:Boolean(player?.nickOnly), isBot:Boolean(player?.isBot), adultStatus:adultStatusFor(player), money:Number(player?.money)||0, sessionMoney:Number(player?.sessionMoney)||0, xp:Number(player?.xp)||0, sessionXp:Number(player?.sessionXp)||0, honorCounts:{nicePlayer:0,goodOpponent:0,greatHost:0,notVerySmart:0,poorSport:0,...(player?.honorCounts||{})}, selectedNickEffect:player?.selectedNickEffect || "defaultNick", selectedAvatarFrame:player?.selectedAvatarFrame || "defaultFrame", selectedAura:player?.selectedAura || "noAura", selectedCandySkin:player?.selectedCandySkin || "defaultCandy", selectedBombSkin:player?.selectedBombSkin || "defaultBomb", selectedClockSkin:player?.selectedClockSkin || "defaultClock", selectedMarkerSkin:player?.selectedMarkerSkin || "defaultMarker", selectedSequenceSkin:player?.selectedSequenceSkin || "defaultSequence", selectedBoardLudoSkin:player?.selectedBoardLudoSkin || "defaultLudoBoard", selectedBoardMemorySkin:player?.selectedBoardMemorySkin || "defaultMemoryBoard", selectedIdleAnimation:player?.selectedIdleAnimation || "", selectedWinAnimation:player?.selectedWinAnimation || "", selectedLoseAnimation:player?.selectedLoseAnimation || "" });
const directoryProfile = player => { const privacy={historyPublic:true,statsPublic:true,friendsPublic:true,...(player?.privacy||{})}, result={...publicProfile(player),privacy}; if(privacy.historyPublic)result.gameHistory=Array.isArray(player?.gameHistory)?player.gameHistory.slice(-50):[]; if(privacy.statsPublic){result.gameStats=player?.gameStats||{};result.stats=player?.stats||{};} if(privacy.friendsPublic)result.friends=Array.isArray(player?.friends)?player.friends:[]; return result; };
const publicHonorTypes = [{id:"nicePlayer",emoji:"👍",label:"Miły gracz"},{id:"goodOpponent",emoji:"🧠",label:"Dobry przeciwnik"},{id:"greatHost",emoji:"🎉",label:"Świetny host"},{id:"notVerySmart",emoji:"🤦",label:"Niezbyt inteligentny",negative:true},{id:"poorSport",emoji:"🙄",label:"Uciążliwy gracz",negative:true}];
function publicProfileContent(player = {}) {
  const honor={nicePlayer:0,goodOpponent:0,greatHost:0,notVerySmart:0,poorSport:0,...(player.honorCounts||{})};
  const total=publicHonorTypes.reduce((sum,type)=>sum+(Number(honor[type.id])||0),0);
  const privacy={historyPublic:true,statsPublic:true,friendsPublic:true,...(player.privacy||{})};
  const stats=player.gameStats||player.stats||{};
  const statCards=privacy.statsPublic ? `<section class="public-profile-section"><div class="section-heading"><div><p class="eyebrow">STATYSTYKI</p><h3>Wyniki gracza</h3></div></div><div class="account-summary public-profile-stats"><div><span class="muted">Rozegrane</span><b>${Number(stats.played)||0}</b></div><div><span class="muted">Wygrane</span><b>${Number(stats.wins)||0}</b></div><div><span class="muted">Porażki</span><b>${Number(stats.losses)||0}</b></div></div></section>` : `<section class="public-profile-section"><p class="muted">Statystyki tego gracza są prywatne.</p></section>`;
  const history=privacy.historyPublic ? (Array.isArray(player.gameHistory)&&player.gameHistory.length ? `<ul class="public-profile-history">${player.gameHistory.slice(-5).reverse().map(item=>`<li><span>${escapeHtml(item.modeName||item.mode||"Gra")}</span><b>${escapeHtml(item.result||"Rozegrano")}</b></li>`).join("")}</ul>` : `<p class="muted">Brak zapisanej historii gier.</p>`) : `<p class="muted">Historia gier tego gracza jest prywatna.</p>`;
  const friends=privacy.friendsPublic ? `<p class="muted">Znajomi: <b>${Array.isArray(player.friends)?player.friends.length:0}</b></p>` : `<p class="muted">Lista znajomych tego gracza jest prywatna.</p>`;
  return `<div class="public-profile-head">${avatarHtml(player,"public-profile-avatar")}<div><p class="eyebrow">${player.isBot?"BOT EKSPERYMENTALNY":"PROFIL GRACZA"}</p><h2>${escapeHtml(player.nick||"Gracz")}</h2>${player.isBot?`<p class="tiny bot-profile-note">Boty są nadal rozwijane i w części trybów mogą działać niedokładnie.</p>`:`<p class="muted">Poziom doświadczenia: <b>${Number(player.xp||player.sessionXp)||0} XP</b></p>`}</div></div><section class="honor-summary"><div class="section-heading"><div><p class="eyebrow">HONOR</p><h3>Otrzymane wyróżnienia</h3></div><span class="badge">${total}</span></div><div class="honor-summary-grid">${publicHonorTypes.map(type=>`<div class="honor-count${type.negative?" honor-count-negative":""}"><span>${type.emoji}</span><strong>${Number(honor[type.id])||0}</strong><small>${type.label}</small></div>`).join("")}</div></section>${statCards}<section class="public-profile-section"><div class="section-heading"><div><p class="eyebrow">HISTORIA</p><h3>Ostatnie gry</h3></div></div>${history}</section><section class="public-profile-section"><div class="section-heading"><div><p class="eyebrow">SPOŁECZNOŚĆ</p><h3>Znajomi</h3></div></div>${friends}</section>`;
}
function publicProfileModal(player, closeAction) {
  const backdrop=document.createElement("div"); backdrop.className="modal-backdrop public-profile-backdrop";
  backdrop.innerHTML=`<section class="modal account-modal public-profile-modal enter" role="dialog" aria-modal="true" aria-labelledby="public-profile-title"><div class="modal-title"><div><p class="eyebrow">PROFIL GRACZA</p><h2 id="public-profile-title">${escapeHtml(player.nick||"Gracz")}</h2></div><button class="icon-btn" data-close aria-label="Zamknij">${icon("x",18)}</button></div><div data-public-profile-content>${publicProfileContent(player)}</div></section>`;
  const close=()=>closeAction?.(backdrop); backdrop.querySelector("[data-close]").addEventListener("click",close); backdrop.addEventListener("click",event=>{if(event.target===backdrop)close();});
  return backdrop;
}
const normalizeRoomProfile = item => ({ ...item, nickOnly:Boolean(item?.nickOnly || (Number(item?.sessionXp || 0) > 0 && !Number(item?.xp || 0))), adultStatus:item?.adultStatus || "unknown", selectedNickEffect:item?.selectedNickEffect || "defaultNick", selectedAvatarFrame:item?.selectedAvatarFrame || "defaultFrame", selectedAura:item?.selectedAura || "noAura", selectedCandySkin:item?.selectedCandySkin || "defaultCandy", selectedBombSkin:item?.selectedBombSkin || "defaultBomb", selectedClockSkin:item?.selectedClockSkin || "defaultClock", selectedMarkerSkin:item?.selectedMarkerSkin || "defaultMarker", selectedSequenceSkin:item?.selectedSequenceSkin || "defaultSequence", selectedBoardLudoSkin:item?.selectedBoardLudoSkin || "defaultLudoBoard", selectedBoardMemorySkin:item?.selectedBoardMemorySkin || "defaultMemoryBoard", selectedIdleAnimation:item?.selectedIdleAnimation || "", selectedWinAnimation:item?.selectedWinAnimation || "", selectedLoseAnimation:item?.selectedLoseAnimation || "" });
const remoteRoomProfileSignatures = new Map();
function roomProfileSignature(player = {}) {
  return JSON.stringify([
    player.nick || "", player.avatarImage || "", Boolean(player.nickOnly), player.adultStatus || "unknown",
    Number(player.money) || 0, Number(player.sessionMoney) || 0, Number(player.xp) || 0, Number(player.sessionXp) || 0,
    player.selectedNickEffect || "", player.selectedAvatarFrame || "", player.selectedAura || "",
    player.selectedCandySkin || "defaultCandy", player.selectedBombSkin || "defaultBomb", player.selectedClockSkin || "defaultClock", player.selectedMarkerSkin || "defaultMarker", player.selectedSequenceSkin || "defaultSequence", player.selectedBoardLudoSkin || "defaultLudoBoard", player.selectedBoardMemorySkin || "defaultMemoryBoard",
    player.selectedIdleAnimation || "", player.selectedWinAnimation || "", player.selectedLoseAnimation || "",
    player.isBot ? true : false, player.botDifficulty || "",
  ]);
}
function mergeRemoteRoomProfiles(room) {
  let changed = false;
  if (!room || !room.playerProfiles || typeof room.playerProfiles !== "object") room.playerProfiles = {};
  Object.entries(room?.playerProfiles || {}).forEach(([id, item]) => {
    const clean = normalizeRoomProfile(item), signature = roomProfileSignature(clean);
    room.playerProfiles[id] = clean;
    if (remoteRoomProfileSignatures.get(id) === signature && state.accounts[id]) return;
    const previous = state.accounts[id] || {};
    state.accounts[id] = id === state.currentUser ? { ...clean, ...previous } : { ...previous, ...clean };
    remoteRoomProfileSignatures.set(id, signature);
    changed = true;
  });
  return changed;
}
const persistSession=()=>saveSession({currentUser:state.currentUser,activeRoomId:state.activeRoomId,selectedGameMode:state.selectedGameMode,quizVariant:state.quizVariant});
let restoredRoom=false;
const pendingRoomSyncs=new Map();
const roomSyncChains=new Map();
const roomSyncRetryAttempts=new Map();
const roomSyncReconnectTimers=new Map();
const repairedRoomSignatures=new Map();
const claimedPendingProgress=new Map();
const roomRosterSnapshots=new Map();
const roomPhaseSnapshots=new Map();
let lastRenderedScreenSignature="";
let stopRoomsSubscription=()=>{};
let activeRoomPollTimer=null;
let stopOnlineSubscription=()=>{};
let stopGlobalStatsSubscription=()=>{};
let stopPresence=()=>{};
let lastRenderedRoute="";
let renderFrame=0;
let pendingRenderOptions=null;
const gameTransitionKeys=new Map();
const identityVoiceChat=createIdentityVoiceChat(()=>{ if(Router.current==="game") render({preserveDrafts:true}); });

function finalGameOutcome(room) {
  const game=room?.game;
  if(!game?.finished) return "";
  const current=state.currentUser;
  const explicit=[game.winner,game.result?.winner,game.summary?.winner,game.final?.winner].find(value=>typeof value==="string"&&value);
  if(explicit) return explicit===current?"gameVictory":"gameDefeat";
  const scoreSources=[game.scores,game.roundWins,game.totals,game.points].filter(value=>value&&typeof value==="object");
  for(const scores of scoreSources){
    const entries=Object.entries(scores).filter(([,value])=>Number.isFinite(Number(value)));
    if(!entries.length) continue;
    const best=Math.max(...entries.map(([,value])=>Number(value)));
    const winners=entries.filter(([,value])=>Number(value)===best).map(([uid])=>uid);
    if(winners.length) return winners.includes(current)?"gameVictory":"gameDefeat";
  }
  if(game.result?.success===true&&game.result?.winner===current) return "gameVictory";
  if(game.result?.success===false&&game.result?.loser===current) return "gameDefeat";
  return "";
}

function markGamePhaseTransition(view, room) {
  const key=`${room.roomId}:${room.game?.phase||""}:${room.game?.round||0}:${room.game?.finished?"finished":"active"}`;
  if(gameTransitionKeys.get(room.roomId)!==key){
    gameTransitionKeys.set(room.roomId,key);
    view.classList.add("game-phase-transition");
  }
}

function saveAndRender() { saveAccounts(state.accounts); render(); }
function updateDocumentTitle() {
  const room = activeRoom();
  const modeId = room?.gameMode || (Router.current === "lobby" ? state.selectedGameMode : "");
  const mode = modeId ? getGameMode(modeId) : null;
  const screenTitle = mode?.name || (Router.current === "shop" ? "Sklep" : "Gry grupowe!");
  document.title = screenTitle === "Gry grupowe!" ? screenTitle : `${screenTitle} · Gry grupowe!`;
}
const trackedSiteEvents = new Set();
function trackSiteEvent(event) {
  const key = `${String(event?.type || "")}:${String(event?.eventId || "")}`;
  if (!event?.type || !event?.eventId || trackedSiteEvents.has(key)) return false;
  trackedSiteEvents.add(key);
  recordSiteEvent(event).catch?.(() => {});
  return true;
}
function refreshPresence() {
  stopPresence();
  const user=profile();
  stopPresence=startPresence(state.currentUser, { nick:user?.nick || "Gość" });
}
function connectOnlineCount() {
  stopOnlineSubscription();
  stopOnlineSubscription=subscribeOnlineCount(count=>{state.onlineCount=Math.max(1,Number(count)||1);updateOnlineCountPill();trackSiteEvent({type:"onlinePeak",eventId:`online:${Math.floor(Date.now()/30000)}:${state.currentUser||"guest"}`,value:state.onlineCount});});
  stopGlobalStatsSubscription();
  stopGlobalStatsSubscription=subscribeSiteStats(stats=>{const next={...state.globalStats,...stats,modeCounts:{...(stats?.modeCounts||{})}},signature=stableStringify(next);if(signature===state.globalStatsSignature)return;state.globalStats=next;state.globalStatsSignature=signature;window.__globalStats=state.globalStats;if(Router.current==="platform")render({preserveDrafts:true});});
}
function updateConnectionStatus() {
  const node = document.querySelector("[data-connection-status]");
  if (!node) return;
  const key = !state.networkOnline ? "offline" : state.onlineBackend === null ? "connecting" : state.onlineBackend ? (state.syncStatus === "error" ? "error" : state.syncStatus === "syncing" ? "syncing" : "online") : "local";
  const labels = { online:"Online", syncing:"Synchronizacja…", error:"Problem z zapisem", connecting:"Łączenie…", local:"Tryb lokalny", offline:"Brak internetu" };
  if (node.dataset.connectionStatus === key) return;
  node.className = `connection-status-pill connection-status-${key}`;
  node.dataset.connectionStatus = key;
  node.innerHTML = `<i></i><span>${labels[key]}</span>`;
  node.title = key === "online" ? "Pokój jest synchronizowany na żywo." : key === "local" ? "Ta karta działa lokalnie — pokoje online są niedostępne." : labels[key];
}
function onlineCountLabel() {
  const entries=Object.entries(activityStats()).filter(([,item])=>item.players>0).sort(([,a],[,b])=>b.players-a.players);
  return [`${state.onlineCount} online`,...entries.map(([id,item])=>`${getGameMode(id).name} — ${item.players}`)].join("\n");
}
function roomIsFresh(room){const age=Date.now()-Number(room.updatedAt||room.createdAt||0),limit=room.status==="playing"?2*60*60*1000:30*60*1000;return age<=limit;}
function roomHasHumanPlayers(room){return normalizedRoomPlayers(room).some(uid=>!isBotId(uid));}
function activityStats(){const stats={};state.rooms.filter(room=>roomIsFresh(room)&&["lobby","playing"].includes(room.status)&&roomHasHumanPlayers(room)).forEach(room=>{const mode=getGameMode(room.gameMode),players=normalizedRoomPlayers(room).filter(uid=>!isBotId(uid)).length;if(!stats[mode.id])stats[mode.id]={players:0,lobbies:0};stats[mode.id].players+=players;if(room.status==="lobby")stats[mode.id].lobbies+=1;});return stats;}
function updateOnlineCountPill() {
  const pill=document.querySelector(".online-count-pill");
  if(!pill)return;
  const label=onlineCountLabel();
  if (pill.dataset.count === String(state.onlineCount) && pill.dataset.tooltip === label) return;
  pill.dataset.count=String(state.onlineCount);
  pill.dataset.tooltip=label;
  pill.innerHTML=`<i></i><b>${state.onlineCount}</b> online`;
}
function moveCurrentProfile(remote, current = profile()) {
  if(!state.currentUser||!remote?.uid||!current)return false;
  if(state.currentUser===remote.uid)return true;
  const sameGuest=current.nickOnly&&remote.isAnonymous;
  const sameAccount=!current.nickOnly&&remote.email&&current.authEmail===remote.email;
  if(!sameGuest&&!sameAccount)return false;
  const previousId=state.currentUser;
  state.accounts[remote.uid]={...current,authProvider:sameGuest?"firebase-anonymous":"firebase"};
  delete state.accounts[previousId];
  state.currentUser=remote.uid;state.activeRoomId=null;saveAccounts(state.accounts);persistSession();
  return true;
}
function restoreFirebaseSession() {
  if(!state.currentUser)return true;
  if(moveCurrentProfile(getFirebaseSession()))return true;
  state.currentUser=null;state.activeRoomId=null;clearSession();return false;
}
async function recoverMissingRemoteProfile(remoteState = null) {
  const user = profile();
  if (!user || user.nickOnly || !hasOnlineBackend()) return false;
  const result = remoteState || await loadRemoteProfileState(state.currentUser);
  if (!result.ok || !result.missing || result.profile) return false;
  return syncPlayerProfile(state.currentUser, user);
}
function ensureRoomSession() {
  if(!hasOnlineBackend()){message("Brak połączenia z serwerem online. Odśwież stronę.");return false;}
  if(moveCurrentProfile(getFirebaseSession()))return true;
  state.currentUser=null;state.activeRoomId=null;clearSession();message("Zaloguj się ponownie, aby grać online.","info");render();return false;
}
function scheduleRoomReconnect(roomId) {
  if (roomSyncReconnectTimers.has(roomId)) return;
  const timer=window.setTimeout(()=>{
    roomSyncReconnectTimers.delete(roomId);
    if (["room","game","lobby"].includes(Router.current)) connectRooms();
  },1500);
  roomSyncReconnectTimers.set(roomId,timer);
}
function queueRoomSync(room) {
  const snapshot=JSON.parse(JSON.stringify(room)),version=snapshot.updatedAt,roomId=snapshot.roomId;
  state.syncStatus="syncing"; updateConnectionStatus();
  pendingRoomSyncs.set(roomId,version);
  const previous=roomSyncChains.get(roomId)||Promise.resolve();
  const current=previous.catch(()=>{}).then(()=>syncRoomState(snapshot)).catch(error=>({ok:false,error:error?.message||error?.code||String(error)}));
  roomSyncChains.set(roomId,current);
  current.then(result=>{
    const latest=pendingRoomSyncs.get(roomId)===version;
    if(roomSyncChains.get(roomId)===current)roomSyncChains.delete(roomId);
    if(!result.ok){
      if(!latest)return;
      const previousRetry=roomSyncRetryAttempts.get(roomId),attempt=previousRetry?.version===version?previousRetry.count:0;
      if(attempt<2){
        roomSyncRetryAttempts.set(roomId,{version,count:attempt+1});
        window.setTimeout(()=>{if(pendingRoomSyncs.get(roomId)===version)queueRoomSync(snapshot);},500*(attempt+1));
        return;
      }
      roomSyncRetryAttempts.delete(roomId); state.syncStatus="error"; updateConnectionStatus();
      pendingRoomSyncs.set(roomId,version);
      message(`Nie udało się zsynchronizować pokoju po 3 próbach: ${result.error||"Nieznany błąd."}`);
      scheduleRoomReconnect(roomId);
      return;
    }
    roomSyncRetryAttempts.delete(roomId); state.syncStatus="online"; updateConnectionStatus();
    const reconnectTimer=roomSyncReconnectTimers.get(roomId);
    if(reconnectTimer){window.clearTimeout(reconnectTimer);roomSyncReconnectTimers.delete(roomId);}
    if(latest)pendingRoomSyncs.delete(roomId);
    const local=state.rooms.find(room=>room.roomId===roomId);
    if(result.room&&(!local||Number(result.room.updatedAt||0)>=Number(local.updatedAt||0))){
      const synced=installRemoteRoom(result.room);
      if(latest&&state.activeRoomId===roomId&&["room","game"].includes(Router.current)){
        if(synced.status==="playing"&&synced.game&&Router.current==="room")return Router.go("game");
        if(synced.status==="lobby"&&Router.current==="game")return Router.go("room");
        if(currentScreenSignature()!==lastRenderedScreenSignature)render({preserveDrafts:true});
      }
    }
  });
}
function addRoomActivity(room, text, actorUid = state.currentUser) {
  if (!room || !text) return;
  const entry = { id:uid("ACT"), text:String(text).slice(0,120), uid:actorUid, createdAt:serverNow() };
  room.activity = [...(Array.isArray(room.activity) ? room.activity : []), entry].slice(-12);
}
function updateProfile(patch) { if (state.currentUser) { state.accounts[state.currentUser] = { ...profile(), ...patch, updatedAt:Date.now() }; syncPlayerProfile(state.currentUser,state.accounts[state.currentUser]); const room=activeRoom();if(normalizedRoomPlayers(room).includes(state.currentUser))touchRoom(room);saveAndRender(); } }
function touchRoom(room) { room.updatedAt = Math.max(serverNow(),Number(room.updatedAt||0)+1); if(normalizedRoomPlayers(room).includes(state.currentUser)&&profile())room.playerProfiles={...(room.playerProfiles||{}),[state.currentUser]:publicProfile(profile())}; queueRoomSync(room); return room; }
function installRemoteRoom(room) {
  const index=state.rooms.findIndex(item=>item.roomId===room.roomId);
  if(index>=0)state.rooms[index]=room;else state.rooms.unshift(room);
  if (mergeRemoteRoomProfiles(room)) saveAccounts(state.accounts);
  return room;
}
async function resolveRoomForJoin(code) {
  const room = state.rooms.find(item => item.roomId === code);
  if (room) return { ok:true, room };
  const result = await loadRemoteRoom(code);
  if (!result.ok) return result;
  return { ok:true, room:installRemoteRoom(result.room) };
}
async function mutateRoomGame(mutator,{sound,after}={}) {
  const room=activeRoom();if(!room?.game)return false;
  await roomSyncChains.get(room.roomId);
  const remote=await mutateRemoteRoomGame(room.roomId,(game,rawRoom)=>mutator(game,{...room,settings:rawRoom.settings||room.settings,players:Object.keys(rawRoom.players||{})}));
  if(remote?.ok){
    const synced=installRemoteRoom(remote.room);if(after){after(synced);touchRoom(synced);}
    if(sound)Audio.play(sound);render();return true;
  }
  if(remote){if(remote.error)message(remote.error,remote.rejected?"info":"error");return false;}
  const beforeGame=JSON.stringify(room.game),error=mutator(room.game,room);if(error){message(error,"info");return false;}if(JSON.stringify(room.game)===beforeGame)return false;
  if(after)after(room);touchRoom(room);if(sound)Audio.play(sound);render();return true;
}
function applyPlayerMoney(playerId, amount) {
  const player=state.accounts[playerId];if(!player)return;
  const updated=player.nickOnly?{...player,sessionMoney:(player.sessionMoney||0)+amount,updatedAt:Date.now()}:{...player,money:(player.money||0)+amount,updatedAt:Date.now()};
  state.accounts[playerId]=updated;
  const room=activeRoom();if(room?.players.includes(playerId))room.playerProfiles={...(room.playerProfiles||{}),[playerId]:publicProfile(updated)};
  syncPlayerProfile(playerId,updated);
}
function activeBoosterMultiplier(player, key) {
  const booster = player?.[key];
  return Number(booster?.expiresAt) > Date.now() ? Math.max(1, Number(booster.multiplier) || 1) : 1;
}
function applyPlayerXp(playerId, amount) {
  const player=state.accounts[playerId];if(!player||!amount)return;
  if(playerId===state.currentUser) amount=Math.floor(Number(amount)*activeBoosterMultiplier(player,"xpBooster"));
  const result=grantProgression(player,amount),updated={...result.profile,updatedAt:Date.now()};
  state.accounts[playerId]=updated;
  const room=activeRoom();if(room?.players.includes(playerId))room.playerProfiles={...(room.playerProfiles||{}),[playerId]:publicProfile(updated)};
  syncPlayerProfile(playerId,updated);saveAccounts(state.accounts);
  if(playerId===state.currentUser&&result.leveledUp)message(`Awans! Masz teraz level ${result.level}. Nagrody z drogi levelu zostały odebrane.`,"info");
}
function applyQuestEvent(playerId, event) {
  const player=state.accounts[playerId];if(!player)return;
  const updated={...noteQuestEvent(player,event),updatedAt:Date.now()};
  state.accounts[playerId]=updated;
  const room=activeRoom();if(room?.players.includes(playerId))room.playerProfiles={...(room.playerProfiles||{}),[playerId]:publicProfile(updated)};
  syncPlayerProfile(playerId,updated);
}
function keepRoomCategoryUsage(room) {
  const usage = room?.game?.categoryUsage;
  if (usage && typeof usage === "object" && !Array.isArray(usage)) room.settings = { ...(room.settings || {}), categoryUsage:{ ...usage } };
}
function addPlayerMoney(playerId, amount) {
  const room=activeRoom();if(!room)return;
  if(room.roomType === "betting" && room.game?.wagerSettled && !room.game?.wagerPaying)return;
  if(playerId===state.currentUser && room.roomType !== "betting") amount=Math.floor(Number(amount||0)*activeBoosterMultiplier(profile(),"coinBooster"));
  if(!(room.roomType === "betting" && room.game?.wagerPaying)) amount=Math.floor(Number(amount||0)*botRewardMultiplier(room));
  amount=Math.floor(Number(amount||0)*happyHourMultiplier(room,"coins",serverNow()));
  if(Number(amount) > 0) trackSiteEvent({ type:"coinsEarned", eventId:`coins:${room.game?.siteGameId || room.roomId}:${playerId}`, amount:Number(amount) });
  if(playerId===state.currentUser)return applyPlayerMoney(playerId,amount);
  room.pendingRewards={...(room.pendingRewards||{}),[playerId]:(room.pendingRewards?.[playerId]||0)+amount};
  const player=state.accounts[playerId];if(player)room.playerProfiles={...(room.playerProfiles||{}),[playerId]:publicProfile(player.nickOnly?{...player,sessionMoney:(player.sessionMoney||0)+amount}:{...player,money:(player.money||0)+amount})};
}
function wagerWinners(room) {
  const game=room?.game;if(!game)return [];
  if(game.winner)return [game.winner];
  if(room.gameMode==="udowodnij"&&game.result)return game.result.success?[game.currentBidder]:room.players.filter(uid=>uid!==game.result.loser);
  if(room.gameMode==="impostor"&&game.result)return room.players.filter(uid=>game.result.citizensWin?game.roles?.[uid]?.role==="citizen":game.roles?.[uid]?.role!=="citizen");
  if(room.gameMode==="zatruty-cukierek"){
    const scores=game.scores&&typeof game.scores==="object"?game.scores:{};
    const max=Math.max(0,...room.players.map(uid=>Number(scores[uid]||0)));
    if(max>0)return room.players.filter(uid=>Number(scores[uid]||0)===max);
    if(game.result?.winner)return [game.result.winner];
  }
  const source=game.scores||game.totals||{};
  const max=Math.max(...room.players.map(uid=>Number(source[uid]||0)));
  return room.players.filter(uid=>Number(source[uid]||0)===max);
}
function settleBetResult(room) {
  const fee=roomEntryFee(room),game=room?.game;
  if(!fee||room?.roomType!=="betting"||!game||game.wagerSettled||(!game.finished&&!(["gameSummary","results"].includes(game.phase))))return false;
  const winners=wagerWinners(room);if(!winners.length)return false;
  const pot=fee*room.players.length,share=Math.floor(pot/winners.length),remainder=pot-(share*winners.length);
  game.wagerSettled=true;game.wagerPaying=true;
  winners.forEach((uid,index)=>addPlayerMoney(uid,share+(index<remainder?1:0)));
  game.wagerPaying=false;game.betPot=pot;game.betWinners=winners;touchRoom(room);Audio.play("roundEnd");
  return true;
}
function addPlayerXp(playerId, amount) {
  amount = Math.round(Number(amount || 0) * happyHourMultiplier(activeRoom(), "xp", serverNow()));
  if(playerId===state.currentUser)return applyPlayerXp(playerId,amount);
  const room=activeRoom();if(!room)return;
  room.pendingXp={...(room.pendingXp||{}),[playerId]:(room.pendingXp?.[playerId]||0)+amount};
}
function rewardRoomXp(room, amount, winners = [], extraByUid = {}) {
  const winnerSet = new Set(winners);
  room.players.forEach(uid=>{applyQuestEvent(uid,{type:"mode",mode:room.gameMode,result:winnerSet.has(uid)?"win":"loss",...(extraByUid[uid]||{})});addPlayerXp(uid,amount);});
}
function playCurrentUserResultSound(winners = []) {
  const user=profile();if(!user)return;
  const won=winners.includes(state.currentUser);
  Audio.play(won ? (user.selectedWinAnimation || "victory") : (user.selectedLoseAnimation || "defeat"));
}
function claimPendingProgress(room) {
  const money=Number(room?.pendingRewards?.[state.currentUser])||0,xp=Number(room?.pendingXp?.[state.currentUser])||0,fee=Number(room?.pendingEntryFees?.[state.currentUser])||0;if((!money&&!xp&&!fee)||!profile())return false;
  const claimKey=`${room.roomId}:${room.game?.siteGameId||room.game?.startedAt||""}:${money}:${xp}:${fee}`;
  if(claimedPendingProgress.get(room.roomId)===claimKey){
    if(room.pendingRewards)delete room.pendingRewards[state.currentUser];
    if(room.pendingXp)delete room.pendingXp[state.currentUser];
    if(room.pendingEntryFees)delete room.pendingEntryFees[state.currentUser];
    return false;
  }
  claimedPendingProgress.set(room.roomId,claimKey);
  room.pendingRewards={...(room.pendingRewards||{})};room.pendingXp={...(room.pendingXp||{})};room.pendingEntryFees={...(room.pendingEntryFees||{})};delete room.pendingRewards[state.currentUser];delete room.pendingXp[state.currentUser];delete room.pendingEntryFees[state.currentUser];
  if(money)applyPlayerMoney(state.currentUser,money);if(xp)applyPlayerXp(state.currentUser,xp);if(fee)applyPlayerMoney(state.currentUser,-fee);saveAccounts(state.accounts);touchRoom(room);return true;
}
function settleProveResult(room) {
  if(!room?.game||room.gameMode!=="udowodnij"||room.game.phase!=="result"||!room.game.result||room.game.result.rewarded||room.game.result.leftRoom)return;
  const winners = room.game.result.success ? [room.game.currentBidder] : room.players.filter(uid=>uid!==room.game.result.loser);
  if(room.game.result.success)addPlayerMoney(room.game.currentBidder,100);
  else winners.forEach(uid=>addPlayerMoney(uid,100));
  room.game.roundWins={...(room.game.roundWins||{})}; winners.forEach(uid=>{room.game.roundWins[uid]=(Number(room.game.roundWins[uid])||0)+1;});
  rewardRoomXp(room,18,winners);playCurrentUserResultSound(winners);
  room.game.result.rewarded=true;saveAccounts(state.accounts);Audio.play(room.game.result.success?"success":"roundEnd");
}
function settleImpostorResult(room) {
  if (!room?.game || room.game.phase !== "results" || !room.game.result || room.game.result.rewarded) return;
  const roles = room.game.roles && typeof room.game.roles === "object" ? room.game.roles : {};
  const winners = room.players.filter(uid => room.game.result.citizensWin ? roles[uid]?.role === "citizen" : roles[uid]?.role && roles[uid].role !== "citizen");
  winners.forEach(uid => addPlayerMoney(uid,150));
  rewardRoomXp(room,55,winners);playCurrentUserResultSound(winners);
  room.game.result.rewarded=true; room.status="results"; saveAccounts(state.accounts); Audio.play("roundEnd");
}
function settleOtherQuestionResult(room) {
  if(!room?.game||room.game.phase!=="results"||!room.game.result||room.game.result.rewarded)return;
  const winners=room.game.result.caught?room.players.filter(uid=>uid!==room.game.impostor):[room.game.impostor];
  winners.forEach(uid=>addPlayerMoney(uid,100));
  rewardRoomXp(room,18,winners);playCurrentUserResultSound(winners);
  room.game.result.rewarded=true;saveAccounts(state.accounts);Audio.play("roundEnd");
}
function settleMostLikelyResult(room) {
  if(!room?.game||room.game.phase!=="gameSummary"||room.game.rewarded)return;
  const totals=room.game.totals&&typeof room.game.totals==="object"?room.game.totals:{};
  room.players.forEach(uid=>addPlayerMoney(uid,25+(totals[uid]||0)*10));
  const max = Math.max(0,...Object.values(room.game.totals||{}).map(Number));
  const winners = room.players.filter(uid => Number(room.game.totals?.[uid] || 0) === max && max > 0);
  rewardRoomXp(room,60,winners);playCurrentUserResultSound(winners);
  room.game.rewarded=true;saveAccounts(state.accounts);touchRoom(room);Audio.play("roundEnd");
}
function settleFriendshipResult(room) {
  if(!room?.game||room.game.phase!=="gameSummary"||room.game.rewarded)return;
  const scores=room.game.scores&&typeof room.game.scores==="object"?room.game.scores:{};
  if(room.settings?.rewardCoins)room.players.forEach(uid=>addPlayerMoney(uid,(scores[uid]||0)*25));
  const max = Math.max(0,...Object.values(room.game.scores||{}).map(Number));
  const winners = room.players.filter(uid => Number(room.game.scores?.[uid] || 0) === max && max > 0);
  rewardRoomXp(room,60,winners);playCurrentUserResultSound(winners);
  room.game.rewarded=true;saveAccounts(state.accounts);touchRoom(room);Audio.play("roundEnd");
}
function settlePoisonCandyResult(room) {
  if(!room?.game||room.game.phase!=="gameSummary"||room.game.rewarded)return;
  const scores=room.game.scores&&typeof room.game.scores==="object"?room.game.scores:{};
  const max=Math.max(0,...Object.values(scores).map(Number));
  const winners=room.players.filter(uid=>Number(scores[uid]||0)===max&&max>0);
  winners.forEach(uid=>addPlayerMoney(uid,150));
  rewardRoomXp(room,45,winners);playCurrentUserResultSound(winners);
  room.game.rewarded=true;room.game.finished=true;room.status="results";saveAccounts(state.accounts);touchRoom(room);Audio.play("roundEnd");
}
function settleBombResult(room) {
  if(!room?.game||room.game.phase!=="gameSummary"||room.game.rewarded)return;
  const max = Math.max(0,...Object.values(room.game.scores||{}).map(Number));
  const winners = room.players.filter(uid => Number(room.game.scores?.[uid] || 0) === max && max > 0);
  room.players.forEach(uid=>addPlayerMoney(uid,30 + Number(room.game.scores?.[uid] || 0) * 20));
  rewardRoomXp(room,55,winners);playCurrentUserResultSound(winners);
  room.game.rewarded=true;saveAccounts(state.accounts);touchRoom(room);Audio.play("roundEnd");
}
function settleClosestTruthResult(room) {
  if(room.game.phase!=="gameSummary"||room.game.rewarded)return;
  const max = Math.max(0,...Object.values(room.game.scores||{}).map(Number));
  const winners = room.players.filter(uid => Number(room.game.scores?.[uid] || 0) === max && max > 0);
  room.players.forEach(uid=>addPlayerMoney(uid,25 + Number(room.game.scores?.[uid] || 0) * 12));
  rewardRoomXp(room,55,winners);playCurrentUserResultSound(winners);
  room.game.rewarded=true;saveAccounts(state.accounts);touchRoom(room);Audio.play("roundEnd");
}
function settleRankingResult(room) {
  if(room.game.phase!=="gameSummary"||room.game.rewarded)return;
  const max = Math.max(0,...Object.values(room.game.scores||{}).map(Number));
  const winners = room.players.filter(uid => Number(room.game.scores?.[uid] || 0) === max && max > 0);
  room.players.forEach(uid=>addPlayerMoney(uid,25 + Number(room.game.scores?.[uid] || 0) * 12));
  rewardRoomXp(room,55,winners);playCurrentUserResultSound(winners);
  room.game.rewarded=true;saveAccounts(state.accounts);touchRoom(room);Audio.play("roundEnd");
}
function settleFiveSecondsResult(room) {
  if(room.game.phase!=="gameSummary"||room.game.rewarded)return;
  const max = Math.max(0,...Object.values(room.game.scores||{}).map(Number));
  const winners = room.players.filter(uid => Number(room.game.scores?.[uid] || 0) === max && max > 0);
  room.players.forEach(uid=>addPlayerMoney(uid,20 + Number(room.game.scores?.[uid] || 0) * 10));
  rewardRoomXp(room,45,winners);playCurrentUserResultSound(winners);
  room.game.rewarded=true;saveAccounts(state.accounts);touchRoom(room);Audio.play("roundEnd");
}
function settleClockResult(room) {
  if(room.game.phase!=="gameSummary"||room.game.rewarded)return;
  const max = Math.max(0,...Object.values(room.game.scores||{}).map(Number));
  const winners = room.players.filter(uid => Number(room.game.scores?.[uid] || 0) === max && max > 0);
  const precision = Object.fromEntries((Array.isArray(room.game.ranking)?room.game.ranking:[]).map(row => [row.uid, Number(row.differenceMs) || 0]));
  if(room.players.length === 1) room.players.forEach(uid=>{const diff=precision[uid] ?? 9999;addPlayerMoney(uid,Math.max(20,Math.min(190,Math.round(170 - diff / 6))));});
  else room.players.forEach(uid=>addPlayerMoney(uid,25 + Number(room.game.scores?.[uid] || 0) * 25));
  rewardRoomXp(room,50,winners,Object.fromEntries(room.players.map(uid=>[uid,{clockDifferenceMs:precision[uid]}])));playCurrentUserResultSound(winners);
  room.game.rewarded=true;saveAccounts(state.accounts);touchRoom(room);Audio.play("roundEnd");
}
function identityCoinReward(room, uid, winners) {
  const turns = Math.max(1, Array.isArray(room.game.history) ? room.game.history.length : 1);
  const turnTime = Math.max(20, Number(room.settings?.turnTime) || 45);
  const minutes = Math.max(1, Math.ceil((turns * turnTime) / 60));
  const score = Math.max(0, Number(room.game.scores?.[uid]) || 0);
  return Math.min(240, Math.round(15 + minutes * 7 + score * 25 + (winners.includes(uid) ? 45 : 0)));
}
function settleIdentityResult(room) {
  if(room.game.phase!=="results"||room.game.rewarded)return;
  const max = Math.max(0,...Object.values(room.game.scores||{}).map(Number));
  const winners = room.players.filter(uid => Number(room.game.scores?.[uid] || 0) === max && max > 0);
  room.players.forEach(uid=>addPlayerMoney(uid,identityCoinReward(room,uid,winners)));
  rewardRoomXp(room,60,winners);playCurrentUserResultSound(winners);room.game.rewarded=true;saveAccounts(state.accounts);touchRoom(room);Audio.play("roundEnd");
}
function settlePokemonResult(room) {
  if (room?.gameMode?.startsWith("pokemon-") !== true || room.game?.phase !== "result" || !room.game.finished || room.game.rewarded) return;
  const scores=room.game.scores || {}, max=Math.max(0,...Object.values(scores).map(Number)), winners=room.gameMode==="pokemon-last-letter"&&room.game.winner?[room.game.winner]:room.players.filter(uid=>Number(scores[uid]||0)===max&&max>0), rounds=Math.max(1,Number(room.gameMode==="pokemon-last-letter" ? room.settings?.hearts : room.settings?.rounds)||5);
  const base={"pokemon-dex":25,"pokemon-last-letter":20,"pokemon-evolution":30,"pokemon-types":25,"pokemon-match-type":25,"pokemon-auction":45}[room.gameMode] || 25;
  room.players.forEach(uid=>addPlayerMoney(uid,base + rounds*8 + Number(scores[uid]||0)*12 + (winners.includes(uid)?50:0)));
  rewardRoomXp(room,35 + rounds*4,winners);playCurrentUserResultSound(winners);room.game.rewarded=true;saveAccounts(state.accounts);touchRoom(room);Audio.play("roundEnd");
}
function settleWavelengthResult(room) {
  if (room?.gameMode !== "wavelength" || room.game?.phase !== "result" || !room.game.finished || room.game.rewarded) return;
  const scores=room.game.scores || {}, max=Math.max(0,...Object.values(scores).map(Number)), winners=room.players.filter(uid=>Number(scores[uid]||0)===max&&max>0), rounds=Math.max(5,Number(room.settings?.rounds)||8);
  room.players.forEach(uid=>addPlayerMoney(uid,25 + rounds*5 + Number(scores[uid]||0)*4 + (winners.includes(uid)?45:0)));
  rewardRoomXp(room,35 + rounds*3,winners);playCurrentUserResultSound(winners);room.game.rewarded=true;saveAccounts(state.accounts);touchRoom(room);Audio.play("roundEnd");
}
function settleQuizResult(room) {
  if (room?.gameMode !== "quiz" || room.game?.phase !== "result" || !room.game.finished || room.game.rewarded) return;
  const scores=room.game.scores||{}, max=Math.max(0,...Object.values(scores).map(Number)), winners=room.players.filter(uid=>Number(scores[uid]||0)===max&&max>0);
  room.players.forEach(uid=>addPlayerMoney(uid,25+Number(scores[uid]||0)*5+(winners.includes(uid)?40:0))); if(room.game.variant==="competitive"){const leaderboard=JSON.parse(localStorage.getItem("quizCompetitiveLeaderboard")||"{}");winners.forEach(uid=>{const nick=state.accounts[uid]?.nick||uid;leaderboard[nick]=(Number(leaderboard[nick])||0)+1;});localStorage.setItem("quizCompetitiveLeaderboard",JSON.stringify(leaderboard));} rewardRoomXp(room,30,winners);playCurrentUserResultSound(winners);room.game.rewarded=true;saveAccounts(state.accounts);touchRoom(room);Audio.play("roundEnd");
}
function settleAdditionalModeResult(room) {
  const supported = new Set(["marker", "sequence", "family", "word-chain", "number-mystery", "unique-answer", "polacz-nas", "klamca", "falszywa-wiadomosc", "tajna-zasada", "pojedynek-hitow", "bitwa-hitow", "popularnosc-hitow", "board-chinczyk", "board-slowotwor", "board-statki", "board-reversi", "board-warcaby", "board-cztery", "board-memory", "board-domino"]);
  if (!room?.game || !supported.has(room.gameMode) || !["result", "gameSummary"].includes(room.game.phase) || !room.game.finished || room.game.rewarded) return;
  const scores = room.game.scores && typeof room.game.scores === "object" ? room.game.scores : {};
  const max = Math.max(0, ...room.players.map(uid => Number(scores[uid] || 0)));
  const winners = room.game.winner ? [room.game.winner] : room.players.filter(uid => max > 0 && Number(scores[uid] || 0) === max);
  const coinBase = { marker:35, sequence:40, family:45, "word-chain":40, "number-mystery":45, "unique-answer":45, "polacz-nas":45, klamca:45, "falszywa-wiadomosc":45, "tajna-zasada":45, "pojedynek-hitow":45, "bitwa-hitow":55, "popularnosc-hitow":50, "board-chinczyk":45, "board-slowotwor":45, "board-statki":45, "board-reversi":50, "board-warcaby":50, "board-cztery":45, "board-memory":45, "board-domino":45 }[room.gameMode] || 35;
  const xpBase = { marker:35, sequence:40, family:45, "word-chain":40, "number-mystery":45, "unique-answer":45, "polacz-nas":45, klamca:45, "falszywa-wiadomosc":45, "tajna-zasada":45, "pojedynek-hitow":45, "bitwa-hitow":55, "popularnosc-hitow":50, "board-chinczyk":45, "board-slowotwor":45, "board-statki":45, "board-reversi":50, "board-warcaby":50, "board-cztery":45, "board-memory":45, "board-domino":45 }[room.gameMode] || 35;
  room.players.forEach(uid => addPlayerMoney(uid, coinBase + Number(scores[uid] || 0) * 5 + (winners.includes(uid) ? 45 : 0)));
  rewardRoomXp(room, xpBase, winners); playCurrentUserResultSound(winners);
  room.game.rewarded = true; room.status = "results"; saveAccounts(state.accounts); touchRoom(room); Audio.play("roundEnd");
}
function settleAllResults(room) {
  const settlers=[settleProveResult,settleImpostorResult,settleOtherQuestionResult,settleMostLikelyResult,settleFriendshipResult,settlePoisonCandyResult,settleBombResult,settleClosestTruthResult,settleRankingResult,settleFiveSecondsResult,settleClockResult,settleIdentityResult,settleBetResult,settlePokemonResult,settleWavelengthResult,settleQuizResult,settleAdditionalModeResult];
  settlers.forEach(settle=>{try{settle(room);}catch(error){console.error("Nie udało się rozliczyć wyników trybu",room?.gameMode,error);}});
}
function trackFinishedGame(room) {
  const game=room?.game;
  const finished=Boolean(game?.finished || room?.status==="results" || game?.phase==="gameSummary" || (game?.result?.rewarded && ["result", "results"].includes(game?.phase)));
  if(!game?.siteGameId || !finished || room.hostUid!==state.currentUser)return;
  trackSiteEvent({type:"gameFinished",eventId:`game:${game.siteGameId}`,modeId:room.gameMode,minutes:Math.max(1,Math.ceil((serverNow()-Number(game.startedAt||serverNow()))/60000))});
}
function gameHistoryWinners(room) {
  const game=room?.game;if(!game)return [];
  if(Array.isArray(game.winners)&&game.winners.length)return game.winners.filter(uid=>room.players.includes(uid));
  if(Array.isArray(game.result?.winners)&&game.result.winners.length)return game.result.winners.filter(uid=>room.players.includes(uid));
  if(game.winner&&room.players.includes(game.winner))return [game.winner];
  if(room.gameMode==="udowodnij"&&game.result)return game.result.success?[game.currentBidder]:room.players.filter(uid=>uid!==game.result.loser);
  if(room.gameMode==="impostor"&&game.result&&game.roles)return room.players.filter(uid=>game.result.citizensWin?game.roles?.[uid]?.role==="citizen":game.roles?.[uid]?.role!=="citizen");
  if(room.gameMode==="inne-pytanie"&&game.result&&game.impostor)return game.result.caught?room.players.filter(uid=>uid!==game.impostor):[game.impostor];
  if(game.result?.winner&&room.players.includes(game.result.winner))return [game.result.winner];
  const source=[game.scores,game.totals,game.roundWins,game.points].find(item=>item&&typeof item==="object"&&!Array.isArray(item));
  if(!source)return [];
  const values=room.players.map(uid=>Number(source[uid])||0),max=Math.max(0,...values);
  return max>0?room.players.filter(uid=>(Number(source[uid])||0)===max):[];
}
function recordCurrentUserGameHistory(room) {
  const game=room?.game,playerId=state.currentUser;
  const finished=Boolean(game?.finished||room?.status==="results"||["result","results","gameSummary"].includes(game?.phase)||game?.result?.rewarded);
  if(!playerId||isBotId(playerId)||!game||!finished)return;
  const player=state.accounts[playerId];if(!player)return;
  const gameId=String(game.siteGameId||`${room.roomId}:${game.startedAt||game.createdAt||"finished"}`),history=Array.isArray(player.gameHistory)?player.gameHistory:[];
  if(history.some(item=>String(item?.id||"")===gameId))return;
  const winners=gameHistoryWinners(room),won=winners.includes(playerId),result=winners.length>1&&won?"Remis":won?"Wygrana":winners.length?"Przegrana":"Rozegrano";
  const source=[game.scores,game.totals,game.roundWins,game.points].find(item=>item&&typeof item==="object"&&!Array.isArray(item));
  const rawPoints=source?Number(source[playerId]):NaN;
  const entry={id:gameId,mode:room.gameMode,modeName:getGameMode(room.gameMode)?.name||"Gra",result,playedAt:serverNow()};
  if(Number.isFinite(rawPoints))entry.points=rawPoints;
  const updated={...player,gameHistory:[...history,entry].slice(-50),updatedAt:Date.now()};
  state.accounts[playerId]=updated;
  if(room.playerProfiles?.[playerId])room.playerProfiles={...room.playerProfiles,[playerId]:publicProfile(updated)};
  syncPlayerProfile(playerId,updated);saveAccounts(state.accounts);
}
function message(text, type = "error") {
  Audio.play(type === "error" ? "error" : "notification");
  const toast = document.createElement("div"); toast.className = `toast ${type}`; toast.textContent = text; document.body.append(toast);
  setTimeout(() => toast.remove(), 3200);
}
let commerceTooltip = null;
let commerceTooltipOwner = null;
let commerceTooltipFrame = 0;
let commerceTooltipPoint = null;
function commerceChipFromTarget(target) { return target?.closest?.(".commerce-chip") || null; }
function ensureCommerceTooltip() {
  if (commerceTooltip?.isConnected) return commerceTooltip;
  commerceTooltip = document.createElement("div");
  commerceTooltip.className = "commerce-tooltip";
  commerceTooltip.setAttribute("role", "tooltip");
  commerceTooltip.hidden = true;
  document.body.append(commerceTooltip);
  return commerceTooltip;
}
function positionCommerceTooltip() {
  commerceTooltipFrame = 0;
  if (!commerceTooltipOwner || !commerceTooltip?.isConnected || commerceTooltip.hidden) return;
  const point = commerceTooltipPoint || (() => { const rect = commerceTooltipOwner.getBoundingClientRect(); return { x:rect.right, y:rect.top }; })();
  const tooltipRect = commerceTooltip.getBoundingClientRect(), gap = 14, margin = 12;
  let left = point.x + gap, top = point.y + gap;
  if (left + tooltipRect.width > window.innerWidth - margin) left = point.x - tooltipRect.width - gap;
  if (top + tooltipRect.height > window.innerHeight - margin) top = point.y - tooltipRect.height - gap;
  left = Math.max(margin, Math.min(left, window.innerWidth - tooltipRect.width - margin));
  top = Math.max(margin, Math.min(top, window.innerHeight - tooltipRect.height - margin));
  commerceTooltip.style.left = `${Math.round(left)}px`;
  commerceTooltip.style.top = `${Math.round(top)}px`;
}
function scheduleCommerceTooltipPosition(point) {
  commerceTooltipPoint = point;
  if (!commerceTooltipFrame) commerceTooltipFrame = requestAnimationFrame(positionCommerceTooltip);
}
function showCommerceTooltip(chip, point) {
  const text = chip?.dataset?.commerceTooltip;
  if (!text) return;
  commerceTooltipOwner = chip;
  const tooltip = ensureCommerceTooltip();
  tooltip.textContent = text;
  tooltip.hidden = false;
  scheduleCommerceTooltipPosition(point);
}
function hideCommerceTooltip(chip = commerceTooltipOwner) {
  if (chip && commerceTooltipOwner && chip !== commerceTooltipOwner) return;
  commerceTooltipOwner = null;
  commerceTooltipPoint = null;
  if (commerceTooltip) commerceTooltip.hidden = true;
  if (commerceTooltipFrame) { cancelAnimationFrame(commerceTooltipFrame); commerceTooltipFrame = 0; }
}
document.addEventListener("pointerover", event => {
  const chip = commerceChipFromTarget(event.target);
  if (!chip) return;
  showCommerceTooltip(chip, { x:event.clientX, y:event.clientY });
});
document.addEventListener("pointermove", event => {
  if (!commerceTooltipOwner) return;
  const chip = commerceChipFromTarget(event.target);
  if (chip !== commerceTooltipOwner) return;
  scheduleCommerceTooltipPosition({ x:event.clientX, y:event.clientY });
});
document.addEventListener("pointerout", event => {
  const chip = commerceChipFromTarget(event.target), nextChip = commerceChipFromTarget(event.relatedTarget);
  if (chip && chip === commerceTooltipOwner && nextChip !== chip) hideCommerceTooltip(chip);
});
document.addEventListener("focusin", event => {
  const chip = commerceChipFromTarget(event.target);
  if (chip) { const rect = chip.getBoundingClientRect(); showCommerceTooltip(chip, { x:rect.right, y:rect.top }); }
});
document.addEventListener("focusout", event => {
  const chip = commerceChipFromTarget(event.target);
  if (chip && commerceTooltipOwner === chip && commerceChipFromTarget(event.relatedTarget) !== chip) hideCommerceTooltip(chip);
});
document.addEventListener("click", event => {
  const chip = commerceChipFromTarget(event.target);
  if (!chip) { hideCommerceTooltip(); return; }
  if (commerceTooltipOwner !== chip || commerceTooltip?.hidden) { const rect = chip.getBoundingClientRect(); showCommerceTooltip(chip, { x:rect.right, y:rect.top }); }
});
const isAdminProfile = item => String(item?.nick || "").toLowerCase() === "panda";
function validBirthDate(value) {
  const text = String(value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return "";
  const date = new Date(`${text}T00:00:00`);
  if (Number.isNaN(date.getTime()) || date > new Date()) return "";
  return text;
}
function isAdultBirthDate(value) {
  const birthDate = validBirthDate(value);
  if (!birthDate) return false;
  const date = new Date(`${birthDate}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const beforeBirthday = today.getMonth() < date.getMonth() || (today.getMonth() === date.getMonth() && today.getDate() < date.getDate());
  if (beforeBirthday) age -= 1;
  return age >= 18;
}
function adultStatusFor(player) {
  if (!player || player.nickOnly || !player.birthDate) return "unknown";
  return isAdultBirthDate(player.birthDate) ? "adult" : "minor";
}
function roomHasNonAdultPlayer(room) {
  return (room?.players || []).some(uid => {
    const account = state.accounts[uid], roomProfile = room.playerProfiles?.[uid];
    const status = account?.birthDate ? adultStatusFor(account) : account?.adultStatus || roomProfile?.adultStatus || "unknown";
    return status !== "adult";
  });
}
const reportableMode = room => Boolean(getGameMode(room?.gameMode).allowReports);
const hasAdultCategory = settings => [settings?.category, ...(Array.isArray(settings?.categories) ? settings.categories : [])].some(item => String(item || "").startsWith("18+"));
const roomIsAdult = room => Boolean(getGameMode(room?.gameMode).adult || hasAdultCategory(room?.settings));
function adultBirthDateModal(mode, onConfirm) {
  const user = profile(), modal=document.createElement("div");modal.className="modal-backdrop";
  const accountForm = user && !user.nickOnly ? `<form id="adult-birth-form"><label>Data urodzenia</label><input id="adult-birth-date" type="date" required><p class="tiny">Date mozna dodac samodzielnie tylko raz. Pozniejsza zmiana wymaga kontaktu z administracja.</p><button class="primary full">Zapisz date</button></form>` : `<p class="muted">Zaloguj sie na konto i dodaj date urodzenia, zeby wejsc do kategorii 18+.</p><button class="primary full" id="adult-open-auth">Zaloguj / utworz konto</button>`;
  modal.innerHTML=`<section class="modal confirm-modal enter adult-warning-modal" role="dialog" aria-modal="true"><div class="modal-title"><div><p class="eyebrow">WERYFIKACJA 18+</p><h2>${escapeHtml(mode?.name || "Tryb 18+")}</h2></div><button class="icon-btn" data-close>${icon("x",18)}</button></div>${accountForm}</section>`;
  modal.querySelector("[data-close]").addEventListener("click",()=>actions.closeModal(modal));
  modal.querySelector("#adult-open-auth")?.addEventListener("click",()=>{actions.closeModal(modal);actions.openAuth({title:"Dodaj date urodzenia",description:"Kategorie 18+ wymagaja konta z data urodzenia."});});
  modal.querySelector("#adult-birth-form")?.addEventListener("submit",event=>{event.preventDefault();if(!actions.setOwnBirthDate(modal.querySelector("#adult-birth-date").value))return;actions.closeModal(modal);withAdultWarning(mode,onConfirm,true);});
  document.body.append(modal);Audio.play("modalOpen");
}
function adultBlockedModal(mode) {
  const modal=document.createElement("div");modal.className="modal-backdrop";
  modal.innerHTML=`<section class="modal confirm-modal enter adult-warning-modal" role="dialog" aria-modal="true"><div class="modal-title"><div><p class="eyebrow">BRAK DOSTEPU 18+</p><h2>${escapeHtml(mode?.name || "Tryb 18+")}</h2></div><button class="icon-btn" data-close>${icon("x",18)}</button></div><p class="muted">Ta kategoria jest dostepna tylko dla osob pelnoletnich.</p><div class="modal-actions"><button class="primary" data-close>Rozumiem</button></div></section>`;
  modal.querySelectorAll("[data-close]").forEach(button=>button.addEventListener("click",()=>actions.closeModal(modal)));
  document.body.append(modal);Audio.play("modalOpen");
}
function adultWarningModal(mode, onConfirm) {
  const modal=document.createElement("div");modal.className="modal-backdrop";
  modal.innerHTML=`<section class="modal confirm-modal enter adult-warning-modal" role="dialog" aria-modal="true"><div class="modal-title"><div><p class="eyebrow">OSTRZEŻENIE 18+</p><h2>${escapeHtml(mode?.name || "Tryb 18+")}</h2></div><button class="icon-btn" data-close>${icon("x",18)}</button></div><p class="muted">Ten wybór może zawierać mocne pytania dla dorosłych: seksualne, imprezowe, alkoholowe albo bardzo prywatne. Wchodź tylko, jeśli masz 18+ i świadomie chcesz grać w taki materiał.</p><div class="modal-actions"><button class="ghost" data-close>Nie wchodzę</button><button class="danger" id="confirm-adult-warning">Mam 18+ i potwierdzam</button></div></section>`;
  modal.querySelectorAll("[data-close]").forEach(button=>button.addEventListener("click",()=>actions.closeModal(modal)));
  modal.querySelector("#confirm-adult-warning").addEventListener("click",()=>{actions.closeModal(modal);onConfirm?.();});
  document.body.append(modal);Audio.play("modalOpen");
}
function withAdultWarning(mode, onConfirm, force = false) {
  if(!force) return onConfirm();
  const user = profile();
  if(!user?.birthDate || user.nickOnly) return adultBirthDateModal(mode,onConfirm);
  if(!isAdultBirthDate(user.birthDate)) return adultBlockedModal(mode);
  adultWarningModal(mode,onConfirm);
}
function clearPendingInvite({ clearUrl = false } = {}) {
  state.pendingInviteMode = ""; state.pendingInviteRoom = ""; state.pendingInviteInvalidMode = false; state.pendingInviteJoining = false; state.inviteAuthPrompted = false;
  if (clearUrl) setUrlRoute("", "");
}
function inviteErrorModal(text) {
  if (document.querySelector("[data-invite-error-modal]")) return false;
  const modal = document.createElement("div"); modal.className = "modal-backdrop"; modal.dataset.inviteErrorModal = "true";
  modal.innerHTML = `<section class="modal confirm-modal enter" role="dialog" aria-modal="true"><div class="modal-title"><div><p class="eyebrow">LINK ZAPROSZENIA</p><h2>Nie można dołączyć</h2></div></div><p class="muted">${escapeHtml(text)}</p><div class="modal-actions"><button class="primary" id="invite-back-menu">Powrót do menu</button></div></section>`;
  modal.querySelector("#invite-back-menu").addEventListener("click", () => { modal.remove(); state.activeRoomId = null; clearPendingInvite({ clearUrl:true }); persistSession(); Router.go("platform"); Audio.play("modalClose"); });
  document.body.append(modal); Audio.play("modalOpen");
  return false;
}
function invitePasswordModal(room, inviteMode) {
  if (document.querySelector("[data-invite-password-modal]")) return false;
  const modal = document.createElement("div"); modal.className = "modal-backdrop"; modal.dataset.invitePasswordModal = "true";
  modal.innerHTML = `<section class="modal enter" role="dialog" aria-modal="true"><div class="modal-title"><div><p class="eyebrow">PRYWATNY POKÓJ</p><h2>${escapeHtml(room.name || "Pokój")}</h2></div><button class="icon-btn" data-close>${icon("x",18)}</button></div><p class="muted">Link zaproszenia uzupełnił kod pokoju. Wpisz hasło, żeby dołączyć.</p><label>Hasło pokoju</label><input id="invite-room-password" type="password" autocomplete="current-password"><div class="modal-actions"><button class="ghost" data-close>Powrót do menu</button><button class="primary" id="invite-password-submit">Dołącz</button></div></section>`;
  const close = () => { actions.closeModal(modal); state.activeRoomId = null; clearPendingInvite({ clearUrl:true }); Router.go("platform"); };
  modal.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", close));
  modal.querySelector("#invite-password-submit").addEventListener("click", async () => { if (await actions.joinRoom(room.roomId, modal.querySelector("#invite-room-password").value, { fromInvite:true, inviteMode })) actions.closeModal(modal); });
  modal.querySelector("#invite-room-password").addEventListener("keydown", event => { if (event.key === "Enter") modal.querySelector("#invite-password-submit").click(); });
  document.body.append(modal); Audio.play("modalOpen"); setTimeout(() => modal.querySelector("#invite-room-password")?.focus(), 30);
  return false;
}
function bettingJoinModal(room, onConfirm) {
  const fee=roomEntryFee(room), available=playerMoney(room,state.currentUser), canJoin=available>=fee;
  const modal=document.createElement("div");modal.className="modal-backdrop";
  modal.innerHTML=`<section class="modal enter" role="dialog" aria-modal="true"><div class="modal-title"><div><p class="eyebrow">ZAKŁADY</p><h2>Pokój z wpisowym</h2></div><button class="icon-btn" data-close>${icon("x",18)}</button></div><p class="muted">Dołączenie do tego pokoju kosztuje <strong>${fee.toLocaleString("pl-PL")}$</strong>. Wpisowe zostanie pobrane dopiero po rozpoczęciu gry.</p>${canJoin?`<p class="tiny">Twój stan konta: ${available.toLocaleString("pl-PL")}$</p>`:`<p class="warning">Masz ${available.toLocaleString("pl-PL")}$, więc brakuje Ci ${Math.max(0,fee-available).toLocaleString("pl-PL")}$.</p>`}<div class="modal-actions"><button class="ghost" data-close>Anuluj</button><button class="primary" id="confirm-betting-join" ${canJoin?"":"disabled"}>Dołącz za ${fee.toLocaleString("pl-PL")}$</button></div></section>`;
  modal.querySelectorAll("[data-close]").forEach(button=>button.addEventListener("click",()=>modal.remove()));
  modal.querySelector("#confirm-betting-join")?.addEventListener("click",()=>{modal.remove();onConfirm();});
  document.body.append(modal);Audio.play("modalOpen");return false;
}
async function handlePendingInvite() {
  if (!state.pendingInviteRoom) return false;
  if (state.pendingInviteInvalidMode || !state.pendingInviteMode) return inviteErrorModal("Ten link prowadzi do innego trybu gry.");
  state.selectedGameMode = state.pendingInviteMode; persistSession();
  if (!profile()) {
    if (!state.inviteAuthPrompted && !document.querySelector(".auth-modal")) {
      state.inviteAuthPrompted = true;
      actions.openAuth({ title:"Zaloguj się, aby dołączyć do pokoju", description:"Po logowaniu automatycznie spróbujemy dołączyć do pokoju z linku." });
    }
    return true;
  }
  if (state.pendingInviteJoining) return true;
  state.pendingInviteJoining = true;
  const joined = await actions.joinRoom(state.pendingInviteRoom, "", { fromInvite:true, inviteMode:state.pendingInviteMode });
  state.pendingInviteJoining = false;
  return joined;
}
function routeFromUrlIfNeeded() {
  if (state.pendingInviteRoom) { handlePendingInvite(); return true; }
  if (initialUrlRoute.mode && !state.activeRoomId) {
    const mode = getGameMode(initialUrlRoute.mode);
    if (isModeLocked(mode.id)) { setUrlRoute("", ""); message(lockedModeMessage(mode), "info"); Router.go("platform"); return true; }
    state.selectedGameMode = initialUrlRoute.mode; persistSession(); setModeUrl(state.selectedGameMode);
    const destination = mode.supportsSolo && !mode.supportsLobby ? "solo" : "lobby";
    if (profile()) Router.go(destination);
    else if (!state.inviteAuthPrompted && !document.querySelector(".auth-modal")) { state.inviteAuthPrompted = true; state.afterLogin = destination; actions.openAuth({ title:`Zaloguj się, aby zagrać w ${mode.name}` }); }
    return true;
  }
  return false;
}
function banApplies(ban, user, modeId = "") {
  if (!ban || ban.revoked) return false;
  if (Number(ban.expiresAt || 0) && Number(ban.expiresAt) < Date.now()) return false;
  const modes = Array.isArray(ban.modes) ? ban.modes : [];
  if (!ban.global && !modeId) return false;
  if (!ban.global && modes.length && !modes.includes(modeId)) return false;
  const nickMatch = String(ban.targetNick || "").toLowerCase() === String(user?.nick || "").toLowerCase();
  const ipMatch = ban.targetIp && user?.lastKnownIp && String(ban.targetIp) === String(user.lastKnownIp);
  return nickMatch || ipMatch;
}
async function activeBanFor(user, modeId = "") {
  if (!user || isAdminProfile(user)) return null;
  const bans = Object.values(await loadModerationBans());
  return bans.find(ban => banApplies(ban, user, modeId));
}
async function guardBan(modeId = "") {
  const ban = await activeBanFor(profile(), modeId);
  if (!ban) return false;
  const until = ban.expiresAt ? ` do ${new Date(ban.expiresAt).toLocaleString("pl-PL")}` : "";
  message(`Masz bana${until}. Powód: ${ban.reason || "brak"}`, "error");
  return true;
}
function shouldCloseLonelyFinishedRoom(room) {
  const mode = getGameMode(room?.gameMode);
  return mode.minPlayers > 1 && room?.players?.length === 1 && (room.status !== "lobby" || Boolean(room.game) || Boolean(room.everStarted));
}
function showRoomClosedNotice() {
  if (document.querySelector("[data-room-closed-modal]")) return;
  const modal = document.createElement("div"); modal.className = "modal-backdrop"; modal.dataset.roomClosedModal = "true";
  modal.innerHTML = `<section class="modal confirm-modal enter" role="dialog" aria-modal="true" aria-labelledby="room-closed-title"><div class="modal-title"><div><p class="eyebrow">POKÓJ ZAMKNIĘTY</p><h2 id="room-closed-title">Rozgrywka została zakończona</h2></div></div><p class="muted">W pokoju został tylko jeden gracz, więc nie można kontynuować gry. Wróciłeś do menu gier.</p><div class="modal-actions"><button class="primary" data-close-room-notice>Rozumiem</button></div></section>`;
  modal.querySelector("[data-close-room-notice]").addEventListener("click", () => { modal.remove(); Audio.play("modalClose"); });
  document.body.append(modal); Audio.play("modalOpen");
}
function removeRoomLocally(roomId) {
  state.rooms = state.rooms.filter(room => room.roomId !== roomId);
  roomRosterSnapshots.delete(roomId); roomPhaseSnapshots.delete(roomId); pendingRoomSyncs.delete(roomId);
}
function closeLonelyFinishedRoom(room, { notify = false } = {}) {
  if (!shouldCloseLonelyFinishedRoom(room)) return false;
  const wasActive = state.activeRoomId === room.roomId;
  removeRemoteRoom(room.roomId); removeRoomLocally(room.roomId);
  if (wasActive) { state.activeRoomId = null; clearPendingInvite({clearUrl:true}); persistSession(); Router.go("platform"); if (notify) showRoomClosedNotice(); }
  return true;
}
function leaveKickedRoom(room, { notify = true } = {}) {
  if (!room || !state.currentUser || room.players.includes(state.currentUser)) return false;
  if (state.activeRoomId !== room.roomId) return false;
  state.selectedGameMode = room.gameMode || state.selectedGameMode;
  state.activeRoomId = null;
  persistSession();
  identityVoiceChat.stop();
  setModeUrl(state.selectedGameMode);
  Router.go("lobby");
  if (notify) message("Zostales wyrzucony z pokoju.", "info");
  return true;
}
function requiredProvePlayers(room) {
  const game=room?.game;if(room?.gameMode!=="udowodnij"||room.status!=="playing"||!game||game.phase==="result")return [];
  return game.phase==="initialBid"?[game.starter]:game.phase==="bidding"?[game.currentBidder,game.decisionPlayer]:game.phase==="answering"?[game.currentBidder]:[];
}
function interruptProveRoundForDeparture(room, leavingPlayerId) {
  if(!requiredProvePlayers(room).includes(leavingPlayerId))return false;
  const nick=state.accounts[leavingPlayerId]?.nick||room.playerProfiles?.[leavingPlayerId]?.nick||"Gracz";
  room.game={...room.game,phase:"result",phaseEndsAt:Date.now(),result:{success:false,loser:leavingPlayerId,leftRoom:true,text:`${nick} opuścił pokój. Runda została przerwana.`}};
  return true;
}
function interruptProveRoundWithMissingPlayer(room) {
  const missingPlayer=requiredProvePlayers(room).find(uid=>!room.players.includes(uid));
  return Boolean(missingPlayer&&interruptProveRoundForDeparture(room,missingPlayer));
}
const rawRoomPlayers = room => Array.isArray(room?.players)
  ? [...new Set(room.players.filter(Boolean))]
  : Object.keys(room?.players || {}).filter(Boolean);
function roomPlayerPresenceClients(room, uid) {
  const clients = room?.presence?.[uid];
  return clients && typeof clients === "object" ? Object.values(clients).filter(Boolean) : [];
}
function roomPlayerIsStale(room, uid, now = Date.now()) {
  if (!uid || isBotId(uid)) return false;
  const joinedAt = Number(room?.joinedAt?.[uid] || room?.playerProfiles?.[uid]?.joinedAt || 0);
  if (joinedAt && now - joinedAt < ROOM_STALE_JOIN_GRACE_MS) return false;
  const clients = roomPlayerPresenceClients(room, uid);
  // Brak wpisu nie oznacza jeszcze opuszczenia — drugi klient może być w
  // trakcie dołączania. Stary wpis offline/heartbeat wygaszamy dopiero po TTL.
  if (!clients.length) return false;
  return !clients.some(client => {
    const seenAt = Number(client?.seenAt || 0);
    return seenAt > 0 && now - seenAt < ROOM_PRESENCE_TTL_MS;
  });
}
function staleRoomPlayerIds(room, now = Date.now()) {
  return rawRoomPlayers(room).filter(uid => roomPlayerIsStale(room, uid, now));
}
function roomHasLiveHumanPlayers(room) {
  return rawRoomPlayers(room).some(uid => !isBotId(uid) && !roomPlayerIsStale(room, uid));
}
const normalizedRoomPlayers = room => rawRoomPlayers(room).filter(uid => !roomPlayerIsStale(room, uid));
function ensureScoreObject(target, players, defaultValue = 0) {
  let changed = false;
  if (!target || typeof target !== "object" || Array.isArray(target)) return Object.fromEntries(players.map(uid => [uid, defaultValue]));
  players.forEach(uid => { if (!(uid in target)) { target[uid] = defaultValue; changed = true; } });
  Object.keys(target).forEach(uid => { if (!players.includes(uid)) { delete target[uid]; changed = true; } });
  return changed ? target : target;
}
function repairGameStateForPlayers(room) {
  if (!room?.game) return false;
  let changed = false;
  const players = normalizedRoomPlayers(room);
  if (!Array.isArray(room.players) || players.length !== room.players.length || players.some((uid,index) => uid !== room.players[index])) {
    room.players = players;
    changed = true;
  }
  const game = room.game;
  if (room.gameMode === "udowodnij") {
    const total = Math.max(1, Number(room.settings?.rounds) || 5);
    if (!Number.isFinite(Number(game.round)) || Number(game.round) < 1) { game.round = 1; changed = true; }
    if (Number(game.totalRounds) !== total) { game.totalRounds = total; changed = true; }
    const beforeWins = JSON.stringify(game.roundWins || {});
    game.roundWins = ensureScoreObject(game.roundWins, players, 0);
    if (JSON.stringify(game.roundWins) !== beforeWins) changed = true;
    if (!game.passUses || typeof game.passUses !== "object" || Array.isArray(game.passUses)) { game.passUses = {}; changed = true; }
  }
  if (room.gameMode === "sequence") {
    if (!Array.isArray(game.players)) { game.players = players.slice(0, 2); changed = true; }
    if (!game.drafts || typeof game.drafts !== "object" || Array.isArray(game.drafts)) { game.drafts = {}; changed = true; }
    game.players.forEach(uid => { if (!Array.isArray(game.drafts[uid])) { game.drafts[uid] = []; changed = true; } });
    if (!game.sequences || typeof game.sequences !== "object" || Array.isArray(game.sequences)) { game.sequences = {}; changed = true; }
    if (!game.ready || typeof game.ready !== "object" || Array.isArray(game.ready)) { game.ready = {}; changed = true; }
    game.players.forEach(uid => { if (typeof game.ready[uid] !== "boolean") { game.ready[uid] = false; changed = true; } });
    if (!game.history || typeof game.history !== "object" || Array.isArray(game.history)) { game.history = {}; changed = true; }
    game.players.forEach(uid => { if (!Array.isArray(game.history[uid])) { game.history[uid] = []; changed = true; } });
    if (game.phase === "create" && !Number.isFinite(Number(game.createEndsAt))) { game.createEndsAt = Date.now() + 15000; changed = true; }
    if (!Array.isArray(game.guesses)) { game.guesses = []; changed = true; }
    if (!Array.isArray(game.feedback)) { game.feedback = []; changed = true; }
  }
  const keepPlayers = list => {
    const current = Array.isArray(list) ? list.filter(uid => players.includes(uid)) : [];
    players.forEach(uid => { if (!current.includes(uid)) current.push(uid); });
    return current;
  };
  if (room.gameMode === "marker") {
    const order = keepPlayers(game.players);
    if (JSON.stringify(order) !== JSON.stringify(game.players || [])) { game.players = order; changed = true; }
    const size = [8, 10, 12].includes(Number(game.size)) ? Number(game.size) : 8;
    const maximum = [20, 30, 40, 50, 60, 70, 80, 90, 100].includes(Number(game.numberMax)) ? Number(game.numberMax) : 50;
    if (game.size !== size) { game.size = size; changed = true; }
    if (game.numberMax !== maximum) { game.numberMax = maximum; changed = true; }
    const total = size * size;
    const validNumbers = Array.isArray(game.numbers) && game.numbers.length === total && game.numbers.every(value => value !== null && value !== "" && Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= maximum);
    if (!validNumbers) { game.numbers = Array.from({length:total}, (_, index) => index % (maximum + 1)); changed = true; }
    if (!["select", "draw", "result"].includes(game.phase)) { game.phase = "select"; changed = true; }
    if (game.phase === "select") { if (!Number.isFinite(Number(game.phaseEndsAt)) || Number(game.phaseEndsAt) <= 0) { game.phaseEndsAt = Date.now() + 10000; changed = true; } } else if (game.phaseEndsAt) { game.phaseEndsAt = 0; changed = true; }
    if (!game.marked || typeof game.marked !== "object" || Array.isArray(game.marked)) { game.marked = {}; changed = true; }
    if (!game.coverage || typeof game.coverage !== "object" || Array.isArray(game.coverage)) { game.coverage = {}; changed = true; }
    game.players.forEach(uid => { if (!game.coverage[uid] || typeof game.coverage[uid] !== "object" || Array.isArray(game.coverage[uid])) { game.coverage[uid] = {}; changed = true; } });
    if (!game.players.includes(game.turnUid)) { game.turnUid = game.players[0] || ""; changed = true; }
    const validCell = Number.isInteger(Number(game.selectedCell)) && Number(game.selectedCell) >= 0 && Number(game.selectedCell) < total && game.numbers[Number(game.selectedCell)] != null;
    if (game.selectedCell != null && !validCell) { game.selectedCell = null; game.drawerUid = ""; game.seekerUid = ""; if (game.phase === "draw") game.phase = "select"; changed = true; }
    if (game.phase === "draw" && (!game.players.includes(game.drawerUid) || !game.players.includes(game.seekerUid))) { game.phase = "select"; game.drawerUid = ""; game.seekerUid = ""; game.selectedCell = null; changed = true; }
  }
  if (room.gameMode === "impostor") {
    if (!game.roles || typeof game.roles !== "object") { game.roles = {}; changed = true; }
    players.forEach(uid => { if (!game.roles[uid]) { game.roles[uid] = { role:"citizen", word:game.mainWord || "" }; changed = true; } });
    Object.keys(game.roles).forEach(uid => { if (!players.includes(uid)) { delete game.roles[uid]; changed = true; } });
    const order = keepPlayers(game.turnOrder);
    if (JSON.stringify(order) !== JSON.stringify(game.turnOrder || [])) { game.turnOrder = order; changed = true; }
    if (!game.acknowledged || typeof game.acknowledged !== "object") { game.acknowledged = {}; changed = true; }
    Object.keys(game.acknowledged).forEach(uid => { if (!players.includes(uid)) { delete game.acknowledged[uid]; changed = true; } });
    if (!Array.isArray(game.clues)) { game.clues = []; changed = true; }
    if (!Array.isArray(game.chat)) { game.chat = []; changed = true; }
    if (!game.reactions || typeof game.reactions !== "object" || Array.isArray(game.reactions)) { game.reactions = {}; changed = true; }
    if (!game.reactionCooldowns || typeof game.reactionCooldowns !== "object" || Array.isArray(game.reactionCooldowns)) { game.reactionCooldowns = {}; changed = true; }
    if (!game.continueVotes || typeof game.continueVotes !== "object" || Array.isArray(game.continueVotes)) { game.continueVotes = {}; changed = true; }
    if (!game.votes || typeof game.votes !== "object" || Array.isArray(game.votes)) { game.votes = {}; changed = true; }
    if (!Number.isFinite(Number(game.continueCount))) { game.continueCount = 0; changed = true; }
    if (!game.turnOrder.length) { game.turnOrder = [...players]; changed = true; }
    if (game.turnIndex >= game.turnOrder.length) { game.turnIndex = 0; changed = true; }
  }
  if (room.gameMode === "kim-jestem") {
    const order = keepPlayers(game.order);
    if (JSON.stringify(order) !== JSON.stringify(game.order || [])) { game.order = order; changed = true; }
    if (!game.words || typeof game.words !== "object") { game.words = {}; changed = true; }
    players.forEach(uid => { if (!game.words[uid]) { game.words[uid] = "tajemnicza postać"; changed = true; } });
    Object.keys(game.words).forEach(uid => { if (!players.includes(uid)) { delete game.words[uid]; changed = true; } });
    if (!game.wordHistory || typeof game.wordHistory !== "object" || Array.isArray(game.wordHistory)) { game.wordHistory = {}; changed = true; }
    players.forEach(uid => { if (!Array.isArray(game.wordHistory[uid])) { game.wordHistory[uid] = game.words[uid] ? [{ word:game.words[uid], startRound:1, endRound:null }] : []; changed = true; } });
    Object.keys(game.wordHistory).forEach(uid => { if (!players.includes(uid)) { delete game.wordHistory[uid]; changed = true; } });
    const beforeScores = JSON.stringify(game.scores || {});
    game.scores = ensureScoreObject(game.scores, players, 0);
    if (JSON.stringify(game.scores) !== beforeScores) changed = true;
    if (game.turnIndex >= game.order.length) { game.turnIndex = 0; changed = true; }
    if (!game.responses || typeof game.responses !== "object") { game.responses = {}; changed = true; }
    if (!game.extendVotes || typeof game.extendVotes !== "object") { game.extendVotes = {}; changed = true; }
    if (!game.letterHints || typeof game.letterHints !== "object" || Array.isArray(game.letterHints)) { game.letterHints = {}; changed = true; }
    if (!game.passUses || typeof game.passUses !== "object" || Array.isArray(game.passUses)) { game.passUses = {}; changed = true; }
    if (!game.purchaseUses || typeof game.purchaseUses !== "object" || Array.isArray(game.purchaseUses)) { game.purchaseUses = {}; changed = true; }
  }
  if (room.gameMode === "inne-pytanie") {
    const beforeScores = JSON.stringify(game.scores || {});
    game.scores = ensureScoreObject(game.scores, players, 0);
    if (JSON.stringify(game.scores) !== beforeScores) changed = true;
    if (!game.answers || typeof game.answers !== "object") { game.answers = {}; changed = true; }
    if (!game.votes || typeof game.votes !== "object") { game.votes = {}; changed = true; }
    if (!game.chat || !Array.isArray(game.chat)) { game.chat = []; changed = true; }
    if (!players.includes(game.impostor)) { game.impostor = players[0]; changed = true; }
  }
  if (room.gameMode === "kto-najpredzej") {
    const beforeTotals = JSON.stringify(game.totals || {});
    game.totals = ensureScoreObject(game.totals, players, 0);
    if (JSON.stringify(game.totals) !== beforeTotals) changed = true;
    if (!game.submissions || typeof game.submissions !== "object") { game.submissions = {}; changed = true; }
    if (!game.votes || typeof game.votes !== "object") { game.votes = {}; changed = true; }
    if (!Array.isArray(game.questions)) { game.questions = []; changed = true; }
    if (!Array.isArray(game.results)) { game.results = []; changed = true; }
  }
  if (room.gameMode === "test-znajomosci") {
    const beforeScores = JSON.stringify(game.scores || {});
    game.scores = ensureScoreObject(game.scores, players, 0);
    if (JSON.stringify(game.scores) !== beforeScores) changed = true;
    if (!game.answers || typeof game.answers !== "object") { game.answers = {}; changed = true; }
    if (!game.guesses || typeof game.guesses !== "object") { game.guesses = {}; changed = true; }
    const answerOrder = Array.isArray(game.answerOrder) ? game.answerOrder.filter(uid => players.includes(uid)) : [];
    if (JSON.stringify(answerOrder) !== JSON.stringify(game.answerOrder || [])) { game.answerOrder = answerOrder; changed = true; }
    if (!game.roundScores || typeof game.roundScores !== "object") { game.roundScores = Object.fromEntries(players.map(uid => [uid, 0])); changed = true; }
  }
  if (room.gameMode === "zatruty-cukierek") {
    const order = keepPlayers(game.order);
    if (JSON.stringify(order) !== JSON.stringify(game.order || [])) { game.order = order; changed = true; }
    if (!Array.isArray(game.candies)) { game.candies = []; changed = true; }
    if (!game.alive || typeof game.alive !== "object") { game.alive = {}; changed = true; }
    players.forEach(uid => { if (!(uid in game.alive)) { game.alive[uid] = true; changed = true; } });
    Object.keys(game.alive).forEach(uid => { if (!players.includes(uid)) { delete game.alive[uid]; changed = true; } });
    if (!game.poisonChoices || typeof game.poisonChoices !== "object") { game.poisonChoices = {}; changed = true; }
    Object.keys(game.poisonChoices).forEach(uid => { if (!players.includes(uid)) { delete game.poisonChoices[uid]; changed = true; } });
    if (!Array.isArray(game.eliminated)) { game.eliminated = []; changed = true; }
    if (!game.scores || typeof game.scores !== "object" || Array.isArray(game.scores)) { game.scores = {}; changed = true; }
    players.forEach(uid => { if (!(uid in game.scores)) { game.scores[uid] = 0; changed = true; } });
    if (!Array.isArray(game.roundWinners)) { game.roundWinners = []; changed = true; }
    if (!game.passUses || typeof game.passUses !== "object" || Array.isArray(game.passUses)) { game.passUses = {}; changed = true; }
    if (!game.purchaseUses || typeof game.purchaseUses !== "object" || Array.isArray(game.purchaseUses)) { game.purchaseUses = {}; changed = true; }
    if (!Number(game.round)) { game.round = 1; changed = true; }
    if (!Number(game.totalRounds)) { game.totalRounds = sanitizePoisonCandySettings(room.settings, players.length).rounds; changed = true; }
    if (game.turnIndex >= game.order.length) { game.turnIndex = 0; changed = true; }
  }
  if (room.gameMode === "bomba") {
    const order = keepPlayers(game.order);
    if (JSON.stringify(order) !== JSON.stringify(game.order || [])) { game.order = order; changed = true; }
    const beforeScores = JSON.stringify(game.scores || {});
    game.scores = ensureScoreObject(game.scores, players, 0);
    if (JSON.stringify(game.scores) !== beforeScores) changed = true;
    if (!Array.isArray(game.usedAnswers)) { game.usedAnswers = []; changed = true; }
    if (!Array.isArray(game.answers)) { game.answers = []; changed = true; }
    if (!Array.isArray(game.bombSkinPool)) { game.bombSkinPool = []; changed = true; }
    game.bombSkinPool = game.bombSkinPool.filter(uid => players.includes(uid));
    if (game.bombSkinOwner && !players.includes(game.bombSkinOwner)) { game.bombSkinOwner = players[0] || ""; changed = true; }
    if (game.turnIndex >= Math.max(1, game.order.length)) { game.turnIndex = 0; changed = true; }
  }
  if (room.gameMode === "najblizej-prawdy") {
    const beforeScores = JSON.stringify(game.scores || {});
    game.scores = ensureScoreObject(game.scores, players, 0);
    if (JSON.stringify(game.scores) !== beforeScores) changed = true;
    if (!game.answers || typeof game.answers !== "object" || Array.isArray(game.answers)) { game.answers = {}; changed = true; }
    Object.keys(game.answers).forEach(uid => { if (!players.includes(uid)) { delete game.answers[uid]; changed = true; } });
    if (!game.roundScores || typeof game.roundScores !== "object" || Array.isArray(game.roundScores)) { game.roundScores = {}; changed = true; }
    if (!Array.isArray(game.ranking)) { game.ranking = []; changed = true; }
    game.ranking = game.ranking.filter(row => players.includes(row.uid));
    if (!Array.isArray(game.usedQuestions)) { game.usedQuestions = []; changed = true; }
  }
  if (room.gameMode === "ranking") {
    const beforeScores = JSON.stringify(game.scores || {});
    game.scores = ensureScoreObject(game.scores, players, 0);
    if (JSON.stringify(game.scores) !== beforeScores) changed = true;
    if (!game.submissions || typeof game.submissions !== "object" || Array.isArray(game.submissions)) { game.submissions = {}; changed = true; }
    Object.keys(game.submissions).forEach(uid => { if (!players.includes(uid)) { delete game.submissions[uid]; changed = true; } });
    if (!game.roundScores || typeof game.roundScores !== "object" || Array.isArray(game.roundScores)) { game.roundScores = {}; changed = true; }
    if (!Array.isArray(game.groupRanking)) { game.groupRanking = []; changed = true; }
    if (!Array.isArray(game.similarity)) { game.similarity = []; changed = true; }
    game.similarity = game.similarity.filter(row => players.includes(row.uid));
    if (!Array.isArray(game.usedSets)) { game.usedSets = []; changed = true; }
    if (!Array.isArray(game.baseOrder)) { game.baseOrder = []; changed = true; }
  }
  if (room.gameMode === "5-sekund") {
    const beforeScores = JSON.stringify(game.scores || {});
    game.scores = ensureScoreObject(game.scores, players, 0);
    if (JSON.stringify(game.scores) !== beforeScores) changed = true;
    if (!Array.isArray(game.order)) { game.order = []; changed = true; }
    game.order = game.order.filter(uid => players.includes(uid));
    if (!Array.isArray(game.history)) { game.history = []; changed = true; }
    game.history = game.history.filter(row => players.includes(row.uid)).map(row => ({ ...row, accepted:Array.isArray(row.accepted) ? row.accepted : [], rejected:Array.isArray(row.rejected) ? row.rejected : [], raw:Array.isArray(row.raw) ? row.raw : [], points:Number(row.points) || 0 }));
    if (game.activeUid && !players.includes(game.activeUid)) { game.activeUid = players[0] || ""; changed = true; }
    if (game.phase === "turn" && !game.phaseEndsAt) { game.phase = "prepare"; game.phaseEndsAt = Date.now() + 3000; changed = true; }
  }
  if (room.gameMode === "mathematics") {
    const beforeScores = JSON.stringify(game.scores || {});
    game.scores = ensureScoreObject(game.scores, players, 0);
    if (JSON.stringify(game.scores) !== beforeScores) changed = true;
    if (!game.answers || typeof game.answers !== "object" || Array.isArray(game.answers)) { game.answers = {}; changed = true; }
    if (!Array.isArray(game.history)) { game.history = []; changed = true; }
    if (!Array.isArray(game.questions)) { game.questions = []; changed = true; }
    if (!Number.isFinite(Number(game.questionIndex))) { game.questionIndex = 0; changed = true; }
    if (typeof game.showOpponentAnswers !== "boolean") { game.showOpponentAnswers = true; changed = true; }
    if (!game.questions.length) { game.phase = "result"; game.finished = true; changed = true; }
    else if (game.questionIndex >= game.questions.length) { game.questionIndex = game.questions.length - 1; changed = true; }
    if (game.variant === "full-test") {
      if (game.phase !== "result" && game.phase !== "test") { game.phase = "test"; changed = true; }
      if (!game.progress || typeof game.progress !== "object" || Array.isArray(game.progress)) { game.progress = {}; changed = true; }
      if (!game.testAnswers || typeof game.testAnswers !== "object" || Array.isArray(game.testAnswers)) { game.testAnswers = {}; changed = true; }
      if (!game.completed || typeof game.completed !== "object" || Array.isArray(game.completed)) { game.completed = {}; changed = true; }
      players.forEach(uid => {
        if (!(uid in game.progress)) { game.progress[uid] = 0; changed = true; }
        if (!Array.isArray(game.testAnswers[uid])) { game.testAnswers[uid] = []; changed = true; }
        if (!(uid in game.completed)) { game.completed[uid] = false; changed = true; }
      });
      if (!Number.isFinite(Number(game.testTime))) { game.testTime = 300; changed = true; }
      if (!Number.isFinite(Number(game.testEndsAt))) { game.testEndsAt = Date.now() + Math.max(60, Number(game.testTime) || 300) * 1000; changed = true; }
    }
  }
  if (room.gameMode === "word-chain") {
    const order = keepPlayers(game.players);
    if (JSON.stringify(order) !== JSON.stringify(game.players || [])) { game.players = order; changed = true; }
    if (!Array.isArray(game.chain)) { game.chain = []; changed = true; }
    if (!Array.isArray(game.used)) { game.used = []; changed = true; }
    if (!Array.isArray(game.eliminated)) { game.eliminated = []; changed = true; }
    game.eliminated = game.eliminated.filter(uid => players.includes(uid));
    if (!Array.isArray(game.missedPlayers)) { game.missedPlayers = []; changed = true; }
    game.missedPlayers = game.missedPlayers.filter(uid => players.includes(uid) && !game.eliminated.includes(uid));
    if (!game.hearts || typeof game.hearts !== "object" || Array.isArray(game.hearts)) { game.hearts = {}; changed = true; }
    const defaultHearts = Math.max(1, Math.min(5, Number(room.settings?.hearts) || 3));
    players.forEach(uid => { if (!Number.isFinite(Number(game.hearts[uid]))) { game.hearts[uid] = defaultHearts; changed = true; } });
    Object.keys(game.hearts).forEach(uid => { if (!players.includes(uid)) { delete game.hearts[uid]; changed = true; } });
    const active = game.players.filter(uid => !game.eliminated.includes(uid));
    if (active.length && !active.includes(game.currentUid)) { game.currentUid = active[0]; game.turnIndex = game.players.indexOf(active[0]); changed = true; }
  }
  if (room.gameMode === "number-mystery") {
    const order = keepPlayers(game.players);
    if (JSON.stringify(order) !== JSON.stringify(game.players || [])) { game.players = order; changed = true; }
    if (!game.numbers || typeof game.numbers !== "object" || Array.isArray(game.numbers)) { game.numbers = {}; changed = true; }
    players.slice(0, 2).forEach(uid => { if (!Number.isInteger(Number(game.numbers[uid])) || Number(game.numbers[uid]) < 1 || Number(game.numbers[uid]) > 150) { game.numbers[uid] = 1 + Math.floor(Math.random() * 150); changed = true; } });
    if (!Array.isArray(game.history)) { game.history = []; changed = true; }
    if (!game.guesses || typeof game.guesses !== "object" || Array.isArray(game.guesses)) { game.guesses = {}; changed = true; }
    if (!game.wrongGuesses || typeof game.wrongGuesses !== "object" || Array.isArray(game.wrongGuesses)) { game.wrongGuesses = {}; changed = true; }
    if (!game.oracleHints || typeof game.oracleHints !== "object" || Array.isArray(game.oracleHints)) { game.oracleHints = {}; changed = true; }
    if (!game.passUses || typeof game.passUses !== "object" || Array.isArray(game.passUses)) { game.passUses = {}; changed = true; }
    if (!game.players.includes(game.turnUid) && game.phase !== "result") { game.turnUid = game.players[0] || ""; changed = true; }
    if (!Number.isFinite(Number(game.phaseEndsAt)) && !["result", "guess"].includes(game.phase)) { game.phaseEndsAt = Date.now() + Math.max(10, Number(game.questionTime) || 30) * 1000; changed = true; }
  }
  if (room.gameMode === "unique-answer") {
    game.players = keepPlayers(game.players); game.answers = game.answers && typeof game.answers === "object" && !Array.isArray(game.answers) ? game.answers : {}; game.lives = game.lives && typeof game.lives === "object" && !Array.isArray(game.lives) ? game.lives : {}; game.eliminated = Array.isArray(game.eliminated) ? game.eliminated.filter(uid => players.includes(uid)) : []; game.history = Array.isArray(game.history) ? game.history : []; game.usedQuestions = Array.isArray(game.usedQuestions) ? game.usedQuestions : [];
    const defaults = sanitizeUniqueAnswerSettings(room.settings, players.length); players.forEach(uid => { if (!Number.isFinite(Number(game.lives[uid]))) { game.lives[uid] = defaults.lives; changed = true; } });
    if (!Number.isFinite(Number(game.phaseEndsAt)) && game.phase !== "result") { game.phaseEndsAt = Date.now() + defaults.answerTime * 1000; changed = true; }
  }
  if (room.gameMode === "polacz-nas") {
    const order = keepPlayers(game.players);
    if (JSON.stringify(order) !== JSON.stringify(game.players || [])) { game.players = order; changed = true; }
    if (!Array.isArray(game.pair) || game.pair.length < 2) { game.pair = ["kot", "samochód"]; changed = true; }
    if (!Array.isArray(game.usedPairs)) { game.usedPairs = []; changed = true; }
    ["answers", "votes", "scores"].forEach(key => { if (!game[key] || typeof game[key] !== "object" || Array.isArray(game[key])) { game[key] = {}; changed = true; } });
    if (!game.creativeEdits || typeof game.creativeEdits !== "object" || Array.isArray(game.creativeEdits)) { game.creativeEdits = {}; changed = true; }
    if (!game.passUses || typeof game.passUses !== "object" || Array.isArray(game.passUses)) { game.passUses = {}; changed = true; }
    Object.keys(game.answers).forEach(uid => { if (!players.includes(uid)) { delete game.answers[uid]; changed = true; } });
    Object.keys(game.votes).forEach(uid => { if (!players.includes(uid) || !players.includes(game.votes[uid])) { delete game.votes[uid]; changed = true; } });
    const beforeScores = JSON.stringify(game.scores); game.scores = ensureScoreObject(game.scores, players, 0); if (JSON.stringify(game.scores) !== beforeScores) changed = true;
    if (!Number.isFinite(Number(game.phaseEndsAt)) && !["gameSummary", "result"].includes(game.phase)) { game.phaseEndsAt = Date.now() + Math.max(15, Number(room.settings?.answerTime) || 30) * 1000; changed = true; }
  }
  if (room.gameMode === "klamca") {
    const order = keepPlayers(game.players);
    if (JSON.stringify(order) !== JSON.stringify(game.players || [])) { game.players = order; changed = true; }
    ["answers", "votes", "scores", "liarCounts"].forEach(key => { if (!game[key] || typeof game[key] !== "object" || Array.isArray(game[key])) { game[key] = {}; changed = true; } });
    if (!game.creativeEdits || typeof game.creativeEdits !== "object" || Array.isArray(game.creativeEdits)) { game.creativeEdits = {}; changed = true; }
    if (!game.passUses || typeof game.passUses !== "object" || Array.isArray(game.passUses)) { game.passUses = {}; changed = true; }
    if (!Array.isArray(game.usedQuestions)) { game.usedQuestions = []; changed = true; }
    if (!Array.isArray(game.liarHistory)) { game.liarHistory = []; changed = true; }
    Object.keys(game.answers).forEach(uid => { if (!players.includes(uid)) { delete game.answers[uid]; changed = true; } });
    Object.keys(game.votes).forEach(uid => { if (!players.includes(uid) || !players.includes(game.votes[uid])) { delete game.votes[uid]; changed = true; } });
    const beforeScores = JSON.stringify(game.scores); game.scores = ensureScoreObject(game.scores, players, 0); if (JSON.stringify(game.scores) !== beforeScores) changed = true;
    players.forEach(uid => { if (!Number.isFinite(Number(game.liarCounts[uid]))) { game.liarCounts[uid] = 0; changed = true; } });
    if (!players.includes(game.liarUid)) { game.liarUid = players[0] || ""; changed = true; }
    if (!Number.isFinite(Number(game.round)) || Number(game.round) < 1) { game.round = 1; changed = true; }
    if (!Number.isFinite(Number(game.totalRounds))) { game.totalRounds = sanitizeLiarSettings(room.settings).rounds; changed = true; }
    if (game.phase === "answering" && game.players.length && game.players.every(uid => uid in game.answers)) { game.phase = "discussion"; game.phaseEndsAt = Date.now() + sanitizeLiarSettings(room.settings).discussionTime * 1000; changed = true; }
    if (!Number.isFinite(Number(game.phaseEndsAt)) && !["gameSummary", "result"].includes(game.phase)) { game.phaseEndsAt = Date.now() + Math.max(10, Number(room.settings?.answerTime) || 30) * 1000; changed = true; }
  }
  if (room.gameMode === "falszywa-wiadomosc") {
    const order = keepPlayers(game.players);
    if (JSON.stringify(order) !== JSON.stringify(game.players || [])) { game.players = order; changed = true; }
    ["answers", "scores", "heroCounts"].forEach(key => { if (!game[key] || typeof game[key] !== "object" || Array.isArray(game[key])) { game[key] = {}; changed = true; } });
    if (!game.creativeEdits || typeof game.creativeEdits !== "object" || Array.isArray(game.creativeEdits)) { game.creativeEdits = {}; changed = true; }
    if (!game.passUses || typeof game.passUses !== "object" || Array.isArray(game.passUses)) { game.passUses = {}; changed = true; }
    if (!Array.isArray(game.usedSituations)) { game.usedSituations = []; changed = true; }
    if (!Array.isArray(game.heroHistory)) { game.heroHistory = []; changed = true; }
    Object.keys(game.answers).forEach(uid => { if (!players.includes(uid) || uid === game.heroUid) { delete game.answers[uid]; changed = true; } });
    const beforeScores = JSON.stringify(game.scores); game.scores = ensureScoreObject(game.scores, players, 0); if (JSON.stringify(game.scores) !== beforeScores) changed = true;
    players.forEach(uid => { if (!Number.isFinite(Number(game.heroCounts[uid]))) { game.heroCounts[uid] = 0; changed = true; } });
    if (!players.includes(game.heroUid)) { game.heroUid = players[0] || ""; changed = true; }
    if (!Number.isFinite(Number(game.round)) || Number(game.round) < 1) { game.round = 1; changed = true; }
    if (!Number.isFinite(Number(game.totalRounds))) { game.totalRounds = sanitizeFalseMessageSettings(room.settings).rounds || players.length; changed = true; }
    if (game.phase === "answering" && game.players.filter(uid => uid !== game.heroUid).every(uid => uid in game.answers)) { game.phase = "selecting"; game.phaseEndsAt = Date.now() + sanitizeFalseMessageSettings(room.settings).voteTime * 1000; changed = true; }
    if (!Number.isFinite(Number(game.phaseEndsAt)) && !["gameSummary", "result"].includes(game.phase)) { game.phaseEndsAt = Date.now() + Math.max(10, Number(room.settings?.answerTime) || 30) * 1000; changed = true; }
  }
  if (room.gameMode === "tajna-zasada") {
    game.players = keepPlayers(game.players);
    if (game.players.length > 2) { game.players = game.players.slice(0, 2); changed = true; }
    if (!game.secretRules || typeof game.secretRules !== "object" || Array.isArray(game.secretRules)) { game.secretRules = {}; changed = true; }
    Object.keys(game.secretRules).forEach(uid => { if (!players.includes(uid)) { delete game.secretRules[uid]; changed = true; } });
    if (!game.history || typeof game.history !== "object" || Array.isArray(game.history)) { game.history = {}; changed = true; }
    players.slice(0, 2).forEach(uid => { if (!Array.isArray(game.history[uid])) { game.history[uid] = []; changed = true; } });
    const beforeScores = JSON.stringify(game.scores); game.scores = ensureScoreObject(game.scores, players.slice(0, 2), 0); if (JSON.stringify(game.scores) !== beforeScores) changed = true;
    if (!game.guessBlocked || typeof game.guessBlocked !== "object" || Array.isArray(game.guessBlocked)) { game.guessBlocked = {}; changed = true; }
    if (!game.guessCheckpoint || typeof game.guessCheckpoint !== "object" || Array.isArray(game.guessCheckpoint)) { game.guessCheckpoint = {}; changed = true; }
    if (!game.passUses || typeof game.passUses !== "object" || Array.isArray(game.passUses)) { game.passUses = {}; changed = true; }
    if (!game.players.includes(game.turnUid) && !["rules", "result"].includes(game.phase)) { game.turnUid = game.players[0] || ""; changed = true; }
    if (!game.category) { game.category = "Wszystko"; changed = true; }
    if (game.phase === "rules" && game.players.every(uid => String(game.secretRules[uid] || "").trim())) { game.phase = "turn"; game.turnUid = game.players[0] || ""; game.phaseEndsAt = 0; changed = true; }
    if (!Number.isFinite(Number(game.phaseEndsAt)) && game.phase !== "turn" && game.phase !== "result") { game.phaseEndsAt = Date.now() + sanitizeSecretRuleSettings(room.settings).reviewTime * 1000; changed = true; }
  }
  if (room.gameMode === "pojedynek-hitow") {
    const order = keepPlayers(game.players).slice(0, 8);
    if (JSON.stringify(order) !== JSON.stringify(game.players || [])) { game.players = order; changed = true; }
    ["submissions", "votes"].forEach(key => {
      if (!game[key] || typeof game[key] !== "object" || Array.isArray(game[key])) { game[key] = {}; changed = true; }
      Object.keys(game[key]).forEach(uid => { if (!players.includes(uid)) { delete game[key][uid]; changed = true; } });
    });
    const beforeScores = JSON.stringify(game.scores);
    game.scores = ensureScoreObject(game.scores, order, 0);
    if (JSON.stringify(game.scores) !== beforeScores) changed = true;
    if (!Array.isArray(game.usedTracks)) { game.usedTracks = []; changed = true; }
    if (!Number.isFinite(Number(game.round)) || Number(game.round) < 1) { game.round = 1; changed = true; }
    if (!Number.isFinite(Number(game.totalRounds))) { game.totalRounds = Math.max(1, Math.min(20, Number(room.settings?.rounds) || 5)); changed = true; }
    const selectionTime = Math.max(10, Number(room.settings?.selectionTime ?? room.settings?.answerTime) || 30);
    const votingTime = Math.max(10, Number(room.settings?.votingTime) || 25);
    if (game.phase === "selecting" && order.length && order.every(uid => uid in game.submissions)) { game.phase = "voting"; game.votes = {}; game.phaseEndsAt = Date.now() + votingTime * 1000; changed = true; }
    if (!Number.isFinite(Number(game.phaseEndsAt)) && !["gameSummary", "result"].includes(game.phase)) { game.phaseEndsAt = Date.now() + (game.phase === "voting" ? votingTime : selectionTime) * 1000; changed = true; }
  }
  if (room.gameMode === "bitwa-hitow") {
    const order = keepPlayers(game.players).slice(0, 100);
    if (JSON.stringify(order) !== JSON.stringify(game.players || [])) { game.players = order; changed = true; }
    ["submissions", "votes", "selectionWeights"].forEach(key => {
      if (!game[key] || typeof game[key] !== "object" || Array.isArray(game[key])) { game[key] = {}; changed = true; }
      Object.keys(game[key]).forEach(uid => { if (!players.includes(uid)) { delete game[key][uid]; changed = true; } });
    });
    const beforeScores = JSON.stringify(game.scores), beforeWins = JSON.stringify(game.wins);
    game.scores = ensureScoreObject(game.scores, order, 0); game.wins = ensureScoreObject(game.wins, order, 0);
    if (JSON.stringify(game.scores) !== beforeScores || JSON.stringify(game.wins) !== beforeWins) changed = true;
    order.forEach(uid => { if (!Number.isFinite(Number(game.selectionWeights[uid]))) { game.selectionWeights[uid] = 1; changed = true; } });
    if (!Array.isArray(game.duelists)) { game.duelists = []; changed = true; }
    const duelists = game.duelists.filter(uid => order.includes(uid)).slice(0, 2);
    if (duelists.length !== game.duelists.length) { game.duelists = duelists; changed = true; }
    if (game.duelists.length < 2 && order.length >= 2 && ["selecting", "voting", "roundResult"].includes(game.phase)) {
      const replacement = [...game.duelists];
      order.forEach(uid => { if (replacement.length < 2 && !replacement.includes(uid)) replacement.push(uid); });
      if (JSON.stringify(replacement) !== JSON.stringify(game.duelists)) { game.duelists = replacement; changed = true; }
    }
    if (!Array.isArray(game.usedTracks)) { game.usedTracks = []; changed = true; }
    if (!Number.isFinite(Number(game.round)) || Number(game.round) < 1) { game.round = 1; changed = true; }
    if (!Number.isFinite(Number(game.totalRounds))) { game.totalRounds = Math.max(1, Math.min(100, Number(room.settings?.rounds) || 10)); changed = true; }
    const selectionTime = Math.max(10, Number(room.settings?.selectionTime ?? room.settings?.answerTime) || 30);
    const votingTime = Math.max(10, Number(room.settings?.votingTime) || 25);
    if (game.phase === "selecting" && game.duelists.length === 2 && game.duelists.every(uid => uid in game.submissions)) { game.phase = "voting"; game.votes = {}; game.phaseEndsAt = Date.now() + votingTime * 1000; changed = true; }
    if (!Number.isFinite(Number(game.phaseEndsAt)) && !["gameSummary", "result"].includes(game.phase)) { game.phaseEndsAt = Date.now() + (game.phase === "voting" ? votingTime : selectionTime) * 1000; changed = true; }
  }
  if (room.gameMode === "popularnosc-hitow") {
    let order = keepPlayers(game.players).slice(0, 8);
    if (!order.length) order = players.slice(0, 8);
    if (JSON.stringify(order) !== JSON.stringify(game.players || [])) { game.players = order; changed = true; }
    const knownTrackIds = new Set(popularityTracks.map(track => track.id));
    const pair = Array.isArray(game.pair) ? game.pair.slice(0, 2) : [];
    const pairIds = pair.map(track => track?.id);
    const pairIsValid = pair.length === 2
      && new Set(pairIds).size === 2
      && pair.every(track => knownTrackIds.has(track?.id) && String(track?.title || "").trim() && String(track?.artist || "").trim());
    if (!pairIsValid) {
      game.pair = popularityTracks.slice(0, 2).map(track => ({ id:track.id, title:track.title, artist:track.artist, views:track.views, listeners:track.listeners }));
      changed = true;
    }
    const validChoices = new Set(["left", "right"]);
    ["choices", "scores"].forEach(key => {
      if (!game[key] || typeof game[key] !== "object" || Array.isArray(game[key])) { game[key] = {}; changed = true; }
      Object.keys(game[key]).forEach(uid => {
        if (!order.includes(uid) || (key === "choices" && game[key][uid] != null && !validChoices.has(game[key][uid]))) {
          delete game[key][uid];
          changed = true;
        }
      });
    });
    const beforeScores = JSON.stringify(game.scores);
    game.scores = ensureScoreObject(game.scores, order, 0);
    order.forEach(uid => {
      const score = Math.max(0, Math.floor(Number(game.scores[uid]) || 0));
      if (game.scores[uid] !== score) { game.scores[uid] = score; changed = true; }
    });
    if (JSON.stringify(game.scores) !== beforeScores) changed = true;
    const currentPairIds = game.pair.map(track => track.id);
    const usedIds = Array.isArray(game.usedIds) ? game.usedIds.filter(id => knownTrackIds.has(id)) : [];
    const normalizedUsedIds = [...new Set([...usedIds, ...currentPairIds])].slice(-popularityTracks.length);
    if (JSON.stringify(normalizedUsedIds) !== JSON.stringify(game.usedIds)) { game.usedIds = normalizedUsedIds; changed = true; }
    game.metric = game.metric === "listeners" ? "listeners" : "views";
    if (!Number.isFinite(Number(game.round)) || Number(game.round) < 1) { game.round = 1; changed = true; }
    if (!Number.isFinite(Number(game.totalRounds))) { game.totalRounds = sanitizePopularitySettings(room.settings).rounds; changed = true; }
    const validPhases = new Set(["choosing", "roundResult", "gameSummary"]);
    if (!validPhases.has(game.phase)) { game.phase = "choosing"; game.roundResult = null; game.phaseEndsAt = Date.now() + sanitizePopularitySettings(room.settings).choiceTime * 1000; changed = true; }
    if (game.roundResult && typeof game.roundResult === "object") {
      const resultChoices = game.roundResult.choices && typeof game.roundResult.choices === "object" ? game.roundResult.choices : {};
      Object.keys(resultChoices).forEach(uid => { if (!order.includes(uid) || !validChoices.has(resultChoices[uid])) delete resultChoices[uid]; });
      game.roundResult.choices = resultChoices;
    }
    if (game.phase === "choosing" && order.length && order.every(uid => uid in game.choices)) { PopularityEngine.timeout(game); changed = true; }
    if (!Number.isFinite(Number(game.phaseEndsAt)) && !["gameSummary", "result"].includes(game.phase)) { game.phaseEndsAt = Date.now() + sanitizePopularitySettings({ ...room.settings, metric:game.metric }).choiceTime * 1000; changed = true; }
  }
  if (typeof room.gameMode === "string" && room.gameMode.startsWith("board-")) {
    const mode = getGameMode(room.gameMode), maxPlayers = Math.max(2, Number(mode.maxPlayers) || 8), gamePlayers = Array.isArray(game.players) && game.players.length ? game.players : players, order = gamePlayers.filter(uid => players.includes(uid)).slice(0, maxPlayers);
    if (JSON.stringify(order) !== JSON.stringify(game.players || [])) { game.players = order; changed = true; }
    game.boardMode = room.gameMode;
    const beforeScores = JSON.stringify(game.scores);
    game.scores = ensureScoreObject(game.scores, order, 0);
    if (JSON.stringify(game.scores) !== beforeScores) changed = true;
    ["passUses", "purchaseUses"].forEach(key => { if (!game[key] || typeof game[key] !== "object" || Array.isArray(game[key])) { game[key] = {}; changed = true; } });
    const minPlayers = Math.max(2, Number(mode.minPlayers) || 2);
    if (order.length < minPlayers && !["result", "gameSummary"].includes(game.phase)) {
      game.phase = "result"; game.finished = true; game.phaseEndsAt = 0; game.winners = order.length === 1 ? [...order] : []; game.winner = game.winners[0] || "";
      if (game.winners.length) game.scores[game.winners[0]] = (Number(game.scores[game.winners[0]]) || 0) + 1;
      changed = true;
    }
    if (!Number.isFinite(Number(game.turnIndex)) || Number(game.turnIndex) < 0 || Number(game.turnIndex) >= Math.max(1, order.length)) { game.turnIndex = 0; changed = true; }
    if (room.gameMode === "board-statki") {
      if (!game.fleets || typeof game.fleets !== "object" || Array.isArray(game.fleets)) { game.fleets = {}; changed = true; }
      if (!game.placementSubmitted || typeof game.placementSubmitted !== "object" || Array.isArray(game.placementSubmitted)) { game.placementSubmitted = {}; changed = true; }
      if (!game.shots || typeof game.shots !== "object" || Array.isArray(game.shots)) { game.shots = {}; changed = true; }
      order.forEach(uid => { if (!game.shots[uid] || typeof game.shots[uid] !== "object" || Array.isArray(game.shots[uid])) { game.shots[uid] = {}; changed = true; } });
      if (game.phase === "placement" && order.length >= 2 && order.every(uid => game.placementSubmitted[uid] && Array.isArray(game.fleets[uid]))) { game.phase = "playing"; game.turnIndex = 0; game.currentUid = order[0]; game.phaseEndsAt = Date.now() + sanitizeBoardSettings(room.settings, room.gameMode).turnTime * 1000; changed = true; }
    }
    if (game.phase === "playing" && order.length && !order.includes(game.currentUid)) { game.turnIndex = Math.max(0, Math.min(order.length - 1, Number(game.turnIndex) || 0)); game.currentUid = order[game.turnIndex]; changed = true; }
    if (room.gameMode === "board-memory") {
      if (!Array.isArray(game.cards)) { game.cards = []; changed = true; }
      const cardIds = new Set(game.cards.map(card => card?.id).filter(Boolean)), flipped = Array.isArray(game.flipped) ? game.flipped.filter(id => cardIds.has(id)).slice(0, 2) : [];
      if (JSON.stringify(flipped) !== JSON.stringify(game.flipped || [])) { game.flipped = flipped; changed = true; }
      if (!Number.isFinite(Number(game.flipLockUntil))) { game.flipLockUntil = 0; changed = true; }
    }
    if (!Number.isFinite(Number(game.phaseEndsAt)) && !["result", "gameSummary"].includes(game.phase)) { game.phaseEndsAt = Date.now() + sanitizeBoardSettings(room.settings, room.gameMode).turnTime * 1000; changed = true; }
  }
  if (room.gameMode === "family") {
    const order = keepPlayers(game.players);
    if (JSON.stringify(order) !== JSON.stringify(game.players || [])) { game.players = order; changed = true; }
    if (!Array.isArray(game.questions)) { game.questions = []; changed = true; }
    if (!Array.isArray(game.revealed)) { game.revealed = []; changed = true; }
    if (!Array.isArray(game.answers)) { game.answers = []; changed = true; }
    const question = game.questions[Math.max(0, Number(game.round || 1) - 1)];
    if ((!game.questions.length || !question || typeof question.prompt !== "string" || !Array.isArray(question.answers)) && game.phase !== "result") { game.phase = "result"; game.finished = true; changed = true; }
    const beforeScores = JSON.stringify(game.scores || {});
    game.scores = ensureScoreObject(game.scores, players, 0);
    if (JSON.stringify(game.scores) !== beforeScores) changed = true;
    if (game.players.length && !game.players.includes(game.currentUid)) { game.currentUid = game.players[0]; changed = true; }
  }
  if (room.gameMode === "zegar") {
    const beforeScores = JSON.stringify(game.scores || {});
    game.scores = ensureScoreObject(game.scores, players, 0);
    if (JSON.stringify(game.scores) !== beforeScores) changed = true;
    if (!game.stops || typeof game.stops !== "object" || Array.isArray(game.stops)) { game.stops = {}; changed = true; }
    Object.keys(game.stops).forEach(uid => { if (!players.includes(uid)) { delete game.stops[uid]; changed = true; } });
    if (!Array.isArray(game.ranking)) { game.ranking = []; changed = true; }
    game.ranking = game.ranking.filter(row => players.includes(row.uid));
    ["passUses", "firstStops", "pendingSecondChance"].forEach(key => { if (!game[key] || typeof game[key] !== "object" || Array.isArray(game[key])) { game[key] = {}; changed = true; } });
  }
  if (room.gameMode === "pokemon-last-letter") {
    const order = keepPlayers(game.order);
    if (JSON.stringify(order) !== JSON.stringify(game.order || [])) { game.order = order; changed = true; }
    if (!Array.isArray(game.chain)) { game.chain = []; changed = true; }
    if (!Array.isArray(game.usedIds)) { game.usedIds = []; changed = true; }
    if (!Array.isArray(game.chainAuthors)) { game.chainAuthors = []; changed = true; }
    if (!Array.isArray(game.eliminated)) { game.eliminated = []; changed = true; }
    if (!game.hearts || typeof game.hearts !== "object" || Array.isArray(game.hearts)) { game.hearts = {}; changed = true; }
    const defaultHearts = Math.max(1, Math.min(5, Number(room.settings?.hearts) || 3));
    players.forEach(uid => { if (!Number.isFinite(Number(game.hearts[uid]))) { game.hearts[uid] = defaultHearts; changed = true; } });
    game.eliminated = game.eliminated.filter(uid => players.includes(uid));
    if (game.turnIndex >= Math.max(1, game.order.length)) { game.turnIndex = 0; changed = true; }
  }
  if (room.gameMode === "pokemon-types") {
    const beforeScores = JSON.stringify(game.scores || {});
    game.scores = ensureScoreObject(game.scores, players, 0);
    if (JSON.stringify(game.scores) !== beforeScores) changed = true;
    if (!game.selectedTypes || typeof game.selectedTypes !== "object" || Array.isArray(game.selectedTypes)) { game.selectedTypes = {}; changed = true; }
    if (!Array.isArray(game.blockedPairs)) { game.blockedPairs = []; changed = true; }
    if (!game.answers || typeof game.answers !== "object" || Array.isArray(game.answers)) { game.answers = {}; changed = true; }
    if (!Array.isArray(game.ranking)) { game.ranking = []; changed = true; }
  }
  if (room.gameMode === "pokemon-match-type") {
    const beforeScores = JSON.stringify(game.scores || {});
    game.scores = ensureScoreObject(game.scores, players, 0);
    if (JSON.stringify(game.scores) !== beforeScores) changed = true;
    if (!game.hearts || typeof game.hearts !== "object" || Array.isArray(game.hearts)) { game.hearts = {}; changed = true; }
    const defaultHearts = Math.max(1, Math.min(5, Number(room.settings?.hearts) || 3));
    players.forEach(uid => { if (!Number.isFinite(Number(game.hearts[uid]))) { game.hearts[uid] = defaultHearts; changed = true; } });
    if (!Array.isArray(game.eliminated)) { game.eliminated = []; changed = true; }
    if (!game.answers || typeof game.answers !== "object" || Array.isArray(game.answers)) { game.answers = {}; changed = true; }
  }
  if (typeof room.gameMode === "string" && room.gameMode.startsWith("pokemon-")) {
    if (!game.answers || typeof game.answers !== "object" || Array.isArray(game.answers)) { game.answers = {}; changed = true; }
    if (!Array.isArray(game.ranking)) { game.ranking = []; changed = true; }
    if (!Array.isArray(game.eliminated)) { game.eliminated = []; changed = true; }
    if (!game.passUses || typeof game.passUses !== "object" || Array.isArray(game.passUses)) { game.passUses = {}; changed = true; }
    if (!game.scoutHints || typeof game.scoutHints !== "object" || Array.isArray(game.scoutHints)) { game.scoutHints = {}; changed = true; }
    if (room.gameMode === "pokemon-auction") {
      if (!game.budgets || typeof game.budgets !== "object" || Array.isArray(game.budgets)) { game.budgets = {}; changed = true; }
      if (!game.teams || typeof game.teams !== "object" || Array.isArray(game.teams)) { game.teams = {}; changed = true; }
      if (!game.purchases || typeof game.purchases !== "object" || Array.isArray(game.purchases)) { game.purchases = {}; changed = true; }
      if (!Array.isArray(game.items)) { game.items = []; changed = true; }
      if (!Number.isFinite(Number(game.auctionIndex))) { game.auctionIndex = 0; changed = true; }
      if (!Array.isArray(game.passed)) { game.passed = []; changed = true; }
      players.forEach(uid => { if (!Array.isArray(game.teams[uid])) { game.teams[uid] = []; changed = true; } if (!Array.isArray(game.purchases[uid])) { game.purchases[uid] = []; changed = true; } if (!Number.isFinite(Number(game.budgets[uid]))) { game.budgets[uid] = Number(room.settings?.budget) || 50; changed = true; } });
      if (!game.items.length && game.phase === "auction") { game.phase = "result"; game.finished = true; changed = true; }
    }
  }
  if (room.gameMode === "wavelength") {
    if (!Array.isArray(game.pair) || game.pair.length < 2) { game.pair = ["Wolne", "Szybkie"]; changed = true; }
    if (!game.clues || typeof game.clues !== "object" || Array.isArray(game.clues)) { game.clues = {}; changed = true; }
    const beforeScores = JSON.stringify(game.scores || {});
    game.scores = ensureScoreObject(game.scores, players, 0);
    if (JSON.stringify(game.scores) !== beforeScores) changed = true;
    ["passUses", "proHints"].forEach(key => { if (!game[key] || typeof game[key] !== "object" || Array.isArray(game[key])) { game[key] = {}; changed = true; } });
  }
  if (room.gameMode === "quiz") {
    if (!Array.isArray(game.questionIds)) { game.questionIds = []; changed = true; }
    if (!game.answers || typeof game.answers !== "object" || Array.isArray(game.answers)) { game.answers = {}; changed = true; }
    if (!game.scores || typeof game.scores !== "object" || Array.isArray(game.scores)) { game.scores = Object.fromEntries(players.map(uid => [uid, 0])); changed = true; }
    if (!Array.isArray(game.eliminated)) { game.eliminated = []; changed = true; }
  }
  if (room.gameMode === "pokemon-dex" && game.phase === "result" && Number(game.round) >= Math.max(1, Number(room.settings?.rounds) || 5) && !game.finished) { game.finished = true; changed = true; }
  return changed;
}
function announceRoomRoster(room) {
  if(!room)return;
  const current=new Set(room.players||[]),previous=roomRosterSnapshots.get(room.roomId);
  if(previous){
    if([...current].some(uid=>uid!==state.currentUser&&!previous.has(uid)))Audio.play("playerJoin");
    if([...previous].some(uid=>uid!==state.currentUser&&!current.has(uid)))Audio.play("playerLeave");
  }
  roomRosterSnapshots.set(room.roomId,current);
}
function announceRoomPhase(room) {
  if(!room?.game)return;
  const phase=`${room.status}|${room.game.phase}|${room.game.round||0}|${room.game.turnIndex??""}`,previous=roomPhaseSnapshots.get(room.roomId);
  if(previous&&previous!==phase){
    if(room.game.phase==="voting"||room.game.phase==="continueDecision")Audio.play("vote");
    else if(room.game.phase==="clues"||room.game.phase==="turn")Audio.play("turn");
    else if(["answering","discussion","assigning","revealing","roundSummary"].includes(room.game.phase))Audio.play("phase");
  }
  roomPhaseSnapshots.set(room.roomId,phase);
}
function leaveRoomModal(destination = "lobby") {
  const modal=document.createElement("div");modal.className="modal-backdrop";
  modal.innerHTML=`<section class="modal confirm-modal enter" role="dialog" aria-modal="true" aria-labelledby="leave-title"><div class="modal-title"><div><p class="eyebrow">WYJŚCIE Z POKOJU</p><h2 id="leave-title">Na pewno chcesz wyjść?</h2></div><button class="icon-btn" data-close>${icon("x",18)}</button></div><p class="muted">Opuścisz bieżący pokój. Jeśli trwa gra, pozostali gracze będą mogli kontynuować bez ciebie.</p><div class="modal-actions"><button class="ghost" data-close>Zostań</button><button class="danger" id="confirm-leave-room">Wyjdź z pokoju</button></div></section>`;
  modal.querySelectorAll("[data-close]").forEach(button=>button.addEventListener("click",()=>actions.closeModal(modal)));
  modal.querySelector("#confirm-leave-room").addEventListener("click",()=>{modal.remove();actions.confirmLeaveRoom(destination);});
  document.body.append(modal);Audio.play("modalOpen");
}
function gameInfoModal(modeId) {
  if (modeId === "wavelength") localStorage.setItem("wavelengthTutorialSeen", "1");
  if (modeId === "quiz") localStorage.setItem("quizTutorialSeen", "1");
  const mode = getGameMode(modeId), modal=document.createElement("div");modal.className="modal-backdrop";
  modal.innerHTML=`<section class="modal enter" role="dialog" aria-modal="true"><div class="modal-title"><div><p class="eyebrow">JAK GRAĆ</p><h2>${escapeHtml(mode.name)}</h2></div><button class="icon-btn" data-close>${icon("x",18)}</button></div><ol class="compact-rules">${(mode.help || [mode.description]).map(item=>`<li>${escapeHtml(item)}</li>`).join("")}</ol><div class="modal-actions"><button class="primary" data-close>OK</button></div></section>`;
  modal.querySelectorAll("[data-close]").forEach(button=>button.addEventListener("click",()=>actions.closeModal(modal)));document.body.append(modal);Audio.play("modalOpen");
}
function reportModal(targetUid = "") {
  const room=activeRoom(), mode=getGameMode(room?.gameMode), modal=document.createElement("div");modal.className="modal-backdrop";
  if(!room||!reportableMode(room))return message("W tym trybie nie ma zgłaszania graczy.","info");
  const options=room.players.filter(uid=>uid!==state.currentUser).map(uid=>`<option value="${uid}" ${uid===targetUid?"selected":""}>${escapeHtml(state.accounts[uid]?.nick||room.playerProfiles?.[uid]?.nick||"Gracz")}</option>`).join("");
  modal.innerHTML=`<section class="modal enter" role="dialog" aria-modal="true"><div class="modal-title"><div><p class="eyebrow">ZGŁOSZENIE</p><h2>Zgłoś gracza</h2></div><button class="icon-btn" data-close>${icon("x",18)}</button></div><label>Nick gracza</label><select id="report-target">${options}</select><label>Opis problemu</label><textarea id="report-description" maxlength="700" placeholder="Krótko napisz, co się stało."></textarea><p class="tiny">Zgłoszenie zapisze zgłaszającego, zgłaszanego, datę, tryb gry i opis.</p><div class="modal-actions"><button class="ghost" data-close>Anuluj</button><button class="danger" id="submit-report">Wyślij zgłoszenie</button></div></section>`;
  modal.querySelectorAll("[data-close]").forEach(button=>button.addEventListener("click",()=>actions.closeModal(modal)));
  modal.querySelector("#submit-report").addEventListener("click",async()=>{if(await actions.submitReport(modal.querySelector("#report-target").value,modal.querySelector("#report-description").value))actions.closeModal(modal);});
  document.body.append(modal);Audio.play("modalOpen");
}
async function inboxModal() {
  const user=profile(); if(!user||user.nickOnly)return message("Inbox jest dostępny tylko na koncie.","info");
  const remote=Object.values(await loadInboxForNick(user.nick)); const local=Array.isArray(user.inbox)?user.inbox:[]; const items=[...local,...remote].sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0));
  const modal=document.createElement("div");modal.className="modal-backdrop";
  modal.innerHTML=`<section class="modal enter" role="dialog" aria-modal="true"><div class="modal-title"><div><p class="eyebrow">INBOX</p><h2>Wiadomości konta</h2></div><button class="icon-btn" data-close>${icon("x",18)}</button></div><div class="inbox-list">${items.length?items.map(item=>`<article><b>${escapeHtml(item.subject||"Wiadomość")}</b><small>${item.createdAt?new Date(item.createdAt).toLocaleString("pl-PL"):""}</small><p>${escapeHtml(item.body||item.description||"")}</p></article>`).join(""):'<p class="muted">Inbox jest pusty.</p>'}</div><div class="modal-actions"><button class="primary" data-close>Zamknij</button></div></section>`;
  modal.querySelectorAll("[data-close]").forEach(button=>button.addEventListener("click",()=>actions.closeModal(modal)));document.body.append(modal);Audio.play("modalOpen");
}
function birthDateRequestModal() {
  const modal=document.createElement("div");modal.className="modal-backdrop";
  modal.innerHTML=`<section class="modal enter" role="dialog" aria-modal="true"><div class="modal-title"><div><p class="eyebrow">DATA URODZENIA</p><h2>Prośba do administracji</h2></div><button class="icon-btn" data-close>${icon("x",18)}</button></div><p class="birth-request-notice"><b>Zmiana wymaga akceptacji administracji.</b> Opisz korektę i dołącz dokument potwierdzający datę.</p><label>Co chcesz zmienić?</label><textarea id="birth-request-text" maxlength="700" placeholder="Napisz obecną i poprawną datę oraz krótki powód."></textarea><label>Dokument do weryfikacji</label><input id="birth-request-file" type="file" accept="image/*,.pdf"><p class="tiny">Możesz zamazać wszystko poza datą i elementem potwierdzającym, że dokument nie jest losowym obrazkiem z internetu.</p><div class="modal-actions"><button class="ghost" data-close>Anuluj</button><button class="primary" id="submit-birth-request">Wyślij</button></div></section>`;
  modal.querySelectorAll("[data-close]").forEach(button=>button.addEventListener("click",()=>actions.closeModal(modal)));
  modal.querySelector("#submit-birth-request").addEventListener("click",async()=>{const file=modal.querySelector("#birth-request-file").files[0];if(await actions.requestBirthDateChange(modal.querySelector("#birth-request-text").value,file))actions.closeModal(modal);});
  document.body.append(modal);Audio.play("modalOpen");
}
async function adminPanelModal() {
  if(!isAdminProfile(profile()))return message("Brak dostępu.","error");
  const reports=Object.values(await loadModerationReports()).sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0));
  const bans=Object.values(await loadModerationBans()).sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0));
  const adminModeChecks=gamesList.map(mode=>`<label class="check admin-mode-check"><input type="checkbox" data-admin-ban-mode="${escapeHtml(mode.id)}"> ${escapeHtml(mode.name)}</label>`).join("");
  const modal=document.createElement("div");modal.className="modal-backdrop";
  modal.innerHTML=`<section class="modal admin-modal enter" role="dialog" aria-modal="true"><div class="modal-title"><div><p class="eyebrow">PANEL ADMINA</p><h2>Inbox zgłoszeń</h2></div><button class="icon-btn" data-close>${icon("x",18)}</button></div><div class="admin-grid"><section><h3>Zgłoszenia</h3><div class="inbox-list">${reports.length?reports.map(item=>`<article><b>${escapeHtml(item.reportedNick||item.targetNick||"Gracz")}</b><small>${escapeHtml(item.modeName||item.modeId||"")} · ${item.createdAt?new Date(item.createdAt).toLocaleString("pl-PL"):""}</small><p>${escapeHtml(item.description||"")}</p><button data-admin-reply="${item.id}">Odpowiedz</button></article>`).join(""):'<p class="muted">Brak zgłoszeń.</p>'}</div></section><section><h3>Wiadomość do gracza</h3><label>Nick</label><input id="admin-message-nick" placeholder="nick"><label>Treść</label><textarea id="admin-message-body" maxlength="700"></textarea><button class="primary full" id="admin-send-message">Wyślij</button><h3>Ban</h3><label>Nick</label><input id="admin-ban-nick" placeholder="nick"><label>IP / identyfikator</label><input id="admin-ban-ip" placeholder="opcjonalnie"><label class="check admin-global-check"><input id="admin-ban-global" type="checkbox" checked> Ban globalny na całą stronę</label><label>Tryby gry</label><div class="admin-mode-list" id="admin-ban-mode-list">${adminModeChecks}</div><label>Czas bana</label><select id="admin-ban-duration"><option value="900000">15 minut</option><option value="3600000">1 godzina</option><option value="21600000">6 godzin</option><option value="86400000">1 dzień</option><option value="259200000">3 dni</option><option value="604800000">7 dni</option><option value="2592000000">30 dni</option><option value="0">Na stałe</option></select><label>Powód</label><textarea id="admin-ban-reason" maxlength="500"></textarea><button class="danger full" id="admin-ban-submit">Nadaj bana</button><div class="tiny">Aktywne bany: ${bans.length}</div></section></div></section>`;
  modal.querySelector("#admin-send-message")?.insertAdjacentHTML("afterend", `<section class="admin-mini-panel"><h3>Data urodzenia</h3><label>Nick</label><input id="admin-birth-nick" placeholder="nick gracza"><label>Nowa data</label><input id="admin-birth-date" type="date"><button class="primary full" id="admin-birth-submit">Zapisz date</button></section>`);
  modal.querySelectorAll("[data-close]").forEach(button=>button.addEventListener("click",()=>actions.closeModal(modal)));
  modal.querySelector("#admin-send-message").addEventListener("click",()=>actions.adminSendMessage(modal.querySelector("#admin-message-nick").value,modal.querySelector("#admin-message-body").value));
  modal.querySelector("#admin-birth-submit").addEventListener("click",()=>actions.adminSetBirthDate(modal.querySelector("#admin-birth-nick").value,modal.querySelector("#admin-birth-date").value));
  const syncAdminBanModeList=()=>{const global=modal.querySelector("#admin-ban-global").checked;modal.querySelector("#admin-ban-mode-list").classList.toggle("disabled-mode-list",global);modal.querySelectorAll("[data-admin-ban-mode]").forEach(input=>input.disabled=global);};
  modal.querySelector("#admin-ban-global").addEventListener("change",syncAdminBanModeList);
  syncAdminBanModeList();
  modal.querySelector("#admin-ban-submit").addEventListener("click",()=>actions.adminBanPlayer({ nick:modal.querySelector("#admin-ban-nick").value, ip:modal.querySelector("#admin-ban-ip").value, global:modal.querySelector("#admin-ban-global").checked, modes:[...modal.querySelectorAll("[data-admin-ban-mode]:checked")].map(input=>input.dataset.adminBanMode), duration:Number(modal.querySelector("#admin-ban-duration").value), reason:modal.querySelector("#admin-ban-reason").value }));
  modal.querySelectorAll("[data-admin-reply]").forEach(button=>button.addEventListener("click",()=>{const report=reports.find(item=>item.id===button.dataset.adminReply);if(report){modal.querySelector("#admin-message-nick").value=report.reporterNick||"";modal.querySelector("#admin-message-body").value=`Odpowiedź do zgłoszenia ${report.id}: `;}}));
  document.body.append(modal);Audio.play("modalOpen");
}
function defaultAccount(nick, password, auth = {}, birthDate = "") {
  return { nick, passwordHash:hashRoomPassword(`account:${password}`), authEmail: nickToEmail(nick), authProvider: auth.provider || "local", money: 0, xp:0, claimedLevelRewards:{}, stats:{}, gamePasses:{},
    ownedCosmetics: { defaultNick: true, defaultFrame: true, noAura: true, defaultCandy: true, defaultBomb:true, defaultClock:true, defaultMarker:true, defaultSequence:true }, selectedNickEffect: "defaultNick",
    selectedAvatarFrame: "defaultFrame", selectedAura: "noAura", selectedCandySkin:"defaultCandy", selectedBombSkin:"defaultBomb", selectedClockSkin:"defaultClock", selectedMarkerSkin:"defaultMarker", selectedSequenceSkin:"defaultSequence", selectedBoardLudoSkin:"defaultLudoBoard", selectedBoardMemorySkin:"defaultMemoryBoard", selectedIdleAnimation:"", selectedWinAnimation:"", selectedLoseAnimation:"", potionInventory:{}, honorCounts:{nicePlayer:0,goodOpponent:0,greatHost:0,notVerySmart:0,poorSport:0}, privacy:{historyPublic:true,statsPublic:true,friendsPublic:true}, gameHistory:[], birthDate, adultStatus:adultStatusFor({birthDate}), inbox:[], friends:[], friendRequests:{incoming:{},outgoing:{}}, createdAt: Date.now() };
}
function rankingIntroModal() {
  const key = "ranking_intro_seen_v1";
  if (localStorage.getItem(key)) return;
  localStorage.setItem(key, "1");
  const modal=document.createElement("div");
  modal.className="modal-backdrop";
  modal.innerHTML=`<section class="modal enter" role="dialog" aria-modal="true" aria-labelledby="ranking-intro-title"><div class="modal-title"><div><p class="eyebrow">RANKING</p><h2 id="ranking-intro-title">Jak działa gra?</h2></div><button class="icon-btn" data-close aria-label="Zamknij">${icon("x",18)}</button></div><p class="muted">Ułóż elementy w kolejności, która najlepiej pasuje do całej ekipy. Po rundzie powstaje wspólny ranking, a punkty zależą od podobieństwa twojej listy.</p><div class="modal-actions"><button class="primary" data-close>Rozumiem</button><button class="ghost" id="ranking-intro-hide">Nie pokazuj ponownie</button></div></section>`;
  const close=()=>{modal.remove();Audio.play("modalClose");};
  modal.querySelectorAll("[data-close]").forEach(button=>button.addEventListener("click",close));
  modal.querySelector("#ranking-intro-hide").addEventListener("click",close);
  document.body.append(modal);Audio.play("modalOpen");
}

function friendRequests(account) { return { incoming:{}, outgoing:{}, ...(account?.friendRequests || {}) }; }
function friendRequestKey(type, fromUid, toUid) { return `${type}_${fromUid}_${toUid}`.replace(/[.#$\[\]/]/g, "_"); }
function friendDirectorySnapshot() { return { ...friendDirectory, ...Object.fromEntries(Object.entries(state.accounts).map(([uid,account])=>[uid,uid===state.currentUser?account:directoryProfile(account)])) }; }
function friendRooms() { return state.rooms.map(room=>{const mode=getGameMode(room.gameMode);return {...room,modeName:mode.name,maxPlayers:room.maxPlayers||mode.maxPlayers||8};}); }
function persistFriendAccount(uid) { const account=state.accounts[uid]; if(!account)return false; account.friendRequests=friendRequests(account); account.friends=Array.isArray(account.friends)?account.friends:[]; saveAccounts(state.accounts); if(uid===state.currentUser)syncPlayerProfile(uid,account); return true; }
async function pushFriendRequest(targetUid, request) { const remoteBucket=await loadFriendRequestBucket(targetUid); const duplicate=Object.values(remoteBucket||{}).find(item=>!item.status&&item.type===request.type&&item.fromUid===request.fromUid&&item.id!==request.id); if(duplicate)return false; const localTarget=state.accounts[targetUid]; if(localTarget){const localRequests=friendRequests(localTarget);localRequests.incoming={...(localRequests.incoming||{}),[request.id]:request};localTarget.friendRequests=localRequests;persistFriendAccount(targetUid);} const saved=await setFriendRequest(targetUid,request); return hasOnlineBackend() ? saved : true; }
async function refreshFriendDirectory() { const remote=await loadPublicProfiles(); const local=Object.fromEntries(Object.entries(state.accounts).map(([uid,account])=>[uid,uid===state.currentUser?account:directoryProfile(account)])); friendDirectory={...remote,...local}; return friendDirectory; }
async function searchFriends(nick) { await refreshFriendDirectory(); const needle=normalizeNick(nick); if(!needle)return []; return Object.entries(friendDirectory).filter(([uid,item])=>uid!==state.currentUser&&normalizeNick(item?.nick).includes(needle)).slice(0,12).map(([uid,item])=>({uid,...item})); }
async function sendFriendRequest(targetUid) {
  const account=profile(), target=friendDirectory[targetUid]||state.accounts[targetUid]; if(!account||!target||targetUid===state.currentUser)return false;
  const requests=friendRequests(account); if((account.friends||[]).includes(targetUid)||Object.values(requests.outgoing).some(item=>item.toUid===targetUid))return message("To zaproszenie już istnieje.","info");
  const request={id:friendRequestKey("friend",state.currentUser,targetUid),type:"friend",fromUid:state.currentUser,fromNick:account.nick,toUid:targetUid,toNick:target.nick,createdAt:Date.now()}; requests.outgoing[request.id]=request; account.friendRequests=requests; persistFriendAccount(state.currentUser); const sent=await pushFriendRequest(targetUid,request); if(!sent){delete requests.outgoing[request.id];account.friendRequests=requests;persistFriendAccount(state.currentUser);return message("To zaproszenie już istnieje.","info");} message("Zaproszenie wysłane.","info"); return true;
}
async function acceptFriendRequest(requestId) { const account=profile(), request=friendRequests(account).incoming[requestId]; if(!request)return false; const incoming=friendRequests(account); delete incoming.incoming[requestId]; account.friends=[...new Set([...(account.friends||[]),request.fromUid])]; account.friendRequests=incoming; persistFriendAccount(state.currentUser); await updateFriendRequest(state.currentUser,requestId,{status:"accepted",updatedAt:Date.now()}); message("Dodano do znajomych.","info"); return true; }
async function rejectFriendRequest(requestId) { const account=profile(), request=friendRequests(account).incoming[requestId]; if(!request)return false; const next=friendRequests(account);delete next.incoming[requestId];account.friendRequests=next;persistFriendAccount(state.currentUser);await updateFriendRequest(state.currentUser,requestId,{status:"rejected",updatedAt:Date.now()});return true; }
async function cancelFriendRequest(requestId) { const account=profile(), request=friendRequests(account).outgoing[requestId];if(!request)return false;const next=friendRequests(account);delete next.outgoing[requestId];account.friendRequests=next;persistFriendAccount(state.currentUser);await updateFriendRequest(request.toUid,requestId,{status:"cancelled",updatedAt:Date.now()});return true; }
async function inviteFriend(targetUid) { const room=activeRoom(), account=profile(), target=friendDirectory[targetUid];if(!room||!account||!target)return false;const request={id:friendRequestKey("gameInvite",state.currentUser,targetUid),type:"gameInvite",fromUid:state.currentUser,fromNick:account.nick,toUid:targetUid,toNick:target.nick,roomId:room.roomId,gameMode:room.gameMode,modeName:getGameMode(room.gameMode).name,players:`${room.players.length}/${getGameMode(room.gameMode).maxPlayers}`,createdAt:Date.now()};if(!await pushFriendRequest(targetUid,request))return message("To zaproszenie do tego lobby już istnieje.","info");message("Zaproszenie do gry wysłane.","info");return true; }
async function requestJoinFriend(targetUid, room) { const account=profile(),target=friendDirectory[targetUid];if(!account||!target||!room)return false;const request={id:friendRequestKey("joinRequest",state.currentUser,targetUid),type:"joinRequest",fromUid:state.currentUser,fromNick:account.nick,toUid:targetUid,toNick:target.nick,roomId:room.roomId,gameMode:room.gameMode,modeName:getGameMode(room.gameMode).name,players:`${room.players.length}/${getGameMode(room.gameMode).maxPlayers}`,createdAt:Date.now()};if(!await pushFriendRequest(targetUid,request))return message("Prośba do tego lobby już istnieje.","info");message("Prośba o dołączenie wysłana.","info");return true;}
async function acceptGameInvite(request) { if(!request)return false;const next=friendRequests(profile());delete next.incoming[request.id];profile().friendRequests=next;persistFriendAccount(state.currentUser);await updateFriendRequest(state.currentUser,request.id,{status:"accepted",updatedAt:Date.now()});return actions.joinRoom(request.roomId,"",{fromInvite:true,inviteMode:request.gameMode}); }
async function acceptJoinRequest(requestId) { const account=profile(), request=friendRequests(account).incoming[requestId];if(!request)return false;const next=friendRequests(account);delete next.incoming[requestId];account.friendRequests=next;persistFriendAccount(state.currentUser);await updateFriendRequest(state.currentUser,requestId,{status:"accepted",updatedAt:Date.now()});await pushFriendRequest(request.fromUid,{...request,id:friendRequestKey("gameInvite",state.currentUser,request.fromUid),type:"gameInvite",fromUid:state.currentUser,fromNick:account.nick,toUid:request.fromUid,toNick:request.fromNick,modeName:getGameMode(request.gameMode).name,message:"Prośba zaakceptowana."});message("Prośba zaakceptowana.","info");return true; }
async function refreshFriendsData() { await checkFriendNotifications(); friendPresence=await loadPresenceUsers(); return true; }

function animateHostSettingChange(value) {
  const control = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const isHostControl = control && Array.from(control.attributes).some(attribute => attribute.name.startsWith("data-") && (attribute.name.endsWith("-setting") || attribute.name.endsWith("-category") || attribute.name.endsWith("-generation")));
  if (isHostControl) {
    control.classList.remove("host-setting-updated");
    void control.offsetWidth;
    control.classList.add("host-setting-updated");
    window.setTimeout(() => control.classList.remove("host-setting-updated"), 420);
  }
  const selected = control?.type === "checkbox" ? control.checked : value;
  Audio.play(typeof selected === "boolean" ? (selected ? "toggleOn" : "toggleOff") : "choice");
  lastRenderedScreenSignature = currentScreenSignature();
}

let topbarModalRequest = 0;
let topbarModalPendingId = "";
function dismissTopbarModal(modal) {
  const closeButton = modal?.querySelector("[data-close], [data-friends-close]");
  if (closeButton) closeButton.click();
  else { modal?.remove(); Audio.play("modalClose"); }
}
function beginTopbarModal(id) {
  if (topbarModalPendingId === id && !document.querySelector(`.modal-backdrop[data-topbar-modal="${id}"]`)) {
    topbarModalPendingId = "";
    topbarModalRequest += 1;
    return null;
  }
  const current = document.querySelector(".modal-backdrop[data-topbar-modal]");
  if (current?.dataset.topbarModal === id) {
    dismissTopbarModal(current);
    topbarModalPendingId = "";
    topbarModalRequest += 1;
    return null;
  }
  document.querySelectorAll(".modal-backdrop").forEach(modal => {
    dismissTopbarModal(modal);
  });
  topbarModalPendingId = id;
  return ++topbarModalRequest;
}
function finishTopbarModal(modal, id, request = topbarModalRequest) {
  topbarModalPendingId = "";
  if (!modal || request !== topbarModalRequest) {
    dismissTopbarModal(modal);
    return null;
  }
  modal.dataset.topbarModal = id;
  return modal;
}

  const actions = {
  playSound(name) { Audio.play(name); },
  toggleTheme() { const next = lightThemeEnabled() ? "dark" : "light"; localStorage.setItem(THEME_STORAGE_KEY, next); applyTheme(next); render({forceEnter:true}); },
  openSettings() { const request=beginTopbarModal("open-settings"); if (!request) return; finishTopbarModal(settingsModal(), "open-settings", request); },
  refresh: render,
  goPlatform() { document.querySelectorAll(".modal-backdrop").forEach(dismissTopbarModal); if(activeRoom())return actions.leaveRoom("platform");setUrlRoute("", "");Router.go("platform"); },
  goPokemonModes() { if(activeRoom())return actions.leaveRoom("platform");try { const url=new URL(window.location.href);url.pathname="/pokemony";url.search="";window.history.pushState(null,"",url); } catch {} Router.go("pokemon-select"); },
  goBoardModes() { if(activeRoom())return actions.leaveRoom("platform");try { const url=new URL(window.location.href);url.pathname="/planszowki";url.search="";window.history.pushState(null,"",url); } catch {} Router.go("board-select"); },
  goPublicPage(path) { const screen=Router.publicScreenFromPath(path); if(!screen)return actions.goPlatform(); window.history.pushState(null,"",path); Router.go(screen); },
  goLobby() { setModeUrl(state.selectedGameMode); Router.go("lobby"); },
  goHome() { const destination=state.shopReturnScreen||"platform";state.shopReturnScreen=null;Router.go(destination); },
  openShop() { document.querySelectorAll(".modal-backdrop").forEach(dismissTopbarModal); const room=activeRoom();state.shopReturnScreen=room?(room.status==="lobby"?"room":"game"):(Router.current==="shop"?state.shopReturnScreen:Router.current);Audio.play("shopOpen");Router.go("shop"); },
  async openFriends(options={}) { await refreshFriendsData(); friendsModal({ ...options, account:profile(), directory:friendDirectorySnapshot(), rooms:friendRooms(), presence:friendPresence, actions:{...actions, getAccount:()=>profile(), getFriendDirectory:()=>friendDirectorySnapshot(), getRooms:friendRooms, getPresence:()=>friendPresence, refreshFriendsData} }); },
  getAccount:()=>profile(), getFriendDirectory:()=>friendDirectorySnapshot(), getRooms:friendRooms, getPresence:()=>friendPresence,
  searchFriends, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, cancelFriendRequest, inviteFriend, requestJoinFriend, acceptGameInvite, acceptJoinRequest,
  joinByCode(roomId,password="") {
    const code=String(roomId||"").trim().toUpperCase();
    if(!code)return message("Wpisz kod pokoju.");
    if(!profile()){state.pendingJoin={roomId:code,password};return actions.openAuth({title:"Zaloguj się, aby dołączyć do pokoju",description:"Po logowaniu od razu przeniesiemy cię do właściwej gry."});}
    actions.joinRoom(code,password);
  },
  async joinRandomRoom(modeIds=[]){if(!profile()){state.afterLogin="platform";return actions.openAuth({title:"Zaloguj się, aby dołączyć do pokoju"});}const allowed=new Set(modeIds);const candidates=state.rooms.filter(room=>!room.isPrivate&&room.status==="lobby"&&allowed.has(room.gameMode)).filter(room=>{const mode=getGameMode(room.gameMode),capacity=Math.max(mode.minPlayers,Math.min(mode.maxPlayers,Number(room.maxPlayers)||mode.maxPlayers));return (room.players?.length||0)>0&&(room.players?.length||0)<capacity&&!isModeLocked(mode.id);});if(!candidates.length){message("Nie znaleziono pasującego publicznego pokoju.","info");return false;}const maxPlayers=Math.max(...candidates.map(room=>room.players.length));const preferred=candidates.filter(room=>room.players.length===maxPlayers);const room=preferred[Math.floor(Math.random()*preferred.length)];return actions.joinRoom(room.roomId);},
  async selectGame(gameMode) {
    const mode=getGameMode(gameMode);
    if (isModeLocked(mode.id)) return message(lockedModeMessage(mode), "info");
    state.selectedGameMode = gameMode;persistSession();setModeUrl(gameMode);
    if (mode.id === "quiz") { if (!profile()) { state.afterLogin = "quiz-select"; return actions.openAuth({ title:"Zaloguj się, aby zagrać w Quiz" }); } return Router.go("quiz-select"); }
    if (mode.supportsSolo && !mode.supportsLobby) return withAdultWarning(mode,()=>Router.go("solo"),Boolean(mode.adult));
    if (!profile()) { state.afterLogin = "lobby"; return actions.openAuth({ title: `Zaloguj się, aby zagrać w ${getGameMode(gameMode).name}` }); }
    if(await guardBan(gameMode))return;
    Router.go("lobby");
  },
  selectSoloGame(gameMode = "popularnosc-solo") {
    const mode = getGameMode(gameMode);
    if (isModeLocked(mode.id)) return message(lockedModeMessage(mode), "info");
    state.selectedGameMode = mode.id; persistSession(); setModeUrl(mode.id); Router.go("solo");
  },
  chooseQuizVariant(variant){state.quizVariant=variant==="competitive"?"competitive":"casual";state.selectedGameMode="quiz";session.quizVariant=state.quizVariant;persistSession();if(state.quizVariant==="competitive")return actions.findQuizMatch();Router.go("lobby");},
  async findQuizMatch(){if(!profile())return actions.openAuth({title:"Zaloguj się, aby zagrać w Quiz"});state.selectedGameMode="quiz";const room=state.rooms.find(item=>item.gameMode==="quiz"&&item.status==="lobby"&&item.settings?.quizVariant==="competitive"&&(item.players?.length||0)<4);if(room)return actions.joinRoom(room.roomId);return actions.createRoom({name:"Quiz · Rywalizacja",isPrivate:false,password:"",settings:{...getGameMode("quiz").defaultSettings,quizVariant:"competitive"}});},
  confirmAdultSolo(onConfirm) { return withAdultWarning(getGameMode("co-wolisz"), onConfirm, true); },
  roomHasNonAdultPlayer,
  openAuth(options = {}) {
    const modal = authModal(actions, options); document.body.append(modal); Audio.play("modalOpen");
  },
  openAccount() {
    if (!profile()) return actions.openAuth({ title: "Zaloguj się lub utwórz konto", description: "Konto zapisuje coiny, kosmetyki i efekty nicku." });
    const userId=state.currentUser,initial=profile(),modal=accountModal(initial,actions); document.body.append(modal); Audio.play("modalOpen");
    if (!initial.nickOnly) loadHonorCounts(userId).then(honors => {
      if (!modal.isConnected || !honors) return;
      const account=profile(); if (!account) return;
      const honor={nicePlayer:0,goodOpponent:0,greatHost:0,notVerySmart:0,poorSport:0,...(account.honorCounts||{})};
      Object.keys(honor).forEach(type => { honor[type]=Math.max(Number(honor[type])||0,Number(honors[type])||0); });
      account.honorCounts=honor; state.accounts[userId]=account; saveAccounts(state.accounts);
      const summary=modal.querySelector(".honor-summary"),values=[honor.nicePlayer,honor.goodOpponent,honor.greatHost,honor.notVerySmart,honor.poorSport];
      if (summary) { summary.querySelector(".badge").textContent=String(values.reduce((sum,value)=>sum+value,0)); summary.querySelectorAll(".honor-count strong").forEach((element,index)=>{ element.textContent=String(values[index]||0); }); }
    }).catch(() => {});
  },
  async openPlayerProfile(targetUid) {
    const room=activeRoom();
    if (!room || !targetUid || !(room.players||[]).includes(targetUid)) return false;
    const initial={...(room.playerProfiles?.[targetUid]||{}),...(state.accounts[targetUid]||{}),uid:targetUid};
    const modal=publicProfileModal(directoryProfile(initial),actions.closeModal);
    document.body.append(modal); Audio.play("modalOpen");
    if (isBotId(targetUid) || targetUid === state.currentUser) return true;
    const [remote,honors]=await Promise.all([loadRemoteProfile(targetUid),loadHonorCounts(targetUid)]);
    if (!modal.isConnected) return true;
    const merged={...initial,...(remote||{}),honorCounts:honors && typeof honors === "object" ? honors : (remote?.honorCounts||initial.honorCounts)};
    const safe=directoryProfile(merged);
    const content=modal.querySelector("[data-public-profile-content]");
    if (content) content.innerHTML=publicProfileContent(safe);
    return true;
  },
  openLuckySpin() {
    if (!profile()) return actions.openAuth({ title:"Zaloguj się, aby odebrać nagrody", description:"Lucky Spin zapisuje darmowy spin i nagrodę na serwerze." });
    const modal = luckySpinModal({
      profile:profile(),
      claimSpin:actions.claimLuckySpin,
      closeAction:actions.closeModal,
      onProfileUpdated:updated => { state.accounts[state.currentUser] = { ...state.accounts[state.currentUser], ...updated, updatedAt:Date.now() }; saveAccounts(state.accounts); render({ preserveDrafts:true }); },
    });
    document.body.append(modal); Audio.play("modalOpen");
  },
  async claimLuckySpin() {
    if (!state.currentUser) return { ok:false, error:"Zaloguj się, aby zakręcić kołem." };
    const remote = await claimLuckySpinRemote(state.currentUser);
    if (remote?.ok) return remote;
    // Firebase callable functions require a paid Blaze project. Keep the game
    // usable on the free setup while preserving the server path when it exists.
    const backendUnavailable = !remote?.code || ["functions/internal", "functions/not-found", "functions/unavailable"].includes(remote.code);
    if (!backendUnavailable) return remote;
    const local = drawLocalLuckySpin(profile(), serverNow());
    if (!local.ok) return local;
    const claim = await claimLuckySpinDatabase(state.currentUser, { claimId:uid("spin"), lastSpinAt:local.profile.luckySpin.lastSpinAt, windowStartedAt:local.profile.luckySpin.windowStartedAt, nextSpinAt:local.nextSpinAt, spinsUsed:local.spinsUsed, spinLimit:local.spinLimit, reward:local.reward });
    if (claim?.ok === false) return claim;
    // Keep the server profile in sync before the freshly won potion can be
    // consumed from the equipment modal.
    const syncedProfile = { ...local.profile, updatedAt:Date.now() };
    await syncPlayerProfile(state.currentUser, syncedProfile);
    updateProfile(syncedProfile);
    return { ...local, profile:syncedProfile };
  },
  openEquipment() {
    if (!profile()) return actions.openAuth({ title:"Zaloguj się, aby otworzyć ekwipunek", description:"Ekwipunek zapisuje zdobyte potki i aktywne boosty na Twoim profilu." });
    const renderEquipment = account => equipmentModal(account, actions.closeModal, itemId => actions.usePotion(itemId));
    const modal = renderEquipment(profile());
    document.body.append(modal); Audio.play("wardrobeOpen");
    if (hasOnlineBackend() && !profile()?.nickOnly) {
      loadRemoteProfile(state.currentUser).then(remote => {
        if (!remote || !modal.isConnected) return;
        const freshProfile = { ...state.accounts[state.currentUser], ...remote, potionInventory:normalizePotionInventory(remote.potionInventory) };
        state.accounts[state.currentUser] = freshProfile;
        saveAccounts(state.accounts);
        modal.replaceWith(renderEquipment(freshProfile));
      }).catch(() => {});
    }
  },
  openHonor(room = activeRoom()) {
    if (!room || !state.currentUser || !(room.players || []).includes(state.currentUser)) return false;
    const modal = honorModal({ room, accounts:state.accounts, currentUser:state.currentUser, submitHonor:actions.submitHonor, closeAction:actions.closeModal });
    document.body.append(modal); Audio.play("modalOpen");
    return true;
  },
  async submitHonor(payload) {
    if (!payload?.targetUid || String(payload.targetUid).startsWith("bot:")) return { ok:false, error:"Botów nie można wyróżniać." };
    const result = await submitHonorRemote(payload);
    if (result?.ok && state.accounts[payload.targetUid]) {
      const target = state.accounts[payload.targetUid];
      target.honorCounts={nicePlayer:0,goodOpponent:0,greatHost:0,notVerySmart:0,poorSport:0,...(target.honorCounts||{}),[payload.type]:(Number(target.honorCounts?.[payload.type])||0)+1};
      saveAccounts(state.accounts);
    }
    return result;
  },
  quickReact(reactionId, useChat = false) {
    const reaction = QUICK_REACTIONS.find(item => item.id === reactionId), room = activeRoom();
    if (!reaction || !room?.game || !state.currentUser) return false;
    const result = mutateRoomGame(game => {
      game.quickReactions = game.quickReactions && typeof game.quickReactions === "object" && !Array.isArray(game.quickReactions) ? game.quickReactions : {};
      game.quickReactionCooldowns = game.quickReactionCooldowns && typeof game.quickReactionCooldowns === "object" ? game.quickReactionCooldowns : {};
      const now = Date.now();
      if (Number(game.quickReactionCooldowns[state.currentUser] || 0) > now) return "Reakcja jest chwilowo niedostępna.";
      game.quickReactionCooldowns[state.currentUser] = now + 2000;
      game.quickReactions[state.currentUser] = { id:reaction.id, text:reaction.text, expiresAt:now + 2200 };
      if (useChat && Array.isArray(game.chat)) game.chat.push({ uid:state.currentUser, text:reaction.text, reaction:true, createdAt:now });
    }, { sound:"notification" });
    window.setTimeout(() => { if (Router.current === "game" && activeRoom()?.roomId === room.roomId) render({ preserveDrafts:true }); }, 2300);
    return result;
  },
  sendHostAnnouncement(announcementId) {
    const room = activeRoom(), announcement = HOST_ANNOUNCEMENTS.find(item => item.id === announcementId);
    if (!room || !announcement || room.status !== "lobby" || room.hostUid !== state.currentUser) return false;
    const now = serverNow();
    if (Number(room.hostAnnouncement?.cooldownUntil || 0) > now) return message("Następny komunikat będzie dostępny za chwilę.", "info");
    room.hostAnnouncement = { id:announcement.id, text:announcement.text, hostUid:state.currentUser, createdAt:now, expiresAt:now + 4800, cooldownUntil:now + 10000 };
    addRoomActivity(room, `Host: ${announcement.text}`);
    touchRoom(room); Audio.play("notification"); render();
    return true;
  },
  async usePotion(itemId) {
    if (!state.currentUser) return { ok:false, error:"Zaloguj się, aby użyć potki." };
    let result = await usePotionRemote(itemId);
    const online = hasOnlineBackend();
    const localQuantity = Number(profile()?.potionInventory?.[itemId]) || 0;
    const isMissingPotion = value => ["failed-precondition", "functions/failed-precondition"].includes(String(value?.code || ""));
    const refreshRemotePotionInventory = async () => {
      const remote = await loadRemoteProfile(state.currentUser);
      if (!remote) return profile();
      state.accounts[state.currentUser] = { ...state.accounts[state.currentUser], potionInventory:normalizePotionInventory(remote.potionInventory) };
      saveAccounts(state.accounts);
      return profile();
    };
    // Firebase is the source of truth. If an old local cache shows a potion
    // that the server no longer has, refresh only the inventory instead of
    // writing stale local data back over the current profile.
    if (!result?.ok && online && localQuantity > 0 && isMissingPotion(result)) {
      await refreshRemotePotionInventory();
      result = await usePotionRemote(itemId);
    }
    const backendUnavailable = !result?.code || ["functions/internal", "functions/not-found", "functions/unavailable", "internal", "not-found", "unavailable"].includes(String(result.code));
    if (!result?.ok && (backendUnavailable || isMissingPotion(result)) && online) {
      result = await usePotionDatabase(state.currentUser, itemId);
      // Do not re-upload a stale local inventory after a failed server check.
      if (!result?.ok && isMissingPotion(result) && Number(profile()?.potionInventory?.[itemId]) > 0) {
        await refreshRemotePotionInventory();
        result = await usePotionDatabase(state.currentUser, itemId);
      }
    }
    if (!result?.ok && !online) {
      const item = equipmentById[itemId], user = profile(), quantity = Number(user?.potionInventory?.[itemId]) || 0;
      if (!item) result = { ok:false, error:"Nieprawidłowa potka." };
      else if (quantity < 1) result = { ok:false, error:"Nie masz tej potki w ekwipunku." };
      else {
        const now = Date.now(), key = item.effect === "xp" ? "xpBooster" : "coinBooster", current = user[key] || {};
        result = { ok:true, message:`Użyto potki ${item.name}. Boost jest aktywny.`, profile:{ ...user, potionInventory:{ ...(user.potionInventory || {}), [itemId]:quantity - 1 }, [key]:{ multiplier:Math.max(Number(current.multiplier) || 1, item.multiplier), expiresAt:Math.max(Number(current.expiresAt) || 0, now + item.durationMs) } } };
      }
    }
    if (result?.ok && result.profile) {
      state.accounts[state.currentUser] = { ...state.accounts[state.currentUser], ...result.profile, potionInventory:normalizePotionInventory(result.profile.potionInventory), updatedAt:Date.now() };
      saveAccounts(state.accounts); render({ preserveDrafts:true });
      message(result.message || "Potka została użyta.", "info");
    } else if (!result?.ok) message(result?.error || "Nie udało się użyć potki. Spróbuj ponownie.");
    return result;
  },
  setProfilePrivacy(key, value) {
    const allowed = new Set(["historyPublic", "statsPublic", "friendsPublic"]), user = profile();
    if (!user || !allowed.has(key)) return false;
    updateProfile({ privacy:{ historyPublic:true, statsPublic:true, friendsPublic:true, ...(user.privacy || {}), [key]:Boolean(value) } });
    message(`${key === "historyPublic" ? "Historia gier" : key === "statsPublic" ? "Statystyki" : "Lista znajomych"}: ${value ? "publiczne" : "prywatne"}.`, "info");
    return true;
  },
  openProgression() { const user=profile(); if(user){ if(user.questSeenKey!==questNotificationKey()){ user.questSeenKey=questNotificationKey(); syncPlayerProfile(state.currentUser,user); saveAccounts(state.accounts); document.querySelector(".level-progress-button .quest-ready-badge")?.remove(); } const modal=progressionModal(user,actions.closeModal,actions.claimQuestRewards);document.body.append(modal);Audio.play("modalOpen");} },
  claimQuestRewards(modal) {
    const user=profile();if(!user)return;
    const result=claimCompletedQuestRewards(user);
    if(!result.completed.length)return;
    state.accounts[state.currentUser]={...result.profile,updatedAt:Date.now()};
    syncPlayerProfile(state.currentUser,state.accounts[state.currentUser]);saveAccounts(state.accounts);actions.closeModal(modal);Audio.play("questClaim");message(`Odebrano ${result.completed.length} questow.`,"info");render();
  },
  showGameInfo(modeId){ gameInfoModal(modeId); },
  showRankingIntro(){ rankingIntroModal(); },
  openReportModal(targetUid=""){ Audio.play("report");reportModal(targetUid); },
  openInbox(){ Audio.play("inbox");inboxModal(); },
  openBirthDateRequest(){ birthDateRequestModal(); },
  openAdminPanel(){ adminPanelModal(); },
  async login(nick, password, mode, birthDate = "") {
    const clean = normalizeNick(nick || (mode==="nickOnly"?randomGuestNick():""));
    if (!clean) { message("Nick może mieć tylko litery, cyfry i _."); return false; }
    if (mode === "nickOnly") {
      try {
        const auth=await authenticateGuest(),guestId=auth.uid; state.accounts[guestId] = { ...defaultAccount(clean, "",auth), nickOnly: true, sessionMoney: 0, sessionXp:0 };
        state.currentUser = guestId;saveAccounts(state.accounts);persistSession();refreshPresence();connectRooms();actions.finishLogin(); return true;
      } catch { message("Nie udało się uruchomić gry po nicku. Sprawdź czy Anonymous Auth jest włączone."); return false; }
    }
    if (!password || password.length < 3) { message("Hasło musi mieć minimum 3 znaki."); return false; }
    try {
      const existingEntry = accountByNick(clean), existing = existingEntry?.[1];
      const auth = await authenticateNick(clean, password);
      const accountId = auth.uid;
      const remote=await loadRemoteProfile(accountId), isNewAccount=!remote&&!existing;
      if(!existing?.birthDate && !remote?.birthDate && !birthDate) { message("Podaj datę urodzenia dla konta."); return false; }
       state.accounts[accountId] = { ...defaultAccount(clean,password,auth,birthDate), ...(existing||{}), ...(remote||{}), birthDate:remote?.birthDate || existing?.birthDate || birthDate, inbox:Array.isArray(remote?.inbox)?remote.inbox:(Array.isArray(existing?.inbox)?existing.inbox:[]), passwordHash:hashRoomPassword(`account:${password}`) }; state.accounts[accountId].ownedCosmetics={defaultNick:true,defaultFrame:true,noAura:true,defaultCandy:true,defaultBomb:true,defaultClock:true,defaultMarker:true,defaultSequence:true,...(state.accounts[accountId].ownedCosmetics||{})}; state.accounts[accountId].gamePasses={...(state.accounts[accountId].gamePasses||{})}; state.accounts[accountId].potionInventory=remote ? normalizePotionInventory(remote.potionInventory) : normalizePotionInventory(state.accounts[accountId].potionInventory); state.accounts[accountId].privacy={historyPublic:true,statsPublic:true,friendsPublic:true,...(state.accounts[accountId].privacy||{})}; state.accounts[accountId].gameHistory=Array.isArray(state.accounts[accountId].gameHistory)?state.accounts[accountId].gameHistory:[]; state.accounts[accountId].selectedNickEffect ||= "defaultNick"; state.accounts[accountId].selectedAvatarFrame ||= "defaultFrame"; state.accounts[accountId].selectedAura ||= "noAura"; state.accounts[accountId].selectedCandySkin ||= "defaultCandy"; state.accounts[accountId].selectedBombSkin ||= "defaultBomb"; state.accounts[accountId].selectedClockSkin ||= "defaultClock"; state.accounts[accountId].selectedMarkerSkin ||= "defaultMarker"; state.accounts[accountId].selectedSequenceSkin ||= "defaultSequence"; state.accounts[accountId].selectedBoardLudoSkin ||= "defaultLudoBoard"; state.accounts[accountId].selectedBoardMemorySkin ||= "defaultMemoryBoard"; state.accounts[accountId].selectedIdleAnimation ||= ""; state.accounts[accountId].selectedWinAnimation ||= ""; state.accounts[accountId].selectedLoseAnimation ||= ""; state.accounts[accountId].adultStatus=adultStatusFor(state.accounts[accountId]); delete state.accounts[accountId].password;
      if(isNewAccount) trackSiteEvent({ type:"userRegistered", eventId:`user:${accountId}` });
      const ban = await activeBanFor(state.accounts[accountId]);
      if(ban){message(`Konto jest zbanowane. Powód: ${ban.reason || "brak"}`);return false;}
      if(existingEntry?.[0]&&existingEntry[0]!==accountId)delete state.accounts[existingEntry[0]];
      state.currentUser = accountId; saveAccounts(state.accounts);persistSession(); syncPlayerProfile(accountId,state.accounts[accountId]);refreshPresence();connectRooms();Audio.play("success"); actions.finishLogin(); return true;
    } catch { message("Nie udało się zalogować. Spróbuj ponownie."); return false; }
  },
  finishLogin() { if(state.pendingInviteRoom)return handlePendingInvite();if(state.pendingJoin){const pending=state.pendingJoin;state.pendingJoin=null;return actions.joinRoom(pending.roomId,pending.password);}const destination = state.afterLogin || "platform"; state.afterLogin = null; if(destination==="lobby")setModeUrl(state.selectedGameMode); Router.go(destination); },
  async logout() {
    const roomUpdates=state.rooms.filter(room => room.players.includes(state.currentUser)).map(room => {
      interruptProveRoundForDeparture(room,state.currentUser);
      room.players = room.players.filter(id => id !== state.currentUser);
      if(room.playerProfiles)delete room.playerProfiles[state.currentUser];
      if (room.hostUid === state.currentUser) room.hostUid = room.players.find(uid=>!isBotId(uid))||room.players[0];
      if(!roomHasHumanPlayers(room))return removeRemoteRoom(room.roomId);
      if(shouldCloseLonelyFinishedRoom(room)){room.updatedAt=Math.max(Date.now(),Number(room.updatedAt||0)+1);return syncRoomState(room);}
      room.updatedAt=Math.max(Date.now(),Number(room.updatedAt||0)+1);
      return syncRoomState(room);
    });
    await Promise.allSettled(roomUpdates);
    state.rooms = state.rooms.filter(room => roomHasHumanPlayers(room));
    stopFriendRequestsSubscription(); stopFriendRequestsSubscription=()=>{};
    await logoutAuth();
    state.currentUser = null; state.activeRoomId = null;clearPendingInvite({clearUrl:true});clearSession();refreshPresence(); Router.go("platform");
  },
  async submitReport(targetUid, description) {
    const room=activeRoom(), reporter=profile(); if(!room||!reporter||!reportableMode(room))return false;
    const text=String(description||"").trim(); if(text.length<6){message("Opisz krótko problem.");return false;}
    const target=state.accounts[targetUid]||room.playerProfiles?.[targetUid]||{};
    await submitModerationReport({ reporterUid:state.currentUser, reporterNick:reporter.nick, reportedUid:targetUid, reportedNick:target.nick || "Gracz", modeId:room.gameMode, modeName:getGameMode(room.gameMode).name, roomId:room.roomId, description:text });
    message("Zgłoszenie wysłane.","info"); return true;
  },
  async requestBirthDateChange(text, file) {
    const user=profile(); if(!user||user.nickOnly)return false;
    const body=String(text||"").trim(); if(body.length<8){message("Napisz, co chcesz zmienić.");return false;}
    if(!file){message("Dołącz plik do weryfikacji.");return false;}
    if(file.size>5*1024*1024){message("Plik jest za duży. Maksymalnie 5 MB.");return false;}
    await submitModerationReport({ type:"birthDateChange", reporterUid:state.currentUser, reporterNick:user.nick, reportedUid:state.currentUser, reportedNick:user.nick, modeId:"account", modeName:"Konto", description:body, document:{ name:file.name, type:file.type, size:file.size } });
    user.inbox=[...(user.inbox||[]),{id:uid("MSG"),subject:"Prośba wysłana",body:"Prośba o zmianę daty urodzenia trafiła do administracji.",createdAt:Date.now()}];saveAccounts(state.accounts);syncPlayerProfile(state.currentUser,user);message("Prośba wysłana do administracji.","info");return true;
  },
  setOwnBirthDate(value) {
    const user=profile(), birthDate=validBirthDate(value);
    if(!user||user.nickOnly)return false;
    if(user.birthDate)return message("Data urodzenia jest juz ustawiona. Zmiana wymaga administracji.","info");
    if(!birthDate)return message("Podaj poprawna date urodzenia.");
    updateProfile({ birthDate, adultStatus:adultStatusFor({ birthDate }) });
    message("Data urodzenia zapisana.","info");
    return true;
  },
  async adminSendMessage(nick, body) {
    if(!isAdminProfile(profile()))return message("Brak dostępu.");
    const clean=normalizeNick(nick), text=String(body||"").trim(); if(!clean||text.length<2)return message("Podaj nick i treść.");
    await sendInboxMessageToNick(clean,{fromNick:profile().nick,subject:"Wiadomość od administracji",body:text});
    const entry=accountByNick(clean); if(entry){entry[1].inbox=[...(entry[1].inbox||[]),{id:uid("MSG"),fromNick:profile().nick,subject:"Wiadomość od administracji",body:text,createdAt:Date.now()}];saveAccounts(state.accounts);}
    message("Wiadomość wysłana.","info");
  },
  async adminSetBirthDate(nick, value) {
    if(!isAdminProfile(profile()))return message("Brak dostepu.");
    const clean=normalizeNick(nick), birthDate=validBirthDate(value);
    if(!clean||!birthDate)return message("Podaj nick i poprawna date.");
    const entry=accountByNick(clean);
    if(entry){
      entry[1].birthDate=birthDate; entry[1].updatedAt=Date.now();
      await syncPlayerProfile(entry[0],entry[1]);
      saveAccounts(state.accounts);
    }
    const remoteUpdated=await setRemoteBirthDateForNick(clean,birthDate);
    await sendInboxMessageToNick(clean,{fromNick:profile().nick,subject:"Data urodzenia zmieniona",body:`Administrator ustawil date urodzenia na ${birthDate}.`});
    if(!entry&&!remoteUpdated)return message("Nie znaleziono profilu po nicku. Jesli gracz nigdy nie byl online tutaj, nie da sie go zaktualizowac.");
    message("Data urodzenia zapisana.","info");
  },
  async adminBanPlayer({nick, ip, global: forceGlobal, modes, duration, reason}) {
    if(!isAdminProfile(profile()))return message("Brak dostępu.");
    const clean=normalizeNick(nick), targetIp=String(ip||"").trim(), rawModes=Array.isArray(modes)?modes:String(modes||"").toLowerCase().split(",");
    const modeList=[...new Set(rawModes.map(item=>String(item||"").trim()).filter(id=>validModeIds.has(id)))];
    if(!clean&&!targetIp)return message("Podaj nick albo IP.");
    const global=Boolean(forceGlobal);
    if(!global&&!modeList.length)return message("Wybierz tryby albo zaznacz bana globalnego.");
    await saveModerationBan({targetNick:clean,targetIp,global,modes:global?[]:modeList,reason:String(reason||"").trim(),createdBy:profile().nick,expiresAt:Number(duration)?Date.now()+Number(duration):0});
    if(clean)await sendInboxMessageToNick(clean,{fromNick:profile().nick,subject:"Kara konta",body:`Nałożono bana${global?" globalnego":" na wybrane tryby"}. Powód: ${String(reason||"brak")}`});
    message("Ban zapisany.","info");
  },
  async changePassword(password) {
    if (!password || password.length < 3) { message("Nowe hasło musi mieć minimum 3 znaki."); return false; }
    try { await updateAuthPassword(password); updateProfile({ passwordHash:hashRoomPassword(`account:${password}`) }); message("Hasło zostało zmienione.", "info"); return true; }
    catch(error) { message(error?.code==="auth/requires-recent-login"?"Zaloguj się ponownie, aby zmienić hasło.":"Nie udało się zmienić hasła."); return false; }
  },
  async setAvatar(file, crop = null) {
    if(!file?.type?.startsWith("image/"))return message("Wybierz plik graficzny.");
    if(file.size>8*1024*1024)return message("Zdjęcie jest za duże. Maksymalnie 8 MB.");
    const image=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>{const item=new Image();item.onload=()=>resolve(item);item.onerror=reject;item.src=reader.result;};reader.onerror=reject;reader.readAsDataURL(file);});
    const canvas=document.createElement("canvas");canvas.width=160;canvas.height=160;const context=canvas.getContext("2d");
    const viewport=Number(crop?.viewport),displayWidth=Number(crop?.displayWidth),displayHeight=Number(crop?.displayHeight),offsetX=Number(crop?.offsetX),offsetY=Number(crop?.offsetY);
    if([viewport,displayWidth,displayHeight,offsetX,offsetY].every(Number.isFinite)&&viewport>0&&displayWidth>0&&displayHeight>0){const scale=displayWidth/image.width,side=Math.min(image.width,image.height,viewport/scale),x=Math.max(0,Math.min(image.width-side,-offsetX/scale)),y=Math.max(0,Math.min(image.height-side,-offsetY/scale));context.drawImage(image,x,y,side,side,0,0,160,160);}else{const side=Math.min(image.width,image.height),x=(image.width-side)/2,y=(image.height-side)/2;context.drawImage(image,x,y,side,side,0,0,160,160);}
    updateProfile({avatarImage:canvas.toDataURL("image/jpeg",.78)});message("Zdjęcie profilowe zapisane.","info");
  },
  removeAvatar(){updateProfile({avatarImage:""});message("Zdjęcie profilowe usunięte.","info");},
  setColorblindMode(enabled){updateProfile({colorblindMode:Boolean(enabled)});},
  openCreateRoom() { const mode = getGameMode(state.selectedGameMode); if (isModeLocked(mode.id)) return message(lockedModeMessage(mode), "info"); const modal = createRoomModal(mode, actions); document.body.append(modal); Audio.play("modalOpen"); },
  closeModal(modal) { modal.remove(); Audio.play("modalClose"); },
  inviteLink(roomId = state.activeRoomId) { const room = typeof roomId === "object" ? roomId : state.rooms.find(item=>item.roomId===roomId) || activeRoom(); return room ? roomInviteLink(room) : ""; },
  async copyInviteLink(roomId = state.activeRoomId) {
    const link = actions.inviteLink(roomId); if(!link)return false;
    let copied = false;
    try { if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(link);copied=true;} } catch {}
    if(!copied){try{const input=document.createElement("textarea");input.value=link;input.style.position="fixed";input.style.opacity="0";document.body.append(input);input.select();copied=document.execCommand("copy");input.remove();}catch{}}
    message(copied?"Link zaproszenia skopiowany.":"Nie udało się skopiować linku.",copied?"info":"error"); return copied;
  },
  async shareInviteLink(roomId = state.activeRoomId) {
    const room = typeof roomId === "object" ? roomId : state.rooms.find(item=>item.roomId===roomId) || activeRoom(), link = room ? roomInviteLink(room) : "";
    if(!link)return false;
    if(navigator.share){try{await navigator.share({title:room.name||"Pokój gry",text:"Dołącz do mojego pokoju gry.",url:link});return true;}catch{return false;}}
    return actions.copyInviteLink(room?.roomId);
  },
  async createRoom({ name, password, settings, isPrivate, maxPlayers, roomType = "standard", entryFee = 0 }) {
    if(!ensureRoomSession()||!profile())return false;
    const now = Date.now(); const mode = getGameMode(state.selectedGameMode); roomType=roomType === "betting" ? "betting" : "standard"; entryFee=roomType === "betting" ? Math.max(0,Number(entryFee)||0) : 0; if (roomType === "betting" && playerMoney({playerProfiles:{[state.currentUser]:profile()}},state.currentUser) < entryFee) { message(`Potrzebujesz co najmniej ${entryFee.toLocaleString("pl-PL")}$, aby utworzyć taki pokój.`); return false; } settings = normalizeCommerceSettings(mode.id, settings || {}, defaultCommercePreferences()); if (mode.id === "quiz") settings = { ...settings, quizVariant:state.quizVariant || "casual" };
    if(isModeLocked(mode.id)){message(lockedModeMessage(mode),"info");return false;}
    if(await guardBan(mode.id))return false;
    maxPlayers = Math.max(mode.minPlayers, Math.min(mode.maxPlayers, Number(maxPlayers) || mode.maxPlayers));
    const room = { roomId: uid(), gameMode: mode.id, maxPlayers, name: name.trim() || `Pokój ${profile().nick}`, passwordHash:isPrivate?hashRoomPassword(password):"",
       isPrivate, roomType, entryFee, hostUid: state.currentUser, players: [state.currentUser], joinedAt:{[state.currentUser]:now}, playerProfiles:{[state.currentUser]:publicProfile(profile())}, status: "lobby", settings:{...(settings||{})}, activity:[{id:uid("ACT"),text:"Pokój został utworzony.",uid:state.currentUser,createdAt:now}], createdAt: now, updatedAt: now, game: null };
    const result=await syncRoomState(room);if(!result.ok){message(`Nie udało się utworzyć pokoju: ${result.error}`);connectRooms();return false;}
    trackSiteEvent({ type:"roomCreated", eventId:`room:${room.roomId}` });
    state.rooms = [room, ...state.rooms.filter(item=>item.roomId!==room.roomId)]; state.activeRoomId = room.roomId;clearPendingInvite();persistSession(); setRoomUrl(room); Audio.play("joinRoom"); Router.go("room");
    return true;
  },
  async joinRoom(roomId, password = "", options = {}) {
    if(!ensureRoomSession()||!profile())return false;
    const code=String(roomId||"").trim().toUpperCase(),fail=text=>options.fromInvite?inviteErrorModal(text):(message(text),false);
    if(!code)return fail("Nie można dołączyć do tego pokoju.");
    const resolved=await resolveRoomForJoin(code); if(!resolved.ok)return fail(resolved.missing?"Ten pokój nie istnieje.":"Nie można dołączyć do tego pokoju.");
    const room = resolved.room, mode = getGameMode(room.gameMode), alreadyInRoom = room.players.includes(state.currentUser);
    if(isModeLocked(mode.id))return fail(lockedModeMessage(mode));
    if(options.inviteMode && room.gameMode !== options.inviteMode)return fail("Ten link prowadzi do innego trybu gry.");
    if(room.deleted || room.closed || room.status === "closed")return fail("Ten pokój został zamknięty.");
    if(!alreadyInRoom && room.status !== "lobby")return fail(room.status === "playing" || room.game ? "Gra w tym pokoju już trwa." : "Ten link jest nieaktualny.");
    const roomCapacity = Math.max(mode.minPlayers, Math.min(mode.maxPlayers, Number(room.maxPlayers) || mode.maxPlayers));
    if(!alreadyInRoom && room.players.length >= roomCapacity)return fail("Ten pokój jest już pełny.");
    if(await guardBan(room.gameMode))return false;
    if(roomIsAdult(room)&&!options.adultConfirmed)return withAdultWarning(mode,()=>actions.joinRoom(roomId,password,{...options,adultConfirmed:true}),true);
    if (room.isPrivate && !alreadyInRoom && room.passwordHash !== hashRoomPassword(password)) return options.fromInvite && !password ? invitePasswordModal(room, options.inviteMode) : (message("Złe hasło do pokoju."), false);
    if (room.roomType === "betting" && !alreadyInRoom && !options.wagerConfirmed) return bettingJoinModal(room, () => actions.joinRoom(roomId,password,{...options,wagerConfirmed:true}));
    if (room.roomType === "betting" && !alreadyInRoom && playerMoney(room,state.currentUser) < roomEntryFee(room)) return fail(`Potrzebujesz co najmniej ${roomEntryFee(room).toLocaleString("pl-PL")}$, aby dołączyć do tego pokoju.`);
    if (!alreadyInRoom) {
      room.players.push(state.currentUser); room.joinedAt={...(room.joinedAt||{}),[state.currentUser]:Date.now()}; room.playerProfiles={...(room.playerProfiles||{}),[state.currentUser]:publicProfile(profile())}; addRoomActivity(room, `${profile().nick} dołączył do pokoju.`); touchRoom(room);
      await roomSyncChains.get(room.roomId)?.catch?.(() => {});
    }
    state.rooms = [room, ...state.rooms.filter(item=>item.roomId!==room.roomId)]; state.selectedGameMode = room.gameMode; state.activeRoomId = room.roomId;clearPendingInvite();persistSession(); setRoomUrl(room); Audio.play("joinRoom"); Router.go(room.status === "lobby" ? "room" : "game"); return true;
  },
  leaveRoom(destination = "lobby") {
    leaveRoomModal(typeof destination === "string" ? destination : "lobby");
  },
  confirmLeaveRoom(destination = "lobby") {
    destination = typeof destination === "string" ? destination : "lobby";
    const room = activeRoom(); if (!room) return;
    interruptProveRoundForDeparture(room,state.currentUser);
    addRoomActivity(room, `${profile()?.nick || "Gracz"} opuścił pokój.`);
    room.players = room.players.filter(id => id !== state.currentUser); if(room.playerProfiles)delete room.playerProfiles[state.currentUser];if(room.joinedAt)delete room.joinedAt[state.currentUser]; if (room.hostUid === state.currentUser) room.hostUid = room.players.find(uid=>!isBotId(uid))||room.players[0];
    state.activeRoomId = null;clearPendingInvite();persistSession();
    if(!roomHasHumanPlayers(room)){removeRemoteRoom(room.roomId);removeRoomLocally(room.roomId);}else{touchRoom(room);} state.rooms = state.rooms.filter(item => item.roomId!==room.roomId); destination==="platform"?setUrlRoute("", ""):setModeUrl(state.selectedGameMode); Audio.play("leaveRoom"); Router.go(destination);
  },
  kickPlayer(playerId) { const room = activeRoom(); if (room?.hostUid === state.currentUser) { interruptProveRoundForDeparture(room,playerId);const nick=room.playerProfiles?.[playerId]?.nick||"Gracz";addRoomActivity(room, `${nick} został wyrzucony przez hosta.`);room.players = room.players.filter(id => id !== playerId); if(room.playerProfiles)delete room.playerProfiles[playerId];if(room.joinedAt)delete room.joinedAt[playerId];if(!room.players.length||shouldCloseLonelyFinishedRoom(room)){removeRemoteRoom(room.roomId);removeRoomLocally(room.roomId);state.activeRoomId=null;persistSession();Router.go("platform");showRoomClosedNotice();}else{touchRoom(room);render();} } },
  setRoomTime(answerTime) { const room = activeRoom(); if (room?.hostUid === state.currentUser && room.status === "lobby") { room.settings.answerTime = answerTime; addRoomActivity(room, `Host ustawił czas odpowiedzi na ${answerTime}s.`); touchRoom(room); animateHostSettingChange(answerTime); render({ preserveDrafts:true }); } },
  addBot() {
    const room=activeRoom(), mode=getGameMode(room?.gameMode);
    if(!room||room.hostUid!==state.currentUser||!roomAllowsBots(room,mode))return message("Botów nie można dodawać w tym trybie.","info");
    const roomCapacity = Math.max(mode.minPlayers, Math.min(mode.maxPlayers, Number(room.maxPlayers) || mode.maxPlayers));
    if(room.players.length>=roomCapacity)return message("Brak wolnych miejsc.","info");
    const id=`bot:${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`, index=botCount(room);
    botIds(room).forEach((bot,index)=>{const current={...(room.playerProfiles?.[bot]||{}),nick:botName(index)};room.playerProfiles={...(room.playerProfiles||{}),[bot]:current};state.accounts[bot]=current;});
    room.players=[...room.players,id];room.joinedAt={...(room.joinedAt||{}),[id]:Date.now()};room.playerProfiles={...(room.playerProfiles||{}),[id]:botProfile(id,index,"normal")};state.accounts[id]={...room.playerProfiles[id]};addRoomActivity(room, `${room.playerProfiles[id].nick} dołączył do pokoju.`);touchRoom(room);Audio.play("playerJoin");render();return true;
  },
  setBotDifficulty(botUid, value) {
    const room=activeRoom();if(!room||room.hostUid!==state.currentUser||room.status!=="lobby"||!isBotId(botUid))return;
    const difficulty=BOT_DIFFICULTIES.some(item=>item.id===value)?value:"normal";const current=room.playerProfiles?.[botUid];if(!current)return;room.playerProfiles={...(room.playerProfiles||{}),[botUid]:{...current,botDifficulty:difficulty}};state.accounts[botUid]={...room.playerProfiles[botUid]};addRoomActivity(room, `Poziom bota ${current.nick || "Bot"} zmieniono na ${BOT_DIFFICULTIES.find(item=>item.id===difficulty)?.label || difficulty}.`);touchRoom(room);render();
  },
  setImpostorSetting(key,value) {
    const room=activeRoom(); if(!room||room.hostUid!==state.currentUser||room.gameMode!=="impostor")return;
    room.settings=sanitizeImpostorSettings({...room.settings,[key]:value},room.players.length); touchRoom(room); animateHostSettingChange(value);
  },
  setModeSetting(key,value){const room=activeRoom();if(!room||room.hostUid!==state.currentUser)return;room.settings={...room.settings,[key]:["turnTime","rounds","targetScore","answerTime","discussionTime","voteTime","questionTime","testTime","assignTime","candyCount","poisonedPerPlayer","lives","budget","teamSize","selectTime","hearts","roundTime","questionCount","topSize","sequenceLength","boardSize","numberMax","repeatGap","minSeconds","maxSeconds","selectionTime","votingTime","choiceTime","pairs"].includes(key)?Number(value):value};if(room.gameMode==="unique-answer")room.settings=sanitizeUniqueAnswerSettings(room.settings,room.players.length);if(room.gameMode==="bomba")room.settings=sanitizeBombSettings(room.settings);if(room.gameMode==="najblizej-prawdy")room.settings=sanitizeClosestTruthSettings(room.settings);if(room.gameMode==="ranking")room.settings=sanitizeRankingSettings(room.settings);if(room.gameMode==="5-sekund")room.settings=sanitizeFiveSecondsSettings(room.settings);if(room.gameMode==="zegar")room.settings=sanitizeClockSettings(room.settings);if(room.gameMode==="klamca")room.settings=sanitizeLiarSettings(room.settings);if(room.gameMode==="falszywa-wiadomosc")room.settings=sanitizeFalseMessageSettings(room.settings);if(room.gameMode==="popularnosc-hitow")room.settings={...room.settings,...sanitizePopularitySettings(room.settings)};if(room.gameMode?.startsWith("board-"))room.settings=sanitizeBoardSettings(room.settings,room.gameMode);touchRoom(room);animateHostSettingChange(value);if(room.gameMode==="number-mystery"&&key==="roundMode")render({preserveDrafts:true});if(key==="allowRepeats"){const gap=document.querySelector('[data-word-chain-setting="repeatGap"]');if(gap)gap.disabled=value!==true&&String(value)!=="true";}},
  setMostCategories(categories){const room=activeRoom();if(!room||room.hostUid!==state.currentUser)return;const next=[...new Set(categories||[])];const addingAdult=next.some(item=>String(item).startsWith("18+"))&&!hasAdultCategory(room.settings);if(addingAdult&&roomHasNonAdultPlayer(room))return message("W pokoju jest gracz bez potwierdzonego 18+, wiec nie mozna wlaczyc kategorii 18+.", "info");const apply=()=>{room.settings={...room.settings,categories:next,adultWarningAccepted:next.some(item=>String(item).startsWith("18+"))};touchRoom(room);animateHostSettingChange(true);};if(addingAdult)return withAdultWarning(getGameMode(room.gameMode),apply,true);apply();},
  setBombCategories(categories){const room=activeRoom();if(!room||room.hostUid!==state.currentUser||room.gameMode!=="bomba")return;room.settings=sanitizeBombSettings({...room.settings,categories:[...new Set(categories||[])]});touchRoom(room);animateHostSettingChange(true);},
  setClosestTruthCategories(categories){const room=activeRoom();if(!room||room.hostUid!==state.currentUser||room.gameMode!=="najblizej-prawdy")return;room.settings=sanitizeClosestTruthSettings({...room.settings,categories:[...new Set(categories||[])]});touchRoom(room);animateHostSettingChange(true);},
  setRankingCategories(categories){const room=activeRoom();if(!room||room.hostUid!==state.currentUser||room.gameMode!=="ranking")return;room.settings=sanitizeRankingSettings({...room.settings,categories:[...new Set(categories||[])]});touchRoom(room);animateHostSettingChange(true);},
  setFiveSecondsCategories(categories){const room=activeRoom();if(!room||room.hostUid!==state.currentUser||room.gameMode!=="5-sekund")return;room.settings=sanitizeFiveSecondsSettings({...room.settings,categories:[...new Set(categories||[])]});touchRoom(room);animateHostSettingChange(true);},
  saveIdentityWords(text){const room=activeRoom();if(!room||room.gameMode!=="kim-jestem")return;room.customWords??={};room.customWords[state.currentUser]=text.split(",").map(x=>x.trim()).filter(Boolean).slice(0,5);touchRoom(room);message("Hasła zapisane.","info");animateHostSettingChange(true);},
  async startGame() {
    const room = activeRoom(), mode = getGameMode(room?.gameMode);
    if (!room || room.hostUid !== state.currentUser) return;
    if(await guardBan(room.gameMode))return;
    if(roomIsAdult(room)&&roomHasNonAdultPlayer(room))return message("W pokoju jest gracz bez potwierdzonego 18+, wiec nie mozna wystartowac gry 18+.", "info");
    const players = normalizedRoomPlayers(room);
    if (players.length < mode.minPlayers) return message(`Ten tryb wymaga minimum ${mode.minPlayers} graczy.`, "info");
    const fee=roomEntryFee(room);
    if(fee){const missing=players.find(uid=>playerMoney(room,uid)<fee);if(missing)return message(`Gracz ${state.accounts[missing]?.nick||room.playerProfiles?.[missing]?.nick||"Gracz"} nie ma wystarczających środków na wpisowe.`);}
    room.players = players;
    room.settings = { ...(mode.defaultSettings || {}), ...(room.settings || {}) }; if (mode.id === "quiz") room.settings.quizVariant = room.settings.quizVariant || state.quizVariant || "casual";
     room.status = "playing"; room.everStarted = true; addRoomActivity(room, "Host rozpoczął grę."); room.settings=mode.id==="impostor"?sanitizeImpostorSettings(room.settings,room.players.length):mode.id==="zatruty-cukierek"?sanitizePoisonCandySettings(room.settings,room.players.length):mode.id==="bomba"?sanitizeBombSettings(room.settings):mode.audience==="board"?sanitizeBoardSettings(room.settings,mode.id):room.settings;
     room.game = mode.id === "udowodnij" ? createNewRound(room.players, room.settings.answerTime, 1, room.settings.rounds) : mode.id === "impostor" ? createImpostorGame(room.players,room.settings) : mode.id === "kim-jestem" ? createIdentityGame(room.players,room.settings,room.customWords) : mode.id === "inne-pytanie" ? createOtherQuestionGame(room.players,room.settings) : mode.id === "kto-najpredzej" ? createMostLikelyGame(room.players,room.settings) : mode.id === "test-znajomosci" ? createFriendshipTestGame(room.players,room.settings) : mode.id === "zatruty-cukierek" ? createPoisonCandyGame(room.players,room.settings) : mode.id === "bomba" ? createBombGame(room.players,room.settings) : mode.id === "najblizej-prawdy" ? createClosestTruthGame(room.players,room.settings) : mode.id === "ranking" ? createRankingGame(room.players,room.settings) : mode.id === "5-sekund" ? createFiveSecondsGame(room.players,room.settings) : mode.id === "zegar" ? createClockGame(room.players,room.settings) : mode.id === "wavelength" ? createWavelengthGame(room.players,room.settings) : mode.id === "quiz" ? createQuizGame(room.players,room.settings) : mode.id === "mathematics" ? createMathematicsGame(room.players,room.settings) : mode.id === "marker" ? createMarkerGame(room.players,room.settings) : mode.id === "sequence" ? createSequenceGame(room.players,room.settings) : mode.id === "family" ? createFamilyGame(room.players,room.settings) : mode.id === "word-chain" ? createWordChainGame(room.players,room.settings) : mode.id === "number-mystery" ? createNumberMysteryGame(room.players,room.settings) : mode.id === "unique-answer" ? createUniqueAnswerGame(room.players,room.settings,room.hostUid) : mode.id === "polacz-nas" ? createConnectGame(room.players,room.settings) : mode.id === "klamca" ? createLiarGame(room.players,room.settings) : mode.id === "pojedynek-hitow" ? createMusicDuelGame(room.players,room.settings) : mode.id === "bitwa-hitow" ? createMusicArenaGame(room.players,room.settings) : mode.id === "popularnosc-hitow" ? createPopularityGame(room.players,room.settings) : mode.audience === "board" ? createBoardGame(mode.id, room.players, room.settings) : mode.audience === "pokemon" ? createPokemonGame(mode.id, room.players, room.settings) : {};
    if (mode.id === "falszywa-wiadomosc") room.game = createFalseMessageGame(room.players, room.settings);
    if (mode.id === "tajna-zasada") room.game = createSecretRuleGame(room.players, room.settings);
    room.game.siteGameId = uid("GAME"); room.game.startedAt = serverNow();
    if(fee){room.game.entryFee=fee;room.game.betPot=fee*room.players.length;room.pendingEntryFees=Object.fromEntries(room.players.map(uid=>[uid,fee]));}
    touchRoom(room); setRoomUrl(room); Audio.play("gameStart"); Effects.play("gameStart",`${room.roomId}:game-start`); Router.go("game");
  },
  returnToRoom() { const room = activeRoom(); if (room) { if(closeLonelyFinishedRoom(room,{notify:true}))return; keepRoomCategoryUsage(room); room.status = "lobby"; room.game = null; touchRoom(room); setRoomUrl(room); Router.go("room"); } },
  submitInitialBid(value) {
    const amount=Math.max(1,Math.min(50,parseInt(value||"1",10)));
    return mutateRoomGame((game,room)=>{if(game.phase!=="initialBid"||game.starter!==state.currentUser)return"Pierwszą deklarację podaje teraz inny gracz.";game.phase="bidding";game.currentBid=amount;game.currentBidder=state.currentUser;game.decisionPlayer=nextProvePlayer(room.players,state.currentUser);game.phaseEndsAt=provePhaseEnd(Math.round(room.settings.answerTime/2));},{sound:"bid"});
  },
  plusOne() {
    return mutateRoomGame((game,room)=>{if(game.phase!=="bidding"||game.decisionPlayer!==state.currentUser)return"Decyzję podejmuje teraz inny gracz.";game.currentBid+=1;game.currentBidder=state.currentUser;game.decisionPlayer=nextProvePlayer(room.players,state.currentUser);game.phaseEndsAt=provePhaseEnd(Math.round(room.settings.answerTime/2));},{sound:"bid"});
  },
  challenge() {
    return mutateRoomGame((game,room)=>{if(game.phase!=="bidding"||game.decisionPlayer!==state.currentUser)return"Decyzję podejmuje teraz inny gracz.";game.phase="answering";game.requiredCount=game.currentBid;game.answers=[];game.validCount=0;game.phaseEndsAt=provePhaseEnd(room.settings.answerTime);},{sound:"challenge"});
  },
  async submitAnswer(answer, validAnswers) {
    let submittedAnswer;
    const accepted=await mutateRoomGame(game=>{if(game.phase!=="answering"||game.currentBidder!==state.currentUser)return"Teraz odpowiada inny gracz.";const previousAnswers=answerList(game.answers),result=evaluateAnswer(answer,validAnswers,previousAnswers);if(result.error)return result.error;submittedAnswer=result.answer;game.answers=[...previousAnswers,result.answer];game.validCount=game.answers.filter(item=>item.valid).length;if(game.validCount>=game.requiredCount){game.phase="result";game.result={success:true,loser:null,text:`${state.accounts[game.currentBidder]?.nick} udowodnił!`};}},{after:settleProveResult});
    if(accepted&&submittedAnswer)Effects.hit(submittedAnswer.valid);
    return accepted;
  },
  failRound(loser, text, options={}) {
    return mutateRoomGame((game,room)=>{if(game.phase!=="answering"||game.result||game.currentBidder!==loser)return"Runda odpowiedzi została już zakończona.";const canUse=options.allowPass!==false&&room.settings?.gamePassesEnabled!==false&&hasGamePass(profile(),"proof-last-chance")&&!game.passUses?.[loser]?.["proof-last-chance"]&&!game.lastChance;if(canUse){game.passUses=game.passUses||{};game.passUses[loser]={...(game.passUses[loser]||{}),"proof-last-chance":true};game.lastChance=true;game.phaseEndsAt=provePhaseEnd(8);return;}game.lastChance=false;game.phase="result";game.result={success:false,loser,text};},{after:settleProveResult});
  },
  surrenderRound() {
    const room=activeRoom();
    if(!room?.game||room.game.phase!=="answering"||room.game.currentBidder!==state.currentUser)return;
    return actions.failRound(state.currentUser,`${state.accounts[state.currentUser]?.nick || "Gracz"} poddał się.`,{allowPass:false});
  },
  nextRound() { const room=activeRoom();if(closeLonelyFinishedRoom(room,{notify:true}))return;return mutateRoomGame((game,current)=>{if(game.phase!=="result")return"Ta runda jeszcze się nie zakończyła.";const total=Math.max(1,Number(game.totalRounds||current.settings?.rounds)||5);if(Number(game.round||1)>=total){game.phase="gameSummary";game.finished=true;game.summary=game.roundWins||{};current.status="results";return;}const wins=game.roundWins||{}, passUses=game.passUses||{};Object.assign(game,createNewRound(current.players,current.settings.answerTime,Number(game.round||1)+1,total));game.roundWins=wins;game.passUses=passUses;},{sound:"turn"}); },
  async impostorAcknowledgeRole(){
    const room=activeRoom();if(!room?.game||room.gameMode!=="impostor"||room.game.phase!=="roleReveal")return;
    if(room.game.acknowledged?.[state.currentUser])return;
    await roomSyncChains.get(room.roomId);
    const remote=await acknowledgeRemoteImpostorRole(room.roomId,state.currentUser);
    if(remote?.ok&&remote.game){room.game=remote.game;room.updatedAt=remote.updatedAt;Audio.play("ready");render();return;}
    if(remote?.ok)return message("Stan gry nie jest jeszcze gotowy. Spróbuj ponownie za chwilę.","info");
    if(remote&&!remote.ok)return message(`Nie udało się potwierdzić roli: ${remote.error}`);
    ImpostorEngine.acknowledge(room.game,state.currentUser,room.settings);touchRoom(room);Audio.play("ready");render();
  },
  async impostorBuyRole(requestedRole){
    const room=activeRoom(), item=inGamePurchaseById("impostor-role"), user=profile();
    if(!room?.game||room.gameMode!=="impostor"||room.settings?.gamePurchases===false||!item||!user)return false;
    if(user.nickOnly)return message("Zaloguj się na konto, żeby kupować dodatki w grze.","info");
    if(Number(user.money||0)<item.price)return message(`Potrzebujesz ${item.price}$, aby kupić wybór roli.`, "info");
    const changed=await mutateRoomGame((game,current)=>ImpostorEngine.buyRole(game,state.currentUser,requestedRole,sanitizeImpostorSettings(current.settings,current.players.length)),{sound:"purchase"});
    if(!changed)return false;
    updateProfile({money:Number(user.money||0)-item.price});
    await actions.impostorClaimRoleRefund();
    return true;
  },
  async impostorClaimRoleRefund(){
    const room=activeRoom(), user=profile(), game=room?.game, level=gamePassState(user,gamePassById("impostor-compensation"));
    if(!room||room.gameMode!=="impostor"||room.settings?.gamePassesEnabled===false||!user||!game?.rolePurchaseRefunds?.[state.currentUser]||game.rolePurchaseRefundsClaimed?.[state.currentUser]||!hasGamePass(user,"impostor-compensation"))return false;
    const claimed=await mutateRoomGame(current=>{current.rolePurchaseRefundsClaimed={...(current.rolePurchaseRefundsClaimed||{}),[state.currentUser]:true};},{sound:"success"});
    if(!claimed)return false;
    const percent=Math.min(90,40+level.level*10), refund=Math.floor(Number(inGamePurchaseById("impostor-role")?.price||3000)*percent/100);
    updateProfile({money:Number(profile()?.money||0)+refund});
    message(`Losowanie roli: rekompensata ${refund}$ (${percent}%).`,"info");
    return true;
  },
  impostorSubmitClue(text){return mutateRoomGame((game,room)=>ImpostorEngine.clue(game,state.currentUser,text,room.settings),{sound:"clue"});},
  impostorTimeout(expected={}){const room=activeRoom();if(!room||room.gameMode!=="impostor")return;const expectedEnd=Number(expected.phaseEndsAt||0);if(expectedEnd&&Date.now()+250<expectedEnd)return false;const guard={phase:room.game?.phase,phaseEndsAt:room.game?.phaseEndsAt||0,round:room.game?.round||0,turnIndex:room.game?.turnIndex??""};return mutateRoomGame((game,current)=>{if(expected.phase&&game.phase!==expected.phase)return"Faza gry juz sie zmienila.";if(expected.phaseEndsAt&&Number(game.phaseEndsAt||0)!==Number(expected.phaseEndsAt))return"Faza gry juz sie zmienila.";if(Number(game.phaseEndsAt||0)>Date.now()+250)return"Czas jeszcze nie minal.";if(expected.round&&Number(game.round||0)!==Number(expected.round))return"Faza gry juz sie zmienila.";if(String(game.turnIndex??"")!==String(expected.turnIndex??guard.turnIndex))return"Faza gry juz sie zmienila.";ImpostorEngine.timeout(game,current.settings);},{after:settleImpostorResult});},
  impostorDecision(keepPlaying){return mutateRoomGame((game,room)=>ImpostorEngine.decide(game,state.currentUser,keepPlaying,room.settings),{sound:"vote"});},
  impostorVote(target){return mutateRoomGame(game=>ImpostorEngine.vote(game,state.currentUser,target),{sound:"vote",after:settleImpostorResult});},
  impostorFinalGuess(text){return mutateRoomGame(game=>ImpostorEngine.finalGuess(game,state.currentUser,text),{sound:"submit",after:settleImpostorResult});},
  impostorFinalSurrender(){return mutateRoomGame(game=>ImpostorEngine.finalSurrender(game,state.currentUser),{sound:"choice",after:settleImpostorResult});},
  impostorReact(text){return mutateRoomGame(game=>ImpostorEngine.react(game,state.currentUser,text)?null:"Reakcja odnawia się co 5 sekund.",{sound:"notification"});},
  impostorChat(text){const room=activeRoom();if(!room?.settings.chatEnabled)return;return mutateRoomGame(game=>ImpostorEngine.chat(game,state.currentUser,text),{sound:"chat"});},
  impostorPlayAgain(){const room=activeRoom();if(closeLonelyFinishedRoom(room,{notify:true}))return;keepRoomCategoryUsage(room);room.status="lobby";room.game=null;touchRoom(room);Router.go("room");},
  identitySubmit(text,type){return mutateRoomGame((game,room)=>IdentityEngine.submit(game,state.currentUser,text,type,room.settings,room.customWords),{sound:type==="guess"?"submit":"clue",after:settleIdentityResult});},
  identityVoiceQuestion(){return mutateRoomGame((game,room)=>IdentityEngine.voiceQuestion(game,state.currentUser,room.settings),{sound:"clue"});},
  identityVoiceState(){return identityVoiceChat.state();},
  identityEnableVoice(){return identityVoiceChat.enable();},
  identityToggleMic(){identityVoiceChat.toggleMute();render({preserveDrafts:true});},
  identityRespond(response){return mutateRoomGame((game,room)=>IdentityEngine.respond(game,state.currentUser,response,room.settings,room.customWords),{sound:"choice",after:settleIdentityResult});},
  identityRepeatRequest(){return mutateRoomGame(game=>IdentityEngine.repeat(game,state.currentUser),{sound:"notification"});},
  identityExtendVote(addRound){return mutateRoomGame((game,room)=>IdentityEngine.extendVote(game,state.currentUser,addRound,room.players,room.settings),{sound:"vote",after:settleIdentityResult});},
  async identityRevealLetter(source = "identity-insight") {
    const room = activeRoom(), user = profile(), pass = source === "identity-insight";
    if (!room?.game || room.gameMode !== "kim-jestem" || !user) return false;
    const item = inGamePurchaseById("identity-letter");
    if (pass && (!hasGamePass(user, "identity-insight") || room.settings?.gamePassesEnabled === false)) return message("Nie masz aktywnego Wzroku detektywa.", "error");
    if (!pass && (room.settings?.gamePurchases === false || !item)) return message("Zakupy w tej grze są wyłączone.", "error");
    if (!pass && Number(user.money || 0) < item.price) return message("Nie masz wystarczająco coinów.", "error");
    const changed = await mutateRoomGame((game, current) => IdentityEngine.revealLetter(game, state.currentUser, current.settings, source), { sound:"choice" });
    if (!changed) return false;
    if (!pass) updateProfile({ money:Number(user.money || 0) - item.price });
    message(pass ? "Wzrok detektywa pokazał jedną literę." : "Kupiono podpowiedź z jedną literą.", "info");
    return true;
  },
  identityTimeout(){const room=activeRoom();if(!room||room.gameMode!=="kim-jestem")return;const phase=room.game?.phase;return mutateRoomGame((game,current)=>{if(game.phase!==phase)return"Faza gry juz sie zmienila.";IdentityEngine.timeout(game,current.settings,current.customWords);},{after:settleIdentityResult});},
  otherAnswer(text){return mutateRoomGame((game,room)=>OtherQuestionEngine.answer(game,state.currentUser,text,room.settings),{sound:"submit"});},
  otherChat(text){const room=activeRoom();if(!room?.settings.chatEnabled)return;return mutateRoomGame(game=>OtherQuestionEngine.chat(game,state.currentUser,text),{sound:"chat"});},
  otherVote(uid){return mutateRoomGame(game=>OtherQuestionEngine.vote(game,state.currentUser,uid),{sound:"vote",after:settleOtherQuestionResult});},
  otherTimeout(){const room=activeRoom();if(!room||room.gameMode!=="inne-pytanie")return;const phase=room.game?.phase;return mutateRoomGame((game,current)=>{if(game.phase!==phase)return"Faza gry juz sie zmienila.";OtherQuestionEngine.timeout(game,current.settings);},{after:settleOtherQuestionResult});},
  otherNext(){const room=activeRoom();if(closeLonelyFinishedRoom(room,{notify:true}))return;return mutateRoomGame((game,current)=>{if(game.phase!=="results")return"Runda została już zmieniona.";OtherQuestionEngine.next(game,current.players,current.settings);});},
  async wyrVote(choice){
    const user=profile(),question=currentWouldYouRather(),remoteUid=getFirebaseSession()?.uid||state.currentUser;if(!question)return;
    const result=await voteWouldYouRather({questionId:question.id,choice,playerId:wouldYouRatherPlayerKey(user,remoteUid),remotePlayerId:remoteUid,persistProfile:Boolean(user&&!user.nickOnly)});
    if(result.error)return message(result.error,"error");
    if(!result.accepted){
      if(result.choice==="a"||result.choice==="b"){
        setWouldYouRatherVote(result.choice,result.votes);
        render({preserveDrafts:true});
      }
      return message("Na to pytanie już oddałeś głos.","info");
    }
    setWouldYouRatherVote(choice,result.votes);
    Effects.play("choice");if(user){applyPlayerXp(state.currentUser,2);if(!user.nickOnly)updateProfile({money:(profile().money||0)+2,answeredWouldYouRather:{...(profile().answeredWouldYouRather||{}),[question.id]:choice}});else{Audio.play("success");render();}}else{Audio.play("success");render();}
  },
  mostLikelyQuestion(text){return mutateRoomGame((game,room)=>MostLikelyEngine.submitQuestion(game,state.currentUser,text,room.players,room.settings),{sound:"submit"});},
  mostLikelyVote(uid){return mutateRoomGame((game,room)=>MostLikelyEngine.vote(game,state.currentUser,uid,room.players,room.settings),{sound:"vote"});},
  mostLikelyTimeout(){const room=activeRoom();if(!room||room.gameMode!=="kto-najpredzej")return;const phase=room.game?.phase;return mutateRoomGame((game,current)=>{if(game.phase!==phase)return"Faza gry juz sie zmienila.";MostLikelyEngine.timeout(game,current.players,current.settings);});},
  mostLikelyNext(){const room=activeRoom();if(closeLonelyFinishedRoom(room,{notify:true}))return;return mutateRoomGame((game,current)=>{if(game.phase!=="roundResult")return"Runda została już zmieniona.";MostLikelyEngine.next(game,current.settings);},{after:settleMostLikelyResult});},
  poisonCandyPoison(ids){return mutateRoomGame((game,room)=>PoisonCandyEngine.poison(game,state.currentUser,ids,room.players,room.settings),{sound:"candyPoison"});},
  poisonCandyTimeout(expected={}){const room=activeRoom();if(!room||room.gameMode!=="zatruty-cukierek")return;return mutateRoomGame((game,current)=>{if(game.phase!=="poisoning")return"Faza gry juz sie zmienila.";if(expected.phaseEndsAt&&Number(game.phaseEndsAt||0)!==Number(expected.phaseEndsAt))return"Faza gry juz sie zmienila.";PoisonCandyEngine.timeoutPoisoning(game,current.players,current.settings);},{sound:"candyPoison"});},
  poisonCandyEat(id){return mutateRoomGame((game,room)=>PoisonCandyEngine.eat(game,state.currentUser,id,room.players,room.settings,{survivorCharm:room.settings?.gamePassesEnabled!==false&&hasGamePass(profile(),"survivor-charm"),candyShield:Boolean(game.purchaseUses?.[state.currentUser]?.["candy-shield"])}),{sound:"candyPick",after:room=>{const event=room.game?.lastEvent;Audio.play(event?.type==="poisoned"&&event.dead?"candyDeath":"candySafe");settlePoisonCandyResult(room);}});},
  async poisonCandyBuyShield() {
    const room=activeRoom(), user=profile(), item=inGamePurchaseById("candy-shield");
    if (!room?.game || room.gameMode!=="zatruty-cukierek" || !user || room.settings?.gamePurchases===false || !item) return false;
    if (Number(user.money||0)<item.price) return message("Nie masz wystarczająco coinów.","error");
    const changed=await mutateRoomGame(game=>{game.purchaseUses??={};game.purchaseUses[state.currentUser]??={};if(game.purchaseUses[state.currentUser][item.id])return"Tarcza została już uzbrojona.";game.purchaseUses[state.currentUser][item.id]=true;},{sound:"purchase"});
    if(!changed)return false;
    updateProfile({money:Number(user.money||0)-item.price});message("Tarcza cukierka uzbrojona.","info");return true;
  },
  poisonCandyNextRound(){const room=activeRoom();if(closeLonelyFinishedRoom(room,{notify:true}))return;return mutateRoomGame((game,current)=>PoisonCandyEngine.nextRound(game,current.players,current.settings),{sound:"turn"});},
  bombAnswer(text){return mutateRoomGame((game,room)=>BombEngine.answer(game,state.currentUser,text,room.players,room.settings),{sound:"submit",after:settleBombResult});},
  bombTimeout(expected={}){const room=activeRoom();if(!room||room.gameMode!=="bomba")return;return mutateRoomGame((game,current)=>BombEngine.timeout(game,expected.activeUid,current.players,current.settings,expected),{sound:"roundEnd",after:settleBombResult});},
  bombNextRound(){const room=activeRoom();if(closeLonelyFinishedRoom(room,{notify:true}))return;return mutateRoomGame((game,current)=>BombEngine.nextRound(game,current.players,current.settings),{sound:"turn"});},
  closestTruthAnswer(value){return mutateRoomGame((game,room)=>ClosestTruthEngine.answer(game,state.currentUser,value,room.players,room.settings),{sound:"submit",after:settleClosestTruthResult});},
  closestTruthNext(){const room=activeRoom();if(closeLonelyFinishedRoom(room,{notify:true}))return;return mutateRoomGame((game,current)=>ClosestTruthEngine.nextRound(game,current.players,current.settings),{sound:"turn"});},
  rankingSubmit(order){return mutateRoomGame((game,room)=>RankingEngine.submit(game,state.currentUser,order,room.players,room.settings),{sound:"submit",after:settleRankingResult});},
  rankingNext(){const room=activeRoom();if(closeLonelyFinishedRoom(room,{notify:true}))return;return mutateRoomGame((game,current)=>RankingEngine.nextRound(game,current.players,current.settings),{sound:"turn"});},
  fiveSecondsAdvance(expected={}){return mutateRoomGame((game,room)=>FiveSecondsEngine.advance(game,room.players,room.settings,expected),{sound:"turn"});},
  fiveSecondsAnswer(text, expected={}){return mutateRoomGame((game,room)=>FiveSecondsEngine.answer(game,state.currentUser,text,room.players,room.settings,expected),{sound:"submit",after:settleFiveSecondsResult});},
  fiveSecondsTimeout(expected={}){const room=activeRoom();if(!room||room.gameMode!=="5-sekund")return;return mutateRoomGame((game,current)=>FiveSecondsEngine.timeout(game,current.players,current.settings,expected),{sound:"turn",after:settleFiveSecondsResult});},
  clockStart(expected={}){return mutateRoomGame((game,room)=>ClockEngine.start(game,room.players,room.settings,expected),{sound:"turn"});},
  clockStop(expected={}){return mutateRoomGame((game,room)=>ClockEngine.stop(game,state.currentUser,room.players,room.settings,expected,{secondChancePass:room.settings?.gamePassesEnabled!==false&&hasGamePass(profile(),"clock-second-chance-pass")}),{sound:"submit",after:settleClockResult});},
  clockSecondChance(){const room=activeRoom();if(room?.settings?.gamePassesEnabled===false||!hasGamePass(profile(),"clock-second-chance-pass"))return message("Nie masz aktywnego gamepassa Drugiego pomiaru.","error");return mutateRoomGame((game,current)=>ClockEngine.useSecondChance(game,state.currentUser,current.players,current.settings,{secondChancePass:true}),{sound:"submit",after:settleClockResult});},
  clockKeepFirst(){const room=activeRoom();if(room?.settings?.gamePassesEnabled===false||!hasGamePass(profile(),"clock-second-chance-pass"))return message("Nie masz aktywnego gamepassa Drugiego pomiaru.","error");return mutateRoomGame((game,current)=>ClockEngine.keepFirst(game,state.currentUser,current.players,current.settings,{secondChancePass:true}),{sound:"choice",after:settleClockResult});},
  clockTimeout(expected={}){const room=activeRoom();if(!room||room.gameMode!=="zegar")return;return mutateRoomGame((game,current)=>ClockEngine.timeout(game,current.players,current.settings,expected),{sound:"roundEnd",after:settleClockResult});},
  clockNextRound(){const room=activeRoom();if(closeLonelyFinishedRoom(room,{notify:true}))return;return mutateRoomGame((game,current)=>ClockEngine.nextRound(game,current.players,current.settings),{sound:"turn"});},
  pokemonAnswer(text, expected={}){return mutateRoomGame((game,room)=>{if(Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt)||game.phase!==expected.phase)return "Ta odpowiedź jest już spóźniona.";return PokemonEngine.answer(game,state.currentUser,text,room.players,room.settings);},{sound:"submit"}).then(ok=>{if(ok)Effects.play("choice",`pokemon-answer-${Date.now()}`);return ok;});},
  pokemonMatchType(types, expected={}){return mutateRoomGame((game,room)=>{if(Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt)||game.phase!==expected.phase)return "Ta runda jest już zakończona.";return PokemonEngine.matchType(game,state.currentUser,types,room.players,room.settings);},{sound:"submit"}).then(ok=>{if(ok)Effects.play("choice",`pokemon-match-type-${Date.now()}`);return ok;});},
  pokemonSelectType(type, expected={}){return mutateRoomGame((game,room)=>{if(game.phaseEndsAt!==expected.phaseEndsAt)return "Wybór typu jest już zamknięty.";return PokemonEngine.selectType(game,state.currentUser,type,room.players,room.settings);},{sound:"choice"}).then(ok=>{if(ok)Effects.play("choice",`pokemon-type-${Date.now()}`);return ok;});},
  pokemonBid(amount){return mutateRoomGame((game,room)=>PokemonEngine.bid(game,state.currentUser,amount,room.players),{sound:"bid"}).then(ok=>{if(ok)Effects.play("auctionBid",`pokemon-bid-${Date.now()}`);return ok;});},
  pokemonPass(){return mutateRoomGame((game,room)=>PokemonEngine.pass(game,state.currentUser,room.players),{sound:"turn"}).then(ok=>{if(ok)Effects.play("auctionBid",`pokemon-pass-${Date.now()}`);return ok;});},
  pokemonTimeout(expected={}){const room=activeRoom();if(!room?.game||room.game.mode?.startsWith("pokemon")!==true)return;return mutateRoomGame((game,current)=>{if(Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Faza gry już się zmieniła.";PokemonEngine.timeout(game,expected.activeUid||state.currentUser,current.players,current.settings);},{sound:"turn"}).then(ok=>{if(ok)Effects.play("roundFail",`pokemon-timeout-${Date.now()}`);return ok;});},
  pokemonNextRound(){const room=activeRoom();if(closeLonelyFinishedRoom(room,{notify:true}))return;return mutateRoomGame((game,current)=>PokemonEngine.nextRound(game,current.players,current.settings),{sound:"turn"});},
  pokemonUseScout(){const room=activeRoom();if(!room?.game||!room.gameMode?.startsWith("pokemon-")||room.settings?.gamePassesEnabled===false||!hasGamePass(profile(),"pokemon-scout"))return message("Nie masz aktywnego Skanera Pokédex.","error");return mutateRoomGame((game,current)=>PokemonEngine.useScout(game,state.currentUser,current.players,current.settings),{sound:"choice"});},
  wavelengthClue(text, expected={}){return mutateRoomGame((game,room)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Faza gry już się zmieniła.";return WavelengthEngine.clue(game,state.currentUser,text,room.players,room.settings);},{sound:"clue"});},
  wavelengthMove(position, expected={}){return mutateRoomGame((game,room)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Faza gry już się zmieniła.";return WavelengthEngine.move(game,state.currentUser,position,room.players);},{sound:"turn"});},
  wavelengthConfirm(expected={}){return mutateRoomGame((game,room)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Faza gry już się zmieniła.";return WavelengthEngine.confirm(game,state.currentUser,room.players,room.settings,{secondChancePass:room.settings?.gamePassesEnabled!==false&&hasGamePass(profile(),"wavelength-second-chance")});},{sound:"roundEnd"});},
  wavelengthRevealPro(){const room=activeRoom();if(!room?.game||room.gameMode!=="wavelength"||room.settings?.gamePassesEnabled===false||!hasGamePass(profile(),"wavelength-pro"))return message("Nie masz aktywnego Wavelength Pro.","error");return mutateRoomGame((game,current)=>WavelengthEngine.revealPro(game,state.currentUser,current.players),{sound:"choice"});},
  wavelengthTimeout(expected={}){const room=activeRoom();if(!room||room.gameMode!=="wavelength")return;return mutateRoomGame((game,current)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Faza gry już się zmieniła.";WavelengthEngine.timeout(game,current.players,current.settings);},{sound:"roundEnd"});},
  wavelengthNext(){const room=activeRoom();if(closeLonelyFinishedRoom(room,{notify:true}))return;return mutateRoomGame((game,current)=>WavelengthEngine.nextRound(game,current.players,current.settings),{sound:"turn"});},
  quizAnswer(option, expected={}){return mutateRoomGame((game,room)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Faza gry już się zmieniła.";return QuizEngine.answer(game,state.currentUser,option,room.players,room.settings);},{sound:"submit"});},
  quizSkip(expected={}){return mutateRoomGame((game,room)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Faza gry już się zmieniła.";return QuizEngine.skip(game,state.currentUser,room.players);},{sound:"turn"});},
  quizBuzz(expected={}){return mutateRoomGame((game,room)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Faza gry już się zmieniła.";return QuizEngine.buzz(game,state.currentUser,room.players);},{sound:"bid"});},
  quizChoose(target, expected={}){return mutateRoomGame((game,room)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Faza gry już się zmieniła.";return QuizEngine.choose(game,state.currentUser,target,room.players);},{sound:"choice"});},
  quizTimeout(expected={}){const room=activeRoom();if(!room||room.gameMode!=="quiz")return;return mutateRoomGame((game,current)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Faza gry już się zmieniła.";QuizEngine.timeout(game,current.players,current.settings);},{sound:"roundEnd"});},
  mathematicsAnswer(value, expected={}){return mutateRoomGame((game,room)=>{const end=game.variant==="full-test"?game.testEndsAt:game.phaseEndsAt, expectedEnd=game.variant==="full-test"?expected.testEndsAt:expected.phaseEndsAt;if(game.phase!==expected.phase||Number(end)!==Number(expectedEnd))return "Faza gry już się zmieniła.";return MathematicsEngine.answer(game,state.currentUser,value,room.players);},{sound:"submit"});},
  mathematicsTimeout(expected={}){const room=activeRoom();if(!room||room.gameMode!=="mathematics")return;return mutateRoomGame((game,current)=>{const end=game.variant==="full-test"?game.testEndsAt:game.phaseEndsAt, expectedEnd=game.variant==="full-test"?expected.testEndsAt:expected.phaseEndsAt;if(game.phase!==expected.phase||Number(end)!==Number(expectedEnd))return "Faza gry już się zmieniła.";MathematicsEngine.timeout(game,current.players);},{sound:"roundEnd"});},
  markerSelect(cell, expected={}){return mutateRoomGame((game)=>{if(game.phase!==expected.phase||game.selectedCell!==expected.selectedCell)return "Faza gry już się zmieniła.";return MarkerEngine.select(game,state.currentUser,cell);},{sound:"choice"});},
  markerCoverage(ratio, expected={}){return mutateRoomGame((game)=>{if(game.phase!==expected.phase||game.selectedCell!==expected.selectedCell)return "Faza gry już się zmieniła.";return MarkerEngine.coverage(game,state.currentUser,ratio);},{sound:"submit"});},
  markerFind(cell, expected={}){return mutateRoomGame((game)=>{if(game.phase!==expected.phase||game.selectedCell!==expected.selectedCell)return "Faza gry już się zmieniła.";return MarkerEngine.find(game,state.currentUser,cell);},{sound:"choice"});},
  markerTimeout(expected={}){const room=activeRoom();if(!room||room.gameMode!=="marker")return;return mutateRoomGame((game)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Faza gry już się zmieniła.";return MarkerEngine.timeout(game);},{sound:"roundEnd"});},
  sequenceDraft(color, expected={}){return mutateRoomGame((game)=>{if(game.phase!==expected.phase)return "Faza gry już się zmieniła.";game.drafts??={};game.drafts[state.currentUser]??=[];return SequenceEngine.draft(game,state.currentUser,color);},{sound:"choice"});},
  sequenceClear(expected={}){return mutateRoomGame((game)=>{if(game.phase!==expected.phase)return "Faza gry już się zmieniła.";game.drafts??={};game.drafts[state.currentUser]??=[];return SequenceEngine.clearDraft(game,state.currentUser);},{sound:"turn"});},
  sequenceReady(expected={}){return mutateRoomGame((game)=>{if(game.phase!==expected.phase||Number(game.createEndsAt)!==Number(expected.createEndsAt))return "Faza tworzenia już się zmieniła.";return markSequenceReady(game,state.currentUser);},{sound:"ready"});},
  sequenceCreateTimeout(expected={}){return mutateRoomGame((game)=>timeoutSequenceCreation(game,expected.createEndsAt),{sound:"roundEnd"});},
  sequenceGuessColor(color, expected={}){return mutateRoomGame((game)=>{if(game.phase!==expected.phase)return "Faza gry już się zmieniła.";game.drafts??={};const draft=[...(game.drafts[state.currentUser]||[])];if(draft.length>=game.length)return "Sekwencja jest pełna.";draft.push(color);game.drafts[state.currentUser]=draft;},{sound:"choice"});},
  sequenceGuess(guess, expected={}){return mutateRoomGame((game)=>{if(game.phase!==expected.phase)return "Faza gry już się zmieniła.";return SequenceEngine.guess(game,state.currentUser,guess);},{sound:"submit"});},
  sequenceTimeout(expected={}){return mutateRoomGame((game)=>SequenceEngine.timeout(game,expected.turnUid,expected.guessEndsAt),{sound:"roundEnd"});},
  familyAnswer(text, expected={}){return mutateRoomGame((game)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Faza gry już się zmieniła.";return FamilyEngine.answer(game,state.currentUser,text);},{sound:"submit"});},
  familyTimeout(expected={}){const room=activeRoom();if(!room||room.gameMode!=="family")return;return mutateRoomGame((game)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Faza gry już się zmieniła.";FamilyEngine.timeout(game);},{sound:"roundEnd"});},
  familyNext(){return mutateRoomGame((game)=>FamilyEngine.next(game),{sound:"turn"});},
  wordChainAnswer(value, expected={}){return mutateRoomGame((game)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Faza gry już się zmieniła.";return WordChainEngine.answer(game,state.currentUser,value);},{sound:"submit"});},
  wordChainTimeout(expected={}){const room=activeRoom();if(!room||room.gameMode!=="word-chain")return;return mutateRoomGame((game)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Faza gry już się zmieniła.";WordChainEngine.timeout(game);},{sound:"roundEnd"});},
  numberMysteryAsk(question, expected={}){return mutateRoomGame((game)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Czas na pytanie już minął.";return NumberMysteryEngine.ask(game,state.currentUser,question);},{sound:"clue"});},
  numberMysteryAnswer(answer, expected={}){return mutateRoomGame((game)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Czas na odpowiedź już minął.";return NumberMysteryEngine.answer(game,state.currentUser,answer);},{sound:"choice"});},
  numberMysteryGuess(value, expected={}){return mutateRoomGame((game)=>{if(game.phase!==expected.phase&&game.roundMode!=="race")return "Faza gry już się zmieniła.";return NumberMysteryEngine.guess(game,state.currentUser,value);},{sound:"submit"});},
  async numberMysteryBuyHint(){
    const room=activeRoom(), item=inGamePurchaseById("number-hint"), user=profile();
    if(!room?.game||room.gameMode!=="number-mystery"||room.settings?.gamePurchases===false||!item||!user)return false;
    if(user.nickOnly)return message("Zaloguj się na konto, żeby kupować dodatki w grze.","info");
    if(Number(user.money||0)<item.price)return message(`Potrzebujesz ${item.price}$, aby kupić wskazówkę.`, "info");
    const changed=await mutateRoomGame((game)=>{game.purchaseUses=game.purchaseUses&&typeof game.purchaseUses==="object"?game.purchaseUses:{};if(game.purchaseUses[state.currentUser]?.[item.id])return "Ta wskazówka została już wykorzystana.";const number=Number(game.numbers?.[state.currentUser]);if(!Number.isFinite(number))return "Nie udało się przygotować wskazówki.";game.privateHints=game.privateHints&&typeof game.privateHints==="object"?game.privateHints:{};game.privateHints[state.currentUser]=number>75?"Twój numer jest większy niż 75.":"Twój numer jest równy lub mniejszy niż 75.";game.purchaseUses[state.currentUser]={...(game.purchaseUses[state.currentUser]||{}),[item.id]:true};},{sound:"purchase"});
    if(!changed)return false;
    updateProfile({money:Number(user.money||0)-item.price});
    message("Wskazówka została użyta.","info");
    return true;
  },
  numberMysteryUseOracle(){
    const room=activeRoom();
    if(!room?.game||room.gameMode!=="number-mystery"||room.settings?.gamePassesEnabled===false||!hasGamePass(profile(),"number-oracle"))return message("Nie masz aktywnej Wyroczni liczb.","error");
    return mutateRoomGame((game)=>NumberMysteryEngine.oracle(game,state.currentUser),{sound:"choice"});
  },
  numberMysteryTimeout(expected={}){const room=activeRoom();if(!room||room.gameMode!=="number-mystery")return;return mutateRoomGame((game)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Faza gry już się zmieniła.";NumberMysteryEngine.timeout(game);},{sound:"roundEnd"});},
  uniqueAnswerSubmit(text, expected={}){return mutateRoomGame((game,room)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Ta runda jest już zakończona.";return UniqueAnswerEngine.answer(game,state.currentUser,text,room.settings);},{sound:"submit",after:settleAdditionalModeResult});},
  uniqueAnswerHostPrompt(text, expected={}){return mutateRoomGame((game,room)=>{if(game.phase!==expected.phase)return "Pytanie jest już ustawione.";return UniqueAnswerEngine.hostPrompt(game,state.currentUser,text,room.settings);},{sound:"clue"});},
  uniqueAnswerTimeout(expected={}){const room=activeRoom();if(!room||room.gameMode!=="unique-answer")return;return mutateRoomGame((game,current)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Runda już się skończyła.";UniqueAnswerEngine.timeout(game,current.settings);},{sound:"roundEnd",after:settleAdditionalModeResult});},
  uniqueAnswerNext(){const room=activeRoom();if(!room||room.hostUid!==state.currentUser)return message("Tylko host może rozpocząć następną rundę.","info");return mutateRoomGame((game,current)=>UniqueAnswerEngine.nextRound(game,current.settings),{sound:"turn"});},
  connectAnswer(text, expected={}){return mutateRoomGame((game,room)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Czas na odpowiedzi już minął.";return ConnectEngine.answer(game,state.currentUser,text);},{sound:"submit"});},
  connectEditAnswer(text, expected={}){return mutateRoomGame((game,room)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Czas na odpowiedzi już minął.";if(room.settings?.gamePassesEnabled===false||!hasGamePass(profile(),"creative-license"))return "Nie masz aktywnej Licencji kreatywności.";return ConnectEngine.editAnswer(game,state.currentUser,text);},{sound:"submit"});},
  connectVote(target, expected={}){return mutateRoomGame((game)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Głosowanie już się zakończyło.";return ConnectEngine.vote(game,state.currentUser,target);},{sound:"vote"});},
  connectTimeout(expected={}){const room=activeRoom();if(!room||room.gameMode!=="polacz-nas")return;return mutateRoomGame((game)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Faza gry już się zmieniła.";ConnectEngine.timeout(game);},{sound:"roundEnd"});},
  connectNext(){const room=activeRoom();if(!room||room.hostUid!==state.currentUser)return message("Tylko host może rozpocząć następną rundę.","info");return mutateRoomGame((game,current)=>{const result=ConnectEngine.nextRound(game,current.settings);if(game.finished)current.status="results";return result;},{sound:"turn"});},
  liarAnswer(text, expected={}){return mutateRoomGame((game,room)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Czas na odpowiedzi już minął.";return LiarEngine.answer(game,state.currentUser,text,room.settings);},{sound:"submit"});},
  liarEditAnswer(text, expected={}){return mutateRoomGame((game,room)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Czas na odpowiedzi już minął.";if(room.settings?.gamePassesEnabled===false||!hasGamePass(profile(),"creative-license"))return "Nie masz aktywnej Licencji kreatywności.";return LiarEngine.editAnswer(game,state.currentUser,text);},{sound:"submit"});},
  liarStartVoting(expected={}){const room=activeRoom();if(!room||room.gameMode!=="klamca")return;if(room.hostUid!==state.currentUser)return message("Tylko host może rozpocząć głosowanie.","info");return mutateRoomGame((game,current)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Dyskusja już się zakończyła.";return LiarEngine.startVoting(game,current.settings);},{sound:"turn"});},
  liarVote(target, expected={}){return mutateRoomGame((game)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Głosowanie już się zakończyło.";return LiarEngine.vote(game,state.currentUser,target);},{sound:"vote"});},
  liarTimeout(expected={}){const room=activeRoom();if(!room||room.gameMode!=="klamca")return;return mutateRoomGame((game,current)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Faza gry już się zmieniła.";LiarEngine.timeout(game,current.settings);},{sound:"roundEnd"});},
  liarNext(){const room=activeRoom();if(!room||room.hostUid!==state.currentUser)return message("Tylko host może rozpocząć następną rundę.","info");return mutateRoomGame((game,current)=>LiarEngine.nextRound(game,current.settings),{sound:"turn"});},
  falseMessageAnswer(text, expected={}){return mutateRoomGame((game,room)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Czas na wiadomości już minął.";return FalseMessageEngine.answer(game,state.currentUser,text,room.settings);},{sound:"submit"});},
  falseMessageEditAnswer(text, expected={}){return mutateRoomGame((game,room)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Czas na wiadomości już minął.";if(room.settings?.gamePassesEnabled===false||!hasGamePass(profile(),"creative-license"))return "Nie masz aktywnej Licencji kreatywności.";return FalseMessageEngine.editAnswer(game,state.currentUser,text);},{sound:"submit"});},
  falseMessageChoose(answerUid, expected={}){return mutateRoomGame((game)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Czas wyboru już minął.";return FalseMessageEngine.choose(game,state.currentUser,answerUid);},{sound:"choice"});},
  boardAction(action,payload="",expected={}){const room=activeRoom();if(!room?.game||room.gameMode?.startsWith("board-")!==true)return false;return mutateRoomGame((game,current)=>{if(expected.phase&&game.phase!==expected.phase)return "Stan gry już się zmienił.";if(expected.phaseEndsAt&&Number(game.phaseEndsAt||0)!==Number(expected.phaseEndsAt||0)&&action==="timeout")return "Czas na ten ruch już minął.";return BoardEngine.action(game,state.currentUser,action,payload,current.players,current.settings);},{sound:action.includes("fire")||action.includes("move")||action.includes("drop")||action.includes("play")?"choice":"turn",after:settleAdditionalModeResult});},
  async boardUseTimeBoost(source){
    const room=activeRoom(),user=profile(),isPass=source==="board-pace-control",item=isPass?gamePassById("board-pace-control"):inGamePurchaseById("board-timeout-token");
    if(!room?.game||room.gameMode?.startsWith("board-")!==true||!user||!item)return false;
    if(user.nickOnly)return message("Zaloguj się na konto, żeby kupować dodatki w grze.","info");
    if(isPass){
      if(room.settings?.gamePassesEnabled===false||!hasGamePass(user,item.id))return message("Nie masz aktywnego gamepassa Mistrza tempa.","error");
    } else {
      if(room.settings?.gamePurchases===false)return message("Zakupy w tej grze są wyłączone.","error");
      if(Number(user.money||0)<item.price)return message(`Potrzebujesz ${item.price}$, aby kupić dodatkowe 15 sekund.`,"info");
    }
    const usesKey=isPass?"passUses":"purchaseUses";
    const changed=await mutateRoomGame((game,current)=>{
      game[usesKey]=game[usesKey]&&typeof game[usesKey]==="object"&&!Array.isArray(game[usesKey])?game[usesKey]:{};
      if(game[usesKey][state.currentUser]?.[item.id])return "Ten dodatek został już wykorzystany w tym meczu.";
      const result=BoardEngine.action(game,state.currentUser,"board-extend-time","",current.players,current.settings);
      if(result)return result;
      game[usesKey][state.currentUser]={...(game[usesKey][state.currentUser]||{}),[item.id]:true};
    },{sound:"purchase",after:settleAdditionalModeResult});
    if(!changed)return false;
    if(!isPass)updateProfile({money:Number(user.money||0)-item.price});
    message(isPass?"Mistrz tempa dodał ci 15 sekund.":"Kupiono dodatkowe 15 sekund.","info");
    return true;
  },
  boardRestart(){const room=activeRoom();if(!room||room.hostUid!==state.currentUser||room.gameMode?.startsWith("board-")!==true)return message("Tylko host może rozpocząć ponowny mecz.","info");return mutateRoomGame((game,current)=>{if(game.phase!=="result")return "Mecz jeszcze trwa.";BoardEngine.restart(game,current.players,current.settings);current.status="playing";},{sound:"gameStart"});},
  musicSearchTracks(query){return searchMusicTracks(query);},
  musicDuelSelect(track, expected={}){return mutateRoomGame((game,room)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Czas na wybór utworu już minął.";return MusicDuelEngine.select(game,state.currentUser,track,room.settings);},{sound:"submit"});},
  musicDuelVote(target, expected={}){return mutateRoomGame((game)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Głosowanie już się zakończyło.";return MusicDuelEngine.vote(game,state.currentUser,target);},{sound:"vote"});},
  musicDuelTimeout(expected={}){const room=activeRoom();if(!room||room.gameMode!=="pojedynek-hitow")return;return mutateRoomGame((game,current)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Faza gry już się zmieniła.";MusicDuelEngine.timeout(game,current.settings);},{sound:"roundEnd"});},
  musicDuelNext(){const room=activeRoom();if(!room||room.hostUid!==state.currentUser)return message("Tylko host może rozpocząć następną rundę.","info");return mutateRoomGame((game,current)=>{const result=MusicDuelEngine.nextRound(game,current.settings);if(game.finished)current.status="results";return result;},{sound:"turn",after:settleAdditionalModeResult});},
  musicArenaSelect(track, expected={}){return mutateRoomGame((game,room)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Czas na wybór utworu już minął.";return MusicArenaEngine.select(game,state.currentUser,track,room.settings);},{sound:"submit"});},
  musicArenaVote(target, expected={}){return mutateRoomGame((game)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Głosowanie już się zakończyło.";return MusicArenaEngine.vote(game,state.currentUser,target);},{sound:"vote"});},
  musicArenaTimeout(expected={}){const room=activeRoom();if(!room||room.gameMode!=="bitwa-hitow")return;return mutateRoomGame((game,current)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Faza gry już się zmieniła.";MusicArenaEngine.timeout(game,current.settings);},{sound:"roundEnd"});},
  musicArenaNext(){const room=activeRoom();if(!room||room.hostUid!==state.currentUser)return message("Tylko host może rozpocząć następną rundę.","info");return mutateRoomGame((game,current)=>{const result=MusicArenaEngine.nextRound(game,current.settings);if(game.finished)current.status="results";return result;},{sound:"turn",after:settleAdditionalModeResult});},
  popularityChoose(side, expected={}){return mutateRoomGame((game,room)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Czas na wybór już minął.";return PopularityEngine.choose(game,state.currentUser,side);},{sound:"choice"});},
  popularityTimeout(expected={}){const room=activeRoom();if(!room||room.gameMode!=="popularnosc-hitow")return;return mutateRoomGame((game)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Faza gry już się zmieniła.";PopularityEngine.timeout(game);},{sound:"roundEnd"});},
  popularityNext(){const room=activeRoom();if(!room||room.hostUid!==state.currentUser)return message("Tylko host może rozpocząć następną rundę.","info");return mutateRoomGame((game,current)=>{const result=PopularityEngine.nextRound(game,current.settings);if(game.finished)current.status="results";return result;},{sound:"turn",after:settleAdditionalModeResult});},
  popularitySoloStart(metric="views"){PopularitySoloEngine.start(state.currentUser||"guest",metric);render({forceEnter:true});},
  popularitySoloStop(){PopularitySoloEngine.stop(state.currentUser||"guest");render({forceEnter:true});},
  popularitySoloMetric(metric){PopularitySoloEngine.setMetric(state.currentUser||"guest",metric);render({preserveDrafts:true});},
  popularitySoloChoose(side){PopularitySoloEngine.choose(state.currentUser||"guest",side);Effects.play("choice");render({forceEnter:true});},
  falseMessageTimeout(expected={}){const room=activeRoom();if(!room||room.gameMode!=="falszywa-wiadomosc")return;return mutateRoomGame((game,current)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Faza gry już się zmieniła.";FalseMessageEngine.timeout(game,current.settings);},{sound:"roundEnd"});},
  falseMessageNext(){const room=activeRoom();if(!room||room.hostUid!==state.currentUser)return message("Tylko host może rozpocząć następną rundę.","info");return mutateRoomGame((game,current)=>FalseMessageEngine.nextRound(game,current.settings),{sound:"turn"});},
  randomSecretRuleCategory(){const room=activeRoom();if(!room||room.hostUid!==state.currentUser||room.gameMode!=="tajna-zasada")return;room.settings={...room.settings,category:secretRuleCategories[Math.floor(Math.random()*secretRuleCategories.length)]};touchRoom(room);animateHostSettingChange(room.settings.category);render({preserveDrafts:true});},
  secretRuleSetRule(text, expected={}){return mutateRoomGame((game,room)=>{if(game.phase!==expected.phase)return "Zasady zostały już zapisane.";return SecretRuleEngine.setRule(game,state.currentUser,text,room.settings);},{sound:"ready"});},
  secretRuleExample(text, expected={}){return mutateRoomGame((game,room)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Faza gry już się zmieniła.";return SecretRuleEngine.example(game,state.currentUser,text,room.settings);},{sound:"submit"});},
  secretRuleReviewExample(verdict, expected={}){return mutateRoomGame((game,current)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Ta decyzja jest już nieaktualna.";return SecretRuleEngine.reviewExample(game,state.currentUser,verdict,current.settings);},{sound:"choice"});},
  secretRuleStartGuess(expected={}){return mutateRoomGame((game,room)=>{if(game.phase!==expected.phase)return "Faza gry już się zmieniła.";return SecretRuleEngine.startGuess(game,state.currentUser,room.settings);},{sound:"choice"});},
  secretRuleCreativeGuess(expected={}){return mutateRoomGame((game,room)=>{if(game.phase!==expected.phase)return "Faza gry już się zmieniła.";if(room.settings?.gamePassesEnabled===false||!hasGamePass(profile(),"creative-license"))return "Nie masz aktywnej Licencji kreatywności.";return SecretRuleEngine.creativeGuess(game,state.currentUser,room.settings);},{sound:"choice"});},
  secretRuleGuess(text, expected={}){return mutateRoomGame((game,room)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Czas na zgadywanie minął.";return SecretRuleEngine.guess(game,state.currentUser,text,room.settings);},{sound:"submit"});},
  secretRuleReviewGuess(accepted, expected={}){return mutateRoomGame((game,current)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Ta decyzja jest już nieaktualna.";return SecretRuleEngine.reviewGuess(game,state.currentUser,accepted,current.settings);},{sound:accepted?"win":"choice",after:settleAdditionalModeResult});},
  secretRuleTimeout(expected={}){const room=activeRoom();if(!room||room.gameMode!=="tajna-zasada")return;return mutateRoomGame((game,current)=>{if(game.phase!==expected.phase||Number(game.phaseEndsAt)!==Number(expected.phaseEndsAt))return "Faza gry już się zmieniła.";SecretRuleEngine.timeout(game,current.settings);},{sound:"roundEnd",after:settleAdditionalModeResult});},
  friendshipAnswer(text){return mutateRoomGame((game,room)=>FriendshipTestEngine.answer(game,state.currentUser,text,room.players,room.settings),{sound:"submit"});},
  friendshipGuess(answerId,target){return mutateRoomGame((game,room)=>FriendshipTestEngine.guess(game,state.currentUser,answerId,target,room.players),{sound:"vote"});},
  friendshipTimeout(){const room=activeRoom();if(!room||room.gameMode!=="test-znajomosci")return;const phase=room.game?.phase;return mutateRoomGame((game,current)=>{if(game.phase!==phase)return"Faza gry juz sie zmienila.";FriendshipTestEngine.timeout(game,current.players,current.settings);});},
  friendshipRevealNext(){return mutateRoomGame((game,current)=>{if(game.phase!=="revealing")return"Odpowiedzi zostały już pokazane.";FriendshipTestEngine.nextReveal(game,current.players);});},
  friendshipRoundNext(){const room=activeRoom();if(closeLonelyFinishedRoom(room,{notify:true}))return;return mutateRoomGame((game,current)=>{if(game.phase!=="roundSummary")return"Runda została już zmieniona.";FriendshipTestEngine.nextRound(game,current.players,current.settings);},{after:settleFriendshipResult});},
  buyCosmetic(itemId) {
    const item = cosmetics.find(entry => entry.id === itemId), user = profile(); if (!item || !user || user.ownedCosmetics[itemId]) return;
    if (user.nickOnly) return message("Zaloguj się na konto, żeby kupować efekty."); if (user.money < item.price) return message("Nie masz tyle pieniędzy.");
    const quested=noteQuestEvent(noteQuestEvent(user,{type:"bought"}),{type:"spent",amount:item.price});
    Audio.play(`cosmetic${item.rarity[0].toUpperCase()}${item.rarity.slice(1)}`); updateProfile({ questStats:quested.questStats, money: user.money - item.price, ownedCosmetics: { ...user.ownedCosmetics, [itemId]: true } });
  },
  buyGamePass(id) {
    const item=gamePassById(id), user=profile();
    if (!item || !user || user.nickOnly) return message("Zaloguj się na konto, żeby kupować gamepassy.", "info");
    const current=gamePassState(user,item);
    if (current.owned) return actions.upgradeGamePass(id);
    if (Number(user.money||0)<item.price) return message("Nie masz tyle pieniędzy.", "info");
    updateProfile({ money:Number(user.money||0)-item.price, gamePasses:{...(user.gamePasses||{}),[id]:{level:1,purchasedAt:Date.now()}} });
    Audio.play("purchase"); message(`Odblokowano gamepass „${item.name}”.`, "info");
    return true;
  },
  async buyPotionPack(id) {
    const pack=potionPackById(id), user=profile();
    if(!pack||!user||user.nickOnly)return {ok:false,error:"Zaloguj się na konto, żeby kupować zestawy potek."};
    if(Number(user.money||0)<pack.price){const result={ok:false,error:`Potrzebujesz ${pack.price.toLocaleString("pl-PL")}$, aby kupić ten zestaw.`};message(result.error,"info");return result;}
    let result=await buyPotionPackRemote(id);
    const unavailable=!result?.code||["functions/internal","functions/not-found","functions/unavailable","internal","not-found","unavailable"].includes(String(result.code));
    if(!result?.ok&&unavailable&&hasOnlineBackend())result=await buyPotionPackDatabase(state.currentUser,id);
    if(result?.ok&&result.profile){
      state.accounts[state.currentUser]={...state.accounts[state.currentUser],...result.profile,potionInventory:normalizePotionInventory(result.profile.potionInventory),updatedAt:Date.now()};
      saveAccounts(state.accounts);render({preserveDrafts:true});Audio.play("purchase");message(`Kupiono ${pack.name}. Potki czekają w ekwipunku.`,"info");
    } else if(!result?.ok)message(result?.error||"Nie udało się kupić zestawu potek.");
    return result;
  },
  upgradeGamePass(id) {
    const item=gamePassById(id), user=profile();
    if (!item || !user || user.nickOnly) return message("Zaloguj się na konto, żeby ulepszać gamepassy.", "info");
    const current=gamePassState(user,item);
    if (!current.owned || current.complete) return false;
    if (Number(user.money||0)<current.nextPrice) return message("Nie masz tyle pieniędzy na ulepszenie.", "info");
    updateProfile({ money:Number(user.money||0)-current.nextPrice, gamePasses:{...(user.gamePasses||{}),[id]:{level:current.level+1,purchasedAt:user.gamePasses?.[id]?.purchasedAt||Date.now(),updatedAt:Date.now()}} });
    Audio.play("purchase"); message(`Ulepszono „${item.name}” do poziomu ${current.level+1}.`, "info");
    return true;
  },
  equipCosmetic(itemId) { const defaults={ defaultIdle:["selectedIdleAnimation",""], defaultWin:["selectedWinAnimation",""], defaultLose:["selectedLoseAnimation",""] , defaultLudoBoard:["selectedBoardLudoSkin","defaultLudoBoard"], defaultMemoryBoard:["selectedBoardMemorySkin","defaultMemoryBoard"] }; if(defaults[itemId]){ Audio.play("equip"); return updateProfile({ [defaults[itemId][0]]:defaults[itemId][1] }); } const item = cosmetics.find(entry => entry.id === itemId), user = profile(); if (!item || !user?.ownedCosmetics[itemId]) return; Audio.play(item.type==="win"||item.type==="lose"?item.id:"equip"); updateProfile({ [{ nick:"selectedNickEffect", frame:"selectedAvatarFrame", aura:"selectedAura", candy:"selectedCandySkin", bomb:"selectedBombSkin", clock:"selectedClockSkin", marker:"selectedMarkerSkin", sequence:"selectedSequenceSkin", "board-ludo":"selectedBoardLudoSkin", "board-memory":"selectedBoardMemorySkin", idle:"selectedIdleAnimation", win:"selectedWinAnimation", lose:"selectedLoseAnimation" }[item.type]]: itemId }); },
};

const hostOnlyRoundActions = ["nextRound", "otherNext", "mostLikelyNext", "bombNextRound", "closestTruthNext", "rankingNext", "clockNextRound", "pokemonNextRound", "wavelengthNext", "friendshipRoundNext", "familyNext", "poisonCandyNextRound", "connectNext", "liarNext", "falseMessageNext", "musicDuelNext", "musicArenaNext", "popularityNext"];
hostOnlyRoundActions.forEach(actionName => {
  const original = actions[actionName];
  if (!original) return;
  actions[actionName] = (...args) => {
    const room = activeRoom();
    if (room && room.hostUid !== state.currentUser) return message("Tylko host może rozpocząć następną rundę.", "info");
    return original(...args);
  };
});

function wrapTopbarAction(id, original) {
  return async (...args) => {
    const request = beginTopbarModal(id);
    if (!request) return;
    const result = original(...args);
    if (result?.then) await result;
    const modal = [...document.querySelectorAll(".modal-backdrop")].reverse().find(item => !item.dataset.topbarModal);
    finishTopbarModal(modal, id, request);
    return result;
  };
}
actions.openAccount = wrapTopbarAction("account", actions.openAccount);
actions.openLuckySpin = wrapTopbarAction("open-lucky-spin", actions.openLuckySpin);
actions.openEquipment = wrapTopbarAction("open-equipment", actions.openEquipment);
actions.openProgression = wrapTopbarAction("open-progression", actions.openProgression);
actions.openReportModal = wrapTopbarAction("open-report", actions.openReportModal);
actions.openFriends = wrapTopbarAction("open-friends", actions.openFriends);
actions.openChangelog = wrapTopbarAction("open-changelog", () => changelogModal());

function audioModal() {
  const settings = Audio.settings, modal = document.createElement("div"); modal.className = "modal-backdrop";
  modal.innerHTML = `<section class="modal audio-modal enter" role="dialog" aria-modal="true"><div class="modal-title"><div><p class="eyebrow">AUDIO</p><h2>Ustawienia dźwięku</h2></div><button class="icon-btn" data-close>${icon("x",18)}</button></div><label>Music Volume <span id="music-value">${Math.round(settings.musicVolume*100)}%</span></label><input id="music-volume" type="range" min="0" max="1" step="0.01" value="${settings.musicVolume}"><label>SFX Volume <span id="sfx-value">${Math.round(settings.sfxVolume*100)}%</span></label><input id="sfx-volume" type="range" min="0" max="1" step="0.01" value="${settings.sfxVolume}"><label class="check"><input id="mute-all" type="checkbox" ${settings.muted?"checked":""}> Mute All</label><p class="tiny">Ambient: ${Audio.currentTrack}. Ustawienia zapisują się automatycznie.</p></section>`;
  modal.querySelector("[data-close]").addEventListener("click",()=>actions.closeModal(modal)); $("#music-volume",modal).addEventListener("input",e=>{Audio.setMusicVolume(e.target.value);$("#music-value",modal).textContent=`${Math.round(e.target.value*100)}%`;}); $("#sfx-volume",modal).addEventListener("input",e=>{Audio.setSfxVolume(e.target.value);$("#sfx-value",modal).textContent=`${Math.round(e.target.value*100)}%`;}); $("#mute-all",modal).addEventListener("change",e=>Audio.setMuted(e.target.checked)); document.body.append(modal); Audio.play("modalOpen");
}
function changelogModal() {
  const modal=document.createElement("div");modal.className="modal-backdrop";
  const entryHtml=entry=>`<article class="changelog-entry"><p class="eyebrow">${escapeHtml(entry.date)} · ${escapeHtml(entry.version)}</p><h2>${escapeHtml(entry.title)}</h2><ul>${entry.changes.map(change=>`<li>${escapeHtml(change)}</li>`).join("")}</ul>${entry.version==="v4.2.0"?`<div class="changelog-actions"><button class="primary" type="button" data-open-gamepass-shop>${icon("shop",16)} Otwórz gamepassy i zakupy</button></div>`:""}</article>`;
  const bindEntryActions=()=>modal.querySelector("[data-open-gamepass-shop]")?.addEventListener("click",()=>{actions.closeModal(modal);actions.openShop();});
  modal.innerHTML=`<section class="modal changelog-modal enter" role="dialog" aria-modal="true"><div class="modal-title"><div><p class="eyebrow">CHANGELOG</p><h2>Historia aktualizacji</h2></div><button class="icon-btn" data-close>${icon("x",18)}</button></div><div class="changelog-layout"><aside>${changelogEntries.map((entry,index)=>`<button class="changelog-version ${index?"":"active"}" data-changelog-index="${index}"><b>${escapeHtml(entry.version)}</b><small>${escapeHtml(entry.date)}</small></button>`).join("")}</aside><div id="changelog-current">${entryHtml(latestChangelog)}</div></div></section>`;
  modal.querySelector("[data-close]").addEventListener("click",()=>actions.closeModal(modal));
  bindEntryActions();
  modal.querySelectorAll("[data-changelog-index]").forEach(button=>button.addEventListener("click",()=>{const entry=changelogEntries[Number(button.dataset.changelogIndex)]||latestChangelog;modal.querySelectorAll("[data-changelog-index]").forEach(item=>item.classList.toggle("active",item===button));$("#changelog-current",modal).innerHTML=entryHtml(entry);bindEntryActions();}));
  document.body.append(modal);Audio.play("modalOpen");
}
function topBar() { const user = profile(), room = activeRoom(), canReport = room && reportableMode(room) && ["room","game"].includes(Router.current), onlineLabel=onlineCountLabel(), friends=friendRequestCount(user), spinReady=user&&isLuckySpinAvailable(user); return `<header class="topbar"><div class="brand-zone"><button class="brand" id="brand-home">${icon("zap",20)} <span>Gry grupowe!</span></button>${user?levelProgressButtonHtml(user):""}</div><nav class="top-actions"><span class="online-count-pill" data-count="${state.onlineCount}" data-tooltip="${onlineLabel}"><i></i><b>${state.onlineCount}</b> online</span>${user?`<button class="icon-btn friends-button" id="open-friends" aria-label="Znajomi">${icon("users",18)}${friends?`<b class="friends-count">${friends}</b>`:""}</button>`:""}<button class="icon-btn changelog-button" id="open-changelog" aria-label="Changelog ${latestChangelog.version}">${icon("scroll",18)}</button>${user?`<button class="icon-btn lucky-spin-top-button" id="open-lucky-spin" aria-label="Lucky Spin" title="Lucky Spin">🎡${spinReady?'<b class="topbar-alert-badge">1</b>':""}</button><button class="icon-btn equipment-top-button" id="open-equipment" aria-label="Ekwipunek" title="Ekwipunek">🎒</button>`:""}<button class="icon-btn settings-top-button" id="open-settings" aria-label="Ustawienia" title="Ustawienia">${icon("settings",18)}</button>${canReport?'<button class="icon-btn report-top-button" id="open-report" aria-label="Zgłoś gracza">⚠️</button>':""}${user ? `<button class="icon-btn" id="open-shop" aria-label="Sklep">${icon("shop",18)}</button><div class="money ${user.nickOnly?"muted-money":""}">$${user.nickOnly?user.sessionMoney||0:user.money}</div><button class="account-button" id="account">${playerMini(user)}</button>` : `<button class="account-button" id="account">${icon("user",18)} Konto</button>`}</nav></header>`; }
const draftFieldSelector = 'input:not([type]), input[type="text"], input[type="search"], input[type="number"], input[type="email"], input[type="url"], input[type="tel"], textarea';
function cssSelectorValue(value) {
  return window.CSS?.escape ? CSS.escape(value) : String(value).replace(/["\\]/g, "\\$&");
}
function draftFieldKey(field, index) {
  if (field.id) return `#${cssSelectorValue(field.id)}`;
  if (field.name) return `${field.tagName.toLowerCase()}[name="${cssSelectorValue(field.name)}"]`;
  return `__draft_index_${index}`;
}
function fieldSelection(field) {
  try { return { start:field.selectionStart, end:field.selectionEnd }; } catch { return { start:null, end:null }; }
}
function captureInputDrafts(container) {
  const fields = [...container.querySelectorAll(draftFieldSelector)];
  const active = document.activeElement;
  return {
    scrollX:window.scrollX,
    scrollY:window.scrollY,
    fields:fields.map((field, index) => { const selection = field === active ? fieldSelection(field) : { start:null, end:null }; return ({
      key:draftFieldKey(field,index),
      index,
      value:field.value,
      active:field === active,
      start:Number.isFinite(selection.start) ? selection.start : null,
      end:Number.isFinite(selection.end) ? selection.end : null,
    }); }),
  };
}
function restoreInputDrafts(container, draftState = { fields:[] }) {
  const fields = [...container.querySelectorAll(draftFieldSelector)];
  draftState.fields.forEach(draft => {
    const field = draft.key.startsWith("__draft_index_") ? fields[draft.index] : container.querySelector(draft.key);
    if (!field || field.disabled || field.readOnly) return;
    field.value = draft.value;
    if (!draft.active) return;
    try { field.focus({ preventScroll:true }); } catch { field.focus(); }
    if (draft.start !== null && typeof field.setSelectionRange === "function") field.setSelectionRange(draft.start, draft.end);
  });
  if (Number.isFinite(draftState.scrollY)) requestAnimationFrame(()=>window.scrollTo(draftState.scrollX||0,draftState.scrollY));
}
function renderGameError(view, room, error) {
  console.error("Błąd renderowania trybu gry", room?.gameMode, error);
  view.innerHTML = `<main class="page enter"><section class="panel center"><p class="eyebrow">SYNCHRONIZACJA GRY</p><h1>Ten tryb dostał niepełny stan pokoju</h1><p class="muted">Nie pokazuję już pustej strony. Spróbuj odświeżyć widok albo wróć do pokoju i rozpocznij rundę jeszcze raz.</p><p class="tiny">${escapeHtml(error?.message || "Nieznany błąd renderera")}</p><div class="choice-row"><button class="primary" id="retry-game-render">Spróbuj ponownie</button><button class="ghost" id="leave-broken-game">Wyjdź z pokoju</button></div></section></main>`;
  $("#retry-game-render")?.addEventListener("click", render);
  $("#leave-broken-game")?.addEventListener("click", () => actions.leaveRoom("platform"));
}
function settingsModal() {
  const user = profile(), audio = Audio.settings, modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.innerHTML = `<section class="modal settings-modal enter" role="dialog" aria-modal="true" aria-labelledby="settings-title"><div class="modal-title"><div><p class="eyebrow">PREFERENCJE</p><h2 id="settings-title">Ustawienia</h2></div><button class="icon-btn" data-close aria-label="Zamknij">${icon("x",18)}</button></div><div class="settings-group"><h3>Wygląd</h3><label class="settings-toggle"><span><b>Jasny motyw</b><small>Zmień wygląd całej strony, lobby i gier.</small></span><input id="settings-theme" type="checkbox" ${lightThemeEnabled()?"checked":""}></label></div><div class="settings-group"><h3>Dźwięk</h3><label>Muzyka <span id="settings-music-value">${Math.round(audio.musicVolume*100)}%</span></label><input id="settings-music" type="range" min="0" max="1" step="0.01" value="${audio.musicVolume}"><label>Efekty dźwiękowe <span id="settings-sfx-value">${Math.round(audio.sfxVolume*100)}%</span></label><input id="settings-sfx" type="range" min="0" max="1" step="0.01" value="${audio.sfxVolume}"><label class="settings-toggle"><span><b>Wycisz wszystkie dźwięki</b><small>Wyłącza muzykę i efekty dźwiękowe.</small></span><input id="settings-muted" type="checkbox" ${audio.muted?"checked":""}></label></div><div class="settings-group"><h3>Sekwencja</h3><label class="settings-toggle"><span><b>Tryb daltonisty</b><small>Pokazuje nazwy kolorów na klockach sekwencji.</small></span><input id="settings-colorblind" type="checkbox" ${user?.colorblindMode?"checked":""} ${user?"":"disabled"}></label>${user?"":"<p class=\"tiny\">Zaloguj się, aby zapisać to ustawienie.</p>"}</div></section>`;
  const close=()=>actions.closeModal(modal); modal.querySelector("[data-close]").addEventListener("click",close); modal.addEventListener("click",event=>{if(event.target===modal)close();});
  $("#settings-theme",modal).addEventListener("change",event=>{const next=event.target.checked?"light":"dark";localStorage.setItem(THEME_STORAGE_KEY,next);applyTheme(next);render({forceEnter:true});});
  $("#settings-music",modal).addEventListener("input",event=>{Audio.setMusicVolume(event.target.value);$("#settings-music-value",modal).textContent=`${Math.round(event.target.value*100)}%`;}); $("#settings-sfx",modal).addEventListener("input",event=>{Audio.setSfxVolume(event.target.value);$("#settings-sfx-value",modal).textContent=`${Math.round(event.target.value*100)}%`;}); $("#settings-muted",modal).addEventListener("change",event=>Audio.setMuted(event.target.checked)); $("#settings-colorblind",modal).addEventListener("change",event=>actions.setColorblindMode(event.target.checked)); document.body.append(modal); Audio.play("modalOpen"); return modal;
}
function scheduleRoomBot(room) {
  if(!room?.game||room.hostUid!==state.currentUser||!botIds(room).length)return;
  let plan;
  plan=scheduleBot(room,{mutate:mutation=>mutateRoomGame(mutation,{sound:"turn",after:updated=>{if(updated.gameMode==="udowodnij")settleProveResult(updated);}}),onDone:()=>{if(botSchedules.get(room.roomId)===plan?.key)botSchedules.delete(room.roomId);}});
  if(!plan||botSchedules.get(room.roomId)===plan.key)return;
  botSchedules.set(room.roomId,plan.key);
  window.setTimeout(()=>{if(botSchedules.get(room.roomId)!==plan.key)return;const current=activeRoom();if(current?.roomId===room.roomId&&current.hostUid===state.currentUser&&current.game)plan.run().catch(()=>{});else botSchedules.delete(room.roomId);},plan.delay);
}
function gameHasHonorWindow(room) {
  const game = room?.game;
  return Boolean(game && room.players?.length > 1 && room.players.includes(state.currentUser) && (game.finished === true || ["result","results","gameSummary"].includes(game.phase)));
}
function addHonorPrompt(view, room) {
  if (!gameHasHonorWindow(room) || view.querySelector("[data-honor-prompt]")) return;
  const prompt = document.createElement("section");
  prompt.className = "panel honor-prompt";
  prompt.dataset.honorPrompt = "true";
  prompt.innerHTML = `<div><p class="eyebrow">HONOR</p><h3>Doceniasz kogoś z tej gry?</h3><p class="muted">Wyróżnij jedną osobę. To opcjonalne i nie wpływa na wynik.</p></div><button class="primary" data-open-honor>Wyróżnij gracza</button>`;
  prompt.querySelector("[data-open-honor]").addEventListener("click", () => actions.openHonor(room));
  view.append(prompt);
}
function renderHappyHourBanner() {
  window.clearInterval(happyHourTimer);
  window.clearTimeout(happyHourRefreshTimer);
  happyHourResizeObserver?.disconnect();
  happyHourResizeObserver = null;
  happyHourTimer = 0;
  happyHourRefreshTimer = 0;
  root.classList.remove("has-happy-hour-banner");
  root.style.removeProperty("--happy-hour-height");
  document.querySelectorAll(".happy-hour-banner, .happy-hour-reopen").forEach(item => item.remove());
  const event = happyHourAt(serverNow());
  const nextChange = happyHourNextChange(serverNow());
  if (!event) { if (nextChange) happyHourRefreshTimer = window.setTimeout(() => { if (root.isConnected) render(); }, Math.max(100, nextChange - serverNow() + 80)); return; }
  root.insertAdjacentHTML("beforeend", happyHourBannerHtml(event));
  const banner = root.querySelector(".happy-hour-banner"), reopen = root.querySelector(".happy-hour-reopen"), countdown = banner?.querySelector("[data-happy-hour-countdown]");
  const dismissedKey = `happy-hour-dismissed:${event.eventId}`;
  const isDismissed = localStorage.getItem(dismissedKey) === "1";
  const setBannerVisibility = dismissed => {
    if (dismissed) {
      banner?.remove();
      root.classList.remove("has-happy-hour-banner");
      root.style.removeProperty("--happy-hour-height");
      reopen?.removeAttribute("hidden");
    } else {
      reopen?.setAttribute("hidden", "");
      root.classList.add("has-happy-hour-banner");
    }
  };
  setBannerVisibility(isDismissed);
  const seenKey = `happy-hour-seen:${event.eventId}`;
  if (!localStorage.getItem(seenKey)) { localStorage.setItem(seenKey, "1"); message(`${event.icon} Happy Hour: ${event.label}`, "info"); }
  banner?.querySelector("[data-happy-hour-dismiss]")?.addEventListener("click", () => { localStorage.setItem(dismissedKey, "1"); renderHappyHourBanner(); });
  reopen?.addEventListener("click", () => { localStorage.removeItem(dismissedKey); renderHappyHourBanner(); });
  const syncBannerLayout = () => {
    if (!banner?.isConnected) return;
    const topbar = root.querySelector(".topbar");
    const topbarRect = topbar?.getBoundingClientRect();
    const topbarBottom = topbarRect ? (topbarRect.bottom > 0 ? topbarRect.bottom : topbarRect.height) : 0;
    banner.style.setProperty("--happy-hour-top", `${Math.ceil(topbarBottom + 12)}px`);
    root.style.setProperty("--happy-hour-height", `${Math.ceil(banner.getBoundingClientRect().height)}px`);
  };
  syncBannerLayout();
  if (window.ResizeObserver) {
    happyHourResizeObserver = new ResizeObserver(syncBannerLayout);
    const topbar = root.querySelector(".topbar");
    if (topbar) happyHourResizeObserver.observe(topbar);
    happyHourResizeObserver.observe(banner);
  }
  happyHourTimer = window.setInterval(() => {
    const left = Math.max(0, Math.ceil((event.endsAt - serverNow()) / 1000));
    if (countdown) countdown.textContent = formatHappyHourCountdown(left);
    if (!left) { window.clearInterval(happyHourTimer); happyHourTimer = 0; document.querySelectorAll(".happy-hour-banner, .happy-hour-reopen").forEach(item => item.remove()); root.classList.remove("has-happy-hour-banner"); root.style.removeProperty("--happy-hour-height"); render(); }
  }, 1000);
}

const roundAdvanceControls = {
  udowodnij: { selector: "#next-round", action: "nextRound", delay: 3000 },
  "inne-pytanie": { selector: "#other-next", action: "otherNext" },
  "kto-najpredzej": { selector: "#most-next", action: "mostLikelyNext" },
  bomba: { selector: "#bomb-next-round", action: "bombNextRound" },
  "najblizej-prawdy": { selector: "#truth-next-round", action: "closestTruthNext" },
  ranking: { selector: "#ranking-next-round", action: "rankingNext" },
  zegar: { selector: "#clock-next-round", action: "clockNextRound", delay: 5000 },
  wavelength: { selector: "#wavelength-next", action: "wavelengthNext" },
  "test-znajomosci": { selector: "#friend-round-next", action: "friendshipRoundNext" },
  "zatruty-cukierek": { selector: "#candy-next-round", action: "poisonCandyNextRound", delay: 15000 },
  "unique-answer": { selector: "#unique-answer-next", action: "uniqueAnswerNext", delay: 8000 },
  "pojedynek-hitow": { selector: "#music-duel-next", action: "musicDuelNext", delay: 7000 },
  "bitwa-hitow": { selector: "#music-arena-next", action: "musicArenaNext", delay: 7000 },
  "popularnosc-hitow": { selector: "#popularity-next", action: "popularityNext", delay: 7000 },
};

function roundAdvanceControl(room) {
  if (room?.gameMode?.startsWith("pokemon-")) return { selector: "#pokemon-next", action: "pokemonNextRound" };
  return roundAdvanceControls[room?.gameMode];
}

function setupRoundAdvance(view, room, actions) {
  const config = roundAdvanceControl(room), game = room?.game;
  if (!config || game?.finished) return;
  const button = view.querySelector(config.selector);
  if (!button) return;
  const isHost = room.hostUid === state.currentUser;
  button.disabled = !isHost;
  button.setAttribute("aria-disabled", String(!isHost));
  button.classList.add("host-round-control");
  if (!isHost) button.title = "Tylko host może rozpocząć następną rundę.";
  // Wynik rankingu może mieć ten sam numer rundy po ponownym użyciu pokoju.
  // revealedAt rozróżnia konkretne podsumowanie, dzięki czemu stary timer nie
  // przejmuje nowego wyniku i nie przeskakuje go natychmiast.
  const resultIdentity = room.gameMode === "ranking" ? (game.revealedAt || game.resultId || "") : "";
  const key = `${room.roomId}:${room.gameMode}:${game.round || 0}:${game.phase}:${resultIdentity}`;
  const delay = Number(config.delay) || 10000;
  const deadline = roundAdvanceDeadlines.get(key) || Date.now() + delay;
  roundAdvanceDeadlines.set(key, deadline);
  const finalReveal=(room.gameMode === "zegar" && game.result?.gameOver) || (room.gameMode === "udowodnij" && Number(game.round || 1) >= Number(game.totalRounds || room.settings?.rounds || 5));
  const notice = document.createElement("p");
  notice.className = "round-advance-notice";
  const autoLabel=finalReveal ? "Podsumowanie pokaże się automatycznie za" : "Kolejna runda rozpocznie się automatycznie za";
  notice.innerHTML = isHost ? `${autoLabel} <b data-round-advance-countdown></b>.` : `Czekamy na hosta. ${autoLabel} <b data-round-advance-countdown></b>.`;
  button.insertAdjacentElement("afterend", notice);
  const update = () => {
    const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    const countdown = notice.querySelector("[data-round-advance-countdown]");
    if (countdown) countdown.textContent = `${left}s`;
    return left;
  };
  update();
  roundAdvanceInterval = window.setInterval(update, 1000);
  roundAdvanceTimer = window.setTimeout(() => {
    window.clearInterval(roundAdvanceInterval);
    if (isHost && activeRoom()?.roomId === room.roomId && activeRoom()?.game?.phase === game.phase) actions[config.action]();
  }, Math.max(100, deadline - Date.now() + 50));
}

function renderNow(options = {}) {
  hideCommerceTooltip();
  updateDocumentTitle();
  const softRender = !options?.forceEnter && Router.current === lastRenderedRoute;
  const drafts = (options?.preserveDrafts || softRender) ? captureInputDrafts(root) : {fields:[]};
  const preservedScrollY = softRender ? window.scrollY : null;
  if (softRender) {
    root.classList.add("soft-render");
    root.style.minHeight = `${Math.max(root.offsetHeight, window.innerHeight)}px`;
  } else root.classList.remove("soft-render");
  window.__activityStats=activityStats();
  lastRenderedRoute=Router.current;
  lastRenderedScreenSignature=currentScreenSignature();
  stopShopTimer(); stopGameTimer(); stopImpostorTimer(); stopIdentityTimer(); stopOtherQuestionTimer(); stopMostLikelyTimer(); stopFriendshipTimer(); stopPoisonCandyTimer(); stopBombTimer(); stopFiveSecondsTimer(); stopClockTimer(); stopPokemonTimer(); stopWavelengthTimer(); stopQuizTimer(); stopMathematicsTimer(); stopMarkerTimer(); stopSequenceTimer(); stopFamilyTimer(); stopWordChainTimer(); stopNumberMysteryTimer(); stopUniqueAnswerTimer(); stopConnectTimer(); stopLiarTimer(); stopFalseMessageTimer(); stopSecretRuleTimer(); stopMusicTimer(); stopPopularityTimer(); stopBoardGameTimer();
  window.clearTimeout(roundAdvanceTimer); window.clearInterval(roundAdvanceInterval); roundAdvanceTimer = 0; roundAdvanceInterval = 0;
  const shell = document.createElement("template");
  shell.innerHTML = `<div class="bg-orb orb1"></div><div class="bg-orb orb2"></div>${topBar()}`;
  root.replaceChildren(...shell.content.childNodes);
  $("#brand-home").addEventListener("click",actions.goPlatform); $("#open-progression")?.addEventListener("click",actions.openProgression); $("#open-changelog")?.addEventListener("click",changelogModal); $("#open-lucky-spin")?.addEventListener("click",actions.openLuckySpin); $("#open-equipment")?.addEventListener("click",actions.openEquipment); $("#open-settings")?.addEventListener("click",actions.openSettings); $("#account").addEventListener("click",actions.openAccount); $("#open-shop")?.addEventListener("click",actions.openShop); $("#open-friends")?.addEventListener("click",()=>actions.openFriends()); $("#open-inbox")?.addEventListener("click",actions.openInbox); $("#open-report")?.addEventListener("click",()=>actions.openReportModal()); updateConnectionStatus();
  const finish = result => {
    const after = () => { renderHappyHourBanner(); if(screen==="game"&&!root.querySelector(".adsense-game-rail"))root.insertAdjacentHTML("beforeend",adSenseBlock("Reklama","game-rail")); activatePublicAds(root,screen); restoreInputDrafts(root,drafts); if(softRender)requestAnimationFrame(()=>{root.style.minHeight="";if(Number.isFinite(preservedScrollY))window.scrollTo(0,preservedScrollY);}); };
    if(result?.then)return result.finally(after);
    after();
    return result;
  };
  const view=document.createElement("div"); root.append(view); const screen=Router.current;
  if(screen!=="solo") stopWouldYouRather();
  view.className = `route-view route-${String(screen).replace(/[^a-z0-9_-]/gi, "-")} ${softRender ? "soft-route" : "initial-route"}`;
  if(screen!=="game") identityVoiceChat.stop();
  if(!["platform","room","game"].includes(screen)&&!screen.startsWith("public:"))deactivatePublicAds();
  if(screen.startsWith("public:")) return finish(renderPublicPage(view,screen,actions));
  if(screen==="platform") { ensureRoomPresence(null); return finish(renderPlatform(view,actions,{voterId:state.currentUser || "anonymous",globalStats:state.globalStats})); } if(screen==="pokemon-select") return finish(renderPokemonModes(view,actions)); if(screen==="board-select") return finish(renderBoardModes(view,actions)); if(screen==="quiz-select") return profile()?finish(renderQuizSelect(view,actions)):Router.go("platform"); if(screen==="solo") return finish(state.selectedGameMode === "popularnosc-solo" ? renderPopularitySolo(view,{profile:profile(),playerId:getFirebaseSession()?.uid||state.currentUser},actions) : renderWouldYouRather(view,{profile:profile(),playerId:getFirebaseSession()?.uid||state.currentUser},actions)); if(screen==="lobby") { const joinedRoom=activeRoom(); if(joinedRoom) return Router.go(joinedRoom.status === "lobby" ? "room" : "game"); return profile()?finish(renderLobby(view,state,actions)):Router.go("platform"); } if(screen==="shop") return profile()?finish(renderShop(view,{profile:profile()},actions)):actions.openAuth();
  const room=activeRoom(); if(!room) { ensureRoomPresence(null); return Router.go("platform"); } ensureRoomPresence(room); if(duoRoomHasGonePlayer(room)){ removeRemoteRoom(room.roomId); removeRoomLocally(room.roomId); state.activeRoomId=null; persistSession(); return Router.go("platform"); } if(leaveKickedRoom(room))return; if(closeLonelyFinishedRoom(room,{notify:true}))return;
  if(screen==="game") {
    try {
      const mode=getGameMode(room.gameMode);
      if(!room.game || typeof room.game!=="object" || Array.isArray(room.game)) {
        view.innerHTML = `<main class="page enter"><section class="panel center"><p class="eyebrow">SYNCHRONIZACJA GRY</p><h1>Przygotowujemy rozgrywkę…</h1><p class="muted">Pokój został uruchomiony. Czekam na pełny stan gry z serwera.</p><div class="choice-row"><button class="primary" id="retry-game-render">Sprawdź ponownie</button><button class="ghost" id="leave-broken-game">Wyjdź z pokoju</button></div></section></main>`;
        $("#retry-game-render")?.addEventListener("click", render);
        $("#leave-broken-game")?.addEventListener("click", () => actions.leaveRoom("platform"));
        return finish();
      }
      if(mode.id==="marker") room.game.markerSkin=state.accounts[state.currentUser]?.selectedMarkerSkin||"defaultMarker";
      claimPendingProgress(room);
      const repaired=repairGameStateForPlayers(room);
      if(repaired&&hasOnlineBackend()&&room.players.includes(state.currentUser)){const repairSignature=stableStringify({players:room.players,settings:room.settings,game:room.game});if(repairedRoomSignatures.get(room.roomId)!==repairSignature){repairedRoomSignatures.set(room.roomId,repairSignature);touchRoom(room);}}
      settleAllResults(room); trackFinishedGame(room); recordCurrentUserGameHistory(room); scheduleRoomBot(room); lastRenderedScreenSignature=currentScreenSignature();
      const finalOutcome=finalGameOutcome(room); markGamePhaseTransition(view,room); window.__gameFinalAudio=finalOutcome; window.__lastFinalEffect=false;
      const rendered=mode.render(view,{room,accounts:state.accounts,currentUser:state.currentUser,mode},actions);
      if(finalOutcome&&!window.__lastFinalEffect) Effects.play(finalOutcome,`${room.roomId}:final:${room.game.phase||""}:${room.game.round||0}:${room.game.finishedAt||""}`);
      window.__gameFinalAudio=""; window.__lastFinalEffect=false;
      setupRoundAdvance(view, room, actions);
      renderQuickReactions(view, room, state.accounts, actions);
      addHonorPrompt(view, room);
      identityVoiceChat.sync(room,state.currentUser).catch(()=>{});
      return finish(rendered);
    } catch(error) { window.__gameFinalAudio=""; window.__lastFinalEffect=false; identityVoiceChat.stop(); return finish(renderGameError(view,room,error)); }
  }
  const renderedRoom = renderRoom(view,{room,accounts:state.accounts,currentUser:state.currentUser},actions);
  renderHostAnnouncements(view, room, state.currentUser, actions, () => { if (Router.current === "room" && activeRoom()?.roomId === room.roomId) render({ preserveDrafts:true }); });
  return finish(renderedRoom);
}
function render(options = {}) {
  pendingRenderOptions = {
    ...(pendingRenderOptions || {}),
    ...options,
    preserveDrafts: Boolean(pendingRenderOptions?.preserveDrafts || options?.preserveDrafts),
    forceEnter: Boolean(pendingRenderOptions?.forceEnter || options?.forceEnter),
  };
  if (renderFrame) return;
  renderFrame = requestAnimationFrame(() => {
    renderFrame = 0;
    const nextOptions = pendingRenderOptions || {};
    pendingRenderOptions = null;
    renderNow(nextOptions);
  });
}
function cleanStaleRoomSnapshot(room) {
  const stale = staleRoomPlayerIds(room);
  if (!stale.length) return room;
  const players = rawRoomPlayers(room);
  const humans = players.filter(uid => !isBotId(uid));
  const liveHumans = humans.filter(uid => !stale.includes(uid));
  const currentIsLive = state.currentUser && liveHumans.includes(state.currentUser);
  // W aktywnej rozgrywce dwuosobowej odejście jednej osoby kończy pokój —
  // nie zostawiaj drugiego gracza w nieskończonym oczekiwaniu.
  const shouldClose = !liveHumans.length || (room.status === "playing" && humans.length === 2 && liveHumans.length === 1);
  if (shouldClose) {
    if (currentIsLive && players.includes(state.currentUser)) {
      removeRemoteRoom(room.roomId);
      removeRoomLocally(room.roomId);
    }
    return null;
  }
  const keptPlayers = players.filter(uid => !stale.includes(uid));
  const playerProfiles = { ...(room.playerProfiles || {}) };
  const joinedAt = { ...(room.joinedAt || {}) };
  const presence = { ...(room.presence || {}) };
  stale.forEach(uid => { delete playerProfiles[uid]; delete joinedAt[uid]; delete presence[uid]; });
  const hostUid = stale.includes(room.hostUid) ? liveHumans[0] : room.hostUid;
  const cleaned = { ...room, players:keptPlayers, playerProfiles, joinedAt, presence, hostUid };
  if (currentIsLive && !staleRoomCleanupLocks.has(room.roomId)) {
    staleRoomCleanupLocks.add(room.roomId);
    cleaned.updatedAt = Math.max(serverNow(), Number(room.updatedAt || 0) + 1);
    syncRoomState(cleaned).finally(() => staleRoomCleanupLocks.delete(room.roomId));
  }
  return cleaned;
}
function connectRooms(){
  stopRoomsSubscription();
  clearInterval(activeRoomPollTimer);
  state.onlineBackend=hasOnlineBackend()?null:false;
  stopRoomsSubscription=subscribeRemoteRooms((remoteRooms,source)=>{
    if (source === "remote") remoteRooms = remoteRooms.map(cleanStaleRoomSnapshot).filter(Boolean);
    const previousActiveRoom = activeRoom();
    state.onlineBackend=source==="remote"?true:source==="local"?false:null; updateConnectionStatus();
    const ghostRooms=remoteRooms.filter(room=>["lobby","playing"].includes(room.status)&&!roomHasHumanPlayers(room));
    ghostRooms.filter(room=>room.players.includes(state.currentUser)).forEach(room=>removeRemoteRoom(room.roomId));
    remoteRooms=remoteRooms.filter(room=>!ghostRooms.some(ghost=>ghost.roomId===room.roomId));
    const requestedRoomId=state.activeRoomId;
    const keepLocal=source!=="remote"?state.rooms:state.rooms.filter(room=>pendingRoomSyncs.has(room.roomId));
    const rooms=new Map(keepLocal.map(room=>[room.roomId,room]));
    const currentRooms=new Map(state.rooms.map(room=>[room.roomId,room]));
    let profilesChanged=false;
    remoteRooms.forEach(remote=>{
      const local=currentRooms.get(remote.roomId),pending=pendingRoomSyncs.has(remote.roomId),keepPendingLocal=local&&pending&&Number(local.updatedAt||0)>Number(remote.updatedAt||0),room=keepPendingLocal?local:remote;
      rooms.set(room.roomId,room);
      if (!keepPendingLocal) profilesChanged = mergeRemoteRoomProfiles(room) || profilesChanged;
    });
    state.rooms=[...rooms.values()];
    if (profilesChanged) saveAccounts(state.accounts);
    ensureRoomPresence(state.rooms.find(item=>item.roomId===state.activeRoomId));
    state.rooms.filter(room=>room.players.includes(state.currentUser)&&duoRoomHasGonePlayer(room)).forEach(room=>removeRemoteRoom(room.roomId));
    const room=activeRoom();
    if(room&&source==="remote"&&leaveKickedRoom(room))return;
    if(room&&interruptProveRoundWithMissingPlayer(room)){if(closeLonelyFinishedRoom(room,{notify:true}))return;touchRoom(room);return render();}
    if(room&&closeLonelyFinishedRoom(room,{notify:true}))return;
    if(requestedRoomId&&source==="remote"&&!room&&!pendingRoomSyncs.has(requestedRoomId)){state.activeRoomId=null;clearPendingInvite({clearUrl:true});persistSession();Router.go("platform");showRoomClosedNotice();return;}
    announceRoomRoster(room);announceRoomPhase(room);
    if(claimPendingProgress(room))return render({preserveDrafts:true});
    if(room?.status==="lobby"&&room.gameMode==="quiz"&&room.settings?.quizVariant==="competitive"&&room.players.length>=2&&room.hostUid===state.currentUser)return actions.startGame();
    if(room?.status==="playing"&&room.game&&Router.current==="room"){Effects.play("gameStart",`${room.roomId}:game-start`);return Router.go("game");}
    if(room?.status==="lobby"&&Router.current==="game")return Router.go("room");
    if(!restoredRoom&&room){restoredRoom=true;setRoomUrl(room);return Router.go(room.game?"game":"room");}
    if(["platform","lobby","room","game"].includes(Router.current)&&currentScreenSignature()!==lastRenderedScreenSignature){
      if(Router.current === "room" && roomSettingsOnlyChanged(previousActiveRoom, room) && refreshRoomSettings(root,{room,currentUser:state.currentUser},actions)){
        lastRenderedScreenSignature=currentScreenSignature();
        return;
      }
      render({preserveDrafts:true});
    }
  },()=>{
    state.onlineBackend=false; updateConnectionStatus();
    if(profile())message("Serwer odrzucil dostep do pokoi. Zaloguj sie ponownie.");
    if(["lobby","room","game"].includes(Router.current))render();
  });
  activeRoomPollTimer=setInterval(async()=>{
    // Przy działającym onValue Firebase polling dubluje każde zapytanie i cały
    // odczyt pokoju. Zostaw je tylko jako awaryjną synchronizację trybu lokalnego.
    if (state.onlineBackend === true) return;
    const local=activeRoom();if(!local||!["room","game"].includes(Router.current))return;
    const remote=await loadRemoteRoom(local.roomId);if(!remote.ok||!remote.room)return;
    const playersChanged=remote.room.players.length!==local.players.length||remote.room.players.some((uid,index)=>uid!==local.players[index]);
    if(Number(remote.room.updatedAt||0)>Number(local.updatedAt||0)||playersChanged){installRemoteRoom(remote.room);if(currentScreenSignature()!==lastRenderedScreenSignature){if(Router.current === "room" && roomSettingsOnlyChanged(local,remote.room) && refreshRoomSettings(root,{room:remote.room,currentUser:state.currentUser},actions)){lastRenderedScreenSignature=currentScreenSignature();return;}render({preserveDrafts:true});}}
  },5000);
}
async function checkFriendNotifications(bucket = null) {
  const user=profile(); if(!user)return;
  if (checkFriendNotifications.running) return;
  checkFriendNotifications.running = true;
  try {
  const local=loadAccounts(); if(local[state.currentUser])state.accounts[state.currentUser]={...state.accounts[state.currentUser],...local[state.currentUser]};
  const remoteState=await loadRemoteProfileState(state.currentUser), remote=remoteState.profile; if(remote){const currentFriendRequests=state.accounts[state.currentUser]?.friendRequests;state.accounts[state.currentUser]={...state.accounts[state.currentUser],...remote,potionInventory:normalizePotionInventory(remote.potionInventory),friendRequests:currentFriendRequests||remote.friendRequests};}else await recoverMissingRemoteProfile(remoteState);
  const syncedHonor=await loadHonorCounts(state.currentUser); if(syncedHonor){const account=state.accounts[state.currentUser];const current=account?.honorCounts||{};account.honorCounts=Object.fromEntries(Object.keys(syncedHonor).map(type=>[type,Math.max(Number(current[type])||0,Number(syncedHonor[type])||0)]));saveAccounts(state.accounts);}
  const remoteRequests=bucket || await loadFriendRequestBucket(state.currentUser), account=profile(), requests=friendRequests(account);
  const previousIncomingSignature=JSON.stringify(Object.keys(requests.incoming).sort());
  requests.incoming={...requests.incoming,...Object.fromEntries(Object.entries(remoteRequests).filter(([,request])=>!request?.status).map(([id,request])=>[id,request]))};
  account.friendRequests=requests; persistFriendAccount(state.currentUser);
  let friendStateChanged=false;
  for (const [requestId, request] of Object.entries(requests.incoming)) {
    if (!request?.roomId || !["gameInvite", "joinRequest"].includes(request.type)) continue;
    const localRoom=state.rooms.find(room=>room.roomId===request.roomId);
    const roomResult=localRoom ? {ok:true,room:localRoom} : await loadRemoteRoom(request.roomId);
    const invitationAge=Date.now()-Number(request.createdAt||0), invitationExpired=Number.isFinite(invitationAge)&&invitationAge>30*60*1000;
    if ((roomResult.ok && roomResult.room && roomResult.room.status !== "lobby") || roomResult.missing || invitationExpired) {
      delete requests.incoming[requestId];
      await updateFriendRequest(state.currentUser,requestId,{status:"cancelled",updatedAt:Date.now()});
      document.querySelector(`[data-friend-toast="${requestId}"]`)?.remove();
      friendSeenNotifications.delete(requestId);
      friendStateChanged=true;
    }
  }
  for (const request of Object.values(requests.outgoing)) { const remoteRequest=await loadFriendRequest(request.toUid,request.id); if (!remoteRequest || ["rejected","cancelled"].includes(remoteRequest.status)) { delete requests.outgoing[request.id]; friendStateChanged=true; } else if (remoteRequest.status === "accepted") { if(request.type === "joinRequest" && !activeRoom()) actions.joinRoom(request.roomId,"",{fromInvite:true,inviteMode:request.gameMode}); else account.friends=[...new Set([...(account.friends||[]),request.toUid])]; delete requests.outgoing[request.id]; friendStateChanged=true; } }
  account.friendRequests=requests; persistFriendAccount(state.currentUser);
  const incoming=Object.values(friendRequests(profile()).incoming);
  const incomingSignature=JSON.stringify(incoming.map(request=>request.id).sort());
  await refreshFriendDirectory();
  incoming.forEach(request=>{if(!friendSeenNotifications.has(request.id)){friendSeenNotifications.add(request.id);showFriendNotification(request,{directory:friendDirectorySnapshot(),actions});}});
  if(friendStateChanged || incomingSignature!==previousIncomingSignature)render({preserveDrafts:true});
  } finally {
    checkFriendNotifications.running = false;
  }
}
function startFriendWatcher() { stopFriendRequestsSubscription(); clearInterval(friendPollTimer); stopFriendRequestsSubscription=subscribeFriendRequests(state.currentUser, bucket => checkFriendNotifications(bucket)); friendPollTimer=setInterval(checkFriendNotifications,5000); checkFriendNotifications(); }
function clickedRoomPlayerUid(target) {
  const room=activeRoom(), mini=target?.closest?.(".mini-player");
  if (!room || !mini || target.closest?.(".account-button")) return "";
  const tagged=mini.closest("[data-player-uid]")?.dataset.playerUid;
  if (tagged && (room.players||[]).includes(tagged)) return tagged;
  const nick=mini.querySelector(".nick")?.textContent?.trim();
  if (!nick) return "";
  return (room.players||[]).find(uid=>String(state.accounts[uid]?.nick||room.playerProfiles?.[uid]?.nick||"").trim()===nick) || "";
}
document.addEventListener("click", event => {
  const target=event.target;
  const targetUid=clickedRoomPlayerUid(target);
  if (!targetUid) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  actions.openPlayerProfile(targetUid);
}, true);
document.addEventListener("click", event => {
  const changelogButton = event.target.closest?.("#open-changelog");
  if (!changelogButton) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  actions.openChangelog();
}, true);
document.addEventListener("click", event => {
  const backdrop = event.target.closest?.(".modal-backdrop");
  if (!backdrop || event.target !== backdrop) return;
  const closeButton = backdrop.querySelector("[data-close], [data-close-room-notice]");
  if (closeButton) closeButton.click();
  else backdrop.remove();
});
Audio.init(); Audio.bindGlobalUI(); Router.init(render);
window.addEventListener("popstate",()=>{const publicScreen=Router.publicScreenFromPath(window.location.pathname);if(publicScreen)return Router.go(publicScreen);const appScreen=Router.appScreenFromPath(window.location.pathname);if(appScreen)return Router.go(appScreen);const route=readUrlRoute();if(route.mode&&!route.room){state.selectedGameMode=route.mode;persistSession();return Router.go(getGameMode(route.mode).supportsSolo&&!getGameMode(route.mode).supportsLobby?"solo":"lobby");}if(Router.current.startsWith("public:"))return Router.go("platform");});
window.addEventListener("online", () => { state.networkOnline = true; state.syncStatus = "idle"; updateConnectionStatus(); if (state.currentUser) connectRooms(); });
window.addEventListener("offline", () => { state.networkOnline = false; updateConnectionStatus(); });
initFirebaseAuth().catch(()=>false).then(online=>{if(!online)state.onlineBackend=false;else { restoreFirebaseSession(); recoverMissingRemoteProfile().catch(()=>{}); }refreshPresence();connectOnlineCount();connectRooms();startFriendWatcher();updateConnectionStatus();const routed=routeFromUrlIfNeeded();if((!routed&&["solo","lobby","platform"].includes(Router.current)&&!(Router.current==="platform"&&lastRenderedRoute==="platform"))||Router.current==="solo")render();}); render();
