import { accountModal, authModal } from "./auth.js?v=20260603-1";
import { Audio } from "./audio.js";
import { Effects } from "./effects.js";
import { cosmetics } from "./cosmetics.js?v=20260602-8";
import { acknowledgeRemoteImpostorRole, authenticateGuest, authenticateNick, clearSession, getFirebaseSession, hashRoomPassword, hasOnlineBackend, initFirebaseAuth, loadAccounts, loadRemoteProfile, loadSession, logoutAuth, mutateRemoteRoomGame, nickToEmail, removeRemoteRoom, saveAccounts, saveSession, subscribeRemoteRooms, syncPlayerProfile, syncRoomState, updateAuthPassword, voteWouldYouRather } from "./firebase.js?v=20260603-23";
import { answerList, createNewRound, evaluateAnswer, nextProvePlayer, provePhaseEnd, stopGameTimer } from "./game.js?v=20260603-21";
import { getGameMode } from "./games.js?v=20260603-6";
import { createImpostorGame, ImpostorEngine, sanitizeImpostorSettings, stopImpostorTimer } from "./impostor.js?v=20260602-1";
import { createIdentityGame, IdentityEngine, stopIdentityTimer } from "./identity.js?v=20260602-1";
import { createOtherQuestionGame, OtherQuestionEngine, stopOtherQuestionTimer } from "./otherQuestion.js";
import { currentWouldYouRather, renderWouldYouRather, setWouldYouRatherVote, wouldYouRatherPlayerKey } from "./wouldYouRather.js?v=20260603-22";
import { createMostLikelyGame, MostLikelyEngine, stopMostLikelyTimer } from "./mostLikely.js";
import { createFriendshipTestGame, FriendshipTestEngine, stopFriendshipTimer } from "./friendshipTest.js";
import { createRoomModal, renderLobby } from "./lobby.js?v=20260602-15";
import { renderPlatform } from "./platform.js?v=20260602-1";
import { Router } from "./router.js";
import { playerMini, renderRoom } from "./room.js?v=20260602-1";
import { renderShop, stopShopTimer } from "./shop.js?v=20260602-21";
import { $, icon, normalizeNick, randomGuestNick, uid } from "./utils.js";
import { grantProgression, levelProgressButtonHtml, progressionModal } from "./progression.js?v=20260602-6";

const root = $("#app");
const accounts = loadAccounts();
Object.values(accounts).forEach(account => { if(account.password&&!account.passwordHash)account.passwordHash=hashRoomPassword(`account:${account.password}`);delete account.password; });
saveAccounts(accounts);
const session=loadSession();
const state = { accounts, currentUser:accounts[session.currentUser]?session.currentUser:null, rooms: [], activeRoomId:session.activeRoomId||null, selectedGameMode:session.selectedGameMode||"udowodnij", afterLogin: null, pendingJoin:null, onlineBackend:null, shopReturnScreen:null };
const profile = () => state.currentUser ? state.accounts[state.currentUser] : null;
const activeRoom = () => state.rooms.find(room => room.roomId === state.activeRoomId);
const accountByNick = nick => Object.entries(state.accounts).find(([, account]) => account.nick === nick && !account.nickOnly);
const publicProfile = player => ({ nick:player?.nick || "Gracz", avatarImage:player?.avatarImage || "", nickOnly:Boolean(player?.nickOnly), money:Number(player?.money)||0, sessionMoney:Number(player?.sessionMoney)||0, xp:Number(player?.xp)||0, sessionXp:Number(player?.sessionXp)||0, selectedNickEffect:player?.selectedNickEffect || "defaultNick", selectedAvatarFrame:player?.selectedAvatarFrame || "defaultFrame", selectedAura:player?.selectedAura || "noAura" });
const persistSession=()=>saveSession({currentUser:state.currentUser,activeRoomId:state.activeRoomId,selectedGameMode:state.selectedGameMode});
let restoredRoom=false;
const pendingRoomSyncs=new Map();
const roomSyncChains=new Map();
const roomRosterSnapshots=new Map();
const roomPhaseSnapshots=new Map();
let stopRoomsSubscription=()=>{};

function saveAndRender() { saveAccounts(state.accounts); render(); }
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
  current.then(result=>{const latest=pendingRoomSyncs.get(roomId)===version;if(roomSyncChains.get(roomId)===current)roomSyncChains.delete(roomId);if(latest)pendingRoomSyncs.delete(roomId);if(!result.ok){message(`Nie udało się zsynchronizować pokoju: ${result.error}`);connectRooms();return;}const local=state.rooms.find(room=>room.roomId===roomId);if(result.room&&(!local||Number(result.room.updatedAt||0)>=Number(local.updatedAt||0))){const synced=installRemoteRoom(result.room);if(latest&&state.activeRoomId===roomId&&["room","game"].includes(Router.current)){if(synced.status==="playing"&&synced.game&&Router.current==="room")return Router.go("game");if(synced.status==="lobby"&&Router.current==="game")return Router.go("room");render();}}});
}
function updateProfile(patch) { if (state.currentUser) { state.accounts[state.currentUser] = { ...profile(), ...patch, updatedAt:Date.now() }; syncPlayerProfile(state.currentUser,state.accounts[state.currentUser]); const room=activeRoom();if(room?.players.includes(state.currentUser))touchRoom(room);saveAndRender(); } }
function touchRoom(room) { room.updatedAt = Math.max(Date.now(),Number(room.updatedAt||0)+1); if(room.players.includes(state.currentUser)&&profile())room.playerProfiles={...(room.playerProfiles||{}),[state.currentUser]:publicProfile(profile())}; queueRoomSync(room); return room; }
function installRemoteRoom(room) {
  const index=state.rooms.findIndex(item=>item.roomId===room.roomId);
  if(index>=0)state.rooms[index]=room;else state.rooms.unshift(room);
  Object.entries(room.playerProfiles||{}).forEach(([id,item])=>{state.accounts[id]=id===state.currentUser?{...item,...(state.accounts[id]||{})}:{...(state.accounts[id]||{}),...item};});
  saveAccounts(state.accounts);return room;
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
function rewardRoomXp(room, amount) {
  room.players.forEach(uid=>addPlayerXp(uid,amount));
}
function claimPendingProgress(room) {
  const money=Number(room?.pendingRewards?.[state.currentUser])||0,xp=Number(room?.pendingXp?.[state.currentUser])||0;if((!money&&!xp)||!profile())return false;
  room.pendingRewards={...(room.pendingRewards||{})};room.pendingXp={...(room.pendingXp||{})};delete room.pendingRewards[state.currentUser];delete room.pendingXp[state.currentUser];
  if(money)applyPlayerMoney(state.currentUser,money);if(xp)applyPlayerXp(state.currentUser,xp);saveAccounts(state.accounts);touchRoom(room);return true;
}
function settleProveResult(room) {
  if(room.gameMode!=="udowodnij"||room.game.phase!=="result"||room.game.result?.rewarded||room.game.result?.leftRoom)return;
  if(room.game.result.success)addPlayerMoney(room.game.currentBidder,100);
  else room.players.filter(uid=>uid!==room.game.result.loser).forEach(uid=>addPlayerMoney(uid,100));
  rewardRoomXp(room,18);
  room.game.result.rewarded=true;saveAccounts(state.accounts);Audio.play(room.game.result.success?"success":"roundEnd");
}
function settleImpostorResult(room) {
  if (room.game.phase !== "results" || room.game.result.rewarded) return;
  const winners = room.players.filter(uid => room.game.result.citizensWin ? room.game.roles[uid].role === "citizen" : room.game.roles[uid].role !== "citizen");
  winners.forEach(uid => addPlayerMoney(uid,150));
  rewardRoomXp(room,55);
  room.game.result.rewarded=true; room.status="results"; saveAccounts(state.accounts); Audio.play("roundEnd");
}
function settleOtherQuestionResult(room) {
  if(room.game.phase!=="results"||room.game.result.rewarded)return;
  const winners=room.game.result.caught?room.players.filter(uid=>uid!==room.game.impostor):[room.game.impostor];
  winners.forEach(uid=>addPlayerMoney(uid,100));
  rewardRoomXp(room,18);
  room.game.result.rewarded=true;saveAccounts(state.accounts);Audio.play("roundEnd");
}
function settleMostLikelyResult(room) {
  if(room.game.phase!=="gameSummary"||room.game.rewarded)return;
  room.players.forEach(uid=>addPlayerMoney(uid,25+(room.game.totals[uid]||0)*10));
  rewardRoomXp(room,60);
  room.game.rewarded=true;saveAccounts(state.accounts);touchRoom(room);Audio.play("roundEnd");
}
function settleFriendshipResult(room) {
  if(room.game.phase!=="gameSummary"||room.game.rewarded)return;
  if(room.settings.rewardCoins)room.players.forEach(uid=>addPlayerMoney(uid,(room.game.scores[uid]||0)*25));
  rewardRoomXp(room,60);
  room.game.rewarded=true;saveAccounts(state.accounts);touchRoom(room);Audio.play("roundEnd");
}
function settleIdentityResult(room) {
  if(room.game.phase!=="results"||room.game.rewarded)return;
  rewardRoomXp(room,60);room.game.rewarded=true;saveAccounts(state.accounts);touchRoom(room);Audio.play("roundEnd");
}
function message(text, type = "error") {
  Audio.play(type === "error" ? "error" : "notification");
  const toast = document.createElement("div"); toast.className = `toast ${type}`; toast.textContent = text; document.body.append(toast);
  setTimeout(() => toast.remove(), 3200);
}
const finishedRoomPhases = new Set(["result", "results", "final", "roundResult", "roundSummary", "gameSummary"]);
function shouldCloseLonelyFinishedRoom(room) {
  return room?.players?.length === 1 && room.status !== "lobby" && finishedRoomPhases.has(room.game?.phase);
}
function showRoomClosedNotice() {
  if (document.querySelector("[data-room-closed-modal]")) return;
  const modal = document.createElement("div"); modal.className = "modal-backdrop"; modal.dataset.roomClosedModal = "true";
  modal.innerHTML = `<section class="modal confirm-modal enter" role="dialog" aria-modal="true" aria-labelledby="room-closed-title"><div class="modal-title"><div><p class="eyebrow">POKÓJ ZAMKNIĘTY</p><h2 id="room-closed-title">Rozgrywka została zakończona</h2></div></div><p class="muted">W pokoju został tylko jeden gracz, więc nie można rozpocząć kolejnej rundy. Wróciłeś do menu gier.</p><div class="modal-actions"><button class="primary" data-close-room-notice>Rozumiem</button></div></section>`;
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
  if (wasActive) { state.activeRoomId = null; persistSession(); Router.go("platform"); if (notify) showRoomClosedNotice(); }
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
function defaultAccount(nick, password, auth = {}) {
  return { nick, passwordHash:hashRoomPassword(`account:${password}`), authEmail: nickToEmail(nick), authProvider: auth.provider || "local", money: 0, xp:0, claimedLevelRewards:{}, stats:{},
    ownedCosmetics: { defaultNick: true, defaultFrame: true, noAura: true }, selectedNickEffect: "defaultNick",
    selectedAvatarFrame: "defaultFrame", selectedAura: "noAura", createdAt: Date.now() };
}

const actions = {
  refresh: render,
  goPlatform() { if(activeRoom())return actions.leaveRoom("platform");Router.go("platform"); },
  goLobby() { Router.go("lobby"); },
  goHome() { const destination=state.shopReturnScreen||"platform";state.shopReturnScreen=null;Router.go(destination); },
  openShop() { const room=activeRoom();state.shopReturnScreen=room?(room.status==="lobby"?"room":"game"):(Router.current==="shop"?state.shopReturnScreen:Router.current);Router.go("shop"); },
  joinByCode(roomId,password="") {
    const code=String(roomId||"").trim().toUpperCase();
    if(!code)return message("Wpisz kod pokoju.");
    if(!profile()){state.pendingJoin={roomId:code,password};return actions.openAuth({title:"Zaloguj się, aby dołączyć do pokoju",description:"Po logowaniu od razu przeniesiemy cię do właściwej gry."});}
    actions.joinRoom(code,password);
  },
  selectGame(gameMode) {
    state.selectedGameMode = gameMode;persistSession();
    if (getGameMode(gameMode).supportsSolo && !getGameMode(gameMode).supportsLobby) return Router.go("solo");
    if (!profile()) { state.afterLogin = "lobby"; return actions.openAuth({ title: `Zaloguj się, aby zagrać w ${getGameMode(gameMode).name}` }); }
    Router.go("lobby");
  },
  openAuth(options = {}) {
    const modal = authModal(actions, options); document.body.append(modal); Audio.play("modalOpen");
  },
  openAccount() {
    if (!profile()) return actions.openAuth({ title: "Zaloguj się lub utwórz konto", description: "Konto zapisuje coiny, kosmetyki i efekty nicku." });
    const modal = accountModal(profile(), actions); document.body.append(modal); Audio.play("modalOpen");
  },
  openProgression() { if(profile()){const modal=progressionModal(profile(),actions.closeModal);document.body.append(modal);Audio.play("modalOpen");} },
  async login(nick, password, mode) {
    const clean = normalizeNick(nick || (mode==="nickOnly"?randomGuestNick():""));
    if (!clean) { message("Nick może mieć tylko litery, cyfry i _."); return false; }
    if (mode === "nickOnly") {
      try {
        const auth=await authenticateGuest(),guestId=auth.uid; state.accounts[guestId] = { ...defaultAccount(clean, "",auth), nickOnly: true, sessionMoney: 0, sessionXp:0 };
        state.currentUser = guestId;saveAccounts(state.accounts);persistSession();connectRooms();actions.finishLogin(); return true;
      } catch { message("Nie udało się uruchomić gry po nicku. Sprawdź czy Anonymous Auth jest włączone."); return false; }
    }
    if (!password || password.length < 3) { message("Hasło musi mieć minimum 3 znaki."); return false; }
    try {
      const existingEntry = accountByNick(clean), existing = existingEntry?.[1];
      const auth = await authenticateNick(clean, password);
      const accountId = auth.uid;
      const remote=await loadRemoteProfile(accountId);
      state.accounts[accountId] = { ...defaultAccount(clean,password,auth), ...(existing||{}), ...(remote||{}), passwordHash:hashRoomPassword(`account:${password}`) }; delete state.accounts[accountId].password;
      if(existingEntry?.[0]&&existingEntry[0]!==accountId)delete state.accounts[existingEntry[0]];
      state.currentUser = accountId; saveAccounts(state.accounts);persistSession(); syncPlayerProfile(accountId,state.accounts[accountId]);connectRooms();Audio.play("success"); actions.finishLogin(); return true;
    } catch { message("Nie udało się zalogować. Spróbuj ponownie."); return false; }
  },
  finishLogin() { if(state.pendingJoin){const pending=state.pendingJoin;state.pendingJoin=null;return actions.joinRoom(pending.roomId,pending.password);}const destination = state.afterLogin || "platform"; state.afterLogin = null; Router.go(destination); },
  async logout() {
    const roomUpdates=state.rooms.map(room => {
      interruptProveRoundForDeparture(room,state.currentUser);
      room.players = room.players.filter(id => id !== state.currentUser);
      if(room.playerProfiles)delete room.playerProfiles[state.currentUser];
      if (room.hostUid === state.currentUser) room.hostUid = room.players[0];
      if(!room.players.length)return removeRemoteRoom(room.roomId);
      if(shouldCloseLonelyFinishedRoom(room))return removeRemoteRoom(room.roomId);
      room.updatedAt=Math.max(Date.now(),Number(room.updatedAt||0)+1);
      return syncRoomState(room);
    });
    await Promise.allSettled(roomUpdates);
    state.rooms = state.rooms.filter(room => room.players.length);
    await logoutAuth();
    state.currentUser = null; state.activeRoomId = null;clearSession(); Router.go("platform");
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
  async createRoom({ name, password, settings, isPrivate }) {
    if(!ensureRoomSession()||!profile())return false;
    const now = Date.now(); const mode = getGameMode(state.selectedGameMode);
    const room = { roomId: uid(), gameMode: mode.id, name: name.trim() || `Pokój ${profile().nick}`, passwordHash:isPrivate?hashRoomPassword(password):"",
      isPrivate, hostUid: state.currentUser, players: [state.currentUser], joinedAt:{[state.currentUser]:now}, playerProfiles:{[state.currentUser]:publicProfile(profile())}, status: "lobby", settings, createdAt: now, updatedAt: now, game: null };
    const result=await syncRoomState(room);if(!result.ok){message(`Nie udało się utworzyć pokoju: ${result.error}`);connectRooms();return false;}
    state.rooms = [room, ...state.rooms.filter(item=>item.roomId!==room.roomId)]; state.activeRoomId = room.roomId;persistSession(); Audio.play("joinRoom"); Router.go("room");
    return true;
  },
  joinRoom(roomId, password = "") {
    if(!ensureRoomSession()||!profile())return false;
    const code=String(roomId||"").trim().toUpperCase(),room = state.rooms.find(item => item.roomId === code); if (!room) return message("Nie znaleziono pokoju.");
    const mode = getGameMode(room.gameMode);
    if (room.isPrivate && room.passwordHash !== hashRoomPassword(password)) return message("Złe hasło do pokoju.");
    if (!room.players.includes(state.currentUser)) {
      if (room.status !== "lobby") return message("Gra już wystartowała.");
      if (room.players.length >= mode.maxPlayers) return message("Pokój jest pełny.");
      room.players.push(state.currentUser); room.joinedAt={...(room.joinedAt||{}),[state.currentUser]:Date.now()}; room.playerProfiles={...(room.playerProfiles||{}),[state.currentUser]:publicProfile(profile())}; touchRoom(room);
    }
    state.selectedGameMode = room.gameMode; state.activeRoomId = room.roomId;persistSession(); Audio.play("joinRoom"); Router.go(room.status === "lobby" ? "room" : "game");
  },
  leaveRoom(destination = "lobby") { leaveRoomModal(destination); },
  confirmLeaveRoom(destination = "lobby") {
    const room = activeRoom(); if (!room) return;
    interruptProveRoundForDeparture(room,state.currentUser);
    room.players = room.players.filter(id => id !== state.currentUser); if(room.playerProfiles)delete room.playerProfiles[state.currentUser];if(room.joinedAt)delete room.joinedAt[state.currentUser]; if (room.hostUid === state.currentUser) room.hostUid = room.players[0];
    const closeRoom=!room.players.length||shouldCloseLonelyFinishedRoom(room);
    if(closeRoom){removeRemoteRoom(room.roomId);removeRoomLocally(room.roomId);}else touchRoom(room); state.rooms = state.rooms.filter(item => item.players.length); state.activeRoomId = null;persistSession(); Audio.play("leaveRoom"); Router.go(destination);
  },
  kickPlayer(playerId) { const room = activeRoom(); if (room?.hostUid === state.currentUser) { interruptProveRoundForDeparture(room,playerId);room.players = room.players.filter(id => id !== playerId); if(room.playerProfiles)delete room.playerProfiles[playerId];if(room.joinedAt)delete room.joinedAt[playerId];if(!room.players.length||shouldCloseLonelyFinishedRoom(room)){removeRemoteRoom(room.roomId);removeRoomLocally(room.roomId);state.activeRoomId=null;persistSession();Router.go("platform");showRoomClosedNotice();}else{touchRoom(room);render();} } },
  setRoomTime(answerTime) { const room = activeRoom(); if (room?.hostUid === state.currentUser && room.status === "lobby") { room.settings.answerTime = answerTime; touchRoom(room); render(); } },
  setImpostorSetting(key,value) {
    const room=activeRoom(); if(!room||room.hostUid!==state.currentUser||room.gameMode!=="impostor")return;
    room.settings=sanitizeImpostorSettings({...room.settings,[key]:value},room.players.length); touchRoom(room); render();
  },
  setModeSetting(key,value){const room=activeRoom();if(!room||room.hostUid!==state.currentUser)return;room.settings={...room.settings,[key]:["turnTime","rounds","answerTime","discussionTime","voteTime","questionTime","assignTime"].includes(key)?Number(value):value};touchRoom(room);render();},
  saveIdentityWords(text){const room=activeRoom();if(!room||room.gameMode!=="kim-jestem")return;room.customWords??={};room.customWords[state.currentUser]=text.split(",").map(x=>x.trim()).filter(Boolean).slice(0,5);touchRoom(room);message("Hasła zapisane.","info");render();},
  startGame() {
    const room = activeRoom(), mode = getGameMode(room?.gameMode);
    if (!room || room.hostUid !== state.currentUser || room.players.length < mode.minPlayers) return;
    room.status = "playing"; room.settings=mode.id==="impostor"?sanitizeImpostorSettings(room.settings,room.players.length):room.settings;
    room.game = mode.id === "udowodnij" ? createNewRound(room.players, room.settings.answerTime) : mode.id === "impostor" ? createImpostorGame(room.players,room.settings) : mode.id === "kim-jestem" ? createIdentityGame(room.players,room.settings,room.customWords) : mode.id === "inne-pytanie" ? createOtherQuestionGame(room.players,room.settings) : mode.id === "kto-najpredzej" ? createMostLikelyGame(room.players,room.settings) : mode.id === "test-znajomosci" ? createFriendshipTestGame(room.players,room.settings) : {};
    touchRoom(room); Audio.play("gameStart"); Effects.play("gameStart",`${room.roomId}:game-start`); Router.go("game");
  },
  returnToRoom() { const room = activeRoom(); if (room) { if(closeLonelyFinishedRoom(room,{notify:true}))return; room.status = "lobby"; room.game = null; touchRoom(room); Router.go("room"); } },
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
  impostorTimeout(){const room=activeRoom();if(!room||room.gameMode!=="impostor"||room.hostUid!==state.currentUser)return;const phase=room.game?.phase;return mutateRoomGame((game,current)=>{if(game.phase!==phase)return"Faza gry już się zmieniła.";ImpostorEngine.timeout(game,current.settings);},{after:settleImpostorResult});},
  impostorDecision(keepPlaying){return mutateRoomGame((game,room)=>ImpostorEngine.decide(game,state.currentUser,keepPlaying,room.settings),{sound:"vote"});},
  impostorVote(target){return mutateRoomGame(game=>ImpostorEngine.vote(game,state.currentUser,target),{sound:"vote",after:settleImpostorResult});},
  impostorReact(text){return mutateRoomGame(game=>ImpostorEngine.react(game,state.currentUser,text)?null:"Reakcja odnawia się co 5 sekund.",{sound:"notification"});},
  impostorChat(text){const room=activeRoom();if(!room?.settings.chatEnabled)return;return mutateRoomGame(game=>ImpostorEngine.chat(game,state.currentUser,text),{sound:"chat"});},
  impostorPlayAgain(){const room=activeRoom();if(closeLonelyFinishedRoom(room,{notify:true}))return;room.status="lobby";room.game=null;touchRoom(room);Router.go("room");},
  identitySubmit(text,type){return mutateRoomGame((game,room)=>IdentityEngine.submit(game,state.currentUser,text,type,room.settings,room.customWords),{sound:type==="guess"?"submit":"clue",after:settleIdentityResult});},
  identityRespond(response){return mutateRoomGame((game,room)=>IdentityEngine.respond(game,state.currentUser,response,room.settings,room.customWords),{sound:"choice",after:settleIdentityResult});},
  identityTimeout(){const room=activeRoom();if(!room||room.gameMode!=="kim-jestem"||room.hostUid!==state.currentUser)return;const phase=room.game?.phase;return mutateRoomGame((game,current)=>{if(game.phase!==phase)return"Faza gry już się zmieniła.";IdentityEngine.timeout(game,current.settings,current.customWords);},{after:settleIdentityResult});},
  otherAnswer(text){return mutateRoomGame((game,room)=>OtherQuestionEngine.answer(game,state.currentUser,text,room.settings),{sound:"submit"});},
  otherChat(text){const room=activeRoom();if(!room?.settings.chatEnabled)return;return mutateRoomGame(game=>OtherQuestionEngine.chat(game,state.currentUser,text),{sound:"chat"});},
  otherVote(uid){return mutateRoomGame(game=>OtherQuestionEngine.vote(game,state.currentUser,uid),{sound:"vote",after:settleOtherQuestionResult});},
  otherTimeout(){const room=activeRoom();if(!room||room.gameMode!=="inne-pytanie"||room.hostUid!==state.currentUser)return;const phase=room.game?.phase;return mutateRoomGame((game,current)=>{if(game.phase!==phase)return"Faza gry już się zmieniła.";OtherQuestionEngine.timeout(game,current.settings);},{after:settleOtherQuestionResult});},
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
  mostLikelyTimeout(){const room=activeRoom();if(!room||room.gameMode!=="kto-najpredzej"||room.hostUid!==state.currentUser)return;const phase=room.game?.phase;return mutateRoomGame((game,current)=>{if(game.phase!==phase)return"Faza gry już się zmieniła.";MostLikelyEngine.timeout(game,current.players,current.settings);});},
  mostLikelyNext(){const room=activeRoom();if(closeLonelyFinishedRoom(room,{notify:true}))return;return mutateRoomGame((game,current)=>{if(game.phase!=="roundResult")return"Runda została już zmieniona.";MostLikelyEngine.next(game,current.settings);},{after:settleMostLikelyResult});},
  friendshipAnswer(text){return mutateRoomGame((game,room)=>FriendshipTestEngine.answer(game,state.currentUser,text,room.players,room.settings),{sound:"submit"});},
  friendshipGuess(answerId,target){return mutateRoomGame((game,room)=>FriendshipTestEngine.guess(game,state.currentUser,answerId,target,room.players),{sound:"vote"});},
  friendshipTimeout(){const room=activeRoom();if(!room||room.gameMode!=="test-znajomosci"||room.hostUid!==state.currentUser)return;const phase=room.game?.phase;return mutateRoomGame((game,current)=>{if(game.phase!==phase)return"Faza gry już się zmieniła.";FriendshipTestEngine.timeout(game,current.players,current.settings);});},
  friendshipRevealNext(){return mutateRoomGame((game,current)=>{if(game.phase!=="revealing")return"Odpowiedzi zostały już pokazane.";FriendshipTestEngine.nextReveal(game,current.players);});},
  friendshipRoundNext(){const room=activeRoom();if(closeLonelyFinishedRoom(room,{notify:true}))return;return mutateRoomGame((game,current)=>{if(game.phase!=="roundSummary")return"Runda została już zmieniona.";FriendshipTestEngine.nextRound(game,current.players,current.settings);},{after:settleFriendshipResult});},
  buyCosmetic(itemId) {
    const item = cosmetics.find(entry => entry.id === itemId), user = profile(); if (!item || !user || user.ownedCosmetics[itemId]) return;
    if (user.nickOnly) return message("Zaloguj się na konto, żeby kupować efekty."); if (user.money < item.price) return message("Nie masz tyle pieniędzy.");
    Audio.play("purchase"); updateProfile({ money: user.money - item.price, ownedCosmetics: { ...user.ownedCosmetics, [itemId]: true } });
  },
  equipCosmetic(itemId) { const item = cosmetics.find(entry => entry.id === itemId), user = profile(); if (!item || !user?.ownedCosmetics[itemId]) return; Audio.play("success"); updateProfile({ [{ nick:"selectedNickEffect", frame:"selectedAvatarFrame", aura:"selectedAura" }[item.type]]: itemId }); },
};

function audioModal() {
  const settings = Audio.settings, modal = document.createElement("div"); modal.className = "modal-backdrop";
  modal.innerHTML = `<section class="modal audio-modal enter" role="dialog" aria-modal="true"><div class="modal-title"><div><p class="eyebrow">AUDIO</p><h2>Ustawienia dźwięku</h2></div><button class="icon-btn" data-close>${icon("x",18)}</button></div><label>Music Volume <span id="music-value">${Math.round(settings.musicVolume*100)}%</span></label><input id="music-volume" type="range" min="0" max="1" step="0.01" value="${settings.musicVolume}"><label>SFX Volume <span id="sfx-value">${Math.round(settings.sfxVolume*100)}%</span></label><input id="sfx-volume" type="range" min="0" max="1" step="0.01" value="${settings.sfxVolume}"><label class="check"><input id="mute-all" type="checkbox" ${settings.muted?"checked":""}> Mute All</label><p class="tiny">Ambient: ${Audio.currentTrack}. Ustawienia zapisują się automatycznie.</p></section>`;
  modal.querySelector("[data-close]").addEventListener("click",()=>actions.closeModal(modal)); $("#music-volume",modal).addEventListener("input",e=>{Audio.setMusicVolume(e.target.value);$("#music-value",modal).textContent=`${Math.round(e.target.value*100)}%`;}); $("#sfx-volume",modal).addEventListener("input",e=>{Audio.setSfxVolume(e.target.value);$("#sfx-value",modal).textContent=`${Math.round(e.target.value*100)}%`;}); $("#mute-all",modal).addEventListener("change",e=>Audio.setMuted(e.target.checked)); document.body.append(modal); Audio.play("modalOpen");
}
function topBar() { const user = profile(); return `<header class="topbar"><div class="brand-zone"><button class="brand" id="brand-home">${icon("zap",20)} <span>Gry dla znajomych!</span></button>${user?levelProgressButtonHtml(user):""}</div><nav class="top-actions"><button class="icon-btn" id="audio-settings" aria-label="Ustawienia audio">${icon("audio",18)}</button>${user ? `<button class="icon-btn" id="open-shop" aria-label="Sklep">${icon("shop",18)}</button><div class="money ${user.nickOnly?"muted-money":""}">$${user.nickOnly?user.sessionMoney||0:user.money}</div><button class="account-button" id="account">${playerMini(user)}</button>` : `<button class="account-button" id="account">${icon("user",18)} Konto</button>`}</nav></header>`; }
function render() {
  stopShopTimer(); stopGameTimer(); stopImpostorTimer(); stopIdentityTimer(); stopOtherQuestionTimer(); stopMostLikelyTimer(); stopFriendshipTimer(); root.innerHTML = '<div class="bg-orb orb1"></div><div class="bg-orb orb2"></div>'; root.insertAdjacentHTML("beforeend",topBar());
  $("#brand-home").addEventListener("click",actions.goPlatform); $("#open-progression")?.addEventListener("click",actions.openProgression); $("#audio-settings").addEventListener("click",audioModal); $("#account").addEventListener("click",actions.openAccount); $("#open-shop")?.addEventListener("click",actions.openShop);
  const view=document.createElement("div"); root.append(view); const screen=Router.current;
  if(screen==="platform") return renderPlatform(view,actions); if(screen==="solo") return renderWouldYouRather(view,{profile:profile(),playerId:state.currentUser},actions); if(screen==="lobby") return profile()?renderLobby(view,state,actions):Router.go("platform"); if(screen==="shop") return profile()?renderShop(view,{profile:profile()},actions):actions.openAuth();
  const room=activeRoom(); if(!room) return Router.go("platform"); if(screen==="game") return getGameMode(room.gameMode).render(view,{room,accounts:state.accounts,currentUser:state.currentUser,mode:getGameMode(room.gameMode)},actions); renderRoom(view,{room,accounts:state.accounts,currentUser:state.currentUser},actions);
}
function connectRooms(){stopRoomsSubscription();state.onlineBackend=hasOnlineBackend()?null:false;stopRoomsSubscription=subscribeRemoteRooms((remoteRooms,source)=>{state.onlineBackend=source==="remote"?true:source==="local"?false:null;const requestedRoomId=state.activeRoomId,keepLocal=source!=="remote"?state.rooms:state.rooms.filter(room=>pendingRoomSyncs.has(room.roomId)),rooms=new Map(keepLocal.map(room=>[room.roomId,room]));remoteRooms.forEach(remote=>{const local=state.rooms.find(room=>room.roomId===remote.roomId),pending=pendingRoomSyncs.has(remote.roomId),keepPendingLocal=local&&pending&&Number(local.updatedAt||0)>Number(remote.updatedAt||0),room=keepPendingLocal?local:remote;rooms.set(room.roomId,room);Object.entries(room.playerProfiles||{}).forEach(([id,item])=>{state.accounts[id]=id===state.currentUser?{...item,...(state.accounts[id]||{})}:{...(state.accounts[id]||{}),...item};});});state.rooms=[...rooms.values()];saveAccounts(state.accounts);const room=activeRoom();if(room&&interruptProveRoundWithMissingPlayer(room)){if(closeLonelyFinishedRoom(room,{notify:true}))return;touchRoom(room);return render();}if(room&&closeLonelyFinishedRoom(room,{notify:true}))return;if(requestedRoomId&&source==="remote"&&!room&&!pendingRoomSyncs.has(requestedRoomId)){state.activeRoomId=null;persistSession();Router.go("platform");showRoomClosedNotice();return;}announceRoomRoster(room);announceRoomPhase(room);claimPendingProgress(room);if(room?.status==="playing"&&room.game&&Router.current==="room"){Effects.play("gameStart",`${room.roomId}:game-start`);return Router.go("game");}if(room?.status==="lobby"&&Router.current==="game")return Router.go("room");if(!restoredRoom&&room){restoredRoom=true;return Router.go(room.game?"game":"room");}if(["lobby","room","game"].includes(Router.current))render();},()=>{state.onlineBackend=false;if(profile())message("Firebase odrzucił dostęp do pokoi. Zaloguj się ponownie albo sprawdź reguły bazy.");if(["lobby","room","game"].includes(Router.current))render();});}
Audio.init(); Audio.bindGlobalUI(); Router.init(render); initFirebaseAuth().catch(()=>false).then(online=>{if(!online)state.onlineBackend=false;else restoreFirebaseSession();connectRooms();if(["solo","lobby","platform"].includes(Router.current))render();}); render();
