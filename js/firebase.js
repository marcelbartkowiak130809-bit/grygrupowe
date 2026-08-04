const ACCOUNTS_KEY = "udowodnij_prototype_accounts_v1";
const SESSION_KEY = "udowodnij_session_v1";
const LOCAL_ROOMS_KEY = "udowodnij_local_rooms_v1";
const MODERATION_KEY = "udowodnij_moderation_v1";
const WOULD_YOU_RATHER_VOTES_KEY = "udowodnij_would_you_rather_votes_v1";
const WOULD_YOU_RATHER_ANSWERS_KEY = "udowodnij_would_you_rather_answers_v1";
const LOCAL_PRESENCE_KEY = "udowodnij_local_presence_v1";
let remoteAuth;
let firebaseAuthApi;
let remoteDatabase;
let firebaseDatabaseApi;
let serverTimeOffset = 0;
let localPresenceTimer;
let remotePresenceStop = () => {};
const PRESENCE_TTL_MS = 90000;

const clientPresenceId = () => {
  let id = sessionStorage.getItem("udowodnij_presence_client");
  if (!id) { id = `tab_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; sessionStorage.setItem("udowodnij_presence_client", id); }
  return id;
};

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

function localPresenceUserKey(userKey) {
  return String(userKey || remoteAuth?.currentUser?.uid || clientPresenceId());
}

function localPresenceCount() {
  const now = Date.now(), data = readLocal(LOCAL_PRESENCE_KEY), users = new Set();
  Object.entries(data).forEach(([userKey, clients]) => {
    const activeClients = Object.fromEntries(Object.entries(clients || {}).filter(([, item]) => now - Number(item?.seenAt || 0) < PRESENCE_TTL_MS));
    if (Object.keys(activeClients).length) { data[userKey] = activeClients; users.add(userKey); }
    else delete data[userKey];
  });
  saveLocal(LOCAL_PRESENCE_KEY, data);
  return users.size;
}

export function startPresence(userKey, meta = {}) {
  const clientId = clientPresenceId(), key = localPresenceUserKey(userKey);
  remotePresenceStop();
  clearInterval(localPresenceTimer);
  if (remoteDatabase) {
    const clientRef = firebaseDatabaseApi.ref(remoteDatabase, `presence/${key}/clients/${clientId}`);
    firebaseDatabaseApi.set(clientRef, { nick:meta.nick || "", seenAt:firebaseDatabaseApi.serverTimestamp?.() || Date.now() }).catch(()=>{});
    firebaseDatabaseApi.onDisconnect?.(clientRef)?.remove?.();
    localPresenceTimer = setInterval(() => firebaseDatabaseApi.update(clientRef, { seenAt:firebaseDatabaseApi.serverTimestamp?.() || Date.now() }).catch(()=>{}), 30000);
    remotePresenceStop = () => { clearInterval(localPresenceTimer); firebaseDatabaseApi.remove(clientRef).catch(()=>{}); };
    window.addEventListener("beforeunload", remotePresenceStop, { once:true });
    return remotePresenceStop;
  }
  const touch = () => {
    const data = readLocal(LOCAL_PRESENCE_KEY);
    data[key] = { ...(data[key] || {}), [clientId]:{ nick:meta.nick || "", seenAt:Date.now() } };
    saveLocal(LOCAL_PRESENCE_KEY, data);
    window.dispatchEvent(new CustomEvent("udowodnij-presence-change"));
  };
  touch();
  localPresenceTimer = setInterval(touch, 30000);
  remotePresenceStop = () => { clearInterval(localPresenceTimer); const data=readLocal(LOCAL_PRESENCE_KEY); if(data[key]){delete data[key][clientId]; if(!Object.keys(data[key]).length)delete data[key]; saveLocal(LOCAL_PRESENCE_KEY,data);} };
  window.addEventListener("beforeunload", remotePresenceStop, { once:true });
  return remotePresenceStop;
}

export function subscribeOnlineCount(callback) {
  let lastCount = -1, lastLargeUpdate = 0;
  const emit = count => {
    const now = Date.now();
    if (count === lastCount) return;
    if (count > 100 && lastCount > 100 && now - lastLargeUpdate < 60000) return;
    lastCount = count; if (count > 100) lastLargeUpdate = now; callback(count);
  };
  if (remoteDatabase) {
    const presenceRef = firebaseDatabaseApi.ref(remoteDatabase, "presence");
    const handleSnapshot = snapshot => {
      const now = serverNow(), users = snapshot.val() || {};
      let count = 0;
      Object.entries(users).forEach(([userKey, user]) => {
        const clients = user?.clients || {};
        const active = Object.entries(clients).filter(([, item]) => now - Number(item?.seenAt || 0) < PRESENCE_TTL_MS);
        if (active.length) count += 1;
        Object.entries(clients).forEach(([clientId, item]) => {
          if (now - Number(item?.seenAt || 0) >= PRESENCE_TTL_MS * 2) {
            firebaseDatabaseApi.remove(firebaseDatabaseApi.ref(remoteDatabase, `presence/${userKey}/clients/${clientId}`)).catch(()=>{});
          }
        });
      });
      emit(count);
    };
    const stopRemote = firebaseDatabaseApi.onValue(presenceRef, handleSnapshot, () => emit(localPresenceCount()));
    const timer = setInterval(() => firebaseDatabaseApi.get(presenceRef).then(handleSnapshot).catch(() => emit(localPresenceCount())), 60000);
    return () => { clearInterval(timer); stopRemote(); };
  }
  emit(localPresenceCount());
  const storage = event => { if (event.key === LOCAL_PRESENCE_KEY) emit(localPresenceCount()); };
  const localChange = () => emit(localPresenceCount());
  const timer = setInterval(() => emit(localPresenceCount()), 60000);
  window.addEventListener("storage", storage);
  window.addEventListener("udowodnij-presence-change", localChange);
  return () => { clearInterval(timer); window.removeEventListener("storage", storage); window.removeEventListener("udowodnij-presence-change", localChange); };
}

export function hasVoiceSignaling() { return Boolean(remoteDatabase && remoteAuth?.currentUser); }

export async function setVoiceSignal(roomId, fromUid, toUid, key, value) {
  if (!remoteDatabase || !roomId || !fromUid || !toUid || !key) return false;
  try {
    await firebaseDatabaseApi.set(firebaseDatabaseApi.ref(remoteDatabase, `voiceSignaling/${roomId}/${fromUid}/${toUid}/${key}`), value);
    return true;
  } catch { return false; }
}

export async function pushVoiceIceCandidate(roomId, fromUid, toUid, candidate) {
  if (!remoteDatabase || !roomId || !fromUid || !toUid || !candidate) return false;
  try {
    await firebaseDatabaseApi.push(firebaseDatabaseApi.ref(remoteDatabase, `voiceSignaling/${roomId}/${fromUid}/${toUid}/candidates`), candidate);
    return true;
  } catch { return false; }
}

export function subscribeVoiceSignals(roomId, uid, callback) {
  if (!remoteDatabase || !roomId || !uid) return () => {};
  return firebaseDatabaseApi.onValue(firebaseDatabaseApi.ref(remoteDatabase, `voiceSignaling/${roomId}`), snapshot => callback(snapshot.val() || {}), () => callback({}));
}

export async function clearVoiceSignals(roomId, uid = "") {
  if (!remoteDatabase || !roomId) return false;
  try {
    if (!uid) { await firebaseDatabaseApi.remove(firebaseDatabaseApi.ref(remoteDatabase, `voiceSignaling/${roomId}`)); return true; }
    const roomRef = firebaseDatabaseApi.ref(remoteDatabase, `voiceSignaling/${roomId}`);
    const snapshot = await firebaseDatabaseApi.get(roomRef), data = snapshot.val() || {};
    const updates = {};
    Object.keys(data[uid] || {}).forEach(to => { updates[`${uid}/${to}`] = null; });
    Object.keys(data).forEach(from => { if (data[from]?.[uid]) updates[`${from}/${uid}`] = null; });
    if (!Object.keys(updates).length) return true;
    await firebaseDatabaseApi.update(roomRef, updates);
    return true;
  } catch { return false; }
}
export async function loadPresenceUsers() {
  if (remoteDatabase) {
    try { const data=(await firebaseDatabaseApi.get(firebaseDatabaseApi.ref(remoteDatabase,"presence"))).val() || {}; const now=serverNow(); return Object.fromEntries(Object.entries(data).filter(([,item])=>Object.values(item?.clients||{}).some(client=>now-Number(client?.seenAt||0)<PRESENCE_TTL_MS)).map(([uid])=>[uid,true])); } catch { return {}; }
  }
  const now=Date.now(), data=readLocal(LOCAL_PRESENCE_KEY); return Object.fromEntries(Object.entries(data).filter(([,item])=>Object.values(item||{}).some(client=>now-Number(client?.seenAt||0)<PRESENCE_TTL_MS)).map(([uid])=>[uid,true]));
}

function readLocal(key) {
  try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; }
}
function saveLocal(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function adultStatusForProfile(profile = {}) {
  if (!profile || profile.nickOnly || !profile.birthDate) return profile.adultStatus || "unknown";
  const birth = new Date(`${profile.birthDate}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return profile.adultStatus || "unknown";
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const month = today.getMonth() - birth.getMonth();
  if (month < 0 || month === 0 && today.getDate() < birth.getDate()) age -= 1;
  return age >= 18 ? "adult" : "minor";
}
const publicProfile = profile => ({ nick:profile.nick, avatarImage:profile.avatarImage || "", nickOnly:Boolean(profile.nickOnly), adultStatus:adultStatusForProfile(profile), xp:Number(profile.xp)||0, sessionXp:Number(profile.sessionXp)||0, selectedNickEffect:profile.selectedNickEffect, selectedAvatarFrame:profile.selectedAvatarFrame, selectedAura:profile.selectedAura, selectedCandySkin:profile.selectedCandySkin || "defaultCandy", selectedBombSkin:profile.selectedBombSkin || "defaultBomb", selectedClockSkin:profile.selectedClockSkin || "defaultClock", selectedIdleAnimation:profile.selectedIdleAnimation || "", selectedWinAnimation:profile.selectedWinAnimation || "", selectedLoseAnimation:profile.selectedLoseAnimation || "", updatedAt:Date.now() });
const savedProfile = profile => ({ nick:profile.nick, birthDate:profile.birthDate || "", inbox:profile.inbox || [], friends:Array.isArray(profile.friends) ? profile.friends : [], friendRequests:profile.friendRequests || { incoming:{}, outgoing:{} }, avatarImage:profile.avatarImage || "", money:profile.money || 0, xp:Number(profile.xp)||0, claimedLevelRewards:profile.claimedLevelRewards || {}, ownedCosmetics:{ defaultBomb:true, defaultClock:true, defaultMarker:true, defaultSequence:true, ...(profile.ownedCosmetics || {}) }, selectedNickEffect:profile.selectedNickEffect, selectedAvatarFrame:profile.selectedAvatarFrame, selectedAura:profile.selectedAura, selectedCandySkin:profile.selectedCandySkin || "defaultCandy", selectedBombSkin:profile.selectedBombSkin || "defaultBomb", selectedClockSkin:profile.selectedClockSkin || "defaultClock", selectedMarkerSkin:profile.selectedMarkerSkin || "defaultMarker", selectedSequenceSkin:profile.selectedSequenceSkin || "defaultSequence", answeredWouldYouRather:profile.answeredWouldYouRather || {}, stats:profile.stats || {}, createdAt:profile.createdAt || Date.now(), updatedAt:Date.now() });
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
export async function setRemoteBirthDateForNick(nick, birthDate) {
  const key = normalizeNickKey(nick);
  if (!remoteDatabase || !key || !birthDate) return false;
  try {
    const snapshot = await firebaseDatabaseApi.get(firebaseDatabaseApi.ref(remoteDatabase, "profiles"));
    const match = Object.entries(snapshot.val() || {}).find(([, item]) => normalizeNickKey(item?.nick) === key);
    if (!match) return false;
    await firebaseDatabaseApi.update(firebaseDatabaseApi.ref(remoteDatabase, `profiles/${match[0]}`), { birthDate, updatedAt:Date.now() });
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
export async function loadPublicProfiles() {
  if (!remoteDatabase) return {};
  try { return (await firebaseDatabaseApi.get(firebaseDatabaseApi.ref(remoteDatabase, "publicProfiles"))).val() || {}; } catch { return {}; }
}
export async function updateRemoteProfileFields(uid, patch = {}) {
  if (!remoteDatabase || !uid || !Object.keys(patch).length) return false;
  try { await firebaseDatabaseApi.update(firebaseDatabaseApi.ref(remoteDatabase, `profiles/${uid}`), { ...patch, updatedAt:Date.now() }); return true; } catch { return false; }
}
export async function loadFriendRequestBucket(uid) {
  if (!remoteDatabase || !uid) return {};
  try { return (await firebaseDatabaseApi.get(firebaseDatabaseApi.ref(remoteDatabase, `friendRequests/${uid}`))).val() || {}; } catch { return {}; }
}
export async function loadFriendRequest(targetUid, requestId) {
  if (!remoteDatabase || !targetUid || !requestId) return null;
  try { return (await firebaseDatabaseApi.get(firebaseDatabaseApi.ref(remoteDatabase, `friendRequests/${targetUid}/${requestId}`))).val() || null; } catch { return null; }
}
export async function setFriendRequest(targetUid, request) {
  if (!remoteDatabase || !targetUid || !request?.id) return false;
  try { await firebaseDatabaseApi.set(firebaseDatabaseApi.ref(remoteDatabase, `friendRequests/${targetUid}/${request.id}`), request); return true; } catch { return false; }
}
export async function updateFriendRequest(targetUid, requestId, patch = {}) {
  if (!remoteDatabase || !targetUid || !requestId) return false;
  try { await firebaseDatabaseApi.update(firebaseDatabaseApi.ref(remoteDatabase, `friendRequests/${targetUid}/${requestId}`), patch); return true; } catch { return false; }
}
export function subscribeFriendRequests(uid, onChange) {
  if (!remoteDatabase || !uid || typeof onChange !== "function") return () => {};
  const ref = firebaseDatabaseApi.ref(remoteDatabase, `friendRequests/${uid}`);
  return firebaseDatabaseApi.onValue(ref, snapshot => onChange(snapshot.val() || {}), () => onChange({}));
}

const pollVoterKey = voterId => hashRoomPassword(`poll:${voterId || "anonymous"}`);
const pollOptionIds = ["cosmetics", "new-mode", "questions"];
export async function getRemotePollVotes(pollId, voterId = "anonymous") {
  if (!remoteDatabase) return null;
  try {
    const [votesSnapshot, resultsSnapshot, voteSnapshot] = await Promise.all([
      firebaseDatabaseApi.get(firebaseDatabaseApi.ref(remoteDatabase, `pollVotes/${pollId}`)).catch(() => null),
      firebaseDatabaseApi.get(firebaseDatabaseApi.ref(remoteDatabase, `pollResults/${pollId}`)),
      firebaseDatabaseApi.get(firebaseDatabaseApi.ref(remoteDatabase, `pollVotes/${pollId}/${pollVoterKey(voterId)}`)).catch(() => null),
    ]);
    const votes = votesSnapshot?.val?.() || {}, savedTotals = resultsSnapshot.val() || {};
    const totals = {};
    Object.values(votes).forEach(optionId => {
      if (pollOptionIds.includes(optionId)) totals[optionId] = (totals[optionId] || 0) + 1;
    });
    pollOptionIds.forEach(optionId => totals[optionId] = Math.max(Number(totals[optionId] || 0), Number(savedTotals[optionId] || 0)));
    return { totals, vote:voteSnapshot?.val?.() || null, source:"firebase" };
  } catch {
    return null;
  }
}
export async function voteRemotePoll({ pollId, voterId, optionId }) {
  if (!remoteDatabase || !pollOptionIds.includes(optionId)) return false;
  try {
    const voteRef = firebaseDatabaseApi.ref(remoteDatabase, `pollVotes/${pollId}/${pollVoterKey(voterId)}`);
    const previous = await firebaseDatabaseApi.get(voteRef).catch(() => null);
    if (previous?.exists?.()) return false;
    await firebaseDatabaseApi.set(voteRef, optionId);
    await firebaseDatabaseApi.runTransaction(firebaseDatabaseApi.ref(remoteDatabase, `pollResults/${pollId}/${optionId}`), current => (Number(current) || 0) + 1);
    return true;
  } catch {
    return false;
  }
}

function moderationLocal() {
  return readLocal(MODERATION_KEY);
}
function saveModerationLocal(value) {
  saveLocal(MODERATION_KEY, value);
}
const moderationId = prefix => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
const normalizeNickKey = nick => String(nick || "").toLowerCase().trim();

export async function submitModerationReport(report) {
  const item = { ...report, id:report.id || moderationId("rep"), status:report.status || "open", createdAt:report.createdAt || Date.now() };
  const local = moderationLocal(); local.reports = { ...(local.reports || {}), [item.id]:item }; saveModerationLocal(local);
  if (remoteDatabase) {
    try { await firebaseDatabaseApi.set(firebaseDatabaseApi.ref(remoteDatabase, `moderation/reports/${item.id}`), item); } catch {}
  }
  return item;
}

export async function loadModerationReports() {
  const local = moderationLocal().reports || {};
  if (remoteDatabase) {
    try { return { ...local, ...((await firebaseDatabaseApi.get(firebaseDatabaseApi.ref(remoteDatabase, "moderation/reports"))).val() || {}) }; } catch {}
  }
  return local;
}

export async function saveModerationBan(ban) {
  const item = { ...ban, id:ban.id || moderationId("ban"), createdAt:ban.createdAt || Date.now() };
  const local = moderationLocal(); local.bans = { ...(local.bans || {}), [item.id]:item }; saveModerationLocal(local);
  if (remoteDatabase) {
    try { await firebaseDatabaseApi.set(firebaseDatabaseApi.ref(remoteDatabase, `moderation/bans/${item.id}`), item); } catch {}
  }
  return item;
}

export async function loadModerationBans() {
  const local = moderationLocal().bans || {};
  if (remoteDatabase) {
    try { return { ...local, ...((await firebaseDatabaseApi.get(firebaseDatabaseApi.ref(remoteDatabase, "moderation/bans"))).val() || {}) }; } catch {}
  }
  return local;
}

export async function sendInboxMessageToNick(nick, message) {
  const key = normalizeNickKey(nick), item = { ...message, id:message.id || moderationId("msg"), toNick:key, createdAt:message.createdAt || Date.now(), read:false };
  const local = moderationLocal(); local.mail = { ...(local.mail || {}) }; local.mail[key] = { ...(local.mail[key] || {}), [item.id]:item }; saveModerationLocal(local);
  if (remoteDatabase) {
    try { await firebaseDatabaseApi.set(firebaseDatabaseApi.ref(remoteDatabase, `mail/${key}/${item.id}`), item); } catch {}
  }
  return item;
}

export async function loadInboxForNick(nick) {
  const key = normalizeNickKey(nick), local = moderationLocal().mail?.[key] || {};
  if (remoteDatabase) {
    try { return { ...local, ...((await firebaseDatabaseApi.get(firebaseDatabaseApi.ref(remoteDatabase, `mail/${key}`))).val() || {}) }; } catch {}
  }
  return local;
}

export async function syncRoomState(room) {
  if (!room?.roomId) return { ok:false, error:"Brak kodu pokoju." };
  try {
    const payload = {
      roomId:room.roomId, gameMode:room.gameMode, name:room.name || "Pokój dla ekipy", isPrivate:Boolean(room.isPrivate), passwordHash:room.passwordHash || "", hostUid:room.hostUid || null,
      roomType:room.roomType === "betting" ? "betting" : "standard", entryFee:room.roomType === "betting" ? Math.max(0, Number(room.entryFee) || 0) : 0,
      players:Object.fromEntries((room.players || []).map(uid=>[uid,{ nick:room.playerProfiles?.[uid]?.nick || "Gracz", avatarImage:room.playerProfiles?.[uid]?.avatarImage || "", nickOnly:Boolean(room.playerProfiles?.[uid]?.nickOnly), adultStatus:room.playerProfiles?.[uid]?.adultStatus || "unknown", money:Number(room.playerProfiles?.[uid]?.money)||0, sessionMoney:Number(room.playerProfiles?.[uid]?.sessionMoney)||0, xp:Number(room.playerProfiles?.[uid]?.xp)||0, sessionXp:Number(room.playerProfiles?.[uid]?.sessionXp)||0, joinedAt:room.joinedAt?.[uid] || room.createdAt, connected:true, selectedNickEffect:room.playerProfiles?.[uid]?.selectedNickEffect || "defaultNick", selectedAvatarFrame:room.playerProfiles?.[uid]?.selectedAvatarFrame || "defaultFrame", selectedAura:room.playerProfiles?.[uid]?.selectedAura || "noAura", selectedCandySkin:room.playerProfiles?.[uid]?.selectedCandySkin || "defaultCandy", selectedBombSkin:room.playerProfiles?.[uid]?.selectedBombSkin || "defaultBomb", selectedClockSkin:room.playerProfiles?.[uid]?.selectedClockSkin || "defaultClock", selectedIdleAnimation:room.playerProfiles?.[uid]?.selectedIdleAnimation || "", selectedWinAnimation:room.playerProfiles?.[uid]?.selectedWinAnimation || "", selectedLoseAnimation:room.playerProfiles?.[uid]?.selectedLoseAnimation || "" }])),
      status:room.status, settings:room.settings || {}, pendingRewards:room.pendingRewards || {}, pendingXp:room.pendingXp || {}, pendingEntryFees:room.pendingEntryFees || {}, createdAt:room.createdAt, updatedAt:room.updatedAt,
      gameState:room.game || null, chat:room.game?.chat || [],
    };
    Object.entries(payload.players).forEach(([uid, player])=>{if(uid.startsWith("bot:")){player.isBot=true;player.botDifficulty=room.playerProfiles?.[uid]?.botDifficulty||"normal";}});
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
    return { ok:false, error:error?.code || error?.message || "Nieznany blad synchronizacji." };
  }
}

function normalizeFirebaseValue(value) {
  if (Array.isArray(value)) return value.map(normalizeFirebaseValue);
  if (!value || typeof value !== "object") return value;
  const keys = Object.keys(value);
  const numericKeys = keys.length && keys.every(key => /^\d+$/.test(key));
  if (numericKeys) {
    const max = Math.max(...keys.map(Number));
    if (max < 10000) return Array.from({ length:max + 1 }, (_, index) => normalizeFirebaseValue(value[index]));
  }
  return Object.fromEntries(keys.map(key => [key, normalizeFirebaseValue(value[key])]));
}

const normalizeRemoteRoom=room=>{
  const normalized=normalizeFirebaseValue(room || {});
  const players=normalized.players || {};
  Object.entries(players).forEach(([uid, player])=>{if(uid.startsWith("bot:")){player.isBot=true;player.botDifficulty=player.botDifficulty||"normal";}});
  return { ...normalized, game:normalizeFirebaseValue(normalized.gameState || null), players:Object.keys(players), playerProfiles:players, joinedAt:Object.fromEntries(Object.entries(players).map(([uid,item])=>[uid,item?.joinedAt])) };
};

export async function loadRemoteRoom(roomId) {
  const code = String(roomId || "").trim().toUpperCase();
  if (!code) return { ok:false, error:"Brak kodu pokoju." };
  try {
    if (remoteDatabase) {
      const snapshot = await firebaseDatabaseApi.get(firebaseDatabaseApi.ref(remoteDatabase, `rooms/${code}`));
      const value = snapshot.val();
      if (!value) return { ok:false, missing:true, error:"Pokoj nie istnieje." };
      const local = readLocal(LOCAL_ROOMS_KEY); local[code] = value; saveLocal(LOCAL_ROOMS_KEY, local);
      return { ok:true, room:normalizeRemoteRoom(value) };
    }
    const value = readLocal(LOCAL_ROOMS_KEY)[code];
    return value ? { ok:true, room:normalizeRemoteRoom(value) } : { ok:false, missing:true, error:"Pokoj nie istnieje." };
  } catch(error) {
    return { ok:false, error:error?.code || error?.message || "Nie mozna odczytac pokoju." };
  }
}

export async function mutateRemoteRoomGame(roomId, mutate) {
  if (!remoteDatabase || !roomId) return null;
  let mutationError="";
  try {
    const roomRef=firebaseDatabaseApi.ref(remoteDatabase,`rooms/${roomId}`);
    const result=await firebaseDatabaseApi.runTransaction(roomRef,current=>{
      if(!current?.gameState){mutationError="Stan gry nie jest dostępny.";return;}
      const game=normalizeFirebaseValue(JSON.parse(JSON.stringify(current.gameState)));
      mutationError=mutate(game,current)||"";
      if(mutationError)return;
      return {...current,gameState:game,chat:game.chat||[],updatedAt:Math.max(serverNow(),Number(current.updatedAt||0)+1)};
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
