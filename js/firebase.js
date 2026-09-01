import { drawPotionPackItems, potionPackById } from "./potionPacks.js?v=20260831-1";

const ACCOUNTS_KEY = "udowodnij_prototype_accounts_v1";
const SESSION_KEY = "udowodnij_session_v1";
const LOCAL_ROOMS_KEY = "udowodnij_local_rooms_v1";
const MODERATION_KEY = "udowodnij_moderation_v1";
const WOULD_YOU_RATHER_VOTES_KEY = "udowodnij_would_you_rather_votes_v1";
const WOULD_YOU_RATHER_ANSWERS_KEY = "udowodnij_would_you_rather_answers_v1";
const LOCAL_PRESENCE_KEY = "udowodnij_local_presence_v1";
const LOCAL_HONOR_KEY = "udowodnij_honor_votes_v1";
const HONOR_TYPE_IDS = new Set(["nicePlayer", "goodOpponent", "greatHost", "notVerySmart", "poorSport"]);
const LOCAL_SITE_STATS_KEY = "udowodnij_site_stats_v1";
const SITE_STAT_EVENT_TYPES = new Set(["gameFinished", "roomCreated", "userRegistered", "coinsEarned", "onlinePeak"]);
let remoteAuth;
let firebaseAuthApi;
let remoteDatabase;
let firebaseDatabaseApi;
let remoteFunctions;
let firebaseFunctionsApi;
let remoteFunctionsUnavailable = false;
let serverTimeOffset = 0;
let localPresenceTimer;
let remotePresenceStop = () => {};
const PRESENCE_TTL_MS = 45000;

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
  const [{ initializeApp }, authApi, databaseApi, functionsApi] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-functions.js"),
  ]);
  firebaseAuthApi = authApi;
  firebaseDatabaseApi = databaseApi;
  firebaseFunctionsApi = functionsApi;
  const app = initializeApp(config);
  remoteAuth = authApi.getAuth(app);
  if (remoteAuth.authStateReady) await remoteAuth.authStateReady();
  if (config.databaseURL) {
    remoteDatabase = databaseApi.getDatabase(app);
    databaseApi.onValue(databaseApi.ref(remoteDatabase, ".info/serverTimeOffset"), snapshot => {
      serverTimeOffset = Number(snapshot.val()) || 0;
    });
  }
  remoteFunctions = functionsApi.getFunctions(app);
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

let lastAccountsSnapshot = null;
export function saveAccounts(accounts) {
  const snapshot = JSON.stringify(accounts);
  if (snapshot === lastAccountsSnapshot) return false;
  localStorage.setItem(ACCOUNTS_KEY, snapshot);
  lastAccountsSnapshot = snapshot;
  return true;
}
export function loadSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "{}"); } catch { return {}; }
}
export function saveSession(session) { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); }
export function clearSession() { localStorage.removeItem(SESSION_KEY); }
const canUseRemote = () => Boolean(remoteDatabase && remoteAuth?.currentUser);
export function hasOnlineBackend() { return canUseRemote(); }

export function loadSiteStats() {
  const data = readLocal(LOCAL_SITE_STATS_KEY);
  const accounts = readLocal(ACCOUNTS_KEY);
  const localRegistered = Object.values(accounts).filter(account => account && !account.nickOnly).length;
  return { gamesPlayed:0, roomsCreated:0, registeredUsers:localRegistered, coinsEarned:0, playedMinutes:0, peakOnline:0, modeCounts:{}, ...data, registeredUsers:Math.max(localRegistered, Number(data.registeredUsers) || 0) };
}

function aggregateSiteStatEvents(events = {}) {
  const stats = { gamesPlayed:0, roomsCreated:0, registeredUsers:0, coinsEarned:0, playedMinutes:0, peakOnline:0, modeCounts:{} };
  Object.values(events || {}).forEach(userEvents => Object.values(userEvents || {}).forEach(event => {
    if (!SITE_STAT_EVENT_TYPES.has(event?.type)) return;
    if (event.type === "gameFinished") {
      stats.gamesPlayed += 1;
      stats.playedMinutes += Math.max(0, Number(event.minutes) || 0);
      const modeId = String(event.modeId || "unknown").slice(0, 80);
      stats.modeCounts[modeId] = (Number(stats.modeCounts[modeId]) || 0) + 1;
    }
    if (event.type === "roomCreated") stats.roomsCreated += 1;
    if (event.type === "userRegistered") stats.registeredUsers += 1;
    if (event.type === "coinsEarned") stats.coinsEarned += Math.max(0, Number(event.amount) || 0);
    if (event.type === "onlinePeak") stats.peakOnline = Math.max(stats.peakOnline, Number(event.value) || 0);
  }));
  return stats;
}

function mergeSiteStats(globalStats = {}, eventStats = {}) {
  const counters = ["gamesPlayed", "roomsCreated", "registeredUsers", "coinsEarned", "playedMinutes", "peakOnline"];
  const stats = { ...globalStats, ...eventStats };
  counters.forEach(key => {
    stats[key] = Math.max(Number(globalStats[key]) || 0, Number(eventStats[key]) || 0);
  });
  stats.modeCounts = { ...(globalStats.modeCounts || {}), ...(eventStats.modeCounts || {}) };
  Object.keys(globalStats.modeCounts || {}).forEach(modeId => {
    stats.modeCounts[modeId] = Math.max(Number(globalStats.modeCounts[modeId]) || 0, Number(eventStats.modeCounts?.[modeId]) || 0);
  });
  Object.keys(eventStats.modeCounts || {}).forEach(modeId => {
    stats.modeCounts[modeId] = Math.max(Number(globalStats.modeCounts?.[modeId]) || 0, Number(eventStats.modeCounts[modeId]) || 0);
  });
  return stats;
}

export function subscribeSiteStats(callback) {
  if (canUseRemote()) {
    const eventsRef = firebaseDatabaseApi.ref(remoteDatabase, "siteStatEvents");
    const globalRef = firebaseDatabaseApi.ref(remoteDatabase, "siteStats/global");
    let eventStats = {};
    let globalStats = {};
    let registeredUsers = 0;
    let profilesLoadedAt = 0;
    let profilesRequest = null;
    let emitSequence = 0;
    const refreshRegisteredUsers = async () => {
      if (profilesLoadedAt && Date.now() - profilesLoadedAt < 60000) return;
      if (!profilesRequest) profilesRequest = firebaseDatabaseApi.get(firebaseDatabaseApi.ref(remoteDatabase, "publicProfiles"))
        .then(snapshot => { registeredUsers = Object.keys(snapshot.val() || {}).length; profilesLoadedAt = Date.now(); })
        .catch(() => { profilesLoadedAt = Date.now(); })
        .finally(() => { profilesRequest = null; });
      await profilesRequest;
    };
    const emit = async () => {
      const sequence = ++emitSequence;
      const stats = mergeSiteStats(globalStats, eventStats);
      await refreshRegisteredUsers();
      if (sequence !== emitSequence) return;
      stats.registeredUsers = Math.max(Number(stats.registeredUsers) || 0, registeredUsers);
      callback(stats);
    };
    const stopEvents = firebaseDatabaseApi.onValue(eventsRef, snapshot => { const events = snapshot.val() || {}; eventStats = Object.keys(events).length ? aggregateSiteStatEvents(events) : {}; emit(); }, () => emit());
    const stopGlobal = firebaseDatabaseApi.onValue(globalRef, snapshot => { globalStats = snapshot.val() || {}; emit(); }, () => emit());
    return () => { stopEvents(); stopGlobal(); };
  }
  const emit = () => callback(loadSiteStats());
  window.addEventListener("storage", emit);
  return () => window.removeEventListener("storage", emit);
}

async function recordSiteEventInDatabase(event) {
  if (!canUseRemote() || !SITE_STAT_EVENT_TYPES.has(event.type)) return false;
  const uid = remoteAuth.currentUser.uid;
  const eventId = String(event.eventId).replace(/[.#$\[\]/]/g, "_").slice(0, 180);
  if (!eventId) return false;
  const claimToken = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const payload = { type:event.type, eventId, claimToken, createdAt:Math.floor(serverNow()) };
  if (event.modeId) payload.modeId = String(event.modeId).slice(0, 80);
  if (event.minutes != null) payload.minutes = Math.max(0, Math.min(1440, Number(event.minutes) || 0));
  if (event.amount != null) payload.amount = Math.max(0, Math.min(100000000, Number(event.amount) || 0));
  if (event.value != null) payload.value = Math.max(0, Math.min(1000000, Number(event.value) || 0));
  const eventRef = firebaseDatabaseApi.ref(remoteDatabase, `siteStatEvents/${uid}/${eventId}`);
  const result = await firebaseDatabaseApi.runTransaction(eventRef, current => current || payload);
  return Boolean(result?.committed && result.snapshot?.val()?.claimToken === claimToken || result?.snapshot?.val()?.eventId === eventId);
}

export async function recordSiteEvent(event = {}) {
  if (!event.type || !event.eventId) return false;
  if (!remoteFunctionsUnavailable && remoteFunctions && firebaseFunctionsApi?.httpsCallable) {
    try { await firebaseFunctionsApi.httpsCallable(remoteFunctions, "recordSiteEvent")({ ...event }); return true; } catch (error) {
      const code = error?.code || "";
      if (["functions/internal", "functions/not-found", "functions/unavailable"].includes(code)) remoteFunctionsUnavailable = true;
      console.warn("Nie udało się zapisać statystyki online; używam lokalnego bufora.", code || error?.message || error);
    }
  }
  try {
    if (await recordSiteEventInDatabase(event)) return true;
  } catch (error) {
    console.warn("Nie udało się zapisać zdarzenia w bazie statystyk.", error?.message || error);
  }
  const stats = loadSiteStats(), events = readLocal(`${LOCAL_SITE_STATS_KEY}_events`), key = String(event.eventId);
  if (events[key]) return true;
  events[key] = Date.now();
  if (event.type === "gameFinished") { stats.gamesPlayed += 1; stats.playedMinutes += Math.max(0, Number(event.minutes) || 0); stats.modeCounts[event.modeId] = (Number(stats.modeCounts[event.modeId]) || 0) + 1; }
  if (event.type === "roomCreated") stats.roomsCreated += 1;
  if (event.type === "userRegistered") stats.registeredUsers += 1;
  if (event.type === "coinsEarned") stats.coinsEarned += Math.max(0, Number(event.amount) || 0);
  if (event.type === "onlinePeak") stats.peakOnline = Math.max(Number(stats.peakOnline) || 0, Number(event.value) || 0);
  saveLocal(LOCAL_SITE_STATS_KEY, stats); saveLocal(`${LOCAL_SITE_STATS_KEY}_events`, events); window.dispatchEvent(new Event("storage"));
  return true;
}

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
  if (canUseRemote()) {
    const clientRef = firebaseDatabaseApi.ref(remoteDatabase, `presence/${key}/clients/${clientId}`);
    firebaseDatabaseApi.set(clientRef, { nick:meta.nick || "", seenAt:firebaseDatabaseApi.serverTimestamp?.() || Date.now() }).catch(()=>{});
    firebaseDatabaseApi.onDisconnect?.(clientRef)?.remove?.();
  localPresenceTimer = setInterval(() => firebaseDatabaseApi.update(clientRef, { seenAt:firebaseDatabaseApi.serverTimestamp?.() || Date.now() }).catch(()=>{}), 15000);
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
  localPresenceTimer = setInterval(touch, 15000);
  remotePresenceStop = () => { clearInterval(localPresenceTimer); const data=readLocal(LOCAL_PRESENCE_KEY); if(data[key]){delete data[key][clientId]; if(!Object.keys(data[key]).length)delete data[key]; saveLocal(LOCAL_PRESENCE_KEY,data);} };
  window.addEventListener("beforeunload", remotePresenceStop, { once:true });
  return remotePresenceStop;
}

export function startRoomPresence(roomId, userId) {
  if (!canUseRemote() || !roomId || !userId) return () => {};
  const clientId = clientPresenceId();
  const presenceRef = firebaseDatabaseApi.ref(remoteDatabase, `rooms/${roomId}/presence/${userId}/${clientId}`);
  const touch = () => firebaseDatabaseApi.set(presenceRef, { seenAt:firebaseDatabaseApi.serverTimestamp?.() || Date.now(), online:true }).catch(() => {});
  let stopped = false, timer = null;
  const stop = () => { stopped = true; if (timer) clearInterval(timer); firebaseDatabaseApi.remove(presenceRef).catch(() => {}); };
  // Rejestruj obecność od razu. Sprawdzanie /players przed pierwszym heartbeatem
  // powodowało wyścig przy dołączaniu: drugi klient był już na liście graczy,
  // ale nie zdążył jeszcze pojawić się w obecności i pokój zamykał się błędnie.
  // Przy zamknięciu karty zostaw znacznik offline zamiast usuwać wpis. Dzięki
  // temu inne klienty mogą odróżnić nieaktywny pokój od świeżo utworzonego
  // lobby, a po krótkim odświeżeniu nadal działa bezpieczny okres tolerancji.
  Promise.resolve(firebaseDatabaseApi.onDisconnect?.(presenceRef)?.set?.({ seenAt:firebaseDatabaseApi.serverTimestamp?.() || Date.now(), online:false })).catch(() => {});
  touch();
  timer = setInterval(() => { if (!stopped) touch(); }, 10000);
  return stop;
}

export function subscribeOnlineCount(callback) {
  let lastCount = -1, lastLargeUpdate = 0;
  const emit = count => {
    const now = Date.now();
    if (count === lastCount) return;
    if (count > 100 && lastCount > 100 && now - lastLargeUpdate < 60000) return;
    lastCount = count; if (count > 100) lastLargeUpdate = now; callback(count);
  };
  if (canUseRemote()) {
    const presenceRef = firebaseDatabaseApi.ref(remoteDatabase, "presence");
    const handleSnapshot = snapshot => {
      const now = serverNow(), users = snapshot.val() || {};
      let count = 0;
      Object.entries(users).forEach(([userKey, user]) => {
        const clients = user?.clients || {};
        const active = Object.entries(clients).filter(([, item]) => now - Number(item?.seenAt || 0) < PRESENCE_TTL_MS);
        if (active.length) count += 1;
        // RTDB pozwala użytkownikowi usuwać wyłącznie własny wpis presence.
        // Nie próbuj sprzątać wpisów innych kont, bo generuje to permission_denied.
        if (userKey === remoteAuth?.currentUser?.uid) {
          Object.entries(clients).forEach(([clientId, item]) => {
            if (now - Number(item?.seenAt || 0) >= PRESENCE_TTL_MS * 2) {
              firebaseDatabaseApi.remove(firebaseDatabaseApi.ref(remoteDatabase, `presence/${userKey}/clients/${clientId}`)).catch(()=>{});
            }
          });
        }
      });
      emit(count);
    };
    const stopRemote = firebaseDatabaseApi.onValue(presenceRef, handleSnapshot, () => emit(localPresenceCount()));
    const timer = setInterval(() => firebaseDatabaseApi.get(presenceRef).then(handleSnapshot).catch(() => emit(localPresenceCount())), 15000);
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
  if (!canUseRemote() || !roomId || !fromUid || !toUid || !key) return false;
  try {
    await firebaseDatabaseApi.set(firebaseDatabaseApi.ref(remoteDatabase, `voiceSignaling/${roomId}/${fromUid}/${toUid}/${key}`), value);
    return true;
  } catch { return false; }
}

export async function pushVoiceIceCandidate(roomId, fromUid, toUid, candidate) {
  if (!canUseRemote() || !roomId || !fromUid || !toUid || !candidate) return false;
  try {
    await firebaseDatabaseApi.push(firebaseDatabaseApi.ref(remoteDatabase, `voiceSignaling/${roomId}/${fromUid}/${toUid}/candidates`), candidate);
    return true;
  } catch { return false; }
}

export function subscribeVoiceSignals(roomId, uid, callback) {
  if (!canUseRemote() || !roomId || !uid) return () => {};
  return firebaseDatabaseApi.onValue(firebaseDatabaseApi.ref(remoteDatabase, `voiceSignaling/${roomId}`), snapshot => callback(snapshot.val() || {}), () => callback({}));
}

export async function clearVoiceSignals(roomId, uid = "") {
  if (!canUseRemote() || !roomId) return false;
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
  if (canUseRemote()) {
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
const privacyDefaults = { historyPublic:true, statsPublic:true, friendsPublic:true };
const honorDefaults = { nicePlayer:0, goodOpponent:0, greatHost:0, notVerySmart:0, poorSport:0 };
const profilePrivacy = profile => ({ ...privacyDefaults, ...(profile?.privacy || {}) });
const publicProfile = profile => {
  const privacy = profilePrivacy(profile), result = { nick:profile.nick, avatarImage:profile.avatarImage || "", nickOnly:Boolean(profile.nickOnly), adultStatus:adultStatusForProfile(profile), xp:Number(profile.xp)||0, sessionXp:Number(profile.sessionXp)||0, honorCounts:{...honorDefaults,...(profile.honorCounts||{})}, selectedNickEffect:profile.selectedNickEffect || "defaultNick", selectedAvatarFrame:profile.selectedAvatarFrame || "defaultFrame", selectedAura:profile.selectedAura || "noAura", selectedCandySkin:profile.selectedCandySkin || "defaultCandy", selectedBombSkin:profile.selectedBombSkin || "defaultBomb", selectedClockSkin:profile.selectedClockSkin || "defaultClock", selectedMarkerSkin:profile.selectedMarkerSkin || "defaultMarker", selectedSequenceSkin:profile.selectedSequenceSkin || "defaultSequence", selectedBoardLudoSkin:profile.selectedBoardLudoSkin || "defaultLudoBoard", selectedBoardMemorySkin:profile.selectedBoardMemorySkin || "defaultMemoryBoard", selectedIdleAnimation:profile.selectedIdleAnimation || "", selectedWinAnimation:profile.selectedWinAnimation || "", selectedLoseAnimation:profile.selectedLoseAnimation || "", privacy, updatedAt:Date.now() };
  if (privacy.historyPublic) result.gameHistory = Array.isArray(profile.gameHistory) ? profile.gameHistory.slice(-50) : [];
  if (privacy.statsPublic) { result.gameStats = profile.gameStats || {}; result.stats = profile.stats || {}; }
  if (privacy.friendsPublic) result.friends = Array.isArray(profile.friends) ? profile.friends : [];
  return result;
};
const sanitizePublicProfile = profile => {
  const privacy = profilePrivacy(profile), result = { nick:profile.nick || "Gracz", avatarImage:profile.avatarImage || "", nickOnly:Boolean(profile.nickOnly), adultStatus:profile.adultStatus || "unknown", xp:Number(profile.xp)||0, sessionXp:Number(profile.sessionXp)||0, honorCounts:{...honorDefaults,...(profile.honorCounts||{})}, selectedNickEffect:profile.selectedNickEffect || "defaultNick", selectedAvatarFrame:profile.selectedAvatarFrame || "defaultFrame", selectedAura:profile.selectedAura || "noAura", selectedCandySkin:profile.selectedCandySkin || "defaultCandy", selectedBombSkin:profile.selectedBombSkin || "defaultBomb", selectedClockSkin:profile.selectedClockSkin || "defaultClock", selectedMarkerSkin:profile.selectedMarkerSkin || "defaultMarker", selectedSequenceSkin:profile.selectedSequenceSkin || "defaultSequence", selectedBoardLudoSkin:profile.selectedBoardLudoSkin || "defaultLudoBoard", selectedBoardMemorySkin:profile.selectedBoardMemorySkin || "defaultMemoryBoard", selectedIdleAnimation:profile.selectedIdleAnimation || "", selectedWinAnimation:profile.selectedWinAnimation || "", selectedLoseAnimation:profile.selectedLoseAnimation || "", privacy, updatedAt:Number(profile.updatedAt)||0 };
  if (privacy.historyPublic) result.gameHistory = Array.isArray(profile.gameHistory) ? profile.gameHistory.slice(-50) : [];
  if (privacy.statsPublic) { result.gameStats = profile.gameStats || {}; result.stats = profile.stats || {}; }
  if (privacy.friendsPublic) result.friends = Array.isArray(profile.friends) ? profile.friends : [];
  return result;
};
const savedProfile = profile => ({ nick:profile.nick, birthDate:profile.birthDate || "", inbox:profile.inbox || [], friends:Array.isArray(profile.friends) ? profile.friends : [], friendRequests:profile.friendRequests || { incoming:{}, outgoing:{} }, avatarImage:profile.avatarImage || "", money:profile.money || 0, xp:Number(profile.xp)||0, sessionMoney:Number(profile.sessionMoney)||0, sessionXp:Number(profile.sessionXp)||0, luckySpin:profile.luckySpin || null, honorCounts:{...honorDefaults,...(profile.honorCounts||{})}, claimedLevelRewards:profile.claimedLevelRewards || {}, ownedCosmetics:{ defaultNick:true, defaultFrame:true, noAura:true, defaultCandy:true, defaultBomb:true, defaultClock:true, defaultMarker:true, defaultSequence:true, ...(profile.ownedCosmetics || {}) }, gamePasses:profile.gamePasses || {}, selectedNickEffect:profile.selectedNickEffect || "defaultNick", selectedAvatarFrame:profile.selectedAvatarFrame || "defaultFrame", selectedAura:profile.selectedAura || "noAura", selectedCandySkin:profile.selectedCandySkin || "defaultCandy", selectedBombSkin:profile.selectedBombSkin || "defaultBomb", selectedClockSkin:profile.selectedClockSkin || "defaultClock", selectedMarkerSkin:profile.selectedMarkerSkin || "defaultMarker", selectedSequenceSkin:profile.selectedSequenceSkin || "defaultSequence", selectedBoardLudoSkin:profile.selectedBoardLudoSkin || "defaultLudoBoard", selectedBoardMemorySkin:profile.selectedBoardMemorySkin || "defaultMemoryBoard", selectedIdleAnimation:profile.selectedIdleAnimation || "", selectedWinAnimation:profile.selectedWinAnimation || "", selectedLoseAnimation:profile.selectedLoseAnimation || "", potionInventory:profile.potionInventory || {}, coinBooster:profile.coinBooster || null, xpBooster:profile.xpBooster || null, privacy:profilePrivacy(profile), gameHistory:Array.isArray(profile.gameHistory) ? profile.gameHistory : [], answeredWouldYouRather:profile.answeredWouldYouRather || {}, stats:profile.stats || {}, createdAt:profile.createdAt || Date.now(), updatedAt:Date.now() });
export async function loadRemoteProfile(uid) {
  return (await loadRemoteProfileState(uid)).profile;
}
export async function loadRemoteProfileState(uid) {
  if (!canUseRemote() || !uid) return { ok:false, missing:false, profile:null };
  try {
    const snapshot = await firebaseDatabaseApi.get(firebaseDatabaseApi.ref(remoteDatabase, `profiles/${uid}`));
    return { ok:true, missing:!snapshot.exists(), profile:snapshot.val() || null };
  } catch { return { ok:false, missing:false, profile:null }; }
}
export async function syncPlayerProfile(uid, profile) {
  if (!canUseRemote() || !uid || !profile || profile.nickOnly) return false;
  try {
    const publicData = publicProfile(profile);
    delete publicData.honorCounts;
    await Promise.all([
      firebaseDatabaseApi.update(firebaseDatabaseApi.ref(remoteDatabase, `profiles/${uid}`), savedProfile(profile)),
      firebaseDatabaseApi.update(firebaseDatabaseApi.ref(remoteDatabase, `publicProfiles/${uid}`), publicData),
    ]);
    return true;
  } catch { return false; }
}
export async function setRemoteBirthDateForNick(nick, birthDate) {
  const key = normalizeNickKey(nick);
  if (!canUseRemote() || !key || !birthDate) return false;
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
export async function getWouldYouRatherAnswer(questionId, playerId = "guest", remotePlayerId = "") {
  const localAnswer = getLocalWouldYouRatherAnswers(playerId)[questionId];
  if (localAnswer === "a" || localAnswer === "b") return localAnswer;
  if (canUseRemote() && remotePlayerId) {
    try {
      const snapshot = await firebaseDatabaseApi.get(firebaseDatabaseApi.ref(remoteDatabase, `profiles/${remotePlayerId}/answeredWouldYouRather/${questionId}`));
      const remoteAnswer = snapshot.val();
      if (remoteAnswer === "a" || remoteAnswer === "b") {
        const answers = readLocal(WOULD_YOU_RATHER_ANSWERS_KEY);
        answers[playerId] = { ...(answers[playerId] || {}), [questionId]: remoteAnswer };
        saveLocal(WOULD_YOU_RATHER_ANSWERS_KEY, answers);
        return remoteAnswer;
      }
      const voteSnapshot = await firebaseDatabaseApi.get(firebaseDatabaseApi.ref(remoteDatabase, `wouldYouRatherVotes/${questionId}/voters/${remotePlayerId}`));
      const recordedAnswer = voteSnapshot.val();
      if (recordedAnswer === "a" || recordedAnswer === "b") {
        const answers = readLocal(WOULD_YOU_RATHER_ANSWERS_KEY);
        answers[playerId] = { ...(answers[playerId] || {}), [questionId]: recordedAnswer };
        saveLocal(WOULD_YOU_RATHER_ANSWERS_KEY, answers);
        return recordedAnswer;
      }
    } catch {}
  }
  return null;
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
export async function voteWouldYouRather({ questionId, choice, playerId, remotePlayerId = playerId, persistProfile }) {
  const answers=readLocal(WOULD_YOU_RATHER_ANSWERS_KEY), playerAnswers=answers[playerId] || {};
  if (playerAnswers[questionId]) return { accepted:false, choice:playerAnswers[questionId], votes:await getWouldYouRatherVotes(questionId) };
  // The database rule binds the vote to Firebase Auth's UID. Never trust the
  // caller's cached/profile id here: after a guest/account switch it can be a
  // nickname or an old UID and the otherwise valid transaction is rejected.
  const authenticatedUid = remoteAuth?.currentUser?.uid || remotePlayerId;
  if (canUseRemote() && persistProfile) {
    try {
      const profileAnswer=await firebaseDatabaseApi.get(firebaseDatabaseApi.ref(remoteDatabase,`profiles/${authenticatedUid}/answeredWouldYouRather/${questionId}`));
      if (profileAnswer.exists()) return { accepted:false, choice:profileAnswer.val(), votes:await getWouldYouRatherVotes(questionId) };
    } catch {}
  }
  if (canUseRemote()) {
    try {
      if (!authenticatedUid) return { accepted:false, error:"Nie udało się zweryfikować gracza. Odśwież stronę i spróbuj ponownie." };
      // RTDB rules intentionally reject a second write from the same voter.
      // Check the voter first so a repeated answer is reported as a duplicate
      // instead of surfacing as a misleading `permission_denied`/offline error.
      const existingVote = (await firebaseDatabaseApi.get(firebaseDatabaseApi.ref(remoteDatabase, `wouldYouRatherVotes/${questionId}/voters/${authenticatedUid}`))).val();
      if (existingVote === "a" || existingVote === "b") {
        playerAnswers[questionId] = existingVote; answers[playerId] = playerAnswers; saveLocal(WOULD_YOU_RATHER_ANSWERS_KEY, answers);
        return { accepted:false, choice:existingVote, votes:await getWouldYouRatherVotes(questionId) };
      }
      let duplicateChoice = "";
      const voteRef=firebaseDatabaseApi.ref(remoteDatabase,`wouldYouRatherVotes/${questionId}`);
      const result=await firebaseDatabaseApi.runTransaction(voteRef,current=>{
        const votes = current && typeof current === "object" ? { ...current } : {};
        const voters = votes.voters && typeof votes.voters === "object" ? { ...votes.voters } : {};
        if (voters[authenticatedUid] === "a" || voters[authenticatedUid] === "b") {
          duplicateChoice = voters[authenticatedUid];
          return current;
        }
        votes[choice] = (Number(votes[choice]) || 0) + 1;
        voters[authenticatedUid] = choice;
        votes.voters = voters;
        return votes;
      });
      if (duplicateChoice) return { accepted:false, choice:duplicateChoice, votes:await getWouldYouRatherVotes(questionId) };
      if (!result?.committed) return { accepted:false, error:"Nie udało się zapisać głosu online. Spróbuj ponownie." };
      if (persistProfile) await firebaseDatabaseApi.set(firebaseDatabaseApi.ref(remoteDatabase,`profiles/${authenticatedUid}/answeredWouldYouRather/${questionId}`),choice);
      playerAnswers[questionId]=choice; answers[playerId]=playerAnswers; saveLocal(WOULD_YOU_RATHER_ANSWERS_KEY,answers);
      return { accepted:true, votes:await getWouldYouRatherVotes(questionId) };
    } catch (error) { return { accepted:false, error:"Nie udało się zapisać głosu online. Sprawdź połączenie i spróbuj ponownie." }; }
  }
  playerAnswers[questionId]=choice; answers[playerId]=playerAnswers; saveLocal(WOULD_YOU_RATHER_ANSWERS_KEY,answers);
  const votes=readLocal(WOULD_YOU_RATHER_VOTES_KEY), item=votes[questionId] || {a:0,b:0};
  item[choice]=(item[choice]||0)+1;votes[questionId]=item;saveLocal(WOULD_YOU_RATHER_VOTES_KEY,votes);
  return { accepted:true, votes:await getWouldYouRatherVotes(questionId) };
}
export async function loadPublicProfiles() {
  if (!remoteDatabase) return {};
  try { const profiles = (await firebaseDatabaseApi.get(firebaseDatabaseApi.ref(remoteDatabase, "publicProfiles"))).val() || {}; return Object.fromEntries(Object.entries(profiles).map(([uid, profile]) => [uid, sanitizePublicProfile(profile || {})])); } catch { return {}; }
}
export async function updateRemoteProfileFields(uid, patch = {}) {
  if (!canUseRemote() || !uid || !Object.keys(patch).length) return false;
  try { await firebaseDatabaseApi.update(firebaseDatabaseApi.ref(remoteDatabase, `profiles/${uid}`), { ...patch, updatedAt:Date.now() }); return true; } catch { return false; }
}
export async function claimLuckySpinDatabase(uid, proposal) {
  if (!remoteDatabase || !remoteAuth?.currentUser || remoteAuth.currentUser.uid !== uid || !proposal?.claimId) return null;
  try {
    const spinRef = firebaseDatabaseApi.ref(remoteDatabase, `luckySpins/${uid}`);
    const result = await firebaseDatabaseApi.runTransaction(spinRef, current => {
      const now = serverNow();
      const windowActive = current && Number(current.nextSpinAt) > now;
      const currentUsed = windowActive ? (Number(current.spinsUsed) || (current.lastSpinAt ? 1 : 0)) : 0;
      const proposalLimit = Math.max(1, Math.min(2, Number(proposal.spinLimit) || 1));
      if (windowActive && currentUsed >= proposalLimit) return;
      return proposal;
    }, { applyLocally:false });
    const state = result.snapshot.val() || {};
    if (state.claimId !== proposal.claimId) return { ok:false, code:"functions/resource-exhausted", error:"Spin będzie dostępny ponownie później.", nextSpinAt:Number(state.nextSpinAt) || 0, spinsRemaining:Number(state.spinLimit) > Number(state.spinsUsed) ? Number(state.spinLimit) - Number(state.spinsUsed) : 0 };
    return { ok:true, state };
  } catch (error) {
    return { ok:false, code:error?.code || "database/error", error:error?.message || "Nie udało się zarezerwować spinu." };
  }
}
const DATABASE_POTION_EFFECTS = {
  "coins-i": { effect:"coins", multiplier:1.10, durationMs:5 * 60 * 1000 },
  "coins-ii": { effect:"coins", multiplier:1.25, durationMs:10 * 60 * 1000 },
  "coins-iii": { effect:"coins", multiplier:1.50, durationMs:20 * 60 * 1000 },
  "xp-i": { effect:"xp", multiplier:1.10, durationMs:5 * 60 * 1000 },
  "xp-ii": { effect:"xp", multiplier:1.25, durationMs:10 * 60 * 1000 },
  "xp-iii": { effect:"xp", multiplier:1.50, durationMs:20 * 60 * 1000 },
};
export async function usePotionDatabase(uid, itemId) {
  const potion = DATABASE_POTION_EFFECTS[String(itemId || "")];
  if (!canUseRemote() || !uid || remoteAuth?.currentUser?.uid !== uid || !potion) return null;
  try {
    const profileRef = firebaseDatabaseApi.ref(remoteDatabase, `profiles/${uid}`);
    const result = await firebaseDatabaseApi.runTransaction(profileRef, current => {
      const profile = current && typeof current === "object" ? { ...current } : {};
      const inventory = profile.potionInventory && typeof profile.potionInventory === "object" ? { ...profile.potionInventory } : {};
      const quantity = Number(inventory[itemId]) || 0;
      if (quantity < 1) return;
      inventory[itemId] = quantity - 1;
      profile.potionInventory = inventory;
      const key = potion.effect === "xp" ? "xpBooster" : "coinBooster";
      const currentBoost = profile[key] && typeof profile[key] === "object" ? profile[key] : {};
      profile[key] = { multiplier:Math.max(Number(currentBoost.multiplier) || 1, potion.multiplier), expiresAt:Math.max(Number(currentBoost.expiresAt) || 0, serverNow() + potion.durationMs) };
      profile.updatedAt = serverNow();
      return profile;
    }, { applyLocally:false });
    if (!result.committed) return { ok:false, code:"failed-precondition", error:"Nie masz tej potki w ekwipunku." };
    return { ok:true, databaseFallback:true, message:`Użyto potki ${itemId}. Boost jest aktywny.`, profile:result.snapshot.val() || {} };
  } catch (error) {
    return { ok:false, code:error?.code || "database/error", error:error?.message || "Nie udało się użyć potki." };
  }
}
export async function claimLuckySpin() {
  if (!remoteFunctions || !firebaseFunctionsApi?.httpsCallable) {
    return { ok:false, error:"Lucky Spin wymaga połączenia z serwerem." };
  }
  try {
    const callable = firebaseFunctionsApi.httpsCallable(remoteFunctions, "luckySpin");
    const result = await callable({});
    return { ok:true, ...(result.data || {}) };
  } catch (error) {
    const details = error?.details && typeof error.details === "object" ? error.details : {};
    return {
      ok:false,
      code:error?.code || "unknown",
      error:error?.code === "functions/internal" || error?.message === "internal"
        ? "Lucky Spin jest chwilowo niedostępny — serwer nagród wymaga wdrożenia nowej wersji."
        : error?.message || "Nie udało się uruchomić Lucky Spin.",
      nextSpinAt:Number(details.nextSpinAt) || 0,
    };
  }
}
export async function usePotion(itemId) {
  if (!remoteFunctions || !firebaseFunctionsApi?.httpsCallable) return { ok:false, error:"Używanie potek wymaga połączenia z serwerem." };
  try {
    const result = await firebaseFunctionsApi.httpsCallable(remoteFunctions, "usePotion")({ itemId });
    return { ok:true, ...(result.data || {}) };
  } catch (error) {
    return { ok:false, code:error?.code || "unknown", error:error?.message || "Nie udało się użyć potki." };
  }
}
export async function buyPotionPackDatabase(uid, packId) {
  const pack = potionPackById(packId);
  if (!canUseRemote() || !uid || remoteAuth?.currentUser?.uid !== uid || !pack) return null;
  const rewards = drawPotionPackItems(pack);
  try {
    const profileRef = firebaseDatabaseApi.ref(remoteDatabase, `profiles/${uid}`);
    const result = await firebaseDatabaseApi.runTransaction(profileRef, current => {
      const profile = current && typeof current === "object" ? { ...current } : {};
      if (profile.nickOnly || (Number(profile.money) || 0) < pack.price) return;
      const inventory = profile.potionInventory && typeof profile.potionInventory === "object" ? { ...profile.potionInventory } : {};
      rewards.forEach(itemId => { inventory[itemId] = (Number(inventory[itemId]) || 0) + 1; });
      profile.money = (Number(profile.money) || 0) - pack.price;
      profile.potionInventory = inventory;
      profile.updatedAt = serverNow();
      return profile;
    }, { applyLocally:false });
    if (!result.committed) return { ok:false, code:"failed-precondition", error:"Nie masz wystarczająco monet albo nie możesz kupić tego zestawu." };
    return { ok:true, databaseFallback:true, packId, profile:result.snapshot.val() || {} };
  } catch (error) {
    return { ok:false, code:error?.code || "database/error", error:error?.message || "Nie udało się kupić zestawu potek." };
  }
}
export async function buyPotionPack(packId) {
  if (!remoteFunctions || !firebaseFunctionsApi?.httpsCallable) return { ok:false, error:"Zakup zestawu wymaga połączenia z serwerem." };
  try {
    const result = await firebaseFunctionsApi.httpsCallable(remoteFunctions, "buyPotionPack")({ packId });
    return { ok:true, ...(result.data || {}) };
  } catch (error) {
    return { ok:false, code:error?.code || "unknown", error:error?.message || "Nie udało się kupić zestawu potek." };
  }
}
export async function submitHonor({ roomId, fromUid, targetUid, type }) {
  if (!roomId || !fromUid || !targetUid || !type || fromUid === targetUid) return { ok:false, error:"Nie można wyróżnić siebie." };
  if (remoteFunctions && firebaseFunctionsApi?.httpsCallable) {
    try {
      const result = await firebaseFunctionsApi.httpsCallable(remoteFunctions, "giveHonor")({ roomId, targetUid, type });
      return { ok:true, ...(result.data || {}) };
    } catch (error) {
      const unavailable = ["functions/internal", "functions/not-found", "functions/unavailable"].includes(error?.code);
      if (!unavailable) return { ok:false, error:error?.message || "Nie udało się zapisać wyróżnienia." };
      if (canUseRemote()) {
        const fallback = await submitHonorDatabase({ roomId, fromUid, targetUid, type });
        if (fallback.ok) return fallback;
      }
      return { ok:false, error:"Nie udało się zapisać wyróżnienia online. Spróbuj ponownie." };
    }
  }
  if (canUseRemote()) return submitHonorDatabase({ roomId, fromUid, targetUid, type });
  const votes = readLocal(LOCAL_HONOR_KEY), key = `${roomId}/${fromUid}`;
  if (votes[key]) return { ok:false, error:"Możesz wyróżnić tylko jedną osobę w tym meczu." };
  votes[key] = { targetUid, type, createdAt:Date.now() }; saveLocal(LOCAL_HONOR_KEY, votes);
  return { ok:true, local:true, targetUid, type };
}
async function submitHonorDatabase({ roomId, fromUid, targetUid, type }) {
  const authenticatedUid = remoteAuth?.currentUser?.uid;
  if (!canUseRemote() || !authenticatedUid || authenticatedUid !== fromUid) return { ok:false, error:"Nie udało się zweryfikować gracza. Odśwież stronę i spróbuj ponownie." };
  if (String(targetUid).startsWith("bot:") || !HONOR_TYPE_IDS.has(type) || targetUid === authenticatedUid) return { ok:false, error:"Nieprawidłowe wyróżnienie." };
  try {
    const voteRef = firebaseDatabaseApi.ref(remoteDatabase, `honorVotes/${roomId}/${authenticatedUid}`);
    if ((await firebaseDatabaseApi.get(voteRef)).val()) return { ok:false, error:"Możesz wyróżnić tylko jedną osobę w tym meczu." };
    const createdAt = serverNow();
    const updates = {
      [`honorVotes/${roomId}/${authenticatedUid}`]: { targetUid, type, createdAt },
      [`honorReceived/${targetUid}/${roomId}/${authenticatedUid}`]: { type, createdAt },
    };
    await firebaseDatabaseApi.update(firebaseDatabaseApi.ref(remoteDatabase), updates);
    return { ok:true, database:true, targetUid, type };
  } catch (error) {
    if (["PERMISSION_DENIED", "permission_denied"].includes(error?.code)) {
      const existing = (await firebaseDatabaseApi.get(firebaseDatabaseApi.ref(remoteDatabase, `honorVotes/${roomId}/${authenticatedUid}`))).val();
      if (existing) return { ok:false, error:"Możesz wyróżnić tylko jedną osobę w tym meczu." };
    }
    return { ok:false, error:"Nie udało się zapisać wyróżnienia online. Spróbuj ponownie." };
  }
}
export async function loadHonorCounts(uid) {
  const counts = { nicePlayer:0, goodOpponent:0, greatHost:0, notVerySmart:0, poorSport:0 };
  if (!canUseRemote() || !uid) return counts;
  try {
    const [receivedSnapshot, publicSnapshot, ownSnapshot] = await Promise.all([
      firebaseDatabaseApi.get(firebaseDatabaseApi.ref(remoteDatabase, `honorReceived/${uid}`)).catch(() => null),
      firebaseDatabaseApi.get(firebaseDatabaseApi.ref(remoteDatabase, `publicProfiles/${uid}`)).catch(() => null),
      firebaseDatabaseApi.get(firebaseDatabaseApi.ref(remoteDatabase, `profiles/${uid}`)).catch(() => null),
    ]);
    const received = receivedSnapshot?.val() || {};
    Object.values(received).forEach(roomVotes => Object.values(roomVotes || {}).forEach(vote => { if (HONOR_TYPE_IDS.has(vote?.type)) counts[vote.type] += 1; }));
    [publicSnapshot?.val()?.honorCounts, ownSnapshot?.val()?.honorCounts].forEach(source => Object.entries(source || {}).forEach(([type, value]) => {
      if (HONOR_TYPE_IDS.has(type)) counts[type] = Math.max(counts[type], Number(value) || 0);
    }));
  } catch {}
  return counts;
}
export async function loadFriendRequestBucket(uid) {
  if (!canUseRemote() || !uid) return {};
  try { return (await firebaseDatabaseApi.get(firebaseDatabaseApi.ref(remoteDatabase, `friendRequests/${uid}`))).val() || {}; } catch { return {}; }
}
export async function loadFriendRequest(targetUid, requestId) {
  if (!canUseRemote() || !targetUid || !requestId) return null;
  try { return (await firebaseDatabaseApi.get(firebaseDatabaseApi.ref(remoteDatabase, `friendRequests/${targetUid}/${requestId}`))).val() || null; } catch { return null; }
}
export async function setFriendRequest(targetUid, request) {
  if (!canUseRemote() || !targetUid || !request?.id) return false;
  try { await firebaseDatabaseApi.set(firebaseDatabaseApi.ref(remoteDatabase, `friendRequests/${targetUid}/${request.id}`), request); return true; } catch { return false; }
}
export async function updateFriendRequest(targetUid, requestId, patch = {}) {
  if (!canUseRemote() || !targetUid || !requestId) return false;
  try { await firebaseDatabaseApi.update(firebaseDatabaseApi.ref(remoteDatabase, `friendRequests/${targetUid}/${requestId}`), patch); return true; } catch { return false; }
}
export function subscribeFriendRequests(uid, onChange) {
  if (!canUseRemote() || !uid || typeof onChange !== "function") return () => {};
  const ref = firebaseDatabaseApi.ref(remoteDatabase, `friendRequests/${uid}`);
  return firebaseDatabaseApi.onValue(ref, snapshot => onChange(snapshot.val() || {}), () => onChange({}));
}

const pollVoterKey = voterId => hashRoomPassword(`poll:${voterId || "anonymous"}`);
const pollOptionIds = ["cosmetics", "new-mode", "questions"];
export async function getRemotePollVotes(pollId, voterId = "anonymous", optionIds = pollOptionIds) {
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
      if (optionIds.includes(optionId)) totals[optionId] = (totals[optionId] || 0) + 1;
    });
    optionIds.forEach(optionId => totals[optionId] = Math.max(Number(totals[optionId] || 0), Number(savedTotals[optionId] || 0)));
    return { totals, vote:voteSnapshot?.val?.() || null, source:"firebase" };
  } catch {
    return null;
  }
}
export async function voteRemotePoll({ pollId, voterId, optionId, optionIds = pollOptionIds }) {
  if (!remoteDatabase || !optionIds.includes(optionId)) return false;
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

export async function loadModeCategoryReleases() {
  if (!canUseRemote()) return null;
  try {
    return (await firebaseDatabaseApi.get(firebaseDatabaseApi.ref(remoteDatabase, "modeCategoryVoting/releases"))).val() || {};
  } catch { return null; }
}

export async function claimModeCategoryRelease(cycleId, release) {
  if (!canUseRemote() || !release?.categoryId || !release?.modeId) return false;
  try {
    const releaseRef = firebaseDatabaseApi.ref(remoteDatabase, `modeCategoryVoting/releases/${cycleId}`);
    const result = await firebaseDatabaseApi.runTransaction(releaseRef, current => current || release);
    return Boolean(result?.committed);
  } catch { return false; }
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
  if (canUseRemote()) {
    try { await firebaseDatabaseApi.set(firebaseDatabaseApi.ref(remoteDatabase, `moderation/reports/${item.id}`), item); } catch {}
  }
  return item;
}

export async function loadModerationReports() {
  const local = moderationLocal().reports || {};
  if (canUseRemote()) {
    try { return { ...local, ...((await firebaseDatabaseApi.get(firebaseDatabaseApi.ref(remoteDatabase, "moderation/reports"))).val() || {}) }; } catch {}
  }
  return local;
}

export async function saveModerationBan(ban) {
  const item = { ...ban, id:ban.id || moderationId("ban"), createdAt:ban.createdAt || Date.now() };
  const local = moderationLocal(); local.bans = { ...(local.bans || {}), [item.id]:item }; saveModerationLocal(local);
  if (canUseRemote()) {
    try { await firebaseDatabaseApi.set(firebaseDatabaseApi.ref(remoteDatabase, `moderation/bans/${item.id}`), item); } catch {}
  }
  return item;
}

export async function loadModerationBans() {
  const local = moderationLocal().bans || {};
  if (canUseRemote()) {
    try { return { ...local, ...((await firebaseDatabaseApi.get(firebaseDatabaseApi.ref(remoteDatabase, "moderation/bans"))).val() || {}) }; } catch {}
  }
  return local;
}

export async function sendInboxMessageToNick(nick, message) {
  const key = normalizeNickKey(nick), item = { ...message, id:message.id || moderationId("msg"), toNick:key, createdAt:message.createdAt || Date.now(), read:false };
  const local = moderationLocal(); local.mail = { ...(local.mail || {}) }; local.mail[key] = { ...(local.mail[key] || {}), [item.id]:item }; saveModerationLocal(local);
  if (canUseRemote()) {
    try { await firebaseDatabaseApi.set(firebaseDatabaseApi.ref(remoteDatabase, `mail/${key}/${item.id}`), item); } catch {}
  }
  return item;
}

export async function loadInboxForNick(nick) {
  const key = normalizeNickKey(nick), local = moderationLocal().mail?.[key] || {};
  if (canUseRemote()) {
    try { return { ...local, ...((await firebaseDatabaseApi.get(firebaseDatabaseApi.ref(remoteDatabase, `mail/${key}`))).val() || {}) }; } catch {}
  }
  return local;
}

const roomPlayerIds = room => Array.isArray(room?.players)
  ? room.players.filter(Boolean)
  : Object.keys(room?.players || {}).filter(Boolean);

export async function syncRoomState(room) {
  if (!room?.roomId) return { ok:false, error:"Brak kodu pokoju." };
  try {
    const players = roomPlayerIds(room);
    const payload = {
      roomId:room.roomId, gameMode:room.gameMode, name:room.name || "Pokój dla ekipy", isPrivate:Boolean(room.isPrivate), passwordHash:room.passwordHash || "", hostUid:room.hostUid || null,
      roomType:room.roomType === "betting" ? "betting" : "standard", entryFee:room.roomType === "betting" ? Math.max(0, Number(room.entryFee) || 0) : 0,
      players:Object.fromEntries(players.map(uid=>[uid,{ nick:room.playerProfiles?.[uid]?.nick || "Gracz", avatarImage:room.playerProfiles?.[uid]?.avatarImage || "", nickOnly:Boolean(room.playerProfiles?.[uid]?.nickOnly), adultStatus:room.playerProfiles?.[uid]?.adultStatus || "unknown", money:Number(room.playerProfiles?.[uid]?.money)||0, sessionMoney:Number(room.playerProfiles?.[uid]?.sessionMoney)||0, xp:Number(room.playerProfiles?.[uid]?.xp)||0, sessionXp:Number(room.playerProfiles?.[uid]?.sessionXp)||0, joinedAt:room.joinedAt?.[uid] || room.createdAt, connected:true, selectedNickEffect:room.playerProfiles?.[uid]?.selectedNickEffect || "defaultNick", selectedAvatarFrame:room.playerProfiles?.[uid]?.selectedAvatarFrame || "defaultFrame", selectedAura:room.playerProfiles?.[uid]?.selectedAura || "noAura", selectedCandySkin:room.playerProfiles?.[uid]?.selectedCandySkin || "defaultCandy", selectedBombSkin:room.playerProfiles?.[uid]?.selectedBombSkin || "defaultBomb", selectedClockSkin:room.playerProfiles?.[uid]?.selectedClockSkin || "defaultClock", selectedMarkerSkin:room.playerProfiles?.[uid]?.selectedMarkerSkin || "defaultMarker", selectedSequenceSkin:room.playerProfiles?.[uid]?.selectedSequenceSkin || "defaultSequence", selectedIdleAnimation:room.playerProfiles?.[uid]?.selectedIdleAnimation || "", selectedWinAnimation:room.playerProfiles?.[uid]?.selectedWinAnimation || "", selectedLoseAnimation:room.playerProfiles?.[uid]?.selectedLoseAnimation || "" }])),
      status:room.status, settings:room.settings || {}, hostAnnouncement:room.hostAnnouncement || null, pendingRewards:room.pendingRewards || {}, pendingXp:room.pendingXp || {}, pendingEntryFees:room.pendingEntryFees || {}, createdAt:room.createdAt, updatedAt:room.updatedAt,
      gameState:room.game || null, chat:room.game?.chat || [], presence:room.presence || {},
    };
    Object.entries(payload.players).forEach(([uid, player])=>{player.selectedBoardLudoSkin=room.playerProfiles?.[uid]?.selectedBoardLudoSkin || "defaultLudoBoard";player.selectedBoardMemorySkin=room.playerProfiles?.[uid]?.selectedBoardMemorySkin || "defaultMemoryBoard";if(uid.startsWith("bot:")){player.isBot=true;player.botDifficulty=room.playerProfiles?.[uid]?.botDifficulty||"normal";}});
    const cleanPayload = cleanFirebaseWrite(payload);
    let saved=cleanPayload;
    if(canUseRemote()){
      const roomRef=firebaseDatabaseApi.ref(remoteDatabase,`rooms/${room.roomId}`);
      try {
        const result=await firebaseDatabaseApi.runTransaction(roomRef,current=>{
          if(current&&Number(current.updatedAt||0)>=Number(cleanPayload.updatedAt||0))return current;
          return { ...cleanPayload, presence:current?.presence || cleanPayload.presence };
        });
        saved=result.snapshot.val()||cleanPayload;
      } catch(transactionError) {
        // Niektóre przeglądarki/wersje SDK potrafią przerwać transakcję przy
        // równoczesnym wejściu do lobby. Odczyt + set jest tu bezpiecznym
        // fallbackiem, bo zapis nadal przechodzi przez te same reguły RTDB.
        try {
          const current=(await firebaseDatabaseApi.get(roomRef)).val();
          if(current&&Number(current.updatedAt||0)>=Number(cleanPayload.updatedAt||0)) saved=current;
          else {
            saved={ ...cleanPayload, presence:current?.presence || cleanPayload.presence };
            await firebaseDatabaseApi.set(roomRef,saved);
          }
        } catch(fallbackError) {
          const first=transactionError?.code || transactionError?.message || String(transactionError);
          const second=fallbackError?.code || fallbackError?.message || String(fallbackError);
          throw new Error(`Firebase synchronizacja (transakcja: ${first}; zapis awaryjny: ${second})`);
        }
      }
    }
    const local=readLocal(LOCAL_ROOMS_KEY);local[room.roomId]=saved;saveLocal(LOCAL_ROOMS_KEY,local);
    return { ok:true, room:normalizeRemoteRoom(saved) };
  } catch(error) {
    return { ok:false, error:error?.message || error?.code || String(error) || "Nieznany blad synchronizacji." };
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

function cleanFirebaseWrite(value) {
  if (value === undefined) return undefined;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  // Keep array positions stable. Filtering undefined entries used to compact
  // sparse game state arrays, so a value at index 4 could come back as index 3
  // after a Firebase round-trip and make a mode read the wrong answer/cell.
  if (Array.isArray(value)) return value.map(item => item === undefined ? null : cleanFirebaseWrite(item));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cleanFirebaseWrite(item)]).filter(([, item]) => item !== undefined));
}

const normalizeRemoteRoom=room=>{
  const normalized=normalizeFirebaseValue(room || {});
  const rawPlayers=normalized.players;
  const players=Array.isArray(rawPlayers)
    ? Object.fromEntries(rawPlayers.filter(Boolean).map(uid=>[uid,normalized.playerProfiles?.[uid] || {}]))
    : rawPlayers && typeof rawPlayers === "object" ? rawPlayers : {};
  Object.entries(players).forEach(([uid, player])=>{if(uid.startsWith("bot:")){player.isBot=true;player.botDifficulty=player.botDifficulty||"normal";}});
  return { ...normalized, game:normalizeFirebaseValue(normalized.gameState || null), players:Object.keys(players), playerProfiles:players, joinedAt:Object.fromEntries(Object.entries(players).map(([uid,item])=>[uid,item?.joinedAt])), presence:normalized.presence || {} };
};

export async function loadRemoteRoom(roomId) {
  const code = String(roomId || "").trim().toUpperCase();
  if (!code) return { ok:false, error:"Brak kodu pokoju." };
  try {
    if (canUseRemote()) {
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
  if (!canUseRemote() || !roomId) return null;
  let mutationError="";
  try {
    const roomRef=firebaseDatabaseApi.ref(remoteDatabase,`rooms/${roomId}`);
    const result=await firebaseDatabaseApi.runTransaction(roomRef,current=>{
      if(!current?.gameState){mutationError="Stan gry nie jest dostępny.";return;}
      const game=normalizeFirebaseValue(JSON.parse(JSON.stringify(current.gameState)));
      const beforeGame=JSON.stringify(game);
      mutationError=mutate(game,current)||"";
      if(mutationError)return;
      // Akcje różnych trybów są mutowane w jednym wspólnym transakcyjnym
      // kanale. Odfiltruj undefined/NaN przed zapisem, bo RTDB odrzuca wtedy
      // cały zapis i gracz zostaje z lokalnym, rozjechanym ekranem.
      const cleanGame=cleanFirebaseWrite(game);
      if(JSON.stringify(cleanGame)===beforeGame){mutationError="Akcja jest już nieaktualna.";return current;}
      return {...current,gameState:cleanGame,chat:Array.isArray(cleanGame?.chat)?cleanGame.chat:[],updatedAt:Math.max(serverNow(),Number(current.updatedAt||0)+1)};
    });
    if(!result.committed||mutationError)return {ok:false,rejected:true,error:mutationError||"Akcja nie jest już dostępna."};
    const value=result.snapshot.val();
    return value?{ok:true,room:normalizeRemoteRoom(value)}:{ok:false,error:"Pokój już nie istnieje."};
  } catch(error) {
    return {ok:false,error:error?.code||error?.message||"Nie udało się zsynchronizować akcji."};
  }
}

export async function acknowledgeRemoteImpostorRole(roomId, playerId) {
  if (!canUseRemote() || !roomId || !playerId) return null;
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
  try { if(canUseRemote())await firebaseDatabaseApi.remove(firebaseDatabaseApi.ref(remoteDatabase, `rooms/${roomId}`));const local=readLocal(LOCAL_ROOMS_KEY);delete local[roomId];saveLocal(LOCAL_ROOMS_KEY,local);return true; }
  catch { return false; }
}

export function subscribeRemoteRooms(callback, onError = () => {}) {
  const normalize=rooms=>Object.values(rooms||{}).filter(room=>room?.roomId).map(normalizeRemoteRoom);
  if(remoteDatabase&&remoteAuth?.currentUser){
    const roomsRef=firebaseDatabaseApi.ref(remoteDatabase,"rooms");
    const emit=snapshot=>{const rooms=snapshot.val()||{};saveLocal(LOCAL_ROOMS_KEY,rooms);callback(normalize(rooms),"remote");};
    const stopRemote=firebaseDatabaseApi.onValue(roomsRef,emit,onError);
    // Heartbeat pokoju zmienia się tylko co kilka sekund, ale sam upływ TTL
    // nie generuje zdarzenia RTDB. Odświeżenie listy pozwala więc wygasić
    // osierocone pokoje także wtedy, gdy nikt już w nich nie siedzi.
    const cleanupTimer=setInterval(()=>firebaseDatabaseApi.get(roomsRef).then(emit).catch(()=>{}),30000);
    return()=>{clearInterval(cleanupTimer);stopRemote();};
  }
  if(remoteDatabase){callback([],"waiting");return()=>{};}
  callback(normalize(readLocal(LOCAL_ROOMS_KEY)),"local");
  const storage=event=>{if(event.key===LOCAL_ROOMS_KEY)callback(normalize(readLocal(LOCAL_ROOMS_KEY)),"local");};
  window.addEventListener("storage",storage);
  return()=>window.removeEventListener("storage",storage);
}
