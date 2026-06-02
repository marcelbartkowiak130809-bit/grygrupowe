const ACCOUNTS_KEY = "udowodnij_prototype_accounts_v1";
const SESSION_KEY = "udowodnij_session_v1";
const LOCAL_ROOMS_KEY = "udowodnij_local_rooms_v1";
const WOULD_YOU_RATHER_VOTES_KEY = "udowodnij_would_you_rather_votes_v1";
const WOULD_YOU_RATHER_ANSWERS_KEY = "udowodnij_would_you_rather_answers_v1";
let remoteAuth;
let firebaseAuthApi;
let remoteDatabase;
let firebaseDatabaseApi;
let serverTimeOffset = 0;

export function nickToEmail(nick) {
  return `${nick}@udowodnij.local`;
}

export async function initFirebaseAuth() {
  const config = window.__UDOWODNIJ_FIREBASE_CONFIG__;
  if (!config?.apiKey) return false;
  const [{ initializeApp }, authApi, databaseApi] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js"),
  ]);
  firebaseAuthApi = authApi;
  firebaseDatabaseApi = databaseApi;
  const app = initializeApp(config);
  remoteAuth = authApi.getAuth(app);
  if (remoteAuth.authStateReady) await remoteAuth.authStateReady();
  if (config.databaseURL) {
    remoteDatabase = databaseApi.getDatabase(app);
    databaseApi.onValue(databaseApi.ref(remoteDatabase, ".info/serverTimeOffset"), snapshot => {
      serverTimeOffset = Number(snapshot.val()) || 0;
    });
  }
  return true;
}

export function serverNow() {
  return Date.now() + serverTimeOffset;
}

export async function authenticateNick(nick, password) {
  const email = nickToEmail(nick);
  if (!remoteAuth) return { uid: nick, email, provider: "local" };
  try {
    const credentials = await firebaseAuthApi.signInWithEmailAndPassword(remoteAuth, email, password);
    return { uid: credentials.user.uid, email, provider: "firebase" };
  } catch (error) {
    if (!["auth/invalid-credential", "auth/user-not-found"].includes(error.code)) throw error;
    const credentials = await firebaseAuthApi.createUserWithEmailAndPassword(remoteAuth, email, password);
    return { uid: credentials.user.uid, email, provider: "firebase" };
  }
}

export async function authenticateGuest() {
  if (!remoteAuth) return { uid:`guest_${Date.now()}`, provider:"local" };
  if(remoteAuth.currentUser?.isAnonymous)return { uid:remoteAuth.currentUser.uid, provider:"firebase-anonymous" };
  const credentials=await firebaseAuthApi.signInAnonymously(remoteAuth);
  return { uid:credentials.user.uid, provider:"firebase-anonymous" };
}

export function getFirebaseSession() {
  return remoteAuth?.currentUser ? { uid:remoteAuth.currentUser.uid, email:remoteAuth.currentUser.email || "", isAnonymous:Boolean(remoteAuth.currentUser.isAnonymous) } : null;
}

export async function updateAuthPassword(password) {
  if (remoteAuth?.currentUser) await firebaseAuthApi.updatePassword(remoteAuth.currentUser, password);
}

export async function logoutAuth() {
  if (remoteAuth) await firebaseAuthApi.signOut(remoteAuth);
}

export function loadAccounts() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}
export function loadSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "{}"); } catch { return {}; }
}
export function saveSession(session) { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); }
export function clearSession() { localStorage.removeItem(SESSION_KEY); }
export function hasOnlineBackend() { return Boolean(remoteDatabase); }

function readLocal(key) {
  try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; }
}
function saveLocal(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
const publicProfile = profile => ({ nick:profile.nick, avatarImage:profile.avatarImage || "", xp:Number(profile.xp)||0, selectedNickEffect:profile.selectedNickEffect, selectedAvatarFrame:profile.selectedAvatarFrame, selectedAura:profile.selectedAura, updatedAt:Date.now() });
const savedProfile = profile => ({ nick:profile.nick, avatarImage:profile.avatarImage || "", money:profile.money || 0, xp:Number(profile.xp)||0, claimedLevelRewards:profile.claimedLevelRewards || {}, ownedCosmetics:profile.ownedCosmetics || {}, selectedNickEffect:profile.selectedNickEffect, selectedAvatarFrame:profile.selectedAvatarFrame, selectedAura:profile.selectedAura, answeredWouldYouRather:profile.answeredWouldYouRather || {}, stats:profile.stats || {}, createdAt:profile.createdAt || Date.now(), updatedAt:Date.now() });
export async function loadRemoteProfile(uid) {
  if (!remoteDatabase || !uid) return null;
  try { return (await firebaseDatabaseApi.get(firebaseDatabaseApi.ref(remoteDatabase, `profiles/${uid}`))).val() || null; }
  catch { return null; }
}
export async function syncPlayerProfile(uid, profile) {
  if (!remoteDatabase || !uid || !profile || profile.nickOnly) return false;
  try {
    await Promise.all([
      firebaseDatabaseApi.update(firebaseDatabaseApi.ref(remoteDatabase, `profiles/${uid}`), savedProfile(profile)),
      firebaseDatabaseApi.set(firebaseDatabaseApi.ref(remoteDatabase, `publicProfiles/${uid}`), publicProfile(profile)),
    ]);
    return true;
  } catch { return false; }
}
export function hashRoomPassword(value = "") {
  let hash = 2166136261;
  for (const char of String(value)) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0).toString(36);
}
export function getLocalWouldYouRatherAnswers(playerId = "guest") {
  return readLocal(WOULD_YOU_RATHER_ANSWERS_KEY)[playerId] || {};
}
export async function getWouldYouRatherVotes(questionId) {
  if (remoteDatabase) {
    try {
      const snapshot = await firebaseDatabaseApi.get(firebaseDatabaseApi.ref(remoteDatabase, `wouldYouRatherVotes/${questionId}`));
      return { a:snapshot.val()?.a || 0, b:snapshot.val()?.b || 0, source:"firebase" };
    } catch {}
  }
  const votes=readLocal(WOULD_YOU_RATHER_VOTES_KEY)[questionId] || {};
  return { a:votes.a || 0, b:votes.b || 0, source:"demo" };
}
export function subscribeWouldYouRatherVotes(questionId, callback) {
  if (!remoteDatabase) return () => {};
  const votesRef=firebaseDatabaseApi.ref(remoteDatabase,`wouldYouRatherVotes/${questionId}`);
  return firebaseDatabaseApi.onValue(votesRef,snapshot=>callback({a:snapshot.val()?.a||0,b:snapshot.val()?.b||0,source:"firebase"}));
}
export async function voteWouldYouRather({ questionId, choice, playerId, persistProfile }) {
  const answers=readLocal(WOULD_YOU_RATHER_ANSWERS_KEY), playerAnswers=answers[playerId] || {};
  if (playerAnswers[questionId]) return { accepted:false, votes:await getWouldYouRatherVotes(questionId) };
  if (remoteDatabase && persistProfile) {
    try {
      const profileAnswer=await firebaseDatabaseApi.get(firebaseDatabaseApi.ref(remoteDatabase,`profiles/${playerId}/answeredWouldYouRather/${questionId}`));
      if (profileAnswer.exists()) return { accepted:false, votes:await getWouldYouRatherVotes(questionId) };
    } catch {}
  }
  playerAnswers[questionId]=choice; answers[playerId]=playerAnswers; saveLocal(WOULD_YOU_RATHER_ANSWERS_KEY,answers);
  if (remoteDatabase) {
    try {
      const voteRef=firebaseDatabaseApi.ref(remoteDatabase,`wouldYouRatherVotes/${questionId}/${choice}`);
      await firebaseDatabaseApi.runTransaction(voteRef,current=>(current||0)+1);
      if (persistProfile) await firebaseDatabaseApi.set(firebaseDatabaseApi.ref(remoteDatabase,`profiles/${playerId}/answeredWouldYouRather/${questionId}`),choice);
      return { accepted:true, votes:await getWouldYouRatherVotes(questionId) };
    } catch {}
  }
  const votes=readLocal(WOULD_YOU_RATHER_VOTES_KEY), item=votes[questionId] || {a:0,b:0};
  item[choice]=(item[choice]||0)+1;votes[questionId]=item;saveLocal(WOULD_YOU_RATHER_VOTES_KEY,votes);
  return { accepted:true, votes:await getWouldYouRatherVotes(questionId) };
}

export async function syncRoomState(room) {
  if (!room?.roomId) return { ok:false, error:"Brak kodu pokoju." };
  try {
    const payload = {
      roomId:room.roomId, gameMode:room.gameMode, name:room.name || "Pokój dla ekipy", isPrivate:Boolean(room.isPrivate), passwordHash:room.passwordHash || "", hostUid:room.hostUid || null,
      players:Object.fromEntries((room.players || []).map(uid=>[uid,{ nick:room.playerProfiles?.[uid]?.nick || "Gracz", avatarImage:room.playerProfiles?.[uid]?.avatarImage || "", money:Number(room.playerProfiles?.[uid]?.money)||0, sessionMoney:Number(room.playerProfiles?.[uid]?.sessionMoney)||0, xp:Number(room.playerProfiles?.[uid]?.xp)||0, sessionXp:Number(room.playerProfiles?.[uid]?.sessionXp)||0, joinedAt:room.joinedAt?.[uid] || room.createdAt, connected:true, selectedNickEffect:room.playerProfiles?.[uid]?.selectedNickEffect || "defaultNick", selectedAvatarFrame:room.playerProfiles?.[uid]?.selectedAvatarFrame || "defaultFrame", selectedAura:room.playerProfiles?.[uid]?.selectedAura || "noAura" }])),
      status:room.status, settings:room.settings || {}, pendingRewards:room.pendingRewards || {}, pendingXp:room.pendingXp || {}, createdAt:room.createdAt, updatedAt:room.updatedAt,
      gameState:room.game || null, chat:room.game?.chat || [],
    };
    let saved=payload;
    if(remoteDatabase){
      const result=await firebaseDatabaseApi.runTransaction(firebaseDatabaseApi.ref(remoteDatabase,`rooms/${room.roomId}`),current=>{
        if(current&&Number(current.updatedAt||0)>=Number(payload.updatedAt||0))return current;
        return payload;
      });
      saved=result.snapshot.val()||payload;
    }
    const local=readLocal(LOCAL_ROOMS_KEY);local[room.roomId]=saved;saveLocal(LOCAL_ROOMS_KEY,local);
    return { ok:true, room:normalizeRemoteRoom(saved) };
  } catch(error) {
    return { ok:false, error:error?.code || error?.message || "Nieznany błąd Firebase." };
  }
}

const normalizeRemoteRoom=room=>({ ...room, game:room.gameState || null, players:Object.keys(room.players || {}), playerProfiles:room.players || {}, joinedAt:Object.fromEntries(Object.entries(room.players || {}).map(([uid,item])=>[uid,item.joinedAt])) });

export async function mutateRemoteRoomGame(roomId, mutate) {
  if (!remoteDatabase || !roomId) return null;
  let mutationError="";
  try {
    const roomRef=firebaseDatabaseApi.ref(remoteDatabase,`rooms/${roomId}`);
    const result=await firebaseDatabaseApi.runTransaction(roomRef,current=>{
      if(!current?.gameState){mutationError="Stan gry nie jest dostępny.";return;}
      const game=JSON.parse(JSON.stringify(current.gameState));
      mutationError=mutate(game,current)||"";
      if(mutationError)return;
      return {...current,gameState:game,chat:game.chat||[],updatedAt:Math.max(Date.now(),Number(current.updatedAt||0)+1)};
    });
    if(!result.committed)return {ok:false,rejected:true,error:mutationError||"Akcja nie jest już dostępna."};
    const value=result.snapshot.val();
    return value?{ok:true,room:normalizeRemoteRoom(value)}:{ok:false,error:"Pokój już nie istnieje."};
  } catch(error) {
    return {ok:false,error:error?.code||error?.message||"Nie udało się zsynchronizować akcji."};
  }
}

export async function acknowledgeRemoteImpostorRole(roomId, playerId) {
  if (!remoteDatabase || !roomId || !playerId) return null;
  try {
    const roomRef=firebaseDatabaseApi.ref(remoteDatabase,`rooms/${roomId}`);
    const result=await firebaseDatabaseApi.runTransaction(roomRef,current=>{
      const game=current?.gameState;
      if(!game||current.gameMode!=="impostor"||game.phase!=="roleReveal"||!current.players?.[playerId])return current;
      const acknowledged={...(game.acknowledged||{}),[playerId]:true};
      const players=Object.keys(current.players||{});
      const allReady=players.length>0&&players.every(uid=>acknowledged[uid]);
      const gameState={...game,acknowledged};
      if(allReady){gameState.phase="clues";gameState.phaseEndsAt=Date.now()+(Number(current.settings?.clueTime)||20)*1000;}
      return {...current,gameState,updatedAt:Math.max(Date.now(),Number(current.updatedAt||0)+1)};
    });
    const value=result.snapshot.val();
    return value?{ok:true,game:value.gameState||null,updatedAt:value.updatedAt}:null;
  } catch(error) {
    return {ok:false,error:error?.code||error?.message||"Nie udało się potwierdzić roli."};
  }
}

export async function removeRemoteRoom(roomId) {
  if (!roomId) return false;
  try { if(remoteDatabase)await firebaseDatabaseApi.remove(firebaseDatabaseApi.ref(remoteDatabase, `rooms/${roomId}`));const local=readLocal(LOCAL_ROOMS_KEY);delete local[roomId];saveLocal(LOCAL_ROOMS_KEY,local);return true; }
  catch { return false; }
}

export function subscribeRemoteRooms(callback, onError = () => {}) {
  const normalize=rooms=>Object.values(rooms||{}).filter(room=>room?.roomId).map(normalizeRemoteRoom);
  if(remoteDatabase&&remoteAuth?.currentUser){
    const stopRemote=firebaseDatabaseApi.onValue(firebaseDatabaseApi.ref(remoteDatabase,"rooms"),snapshot=>{const rooms=snapshot.val()||{};saveLocal(LOCAL_ROOMS_KEY,rooms);callback(normalize(rooms),"remote");},onError);
    return()=>stopRemote();
  }
  if(remoteDatabase){callback([],"waiting");return()=>{};}
  callback(normalize(readLocal(LOCAL_ROOMS_KEY)),"local");
  const storage=event=>{if(event.key===LOCAL_ROOMS_KEY)callback(normalize(readLocal(LOCAL_ROOMS_KEY)),"local");};
  window.addEventListener("storage",storage);
  return()=>window.removeEventListener("storage",storage);
}
