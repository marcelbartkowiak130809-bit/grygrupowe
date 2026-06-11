import { accountModal, authModal } from "./auth.js?v=20260604-2";
import { Audio } from "./audio.js";
import { changelogEntries, latestChangelog } from "./changelog.js?v=20260605-2";
import { Effects } from "./effects.js";
import { cosmetics } from "./cosmetics.js?v=20260605-8";
import { acknowledgeRemoteImpostorRole, authenticateGuest, authenticateNick, clearSession, getFirebaseSession, hashRoomPassword, hasOnlineBackend, initFirebaseAuth, loadAccounts, loadModerationBans, loadModerationReports, loadInboxForNick, loadRemoteProfile, loadRemoteRoom, loadSession, logoutAuth, mutateRemoteRoomGame, nickToEmail, removeRemoteRoom, saveAccounts, saveSession, sendInboxMessageToNick, saveModerationBan, setRemoteBirthDateForNick, startPresence, submitModerationReport, subscribeOnlineCount, subscribeRemoteRooms, syncPlayerProfile, syncRoomState, updateAuthPassword, voteWouldYouRather } from "./firebase.js?v=20260605-4";
import { answerList, createNewRound, evaluateAnswer, nextProvePlayer, provePhaseEnd, stopGameTimer } from "./game.js?v=20260605-1";
import { gamesList, getGameMode } from "./games.js?v=20260605-2";
import { createImpostorGame, ImpostorEngine, sanitizeImpostorSettings, stopImpostorTimer } from "./impostor.js?v=20260605-5";
import { createIdentityGame, IdentityEngine, stopIdentityTimer } from "./identity.js?v=20260605-7";
import { createIdentityVoiceChat } from "./identityVoiceChat.js?v=20260605-3";
import { createOtherQuestionGame, OtherQuestionEngine, stopOtherQuestionTimer } from "./otherQuestion.js?v=20260605-4";
import { currentWouldYouRather, renderWouldYouRather, setWouldYouRatherVote, wouldYouRatherPlayerKey } from "./wouldYouRather.js?v=20260605-2";
import { createMostLikelyGame, MostLikelyEngine, stopMostLikelyTimer } from "./mostLikely.js?v=20260605-1";
import { createFriendshipTestGame, FriendshipTestEngine, stopFriendshipTimer } from "./friendshipTest.js?v=20260605-1";
import { createPoisonCandyGame, PoisonCandyEngine, sanitizePoisonCandySettings, stopPoisonCandyTimer } from "./poisonCandy.js?v=20260605-6";
import { createRoomModal, renderLobby } from "./lobby.js?v=20260605-1";
import { renderPlatform } from "./platform.js?v=20260605-2";
import { Router } from "./router.js";
import { playerMini, renderRoom } from "./room.js?v=20260605-6";
import { renderShop, stopShopTimer } from "./shop.js?v=20260605-5";
import { $, escapeHtml, icon, normalizeNick, randomGuestNick, uid } from "./utils.js?v=20260605-5";
import { claimCompletedQuestRewards, grantProgression, levelProgressButtonHtml, noteQuestEvent, progressionModal } from "./progression.js?v=20260605-3";

const root = $("#app");
const accounts = loadAccounts();
Object.values(accounts).forEach(account => { if(account.password&&!account.passwordHash)account.passwordHash=hashRoomPassword(`account:${account.password}`);delete account.password;account.ownedCosmetics={defaultCandy:true,...(account.ownedCosmetics||{})};account.selectedCandySkin ||= "defaultCandy";account.selectedIdleAnimation ||= "";account.selectedWinAnimation ||= "";account.selectedLoseAnimation ||= "";account.birthDate ||= "";account.inbox = Array.isArray(account.inbox) ? account.inbox : [];Object.assign(account,grantProgression(account,0).profile); });
saveAccounts(accounts);
const session=loadSession();
const validModeIds = new Set(gamesList.map(mode => mode.id));
const normalizeModeParam = value => { const id = String(value || "").trim().toLowerCase(); return validModeIds.has(id) ? id : ""; };
function readUrlRoute() {
  try {
    const params = new URLSearchParams(window.location.search), rawMode = String(params.get("mode") || "").trim().toLowerCase(), room = String(params.get("room") || "").trim().toUpperCase();
    const mode = normalizeModeParam(rawMode);
    return { mode, room, invalidMode:Boolean(rawMode && !mode) };
  } catch { return { mode:"", room:"", invalidMode:false }; }
}
const initialUrlRoute = readUrlRoute();
const state = { accounts, currentUser:accounts[session.currentUser]?session.currentUser:null, rooms: [], activeRoomId:initialUrlRoute.room?null:(session.activeRoomId||null), selectedGameMode:initialUrlRoute.mode||session.selectedGameMode||"udowodnij", afterLogin: null, pendingJoin:null, pendingInviteMode:initialUrlRoute.room?initialUrlRoute.mode:"", pendingInviteRoom:initialUrlRoute.room||"", pendingInviteInvalidMode:initialUrlRoute.room&&initialUrlRoute.invalidMode, pendingInviteJoining:false, inviteAuthPrompted:false, onlineBackend:null, shopReturnScreen:null, onlineCount:1 };
const profile = () => state.currentUser ? state.accounts[state.currentUser] : null;
const activeRoom = () => state.rooms.find(room => room.roomId === state.activeRoomId);
function setUrlRoute(modeId = "", roomId = "") {
  try {
    const url = new URL(window.location.href);
    if (modeId) url.searchParams.set("mode", modeId); else url.searchParams.delete("mode");
    if (roomId) url.searchParams.set("room", roomId); else url.searchParams.delete("room");
    window.history.replaceState(null, "", url);
  } catch {}
}
const setModeUrl = modeId => setUrlRoute(modeId || state.selectedGameMode, "");
const setRoomUrl = room => room && setUrlRoute(room.gameMode || state.selectedGameMode, room.roomId);
const roomInviteLink = room => {
  try { const url = new URL(window.location.href); url.searchParams.set("mode", room.gameMode); url.searchParams.set("room", room.roomId); return url.toString(); }
  catch { return `${window.location.origin}${window.location.pathname}?mode=${encodeURIComponent(room.gameMode)}&room=${encodeURIComponent(room.roomId)}`; }
};
const stableStringify = value => JSON.stringify(value, (key, item) => key === "updatedAt" ? undefined : item);
function signatureGame(game, gameMode, players) {
  if (!game) return null;
  const copy = JSON.parse(JSON.stringify(game));
  const objectField = key => { if (!copy[key] || typeof copy[key] !== "object" || Array.isArray(copy[key])) copy[key] = {}; };
  const arrayField = key => { if (!Array.isArray(copy[key])) copy[key] = []; };
  if (gameMode === "impostor") {
    objectField("roles"); objectField("acknowledged"); objectField("reactions"); objectField("reactionCooldowns"); objectField("continueVotes"); objectField("votes");
    arrayField("clues"); arrayField("chat");
    copy.turnOrder = Array.isArray(copy.turnOrder) ? copy.turnOrder : [];
    if (!copy.turnOrder.length) copy.turnOrder = players;
  } else if (gameMode === "kim-jestem") {
    arrayField("history"); objectField("responses"); objectField("scores"); objectField("words"); objectField("wordHistory"); objectField("extendVotes");
    copy.order = Array.isArray(copy.order) ? copy.order : players;
  } else if (gameMode === "inne-pytanie") {
    objectField("answers"); objectField("votes"); objectField("scores"); arrayField("chat");
  } else if (gameMode === "kto-najpredzej") {
    objectField("submissions"); objectField("votes"); objectField("totals"); arrayField("questions"); arrayField("results");
  } else if (gameMode === "test-znajomosci") {
    objectField("answers"); objectField("guesses"); objectField("scores"); objectField("roundScores"); arrayField("answerOrder");
  } else if (gameMode === "zatruty-cukierek") {
    objectField("alive"); objectField("poisonChoices"); arrayField("candies"); arrayField("eliminated");
    copy.order = Array.isArray(copy.order) ? copy.order : players;
  }
  return copy;
}
function activeRoomSignature(room = activeRoom()) {
  if (!room) return "";
  const players = normalizedRoomPlayers(room);
  const playerProfiles = Object.fromEntries(players.map(uid => [uid, room.playerProfiles?.[uid] || state.accounts[uid] || {}]));
  return stableStringify({ roomId:room.roomId, gameMode:room.gameMode, name:room.name, isPrivate:room.isPrivate, hostUid:room.hostUid, players, playerProfiles, status:room.status, settings:room.settings, customWords:room.customWords, game:signatureGame(room.game, room.gameMode, players), pendingRewards:room.pendingRewards?.[state.currentUser] || 0, pendingXp:room.pendingXp?.[state.currentUser] || 0 });
}
function lobbySignature() {
  const rooms = state.rooms.filter(room => room.gameMode === state.selectedGameMode && room.status === "lobby").map(room => ({ roomId:room.roomId, name:room.name, isPrivate:room.isPrivate, players:normalizedRoomPlayers(room), hostUid:room.hostUid, status:room.status, settings:room.settings }));
  return stableStringify({ selectedGameMode:state.selectedGameMode, onlineBackend:state.onlineBackend, rooms });
}
function currentScreenSignature() {
  if (["room","game"].includes(Router.current)) return activeRoomSignature();
  if (Router.current === "lobby") return lobbySignature();
  return "";
}
const accountByNick = nick => Object.entries(state.accounts).find(([, account]) => normalizeNick(account.nick) === normalizeNick(nick) && !account.nickOnly);
const publicProfile = player => ({ nick:player?.nick || "Gracz", avatarImage:player?.avatarImage || "", nickOnly:Boolean(player?.nickOnly), money:Number(player?.money)||0, sessionMoney:Number(player?.sessionMoney)||0, xp:Number(player?.xp)||0, sessionXp:Number(player?.sessionXp)||0, selectedNickEffect:player?.selectedNickEffect || "defaultNick", selectedAvatarFrame:player?.selectedAvatarFrame || "defaultFrame", selectedAura:player?.selectedAura || "noAura", selectedCandySkin:player?.selectedCandySkin || "defaultCandy", selectedIdleAnimation:player?.selectedIdleAnimation || "", selectedWinAnimation:player?.selectedWinAnimation || "", selectedLoseAnimation:player?.selectedLoseAnimation || "" });
const normalizeRoomProfile = item => ({ ...item, nickOnly:Boolean(item?.nickOnly || (Number(item?.sessionXp || 0) > 0 && !Number(item?.xp || 0))) });
const persistSession=()=>saveSession({currentUser:state.currentUser,activeRoomId:state.activeRoomId,selectedGameMode:state.selectedGameMode});
let restoredRoom=false;
const pendingRoomSyncs=new Map();
const roomSyncChains=new Map();
const roomRosterSnapshots=new Map();
const roomPhaseSnapshots=new Map();
let lastRenderedScreenSignature="";
let stopRoomsSubscription=()=>{};
let stopOnlineSubscription=()=>{};
let stopPresence=()=>{};
let lastRenderedRoute="";
const identityVoiceChat=createIdentityVoiceChat(()=>{ if(Router.current==="game") render({preserveDrafts:true}); });

function saveAndRender() { saveAccounts(state.accounts); render(); }
function refreshPresence() {
  stopPresence();
  const user=profile();
  stopPresence=startPresence(state.currentUser, { nick:user?.nick || "Gość" });
}
function connectOnlineCount() {
  stopOnlineSubscription();
  stopOnlineSubscription=subscribeOnlineCount(count=>{state.onlineCount=Math.max(1,Number(count)||1);updateOnlineCountPill();});
}
function onlineCountLabel() {
  const count=state.onlineCount;
  return `${count} online`;
}
function updateOnlineCountPill() {
  const pill=document.querySelector(".online-count-pill");
  if(!pill)return;
  const label=onlineCountLabel();
  pill.dataset.count=String(state.onlineCount);
  pill.title=label;
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
function ensureRoomSession() {
  if(!hasOnlineBackend()){message("Brak połączenia z Firebase. Odśwież stronę i sprawdź konfigurację.");return false;}
  if(moveCurrentProfile(getFirebaseSession()))return true;
  state.currentUser=null;state.activeRoomId=null;clearSession();message("Zaloguj się ponownie, aby grać online.","info");render();return false;
}
function queueRoomSync(room) {
  const snapshot=JSON.parse(JSON.stringify(room)),version=snapshot.updatedAt,roomId=snapshot.roomId;
  pendingRoomSyncs.set(roomId,version);
  const previous=roomSyncChains.get(roomId)||Promise.resolve();
  const current=previous.catch(()=>{}).then(()=>syncRoomState(snapshot)).catch(error=>({ok:false,error:error?.message}));
  roomSyncChains.set(roomId,current);
  current.then(result=>{const latest=pendingRoomSyncs.get(roomId)===version;if(roomSyncChains.get(roomId)===current)roomSyncChains.delete(roomId);if(latest)pendingRoomSyncs.delete(roomId);if(!result.ok){message(`Nie udało się zsynchronizować pokoju: ${result.error}`);connectRooms();return;}const local=state.rooms.find(room=>room.roomId===roomId);if(result.room&&(!local||Number(result.room.updatedAt||0)>=Number(local.updatedAt||0))){const synced=installRemoteRoom(result.room);if(latest&&state.activeRoomId===roomId&&["room","game"].includes(Router.current)){if(synced.status==="playing"&&synced.game&&Router.current==="room")return Router.go("game");if(synced.status==="lobby"&&Router.current==="game")return Router.go("room");if(currentScreenSignature()!==lastRenderedScreenSignature)render({preserveDrafts:true});}}});
}
function updateProfile(patch) { if (state.currentUser) { state.accounts[state.currentUser] = { ...profile(), ...patch, updatedAt:Date.now() }; syncPlayerProfile(state.currentUser,state.accounts[state.currentUser]); const room=activeRoom();if(room?.players.includes(state.currentUser))touchRoom(room);saveAndRender(); } }
function touchRoom(room) { room.updatedAt = Math.max(Date.now(),Number(room.updatedAt||0)+1); if(room.players.includes(state.currentUser)&&profile())room.playerProfiles={...(room.playerProfiles||{}),[state.currentUser]:publicProfile(profile())}; queueRoomSync(room); return room; }
function installRemoteRoom(room) {
  const index=state.rooms.findIndex(item=>item.roomId===room.roomId);
  if(index>=0)state.rooms[index]=room;else state.rooms.unshift(room);
  Object.entries(room.playerProfiles||{}).forEach(([id,item])=>{const clean=normalizeRoomProfile(item);room.playerProfiles[id]=clean;state.accounts[id]=id===state.currentUser?{...clean,...(state.accounts[id]||{})}:{...(state.accounts[id]||{}),...clean};});
  saveAccounts(state.accounts);return room;
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
  const error=mutator(room.game,room);if(error){message(error,"info");return false;}
  if(after)after(room);touchRoom(room);if(sound)Audio.play(sound);render();return true;
}
function applyPlayerMoney(playerId, amount) {
  const player=state.accounts[playerId];if(!player)return;
  const updated=player.nickOnly?{...player,sessionMoney:(player.sessionMoney||0)+amount,updatedAt:Date.now()}:{...player,money:(player.money||0)+amount,updatedAt:Date.now()};
  state.accounts[playerId]=updated;
  const room=activeRoom();if(room?.players.includes(playerId))room.playerProfiles={...(room.playerProfiles||{}),[playerId]:publicProfile(updated)};
  syncPlayerProfile(playerId,updated);
}
function applyPlayerXp(playerId, amount) {
  const player=state.accounts[playerId];if(!player||!amount)return;
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
  if(playerId===state.currentUser)return applyPlayerMoney(playerId,amount);
  const room=activeRoom();if(!room)return;
  room.pendingRewards={...(room.pendingRewards||{}),[playerId]:(room.pendingRewards?.[playerId]||0)+amount};
  const player=state.accounts[playerId];if(player)room.playerProfiles={...(room.playerProfiles||{}),[playerId]:publicProfile(player.nickOnly?{...player,sessionMoney:(player.sessionMoney||0)+amount}:{...player,money:(player.money||0)+amount})};
}
function addPlayerXp(playerId, amount) {
  if(playerId===state.currentUser)return applyPlayerXp(playerId,amount);
  const room=activeRoom();if(!room)return;
  room.pendingXp={...(room.pendingXp||{}),[playerId]:(room.pendingXp?.[playerId]||0)+amount};
}
function rewardRoomXp(room, amount, winners = []) {
  const winnerSet = new Set(winners);
  room.players.forEach(uid=>{applyQuestEvent(uid,{type:"mode",mode:room.gameMode,result:winnerSet.has(uid)?"win":"loss"});addPlayerXp(uid,amount);});
}
function playCurrentUserResultSound(winners = []) {
  const user=profile();if(!user)return;
  const won=winners.includes(state.currentUser);
  Audio.play(won ? (user.selectedWinAnimation || "victory") : (user.selectedLoseAnimation || "defeat"));
}
function claimPendingProgress(room) {
  const money=Number(room?.pendingRewards?.[state.currentUser])||0,xp=Number(room?.pendingXp?.[state.currentUser])||0;if((!money&&!xp)||!profile())return false;
  room.pendingRewards={...(room.pendingRewards||{})};room.pendingXp={...(room.pendingXp||{})};delete room.pendingRewards[state.currentUser];delete room.pendingXp[state.currentUser];
  if(money)applyPlayerMoney(state.currentUser,money);if(xp)applyPlayerXp(state.currentUser,xp);saveAccounts(state.accounts);touchRoom(room);return true;
}
function settleProveResult(room) {
  if(room.gameMode!=="udowodnij"||room.game.phase!=="result"||room.game.result?.rewarded||room.game.result?.leftRoom)return;
  const winners = room.game.result.success ? [room.game.currentBidder] : room.players.filter(uid=>uid!==room.game.result.loser);
  if(room.game.result.success)addPlayerMoney(room.game.currentBidder,100);
  else winners.forEach(uid=>addPlayerMoney(uid,100));
  rewardRoomXp(room,18,winners);playCurrentUserResultSound(winners);
  room.game.result.rewarded=true;saveAccounts(state.accounts);Audio.play(room.game.result.success?"success":"roundEnd");
}
function settleImpostorResult(room) {
  if (room.game.phase !== "results" || room.game.result.rewarded) return;
  const winners = room.players.filter(uid => room.game.result.citizensWin ? room.game.roles[uid].role === "citizen" : room.game.roles[uid].role !== "citizen");
  winners.forEach(uid => addPlayerMoney(uid,150));
  rewardRoomXp(room,55,winners);playCurrentUserResultSound(winners);
  room.game.result.rewarded=true; room.status="results"; saveAccounts(state.accounts); Audio.play("roundEnd");
}
function settleOtherQuestionResult(room) {
  if(room.game.phase!=="results"||room.game.result.rewarded)return;
  const winners=room.game.result.caught?room.players.filter(uid=>uid!==room.game.impostor):[room.game.impostor];
  winners.forEach(uid=>addPlayerMoney(uid,100));
  rewardRoomXp(room,18,winners);playCurrentUserResultSound(winners);
  room.game.result.rewarded=true;saveAccounts(state.accounts);Audio.play("roundEnd");
}
function settleMostLikelyResult(room) {
  if(room.game.phase!=="gameSummary"||room.game.rewarded)return;
  room.players.forEach(uid=>addPlayerMoney(uid,25+(room.game.totals[uid]||0)*10));
  const max = Math.max(0,...Object.values(room.game.totals||{}).map(Number));
  const winners = room.players.filter(uid => Number(room.game.totals?.[uid] || 0) === max && max > 0);
  rewardRoomXp(room,60,winners);playCurrentUserResultSound(winners);
  room.game.rewarded=true;saveAccounts(state.accounts);touchRoom(room);Audio.play("roundEnd");
}
function settleFriendshipResult(room) {
  if(room.game.phase!=="gameSummary"||room.game.rewarded)return;
  if(room.settings.rewardCoins)room.players.forEach(uid=>addPlayerMoney(uid,(room.game.scores[uid]||0)*25));
  const max = Math.max(0,...Object.values(room.game.scores||{}).map(Number));
  const winners = room.players.filter(uid => Number(room.game.scores?.[uid] || 0) === max && max > 0);
  rewardRoomXp(room,60,winners);playCurrentUserResultSound(winners);
  room.game.rewarded=true;saveAccounts(state.accounts);touchRoom(room);Audio.play("roundEnd");
}
function settlePoisonCandyResult(room) {
  if(room.game.phase!=="results"||room.game.rewarded)return;
  if(room.game.result?.winner)addPlayerMoney(room.game.result.winner,150);
  rewardRoomXp(room,45,room.game.result?.winner?[room.game.result.winner]:[]);playCurrentUserResultSound(room.game.result?.winner?[room.game.result.winner]:[]);
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
function message(text, type = "error") {
  Audio.play(type === "error" ? "error" : "notification");
  const toast = document.createElement("div"); toast.className = `toast ${type}`; toast.textContent = text; document.body.append(toast);
  setTimeout(() => toast.remove(), 3200);
}
const isAdminProfile = item => String(item?.nick || "").toLowerCase() === "panda";
function validBirthDate(value) {
  const text = String(value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return "";
  const date = new Date(`${text}T00:00:00`);
  if (Number.isNaN(date.getTime()) || date > new Date()) return "";
  return text;
}
const reportableMode = room => Boolean(getGameMode(room?.gameMode).allowReports);
const adultAcceptedKey = modeId => `adult-warning:${modeId || "global"}`;
const hasAdultCategory = settings => [settings?.category, ...(Array.isArray(settings?.categories) ? settings.categories : [])].some(item => String(item || "").startsWith("18+"));
const roomIsAdult = room => Boolean(getGameMode(room?.gameMode).adult || hasAdultCategory(room?.settings));
function adultWarningModal(mode, onConfirm) {
  const modal=document.createElement("div");modal.className="modal-backdrop";
  modal.innerHTML=`<section class="modal confirm-modal enter adult-warning-modal" role="dialog" aria-modal="true"><div class="modal-title"><div><p class="eyebrow">OSTRZEŻENIE 18+</p><h2>${escapeHtml(mode?.name || "Tryb 18+")}</h2></div><button class="icon-btn" data-close>${icon("x",18)}</button></div><p class="muted">Ten wybór może zawierać mocne pytania dla dorosłych: seksualne, imprezowe, alkoholowe albo bardzo prywatne. Wchodź tylko, jeśli masz 18+ i świadomie chcesz grać w taki materiał.</p><div class="modal-actions"><button class="ghost" data-close>Nie wchodzę</button><button class="danger" id="confirm-adult-warning">Mam 18+ i potwierdzam</button></div></section>`;
  modal.querySelectorAll("[data-close]").forEach(button=>button.addEventListener("click",()=>actions.closeModal(modal)));
  modal.querySelector("#confirm-adult-warning").addEventListener("click",()=>{sessionStorage.setItem(adultAcceptedKey(mode?.id),"true");actions.closeModal(modal);onConfirm?.();});
  document.body.append(modal);Audio.play("modalOpen");
}
function withAdultWarning(mode, onConfirm, force = false) {
  if(!force || sessionStorage.getItem(adultAcceptedKey(mode?.id))==="true") return onConfirm();
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
    state.selectedGameMode = initialUrlRoute.mode; persistSession(); setModeUrl(state.selectedGameMode);
    const mode = getGameMode(state.selectedGameMode), destination = mode.supportsSolo && !mode.supportsLobby ? "solo" : "lobby";
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
  return room?.players?.length === 1 && (room.status !== "lobby" || Boolean(room.game) || Boolean(room.everStarted));
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
const normalizedRoomPlayers = room => Array.isArray(room?.players) ? [...new Set(room.players.filter(Boolean))] : Object.keys(room?.players || {});
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
  if (players.length !== (Array.isArray(room.players) ? room.players.length : 0) || players.some((uid,index) => uid !== room.players[index])) {
    room.players = players;
    changed = true;
  }
  const game = room.game;
  const keepPlayers = list => {
    const current = Array.isArray(list) ? list.filter(uid => players.includes(uid)) : [];
    players.forEach(uid => { if (!current.includes(uid)) current.push(uid); });
    return current;
  };
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
    if (game.turnIndex >= game.order.length) { game.turnIndex = 0; changed = true; }
  }
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
  modal.innerHTML=`<section class="modal enter" role="dialog" aria-modal="true"><div class="modal-title"><div><p class="eyebrow">DATA URODZENIA</p><h2>Prośba do administracji</h2></div><button class="icon-btn" data-close>${icon("x",18)}</button></div><label>Co chcesz zmienić?</label><textarea id="birth-request-text" maxlength="700" placeholder="Napisz obecną i poprawną datę oraz krótki powód."></textarea><label>Dokument do weryfikacji</label><input id="birth-request-file" type="file" accept="image/*,.pdf"><p class="tiny">Możesz zamazać wszystko poza datą i elementem potwierdzającym, że dokument nie jest losowym obrazkiem z internetu.</p><div class="modal-actions"><button class="ghost" data-close>Anuluj</button><button class="primary" id="submit-birth-request">Wyślij</button></div></section>`;
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
  return { nick, passwordHash:hashRoomPassword(`account:${password}`), authEmail: nickToEmail(nick), authProvider: auth.provider || "local", money: 0, xp:0, claimedLevelRewards:{}, stats:{},
    ownedCosmetics: { defaultNick: true, defaultFrame: true, noAura: true, defaultCandy: true }, selectedNickEffect: "defaultNick",
    selectedAvatarFrame: "defaultFrame", selectedAura: "noAura", selectedCandySkin:"defaultCandy", selectedIdleAnimation:"", selectedWinAnimation:"", selectedLoseAnimation:"", birthDate, inbox:[], createdAt: Date.now() };
}

const actions = {
  playSound(name) { Audio.play(name); },
  refresh: render,
  goPlatform() { if(activeRoom())return actions.leaveRoom("platform");setUrlRoute("", "");Router.go("platform"); },
  goLobby() { setModeUrl(state.selectedGameMode); Router.go("lobby"); },
  goHome() { const destination=state.shopReturnScreen||"platform";state.shopReturnScreen=null;Router.go(destination); },
  openShop() { const room=activeRoom();state.shopReturnScreen=room?(room.status==="lobby"?"room":"game"):(Router.current==="shop"?state.shopReturnScreen:Router.current);Audio.play("shopOpen");Router.go("shop"); },
  joinByCode(roomId,password="") {
    const code=String(roomId||"").trim().toUpperCase();
    if(!code)return message("Wpisz kod pokoju.");
    if(!profile()){state.pendingJoin={roomId:code,password};return actions.openAuth({title:"Zaloguj się, aby dołączyć do pokoju",description:"Po logowaniu od razu przeniesiemy cię do właściwej gry."});}
    actions.joinRoom(code,password);
  },
  async selectGame(gameMode) {
    state.selectedGameMode = gameMode;persistSession();setModeUrl(gameMode);
    const mode=getGameMode(gameMode);
    if (mode.supportsSolo && !mode.supportsLobby) return withAdultWarning(mode,()=>Router.go("solo"),Boolean(mode.adult));
    if (!profile()) { state.afterLogin = "lobby"; return actions.openAuth({ title: `Zaloguj się, aby zagrać w ${getGameMode(gameMode).name}` }); }
    if(await guardBan(gameMode))return;
    Router.go("lobby");
  },
  openAuth(options = {}) {
    const modal = authModal(actions, options); document.body.append(modal); Audio.play("modalOpen");
  },
  openAccount() {
    if (!profile()) return actions.openAuth({ title: "Zaloguj się lub utwórz konto", description: "Konto zapisuje coiny, kosmetyki i efekty nicku." });
    const modal = accountModal(profile(), actions); document.body.append(modal); Audio.play("modalOpen");
  },
  openProgression() { if(profile()){const modal=progressionModal(profile(),actions.closeModal,actions.claimQuestRewards);document.body.append(modal);Audio.play("modalOpen");} },
  claimQuestRewards(modal) {
    const user=profile();if(!user)return;
    const result=claimCompletedQuestRewards(user);
    if(!result.completed.length)return;
    state.accounts[state.currentUser]={...result.profile,updatedAt:Date.now()};
    syncPlayerProfile(state.currentUser,state.accounts[state.currentUser]);saveAccounts(state.accounts);actions.closeModal(modal);Audio.play("questClaim");message(`Odebrano ${result.completed.length} questow.`,"info");render();
  },
  showGameInfo(modeId){ gameInfoModal(modeId); },
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
      const remote=await loadRemoteProfile(accountId);
      if(!existing?.birthDate && !remote?.birthDate && !birthDate) { message("Podaj datę urodzenia dla konta."); return false; }
      state.accounts[accountId] = { ...defaultAccount(clean,password,auth,birthDate), ...(existing||{}), ...(remote||{}), birthDate:remote?.birthDate || existing?.birthDate || birthDate, inbox:Array.isArray(remote?.inbox)?remote.inbox:(Array.isArray(existing?.inbox)?existing.inbox:[]), passwordHash:hashRoomPassword(`account:${password}`) }; delete state.accounts[accountId].password;
      const ban = await activeBanFor(state.accounts[accountId]);
      if(ban){message(`Konto jest zbanowane. Powód: ${ban.reason || "brak"}`);return false;}
      if(existingEntry?.[0]&&existingEntry[0]!==accountId)delete state.accounts[existingEntry[0]];
      state.currentUser = accountId; saveAccounts(state.accounts);persistSession(); syncPlayerProfile(accountId,state.accounts[accountId]);refreshPresence();connectRooms();Audio.play("success"); actions.finishLogin(); return true;
    } catch { message("Nie udało się zalogować. Spróbuj ponownie."); return false; }
  },
  finishLogin() { if(state.pendingInviteRoom)return handlePendingInvite();if(state.pendingJoin){const pending=state.pendingJoin;state.pendingJoin=null;return actions.joinRoom(pending.roomId,pending.password);}const destination = state.afterLogin || "platform"; state.afterLogin = null; if(destination==="lobby")setModeUrl(state.selectedGameMode); Router.go(destination); },
  async logout() {
    const roomUpdates=state.rooms.map(room => {
      interruptProveRoundForDeparture(room,state.currentUser);
      room.players = room.players.filter(id => id !== state.currentUser);
      if(room.playerProfiles)delete room.playerProfiles[state.currentUser];
      if (room.hostUid === state.currentUser) room.hostUid = room.players[0];
      if(!room.players.length)return removeRemoteRoom(room.roomId);
      if(shouldCloseLonelyFinishedRoom(room)){room.updatedAt=Math.max(Date.now(),Number(room.updatedAt||0)+1);return syncRoomState(room);}
      room.updatedAt=Math.max(Date.now(),Number(room.updatedAt||0)+1);
      return syncRoomState(room);
    });
    await Promise.allSettled(roomUpdates);
    state.rooms = state.rooms.filter(room => room.players.length);
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
    updateProfile({ birthDate });
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
  async setAvatar(file) {
    if(!file?.type?.startsWith("image/"))return message("Wybierz plik graficzny.");
    if(file.size>8*1024*1024)return message("Zdjęcie jest za duże. Maksymalnie 8 MB.");
    const image=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>{const item=new Image();item.onload=()=>resolve(item);item.onerror=reject;item.src=reader.result;};reader.onerror=reject;reader.readAsDataURL(file);});
    const canvas=document.createElement("canvas");canvas.width=160;canvas.height=160;const context=canvas.getContext("2d"),side=Math.min(image.width,image.height),x=(image.width-side)/2,y=(image.height-side)/2;
    context.drawImage(image,x,y,side,side,0,0,160,160);updateProfile({avatarImage:canvas.toDataURL("image/jpeg",.78)});message("Zdjęcie profilowe zapisane.","info");
  },
  removeAvatar(){updateProfile({avatarImage:""});message("Zdjęcie profilowe usunięte.","info");},
  openCreateRoom() { const modal = createRoomModal(getGameMode(state.selectedGameMode), actions); document.body.append(modal); Audio.play("modalOpen"); },
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
  async createRoom({ name, password, settings, isPrivate }) {
    if(!ensureRoomSession()||!profile())return false;
    const now = Date.now(); const mode = getGameMode(state.selectedGameMode);
    if(await guardBan(mode.id))return false;
    const room = { roomId: uid(), gameMode: mode.id, name: name.trim() || `Pokój ${profile().nick}`, passwordHash:isPrivate?hashRoomPassword(password):"",
      isPrivate, hostUid: state.currentUser, players: [state.currentUser], joinedAt:{[state.currentUser]:now}, playerProfiles:{[state.currentUser]:publicProfile(profile())}, status: "lobby", settings, createdAt: now, updatedAt: now, game: null };
    const result=await syncRoomState(room);if(!result.ok){message(`Nie udało się utworzyć pokoju: ${result.error}`);connectRooms();return false;}
    state.rooms = [room, ...state.rooms.filter(item=>item.roomId!==room.roomId)]; state.activeRoomId = room.roomId;clearPendingInvite();persistSession(); setRoomUrl(room); Audio.play("joinRoom"); Router.go("room");
    return true;
  },
  async joinRoom(roomId, password = "", options = {}) {
    if(!ensureRoomSession()||!profile())return false;
    const code=String(roomId||"").trim().toUpperCase(),fail=text=>options.fromInvite?inviteErrorModal(text):(message(text),false);
    if(!code)return fail("Nie można dołączyć do tego pokoju.");
    const resolved=await resolveRoomForJoin(code); if(!resolved.ok)return fail(resolved.missing?"Ten pokój nie istnieje.":"Nie można dołączyć do tego pokoju.");
    const room = resolved.room, mode = getGameMode(room.gameMode), alreadyInRoom = room.players.includes(state.currentUser);
    if(options.inviteMode && room.gameMode !== options.inviteMode)return fail("Ten link prowadzi do innego trybu gry.");
    if(room.deleted || room.closed || room.status === "closed")return fail("Ten pokój został zamknięty.");
    if(!alreadyInRoom && room.status !== "lobby")return fail(room.status === "playing" || room.game ? "Gra w tym pokoju już trwa." : "Ten link jest nieaktualny.");
    if(!alreadyInRoom && room.players.length >= mode.maxPlayers)return fail("Ten pokój jest już pełny.");
    if(await guardBan(room.gameMode))return false;
    if(roomIsAdult(room)&&sessionStorage.getItem(adultAcceptedKey(room.gameMode))!=="true")return withAdultWarning(mode,()=>actions.joinRoom(roomId,password,options),true);
    if (room.isPrivate && !alreadyInRoom && room.passwordHash !== hashRoomPassword(password)) return options.fromInvite && !password ? invitePasswordModal(room, options.inviteMode) : (message("Złe hasło do pokoju."), false);
    if (!alreadyInRoom) {
      room.players.push(state.currentUser); room.joinedAt={...(room.joinedAt||{}),[state.currentUser]:Date.now()}; room.playerProfiles={...(room.playerProfiles||{}),[state.currentUser]:publicProfile(profile())}; touchRoom(room);
    }
    state.selectedGameMode = room.gameMode; state.activeRoomId = room.roomId;clearPendingInvite();persistSession(); setRoomUrl(room); Audio.play("joinRoom"); Router.go(room.status === "lobby" ? "room" : "game"); return true;
  },
  leaveRoom(destination = "lobby") { leaveRoomModal(destination); },
  confirmLeaveRoom(destination = "lobby") {
    const room = activeRoom(); if (!room) return;
    interruptProveRoundForDeparture(room,state.currentUser);
    room.players = room.players.filter(id => id !== state.currentUser); if(room.playerProfiles)delete room.playerProfiles[state.currentUser];if(room.joinedAt)delete room.joinedAt[state.currentUser]; if (room.hostUid === state.currentUser) room.hostUid = room.players[0];
    if(!room.players.length){removeRemoteRoom(room.roomId);removeRoomLocally(room.roomId);}else touchRoom(room); state.rooms = state.rooms.filter(item => item.players.length); state.activeRoomId = null;clearPendingInvite();persistSession(); destination==="platform"?setUrlRoute("", ""):setModeUrl(state.selectedGameMode); Audio.play("leaveRoom"); Router.go(destination);
  },
  kickPlayer(playerId) { const room = activeRoom(); if (room?.hostUid === state.currentUser) { interruptProveRoundForDeparture(room,playerId);room.players = room.players.filter(id => id !== playerId); if(room.playerProfiles)delete room.playerProfiles[playerId];if(room.joinedAt)delete room.joinedAt[playerId];if(!room.players.length||shouldCloseLonelyFinishedRoom(room)){removeRemoteRoom(room.roomId);removeRoomLocally(room.roomId);state.activeRoomId=null;persistSession();Router.go("platform");showRoomClosedNotice();}else{touchRoom(room);render();} } },
  setRoomTime(answerTime) { const room = activeRoom(); if (room?.hostUid === state.currentUser && room.status === "lobby") { room.settings.answerTime = answerTime; touchRoom(room); render(); } },
  setImpostorSetting(key,value) {
    const room=activeRoom(); if(!room||room.hostUid!==state.currentUser||room.gameMode!=="impostor")return;
    room.settings=sanitizeImpostorSettings({...room.settings,[key]:value},room.players.length); touchRoom(room); render();
  },
  setModeSetting(key,value){const room=activeRoom();if(!room||room.hostUid!==state.currentUser)return;room.settings={...room.settings,[key]:["turnTime","rounds","targetScore","answerTime","discussionTime","voteTime","questionTime","assignTime","candyCount","poisonedPerPlayer","lives"].includes(key)?Number(value):value};touchRoom(room);render();},
  setMostCategories(categories){const room=activeRoom();if(!room||room.hostUid!==state.currentUser)return;const next=[...new Set(categories||[])];const addingAdult=next.some(item=>String(item).startsWith("18+"))&&!hasAdultCategory(room.settings);const apply=()=>{room.settings={...room.settings,categories:next,adultWarningAccepted:room.settings.adultWarningAccepted||next.some(item=>String(item).startsWith("18+"))};touchRoom(room);render();};if(addingAdult&&!room.settings.adultWarningAccepted)return withAdultWarning(getGameMode(room.gameMode),apply,true);apply();},
  saveIdentityWords(text){const room=activeRoom();if(!room||room.gameMode!=="kim-jestem")return;room.customWords??={};room.customWords[state.currentUser]=text.split(",").map(x=>x.trim()).filter(Boolean).slice(0,5);touchRoom(room);message("Hasła zapisane.","info");render();},
  async startGame() {
    const room = activeRoom(), mode = getGameMode(room?.gameMode);
    if (!room || room.hostUid !== state.currentUser) return;
    if(await guardBan(room.gameMode))return;
    const players = normalizedRoomPlayers(room);
    if (players.length < mode.minPlayers) return message(`Ten tryb wymaga minimum ${mode.minPlayers} graczy.`, "info");
    room.players = players;
    room.settings = { ...(mode.defaultSettings || {}), ...(room.settings || {}) };
    room.status = "playing"; room.everStarted = true; room.settings=mode.id==="impostor"?sanitizeImpostorSettings(room.settings,room.players.length):mode.id==="zatruty-cukierek"?sanitizePoisonCandySettings(room.settings,room.players.length):room.settings;
    room.game = mode.id === "udowodnij" ? createNewRound(room.players, room.settings.answerTime) : mode.id === "impostor" ? createImpostorGame(room.players,room.settings) : mode.id === "kim-jestem" ? createIdentityGame(room.players,room.settings,room.customWords) : mode.id === "inne-pytanie" ? createOtherQuestionGame(room.players,room.settings) : mode.id === "kto-najpredzej" ? createMostLikelyGame(room.players,room.settings) : mode.id === "test-znajomosci" ? createFriendshipTestGame(room.players,room.settings) : mode.id === "zatruty-cukierek" ? createPoisonCandyGame(room.players,room.settings) : {};
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
  failRound(loser, text) {
    return mutateRoomGame(game=>{if(game.phase!=="answering"||game.result||game.currentBidder!==loser)return"Runda odpowiedzi została już zakończona.";game.phase="result";game.result={success:false,loser,text};},{after:settleProveResult});
  },
  surrenderRound() {
    const room=activeRoom();
    if(!room?.game||room.game.phase!=="answering"||room.game.currentBidder!==state.currentUser)return;
    return actions.failRound(state.currentUser,`${state.accounts[state.currentUser]?.nick || "Gracz"} poddał się.`);
  },
  nextRound() { const room=activeRoom();if(closeLonelyFinishedRoom(room,{notify:true}))return;return mutateRoomGame((game,current)=>{if(game.phase!=="result")return"Ta runda jeszcze się nie zakończyła.";Object.assign(game,createNewRound(current.players,current.settings.answerTime));},{sound:"turn"}); },
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
  impostorSubmitClue(text){return mutateRoomGame((game,room)=>ImpostorEngine.clue(game,state.currentUser,text,room.settings),{sound:"clue"});},
  impostorTimeout(expected={}){const room=activeRoom();if(!room||room.gameMode!=="impostor")return;const guard={phase:room.game?.phase,phaseEndsAt:room.game?.phaseEndsAt||0,round:room.game?.round||0,turnIndex:room.game?.turnIndex??""};return mutateRoomGame((game,current)=>{if(expected.phase&&game.phase!==expected.phase)return"Faza gry juz sie zmienila.";if(expected.phaseEndsAt&&Number(game.phaseEndsAt||0)!==Number(expected.phaseEndsAt))return"Faza gry juz sie zmienila.";if(expected.round&&Number(game.round||0)!==Number(expected.round))return"Faza gry juz sie zmienila.";if(String(game.turnIndex??"")!==String(expected.turnIndex??guard.turnIndex))return"Faza gry juz sie zmienila.";ImpostorEngine.timeout(game,current.settings);},{after:settleImpostorResult});},
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
  identityTimeout(){const room=activeRoom();if(!room||room.gameMode!=="kim-jestem")return;const phase=room.game?.phase;return mutateRoomGame((game,current)=>{if(game.phase!==phase)return"Faza gry juz sie zmienila.";IdentityEngine.timeout(game,current.settings,current.customWords);},{after:settleIdentityResult});},
  otherAnswer(text){return mutateRoomGame((game,room)=>OtherQuestionEngine.answer(game,state.currentUser,text,room.settings),{sound:"submit"});},
  otherChat(text){const room=activeRoom();if(!room?.settings.chatEnabled)return;return mutateRoomGame(game=>OtherQuestionEngine.chat(game,state.currentUser,text),{sound:"chat"});},
  otherVote(uid){return mutateRoomGame(game=>OtherQuestionEngine.vote(game,state.currentUser,uid),{sound:"vote",after:settleOtherQuestionResult});},
  otherTimeout(){const room=activeRoom();if(!room||room.gameMode!=="inne-pytanie")return;const phase=room.game?.phase;return mutateRoomGame((game,current)=>{if(game.phase!==phase)return"Faza gry juz sie zmienila.";OtherQuestionEngine.timeout(game,current.settings);},{after:settleOtherQuestionResult});},
  otherNext(){const room=activeRoom();if(closeLonelyFinishedRoom(room,{notify:true}))return;return mutateRoomGame((game,current)=>{if(game.phase!=="results")return"Runda została już zmieniona.";OtherQuestionEngine.next(game,current.players,current.settings);});},
  async wyrVote(choice){
    const user=profile(),question=currentWouldYouRather();if(!question)return;
    const result=await voteWouldYouRather({questionId:question.id,choice,playerId:wouldYouRatherPlayerKey(user,state.currentUser),persistProfile:Boolean(user&&!user.nickOnly)});
    setWouldYouRatherVote(choice,result.votes);
    if(!result.accepted)return message("Na to pytanie już oddałeś głos.","info");
    Effects.play("choice");if(user){applyPlayerXp(state.currentUser,2);if(!user.nickOnly)updateProfile({money:(profile().money||0)+2,answeredWouldYouRather:{...(profile().answeredWouldYouRather||{}),[question.id]:choice}});else{Audio.play("success");render();}}else{Audio.play("success");render();}
  },
  mostLikelyQuestion(text){return mutateRoomGame((game,room)=>MostLikelyEngine.submitQuestion(game,state.currentUser,text,room.players,room.settings),{sound:"submit"});},
  mostLikelyVote(uid){return mutateRoomGame((game,room)=>MostLikelyEngine.vote(game,state.currentUser,uid,room.players,room.settings),{sound:"vote"});},
  mostLikelyTimeout(){const room=activeRoom();if(!room||room.gameMode!=="kto-najpredzej")return;const phase=room.game?.phase;return mutateRoomGame((game,current)=>{if(game.phase!==phase)return"Faza gry juz sie zmienila.";MostLikelyEngine.timeout(game,current.players,current.settings);});},
  mostLikelyNext(){const room=activeRoom();if(closeLonelyFinishedRoom(room,{notify:true}))return;return mutateRoomGame((game,current)=>{if(game.phase!=="roundResult")return"Runda została już zmieniona.";MostLikelyEngine.next(game,current.settings);},{after:settleMostLikelyResult});},
  poisonCandyPoison(ids){return mutateRoomGame((game,room)=>PoisonCandyEngine.poison(game,state.currentUser,ids,room.players,room.settings),{sound:"candyPoison"});},
  poisonCandyTimeout(expected={}){const room=activeRoom();if(!room||room.gameMode!=="zatruty-cukierek")return;return mutateRoomGame((game,current)=>{if(game.phase!=="poisoning")return"Faza gry juz sie zmienila.";if(expected.phaseEndsAt&&Number(game.phaseEndsAt||0)!==Number(expected.phaseEndsAt))return"Faza gry juz sie zmienila.";PoisonCandyEngine.timeoutPoisoning(game,current.players,current.settings);},{sound:"candyPoison"});},
  poisonCandyEat(id){return mutateRoomGame(game=>PoisonCandyEngine.eat(game,state.currentUser,id),{sound:"candyPick",after:room=>{const event=room.game?.lastEvent;Audio.play(event?.type==="poisoned"&&event.dead?"candyDeath":"candySafe");settlePoisonCandyResult(room);}});},
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
  equipCosmetic(itemId) { const defaults={ defaultIdle:["selectedIdleAnimation",""], defaultWin:["selectedWinAnimation",""], defaultLose:["selectedLoseAnimation",""] }; if(defaults[itemId]){ Audio.play("equip"); return updateProfile({ [defaults[itemId][0]]:defaults[itemId][1] }); } const item = cosmetics.find(entry => entry.id === itemId), user = profile(); if (!item || !user?.ownedCosmetics[itemId]) return; Audio.play(item.type==="win"||item.type==="lose"?item.id:"equip"); updateProfile({ [{ nick:"selectedNickEffect", frame:"selectedAvatarFrame", aura:"selectedAura", candy:"selectedCandySkin", idle:"selectedIdleAnimation", win:"selectedWinAnimation", lose:"selectedLoseAnimation" }[item.type]]: itemId }); },
};

function audioModal() {
  const settings = Audio.settings, modal = document.createElement("div"); modal.className = "modal-backdrop";
  modal.innerHTML = `<section class="modal audio-modal enter" role="dialog" aria-modal="true"><div class="modal-title"><div><p class="eyebrow">AUDIO</p><h2>Ustawienia dźwięku</h2></div><button class="icon-btn" data-close>${icon("x",18)}</button></div><label>Music Volume <span id="music-value">${Math.round(settings.musicVolume*100)}%</span></label><input id="music-volume" type="range" min="0" max="1" step="0.01" value="${settings.musicVolume}"><label>SFX Volume <span id="sfx-value">${Math.round(settings.sfxVolume*100)}%</span></label><input id="sfx-volume" type="range" min="0" max="1" step="0.01" value="${settings.sfxVolume}"><label class="check"><input id="mute-all" type="checkbox" ${settings.muted?"checked":""}> Mute All</label><p class="tiny">Ambient: ${Audio.currentTrack}. Ustawienia zapisują się automatycznie.</p></section>`;
  modal.querySelector("[data-close]").addEventListener("click",()=>actions.closeModal(modal)); $("#music-volume",modal).addEventListener("input",e=>{Audio.setMusicVolume(e.target.value);$("#music-value",modal).textContent=`${Math.round(e.target.value*100)}%`;}); $("#sfx-volume",modal).addEventListener("input",e=>{Audio.setSfxVolume(e.target.value);$("#sfx-value",modal).textContent=`${Math.round(e.target.value*100)}%`;}); $("#mute-all",modal).addEventListener("change",e=>Audio.setMuted(e.target.checked)); document.body.append(modal); Audio.play("modalOpen");
}
function changelogModal() {
  const modal=document.createElement("div");modal.className="modal-backdrop";
  const entryHtml=entry=>`<article class="changelog-entry"><p class="eyebrow">${escapeHtml(entry.date)} · ${escapeHtml(entry.version)}</p><h2>${escapeHtml(entry.title)}</h2><ul>${entry.changes.map(change=>`<li>${escapeHtml(change)}</li>`).join("")}</ul></article>`;
  modal.innerHTML=`<section class="modal changelog-modal enter" role="dialog" aria-modal="true"><div class="modal-title"><div><p class="eyebrow">CHANGELOG</p><h2>Historia aktualizacji</h2></div><button class="icon-btn" data-close>${icon("x",18)}</button></div><div class="changelog-layout"><aside>${changelogEntries.map((entry,index)=>`<button class="changelog-version ${index?"":"active"}" data-changelog-index="${index}"><b>${escapeHtml(entry.version)}</b><small>${escapeHtml(entry.date)}</small></button>`).join("")}</aside><div id="changelog-current">${entryHtml(latestChangelog)}</div></div></section>`;
  modal.querySelector("[data-close]").addEventListener("click",()=>actions.closeModal(modal));
  modal.querySelectorAll("[data-changelog-index]").forEach(button=>button.addEventListener("click",()=>{const entry=changelogEntries[Number(button.dataset.changelogIndex)]||latestChangelog;modal.querySelectorAll("[data-changelog-index]").forEach(item=>item.classList.toggle("active",item===button));$("#changelog-current",modal).innerHTML=entryHtml(entry);}));
  document.body.append(modal);Audio.play("modalOpen");
}
function topBar() { const user = profile(), room = activeRoom(), canReport = room && reportableMode(room) && ["room","game"].includes(Router.current), onlineLabel=onlineCountLabel(); return `<header class="topbar"><div class="brand-zone"><button class="brand" id="brand-home">${icon("zap",20)} <span>Gry dla znajomych!</span></button>${user?levelProgressButtonHtml(user):""}</div><nav class="top-actions"><span class="online-count-pill" data-count="${state.onlineCount}" title="${onlineLabel}"><i></i><b>${state.onlineCount}</b> online</span><button class="icon-btn changelog-button" id="open-changelog" aria-label="Changelog ${latestChangelog.version}" title="Changelog">${icon("scroll",18)}</button><button class="icon-btn" id="audio-settings" aria-label="Ustawienia audio">${icon("audio",18)}</button>${canReport?'<button class="icon-btn report-top-button" id="open-report" aria-label="Zgłoś gracza">⚠️</button>':""}${user ? `<button class="icon-btn" id="open-shop" aria-label="Sklep">${icon("shop",18)}</button><div class="money ${user.nickOnly?"muted-money":""}">$${user.nickOnly?user.sessionMoney||0:user.money}</div><button class="account-button" id="account">${playerMini(user)}</button>` : `<button class="account-button" id="account">${icon("user",18)} Konto</button>`}</nav></header>`; }
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
function render(options = {}) {
  const softRender = !options?.forceEnter && Router.current === lastRenderedRoute;
  const drafts = (options?.preserveDrafts || softRender) ? captureInputDrafts(root) : {fields:[]};
  if (softRender) {
    root.classList.add("soft-render");
    root.style.minHeight = `${Math.max(root.offsetHeight, window.innerHeight)}px`;
  } else root.classList.remove("soft-render");
  lastRenderedRoute=Router.current;
  lastRenderedScreenSignature=currentScreenSignature();
  stopShopTimer(); stopGameTimer(); stopImpostorTimer(); stopIdentityTimer(); stopOtherQuestionTimer(); stopMostLikelyTimer(); stopFriendshipTimer(); stopPoisonCandyTimer(); root.innerHTML = '<div class="bg-orb orb1"></div><div class="bg-orb orb2"></div>'; root.insertAdjacentHTML("beforeend",topBar());
  $("#brand-home").addEventListener("click",actions.goPlatform); $("#open-progression")?.addEventListener("click",actions.openProgression); $("#open-changelog")?.addEventListener("click",changelogModal); $("#audio-settings").addEventListener("click",audioModal); $("#account").addEventListener("click",actions.openAccount); $("#open-shop")?.addEventListener("click",actions.openShop); $("#open-report")?.addEventListener("click",()=>actions.openReportModal());
  const finish = result => {
    const after = () => { restoreInputDrafts(root,drafts); if(softRender)requestAnimationFrame(()=>{root.style.minHeight="";}); };
    if(result?.then)return result.finally(after);
    after();
    return result;
  };
  const view=document.createElement("div"); root.append(view); const screen=Router.current;
  if(screen!=="game") identityVoiceChat.stop();
  if(screen==="platform") return finish(renderPlatform(view,actions,{voterId:state.currentUser || "anonymous"})); if(screen==="solo") return finish(renderWouldYouRather(view,{profile:profile(),playerId:state.currentUser},actions)); if(screen==="lobby") return profile()?finish(renderLobby(view,state,actions)):Router.go("platform"); if(screen==="shop") return profile()?finish(renderShop(view,{profile:profile()},actions)):actions.openAuth();
  const room=activeRoom(); if(!room) return Router.go("platform"); if(leaveKickedRoom(room))return; if(closeLonelyFinishedRoom(room,{notify:true}))return;
  if(screen==="game") {
    const mode=getGameMode(room.gameMode); repairGameStateForPlayers(room); lastRenderedScreenSignature=currentScreenSignature();
    try {
      const rendered=mode.render(view,{room,accounts:state.accounts,currentUser:state.currentUser,mode},actions);
      identityVoiceChat.sync(room,state.currentUser).catch(()=>{});
      return finish(rendered);
    } catch(error) { identityVoiceChat.stop(); return finish(renderGameError(view,room,error)); }
  }
  return finish(renderRoom(view,{room,accounts:state.accounts,currentUser:state.currentUser},actions));
}
function connectRooms(){
  stopRoomsSubscription();
  state.onlineBackend=hasOnlineBackend()?null:false;
  stopRoomsSubscription=subscribeRemoteRooms((remoteRooms,source)=>{
    state.onlineBackend=source==="remote"?true:source==="local"?false:null;
    const requestedRoomId=state.activeRoomId;
    const keepLocal=source!=="remote"?state.rooms:state.rooms.filter(room=>pendingRoomSyncs.has(room.roomId));
    const rooms=new Map(keepLocal.map(room=>[room.roomId,room]));
    remoteRooms.forEach(remote=>{
      const local=state.rooms.find(room=>room.roomId===remote.roomId),pending=pendingRoomSyncs.has(remote.roomId),keepPendingLocal=local&&pending&&Number(local.updatedAt||0)>Number(remote.updatedAt||0),room=keepPendingLocal?local:remote;
      rooms.set(room.roomId,room);
      Object.entries(room.playerProfiles||{}).forEach(([id,item])=>{const clean=normalizeRoomProfile(item);room.playerProfiles[id]=clean;state.accounts[id]=id===state.currentUser?{...clean,...(state.accounts[id]||{})}:{...(state.accounts[id]||{}),...clean};});
    });
    state.rooms=[...rooms.values()];saveAccounts(state.accounts);
    const room=activeRoom();
    if(room&&source==="remote"&&leaveKickedRoom(room))return;
    if(room&&interruptProveRoundWithMissingPlayer(room)){if(closeLonelyFinishedRoom(room,{notify:true}))return;touchRoom(room);return render();}
    if(room&&closeLonelyFinishedRoom(room,{notify:true}))return;
    if(requestedRoomId&&source==="remote"&&!room&&!pendingRoomSyncs.has(requestedRoomId)){state.activeRoomId=null;clearPendingInvite({clearUrl:true});persistSession();Router.go("platform");showRoomClosedNotice();return;}
    announceRoomRoster(room);announceRoomPhase(room);
    if(claimPendingProgress(room))return render({preserveDrafts:true});
    if(room?.status==="playing"&&room.game&&Router.current==="room"){Effects.play("gameStart",`${room.roomId}:game-start`);return Router.go("game");}
    if(room?.status==="lobby"&&Router.current==="game")return Router.go("room");
    if(!restoredRoom&&room){restoredRoom=true;setRoomUrl(room);return Router.go(room.game?"game":"room");}
    if(["lobby","room","game"].includes(Router.current)&&currentScreenSignature()!==lastRenderedScreenSignature)render({preserveDrafts:true});
  },()=>{
    state.onlineBackend=false;
    if(profile())message("Firebase odrzucil dostep do pokoi. Zaloguj sie ponownie albo sprawdz reguly bazy.");
    if(["lobby","room","game"].includes(Router.current))render();
  });
}
Audio.init(); Audio.bindGlobalUI(); Router.init(render); initFirebaseAuth().catch(()=>false).then(online=>{if(!online)state.onlineBackend=false;else restoreFirebaseSession();refreshPresence();connectOnlineCount();connectRooms();if(!routeFromUrlIfNeeded()&&["solo","lobby","platform"].includes(Router.current))render();}); render();
